import { test, expect } from "@playwright/test";
import { login, resetAppState, MARIA, THAIS } from "./helpers/login";

test.describe("Meus pedidos", () => {
  test.beforeEach(async ({ page }) => {
    await resetAppState(page);
  });

  test("lista os pedidos da Maria com status e total", async ({ page }) => {
    await login(page, MARIA.email);
    await page.goto("/orders");

    await expect(
      page.getByRole("heading", { name: "Meus pedidos" }),
    ).toBeVisible();

    // 6 pedidos da Maria no seed.
    const rows = page.locator('a[href^="/order/"]');
    await expect(rows).toHaveCount(6);

    await expect(page.getByText(/Crimson Drifter #010/)).toBeVisible();
    await expect(page.getByText(/26\.85 ETH/).first()).toBeVisible();
  });

  test("filtra por status", async ({ page }) => {
    await login(page, MARIA.email);
    await page.goto("/orders");

    await page.getByRole("tab", { name: "Recusado" }).click();
    await expect(page.locator('a[href^="/order/"]')).toHaveCount(2);
    await expect(page.getByText(/Golden Wanderer/)).toBeVisible();
    await expect(page.getByText(/Coral Sentinel/)).toBeVisible();

    await page.getByRole("tab", { name: "Pendente" }).click();
    await expect(page.locator('a[href^="/order/"]')).toHaveCount(1);
    await expect(page.getByText(/Ivory Baron/)).toBeVisible();

    await page.getByRole("tab", { name: "Confirmado" }).click();
    await expect(page.locator('a[href^="/order/"]')).toHaveCount(3);
  });

  test("clicar em uma linha abre o modal de confirmação", async ({ page }) => {
    await login(page, MARIA.email);
    await page.goto("/orders");

    await page.getByText(/Crimson Drifter #010/).click();

    await expect(page).toHaveURL(/\/order\/order-seed-confirmed/);
    await expect(
      page.getByRole("heading", {
        name: "Seus NFTs agora estão na sua carteira",
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Ver no Etherscan/i }),
    ).toBeVisible();
  });

  test("usuário sem pedidos vê empty state", async ({ page }) => {
    await login(page, THAIS.email);
    await page.goto("/orders");

    await expect(
      page.getByText(/Você ainda não fez nenhum pedido/i),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Explorar marketplace/i }),
    ).toBeVisible();
  });
});
