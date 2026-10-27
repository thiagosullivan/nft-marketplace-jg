import { useEffect, useMemo, useState } from "react";
import { useNftList } from "@/features/catalog/use-nft-list";
import { NftCard } from "@/features/catalog/nft-card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/shared/components/ui/carousel";
import { cn } from "@/shared/lib/utils";
import type { Cart } from "@/shared/api/types";

type Props = {
  cart: Cart;
};

function RelatedSkeleton() {
  return (
    <div
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">Carregando sugestões…</span>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="space-y-3 motion-reduce:animate-none">
          <Skeleton className="aspect-square w-full rounded-md" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  );
}

export function CartRelatedSection({ cart }: Props) {
  const query = useNftList({ sort: "recent", page: 1, pageSize: 15 });

  const inCart = useMemo(
    () => new Set(cart.items.map((i) => i.nftId)),
    [cart.items],
  );

  const items = useMemo(() => {
    const all = query.data?.items ?? [];
    return all.filter((n) => !inCart.has(n.id));
  }, [query.data, inCart]);

  const [api, setApi] = useState<CarouselApi | null>(null);
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!api) return;
    const sync = () => {
      setCurrent(api.selectedScrollSnap());
      setCount(api.scrollSnapList().length);
    };
    api.on("select", sync);
    api.on("reInit", sync);
    sync();
    return () => {
      api.off("select", sync);
      api.off("reInit", sync);
    };
  }, [api]);

  useEffect(() => {
    if (!api) return;
    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());
  }, [api, items.length]);

  if (query.isLoading) {
    return (
      <section aria-labelledby="also-seen-title" className="mt-16">
        <div className="mb-6 border-b border-border pb-3">
          <h2
            id="also-seen-title"
            className="text-2xl font-bold text-foreground"
          >
            Colecionadores também viram
          </h2>
        </div>
        <RelatedSkeleton />
      </section>
    );
  }

  if (query.isError || items.length === 0) return null;

  return (
    <section aria-labelledby="also-seen-title" className="mt-16">
      <div className="mb-6 border-b border-border pb-3">
        <h2 id="also-seen-title" className="text-2xl font-bold text-foreground">
          Colecionadores também viram
        </h2>
      </div>
      <Carousel
        setApi={setApi}
        opts={{ align: "start", slidesToScroll: 5, containScroll: "trimSnaps" }}
        className="w-full"
        aria-label="Colecionadores também viram"
      >
        <CarouselContent>
          {items.map((nft) => (
            <CarouselItem
              key={nft.id}
              className="basis-full sm:basis-1/2 lg:basis-1/5"
            >
              <div className="flex justify-center lg:justify-start">
                <NftCard nft={nft} />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        {count > 1 && (
          <div
            className="mt-6 hidden justify-center gap-2 sm:flex"
            role="tablist"
            aria-label="Selecionar página de sugestões"
          >
            {Array.from({ length: count }).map((_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={current === i}
                aria-label={`Ir para a página ${i + 1}`}
                onClick={() => api?.scrollTo(i)}
                className={cn(
                  "size-6 rounded-full transition-colors",
                  current === i
                    ? "bg-primary"
                    : "bg-border hover:bg-muted-foreground",
                )}
              />
            ))}
          </div>
        )}
      </Carousel>
    </section>
  );
}
