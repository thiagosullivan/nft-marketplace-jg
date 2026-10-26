import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useSession } from "@/features/auth/use-auth";
import { useCart } from "./use-cart";
import { useMergeCart } from "./use-merge-cart";
import { CartTable } from "./cart-table";
import { CartSummary } from "./cart-summary";
import { CartEmpty } from "./cart-empty";
import { CartRelatedSection } from "./cart-related-section";
import { Link } from "@tanstack/react-router";
import { useNftUpdated } from "../realtime/use-nft-updated";

export function CartPage() {
  useNftUpdated();
  const { data: session } = useSession();
  const { data: cart, isLoading } = useCart();
  const { mergeIfNeeded } = useMergeCart();
  const mergedRef = useRef(false);

  useEffect(() => {
    if (!session) {
      mergedRef.current = false;
      return;
    }
    if (mergedRef.current) return;
    mergedRef.current = true;
    void (async () => {
      const merged = await mergeIfNeeded();
      if (merged) {
        toast.success("Seu carrinho de visitante foi transferido.");
      }
    })();
  }, [session, mergeIfNeeded]);

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-10">
        <h1 className="text-3xl font-bold text-foreground">Carrinho</h1>
        <p className="mt-2 text-sm text-muted-foreground">Carregando…</p>
      </div>
    );
  }

  const hasItems = (cart?.items.length ?? 0) > 0;

  return (
    <div className="container mx-auto max-w-300 pt-8 pb-24">
      <div className="mb-3 text-foreground text-[15px] font-bold">
        <Link to="/">Início /</Link>
        <Link to="/"> Mercado</Link>
      </div>

      {!hasItems || !cart ? (
        <CartEmpty />
      ) : (
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
          <CartTable cart={cart} />
          <CartSummary cart={cart} />
        </div>
      )}

      {cart && <CartRelatedSection cart={cart} />}
    </div>
  );
}
