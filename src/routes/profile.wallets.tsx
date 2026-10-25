import { createFileRoute } from "@tanstack/react-router";
import { WalletsPanel } from "@/features/wallets";

export const Route = createFileRoute("/profile/wallets")({
  component: WalletsPanel,
});
