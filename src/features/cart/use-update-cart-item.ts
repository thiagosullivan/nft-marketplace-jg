import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { http, isApiError } from "@/shared/api";
import type { Cart, UpdateCartItemInput } from "@/shared/api/types";
import { cartKeys, quoteKeys } from "@/shared/api/query-keys";
import { useSession } from "@/features/auth/use-auth";
import { updateGuestItem } from "./guest-cart";
import { notifyGuestCartChange } from "./use-cart";

export function useUpdateCartItem() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  const mutation = useMutation<Cart, unknown, UpdateCartItemInput>({
    mutationFn: async (input) => {
      const { data } = await http.patch<Cart>("/cart/items", input);
      return data;
    },
    onSuccess: (cart) => {
      queryClient.setQueryData(cartKeys.current(), cart);
      void queryClient.invalidateQueries({ queryKey: quoteKeys.all });
    },
  });

  const update = async (input: UpdateCartItemInput) => {
    if (!session) {
      const result = updateGuestItem(input);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      notifyGuestCartChange();
      return;
    }
    try {
      await mutation.mutateAsync(input);
    } catch (err) {
      const message = isApiError(err)
        ? ((err.fields && Object.values(err.fields)[0]) ?? err.message)
        : "Não foi possível atualizar o item.";
      toast.error(message);
    }
  };

  return { update, isPending: mutation.isPending };
}
