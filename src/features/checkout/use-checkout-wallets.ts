import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { http, isApiError } from "@/shared/api";
import type { CreateWalletInput, Wallet } from "@/shared/api/types";
import { walletKeys } from "@/shared/api/query-keys";
import { useSession } from "@/features/auth/use-auth";

export function useCheckoutWallets() {
  const { data: session } = useSession();
  return useQuery<Wallet[]>({
    queryKey: walletKeys.list(),
    queryFn: async () => {
      const { data } = await http.get<Wallet[]>("/wallets");
      return data;
    },
    enabled: !!session,
    staleTime: 30_000,
    retry: 0,
  });
}

export function useCreateCheckoutWallet() {
  const queryClient = useQueryClient();
  const mutation = useMutation<Wallet, unknown, CreateWalletInput>({
    mutationFn: async (input) => {
      const { data } = await http.post<Wallet>("/wallets", {
        ...input,
        isPrimary: false,
      });
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: walletKeys.all });
    },
  });

  const create = async (input: CreateWalletInput): Promise<Wallet | null> => {
    try {
      return await mutation.mutateAsync(input);
    } catch (err) {
      const message = isApiError(err)
        ? ((err.fields && Object.values(err.fields)[0]) ?? err.message)
        : "Não foi possível cadastrar a carteira.";
      toast.error(message);
      return null;
    }
  };

  return { create, isPending: mutation.isPending };
}
