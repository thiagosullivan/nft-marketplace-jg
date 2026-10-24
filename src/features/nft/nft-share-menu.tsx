import { Share2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";

type Props = {
  title: string;
};

function currentUrl(): string {
  if (typeof window === "undefined") return "";
  return window.location.href;
}

export function NftShareMenu({ title }: Props) {
  const notImplemented = () =>
    toast.info("Compartilhamento indisponível na demonstração.");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          aria-label="Compartilhar NFT"
          className="gap-2"
        >
          <Share2 className="size-4" aria-hidden="true" />
          Compartilhar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem
          onSelect={() => {
            const url = currentUrl();
            if (navigator.clipboard?.writeText) {
              void navigator.clipboard.writeText(url).then(
                () => toast.success("Link copiado."),
                () => toast.error("Não foi possível copiar o link."),
              );
              return;
            }
            toast.info("Copiar link indisponível neste navegador.");
          }}
        >
          Copiar link
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={notImplemented}>
          Compartilhar por e-mail
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={notImplemented}>
          Compartilhar no X
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={notImplemented}>
          Compartilhar no LinkedIn
        </DropdownMenuItem>
      </DropdownMenuContent>
      <span className="sr-only">{title}</span>
    </DropdownMenu>
  );
}
