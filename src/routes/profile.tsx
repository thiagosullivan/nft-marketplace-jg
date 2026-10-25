import { createFileRoute, Outlet } from "@tanstack/react-router";
import { requireAuth } from "@/features/auth/auth-guard";
import { ProfileLayout } from "@/features/profile";

export const Route = createFileRoute("/profile")({
  beforeLoad: ({ location }) => requireAuth(location.href),
  component: ProfileLayoutRoute,
});

function ProfileLayoutRoute() {
  return (
    <ProfileLayout>
      <Outlet />
    </ProfileLayout>
  );
}
