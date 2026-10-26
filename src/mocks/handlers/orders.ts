import { http } from "msw";
import type {
  CreateOrderInput,
  EthAmount,
  Order,
  OrderItem,
  WalletNetwork,
} from "@/shared/api/types";
import { getCartFor, saveDb, setCartFor } from "../db";
import { emitToAll } from "../socket";
import {
  applyScenario,
  errorResponse,
  json,
  nowIso,
  requireAuth,
} from "../utils";

const SETTLE_DELAY_MS = 3_000;
const DECLINE_THRESHOLD_ETH = 20;
const QUOTE_TTL_MS = 5 * 60 * 1000;

function fakeTxHash(orderId: string): string {
  const seed = orderId.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return (
    "0x" +
    ((seed * 0x9e3779b1) >>> 0)
      .toString(16)
      .padStart(8, "0")
      .repeat(8)
      .slice(0, 64)
  );
}

function settleIfDue(order: Order): { order: Order; changed: boolean } {
  if (order.status !== "pending" || !order.settleAt || !order.settleStatus) {
    return { order, changed: false };
  }
  if (new Date(order.settleAt).getTime() > Date.now()) {
    return { order, changed: false };
  }
  const updated: Order = {
    ...order,
    status: order.settleStatus,
    updatedAt: nowIso(),
    confirmedAt: order.settleStatus === "confirmed" ? nowIso() : null,
    transactionRef:
      order.settleStatus === "confirmed" ? fakeTxHash(order.id) : null,
    explorerUrl:
      order.settleStatus === "confirmed"
        ? `https://etherscan.io/tx/${fakeTxHash(order.id)}`
        : null,
    settleAt: null,
    settleStatus: null,
    version: order.version + 1,
  };
  return { order: updated, changed: true };
}

function emitOrderUpdated(order: Order): void {
  emitToAll("order.updated", {
    id: order.id,
    version: order.version,
    payload: {
      orderId: order.id,
      status: order.status,
      confirmedAt: order.confirmedAt,
      transactionRef: order.transactionRef,
      explorerUrl: order.explorerUrl,
    },
  });
}

function normalizeNote(note: unknown): string | null {
  if (typeof note !== "string") return null;
  const trimmed = note.trim();
  if (trimmed.length === 0) return null;
  return trimmed.slice(0, 500);
}

