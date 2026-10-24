import type { Cart } from "@/shared/api/types";
import { CartRow } from "./cart-row";

type Props = {
  cart: Cart;
};

export function CartTable({ cart }: Props) {
  return (
    <div className="w-full">
      <div className="hidden grid-cols-[80px_minmax(0,1fr)_auto_auto_auto_auto] gap-4 border-b border-border pb-3 text-xs uppercase tracking-wide text-muted-foreground sm:grid">
        <span aria-hidden="true" />
        <span>Produto</span>
        <span className="text-right">Preço</span>
        <span>Quantidade</span>
        <span className="text-right">Total</span>
        <span className="text-right">Excluir</span>
      </div>
      <ul aria-label="Itens do carrinho">
        {cart.items.map((item) => (
          <CartRow
            key={`${item.nftId}:${item.editionId ?? "none"}`}
            item={item}
          />
        ))}
      </ul>
    </div>
  );
}
