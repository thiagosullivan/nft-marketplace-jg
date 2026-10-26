import type { Nft, NftEdition } from "@/shared/api/types";
import { Button } from "@/shared/components/ui/button";
import { NftEditionSelector } from "./nft-edition-selector";
import { NftQuantityStepper } from "./nft-quantity-stepper";
import { NftRating } from "./nft-rating";
import { FaLinkedinIn, FaTwitter } from "react-icons/fa";
import { CiMail } from "react-icons/ci";

type Props = {
  nft: Nft;
  edition: NftEdition;
  onEditionChange: (editionId: string) => void;
  quantity: number;
  onQuantityChange: (value: number) => void;
  onBuy: () => void;
  buyPending?: boolean;
};

function editionMax(edition: NftEdition): number {
  return edition.isOpen ? 9999 : Math.max(1, edition.available);
}

export function NftInfoPanelMobile({
  nft,
  edition,
  onEditionChange,
  quantity,
  onQuantityChange,
  onBuy,
  buyPending,
}: Props) {
  const soldOut = edition.available <= 0;
  const max = editionMax(edition);

  return (
    <div className="space-y-6 w-full">
      <header className="space-y-3 mb-3 px-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-foreground">{nft.name}</h1>
          <div className="flex items-center border border-primary rounded-full p-1.5">
            <NftRating average={nft.rating.average} count={nft.rating.count} />
          </div>
        </div>
        <p className="text-secondary text-sm font-normal">{nft.about}</p>
        <NftEditionSelector
          editions={nft.editions}
          selectedId={edition.id}
          onChange={onEditionChange}
        />

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
      </header>

      {/* <div>
        <h3 className="mb-3 text-[15px] font-bold">Sobre este NFT:</h3>
        <p className="text-secondary text-sm font-normal">{nft.about}</p>
      </div> */}

      <div className="flex flex-col items-center justify-between rounded-4xl bg-surface-dark shadow-xl">
        <NftQuantityStepper
          value={Math.min(quantity, max)}
          min={1}
          max={max}
          onChange={onQuantityChange}
          disabled={soldOut}
          edition={edition}
        />

        <div className="flex-wrap gap-2 hidden md:flex">
          <Button
            type="button"
            onClick={onBuy}
            disabled={soldOut || buyPending}
            aria-disabled={soldOut || buyPending || undefined}
            className="min-h-10 w-[130px] rounded-sm text-sm font-bold text-ink uppercase cursor-pointer"
          >
            {soldOut ? "Esgotado" : buyPending ? "Adicionando..." : "Comprar"}
          </Button>
        </div>
        <div className="flex md:hidden flex-wrap gap-2 w-full px-6 mb-6">
          <Button
            type="button"
            onClick={onBuy}
            disabled={soldOut || buyPending}
            aria-disabled={soldOut || buyPending || undefined}
            className="min-h-15 w-full rounded-full text-sm font-bold text-ink uppercase cursor-pointer"
          >
            {soldOut ? "Esgotado" : buyPending ? "Adicionando..." : "Comprar"}
          </Button>
        </div>
      </div>

      <div className="text-foreground text-[15px] font-bold items-center gap-2 hidden md:flex">
        <p>Compartilhar este NFT:</p>
        <FaLinkedinIn className="h-4.5 cursor-pointer" />
        <CiMail className="h-4.5 cursor-pointer" />
        <FaTwitter className="h-4.5 cursor-pointer" />
      </div>
    </div>
  );
}
