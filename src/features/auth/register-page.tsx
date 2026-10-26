import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { isApiError } from "@/shared/api";
import { useRegister } from "./use-auth";
import { useAuthModal } from "./auth-modal-provider";
import { AuthModalShell } from "./auth-modal-shell";
import { PasswordInput } from "./password-input";
import FacebookIcon from "../../../public/icons/fb-icon.png";
import GoogleIcon from "../../../public/icons/gg-icon.png";

const registerSchema = z
  .object({
    username: z
      .string()
      .min(3, "Nome de usuário deve ter ao menos 3 caracteres."),
    email: z.string().email("E-mail inválido."),
    password: z.string().min(8, "Senha deve ter ao menos 8 caracteres."),
    passwordConfirmation: z.string(),
  })
  .refine((v) => v.password === v.passwordConfirmation, {
    path: ["passwordConfirmation"],
    message: "As senhas não coincidem.",
  });

type RegisterForm = z.infer<typeof registerSchema>;

export function RegisterPage() {
  const navigate = useNavigate();
  const { close, switchMode, redirect } = useAuthModal();
  const registerMutation = useRegister();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      passwordConfirmation: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await registerMutation.mutateAsync({
        username: values.username,
        email: values.email,
        password: values.password,
      });
      toast.success("Conta criada com sucesso!");
      close();
      void navigate({ to: redirect ?? "/" });
    } catch (err) {
      if (isApiError(err) && err.fields) {
        for (const [field, message] of Object.entries(err.fields)) {
          if (
            field === "username" ||
            field === "email" ||
            field === "password"
          ) {
            setError(field, { message });
          }
        }
      }
      const message = isApiError(err)
        ? err.message
        : "Não foi possível criar a conta.";
      toast.error(message);
    }
  });

  return (
    <AuthModalShell
      activeTab="register"
      onTabChange={switchMode}
      onClose={close}
    >
      <h1 className="uppercase block md:hidden w-full text-center text-foreground text-[32px] font-bold mb-18!">
        Kurio
      </h1>
      <p className="text-[13px] text-center text-foreground mb-6 px-12 hidden md:block">
        Crie seu perfil de colecionador e conecte uma carteira quando quiser.
      </p>
      <p className="text-center mb-10 text-lg font-bold">
        Criar perfil de colecionador
      </p>
      <form
        onSubmit={onSubmit}
        className="flex flex-col items-center mx-auto gap-y-8 md:gap-y-10 md:gap-y-3 w-full"
        noValidate
      >
        <div className="space-y-3 md:space-y-2 md:max-w-85 w-full px-7 md:p-0">
          <div className="space-y-2 w-full hidden md:block">
            <Input
              id="register-username"
              autoComplete="username"
              aria-label="Nome de usuário"
              aria-invalid={!!errors.username}
              aria-describedby={
                errors.username ? "register-username-error" : undefined
              }
              placeholder="Nome de usuário"
              className="rounded-sm min-h-10 border-border bg-transparent! focus:outline-none! focus:ring-0!"
              {...register("username")}
            />
            {errors.username && (
              <p
                id="register-username-error"
                className="text-sm text-destructive"
              >
                {errors.username.message}
              </p>
            )}
          </div>
          <div className="space-y-2 md:hidden block">
            <Input
              id="register-username"
              autoComplete="username"
              aria-label="Nome de usuário"
              aria-invalid={!!errors.username}
              aria-describedby={
                errors.username ? "register-username-error" : undefined
              }
              placeholder="Nome de usuário"
              className="rounded-sm min-h-12.5 border-border bg-transparent! focus:outline-none! focus:ring-0!"
              {...register("username")}
            />
            {errors.username && (
              <p
                id="register-username-error"
                className="text-sm text-destructive"
              >
                {errors.username.message}
              </p>
            )}
          </div>

          <div className="space-y-2 w-full hidden md:block">
            <Input
              id="register-email"
              type="email"
              autoFocus
              aria-label="E-mail"
              autoComplete="email"
              aria-invalid={!!errors.email}
              aria-describedby={
                errors.email ? "register-email-error" : undefined
              }
              placeholder="Digite seu e-mail"
              className="rounded-sm min-h-10 border-border bg-transparent! focus:outline-none! focus:ring-0!"
              {...register("email")}
            />
            {errors.email && (
              <p id="register-email-error" className="text-sm text-destructive">
                {errors.email.message}
              </p>
            )}
          </div>
          <div className="space-y-2 md:hidden block">
            <Input
              id="register-email"
              type="email"
              aria-label="E-mail"
              autoComplete="email"
              aria-invalid={!!errors.email}
              aria-describedby={
                errors.email ? "register-email-error" : undefined
              }
              placeholder="Digite seu e-mail"
              className="rounded-sm min-h-12.5 border-border bg-transparent! focus:outline-none! focus:ring-0!"
              {...register("email")}
            />
            {errors.email && (
              <p id="register-email-error" className="text-sm text-destructive">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-2 w-full hidden md:block">
            <PasswordInput
              id="register-password"
              autoComplete="new-password"
              aria-label="Senha"
              aria-invalid={!!errors.password}
              aria-describedby={
                errors.password ? "register-password-error" : undefined
              }
              placeholder="Senha"
              className="rounded-sm min-h-10 border-border bg-transparent! focus:outline-none! focus:ring-0!"
              {...register("password")}
            />
            {errors.password && (
              <p
                id="register-password-error"
                className="text-sm text-destructive"
              >
                {errors.password.message}
              </p>
            )}
          </div>
          <div className="space-y-2 md:hidden block">
            <PasswordInput
              id="register-password"
              autoComplete="new-password"
              aria-label="Senha"
              aria-invalid={!!errors.password}
              aria-describedby={
                errors.password ? "register-password-error" : undefined
              }
              placeholder="Senha"
              className="rounded-sm min-h-10 border-border bg-transparent! focus:outline-none! focus:ring-0!"
              {...register("password")}
            />
            {errors.password && (
              <p
                id="register-password-error"
                className="text-sm text-destructive"
              >
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="space-y-2 w-full hidden md:block">
            <PasswordInput
              id="register-password-confirmation"
              autoComplete="new-password"
              aria-label="Confirmar senha"
              aria-invalid={!!errors.passwordConfirmation}
              aria-describedby={
                errors.passwordConfirmation
                  ? "register-password-confirmation-error"
                  : undefined
              }
              placeholder="Confirmar senha"
              className="rounded-sm min-h-10 border-border bg-transparent! focus:outline-none! focus:ring-0!"
              {...register("passwordConfirmation")}
            />
            {errors.passwordConfirmation && (
              <p
                id="register-password-confirmation-error"
                className="text-sm text-destructive"
              >
                {errors.passwordConfirmation.message}
              </p>
            )}
          </div>
          <div className="space-y-2 md:hidden block mb-10">
            <PasswordInput
              id="register-password-confirmation"
              autoComplete="new-password"
              aria-label="Confirmar senha"
              aria-invalid={!!errors.passwordConfirmation}
              aria-describedby={
                errors.passwordConfirmation
                  ? "register-password-confirmation-error"
                  : undefined
              }
              placeholder="Confirmar senha"
              className="rounded-sm min-h-12.5 border-border bg-transparent! focus:outline-none! focus:ring-0!"
              {...register("passwordConfirmation")}
            />
            {errors.passwordConfirmation && (
              <p
                id="register-password-confirmation-error"
                className="text-sm text-destructive"
              >
                {errors.passwordConfirmation.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-sm text-ink font-bold text-base min-h-[60px] md:min-h-[45px]"
          >
            {isSubmitting ? "Criando conta..." : "Criar conta"}
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

          <div className="flex flex-col gap-y-2 md:gap-y-3 px-7 md:px-12 mb-6 md:mb-[93px]">
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
