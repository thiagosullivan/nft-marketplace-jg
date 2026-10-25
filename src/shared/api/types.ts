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
  username: string;
  displayName: string;
  email: string;
  ensName: string | null;
  avatarUrl: string | null;
  createdAt: IsoDate;
};

export type Session = {
  user: User;
  expiresAt: IsoDate;
};

export type AuthResponse = {
  session: Session;
  token: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type RegisterInput = {
  username: string;
  email: string;
  password: string;
};

export type UpdateProfileInput = {
  displayName?: string;
  username?: string;
  email?: string;
  ensName?: string | null;
  avatarUrl?: string | null;
};

export type ChangePasswordInput = {
  currentPassword: string;
  newPassword: string;
};

// GET /api/profile
export type Profile = User;

// NFT

export type NftNetwork = "ethereum" | "polygon" | "solana";

export type NftEdition = {
  id: string;
  label: string;
  isOpen: boolean;
  total: number;
  available: number;
  priceEth: EthAmount;
  tokenId: string;
};

export type NftRating = {
  average: number;
  count: number;
};

export type Nft = {
  id: string;
  /**
   * Token do produto. Fixo, exibido no card e no topo do detalhe.
   * Não muda ao trocar de edição. O token da variante está em
   * `editions[].tokenId` e é o que vai ao carrinho via `editionId`.
   */
  tokenId: string;
  name: string;
  description: string;
  imageUrl: string;
  galleryUrls: string[];
  collection: string;
  network: NftNetwork;
  creator: { id: string; name: string; avatarUrl: string | null };
  owner: { id: string; name: string; avatarUrl: string | null };
  /**
   * Preço de vitrine (edição padrão). Usado no card da home.
   * No detalhe, o preço exibido é o da edição selecionada.
   */
  priceEth: EthAmount;
  available: number;
  total: number;
  editions: NftEdition[];
  attributes: string[];
  contractAddress: string;
  royaltyPercent: number;
  rating: NftRating;
  rarityLabel: string | null;

  details: string;
  about: string;
  networkDescription: string;
  contractDescription: string;
  royaltyDescription: string;
  ipfsMetadataUri: string | null;

  createdAt: IsoDate;
  updatedAt: IsoDate;
  version: number;
};

export type NftListQuery = {
  q?: string;
  new?: boolean;
  collections?: string[];
  networks?: NftNetwork[];
  minPriceEth?: EthAmount;
  maxPriceEth?: EthAmount;
  sort?: "recent" | "price-asc" | "price-desc" | "name-asc" | "name-desc";
  page?: number;
  pageSize?: number;
};

export type FacetCount = {
  value: string;
  count: number;
};

export type NftFacets = {
  collections: FacetCount[];
  networks: FacetCount[];
  priceRange: { minEth: EthAmount; maxEth: EthAmount };
};

// GET /api/nfts
export type NftListResponse = Paginated<Nft> & {
  facets: NftFacets;
};

// Favorites

export type Favorite = {
  nftId: string;
  createdAt: IsoDate;
};

export type FavoriteListResponse = {
  items: Nft[];
};

// Cart

export type CartItem = {
  nftId: string;
  editionId: string | null;
  quantity: number;
  unitPriceEth: EthAmount;
  name: string;
  imageUrl: string;
  network: NftNetwork;
  tokenId: string;
  editionLabel: string | null;
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
  expiresAt: IsoDate | null;
};

export type Quote = {
  subtotalEth: EthAmount;
  discountEth: EthAmount;
  networkFeeEth: EthAmount;
  totalEth: EthAmount;
  coupon: Coupon | null;
  issuedAt: IsoDate;

  expiresAt: IsoDate;
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
  editionLabel: string | null;
  tokenId: string;
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
  confirmedAt: IsoDate | null;
  items: OrderItem[];
  subtotalEth: EthAmount;
  discountEth: EthAmount;
  networkFeeEth: EthAmount;
  totalEth: EthAmount;
  couponCode: string | null;
  walletId: string;
  walletLabel: string;
  walletAddress: string;
  network: WalletNetwork;
  transactionRef: string | null;
  explorerUrl: string | null;
  version: number;
  settleAt: IsoDate | null;
  settleStatus: "confirmed" | "declined" | null;
  note: string | null;
};

export type CreateOrderInput = {
  quoteIssuedAt: IsoDate;
  walletId: string;
  network: WalletNetwork;
  couponCode?: string;
  note?: string;
  idempotencyKey: string;
};

// Wallets

export type WalletNetwork = "ethereum" | "polygon" | "solana";

export type WalletType =
  "metamask" | "ledger" | "walletconnect" | "coinbase" | "other";

export type Wallet = {
  id: string;
  label: string;
  address: string;
  network: WalletNetwork;
  ensName: string | null;
  walletType: WalletType;
  referralCode: string | null;
  isPrimary: boolean;
  createdAt: IsoDate;
};

export type CreateWalletInput = {
  label: string;
  address: string;
  network: WalletNetwork;
  ensName?: string | null;
  walletType: WalletType;
  referralCode?: string | null;
  isPrimary?: boolean;
};

export type UpdateWalletInput = Partial<CreateWalletInput>;
