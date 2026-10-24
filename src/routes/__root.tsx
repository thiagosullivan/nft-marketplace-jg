import { lazy, Suspense, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { Header } from "@/shared/components/layout/header";
import { Footer } from "@/shared/components/layout/footer";
import { AuthModalProvider } from "@/features/auth/auth-modal-provider";

export const Route = createRootRoute({
  component: RootLayout,
  notFoundComponent: NotFoundPage,
});

const AuthModalHost = lazy(() =>
  import("@/features/auth/auth-modal-host").then((m) => ({
    default: m.AuthModalHost,
  })),
);

function RootLayout() {
  return (
    <AuthModalProvider>
      <div className="flex min-h-dvh flex-col bg-ink text-foreground">
        <Header />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
      <ModalPortal>
        <Suspense fallback={null}>
          <AuthModalHost />
        </Suspense>
      </ModalPortal>
    </AuthModalProvider>
  );
}

function ModalPortal({ children }: { children: ReactNode }) {
  if (typeof document === "undefined") return null;
  return createPortal(children, document.body);
}

function NotFoundPage() {
  return (
    <div className="container mx-auto flex max-w-2xl flex-col items-center justify-center gap-4 px-4 py-24 text-center">
      <h1 className="text-4xl font-bold text-primary">404</h1>
      <p className="text-muted-foreground">Página não encontrada.</p>
      <a
        href="/"
        className="text-sm text-primary underline underline-offset-4 hover:text-primary-light"
      >
        Voltar para a home
      </a>
    </div>
  );
}
