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

  const hasItems = Boolean(data && Array.isArray(data.items));

  const goToPage = (next: number) => {
    void navigate({
      to: "/",
      search: (prev) => ({ ...prev, page: next }),
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
