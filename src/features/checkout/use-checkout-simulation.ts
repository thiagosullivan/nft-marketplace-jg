import { useState } from "react";
import type { Wallet, WalletType } from "@/shared/api/types";

export type SimulationState = "idle" | "connecting" | "connected" | "failed";
export type SimulationResult = { state: SimulationState; message?: string };

export const SIMULATION_HELP: Record<WalletType, string> = {
  metamask: "Conecta sempre (simulação).",
  walletconnect: "Falha na 1ª tentativa com UNAVAILABLE; conecta na 2ª.",
  coinbase: "Recusa a conexão sempre (FORBIDDEN).",
  ledger: "Conecta sempre (simulação).",
  other: "Conecta sempre (simulação).",
};

export function simulateConnection(
  wallet: Wallet,
  attempt: number,
): SimulationResult {
  const type = wallet.walletType as WalletType;
  if (type === "coinbase") {
    return { state: "failed", message: "A carteira recusou a conexão." };
  }
  if (type === "walletconnect") {
    if (attempt === 1) {
      return {
        state: "failed",
        message: "Conexão indisponível. Tente novamente.",
      };
    }
    return { state: "connected" };
  }
  return { state: "connected" };
}

export function useConnectionSimulation(wallet: Wallet) {
  const [state, setState] = useState<SimulationState>("idle");
  const [message, setMessage] = useState<string | undefined>();
  const [attempt, setAttempt] = useState(0);

  const connect = async () => {
    setState("connecting");
    setMessage(undefined);
    const nextAttempt = attempt + 1;
    setAttempt(nextAttempt);
    await new Promise((r) => setTimeout(r, 2000));
    const result = simulateConnection(wallet, nextAttempt);
    setState(result.state);
    setMessage(result.message);
  };

  const disconnect = () => {
    setState("idle");
    setMessage(undefined);
  };

  return { state, message, connect, disconnect };
}
