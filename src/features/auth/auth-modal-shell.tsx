import type { ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/shared/lib/utils";

type AuthTab = "login" | "register";

type Props = {
  activeTab: AuthTab;
  onTabChange: (tab: AuthTab) => void;
  onClose: () => void;
  children: ReactNode;
};

export function AuthModalShell({
  activeTab,
  onTabChange,
  onClose,
  children,
}: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 px-4 py-12"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-tab-login"
        className="relative w-full max-w-md rounded-lg border border-border bg-surface-raised p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
        >
          <X className="size-5" />
        </button>

        <div
          role="tablist"
          aria-label="Autenticação"
          className="mb-6 flex items-center gap-2 pr-8"
        >
          <button
            type="button"
            role="tab"
            id="auth-modal-tab-login"
            aria-selected={activeTab === "login"}
            aria-controls="auth-modal-panel"
            onClick={() => onTabChange("login")}
            className={cn(
              "text-2xl font-bold transition-colors",
              activeTab === "login"
                ? "text-primary"
                : "text-foreground hover:text-primary",
            )}
          >
            Entrar
          </button>
          <span aria-hidden="true" className="text-2xl font-bold text-primary">
            |
          </span>
          <button
            type="button"
            role="tab"
            id="auth-modal-tab-register"
            aria-selected={activeTab === "register"}
            aria-controls="auth-modal-panel"
            onClick={() => onTabChange("register")}
            className={cn(
              "text-2xl font-bold transition-colors",
              activeTab === "register"
                ? "text-primary"
                : "text-foreground hover:text-primary",
            )}
          >
            Criar conta
          </button>
        </div>

        <div
          role="tabpanel"
          id="auth-modal-panel"
          aria-labelledby={
            activeTab === "login"
              ? "auth-modal-tab-login"
              : "auth-modal-tab-register"
          }
        >
          {children}
        </div>
      </div>
    </div>
  );
}
