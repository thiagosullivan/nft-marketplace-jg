import { expect, type Page } from "@playwright/test";

export const MARIA = { email: "maria@nftmail.com", password: "password123" };
export const THAIS = { email: "thais@nftmail.com", password: "password123" };

export async function resetAppState(page: Page): Promise<void> {
  await page.goto("/");
  await page.evaluate(() => {
    window.localStorage.removeItem("nftmarketplace:db");
    window.localStorage.removeItem("nftmarketplace:token");
    window.localStorage.removeItem("nftmarketplace:guest-cart");
  });
  await page.reload();
  await page.waitForLoadState("networkidle");
}

export async function login(page: Page, email: string): Promise<void> {
  await page.waitForLoadState("networkidle");

  const openLogin = page.getByTestId("header-login-button");
  await expect(openLogin).toBeVisible({ timeout: 10_000 });
  await openLogin.click();

  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible({ timeout: 10_000 });

  await dialog.getByLabel(/^e-mail$/i).fill(email);

  const passwordInput = dialog.getByLabel(/^senha$/i);
  await passwordInput.fill("password123");

  // Submete via Enter no input de senha: dispara o submit do form
  // sem depender do botão estar clicável (o overlay do AuthModalShell
  // intercepta pointer events no mobile).
  await passwordInput.press("Enter");

  await expect(page.getByRole("button", { name: /sair/i })).toBeVisible({
    timeout: 10_000,
  });
}
