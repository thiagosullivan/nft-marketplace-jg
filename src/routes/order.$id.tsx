import { createFileRoute } from "@tanstack/react-router";
import { OrderConfirmationPage } from "@/features/checkout/order-confirmation-page";
import { requireAuth } from "@/features/auth/auth-guard";

export const Route = createFileRoute("/order/$id")({
  beforeLoad: ({ location }) => requireAuth(location.href),
  component: OrderConfirmationRoute,
});

function OrderConfirmationRoute() {
  const { id } = Route.useParams();
  return <OrderConfirmationPage orderId={id} />;
}
