import { expect, type Page } from "@playwright/test";

export const MARIA = { email: "maria@nftmail.com", password: "password123" };
export const THAIS = { email: "thais@nftmail.com", password: "password123" };

export function isMobile(page: Page): boolean {
  return (page.viewportSize()?.width ?? 1440) < 768;
}

export async function resetAppState(page: Page): Promise<void> {
  await page.goto("/");
  await page.evaluate(() => {
    window.localStorage.removeItem("nftmarketplace:db");
    window.localStorage.removeItem("nftmarketplace:token");
    window.localStorage.removeItem("nftmarketplace:session");
    window.localStorage.removeItem("nftmarketplace:guest-cart");
  });
  await page.reload();
  await page.waitForLoadState("networkidle");
}

export async function login(page: Page, email: string): Promise<void> {
  await page.waitForLoadState("networkidle");

  if (isMobile(page)) {
    // No mobile, o "Entrar" do header está dentro do drawer.
    await page.getByRole("button", { name: "Abrir menu" }).click();
    await page.getByTestId("header-login-button-mobile").click();
    await expect(page.getByRole("dialog", { name: "Menu" })).toBeHidden({
      timeout: 5_000,
    });
  } else {
    await page.getByTestId("header-login-button").click();
  }

  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible({ timeout: 10_000 });

  await dialog
    .getByLabel(/^e-mail$/i)
    .filter({ visible: true })
    .fill(email);

  const passwordInput = dialog.getByLabel(/^senha$/i).filter({ visible: true });
  await passwordInput.fill("password123");

  // Submete via Enter: não depende do botão estar clicável
  // (o overlay do AuthModalShell intercepta pointer events no mobile).
  await passwordInput.press("Enter");

  if (isMobile(page)) {
    // No mobile, "Sair" está dentro do drawer.
    await page.getByRole("button", { name: "Abrir menu" }).click();
    await expect(
      page.getByRole("button", { name: /sair/i, exact: true }),
    ).toBeVisible({ timeout: 10_000 });
    await page.keyboard.press("Escape");
  } else {
    await expect(
      page.getByRole("button", { name: /sair/i, exact: true }),
    ).toBeVisible({ timeout: 10_000 });
  }
}
