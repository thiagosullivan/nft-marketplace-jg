import { useEffect, useState } from "react";
import { Slider } from "@/shared/components/ui/slider";
import { Button } from "@/shared/components/ui/button";

type Props = {
  min: number;
  max: number;
  step?: number;
  value: [number, number];
  onChange: (next: [number, number]) => void;
};

export function PriceRange({ min, max, step = 0.01, value, onChange }: Props) {
  const [local, setLocal] = useState<[number, number]>(value);
  const minV = value[0];
  const maxV = value[1];

  useEffect(() => {
    setLocal([minV, maxV]);
  }, [minV, maxV]);

  const isDirty = local[0] !== minV || local[1] !== maxV;

  const apply = () => {
    onChange([local[0], local[1]]);
  };

  return (
    <div className="space-y-3">
      <Slider
        min={min}
        max={max}
        step={step}
        value={local}
        onValueChange={(v) => setLocal([v[0], v[1]] as [number, number])}
        className="color-primary"
      />
      <div className="flex items-center justify-between text-[15px] font-normal text-foreground">
        <p>
          Preço: <span>{local[0].toFixed(2)}</span> -{" "}
          <span>{local[1].toFixed(2)} ETH</span>
        </p>
      </div>
      <Button
        type="button"
        size="sm"
        onClick={apply}
        disabled={!isDirty}
        className="py-2 px-3 rounded-sm text-ink bg-primary"
      >
        Aplicar
      </Button>
    </div>
  );
}
