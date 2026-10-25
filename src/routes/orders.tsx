import { createFileRoute, redirect } from "@tanstack/react-router";
import { requireAuth } from "@/features/auth/auth-guard";

export const Route = createFileRoute("/orders")({
  beforeLoad: ({ location }) => {
    requireAuth(location.href);
    throw redirect({ to: "/profile/orders" });
  },
  component: () => null,
});
