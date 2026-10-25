import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { http } from "@/shared/api";
import type { Cart } from "@/shared/api/types";
import { cartKeys, quoteKeys } from "@/shared/api/query-keys";
import { useSession } from "@/features/auth/use-auth";
import { removeGuestItem } from "./guest-cart";
import { notifyGuestCartChange } from "./use-cart";

type Input = { nftId: string; editionId?: string | null };

export function useRemoveCartItem() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  const mutation = useMutation<Cart, unknown, Input>({
    mutationFn: async (input) => {
      const params = new URLSearchParams();
      params.set("nftId", input.nftId);
      if (input.editionId) params.set("editionId", input.editionId);
      const { data } = await http.delete<Cart>(
        `/cart/items?${params.toString()}`,
      );
      return data;
    },
    onSuccess: (cart) => {
      queryClient.setQueryData(cartKeys.current(), cart);
      void queryClient.invalidateQueries({ queryKey: quoteKeys.all });
      toast.success("Removido do carrinho.");
    },
  });

  const remove = async (input: Input) => {
    if (!session) {
      removeGuestItem(input);
      notifyGuestCartChange();
      toast.success("Removido do carrinho.");
      return;
    }
    try {
      await mutation.mutateAsync(input);
    } catch {
      toast.error("Não foi possível remover o item.");
    }
  };

  return { remove, isPending: mutation.isPending };
}
