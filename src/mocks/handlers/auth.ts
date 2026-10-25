import { http } from "msw";
import type {
  AuthResponse,
  LoginInput,
  RegisterInput,
  Session,
} from "@/shared/api/types";
import { findUserByEmail, findUserById, loadDb, saveDb } from "../db";
import { hashPassword, seedCredentials } from "../fixtures";
import {
  applyScenario,
  errorResponse,
  extractBearerToken,
  generateToken,
  isEmail,
  json,
  nowIso,
} from "../utils";

const SESSION_DURATION_MS = 1000 * 60 * 60 * 2; // 2h

function buildSession(userId: string, expiresAt: string): Session {
  const db = loadDb();
  const user = findUserById(db, userId);
  if (!user) throw new Error(`Usuário ${userId} não encontrado.`);
  return { user, expiresAt };
}

function issueToken(userId: string, expiresAt: string): string {
  const db = loadDb();
  const token = generateToken();
  db.tokens[token] = { userId, expiresAt };
  saveDb(db);
  return token;
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
    saveDb(db);

    const expiresAt = new Date(Date.now() + SESSION_DURATION_MS).toISOString();
    const token = issueToken(id, expiresAt);
    const response: AuthResponse = {
      session: buildSession(id, expiresAt),
      token,
    };
    return json(response, 201);
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
    const emailKey = body.email!.toLowerCase();
    const expectedHash = db.credentials[emailKey] ?? seedCredentials[emailKey];

    if (!user || !expectedHash) {
      return errorResponse(401, "UNAUTHORIZED", "E-mail ou senha incorretos.");
    }
    if (hashPassword(body.password!) !== expectedHash) {
      return errorResponse(401, "UNAUTHORIZED", "E-mail ou senha incorretos.");
    }

    const expiresAt = new Date(Date.now() + SESSION_DURATION_MS).toISOString();
    const token = issueToken(user.id, expiresAt);
    const response: AuthResponse = {
      session: buildSession(user.id, expiresAt),
      token,
    };
    return json(response);
  }),

  // POST /api/auth/logout
  http.post("/api/auth/logout", async ({ request }) => {
    const err = await applyScenario();
    if (err) return err;

    const token = extractBearerToken(request);
    if (token) {
      const db = loadDb();
      delete db.tokens[token];
      saveDb(db);
    }
    return json({ ok: true });
  }),

  // GET /api/auth/session
  http.get("/api/auth/session", async ({ request }) => {
    const err = await applyScenario();
    if (err) return err;

    const token = extractBearerToken(request);
    if (!token) {
      return errorResponse(401, "UNAUTHORIZED", "Token ausente.");
    }
    const db = loadDb();
    const tokenData = db.tokens[token];
    if (!tokenData) {
      return errorResponse(401, "UNAUTHORIZED", "Token inválido.");
    }
    if (new Date(tokenData.expiresAt).getTime() < Date.now()) {
      delete db.tokens[token];
      saveDb(db);
      return errorResponse(401, "UNAUTHORIZED", "Sessão expirada.");
    }

    return json(buildSession(tokenData.userId, tokenData.expiresAt));
  }),
];
