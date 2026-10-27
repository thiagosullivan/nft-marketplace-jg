import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";
import { Suspense, useEffect, useState, type ReactNode } from "react";
import { z } from "zod";
import { useAuthModal } from "@/features/auth/auth-modal-provider";

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

// ---------------------------------------------------------------------------
// Lazy auth: mantém o chunk `use-auth` fora do boot da home.
// O `HomeRoute` precisa de `useSession` apenas para o redirect de
// ?auth=login|register. Isolamos esse uso num componente filho que só
// monta quando o módulo chega.
// ---------------------------------------------------------------------------

type AuthModule = typeof import("@/features/auth/use-auth");

function useLazyAuthModule(): AuthModule | null {
  const [mod, setMod] = useState<AuthModule | null>(null);
  useEffect(() => {
    let cancelled = false;
    void import("@/features/auth/use-auth").then((m) => {
      if (!cancelled) setMod(m);
    });
    return () => {
      cancelled = true;
    };
  }, []);
  return mod;
}

function AuthRedirectHandler({
  mod,
  auth,
  redirect,
  children,
}: {
  mod: AuthModule;
  auth: "login" | "register";
  redirect?: string;
  children: ReactNode;
}) {
  const { data: session, isLoading } = mod.useSession();
  const { open, mode } = useAuthModal();

  useEffect(() => {
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

  return <>{children}</>;
}

function HomeRoute() {
  const search = Route.useSearch();
  const { auth, redirect } = search;
  const mod = useLazyAuthModule();

  const content = (
    <Suspense fallback={<HomeFallback />}>
      <HomePage search={search} />
    </Suspense>
  );

  if (!auth) return content;

  // Só quando há ?auth= é que precisamos do use-auth para o redirect.
  if (!mod) {
    return <HomeFallback />;
  }

  return (
    <AuthRedirectHandler mod={mod} auth={auth} redirect={redirect}>
      {content}
    </AuthRedirectHandler>
  );
}

function HomeFallback() {
  return <div className="min-h-[calc(100dvh-80px)]" aria-busy="true" />;
}

export const Route = createFileRoute("/")({
  validateSearch: searchSchema,
  component: HomeRoute,
});
