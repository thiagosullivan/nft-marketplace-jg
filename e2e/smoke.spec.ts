import { expect, test } from "@playwright/test";

test.describe("smoke", () => {
  test("home loads with header and catalog", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("link", { name: "Kurio", exact: true }).first(),
    ).toBeVisible();
    await expect(page.getByTestId("header-login-button")).toBeVisible();
    await expect(
      page.getByRole("link", { name: /ver emerald ape #001/i }),
    ).toBeVisible();
  });

  test("404 fallback for unknown route", async ({ page }) => {
    await page.goto("/rota-que-nao-existe");
    await expect(page.getByRole("heading", { name: "404" })).toBeVisible();
    await expect(page.getByText(/página não encontrada/i)).toBeVisible();
  });

  test("direct access and refresh work on nested route", async ({ page }) => {
    await page.goto("/nft/nft-001");
    await expect(
      page.getByRole("heading", { name: /emerald ape #001/i }),
    ).toBeVisible();

    await page.reload();
    await expect(
      page.getByRole("heading", { name: /emerald ape #001/i }),
    ).toBeVisible();
  });

  test("unknown NFT shows friendly not-found state", async ({ page }) => {
    await page.goto("/nft/abc-123");
    await expect(
      page.getByRole("heading", { name: /nft não encontrado/i }),
    ).toBeVisible();
    await expect(page.getByText(/abc-123/)).toBeVisible();
  });
});
