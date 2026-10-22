// Common
export type EthAmount = string;
export type IsoDate = string;

export type Paginated<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

// Session / User
export type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  createdAt: IsoDate;
};

export type Session = {
  user: User;
  expiresAt: IsoDate;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type RegisterInput = {
  name: string;
  email: string;
  password: string;
};

export type UpdateProfileInput = {
  name?: string;
  email?: string;
  avatarUrl?: string | null;
};

export type ChangePasswordInput = {
  currentPassword: string;
  newPassword: string;
};

// NFT
export type NftEdition = {
  id: string;
  name: string;
  available: number;
  total: number;
  priceEth: EthAmount;
};

export type Nft = {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  galleryUrls: string[];
  collection: string;
  creator: { id: string; name: string; avatarUrl: string | null };
  owner: { id: string; name: string; avatarUrl: string | null };
  priceEth: EthAmount;
  available: number;
  total: number;
  editions: NftEdition[];
  createdAt: IsoDate;
  updatedAt: IsoDate;
  version: number;
};

export type NftListQuery = {
  q?: string;
  collection?: string;
  minPriceEth?: EthAmount;
  maxPriceEth?: EthAmount;
  sort?: "recent" | "price-asc" | "price-desc" | "name-asc" | "name-desc";
  page?: number;
  pageSize?: number;
};

// Favorites
export type Favorite = {
  nftId: string;
  createdAt: IsoDate;
};

// Cart
export type CartItem = {
  nftId: string;
  editionId: string | null;
  quantity: number;
  unitPriceEth: EthAmount;
  name: string;
  imageUrl: string;
  maxAvailable: number;
};

export type Cart = {
  items: CartItem[];
  updatedAt: IsoDate;
};

export type AddToCartInput = {
  nftId: string;
  editionId?: string | null;
  quantity: number;
};

export type UpdateCartItemInput = {
  nftId: string;
  editionId?: string | null;
  quantity: number;
};

// Quote
export type Coupon = {
  code: string;
  discountPercent: number;
};

export type Quote = {
  subtotalEth: EthAmount;
  discountEth: EthAmount;
  networkFeeEth: EthAmount;
  totalEth: EthAmount;
  coupon: Coupon | null;
  issuedAt: IsoDate;
  items: Array<{
    nftId: string;
    editionId: string | null;
    quantity: number;
    unitPriceEth: EthAmount;
    available: number;
  }>;
};

export type QuoteInput = {
  couponCode?: string;
};

// Order
export type OrderStatus = "pending" | "confirmed" | "declined";

export type OrderItem = {
  nftId: string;
  editionId: string | null;
  name: string;
  imageUrl: string;
  quantity: number;
  unitPriceEth: EthAmount;
};

export type Order = {
  id: string;
  status: OrderStatus;
  createdAt: IsoDate;
  updatedAt: IsoDate;
  items: OrderItem[];
  subtotalEth: EthAmount;
  discountEth: EthAmount;
  networkFeeEth: EthAmount;
  totalEth: EthAmount;
  couponCode: string | null;
  walletId: string;
  network: string;
  transactionRef: string | null;
  explorerUrl: string | null;
  version: number;
};

export type CreateOrderInput = {
  quoteIssuedAt: IsoDate;
  walletId: string;
  network: string;
  couponCode?: string;
  idempotencyKey: string;
};

// Wallets
export type WalletNetwork = "ethereum" | "polygon" | "base";

export type Wallet = {
  id: string;
  label: string;
  address: string;
  network: WalletNetwork;
  isPrimary: boolean;
  createdAt: IsoDate;
};

export type CreateWalletInput = {
  label: string;
  address: string;
  network: WalletNetwork;
  isPrimary?: boolean;
};

export type UpdateWalletInput = Partial<CreateWalletInput>;
