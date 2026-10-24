import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import type { CartItem } from "@/shared/api/types";
import { useRemoveCartItem } from "./use-remove-cart-item";
import { useUpdateCartItem } from "./use-update-cart-item";

type Props = {
  item: CartItem;
};

function clamp(n: number, min: number, max: number): number {
  if (Number.isNaN(n)) return min;
  return Math.min(max, Math.max(min, Math.trunc(n)));
}

function multiplyEth(priceEth: string, quantity: number): string {
  const cents = Math.round(Number(priceEth) * 100);
  if (!Number.isFinite(cents)) return "0.00";
  return ((cents * quantity) / 100).toFixed(2);
}

export function CartRow({ item }: Props) {
  const { update, isPending: updating } = useUpdateCartItem();
  const { remove, isPending: removing } = useRemoveCartItem();
  const max = item.maxAvailable >= 9999 ? 9999 : Math.max(1, item.maxAvailable);

  const lineTotal = multiplyEth(item.unitPriceEth, item.quantity);

  return (
    <li className="grid grid-cols-1 gap-4 border-b border-border py-4 sm:grid-cols-[80px_minmax(0,1fr)_auto_auto_auto_auto] sm:items-center">
      <div className="size-20 overflow-hidden rounded-md bg-surface-card">
        <img
          src={item.imageUrl}
          alt={item.name}
          className="size-full object-cover"
          loading="lazy"
        />
      </div>

      <div className="min-w-0">
        <p className="truncate text-base font-medium text-foreground">
          {item.name}
        </p>
        <p className="text-xs text-muted-foreground">
          Token {item.tokenId}
          {item.editionLabel ? ` · Edição ${item.editionLabel}` : ""}
        </p>
      </div>

      <div className="text-sm text-foreground sm:text-right">
        <p className="text-xs text-muted-foreground sm:hidden">Preço</p>
        {item.unitPriceEth} ETH
      </div>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Diminuir quantidade"
          disabled={updating || item.quantity <= 1}
          onClick={() =>
            void update({
              nftId: item.nftId,
              editionId: item.editionId,
              quantity: clamp(item.quantity - 1, 1, max),
            })
          }
          className="size-9"
        >
          <Minus className="size-4" aria-hidden="true" />
        </Button>
        <Input
          type="number"
          inputMode="numeric"
          min={1}
          max={max}
          value={item.quantity}
          aria-label={`Quantidade de ${item.name}`}
          onChange={(e) =>
            void update({
              nftId: item.nftId,
              editionId: item.editionId,
              quantity: clamp(Number(e.target.value), 1, max),
            })
          }
          className="h-9 w-16 text-center"
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Aumentar quantidade"
          disabled={updating || item.quantity >= max}
          onClick={() =>
            void update({
              nftId: item.nftId,
              editionId: item.editionId,
              quantity: clamp(item.quantity + 1, 1, max),
            })
          }
          className="size-9"
        >
          <Plus className="size-4" aria-hidden="true" />
        </Button>
      </div>

      <div className="text-sm font-semibold text-foreground sm:text-right">
        <p className="text-xs text-muted-foreground sm:hidden">Total</p>
        {lineTotal} ETH
      </div>

      <div className="flex justify-end">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={`Remover ${item.name} do carrinho`}
          disabled={removing}
          onClick={() =>
            void remove({ nftId: item.nftId, editionId: item.editionId })
          }
          className="text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="size-4" aria-hidden="true" />
        </Button>
      </div>
    </li>
  );
}
