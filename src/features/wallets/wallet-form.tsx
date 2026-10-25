import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import type { Profile } from "@/shared/api/types";
import { isApiError } from "@/shared/api";
import { useCreateWallet } from "./use-wallets";

const NETWORKS = ["ethereum", "polygon", "solana"] as const;
const WALLET_TYPES = ["metamask", "ledger", "coinbase", "other"] as const;
const ENS_SUFFIXES = [".eth", ".sol", ".xyz"] as const;

const walletSchema = z.object({
  label: z
    .string()
    .trim()
    .min(1, "Informe um apelido.")
    .max(40, "Máximo 40 caracteres."),
  address: z.string().trim().min(10, "Endereço inválido."),
  network: z.enum(NETWORKS),
  walletType: z.enum(WALLET_TYPES),
  ensLocalPart: z.string().trim().max(30, "Máximo 30 caracteres."),
  ensSuffix: z.enum(ENS_SUFFIXES),
  referralCode: z.string().trim().max(40, "Máximo 40 caracteres."),
});

type FormValues = z.infer<typeof walletSchema>;

const emptyValues: FormValues = {
  label: "",
  address: "",
  network: "ethereum",
  walletType: "metamask",
  ensLocalPart: "",
  ensSuffix: ".eth",
  referralCode: "",
};

type Props = { profile: Profile };

export function WalletForm({ profile }: Props) {
  const createWallet = useCreateWallet();

  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(walletSchema),
    defaultValues: emptyValues,
  });

  const ensLocalPart = useWatch({ control, name: "ensLocalPart" });
  const ensSuffix = useWatch({ control, name: "ensSuffix" });

  const onSubmit = async (values: FormValues) => {
    const ensName = values.ensLocalPart
      ? `${values.ensLocalPart}${values.ensSuffix}`
      : null;

    try {
      await createWallet.mutateAsync({
        label: values.label.trim(),
        address: values.address.trim(),
        network: values.network,
        walletType: values.walletType,
        ensName,
        referralCode: values.referralCode.trim() || null,
      });
      reset(emptyValues);
    } catch (err) {
      if (isApiError(err) && err.fields) {
        for (const [field, message] of Object.entries(err.fields)) {
          if (
            field === "label" ||
            field === "address" ||
            field === "network" ||
            field === "walletType"
          ) {
            setError(field, { type: "server", message });
          }
        }
      }
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col"
      noValidate
    >
      <header className="mb-8">
        <h1 className="text-base font-bold text-foreground mb-2">
          Carteira principal
        </h1>
        <p className="text-sm text-secondary">
          Estas carteiras ficam disponíveis no pagamento e para receber NFTs
          comprados.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-8">
        <div className="flex flex-col gap-1.5">
          <Label className="text-[15px] font-normal" htmlFor="displayName">
            Nome de exibição
          </Label>
          <Input
            id="displayName"
            value={profile.displayName}
            disabled
            readOnly
            className="pointer-events-none cursor-not-allowed h-10 border border-border rounded-xs bg-transparent! focus:outline-none! focus:ring-0! placeholder-text-secondary text-foreground"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="text-[15px] font-normal" htmlFor="label">
            Apelido da carteira
          </Label>
          <Input
            id="label"
            {...register("label")}
            className="h-10 border border-border rounded-xs bg-transparent! focus:outline-none! focus:ring-0! placeholder-text-secondary text-foreground"
          />
          {errors.label && (
            <p className="text-xs text-destructive" role="alert">
              {errors.label.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="text-[15px] font-normal" htmlFor="network">
            Rede
          </Label>
          <Controller
            control={control}
            name="network"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger
                  id="network"
                  className="h-10 border border-border rounded-xs bg-transparent! focus:outline-none! focus:ring-0! w-full"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border border-border rounded-xs bg-ink mr-2.5">
                  {NETWORKS.map((n) => (
                    <SelectItem key={n} value={n}>
                      {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.network && (
            <p className="text-xs text-destructive" role="alert">
              {errors.network.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="text-[15px] font-normal" htmlFor="profileName">
            Nome do perfil
          </Label>
          <Input
            id="profileName"
            value={`@${profile.username}`}
            disabled
            readOnly
            className="pointer-events-none cursor-not-allowed h-10 border border-border rounded-xs bg-transparent! focus:outline-none! focus:ring-0! placeholder-text-secondary text-foreground"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="text-[15px] font-normal" htmlFor="address">
            Endereço da carteira
          </Label>
          <Input
            id="address"
            {...register("address")}
            className="h-10 border border-border rounded-xs bg-transparent! focus:outline-none! focus:ring-0! placeholder-text-secondary text-foreground"
          />
          {errors.address && (
            <p className="text-xs text-destructive" role="alert">
              {errors.address.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="text-[15px] font-normal" htmlFor="ensDisplay">
            ENS ou carteira secundária
          </Label>
          <Input
            id="ensDisplay"
            placeholder="seunome.eth"
            disabled
            readOnly
            value={ensLocalPart ? `${ensLocalPart}${ensSuffix}` : ""}
            className="pointer-events-none cursor-not-allowed h-10 border border-border rounded-xs bg-transparent! focus:outline-none! focus:ring-0! w-full placeholder-text-secondary text-foreground"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="text-[15px] font-normal" htmlFor="walletType">
            Tipo de carteira
          </Label>
          <Controller
            control={control}
            name="walletType"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger
                  id="walletType"
                  className="h-10 border border-border rounded-xs bg-transparent! focus:outline-none! focus:ring-0! w-full"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border border-border rounded-xs bg-ink mr-2.5">
                  {WALLET_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.walletType && (
            <p className="text-xs text-destructive" role="alert">
              {errors.walletType.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="text-[15px] font-normal" htmlFor="referralCode">
            Código de indicação
          </Label>
          <Input
            id="referralCode"
            {...register("referralCode")}
            className="h-10 border border-border rounded-xs bg-transparent! focus:outline-none! focus:ring-0! placeholder-text-secondary text-foreground"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="text-[15px] font-normal" htmlFor="email">
            E-mail
          </Label>
          <Input
            id="email"
            value={profile.email}
            disabled
            readOnly
            className="pointer-events-none cursor-not-allowed h-10 border border-border rounded-xs bg-transparent! focus:outline-none! focus:ring-0! placeholder-text-secondary text-foreground"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="text-[15px] font-normal" htmlFor="ensLocalPart">
            Nome ENS
          </Label>
          <div className="flex">
            <Controller
              control={control}
              name="ensSuffix"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    aria-label="Sufixo do nome ENS"
                    className="h-10! border border-border rounded-xs bg-transparent! mr-2.5"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border border-border rounded-xs bg-ink mr-2.5">
                    {ENS_SUFFIXES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <Input
              id="ensLocalPart"
              className="h-10 border border-border rounded-xs bg-transparent! focus:outline-none! focus:ring-0! placeholder-text-secondary text-foreground"
              placeholder="seunome"
              {...register("ensLocalPart")}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-start">
        <Button
          type="submit"
          disabled={createWallet.isPending}
          className="h-10 bg-primary rounded-xs text-ink font-bold text-sm cursor-pointer hover:bg-primary/80"
        >
          {createWallet.isPending ? "Salvando…" : "Salvar carteira"}
        </Button>
      </div>
    </form>
  );
}
