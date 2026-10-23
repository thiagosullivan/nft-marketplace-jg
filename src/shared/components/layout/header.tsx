import { Link } from "@tanstack/react-router";
import { useSession, useLogout } from "@/features/auth/use-auth";
import { useAuthModal } from "@/features/auth/auth-modal-provider";

export function Header() {
  const { data: session, isLoading } = useSession();
  const logout = useLogout();
  const { open } = useAuthModal();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="text-lg font-bold text-primary">
          NFT Marketplace
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link
            to="/"
            className="text-foreground hover:text-primary [&.active]:text-primary"
          >
            Início
          </Link>
          <Link
            to="/cart"
            className="text-foreground hover:text-primary [&.active]:text-primary"
          >
            Carrinho
          </Link>

          {isLoading ? null : session ? (
            <div className="flex items-center gap-3">
              {session.user.avatarUrl ? (
                <img
                  src={session.user.avatarUrl}
                  alt=""
                  className="size-8 rounded-full"
                />
              ) : (
                <div className="flex size-8 items-center justify-center rounded-full bg-surface-card text-xs">
                  {session.user.displayName.slice(0, 1).toUpperCase()}
                </div>
              )}
              <span className="hidden text-foreground sm:inline">
                {session.user.displayName}
              </span>
              <button
                type="button"
                onClick={() => logout.mutate()}
                disabled={logout.isPending}
                className="text-muted-foreground hover:text-primary"
              >
                Sair
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => open("login")}
              className="text-foreground hover:text-primary"
            >
              Entrar
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
