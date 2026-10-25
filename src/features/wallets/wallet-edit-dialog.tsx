import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import type { Wallet } from "@/shared/api/types";
import { isApiError } from "@/shared/api";
import { useUpdateWallet } from "./use-wallets";

const NETWORKS = ["ethereum", "polygon", "solana"] as const;
const WALLET_TYPES = ["metamask", "ledger", "coinbase", "other"] as const;
const ENS_SUFFIXES = [".eth", ".sol", ".xyz"] as const;

const schema = z.object({
  label: z.string().trim().min(1, "Informe um apelido."),
  address: z.string().trim().min(10, "Endereço inválido."),
  network: z.enum(NETWORKS),
  walletType: z.enum(WALLET_TYPES),
  ensLocalPart: z.string().trim().max(30, "Máximo 30 caracteres."),
  ensSuffix: z.enum(ENS_SUFFIXES),
  referralCode: z.string().trim().max(40, "Máximo 40 caracteres."),
});

type FormValues = z.infer<typeof schema>;

function splitEns(ensName: string | null) {
  if (!ensName) return { local: "", suffix: ".eth" as const };
  const match = ENS_SUFFIXES.find((s) => ensName.endsWith(s));
  if (!match) return { local: ensName, suffix: ".eth" as const };
  return {
    local: ensName.slice(0, ensName.length - match.length),
    suffix: match,
  };
}

type Props = {
  wallet: Wallet | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function WalletEditDialog({ wallet, open, onOpenChange }: Props) {
  const updateWallet = useUpdateWallet();
  const initialEns = splitEns(wallet?.ensName ?? null);

  const {
    control,
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      label: wallet?.label ?? "",
      address: wallet?.address ?? "",
      network: (wallet?.network as (typeof NETWORKS)[number]) ?? "ethereum",
      walletType:
        (wallet?.walletType as (typeof WALLET_TYPES)[number]) ?? "metamask",
      ensLocalPart: initialEns.local,
      ensSuffix: initialEns.suffix,
      referralCode: wallet?.referralCode ?? "",
    },
  });

  useEffect(() => {
    if (!wallet) return;
    const ens = splitEns(wallet.ensName);
    reset({
      label: wallet.label,
      address: wallet.address,
      network: wallet.network as (typeof NETWORKS)[number],
      walletType: wallet.walletType as (typeof WALLET_TYPES)[number],
      ensLocalPart: ens.local,
      ensSuffix: ens.suffix,
      referralCode: wallet.referralCode ?? "",
    });
  }, [wallet, reset]);

  const onSubmit = async (values: FormValues) => {
    if (!wallet) return;
    const ensName = values.ensLocalPart
      ? `${values.ensLocalPart}${values.ensSuffix}`
      : null;
    try {
      await updateWallet.mutateAsync({
        id: wallet.id,
        input: {
          label: values.label.trim(),
          address: values.address.trim(),
          network: values.network,
          walletType: values.walletType,
          ensName,
          referralCode: values.referralCode.trim() || null,
        },
      });
      onOpenChange(false);
    } catch (err) {
      if (isApiError(err) && err.fields) {
        for (const [field, message] of Object.entries(err.fields)) {
          if (
            field === "label" ||
            field === "address" ||
            field === "network" ||
            field === "walletType"
          ) {
            setError(field as keyof FormValues, {
              type: "server",
              message,
            });
          }
        }
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar carteira</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
          noValidate
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-label">Apelido</Label>
              <Input id="edit-label" {...register("label")} />
              {errors.label && (
                <p className="text-xs text-destructive" role="alert">
                  {errors.label.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-address">Endereço</Label>
              <Input id="edit-address" {...register("address")} />
              {errors.address && (
                <p className="text-xs text-destructive" role="alert">
                  {errors.address.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-network">Rede</Label>
              <Controller
                control={control}
                name="network"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="edit-network">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {NETWORKS.map((n) => (
                        <SelectItem key={n} value={n}>
                          {n}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-walletType">Tipo</Label>
              <Controller
                control={control}
                name="walletType"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="edit-walletType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {WALLET_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-ensLocalPart">Nome ENS</Label>
              <div className="flex">
                <Input
                  id="edit-ensLocalPart"
                  className="rounded-r-none"
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
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-referralCode">Código de indicação</Label>
              <Input id="edit-referralCode" {...register("referralCode")} />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={updateWallet.isPending}>
              {updateWallet.isPending ? "Salvando…" : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
