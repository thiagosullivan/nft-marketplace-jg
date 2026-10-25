import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { http, isApiError } from "@/shared/api";
import type {
  CreateWalletInput,
  UpdateWalletInput,
  Wallet,
} from "@/shared/api/types";
import { walletKeys } from "@/shared/api/query-keys";
import { useSession } from "@/features/auth/use-auth";

export function useWallets() {
  const { data: session } = useSession();

  return useQuery<Wallet[]>({
    queryKey: walletKeys.list(),
    queryFn: async () => {
      const { data } = await http.get<Wallet[]>("/wallets");
      return data;
    },
    enabled: !!session,
    retry: 0,
  });
}

export function useCreateWallet() {
  const queryClient = useQueryClient();

  return useMutation<Wallet, unknown, CreateWalletInput>({
    mutationFn: async (input) => {
      const { data } = await http.post<Wallet>("/wallets", input);
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: walletKeys.all });
      toast.success("Carteira adicionada.");
    },
    onError: (error) => {
      if (
        isApiError(error) &&
        error.fields &&
        Object.keys(error.fields).length > 0
      ) {
        return;
      }
      toast.error(
        isApiError(error)
          ? error.message
          : "Não foi possível criar a carteira.",
      );
    },
  });
}

export function useUpdateWallet() {
  const queryClient = useQueryClient();

  return useMutation<Wallet, unknown, { id: string; input: UpdateWalletInput }>(
    {
      mutationFn: async ({ id, input }) => {
        const { data } = await http.patch<Wallet>(`/wallets/${id}`, input);
        return data;
      },
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: walletKeys.all });
        toast.success("Carteira atualizada.");
      },
      onError: (error) => {
        if (
          isApiError(error) &&
          error.fields &&
          Object.keys(error.fields).length > 0
        ) {
          return;
        }
        toast.error(
          isApiError(error)
            ? error.message
            : "Não foi possível atualizar a carteira.",
        );
      },
    },
  );
}

export function useDeleteWallet() {
  const queryClient = useQueryClient();

  return useMutation<{ ok: true }, unknown, string>({
    mutationFn: async (id) => {
      const { data } = await http.delete<{ ok: true }>(`/wallets/${id}`);
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: walletKeys.all });
      toast.success("Carteira removida.");
    },
    onError: (error) => {
      toast.error(
        isApiError(error)
          ? error.message
          : "Não foi possível remover a carteira.",
      );
    },
  });
}

export function useSetPrimaryWallet() {
  const queryClient = useQueryClient();

  return useMutation<Wallet, unknown, string>({
    mutationFn: async (id) => {
      const { data } = await http.patch<Wallet>(`/wallets/${id}`, {
        isPrimary: true,
      });
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: walletKeys.all });
      toast.success("Carteira definida como principal.");
    },
    onError: (error) => {
      toast.error(
        isApiError(error)
          ? error.message
          : "Não foi possível definir como principal.",
      );
    },
  });
}
