import { redirect } from "@tanstack/react-router";
import { getToken } from "@/shared/lib/auth-store";

export function requireAuth(redirectTo: string): void {
  if (!getToken()) {
    throw redirect({
      to: "/",
      search: { auth: "login", redirect: redirectTo },
    });
  }
}
