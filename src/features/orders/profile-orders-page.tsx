import { useState } from "react";
import {
  OrderList,
  OrderListFilters,
  type OrderListFilter,
} from "@/features/orders";

export function ProfileOrdersPage() {
  const [filter, setFilter] = useState<OrderListFilter>("all");

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary">Atividade</h1>
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
