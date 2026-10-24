import { useQuery } from "@tanstack/react-query";
import { http } from "@/shared/api";
import type { FavoriteListResponse, Nft } from "@/shared/api/types";
import { favoriteKeys } from "@/shared/api/query-keys";
import { useSession } from "@/features/auth/use-auth";

export function useFavorites() {
  const { data: session } = useSession();
  return useQuery<FavoriteListResponse>({
    queryKey: favoriteKeys.list(),
    queryFn: async () => {
      const { data } = await http.get<FavoriteListResponse>("/favorites");
      return data;
    },
    enabled: !!session,
    staleTime: 30_000,
    retry: 0,
  });
}

export function useIsFavorite(nftId: string): boolean {
  const { data } = useFavorites();
  return !!data?.items.some((n) => n.id === nftId);
}

export function isFavoriteIn(items: Nft[] | undefined, nftId: string): boolean {
  return !!items?.some((n) => n.id === nftId);
}
