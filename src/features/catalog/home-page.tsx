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

export type HomeSearch = {
  q?: string;
  collections?: string[];
  networks?: Array<"ethereum" | "polygon" | "solana">;
  minPriceEth?: string;
  maxPriceEth?: string;
  sort?: "recent" | "price-asc" | "price-desc" | "name-asc" | "name-desc";
  page?: number;
};

const PAGE_SIZE = 9;

export function HomePage({ search }: { search: HomeSearch }) {
  const navigate = useNavigate();

  const page = search.page ?? 1;
  const sort = search.sort ?? "recent";

  const { data, isLoading, isError, refetch, isFetching } = useNftList({
    q: search.q,
    collections: search.collections,
    networks: search.networks,
    minPriceEth: search.minPriceEth,
    maxPriceEth: search.maxPriceEth,
    sort,
    page,
    pageSize: PAGE_SIZE,
  });

  const goToPage = (next: number) => {
    void navigate({
      to: "/",
      search: (prev) => ({ ...prev, page: next }),
    });
  };

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-primary">
          Descubra NFTs
        </h1>
        <p className="mt-1 text-muted-foreground">
          Explore a coleção e encontre sua próxima peça.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <aside className="hidden lg:block" aria-label="Filtros">
          {/* TODO 2.2b: FiltersSidebar */}
        </aside>

        <section aria-busy={isLoading || isFetching}>
          {isLoading ? (
            <NftGridSkeleton />
          ) : isError ? (
            <ErrorState onRetry={() => void refetch()} />
          ) : !data || data.items.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {data.items.map((nft) => (
                  <NftCard key={nft.id} nft={nft} />
                ))}
              </div>

              {data.totalPages > 1 && (
                <nav aria-label="Paginação" className="mt-8">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (page > 1) goToPage(page - 1);
                          }}
                          aria-disabled={page === 1}
                        />
                      </PaginationItem>
                      {Array.from({ length: data.totalPages }).map((_, i) => {
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
                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (page < data.totalPages) goToPage(page + 1);
                          }}
                          aria-disabled={page === data.totalPages}
                        />
                      </PaginationItem>
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
