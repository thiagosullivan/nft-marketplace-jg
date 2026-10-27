import { createFileRoute } from "@tanstack/react-router";
import { requireAuth } from "@/features/auth/auth-guard";
import { OrderConfirmationRoute } from "@/features/orders/order-confirmation-route";

export const Route = createFileRoute("/order/$id")({
  beforeLoad: ({ location }) => requireAuth(location.href),
  component: OrderConfirmationRoute,
});
