import type {
  EthAmount,
  IsoDate,
  Nft,
  NftEdition,
  NftNetwork,
  NftRating,
} from "@/shared/api/types";

// Tabelas de dados (determinísticas)

export const COLLECTIONS = [
  "Arte digital",
  "Fotografia",
  "Música",
  "Arte 3D",
  "Colecionáveis",
  "Generativa",
  "Jogos",
  "Assinaturas",
  "Utilidade",
] as const;

export const NETWORKS: readonly NftNetwork[] = [
  "ethereum",
  "polygon",
  "solana",
];

export const NFT_IMAGES = [
  "/nfts/prod-1.png",
  "/nfts/prod-2.png",
  "/nfts/prod-3.png",
  "/nfts/prod-4.png",
] as const;

const CREATORS = [
  {
    id: "creator-aurora",
    name: "Aurora Studio",
    avatarUrl: "https://i.pravatar.cc/150?img=5",
  },
  {
    id: "creator-vega",
    name: "Vega Labs",
    avatarUrl: "https://i.pravatar.cc/150?img=15",
  },
  {
    id: "creator-orion",
    name: "Orion Mint",
    avatarUrl: "https://i.pravatar.cc/150?img=25",
  },
  {
    id: "creator-lyra",
    name: "Lyra Collective",
    avatarUrl: "https://i.pravatar.cc/150?img=35",
  },
] as const;

const OWNERS = [
  {
    id: "user-maria",
    name: "Maria Souza",
    avatarUrl: "https://i.pravatar.cc/150?img=47",
  },
  {
    id: "user-fernando",
    name: "Fernando Lima",
    avatarUrl: "https://i.pravatar.cc/150?img=12",
  },
  {
    id: "user-thais",
    name: "Thaís Rocha",
    avatarUrl: "https://i.pravatar.cc/150?img=32",
  },
  {
    id: "creator-aurora",
    name: "Aurora Studio",
    avatarUrl: "https://i.pravatar.cc/150?img=5",
  },
] as const;

const NAME_ADJ = [
  "Emerald",
  "Violet",
  "Ivory",
  "Crimson",
  "Golden",
  "Azure",
  "Onyx",
  "Solar",
  "Lunar",
  "Coral",
  "Frost",
  "Amber",
];
const NAME_NOUN = [
  "Ape",
  "Nomad",
  "Baron",
  "Wanderer",
  "Sentinel",
  "Oracle",
  "Drifter",
  "Herald",
  "Keeper",
  "Voyager",
  "Mirage",
  "Echo",
];

const RARITY_LABELS = ["RARO", "LENDÁRIO", "ÉPICO"] as const;

const ATTRIBUTE_POOL = [
  "Óculos",
  "Esmeralda",
  "Raro",
  "Chapéu",
  "Coroa",
  "Cachimbo",
  "Fone",
  "Máscara",
  "Capa",
  "Gema",
  "Neon",
  "Halo",
] as const;

// Helpers

function pad3(n: number): string {
  return String(n).padStart(3, "0");
}

function pad4(n: number): string {
  return String(n).padStart(4, "0");
}

function eth(value: number): string {
  return value.toFixed(2);
}

function dateFromIndex(index: number): IsoDate {
  const base = Date.UTC(2026, 0, 1, 12, 0, 0);
  const ts = base + index * 6 * 60 * 60 * 1000; // +6h por NFT
  return new Date(ts).toISOString();
}

function galleryAt(index: number): string[] {
  const cover = NFT_IMAGES[index % NFT_IMAGES.length];

  if (index % 2 === 1) {
    return [cover, cover, cover, cover];
  }

  const out: string[] = [];
  for (let i = 0; i < NFT_IMAGES.length; i++) {
    out.push(NFT_IMAGES[(index + i) % NFT_IMAGES.length]);
  }
  return out;
}

function editionLabel(total: number, isOpen: boolean): string {
  if (isOpen) return "ABERTA";
  if (total <= 1) return "1/1";
  return `1/${total}`;
}

