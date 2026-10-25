import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { toast } from "sonner";
import { cn } from "@/shared/lib/utils";
import { useLogout } from "@/features/auth/use-auth";

const DISABLED_HINT = "Disponível em breve.";

const baseClass =
  "flex w-full items-center gap-3 border-l-4 border-transparent px-3 py-2 text-left text-sm transition-colors";

export function AccountSidebar() {
  const navigate = useNavigate();
  const logout = useLogout();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const isProfile = pathname === "/profile";
  const isWallets = pathname.startsWith("/profile/wallets");
  const isOrders = pathname.startsWith("/profile/orders");

  return (
    <aside className="w-full shrink-0 md:w-[310px] bg-surface-card py-2 h-fit">
      <h2 className="mb-2.5 ml-2.5 text-lg font-bold text-foreground">
        Meu perfil
      </h2>

      <nav aria-label="Navegação da conta">
        <ul className="flex flex-col gap-px">
          <SideLink
            to="/profile"
            label="Dados do perfil"
            icon="/icons/svg/user-icon-primary.svg"
            activeIcon="/icons/svg/user-icon-active.svg"
            active={isProfile}
          />
          <SideLink
            to="/profile/wallets"
            label="Carteiras"
            icon="/icons/svg/wallet-icon-primary.svg"
            activeIcon="/icons/svg/wallet-icon-active.svg"
            active={isWallets}
          />
          <SideLink
            to="/profile/orders"
            label="Atividade"
            icon="/icons/svg/shopping-icon-primary.svg"
            activeIcon="/icons/svg/shopping-icon-active.svg"
            active={isOrders}
          />

          <SideDisabledButton
            label="Lista de interesse"
            icon="/icons/svg/heart-icon-primary.svg"
          />
          <SideDisabledButton
            label="Ofertas"
            icon="/icons/svg/offer-icon-primary.svg"
          />
          <SideDisabledButton
            label="Arquivos baixados"
            icon="/icons/svg/download-icon-primary.svg"
          />
          <SideDisabledButton
            label="Suporte"
            icon="/icons/svg/alert-icon-primary.svg"
          />

          <li aria-hidden className="mb-3 h-px w-full bg-primary/50" />

          <li>
            <button
              type="button"
              onClick={() => {
                logout.mutate();
                navigate({ to: "/" });
              }}
              className={cn(
                baseClass,
                "text-foreground hover:text-primary pb-3 cursor-pointer",
              )}
            >
              <img
                src="/icons/svg/logout-icon-primary.svg"
                alt=""
                className="h-5 w-5 object-contain"
                aria-hidden="true"
              />
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
  activeIcon,
  active,
}: {
  to: "/profile" | "/profile/wallets" | "/profile/orders";
  label: string;
  icon: string;
  activeIcon: string;
  active: boolean;
}) {
  return (
    <li>
      <Link
        to={to}
        aria-current={active ? "page" : undefined}
        className={cn(
          baseClass,
          active && "border-primary ",
          !active && "hover:text-primary/50",
          "py-3 font-regular text-[15px] text-primary",
        )}
      >
        {/* {icon} */}

        <img
          src={active ? activeIcon : icon}
          alt=""
          className="h-5 w-5 object-contain"
          aria-hidden="true"
        />
        <span>{label}</span>
      </Link>
    </li>
  );
}

function SideDisabledButton({ label, icon }: { label: string; icon: string }) {
  return (
    <li>
      <button
        type="button"
        onClick={() => toast.info(DISABLED_HINT)}
        aria-disabled="true"
        className={cn(
          baseClass,
          "cursor-not-allowed text-primary hover:text-primary/50 py-3",
        )}
      >
        {/* {icon} */}
        <img
          src={icon}
          alt=""
          className="h-5 w-5 object-contain"
          aria-hidden="true"
        />
        <span>{label}</span>
      </button>
    </li>
  );
}
