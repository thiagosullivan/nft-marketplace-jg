import { Link, useNavigate } from "@tanstack/react-router";
import { Heart, Search, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import type { Nft } from "@/shared/api/types";
import { Badge } from "@/shared/components/ui/badge";

type Props = {
  nft: Nft;
  onQuickView?: (nft: Nft) => void;
};

export function NftCard({ nft, onQuickView }: Props) {
  const navigate = useNavigate();
  const isSoldOut = nft.available <= 0;

  return (
    <div className="group relative overflow-hidden rounded-lg border border-border bg-surface-card">
      <Link
        to="/nft/$id"
        params={{ id: nft.id }}
        className="block"
        aria-label={`Ver ${nft.name}`}
      >
        <div className="relative aspect-square overflow-hidden">
          <img
            src={nft.imageUrl}
            alt={nft.name}
            className="size-full object-cover transition-transform group-hover:scale-105"
            loading="lazy"
          />
          {nft.rarityLabel && (
            <Badge className="absolute left-2 top-2" variant="secondary">
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
        </div>
      </Link>

      <div className="pointer-events-none absolute right-2 top-2 flex flex-col gap-2 opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100 focus-within:pointer-events-auto focus-within:opacity-100">
        <button
          type="button"
          aria-label="Adicionar ao carrinho"
          className="rounded-full bg-background/80 p-2 hover:bg-primary hover:text-primary-foreground"
          onClick={(e) => {
            e.preventDefault();
            toast.info("Em breve: adicionar ao carrinho.");
          }}
        >
          <ShoppingCart className="size-4" />
        </button>
        <button
          type="button"
          aria-label="Favoritar"
          className="rounded-full bg-background/80 p-2 hover:bg-primary hover:text-primary-foreground"
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
          className="rounded-full bg-background/80 p-2 hover:bg-primary hover:text-primary-foreground"
          onClick={(e) => {
            e.preventDefault();
            if (onQuickView) onQuickView(nft);
            else void navigate({ to: "/nft/$id", params: { id: nft.id } });
          }}
        >
          <Search className="size-4" />
        </button>
      </div>

      <div className="space-y-1 p-3">
        <p className="truncate text-sm font-medium text-foreground">
          {nft.name}
        </p>
        <p className="text-xs text-muted-foreground">{nft.tokenId}</p>
        <p className="text-sm font-semibold text-primary">{nft.priceEth} ETH</p>
      </div>
    </div>
  );
}
