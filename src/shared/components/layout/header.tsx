import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useAuthModal } from "@/features/auth/auth-modal-provider";
// import { useCartCount } from "@/features/cart";
import { useCartCount } from "@/features/cart/use-cart-count";

import { useNftList } from "@/features/catalog/use-nft-list";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Popover, PopoverAnchor, PopoverContent } from "../ui/popover";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { Skeleton } from "../ui/skeleton";
import SearchIcon from "../../../../public/icons/search-icon.png";
import CartIcon from "../../../../public/icons/cart-icon.png";
import EnterLogin from "../../../../public/icons/enter-login.png";
import { CiSearch } from "react-icons/ci";

const DEBOUNCE_MS = 300;
const MIN_CHARS = 2;
const MAX_RESULTS = 6;

const NAV_ITEMS = [
  { label: "Início", to: "/" as const, exact: true },
  { label: "Mercado", to: "/" as const, exact: false },
  { label: "Criadores", to: "/" as const, exact: false },
  { label: "Aprenda", to: "/" as const, exact: false },
];

const MOBILE_ONLY_NAV_ITEMS = [
  { label: "Carrinho", to: "/cart" as const, exact: false },
  { label: "Perfil", to: "/profile" as const, exact: false },
];

function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// ---------------------------------------------------------------------------
// Lazy auth: mantém o chunk `use-auth` fora do boot da home.
// O módulo só é importado depois do primeiro paint (useEffect).
// Enquanto ele não chega, o Header renderiza um placeholder estável.
// ---------------------------------------------------------------------------

type AuthModule = typeof import("@/features/auth/use-auth");

type AuthState = {
  mod: AuthModule | null;
};

function useLazyAuthModule(): AuthState {
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

  return { mod };
}

