import type { IsoDate, Paginated } from "@/shared/api/types";
import { getActiveUser, loadDb, type Db } from "./db";
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

export function currentUser(db: Db) {
  return getActiveUser(db);
}

export function requireAuth():
  { db: Db; user: NonNullable<ReturnType<typeof getActiveUser>> } | Response {
  const db = loadDb();
  const user = getActiveUser(db);
  if (!user) {
    return errorResponse(401, "UNAUTHORIZED", "Sessão inválida ou expirada.");
  }
  return { db, user };
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
