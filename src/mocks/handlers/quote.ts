import { http } from "msw";
import type {
  Coupon,
  EthAmount,
  Quote,
  QuoteInput,
  WalletNetwork,
} from "@/shared/api/types";
import { getCartFor } from "../db";
import {
  applyScenario,
  errorResponse,
  json,
  nowIso,
  requireAuth,
} from "../utils";

const NETWORK_FEE: Record<WalletNetwork, EthAmount> = {
  ethereum: "0.016",
  polygon: "0.002",
  solana: "0.0005",
};

const QUOTE_TTL_MS = 5 * 60 * 1000;

function mulEth(value: string, qty: number): string {
  return (Number(value) * qty).toFixed(6);
}

function applyDiscount(value: string, percent: number): string {
  return (Number(value) * (1 - percent / 100)).toFixed(6);
}

export const quoteHandlers = [
  // POST /api/quote
  http.post("/api/quote", async ({ request }) => {
    const err = await applyScenario();
    if (err) return err;

    const auth = requireAuth();
    if (auth instanceof Response) return auth;

    const body = (await request.json().catch(() => ({}))) as QuoteInput;
    const db = auth.db;
    const cart = getCartFor(db, auth.user.id);

    if (cart.items.length === 0) {
      return errorResponse(400, "VALIDATION_ERROR", "Carrinho vazio.", {
        cart: "Adicione itens antes de cotar.",
      });
    }

    const lines: Quote["items"] = [];
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

      if (item.editionId) {
        const edition = nft.editions.find((e) => e.id === item.editionId);
        if (!edition) {
          return errorResponse(404, "NOT_FOUND", "Edição não encontrada.");
        }
        unitPrice = edition.priceEth;
        available = edition.available;
      }

      if (available < item.quantity) {
        return errorResponse(
          409,
          "CONFLICT",
          `Disponibilidade insuficiente para ${nft.name}.`,
          { [item.nftId]: `Disponível: ${available}.` },
        );
      }

      const lineTotal = Number(mulEth(unitPrice, item.quantity));
      subtotal += lineTotal;
      lines.push({
        nftId: item.nftId,
        editionId: item.editionId,
        quantity: item.quantity,
        unitPriceEth: unitPrice,
        available,
      });
    }

    let coupon: Coupon | null = null;
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
      coupon = found;
    }

    const subtotalEth = subtotal.toFixed(6);
    const discountEth = coupon
      ? (subtotal * (coupon.discountPercent / 100)).toFixed(6)
      : "0.0";
    const afterDiscount = Number(
      applyDiscount(subtotalEth, coupon?.discountPercent ?? 0),
    );

    const primaryWallet = db.wallets.find(
      (w) => w.ownerId === auth.user.id && w.isPrimary,
    );
    const network: WalletNetwork = primaryWallet?.network ?? "ethereum";
    const networkFeeEth = NETWORK_FEE[network];

    const totalEth = (afterDiscount + Number(networkFeeEth)).toFixed(6);

    const issuedAt = nowIso();
    const expiresAt = new Date(Date.now() + QUOTE_TTL_MS).toISOString();

    const quote: Quote = {
      subtotalEth: subtotalEth as EthAmount,
      discountEth: discountEth as EthAmount,
      networkFeeEth,
      totalEth: totalEth as EthAmount,
      coupon,
      issuedAt,
      expiresAt,
      items: lines,
    };

    return json(quote);
  }),
];
