import { test, expect } from "@playwright/test";
import { resetAppState } from "./helpers/login";

test.describe("Search do header", () => {
  test.beforeEach(async ({ page }) => {
    await resetAppState(page);
  });

  test("busca e navega para o detalhe", async ({ page }) => {
    await page.getByRole("button", { name: "Buscar NFTs" }).click();

    const input = page.getByRole("textbox", { name: "Buscar NFTs" });
    await input.fill("emerald");

    const first = page.getByRole("listbox").getByRole("link").first();
    await expect(first).toBeVisible({ timeout: 5_000 });
    await first.click();

    await expect(page).toHaveURL(/\/nft\/nft-/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("mostra dica com poucos caracteres e vazio", async ({ page }) => {
    await page.getByRole("button", { name: "Buscar NFTs" }).click();

    const input = page.getByRole("textbox", { name: "Buscar NFTs" });

    await input.fill("e");
    await expect(page.getByText(/Digite ao menos 2 caracteres/i)).toBeVisible();

    await input.fill("zzzzzz");
    await expect(page.getByText(/Nenhum NFT encontrado/i)).toBeVisible({
      timeout: 5_000,
    });
  });

  test("badge do carrinho aparece com itens", async ({ page }) => {
    // Popula o guest cart ANTES do app montar. A chave e o formato vêm
    // de `src/features/cart/guest-cart.ts`.
    await page.addInitScript(() => {
      const cart = {
        items: [
          {
            nftId: "nft-001",
            editionId: null,
            quantity: 1,
            unitPriceEth: "0.02",
            name: "Emerald Ape #001",
            imageUrl: "/nfts/prod-1.png",
            network: "ethereum",
            tokenId: "#0042",
            editionLabel: null,
            maxAvailable: 1,
          },
        ],
        updatedAt: new Date().toISOString(),
      };
      window.localStorage.setItem(
        "nftmarketplace:guest-cart",
        JSON.stringify(cart),
      );
    });

    await page.goto("/");

    // Header expõe aria-label "Carrinho (1 item)" quando há itens.
    await expect(
      page.getByRole("link", { name: /Carrinho \(\d+/i }),
    ).toBeVisible({ timeout: 10_000 });
  });
});