function editionsFor(
  nftIndex: number,
  basePrice: number,
): { editions: NftEdition[]; totalAvailable: number; totalAll: number } {
  const n = nftIndex + 1;
  const count = 1 + (nftIndex % 3);
  const editions: NftEdition[] = [];

  const avail1 = nftIndex % 12 === 0 ? 0 : 1;
  editions.push({
    id: `nft-${pad3(n)}-ed-1`,
    label: editionLabel(1, false),
    isOpen: false,
    total: 1,
    available: avail1,
    priceEth: eth(basePrice),
    tokenId: `#${pad4(n * 10 + 1)}`,
  });

  if (count >= 2) {
    const minted = 10 + (nftIndex % 20);
    editions.push({
      id: `nft-${pad3(n)}-ed-2`,
      label: editionLabel(0, true),
      isOpen: true,
      total: minted,
      available: 9999,
      priceEth: eth(basePrice * 1.15),
      tokenId: `#${pad4(n * 10 + 2)}`,
    });
  }

  if (count >= 3) {
    editions.push({
      id: `nft-${pad3(n)}-ed-3`,
      label: editionLabel(50, false),
      isOpen: false,
      total: 50,
      available: nftIndex % 7 === 0 ? 0 : 50 - (nftIndex % 10),
      priceEth: eth(basePrice * 1.3),
      tokenId: `#${pad4(n * 10 + 3)}`,
    });
  }

  const totalAll = editions.reduce((acc, e) => acc + e.total, 0);
  const totalAvailable = editions.reduce((acc, e) => acc + e.available, 0);
  return { editions, totalAvailable, totalAll };
}

function ratingFor(index: number): NftRating {
  if (index % 4 === 0) {
    return { average: 0, count: 0 };
  }
  const count = 3 + ((index * 7) % 40);
  const average = Math.round((3.5 + ((index * 13) % 16) / 10) * 10) / 10;
  return { average: Math.min(5, average), count };
}

function attributesFor(index: number): string[] {
  const count = 2 + (index % 2); // 2 ou 3
  const out: string[] = [];
  for (let i = 0; i < count; i++) {
    out.push(ATTRIBUTE_POOL[(index + i * 3) % ATTRIBUTE_POOL.length]);
  }
  return out;
}

function contractFor(index: number): string {
  const hex = (((index + 1) * 0x9e3779b1) >>> 0).toString(16).padStart(8, "0");
  const tail = (((index + 1) * 0x85ebca6b) >>> 0).toString(16).padStart(4, "0");
  return `0x7A42${hex}${hex}${tail}19E8`.slice(0, 42);
}

function royaltyFor(index: number): number {
  return 2.5 + (index % 8) * 1.0;
}

const PRICES: readonly number[] = [
  0.02, 0.05, 0.08, 0.12, 0.18, 0.25, 0.33, 0.42, 0.5, 0.65, 0.8, 0.95, 1.1,
  1.3, 1.55, 1.8, 2.1, 2.4, 2.75, 3.1, 3.5, 3.95, 4.4, 4.9, 5.45, 6.0, 6.6, 7.2,
  7.85, 8.5, 9.2, 9.95, 10.7, 11.2, 11.75, 12.3,
];

function buildNft(index: number): Nft {
  const n = index + 1;
  const id = `nft-${pad3(n)}`;
  const price = PRICES[index];
  const collection = COLLECTIONS[index % COLLECTIONS.length];
  const network = NETWORKS[index % NETWORKS.length];
  const creator = CREATORS[index % CREATORS.length];
  const owner = OWNERS[index % OWNERS.length];
  const adj = NAME_ADJ[index % NAME_ADJ.length];
  const noun = NAME_NOUN[index % NAME_NOUN.length];

  const { editions, totalAvailable, totalAll } = editionsFor(index, price);

  const createdAt = dateFromIndex(index);
  const updatedAt = dateFromIndex(index + 1);

  const gallery = galleryAt(index);

  return {
    id,
    tokenId: `#${pad4(n)}`,
    name: `${adj} ${noun} #${pad3(n)}`,
    description:
      `Obra da coleção ${collection}, criada por ${creator.name}. ` +
      `Edição limitada disponível na rede ${network}.`,
    galleryUrls: gallery,
    imageUrl: gallery[0],
    collection,
    network,
    creator,
    owner,
    priceEth: eth(price) as EthAmount,
    available: totalAvailable,
    total: totalAll,
    editions,
    attributes: attributesFor(index),
    contractAddress: contractFor(index),
    royaltyPercent: royaltyFor(index),
    rating: ratingFor(index),
    rarityLabel:
      index % 3 === 0 ? RARITY_LABELS[index % RARITY_LABELS.length] : null,
    createdAt,
    updatedAt,
    version: 1,
  };
}

export const seedNfts: readonly Nft[] = Array.from({ length: 36 }, (_, i) =>
  buildNft(i),
);
