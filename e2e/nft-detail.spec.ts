import { expect, test, type Page } from "@playwright/test";

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

async function selectEdition(page: Page, label: RegExp) {
  await page.locator("label", { hasText: label }).first().click();
}

test.describe("NFT detail", () => {
  test.beforeEach(async ({ page }) => {
    await reset(page);
  });

  test("direct access loads the NFT", async ({ page }) => {
    await page.goto("/nft/nft-001");
    await expect(
      page.getByRole("heading", { name: /emerald ape #001/i }),
    ).toBeVisible();
  });

  test("selecting an edition updates the displayed price", async ({ page }) => {
    await page.goto("/nft/nft-002");
    await expect(
      page.getByRole("heading", { name: /violet nomad #002/i }),
    ).toBeVisible();

    // A edição padrão do nft-002 (1/1) custa 0.05 ETH.
    await expect(page.getByText("0.05 ETH").first()).toBeVisible();

    // A edição ABERTA custa 0.06 ETH (0.05 × 1.15, arredondado).
    await selectEdition(page, /^aberta/i);
    await expect(page.getByText("0.06 ETH").first()).toBeVisible();
  });

  test("quantity stepper clamps to availability", async ({ page }) => {
    await page.goto("/nft/nft-003");
    await expect(
      page.getByRole("heading", { name: /ivory baron #003/i }),
    ).toBeVisible();

    const input = page.getByRole("spinbutton").first();
    await input.fill("9999");
    await input.blur();
    // A edição 1/1 do nft-003 tem available=1; o input deve ficar em 1.
    await expect(input).toHaveValue("1");
  });

  test("sold out product shows disabled buy button", async ({ page }) => {
    await page.goto("/nft/nft-001");
    await expect(
      page.getByRole("heading", { name: /emerald ape #001/i }),
    ).toBeVisible();

    const soldOut = page.locator("label", { hasText: /^1\/1/i }).first();
    await expect(soldOut).toHaveAttribute("aria-disabled", "true");
    await expect(
      soldOut.getByRole("radio", { name: /edição 1\/1/i }),
    ).toBeDisabled();

    await expect(page.getByRole("button", { name: /^comprar$/i })).toHaveCount(
      0,
    );
    await expect(
      page.getByRole("button", { name: /^esgotado$/i }),
    ).toBeDisabled();
  });

  test("buy while logged out adds to guest cart", async ({ page }) => {
    await page.goto("/nft/nft-002");
    const buy = page.getByRole("button", { name: /^comprar$/i });
    await buy.focus();
    await buy.press("Enter");
    await expect(page).toHaveURL(/\/cart/);
    await expect(
      page.getByRole("listitem").filter({ hasText: /violet nomad #002/i }),
    ).toBeVisible();
  });
});
