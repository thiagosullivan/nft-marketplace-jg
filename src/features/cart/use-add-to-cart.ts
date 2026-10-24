import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { http, isApiError } from "@/shared/api";
import type { AddToCartInput, Cart, Nft } from "@/shared/api/types";
import { cartKeys, nftKeys } from "@/shared/api/query-keys";
import { useSession } from "@/features/auth/use-auth";
import { addGuestItem } from "./guest-cart";
import { notifyGuestCartChange } from "./use-cart";

export type AddToCartResult =
  | { kind: "added"; cart: Cart }
  | { kind: "guest-added"; cart: Cart }
  | { kind: "error"; message: string };

export function useAddToCart() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  const mutation = useMutation<Cart, unknown, AddToCartInput>({
    mutationFn: async (input) => {
      const { data } = await http.post<Cart>("/cart/items", input);
      return data;
    },
    onSuccess: (cart) => {
      queryClient.setQueryData(cartKeys.current(), cart);
    },
  });

  const add = async (input: AddToCartInput): Promise<AddToCartResult> => {
    if (!session) {
      const cached = queryClient.getQueryData<Nft>(nftKeys.detail(input.nftId));
      if (!cached) {
        return {
          kind: "error",
          message: "Não foi possível localizar o NFT para adicionar.",
        };
      }
      const result = addGuestItem(input, (id) =>
        id === cached.id ? cached : undefined,
      );
      if (result.error) {
        toast.error(result.error);
        return { kind: "error", message: result.error };
      }
      notifyGuestCartChange();
      return { kind: "guest-added", cart: result.cart };
    }

    try {
      const cart = await mutation.mutateAsync(input);
      return { kind: "added", cart };
    } catch (err) {
      const message = isApiError(err)
        ? ((err.fields && Object.values(err.fields)[0]) ?? err.message)
        : "Não foi possível adicionar ao carrinho.";
      toast.error(message);
      return { kind: "error", message };
    }
  };

  return { add, isPending: mutation.isPending };
}
