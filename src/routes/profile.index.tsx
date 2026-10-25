import { createFileRoute } from "@tanstack/react-router";
import { ProfilePanel } from "@/features/profile";

export const Route = createFileRoute("/profile/")({
  component: ProfilePanel,
});
