import { expect, test, type Page } from "@playwright/test";

const MARIA = { email: "maria@nftmail.com", password: "password123" };
const THAIS = { email: "thais@nftmail.com", password: "password123" };

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

async function loginAs(page: Page, creds: { email: string; password: string }) {
  await page.goto("/");
  await page.getByTestId("header-login-button").click();
  const dialog = page.getByRole("dialog");
  await dialog
    .getByRole("textbox", { name: "E-mail", exact: true })
    .fill(creds.email);
  const password = dialog.getByRole("textbox", { name: "Senha", exact: true });
  await password.fill(creds.password);
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
  await button.focus();
  await button.press("Enter");
}

async function toggleUseNewWallet(page: Page, on: boolean) {
  const checkbox = page.getByRole("checkbox", { name: /usar outra carteira/i });
  if ((await checkbox.isChecked()) === on) return;
  await checkbox.focus();
  await checkbox.press("Space");
  await expect(checkbox).toHaveAttribute("aria-checked", String(on));
  await expect(
    page.getByLabel("Endereço da nova carteira", { exact: true }),
  ).toBeVisible();
}

async function fillNewWallet(
  page: Page,
  values: { address: string; walletType?: string },
) {
  await page
    .getByLabel("Endereço da nova carteira", { exact: true })
    .fill(values.address);
  if (values.walletType) {
    const trigger = page.getByLabel("Tipo", { exact: true });
    await trigger.focus();
    await trigger.press("Enter");
    const option = page.getByRole("option", {
      name: values.walletType,
      exact: true,
    });
    await expect(option).toBeVisible();
    await option.focus();
    await option.press("Enter");
    await expect(trigger).toContainText(values.walletType);
  }
}

async function saveNewWallet(page: Page) {
  const save = page.getByRole("button", { name: /salvar carteira/i });
  const created = page.waitForResponse(
    (r) => r.url().endsWith("/api/wallets") && r.request().method() === "POST",
  );
  await save.focus();
  await save.press("Enter");
  const response = await created;
  expect(response.status()).toBe(201);
  await expect(page.getByText(/carteira salva/i)).toBeVisible();
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
    await loginAs(page, MARIA);
    await addItemAndGoToCheckout(page);

    await expect(
      page.getByRole("heading", { name: /perfil do colecionador/i }),
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

  test("adds a new wallet and selects it", async ({ page }) => {
    await loginAs(page, MARIA);
    await addItemAndGoToCheckout(page);

    await toggleUseNewWallet(page, true);
    await fillNewWallet(page, { address: "0xabc1234567890" });
    await saveNewWallet(page);

    await expect(
      page.getByRole("checkbox", { name: /usar outra carteira/i }),
    ).toHaveAttribute("aria-checked", "false");

    const walletRadio = page.getByRole("radio", {
      name: /carteira 0xabc1…7890/i,
    });
    await expect(walletRadio).toBeVisible({ timeout: 10_000 });
    await expect(walletRadio).toBeChecked();
  });

  test("coinbase wallet refuses connection", async ({ page }) => {
    await loginAs(page, THAIS);
    await addItemAndGoToCheckout(page);

    const coinbaseRadio = page.getByRole("radio", {
      name: /coinbase wallet/i,
    });
    await expect(coinbaseRadio).toBeVisible({ timeout: 10_000 });
    await coinbaseRadio.check();

    await clickConfirmPurchase(page);
    await expect(page.getByRole("dialog")).toBeVisible();
    const connect = page.getByRole("button", { name: /^conectar$/i });
    await connect.focus();
    await connect.press("Enter");
    await expect(page.getByText(/recusou a conexão/i)).toBeVisible();
  });
});
