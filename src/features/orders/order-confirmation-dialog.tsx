import { Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import type { Order } from "@/shared/api/types";
import { formatEth } from "@/features/cart/format-eth";
import { OrderStatusBadge } from "./order-status-badge";
import { OrderTransactionTable } from "./order-transaction-table";
import { formatOrderDate, truncateTxHash } from "./format-order-date";

type Props = {
  order: Order;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const NETWORK_LABEL: Record<Order["network"], string> = {
  ethereum: "Ethereum",
  polygon: "Polygon",
  solana: "Solana",
};

export function OrderConfirmationDialog({ order, open, onOpenChange }: Props) {
  const navigate = useNavigate();
  const isPending = order.status === "pending";
  const isConfirmed = order.status === "confirmed";
  const isDeclined = order.status === "declined";

  const goToCheckout = () => navigate({ to: "/checkout" });
  const goToOrders = () => navigate({ to: "/orders" });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-145! w-full pt-5.5! pb-0! px-0! gap-0 bg-surface-card text-foreground rounded-none border-x-0 border-t-0 border-b-10 border-b-primary"
        aria-describedby={undefined}
      >
        <DialogHeader className="items-center text-center">
          <img src="/icons/thank-you-icon.png" className="w-18 h-18 mb-3" />

          <DialogTitle className="text-base font-bold text-secondary">
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

        <dl className="px-1 flex items-center justify-center border-t border-b border-primary my-5.5 py-3 text-secondary">
          <div className="flex items-center gap-x-4.5 text-secondary">
            <div>
              <dt className="text-sm tracking-wide">ID da transação</dt>
              <dd className="text-[15px]">
                {truncateTxHash(order.transactionRef)}
              </dd>
            </div>
            <div className="w-px bg-primary block h-10 mr-4.5 text-secondary" />
          </div>
          <div className="flex items-center gap-x-4.5">
            <div>
              <dt className="text-sm tracking-wide">Data</dt>
              <dd className="text-[15px]">
                {formatOrderDate(order.createdAt) ?? "——"}
              </dd>
            </div>
            <div className="w-px bg-primary block h-10 mr-4.5 text-secondary" />
          </div>
          <div className="flex items-center gap-x-4.5">
            <div>
              <dt className="text-sm tracking-wide">Total</dt>
              <dd className="text-[15px]">{formatEth(order.totalEth)} ETH</dd>
            </div>
            <div className="w-px bg-primary block h-10 mr-4.5 text-secondary" />
          </div>
          <div className="flex flex-col">
            <dt className="text-sm tracking-wide">Carteira</dt>
            <dd className="text-[15px]">{order.walletLabel}</dd>
          </div>
        </dl>

        {!isConfirmed && (
          <div className="mb-3 flex justify-center">
            <OrderStatusBadge status={order.status} className="text-base" />
          </div>
        )}

        {/* <Separator className="my-4" /> */}

        <OrderTransactionTable order={order} />
        <div className="max-w-[490px] w-full mx-auto text-center">
          {isConfirmed && (
            <p className="text-sm text-secondary">
              Transação confirmada na {NETWORK_LABEL[order.network]}. A
              propriedade foi transferida para sua carteira conectada e
              registrada na rede.
            </p>
          )}
          {isPending && (
            <p className="text-sm text-secondary">
              A transação está sendo processada na{" "}
              {NETWORK_LABEL[order.network]}. Você pode fechar esta janela e
              acompanhar em “Meus pedidos”.
            </p>
          )}
          {isDeclined && (
            <p className="text-sm text-secondary">
              Nenhum valor foi cobrado. Você pode tentar novamente no checkout.
            </p>
          )}
        </div>

        <div className="mt-5 flex flex-col gap-2 sm:justify-center">
          {isConfirmed && (
            <>
              <Button asChild variant="default">
                <a
                  href={order.explorerUrl ?? "#"}
                  target="_blank"
                  rel="noreferrer"
                  aria-disabled={!order.explorerUrl}
                  onClick={(e) => {
                    if (!order.explorerUrl) e.preventDefault();
                  }}
                  className="rounded-xs text-base text-ink font-bold block w-[185px] h-[50px] mx-auto"
                >
                  Ver no Etherscan
                </a>
              </Button>
              <Button
                asChild
                type="button"
                variant="link"
                onClick={goToOrders}
                className="rounded-xs text-base text-primary font-bold block w-[185px] h-[50px] mx-auto"
              >
                <Link to="/orders">Ver meus pedidos</Link>
              </Button>
            </>
          )}

          {isPending && (
            <>
              <Button
                asChild
                type="button"
                variant="link"
                onClick={goToOrders}
                className="rounded-xs text-base text-primary font-bold block w-[185px] h-[40px] mx-auto"
              >
                <Link to="/orders">Ver meus pedidos</Link>
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="rounded-xs text-base text-primary font-bold w-[185px] h-[40px] mx-auto mb-4 bg-transparent! flex justify-center items-center hover:text-foreground! cursor-pointer"
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
