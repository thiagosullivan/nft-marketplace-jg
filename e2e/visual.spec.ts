import { test, expect, type Page } from "@playwright/test";
import { resetAppState, login, MARIA, dismissToasts } from "./helpers/login";

const FIXED_VIEWPORT = { width: 1440, height: 900 };

async function settle(page: Page) {
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(
    () =>
      new Promise<void>((r) =>
        requestAnimationFrame(() => requestAnimationFrame(() => r())),
      ),
  );
}

test.describe("Regressão visual (desktop)", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(FIXED_VIEWPORT);
    await resetAppState(page);
  });

  test("home", async ({ page }) => {
    await page.goto("/");

    // Espera seletores específicos em vez de networkidle (socket mantém a
    // rede ocupada, então networkidle pode nunca resolver).
    await expect(
      page.getByRole("tablist", { name: /filtrar nfts/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /ver emerald ape #001/i }),
    ).toBeVisible({ timeout: 15_000 });

    await dismissToasts(page);
    await settle(page);
    await expect(page).toHaveScreenshot("home.png", { fullPage: false });
  });

  test("nft-detail", async ({ page }) => {
    await page.goto("/nft/nft-002");
    await expect(
      page.getByRole("heading", { name: /violet nomad #002/i }),
    ).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/^0\.05 ETH$/).first()).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /mais desta coleção/i }),
    ).toBeVisible();

    await dismissToasts(page);
    await settle(page);
    await expect(page).toHaveScreenshot("nft-detail.png", { fullPage: false });
  });

  test("cart", async ({ page }) => {
    await login(page, MARIA.email);
    await page.goto("/nft/nft-002");
    // Espera o botão Comprar em vez de networkidle.
    await expect(
      page.getByRole("button", { name: /^comprar$/i }).first(),
    ).toBeVisible({ timeout: 15_000 });

    await page
      .getByRole("button", { name: /^comprar$/i })
      .first()
      .click();
    await page.waitForURL(/\/cart/);

    const cartSummary = page
      .locator("#cart-summary-title", { hasText: /resumo da compra/i })
      .filter({ visible: true })
      .first();
    await expect(cartSummary).toBeVisible({ timeout: 10_000 });

    await dismissToasts(page);
    await settle(page);
    await expect(page).toHaveScreenshot("cart.png", { fullPage: false });
  });

  test("checkout", async ({ page }) => {
    await login(page, MARIA.email);
    await page.goto("/nft/nft-002");
    await expect(
      page.getByRole("button", { name: /^comprar$/i }).first(),
    ).toBeVisible({ timeout: 15_000 });

    await page
      .getByRole("button", { name: /^comprar$/i })
      .first()
      .click();
    await page.waitForURL(/\/cart/);

    await page.goto("/checkout");
    await expect(
      page.getByRole("heading", { name: /perfil do colecionador/i }),
    ).toBeVisible({ timeout: 15_000 });
    await expect(
      page.getByRole("button", { name: /confirmar compra/i }),
    ).toBeVisible();

    await dismissToasts(page);
    await settle(page);
    await expect(page).toHaveScreenshot("checkout.png", { fullPage: false });
  });
});
