import { Skeleton } from "@/shared/components/ui/skeleton";
import { useProfile } from "@/features/profile/use-profile";
import { WalletForm } from "./wallet-form";
import { WalletList } from "./wallet-list";

export function WalletsPanel() {
  const profile = useProfile();

  if (profile.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (profile.isError || !profile.data) {
    return (
      <p className="text-sm text-secondary">
        Não foi possível carregar o perfil.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      <WalletForm profile={profile.data} />

      <section className="grid grid-cols-1 gap-6 md:grid-cols-[413px_1fr] items-start">
        <div>
          <h2 className="text-lg font-bold text-foreground">
            Carteira secundária
          </h2>
          <p className="text-sm font-normal text-secondary my-3">
            Você ainda não adicionou uma carteira secundária.
          </p>
          <WalletList />
        </div>

        <div className="flex items-center justify-start gap-x-2">
          <div className="flex items-center gap-2">
            <input
              type="radio"
              disabled
              aria-disabled="true"
              aria-label="Igual à carteira principal"
              className="size-4 cursor-not-allowed accent-primary"
            />
            <p className="text-sm font-normal text-foreground">
              Igual à carteira principal
            </p>
          </div>
          <button
            type="button"
            disabled
            aria-disabled="true"
            className="text-accent text-base font-medium"
          >
            Adicionar
          </button>
        </div>
      </section>
    </div>
  );
}
