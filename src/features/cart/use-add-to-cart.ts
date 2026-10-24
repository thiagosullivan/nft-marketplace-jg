import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { http, isApiError } from "@/shared/api";
import type { AddToCartInput, Cart } from "@/shared/api/types";
import { cartKeys } from "@/shared/api/query-keys";
import { useSession } from "@/features/auth/use-auth";
import { useAuthModal } from "@/features/auth/auth-modal-provider";
import { setPendingPurchase } from "./pending-purchase";

export type AddToCartResult =
  { kind: "added"; cart: Cart } | { kind: "login-required"; redirect: string };

export function useAddToCart() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const { open } = useAuthModal();

  const mutation = useMutation<Cart, unknown, AddToCartInput>({
    mutationFn: async (input) => {
      const { data } = await http.post<Cart>("/cart/items", input);
      return data;
    },
    onSuccess: (cart) => {
      queryClient.setQueryData(cartKeys.current(), cart);
    },
    onError: (err) => {
      if (isApiError(err)) {
        const fieldMessage = err.fields
          ? Object.values(err.fields)[0]
          : undefined;
        toast.error(fieldMessage ?? err.message);
        return;
      }
      toast.error("Não foi possível adicionar ao carrinho.");
    },
  });

  const add = async (input: AddToCartInput): Promise<AddToCartResult> => {
    if (!session) {
      const redirect = "/checkout";
      setPendingPurchase(input, redirect);
      open("login", redirect);
      return { kind: "login-required", redirect };
    }
    const cart = await mutation.mutateAsync(input);
    return { kind: "added", cart };
  };

  return {
    add,
    isPending: mutation.isPending,
  };
}
