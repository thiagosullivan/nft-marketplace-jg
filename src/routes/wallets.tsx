import { createFileRoute } from "@tanstack/react-router";
import { WalletsPage } from "@/features/wallets/wallets-page";
import { requireAuth } from "@/features/auth/auth-guard";

export const Route = createFileRoute("/wallets")({
  beforeLoad: ({ location }) => requireAuth(location.href),
  component: WalletsPage,
});
