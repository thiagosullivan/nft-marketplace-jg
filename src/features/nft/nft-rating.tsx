import { Star } from "lucide-react";
import { cn } from "@/shared/lib/utils";

type Props = {
  average: number;
  count: number;
};

export function NftRating({ average, count }: Props) {
  const rounded = Math.round(average * 2) / 2; // meia estrela
  const label =
    count > 0
      ? `Nota ${average.toLocaleString("pt-BR", {
          minimumFractionDigits: 1,
          maximumFractionDigits: 1,
        })} de 5, ${count} ${count === 1 ? "avaliação" : "avaliações"}`
      : "Sem avaliações";

  return (
    <div
      className="flex items-center gap-1.5 text-[15px] font-normal text-foreground"
      role="img"
      aria-label={label}
    >
      <div className="flex items-center gap-0.5" aria-hidden="true">
        {Array.from({ length: 5 }).map((_, i) => {
          const filled = i + 1 <= rounded;
          const half = !filled && i + 0.5 <= rounded;
          return (
            <Star
              key={i}
              className={cn(
                "size-3.5",
                filled
                  ? "fill-primary text-primary"
                  : half
                    ? "fill-secondary text-secondary"
                    : "",
              )}
            />
          );
        })}
      </div>
      <span aria-hidden="true">
        {/* {count > 0 ? `${average.toFixed(1)} (${count})` : "Sem avaliações"} */}
        {count > 0 ? `${count} avaliações de colecionadores` : "Sem avaliações"}
      </span>
    </div>
  );
}
