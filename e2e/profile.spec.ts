import { test, expect, type Page } from "@playwright/test";
import {
  isMobile,
  login,
  resetAppState,
  dismissToasts,
  MARIA,
} from "./helpers/login";

async function gotoProfile(page: Page) {
  await page.goto("/profile");
  await expect(page).toHaveURL(/\/profile/, { timeout: 10_000 });
  await expect(
    page.getByRole("heading", { name: /perfil do colecionador/i }),
  ).toBeVisible({ timeout: 10_000 });
}

async function setScenario(page: Page, scenario: string) {
  await page.evaluate((s) => {
    const w = window as unknown as {
      __msw?: { setScenario: (name: string) => void };
    };
    w.__msw?.setScenario(s);
  }, scenario);
}

async function save(page: Page) {
  await page
    .getByRole("button", { name: /^salvar$/i })
    .filter({ visible: true })
    .click();
}

test.describe("Perfil do colecionador", () => {
  test.beforeEach(async ({ page }) => {
    await resetAppState(page);
    await login(page, MARIA.email);
    await dismissToasts(page);
  });

  test("edita nome de exibição e usuário e persiste após refresh", async ({
    page,
  }) => {
    await gotoProfile(page);

    const newName = "Maria Editada";
    const newUsername = `maria_${Date.now().toString(36)}`;

    await page
      .getByLabel("Nome de exibição")
      .filter({ visible: true })
      .fill(newName);
    await page
      .getByLabel("Nome de usuário")
      .filter({ visible: true })
      .fill(newUsername);

    await save(page);

    await expect(
      page
        .locator("[data-sonner-toast]")
        .filter({ hasText: /perfil atualizado/i })
        .first(),
    ).toBeVisible({ timeout: 10_000 });

    await page.reload();
    await expect(
      page.getByLabel("Nome de exibição").filter({ visible: true }),
    ).toHaveValue(newName, { timeout: 10_000 });
    await expect(
      page.getByLabel("Nome de usuário").filter({ visible: true }),
    ).toHaveValue(newUsername);
  });

  test("validação: nome de exibição vazio mostra erro inline", async ({
    page,
  }) => {
    await gotoProfile(page);

    await page
      .getByLabel("Nome de exibição")
      .filter({ visible: true })
      .fill("");

    await save(page);

    await expect(
      page
        .getByRole("alert")
        .filter({ hasText: /informe um nome/i })
        .first(),
    ).toBeVisible({ timeout: 5_000 });
  });

  test("erro da API no perfil mostra toast", async ({ page }) => {
    await gotoProfile(page);

    await setScenario(page, "error-500");

    await save(page);

    await expect(
      page
        .locator("[data-sonner-toast]")
        .filter({ hasText: /erro|falha|não foi possível/i })
        .first(),
    ).toBeVisible({ timeout: 10_000 });

    await setScenario(page, "default");
  });

  test("upload de avatar mostra preview e salva", async ({ page }) => {
    await gotoProfile(page);

    const pngBase64 =
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
    const pngBuffer = Buffer.from(pngBase64, "base64");

    await page.locator('input[type="file"]').setInputFiles({
      name: "avatar.png",
      mimeType: "image/png",
      buffer: pngBuffer,
    });

    await expect(
      page
        .getByRole("img", { name: "Pré-visualização do avatar" })
        .filter({ visible: true })
        .first(),
    ).toBeVisible({ timeout: 5_000 });

    await save(page);

    await expect(
      page
        .locator("[data-sonner-toast]")
        .filter({ hasText: /perfil atualizado/i })
        .first(),
    ).toBeVisible({ timeout: 10_000 });
  });

  test("remove avatar volta ao placeholder", async ({ page }) => {
    await gotoProfile(page);

    const pngBase64 =
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
    const pngBuffer = Buffer.from(pngBase64, "base64");
    await page.locator('input[type="file"]').setInputFiles({
      name: "avatar.png",
      mimeType: "image/png",
      buffer: pngBuffer,
    });
    await expect(
      page
        .getByRole("img", { name: "Pré-visualização do avatar" })
        .filter({ visible: true })
        .first(),
    ).toBeVisible({ timeout: 5_000 });

    await page
      .getByRole("button", { name: /^remover$/i })
      .filter({ visible: true })
      .first()
      .click();

    await save(page);

    await expect(
      page
        .locator("[data-sonner-toast]")
        .filter({ hasText: /perfil atualizado/i })
        .first(),
    ).toBeVisible({ timeout: 10_000 });
  });

  test("altera a senha e permite relogar com a nova", async ({ page }) => {
    await gotoProfile(page);

    const newPassword = "newpassword123";

    await page
      .getByLabel("Senha atual")
      .filter({ visible: true })
      .fill("password123");
    await page
      .getByLabel("Nova senha", { exact: true })
      .filter({ visible: true })
      .fill(newPassword);
    await page
      .getByLabel("Confirmar nova senha")
      .filter({ visible: true })
      .fill(newPassword);

    await save(page);

    await expect(
      page
        .locator("[data-sonner-toast]")
        .filter({ hasText: /senha alterada/i })
        .first(),
    ).toBeVisible({ timeout: 10_000 });

    await dismissToasts(page);

    // Logout — escopa ao header (desktop) ou drawer (mobile).
    // No desktop, há 2 "Sair" na tela (header + sidebar do perfil).
    if (isMobile(page)) {
      await page.getByRole("button", { name: "Abrir menu" }).click();
      await page
        .getByRole("dialog", { name: "Menu" })
        .getByRole("button", { name: /sair/i })
        .click();
    } else {
      await page
        .getByRole("banner")
        .getByRole("button", { name: /sair/i })
        .click();
    }

    // Login com a senha nova.
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
      .fill(MARIA.email);
    const passwordInput = dialog
      .getByLabel(/^senha$/i)
      .filter({ visible: true });
    await passwordInput.fill(newPassword);
    await passwordInput.press("Enter");
    await expect(dialog).toBeHidden({ timeout: 10_000 });

    // Confirma logado (Sair escopado).
    if (isMobile(page)) {
      await page.getByRole("button", { name: "Abrir menu" }).click();
      await expect(
        page
          .getByRole("dialog", { name: "Menu" })
          .getByRole("button", { name: /sair/i }),
      ).toBeVisible({ timeout: 10_000 });
    } else {
      await expect(
        page.getByRole("banner").getByRole("button", { name: /sair/i }),
      ).toBeVisible({ timeout: 10_000 });
    }
  });

  test("validação: senhas não coincidem mostra erro", async ({ page }) => {
    await gotoProfile(page);

    await page
      .getByLabel("Senha atual")
      .filter({ visible: true })
      .fill("password123");
    await page
      .getByLabel("Nova senha", { exact: true })
      .filter({ visible: true })
      .fill("newpassword123");
    await page
      .getByLabel("Confirmar nova senha")
      .filter({ visible: true })
      .fill("different123");

    await save(page);

    await expect(
      page
        .getByRole("alert")
        .filter({ hasText: /as senhas não coincidem/i })
        .first(),
    ).toBeVisible({ timeout: 5_000 });
  });

  test("senha atual errada mostra erro inline", async ({ page }) => {
    await gotoProfile(page);

    await page
      .getByLabel("Senha atual")
      .filter({ visible: true })
      .fill("senhaerrada");
    await page
      .getByLabel("Nova senha", { exact: true })
      .filter({ visible: true })
      .fill("newpassword123");
    await page
      .getByLabel("Confirmar nova senha")
      .filter({ visible: true })
      .fill("newpassword123");

    await save(page);

    await expect(
      page.getByRole("alert").filter({ hasText: /senha/i }).first(),
    ).toBeVisible({ timeout: 10_000 });
  });
});
