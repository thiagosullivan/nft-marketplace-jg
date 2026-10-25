import { useQuery } from "@tanstack/react-query";
import { http } from "@/shared/api/http";
import type { Order } from "@/shared/api/types";
import { orderKeys } from "@/shared/api/query-keys";
import { useSession } from "@/features/auth/use-auth";

export function useOrder(id: string | null | undefined) {
  const { data: session } = useSession();

  return useQuery<Order>({
    queryKey: orderKeys.detail(id ?? "__missing__"),
    queryFn: async () => {
      const { data } = await http.get<Order>(`/orders/${id}`);
      return data;
    },
    enabled: !!session && !!id,
    retry: 0,
    staleTime: (query) => {
      const status = query.state.data?.status;
      return status === "pending" ? 0 : Number.POSITIVE_INFINITY;
    },
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === "pending" ? 1000 : false;
    },
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: false,
  });
}
