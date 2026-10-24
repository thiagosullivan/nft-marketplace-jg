import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Separator } from "@/shared/components/ui/separator";
import type { Cart } from "@/shared/api/types";
import { useSession } from "@/features/auth/use-auth";
import { useAuthModal } from "@/features/auth/auth-modal-provider";
import { useQuote } from "./use-quote";

type Props = {
  cart: Cart;
};

function computeSubtotal(cart: Cart): string {
  const cents = cart.items.reduce((acc, item) => {
    const unit = Math.round(Number(item.unitPriceEth) * 100);
    return acc + unit * item.quantity;
  }, 0);
  return (cents / 100).toFixed(2);
}

export function CartSummary({ cart }: Props) {
  const { data: session } = useSession();
  const { open } = useAuthModal();
  const navigate = useNavigate();
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | undefined>(
    undefined,
  );

  const quote = useQuote({ couponCode: appliedCoupon });

  const subtotal = session ? quote.data?.subtotalEth : computeSubtotal(cart);
  const discount = quote.data?.discountEth;
  const networkFee = quote.data?.networkFeeEth;
  const total = session ? quote.data?.totalEth : computeSubtotal(cart);

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
      className="w-full rounded-md border border-border bg-surface-card p-6 lg:sticky lg:top-24"
    >
      <h2 id="cart-summary-title" className="text-xl font-bold text-foreground">
        Resumo da compra
      </h2>
      <Separator className="my-4" />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          setAppliedCoupon(couponInput.trim() || undefined);
        }}
        className="space-y-2"
      >
        <label
          htmlFor="cart-coupon"
          className="text-sm font-medium text-foreground"
        >
          Código promocional
        </label>
        <div className="flex gap-2">
          <Input
            id="cart-coupon"
            type="text"
            value={couponInput}
            onChange={(e) => setCouponInput(e.target.value)}
            placeholder="Digite o cupom"
            className="h-10"
          />
          <Button type="submit" variant="outline" className="h-10">
            Aplicar
          </Button>
        </div>
        {quote.isError && (
          <p className="text-xs text-destructive" role="alert">
            Cupom inválido ou expirado.
          </p>
        )}
        {quote.data?.coupon && (
          <p className="text-xs text-success">
            Cupom {quote.data.coupon.code} aplicado.
          </p>
        )}
      </form>

      <Separator className="my-4" />

      <dl className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <dt className="text-muted-foreground">Subtotal</dt>
          <dd className="text-foreground">{subtotal ?? "—"} ETH</dd>
        </div>

        {discount && (
          <div className="flex items-center justify-between">
            <dt className="text-muted-foreground">Desconto do lançamento</dt>
            <dd className="text-success">−{discount} ETH</dd>
          </div>
        )}

        <div className="flex items-center justify-between">
          <dt className="text-muted-foreground">Taxa de rede</dt>
          <dd className="text-foreground">{networkFee ?? "—"} ETH</dd>
        </div>

        <Separator className="my-2" />

        <div className="flex items-center justify-between text-base font-semibold">
          <dt className="text-foreground">Total</dt>
          <dd className="text-foreground">{total ?? "—"} ETH</dd>
        </div>
      </dl>

      <div className="mt-6 space-y-2">
        <Button
          type="button"
          onClick={onFinalize}
          className="min-h-11 w-full"
          disabled={cart.items.length === 0}
        >
          {session ? "Finalizar" : "Conectar e finalizar"}
        </Button>
        <Button asChild variant="outline" className="min-h-11 w-full">
          <Link to="/">Continuar explorando</Link>
        </Button>
      </div>
    </aside>
  );
}
