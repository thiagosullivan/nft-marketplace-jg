import { http } from "msw";
import type {
  AddToCartInput,
  Cart,
  CartItem,
  UpdateCartItemInput,
} from "@/shared/api/types";
import { findNft, getCartFor, loadDb, saveDb, setCartFor } from "../db";
import {
  applyScenario,
  errorResponse,
  json,
  nowIso,
  requireAuth,
} from "../utils";

function resolveLine(
  db: ReturnType<typeof loadDb>,
  nftId: string,
  editionId: string | null,
):
  | {
      nft: NonNullable<ReturnType<typeof findNft>>;
      unitPriceEth: string;
      maxAvailable: number;
      editionLabel: string | null;
      tokenId: string;
    }
  | Response {
  const nft = findNft(db, nftId);
  if (!nft) {
    return errorResponse(404, "NOT_FOUND", "NFT não encontrado.");
  }

  if (editionId) {
    const edition = nft.editions.find((e) => e.id === editionId);
    if (!edition) {
      return errorResponse(404, "NOT_FOUND", "Edição não encontrada.");
    }
    if (edition.available <= 0) {
      return errorResponse(409, "CONFLICT", "Edição esgotada.", {
        editionId: "Esta edição está esgotada.",
      });
    }
    return {
      nft,
      unitPriceEth: edition.priceEth,
      maxAvailable: edition.available,
      editionLabel: edition.label,
      tokenId: edition.tokenId,
    };
  }

  if (nft.available <= 0) {
    return errorResponse(409, "CONFLICT", "NFT esgotado.", {
      nftId: "Este NFT está esgotado.",
    });
  }
  return {
    nft,
    unitPriceEth: nft.priceEth,
    maxAvailable: nft.available,
    editionLabel: null,
    tokenId: nft.tokenId,
  };
}

function buildCartItem(
  line: Exclude<ReturnType<typeof resolveLine>, Response>,
  editionId: string | null,
  quantity: number,
): CartItem {
  return {
    nftId: line.nft.id,
    editionId,
    quantity,
    unitPriceEth: line.unitPriceEth,
    name: line.nft.name,
    imageUrl: line.nft.imageUrl,
    network: line.nft.network,
    tokenId: line.tokenId,
    editionLabel: line.editionLabel,
    maxAvailable: line.maxAvailable,
  };
}

