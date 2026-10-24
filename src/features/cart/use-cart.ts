import { useQuery } from "@tanstack/react-query";
import { http } from "@/shared/api";
import type { Cart } from "@/shared/api/types";
import { cartKeys } from "@/shared/api/query-keys";
import { useSession } from "@/features/auth/use-auth";

export function useCart() {
  const { data: session } = useSession();
  return useQuery<Cart>({
    queryKey: cartKeys.current(),
    queryFn: async () => {
      const { data } = await http.get<Cart>("/cart");
      return data;
    },
    enabled: !!session,
    staleTime: 15_000,
    retry: 0,
  });
}

export function useCartCount(): number {
  const { data } = useCart();
  if (!data) return 0;
  return data.items.reduce((acc, item) => acc + item.quantity, 0);
}
