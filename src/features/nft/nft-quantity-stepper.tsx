import { useId } from "react";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import type { NftEdition } from "@/shared/api";

type Props = {
  value: number;
  min?: number;
  max: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  edition?: NftEdition;
};

function clamp(n: number, min: number, max: number): number {
  if (Number.isNaN(n)) return min;
  return Math.min(max, Math.max(min, Math.trunc(n)));
}

export function NftQuantityStepper({
  value,
  min = 1,
  max,
  onChange,
  disabled,
  edition,
}: Props) {
  const inputId = useId();
  const canDec = !disabled && value > min;
  const canInc = !disabled && value < max;

  return (
    <div className="space-y-2 w-full">
      {/* <label htmlFor={inputId} className="text-sm font-medium text-foreground">
        Quantidade
      </label> */}
      <div className="items-center gap-1 hidden md:flex">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => onChange(clamp(value - 1, min, max))}
          disabled={!canDec}
          aria-label="Diminuir quantidade"
          className="size-10 bg-primary! w-[33px] h-[50px] rounded-full!"
        >
          <Minus className="size-4 text-black" aria-hidden="true" />
        </Button>
        <Input
          id={inputId}
          type="number"
          inputMode="numeric"
          min={min}
          max={max}
          value={value}
          disabled={disabled}
          onChange={(e) => {
            const next = Number(e.target.value);
            onChange(clamp(next, min, max));
          }}
          aria-describedby={`${inputId}-hint`}
          className="h-10 w-10 text-center bg-transparent! border-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => onChange(clamp(value + 1, min, max))}
          disabled={!canInc}
          aria-label="Aumentar quantidade"
          className="size-10 bg-primary! w-[33px] h-[50px] rounded-full!"
        >
          <Plus className="size-4" aria-hidden="true" />
        </Button>
        <p
          id={`${inputId}-hint`}
          className="ml-2 text-xs text-muted-foreground"
        >
          {max >= 9999 ? "Ilimitada" : `Máx. ${max}`}
        </p>
      </div>

      <div className="flex items-center justify-around mx-auto md:hidden py-5 px-6">
        <div className="flex items-center gap-x-2">
          <p className="text-secondary text-[15px] font-medium">Qtd.</p>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => onChange(clamp(value - 1, min, max))}
              disabled={!canDec}
              aria-label="Diminuir quantidade"
              className="size-7 bg-primary! w-[20px] h-[30px] rounded-full!"
            >
              <Minus className="size-4 text-black" aria-hidden="true" />
            </Button>
            <Input
              id={inputId}
              type="number"
              inputMode="numeric"
              min={min}
              max={max}
              value={value}
              disabled={disabled}
              onChange={(e) => {
                const next = Number(e.target.value);
                onChange(clamp(next, min, max));
              }}
              aria-describedby={`${inputId}-hint`}
              className="pl-2 h-10 w-7 text-xs text-center bg-transparent! border-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => onChange(clamp(value + 1, min, max))}
              disabled={!canInc}
              aria-label="Aumentar quantidade"
              className="size-7 bg-primary! w-[20px] h-[30px] rounded-full!"
            >
              <Plus className="size-4" aria-hidden="true" />
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-accent text-xl font-bold">
            {edition?.priceEth} ETH
          </p>
        </div>
      </div>
    </div>
  );
}
