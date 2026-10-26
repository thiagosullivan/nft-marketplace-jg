import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/shared/components/ui/sonner";
import { TooltipProvider } from "@/shared/components/ui/tooltip";
import { routeTree } from "./routeTree.gen";
import "./index.css";
import { env } from "./shared/lib/env";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: { retry: 0 },
  },
});

const router = createRouter({
  routeTree,
  context: { queryClient },
  defaultPreload: "intent",
  scrollRestoration: true,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

async function bootstrap() {
  if (env.VITE_ENABLE_MOCKS) {
    const { handleResetFromUrl, exposeMswHelpers } =
      await import("@/mocks/reset");
    handleResetFromUrl();

    // Aplica o WebSocketInterceptor ANTES do worker.start() e do
    // import do socket.io-client.
    const { applySocketInterceptor } = await import("@/mocks/socket");
    applySocketInterceptor();

    const { enableMocking } = await import("@/mocks");
    await enableMocking();
    exposeMswHelpers();
  }

  // Carrega o SocketProvider DEPOIS do enableMocking.
  // O socket.io-client precisa ser importado depois do worker.start()
  // para o MSW substituir o globalThis.WebSocket antes [citation:9][citation:25].
  const { SocketProvider } = await import("./shared/socket/socket-provider");

  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <SocketProvider>
          <TooltipProvider>
            <RouterProvider router={router} />
            <Toaster position="top-right" richColors closeButton />
          </TooltipProvider>
        </SocketProvider>
      </QueryClientProvider>
    </StrictMode>,
  );
}

void bootstrap();
