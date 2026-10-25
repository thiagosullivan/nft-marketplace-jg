import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { http, isApiError } from "@/shared/api";
import type {
  ChangePasswordInput,
  Profile,
  UpdateProfileInput,
} from "@/shared/api/types";
import { profileKeys, sessionKeys } from "@/shared/api/query-keys";
import { useSession } from "@/features/auth/use-auth";

export function useProfile() {
  const { data: session } = useSession();

  return useQuery<Profile>({
    queryKey: profileKeys.current(),
    queryFn: async () => {
      const { data } = await http.get<Profile>("/profile");
      return data;
    },
    enabled: !!session,
    retry: 0,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation<Profile, unknown, UpdateProfileInput>({
    mutationFn: async (input) => {
      const { data } = await http.patch<Profile>("/profile", input);
      return data;
    },
    onSuccess: (profile) => {
      queryClient.setQueryData(profileKeys.current(), profile);
      void queryClient.invalidateQueries({ queryKey: sessionKeys.current() });
      toast.success("Perfil atualizado.");
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
        isApiError(error) ? error.message : "Não foi possível salvar o perfil.",
      );
    },
  });
}

export function useUpdateAvatar() {
  const queryClient = useQueryClient();

  return useMutation<Profile, unknown, string | null>({
    mutationFn: async (avatarUrl) => {
      const { data } = await http.post<Profile>("/profile/avatar", {
        avatarUrl,
      });
      return data;
    },
    onSuccess: (profile) => {
      queryClient.setQueryData(profileKeys.current(), profile);
      void queryClient.invalidateQueries({ queryKey: sessionKeys.current() });
      toast.success("Avatar atualizado.");
    },
    onError: (error) => {
      toast.error(
        isApiError(error)
          ? error.message
          : "Não foi possível atualizar o avatar.",
      );
    },
  });
}

export function useChangePassword() {
  const queryClient = useQueryClient();

  return useMutation<{ ok: true }, unknown, ChangePasswordInput>({
    mutationFn: async (input) => {
      const { data } = await http.post<{ ok: true }>(
        "/profile/password",
        input,
      );
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: sessionKeys.current() });
      toast.success("Senha alterada.");
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
        isApiError(error) ? error.message : "Não foi possível alterar a senha.",
      );
    },
  });
}
