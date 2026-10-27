import { lazy, Suspense } from "react";
import { useAuthModal } from "./auth-modal-provider";

const LoginPage = lazy(() =>
  import("./login-page").then((m) => ({ default: m.LoginPage })),
);
const RegisterPage = lazy(() =>
  import("./register-page").then((m) => ({ default: m.RegisterPage })),
);

export function AuthModalHost() {
  const { mode } = useAuthModal();
  if (!mode) return null;

  return (
    <Suspense fallback={null}>
      {mode === "login" ? <LoginPage /> : <RegisterPage />}
    </Suspense>
  );
}
