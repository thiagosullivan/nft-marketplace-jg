import type { Page } from "@playwright/test";

/**
 * Habilita os endpoints `/api/dev/*` no browser.
 *
 * No Bloco C (Fase 6.1), `devHandlers` saiu do boot do MSW para reduzir
 * o parse/registro de handlers (~5 KB, ~10 ms de TBT). Eles são
 * registrados sob demanda via `window.__msw.enableDevHandlers()`, que
 * chama `worker.use(...devHandlers)`.
 *
 * Todos os specs de realtime precisam chamar isto ANTES do primeiro
 * `fetch("/api/dev/emit")` ou `/api/dev/disconnect-socket`.
 *
 * `resetAppState` já chama — não precisa repetir nos specs.
 */
export async function enableDevHandlers(page: Page): Promise<void> {
  await page.waitForFunction(
    () =>
      typeof (
        window as unknown as {
          __msw?: { enableDevHandlers?: () => Promise<void> };
        }
      ).__msw?.enableDevHandlers === "function",
    { timeout: 10_000 },
  );
  await page.evaluate(async () => {
    const w = window as unknown as {
      __msw?: { enableDevHandlers?: () => Promise<void> };
    };
    await w.__msw?.enableDevHandlers?.();
  });
}
