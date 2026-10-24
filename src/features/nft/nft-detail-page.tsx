import { Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { isApiError, isNotFound } from "@/shared/api";
import { Button } from "@/shared/components/ui/button";
import { NftDetailSkeleton } from "./nft-detail-skeleton";
import { useNft } from "./use-nft";
import type { Nft } from "@/shared/api/types";

type Props = {
  id: string;
};

export function NFTDetailPage({ id }: Props) {
  const query = useNft(id);

  useEffect(() => {
    if (query.data) {
      document.title = `${query.data.name} · NFT Marketplace`;
    } else {
      document.title = "Detalhe do NFT · NFT Marketplace";
    }
  }, [query.data]);

  if (query.isLoading) return <NftDetailSkeleton />;

  if (query.isError) {
    if (isNotFound(query.error)) {
      return <NotFoundState id={id} />;
    }
    return (
      <ErrorState
        message={getErrorMessage(query.error)}
        onRetry={() => void query.refetch()}
      />
    );
  }

  if (!query.data) return <NotFoundState id={id} />;

  return <NftDetailView nft={query.data} />;
}

function NftDetailView({ nft }: { nft: Nft }) {
  return (
    <div className="container mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-3xl font-bold text-primary">{nft.name}</h1>
      <p className="mt-2 text-muted-foreground">
        {nft.collection} · {nft.tokenId} · {nft.priceEth} ETH
      </p>
      <p className="mt-4 text-sm text-muted-foreground">
        Layout e interações serão implementados no bloco 2.3.b.
      </p>
    </div>
  );
}

function NotFoundState({ id }: { id: string }) {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-20 text-center">
      <h1 className="text-3xl font-bold text-primary">NFT não encontrado</h1>
      <p className="mt-3 text-muted-foreground">
        Não localizamos o NFT "{id}". Ele pode ter sido removido ou o link está
        incorreto.
      </p>
      <Button asChild className="mt-8">
        <Link to="/">Voltar ao catálogo</Link>
      </Button>
    </div>
  );
}

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-20 text-center">
      <h1 className="text-3xl font-bold text-primary">
        Não foi possível carregar o NFT
      </h1>
      <p className="mt-3 text-muted-foreground">{message}</p>
      <div className="mt-8 flex items-center justify-center gap-3">
        <Button type="button" onClick={onRetry}>
          Tentar novamente
        </Button>
        <Button asChild variant="outline">
          <Link to="/">Voltar ao catálogo</Link>
        </Button>
      </div>
    </div>
  );
}

function getErrorMessage(error: unknown): string {
  if (isApiError(error)) return error.message;
  return "Erro inesperado. Tente novamente.";
}
