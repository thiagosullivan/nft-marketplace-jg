import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { requireAuth } from "@/features/auth/auth-guard";
import {
  OrderList,
  OrderListFilters,
  type OrderListFilter,
} from "@/features/orders";

export const Route = createFileRoute("/orders")({
  beforeLoad: ({ location }) => requireAuth(location.href),
  component: OrdersRoute,
});

function OrdersRoute() {
  const [filter, setFilter] = useState<OrderListFilter>("all");

  return (
    <div className="container mx-auto max-w-4xl px-4 pt-12 pb-24">
      <h1 className="text-3xl font-bold text-primary">Meus pedidos</h1>
      <p className="mt-1 text-sm text-secondary">
        Acompanhe o status de todas as suas compras.
      </p>

      <div className="mt-6">
        <OrderListFilters value={filter} onChange={setFilter} />
      </div>

      <div className="mt-6">
        <OrderList filter={filter} />
      </div>
    </div>
  );
}
