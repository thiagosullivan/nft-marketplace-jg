import type { Nft, NftEdition } from "@/shared/api/types";
import { Button } from "@/shared/components/ui/button";
import { useToggleFavorite } from "@/features/favorites";
import { NftEditionSelector } from "./nft-edition-selector";
import { NftQuantityStepper } from "./nft-quantity-stepper";
import { NftRating } from "./nft-rating";
import { FaHeart, FaLinkedinIn, FaRegHeart, FaTwitter } from "react-icons/fa";
import { CiMail } from "react-icons/ci";
import { toast } from "sonner";

type Props = {
  nft: Nft;
  edition: NftEdition;
  onEditionChange: (editionId: string) => void;
  quantity: number;
  onQuantityChange: (value: number) => void;
  onBuy: () => void;
  buyPending?: boolean;
};

// function truncateAddress(address: string): string {
//   if (address.length <= 12) return address;
//   return `${address.slice(0, 6)}…${address.slice(-4)}`;
// }

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

  const onToggleFavorite = async () => {
    const wasFavorite = isFav;
    try {
      await toggle(nft);
      toast.success(
        wasFavorite ? "Removido dos favoritos." : "Adicionado aos favoritos.",
      );
    } catch {
      toast.error(
        wasFavorite
          ? "Não foi possível remover dos favoritos."
          : "Não foi possível adicionar aos favoritos.",
      );
    }
  };

  return (
    <div className="space-y-6 w-full">
      <header className="space-y-2 mb-3">
        {/* <p className="text-sm text-muted-foreground">{nft.collection}</p> */}
        <h1 className="text-[28px] font-bold text-foreground">{nft.name}</h1>
        <div className="flex items-center justify-between border-b border-border pb-3">
          <p className="text-accent text-[22px] font-bold">
            {edition.priceEth} ETH
          </p>
          <div className="flex items-center">
            <NftRating average={nft.rating.average} count={nft.rating.count} />
          </div>
        </div>
      </header>
      <div>
        <h3 className="mb-3 text-[15px] font-bold">Sobre este NFT:</h3>
        <p className="text-secondary text-sm font-normal">{nft.about}</p>
      </div>
      {/* <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
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
        </div> */}

      <NftEditionSelector
        editions={nft.editions}
        selectedId={edition.id}
        onChange={onEditionChange}
      />

      {/* <section aria-label="Preço" className="space-y-1">
        <p className="text-sm text-muted-foreground">
          Preço atual · edição {edition.label}
        </p>
        <p className="text-2xl font-bold text-foreground">
          {edition.priceEth} <span className="text-base font-medium">ETH</span>
        </p>
      </section> */}

      <div className="flex items-center justify-between">
        <NftQuantityStepper
          value={Math.min(quantity, max)}
          min={1}
          max={max}
          onChange={onQuantityChange}
          disabled={soldOut}
        />

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            onClick={onBuy}
            disabled={soldOut || buyPending}
            aria-disabled={soldOut || buyPending || undefined}
            className="min-h-10 w-[130px] rounded-sm text-sm font-bold text-ink uppercase cursor-pointer"
          >
            {soldOut ? "Esgotado" : buyPending ? "Adicionando..." : "Comprar"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => void onToggleFavorite()}
            disabled={favoritePending}
            aria-pressed={isFav}
            aria-label={
              isFav ? "Remover dos favoritos" : "Adicionar aos favoritos"
            }
            className={`min-h-10 ${isFav ? "w-[180px]" : "w-[130px]"} rounded-sm text-sm font-medium border border-accent! text-accent bg-transparent! hover:text-accent cursor-pointer`}
          >
            {isFav ? <FaHeart /> : <FaRegHeart />}

            {isFav ? "Remover favorito" : "Favoritar"}
          </Button>
          {/* <NftShareMenu title={nft.name} /> */}
        </div>
      </div>

      <div className="text-secondary text-[15px] font-normal space-y-3 mb-3">
        <p>ID do token: {nft.tokenId}</p>
        <p>Coleção: {nft.collection}</p>
        <div className="flex items-center gap-2">
          <p>Atributos:</p>
          {nft.attributes.length > 0 && (
            <div className="flex items-center">
              {nft.attributes.map((attribute, index) => (
                <p key={index}>{attribute}, </p>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="text-foreground text-[15px] font-bold flex items-center gap-2">
        <p>Compartilhar este NFT:</p>
        <FaLinkedinIn className="h-4.5 cursor-pointer" />
        <CiMail className="h-4.5 cursor-pointer" />
        <FaTwitter className="h-4.5 cursor-pointer" />
      </div>

      {/* <section aria-labelledby="nft-description-title" className="space-y-2">
        <h2
          id="nft-description-title"
          className="text-lg font-semibold text-foreground"
        >
          Descrição
        </h2>
        <p className="text-sm text-muted-foreground">{nft.description}</p>
      </section> */}

      {/* {nft.attributes.length > 0 && (
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
      )} */}
    </div>
  );
}
