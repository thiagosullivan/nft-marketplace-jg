import { test, expect } from "@playwright/test";
import { login, resetAppState, MARIA } from "./helpers/login";

async function waitForSocket(page: import("@playwright/test").Page) {
  await page.waitForFunction(
    () => document.body.dataset.socketConnected === "true",
    { timeout: 10_000 },
  );
}

test.describe("Realtime — checkout bloqueia cotação antiga", () => {
  test.beforeEach(async ({ page }) => {
    await resetAppState(page);
    await login(page, MARIA.email);
    await waitForSocket(page);
  });

  test("preço muda via socket durante o checkout e exige nova confirmação", async ({
    page,
  }) => {
    await page.goto("/nft/nft-002");
    const buy = page.getByRole("button", { name: /^comprar$/i });
    await buy.focus();
    await buy.press("Enter");
    await expect(page).toHaveURL(/\/cart/);

    const finalize = page.getByRole("button", { name: /^finalizar$/i });
    await expect(finalize).toBeVisible({ timeout: 10_000 });
    await finalize.focus();
    await finalize.press("Enter");
    await expect(page).toHaveURL(/\/checkout/);
    await waitForSocket(page);

    await expect(
      page
        .getByText(/0\.05 ETH/)
        .filter({ visible: true })
        .first(),
    ).toBeVisible({ timeout: 10_000 });
    await page.waitForTimeout(500);

    // Clica em "Confirmar compra" (abre o modal de carteira).
    const confirm = page.getByRole("button", { name: /confirmar compra/i });
    await confirm.focus();
    await confirm.press("Enter");
    await expect(page.getByRole("dialog")).toBeVisible();

    // Emite o nft.updated DEPOIS do clique (o modal está aberto, o
    // confirmOrder ainda não rodou — ele roda no "Conectar").
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

    // Conecta a carteira (o confirmOrder roda, revalidate detecta).
    const connect = page.getByRole("button", { name: /^conectar$/i });
    await connect.focus();
    await connect.press("Enter");
    await expect(page.getByText(/estado: connected/i)).toBeVisible();

    // Confirma o pedido → revalidate roda e detecta a mudança.
    const confirmOrder = page.getByRole("button", {
      name: /confirmar pedido/i,
    });
    await confirmOrder.focus();
    await confirmOrder.press("Enter");

    await expect(
      page
        .locator("[data-sonner-toast]")
        .filter({ hasText: /total mudou|revise e confirme/i })
        .first(),
    ).toBeVisible({ timeout: 10_000 });
  });
});
