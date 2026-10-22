import { z } from "zod";

const envSchema = z.object({
  VITE_ENABLE_MOCKS: z
    .enum(["true", "false"])
    .default("true")
    .transform((v) => v === "true"),
  VITE_API_BASE_URL: z.string().default("/api"),
  VITE_SOCKET_URL: z.string().url().default("http://localhost:5173"),
});

const parsed = envSchema.safeParse(import.meta.env);

if (!parsed.success) {
  console.error(
    "Invalid environment variables:",
    parsed.error.flatten().fieldErrors,
  );
  throw new Error("Invalid environment variables. Check .env.local.");
}

export const env = parsed.data;
