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
    <aside className="w-full rounded-md border border-border bg-surface-card p-6 lg:sticky lg:top-24">
      <h2 className="text-xl font-bold text-foreground">Resumo</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Revise os itens e confirme a compra.
      </p>
      <Separator className="my-4" />

      <ul className="space-y-3" aria-label="Itens da compra">
        {cart.items.map((item) => (
          <li
            key={`${item.nftId}:${item.editionId ?? "none"}`}
            className="flex items-center gap-3"
          >
            <img
              src={item.imageUrl}
              alt={item.name}
              className="size-14 shrink-0 rounded-md object-cover"
              loading="lazy"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">
                {item.name}
              </p>
              <p className="text-xs text-muted-foreground">
                ID do token: {item.tokenId}
              </p>
            </div>
            <div className="text-xs text-muted-foreground">
              x{item.quantity}
            </div>
            <div className="text-sm font-semibold text-foreground">
              {formatEth(lineTotalEth(item))} ETH
            </div>
          </li>
        ))}
      </ul>

      <Separator className="my-4" />

      {!couponOpen ? (
        <button
          type="button"
          className="text-sm font-medium text-accent hover:underline"
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
          <div className="flex gap-2">
            <Input
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value)}
              placeholder="Digite o cupom"
              className="h-10"
            />
            <Button type="submit" variant="outline" className="h-10">
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

      <Separator className="my-4" />

      <dl className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <dt className="text-muted-foreground">Subtotal</dt>
          <dd className="text-foreground">{formatEth(subtotal)} ETH</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-muted-foreground">Desconto do lançamento</dt>
          <dd className="text-foreground">(−) {formatEth(discount ?? "0")}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-muted-foreground">Taxa de rede</dt>
          <dd className="text-foreground">{formatEth(networkFee)} ETH</dd>
        </div>
        <p className="ml-auto text-xs text-accent">Taxa estimada</p>
        <Separator className="my-2" />
        <div className="flex items-center justify-between text-base font-semibold">
          <dt className="text-foreground">Total</dt>
          <dd className="text-accent">{formatEth(total)} ETH</dd>
        </div>
      </dl>

      <Separator className="my-4" />

      <fieldset>
        <legend className="mb-2 text-sm font-bold text-foreground">
          Carteira e rede
        </legend>
        <div role="radiogroup" className="space-y-2">
          {wallets.map((w) => (
            <label
              key={w.id}
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-md border px-3 py-2 text-sm",
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
                className="sr-only"
                aria-label={`${w.label} (${w.walletType})`}
              />
              <span className="font-semibold">{w.label}</span>
              <span className="text-xs">{w.walletType}</span>
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
