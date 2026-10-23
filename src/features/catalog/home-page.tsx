import { useNavigate } from "@tanstack/react-router";
import { useNftList } from "./use-nft-list";
import { NftCard } from "./nft-card";
import { NftGridSkeleton } from "./skeletons";
import { EmptyState } from "./empty-state";
import { ErrorState } from "./error-state";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/shared/components/ui/pagination";
import { HeroCarousel } from "./hero-carousel";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { cn } from "@/shared/lib/utils";

export type HomeSearch = {
  q?: string;
  collections?: string[];
  networks?: Array<"ethereum" | "polygon" | "solana">;
  minPriceEth?: string;
  maxPriceEth?: string;
  sort?: "recent" | "price-asc" | "price-desc" | "name-asc" | "name-desc";
  tab?: "all" | "new" | "trending";
  page?: number;
};

const PAGE_SIZE = 9;

const TABS: Array<{ value: NonNullable<HomeSearch["tab"]>; label: string }> = [
  { value: "all", label: "Todos os NFTs" },
  { value: "new", label: "Novos lançamentos" },
  { value: "trending", label: "Em alta" },
];

const SORT_OPTIONS: Array<{
  value: NonNullable<HomeSearch["sort"]>;
  label: string;
}> = [
  { value: "recent", label: "Listados recentemente" },
  { value: "price-asc", label: "Preço: menor para maior" },
  { value: "price-desc", label: "Preço: maior para menor" },
  { value: "name-asc", label: "Nome: A–Z" },
  { value: "name-desc", label: "Nome: Z–A" },
];

/** Default de sort por tab (quando o usuário não escolheu um sort). */
function defaultSortFor(
  tab: NonNullable<HomeSearch["tab"]>,
): NonNullable<HomeSearch["sort"]> {
  if (tab === "new") return "recent";
  if (tab === "trending") return "price-desc";
  return "recent";
}

export function HomePage({ search }: { search: HomeSearch }) {
  const navigate = useNavigate();

  const page = search.page ?? 1;
  const tab = search.tab ?? "all";
  const sort = search.sort; // pode ser undefined (usuário não escolheu)
  const effectiveSort = sort ?? defaultSortFor(tab);
  const selectValue = sort ?? defaultSortFor(tab);

  const { data, isLoading, isError, refetch, isFetching } = useNftList({
    q: search.q,
    collections: search.collections,
    networks: search.networks,
    minPriceEth: search.minPriceEth,
    maxPriceEth: search.maxPriceEth,
    sort: effectiveSort,
    page,
    pageSize: PAGE_SIZE,
  });

  const hasItems = Boolean(data && Array.isArray(data.items));

  const goToPage = (next: number) => {
    void navigate({
      to: "/",
      search: (prev) => ({ ...prev, page: next }),
      resetScroll: false,
    });
  };

  const setTab = (next: NonNullable<HomeSearch["tab"]>) => {
    void navigate({
      to: "/",
      search: (prev) => ({ ...prev, tab: next, page: 1, sort: undefined }),
      resetScroll: false,
    });
  };

  const setSort = (next: NonNullable<HomeSearch["sort"]>) => {
    void navigate({
      to: "/",
      search: (prev) => ({ ...prev, sort: next, page: 1 }),
      resetScroll: false,
    });
  };

  return (
    <div className="container mx-auto max-w-300 px-4 py-8">
      <div className="mb-24">
        <HeroCarousel />
      </div>

      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <aside className="hidden lg:block" aria-label="Filtros">
          {/* TODO 2.2b: FiltersSidebar */}
        </aside>

        <section aria-busy={isLoading || isFetching}>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div
              role="tablist"
              aria-label="Filtrar NFTs"
              className="flex items-center gap-6"
            >
              {TABS.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  role="tab"
                  aria-selected={tab === t.value}
                  onClick={() => setTab(t.value)}
                  className={cn(
                    "relative pb-2 text-sm font-medium transition-colors",
                    tab === t.value
                      ? "text-primary"
                      : "text-foreground hover:text-primary",
                  )}
                >
                  {t.label}
                  {tab === t.value && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-0 -bottom-px h-0.5 bg-primary"
                    />
                  )}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Ordenar por:
              </span>
              <Select
                value={selectValue}
                onValueChange={(v) =>
                  setSort(v as NonNullable<HomeSearch["sort"]>)
                }
              >
                <SelectTrigger className="w-[220px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {isLoading ? (
            <NftGridSkeleton />
          ) : isError ? (
            <ErrorState onRetry={() => void refetch()} />
          ) : !hasItems || (data?.items.length ?? 0) === 0 ? (
            <EmptyState />
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {data!.items.map((nft) => (
                  <NftCard key={nft.id} nft={nft} />
                ))}
              </div>

              {(data!.totalPages ?? 0) > 1 && (
                <nav aria-label="Paginação" className="mt-8">
                  <Pagination>
                    <PaginationContent>
                      {page > 1 && (
                        <PaginationItem>
                          <PaginationPrevious
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              goToPage(page - 1);
                            }}
                          />
                        </PaginationItem>
                      )}
                      {Array.from({ length: data!.totalPages }).map((_, i) => {
                        const n = i + 1;
                        return (
                          <PaginationItem key={n}>
                            <PaginationLink
                              href="#"
                              isActive={n === page}
                              onClick={(e) => {
                                e.preventDefault();
                                goToPage(n);
                              }}
                            >
                              {n}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      })}
                      {page < data!.totalPages && (
                        <PaginationItem>
                          <PaginationNext
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              goToPage(page + 1);
                            }}
                          />
                        </PaginationItem>
                      )}
                    </PaginationContent>
                  </Pagination>
                </nav>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