export const cartHandlers = [
  // GET /api/cart
  http.get("/api/cart", async () => {
    const err = await applyScenario();
    if (err) return err;

    const auth = requireAuth();
    if (auth instanceof Response) return auth;

    return json(getCartFor(auth.db, auth.user.id));
  }),

  // POST /api/cart/items
  http.post("/api/cart/items", async ({ request }) => {
    const err = await applyScenario();
    if (err) return err;

    const auth = requireAuth();
    if (auth instanceof Response) return auth;

    const body = (await request.json()) as Partial<AddToCartInput>;
    if (!body.nftId || !body.quantity || body.quantity < 1) {
      return errorResponse(400, "VALIDATION_ERROR", "Dados inválidos.", {
        quantity: "Quantidade deve ser ao menos 1.",
      });
    }

    const line = resolveLine(auth.db, body.nftId, body.editionId ?? null);
    if (line instanceof Response) return line;

    const cart = getCartFor(auth.db, auth.user.id);
    const existing = cart.items.find(
      (i) => i.nftId === body.nftId && i.editionId === (body.editionId ?? null),
    );
    const desiredQty = (existing?.quantity ?? 0) + body.quantity;
    if (desiredQty > line.maxAvailable) {
      return errorResponse(
        409,
        "CONFLICT",
        "Quantidade acima da disponibilidade.",
        { quantity: `Disponível: ${line.maxAvailable}.` },
      );
    }

    let items: CartItem[];
    if (existing) {
      items = cart.items.map((i) =>
        i === existing ? { ...i, quantity: desiredQty } : i,
      );
    } else {
      items = [
        ...cart.items,
        buildCartItem(line, body.editionId ?? null, body.quantity),
      ];
    }

    const next: Cart = { items, updatedAt: nowIso() };
    setCartFor(auth.db, auth.user.id, next);
    saveDb(auth.db);
    return json(next);
  }),

  // PATCH /api/cart/items
  http.patch("/api/cart/items", async ({ request }) => {
    const err = await applyScenario();
    if (err) return err;

    const auth = requireAuth();
    if (auth instanceof Response) return auth;

    const body = (await request.json()) as Partial<UpdateCartItemInput>;
    if (!body.nftId || body.quantity === undefined) {
      return errorResponse(400, "VALIDATION_ERROR", "Dados inválidos.");
    }
    if (body.quantity < 0) {
      return errorResponse(400, "VALIDATION_ERROR", "Quantidade inválida.", {
        quantity: "Quantidade não pode ser negativa.",
      });
    }

    const cart = getCartFor(auth.db, auth.user.id);
    const editionId = body.editionId ?? null;

    if (body.quantity === 0) {
      const items = cart.items.filter(
        (i) => !(i.nftId === body.nftId && i.editionId === editionId),
      );
      const next: Cart = { items, updatedAt: nowIso() };
      setCartFor(auth.db, auth.user.id, next);
      saveDb(auth.db);
      return json(next);
    }

    const line = resolveLine(auth.db, body.nftId, editionId);
    if (line instanceof Response) return line;

    if (body.quantity > line.maxAvailable) {
      return errorResponse(
        409,
        "CONFLICT",
        "Quantidade acima da disponibilidade.",
        { quantity: `Disponível: ${line.maxAvailable}.` },
      );
    }

    const items = cart.items.map((i) =>
      i.nftId === body.nftId && i.editionId === editionId
        ? { ...i, quantity: body.quantity! }
        : i,
    );
    const next: Cart = { items, updatedAt: nowIso() };
    setCartFor(auth.db, auth.user.id, next);
    saveDb(auth.db);
    return json(next);
  }),

  // DELETE /api/cart/items
  http.delete("/api/cart/items", async ({ request }) => {
    const err = await applyScenario();
    if (err) return err;

    const auth = requireAuth();
    if (auth instanceof Response) return auth;

    const url = new URL(request.url);
    const nftId = url.searchParams.get("nftId");
    const editionId = url.searchParams.get("editionId");
    if (!nftId) {
      return errorResponse(400, "VALIDATION_ERROR", "nftId é obrigatório.");
    }

    const cart = getCartFor(auth.db, auth.user.id);
    const items = cart.items.filter(
      (i) =>
        !(
          i.nftId === nftId &&
          (editionId === null
            ? i.editionId === null
            : i.editionId === editionId)
        ),
    );
    const next: Cart = { items, updatedAt: nowIso() };
    setCartFor(auth.db, auth.user.id, next);
    saveDb(auth.db);
    return json(next);
  }),

  // POST /api/cart/merge
  http.post("/api/cart/merge", async ({ request }) => {
    const err = await applyScenario();
    if (err) return err;

    const auth = requireAuth();
    if (auth instanceof Response) return auth;

    const body = (await request.json()) as { items?: AddToCartInput[] };
    const visitorItems = body.items ?? [];
    const cart = getCartFor(auth.db, auth.user.id);
    let items = cart.items.slice();

    for (const vi of visitorItems) {
      if (!vi.nftId || !vi.quantity || vi.quantity < 1) continue;
      const line = resolveLine(auth.db, vi.nftId, vi.editionId ?? null);
      if (line instanceof Response) continue;

      const editionId = vi.editionId ?? null;
      const existing = items.find(
        (i) => i.nftId === vi.nftId && i.editionId === editionId,
      );
      const desired = (existing?.quantity ?? 0) + vi.quantity;
      const capped = Math.min(desired, line.maxAvailable);
      if (capped <= 0) continue;

      if (existing) {
        items = items.map((i) =>
          i === existing ? { ...i, quantity: capped } : i,
        );
      } else {
        items = [...items, buildCartItem(line, editionId, capped)];
      }
    }

    const next: Cart = { items, updatedAt: nowIso() };
    setCartFor(auth.db, auth.user.id, next);
    saveDb(auth.db);
    return json(next);
  }),
];
