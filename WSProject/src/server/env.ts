import "server-only";
import { z } from "zod";

const envSchema = z.object({
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
  ADMIN_EMAIL: z.email().optional(),
  ADMIN_PASSWORD: z.string().min(8).optional(),
  SESSION_SECRET: z.string().min(32).optional(),
  // Public base URL of the site, used to build the Google OAuth redirect URI.
  APP_URL: z.url().default("http://localhost:3000"),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  // Third-party providers (see src/server/integrations/README.md and docs/THIRD_PARTY_SERVICES.md).
  STORAGE_PROVIDER: z.enum(["local"]).default("local"),
  EMAIL_PROVIDER: z.enum(["console"]).default("console"),
  SMS_PROVIDER: z.enum(["console"]).default("console"),
  PAYMENT_PROVIDER: z.enum(["mock", "payos"]).default("mock"),
  PAYOS_CLIENT_ID: z.string().optional(),
  PAYOS_API_KEY: z.string().optional(),
  PAYOS_CHECKSUM_KEY: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

let cached: Env | undefined;

// Parsed lazily so `next build` does not fail when env vars are only present at runtime.
export function env(): Env {
  if (!cached) {
    const parsed = envSchema.safeParse(process.env);
    if (!parsed.success) {
      throw new Error(`Invalid environment variables:\n${z.prettifyError(parsed.error)}`);
    }
    cached = parsed.data;
  }
  return cached;
}

// Secret for signing session cookies; required by admin and customer login.
export function sessionSecret(): string {
  const secret = env().SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is not configured");
  return secret;
}
