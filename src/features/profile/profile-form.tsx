import { useEffect, useMemo, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Separator } from "@/shared/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { PasswordInput } from "@/features/auth/password-input";
import type { Profile } from "@/shared/api/types";
import { isApiError } from "@/shared/api";
import {
  useChangePassword,
  useUpdateProfile,
} from "@/features/profile/use-profile";
import { AvatarPicker } from "./avatar-picker";

const ENS_SUFFIXES = [".eth", ".sol", ".xyz"] as const;
type EnsSuffix = (typeof ENS_SUFFIXES)[number];

const profileSchema = z
  .object({
    displayName: z
      .string()
      .trim()
      .min(1, "Informe um nome de exibição.")
      .max(60, "Máximo 60 caracteres."),
    username: z
      .string()
      .trim()
      .min(3, "Mínimo 3 caracteres.")
      .max(30, "Máximo 30 caracteres.")
      .regex(/^[a-z0-9._-]+$/i, "Use letras, números, ponto, hífen ou _."),
    email: z.string().email("E-mail inválido."),
    ensLocalPart: z.string().trim().max(30, "Máximo 30 caracteres."),
    ensSuffix: z.enum(ENS_SUFFIXES),
    walletNickname: z.string().trim().max(40, "Máximo 40 caracteres."),
    currentPassword: z.string().optional(),
    newPassword: z
      .string()
      .optional()
      .refine((v) => !v || v.length >= 8, "Mínimo 8 caracteres."),
    confirmPassword: z.string().optional(),
  })
  .refine(
    (v) => {
      const newSet = !!v.newPassword && v.newPassword.length > 0;
      const currentSet = !!v.currentPassword && v.currentPassword.length > 0;
      const confirmSet = !!v.confirmPassword && v.confirmPassword.length > 0;
      if (!newSet && !currentSet && !confirmSet) return true;
      return newSet && currentSet && confirmSet;
    },
    {
      path: ["currentPassword"],
      message:
        "Preencha a senha atual, a nova e a confirmação (ou deixe as três vazias).",
    },
  )
  .refine((v) => !v.newPassword || v.newPassword === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "As senhas não coincidem.",
  });

type FormValues = z.infer<typeof profileSchema>;

function splitEns(ensName: string | null): {
  local: string;
  suffix: EnsSuffix;
} {
  if (!ensName) return { local: "", suffix: ".eth" };
  const match = ENS_SUFFIXES.find((s) => ensName.endsWith(s));
  if (!match) return { local: ensName, suffix: ".eth" };
  return {
    local: ensName.slice(0, ensName.length - match.length),
    suffix: match,
  };
}

type Props = { profile: Profile };

export function ProfileForm({ profile }: Props) {
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();

  const initialEns = splitEns(profile.ensName);

  const defaultValues = useMemo<FormValues>(
    () => ({
      displayName: profile.displayName,
      username: profile.username,
      email: profile.email,
      ensLocalPart: initialEns.local,
      ensSuffix: initialEns.suffix,
      walletNickname: "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    }),
    [profile, initialEns.local, initialEns.suffix],
  );

  const {
    control,
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues,
  });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile.avatarUrl);
  useEffect(() => {
    setAvatarUrl(profile.avatarUrl);
  }, [profile.avatarUrl]);

  const displayName = useWatch({ control, name: "displayName" });
  const isSaving = updateProfile.isPending || changePassword.isPending;

  const onSubmit = async (values: FormValues) => {
    const wantsPassword =
      !!values.currentPassword ||
      !!values.newPassword ||
      !!values.confirmPassword;

    const ensName = values.ensLocalPart
      ? `${values.ensLocalPart}${values.ensSuffix}`
      : null;

    try {
      await updateProfile.mutateAsync({
        displayName: values.displayName.trim(),
        username: values.username.trim(),
        email: values.email.trim(),
        ensName,
        avatarUrl,
      });
    } catch (err) {
      applyFieldErrors(err, setError);
      return;
    }

    if (wantsPassword) {
      try {
        await changePassword.mutateAsync({
          currentPassword: values.currentPassword ?? "",
          newPassword: values.newPassword ?? "",
        });
      } catch (err) {
        applyFieldErrors(err, setError);
        return;
      }
    }

    reset({
      ...values,
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-6"
      noValidate
    >
      <h1 className="text-2xl font-bold text-primary">Dados do perfil</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="displayName">Nome de exibição</Label>
          <Input id="displayName" {...register("displayName")} />
          {errors.displayName && (
            <p className="text-xs text-destructive" role="alert">
              {errors.displayName.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="username">Nome de usuário</Label>
          <Input id="username" {...register("username")} />
          {errors.username && (
            <p className="text-xs text-destructive" role="alert">
              {errors.username.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" type="email" {...register("email")} />
          {errors.email && (
            <p className="text-xs text-destructive" role="alert">
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="ensLocalPart">Nome ENS</Label>
          <div className="flex">
            <Input
              id="ensLocalPart"
              className="rounded-r-none"
              placeholder="seunome"
              {...register("ensLocalPart")}
            />
            <Controller
              control={control}
              name="ensSuffix"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    aria-label="Sufixo do nome ENS"
                    className="w-[100px] rounded-l-none border-l-0"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ENS_SUFFIXES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          {errors.ensLocalPart && (
            <p className="text-xs text-destructive" role="alert">
              {errors.ensLocalPart.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="walletNickname">Apelido da carteira</Label>
          <Input
            id="walletNickname"
            placeholder="ex.: carteira principal"
            {...register("walletNickname")}
          />
          <p className="text-xs text-muted-foreground">
            Este campo é só informativo neste formulário.
          </p>
        </div>

        <AvatarPicker
          value={avatarUrl}
          fallbackInitial={displayName?.trim().charAt(0).toUpperCase() || "?"}
          onChange={setAvatarUrl}
        />
      </div>

      <Separator />

      <h2 className="text-xl font-bold text-primary">Alterar senha</h2>
      <p className="-mt-4 text-sm text-muted-foreground">
        Preencha apenas se quiser trocar a senha.
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor="currentPassword">Senha atual</Label>
          <PasswordInput
            id="currentPassword"
            autoComplete="current-password"
            {...register("currentPassword")}
          />
          {errors.currentPassword && (
            <p className="text-xs text-destructive" role="alert">
              {errors.currentPassword.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="newPassword">Nova senha</Label>
          <PasswordInput
            id="newPassword"
            autoComplete="new-password"
            {...register("newPassword")}
          />
          {errors.newPassword && (
            <p className="text-xs text-destructive" role="alert">
              {errors.newPassword.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
          <PasswordInput
            id="confirmPassword"
            autoComplete="new-password"
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <p className="text-xs text-destructive" role="alert">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSaving}>
          {isSaving ? "Salvando…" : "Salvar"}
        </Button>
      </div>
    </form>
  );
}

function applyFieldErrors(
  err: unknown,
  setError: ReturnType<typeof useForm<FormValues>>["setError"],
) {
  if (!isApiError(err)) return;
  if (!err.fields) return;
  for (const [field, message] of Object.entries(err.fields)) {
    if (
      field === "displayName" ||
      field === "username" ||
      field === "email" ||
      field === "currentPassword" ||
      field === "newPassword" ||
      field === "confirmPassword"
    ) {
      setError(field, { type: "server", message });
    }
  }
}
