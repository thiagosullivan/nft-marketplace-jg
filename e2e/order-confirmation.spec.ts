import { test, expect } from "@playwright/test";
import { login, resetAppState, MARIA } from "./helpers/login";

test.describe("Confirmação de pedido", () => {
  test.beforeEach(async ({ page }) => {
    await resetAppState(page);
    await login(page, MARIA.email);
  });

  test("pedido confirmado abre o modal com o recibo", async ({ page }) => {
    await page.goto("/order/order-seed-confirmed");

    await expect(
      page.getByRole("heading", {
        name: "Seus NFTs agora estão na sua carteira",
      }),
    ).toBeVisible();

    await expect(page.getByText("ID da transação")).toBeVisible();
    await expect(page.getByText("Data")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Detalhes da transação" }),
    ).toBeVisible();
    await expect(page.getByText("Taxa de rede")).toBeVisible();
    await expect(page.getByText("26.85 ETH").first()).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Ver no Etherscan/i }),
    ).toBeVisible();
  });

  test("pedido pendente vira confirmado em ~10s via polling", async ({
    page,
  }) => {
    await page.goto("/order/order-seed-pending");

    await expect(
      page.getByRole("heading", { name: "Pedido pendente" }),
    ).toBeVisible();
    await expect(page.getByText(/Aguardando confirmação/)).toBeVisible();

    // O mock settle em 10s; o polling busca a cada 1s.
    await expect(
      page.getByRole("heading", {
        name: "Seus NFTs agora estão na sua carteira",
      }),
    ).toBeVisible({ timeout: 25_000 });
  });

  test("pedido recusado mostra motivo e CTAs", async ({ page }) => {
    await page.goto("/order/order-seed-declined");

    await expect(
      page.getByRole("heading", { name: "Pagamento recusado" }),
    ).toBeVisible();
    await expect(page.getByText(/Nenhum valor foi cobrado/)).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Tentar novamente/i }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: /^Fechar$/i })).toBeVisible();
  });

  test("pedido inexistente mostra 404 amigável", async ({ page }) => {
    await page.goto("/order/inexistente");

    await expect(
      page.getByRole("heading", { name: "Pedido não encontrado" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Ir para o início/i }),
    ).toBeVisible();
  });
});
