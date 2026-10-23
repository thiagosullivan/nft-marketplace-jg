import { createFileRoute } from "@tanstack/react-router";
import { CheckoutPage } from "@/features/checkout/checkout-page";
import { requireAuth } from "@/features/auth/auth-guard";

export const Route = createFileRoute("/checkout")({
  beforeLoad: ({ location }) => requireAuth(location.href),
  component: CheckoutPage,
});
