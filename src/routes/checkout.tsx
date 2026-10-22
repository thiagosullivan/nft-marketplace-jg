import { CheckoutPage } from "@/features/checkout/checkout-page";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/checkout")({
  component: CheckoutPage,
});
