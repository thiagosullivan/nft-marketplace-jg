import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { isApiError } from "@/shared/api";
import { useLogin } from "./use-auth";
import { useAuthModal } from "./auth-modal-provider";
import { AuthModalShell } from "./auth-modal-shell";
import { PasswordInput } from "./password-input";
import FacebookIcon from "../../../public/icons/fb-icon.png";
import GoogleIcon from "../../../public/icons/gg-icon.png";

const loginSchema = z.object({
  email: z.string().email("E-mail inválido."),
  password: z.string().min(1, "Informe a senha."),
});

type LoginForm = z.infer<typeof loginSchema>;

export function LoginPage() {
  const navigate = useNavigate();
  const { close, switchMode, redirect } = useAuthModal();
  const login = useLogin();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await login.mutateAsync(values);
      toast.success("Bem-vindo(a) de volta!");
      close();
      void navigate({ to: redirect ?? "/" });
    } catch (err) {
      if (isApiError(err) && err.fields) {
        for (const [field, message] of Object.entries(err.fields)) {
          if (field === "email" || field === "password") {
            setError(field, { message });
          }
        }
      }
      const message = isApiError(err)
        ? err.message
        : "Não foi possível entrar.";
      toast.error(message);
    }
  });

  return (
    <AuthModalShell activeTab="login" onTabChange={switchMode} onClose={close}>
      <h1 className="uppercase block md:hidden w-full text-center text-foreground text-[32px] font-bold mb-18!">
        Kurio
      </h1>
      <p className="text-[13px] text-center text-foreground mb-6 px-12 hidden md:block">
        Entre para gerenciar sua carteira, coleção e perfil de criador.
      </p>
      <p className="text-center mb-10 text-xl font-bold">Entrar</p>
      <form
        onSubmit={onSubmit}
        className="flex flex-col items-center mx-auto gap-y-10 md:gap-y-3 w-full"
        noValidate
      >
        <div className="space-y-3 md:space-y-2 md:max-w-85 w-full px-7 md:p-0">
          <div className="space-y-2 w-full hidden md:block">
            <Input
              id="login-email"
              type="email"
              autoComplete="email"
              aria-label="E-mail"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "login-email-error" : undefined}
              placeholder="e-mail"
              {...register("email")}
              className="rounded-sm min-h-10 border-border bg-transparent! focus:outline-none! focus:ring-0!"
            />
            {errors.email && (
              <p id="login-email-error" className="text-sm text-destructive">
                {errors.email.message}
              </p>
            )}
          </div>
          <div className="space-y-2 md:hidden block">
            <Input
              id="login-email"
              type="email"
              autoComplete="email"
              aria-label="E-mail"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "login-email-error" : undefined}
              placeholder="contato@email.com"
              {...register("email")}
              className="rounded-sm min-h-12.5 border-border bg-transparent! focus:outline-none! focus:ring-0!"
            />
            {errors.email && (
              <p id="login-email-error" className="text-sm text-destructive">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-2 w-full hidden md:block">
            <PasswordInput
              id="login-password"
              autoComplete="current-password"
              aria-label="Senha"
              aria-invalid={!!errors.password}
              aria-describedby={
                errors.password ? "login-password-error" : undefined
              }
              placeholder="senha"
              {...register("password")}
              className="rounded-sm md:min-h-10 border-border bg-transparent! focus:outline-none! focus:ring-0!"
            />
            {errors.password && (
              <p id="login-password-error" className="text-sm text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="space-y-2 md:hidden block mb-4">
            <PasswordInput
              id="login-password"
              autoComplete="current-password"
              aria-label="Senha"
              aria-invalid={!!errors.password}
              aria-describedby={
                errors.password ? "login-password-error" : undefined
              }
              placeholder="senha"
              {...register("password")}
              className="rounded-sm min-h-12.5 border-border bg-transparent! focus:outline-none! focus:ring-0!"
            />
            {errors.password && (
              <p id="login-password-error" className="text-sm text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          <Link
            to="/"
            className="flex justify-end text-sm text-accent font-normal mb-10"
          >
            Esqueceu a senha?
          </Link>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-sm text-ink font-bold text-base min-h-15 md:min-h-11.25"
          >
            {isSubmitting ? "Entrando..." : "Entrar"}
          </Button>
        </div>

        <div className="space-y-2 pt-2 w-full">
          <div className="flex items-center mb-3">
            <div className="w-full h-px mt-1 bg-border mr-3 ml-7 md:ml-0" />
            <p className="text-center text-xs text-foreground text-nowrap">
              Ou continue com
            </p>
            <div className=" w-full h-px mt-1 bg-border ml-3 mr-7 md:mr-0" />
          </div>

          <div className="flex flex-col gap-y-4 md:gap-y-3 px-7 md:px-12 mb-10 md:mb-[93px]">
            <Button
              type="button"
              variant="outline"
              disabled
              aria-disabled="true"
              onClick={() => toast.info("Indisponível na demonstração.")}
              className="rounded-sm bg-transparent! min-h-10 text-[13px] font-medium gap-3"
            >
              <img
                src={GoogleIcon}
                alt=""
                className="size-5"
                aria-hidden="true"
              />
              Continuar com Google
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled
              aria-disabled="true"
              onClick={() => toast.info("Indisponível na demonstração.")}
              className="rounded-sm bg-transparent! min-h-10 text-[13px] font-medium gap-3"
            >
              <img
                src={FacebookIcon}
                alt=""
                className="size-5"
                aria-hidden="true"
              />
              Continuar com Facebook
            </Button>
          </div>
        </div>
      </form>
    </AuthModalShell>
  );
}
