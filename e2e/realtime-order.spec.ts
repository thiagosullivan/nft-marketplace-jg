import { test, expect } from "@playwright/test";
import { login, resetAppState, MARIA } from "./helpers/login";

test.describe("Realtime — order.updated", () => {
  test.beforeEach(async ({ page }) => {
    await resetAppState(page);
    await login(page, MARIA.email);
  });

  test("pedido pendente vira confirmado via socket", async ({ page }) => {
    await page.goto("/order/order-seed-pending");

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

  test("pedido pendente vira recusado via socket", async ({ page }) => {
    await page.goto("/order/order-seed-pending");

    await expect(
      page.getByRole("heading", { name: "Pedido pendente" }),
    ).toBeVisible();

    await page.evaluate(async () => {
      await fetch("/api/dev/emit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "order.updated",
          payload: { orderId: "order-seed-pending", settleStatus: "declined" },
        }),
      });
    });

    await expect(
      page.getByRole("heading", { name: "Pagamento recusado" }),
    ).toBeVisible({ timeout: 5_000 });
  });
});
