import type { Cart } from "@/shared/api/types";
import { CartRowMobile } from "./cart-row-mobile";

type Props = {
  cart: Cart;
};

export function CartTableMobile({ cart }: Props) {
  return (
    <div className="">
      <ul aria-label="Itens do carrinho" className="space-y-5 pt-3">
        {cart.items.map((item) => (
          <CartRowMobile
            key={`${item.nftId}:${item.editionId ?? "none"}`}
            item={item}
          />
        ))}
      </ul>
    </div>
  );
}
