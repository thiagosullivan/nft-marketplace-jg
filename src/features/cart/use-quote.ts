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

function requestQuote(couponCode?: string): Promise<Quote> {
  return http.post<Quote>("/quote", { couponCode }).then((r) => r.data);
}

export type UseQuoteResult = {
  base: Quote | undefined;
  coupon: Quote | undefined;
  effective: Quote | undefined;
  isError: boolean;
  isFetching: boolean;
  couponError: boolean;
  refetch: () => void;
};

export function useQuote(
  input: QuoteInput & { cart?: Cart } = {},
): UseQuoteResult {
  const { data: session } = useSession();
  const signature = cartSignature(input.cart);
  const enabled = !!session && (input.cart?.items.length ?? 0) > 0;

  const baseQuery = useQuery<Quote>({
    queryKey: [...quoteKeys.current(), "base", signature],
    queryFn: () => requestQuote(undefined),
    enabled,
    // A cotação é a referência para finalizar o pedido; fica "stale" por
    // 30s para evitar refetch durante interações (ex.: modal de conexão
    // de carteira), que mudaria o `issuedAt` e faria a revalidação
    // considerar que o preço mudou sem motivo.
    staleTime: 30_000,
    retry: 0,
    placeholderData: keepPreviousData,
  });

  const couponQuery = useQuery<Quote>({
    queryKey: [...quoteKeys.current(input.couponCode), signature],
    queryFn: () => requestQuote(input.couponCode),
    enabled: enabled && !!input.couponCode,
    staleTime: 30_000,
    retry: 0,
    placeholderData: keepPreviousData,
  });

  const couponApplied = !!input.couponCode;
  const couponError = couponApplied && couponQuery.isError;

  const effective = couponApplied
    ? couponError
      ? baseQuery.data
      : couponQuery.data
    : baseQuery.data;

  return {
    base: baseQuery.data,
    coupon: couponQuery.data,
    effective,
    isError: couponError || (baseQuery.isError && !couponQuery.data),
    isFetching: baseQuery.isFetching || couponQuery.isFetching,
    couponError,
    refetch: () => {
      void baseQuery.refetch();
      if (couponApplied) void couponQuery.refetch();
    },
  };
}
