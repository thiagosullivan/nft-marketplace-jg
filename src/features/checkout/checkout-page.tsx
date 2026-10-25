import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { http } from "@/shared/api";
import type { Profile, Wallet } from "@/shared/api/types";
import { profileKeys } from "@/shared/api/query-keys";
import { Button } from "@/shared/components/ui/button";
import { useCart, useQuote } from "@/features/cart";
import { useSession } from "@/features/auth/use-auth";
import { CheckoutForm, type CheckoutFormValues } from "./checkout-form";
import { CheckoutSummary } from "./checkout-summary";
import { CheckoutWalletModal } from "./checkout-wallet-modal";
import { useCreateOrder } from "./use-create-order";
import { useCheckoutWallets } from "./use-checkout-wallets";
import { useCheckoutRevalidation } from "./use-checkout-revalidation";

const FORM_ID = "checkout-form";

function makeIdempotencyKey(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `key-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function CheckoutPage() {
  const navigate = useNavigate();
  const { data: session } = useSession();
  const { data: cart, isLoading: cartLoading } = useCart();
  const walletsQuery = useCheckoutWallets();
  const { create: createOrder, isPending: creatingOrder } = useCreateOrder();

  const profileQuery = useQuery<Profile>({
    queryKey: profileKeys.all,
    queryFn: async () => {
      const { data } = await http.get<Profile>("/profile");
      return data;
    },
    enabled: !!session,
    staleTime: 60_000,
    retry: 0,
  });

  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<string | undefined>();
  const [pendingValues, setPendingValues] = useState<CheckoutFormValues | null>(
    null,
  );
  const [pendingWallet, setPendingWallet] = useState<Wallet | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const effectiveWallets = useMemo(
    () => walletsQuery.data ?? [],
    [walletsQuery.data],
  );

  const quote = useQuote({ couponCode: appliedCoupon, cart });
  const revalidation = useCheckoutRevalidation({
    cart: cart ?? { items: [], updatedAt: new Date().toISOString() },
    couponCode: appliedCoupon,
    currentQuote: quote.effective,
  });

  useEffect(() => {
    if (!selectedWalletId && effectiveWallets.length > 0) {
      const primary =
        effectiveWallets.find((w) => w.isPrimary) ?? effectiveWallets[0];
      setSelectedWalletId(primary.id);
    }
  }, [effectiveWallets, selectedWalletId]);

  if (cartLoading || profileQuery.isLoading || walletsQuery.isLoading) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-10">
        <p className="text-sm text-muted-foreground">Carregando checkout…</p>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-10">
        <h1 className="text-2xl font-bold text-foreground">
          Seu carrinho está vazio
        </h1>
        <Button asChild className="mt-6">
          <Link to="/">Explorar NFTs</Link>
        </Button>
      </div>
    );
  }

  if (!profileQuery.data) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-10">
        <p className="text-sm text-destructive">
          Não foi possível carregar seu perfil.
        </p>
      </div>
    );
  }

  const profile = profileQuery.data;

  const onSubmit = (values: CheckoutFormValues) => {
    if (values.useNewWallet) {
      toast.error("Salve a nova carteira antes de confirmar.");
      return;
    }
    const wallet = effectiveWallets.find((w) => w.id === selectedWalletId);
    if (!wallet) {
      toast.error("Selecione uma carteira.");
      return;
    }
    setPendingValues(values);
    setPendingWallet(wallet);
    setModalOpen(true);
  };

  const confirmOrder = async (values: CheckoutFormValues, wallet: Wallet) => {
    const check = await revalidation.revalidate();
    if (check.status === "error") {
      toast.error(check.message);
      return;
    }
    if (check.status === "changed") {
      toast.error(`${check.reason} Revise e confirme novamente.`);
      return;
    }

    const idempotencyKey = makeIdempotencyKey();
    const result = await createOrder({
      quoteIssuedAt: check.quote.issuedAt,
      walletId: wallet.id,
      network: wallet.network,
      couponCode: appliedCoupon,
      note: values.note?.trim() ? values.note.trim() : undefined,
      idempotencyKey,
    });

    if (result.kind === "created") {
      toast.success("Pedido criado.");
      void navigate({ to: "/order/$id", params: { id: result.order.id } });
      return;
    }
    if (result.kind === "conflict") {
      toast.error(result.message);
    }
  };

  const onModalConnected = () => {
    if (!pendingValues || !pendingWallet) return;
    setModalOpen(false);
    void confirmOrder(pendingValues, pendingWallet);
  };

  return (
    <div className="container mx-auto max-w-300 pt-10 pb-24">
      <div className="mb-8 text-foreground text-[15px] font-bold">
        <Link to="/">Início /</Link>
        <Link to="/"> Mercado /</Link>
        <Link to="/"> Pagamento</Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_405px]">
        <div>
          <h3 className="text-foreground text-[17px] font-bold mb-3">
            Perfil do colecionador
          </h3>
          <CheckoutForm
            profile={profile}
            wallets={effectiveWallets}
            selectedWalletId={selectedWalletId}
            onSelectedWalletChange={setSelectedWalletId}
            onNewWalletSaved={(wallet) => setSelectedWalletId(wallet.id)}
            onSubmit={onSubmit}
            formId={FORM_ID}
          />
        </div>

        <CheckoutSummary
          cart={cart}
          appliedCoupon={appliedCoupon}
          onApplyCoupon={setAppliedCoupon}
          wallets={effectiveWallets}
          selectedWalletId={selectedWalletId}
          onSelectWallet={setSelectedWalletId}
          onConfirm={() => {
            const form = document.getElementById(
              FORM_ID,
            ) as HTMLFormElement | null;
            form?.requestSubmit();
          }}
          confirming={creatingOrder}
        />
      </div>

      <CheckoutWalletModal
        open={modalOpen}
        wallet={pendingWallet}
        onCancel={() => {
          setModalOpen(false);
          setPendingValues(null);
          setPendingWallet(null);
        }}
        onConnected={onModalConnected}
      />
    </div>
  );
}
