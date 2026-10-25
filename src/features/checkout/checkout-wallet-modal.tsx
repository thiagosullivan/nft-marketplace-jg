import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import type { Wallet, WalletType } from "@/shared/api/types";
import {
  SIMULATION_HELP,
  useConnectionSimulation,
} from "./use-checkout-simulation";

type Props = {
  open: boolean;
  wallet: Wallet | null;
  onCancel: () => void;
  onConnected: () => void;
};

export function CheckoutWalletModal({
  open,
  wallet,
  onCancel,
  onConnected,
}: Props) {
  if (!wallet) return null;
  return (
    <CheckoutWalletModalInner
      open={open}
      wallet={wallet}
      onCancel={onCancel}
      onConnected={onConnected}
    />
  );
}

function CheckoutWalletModalInner({
  open,
  wallet,
  onCancel,
  onConnected,
}: {
  open: boolean;
  wallet: Wallet;
  onCancel: () => void;
  onConnected: () => void;
}) {
  const sim = useConnectionSimulation(wallet);
  const help =
    SIMULATION_HELP[wallet.walletType as WalletType] ?? "Conecta sempre.";

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) onCancel();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Conectar carteira</DialogTitle>
          <DialogDescription>
            Simulação de conexão com <strong>{wallet.label}</strong> (
            {wallet.walletType}). {help}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 text-sm">
          <p>
            Estado: <strong>{sim.state}</strong>
          </p>
          {sim.message && <p className="text-destructive">{sim.message}</p>}
        </div>

        <DialogFooter className="gap-2">
          {sim.state !== "connected" && (
            <>
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={() => void sim.connect()}
                disabled={sim.state === "connecting"}
              >
                {sim.state === "connecting"
                  ? "Conectando…"
                  : sim.state === "failed"
                    ? "Tentar novamente"
                    : "Conectar"}
              </Button>
            </>
          )}
          {sim.state === "connected" && (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => sim.disconnect()}
              >
                Desconectar
              </Button>
              <Button type="button" onClick={onConnected}>
                Confirmar pedido
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
