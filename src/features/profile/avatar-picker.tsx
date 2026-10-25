import { useId, useRef, useState } from "react";
import { ImagePlus, Trash2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

const MAX_FILE_BYTES = 2 * 1024 * 1024; // 2 MB de entrada
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

export function AvatarPicker({ value, fallbackInitial, onChange }: Props) {
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
      <p className="text-sm font-bold text-foreground">Foto de perfil</p>

      <div className="flex items-center gap-4">
        {value ? (
          <img
            src={value}
            alt="Pré-visualização do avatar"
            className="size-16 rounded-full object-cover"
          />
        ) : (
          <div
            aria-hidden
            className="flex size-16 items-center justify-center rounded-full bg-surface-card text-lg font-bold text-primary"
          >
            {fallbackInitial}
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
          >
            <ImagePlus className="mr-2 size-4" aria-hidden />
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
          >
            <Trash2 className="mr-2 size-4" aria-hidden />
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
