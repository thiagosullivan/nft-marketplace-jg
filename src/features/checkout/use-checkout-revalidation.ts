import { useQuery } from "@tanstack/react-query";
import { http } from "@/shared/api";
import type { Cart, Quote } from "@/shared/api/types";
import { quoteKeys } from "@/shared/api/query-keys";
import { useSession } from "@/features/auth/use-auth";

type Params = {
  cart: Cart;
  couponCode?: string;
  currentQuote?: Quote;
};

export type RevalidationResult =
  | { status: "ok"; quote: Quote }
  | { status: "changed"; reason: string; quote: Quote }
  | { status: "error"; message: string };

export function useCheckoutRevalidation({
  cart,
  couponCode,
  currentQuote,
}: Params) {
  const { data: session } = useSession();

  const query = useQuery<Quote>({
    queryKey: [...quoteKeys.current(couponCode), "revalidate"],
    queryFn: async () => {
      const { data } = await http.post<Quote>("/quote", { couponCode });
      return data;
    },
    enabled: false,
    staleTime: 0,
    retry: 0,
  });

  const revalidate = async (): Promise<RevalidationResult> => {
    if (!session) return { status: "error", message: "Sessão expirada." };
    if (cart.items.length === 0) {
      return { status: "error", message: "O carrinho está vazio." };
    }
    try {
      const result = await query.refetch();
      const quote = result.data;
      if (!quote) {
        return { status: "error", message: "Falha ao revalidar a cotação." };
      }

      const reasons: string[] = [];
      if (currentQuote && quote.totalEth !== currentQuote.totalEth) {
        reasons.push("O total mudou.");
      }
      if (currentQuote && quote.subtotalEth !== currentQuote.subtotalEth) {
        reasons.push("O subtotal mudou.");
      }
      const unavailable = quote.items.filter((i) => i.available < i.quantity);
      if (unavailable.length > 0) {
        reasons.push("Algum item não tem mais a quantidade disponível.");
      }
      if (reasons.length > 0) {
        return { status: "changed", reason: reasons.join(" "), quote };
      }
      return { status: "ok", quote };
    } catch {
      return {
        status: "error",
        message: "Não foi possível revalidar a cotação.",
      };
    }
  };

  return { revalidate, isFetching: query.isFetching };
}
