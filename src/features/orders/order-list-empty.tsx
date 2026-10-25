import { Link } from "@tanstack/react-router";
import { Button } from "@/shared/components/ui/button";

export function OrderListEmpty() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
      <h2 className="text-2xl font-bold text-foreground">
        Você ainda não fez nenhum pedido
      </h2>
      <p className="max-w-md text-sm text-secondary">
        Explore o marketplace e encontre NFTs para começar sua coleção.
      </p>
      <Button asChild>
        <Link to="/">Explorar marketplace</Link>
      </Button>
    </div>
  );
}
