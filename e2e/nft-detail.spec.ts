import { expect, test, type Page } from "@playwright/test";

const MARIA = { email: "maria@nftmail.com", password: "password123" };

async function reset(page: Page) {
  await page.goto("/?reset=1");
  await page.waitForFunction(() =>
    Boolean((window as unknown as { __msw?: unknown }).__msw),
  );
  await page.evaluate(() => {
    localStorage.removeItem("nftmarketplace:token");
    localStorage.removeItem("nftmarketplace:session");
    localStorage.removeItem("nftmarketplace:db");
  });
  await page.reload();
}

// Clica no label da edição (o input é sr-only; o usuário clica no rótulo).
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
    await expect(page.getByText("Token #0042")).toBeVisible();
  });

  test("selecting an edition updates the displayed price", async ({ page }) => {
    await page.goto("/nft/nft-002");
    await expect(
      page.getByRole("heading", { name: /violet nomad #002/i }),
    ).toBeVisible();

    // A edição padrão do nft-002 é 1/1 (0.05 ETH).
    await expect(page.getByText(/preço atual · edição 1\/1/i)).toBeVisible();

    // Seleciona a edição ABERTA clicando no rótulo visível.
    await selectEdition(page, /^aberta/i);
    await expect(page.getByText(/preço atual · edição aberta/i)).toBeVisible();
  });

  test("quantity stepper clamps to availability", async ({ page }) => {
    await page.goto("/nft/nft-003");
    await expect(
      page.getByRole("heading", { name: /ivory baron #003/i }),
    ).toBeVisible();

    // getByLabel("Quantidade") casaria também com os botões −/+; usamos o spinbutton exato.
    const input = page.getByRole("spinbutton", {
      name: "Quantidade",
      exact: true,
    });
    await input.fill("9999");
    await input.blur();
    // A edição 1/1 do nft-003 tem available=1; o input deve ficar em 1.
    await expect(input).toHaveValue("1");
  });

  test("sold out product shows disabled buy button", async ({ page }) => {
    // nft-001: index 0 → a única edição (1/1) está esgotada.
    // O detalhe cai no fallback (editions[0]) e o botão vira "Esgotado".
    await page.goto("/nft/nft-001");
    await expect(
      page.getByRole("heading", { name: /emerald ape #001/i }),
    ).toBeVisible();

    // A edição 1/1 aparece no seletor, mas está desabilitada.
    const soldOut = page.locator("label", { hasText: /^1\/1/i }).first();
    await expect(soldOut).toHaveAttribute("aria-disabled", "true");
    await expect(
      soldOut.getByRole("radio", { name: /edição 1\/1/i }),
    ).toBeDisabled();

    // Não existe botão "Comprar" habilitado — o texto é "Esgotado".
    await expect(page.getByRole("button", { name: /^comprar$/i })).toHaveCount(
      0,
    );
    await expect(
      page.getByRole("button", { name: /^esgotado$/i }),
    ).toBeDisabled();
  });

  test("buy while logged out opens login modal with cart redirect", async ({
    page,
  }) => {
    await page.goto("/nft/nft-002");
    const buy = page.getByRole("button", { name: /^comprar$/i });
    // Evita flake de hit-test no mobile (imagem grande cobre o botão no instante do clique).
    await buy.focus();
    await buy.press("Enter");
    await expect(page.getByRole("dialog")).toBeVisible();

    // Após login, deve ir para /cart.
    const dialog = page.getByRole("dialog");
    await dialog
      .getByRole("textbox", { name: "E-mail", exact: true })
      .fill(MARIA.email);
    const password = dialog.getByRole("textbox", {
      name: "Senha",
      exact: true,
    });
    await password.fill(MARIA.password);
    await password.press("Enter");

    await expect(page).toHaveURL(/\/cart/);
  });
});
