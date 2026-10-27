import { test, expect, type Page } from "@playwright/test";
import { isMobile, login, resetAppState, MARIA } from "./helpers/login";

async function waitForSocket(page: Page) {
  await page.waitForSelector('body[data-socket-connected="true"]', {
    state: "attached",
    timeout: 10_000,
  });
}

async function logout(page: Page) {
  if (isMobile(page)) {
    await page.getByRole("button", { name: "Abrir menu" }).click();
    await page.getByRole("button", { name: /sair/i }).click();
    await expect(page.getByRole("dialog", { name: "Menu" })).toBeHidden();
  } else {
    await page.getByRole("button", { name: /sair/i }).click();
  }
}

async function expectLoggedOut(page: Page) {
  if (isMobile(page)) {
    await page.getByRole("button", { name: "Abrir menu" }).click();
    await expect(page.getByTestId("header-login-button-mobile")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog", { name: "Menu" })).toBeHidden();
  } else {
    await expect(page.getByTestId("header-login-button")).toBeVisible();
  }
}

test.describe("Realtime — robustez", () => {
  test.beforeEach(async ({ page }) => {
    await resetAppState(page);
    await login(page, MARIA.email);
    await waitForSocket(page);
  });

  test("evento duplicado é ignorado (version <= última)", async ({ page }) => {
    await page.goto("/");
    await waitForSocket(page);

    const emit = async (priceEth: string) => {
      await page.evaluate(
        async (payload) => {
          await fetch("/api/dev/emit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ event: "nft.updated", payload }),
          });
        },
        { nftId: "nft-002", priceEth },
      );
    };

    await emit("9.99");
    const card = page
      .locator("div.max-w-\\[260px\\]")
      .filter({ hasText: "Violet Nomad #002" })
      .first();
    await expect(card.getByText("9.99 ETH")).toBeVisible({ timeout: 10_000 });

    await emit("8.88");
    await expect(card.getByText("8.88 ETH")).toBeVisible({ timeout: 5_000 });
  });

  test("reconexão reconcilia o estado via REST", async ({ page }) => {
    await page.goto("/");
    await waitForSocket(page);

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

    const card = page
      .locator("div.max-w-\\[260px\\]")
      .filter({ hasText: "Violet Nomad #002" })
      .first();
    await expect(card.getByText("9.99 ETH")).toBeVisible({ timeout: 5_000 });

    // Logout + login para forçar reconexão. Mobile precisa abrir o drawer
    // para acessar o botão "Sair" — daí o helper `logout`.
    await logout(page);
    await expectLoggedOut(page);
    await login(page, MARIA.email);
    await waitForSocket(page);

    await expect(card.getByText("9.99 ETH")).toBeVisible({ timeout: 5_000 });
  });
});
