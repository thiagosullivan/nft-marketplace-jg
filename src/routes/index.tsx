import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { z } from "zod";
import { HomePage } from "@/features/catalog/home-page";
import { useAuthModal } from "@/features/auth/auth-modal-provider";
import { useSession } from "@/features/auth/use-auth";

const searchSchema = z.object({
  auth: z.enum(["login", "register"]).optional(),
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/")({
  validateSearch: searchSchema,
  component: HomeRoute,
});

function HomeRoute() {
  const { auth, redirect } = Route.useSearch();
  const { open, mode } = useAuthModal();
  const { data: session, isLoading } = useSession();

  useEffect(() => {
    if (!auth) return;
    if (isLoading) return;
    if (session) {
      const url = new URL(window.location.href);
      url.searchParams.delete("auth");
      url.searchParams.delete("redirect");
      window.history.replaceState({}, "", url.toString());
      return;
    }
    if (mode) return;
    open(auth, redirect);
  }, [auth, redirect, open, session, isLoading, mode]);

  return <HomePage />;
}
