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

/**
 * Dispensa toasts do sonner. Tenta o botão "Close toast" (se existir)
 * e, se não, espera o toast sumir sozinho (default: 4s no sonner).
 * Se o toast persistir após `timeoutMs`, faz dismiss programático via
 * `window.__sonnerDismiss` (registrado pelo Toaster — ver instruções).
 */
async function dismissToasts(page: Page, timeoutMs = 6_000): Promise<void> {
  const toasts = page.locator("[data-sonner-toast]");
  if ((await toasts.count()) === 0) return;

  // Tenta fechar pelo botão "Close toast" (existe se `<Toaster closeButton />`).
  const closeBtn = toasts.first().getByRole("button", { name: /close toast/i });
  if (await closeBtn.isVisible().catch(() => false)) {
    await closeBtn.click().catch(() => undefined);
  }

  // Espera sumir. Se o toast for `duration: Infinity`, o timeout vai
  // estourar e o teste expõe o problema. Se for 4s, resolve.
  try {
    await expect(toasts).toHaveCount(0, { timeout: timeoutMs });
  } catch {
    // Fallback: dispensa via API global do sonner (se registrada).
    await page.evaluate(() => {
      const w = window as unknown as {
        __sonnerDismiss?: () => void;
      };
      w.__sonnerDismiss?.();
    });
    await expect(toasts).toHaveCount(0, { timeout: 3_000 });
  }
}

export async function login(page: Page, email: string): Promise<void> {
  await page.waitForLoadState("networkidle");

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

  // Só o mobile precisa dispensar o toast: ele cobre o botão "Abrir menu".
  // No desktop, o header mostra "Sair" direto e o toast não atrapalha.
  if (isMobile(page)) {
    await dismissToasts(page);
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
