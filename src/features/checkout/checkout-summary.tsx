import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Separator } from "@/shared/components/ui/separator";
import type { Cart, Wallet } from "@/shared/api/types";
import { useQuote } from "@/features/cart";
import { formatEth, sumEth } from "@/features/cart/format-eth";
import { cn } from "@/shared/lib/utils";

type Props = {
  cart: Cart;
  appliedCoupon?: string;
  onApplyCoupon: (code: string | undefined) => void;
  wallets: Wallet[];
  selectedWalletId: string | null;
  onSelectWallet: (id: string) => void;
  onConfirm: () => void;
  confirming?: boolean;
};

function lineTotalEth(item: Cart["items"][number]): string {
  const cents = Math.round(Number(item.unitPriceEth) * 100);
  return ((cents * item.quantity) / 100).toFixed(2);
}

function computeSubtotal(cart: Cart): string {
  return sumEth(cart.items.map(lineTotalEth));
}

export function CheckoutSummary({
  cart,
  appliedCoupon,
  onApplyCoupon,
  wallets,
  selectedWalletId,
  onSelectWallet,
  onConfirm,
  confirming,
}: Props) {
  const quote = useQuote({ couponCode: appliedCoupon, cart });
  const [couponOpen, setCouponOpen] = useState(false);
  const [couponInput, setCouponInput] = useState("");

  const subtotal = quote.effective?.subtotalEth ?? computeSubtotal(cart);
  const discount = quote.effective?.discountEth;
  const networkFee = quote.effective?.networkFeeEth;
  const total = quote.effective?.totalEth ?? computeSubtotal(cart);

  return (
    <aside className="w-full lg:sticky lg:top-24">
      <h2 className="text-[17px] font-bold text-foreground mb-3">Seus NFTs</h2>
      <div className="flex justify-between text-foreground text-base font-bold">
        <p>NFTs</p>
        <p>Subtotal</p>
      </div>
      <Separator className="my-3" />

      <ul className="space-y-3 mb-3" aria-label="Itens da compra">
        {cart.items.map((item) => (
          <li
            key={`${item.nftId}:${item.editionId ?? "none"}`}
            className="flex items-center gap-2 bg-surface-card pl-1 pr-2.5"
          >
            <img
              src={item.imageUrl}
              alt={item.name}
              className="size-17.5 shrink-0 rounded-md object-cover"
              loading="lazy"
              width={70}
              height={70}
            />
            <div className="min-w-0">
              <p className="truncate text-base font-bold text-foreground mb-1">
                {item.name}
              </p>
              <p className="text-sm font-normal text-secondary">
                ID do token: {item.tokenId}
              </p>
            </div>
            <div className="text-sm text-secondary mr-2 flex-1">
              (x{item.quantity})
            </div>
            <div className="text-lg font-bold text-accent text-nowrap">
              {formatEth(lineTotalEth(item))} ETH
            </div>
          </li>
        ))}
      </ul>

      {/* <Separator className="my-4" /> */}

      {!couponOpen ? (
        <button
          type="button"
          className="text-sm font-medium text-foreground hover:underline w-full text-center"
          onClick={() => setCouponOpen(true)}
        >
          Tem um código promocional? Aplique aqui
        </button>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onApplyCoupon(couponInput.trim() || undefined);
          }}
          className="space-y-2"
        >
          <div className="flex">
            <Input
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value)}
              placeholder="Digite o cupom"
              className="h-10 border-border rounded-xs bg-transparent! bg-transparent! text-xs font-normal outline-none! focus:outline-none! focus-visible:outline-none! focus-visible:ring-0! focus-visible:ring-offset-0! focus-visible:border-primary!"
            />
            <Button
              type="submit"
              variant="outline"
              className="py-3 px-5 h-10 border-border rounded-xs bg-primary! text-[15px] font-bold text-ink"
            >
              Aplicar
            </Button>
          </div>
          {quote.couponError && (
            <p className="text-xs text-destructive" role="alert">
              Cupom inválido ou expirado.
            </p>
          )}
          {!quote.couponError && quote.coupon?.coupon && (
            <p className="text-xs text-success">
              Cupom {quote.coupon.coupon.code} aplicado.
            </p>
          )}
        </form>
      )}

      {/* <Separator className="my-4" /> */}

      <dl className="text-sm mt-3">
        <div className="space-y-2 mb-3">
          <div className="flex items-center justify-between text-foreground">
            <dt className="text-[15px] font-normal">Subtotal</dt>
            <dd className="text-lg font-normal">{formatEth(subtotal)} ETH</dd>
          </div>
          <div className="flex items-center justify-between text-foreground">
            <dt className="text-[15px] font-normal">Desconto do lançamento</dt>
            <dd className="text-lg font-normal">
              (−) {formatEth(discount ?? "0")}
            </dd>
          </div>
          <div className="flex items-center justify-between text-foreground">
            <dt className="text-[15px] font-normal">Taxa de rede</dt>
            <dd className="text-lg font-normal">{formatEth(networkFee)} ETH</dd>
          </div>
        </div>
        <p className="w-full text-xs text-accent text-center">Taxa estimada</p>
        <Separator className="my-2" />
        <div className="flex items-center justify-between font-bold">
          <dt className="text-base text-foreground">Total</dt>
          <dd className="text-accent text-lg">{formatEth(total)} ETH</dd>
        </div>
      </dl>

      <Separator className="my-4" />

      <fieldset>
        <legend className="mb-5 text-[17px] font-bold text-foreground text-center">
          Carteira e rede
        </legend>
        <div role="radiogroup" className="space-y-4">
          {wallets.map((w) => (
            <label
              key={w.id}
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-xs border px-3 py-2 text-sm",
                w.id === selectedWalletId
                  ? "border-primary text-foreground"
                  : "border-border text-muted-foreground hover:border-primary/60",
              )}
            >
              <input
                type="radio"
                name="wallet"
                value={w.id}
                checked={w.id === selectedWalletId}
                onChange={() => onSelectWallet(w.id)}
                className="peer sr-only"
                aria-label={`${w.label} (${w.walletType})`}
              />
              <span
                aria-hidden="true"
                className="flex size-4 items-center justify-center rounded-full border border-primary bg-transparent peer-focus-visible:ring-2 peer-focus-visible:ring-primary peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background peer-checked:[&>span]:block"
              >
                <span className="hidden size-2.5 rounded-full bg-primary" />
              </span>
              <span className="font-semibold">{w.label}</span>
              {/* <span className="text-xs">{w.walletType}</span> */}
              <span className="ml-auto text-xs capitalize">{w.network}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <Button
        type="button"
        onClick={onConfirm}
        disabled={confirming || cart.items.length === 0 || !selectedWalletId}
        className="mt-6 min-h-11 w-full"
      >
        {confirming ? "Processando…" : "Confirmar compra"}
      </Button>
    </aside>
  );
}
