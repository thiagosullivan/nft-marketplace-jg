// auth-modal-shell.tsx (versão Radix)
import type { ReactNode } from "react";
import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/shared/components/ui/dialog";
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
    <Dialog
      open
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="w-full h-full md:h-auto md:max-w-md bg-ink md:bg-surface-card pt-20 md:py-12 shadow-xl md:border-b-10 border-b-primary rounded-none md:rounded-lg p-0"
        aria-labelledby={
          activeTab === "login"
            ? "auth-modal-tab-login"
            : "auth-modal-tab-register"
        }
      >
        <DialogTitle className="sr-only">
          {activeTab === "login" ? "Entrar" : "Criar conta"}
        </DialogTitle>

        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="absolute right-4 top-4 z-20 text-primary hover:text-foreground"
        >
          <X className="size-5" />
        </button>

        <div
          role="tablist"
          aria-label="Autenticação"
          className="mb-10 items-center justify-center gap-2 hidden md:flex"
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

        <div
          role="tablist"
          aria-label="Autenticação"
          className="mb-10 items-center justify-center gap-2 md:hidden flex"
        >
          <p
            role="tab"
            id="auth-modal-tab-register-mobile"
            aria-selected={activeTab === "register"}
            aria-controls="auth-modal-panel"
            onClick={() => onTabChange("register")}
            className={cn(
              "text-[15px] font-normal text-secondary cursor-pointer",
              activeTab === "register" ? "hidden" : "block",
            )}
          >
            Novo na Kurio? Crie uma conta
          </p>
          <p
            role="tab"
            id="auth-modal-tab-login-mobile"
            aria-selected={activeTab === "login"}
            aria-controls="auth-modal-panel"
            onClick={() => onTabChange("login")}
            className={cn(
              "text-[15px] font-normal text-secondary cursor-pointer",
              activeTab === "login" ? "hidden" : "block",
            )}
          >
            Já tem uma conta? Entre
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
