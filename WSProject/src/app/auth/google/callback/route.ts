import { NextResponse, type NextRequest } from "next/server";
import { createCustomerSessionValue, customerCookieOptions } from "@/server/auth/customer-session";
import { OAUTH_STATE_COOKIE, googleConfig } from "@/server/auth/google";
import { CUSTOMER_COOKIE, verifyToken } from "@/server/auth/token";
import { sessionSecret } from "@/server/env";
import { exchangeCodeForProfile } from "@/server/integrations/google/oauth";
import { upsertGoogleUser } from "@/server/services/users";

type OAuthState = { state: string; verifier: string; next: string };

// Step 2: Google redirects back here with ?code&state.
export async function GET(request: NextRequest) {
  const fail = (reason: string) => {
    const res = NextResponse.redirect(new URL(`/login?error=${reason}`, request.url));
    res.cookies.delete({ name: OAUTH_STATE_COOKIE, path: "/auth/google" });
    return res;
  };

  const config = googleConfig();
  if (!config) return fail("not_configured");

  const params = request.nextUrl.searchParams;
  if (params.get("error")) return fail("cancelled");

  const cookie = request.cookies.get(OAUTH_STATE_COOKIE)?.value;
  const saved = cookie ? verifyToken<OAuthState>(cookie, sessionSecret()) : null;
  const code = params.get("code");
  if (!saved || !code || params.get("state") !== saved.state) return fail("expired");

  try {
    const profile = await exchangeCodeForProfile(config, code, saved.verifier);
    const user = await upsertGoogleUser(profile);
    const res = NextResponse.redirect(new URL(saved.next, request.url));
    res.cookies.delete({ name: OAUTH_STATE_COOKIE, path: "/auth/google" });
    res.cookies.set(CUSTOMER_COOKIE, createCustomerSessionValue(user), customerCookieOptions());
    return res;
  } catch (err) {
    console.error("Google login failed:", err);
    return fail("failed");
  }
}
