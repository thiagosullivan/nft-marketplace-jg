import { useEffect, useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/shared/components/ui/carousel";
import { cn } from "@/shared/lib/utils";
import BtnExplore from "@/shared/components/layout/btn-explore";
import { Link } from "@tanstack/react-router";

type Slide = {
  small: string;
  big: string;
  text: string;
  cta: string;
  image: string;
};

const SLIDES: readonly Slide[] = [
  {
    small: "Bem-vindo à Kurio",
    big: "SEJA DONO DA\nCULTURA DIGITAL",
    text: "Descubra NFTs selecionados de criadores do mundo todo.",
    cta: "EXPLORAR",
    image: "/nfts/prod-1.webp",
  },
  {
    small: "Curadoria Kurio",
    big: "APOIE ARTISTAS.\nLEVE A ARTE.",
    text: "Cada peça vem de criadores independentes e é verificada on-chain.",
    cta: "VER CRIADORES",
    image: "/nfts/prod-2.webp",
  },
  {
    small: "Edições limitadas",
    big: "RARIDADE QUE\nDE GERAÇÕES.",
    text: "NFTs selecionados em edições limitadas, com procedência registrada na blockchain.",
    cta: "GARANTIR A MINHA",
    image: "/nfts/prod-3.webp",
  },
];

export function MobileHeroCarousel() {
  const [api, setApi] = useState<CarouselApi | null>(null);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) return;
    const onSelect = () => setCurrent(api.selectedScrollSnap());
    api.on("select", onSelect);
    onSelect();
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  return (
    <section aria-label="Destaques" className="mb-4 bg-accent/20 rounded-4xl">
      {/* <h1>MOBILE</h1> */}
      <Carousel setApi={setApi} opts={{ loop: true }}>
        <CarouselContent className="">
          {SLIDES.map((slide, i) => (
            <CarouselItem key={i}>
              <div className="min-h-[200px] sm:min-h-[260px] flex items-center justify-between gap-2 rounded-lg py-2 px-4">
                <div className="flex flex-col">
                  <div className="space-y-3 max-w-150 w-full mb-5">
                    <p className="text-xs font-medium uppercase tracking-widest text-foreground">
                      {slide.small}
                    </p>
                    <h2 className="whitespace-pre-line text-[18px] font-bold leading-tight text-foreground md:text-4xl">
                      {slide.big}
                    </h2>
                    <p className="text-xs font-normal text-secondary mb-3 max-w-140">
                      {slide.text}
                    </p>
                    <BtnExplore text="EXPLORAR" />
                    <Link
                      to="/"
                      className="uppercase text-accent font-bold text-xs"
                    >
                      Explorar →
                    </Link>
                  </div>
                  <div
                    className="flex justify-end gap-2"
                    role="tablist"
                    aria-label="Selecionar destaque"
                  >
                    {SLIDES.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        role="tab"
                        aria-selected={current === i}
                        aria-label={`Ir para o destaque ${i + 1}`}
                        onClick={() => api?.scrollTo(i)}
                        className={cn(
                          "size-2 rounded-full transition-colors",
                          current === i
                            ? "bg-primary"
                            : "bg-primary/50 hover:bg-muted-foreground",
                        )}
                      />
                    ))}
                  </div>
                </div>

                <div className="aspect-square w-full max-w-[160px] sm:max-w-[250px] overflow-hidden rounded-md">
                  <img
                    src={slide.image}
                    alt=""
                    className="size-full object-cover"
                  />
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </section>
  );
}
