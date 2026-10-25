import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { http, isUnauthorized } from "@/shared/api";
import type {
  AuthResponse,
  LoginInput,
  RegisterInput,
  Session,
} from "@/shared/api/types";
import {
  cartKeys,
  favoriteKeys,
  orderKeys,
  profileKeys,
  sessionKeys,
  walletKeys,
} from "@/shared/api/query-keys";
import {
  clearAuth,
  getStoredSession,
  getToken,
  setAuth,
} from "@/shared/lib/auth-store";

export function useSession() {
  return useQuery<Session | null>({
    queryKey: sessionKeys.current(),
    queryFn: async () => {
      if (!getToken()) return null;
      try {
        const { data } = await http.get<Session>("/auth/session");
        return data;
      } catch (err) {
        if (isUnauthorized(err)) {
          clearAuth();
          return null;
        }
        throw err;
      }
    },
    placeholderData: () => getStoredSession(),
    staleTime: 60_000,
    retry: 0,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: LoginInput) => {
      const { data } = await http.post<AuthResponse>("/auth/login", input);
      return data;
    },
    onSuccess: (data) => {
      setAuth(data);
      queryClient.setQueryData(sessionKeys.current(), data.session);
      void queryClient.invalidateQueries({ queryKey: profileKeys.all });
      void queryClient.invalidateQueries({ queryKey: cartKeys.all });
      void queryClient.invalidateQueries({ queryKey: favoriteKeys.all });
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: RegisterInput) => {
      const { data } = await http.post<AuthResponse>("/auth/register", input);
      return data;
    },
    onSuccess: (data) => {
      setAuth(data);
      queryClient.setQueryData(sessionKeys.current(), data.session);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: async () => {
      await http.post("/auth/logout");
    },
    onSettled: () => {
      clearAuth();
      // Notifica subscribers ativos (header) ANTES de remover as queries.
      queryClient.setQueryData<Session | null>(sessionKeys.current(), null);
      queryClient.removeQueries({ queryKey: sessionKeys.all });
      queryClient.removeQueries({ queryKey: profileKeys.all });
      queryClient.removeQueries({ queryKey: cartKeys.all });
      queryClient.removeQueries({ queryKey: favoriteKeys.all });
      queryClient.removeQueries({ queryKey: orderKeys.all });
      queryClient.removeQueries({ queryKey: walletKeys.all });
      void navigate({ to: "/" });
    },
  });
}
