import { createFileRoute } from "@tanstack/react-router";
import { requireAuth } from "@/features/auth/auth-guard";

export const Route = createFileRoute("/orders")({
  beforeLoad: ({ location }) => requireAuth(location.href),
  component: OrdersRoute,
});

function OrdersRoute() {
  return (
    <div className="container mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-3xl font-bold text-primary">Meus pedidos</h1>
      <p className="mt-2 text-muted-foreground">Em construção (Fase 2.6.b).</p>
    </div>
  );
}
