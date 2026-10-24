import { useId } from "react";
import type { NftEdition } from "@/shared/api/types";
import { cn } from "@/shared/lib/utils";

type Props = {
  editions: NftEdition[];
  selectedId: string;
  onChange: (editionId: string) => void;
};

function availabilityLabel(edition: NftEdition): string {
  if (edition.available <= 0) return "Esgotada";
  if (edition.isOpen) return "Ilimitada";
  return `${edition.available} ${edition.available === 1 ? "disponível" : "disponíveis"}`;
}

export function NftEditionSelector({ editions, selectedId, onChange }: Props) {
  const groupId = useId();
  const enabled = editions.filter((e) => e.available > 0);

  function move(direction: 1 | -1) {
    if (enabled.length === 0) return;
    const currentIndex = enabled.findIndex((e) => e.id === selectedId);
    const base = currentIndex >= 0 ? currentIndex : 0;
    const next = (base + direction + enabled.length) % enabled.length;
    onChange(enabled[next].id);
  }

  return (
    <div
      role="radiogroup"
      aria-labelledby={`${groupId}-label`}
      className="space-y-3 mb-3.5"
    >
      <p
        id={`${groupId}-label`}
        className="text-[15px] font-bold text-foreground"
      >
        Edição:
      </p>

      <div
        className="flex items-center gap-1.5"
        onKeyDown={(e) => {
          if (e.key === "ArrowRight" || e.key === "ArrowDown") {
            e.preventDefault();
            move(1);
          } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
            e.preventDefault();
            move(-1);
          }
        }}
      >
        {editions.map((edition) => {
          const isSelected = edition.id === selectedId;
          const isDisabled = edition.available <= 0;
          const inputId = `${groupId}-${edition.id}`;

          return (
            <label
              key={edition.id}
              htmlFor={inputId}
              className={cn(
                "relative flex cursor-pointer flex-col items-start gap-1 border px-3 py-2 text-left text-sm transition-colors rounded-[50%/50%]",
                "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-background",
                isDisabled
                  ? "cursor-not-allowed border-border text-secondary"
                  : isSelected
                    ? "border-primary bg-transparent text-accent"
                    : "border-border bg-transparent text-secondary hover:border-primary/60",
              )}
              aria-disabled={isDisabled || undefined}
            >
              <input
                id={inputId}
                type="radio"
                name={`${groupId}-edition`}
                value={edition.id}
                checked={isSelected}
                disabled={isDisabled}
                onChange={() => onChange(edition.id)}
                className="sr-only"
                aria-label={`Edição ${edition.label}, ${edition.priceEth} ETH, ${availabilityLabel(edition)}`}
              />
              <span className="font-semibold text-sm">{edition.label}</span>
            </label>
          );
        })}
      </div>
      {/* <span className="text-xs text-muted-foreground">
        {edition.priceEth} ETH
      </span>
      <span className="text-xs text-muted-foreground">
        {availabilityLabel(edition)}
      </span> */}

      {/* {selectedId && (
        <p className="sr-only" aria-live="polite">
          {(() => {
            const selected = editions.find((e) => e.id === selectedId);
            if (!selected) return "";
            return `Edição ${selected.label} selecionada. Preço ${selected.priceEth} ETH.`;
          })()}
        </p>
      )} */}
    </div>
  );
}
