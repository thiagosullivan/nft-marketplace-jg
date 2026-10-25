import { Skeleton } from "@/shared/components/ui/skeleton";
import { useProfile } from "./use-profile";
import { ProfileForm } from "./profile-form";

export function ProfilePanel() {
  const profile = useProfile();

  if (profile.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (profile.isError || !profile.data) {
    return (
      <p className="text-sm text-secondary">
        Não foi possível carregar o perfil.
      </p>
    );
  }

  return <ProfileForm profile={profile.data} />;
}
