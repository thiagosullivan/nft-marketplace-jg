import { useEffect, useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/shared/components/ui/carousel";
import { cn } from "@/shared/lib/utils";
import BtnExplore from "@/shared/components/layout/btn-explore";

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
    big: "SEJA DONO DO FUTURO\nDA ARTE DIGITAL",
    text: "Descubra NFTs selecionados de criadores emergentes e consagrados. Colecione arte digital rara, apoie artistas e tenha uma parte da cultura da internet.",
    cta: "EXPLORAR",
    image: "/nfts/prod-1.png",
  },
  {
    small: "Curadoria Kurio",
    big: "APOIE ARTISTAS.\nLEVE A ARTE COM VOCÊ.",
    text: "Cada peça vem de criadores independentes e é verificada on-chain. Ao colecionar, você apoia diretamente quem faz a arte e leva um pedaço único da cultura digital.",
    cta: "VER CRIADORES",
    image: "/nfts/prod-2.png",
  },
  {
    small: "Edições limitadas",
    big: "RARIDADE QUE\nATRAVESSA GERAÇÕES.",
    text: "NFTs selecionados em edições limitadas, com procedência registrada na blockchain. Garanta a sua peça antes que a edição se esgote e faça parte da próxima era da arte digital.",
    cta: "GARANTIR A MINHA",
    image: "/nfts/prod-3.png",
  },
];

export function HeroCarousel() {
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
    <section aria-label="Destaques" className="mb-10">
      <Carousel setApi={setApi} opts={{ loop: true }}>
        <CarouselContent>
          {SLIDES.map((slide, i) => (
            <CarouselItem key={i}>
              <div className="min-h-[360px] flex items-center justify-between gap-6 rounded-lg pl-10">
                <div className="flex flex-col py-11">
                  <div className="space-y-4 max-w-150 w-full mb-11">
                    <p className="text-sm font-medium uppercase tracking-widest text-foreground">
                      {slide.small}
                    </p>
                    <h2 className="whitespace-pre-line text-[43px] font-bold leading-tight text-foreground md:text-4xl">
                      {slide.big}
                    </h2>
                    <p className="text-sm font-normal text-secondary mb-8 max-w-140">
                      {slide.text}
                    </p>
                    <BtnExplore text="EXPLORAR" />
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
                            : "bg-border hover:bg-muted-foreground",
                        )}
                      />
                    ))}
                  </div>
                </div>

                <div className="aspect-square w-full max-w-[450px] overflow-hidden rounded-md">
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
