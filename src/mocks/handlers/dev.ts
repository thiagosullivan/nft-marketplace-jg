import { http } from "msw";
import { emitToAll } from "../socket";
import { env } from "@/shared/lib/env";
import { applyScenario, errorResponse, json } from "../utils";
import { loadDb, saveDb } from "../db";

export const devHandlers = [
  http.post("/api/dev/emit", async ({ request }) => {
    if (!env.VITE_ENABLE_MOCKS) {
      return errorResponse(404, "NOT_FOUND", "Endpoint indisponível.");
    }

    const err = await applyScenario();
    if (err) return err;

    const body = (await request.json()) as {
      event?: string;
      payload?: unknown;
    };

    if (!body.event) {
      return errorResponse(400, "VALIDATION_ERROR", "event é obrigatório.", {
        event: "Informe o nome do evento.",
      });
    }

    // Caso especial: nft.updated altera o db e emite com version incrementada.
    if (body.event === "nft.updated") {
      const payload = body.payload as {
        nftId?: string;
        priceEth?: string;
        available?: number;
      } | null;

      if (!payload?.nftId) {
        return errorResponse(400, "VALIDATION_ERROR", "nftId é obrigatório.", {
          nftId: "Informe o NFT.",
        });
      }

      const db = loadDb();
      const nft = db.nfts.find((n) => n.id === payload.nftId);
      if (!nft) {
        return errorResponse(404, "NOT_FOUND", "NFT não encontrado.");
      }

      if (payload.priceEth !== undefined) {
        nft.priceEth = payload.priceEth;
      }
      if (payload.available !== undefined) {
        nft.available = payload.available;
      }
      nft.version = nft.version + 1;
      nft.updatedAt = new Date().toISOString();
      saveDb(db);

      emitToAll("nft.updated", {
        id: nft.id,
        version: nft.version,
        payload: {
          priceEth: nft.priceEth,
          available: nft.available,
          editions: nft.editions,
        },
      });

      return json({ ok: true, event: body.event, version: nft.version });
    }

    emitToAll(body.event, body.payload ?? null);
    return json({ ok: true, event: body.event });
  }),
];
