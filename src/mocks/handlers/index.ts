import { http, HttpResponse } from "msw";

export const handlers = [
  // health endpoint
  http.get("/api/health", () => {
    return HttpResponse.json({ ok: true, timestamp: new Date().toISOString() });
  }),
];
