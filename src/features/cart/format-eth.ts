/**
 * Formata um valor ETH (string decimal) para exibição com no máximo 2 casas.
 * Usa arredondamento "meio para cima" via inteiro de centavos, para evitar
 * surpresas de ponto flutuante (0.1 + 0.2).
 */
export function formatEth(value: string | number | undefined | null): string {
  if (value === undefined || value === null || value === "") return "—";
  const cents = ethToCents(String(value));
  return centsToEth(cents);
}

/** Converte "3.69" ou "0.016" em centavos inteiros (arredondando). */
export function ethToCents(value: string): number {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * 100);
}

/** Converte centavos inteiros em string com 2 casas ("369" -> "3.69"). */
export function centsToEth(cents: number): string {
  return (cents / 100).toFixed(2);
}

/** Multiplica um preço ETH por uma quantidade inteira e devolve string com 2 casas. */
export function multiplyEth(priceEth: string, quantity: number): string {
  return centsToEth(ethToCents(priceEth) * quantity);
}

/** Soma valores ETH em string e devolve string com 2 casas. */
export function sumEth(values: string[]): string {
  const total = values.reduce((acc, v) => acc + ethToCents(v), 0);
  return centsToEth(total);
}

/** true se o valor ETH é maior que zero (usado para decidir se mostra a linha de desconto). */
export function isPositiveEth(value: string | undefined | null): boolean {
  if (!value) return false;
  return ethToCents(value) > 0;
}
