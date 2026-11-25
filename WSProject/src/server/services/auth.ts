import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";
import { env } from "../env";

// Hash both sides first so the comparison takes the same time whatever the input length.
function safeEqual(a: string, b: string): boolean {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

export function verifyAdminCredentials(email: string, password: string): boolean {
  const { ADMIN_EMAIL, ADMIN_PASSWORD } = env();
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    throw new Error("ADMIN_EMAIL / ADMIN_PASSWORD are not configured");
  }
  const emailOk = safeEqual(email.trim().toLowerCase(), ADMIN_EMAIL.toLowerCase());
  const passwordOk = safeEqual(password, ADMIN_PASSWORD);
  return emailOk && passwordOk;
}
