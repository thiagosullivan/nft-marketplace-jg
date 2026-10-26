import type { Nft, NftEdition } from "@/shared/api/types";
import { NftGallery } from "./nft-gallery";
import { NftInfoPanel } from "./nft-info-panel";
import { NftTabs } from "./nft-tabs";
import { Link, useNavigate } from "@tanstack/react-router";
import { NftRelatedSection } from "./nft-related-section";
import { Button } from "@/shared/components/ui/button";
import { useToggleFavorite } from "../favorites";
import { toast } from "sonner";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { RiArrowLeftSLine } from "react-icons/ri";
import { NftInfoPanelMobile } from "./nft-info-panel-mobile";

type Props = {
  nft: Nft;
  edition: NftEdition;
  onEditionChange: (editionId: string) => void;
  quantity: number;
  onQuantityChange: (value: number) => void;
  onBuy: () => void;
  buyPending?: boolean;
};

function AddressInline({ address }: { address: string }) {
  const short =
    address.length > 12
      ? `${address.slice(0, 6)}…${address.slice(-4)}`
      : address;
  return <span title={address}>{short}</span>;
}

export function NftDetailView({
  nft,
  edition,
  onEditionChange,
  quantity,
  onQuantityChange,
  onBuy,
  buyPending,
}: Props) {
  const gallery = nft.galleryUrls.length > 0 ? nft.galleryUrls : [nft.imageUrl];
  const navigate = useNavigate();

  const {
    toggle,
    isPending: favoritePending,
    isFavorite,
  } = useToggleFavorite();
  const isFav = isFavorite(nft.id);

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
    <div className="container mx-auto max-w-300 pt-6 md:pt-10 bg-surface-raised md:bg-transparent">
      <div className="px-4 hidden md:block mb-3 text-foreground text-[15px] font-bold">
        <Link to="/">Início /</Link>
        <Link to="/"> Mercado</Link>
      </div>
      <div className="hidden md:flex flex-col md:flex-row md:gap-8 items-start mb-24">
        <div className="max-w-[575px] w-full mx-auto">
          <NftGallery images={gallery} alt={nft.name} />
        </div>
        <div className="flex-1 max-w-[595px] w-full hidden md:block">
          <NftInfoPanel
            nft={nft}
            edition={edition}
            onEditionChange={onEditionChange}
            quantity={quantity}
            onQuantityChange={onQuantityChange}
            onBuy={onBuy}
            buyPending={buyPending}
          />
        </div>
        <div className="flex-1 w-full block md:hidden bg-surface-card pt-8 rounded-t-4xl">
          <NftInfoPanelMobile
            nft={nft}
            edition={edition}
            onEditionChange={onEditionChange}
            quantity={quantity}
            onQuantityChange={onQuantityChange}
            onBuy={onBuy}
            buyPending={buyPending}
          />
        </div>
      </div>
      <div className="flex flex-col md:flex-row md:gap-8 items-start mb-24 md:hidden">
        <div className="flex justify-between items-center w-full px-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => void navigate({ to: "/" })}
            className="mb-3 rounded-full w-[35px] h-[35px] text-sm font-medium border border-border! text-accent bg-surface-raised! hover:text-accent cursor-pointer md:hidden"
          >
            <RiArrowLeftSLine />
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
            className="ml-auto mb-3 rounded-full w-[35px] h-[35px] text-sm font-medium border border-border! text-accent bg-surface-raised! hover:text-accent cursor-pointer md:hidden"
          >
            {isFav ? <FaHeart /> : <FaRegHeart />}
          </Button>
        </div>
        <div className="max-w-[575px] w-full mx-auto">
          <NftGallery images={gallery} alt={nft.name} />
        </div>
        <div className="flex-1 max-w-[595px] w-full hidden md:block">
          <NftInfoPanel
            nft={nft}
            edition={edition}
            onEditionChange={onEditionChange}
            quantity={quantity}
            onQuantityChange={onQuantityChange}
            onBuy={onBuy}
            buyPending={buyPending}
          />
        </div>
        <div className="flex-1 w-full block md:hidden bg-surface-card pt-8 rounded-t-4xl">
          <NftInfoPanelMobile
            nft={nft}
            edition={edition}
            onEditionChange={onEditionChange}
            quantity={quantity}
            onQuantityChange={onQuantityChange}
            onBuy={onBuy}
            buyPending={buyPending}
          />
        </div>
      </div>
      <div className="">
        <NftTabs
          details={
            <div className="space-y-6">
              <section aria-labelledby="details-title" className="space-y-3">
                <p className="whitespace-pre-line text-sm text-secondary">
                  {nft.details}
                </p>
              </section>

              <section aria-labelledby="network-title" className="space-y-2">
                <h2
                  id="network-title"
                  className="text-sm font-bold text-foreground"
                >
                  Rede
                </h2>
                <p className="text-sm text-secondary">
                  {nft.networkDescription}
                </p>
                {nft.ipfsMetadataUri && (
                  <p className="text-sm text-secondary">
                    Metadados:{" "}
                    <code className="break-all text-foreground">
                      {nft.ipfsMetadataUri}
                    </code>
                  </p>
                )}
              </section>

              <section aria-labelledby="contract-title" className="space-y-2">
                <h2
                  id="contract-title"
                  className="text-sm font-bold text-foreground"
                >
                  Contrato
                </h2>
                <p className="text-sm text-secondary">
                  {nft.contractDescription}
                </p>
                <p className="text-sm text-secondary">
                  Endereço:{" "}
                  <code className="break-all text-foreground">
                    <AddressInline address={nft.contractAddress} />
                  </code>
                </p>
              </section>

              <section aria-labelledby="royalty-title" className="space-y-2">
                <h2
                  id="royalty-title"
                  className="text-sm font-bold text-foreground"
                >
                  Direitos autorais
                </h2>
                <p className="text-sm text-secondary">
                  {nft.royaltyDescription}
                </p>
              </section>
            </div>
          }
        />
      </div>

      <NftRelatedSection nft={nft} />
    </div>
  );
}
