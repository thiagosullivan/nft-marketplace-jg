import { env } from "@/shared/lib/env";

export async function enableMocking(): Promise<void> {
  if (!env.VITE_ENABLE_MOCKS) return;

  const { worker } = await import("./browser");

  await worker.start({
    onUnhandledRequest: "bypass",
  });

  (window as unknown as { __mswReady?: boolean }).__mswReady = true;
  window.dispatchEvent(new Event("msw:ready"));

  console.info("[MSW] Mocking enabled");
}
