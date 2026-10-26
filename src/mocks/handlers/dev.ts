import { http } from "msw";
import { emitToAll } from "../socket";
import { env } from "@/shared/lib/env";
import { applyScenario, errorResponse, json } from "../utils";

/**
 * Endpoint de desenvolvimento para disparar eventos Socket.IO de forma
 * determinística (usado nos E2E da Fase 3 e no smoke manual).
 *
 * Só existe quando `VITE_ENABLE_MOCKS` está ligado.
 */
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

    emitToAll(body.event, body.payload ?? null);
    return json({ ok: true, event: body.event });
  }),
];
