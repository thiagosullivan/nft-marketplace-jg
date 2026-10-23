import { test, expect } from "@playwright/test";

const MARIA = { email: "maria@nftmail.com", password: "password123" };

type LoginResponse = { user: { id: string; username: string } };
type QuoteResponse = { issuedAt: string; totalEth: string };
type OrderResponse = {
  id: string;
  status: "pending" | "confirmed" | "declined";
  settleStatus: "confirmed" | "declined" | null;
  totalEth: string;
};

async function resetAndLogin(page: import("@playwright/test").Page) {
  await page.goto("/?reset=1");
  await page.waitForFunction(() =>
    Boolean((window as unknown as { __msw?: unknown }).__msw),
  );

  const login = await page.evaluate(async (creds) => {
    const r = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(creds),
    });
    return { status: r.status, body: (await r.json()) as LoginResponse };
  }, MARIA);
  expect(login.status).toBe(200);
  expect(login.body.user.username).toBe("maria");
}

async function addToCartAndQuote(page: import("@playwright/test").Page) {
  const added = await page.evaluate(async () => {
    const r = await fetch("/api/cart/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nftId: "nft-003", quantity: 1 }),
    });
    return r.status;
  });
  expect(added).toBe(200);

  const quote = await page.evaluate(async () => {
    const r = await fetch("/api/quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    return { status: r.status, body: (await r.json()) as QuoteResponse };
  });
  expect(quote.status).toBe(200);
  return quote.body;
}

test.describe("Order idempotency", () => {
  test("same idempotency key + same content returns the same order", async ({
    page,
  }) => {
    await resetAndLogin(page);
    const quote = await addToCartAndQuote(page);

    const payload = {
      quoteIssuedAt: quote.issuedAt,
      walletId: "wallet-maria-eth",
      network: "ethereum",
      idempotencyKey: "e2e-same-key",
    };

    const first = await page.evaluate(async (body) => {
      const r = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      return { status: r.status, body: (await r.json()) as OrderResponse };
    }, payload);
    expect(first.status).toBe(201);

    const second = await page.evaluate(async (body) => {
      const r = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      return { status: r.status, body: (await r.json()) as OrderResponse };
    }, payload);

    expect([200, 201]).toContain(second.status);
    expect(second.body.id).toBe(first.body.id);
  });

  test("same key with different content returns IDEMPOTENCY_CONFLICT", async ({
    page,
  }) => {
    await resetAndLogin(page);
    const quote = await addToCartAndQuote(page);

    const first = await page.evaluate(
      async (body) => {
        const r = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        return r.status;
      },
      {
        quoteIssuedAt: quote.issuedAt,
        walletId: "wallet-maria-eth",
        network: "ethereum",
        idempotencyKey: "e2e-conflict-key",
      },
    );
    expect(first).toBe(201);

    const conflicting = await page.evaluate(
      async (body) => {
        const r = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        return { status: r.status, body: (await r.json()) as { code: string } };
      },
      {
        quoteIssuedAt: quote.issuedAt,
        walletId: "wallet-maria-polygon",
        network: "polygon",
        idempotencyKey: "e2e-conflict-key",
      },
    );

    expect(conflicting.status).toBe(409);
    expect(conflicting.body.code).toBe("IDEMPOTENCY_CONFLICT");
  });

  test("resend after settle returns the same order without duplicating", async ({
    page,
  }) => {
    await resetAndLogin(page);
    const quote = await addToCartAndQuote(page);

    const payload = {
      quoteIssuedAt: quote.issuedAt,
      walletId: "wallet-maria-eth",
      network: "ethereum",
      idempotencyKey: "e2e-settle-key",
    };

    const created = await page.evaluate(async (body) => {
      const r = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      return (await r.json()) as OrderResponse;
    }, payload);

    expect(created.status).toBe("pending");

    await page.waitForTimeout(4_000);

    const settled = await page.evaluate(async (id) => {
      const r = await fetch(`/api/orders/${id}`);
      return (await r.json()) as OrderResponse;
    }, created.id);
    expect(["confirmed", "declined"]).toContain(settled.status);

    const resent = await page.evaluate(async (body) => {
      const r = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      return (await r.json()) as OrderResponse;
    }, payload);

    expect(resent.id).toBe(created.id);
    expect(["confirmed", "declined"]).toContain(resent.status);
  });
});
