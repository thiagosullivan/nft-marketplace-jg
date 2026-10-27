import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";
import { useEffect } from "react";
import { z } from "zod";
import { useAuthModal } from "@/features/auth/auth-modal-provider";
import { useSession } from "@/features/auth/use-auth";

const NETWORK_ENUM = z.enum(["ethereum", "polygon", "solana"]);
const SORT_ENUM = z.enum([
  "recent",
  "price-asc",
  "price-desc",
  "name-asc",
  "name-desc",
]);
const TAB_ENUM = z.enum(["all", "new", "trending"]);

const searchSchema = z.object({
  auth: z.enum(["login", "register"]).optional(),
  redirect: z.string().optional(),
  q: z.string().optional(),
  collections: z.array(z.string()).optional(),
  networks: z.array(NETWORK_ENUM).optional(),
  minPriceEth: z.string().optional(),
  maxPriceEth: z.string().optional(),
  sort: SORT_ENUM.optional(),
  tab: TAB_ENUM.optional(),
  page: z.coerce.number().int().positive().optional(),
});

const HomePage = lazyRouteComponent(
  () => import("@/features/catalog/home-page"),
  "HomePage",
);

export const Route = createFileRoute("/")({
  validateSearch: searchSchema,
  component: HomeRoute,
});

function HomeRoute() {
  const search = Route.useSearch();
  const { auth, redirect } = search;
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

  return <HomePage search={search} />;
}
