type Props = {
  id: string;
};

export function NFTDetailPage({ id }: Props) {
  return (
    <div className="container mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-3xl font-bold text-primary">Detalhe do NFT</h1>
      <p className="mt-2 text-muted-foreground">
        ID: {id} — em construção (Fase 2.3).
      </p>
    </div>
  );
}
