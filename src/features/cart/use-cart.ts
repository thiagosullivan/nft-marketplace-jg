import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { http } from "@/shared/api";
import type { Cart } from "@/shared/api/types";
import { cartKeys } from "@/shared/api/query-keys";
import { useSession } from "@/features/auth/use-auth";
import { GUEST_CART_KEY, readGuestCart } from "./guest-cart";

export const GUEST_CART_UPDATED_EVENT = "cart:guest-updated";

function notifyGuestCartUpdated(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(GUEST_CART_UPDATED_EVENT));
}

function useGuestCart(): Cart {
  const [cart, setCart] = useState<Cart>(() => readGuestCart());

  useEffect(() => {
    const sync = () => setCart(readGuestCart());
    const onStorage = (e: StorageEvent) => {
      if (e.key === GUEST_CART_KEY) sync();
    };
    window.addEventListener(GUEST_CART_UPDATED_EVENT, sync);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(GUEST_CART_UPDATED_EVENT, sync);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  return cart;
}

export function useCart() {
  const { data: session, isLoading: sessionLoading } = useSession();
  const guest = useGuestCart();

  const query = useQuery<Cart>({
    queryKey: cartKeys.current(),
    queryFn: async () => {
      const { data } = await http.get<Cart>("/cart");
      return data;
    },
    enabled: !!session,
    staleTime: 15_000,
    retry: 0,
  });

  if (session) {
    return { ...query, data: query.data };
  }
  return {
    data: guest,
    isLoading: sessionLoading,
    isError: false,
    isFetching: false,
    refetch: async () => {},
  };
}

export function useCartCount(): number {
  const { data } = useCart();
  if (!data) return 0;
  return data.items.reduce((acc, item) => acc + item.quantity, 0);
}

export function notifyGuestCartChange(): void {
  notifyGuestCartUpdated();
}
