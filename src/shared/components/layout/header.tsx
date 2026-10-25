import { Link } from "@tanstack/react-router";
import { useSession, useLogout } from "@/features/auth/use-auth";
import { useAuthModal } from "@/features/auth/auth-modal-provider";
import { Button } from "../ui/button";
import SearchIcon from "../../../../public/icons/search-icon.png";
import CartIcon from "../../../../public/icons/cart-icon.png";
import EnterLogin from "../../../../public/icons/enter-login.png";

export function Header() {
  const { data: session, isLoading } = useSession();
  const logout = useLogout();
  const { open } = useAuthModal();

  return (
    <header className="sticky max-w-300 w-full mx-auto top-0 z-40 border-b border-primary bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4">
        <Link
          to="/"
          className="shrink-0 text-sm font-bold text-foreground uppercase"
        >
          Kurio
        </Link>

        <nav className="hidden md:flex min-w-0 items-center gap-4 text-sm">
          <Link
            to="/"
            activeOptions={{ exact: true, includeSearch: false }}
            className="relative text-foreground text-base font-normal hover:text-accent [&.active]:text-accent [&.active]:after:absolute [&.active]:after:left-0 [&.active]:after:right-0 [&.active]:after:-bottom-5 [&.active]:after:h-1 [&.active]:after:bg-current [&.active]:after:content-['']"
          >
            Início
          </Link>
          <Link
            to="/"
            className="text-foreground text-base font-normal hover:text-primary"
          >
            Mercado
          </Link>
          <Link
            to="/"
            className="text-foreground text-base font-normal hover:text-primary"
          >
            Criadores
          </Link>
          <Link
            to="/"
            className="text-foreground text-base font-normal hover:text-primary"
          >
            Aprenda
          </Link>
        </nav>

        <div className="flex shrink-0 items-center gap-x-7">
          <Button variant="ghost" size="icon">
            <img
              src={SearchIcon}
              alt=""
              className="size-5"
              aria-hidden="true"
            />
          </Button>
          <Link
            to="/cart"
            className="text-foreground hover:text-primary [&.active]:text-primary"
          >
            <img src={CartIcon} alt="" className="size-5" aria-hidden="true" />
          </Link>

          {isLoading ? null : session ? (
            <div className="flex items-center gap-3">
              <Link to="/profile" className="flex items-center gap-x-2">
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
              </Link>
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
            <Button
              onClick={() => open("login")}
              data-testid="header-login-button"
              className="text-ink font-medium text-base flex items-center gap-x-1 p-2 bg-primary rounded-sm cursor-pointer"
            >
              <img
                src={EnterLogin}
                alt=""
                className="size-5"
                aria-hidden="true"
              />
              Entrar
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
