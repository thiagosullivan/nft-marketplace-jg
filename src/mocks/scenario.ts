export type ScenarioName =
  | "default"
  | "slow"
  | "timeout"
  | "offline"
  | "error-500"
  | "error-400"
  | "empty";

const STORAGE_KEY = "nftmarketplace:scenario";

function canUseLocalStorage(): boolean {
  try {
    return typeof window !== "undefined" && !!window.localStorage;
  } catch {
    return false;
  }
}

export function getScenario(): ScenarioName {
  if (!canUseLocalStorage()) return "default";
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (
    raw === "slow" ||
    raw === "timeout" ||
    raw === "offline" ||
    raw === "error-500" ||
    raw === "error-400" ||
    raw === "empty"
  ) {
    return raw;
  }
  return "default";
}

export function setScenario(name: ScenarioName): void {
  if (!canUseLocalStorage()) return;
  if (name === "default") {
    window.localStorage.removeItem(STORAGE_KEY);
  } else {
    window.localStorage.setItem(STORAGE_KEY, name);
  }
}

export function resetScenario(): void {
  setScenario("default");
}

export function scenarioDelay(): number {
  switch (getScenario()) {
    case "slow":
      return 2000 + Math.floor(Math.random() * 2000);
    case "timeout":
      return 20_000;
    default:
      return Math.floor(Math.random() * 150);
  }
}

export function globalErrorResponse(): Response | null {
  const scenario = getScenario();
  if (scenario === "offline") {
    return Response.error();
  }
  if (scenario === "error-500") {
    return new Response(
      JSON.stringify({
        code: "UNKNOWN",
        message: "Erro interno simulado (cenário error-500).",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
  if (scenario === "error-400") {
    return new Response(
      JSON.stringify({
        code: "VALIDATION_ERROR",
        message: "Erro de validação simulado (cenário error-400).",
        fields: { _global: "Erro simulado" },
      }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }
  return null;
}
