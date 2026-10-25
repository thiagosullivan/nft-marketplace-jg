import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { requireAuth } from "@/features/auth/auth-guard";
import { useOrder, OrderConfirmationDialog } from "@/features/orders";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Button } from "@/shared/components/ui/button";

export const Route = createFileRoute("/order/$id")({
  beforeLoad: ({ location }) => requireAuth(location.href),
  component: OrderConfirmationRoute,
});

function OrderConfirmationRoute() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const query = useOrder(id);

  const close = () => navigate({ to: "/checkout" });

  if (query.isLoading) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-12">
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (query.isError || !query.data) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-12 text-center">
        <h1 className="text-2xl font-bold text-foreground">
          Pedido não encontrado
        </h1>
        <p className="mt-2 text-sm text-secondary">
          Não foi possível localizar este pedido. Ele pode ter sido removido ou
          o link está incorreto.
        </p>
        <Button className="mt-6" onClick={() => navigate({ to: "/" })}>
          Ir para o início
        </Button>
      </div>
    );
  }

  return (
    <OrderConfirmationDialog
      order={query.data}
      open
      onOpenChange={(open: boolean) => {
        if (!open) close();
      }}
    />
  );
}