// Desktop auth block — só monta quando o módulo `use-auth` já chegou.
function DesktopAuthBlock({
  mod,
  open,
}: {
  mod: AuthModule;
  open: ReturnType<typeof useAuthModal>["open"];
}) {
  const { data: session, isLoading } = mod.useSession();
  const logout = mod.useLogout();

  if (isLoading) return null;

  if (!session) {
    return (
      <Button
        onClick={() => open("login")}
        data-testid="header-login-button"
        className="flex cursor-pointer items-center gap-x-1 rounded-sm bg-primary p-2 text-base font-medium text-ink"
      >
        <img
          src={EnterLogin}
          alt="login"
          className="size-5"
          aria-hidden="true"
          width={20}
          height={20}
        />
        Entrar
      </Button>
    );
  }

  return (
    <>
      <Link to="/profile" className="flex items-center gap-x-2">
        {session.user.avatarUrl ? (
          <img
            src={session.user.avatarUrl}
            alt={session.user.displayName}
            className="size-8 rounded-full"
            width={32}
            height={32}
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
    </>
  );
}

// Mobile auth block — mesma lógica, mas dentro do Sheet.
function MobileAuthBlock({
  mod,
  open,
  onNavigate,
}: {
  mod: AuthModule;
  open: ReturnType<typeof useAuthModal>["open"];
  onNavigate: () => void;
}) {
  const { data: session, isLoading } = mod.useSession();
  const logout = mod.useLogout();

  if (isLoading) return null;

  if (!session) {
    return (
      <Button
        onClick={() => {
          onNavigate();
          open("login");
        }}
        data-testid="header-login-button-mobile"
        className="flex cursor-pointer items-center justify-center gap-x-1 rounded-sm bg-primary p-2 text-base font-medium text-ink"
      >
        <img
          src={EnterLogin}
          alt="login"
          className="size-5"
          aria-hidden="true"
          width={20}
          height={20}
        />
        Entrar
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <Link
        to="/profile"
        onClick={onNavigate}
        className="flex items-center gap-3 rounded-md px-3 py-3 hover:bg-surface-card"
      >
        {session.user.avatarUrl ? (
          <img
            src={session.user.avatarUrl}
            alt={session.user.displayName}
            className="size-8 rounded-full"
            width={32}
            height={32}
          />
        ) : (
          <div className="flex size-8 items-center justify-center rounded-full bg-surface-card text-xs">
            {session.user.displayName.slice(0, 1).toUpperCase()}
          </div>
        )}
        <span className="truncate text-foreground">
          {session.user.displayName}
        </span>
      </Link>
      <button
        type="button"
        onClick={() => {
          onNavigate();
          logout.mutate();
        }}
        disabled={logout.isPending}
        className="rounded-md px-6 py-3 text-left bg-accent hover:bg-surface-card hover:text-primary ml-auto"
      >
        Sair
      </button>
    </div>
  );
}

export function Header() {
  const { mod } = useLazyAuthModule();
  const { open } = useAuthModal();
  const cartCount = useCartCount();

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const [mobileTerm, setMobileTerm] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const mobileWrapperRef = useRef<HTMLDivElement>(null);

  const debounced = useDebouncedValue(searchTerm.trim(), DEBOUNCE_MS);
  const canSearch = debounced.length >= MIN_CHARS;

  const search = useNftList(
    { q: canSearch ? debounced : undefined, pageSize: MAX_RESULTS },
    { enabled: canSearch },
  );

  const debouncedMobile = useDebouncedValue(mobileTerm.trim(), DEBOUNCE_MS);
  const canSearchMobile = debouncedMobile.length >= MIN_CHARS;

  const mobileSearch = useNftList(
    { q: canSearchMobile ? debouncedMobile : undefined, pageSize: MAX_RESULTS },
    { enabled: canSearchMobile && mobileOpen },
  );

  const mobileResults = useMemo(
    () => (mobileSearch.data?.items ?? []).slice(0, MAX_RESULTS),
    [mobileSearch.data],
  );

  useEffect(() => {
    if (!mobileOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!mobileWrapperRef.current) return;
      if (!mobileWrapperRef.current.contains(e.target as Node)) {
        setMobileOpen(false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [mobileOpen]);

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
  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="sticky top-0 z-40 mx-auto w-full max-w-300 border-b border-primary bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 items-center justify-between gap-2 px-6 md:gap-4 md:px-4">
        <Link
          to="/"
          className="shrink-0 text-sm font-bold text-foreground uppercase hidden md:block"
        >
          Kurio
        </Link>
        {/* Desktop nav (>= md) */}
        <nav className="hidden md:flex min-w-0 items-center gap-4 text-sm">
          {NAV_ITEMS.map((item) =>
            item.exact ? (
              <Link
                key={item.label}
                to={item.to}
                activeOptions={{ exact: true, includeSearch: false }}
                className="relative text-accent text-base font-normal hover:text-accent [&.active]:text-accent [&.active]:after:absolute [&.active]:after:left-0 [&.active]:after:right-0 [&.active]:after:-bottom-5 [&.active]:after:h-1 [&.active]:after:bg-current [&.active]:after:content-['']"
              >
                {item.label}
              </Link>
            ) : (
              <Link
                key={item.label}
                to={item.to}
                className="text-accent text-base font-normal hover:text-primary"
              >
                {item.label}
              </Link>
            ),
          )}
        </nav>

        <div className=" shrink-0 items-center gap-x-3 md:gap-x-7 hidden md:flex">
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
                  alt="search icon"
                  className="size-5"
                  aria-hidden="true"
                  width={20}
                  height={20}
                />
              </Button>
            </PopoverAnchor>

            <PopoverContent
              align="end"
              sideOffset={8}
              className="w-[calc(100vw-2rem)] max-w-[340px] p-3 md:w-[340px]"
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
                            alt="search icon"
                            className="size-10 shrink-0 rounded object-cover"
                            width={40}
                            height={40}
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
            <img
              src={CartIcon}
              alt="cart count"
              className="size-5"
              aria-hidden="true"
              width={20}
              height={20}
            />
            {cartCount > 0 && (
              <span
                aria-hidden="true"
                className="absolute -right-2 -top-2 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-ink"
              >
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            )}
          </Link>

          {/* Desktop-only auth block (>= md). Só monta quando o módulo use-auth chega. */}
          <div className="hidden md:flex md:items-center md:gap-3">
            {mod ? (
              <DesktopAuthBlock mod={mod} open={open} />
            ) : (
              <div
                className="size-8 rounded-full bg-surface-card"
                aria-hidden="true"
              />
            )}
          </div>
        </div>

        {/* Mobile: hamburger + logo. Desktop: logo apenas. */}
        <div className="md:hidden flex min-w-0 items-center gap-2 ml-auto w-full">
          <div
            ref={mobileWrapperRef}
            className="relative block w-full md:hidden"
          >
            <input
              type="search"
              value={mobileTerm}
              onChange={(e) => {
                setMobileTerm(e.target.value);
                setMobileOpen(true);
              }}
              onFocus={() => setMobileOpen(true)}
              onKeyDown={(e) => {
                if (e.key === "Escape") setMobileOpen(false);
              }}
              placeholder="Explorar coleções"
              aria-label="Explorar coleções"
              aria-controls={
                mobileOpen && canSearchMobile
                  ? "header-mobile-search-results"
                  : undefined
              }
              aria-autocomplete="list"
              autoComplete="off"
              className="w-full border-boder h-10 bg-surface-card rounded-md pl-11 pr-4 text-secondary placeholder:text-secondary text-sm font-bold focus:outline-none! focus:ring-0!"
            />
            <CiSearch
              className="absolute top-5 -translate-y-1/2 left-3 text-secondary pointer-events-none"
              size="22"
              aria-hidden="true"
            />

            {mobileOpen && canSearchMobile && (
              <div
                id="header-mobile-search-results"
                role="listbox"
                aria-label="Resultados da busca"
                className="absolute left-0 right-0 top-full z-50 mt-2 max-h-80 overflow-y-auto rounded-md border border-primary bg-surface-card p-3 shadow-lg"
              >
                {mobileSearch.isLoading && (
                  <div className="space-y-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full rounded-md" />
                    ))}
                  </div>
                )}

                {!mobileSearch.isLoading && mobileSearch.isError && (
                  <p className="px-2 py-3 text-sm text-secondary">
                    Não foi possível buscar agora.
                  </p>
                )}

                {!mobileSearch.isLoading &&
                  !mobileSearch.isError &&
                  mobileResults.length === 0 && (
                    <p className="px-2 py-3 text-sm text-secondary">
                      Nenhum NFT encontrado para “{debouncedMobile}”.
                    </p>
                  )}

                {mobileResults.length > 0 && (
                  <ul className="flex flex-col">
                    {mobileResults.map((nft) => (
                      <li key={nft.id} role="option" aria-selected="false">
                        <Link
                          to="/nft/$id"
                          params={{ id: nft.id }}
                          onClick={() => setMobileOpen(false)}
                          className="flex items-center gap-3 rounded-md px-2 py-2 hover:bg-surface-dark focus-visible:bg-surface-dark focus-visible:outline-none"
                        >
                          <img
                            src={nft.imageUrl}
                            alt={nft.name}
                            className="size-10 shrink-0 rounded object-cover"
                            width={40}
                            height={40}
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
            )}
          </div>
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Abrir menu"
                className="md:hidden bg-primary"
              >
                <img
                  src="/icons/svg/mobile-icon.svg"
                  alt="menu"
                  width={24}
                  height={24}
                />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] p-0">
              <SheetHeader className="border-b border-primary px-4 py-4">
                <SheetTitle className="text-left">Menu</SheetTitle>
              </SheetHeader>
              <nav
                aria-label="Navegação principal"
                className="flex flex-col p-2"
              >
                {NAV_ITEMS.map((item) => (
                  <Link
                    key={item.label}
                    to={item.to}
                    activeOptions={{ exact: item.exact, includeSearch: false }}
                    onClick={closeMenu}
                    className="rounded-md px-3 py-3 text-base text-accent hover:bg-surface-card hover:text-accent [&.active]:text-accent"
                  >
                    {item.label}
                  </Link>
                ))}
                {MOBILE_ONLY_NAV_ITEMS.map((item) => (
                  <Link
                    key={item.label}
                    to={item.to}
                    activeOptions={{ exact: item.exact, includeSearch: false }}
                    onClick={closeMenu}
                    className="rounded-md px-3 py-3 text-base text-accent hover:bg-surface-card hover:text-accent [&.active]:text-accent"
                  >
                    {item.label}
                  </Link>
                ))}

                <div className="my-2 h-px bg-primary/40" aria-hidden="true" />

                {mod ? (
                  <MobileAuthBlock
                    mod={mod}
                    open={open}
                    onNavigate={closeMenu}
                  />
                ) : (
                  <div
                    className="h-10 rounded-md bg-surface-card"
                    aria-hidden="true"
                  />
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
