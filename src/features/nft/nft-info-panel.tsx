import type { Nft, NftEdition } from "@/shared/api/types";
import { Button } from "@/shared/components/ui/button";
import { useToggleFavorite } from "@/features/favorites";
import { NftEditionSelector } from "./nft-edition-selector";
import { NftQuantityStepper } from "./nft-quantity-stepper";
import { NftRating } from "./nft-rating";
import { NftShareMenu } from "./nft-share-menu";

type Props = {
  nft: Nft;
  edition: NftEdition;
  onEditionChange: (editionId: string) => void;
  quantity: number;
  onQuantityChange: (value: number) => void;
  onBuy: () => void;
  buyPending?: boolean;
};

function truncateAddress(address: string): string {
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

function editionMax(edition: NftEdition): number {
  return edition.isOpen ? 9999 : Math.max(1, edition.available);
}

export function NftInfoPanel({
  nft,
  edition,
  onEditionChange,
  quantity,
  onQuantityChange,
  onBuy,
  buyPending,
}: Props) {
  const {
    toggle,
    isPending: favoritePending,
    isFavorite,
  } = useToggleFavorite();
  const isFav = isFavorite(nft.id);
  const soldOut = edition.available <= 0;
  const max = editionMax(edition);

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-sm text-muted-foreground">{nft.collection}</p>
        <h1 className="text-3xl font-bold text-primary">{nft.name}</h1>
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span>Token {nft.tokenId}</span>
          {nft.rarityLabel && (
            <span className="rounded-sm bg-surface-raised px-2 py-0.5 text-xs font-semibold text-accent">
              {nft.rarityLabel}
            </span>
          )}
          <span title={nft.contractAddress}>
            Contrato {truncateAddress(nft.contractAddress)}
          </span>
          <span>Royalties {nft.royaltyPercent}%</span>
        </div>
        <NftRating average={nft.rating.average} count={nft.rating.count} />
      </header>

      <NftEditionSelector
        editions={nft.editions}
        selectedId={edition.id}
        onChange={onEditionChange}
      />

      <section aria-label="Preço" className="space-y-1">
        <p className="text-sm text-muted-foreground">
          Preço atual · edição {edition.label}
        </p>
        <p className="text-2xl font-bold text-foreground">
          {edition.priceEth} <span className="text-base font-medium">ETH</span>
        </p>
      </section>

      <NftQuantityStepper
        value={Math.min(quantity, max)}
        min={1}
        max={max}
        onChange={onQuantityChange}
        disabled={soldOut}
      />

      <div className="flex flex-wrap gap-3">
        <Button
          type="button"
          onClick={onBuy}
          disabled={soldOut || buyPending}
          aria-disabled={soldOut || buyPending || undefined}
          className="min-h-11 flex-1"
        >
          {soldOut ? "Esgotado" : buyPending ? "Adicionando..." : "Comprar"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => void toggle(nft)}
          disabled={favoritePending}
          aria-pressed={isFav}
          aria-label={
            isFav ? "Remover dos favoritos" : "Adicionar aos favoritos"
          }
          className="min-h-11"
        >
          {isFav ? "Favoritado" : "Favoritar"}
        </Button>
        <NftShareMenu title={nft.name} />
      </div>

      <section aria-labelledby="nft-description-title" className="space-y-2">
        <h2
          id="nft-description-title"
          className="text-lg font-semibold text-foreground"
        >
          Descrição
        </h2>
        <p className="text-sm text-muted-foreground">{nft.description}</p>
      </section>

      {nft.attributes.length > 0 && (
        <section aria-labelledby="nft-attributes-title" className="space-y-3">
          <h2
            id="nft-attributes-title"
            className="text-lg font-semibold text-foreground"
          >
            Atributos
          </h2>
          <ul className="grid grid-cols-2 gap-3">
            {nft.attributes.map((attribute, index) => (
              <li
                key={`${attribute}-${index}`}
                className="rounded-md border border-border bg-surface-card p-3"
              >
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Atributo
                </p>
                <p className="text-sm font-medium text-foreground">
                  {attribute}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
