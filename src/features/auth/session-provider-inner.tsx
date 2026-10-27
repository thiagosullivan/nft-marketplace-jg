import type { ReactNode } from "react";
import { useSession } from "./use-auth";

export function SessionProviderInner({ children }: { children: ReactNode }) {
  // Aqui o hook é chamado de forma estável,
  // porque o componente só monta quando o chunk chegou.
  useSession(); // se o seu useSession não retorna nada, adapte
  return <>{children}</>;
}
