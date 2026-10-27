import { env } from "@/shared/lib/env";

/**
 * Aguarda o Service Worker do MSW assumir o controle da página atual.
 * Sem isso, a primeira requisição pode sair antes do claim e "vazar"
 * para o servidor do Vite (304/vazio), fazendo a query retornar [].
 */
async function waitForController(): Promise<void> {
  if (!("serviceWorker" in navigator)) return;
  if (navigator.serviceWorker.controller) return;

  await new Promise<void>((resolve) => {
    const onChange = () => {
      navigator.serviceWorker.removeEventListener("controllerchange", onChange);
      resolve();
    };
    navigator.serviceWorker.addEventListener("controllerchange", onChange);

    // fallback: se por algum motivo o controller já estiver ativo
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.removeEventListener("controllerchange", onChange);
      resolve();
    }
  });
}

export async function enableMocking(): Promise<void> {
  if (!env.VITE_ENABLE_MOCKS) return;

  const { worker } = await import("./browser");

  await worker.start({
    onUnhandledRequest: "bypass",
    serviceWorker: {
      url: "/mockServiceWorker.js",
    },
  });

  await waitForController();

  (window as unknown as { __mswReady?: boolean }).__mswReady = true;
  window.dispatchEvent(new Event("msw:ready"));

  console.info("[MSW] Mocking enabled");
}
