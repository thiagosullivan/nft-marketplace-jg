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
  newWalletLabel: z.string().optional(),
  newWalletAddress: z.string().optional(),
  newWalletNetwork: z.enum(NETWORKS).optional(),
  newWalletEns: z.string().optional(),
  newWalletType: z
    .enum(["metamask", "walletconnect", "coinbase", "ledger", "other"])
    .optional(),
  newWalletReferral: z.string().optional(),
  note: z.string().max(500).optional(),
});

export type CheckoutFormValues = z.infer<typeof schema>;

type Props = {
  profile: Profile;
  wallets: Wallet[];
  selectedWalletId: string | null;
  onSelectedWalletChange: (id: string) => void;
  onSubmit: (values: CheckoutFormValues) => void;
  formId: string;
};

export function CheckoutForm({
  profile,
  wallets,
  selectedWalletId,
  onSelectedWalletChange,
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
      newWalletLabel: "",
      newWalletAddress: "",
      newWalletNetwork: "ethereum",
      newWalletEns: "",
      newWalletType: "metamask",
      newWalletReferral: "",
      note: "",
    },
  });

  const useNewWallet = useWatch({
    control: form.control,
    name: "useNewWallet",
  });
  const watchedNetwork = useWatch({
    control: form.control,
    name: "network",
  });
  const watchedWalletType = useWatch({
    control: form.control,
    name: "walletType",
  });
  const watchedNewWalletNetwork = useWatch({
    control: form.control,
    name: "newWalletNetwork",
  });
  const watchedNewWalletType = useWatch({
    control: form.control,
    name: "newWalletType",
  });

  const selectedWallet = wallets.find((w) => w.id === selectedWalletId);

  return (
    <form
      id={formId}
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-4"
      noValidate
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="displayName">Nome de exibição</Label>
          <Input id="displayName" {...form.register("displayName")} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="username">Nome de usuário</Label>
          <Input id="username" readOnly {...form.register("username")} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="network">Rede</Label>
          <Select
            value={selectedWallet?.network ?? watchedNetwork}
            onValueChange={(v) =>
              form.setValue("network", v as CheckoutFormValues["network"])
            }
            disabled={!useNewWallet}
          >
            <SelectTrigger id="network">
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
          <Label htmlFor="profileName">Nome do perfil</Label>
          <Input id="profileName" readOnly {...form.register("profileName")} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="walletAddress">Endereço da carteira</Label>
          <Select
            value={selectedWalletId ?? ""}
            onValueChange={(v) => onSelectedWalletChange(v)}
            disabled={useNewWallet}
          >
            <SelectTrigger id="walletAddress">
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
          <Label htmlFor="ensOrSecondary">
            ENS ou carteira secundária (opcional)
          </Label>
          <Input id="ensOrSecondary" {...form.register("ensOrSecondary")} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="walletType">Tipo de carteira</Label>
          <Select
            value={selectedWallet?.walletType ?? watchedWalletType}
            onValueChange={(v) =>
              form.setValue("walletType", v as CheckoutFormValues["walletType"])
            }
            disabled={!useNewWallet}
          >
            <SelectTrigger id="walletType">
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
          <Label htmlFor="referralCode">Código de indicação</Label>
          <Input
            id="referralCode"
            readOnly={!useNewWallet}
            {...form.register("referralCode")}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" type="email" {...form.register("email")} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ensName">Nome ENS</Label>
          <Input id="ensName" {...form.register("ensName")} />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-foreground">
        <input type="checkbox" {...form.register("useNewWallet")} />
        Usar outra carteira?
      </label>

      {useNewWallet && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="newWalletLabel">Rótulo da nova carteira</Label>
            <Input id="newWalletLabel" {...form.register("newWalletLabel")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="newWalletAddress">Endereço da nova carteira</Label>
            <Input
              id="newWalletAddress"
              {...form.register("newWalletAddress")}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="newWalletNetwork">Rede</Label>
            <Select
              value={watchedNewWalletNetwork ?? "ethereum"}
              onValueChange={(v) =>
                form.setValue(
                  "newWalletNetwork",
                  v as CheckoutFormValues["newWalletNetwork"],
                )
              }
            >
              <SelectTrigger id="newWalletNetwork">
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
            <Label htmlFor="newWalletType">Tipo</Label>
            <Select
              value={watchedNewWalletType ?? "metamask"}
              onValueChange={(v) =>
                form.setValue(
                  "newWalletType",
                  v as CheckoutFormValues["newWalletType"],
                )
              }
            >
              <SelectTrigger id="newWalletType">
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
            <Label htmlFor="newWalletEns">Nome ENS</Label>
            <Input id="newWalletEns" {...form.register("newWalletEns")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="newWalletReferral">Código de indicação</Label>
            <Input
              id="newWalletReferral"
              {...form.register("newWalletReferral")}
            />
          </div>
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="note">Observação do colecionador</Label>
        <textarea
          id="note"
          rows={4}
          {...form.register("note")}
          className="w-full rounded-md border border-border bg-transparent p-3 text-sm text-foreground outline-none focus-visible:ring-1 focus-visible:ring-primary"
        />
      </div>
    </form>
  );
}
