import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import type { Profile, Wallet, WalletType } from "@/shared/api/types";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { CheckoutNewWalletFields } from "./checkout-new-wallet-fields";

const NETWORKS = ["ethereum", "polygon", "solana"] as const;
const WALLET_TYPES: WalletType[] = [
  "metamask",
  "walletconnect",
  "coinbase",
  "ledger",
  "other",
];

const schema = z.object({
  displayName: z.string().min(2, "Informe o nome de exibição."),
  username: z.string().min(3, "Informe o nome de usuário."),
  network: z.enum(NETWORKS),
  profileName: z.string(),
  walletAddress: z.string(),
  ensOrSecondary: z.string().optional(),
  walletType: z.enum([
    "metamask",
    "walletconnect",
    "coinbase",
    "ledger",
    "other",
  ]),
  referralCode: z.string().optional(),
  email: z.string().email("E-mail inválido."),
  ensName: z.string().optional(),
  useNewWallet: z.boolean(),
  note: z.string().max(500).optional(),
});

export type CheckoutFormValues = z.infer<typeof schema>;

type Props = {
  profile: Profile;
  wallets: Wallet[];
  selectedWalletId: string | null;
  onSelectedWalletChange: (id: string) => void;
  onNewWalletSaved: (wallet: Wallet) => void;
  onSubmit: (values: CheckoutFormValues) => void;
  formId: string;
};

const inputClass =
  "border border-border rounded-xs bg-transparent! text-secondary text-sm outline-none! focus:outline-none! focus-visible:outline-none! focus-visible:ring-0! focus-visible:ring-offset-0! focus-visible:border-primary!";
const selectTriggerClass =
  "w-full border border-border rounded-xs bg-transparent! text-secondary text-sm outline-none! focus:outline-none! focus-visible:outline-none! focus-visible:ring-0! focus-visible:ring-offset-0! focus-visible:border-primary!";
const labelClass = "text-[15px] font-normal text-foreground";

export function CheckoutForm({
  profile,
  wallets,
  selectedWalletId,
  onSelectedWalletChange,
  onNewWalletSaved,
  onSubmit,
  formId,
}: Props) {
  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      displayName: profile.displayName,
      username: profile.username,
      network: "ethereum",
      profileName: profile.displayName,
      walletAddress: selectedWalletId ?? "",
      ensOrSecondary: profile.ensName ?? "",
      walletType: "metamask",
      referralCode: "",
      email: profile.email,
      ensName: profile.ensName ?? "",
      useNewWallet: false,
      note: "",
    },
  });

  const useNewWallet = useWatch({
    control: form.control,
    name: "useNewWallet",
  });
  const watchedNetwork = useWatch({ control: form.control, name: "network" });
  const watchedWalletType = useWatch({
    control: form.control,
    name: "walletType",
  });

  const selectedWallet = wallets.find((w) => w.id === selectedWalletId);

  return (
    <form
      id={formId}
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-4"
      noValidate
    >
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="displayName" className={labelClass}>
            Nome de exibição
          </Label>
          <Input
            id="displayName"
            {...form.register("displayName")}
            className={inputClass}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="username" className={labelClass}>
            Nome de usuário
          </Label>
          <Input
            id="username"
            readOnly
            {...form.register("username")}
            className={inputClass}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="network" className={labelClass}>
            Rede
          </Label>
          <Select
            value={selectedWallet?.network ?? watchedNetwork}
            onValueChange={(v) =>
              form.setValue("network", v as CheckoutFormValues["network"])
            }
            disabled={!useNewWallet}
          >
            <SelectTrigger
              aria-label="Network"
              id="network"
              className={selectTriggerClass}
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
          <Label htmlFor="profileName" className={labelClass}>
            Nome do perfil
          </Label>
          <Input
            id="profileName"
            readOnly
            {...form.register("profileName")}
            className={inputClass}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="walletAddress" className={labelClass}>
            Endereço da carteira
          </Label>
          <Select
            value={selectedWalletId ?? ""}
            onValueChange={(v) => onSelectedWalletChange(v)}
            disabled={useNewWallet}
          >
            <SelectTrigger
              aria-label="Endereços de Carteiras"
              id="walletAddress"
              className={selectTriggerClass}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {wallets.map((w) => (
                <SelectItem key={w.id} value={w.id}>
                  {w.label} — {w.address}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ensOrSecondary" className={`${labelClass} h-5.5`}>
            {" "}
          </Label>
          <Input
            id="ensOrSecondary"
            {...form.register("ensOrSecondary")}
            placeholder="ENS ou carteira secundária (opcional)"
            className={inputClass}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="walletType" className={labelClass}>
            Tipo de carteira
          </Label>
          <Select
            value={selectedWallet?.walletType ?? watchedWalletType}
            onValueChange={(v) =>
              form.setValue("walletType", v as CheckoutFormValues["walletType"])
            }
            disabled={!useNewWallet}
          >
            <SelectTrigger
              aria-label="Tipo de Carteira"
              id="walletType"
              className={selectTriggerClass}
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
          <Label htmlFor="referralCode" className={labelClass}>
            Código de indicação
          </Label>
          <Input
            id="referralCode"
            readOnly={!useNewWallet}
            {...form.register("referralCode")}
            className={inputClass}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email" className={labelClass}>
            E-mail
          </Label>
          <Input
            id="email"
            type="email"
            {...form.register("email")}
            className={inputClass}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ensName" className={labelClass}>
            Nome ENS
          </Label>
          <Input
            id="ensName"
            {...form.register("ensName")}
            className={inputClass}
          />
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm text-foreground">
        <Checkbox
          id="useNewWallet"
          checked={useNewWallet}
          onCheckedChange={(checked) =>
            form.setValue("useNewWallet", checked === true, {
              shouldDirty: true,
            })
          }
          className="size-[15px] rounded-none border-primary! bg-transparent! data-[state=checked]:bg-transparent! [&_svg]:text-primary [&_svg]:bg-transparent"
        />
        <label htmlFor="useNewWallet" className="cursor-pointer">
          Usar outra carteira?
        </label>
      </div>

      {useNewWallet && (
        <CheckoutNewWalletFields
          onSaved={(wallet) => {
            form.setValue("useNewWallet", false, { shouldDirty: true });
            onNewWalletSaved(wallet);
          }}
        />
      )}

      <div className="space-y-1.5">
        <Label htmlFor="note" className={labelClass}>
          Observação do colecionador (opcional)
        </Label>
        <textarea
          id="note"
          rows={4}
          {...form.register("note")}
          className="resize-none max-w-[350px] rounded-xs w-full border border-border bg-transparent p-3 text-sm text-secondary outline-none focus-visible:ring-1 focus-visible:ring-primary"
        />
      </div>
    </form>
  );
}
