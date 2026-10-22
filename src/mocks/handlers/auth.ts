import { http } from "msw";
import type { LoginInput, RegisterInput, Session } from "@/shared/api/types";
import { findUserByEmail, findUserById, loadDb, saveDb } from "../db";
import { hashPassword, seedCredentials } from "../fixtures";
import {
  applyScenario,
  currentUser,
  errorResponse,
  isEmail,
  json,
  nowIso,
} from "../utils";

const SESSION_DURATION_MS = 1000 * 60 * 60 * 2; // 2h

function sessionFor(userId: string, expiresAt: string): Session {
  const db = loadDb();
  const user = findUserById(db, userId);
  if (!user) {
    throw new Error(`Usuário ${userId} não encontrado no db.`);
  }
  return { user, expiresAt };
}

export const authHandlers = [
  // POST /api/auth/register
  http.post("/api/auth/register", async ({ request }) => {
    const err = await applyScenario();
    if (err) return err;

    const body = (await request.json()) as Partial<RegisterInput>;
    const fields: Record<string, string> = {};

    if (!body.username || body.username.trim().length < 3) {
      fields.username = "Nome de usuário deve ter ao menos 3 caracteres.";
    }
    if (!body.email || !isEmail(body.email)) {
      fields.email = "E-mail inválido.";
    }
    if (!body.password || body.password.length < 8) {
      fields.password = "Senha deve ter ao menos 8 caracteres.";
    }

    const db = loadDb();

    if (body.email && findUserByEmail(db, body.email)) {
      fields.email = "Este e-mail já está cadastrado.";
    }
    if (
      body.username &&
      db.users.some(
        (u) => u.username.toLowerCase() === body.username!.toLowerCase(),
      )
    ) {
      fields.username = "Este nome de usuário já está em uso.";
    }

    if (Object.keys(fields).length > 0) {
      return errorResponse(
        409,
        "CONFLICT",
        "Não foi possível criar a conta.",
        fields,
      );
    }

    const id = `user-${Date.now()}`;
    const newUser = {
      id,
      username: body.username!.trim(),
      displayName: body.username!.trim(),
      email: body.email!.toLowerCase(),
      ensName: null,
      avatarUrl: null,
      createdAt: nowIso(),
    };

    db.users.push(newUser);
    db.credentials[newUser.email] = hashPassword(body.password!);
    db.activeUserId = id;
    saveDb(db);

    const expiresAt = new Date(Date.now() + SESSION_DURATION_MS).toISOString();
    return json(sessionFor(id, expiresAt), 201);
  }),

  // POST /api/auth/login
  http.post("/api/auth/login", async ({ request }) => {
    const err = await applyScenario();
    if (err) return err;

    const body = (await request.json()) as Partial<LoginInput>;
    const fields: Record<string, string> = {};

    if (!body.email || !isEmail(body.email)) {
      fields.email = "E-mail inválido.";
    }
    if (!body.password) {
      fields.password = "Informe a senha.";
    }
    if (Object.keys(fields).length > 0) {
      return errorResponse(400, "VALIDATION_ERROR", "Dados inválidos.", fields);
    }

    const db = loadDb();
    const user = findUserByEmail(db, body.email!);
    const expectedHash = seedCredentials[body.email!.toLowerCase()];

    if (!user || !expectedHash) {
      return errorResponse(401, "UNAUTHORIZED", "E-mail ou senha incorretos.");
    }
    if (hashPassword(body.password!) !== expectedHash) {
      return errorResponse(401, "UNAUTHORIZED", "E-mail ou senha incorretos.");
    }

    db.activeUserId = user.id;
    saveDb(db);

    const expiresAt = new Date(Date.now() + SESSION_DURATION_MS).toISOString();
    return json(sessionFor(user.id, expiresAt));
  }),

  // POST /api/auth/logout
  http.post("/api/auth/logout", async () => {
    const err = await applyScenario();
    if (err) return err;

    const db = loadDb();
    db.activeUserId = null;
    saveDb(db);
    return json({ ok: true });
  }),

  // GET /api/auth/session
  http.get("/api/auth/session", async () => {
    const err = await applyScenario();
    if (err) return err;

    const db = loadDb();
    const user = currentUser(db);
    if (!user) {
      return errorResponse(401, "UNAUTHORIZED", "Sem sessão ativa.");
    }
    const expiresAt = new Date(Date.now() + SESSION_DURATION_MS).toISOString();
    return json(sessionFor(user.id, expiresAt));
  }),
];
