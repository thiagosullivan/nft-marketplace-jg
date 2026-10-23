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
        className="relative w-full max-w-md bg-surface-card py-12 shadow-xl border-b-10 border-b-primary"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="absolute right-4 top-4 text-primary hover:text-foreground"
        >
          <X className="size-5" />
        </button>

        <div
          role="tablist"
          aria-label="Autenticação"
          className="mb-10 flex items-center justify-center gap-2"
        >
          <button
            type="button"
            role="tab"
            id="auth-modal-tab-login"
            aria-selected={activeTab === "login"}
            aria-controls="auth-modal-panel"
            onClick={() => onTabChange("login")}
            className={cn(
              "text-xl font-medium transition-colors",
              activeTab === "login"
                ? "text-primary"
                : "text-foreground hover:text-primary",
            )}
          >
            Entrar
          </button>
          <span aria-hidden="true" className="text-xl font-medium text-primary">
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
              "text-xl font-medium transition-colors",
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
