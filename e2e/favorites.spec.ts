import { test, expect, type Page } from "@playwright/test";
import { isMobile, login, resetAppState, MARIA, THAIS } from "./helpers/login";

async function gotoNftDetail(page: Page, id: string, name: string) {
  await page.goto(`/nft/${id}`);
  await expect(
    page.getByRole("heading", { name: new RegExp(name, "i") }),
  ).toBeVisible({ timeout: 10_000 });
}

function favoriteButton(page: Page) {
  // O NftInfoPanel tem o botão "Favoritar" / "Remover favorito" (único
  // por breakpoint agora — o painel mobile é o mesmo componente).
  return page
    .getByRole("button", { name: /favoritar|remover favorito/i })
    .filter({ visible: true })
    .first();
}

async function setScenario(page: Page, scenario: string) {
  await page.evaluate((s) => {
    const w = window as unknown as {
      __msw?: { setScenario: (name: string) => void };
    };
    w.__msw?.setScenario(s);
  }, scenario);
}

test.describe("Favoritos", () => {
  test.beforeEach(async ({ page }) => {
    await resetAppState(page);
  });

  test("favorita no detalhe e persiste após refresh", async ({ page }) => {
    await login(page, MARIA.email);
    await gotoNftDetail(page, "nft-002", "violet nomad #002");

    const favButton = favoriteButton(page);
    await expect(favButton).toHaveAttribute("aria-pressed", "false");
    await favButton.click();

    const removeButton = page
      .getByRole("button", { name: /remover favorito/i })
      .filter({ visible: true })
      .first();
    await expect(removeButton).toBeVisible({ timeout: 5_000 });
    await expect(removeButton).toHaveAttribute("aria-pressed", "true");

    await page.reload();
    await expect(
      page
        .getByRole("button", { name: /remover favorito/i })
        .filter({ visible: true })
        .first(),
    ).toHaveAttribute("aria-pressed", "true", { timeout: 10_000 });
  });

  test("desfavorita no detalhe", async ({ page }) => {
    await login(page, MARIA.email);
    await gotoNftDetail(page, "nft-002", "violet nomad #002");

    // Favorita primeiro.
    await favoriteButton(page).click();
    const removeButton = page
      .getByRole("button", { name: /remover favorito/i })
      .filter({ visible: true })
      .first();
    await expect(removeButton).toBeVisible({ timeout: 5_000 });

    // Desfavorita.
    await removeButton.click();
    await expect(
      page
        .getByRole("button", { name: /favoritar/i })
        .filter({ visible: true })
        .first(),
    ).toHaveAttribute("aria-pressed", "false", { timeout: 5_000 });
  });

  test("falha de mutation faz rollback do estado otimista", async ({
    page,
  }) => {
    await login(page, MARIA.email);
    await gotoNftDetail(page, "nft-002", "violet nomad #002");

    // Ativa o cenário de erro antes do clique.
    await setScenario(page, "error-500");

    const favButton = favoriteButton(page);
    await expect(favButton).toHaveAttribute("aria-pressed", "false");
    await favButton.click();

    // Toast de erro deve aparecer (o `useToggleFavorite.onError` dispara).
    await expect(
      page
        .locator("[data-sonner-toast]")
        .filter({ hasText: /não foi possível|erro/i })
        .first(),
    ).toBeVisible({ timeout: 10_000 });

    // Rollback: o coração deve voltar ao estado anterior (não favoritado).
    await expect(
      page
        .getByRole("button", { name: /favoritar/i })
        .filter({ visible: true })
        .first(),
    ).toHaveAttribute("aria-pressed", "false", { timeout: 5_000 });

    // Reset do cenário.
    await setScenario(page, "default");
  });

  test("deslogado abre modal de login ao favoritar", async ({ page }) => {
    await gotoNftDetail(page, "nft-002", "violet nomad #002");

    await favoriteButton(page).click();

    // O `useToggleFavorite.toggle` chama `open("login", currentUrl())`.
    await expect(page.getByRole("dialog")).toBeVisible({ timeout: 5_000 });
  });

  test("isola favoritos entre usuários", async ({ page }) => {
    // Maria favorita.
    await login(page, MARIA.email);
    await gotoNftDetail(page, "nft-002", "violet nomad #002");
    await favoriteButton(page).click();
    await expect(
      page
        .getByRole("button", { name: /remover favorito/i })
        .filter({ visible: true })
        .first(),
    ).toBeVisible({ timeout: 5_000 });

    // Logout (via header) e login como Fernando.
    if (isMobile(page)) {
      await page.getByRole("button", { name: "Abrir menu" }).click();
      await page.getByRole("button", { name: /sair/i }).click();
    } else {
      await page.getByRole("button", { name: /sair/i }).click();
    }
    await login(page, THAIS.email);
    await gotoNftDetail(page, "nft-002", "violet nomad #002");

    // Fernando não deve ver o favorito da Maria.
    await expect(
      page
        .getByRole("button", { name: /favoritar/i })
        .filter({ visible: true })
        .first(),
    ).toHaveAttribute("aria-pressed", "false", { timeout: 10_000 });
  });

  test("favorita no card da home (desktop)", async ({ page }) => {
    test.skip(
      isMobile(page),
      "O botão de favoritar do card é hover-only (desktop)",
    );

    await login(page, MARIA.email);
    await page.goto("/");

    // O card da home mostra o coração no hover. Localizamos o card pelo
    // nome do NFT, fazemos hover e clicamos no botão "Favoritar".
    const card = page
      .locator("div.max-w-\\[260px\\]")
      .filter({ hasText: "Violet Nomad #002" })
      .first();
    await card.scrollIntoViewIfNeeded();
    await card.hover();

    const favButton = card
      .getByRole("button", { name: /favoritar|remover favorito/i })
      .first();
    await favButton.click();

    await expect(
      card.getByRole("button", { name: /remover favorito/i }),
    ).toBeVisible({ timeout: 5_000 });
  });

  test("aria-pressed reflete o estado do favorito", async ({ page }) => {
    await login(page, MARIA.email);
    await gotoNftDetail(page, "nft-002", "violet nomad #002");

    const favButton = favoriteButton(page);
    await expect(favButton).toHaveAttribute("aria-pressed", "false");
    await favButton.click();

    await expect(
      page
        .getByRole("button", { name: /remover favorito/i })
        .filter({ visible: true })
        .first(),
    ).toHaveAttribute("aria-pressed", "true", { timeout: 5_000 });
  });
});
