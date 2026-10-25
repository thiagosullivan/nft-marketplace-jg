import { expect, test, type Page } from "@playwright/test";

const MARIA = { email: "maria@nftmail.com", password: "password123" };

async function reset(page: Page) {
  await page.goto("/?reset=1");
  await page.waitForFunction(() =>
    Boolean((window as unknown as { __msw?: unknown }).__msw),
  );
  await page.evaluate(() => {
    localStorage.removeItem("nftmarketplace:token");
    localStorage.removeItem("nftmarketplace:session");
    localStorage.removeItem("nftmarketplace:db");
    localStorage.removeItem("nftmarketplace:guest-cart");
  });
  await page.reload();
}

async function dismissToasts(page: Page) {
  const toasts = page.locator("[data-sonner-toast]");
  const count = await toasts.count();
  if (count === 0) return;
  for (let i = 0; i < count; i++) {
    const closeBtn = toasts
      .nth(0)
      .getByRole("button", { name: /close toast/i });
    if (await closeBtn.isVisible().catch(() => false)) {
      await closeBtn.click().catch(() => undefined);
    }
  }
  await expect(toasts).toHaveCount(0, { timeout: 10_000 });
}

async function login(page: Page) {
  await page.goto("/");
  await page.getByTestId("header-login-button").click();
  const dialog = page.getByRole("dialog");
  await dialog
    .getByRole("textbox", { name: "E-mail", exact: true })
    .fill(MARIA.email);
  const password = dialog.getByRole("textbox", { name: "Senha", exact: true });
  await password.fill(MARIA.password);
  await password.press("Enter");
  await expect(page.getByRole("button", { name: "Sair" })).toBeVisible();
  await dismissToasts(page);
}

async function addItemAndGoToCheckout(page: Page) {
  await page.goto("/nft/nft-002");
  const buy = page.getByRole("button", { name: /^comprar$/i });
  await buy.focus();
  await buy.press("Enter");
  await expect(page).toHaveURL(/\/cart/);

  const finalize = page.getByRole("button", { name: /^finalizar$/i });
  await expect(finalize).toBeVisible({ timeout: 10_000 });
  await finalize.focus();
  await finalize.press("Enter");
  await expect(page).toHaveURL(/\/checkout/);
}

async function clickConfirmPurchase(page: Page) {
  const button = page.getByRole("button", { name: /confirmar compra/i });
  // Hit-test instável no mobile (header sticky cobre a área no scroll do
  // Playwright). Teclado é o caminho real de um usuário e não depende disso.
  await button.focus();
  await button.press("Enter");
}

test.describe("Checkout", () => {
  test.beforeEach(async ({ page }) => {
    await reset(page);
  });

  test("checkout requires login", async ({ page }) => {
    await page.goto("/checkout");
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page).toHaveURL(/\/\?/);
  });

  test("creates order after wallet connection", async ({ page }) => {
    await login(page);
    await addItemAndGoToCheckout(page);

    await expect(
      page.getByRole("heading", { name: /finalizar compra/i }),
    ).toBeVisible();

    await clickConfirmPurchase(page);
    await expect(page.getByRole("dialog")).toBeVisible();

    const connect = page.getByRole("button", { name: /^conectar$/i });
    await connect.focus();
    await connect.press("Enter");

    await expect(page.getByText(/estado: connected/i)).toBeVisible();

    const confirm = page.getByRole("button", { name: /confirmar pedido/i });
    await confirm.focus();
    await confirm.press("Enter");

    await expect(page).toHaveURL(/\/order\//);
  });
});
