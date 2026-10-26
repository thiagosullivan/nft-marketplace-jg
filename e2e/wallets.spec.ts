import { test, expect, type Locator, type Page } from "@playwright/test";
import { login, resetAppState, MARIA } from "./helpers/login";

async function clickSafe(locator: Locator) {
  await locator.scrollIntoViewIfNeeded();
  await locator.click();
}

async function clickSelectOption(
  page: Page,
  triggerLabel: string,
  optionName: string,
) {
  const trigger = page.getByLabel(triggerLabel).filter({ visible: true });
  await trigger.scrollIntoViewIfNeeded();
  await trigger.click();
  const option = page
    .getByRole("option", { name: optionName })
    .filter({ visible: true });
  await option.scrollIntoViewIfNeeded();
  await option.click();
}

test.describe("Carteiras", () => {
  test.beforeEach(async ({ page }) => {
    await resetAppState(page);
    await login(page, MARIA.email);
  });

  test("lista as carteiras da Maria e mostra a principal em primeiro", async ({
    page,
  }) => {
    await page.goto("/profile/wallets");

    await expect(
      page.getByRole("heading", { name: "Carteira principal" }),
    ).toBeVisible();

    const items = page.locator("section ul > li");
    await expect(items).toHaveCount(2);
    await expect(items.first()).toContainText("MetaMask");
    await expect(items.first()).toContainText("Principal");
    await expect(items.nth(1)).toContainText("Ledger");
  });

  test("cria uma nova carteira", async ({ page }) => {
    await page.goto("/profile/wallets");

    await page.getByLabel("Apelido da carteira").fill("Nova carteira");
    await page
      .getByLabel("Endereço da carteira")
      .fill("0xD34D5F2b9A8c7E6f5D4c3B2a1F0e9D8c7B6a5F4e3");

    await clickSelectOption(page, "Rede", "polygon");
    await clickSelectOption(page, "Tipo de carteira", "other");

    await clickSafe(page.getByRole("button", { name: "Salvar carteira" }));

    await expect(
      page.getByText("Nova carteira").filter({ visible: true }),
    ).toBeVisible();
    await expect(page.locator("section ul > li")).toHaveCount(3);
  });

  test("edita uma carteira existente", async ({ page }) => {
    await page.goto("/profile/wallets");

    const ledger = page
      .locator("section ul > li")
      .filter({ hasText: "Ledger" })
      .first();
    await ledger.scrollIntoViewIfNeeded();

    await clickSafe(ledger.getByRole("button", { name: "Editar carteira" }));

    await expect(
      page.getByRole("heading", { name: "Editar carteira" }),
    ).toBeVisible();

    await page.getByLabel("Apelido", { exact: true }).fill("Carteira editada");
    await clickSafe(page.getByRole("button", { name: "Salvar" }));

    await expect(
      page.getByText("Carteira editada").filter({ visible: true }),
    ).toBeVisible();
  });

  test("torna uma carteira principal e move o badge", async ({ page }) => {
    await page.goto("/profile/wallets");

    const ledger = page
      .locator("section ul > li")
      .filter({ hasText: "Ledger" })
      .first();
    await ledger.scrollIntoViewIfNeeded();

    await clickSafe(
      ledger.getByRole("button", { name: "Definir como principal" }),
    );

    await expect(ledger.getByText("Principal")).toBeVisible();
    const metamask = page
      .locator("section ul > li")
      .filter({ hasText: "MetaMask" })
      .first();
    await expect(metamask.getByText("Principal")).toHaveCount(0);
  });
});
