import { expect, test, type Page } from "@playwright/test";

const MARIA = { email: "maria@nftmail.com", password: "password123" };
const THAIS = { email: "thais@nftmail.com", password: "password123" };

function isMobile(page: Page) {
  return (page.viewportSize()?.width ?? 1440) < 768;
}

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

async function addToCart(page: Page, id: string) {
  await page.goto(`/nft/${id}`);
  const buy = page.getByRole("button", { name: /^comprar$/i });
  await buy.click();
  await expect(page).toHaveURL(/\/cart/);
}

/**
 * Preenche o modal de login ABERTO na página atual.
 * NÃO navega — o chamador é responsável por abrir o modal
 * (via requireAuth em rota protegida ou via clique no "Entrar").
 */
async function fillLoginModal(
  page: Page,
  creds: { email: string; password: string },
) {
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible({ timeout: 15_000 });
  await dialog
    .getByLabel("E-mail", { exact: true })
    .filter({ visible: true })
    .fill(creds.email);
  await dialog
    .getByLabel("Senha", { exact: true })
    .filter({ visible: true })
    .fill(creds.password);
  await dialog
    .getByRole("button", { name: /^entrar$/i })
    .filter({ visible: true })
    .click();
  await expect(dialog).toBeHidden({ timeout: 10_000 });
}

async function goToCheckoutLoggedIn(page: Page, creds = MARIA) {
  await addToCart(page, "nft-002");
  // "Conectar e finalizar" no carrinho: abre modal com redirect="/checkout"
  await page.getByRole("button", { name: /conectar e finalizar/i }).click();
  await fillLoginModal(page, creds);
  await expect(page).toHaveURL(/\/checkout/, { timeout: 15_000 });
}

async function clickConfirmPurchase(page: Page) {
  await page
    .getByRole("button", { name: /confirmar compra/i })
    .filter({ visible: true })
    .click();
}

async function pickWallet(page: Page, labelPattern: RegExp) {
  const radio = page
    .getByRole("radio", { name: labelPattern })
    .filter({ visible: true });
  await expect(radio).toBeVisible({ timeout: 10_000 });
  await radio.check({ force: true });
  return radio;
}

test.describe("Checkout", () => {
  test.beforeEach(async ({ page }) => {
    await reset(page);
  });

  test("checkout requires login", async ({ page }) => {
    await addToCart(page, "nft-002");
    await page.goto("/checkout");
    await expect(page.getByRole("dialog")).toBeVisible({ timeout: 15_000 });
  });

  test("creates order after wallet connection", async ({ page }) => {
    await goToCheckoutLoggedIn(page);

    await clickConfirmPurchase(page);

    await expect(
      page.getByRole("dialog", { name: /conectar carteira/i }),
    ).toBeVisible({ timeout: 10_000 });
    await page
      .getByRole("button", { name: /^conectar$/i })
      .filter({ visible: true })
      .click();
    await expect(
      page
        .getByRole("button", { name: /confirmar pedido/i })
        .filter({ visible: true }),
    ).toBeVisible({ timeout: 10_000 });
    await page
      .getByRole("button", { name: /confirmar pedido/i })
      .filter({ visible: true })
      .click();

    await expect(page).toHaveURL(/\/order\//, { timeout: 15_000 });
  });

  test("adds a new wallet and selects it", async ({ page }) => {
    test.skip(
      isMobile(page),
      "Adicionar carteira no checkout é apenas desktop; no mobile a carteira é gerenciada em /profile/wallets",
    );
    await goToCheckoutLoggedIn(page);

    const useNew = page
      .getByLabel("Usar outra carteira?")
      .filter({ visible: true });
    await useNew.check({ force: true });

    const address = `0xabc1${Date.now().toString(16).slice(-4)}…7890`;
    await page
      .getByLabel("Endereço da nova carteira", { exact: true })
      .filter({ visible: true })
      .fill(address);
    await page
      .getByRole("button", { name: /salvar carteira/i })
      .filter({ visible: true })
      .click();

    const walletRadio = await pickWallet(
      page,
      new RegExp(`carteira 0xabc1`, "i"),
    );
    await expect(walletRadio).toBeChecked();
  });

  test("coinbase wallet refuses connection", async ({ page }) => {
    await goToCheckoutLoggedIn(page, THAIS);

    const coinbase = await pickWallet(page, /coinbase wallet/i);
    void coinbase;

    await clickConfirmPurchase(page);

    await expect(
      page.getByRole("dialog", { name: /conectar carteira/i }),
    ).toBeVisible({ timeout: 10_000 });
    await page
      .getByRole("button", { name: /^conectar$/i })
      .filter({ visible: true })
      .click();
    await expect(
      page.getByText(/a carteira recusou a conexão/i).filter({ visible: true }),
    ).toBeVisible({ timeout: 10_000 });
  });
});
