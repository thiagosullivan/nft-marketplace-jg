import { useState } from "react";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
  AccountSidebar,
  type AccountSection,
} from "@/features/account/account-sidebar";
import { useProfile } from "./use-profile";
import { ProfileForm } from "./profile-form";

export function ProfilePage() {
  const [section, setSection] = useState<AccountSection>("profile");
  const profile = useProfile();

  return (
    <div className="container mx-auto max-w-6xl px-4 py-10">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-[260px_1fr]">
        <AccountSidebar activeSection={section} onSectionChange={setSection} />

        <div className="min-w-0">
          {section === "profile" ? (
            <ProfilePanel profile={profile} />
          ) : (
            <WalletsPanelPlaceholder />
          )}
        </div>
      </div>
    </div>
  );
}

function ProfilePanel({ profile }: { profile: ReturnType<typeof useProfile> }) {
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

function WalletsPanelPlaceholder() {
  return (
    <div className="rounded-lg border border-border p-6">
      <h1 className="text-2xl font-bold text-primary">Carteiras</h1>
      <p className="mt-2 text-sm text-secondary">Em construção (Fase 2.7.c).</p>
    </div>
  );
}
