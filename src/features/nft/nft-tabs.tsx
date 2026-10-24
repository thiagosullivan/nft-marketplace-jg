import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/shared/lib/utils";

type Props = {
  details: React.ReactNode;
};

export function NftTabs({ details }: Props) {
  const [active, setActive] = useState<"details">("details");

  return (
    <section className="w-full">
      <div
        role="tablist"
        aria-label="Informações do NFT"
        className="flex gap-6 border-b border-border"
      >
        <button
          type="button"
          role="tab"
          id="nft-tab-details"
          aria-selected={active === "details"}
          aria-controls="nft-tabpanel-details"
          onClick={() => setActive("details")}
          className={cn(
            "pb-2 text-sm font-medium transition-colors",
            active === "details"
              ? "text-accent border-b-2 border-accent"
              : "text-foreground hover:text-foreground",
          )}
        >
          Detalhes do NFT
        </button>
        <button
          type="button"
          role="tab"
          id="nft-tab-reviews"
          aria-selected={false}
          aria-controls="nft-tabpanel-details"
          aria-disabled="true"
          onClick={() =>
            toast.info("Avaliações ainda não foram implementadas.")
          }
          className="pb-2 text-sm font-medium text-foreground hover:text-muted-foreground"
        >
          Avaliações
        </button>
      </div>

      <div
        role="tabpanel"
        id="nft-tabpanel-details"
        aria-labelledby="nft-tab-details"
        className="pt-3"
      >
        {details}
      </div>
    </section>
  );
}
