import type {
  Cart,
  Coupon,
  Favorite,
  IsoDate,
  Nft,
  Order,
  User,
  Wallet,
} from "@/shared/api/types";
import {
  seedCoupons,
  seedNfts,
  seedOrders,
  seedUsers,
  seedWallets,
  seedCredentials,
} from "./fixtures";

// mock persists on localStorage.

const STORAGE_KEY = "nftmarketplace:db";
const DB_VERSION = 1;

export type Db = {
  version: number;
  users: User[];
  credentials: Record<string, string>;
  nfts: Nft[];
  favorites: Favorite[];
  carts: Record<string, Cart>;
  coupons: Coupon[];
  orders: Order[];
  wallets: Wallet[];
  idempotency: Record<string, string>;
  activeUserId: string | null;
};

function clone<T>(value: T): T {
  return structuredClone(value);
}

function buildInitialDb(): Db {
  return {
    version: DB_VERSION,
    users: clone(seedUsers as User[]),
    credentials: { ...seedCredentials },
    nfts: clone(seedNfts as Nft[]),
    favorites: [],
    carts: {},
    coupons: clone(seedCoupons as Coupon[]),
    orders: clone(seedOrders as Order[]),
    wallets: clone(seedWallets as Wallet[]),
    idempotency: {},
    activeUserId: null,
  };
}

let cache: Db | null = null;

function canUseLocalStorage(): boolean {
  try {
    return typeof window !== "undefined" && !!window.localStorage;
  } catch {
    return false;
  }
}

export function loadDb(): Db {
  if (cache) return cache;

  if (canUseLocalStorage()) {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as Db;
        if (parsed.version === DB_VERSION) {
          cache = parsed;
          return cache;
        }
        window.localStorage.removeItem(STORAGE_KEY);
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }
  }

  cache = buildInitialDb();
  saveDb(cache);
  return cache;
}

export function saveDb(db: Db = loadDb()): void {
  cache = db;
  if (canUseLocalStorage()) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  }
}

export function resetDb(): Db {
  const fresh = buildInitialDb();
  cache = fresh;
  if (canUseLocalStorage()) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
  }
  return fresh;
}

// helpers

export function findUserById(db: Db, id: string): User | undefined {
  return db.users.find((u) => u.id === id);
}

export function findUserByEmail(db: Db, email: string): User | undefined {
  return db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export function getActiveUser(db: Db): User | null {
  if (!db.activeUserId) return null;
  return findUserById(db, db.activeUserId) ?? null;
}

export function getCartFor(db: Db, userId: string): Cart {
  return (
    db.carts[userId] ?? {
      items: [],
      updatedAt: new Date().toISOString() as IsoDate,
    }
  );
}

export function setCartFor(db: Db, userId: string, cart: Cart): void {
  db.carts[userId] = cart;
}

export function findNft(db: Db, id: string): Nft | undefined {
  return db.nfts.find((n) => n.id === id);
}

export type FavoritesByUser = Record<string, Favorite[]>;

export function getFavoritesFor(db: Db, userId: string): Favorite[] {
  const internal = db as Db & { favoritesByUser?: FavoritesByUser };
  internal.favoritesByUser ??= {};
  return internal.favoritesByUser[userId] ?? [];
}

export function setFavoritesFor(
  db: Db,
  userId: string,
  favorites: Favorite[],
): void {
  const internal = db as Db & { favoritesByUser?: FavoritesByUser };
  internal.favoritesByUser ??= {};
  internal.favoritesByUser[userId] = favorites;
}
