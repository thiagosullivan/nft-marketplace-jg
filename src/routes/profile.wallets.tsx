import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/profile/wallets")({
  component: WalletsPlaceholder,
});

function WalletsPlaceholder() {
  return (
    <div className="rounded-lg border border-border p-6">
      <h1 className="text-2xl font-bold text-primary">Carteiras</h1>
      <p className="mt-2 text-sm text-secondary">Em construção (Fase 2.7.c).</p>
    </div>
  );
}
