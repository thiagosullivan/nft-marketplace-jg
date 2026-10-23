import { http } from "msw";
import type {
  CreateWalletInput,
  UpdateWalletInput,
  Wallet,
} from "@/shared/api/types";
import { saveDb, type DbWallet } from "../db";
import {
  applyScenario,
  errorResponse,
  json,
  nowIso,
  requireAuth,
} from "../utils";

function enforceSinglePrimary(
  wallets: DbWallet[],
  ownerId: string,
  walletId: string,
): void {
  for (const w of wallets) {
    if (w.id !== walletId && w.ownerId === ownerId) {
      w.isPrimary = false;
    }
  }
}

function toPublic(w: DbWallet): Wallet {
  const { ownerId: _ownerId, ...rest } = w;
  void _ownerId;
  return rest;
}

export const walletHandlers = [
  // GET /api/wallets
  http.get("/api/wallets", async () => {
    const err = await applyScenario();
    if (err) return err;

    const auth = requireAuth();
    if (auth instanceof Response) return auth;

    const mine = auth.db.wallets.filter((w) => w.ownerId === auth.user.id);
    return json(mine.map(toPublic));
  }),

  // POST /api/wallets
  http.post("/api/wallets", async ({ request }) => {
    const err = await applyScenario();
    if (err) return err;

    const auth = requireAuth();
    if (auth instanceof Response) return auth;

    const body = (await request.json()) as Partial<CreateWalletInput>;
    const fields: Record<string, string> = {};
    if (!body.label || body.label.trim().length === 0) {
      fields.label = "Informe um apelido.";
    }
    if (!body.address || body.address.trim().length < 10) {
      fields.address = "Endereço inválido.";
    }
    if (!body.network) {
      fields.network = "Selecione uma rede.";
    }
    if (!body.walletType) {
      fields.walletType = "Selecione um tipo.";
    }
    if (Object.keys(fields).length > 0) {
      return errorResponse(400, "VALIDATION_ERROR", "Dados inválidos.", fields);
    }

    const db = auth.db;
    const mine = db.wallets.filter((w) => w.ownerId === auth.user.id);
    const wallet: DbWallet = {
      id: `wallet-${Date.now()}`,
      label: body.label!.trim(),
      address: body.address!.trim(),
      network: body.network!,
      ensName: body.ensName ?? null,
      walletType: body.walletType!,
      referralCode: body.referralCode ?? null,
      isPrimary: body.isPrimary ?? mine.length === 0,
      createdAt: nowIso(),
      ownerId: auth.user.id,
    };
    db.wallets.push(wallet);
    if (wallet.isPrimary) {
      enforceSinglePrimary(db.wallets, auth.user.id, wallet.id);
    }
    saveDb(db);
    return json(toPublic(wallet), 201);
  }),

  // PATCH /api/wallets/:id
  http.patch("/api/wallets/:id", async ({ params, request }) => {
    const err = await applyScenario();
    if (err) return err;

    const auth = requireAuth();
    if (auth instanceof Response) return auth;

    const db = auth.db;
    const id = String(params.id);
    const idx = db.wallets.findIndex(
      (w) => w.id === id && w.ownerId === auth.user.id,
    );
    if (idx === -1) {
      return errorResponse(404, "NOT_FOUND", "Carteira não encontrada.");
    }

    const body = (await request.json()) as UpdateWalletInput;
    const fields: Record<string, string> = {};
    if (body.label !== undefined && body.label.trim().length === 0) {
      fields.label = "Informe um apelido.";
    }
    if (body.address !== undefined && body.address.trim().length < 10) {
      fields.address = "Endereço inválido.";
    }
    if (Object.keys(fields).length > 0) {
      return errorResponse(400, "VALIDATION_ERROR", "Dados inválidos.", fields);
    }

    const updated: DbWallet = {
      ...db.wallets[idx],
      ...body,
      label:
        body.label !== undefined ? body.label.trim() : db.wallets[idx].label,
      address:
        body.address !== undefined
          ? body.address.trim()
          : db.wallets[idx].address,
    };
    db.wallets[idx] = updated;
    if (updated.isPrimary) {
      enforceSinglePrimary(db.wallets, auth.user.id, updated.id);
    }
    saveDb(db);
    return json(toPublic(updated));
  }),
];
