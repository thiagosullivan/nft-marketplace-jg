import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";
import { requireAuth } from "@/features/auth/auth-guard";

export const Route = createFileRoute("/checkout")({
  beforeLoad: ({ location }) => requireAuth(location.href),
  component: lazyRouteComponent(
    () => import("@/features/checkout/checkout-page"),
    "CheckoutPage",
  ),
});
