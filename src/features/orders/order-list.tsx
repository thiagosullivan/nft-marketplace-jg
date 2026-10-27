import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Button } from "@/shared/components/ui/button";
import type { Order } from "@/shared/api/types";
import { useOrders } from "./use-orders";
import { formatOrderDate } from "./format-order-date";
import { formatEth } from "@/features/cart/format-eth";
import { OrderStatusBadge } from "./order-status-badge";
import { OrderListEmpty } from "./order-list-empty";

const NETWORK_LABEL: Record<Order["network"], string> = {
  ethereum: "Ethereum",
  polygon: "Polygon",
  solana: "Solana",
};

function orderTitle(order: Order): string {
  const first = order.items[0];
  if (!first) return "Pedido";
  if (order.items.length === 1) return first.name;
  return `${first.name} e mais ${order.items.length - 1}`;
}

function firstImage(order: Order): string | null {
  return order.items[0]?.imageUrl ?? null;
}

function Line({ order }: { order: Order }) {
  const image = firstImage(order);
  return (
    <li>
      <Link
        to="/order/$id"
        params={{ id: order.id }}
        className="flex items-center gap-4 rounded-xs bg-surface-card p-2 transition hover:bg-surface-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        {image ? (
          <img
            src={image}
            alt="order"
            className="size-20 shrink-0 rounded-md object-cover"
            loading="lazy"
            width={80}
            height={80}
          />
        ) : (
          <div className="size-16 shrink-0 rounded-md bg-surface-dark" />
        )}

        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-bold text-foreground">
            {orderTitle(order)}
          </p>
          <p className="text-sm text-secondary">
            {formatOrderDate(order.createdAt) ?? "——"} ·{" "}
            {NETWORK_LABEL[order.network]} · {order.walletLabel}
          </p>
        </div>

        <div className="flex flex-col items-end gap-1">
          <OrderStatusBadge status={order.status} />
          <p className="text-lg font-bold text-accent">
            {formatEth(order.totalEth)} ETH
          </p>
        </div>

        <ChevronRight
          className="size-5 shrink-0 text-muted-foreground"
          aria-hidden="true"
        />
      </Link>
    </li>
  );
}

type Props = {
  filter?: "all" | Order["status"];
};

export function OrderList({ filter = "all" }: Props) {
  const query = useOrders();

  if (query.isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (query.isError || !query.data) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <p className="text-sm text-secondary">
          Não foi possível carregar seus pedidos.
        </p>
        <Button variant="outline" onClick={() => query.refetch()}>
          Tentar novamente
        </Button>
      </div>
    );
  }

  const all = query.data.items;
  const items = filter === "all" ? all : all.filter((o) => o.status === filter);

  if (all.length === 0) return <OrderListEmpty />;

  if (items.length === 0) {
    return (
      <p className="py-16 text-center text-sm text-secondary">
        Nenhum pedido com esse status.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {items.map((order) => (
        <Line key={order.id} order={order} />
      ))}
    </ul>
  );
}
