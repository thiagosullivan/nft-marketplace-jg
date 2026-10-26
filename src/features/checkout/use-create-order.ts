import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { http, isApiError, isIdempotencyConflict } from "@/shared/api";
import type { CreateOrderInput, Order } from "@/shared/api/types";
import { cartKeys, orderKeys, quoteKeys } from "@/shared/api/query-keys";

export type CreateOrderResult =
  | { kind: "created"; order: Order }
  | { kind: "conflict"; message: string }
  | { kind: "error"; message: string };

export function useCreateOrder() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const mutation = useMutation<Order, unknown, CreateOrderInput>({
    mutationFn: async (input) => {
      const { data } = await http.post<Order>("/orders", input);
      return data;
    },
    onSuccess: (order) => {
      queryClient.setQueryData(orderKeys.detail(order.id), order);
      void queryClient.invalidateQueries({ queryKey: orderKeys.list() });
      void queryClient.invalidateQueries({ queryKey: cartKeys.all });
      void queryClient.invalidateQueries({ queryKey: quoteKeys.all });
      navigate({ to: "/order/$id", params: { id: order.id } });
    },
  });

  const create = async (
    input: CreateOrderInput,
  ): Promise<CreateOrderResult> => {
    try {
      const order = await mutation.mutateAsync(input);

      return { kind: "created", order };
    } catch (err) {
      if (isIdempotencyConflict(err)) {
        return {
          kind: "conflict",
          message:
            "Este pedido já foi processado com outra chave. Recarregue a página.",
        };
      }
      const message = isApiError(err)
        ? ((err.fields && Object.values(err.fields)[0]) ?? err.message)
        : "Não foi possível criar o pedido.";
      toast.error(message);
      return { kind: "error", message };
    }
  };

  return { create, isPending: mutation.isPending };
}
