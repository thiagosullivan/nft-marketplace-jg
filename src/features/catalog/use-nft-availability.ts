import { useMemo } from "react";
import type { Nft, NftEdition } from "@/shared/api/types";
import { useCart } from "@/features/cart";

function defaultEditionOf(nft: Nft): NftEdition | undefined {
  return nft.editions.find((e) => e.available > 0) ?? nft.editions[0];
}

export function useNftAvailability(nft: Nft) {
  const { data: cart } = useCart();

  return useMemo(() => {
    const edition = defaultEditionOf(nft);
    if (!edition) {
      return {
        edition: undefined,
        maxAvailable: 0,
        inCart: 0,
        isSoldOut: true,
        reachedMaxInCart: true,
        canAdd: false,
      };
    }

    const maxAvailable = edition.isOpen ? 9999 : Math.max(0, edition.available);

    const inCart = (cart?.items ?? [])
      .filter((i) => i.nftId === nft.id && i.editionId === edition.id)
      .reduce((acc, i) => acc + i.quantity, 0);

    const isSoldOut = nft.available <= 0 || edition.available <= 0;
    const reachedMaxInCart = inCart >= maxAvailable;
    const canAdd = !isSoldOut && !reachedMaxInCart;

    return {
      edition,
      maxAvailable,
      inCart,
      isSoldOut,
      reachedMaxInCart,
      canAdd,
    };
  }, [nft, cart]);
}
