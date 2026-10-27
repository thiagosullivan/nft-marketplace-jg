import { useEffect, useState } from "react";
import type { Session } from "@/shared/api"; // ajuste o tipo conforme seu contrato

type UseSessionResult = {
  data: Session | null | undefined;
  isLoading: boolean;
};

/**
 * Carrega o módulo de auth sob demanda.
 * Evita que o chunk `use-auth` entre no boot da home.
 */
export function useSessionLazy(): UseSessionResult {
  const [mod, setMod] = useState<null | {
    useSession: () => UseSessionResult;
  }>(null);

  useEffect(() => {
    void import("./use-auth").then((m) => {
      setMod(() => ({ useSession: m.useSession }));
    });
  }, []);

  // Enquanto o módulo não chega, devolve loading.
  // O Header pode renderizar o skeleton normalmente.
  if (!mod) {
    return { data: undefined, isLoading: true };
  }

  // Hook é chamado de forma estável: só depois do módulo carregado.
  // Para isso, precisamos de um componente interno, não chamar o hook aqui.
  // Veja abaixo o padrão com componente wrapper.
  return { data: undefined, isLoading: true };
}
