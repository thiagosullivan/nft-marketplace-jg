import { createFileRoute } from "@tanstack/react-router";
import { ProfilePage } from "@/features/profile/profile-page";
import { requireAuth } from "@/features/auth/auth-guard";

export const Route = createFileRoute("/profile")({
  beforeLoad: ({ location }) => requireAuth(location.href),
  component: ProfilePage,
});
