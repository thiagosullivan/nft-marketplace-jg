import { useState } from "react";
import { cn } from "@/shared/lib/utils";

type Props = {
  images: string[];
  alt: string;
};

export function NftGallery({ images, alt }: Props) {
  const safeImages = images.length > 0 ? images : [""];
  const [activeIndex, setActiveIndex] = useState(0);
  const active = safeImages[Math.min(activeIndex, safeImages.length - 1)];

  return (
    <div className="flex items-start">
      {safeImages.length > 1 && (
        <ul
          className="grid grid-row gap-4 mr-7"
          aria-label="Miniaturas da galeria"
        >
          {safeImages.map((src, index) => {
            const selected = index === activeIndex;
            return (
              <li key={`${src}-${index}`}>
                <button
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowRight") {
                      e.preventDefault();
                      setActiveIndex((i) => (i + 1) % safeImages.length);
                    } else if (e.key === "ArrowLeft") {
                      e.preventDefault();
                      setActiveIndex(
                        (i) => (i - 1 + safeImages.length) % safeImages.length,
                      );
                    }
                  }}
                  aria-label={`Ver imagem ${index + 1} de ${safeImages.length}`}
                  aria-pressed={selected}
                  data-active={selected}
                  className={cn(
                    "block aspect-square overflow-hidden rounded-sm bg-surface-raised outline-none w-25 h-25",
                    "ring-1 ring-offset-1 ring-offset-background focus-visible:ring-primary",
                    selected ? "ring-primary" : "ring-transparent",
                  )}
                >
                  <img
                    src={src}
                    alt=""
                    aria-hidden="true"
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <div className="aspect-square max-w-[444px] w-full max-h-[444px] overflow-hidden rounded-md bg-surface-card flex items-center justify-center">
        <img
          src={active}
          alt={alt}
          className="max-w-[404px] max-h-[404px] h-full w-full object-cover rounded-xl"
          loading="eager"
        />
      </div>
    </div>
  );
}
