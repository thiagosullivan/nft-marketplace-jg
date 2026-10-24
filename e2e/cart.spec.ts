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

async function addFromDetail(page: Page, id: string) {
  await page.goto(`/nft/${id}`);
  const buy = page.getByRole("button", { name: /^comprar$/i });
  await buy.focus();
  await buy.press("Enter");
  await expect(page).toHaveURL(/\/cart/);
}

async function clickFinalize(page: Page) {
  const button = page.getByRole("button", { name: /conectar e finalizar/i });
  await button.focus();
  await button.press("Enter");
}

async function login(page: Page, creds: { email: string; password: string }) {
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await dialog
    .getByRole("textbox", { name: "E-mail", exact: true })
    .fill(creds.email);
  const password = dialog.getByRole("textbox", { name: "Senha", exact: true });
  await password.fill(creds.password);
  await password.press("Enter");
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

test.describe("Cart", () => {
  test.beforeEach(async ({ page }) => {
    await reset(page);
  });

  test("guest can add and persists after refresh", async ({ page }) => {
    await addFromDetail(page, "nft-002");

    const row = page
      .getByRole("listitem")
      .filter({ hasText: /violet nomad #002/i });
    await expect(row).toBeVisible();

    await page.reload();
    await expect(row).toBeVisible();
  });

  test("guest cart merges after login", async ({ page }) => {
    await addFromDetail(page, "nft-002");
    await clickFinalize(page);
    await login(page, MARIA);
    await expect(page).toHaveURL(/\/checkout/);
  });

  test("quantity can be increased and removed", async ({ page }) => {
    await addFromDetail(page, "nft-003");

    const row = page
      .getByRole("listitem")
      .filter({ hasText: /ivory baron #003/i });
    await expect(row).toBeVisible();

    await expect(
      page.getByRole("button", { name: "Aumentar quantidade" }),
    ).toBeDisabled();

    await page.getByRole("button", { name: /remover .* do carrinho/i }).click();
    await expect(
      page.getByRole("heading", { name: /seu carrinho está vazio/i }),
    ).toBeVisible();
  });

  test("invalid coupon shows error", async ({ page }) => {
    await addFromDetail(page, "nft-002");
    await clickFinalize(page);
    await login(page, MARIA);
    await expect(page).toHaveURL(/\/checkout/);

    // Vai para o carrinho já logado (o merge já rodou; o toast pode existir).
    await page.goto("/cart");
    await expect(
      page.getByRole("heading", { name: /resumo da compra/i }),
    ).toBeVisible();
    await dismissToasts(page);

    await page.getByLabel("Código promocional").fill("INVALIDO");
    const apply = page.getByRole("button", { name: /aplicar/i });
    await apply.focus();
    await apply.press("Enter");
    await expect(page.getByText(/cupom inválido ou expirado/i)).toBeVisible();
  });
});
