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
import type { Nft } from "@/shared/api/types";
import { Button } from "@/shared/components/ui/button";

type Props = {
  nft: Nft;
  pageSize?: number;
};

function RelatedSkeleton() {
  return (
    <div
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">Carregando NFTs da mesma coleção…</span>
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

function RelatedHeader() {
  return (
    <div className="mb-6 border-b border-border pb-3">
      <h2 id="related-title" className="text-2xl font-bold text-foreground">
        Mais desta coleção
      </h2>
    </div>
  );
}

export function NftRelatedSection({ nft, pageSize = 15 }: Props) {
  const query = useNftList({
    collections: [nft.collection],
    sort: "recent",
    page: 1,
    pageSize,
  });

  const items = useMemo(() => {
    const all = query.data?.items ?? [];
    return all.filter((n) => n.id !== nft.id);
  }, [query.data, nft.id]);

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

  // Reanexa o listener quando os items mudam (o carousel re-inicializa).
  useEffect(() => {
    if (!api) return;
    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());
  }, [api, items.length]);

  if (query.isLoading) {
    return (
      <section aria-labelledby="related-title" className="mt-16">
        <RelatedHeader />
        <RelatedSkeleton />
      </section>
    );
  }

  if (query.isError) {
    return (
      <section aria-labelledby="related-title" className="mt-16">
        <RelatedHeader />
        <div className="flex items-center gap-3 py-6 text-sm text-muted-foreground">
          <span>Não foi possível carregar os NFTs desta coleção.</span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void query.refetch()}
          >
            Tentar novamente
          </Button>
        </div>
      </section>
    );
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="related-title" className="mt-16">
      <RelatedHeader />
      <Carousel
        setApi={setApi}
        opts={{
          align: "start",
          slidesToScroll: 5,
          containScroll: "trimSnaps",
        }}
        className="w-full"
        aria-label="Mais desta coleção"
      >
        <CarouselContent>
          {items.map((related) => (
            <CarouselItem
              key={related.id}
              className="basis-full sm:basis-1/2 lg:basis-1/5"
            >
              <div className="flex justify-center lg:justify-start">
                <NftCard nft={related} />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        {count > 1 && (
          <div
            className="mt-8 hidden justify-center gap-2 sm:flex"
            role="tablist"
            aria-label="Selecionar página da coleção"
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
                  "size-3 rounded-full transition-colors",
                  current === i
                    ? "bg-primary"
                    : "bg-transparent border border-primary hover:bg-muted-foreground",
                )}
              />
            ))}
          </div>
        )}
      </Carousel>
    </section>
  );
}
