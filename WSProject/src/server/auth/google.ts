import "server-only";
import { env } from "../env";
import type { GoogleConfig } from "../integrations/google/oauth";

export const OAUTH_STATE_COOKIE = "ws_oauth";
export const OAUTH_STATE_MAX_AGE_SECONDS = 10 * 60;

// null when GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET are not set (login button is then disabled).
export function googleConfig(): GoogleConfig | null {
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, APP_URL } = env();
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) return null;
  return {
    clientId: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    redirectUri: `${APP_URL.replace(/\/$/, "")}/auth/google/callback`,
  };
}

// Only redirect back to a path on this site (prevents open redirects via ?next=).
export function safeNextPath(next: string | null | undefined): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return "/account";
  if (next.startsWith("/admin") || next.startsWith("/auth") || next.startsWith("/login")) return "/account";
  return next;
}
