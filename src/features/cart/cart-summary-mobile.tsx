import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import type { Cart } from "@/shared/api/types";
import { useSession } from "@/features/auth/use-auth";
import { useAuthModal } from "@/features/auth/auth-modal-provider";
import { useQuote } from "./use-quote";
import { formatEth, sumEth } from "./format-eth";

type Props = {
  cart: Cart;
};

function lineTotalEth(item: Cart["items"][number]): string {
  const cents = Math.round(Number(item.unitPriceEth) * 100);
  return ((cents * item.quantity) / 100).toFixed(2);
}

function computeSubtotal(cart: Cart): string {
  return sumEth(cart.items.map(lineTotalEth));
}

export function CartSummaryMobile({ cart }: Props) {
  const { data: session } = useSession();
  const { open } = useAuthModal();
  const navigate = useNavigate();
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | undefined>(
    undefined,
  );

  const quote = useQuote({ couponCode: appliedCoupon, cart });

  const subtotal = session
    ? quote.effective?.subtotalEth
    : computeSubtotal(cart);
  const discount = quote.effective?.discountEth;
  const networkFee = quote.effective?.networkFeeEth;
  const total = session ? quote.effective?.totalEth : computeSubtotal(cart);

  const onFinalize = () => {
    if (!session) {
      open("login", "/checkout");
      return;
    }
    void navigate({ to: "/checkout" });
  };

  return (
    <aside
      aria-labelledby="cart-summary-title"
      className="fixed bottom-0 left-0 lg:top-24 bg-surface-raised rounded-4xl z-20 shadow-md w-full"
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setAppliedCoupon(couponInput.trim() || undefined);
        }}
        className="space-y-2 pt-6 px-6"
      >
        <div className="flex relative h-12.5 mb-3">
          <Input
            id="cart-coupon"
            type="text"
            value={couponInput}
            onChange={(e) => setCouponInput(e.target.value)}
            placeholder="Digite o cupom promocional..."
            className="h-12.5 rounded-full text-sm bg-surface-card! border-border!"
          />
          <Button
            type="submit"
            variant="outline"
            className="bg-primary! rounded-full h-12.5 absolute right-0"
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
      <dl className="space-y-3 mb-6 px-6">
        <div className="flex items-center justify-between text-foreground">
          <dt className="text-[15px] font-normal">Subtotal</dt>
          <dd className="text-base font-normal">{formatEth(subtotal)} ETH</dd>
        </div>

        <div className="flex items-center justify-between text-foreground">
          <dt className="text-[15px] font-normal">Desconto do lançamento</dt>
          <dd className="text-base font-normal">
            (−) {formatEth(discount ?? "0")}
          </dd>
        </div>

        <div className="flex flex-col gap-y-1 mb-6">
          <div className="flex items-center justify-between text-foreground">
            <dt className="text-[15px] font-normal">Taxa de rede</dt>
            <dd className="text-base font-normal">
              {formatEth(networkFee)} ETH
            </dd>
          </div>
          <p className="text-accent text-xs font-normal ml-auto">
            Taxa estimada
          </p>
        </div>

        <div className="flex items-center justify-between text-base font-semibold">
          <dt className="text-foreground text-base font-bold">Total</dt>
          <dd className="text-accent text-lg font-bold">
            {formatEth(total)} ETH
          </dd>
        </div>
      </dl>
      <div className="my-6 space-y-2 flex justify-center">
        <Button
          type="button"
          onClick={onFinalize}
          className="min-h-15 w-11/12 rounded-full text-ink font-bold text-[15px]"
          disabled={cart.items.length === 0}
        >
          {session ? "Finalizar" : "Conectar e finalizar"}
        </Button>
      </div>
    </aside>
  );
}
