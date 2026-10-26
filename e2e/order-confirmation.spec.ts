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
    ).toBeVisible({ timeout: 10_000 });

    await expect(
      page.getByText("ID da transação").filter({ visible: true }),
    ).toBeVisible();
    await expect(
      page.getByText("Data").filter({ visible: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Detalhes da transação" }),
    ).toBeVisible();
    await expect(
      page.getByText("Taxa de rede").filter({ visible: true }),
    ).toBeVisible();
    await expect(
      page.getByText("26.85 ETH").filter({ visible: true }).first(),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Ver no Etherscan/i }).filter({
        visible: true,
      }),
    ).toBeVisible();
  });

  test("pedido pendente vira confirmado após settle do mock", async ({
    page,
  }) => {
    test.setTimeout(45_000);

    // `order-seed-settling` tem settleStatus="confirmed" e settleAt=null.
    // O handler em GET /orders/:id agenda settleAt=now+3s na 1ª leitura
    // e aplica o settle na 2ª (após reload).
    await page.goto("/order/order-seed-settling");

    await expect(
      page.getByRole("heading", { name: "Pedido pendente" }),
    ).toBeVisible({ timeout: 10_000 });
    await expect(
      page.getByText(/Aguardando confirmação/).filter({ visible: true }),
    ).toBeVisible();

    // Espera o settleAt (3s) + folga, e recarrega: o GET aplica
    // settleIfDue e o modal muda para confirmed.
    await page.waitForTimeout(4_000);
    await page.reload();

    await expect(
      page.getByRole("heading", {
        name: "Seus NFTs agora estão na sua carteira",
      }),
    ).toBeVisible({ timeout: 10_000 });
  });

  test("pedido recusado mostra motivo e CTAs", async ({ page }) => {
    await page.goto("/order/order-seed-declined");

    await expect(
      page.getByRole("heading", { name: "Pagamento recusado" }),
    ).toBeVisible({ timeout: 10_000 });
    await expect(
      page.getByText(/Nenhum valor foi cobrado/).filter({ visible: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Tentar novamente/i }).filter({
        visible: true,
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /^Fechar$/i }).filter({ visible: true }),
    ).toBeVisible();
  });

  test("pedido inexistente mostra 404 amigável", async ({ page }) => {
    await page.goto("/order/inexistente");

    await expect(
      page.getByRole("heading", { name: "Pedido não encontrado" }),
    ).toBeVisible({ timeout: 10_000 });
    await expect(
      page.getByRole("button", { name: /Ir para o início/i }).filter({
        visible: true,
      }),
    ).toBeVisible();
  });
});
