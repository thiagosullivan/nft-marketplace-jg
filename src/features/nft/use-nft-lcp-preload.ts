import { useEffect } from "react";

/**
 * Deriva o caminho da imagem LCP do detalhe a partir do id do NFT.
 *
 * Regra atual dos fixtures: nft-001 → prod-1, nft-002 → prod-2, ...
 * Os NFTs 005..036 reutilizam uma das 4 imagens (ciclo (n - 1) % 4 + 1).
 * Isso precisa ficar em sincronia com o imageUrl dos fixtures
 * (src/mocks/fixtures/nfts.ts) e com o helper usado no NftGallery.
 */
function detailImagePath(nftId: string): string {
  const raw = nftId.split("-")[1] ?? "1";
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) return "/nfts/prod-1-444.webp";
  const index = ((n - 1) % 4) + 1;
  return `/nfts/prod-${index}-444.webp`;
}

/**
 * Injeta <link rel="preload" as="image" fetchpriority="high"> para a
 * imagem LCP do detalhe, antes do fetch do NFT resolver.
 *
 * O link é removido no cleanup (troca de rota / unmount) para não
 * acumular preloads no <head>.
 */
export function useNftLcpPreload(nftId: string): void {
  useEffect(() => {
    if (!nftId) return;

    const href = detailImagePath(nftId);

    // Evita duplicar se já existir um preload para o mesmo href.
    const existing = document.head.querySelector<HTMLLinkElement>(
      `link[rel="preload"][as="image"][href="${href}"]`,
    );
    if (existing) return;

    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "image";
    link.href = href;
    link.fetchPriority = "high";
    link.dataset.nftLcp = nftId;
    document.head.appendChild(link);

    return () => {
      link.remove();
    };
  }, [nftId]);
}
