import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Heart, Search } from "lucide-react";
import { toast } from "sonner";
import type { Nft } from "@/shared/api/types";
import { nftKeys } from "@/shared/api/query-keys";
import { Badge } from "@/shared/components/ui/badge";
import { useAddToCart } from "@/features/cart";
import { useToggleFavorite } from "@/features/favorites";
import { cn } from "@/shared/lib/utils";
import { useNftAvailability } from "./use-nft-availability";
import CartIcon from "../../../public/icons/cart-icon.png";

type Props = {
  nft: Nft;
  onQuickView?: (nft: Nft) => void;
  priority?: boolean;
};

function cardImageUrl(imageUrl: string): string {
  return imageUrl.replace(/\.webp$/, "-250.webp");
}

export function NftCard({ nft, onQuickView, priority = false }: Props) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { add } = useAddToCart();
  const {
    toggle,
    isFavorite,
    isPending: favoritePending,
  } = useToggleFavorite();
  const { edition, canAdd, isSoldOut, reachedMaxInCart } =
    useNftAvailability(nft);

  const showSoldOut = isSoldOut || reachedMaxInCart;
  const isFav = isFavorite(nft.id);

  const onBuy = async () => {
    if (!canAdd || !edition) return;

    queryClient.setQueryData(nftKeys.detail(nft.id), nft);

    try {
      await add({
        nftId: nft.id,
        editionId: edition.id,
        quantity: 1,
      });
    } catch {
      toast.error("Não foi possível adicionar ao carrinho.");
    } finally {
      toast.success("Produto adicionado ao carrinho.");
    }
  };

  const onToggleFavorite = async () => {
    try {
      await toggle(nft);
    } catch {
      toast.error("Não foi possível atualizar favoritos.");
    }
  };

  return (
    <div className="max-w-[260px] w-full group relative overflow-hidden">
      <Link to="/nft/$id" params={{ id: nft.id }} className="block">
        <div className="relative max-w-[200px] md:max-w-[250px] overflow-hidden">
          <div className="flex bg-surface-card px-1 pt-3 md:pt-7.5 pb-5 mb-2 md:mb-3 rounded-lg md:rounded-none">
            <img
              src={cardImageUrl(nft.imageUrl)}
              alt={nft.name}
              className="size-full object-cover transition-transform group-hover:bg-ink/70"
              loading={priority ? "eager" : "lazy"}
              fetchPriority={priority ? "high" : "auto"}
              width={250}
              height={250}
            />
          </div>
          {nft.rarityLabel && (
            <Badge className="absolute left top-3.5 w-20 h-7.5 rounded-none text-ink text-base font-medium bg-primary">
              {nft.rarityLabel}
            </Badge>
          )}
          {showSoldOut && (
            <div className="absolute inset-0 flex items-center justify-center bg-ink/60">
              <span className="text-sm font-semibold text-foreground">
                Esgotado
              </span>
            </div>
          )}
          <div className="pointer-events-none absolute bottom-0 -translate-y-1/2 left-1/2 -translate-x-1/2 hidden md:flex gap-x-2.5 opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100 focus-within:pointer-events-auto focus-within:opacity-100">
            <button
              type="button"
              aria-label="Adicionar ao carrinho"
              disabled={!canAdd}
              className="rounded-xs bg-surface-raised p-1.5 border-border hover:bg-primary hover:text-primary-foreground cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                void onBuy();
              }}
            >
              <img src={CartIcon} width={20} height={20} alt="" />
            </button>
            <button
              type="button"
              aria-label={isFav ? "Remover favorito" : "Favoritar"}
              aria-pressed={isFav}
              disabled={favoritePending}
              className={cn(
                "rounded-xs bg-surface-raised p-1.5 border-border hover:bg-primary hover:text-primary-foreground cursor-pointer",
                isFav && "text-primary",
              )}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                void onToggleFavorite();
              }}
            >
              <Heart
                className={cn("size-4", isFav && "fill-primary")}
                aria-hidden
              />
            </button>
            <button
              type="button"
              aria-label="Ver detalhes"
              className="rounded-xs bg-surface-raised p-1.5 border-border hover:bg-primary hover:text-primary-foreground cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (onQuickView) onQuickView(nft);
                else void navigate({ to: "/nft/$id", params: { id: nft.id } });
              }}
            >
              <Search className="size-4" />
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-y-px md:gap-y-3">
          <p className="truncate text-base font-normal text-foreground">
            {nft.name}
          </p>
          <p className="text-base font-bold text-accent">{nft.priceEth} ETH</p>
        </div>
      </Link>
    </div>
  );
}
