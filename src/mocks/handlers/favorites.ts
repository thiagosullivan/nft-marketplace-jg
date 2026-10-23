import { http } from "msw";
import type { Favorite, FavoriteListResponse } from "@/shared/api/types";
import { getFavoritesFor, saveDb, setFavoritesFor } from "../db";
import {
  applyScenario,
  errorResponse,
  json,
  nowIso,
  requireAuth,
} from "../utils";

export const favoriteHandlers = [
  // GET /api/favorites
  http.get("/api/favorites", async ({ request }) => {
    const err = await applyScenario();
    if (err) return err;

    const auth = requireAuth(request);
    if (auth instanceof Response) return auth;

    const favorites = getFavoritesFor(auth.db, auth.user.id);
    const ids = new Set(favorites.map((f) => f.nftId));
    const items = auth.db.nfts.filter((n) => ids.has(n.id));
    const response: FavoriteListResponse = { items };
    return json(response);
  }),

  // POST /api/favorites
  http.post("/api/favorites", async ({ request }) => {
    const err = await applyScenario();
    if (err) return err;

    const auth = requireAuth(request);
    if (auth instanceof Response) return auth;

    const body = (await request.json()) as { nftId?: string };
    if (!body.nftId) {
      return errorResponse(400, "VALIDATION_ERROR", "nftId é obrigatório.", {
        nftId: "Informe o NFT.",
      });
    }
    const nft = auth.db.nfts.find((n) => n.id === body.nftId);
    if (!nft) {
      return errorResponse(404, "NOT_FOUND", "NFT não encontrado.");
    }

    const favorites = getFavoritesFor(auth.db, auth.user.id);
    if (!favorites.some((f) => f.nftId === body.nftId)) {
      const fav: Favorite = { nftId: body.nftId, createdAt: nowIso() };
      setFavoritesFor(auth.db, auth.user.id, [...favorites, fav]);
      saveDb(auth.db);
    }
    return json({ ok: true });
  }),

  // DELETE /api/favorites/:nftId
  http.delete("/api/favorites/:nftId", async ({ params, request }) => {
    const err = await applyScenario();
    if (err) return err;

    const auth = requireAuth(request);
    if (auth instanceof Response) return auth;

    const nftId = String(params.nftId);
    const favorites = getFavoritesFor(auth.db, auth.user.id);
    const next = favorites.filter((f) => f.nftId !== nftId);
    if (next.length !== favorites.length) {
      setFavoritesFor(auth.db, auth.user.id, next);
      saveDb(auth.db);
    }
    return json({ ok: true });
  }),
];
