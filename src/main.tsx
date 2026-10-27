import {
  StrictMode,
  useEffect,
  useState,
  type ComponentType,
  type ReactNode,
} from "react";
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
    queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: false },
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

// mocks só resolvem depois de prontos; fora do modo mock, resolve na hora
const mocksReady: Promise<void> = (async () => {
  if (!env.VITE_ENABLE_MOCKS) return;
  const { handleResetFromUrl, exposeMswHelpers } =
    await import("@/mocks/reset");
  handleResetFromUrl();
  const { applySocketInterceptor } = await import("@/mocks/socket");
  applySocketInterceptor();
  const { enableMocking } = await import("@/mocks");
  await enableMocking();
  exposeMswHelpers();
})();

// fetch wrapper: nenhuma query sai antes dos mocks estarem prontos
const originalFetch = globalThis.fetch.bind(globalThis);
globalThis.fetch = (async (...args: Parameters<typeof fetch>) => {
  await mocksReady;
  return originalFetch(...args);
}) as typeof fetch;

type LazyProvider = ComponentType<{ children: ReactNode }>;

function App() {
  const [SocketProvider, setSocketProvider] = useState<LazyProvider | null>(
    null,
  );

  useEffect(() => {
    void import("./shared/socket/socket-provider").then((m) => {
      setSocketProvider(() => m.SocketProvider);
    });
  }, []);

  const inner = (
    <TooltipProvider>
      <RouterProvider router={router} />
      <Toaster position="top-right" richColors closeButton />
    </TooltipProvider>
  );

  return (
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        {SocketProvider ? <SocketProvider>{inner}</SocketProvider> : inner}
      </QueryClientProvider>
    </StrictMode>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
