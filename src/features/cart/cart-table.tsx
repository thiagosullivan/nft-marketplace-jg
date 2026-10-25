import type { Cart } from "@/shared/api/types";
import { CartRow } from "./cart-row";

type Props = {
  cart: Cart;
};

export function CartTable({ cart }: Props) {
  return (
    <div className="w-full">
      <div
        aria-hidden="true"
        className="hidden gap-[62px] border-b border-border pb-3 text-xs uppercase tracking-wide text-muted-foreground sm:flex sm:items-center"
      >
        <span className="w-[250px] flex-none text-left">NFTs</span>
        <span className="w-[80px] flex-none text-left">Preço</span>
        <span className="w-[80px] flex-none text-left">Edições</span>
        <span className="w-[80px] flex-none text-left">Total</span>
        <span className="w-10 flex-none" />
      </div>
      <ul aria-label="Itens do carrinho" className="space-y-3 pt-3">
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
