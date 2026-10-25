import { useState } from "react";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Button } from "@/shared/components/ui/button";
import type { Wallet } from "@/shared/api/types";
import {
  useDeleteWallet,
  useSetPrimaryWallet,
  useWallets,
} from "./use-wallets";
import { WalletCard } from "./wallet-card";
import { WalletEditDialog } from "./wallet-edit-dialog";

export function WalletList() {
  const wallets = useWallets();
  const setPrimary = useSetPrimaryWallet();
  const remove = useDeleteWallet();
  const [editing, setEditing] = useState<Wallet | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  if (wallets.isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (wallets.isError || !wallets.data) {
    return (
      <div className="flex flex-col items-center gap-3 py-10 text-center">
        <p className="text-sm text-secondary">
          Não foi possível carregar as carteiras.
        </p>
        <Button variant="outline" onClick={() => wallets.refetch()}>
          Tentar novamente
        </Button>
      </div>
    );
  }

  if (wallets.data.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-secondary">
        Você ainda não adicionou uma carteira secundária.
      </p>
    );
  }

  const ordered = [...wallets.data].sort((a, b) => {
    if (a.isPrimary !== b.isPrimary) return a.isPrimary ? -1 : 1;
    return a.createdAt.localeCompare(b.createdAt);
  });

  const busy = setPrimary.isPending || remove.isPending;

  return (
    <>
      <ul className="space-y-3">
        {ordered.map((w) => (
          <WalletCard
            key={w.id}
            wallet={w}
            busy={busy}
            onEdit={(wallet) => {
              setEditing(wallet);
              setDialogOpen(true);
            }}
            onDelete={(wallet) => {
              if (
                !window.confirm(
                  `Remover a carteira "${wallet.label}"? Essa ação não pode ser desfeita.`,
                )
              ) {
                return;
              }
              void remove.mutateAsync(wallet.id);
            }}
            onSetPrimary={(wallet) => {
              void setPrimary.mutateAsync(wallet.id);
            }}
          />
        ))}
      </ul>

      <WalletEditDialog
        wallet={editing}
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditing(null);
        }}
      />
    </>
  );
}
