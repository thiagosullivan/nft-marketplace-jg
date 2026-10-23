import type { NftListQuery } from "./types";

export const sessionKeys = {
  all: ["session"] as const,
  current: () => ["session", "current"] as const,
};

export const nftKeys = {
  all: ["nfts"] as const,
  list: (query: NftListQuery) => ["nfts", "list", query] as const,
  detail: (id: string) => ["nfts", "detail", id] as const,
};

export const favoriteKeys = {
  all: ["favorites"] as const,
  list: () => ["favorites", "list"] as const,
};

export const cartKeys = {
  all: ["cart"] as const,
  current: () => ["cart", "current"] as const,
};

export const quoteKeys = {
  all: ["quote"] as const,
  current: (couponCode?: string) => ["quote", couponCode ?? null] as const,
};

export const orderKeys = {
  all: ["orders"] as const,
  detail: (id: string) => ["orders", "detail", id] as const,
};

export const profileKeys = {
  all: ["profile"] as const,
};

export const walletKeys = {
  all: ["wallets"] as const,
  list: () => ["wallets", "list"] as const,
};
