import { test, expect, type Page } from "@playwright/test";

const MARIA = { email: "maria@nftmail.com", password: "password123" };

type LoginResponse = {
  token: string;
  session: { user: { id: string; username: string } };
};
type QuoteResponse = { issuedAt: string; totalEth: string };
type OrderResponse = {
  id: string;
  status: "pending" | "confirmed" | "declined";
  settleStatus: "confirmed" | "declined" | null;
  totalEth: string;
};

async function resetAndLogin(page: Page): Promise<string> {
  await page.goto("/?reset=1");
  await page.waitForFunction(() =>
    Boolean((window as unknown as { __msw?: unknown }).__msw),
  );

  const token = await page.evaluate(async (creds) => {
    const r = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(creds),
    });
    if (r.status !== 200) throw new Error(`login failed: ${r.status}`);
    const body = (await r.json()) as LoginResponse;
    localStorage.setItem("nftmarketplace:token", body.token);
    return body.token;
  }, MARIA);

  expect(token).toMatch(/^tok_/);
  return token;
}

async function addToCartAndQuote(page: Page, token: string) {
  const added = await page.evaluate(
    async ({ nftId, token }) => {
      const r = await fetch("/api/cart/items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nftId, quantity: 1 }),
      });
      return r.status;
    },
    { nftId: "nft-003", token },
  );
  expect(added).toBe(200);

  const quote = await page.evaluate(async (token) => {
    const r = await fetch("/api/quote", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({}),
    });
    return { status: r.status, body: (await r.json()) as QuoteResponse };
  }, token);
  expect(quote.status).toBe(200);
  return quote.body;
}

test.describe("Order idempotency", () => {
  test("same idempotency key + same content returns the same order", async ({
    page,
  }) => {
    const token = await resetAndLogin(page);
    const quote = await addToCartAndQuote(page, token);

    const payload = {
      quoteIssuedAt: quote.issuedAt,
      walletId: "wallet-maria-eth",
      network: "ethereum",
      idempotencyKey: "e2e-same-key",
    };

    const first = await page.evaluate(
      async ({ body, token }) => {
        const r = await fetch("/api/orders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        });
        return { status: r.status, body: (await r.json()) as OrderResponse };
      },
      { body: payload, token },
    );
    expect(first.status).toBe(201);

    const second = await page.evaluate(
      async ({ body, token }) => {
        const r = await fetch("/api/orders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        });
        return { status: r.status, body: (await r.json()) as OrderResponse };
      },
      { body: payload, token },
    );

    expect([200, 201]).toContain(second.status);
    expect(second.body.id).toBe(first.body.id);
  });

  test("same key with different content returns IDEMPOTENCY_CONFLICT", async ({
    page,
  }) => {
    const token = await resetAndLogin(page);
    const quote = await addToCartAndQuote(page, token);

    const first = await page.evaluate(
      async ({ body, token }) => {
        const r = await fetch("/api/orders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        });
        return r.status;
      },
      {
        body: {
          quoteIssuedAt: quote.issuedAt,
          walletId: "wallet-maria-eth",
          network: "ethereum",
          idempotencyKey: "e2e-conflict-key",
        },
        token,
      },
    );
    expect(first).toBe(201);

    const conflicting = await page.evaluate(
      async ({ body, token }) => {
        const r = await fetch("/api/orders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        });
        return { status: r.status, body: (await r.json()) as { code: string } };
      },
      {
        body: {
          quoteIssuedAt: quote.issuedAt,
          walletId: "wallet-maria-polygon",
          network: "polygon",
          idempotencyKey: "e2e-conflict-key",
        },
        token,
      },
    );

    expect(conflicting.status).toBe(409);
    expect(conflicting.body.code).toBe("IDEMPOTENCY_CONFLICT");
  });

  test("resend after settle returns the same order without duplicating", async ({
    page,
  }) => {
    const token = await resetAndLogin(page);
    const quote = await addToCartAndQuote(page, token);

    const payload = {
      quoteIssuedAt: quote.issuedAt,
      walletId: "wallet-maria-eth",
      network: "ethereum",
      idempotencyKey: "e2e-settle-key",
    };

    const created = await page.evaluate(
      async ({ body, token }) => {
        const r = await fetch("/api/orders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        });
        return (await r.json()) as OrderResponse;
      },
      { body: payload, token },
    );

    expect(created.status).toBe("pending");

    await page.waitForTimeout(4_000);

    const settled = await page.evaluate(
      async ({ id, token }) => {
        const r = await fetch(`/api/orders/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        return (await r.json()) as OrderResponse;
      },
      { id: created.id, token },
    );
    expect(["confirmed", "declined"]).toContain(settled.status);

    const resent = await page.evaluate(
      async ({ body, token }) => {
        const r = await fetch("/api/orders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        });
        return (await r.json()) as OrderResponse;
      },
      { body: payload, token },
    );

    expect(resent.id).toBe(created.id);
    expect(["confirmed", "declined"]).toContain(resent.status);
  });
});
