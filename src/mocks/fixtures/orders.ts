import type {
  EthAmount,
  IsoDate,
  Order,
  OrderItem,
  WalletNetwork,
} from "@/shared/api/types";

// seed orders from maria

const PENDING_ITEMS: OrderItem[] = [
  {
    nftId: "nft-003",
    editionId: "nft-003-ed-1",
    editionName: "Edição padrão",
    tokenId: "#0003",
    name: "Ivory Baron #003",
    imageUrl: "/nfts/prod-3.png",
    quantity: 1,
    unitPriceEth: "0.08" as EthAmount,
  },
];

const CONFIRMED_ITEMS: OrderItem[] = [
  {
    nftId: "nft-010",
    editionId: "nft-010-ed-1",
    editionName: "Edição padrão",
    tokenId: "#0100",
    name: "Crimson Drifter #010",
    imageUrl: "/nfts/prod-2.png",
    quantity: 2,
    unitPriceEth: "2.38" as EthAmount,
  },
  {
    nftId: "nft-004",
    editionId: "nft-004-ed-2",
    editionName: "Edição 2",
    tokenId: "#0041",
    name: "Emerald Wanderer #004",
    imageUrl: "/nfts/prod-4.png",
    quantity: 6,
    unitPriceEth: "8.34" as EthAmount,
  },
  {
    nftId: "nft-013",
    editionId: "nft-013-ed-1",
    editionName: "Edição padrão",
    tokenId: "#0130",
    name: "Violet Ape #013",
    imageUrl: "/nfts/prod-1.png",
    quantity: 9,
    unitPriceEth: "16.11" as EthAmount,
  },
];

export const seedOrders: readonly Order[] = [
  {
    id: "order-seed-pending",
    status: "pending",
    createdAt: "2026-07-29T14:20:00.000Z" as IsoDate,
    updatedAt: "2026-07-29T14:20:00.000Z" as IsoDate,
    confirmedAt: null,
    items: PENDING_ITEMS,
    subtotalEth: "0.08" as EthAmount,
    discountEth: "0.00" as EthAmount,
    networkFeeEth: "0.016" as EthAmount,
    totalEth: "0.096" as EthAmount,
    couponCode: null,
    walletId: "wallet-maria-eth",
    walletLabel: "MetaMask principal",
    walletAddress: "0xA91F4C2b8E7d3A1f5B6c9D0e2F3a4B5c6D7e8E82",
    network: "ethereum" as WalletNetwork,
    transactionRef: null,
    explorerUrl: null,
    version: 1,
  },
  {
    id: "order-seed-confirmed",
    status: "confirmed",
    createdAt: "2026-07-29T14:25:00.000Z" as IsoDate,
    updatedAt: "2026-07-29T14:26:00.000Z" as IsoDate,
    confirmedAt: "2026-07-29T14:26:00.000Z" as IsoDate,
    items: CONFIRMED_ITEMS,
    subtotalEth: "26.830" as EthAmount,
    discountEth: "0.00" as EthAmount,
    networkFeeEth: "0.016" as EthAmount,
    totalEth: "26.846" as EthAmount,
    couponCode: null,
    walletId: "wallet-maria-eth",
    walletLabel: "MetaMask principal",
    walletAddress: "0xA91F4C2b8E7d3A1f5B6c9D0e2F3a4B5c6D7e8E82",
    network: "ethereum" as WalletNetwork,
    transactionRef:
      "0x9f4c1a7e3d2b8f5e6c1d0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d",
    explorerUrl:
      "https://etherscan.io/tx/0x9f4c1a7e3d2b8f5e6c1d0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d",
    version: 2,
  },
];
