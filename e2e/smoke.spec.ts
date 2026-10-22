import { expect, test } from "@playwright/test";

test.describe("smoke", () => {
  test("home loads with header and title", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: /descubra nfts/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /nft marketplace/i }),
    ).toBeVisible();
  });

  test("404 fallback for unknown route", async ({ page }) => {
    await page.goto("/rota-que-nao-existe");
    await expect(page.getByRole("heading", { name: "404" })).toBeVisible();
    await expect(page.getByText(/página não encontrada/i)).toBeVisible();
  });

  test("direct access and refresh work on nested route", async ({ page }) => {
    await page.goto("/nft/abc-123");
    await expect(
      page.getByRole("heading", { name: /detalhe do nft/i }),
    ).toBeVisible();
    await expect(page.getByText(/abc-123/)).toBeVisible();

    await page.reload();
    await expect(
      page.getByRole("heading", { name: /detalhe do nft/i }),
    ).toBeVisible();
  });
});
