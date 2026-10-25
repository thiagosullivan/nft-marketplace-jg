import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import type { OrderStatus } from "@/shared/api/types";

export type OrderListFilter = "all" | OrderStatus;

type Props = {
  value: OrderListFilter;
  onChange: (next: OrderListFilter) => void;
};

const OPTIONS: { value: OrderListFilter; label: string }[] = [
  { value: "all", label: "Tudo" },
  { value: "pending", label: "Pendente" },
  { value: "confirmed", label: "Confirmado" },
  { value: "declined", label: "Recusado" },
];

export function OrderListFilters({ value, onChange }: Props) {
  return (
    <Tabs value={value} onValueChange={(v) => onChange(v as OrderListFilter)}>
      <TabsList className="bg-surface-card rounded-xs">
        {OPTIONS.map((opt) => (
          <TabsTrigger key={opt.value} value={opt.value} className="rounded-xs">
            {opt.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
