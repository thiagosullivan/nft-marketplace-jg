import { http } from "msw";
import type {
  EthAmount,
  FacetCount,
  Nft,
  NftFacets,
  NftListResponse,
} from "@/shared/api/types";
import { loadDb } from "../db";
import {
  applyScenario,
  errorResponse,
  json,
  paginate,
  queryArray,
  queryNumber,
  queryString,
} from "../utils";
import { getScenario } from "../scenario";

const DEFAULT_PAGE_SIZE = 9;

function computeFacets(nfts: Nft[]): NftFacets {
  const collectionMap = new Map<string, number>();
  const networkMap = new Map<string, number>();
  let min = Infinity;
  let max = -Infinity;

  for (const nft of nfts) {
    collectionMap.set(
      nft.collection,
      (collectionMap.get(nft.collection) ?? 0) + 1,
    );
    networkMap.set(nft.network, (networkMap.get(nft.network) ?? 0) + 1);
    const p = Number(nft.priceEth);
    if (Number.isFinite(p)) {
      if (p < min) min = p;
      if (p > max) max = p;
    }
  }

  const toCounts = (map: Map<string, number>): FacetCount[] =>
    Array.from(map.entries())
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => b.count - a.count);

  return {
    collections: toCounts(collectionMap),
    networks: toCounts(networkMap),
    priceRange: {
      minEth: (Number.isFinite(min) ? min.toFixed(2) : "0.00") as EthAmount,
      maxEth: (Number.isFinite(max) ? max.toFixed(2) : "0.00") as EthAmount,
    },
  };
}

export const nftHandlers = [
  // GET /api/nfts
  http.get("/api/nfts", async ({ request }) => {
    const err = await applyScenario();
    if (err) return err;

    const url = new URL(request.url);
    const db = loadDb();

    const facets = computeFacets(db.nfts);

    if (getScenario() === "empty") {
      const empty: NftListResponse = {
        items: [],
        page: 1,
        pageSize: DEFAULT_PAGE_SIZE,
        total: 0,
        totalPages: 1,
        facets,
      };
      return json(empty);
    }

    const q = queryString(url, "q")?.toLowerCase();
    const collections = queryArray(url, "collections");
    const networks = queryArray(url, "networks");
    const minPriceRaw = queryString(url, "minPriceEth");
    const maxPriceRaw = queryString(url, "maxPriceEth");
    const sort = queryString(url, "sort") ?? "recent";
    const page = queryNumber(url, "page") ?? 1;
    const pageSize = queryNumber(url, "pageSize") ?? DEFAULT_PAGE_SIZE;

    let items = db.nfts.slice();

    if (q) {
      items = items.filter(
        (n) =>
          n.name.toLowerCase().includes(q) ||
          n.collection.toLowerCase().includes(q) ||
          n.description.toLowerCase().includes(q),
      );
    }
    if (collections && collections.length > 0) {
      items = items.filter((n) => collections.includes(n.collection));
    }
    if (networks && networks.length > 0) {
      items = items.filter((n) => networks.includes(n.network));
    }
    if (minPriceRaw) {
      const min = Number(minPriceRaw);
      if (Number.isFinite(min)) {
        items = items.filter((n) => Number(n.priceEth) >= min);
      }
    }
    if (maxPriceRaw) {
      const max = Number(maxPriceRaw);
      if (Number.isFinite(max)) {
        items = items.filter((n) => Number(n.priceEth) <= max);
      }
    }

    switch (sort) {
      case "price-asc":
        items.sort((a, b) => Number(a.priceEth) - Number(b.priceEth));
        break;
      case "price-desc":
        items.sort((a, b) => Number(b.priceEth) - Number(a.priceEth));
        break;
      case "name-asc":
        items.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        items.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "recent":
      default:
        items.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        break;
    }

    const paginated = paginate(items, page, pageSize);
    const response: NftListResponse = { ...paginated, facets };
    return json(response);
  }),

  // GET /api/nfts/:id
  http.get("/api/nfts/:id", async ({ params }) => {
    const err = await applyScenario();
    if (err) return err;

    const db = loadDb();
    const id = String(params.id);
    const nft = db.nfts.find((n) => n.id === id);
    if (!nft) {
      return errorResponse(404, "NOT_FOUND", `NFT ${id} não encontrado.`);
    }
    return json(nft);
  }),
];
