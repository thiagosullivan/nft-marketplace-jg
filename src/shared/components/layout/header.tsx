import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useSession, useLogout } from "@/features/auth/use-auth";
import { useAuthModal } from "@/features/auth/auth-modal-provider";
import { useCartCount } from "@/features/cart";
import { useNftList } from "@/features/catalog/use-nft-list";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Popover, PopoverAnchor, PopoverContent } from "../ui/popover";
import { Skeleton } from "../ui/skeleton";
import SearchIcon from "../../../../public/icons/search-icon.png";
import CartIcon from "../../../../public/icons/cart-icon.png";
import EnterLogin from "../../../../public/icons/enter-login.png";

const DEBOUNCE_MS = 300;
const MIN_CHARS = 2;
const MAX_RESULTS = 6;

function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export function Header() {
  const { data: session, isLoading } = useSession();
  const logout = useLogout();
  const { open } = useAuthModal();
  const cartCount = useCartCount();

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const debounced = useDebouncedValue(searchTerm.trim(), DEBOUNCE_MS);
  const canSearch = debounced.length >= MIN_CHARS;

  const search = useNftList(
    { q: canSearch ? debounced : undefined, pageSize: MAX_RESULTS },
    { enabled: canSearch },
  );

  useEffect(() => {
    if (searchOpen) {
      const t = setTimeout(() => inputRef.current?.focus(), 0);
      return () => clearTimeout(t);
    }
  }, [searchOpen]);

  const results = useMemo(
    () => (search.data?.items ?? []).slice(0, MAX_RESULTS),
    [search.data],
  );

  const closeSearch = () => setSearchOpen(false);

  return (
    <header className="sticky top-0 z-40 mx-auto w-full max-w-300 border-b border-primary bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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
          <Popover open={searchOpen} onOpenChange={setSearchOpen}>
            <PopoverAnchor asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Buscar NFTs"
                aria-expanded={searchOpen}
                onClick={() => setSearchOpen((v) => !v)}
              >
                <img
                  src={SearchIcon}
                  alt=""
                  className="size-5"
                  aria-hidden="true"
                />
              </Button>
            </PopoverAnchor>

            <PopoverContent
              align="end"
              className="w-[340px] p-3"
              onOpenAutoFocus={(e) => {
                e.preventDefault();
                inputRef.current?.focus();
              }}
            >
              <Input
                ref={inputRef}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") closeSearch();
                }}
                placeholder="Buscar NFTs…"
                aria-label="Buscar NFTs"
                aria-controls="header-search-results"
                className="h-9"
              />

              <div
                id="header-search-results"
                role="listbox"
                aria-label="Resultados da busca"
                className="mt-3 max-h-80 overflow-y-auto"
              >
                {!canSearch && (
                  <p className="px-2 py-3 text-sm text-secondary">
                    Digite ao menos {MIN_CHARS} caracteres.
                  </p>
                )}

                {canSearch && search.isLoading && (
                  <div className="space-y-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full rounded-md" />
                    ))}
                  </div>
                )}

                {canSearch && search.isError && (
                  <p className="px-2 py-3 text-sm text-secondary">
                    Não foi possível buscar agora.
                  </p>
                )}

                {canSearch &&
                  !search.isLoading &&
                  !search.isError &&
                  results.length === 0 && (
                    <p className="px-2 py-3 text-sm text-secondary">
                      Nenhum NFT encontrado para “{debounced}”.
                    </p>
                  )}

                {canSearch && results.length > 0 && (
                  <ul className="flex flex-col">
                    {results.map((nft) => (
                      <li key={nft.id} role="option" aria-selected="false">
                        <Link
                          to="/nft/$id"
                          params={{ id: nft.id }}
                          onClick={closeSearch}
                          className="flex items-center gap-3 rounded-md px-2 py-2 hover:bg-surface-card focus-visible:bg-surface-card focus-visible:outline-none"
                        >
                          <img
                            src={nft.imageUrl}
                            alt=""
                            className="size-10 shrink-0 rounded object-cover"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-bold text-foreground">
                              {nft.name}
                            </p>
                            <p className="truncate text-xs text-secondary">
                              {nft.collection}
                            </p>
                          </div>
                          <p className="text-sm font-bold text-accent whitespace-nowrap">
                            {Number(nft.priceEth).toFixed(2)} ETH
                          </p>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </PopoverContent>
          </Popover>

          <Link
            to="/cart"
            className="relative text-foreground hover:text-primary [&.active]:text-primary"
            aria-label={
              cartCount > 0
                ? `Carrinho (${cartCount} ${cartCount === 1 ? "item" : "itens"})`
                : "Carrinho"
            }
          >
            <img src={CartIcon} alt="" className="size-5" aria-hidden="true" />
            {cartCount > 0 && (
              <span
                aria-hidden="true"
                className="absolute -right-2 -top-2 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-ink"
              >
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            )}
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
              className="flex cursor-pointer items-center gap-x-1 rounded-sm bg-primary p-2 text-base font-medium text-ink"
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
