import { resetDb } from "./db";
import { resetScenario, setScenario, getScenario } from "./scenario";

const RESET_PARAMS = ["reset", "resetDb", "resetScenario"];

export function handleResetFromUrl(): boolean {
  if (typeof window === "undefined") return false;

  const url = new URL(window.location.href);
  const shouldReset = RESET_PARAMS.some((p) => url.searchParams.get(p) === "1");
  if (!shouldReset) return false;

  resetDb();
  resetScenario();

  for (const p of RESET_PARAMS) {
    url.searchParams.delete(p);
  }
  window.history.replaceState({}, "", url.toString());
  return true;
}

export function exposeMswHelpers(): void {
  if (typeof window === "undefined") return;
  (window as unknown as { __msw: unknown }).__msw = {
    reset: () => {
      resetDb();
      resetScenario();
      window.location.reload();
    },
    resetDb,
    setScenario,
    getScenario,
  };
}
