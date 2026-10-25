import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
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

const DISABLED_HINT = "Disponível em breve.";

const baseClass =
  "flex w-full items-center gap-3 border-r-2 border-transparent px-3 py-2 text-left text-sm transition-colors";

export function AccountSidebar() {
  const navigate = useNavigate();
  const logout = useLogout();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const isProfile = pathname === "/profile";
  const isWallets = pathname.startsWith("/profile/wallets");
  const isOrders = pathname.startsWith("/profile/orders");

  return (
    <aside className="w-full shrink-0 md:w-[260px]">
      <h2 className="mb-6 text-lg font-bold text-foreground">Perfil</h2>

      <nav aria-label="Navegação da conta">
        <ul className="flex flex-col gap-1">
          <SideLink
            to="/profile"
            label="Dados do perfil"
            icon={<User className="size-4" aria-hidden />}
            active={isProfile}
          />
          <SideLink
            to="/profile/wallets"
            label="Carteiras"
            icon={<Wallet className="size-4" aria-hidden />}
            active={isWallets}
          />
          <SideLink
            to="/profile/orders"
            label="Atividade"
            icon={<Activity className="size-4" aria-hidden />}
            active={isOrders}
          />

          <SideDisabledButton
            label="Lista de interesse"
            icon={<Heart className="size-4" aria-hidden />}
          />
          <SideDisabledButton
            label="Ofertas"
            icon={<Tag className="size-4" aria-hidden />}
          />
          <SideDisabledButton
            label="Arquivos baixados"
            icon={<Download className="size-4" aria-hidden />}
          />
          <SideDisabledButton
            label="Suporte"
            icon={<HelpCircle className="size-4" aria-hidden />}
          />

          <li aria-hidden className="my-3 h-px w-full bg-border" />

          <li>
            <button
              type="button"
              onClick={() => {
                logout.mutate();
                navigate({ to: "/" });
              }}
              className={cn(baseClass, "text-foreground hover:text-primary")}
            >
              <LogOut className="size-4" aria-hidden />
              <span>Sair</span>
            </button>
          </li>
        </ul>
      </nav>
    </aside>
  );
}

function SideLink({
  to,
  label,
  icon,
  active,
}: {
  to: "/profile" | "/profile/wallets" | "/profile/orders";
  label: string;
  icon: React.ReactNode;
  active: boolean;
}) {
  return (
    <li>
      <Link
        to={to}
        aria-current={active ? "page" : undefined}
        className={cn(
          baseClass,
          active && "border-primary font-bold text-primary",
          !active && "text-foreground hover:text-primary",
        )}
      >
        {icon}
        <span>{label}</span>
      </Link>
    </li>
  );
}

function SideDisabledButton({
  label,
  icon,
}: {
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={() => toast.info(DISABLED_HINT)}
        aria-disabled="true"
        className={cn(
          baseClass,
          "cursor-not-allowed text-muted-foreground opacity-60",
        )}
      >
        {icon}
        <span>{label}</span>
      </button>
    </li>
  );
}
