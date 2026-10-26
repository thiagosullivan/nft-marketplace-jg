import { http } from "msw";
import { emitToAll } from "../socket";
import { env } from "@/shared/lib/env";
import { applyScenario, errorResponse, json } from "../utils";
import { loadDb, saveDb } from "../db";
import type { Order } from "@/shared/api/types";

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

    // nft.updated: altera o db e emite com version incrementada.
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

      if (payload.priceEth !== undefined) nft.priceEth = payload.priceEth;
      if (payload.available !== undefined) nft.available = payload.available;
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

    // order.updated: força o settle do pedido e emite.
    if (body.event === "order.updated") {
      const payload = body.payload as {
        orderId?: string;
        settleStatus?: "confirmed" | "declined";
      } | null;

      if (!payload?.orderId) {
        return errorResponse(
          400,
          "VALIDATION_ERROR",
          "orderId é obrigatório.",
          { orderId: "Informe o pedido." },
        );
      }

      const db = loadDb();
      const idx = db.orders.findIndex((o) => o.id === payload.orderId);
      if (idx === -1) {
        return errorResponse(404, "NOT_FOUND", "Pedido não encontrado.");
      }

      const order = db.orders[idx];
      const status = payload.settleStatus ?? order.settleStatus ?? "confirmed";
      const settled: Order = {
        ...order,
        status,
        updatedAt: new Date().toISOString(),
        confirmedAt: status === "confirmed" ? new Date().toISOString() : null,
        transactionRef: status === "confirmed" ? fakeTxHash(order.id) : null,
        explorerUrl:
          status === "confirmed"
            ? `https://etherscan.io/tx/${fakeTxHash(order.id)}`
            : null,
        settleAt: null,
        settleStatus: null,
        version: order.version + 1,
      };
      db.orders[idx] = settled;
      saveDb(db);

      emitToAll("order.updated", {
        id: settled.id,
        version: settled.version,
        payload: {
          orderId: settled.id,
          status: settled.status,
          confirmedAt: settled.confirmedAt,
          transactionRef: settled.transactionRef,
          explorerUrl: settled.explorerUrl,
        },
      });

      return json({ ok: true, event: body.event, status: settled.status });
    }

    emitToAll(body.event, body.payload ?? null);
    return json({ ok: true, event: body.event });
  }),
];
