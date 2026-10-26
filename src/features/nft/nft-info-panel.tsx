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

      <NftEditionSelector
        editions={nft.editions}
        selectedId={edition.id}
        onChange={onEditionChange}
      />

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
    </div>
  );
}
