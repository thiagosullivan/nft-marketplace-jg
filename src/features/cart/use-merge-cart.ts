import { useMutation, useQueryClient } from "@tanstack/react-query";
import { http } from "@/shared/api";
import type { AddToCartInput, Cart } from "@/shared/api/types";
import { cartKeys, quoteKeys } from "@/shared/api/query-keys";
import {
  clearGuestCart,
  hasGuestCartItems,
  readGuestCart,
  toMergeInput,
} from "./guest-cart";
import { notifyGuestCartChange } from "./use-cart";

export function useMergeCart() {
  const queryClient = useQueryClient();

  const mutation = useMutation<Cart, unknown, AddToCartInput[]>({
    mutationFn: async (items) => {
      const { data } = await http.post<Cart>("/cart/merge", { items });
      return data;
    },
    onSuccess: (cart) => {
      clearGuestCart();
      notifyGuestCartChange();
      queryClient.setQueryData(cartKeys.current(), cart);
      void queryClient.invalidateQueries({ queryKey: cartKeys.all });
      void queryClient.invalidateQueries({ queryKey: quoteKeys.all });
    },
  });

  const mergeIfNeeded = async (): Promise<boolean> => {
    if (!hasGuestCartItems()) return false;
    const items = toMergeInput(readGuestCart());
    if (items.length === 0) return false;
    try {
      await mutation.mutateAsync(items);
      return true;
    } catch {
      return false;
    }
  };

  return { mergeIfNeeded, isPending: mutation.isPending };
}
