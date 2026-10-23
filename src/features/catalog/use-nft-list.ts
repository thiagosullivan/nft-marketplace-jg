import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { http } from "@/shared/api";
import type { NftListQuery, NftListResponse } from "@/shared/api/types";
import { nftKeys } from "@/shared/api/query-keys";

export function useNftList(query: NftListQuery) {
  return useQuery<NftListResponse>({
    queryKey: nftKeys.list(query),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (query.q) params.set("q", query.q);
      for (const c of query.collections ?? []) params.append("collections", c);
      for (const n of query.networks ?? []) params.append("networks", n);
      if (query.minPriceEth) params.set("minPriceEth", query.minPriceEth);
      if (query.maxPriceEth) params.set("maxPriceEth", query.maxPriceEth);
      if (query.sort) params.set("sort", query.sort);
      if (query.page) params.set("page", String(query.page));
      if (query.pageSize) params.set("pageSize", String(query.pageSize));

      const { data } = await http.get<NftListResponse>(
        `/nfts?${params.toString()}`,
      );
      return data;
    },
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  });
}
