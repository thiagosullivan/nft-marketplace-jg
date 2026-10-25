import { cn } from "@/shared/lib/utils";
import type { OrderStatus } from "@/shared/api/types";

const LABELS: Record<OrderStatus, string> = {
  pending: "Pendente",
  confirmed: "Confirmado",
  declined: "Recusado",
};

const STYLES: Record<OrderStatus, string> = {
  pending: "border-amber/60 text-amber bg-amber/10",
  confirmed: "border-success/60 text-success bg-success/10",
  declined: "border-destructive/60 text-destructive bg-destructive/10",
};

export function OrderStatusBadge({
  status,
  className,
}: {
  status: OrderStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide",
        STYLES[status],
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "size-1.5 rounded-full",
          status === "pending" && "bg-amber",
          status === "confirmed" && "bg-success",
          status === "declined" && "bg-destructive",
        )}
      />
      {LABELS[status]}
    </span>
  );
}
