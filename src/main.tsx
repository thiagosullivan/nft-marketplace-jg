import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <div className="p-8 text-foreground bg-background min-h-dvh">
      <h1 className="text-3xl font-bold text-primary">NFT Marketplace</h1>
      <p className="mt-2 text-muted-foreground">
        Setup concluído. Tokens aplicados.
      </p>
    </div>
  </StrictMode>,
);
