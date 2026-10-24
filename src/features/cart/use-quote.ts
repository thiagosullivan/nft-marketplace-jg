import { useQuery } from "@tanstack/react-query";
import { http } from "@/shared/api";
import type { Quote, QuoteInput } from "@/shared/api/types";
import { quoteKeys } from "@/shared/api/query-keys";
import { useSession } from "@/features/auth/use-auth";

export function useQuote(input: QuoteInput = {}) {
  const { data: session } = useSession();
  return useQuery<Quote>({
    queryKey: quoteKeys.current(input.couponCode),
    queryFn: async () => {
      const { data } = await http.post<Quote>("/quote", {
        couponCode: input.couponCode,
      });
      return data;
    },
    enabled: !!session,
    staleTime: 0,
    retry: 0,
  });
}
