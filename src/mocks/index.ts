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

  console.info("[MSW] Mocking enabled");
}
