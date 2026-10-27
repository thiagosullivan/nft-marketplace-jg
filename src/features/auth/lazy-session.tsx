import { useEffect, useState, type ReactNode } from "react";

type SessionModule = {
  useSession: () => {
    data:
      | { user: { id: string; displayName: string; avatarUrl?: string | null } }
      | null
      | undefined;
    isLoading: boolean;
  };
};

type Props = {
  children: (
    session: SessionModule["useSession"] extends () => infer R ? R : never,
  ) => ReactNode;
  fallback: ReactNode;
};

/**
 * Carrega o módulo `use-auth` sob demanda e só então chama o hook.
 * Evita que o chunk `use-auth` entre no boot da home.
 */
export function LazySession({ children, fallback }: Props) {
  const [mod, setMod] = useState<SessionModule | null>(null);

  useEffect(() => {
    void import("./use-auth").then((m) => {
      setMod(() => ({ useSession: m.useSession }));
    });
  }, []);

  if (!mod) return <>{fallback}</>;

  // Componente interno: o hook é chamado de forma estável,
  // porque só monta quando o módulo já chegou.
  return (
    <SessionRenderer useSession={mod.useSession}>{children}</SessionRenderer>
  );
}

function SessionRenderer({
  useSession,
  children,
}: {
  useSession: SessionModule["useSession"];
  children: Props["children"];
}) {
  const session = useSession();
  return <>{children(session)}</>;
}
