import type { ReactNode } from "react";
import { AccountSidebar } from "@/features/account/account-sidebar";

export function ProfileLayout({ children }: { children: ReactNode }) {
  return (
    <div className="container mx-auto max-w-6xl px-4 pt-10 pb-24">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-[260px_1fr]">
        <AccountSidebar />
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
