import { useQueryClient } from "@tanstack/react-query";
import { cartKeys } from "@/shared/api/query-keys";
import type { Cart } from "@/shared/api/types";
import { getToken } from "@/shared/lib/auth-store";
import { readGuestCart } from "./guest-cart";

export function useCartCount(): number {
  const queryClient = useQueryClient();
  const token = getToken();

  const cart: Cart | undefined = token
    ? queryClient.getQueryData<Cart>(cartKeys.current())
    : readGuestCart();

  if (!cart) return 0;
  return cart.items.reduce((acc, item) => acc + item.quantity, 0);
}
