import { useQuery } from "@tanstack/react-query";
import { http } from "@/shared/api/http";
import type { Order } from "@/shared/api/types";
import { orderKeys } from "@/shared/api/query-keys";
import { useSession } from "@/features/auth/use-auth";

export type OrderListResponse = {
  items: Order[];
};

export function useOrders() {
  const { data: session } = useSession();

  return useQuery<OrderListResponse>({
    queryKey: orderKeys.list(),
    queryFn: async () => {
      const { data } = await http.get<OrderListResponse>("/orders");
      return data;
    },
    enabled: !!session,
    retry: 0,
    staleTime: 15_000,
    refetchOnWindowFocus: false,
  });
}
