import { test, expect, type Page } from "@playwright/test";

const MARIA = { email: "maria@nftmail.com", password: "password123" };
const FERNANDO = { email: "fernando@nftmail.com", password: "password123" };

async function reset(page: Page) {
  await page.goto("/?reset=1");
  await page.waitForFunction(() =>
    Boolean((window as unknown as { __msw?: unknown }).__msw),
  );
}

async function openLoginModal(page: Page) {
  await page
    .getByRole("navigation")
    .getByRole("button", { name: "Entrar" })
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
}

async function fillLogin(
  page: Page,
  creds: { email: string; password: string },
) {
  const dialog = page.getByRole("dialog");
  await dialog
    .getByRole("textbox", { name: "E-mail", exact: true })
    .fill(creds.email);
  await dialog
    .getByRole("textbox", { name: "Senha", exact: true })
    .fill(creds.password);
  await dialog.getByRole("button", { name: "Entrar", exact: true }).click();
}

async function expectLoggedIn(page: Page) {
  await expect(
    page.getByRole("navigation").getByRole("button", { name: "Sair" }),
  ).toBeVisible();
}

async function expectLoggedOut(page: Page) {
  await expect(
    page.getByRole("navigation").getByRole("button", { name: "Entrar" }),
  ).toBeVisible();
}

test.describe("Auth", () => {
  test.beforeEach(async ({ page }) => {
    await reset(page);
    await page.evaluate(() => {
      localStorage.removeItem("nftmarketplace:token");
      localStorage.removeItem("nftmarketplace:session");
    });
    await page.reload();
  });

  test("login via modal updates header and persists after refresh", async ({
    page,
  }) => {
    await page.goto("/");
    await openLoginModal(page);
    await fillLogin(page, MARIA);

    await expect(page.getByRole("dialog")).toBeHidden();
    await expectLoggedIn(page);

    await page.reload();
    await expectLoggedIn(page);
  });

  test("logout clears session and header", async ({ page }) => {
    await page.goto("/");
    await openLoginModal(page);
    await fillLogin(page, MARIA);
    await expectLoggedIn(page);

    await page
      .getByRole("navigation")
      .getByRole("button", { name: "Sair" })
      .click();
    await expectLoggedOut(page);

    const token = await page.evaluate(() =>
      localStorage.getItem("nftmarketplace:token"),
    );
    expect(token).toBeNull();
  });

  test("redirect preserves context through login", async ({ page }) => {
    await page.goto("/checkout");
    await expect(page.getByRole("dialog")).toBeVisible();
    await fillLogin(page, MARIA);
    await expect(page.getByRole("dialog")).toBeHidden();
    await expect(page).toHaveURL(/\/checkout/);
  });

  test("switching users does not leak private data", async ({ page }) => {
    await page.goto("/");
    await openLoginModal(page);
    await fillLogin(page, MARIA);
    await expectLoggedIn(page);

    await page.evaluate(async () => {
      const token = localStorage.getItem("nftmarketplace:token");
      await fetch("/api/favorites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nftId: "nft-001" }),
      });
    });

    await page
      .getByRole("navigation")
      .getByRole("button", { name: "Sair" })
      .click();
    await openLoginModal(page);
    await fillLogin(page, FERNANDO);
    await expectLoggedIn(page);

    const favs = await page.evaluate(async () => {
      const token = localStorage.getItem("nftmarketplace:token");
      const r = await fetch("/api/favorites", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return r.json();
    });
    expect(favs.items).toHaveLength(0);
  });

  test("expired token opens login modal on protected route", async ({
    page,
  }) => {
    await page.evaluate(() => {
      localStorage.setItem("nftmarketplace:token", "tok_invalido_xyz");
      localStorage.setItem(
        "nftmarketplace:session",
        JSON.stringify({
          user: {
            id: "user-maria",
            username: "maria",
            displayName: "Maria",
            email: "x",
            ensName: null,
            avatarUrl: null,
            createdAt: new Date().toISOString(),
          },
          expiresAt: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
        }),
      );
    });
    await page.goto("/profile");

    await expect(page.getByRole("dialog")).toBeVisible();
  });
});
