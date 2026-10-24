import type { AddToCartInput } from "@/shared/api/types";

const STORAGE_KEY = "nftmarketplace:pending-purchase";

export const PENDING_PURCHASE_KEY = STORAGE_KEY;

export type PendingPurchase = {
  input: AddToCartInput;
  redirect: string;
  createdAt: string;
};

export function setPendingPurchase(
  input: AddToCartInput,
  redirect: string,
): void {
  if (typeof window === "undefined") return;
  const payload: PendingPurchase = {
    input,
    redirect,
    createdAt: new Date().toISOString(),
  };
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // sessionStorage indisponível (modo privado restrito) — ignora.
  }
}

export function peekPendingPurchase(): PendingPurchase | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PendingPurchase;
    if (!parsed?.input?.nftId || !parsed?.input?.quantity) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function consumePendingPurchase(): PendingPurchase | null {
  const value = peekPendingPurchase();
  clearPendingPurchase();
  return value;
}

export function clearPendingPurchase(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignora
  }
}
