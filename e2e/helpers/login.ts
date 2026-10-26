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

export async function dismissToasts(
  page: Page,
  timeoutMs = 8_000,
): Promise<void> {
  const toasts = page.locator("[data-sonner-toast]");
  if ((await toasts.count()) === 0) return;

  const closeBtn = toasts
    .first()
    .getByRole("button", { name: /close|fechar/i });
  if (await closeBtn.isVisible().catch(() => false)) {
    await closeBtn.click().catch(() => undefined);
  }

  await expect(toasts).toHaveCount(0, { timeout: timeoutMs });
}

export async function login(page: Page, email: string): Promise<void> {
  await page.waitForLoadState("networkidle");

  await dismissToasts(page);

  if (isMobile(page)) {
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
  await passwordInput.press("Enter");

  await expect(dialog).toBeHidden({ timeout: 10_000 });

  await dismissToasts(page);
}
