import type { Cart, Wallet } from "@/shared/api/types";
import { Button } from "@/shared/components/ui/button";
import { useQuote } from "@/features/cart";
import { formatEth, sumEth } from "@/features/cart/format-eth";
import { cn } from "@/shared/lib/utils";

const FORM_ID = "checkout-form";

type Props = {
  cart: Cart;
  appliedCoupon?: string;
  onApplyCoupon: (code: string | undefined) => void;
  wallets: Wallet[];
  selectedWalletId: string | null;
  onSelectWallet: (id: string) => void;
  confirming?: boolean;
};

function lineTotalEth(item: Cart["items"][number]): string {
  const cents = Math.round(Number(item.unitPriceEth) * 100);
  return ((cents * item.quantity) / 100).toFixed(2);
}

function computeSubtotal(cart: Cart): string {
  return sumEth(cart.items.map(lineTotalEth));
}

export function CheckoutWalletMobiles({
  cart,
  appliedCoupon,
  wallets,
  selectedWalletId,
  onSelectWallet,
  confirming,
}: Props) {
  const quote = useQuote({ couponCode: appliedCoupon, cart });
  const total = quote.effective?.totalEth ?? computeSubtotal(cart);

  const onConfirm = () => {
    const form = document.getElementById(FORM_ID) as HTMLFormElement | null;
    form?.requestSubmit();
  };

  return (
    <div className="mt-6 space-y-4">
      <fieldset className="px-7 mb-20">
        <legend className="mb-4 text-base font-bold text-foreground text-left">
          Carteira e rede
        </legend>
        <div role="radiogroup" className="space-y-4">
          {wallets.map((w) => (
            <label
              key={w.id}
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-md border px-3 py-2 text-sm bg-surface-card min-h-[65px]",
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
              <span className="ml-auto text-xs capitalize">{w.network}</span>
            </label>
          ))}
        </div>
        <div className="flex items-center justify-end gap-x-7 font-bold mt-4">
          <dt className="text-base text-foreground">Total:</dt>
          <dd className="text-accent text-lg">{formatEth(total)} ETH</dd>
        </div>
      </fieldset>

      <div className="px-6">
        <Button
          type="button"
          onClick={onConfirm}
          disabled={confirming || cart.items.length === 0 || !selectedWalletId}
          className="min-h-15 w-full rounded-full text-ink font-bold text-[15px]"
        >
          {confirming ? "Processando…" : "Confirmar compra"}
        </Button>
      </div>
    </div>
  );
}

export default CheckoutWalletMobiles;
