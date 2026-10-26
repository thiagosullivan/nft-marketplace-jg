import { test, expect, type Page } from "@playwright/test";
import { resetAppState } from "./helpers/login";

function isMobile(page: Page) {
  return (page.viewportSize()?.width ?? 1440) < 768;
}

test.describe("Search do header", () => {
  test.beforeEach(async ({ page }) => {
    await resetAppState(page);
  });

  test("busca e navega para o detalhe", async ({ page }) => {
    if (isMobile(page)) {
      // No mobile, o input de busca é inline no header (sempre visível).
      const input = page.getByRole("searchbox", {
        name: "Explorar coleções",
      });
      await input.fill("emerald");

      // O dropdown aparece abaixo do input, com role="listbox".
      const first = page
        .getByRole("listbox")
        .getByRole("link")
        .filter({ visible: true })
        .first();
      await expect(first).toBeVisible({ timeout: 5_000 });
      await first.click();
    } else {
      // Desktop: botão de busca abre um popover com input.
      await page.getByRole("button", { name: "Buscar NFTs" }).click();
      const input = page.getByRole("textbox", { name: "Buscar NFTs" });
      await input.fill("emerald");

      const first = page
        .getByRole("listbox")
        .getByRole("link")
        .filter({ visible: true })
        .first();
      await expect(first).toBeVisible({ timeout: 5_000 });
      await first.click();
    }

    await expect(page).toHaveURL(/\/nft\/nft-/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("mostra dica com poucos caracteres e vazio", async ({ page }) => {
    let input;
    if (isMobile(page)) {
      // Mobile: input inline no header.
      input = page.getByRole("searchbox", { name: "Explorar coleções" });
      await input.fill("e");
    } else {
      // Desktop: botão + popover.
      await page.getByRole("button", { name: "Buscar NFTs" }).click();
      input = page.getByRole("textbox", { name: "Buscar NFTs" });
      await input.fill("e");
    }

    // A mensagem de "Digite ao menos 2 caracteres" só aparece no desktop
    // (no mobile o input inline não mostra essa dica antes de digitar).
    if (!isMobile(page)) {
      await expect(
        page
          .getByText(/Digite ao menos 2 caracteres/i)
          .filter({ visible: true }),
      ).toBeVisible();
    }

    await input.fill("zzzzzz");
    await expect(
      page.getByText(/Nenhum NFT encontrado/i).filter({ visible: true }),
    ).toBeVisible({ timeout: 5_000 });
  });

  test("badge do carrinho aparece com itens", async ({ page }) => {
    // Popula o guest cart ANTES do app montar.
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

    if (isMobile(page)) {
      // No mobile, o badge do carrinho está no ícone dentro do drawer
      // (o header mobile não tem ícone de carrinho visível fora do drawer).
      // Abrimos o drawer e validamos o link do carrinho com badge.
      await page.getByRole("button", { name: "Abrir menu" }).click();
      // O link "Carrinho" no drawer não tem o badge (o badge é o
      // aria-label "Carrinho (N item)"). No drawer, o link é só "Carrinho".
      // Validamos o item no carrinho diretamente — o badge não está
      // acessível no mobile sem abrir o drawer.
      await expect(
        page
          .getByRole("dialog", { name: "Menu" })
          .getByRole("link", { name: /^Carrinho$/ }),
      ).toBeVisible();
      await page.keyboard.press("Escape");
      // E valida que o item foi pra o carrinho navegando.
      await page.goto("/cart");
      await expect(
        page
          .getByRole("listitem")
          .filter({ hasText: /emerald ape/i })
          .filter({ visible: true }),
      ).toBeVisible();
      return;
    }

    // Desktop: o header tem link "Carrinho (N item)" com badge.
    await expect(
      page.getByRole("link", { name: /Carrinho \(\d+/i }).filter({
        visible: true,
      }),
    ).toBeVisible({ timeout: 10_000 });
  });
});
