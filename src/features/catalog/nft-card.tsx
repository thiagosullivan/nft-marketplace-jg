import { Link, useNavigate } from "@tanstack/react-router";
import { Heart, Search } from "lucide-react";
import { toast } from "sonner";
import type { Nft } from "@/shared/api/types";
import { Badge } from "@/shared/components/ui/badge";
import CartIcon from "../../../public/icons/cart-icon.png";

type Props = {
  nft: Nft;
  onQuickView?: (nft: Nft) => void;
};

export function NftCard({ nft, onQuickView }: Props) {
  const navigate = useNavigate();
  const isSoldOut = nft.available <= 0;

  return (
    <div className="max-w-[260px] w-full group relative overflow-hidden">
      <Link
        to="/nft/$id"
        params={{ id: nft.id }}
        className="block"
        aria-label={`Ver ${nft.name}`}
      >
        <div className="relative max-w-[250px] overflow-hidden">
          <div className="flex bg-surface-card px-1 pt-7.5 pb-5 mb-3">
            <img
              src={nft.imageUrl}
              alt={nft.name}
              className="size-full object-cover transition-transform group-hover:bg-ink/70"
              loading="lazy"
            />
          </div>
          {nft.rarityLabel && (
            <Badge className="absolute left top-3.5 w-20 h-7.5] rounded-none text-ink text-base font-medium bg-primary">
              {nft.rarityLabel}
            </Badge>
          )}
          {isSoldOut && (
            <div className="absolute inset-0 flex items-center justify-center bg-ink/60">
              <span className="text-sm font-semibold text-foreground">
                Esgotado
              </span>
            </div>
          )}
          <div className="pointer-events-none absolute bottom-0 -translate-y-1/2 left-1/2 -translate-x-1/2 flex gap-x-2.5 opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100 focus-within:pointer-events-auto focus-within:opacity-100">
            <button
              type="button"
              aria-label="Adicionar ao carrinho"
              className="rounded-xs bg-surface-raised p-1.5 border-border hover:bg-primary hover:text-primary-foreground cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                toast.info("Em breve: adicionar ao carrinho.");
              }}
            >
              <img src={CartIcon} className="w-5 h-5" />
            </button>
            <button
              type="button"
              aria-label="Favoritar"
              className="rounded-xs bg-surface-raised p-1.5 border-border hover:bg-primary hover:text-primary-foreground cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                toast.info("Em breve: favoritar.");
              }}
            >
              <Heart className="size-4" />
            </button>
            <button
              type="button"
              aria-label="Ver detalhes"
              className="rounded-xs bg-surface-raised p-1.5 border-border hover:bg-primary hover:text-primary-foreground cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                if (onQuickView) onQuickView(nft);
                else void navigate({ to: "/nft/$id", params: { id: nft.id } });
              }}
            >
              <Search className="size-4" />
            </button>
          </div>
        </div>
      </Link>

      <div className="flex flex-col gap-y-3">
        <p className="truncate text-base font-normal text-foreground">
          {nft.name}
        </p>
        {/* <p className="text-xs text-muted-foreground">{nft.tokenId}</p> */}
        <p className="text-base font-bold text-accent">{nft.priceEth} ETH</p>
      </div>
    </div>
  );
}
