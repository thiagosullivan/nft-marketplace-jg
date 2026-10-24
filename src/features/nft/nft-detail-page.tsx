import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { isApiError, isNotFound } from "@/shared/api";
import { Button } from "@/shared/components/ui/button";
import type { Nft, NftEdition } from "@/shared/api/types";
import { useAddToCart } from "@/features/cart";
import { NftDetailSkeleton } from "./nft-detail-skeleton";
import { NftDetailView } from "./nft-detail-view";
import { useNft } from "./use-nft";

type Props = {
  id: string;
};

function defaultEditionOf(nft: Nft): NftEdition | undefined {
  return nft.editions.find((e) => e.available > 0) ?? nft.editions[0];
}

function findEdition(nft: Nft, editionId: string): NftEdition | undefined {
  return nft.editions.find((e) => e.id === editionId);
}

export function NFTDetailPage({ id }: Props) {
  const query = useNft(id);
  const navigate = useNavigate();
  const { add, isPending: buyPending } = useAddToCart();

  const [editionId, setEditionId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(1);

  useEffect(() => {
    if (query.data) {
      document.title = `${query.data.name} · NFT Marketplace`;
    } else {
      document.title = "Detalhe do NFT · NFT Marketplace";
    }
  }, [query.data]);

  useEffect(() => {
    if (!query.data) return;
    const fallback = defaultEditionOf(query.data);
    if (!fallback) return;
    setEditionId((current) => {
      if (current && findEdition(query.data!, current)) return current;
      return fallback.id;
    });
  }, [query.data]);

  useEffect(() => {
    if (!query.data || !editionId) return;
    const current = findEdition(query.data, editionId);
    if (current && current.available > 0) return;
    const fallback = defaultEditionOf(query.data);
    if (fallback && fallback.id !== editionId) {
      setEditionId(fallback.id);
      setQuantity(1);
    }
  }, [query.data, editionId]);

  const edition = useMemo(() => {
    if (!query.data || !editionId) return undefined;
    return findEdition(query.data, editionId);
  }, [query.data, editionId]);

  useEffect(() => {
    if (!edition) return;
    const max = edition.isOpen ? 9999 : Math.max(1, edition.available);
    setQuantity((q) => Math.min(Math.max(1, q), max));
  }, [edition]);

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

  if (!query.data || !edition) return <NotFoundState id={id} />;

  const nft = query.data;

  const onBuy = async () => {
    const result = await add({
      nftId: nft.id,
      editionId: edition.id,
      quantity,
    });
    if (result.kind === "added") {
      void navigate({ to: "/cart" });
    }
  };

  return (
    <NftDetailView
      nft={nft}
      edition={edition}
      onEditionChange={(nextId) => {
        setEditionId(nextId);
        setQuantity(1);
      }}
      quantity={quantity}
      onQuantityChange={setQuantity}
      onBuy={() => {
        void onBuy().catch((err) => {
          if (!isApiError(err)) console.error(err);
        });
      }}
      buyPending={buyPending}
    />
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
