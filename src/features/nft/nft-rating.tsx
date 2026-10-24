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
      className="flex items-center gap-2 text-sm text-muted-foreground"
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
                "size-4",
                filled
                  ? "fill-primary text-primary"
                  : half
                    ? "fill-primary/50 text-primary"
                    : "text-border",
              )}
            />
          );
        })}
      </div>
      <span aria-hidden="true">
        {count > 0 ? `${average.toFixed(1)} (${count})` : "Sem avaliações"}
      </span>
    </div>
  );
}
