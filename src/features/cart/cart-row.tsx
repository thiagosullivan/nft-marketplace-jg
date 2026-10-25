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

export function CartRow({ item }: Props) {
  const { update, isPending: updating } = useUpdateCartItem();
  const { remove, isPending: removing } = useRemoveCartItem();
  const max = item.maxAvailable >= 9999 ? 9999 : Math.max(1, item.maxAvailable);

  const lineTotal = multiplyEth(item.unitPriceEth, item.quantity);

  return (
    <li className="flex flex-col gap-4 bg-surface-card sm:flex-row sm:items-center sm:gap-[62px]">
      {/* NFT: imagem + nome/id */}
      <div className="flex w-full items-center sm:w-[250px] sm:flex-none">
        <div className="mr-4 size-17.5 shrink-0 overflow-hidden rounded-md bg-surface-card">
          <img
            src={item.imageUrl}
            alt={item.name}
            className="size-full object-cover"
            loading="lazy"
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-bold text-foreground">
            {item.name}
          </p>
          <p className="truncate text-sm text-secondary">
            ID do token: {item.tokenId}
          </p>
        </div>
      </div>

      {/* Preço */}
      <div className="flex w-full items-center gap-x-2 text-base font-bold text-secondary sm:w-[80px] sm:flex-none">
        <p className="text-base text-secondary sm:hidden">Preço</p>
        <p>{formatEth(item.unitPriceEth)}</p>
        <p>ETH</p>
      </div>

      {/* Edições / quantidade */}
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
          className="h-[30px] w-[20px] rounded-full! bg-primary!"
        >
          <Minus className="size-3 text-black" aria-hidden="true" />
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
          className="h-[30px] w-[20px] rounded-full! bg-primary!"
        >
          <Plus className="size-3 text-black" aria-hidden="true" />
        </Button>
      </div>

      {/* Total */}
      <div className="w-full text-base font-semibold text-accent sm:w-[80px] sm:flex-none sm:text-right">
        <p className="text-xs text-muted-foreground sm:hidden">Total</p>
        {formatEth(lineTotal)} ETH
      </div>

      {/* Excluir */}
      <div className="flex justify-end sm:w-10 sm:flex-none">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={`Remover ${item.name} do carrinho`}
          disabled={removing}
          onClick={() =>
            void remove({ nftId: item.nftId, editionId: item.editionId })
          }
          className="text-muted-foreground"
        >
          <Trash2 className="size-4" aria-hidden="true" />
        </Button>
      </div>
    </li>
  );
}
