import { useId, useRef, useState } from "react";
import { Button } from "@/shared/components/ui/button";

const MAX_FILE_BYTES = 2 * 1024 * 1024;
const OUTPUT_SIZE = 256;
const OUTPUT_QUALITY = 0.85;

async function fileToResizedDataUrl(file: File): Promise<string> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () =>
      reject(reader.error ?? new Error("Falha na leitura."));
    reader.readAsDataURL(file);
  });

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Imagem inválida."));
    image.src = dataUrl;
  });

  const canvas = document.createElement("canvas");
  canvas.width = OUTPUT_SIZE;
  canvas.height = OUTPUT_SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) return dataUrl;
  ctx.drawImage(img, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
  return canvas.toDataURL("image/jpeg", OUTPUT_QUALITY);
}

type Props = {
  value: string | null;
  fallbackInitial: string;
  onChange: (next: string | null) => void;
};

export function AvatarPicker({ value, onChange }: Props) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File | undefined) => {
    setError(null);
    if (!file) return;
    if (!/^image\/(png|jpe?g|webp)$/.test(file.type)) {
      setError("Use PNG, JPG ou WebP.");
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setError("Máximo 2 MB.");
      return;
    }
    try {
      const next = await fileToResizedDataUrl(file);
      onChange(next);
    } catch {
      setError("Não foi possível processar a imagem.");
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <p className="text-[15px] font-normal">Avatar</p>

      <div className="flex items-center gap-4">
        {value ? (
          <img
            src={value}
            alt="Pré-visualização do avatar"
            className="size-12.5 rounded-full object-cover"
          />
        ) : (
          <div
            aria-hidden
            className="flex size-12.5 items-center justify-center rounded-full bg-surface-raised border border-border text-lg font-bold text-primary"
          >
            <img
              src="/icons/svg/image-icon.svg"
              alt="Pré-visualização do avatar"
              className="size-6 rounded-full object-cover"
            />
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <input
            ref={inputRef}
            id={inputId}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="sr-only"
            onChange={(e) => {
              void handleFile(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => inputRef.current?.click()}
            className="h-10 rounded-xs border-none bg-primary! px-5 text-ink text-sm font-bold cursor-pointer hover:bg-primary/80!"
          >
            Alterar
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setError(null);
              onChange(null);
            }}
            disabled={!value}
            className="h-10 px-5 rounded-xs cursor-pointer text-sm font-bold"
          >
            {/* <Trash2 className="mr-2 size-4" aria-hidden /> */}
            Remover
          </Button>
        </div>
      </div>

      {error && (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
