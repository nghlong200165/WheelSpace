// Signed session tokens: "<base64url JSON payload>.<base64url HMAC-SHA256>".
// No "server-only" import: src/proxy.ts also uses this file, and the secret is always passed in.
import { createHmac, timingSafeEqual } from "node:crypto";

export const SESSION_COOKIE = "ws_admin_session";
export const CUSTOMER_COOKIE = "ws_session";
export const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;
export const CUSTOMER_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;

type BasePayload = { exp: number };

function sign(data: string, secret: string): string {
  return createHmac("sha256", secret).update(data).digest("base64url");
}

export function signToken<T extends object>(payload: T, maxAgeSeconds: number, secret: string, now = Date.now()): string {
  const full = { ...payload, exp: Math.floor(now / 1000) + maxAgeSeconds };
  const encoded = Buffer.from(JSON.stringify(full)).toString("base64url");
  return `${encoded}.${sign(encoded, secret)}`;
}

// Returns the payload when the signature is valid and the token has not expired.
export function verifyToken<T extends object>(token: string, secret: string, now = Date.now()): (T & BasePayload) | null {
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return null;

  const expected = Buffer.from(sign(encoded, secret));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;

  try {
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString()) as T & BasePayload;
    return typeof payload.exp === "number" && payload.exp * 1000 > now ? payload : null;
  } catch {
    return null;
  }
}

// Admin session
type AdminPayload = { sub: "admin" };

export function createSessionToken(secret: string, now = Date.now()): string {
  return signToken<AdminPayload>({ sub: "admin" }, SESSION_MAX_AGE_SECONDS, secret, now);
}

export function verifySessionToken(token: string, secret: string, now = Date.now()): boolean {
  return verifyToken<AdminPayload>(token, secret, now)?.sub === "admin";
}

// Customer session. sv = the user's sessionVersion when the token was issued; bumping it
// in the database (password change/reset) invalidates every older token.
type CustomerPayload = { kind: "customer"; uid: string; sv: number };

export function createCustomerToken(userId: string, sessionVersion: number, secret: string, now = Date.now()): string {
  return signToken<CustomerPayload>({ kind: "customer", uid: userId, sv: sessionVersion }, CUSTOMER_MAX_AGE_SECONDS, secret, now);
}

export function verifyCustomerToken(token: string, secret: string, now = Date.now()): { uid: string; sv: number } | null {
  const payload = verifyToken<CustomerPayload>(token, secret, now);
  return payload?.kind === "customer" && typeof payload.uid === "string" && typeof payload.sv === "number"
    ? { uid: payload.uid, sv: payload.sv }
    : null;
}
