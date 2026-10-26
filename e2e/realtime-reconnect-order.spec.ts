import { test, expect } from "@playwright/test";
import { login, resetAppState, MARIA } from "./helpers/login";

async function waitForSocket(page: import("@playwright/test").Page) {
  await page.waitForFunction(
    () => document.body.dataset.socketConnected === "true",
    { timeout: 10_000 },
  );
}

test.describe("Realtime — desconexão durante pedido pendente", () => {
  test.beforeEach(async ({ page }) => {
    await resetAppState(page);
    await login(page, MARIA.email);
    await waitForSocket(page);
  });

  test("pedido pendente sobrevive à desconexão e reconecta sem duplicar", async ({
    page,
  }) => {
    await page.goto("/order/order-seed-pending");
    await expect(
      page.getByRole("heading", { name: "Pedido pendente" }),
    ).toBeVisible();

    await page.evaluate(async () => {
      await fetch("/api/dev/disconnect-socket", { method: "POST" });
    });

    await waitForSocket(page);

    await expect(
      page.getByRole("heading", { name: "Pedido pendente" }),
    ).toBeVisible();

    await page.evaluate(async () => {
      await fetch("/api/dev/emit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "order.updated",
          payload: { orderId: "order-seed-pending", settleStatus: "confirmed" },
        }),
      });
    });

    await expect(
      page.getByRole("heading", {
        name: "Seus NFTs agora estão na sua carteira",
      }),
    ).toBeVisible({ timeout: 5_000 });
  });
});
