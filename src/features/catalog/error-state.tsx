import { Button } from "@/shared/components/ui/button";

export function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <p className="text-lg font-medium text-foreground">
        Não foi possível carregar o catálogo
      </p>
      <p className="text-sm text-muted-foreground">
        Verifique sua conexão e tente novamente.
      </p>
      <Button onClick={onRetry} variant="outline">
        Tentar novamente
      </Button>
    </div>
  );
}
