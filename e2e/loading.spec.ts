import { test, expect, type Page } from "@playwright/test";
import { resetAppState } from "./helpers/login";

async function setScenario(page: Page, scenario: string) {
  await page.evaluate((s) => {
    const w = window as unknown as {
      __msw?: { setScenario: (name: string) => void };
    };
    w.__msw?.setScenario(s);
  }, scenario);
}

async function waitForMsw(page: Page) {
  await page.waitForFunction(() =>
    Boolean((window as unknown as { __msw?: unknown }).__msw),
  );
}

async function resetScenario(page: Page) {
  // Defensivo: garante que o cenário não vazou de um teste anterior.
  await page.evaluate(() => {
    const w = window as unknown as {
      __msw?: { setScenario: (name: string) => void };
    };
    w.__msw?.setScenario("default");
  });
}

test.describe("Loading, erro e retry", () => {
  test.beforeEach(async ({ page }) => {
    await resetAppState(page);
    await waitForMsw(page);
    await resetScenario(page);
  });

  test("cenário slow mostra skeleton no catálogo", async ({ page }) => {
    await setScenario(page, "slow");
    // Reload reinicia o app com o cenário já em localStorage → MSW lê "slow" no boot.
    await page.reload();
    await waitForMsw(page);

    const skeleton = page
      .locator('[data-slot="skeleton"]')
      .filter({ visible: true })
      .first();
    await expect(skeleton).toBeVisible({ timeout: 5_000 });

    await setScenario(page, "default");
  });

  test("cenário slow some quando os dados chegam", async ({ page }) => {
    await setScenario(page, "slow");
    await page.reload();
    await waitForMsw(page);

    const skeleton = page
      .locator('[data-slot="skeleton"]')
      .filter({ visible: true })
      .first();
    await expect(skeleton).toBeVisible({ timeout: 5_000 });

    // O cenário `slow` tem 2–4s de delay. Espera o card real aparecer.
    await expect(
      page.getByRole("link", { name: /ver emerald ape #001/i }),
    ).toBeVisible({ timeout: 15_000 });

    // O skeleton não deve mais estar visível.
    await expect(
      page.locator('[data-slot="skeleton"]').filter({ visible: true }),
    ).toHaveCount(0, { timeout: 5_000 });

    await setScenario(page, "default");
  });

  test("cenário error-500 mostra erro com retry", async ({ page }) => {
    await setScenario(page, "error-500");
    await page.reload();
    await waitForMsw(page);

    // O ErrorState do catálogo renderiza <p>, não heading.
    await expect(
      page.getByText(/não foi possível carregar o catálogo/i),
    ).toBeVisible({ timeout: 10_000 });

    await expect(
      page.getByRole("button", { name: /tentar novamente/i }),
    ).toBeVisible();

    await setScenario(page, "default");
  });

  test("retry recupera o catálogo após erro", async ({ page }) => {
    await setScenario(page, "error-500");
    await page.reload();
    await waitForMsw(page);

    await expect(
      page.getByRole("button", { name: /tentar novamente/i }),
    ).toBeVisible({ timeout: 10_000 });

    // Muda para default e clica "Tentar novamente".
    await setScenario(page, "default");
    await page.getByRole("button", { name: /tentar novamente/i }).click();

    await expect(
      page.getByRole("link", { name: /ver emerald ape #001/i }),
    ).toBeVisible({ timeout: 15_000 });
  });

  test("cenário slow mostra skeleton no detalhe do NFT", async ({ page }) => {
    await setScenario(page, "slow");
    // `page.goto` (não `reload`) para navegar a /nft/nft-002.
    // Como reinicia o app, o MSW lê "slow" no boot e `useNft` fica isLoading
    // durante o delay → `NftDetailSkeleton` renderiza.
    await page.goto("/nft/nft-002");
    await waitForMsw(page);

    // `NftDetailSkeleton` tem aria-busy="true" no container + texto sr-only.
    // Não usar .filter({ visible: false }) — não filtra ocultos no Playwright.
    const busy = page.locator('[aria-busy="true"]').first();
    await expect(busy).toBeAttached({ timeout: 5_000 });

    await expect(
      page.getByText(/carregando detalhes do nft/i).first(),
    ).toBeAttached({ timeout: 5_000 });

    // Conteúdo real chega (skeleton sai).
    await expect(
      page.getByRole("heading", { name: /violet nomad #002/i }),
    ).toBeVisible({ timeout: 15_000 });

    await expect(page.locator('[aria-busy="true"]')).toHaveCount(0, {
      timeout: 10_000,
    });

    await setScenario(page, "default");
  });
});
