import { Separator } from "@/shared/components/ui/separator";
import type { Order, OrderItem } from "@/shared/api/types";
import { formatEth } from "@/features/cart/format-eth";

function lineTotalEth(item: OrderItem): string {
  const cents = Math.round(Number(item.unitPriceEth) * 100);
  return ((cents * item.quantity) / 100).toFixed(2);
}

export function OrderTransactionTable({ order }: { order: Order }) {
  return (
    <section aria-labelledby="order-transaction-details" className="mb-3 px-11">
      <h2
        id="order-transaction-details"
        className="text-[15px] font-bold text-foreground"
      >
        Detalhes da transação
      </h2>

      <div className="mt-3">
        <div className="grid grid-cols-[265px_auto_auto] items-center gap-2 text-base font-bold text-foreground">
          <p>NFTs</p>
          <p className="text-right">Edições</p>
          <p className="text-right">Subtotal</p>
        </div>

        <Separator className="my-2 bg-primary/30!" />

        <ul className="space-y-3 mb-3" aria-label="Itens da transação">
          {order.items.map((item) => (
            <li
              key={`${item.nftId}:${item.editionId ?? "none"}`}
              className="grid grid-cols-[265px_auto_auto] items-center gap-2 bg-surface-card pl-1 pr-2.5"
            >
              <div className="flex items-center gap-x-3">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="size-17.5 shrink-0 rounded-md object-cover"
                  loading="lazy"
                  width={70}
                  height={70}
                />
                <div className="min-w-0 max-w-[180px] w-full">
                  <p className="truncate text-base font-bold text-foreground">
                    {item.name}
                  </p>
                  <p className="text-sm font-normal text-secondary">
                    ID do token: {item.tokenId}
                  </p>
                </div>
              </div>
              <div className="text-right text-secondary text-sm font-normal">
                (x {item.quantity})
              </div>
              <p className="text-right text-lg font-bold text-accent text-nowrap">
                {formatEth(lineTotalEth(item))} ETH
              </p>
            </li>
          ))}
        </ul>

        <dl className="text-sm space-y-2 flex flex-col items-end">
          <div className="flex items-center justify-between text-foreground max-w-[320px] w-full">
            <dt className="text-[15px] font-normal">Taxa de rede</dt>
            <dd className="text-lg font-normal">
              {formatEth(order.networkFeeEth)} ETH
            </dd>
          </div>
          <div className="flex items-center justify-between text-foreground max-w-[320px] w-full">
            <dt className="text-[15px] font-bold">Total</dt>
            <dd className="text-accent text-lg font-bold">
              {formatEth(order.totalEth)} ETH
            </dd>
          </div>
        </dl>
        <Separator className="my-3 bg-primary/30!" />
      </div>
    </section>
  );
}
