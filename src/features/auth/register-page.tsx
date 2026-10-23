import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { isApiError } from "@/shared/api";
import { useRegister } from "./use-auth";
import { useAuthModal } from "./auth-modal-provider";
import { AuthModalShell } from "./auth-modal-shell";

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
      title="Criar conta"
      subtitle="Crie seu perfil de colecionador e conecte uma carteira quando quiser."
      onClose={close}
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <div className="space-y-2">
          <Label htmlFor="register-username">Nome de usuário</Label>
          <Input
            id="register-username"
            autoComplete="username"
            aria-invalid={!!errors.username}
            aria-describedby={
              errors.username ? "register-username-error" : undefined
            }
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

        <div className="space-y-2">
          <Label htmlFor="register-email">E-mail</Label>
          <Input
            id="register-email"
            type="email"
            autoComplete="email"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "register-email-error" : undefined}
            {...register("email")}
          />
          {errors.email && (
            <p id="register-email-error" className="text-sm text-destructive">
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="register-password">Senha</Label>
          <Input
            id="register-password"
            type="password"
            autoComplete="new-password"
            aria-invalid={!!errors.password}
            aria-describedby={
              errors.password ? "register-password-error" : undefined
            }
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

        <div className="space-y-2">
          <Label htmlFor="register-password-confirmation">
            Confirmar senha
          </Label>
          <Input
            id="register-password-confirmation"
            type="password"
            autoComplete="new-password"
            aria-invalid={!!errors.passwordConfirmation}
            aria-describedby={
              errors.passwordConfirmation
                ? "register-password-confirmation-error"
                : undefined
            }
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

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Criando conta..." : "Criar conta"}
        </Button>

        <div className="space-y-2 pt-2">
          <p className="text-center text-xs text-muted-foreground">
            Ou continue com
          </p>
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant="outline"
              disabled
              aria-disabled="true"
              onClick={() => toast.info("Indisponível na demonstração.")}
            >
              Google
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled
              aria-disabled="true"
              onClick={() => toast.info("Indisponível na demonstração.")}
            >
              Facebook
            </Button>
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Já tem conta?{" "}
          <button
            type="button"
            className="text-primary underline underline-offset-4"
            onClick={() => switchMode("login")}
          >
            Entrar
          </button>
        </p>
      </form>
    </AuthModalShell>
  );
}
