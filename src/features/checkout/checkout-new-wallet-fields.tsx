import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
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
import type { Wallet, WalletNetwork, WalletType } from "@/shared/api/types";
import { useCreateCheckoutWallet } from "./use-checkout-wallets";

const NETWORKS: WalletNetwork[] = ["ethereum", "polygon", "solana"];
const WALLET_TYPES: WalletType[] = [
  "metamask",
  "walletconnect",
  "coinbase",
  "ledger",
  "other",
];

const fieldInputClass =
  "border border-border rounded-xs bg-transparent! text-secondary text-sm outline-none! focus:outline-none! focus-visible:outline-none! focus-visible:ring-0! focus-visible:ring-offset-0! focus-visible:border-primary!";
const fieldSelectTriggerClass =
  "w-full border border-border rounded-xs bg-transparent! text-secondary text-sm outline-none! focus:outline-none! focus-visible:outline-none! focus-visible:ring-0! focus-visible:ring-offset-0! focus-visible:border-primary!";
const fieldLabelClass = "text-[15px] font-normal text-foreground";

const schema = z.object({
  address: z
    .string()
    .min(6, "Informe o endereço da carteira.")
    .max(120, "Endereço muito longo."),
  network: z.enum(["ethereum", "polygon", "solana"]),
  walletType: z.enum([
    "metamask",
    "walletconnect",
    "coinbase",
    "ledger",
    "other",
  ]),
  ensName: z.string().optional(),
  referralCode: z.string().optional(),
});

type NewWalletValues = z.infer<typeof schema>;

type Props = {
  onSaved: (wallet: Wallet) => void;
};

function deriveLabel(address: string): string {
  const trimmed = address.trim();
  if (trimmed.length <= 10) return `Carteira ${trimmed}`;
  return `Carteira ${trimmed.slice(0, 6)}…${trimmed.slice(-4)}`;
}

export function CheckoutNewWalletFields({ onSaved }: Props) {
  const { create, isPending } = useCreateCheckoutWallet();
  const form = useForm<NewWalletValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      address: "",
      network: "ethereum",
      walletType: "metamask",
      ensName: "",
      referralCode: "",
    },
  });

  const watchedNetwork = useWatch({ control: form.control, name: "network" });
  const watchedWalletType = useWatch({
    control: form.control,
    name: "walletType",
  });

  const onSubmit = form.handleSubmit(async (values) => {
    const wallet = await create({
      label: deriveLabel(values.address),
      address: values.address.trim(),
      network: values.network,
      walletType: values.walletType,
      ensName: values.ensName?.trim() ? values.ensName.trim() : null,
      referralCode: values.referralCode?.trim()
        ? values.referralCode.trim()
        : null,
      isPrimary: false,
    });
    if (!wallet) return;
    toast.success("Carteira salva.");
    form.reset({
      address: "",
      network: "ethereum",
      walletType: "metamask",
      ensName: "",
      referralCode: "",
    });
    onSaved(wallet);
  });

  return (
    <fieldset className="space-y-4 rounded-xs border border-border p-4">
      <legend className="px-1 text-[15px] font-normal text-foreground">
        Nova carteira
      </legend>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="new-wallet-address" className={fieldLabelClass}>
            Endereço da nova carteira
          </Label>
          <Input
            id="new-wallet-address"
            placeholder="0x…"
            {...form.register("address")}
            className={fieldInputClass}
          />
          {form.formState.errors.address && (
            <p className="text-xs text-destructive" role="alert">
              {form.formState.errors.address.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="new-wallet-network" className={fieldLabelClass}>
            Rede
          </Label>
          <Select
            value={watchedNetwork}
            onValueChange={(v) =>
              form.setValue("network", v as WalletNetwork, {
                shouldValidate: true,
              })
            }
          >
            <SelectTrigger
              aria-label="Nova carteira de network"
              id="new-wallet-network"
              className={fieldSelectTriggerClass}
            >
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
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="new-wallet-type" className={fieldLabelClass}>
            Tipo
          </Label>
          <Select
            value={watchedWalletType}
            onValueChange={(v) =>
              form.setValue("walletType", v as WalletType, {
                shouldValidate: true,
              })
            }
          >
            <SelectTrigger
              aria-label="Novo tipo de carteira"
              id="new-wallet-type"
              className={fieldSelectTriggerClass}
            >
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
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="new-wallet-ens" className={fieldLabelClass}>
            Nome ENS
          </Label>
          <Input
            id="new-wallet-ens"
            {...form.register("ensName")}
            className={fieldInputClass}
          />
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="new-wallet-referral" className={fieldLabelClass}>
            Código de indicação
          </Label>
          <Input
            id="new-wallet-referral"
            {...form.register("referralCode")}
            className={fieldInputClass}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          type="button"
          onClick={() => void onSubmit()}
          disabled={isPending}
          className="rounded-xs"
        >
          {isPending ? "Salvando…" : "Salvar carteira"}
        </Button>
      </div>
    </fieldset>
  );
}
