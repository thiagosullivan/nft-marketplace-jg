import type { Nft, NftEdition } from "@/shared/api/types";
import { NftGallery } from "./nft-gallery";
import { NftInfoPanel } from "./nft-info-panel";
import { NftTabs } from "./nft-tabs";

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

  return (
    <div className="container mx-auto max-w-6xl px-4 py-10">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
        <NftGallery images={gallery} alt={nft.name} />
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
      <div className="mt-12">
        <NftTabs
          details={
            <div className="space-y-6">
              <section aria-labelledby="details-title" className="space-y-2">
                <h2
                  id="details-title"
                  className="text-lg font-semibold text-foreground"
                >
                  Detalhes
                </h2>
                <p className="whitespace-pre-line text-sm text-muted-foreground">
                  {nft.details}
                </p>
              </section>

              <section aria-labelledby="about-title" className="space-y-2">
                <h2
                  id="about-title"
                  className="text-lg font-semibold text-foreground"
                >
                  Sobre
                </h2>
                <p className="text-sm text-muted-foreground">{nft.about}</p>
              </section>

              <section aria-labelledby="network-title" className="space-y-2">
                <h2
                  id="network-title"
                  className="text-lg font-semibold text-foreground"
                >
                  Rede
                </h2>
                <p className="text-sm text-muted-foreground">
                  {nft.networkDescription}
                </p>
                {nft.ipfsMetadataUri && (
                  <p className="text-sm text-muted-foreground">
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
                  className="text-lg font-semibold text-foreground"
                >
                  Contrato
                </h2>
                <p className="text-sm text-muted-foreground">
                  {nft.contractDescription}
                </p>
                <p className="text-sm text-muted-foreground">
                  Endereço:{" "}
                  <code className="break-all text-foreground">
                    <AddressInline address={nft.contractAddress} />
                  </code>
                </p>
              </section>

              <section aria-labelledby="royalty-title" className="space-y-2">
                <h2
                  id="royalty-title"
                  className="text-lg font-semibold text-foreground"
                >
                  Direitos autorais
                </h2>
                <p className="text-sm text-muted-foreground">
                  {nft.royaltyDescription}
                </p>
              </section>

              <section aria-labelledby="facts-title" className="space-y-2">
                <h2
                  id="facts-title"
                  className="text-lg font-semibold text-foreground"
                >
                  Ficha técnica
                </h2>
                <dl className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-muted-foreground">ID do token</dt>
                    <dd className="text-foreground">{nft.tokenId}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Coleção</dt>
                    <dd className="text-foreground">{nft.collection}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Rede</dt>
                    <dd className="capitalize text-foreground">
                      {nft.network}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Criador</dt>
                    <dd className="text-foreground">{nft.creator.name}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Proprietário</dt>
                    <dd className="text-foreground">{nft.owner.name}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Royalties</dt>
                    <dd className="text-foreground">{nft.royaltyPercent}%</dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-muted-foreground">Atributos</dt>
                    <dd className="text-foreground">
                      {nft.attributes.join(", ")}
                    </dd>
                  </div>
                </dl>
              </section>
            </div>
          }
        />
      </div>
    </div>
  );
}
