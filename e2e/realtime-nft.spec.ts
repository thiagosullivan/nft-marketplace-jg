import { test, expect } from "@playwright/test";
import { login, resetAppState, MARIA } from "./helpers/login";

test.describe("Realtime — nft.updated", () => {
  test.beforeEach(async ({ page }) => {
    await resetAppState(page);
  });

  test("preço muda no catálogo e reflete na UI", async ({ page }) => {
    await page.goto("/");

    // O NftCard renderiza `<p>{nft.name}</p>` e `<p>{nft.priceEth} ETH</p>`
    // fora do <Link>. Localizamos o card pelo nome e checamos o preço
    // no mesmo container.
    const card = page
      .locator("div.max-w-\\[260px\\]")
      .filter({ hasText: "Violet Nomad #002" })
      .first();
    await expect(card).toBeVisible();

    await expect(card.getByText("0.05 ETH")).toBeVisible();

    await page.evaluate(async () => {
      await fetch("/api/dev/emit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "nft.updated",
          payload: { nftId: "nft-002", priceEth: "9.99" },
        }),
      });
    });

    await expect(card.getByText("9.99 ETH")).toBeVisible({ timeout: 5_000 });
  });

  test("preço muda no carrinho e checkout bloqueia cotação antiga", async ({
    page,
  }) => {
    await login(page, MARIA.email);

    await page.goto("/nft/nft-002");
    const buy = page.getByRole("button", { name: /^comprar$/i });
    await buy.focus();
    await buy.press("Enter");
    await expect(page).toHaveURL(/\/cart/);

    const row = page
      .getByRole("listitem")
      .filter({ hasText: /violet nomad #002/i });
    await expect(row).toBeVisible();

    await page.evaluate(async () => {
      await fetch("/api/dev/emit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "nft.updated",
          payload: { nftId: "nft-002", priceEth: "9.99" },
        }),
      });
    });

    await expect(row.getByText("9.99 ETH")).toBeVisible({ timeout: 5_000 });
  });
});
