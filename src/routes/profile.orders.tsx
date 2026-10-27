import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

const ProfileOrdersPage = lazyRouteComponent(
  () => import("@/features/orders/profile-orders-page"),
  "ProfileOrdersPage",
);

export const Route = createFileRoute("/profile/orders")({
  component: ProfileOrdersPage,
});
