import { WalletsPage } from "@/features/wallets/wallets-page";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/wallets")({
  component: WalletsPage,
});
