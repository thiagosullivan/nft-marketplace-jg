import { Link, useNavigate } from "@tanstack/react-router";
import {
  User,
  Wallet,
  Activity,
  Heart,
  Tag,
  Download,
  HelpCircle,
  LogOut,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/shared/lib/utils";
import { useLogout } from "@/features/auth/use-auth";

export type AccountSection = "profile" | "wallets";

type Props = {
  activeSection: AccountSection;
  onSectionChange: (section: AccountSection) => void;
};

const DISABLED_HINT = "Disponível em breve.";

function showDisabledHint() {
  toast.info(DISABLED_HINT);
}

export function AccountSidebar({ activeSection, onSectionChange }: Props) {
  const navigate = useNavigate();
  const logout = useLogout();

  return (
    <aside className="w-full md:w-[260px] shrink-0">
      <h2 className="mb-6 text-lg font-bold text-foreground">Perfil</h2>

      <nav aria-label="Navegação da conta">
        <ul className="flex flex-col gap-1">
          <SideItem
            label="Dados do perfil"
            icon={<User className="size-4" aria-hidden />}
            active={activeSection === "profile"}
            onClick={() => onSectionChange("profile")}
          />
          <SideItem
            label="Carteiras"
            icon={<Wallet className="size-4" aria-hidden />}
            active={activeSection === "wallets"}
            onClick={() => onSectionChange("wallets")}
          />
          <SideItem
            label="Atividade"
            icon={<Activity className="size-4" aria-hidden />}
            onClick={() => navigate({ to: "/orders" })}
          />
          <SideItem
            label="Lista de interesse"
            icon={<Heart className="size-4" aria-hidden />}
            disabled
            onClick={showDisabledHint}
          />
          <SideItem
            label="Ofertas"
            icon={<Tag className="size-4" aria-hidden />}
            disabled
            onClick={showDisabledHint}
          />
          <SideItem
            label="Arquivos baixados"
            icon={<Download className="size-4" aria-hidden />}
            disabled
            onClick={showDisabledHint}
          />
          <SideItem
            label="Suporte"
            icon={<HelpCircle className="size-4" aria-hidden />}
            disabled
            onClick={showDisabledHint}
          />

          <li aria-hidden className="my-3 h-px w-full bg-border" />

          <SideItem
            label="Sair"
            icon={<LogOut className="size-4" aria-hidden />}
            onClick={() => {
              logout.mutate();
              navigate({ to: "/" });
            }}
          />
        </ul>
      </nav>

      {/* Link "Atividade" também acessível pelo header, mas o item fica aqui
          para bater com o Figma. "Carteiras" alterna o painel em /profile. */}
      <noscript>
        <Link to="/orders">Atividade</Link>
      </noscript>
    </aside>
  );
}

type SideItemProps = {
  label: string;
  icon: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
};

function SideItem({ label, icon, active, disabled, onClick }: SideItemProps) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-current={active ? "page" : undefined}
        aria-disabled={disabled || undefined}
        className={cn(
          "flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors",
          "border-r-2 border-transparent",
          active && "border-primary text-primary font-bold",
          !active && !disabled && "text-foreground hover:text-primary",
          disabled && "cursor-not-allowed text-muted-foreground opacity-60",
        )}
      >
        {icon}
        <span>{label}</span>
      </button>
    </li>
  );
}
