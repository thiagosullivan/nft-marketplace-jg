import type { NftFacets, NftNetwork } from "@/shared/api/types";
import { Button } from "@/shared/components/ui/button";
import { PriceRange } from "./price-range";
import { cn } from "@/shared/lib/utils";

export type FiltersValue = {
  collections: string[];
  networks: NftNetwork[];
  minPriceEth?: string;
  maxPriceEth?: string;
};

type Props = {
  facets: NftFacets | undefined;
  value: FiltersValue;
  onChange: (next: FiltersValue) => void;
  onClear: () => void;
};

const NETWORK_LABELS: Record<NftNetwork, string> = {
  ethereum: "Ethereum",
  polygon: "Polygon",
  solana: "Solana",
};

function toggle<T extends string>(list: T[], item: T): T[] {
  return list.includes(item) ? list.filter((x) => x !== item) : [...list, item];
}

export function FiltersSidebar({ facets, value, onChange, onClear }: Props) {
  const min = facets ? Number(facets.priceRange.minEth) : 0.02;
  const max = facets ? Number(facets.priceRange.maxEth) : 12.3;
  const priceValue: [number, number] = [
    value.minPriceEth ? Number(value.minPriceEth) : min,
    value.maxPriceEth ? Number(value.maxPriceEth) : max,
  ];

  const hasActive =
    value.collections.length > 0 ||
    value.networks.length > 0 ||
    value.minPriceEth !== undefined ||
    value.maxPriceEth !== undefined;

  return (
    <div className="bg-surface-card p-5">
      {hasActive && (
        <div className="flex items-center justify-end">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="text-xs text-muted-foreground hover:text-primary"
          >
            Limpar
          </Button>
        </div>
      )}
      <div className="space-y-10">
        {/* Coleções */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold tracking-wide text-foreground">
            Coleções
          </h3>
          <ul className="space-y-2 px-3">
            {facets?.collections.map((c) => {
              const checked = value.collections.includes(c.value);
              return (
                <li key={c.value}>
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={checked}
                    onClick={() =>
                      onChange({
                        ...value,
                        collections: toggle(value.collections, c.value),
                      })
                    }
                    className={cn(
                      "flex w-full items-center justify-between gap-2 rounded-sm px-1 py-1 text-left text-[15px] font-normal transition-colors",
                      checked
                        ? "text-accent"
                        : "text-secondary hover:text-accent",
                    )}
                  >
                    <span className="flex-1">{c.value}</span>
                    <span
                      className={cn(
                        "text-xs",
                        checked ? "text-accent" : "text-muted-foreground",
                      )}
                    >
                      ({c.count})
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Faixa de preço */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold tracking-wide text-foreground">
            Faixa de preço
          </h3>
          <div className="px-3">
            <PriceRange
              min={min}
              max={max}
              value={priceValue}
              onChange={(next) =>
                onChange({
                  ...value,
                  minPriceEth: next[0].toFixed(2),
                  maxPriceEth: next[1].toFixed(2),
                })
              }
            />
          </div>
        </div>

        {/* Rede */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold tracking-wide text-foreground">
            Rede
          </h3>
          <ul className="space-y-2 px-3">
            {facets?.networks.map((n) => {
              const network = n.value as NftNetwork;
              const checked = value.networks.includes(network);
              return (
                <li key={n.value}>
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={checked}
                    onClick={() =>
                      onChange({
                        ...value,
                        networks: toggle(value.networks, network),
                      })
                    }
                    className={cn(
                      "flex w-full items-center justify-between gap-2 rounded-sm px-1 py-1 text-left text-[15px] font-normal transition-colors",
                      checked
                        ? "text-accent"
                        : "text-secondary hover:text-accent",
                    )}
                  >
                    <span className="flex-1">
                      {NETWORK_LABELS[network] ?? network}
                    </span>
                    <span
                      className={cn(
                        "text-xs",
                        checked ? "text-accent" : "text-muted-foreground",
                      )}
                    >
                      ({n.count})
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
