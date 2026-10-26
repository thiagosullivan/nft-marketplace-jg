import { HttpNetworkFrame } from "msw/experimental";
import { env } from "@/shared/lib/env";

export async function enableMocking(): Promise<void> {
  if (!env.VITE_ENABLE_MOCKS) return;

  const { worker } = await import("./browser");

  await worker.start({
    onUnhandledFrame({ frame, defaults }) {
      if (frame instanceof HttpNetworkFrame) {
        const url = new URL(frame.data.request.url);
        if (!url.pathname.startsWith("/api/")) return;
        defaults.warn();
      }
    },
  });

  // Avisa o SocketProvider que o worker está pronto. O socket.io-client
  // precisa ser importado DEPOIS do worker.start() [citation:6].
  window.dispatchEvent(new Event("msw:ready"));

  console.info("[MSW] Mocking enabled");
}
