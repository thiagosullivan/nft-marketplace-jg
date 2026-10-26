import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { ExternalLink } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Separator } from "@/shared/components/ui/separator";
import type { Order } from "@/shared/api/types";
import { orderKeys } from "@/shared/api/query-keys";
import { formatEth } from "@/features/cart/format-eth";
import {
  useSocketEvent,
  type SocketEventEnvelope,
} from "@/shared/socket/use-socket-event";
import { OrderStatusBadge } from "./order-status-badge";
import { OrderTransactionTable } from "./order-transaction-table";
import { formatOrderDate, truncateTxHash } from "./format-order-date";

type Props = {
  order: Order;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type OrderUpdatedPayload = {
  orderId: string;
  status: Order["status"];
  confirmedAt: string | null;
  transactionRef: string | null;
  explorerUrl: string | null;
};

const NETWORK_LABEL: Record<Order["network"], string> = {
  ethereum: "Ethereum",
  polygon: "Polygon",
  solana: "Solana",
};

export function OrderConfirmationDialog({ order, open, onOpenChange }: Props) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useSocketEvent<OrderUpdatedPayload>(
    "order.updated",
    ({ version, payload }: SocketEventEnvelope<OrderUpdatedPayload>) => {
      if (payload.orderId !== order.id) return;
      queryClient.setQueryData<Order | undefined>(
        orderKeys.detail(order.id),
        (prev) =>
          prev && prev.version < version
            ? {
                ...prev,
                status: payload.status,
                confirmedAt: payload.confirmedAt,
                transactionRef: payload.transactionRef,
                explorerUrl: payload.explorerUrl,
                version,
              }
            : prev,
      );
    },
  );

  const isPending = order.status === "pending";
  const isConfirmed = order.status === "confirmed";
  const isDeclined = order.status === "declined";

  const goToCheckout = () => navigate({ to: "/checkout" });
  const goToOrders = () => navigate({ to: "/profile/orders" });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-2xl gap-0 bg-surface-raised text-foreground"
        aria-describedby={undefined}
      >
        <DialogHeader className="items-center text-center">
          {/* TODO: substituir pelo ícone do Figma */}
          <div aria-hidden className="size-12" />

          <DialogTitle className="text-2xl font-bold text-foreground">
            {isConfirmed && "Seus NFTs agora estão na sua carteira"}
            {isPending && "Pedido pendente"}
            {isDeclined && "Pagamento recusado"}
          </DialogTitle>

          {isPending && (
            <p className="mt-1 text-sm text-secondary">
              Aguardando confirmação na rede {NETWORK_LABEL[order.network]}…
            </p>
          )}
          {isDeclined && (
            <p className="mt-1 text-sm text-secondary">
              Não foi possível concluir o pagamento. Tente novamente.
            </p>
          )}
        </DialogHeader>

        <Separator className="my-4" />

        <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">
              ID da transação
            </dt>
            <dd className="mt-1 text-sm font-bold text-foreground">
              {truncateTxHash(order.transactionRef)}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">
              Data
            </dt>
            <dd className="mt-1 text-sm font-bold text-foreground">
              {formatOrderDate(order.createdAt) ?? "——"}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">
              Total
            </dt>
            <dd className="mt-1 text-sm font-bold text-foreground">
              {formatEth(order.totalEth)} ETH
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">
              Carteira
            </dt>
            <dd className="mt-1 text-sm font-bold text-foreground">
              {order.walletLabel}
            </dd>
          </div>
        </dl>

        {!isConfirmed && (
          <div className="mt-3">
            <OrderStatusBadge status={order.status} />
          </div>
        )}

        <Separator className="my-4" />

        <OrderTransactionTable order={order} />

        <Separator className="my-4" />

        {isConfirmed && (
          <p className="text-sm text-secondary">
            Transação confirmada na {NETWORK_LABEL[order.network]}. A
            propriedade foi transferida para sua carteira conectada e registrada
            na rede.
          </p>
        )}
        {isPending && (
          <p className="text-sm text-secondary">
            A transação está sendo processada na {NETWORK_LABEL[order.network]}.
            Você pode fechar esta janela e acompanhar em “Meus pedidos”.
          </p>
        )}
        {isDeclined && (
          <p className="text-sm text-secondary">
            Nenhum valor foi cobrado. Você pode tentar novamente no checkout.
          </p>
        )}

        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
          {isConfirmed && (
            <>
              <Button asChild variant="outline">
                <a
                  href={order.explorerUrl ?? "#"}
                  target="_blank"
                  rel="noreferrer"
                  aria-disabled={!order.explorerUrl}
                  onClick={(e) => {
                    if (!order.explorerUrl) e.preventDefault();
                  }}
                >
                  Ver no Etherscan
                  <ExternalLink className="ml-2 size-4" aria-hidden />
                </a>
              </Button>
              <Button type="button" variant="ghost" onClick={goToOrders}>
                Ver meus pedidos
              </Button>
            </>
          )}

          {isPending && (
            <>
              <Button type="button" onClick={goToOrders}>
                Ver meus pedidos
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Fechar
              </Button>
            </>
          )}

          {isDeclined && (
            <>
              <Button type="button" onClick={goToCheckout}>
                Tentar novamente
              </Button>
              <Button type="button" variant="outline" onClick={goToCheckout}>
                Fechar
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
