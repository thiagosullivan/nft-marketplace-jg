import type { AuthResponse, Session } from "@/shared/api/types";

const TOKEN_KEY = "nftmarketplace:token";
const SESSION_KEY = "nftmarketplace:session";
export const AUTH_CHANGED_EVENT = "auth:changed";

function canUseLocalStorage(): boolean {
  try {
    return typeof window !== "undefined" && !!window.localStorage;
  } catch {
    return false;
  }
}

function emitAuthChanged(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(AUTH_CHANGED_EVENT));
}

export function getToken(): string | null {
  if (!canUseLocalStorage()) return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function getStoredSession(): Session | null {
  if (!canUseLocalStorage()) return null;
  const raw = window.localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}

export function setAuth(response: AuthResponse): void {
  if (!canUseLocalStorage()) return;
  window.localStorage.setItem(TOKEN_KEY, response.token);
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(response.session));
  emitAuthChanged();
}

export function clearAuth(): void {
  if (!canUseLocalStorage()) return;
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(SESSION_KEY);
  emitAuthChanged();
}
