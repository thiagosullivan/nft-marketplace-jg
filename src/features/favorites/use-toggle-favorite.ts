import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { http, isApiError } from "@/shared/api";
import type { FavoriteListResponse, Nft } from "@/shared/api/types";
import { favoriteKeys } from "@/shared/api/query-keys";
import { useSession } from "@/features/auth/use-auth";
import { useAuthModal } from "@/features/auth/auth-modal-provider";
import { useFavorites } from "./use-favorites";
import { isFavoriteIn } from "./use-favorites";

type FavoriteMutationContext = {
  previous: FavoriteListResponse | undefined;
};

function currentUrl(): string {
  if (typeof window === "undefined") return "/";
  return `${window.location.pathname}${window.location.search}`;
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();
  const { data: session, isLoading: sessionLoading } = useSession();
  const { open } = useAuthModal();
  const favoritesQuery = useFavorites();

  const mutation = useMutation<
    void,
    unknown,
    { nft: Nft; shouldFavorite: boolean },
    FavoriteMutationContext
  >({
    mutationFn: async ({ nft, shouldFavorite }) => {
      if (shouldFavorite) {
        await http.post("/favorites", { nftId: nft.id });
      } else {
        await http.delete(`/favorites/${nft.id}`);
      }
    },
    onMutate: async ({ nft, shouldFavorite }) => {
      await queryClient.cancelQueries({ queryKey: favoriteKeys.list() });
      const previous = queryClient.getQueryData<FavoriteListResponse>(
        favoriteKeys.list(),
      );
      const base = previous?.items ?? [];
      const nextItems = shouldFavorite
        ? base.some((n) => n.id === nft.id)
          ? base
          : [nft, ...base]
        : base.filter((n) => n.id !== nft.id);
      queryClient.setQueryData<FavoriteListResponse>(favoriteKeys.list(), {
        items: nextItems,
      });
      return { previous };
    },
    onError: (err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(favoriteKeys.list(), context.previous);
      } else {
        queryClient.setQueryData<FavoriteListResponse>(favoriteKeys.list(), {
          items: [],
        });
      }
      const message = isApiError(err)
        ? err.fields
          ? Object.values(err.fields)[0]
          : err.message
        : "Não foi possível atualizar favoritos.";
      toast.error(message);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: favoriteKeys.all });
    },
  });

  const toggle = async (nft: Nft): Promise<void> => {
    // Se a sessão ainda está carregando, não faz nada. O caller deve
    // desabilitar o botão enquanto `isLoading` for `true`.
    if (sessionLoading) return;
    if (!session) {
      open("login", currentUrl());
      return;
    }
    const items = favoritesQuery.data?.items ?? [];
    const shouldFavorite = !items.some((n) => n.id === nft.id);
    await mutation.mutateAsync({ nft, shouldFavorite });
  };

  return {
    toggle,
    isPending: mutation.isPending,
    // Expõe `sessionLoading` para o caller desabilitar o botão.
    isLoading: sessionLoading,
    isFavorite: (nftId: string) =>
      isFavoriteIn(favoritesQuery.data?.items, nftId),
  };
}
