import { useAuthModal } from "./auth-modal-provider";
import { LoginPage } from "./login-page";
import { RegisterPage } from "./register-page";

export function AuthModalHost() {
  const { mode } = useAuthModal();
  if (!mode) return null;
  if (mode === "login") return <LoginPage />;
  return <RegisterPage />;
}
