import { Pencil, Star, Trash2 } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import type { Wallet } from "@/shared/api/types";

function truncateAddress(addr: string): string {
  if (addr.length <= 12) return addr;
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

type Props = {
  wallet: Wallet;
  onEdit: (wallet: Wallet) => void;
  onDelete: (wallet: Wallet) => void;
  onSetPrimary: (wallet: Wallet) => void;
  busy?: boolean;
};

export function WalletCard({
  wallet,
  onEdit,
  onDelete,
  onSetPrimary,
  busy,
}: Props) {
  return (
    <li
      className={cn(
        "flex items-center gap-4 rounded-lg border bg-surface-card p-4",
        wallet.isPrimary ? "border-primary" : "border-border",
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate font-bold text-foreground">{wallet.label}</p>
          {wallet.isPrimary && (
            <Badge className="bg-primary text-ink">Principal</Badge>
          )}
        </div>
        <p className="text-sm text-secondary">
          {truncateAddress(wallet.address)} · {wallet.network} ·{" "}
          {wallet.walletType}
        </p>
        {wallet.ensName && (
          <p className="text-xs text-muted-foreground">{wallet.ensName}</p>
        )}
      </div>

      <div className="flex items-center gap-1">
        {!wallet.isPrimary && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Definir como principal"
            title="Definir como principal"
            onClick={() => onSetPrimary(wallet)}
            disabled={busy}
          >
            <Star className="size-4" aria-hidden />
          </Button>
        )}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Editar carteira"
          title="Editar"
          onClick={() => onEdit(wallet)}
          disabled={busy}
        >
          <Pencil className="size-4" aria-hidden />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Excluir carteira"
          title="Excluir"
          onClick={() => onDelete(wallet)}
          disabled={busy}
        >
          <Trash2 className="size-4" aria-hidden />
        </Button>
      </div>
    </li>
  );
}
