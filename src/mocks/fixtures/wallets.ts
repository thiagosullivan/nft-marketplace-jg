import type { IsoDate, Wallet } from "@/shared/api/types";

/**
 * wallets seed per user.
 *
 * - maria: 1 (Ethereum) + 1 (Polygon).
 * - fernando: 1 (Solana).
 * - thais: 1 (Ethereum)
 */
export const seedWallets: readonly Wallet[] = [
  {
    id: "wallet-maria-eth",
    label: "MetaMask",
    address: "0xA91F4C2b8E7d3A1f5B6c9D0e2F3a4B5c6D7e8E82",
    network: "ethereum",
    ensName: "maria",
    walletType: "metamask",
    referralCode: null,
    isPrimary: true,
    createdAt: "2026-01-15T10:05:00.000Z" as IsoDate,
  },
  {
    id: "wallet-maria-polygon",
    label: "Ledger",
    address: "0xB72E5D3c9F8e4B2a6C7d0E1f3A4b5C6d7E8f9A03",
    network: "polygon",
    ensName: null,
    walletType: "ledger",
    referralCode: null,
    isPrimary: false,
    createdAt: "2026-01-20T16:40:00.000Z" as IsoDate,
  },
  {
    id: "wallet-fernando-sol",
    label: "Phantom",
    address: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
    network: "solana",
    ensName: null,
    walletType: "other",
    referralCode: null,
    isPrimary: true,
    createdAt: "2026-02-20T14:35:00.000Z" as IsoDate,
  },
  {
    id: "wallet-thais-eth",
    label: "Coinbase Wallet",
    address: "0xC13F6E4d0A9f5C3b7D8e1F2a4B5c6D7e8F9a0B14",
    network: "ethereum",
    ensName: "thais",
    walletType: "coinbase",
    referralCode: "THAIS2026",
    isPrimary: true,
    createdAt: "2026-03-05T09:20:00.000Z" as IsoDate,
  },
];
