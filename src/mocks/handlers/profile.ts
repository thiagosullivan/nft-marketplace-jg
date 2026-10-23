import { http } from "msw";
import type {
  ChangePasswordInput,
  UpdateProfileInput,
} from "@/shared/api/types";
import { findUserByEmail, saveDb } from "../db";
import { hashPassword, seedCredentials } from "../fixtures";
import {
  applyScenario,
  errorResponse,
  isEmail,
  json,
  requireAuth,
} from "../utils";

export const profileHandlers = [
  // GET /api/profile
  http.get("/api/profile", async ({ request }) => {
    const err = await applyScenario();
    if (err) return err;

    const auth = requireAuth(request);

    if (auth instanceof Response) return auth;
    return json(auth.user);
  }),

  // PATCH /api/profile
  http.patch("/api/profile", async ({ request }) => {
    const err = await applyScenario();
    if (err) return err;

    const auth = requireAuth(request);
    if (auth instanceof Response) return auth;

    const body = (await request.json()) as UpdateProfileInput;
    const db = auth.db;
    const fields: Record<string, string> = {};

    if (
      body.displayName !== undefined &&
      body.displayName.trim().length === 0
    ) {
      fields.displayName = "Nome de exibição não pode ficar vazio.";
    }
    if (body.username !== undefined) {
      if (body.username.trim().length < 3) {
        fields.username = "Nome de usuário deve ter ao menos 3 caracteres.";
      } else if (
        db.users.some(
          (u) =>
            u.id !== auth.user.id &&
            u.username.toLowerCase() === body.username!.trim().toLowerCase(),
        )
      ) {
        fields.username = "Este nome de usuário já está em uso.";
      }
    }
    if (body.email !== undefined) {
      if (!isEmail(body.email)) {
        fields.email = "E-mail inválido.";
      } else {
        const existing = findUserByEmail(db, body.email);
        if (existing && existing.id !== auth.user.id) {
          fields.email = "Este e-mail já está cadastrado.";
        }
      }
    }

    if (Object.keys(fields).length > 0) {
      return errorResponse(400, "VALIDATION_ERROR", "Dados inválidos.", fields);
    }

    const userIndex = db.users.findIndex((u) => u.id === auth.user.id);
    const oldEmail = db.users[userIndex].email;

    if (body.displayName !== undefined) {
      db.users[userIndex].displayName = body.displayName.trim();
    }
    if (body.username !== undefined) {
      db.users[userIndex].username = body.username.trim();
    }
    if (body.email !== undefined) {
      const newEmail = body.email.toLowerCase();
      db.users[userIndex].email = newEmail;
      if (oldEmail !== newEmail && db.credentials[oldEmail]) {
        db.credentials[newEmail] = db.credentials[oldEmail];
        delete db.credentials[oldEmail];
      }
    }
    if (body.ensName !== undefined) {
      db.users[userIndex].ensName = body.ensName;
    }
    if (body.avatarUrl !== undefined) {
      db.users[userIndex].avatarUrl = body.avatarUrl;
    }

    saveDb(db);
    return json(db.users[userIndex]);
  }),

  // POST /api/profile/avatar
  http.post("/api/profile/avatar", async ({ request }) => {
    const err = await applyScenario();
    if (err) return err;

    const auth = requireAuth(request);
    if (auth instanceof Response) return auth;

    const body = (await request.json()) as { avatarUrl?: string | null };
    const db = auth.db;
    const userIndex = db.users.findIndex((u) => u.id === auth.user.id);
    db.users[userIndex].avatarUrl = body.avatarUrl ?? null;
    saveDb(db);
    return json(db.users[userIndex]);
  }),

  // POST /api/profile/password
  http.post("/api/profile/password", async ({ request }) => {
    const err = await applyScenario();
    if (err) return err;

    const auth = requireAuth(request);
    if (auth instanceof Response) return auth;

    const body = (await request.json()) as Partial<ChangePasswordInput>;
    const fields: Record<string, string> = {};

    if (!body.currentPassword) {
      fields.currentPassword = "Informe a senha atual.";
    }
    if (!body.newPassword || body.newPassword.length < 8) {
      fields.newPassword = "Nova senha deve ter ao menos 8 caracteres.";
    }
    if (Object.keys(fields).length > 0) {
      return errorResponse(400, "VALIDATION_ERROR", "Dados inválidos.", fields);
    }

    const db = auth.db;
    const email = auth.user.email;
    const expectedHash = db.credentials[email] ?? seedCredentials[email];

    if (!expectedHash || hashPassword(body.currentPassword!) !== expectedHash) {
      return errorResponse(400, "VALIDATION_ERROR", "Senha atual incorreta.", {
        currentPassword: "Senha atual incorreta.",
      });
    }

    db.credentials[email] = hashPassword(body.newPassword!);
    saveDb(db);
    return json({ ok: true });
  }),
];
