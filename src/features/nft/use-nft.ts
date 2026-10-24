import { useQuery } from "@tanstack/react-query";
import { http, isNotFound } from "@/shared/api";
import type { Nft } from "@/shared/api/types";
import { nftKeys } from "@/shared/api/query-keys";

export function useNft(id: string) {
  return useQuery<Nft>({
    queryKey: nftKeys.detail(id),
    queryFn: async () => {
      const { data } = await http.get<Nft>(`/nfts/${id}`);
      return data;
    },
    staleTime: 30_000,
    retry: (failureCount, error) => {
      if (isNotFound(error)) return false;
      return failureCount < 1;
    },
  });
}
