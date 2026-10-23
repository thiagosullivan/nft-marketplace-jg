export function EmptyState({ message }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
      <p className="text-lg font-medium text-foreground">
        Nenhum NFT encontrado
      </p>
      <p className="text-sm text-muted-foreground">
        {message ?? "Tente ajustar os filtros ou a busca."}
      </p>
    </div>
  );
}
