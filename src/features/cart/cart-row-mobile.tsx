import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import type { CartItem } from "@/shared/api/types";
import { useRemoveCartItem } from "./use-remove-cart-item";
import { useUpdateCartItem } from "./use-update-cart-item";
import { formatEth } from "./format-eth";

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

export function CartRowMobile({ item }: Props) {
  const { update, isPending: updating } = useUpdateCartItem();
  const { remove, isPending: removing } = useRemoveCartItem();
  const max = item.maxAvailable >= 9999 ? 9999 : Math.max(1, item.maxAvailable);

  const lineTotal = multiplyEth(item.unitPriceEth, item.quantity);

  return (
    <li className="flex gap-3 bg-surface-card sm:flex-row sm:items-center sm:gap-[62px] relative rounded-lg">
      <div className="flex items-center sm:w-[250px] sm:flex-none">
        <div className="mr-4 size-25 shrink-0 overflow-hidden rounded-md bg-surface-card">
          <img
            src={item.imageUrl}
            alt={item.name}
            className="size-full object-cover"
            loading="lazy"
            width={100}
            height={100}
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-bold text-foreground">
            {item.name}
          </p>
          <p className="truncate text-sm text-secondary">
            ID do token: {item.tokenId}
          </p>
          <p className="text-lg font-bold text-accent">
            {formatEth(lineTotal)} ETH
          </p>
        </div>
      </div>
      <div className="flex w-full items-center gap-2 sm:w-[80px] sm:flex-none">
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
          className="h-[24px] w-[24px] rounded-full! bg-surface-raised! border-border"
        >
          <Minus className="size-3 text-foreground" aria-hidden="true" />
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
          className="h-10 w-5 border-none bg-transparent! p-0 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
          className="h-[24px] w-[24px] rounded-full! bg-surface-raised! border-border"
        >
          <Plus className="size-3 text-foreground" aria-hidden="true" />
        </Button>
      </div>
      {/* Excluir */}
      <div className="absolute flex justify-end sm:w-10 sm:flex-none -top-3 right-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={`Remover ${item.name} do carrinho`}
          disabled={removing}
          onClick={() =>
            void remove({ nftId: item.nftId, editionId: item.editionId })
          }
          className="text-muted-foreground w-[30px] h-[30px] bg-surface-raised border-border rounded-full"
        >
          <Trash2 className="size-4 text-foreground" aria-hidden="true" />
        </Button>
      </div>
    </li>
  );
}
