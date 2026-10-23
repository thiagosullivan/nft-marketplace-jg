import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type AuthMode = "login" | "register";

type AuthModalContextValue = {
  mode: AuthMode | null;
  redirect: string | null;
  open: (mode: AuthMode, redirect?: string) => void;
  close: () => void;
  switchMode: (mode: AuthMode) => void;
};

const AuthModalContext = createContext<AuthModalContextValue | null>(null);

export function useAuthModal(): AuthModalContextValue {
  const ctx = useContext(AuthModalContext);
  if (!ctx) {
    throw new Error("useAuthModal deve ser usado dentro de AuthModalProvider.");
  }
  return ctx;
}

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<AuthMode | null>(null);
  const [redirect, setRedirect] = useState<string | null>(null);

  const open = useCallback((nextMode: AuthMode, nextRedirect?: string) => {
    setMode(nextMode);
    setRedirect(nextRedirect ?? null);
  }, []);

  const close = useCallback(() => {
    setMode(null);
    setRedirect(null);
    const url = new URL(window.location.href);
    if (url.searchParams.has("auth") || url.searchParams.has("redirect")) {
      url.searchParams.delete("auth");
      url.searchParams.delete("redirect");
      window.history.replaceState({}, "", url.toString());
    }
  }, []);

  const switchMode = useCallback((nextMode: AuthMode) => {
    setMode(nextMode);
  }, []);

  useEffect(() => {
    const onOpenLogin = (e: Event) => {
      const detail = (e as CustomEvent<{ redirect?: string }>).detail;
      open("login", detail?.redirect);
    };
    const onOpenRegister = (e: Event) => {
      const detail = (e as CustomEvent<{ redirect?: string }>).detail;
      open("register", detail?.redirect);
    };
    window.addEventListener("auth:open-login", onOpenLogin);
    window.addEventListener("auth:open-register", onOpenRegister);
    return () => {
      window.removeEventListener("auth:open-login", onOpenLogin);
      window.removeEventListener("auth:open-register", onOpenRegister);
    };
  }, [open]);

  const value = useMemo(
    () => ({ mode, redirect, open, close, switchMode }),
    [mode, redirect, open, close, switchMode],
  );

  return (
    <AuthModalContext.Provider value={value}>
      {children}
    </AuthModalContext.Provider>
  );
}
