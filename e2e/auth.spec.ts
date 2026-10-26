import { test, expect, type Page } from "@playwright/test";

const MARIA = { email: "maria@nftmail.com", password: "password123" };
const FERNANDO = { email: "fernando@nftmail.com", password: "password123" };

function isMobile(page: Page) {
  return (page.viewportSize()?.width ?? 1440) < 768;
}

async function reset(page: Page) {
  await page.goto("/?reset=1");
  await page.waitForFunction(() =>
    Boolean((window as unknown as { __msw?: unknown }).__msw),
  );
}

async function openLoginModal(page: Page) {
  if (isMobile(page)) {
    await page.getByRole("button", { name: "Abrir menu" }).click();
    await page.getByTestId("header-login-button-mobile").click();
    await expect(page.getByRole("dialog", { name: "Menu" })).toBeHidden({
      timeout: 5_000,
    });
  } else {
    await page.getByTestId("header-login-button").click();
  }
  await expect(page.getByRole("dialog")).toBeVisible({ timeout: 5_000 });
}

async function fillLogin(
  page: Page,
  creds: { email: string; password: string },
) {
  const dialog = page.getByRole("dialog");
  // Um único input por campo agora (form unificado), então getByLabel funciona.
  const email = dialog.getByLabel("E-mail", { exact: true });
  const password = dialog.getByLabel("Senha", { exact: true });
  await email.fill(creds.email);
  await password.fill(creds.password);
  await password.press("Enter");
}

async function dismissToasts(page: Page) {
  const toasts = page.locator("[data-sonner-toast]");
  const count = await toasts.count();
  if (count === 0) return;
  for (let i = 0; i < count; i++) {
    const closeBtn = toasts
      .nth(0)
      .getByRole("button", { name: /close|fechar/i });
    if (await closeBtn.isVisible().catch(() => false)) {
      await closeBtn.click().catch(() => undefined);
    }
  }
  await expect(toasts).toHaveCount(0, { timeout: 8_000 });
}

async function expectLoggedIn(page: Page) {
  if (isMobile(page)) {
    // O toast "Bem-vindo(a) de volta!" (sonner) cobre o botão "Abrir menu"
    // no mobile. Dispensa antes de abrir o drawer.
    await dismissToasts(page);
    await page.getByRole("button", { name: "Abrir menu" }).click();
    await expect(
      page.getByRole("button", { name: "Sair", exact: true }),
    ).toBeVisible({ timeout: 10_000 });
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog", { name: "Menu" })).toBeHidden();
  } else {
    await expect(
      page.getByRole("button", { name: "Sair", exact: true }),
    ).toBeVisible({ timeout: 10_000 });
  }
}

async function expectLoggedOut(page: Page) {
  if (isMobile(page)) {
    await dismissToasts(page);
    await page.getByRole("button", { name: "Abrir menu" }).click();
    await expect(page.getByTestId("header-login-button-mobile")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog", { name: "Menu" })).toBeHidden();
  } else {
    await expect(page.getByTestId("header-login-button")).toBeVisible();
  }
}

async function logout(page: Page) {
  if (isMobile(page)) {
    await dismissToasts(page);
    await page.getByRole("button", { name: "Abrir menu" }).click();
    await page.getByRole("button", { name: "Sair", exact: true }).click();
  } else {
    await page.getByRole("button", { name: "Sair", exact: true }).click();
  }
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

    await expectLoggedIn(page);
    await expect(page.getByRole("dialog")).toBeHidden({ timeout: 10_000 });

    await page.reload();
    await expectLoggedIn(page);
  });

  test("logout clears session and header", async ({ page }) => {
    await page.goto("/");
    await openLoginModal(page);
    await fillLogin(page, MARIA);
    await expectLoggedIn(page);
    await dismissToasts(page);

    await logout(page);
    await expectLoggedOut(page);

    const token = await page.evaluate(() =>
      localStorage.getItem("nftmarketplace:token"),
    );
    expect(token).toBeNull();
  });

  test("redirect preserves context through login", async ({ page }) => {
    await page.goto("/checkout");
    await expect(page.getByRole("dialog")).toBeVisible({ timeout: 15_000 });
    await fillLogin(page, MARIA);
    await expect(page).toHaveURL(/\/checkout/, { timeout: 15_000 });
    await expect(page.getByRole("dialog")).toBeHidden({ timeout: 10_000 });
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

    await dismissToasts(page);
    await logout(page);
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
    // Sessão expirada: o token do usuário fica inválido durante a navegação.
    // O 401 dispara quando o useSession/useProfile refetcha (após o usuário
    // navegar para uma rota protegida), não no boot — assim o AuthModalProvider
    // já está montado e o listener `auth:unauthorized` está registrado.
    await page.goto("/");
    await openLoginModal(page);
    await fillLogin(page, MARIA);
    await expectLoggedIn(page);

    // Invalida o token mantendo a session (para o header continuar "logado"
    // até a próxima request falhar).
    await page.evaluate(() => {
      localStorage.setItem("nftmarketplace:token", "tok_invalido_xyz");
      localStorage.removeItem("nftmarketplace:session");
    });

    // Navega client-side (SEM page.goto — evita reiniciar o StrictMode e
    // perder o listener `auth:unauthorized` durante o boot). O Router escuta
    // `popstate` e navega para /profile; o useProfile/useSession dispara
    // GET, recebe 401, dispara `auth:unauthorized`.
    await page.evaluate(() => {
      window.history.pushState({}, "", "/profile");
      window.dispatchEvent(new PopStateEvent("popstate"));
    });

    // O 401 → `auth:unauthorized` → AuthModalProvider → open("login") → modal.
    await expect(page.getByRole("dialog")).toBeVisible({ timeout: 15_000 });
  });
});
