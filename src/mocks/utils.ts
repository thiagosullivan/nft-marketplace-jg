import type { IsoDate, Paginated, User } from "@/shared/api/types";
import { loadDb, findUserById, type Db, type DbToken } from "./db";
import { scenarioDelay, globalErrorResponse } from "./scenario";

export async function applyScenarioDelay(): Promise<void> {
  const ms = scenarioDelay();
  if (ms > 0) {
    await new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export async function applyScenario(): Promise<Response | null> {
  const err = globalErrorResponse();
  if (err) {
    await applyScenarioDelay();
    return err;
  }
  await applyScenarioDelay();
  return null;
}

export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export function errorResponse(
  status: number,
  code: string,
  message: string,
  fields?: Record<string, string>,
): Response {
  return json({ code, message, fields }, status);
}

/** Extrai o token de `Authorization: Bearer <token>`. */
export function extractBearerToken(request: Request): string | null {
  const header = request.headers.get("Authorization");
  if (!header) return null;
  const [scheme, token] = header.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) return null;
  return token;
}

export type AuthContext = {
  db: Db;
  user: User;
  token: string;
  tokenData: DbToken;
};

export function requireAuth(request: Request): AuthContext | Response {
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
    return errorResponse(401, "UNAUTHORIZED", "Sessão expirada.");
  }

  const user = findUserById(db, tokenData.userId);
  if (!user) {
    return errorResponse(401, "UNAUTHORIZED", "Usuário não encontrado.");
  }

  return { db, user, token, tokenData };
}

export function generateToken(): string {
  const rand = () => Math.random().toString(36).slice(2, 12);
  return `tok_${rand()}${rand()}`;
}

export function paginate<T>(
  items: T[],
  page: number,
  pageSize: number,
): Paginated<T> {
  const safePage = Math.max(1, Math.floor(page) || 1);
  const safeSize = Math.max(1, Math.floor(pageSize) || 9);
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / safeSize));
  const start = (safePage - 1) * safeSize;
  return {
    items: items.slice(start, start + safeSize),
    page: safePage,
    pageSize: safeSize,
    total,
    totalPages,
  };
}

export function queryString(url: URL, key: string): string | undefined {
  const value = url.searchParams.get(key);
  return value === null || value === "" ? undefined : value;
}

export function queryArray(url: URL, key: string): string[] | undefined {
  const values = url.searchParams.getAll(key).filter((v) => v !== "");
  return values.length > 0 ? values : undefined;
}

export function queryNumber(url: URL, key: string): number | undefined {
  const raw = url.searchParams.get(key);
  if (raw === null || raw === "") return undefined;
  const n = Number(raw);
  return Number.isFinite(n) ? n : undefined;
}

export function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function nowIso(): IsoDate {
  return new Date().toISOString();
}

export function addEth(a: string, b: string): string {
  return (Number(a) + Number(b))
    .toFixed(3)
    .replace(/0+$/, "")
    .replace(/\.$/, ".0");
}
