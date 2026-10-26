import { test, expect } from "@playwright/test";
import { login, resetAppState, MARIA, THAIS } from "./helpers/login";

test.describe("Meus pedidos", () => {
  test.beforeEach(async ({ page }) => {
    await resetAppState(page);
  });

  test("lista os pedidos da Maria com status e total", async ({ page }) => {
    await login(page, MARIA.email);
    await page.goto("/orders");
    await expect(page).toHaveURL(/\/profile\/orders/, { timeout: 10_000 });

    await expect(
      page.getByRole("heading", { name: /^Atividade$/i }),
    ).toBeVisible({ timeout: 10_000 });

    // 6 pedidos da Maria no seed (sem o `order-seed-settling`, que é
    // fixture do teste de transição e não aparece na lista).
    const rows = page.locator('a[href^="/order/"]').filter({ visible: true });
    await expect(rows).toHaveCount(6);

    await expect(
      page.getByText(/Crimson Drifter #010/).filter({ visible: true }),
    ).toBeVisible();
    await expect(
      page
        .getByText(/26\.85 ETH/)
        .filter({ visible: true })
        .first(),
    ).toBeVisible();
  });

  test("filtra por status", async ({ page }) => {
    await login(page, MARIA.email);
    await page.goto("/orders");
    await expect(page).toHaveURL(/\/profile\/orders/, { timeout: 10_000 });

    await page.getByRole("tab", { name: "Recusado" }).click();
    await expect(
      page.locator('a[href^="/order/"]').filter({ visible: true }),
    ).toHaveCount(2);
    await expect(
      page.getByText(/Golden Wanderer/).filter({ visible: true }),
    ).toBeVisible();
    await expect(
      page.getByText(/Coral Sentinel/).filter({ visible: true }),
    ).toBeVisible();

    await page.getByRole("tab", { name: "Pendente" }).click();
    await expect(
      page.locator('a[href^="/order/"]').filter({ visible: true }),
    ).toHaveCount(1);
    await expect(
      page.getByText(/Ivory Baron/).filter({ visible: true }),
    ).toBeVisible();

    await page.getByRole("tab", { name: "Confirmado" }).click();
    await expect(
      page.locator('a[href^="/order/"]').filter({ visible: true }),
    ).toHaveCount(3);
  });

  test("clicar em uma linha abre o modal de confirmação", async ({ page }) => {
    await login(page, MARIA.email);
    await page.goto("/orders");
    await expect(page).toHaveURL(/\/profile\/orders/, { timeout: 10_000 });

    await page
      .getByText(/Crimson Drifter #010/)
      .filter({ visible: true })
      .click();

    await expect(page).toHaveURL(/\/order\/order-seed-confirmed/);
    await expect(
      page.getByRole("heading", {
        name: "Seus NFTs agora estão na sua carteira",
      }),
    ).toBeVisible({ timeout: 10_000 });
    await expect(
      page.getByRole("link", { name: /Ver no Etherscan/i }).filter({
        visible: true,
      }),
    ).toBeVisible();
  });

  test("usuário sem pedidos vê empty state", async ({ page }) => {
    await login(page, THAIS.email);
    await page.goto("/orders");
    await expect(page).toHaveURL(/\/profile\/orders/, { timeout: 10_000 });

    await expect(
      page.getByText(/Você ainda não fez nenhum pedido/i).filter({
        visible: true,
      }),
    ).toBeVisible({ timeout: 10_000 });
    await expect(
      page.getByRole("link", { name: /Explorar marketplace/i }).filter({
        visible: true,
      }),
    ).toBeVisible();
  });
});
