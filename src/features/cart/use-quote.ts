import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { http } from "@/shared/api";
import type { Cart, Quote, QuoteInput } from "@/shared/api/types";
import { quoteKeys } from "@/shared/api/query-keys";
import { useSession } from "@/features/auth/use-auth";

function cartSignature(cart: Cart | undefined): string {
  if (!cart || cart.items.length === 0) return "empty";
  return cart.items
    .map((i) => `${i.nftId}:${i.editionId ?? "none"}:${i.quantity}`)
    .sort()
    .join("|");
}

export function useQuote(input: QuoteInput & { cart?: Cart } = {}) {
  const { data: session } = useSession();
  const signature = cartSignature(input.cart);

  return useQuery<Quote>({
    queryKey: [...quoteKeys.current(input.couponCode), signature],
    queryFn: async () => {
      const { data } = await http.post<Quote>("/quote", {
        couponCode: input.couponCode,
      });
      return data;
    },
    enabled: !!session && (input.cart?.items.length ?? 0) > 0,
    staleTime: 0,
    retry: 0,
    placeholderData: keepPreviousData,
  });
}
