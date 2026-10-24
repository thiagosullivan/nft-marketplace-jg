import type {
  AddToCartInput,
  Cart,
  CartItem,
  Nft,
  UpdateCartItemInput,
} from "@/shared/api/types";
import type { IsoDate } from "@/shared/api/types";

const STORAGE_KEY = "nftmarketplace:guest-cart";

export const GUEST_CART_KEY = STORAGE_KEY;

function nowIso(): IsoDate {
  return new Date().toISOString();
}

function emptyCart(): Cart {
  return { items: [], updatedAt: nowIso() };
}

function canUseLocalStorage(): boolean {
  try {
    return typeof window !== "undefined" && !!window.localStorage;
  } catch {
    return false;
  }
}

export function readGuestCart(): Cart {
  if (!canUseLocalStorage()) return emptyCart();
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return emptyCart();
  try {
    const parsed = JSON.parse(raw) as Cart;
    if (!parsed || !Array.isArray(parsed.items)) return emptyCart();
    return parsed;
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return emptyCart();
  }
}

export function writeGuestCart(cart: Cart): void {
  if (!canUseLocalStorage()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
}

export function clearGuestCart(): void {
  if (!canUseLocalStorage()) return;
  window.localStorage.removeItem(STORAGE_KEY);
}

export function hasGuestCartItems(): boolean {
  return readGuestCart().items.length > 0;
}

type ResolveNft = (nftId: string) => Nft | undefined;

function buildGuestItem(
  nft: Nft,
  input: AddToCartInput,
): CartItem | { error: string } {
  if (input.editionId) {
    const edition = nft.editions.find((e) => e.id === input.editionId);
    if (!edition) return { error: "Edição não encontrada." };
    if (edition.available <= 0) return { error: "Edição esgotada." };
    return {
      nftId: nft.id,
      editionId: edition.id,
      quantity: input.quantity,
      unitPriceEth: edition.priceEth,
      name: nft.name,
      imageUrl: nft.imageUrl,
      network: nft.network,
      tokenId: edition.tokenId,
      editionLabel: edition.label,
      maxAvailable: edition.available,
    };
  }
  if (nft.available <= 0) return { error: "NFT esgotado." };
  return {
    nftId: nft.id,
    editionId: null,
    quantity: input.quantity,
    unitPriceEth: nft.priceEth,
    name: nft.name,
    imageUrl: nft.imageUrl,
    network: nft.network,
    tokenId: nft.tokenId,
    editionLabel: null,
    maxAvailable: nft.available,
  };
}

export function addGuestItem(
  input: AddToCartInput,
  resolveNft: ResolveNft,
): { cart: Cart; error?: string } {
  const nft = resolveNft(input.nftId);
  if (!nft) return { cart: readGuestCart(), error: "NFT não encontrado." };

  const built = buildGuestItem(nft, input);
  if ("error" in built) return { cart: readGuestCart(), error: built.error };

  const cart = readGuestCart();
  const existingIndex = cart.items.findIndex(
    (i) => i.nftId === built.nftId && i.editionId === built.editionId,
  );

  let nextItems: CartItem[];
  if (existingIndex >= 0) {
    const desired = cart.items[existingIndex].quantity + built.quantity;
    if (desired > built.maxAvailable) {
      return {
        cart,
        error: `Disponível: ${built.maxAvailable}.`,
      };
    }
    nextItems = cart.items.map((item, idx) =>
      idx === existingIndex ? { ...item, quantity: desired } : item,
    );
  } else {
    nextItems = [...cart.items, built];
  }

  const next: Cart = { items: nextItems, updatedAt: nowIso() };
  writeGuestCart(next);
  return { cart: next };
}

export function updateGuestItem(input: UpdateCartItemInput): {
  cart: Cart;
  error?: string;
} {
  const cart = readGuestCart();
  const editionId = input.editionId ?? null;

  if (input.quantity <= 0) {
    const next: Cart = {
      items: cart.items.filter(
        (i) => !(i.nftId === input.nftId && i.editionId === editionId),
      ),
      updatedAt: nowIso(),
    };
    writeGuestCart(next);
    return { cart: next };
  }

  const target = cart.items.find(
    (i) => i.nftId === input.nftId && i.editionId === editionId,
  );
  if (!target) return { cart, error: "Item não encontrado no carrinho." };
  if (input.quantity > target.maxAvailable) {
    return { cart, error: `Disponível: ${target.maxAvailable}.` };
  }

  const next: Cart = {
    items: cart.items.map((i) =>
      i.nftId === input.nftId && i.editionId === editionId
        ? { ...i, quantity: input.quantity }
        : i,
    ),
    updatedAt: nowIso(),
  };
  writeGuestCart(next);
  return { cart: next };
}

export function removeGuestItem(input: {
  nftId: string;
  editionId?: string | null;
}): Cart {
  const cart = readGuestCart();
  const editionId = input.editionId ?? null;
  const next: Cart = {
    items: cart.items.filter(
      (i) => !(i.nftId === input.nftId && i.editionId === editionId),
    ),
    updatedAt: nowIso(),
  };
  writeGuestCart(next);
  return next;
}

export function toMergeInput(cart: Cart): AddToCartInput[] {
  return cart.items.map((i) => ({
    nftId: i.nftId,
    editionId: i.editionId,
    quantity: i.quantity,
  }));
}
