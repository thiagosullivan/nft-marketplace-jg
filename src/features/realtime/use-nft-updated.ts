import { useQueryClient } from "@tanstack/react-query";
import type { Cart, Nft } from "@/shared/api/types";
import { cartKeys, nftKeys, quoteKeys } from "@/shared/api/query-keys";
import {
  useSocketEvent,
  type SocketEventEnvelope,
} from "@/shared/socket/use-socket-event";

type NftUpdatedPayload = {
  priceEth: string;
  available: number;
  editions: Nft["editions"];
};

export function useNftUpdated(): void {
  const queryClient = useQueryClient();

  useSocketEvent<NftUpdatedPayload>(
    "nft.updated",
    ({ id, version, payload }: SocketEventEnvelope<NftUpdatedPayload>) => {
      queryClient.setQueryData<Nft | undefined>(nftKeys.detail(id), (prev) =>
        prev && prev.version < version
          ? {
              ...prev,
              priceEth: payload.priceEth,
              available: payload.available,
              editions: payload.editions,
              version,
            }
          : prev,
      );

      queryClient.setQueryData<Cart>(cartKeys.current(), (prev) =>
        prev
          ? {
              ...prev,
              items: prev.items.map((item) =>
                item.nftId === id
                  ? {
                      ...item,
                      unitPriceEth: payload.priceEth,
                      maxAvailable: payload.available,
                    }
                  : item,
              ),
              updatedAt: new Date().toISOString(),
            }
          : prev,
      );

      // Força o refetch de todas as queries de lista. O `keepPreviousData`
      // mantém o placeholder durante o fetch, mas quando ele termina, o
      // `data` é o novo (com 9.99 do db atualizado). O `refetchType: "all"`
      // força mesmo as queries inativas (ex.: quando o HomePage não está
      // montado, como no teste que abre o /cart antes).
      void queryClient.invalidateQueries({
        queryKey: nftKeys.all,
        refetchType: "all",
      });

      void queryClient.invalidateQueries({ queryKey: quoteKeys.all });
    },
  );
}