export const orderHandlers = [
  // GET /api/orders — lista
  http.get("/api/orders", async ({ request }) => {
    const err = await applyScenario();
    if (err) return err;

    const auth = requireAuth(request);
    if (auth instanceof Response) return auth;

    const db = auth.db;

    const mine: Order[] = [];
    for (const order of db.orders) {
      const wallet = db.wallets.find((w) => w.id === order.walletId);
      if (wallet && wallet.ownerId === auth.user.id) {
        const { order: settled, changed } = settleIfDue(order);
        if (changed) emitOrderUpdated(settled);
        mine.push(settled);
      }
    }

    let dirty = false;
    for (const o of mine) {
      const idx = db.orders.findIndex((x) => x.id === o.id);
      if (idx !== -1 && db.orders[idx] !== o) {
        db.orders[idx] = o;
        dirty = true;
      }
    }
    if (dirty) saveDb(db);

    mine.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    return json({ items: mine });
  }),

  // POST /api/orders — cria pedido idempotente + remoção seletiva
  http.post("/api/orders", async ({ request }) => {
    const err = await applyScenario();
    if (err) return err;

    const auth = requireAuth(request);
    if (auth instanceof Response) return auth;

    const body = (await request.json()) as Partial<CreateOrderInput>;
    if (
      !body.quoteIssuedAt ||
      !body.walletId ||
      !body.network ||
      !body.idempotencyKey
    ) {
      return errorResponse(400, "VALIDATION_ERROR", "Dados inválidos.", {
        idempotencyKey: "idempotencyKey é obrigatório.",
      });
    }

    const db = auth.db;

    const existingOrderId = db.idempotency[body.idempotencyKey!];
    if (existingOrderId) {
      const existing = db.orders.find((o) => o.id === existingOrderId);
      if (existing) {
        const sameContent =
          existing.walletId === body.walletId &&
          existing.network === body.network &&
          (existing.couponCode ?? null) === (body.couponCode ?? null);
        if (!sameContent) {
          return errorResponse(
            409,
            "IDEMPOTENCY_CONFLICT",
            "Chave de idempotência reutilizada com conteúdo diferente.",
          );
        }
        const { order: settled, changed } = settleIfDue(existing);
        if (changed) {
          const idx = db.orders.findIndex((o) => o.id === existing.id);
          db.orders[idx] = settled;
          saveDb(db);
          emitOrderUpdated(settled);
        }
        return json(settled);
      }
    }

    const issuedAt = new Date(body.quoteIssuedAt).getTime();
    if (!Number.isFinite(issuedAt) || Date.now() - issuedAt > QUOTE_TTL_MS) {
      return errorResponse(
        409,
        "CONFLICT",
        "Cotação expirada. Revalide o carrinho.",
        { quoteIssuedAt: "Cotação expirada." },
      );
    }

    const cart = getCartFor(db, auth.user.id);
    if (cart.items.length === 0) {
      return errorResponse(400, "VALIDATION_ERROR", "Carrinho vazio.");
    }

    const wallet = db.wallets.find(
      (w) => w.id === body.walletId && w.ownerId === auth.user.id,
    );
    if (!wallet) {
      return errorResponse(404, "NOT_FOUND", "Carteira não encontrada.");
    }

    const network = body.network as WalletNetwork;
    if (wallet.network !== network) {
      return errorResponse(
        400,
        "VALIDATION_ERROR",
        "Rede da carteira não corresponde à rede do pedido.",
        { network: "Selecione a rede correta da carteira." },
      );
    }

    const items: OrderItem[] = [];
    let subtotal = 0;
    for (const item of cart.items) {
      const nft = db.nfts.find((n) => n.id === item.nftId);
      if (!nft) {
        return errorResponse(
          404,
          "NOT_FOUND",
          `NFT ${item.nftId} não encontrado.`,
        );
      }
      let unitPrice = nft.priceEth;
      let available = nft.available;
      let editionLabel: string | null = null;
      let tokenId = nft.tokenId;

      if (item.editionId) {
        const edition = nft.editions.find((e) => e.id === item.editionId);
        if (!edition) {
          return errorResponse(404, "NOT_FOUND", "Edição não encontrada.");
        }
        unitPrice = edition.priceEth;
        available = edition.available;
        editionLabel = edition.label;
        tokenId = edition.tokenId;
      }

      if (available < item.quantity) {
        return errorResponse(
          409,
          "CONFLICT",
          `Disponibilidade insuficiente para ${nft.name}.`,
          { [item.nftId]: `Disponível: ${available}.` },
        );
      }

      items.push({
        nftId: item.nftId,
        editionId: item.editionId,
        editionLabel,
        tokenId,
        name: nft.name,
        imageUrl: nft.imageUrl,
        quantity: item.quantity,
        unitPriceEth: unitPrice,
      });
      subtotal += Number(unitPrice) * item.quantity;
    }

    let couponCode: string | null = null;
    let discountPercent = 0;
    if (body.couponCode) {
      const code = body.couponCode.trim().toUpperCase();
      const found = db.coupons.find((c) => c.code.toUpperCase() === code);
      if (!found) {
        return errorResponse(400, "VALIDATION_ERROR", "Cupom inválido.", {
          couponCode: "Cupom inválido.",
        });
      }
      if (found.expiresAt && new Date(found.expiresAt).getTime() < Date.now()) {
        return errorResponse(400, "VALIDATION_ERROR", "Cupom expirado.", {
          couponCode: "Cupom expirado.",
        });
      }
      couponCode = found.code;
      discountPercent = found.discountPercent;
    }

    const NETWORK_FEE: Record<WalletNetwork, string> = {
      ethereum: "0.016",
      polygon: "0.002",
      solana: "0.0005",
    };
    const networkFeeEth = NETWORK_FEE[network];
    const subtotalEth = subtotal.toFixed(6);
    const discountEth = (subtotal * (discountPercent / 100)).toFixed(6);
    const totalEth = (
      subtotal -
      Number(discountEth) +
      Number(networkFeeEth)
    ).toFixed(6);

    const willDecline = Number(totalEth) > DECLINE_THRESHOLD_ETH;
    const settleStatus: "confirmed" | "declined" = willDecline
      ? "declined"
      : "confirmed";
    const settleAt = new Date(Date.now() + SETTLE_DELAY_MS).toISOString();

    const order: Order = {
      id: `order-${Date.now()}`,
      status: "pending",
      createdAt: nowIso(),
      updatedAt: nowIso(),
      confirmedAt: null,
      items,
      subtotalEth: subtotalEth as EthAmount,
      discountEth: discountEth as EthAmount,
      networkFeeEth: networkFeeEth as EthAmount,
      totalEth: totalEth as EthAmount,
      couponCode,
      walletId: wallet.id,
      walletLabel: wallet.label,
      walletAddress: wallet.address,
      network,
      transactionRef: null,
      explorerUrl: null,
      version: 1,
      settleAt,
      settleStatus,
      note: normalizeNote(body.note),
    };

    db.orders.push(order);
    db.idempotency[body.idempotencyKey!] = order.id;

    const purchased = new Set(
      items.map((i) => `${i.nftId}:${i.editionId ?? "none"}`),
    );
    const remaining = cart.items.filter(
      (i) => !purchased.has(`${i.nftId}:${i.editionId ?? "none"}`),
    );
    setCartFor(db, auth.user.id, {
      items: remaining,
      updatedAt: nowIso(),
    });

    saveDb(db);

    return json(order, 201);
  }),

  // GET /api/orders/:id
  http.get("/api/orders/:id", async ({ params, request }) => {
    const err = await applyScenario();
    if (err) return err;

    const auth = requireAuth(request);
    if (auth instanceof Response) return auth;

    const db = auth.db;
    const id = String(params.id);
    const order = db.orders.find((o) => o.id === id);
    if (!order) {
      return errorResponse(404, "NOT_FOUND", "Pedido não encontrado.");
    }

    const wallet = db.wallets.find((w) => w.id === order.walletId);
    if (!wallet || wallet.ownerId !== auth.user.id) {
      return errorResponse(403, "FORBIDDEN", "Acesso negado a este pedido.");
    }

    const { order: settled, changed } = settleIfDue(order);
    if (changed) {
      const idx = db.orders.findIndex((o) => o.id === id);
      db.orders[idx] = settled;
      saveDb(db);
      emitOrderUpdated(settled);
    }
    return json(settled);
  }),
];
