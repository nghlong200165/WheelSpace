// Signed admin session token: "<base64url payload>.<base64url HMAC-SHA256>".
// No "server-only" import: src/proxy.ts also uses this file, and the secret is always passed in.
import { createHmac, timingSafeEqual } from "node:crypto";

export const SESSION_COOKIE = "ws_admin_session";
export const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

type SessionPayload = { sub: "admin"; exp: number };

function sign(data: string, secret: string): string {
  return createHmac("sha256", secret).update(data).digest("base64url");
}

export function createSessionToken(secret: string, now = Date.now()): string {
  const payload: SessionPayload = { sub: "admin", exp: Math.floor(now / 1000) + SESSION_MAX_AGE_SECONDS };
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${encoded}.${sign(encoded, secret)}`;
}

export function verifySessionToken(token: string, secret: string, now = Date.now()): boolean {
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return false;

  const expected = Buffer.from(sign(encoded, secret));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return false;

  try {
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString()) as SessionPayload;
    return payload.sub === "admin" && payload.exp * 1000 > now;
  } catch {
    return false;
  }
}
