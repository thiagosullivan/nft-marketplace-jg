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

// Promise resolvida quando o MSW estiver pronto. Fora do modo mock,
// resolve na hora. O `startMocks` é chamado no `useEffect` do App,
// depois do primeiro render, para o `msw-vendor` não competir com o
// first paint.
let resolveMocks: () => void = () => {};
const mocksReady: Promise<void> = new Promise((resolve) => {
  resolveMocks = resolve;
});

// Promise resolvida quando o socket interceptor estiver aplicado.
// Exposta no window para o SocketProvider aguardar sem importar main.tsx.
let resolveSocket: () => void = () => {};
const socketReady: Promise<void> = new Promise((resolve) => {
  resolveSocket = resolve;
});

(window as unknown as { __socketReady?: Promise<void> }).__socketReady =
  socketReady;

function startMocks(): void {
  if (!env.VITE_ENABLE_MOCKS) {
    resolveMocks();
    resolveSocket();
    return;
  }

  void (async () => {
    const { handleResetFromUrl, exposeMswHelpers } =
      await import("@/mocks/reset");
    handleResetFromUrl();

    const { enableMocking } = await import("@/mocks");
    await enableMocking();

    exposeMswHelpers();
    resolveMocks();

    // Socket binding só depois do worker pronto. Isso permite que o
    // bundler coloque o binding em OUTRO chunk, separado do `browser`
    // do MSW.
    const { applySocketInterceptor } = await import("@/mocks/socket");
    applySocketInterceptor();
    resolveSocket();
  })().catch(() => {
    // Em caso de falha, libera as promises para não travar a app.
    resolveMocks();
    resolveSocket();
  });
}

// fetch wrapper: só requests de API e socket esperam os mocks.
// Imagens, fontes e assets fluem imediatamente.
const originalFetch = globalThis.fetch.bind(globalThis);
globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
  const url =
    typeof input === "string"
      ? input
      : input instanceof URL
        ? input.href
        : input.url;

  const isApi = url.includes("/api/");
  const isSocket = url.startsWith("ws") || url.includes("/socket.io/");

  if (isApi || isSocket) {
    await mocksReady;
  }
  return originalFetch(input, init);
}) as typeof fetch;

type LazyProvider = ComponentType<{ children: ReactNode }>;

function App() {
  const [SocketProvider, setSocketProvider] = useState<LazyProvider | null>(
    null,
  );

  useEffect(() => {
    startMocks();
  }, []);

  useEffect(() => {
    const load = () => {
      void import("./shared/socket/socket-provider").then((m) => {
        setSocketProvider(() => m.SocketProvider);
      });
    };
    if ("requestIdleCallback" in window) {
      const id = requestIdleCallback(load, { timeout: 3000 });
      return () => cancelIdleCallback(id);
    }
    const t = setTimeout(load, 2000);
    return () => clearTimeout(t);
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
