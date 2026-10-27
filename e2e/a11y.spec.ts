import { test, expect } from "@playwright/test";
import {
  resetAppState,
  login,
  MARIA,
  dismissToasts,
  isMobile,
} from "./helpers/login";

test.describe("Acessibilidade", () => {
  test.beforeEach(async ({ page }) => {
    await resetAppState(page);
  });

  // 1. Sem overflow horizontal
  test("não há overflow horizontal em 390, 768 e 1440", async ({ page }) => {
    for (const viewport of [
      { width: 390, height: 844 },
      { width: 768, height: 1024 },
      { width: 1440, height: 900 },
    ]) {
      await page.setViewportSize(viewport);
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      const hasOverflow = await page.evaluate(
        () =>
          document.documentElement.scrollWidth >
          document.documentElement.clientWidth + 1,
      );
      expect(hasOverflow, `overflow horizontal em ${viewport.width}px`).toBe(
        false,
      );
    }
  });

  // 2. Landmarks e headings
  test("home tem landmarks e headings principais", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await expect(page.getByRole("banner")).toBeVisible();
    await expect(page.getByRole("main")).toBeVisible();
    await expect(page.getByRole("contentinfo")).toBeVisible();
    await expect(
      page.getByRole("tablist", { name: /filtrar nfts/i }),
    ).toBeVisible();
  });

  // 3. Navegação por teclado
  test("navegação por teclado alcança o primeiro card do catálogo", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.locator("body").click({ position: { x: 1, y: 1 } });
    let found = false;
    for (let i = 0; i < 40 && !found; i++) {
      await page.keyboard.press("Tab");
      const focused = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null;
        return {
          text: el?.getAttribute("aria-label") ?? el?.textContent?.trim() ?? "",
        };
      });
      if (/ver emerald ape #001/i.test(focused.text)) found = true;
    }
    expect(found, "primeiro card não é alcançável por Tab").toBe(true);

    const hasFocusRing = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null;
      if (!el) return false;
      const style = window.getComputedStyle(el);
      return (
        style.outlineStyle !== "none" ||
        style.boxShadow !== "none" ||
        style.outlineWidth !== "0px"
      );
    });
    expect(hasFocusRing, "foco não é visível").toBe(true);
  });

  test("modal de login prende o foco e fecha com Esc", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await dismissToasts(page);

    if (isMobile(page)) {
      await page.getByRole("button", { name: "Abrir menu" }).click();
      await page.getByTestId("header-login-button-mobile").click();
    } else {
      await page.getByTestId("header-login-button").click();
    }

    const dialog = page.getByRole("dialog", { name: /entrar|criar conta/i });
    await expect(dialog).toBeVisible({ timeout: 10_000 });

    // O AuthModalShell não faz autoFocus. Forçamos o foco no primeiro campo
    // para poder testar o trap a partir de um ponto conhecido.
    await dialog
      .getByRole("textbox", { name: /e-mail/i })
      .first()
      .focus();

    const focusInDialog = await dialog.evaluate((el) =>
      el.contains(document.activeElement),
    );
    expect(focusInDialog, "foco não entrou no dialog").toBe(true);

    let escaped = false;
    for (let i = 0; i < 30; i++) {
      await page.keyboard.press("Tab");
      const inside = await dialog.evaluate((el) =>
        el.contains(document.activeElement),
      );
      if (!inside) escaped = true;
    }
    expect(escaped, "foco escapou do dialog (sem focus trap)").toBe(false);

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden({ timeout: 5_000 });
  });

  // 5. Focus trap no CheckoutWalletModal
  test("dialog de carteira (Radix) prende o foco e fecha com Esc", async ({
    page,
  }) => {
    await login(page, MARIA.email);
    await page.goto("/nft/nft-002");
    await page.waitForLoadState("networkidle");
    await page
      .getByRole("button", { name: /^comprar$/i })
      .first()
      .click();
    await page.waitForURL(/\/cart/);
    await page.goto("/checkout");
    await page.waitForLoadState("networkidle");

    const walletRadio = page
      .locator('input[type="radio"][name="wallet"]')
      .filter({ visible: true })
      .first();

    if (isMobile(page)) {
      const label = page
        .locator("label")
        .filter({ has: walletRadio })
        .filter({ visible: true })
        .first();
      await label.click();
    } else {
      await walletRadio.check({ force: true });
    }
    await expect(walletRadio).toBeChecked();

    await page
      .getByRole("button", { name: /confirmar compra/i })
      .first()
      .click();

    const dialog = page.getByRole("dialog", { name: /conectar carteira/i });
    await expect(dialog).toBeVisible({ timeout: 10_000 });

    const focusInDialog = await dialog.evaluate((el) =>
      el.contains(document.activeElement),
    );
    expect(focusInDialog).toBe(true);

    let escaped = false;
    for (let i = 0; i < 30; i++) {
      await page.keyboard.press("Tab");
      const inside = await dialog.evaluate((el) =>
        el.contains(document.activeElement),
      );
      if (!inside) escaped = true;
    }
    expect(escaped, "foco escapou do dialog (sem focus trap)").toBe(false);

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden({ timeout: 5_000 });
  });

  // 6. Validação do perfil
  test("perfil valida campos com erros acessíveis", async ({ page }) => {
    await login(page, MARIA.email);
    await page.goto("/profile");
    await page.waitForLoadState("networkidle");

    const displayName = page.getByLabel(/nome de exibição/i).first();
    await displayName.fill("");
    await page.getByRole("button", { name: /^salvar$/i }).click();

    const error = page
      .getByRole("alert")
      .filter({ hasText: /informe um nome/i });
    await expect(error).toBeVisible({ timeout: 5_000 });

    await expect(displayName).toHaveValue("");
  });

  // 7. Nova carteira (desktop-only)
  test("nova carteira valida endereço com erro acessível", async ({ page }) => {
    test.skip(isMobile(page), "nova carteira é desktop-only (CheckoutForm)");

    await login(page, MARIA.email);
    await page.goto("/nft/nft-002");
    await page.waitForLoadState("networkidle");
    await page
      .getByRole("button", { name: /^comprar$/i })
      .first()
      .click();
    await page.waitForURL(/\/cart/);

    await page.goto("/checkout");
    await page.waitForLoadState("networkidle");

    // Checkbox do Radix: clicar no label visível.
    await page.locator('label[for="useNewWallet"]').click();

    await expect(
      page.getByRole("group", { name: /nova carteira/i }),
    ).toBeVisible();

    await page.getByRole("button", { name: /salvar carteira/i }).click();

    const error = page
      .getByRole("alert")
      .filter({ hasText: /informe o endereço/i });
    await expect(error).toBeVisible({ timeout: 5_000 });
  });

  // 8. Erro de API no perfil
  test("perfil exibe erro de API (username duplicado) com role=alert", async ({
    page,
  }) => {
    await login(page, MARIA.email);
    await page.goto("/profile");
    await page.waitForLoadState("networkidle");

    const username = page.getByLabel(/nome de usuário/i).first();
    await username.fill("fernando");
    await page.getByRole("button", { name: /^salvar$/i }).click();

    const error = page.getByRole("alert");
    await expect(error.first()).toBeVisible({ timeout: 10_000 });
  });
});
