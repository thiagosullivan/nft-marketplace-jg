import { createFileRoute } from "@tanstack/react-router";
import { OrderConfirmationPage } from "@/features/checkout/order-confirmation-page";

export const Route = createFileRoute("/order/$id")({
  component: OrderConfirmationRoute,
});

function OrderConfirmationRoute() {
  const { id } = Route.useParams();
  return <OrderConfirmationPage orderId={id} />;
}
