import { Link } from "@tanstack/react-router";
import { Button } from "@/shared/components/ui/button";

export function CartEmpty() {
  return (
    <div className="rounded-md border border-border bg-surface-card p-10 text-center">
      <h1 className="text-2xl font-bold text-foreground">
        Seu carrinho está vazio
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Explore o catálogo e adicione NFTs para começar a colecionar.
      </p>
      <Button asChild className="mt-6">
        <Link to="/">Explorar NFTs</Link>
      </Button>
    </div>
  );
}
