import { NextResponse, type NextRequest } from "next/server";
import { OAUTH_STATE_COOKIE, OAUTH_STATE_MAX_AGE_SECONDS, googleConfig, safeNextPath } from "@/server/auth/google";
import { signToken } from "@/server/auth/token";
import { sessionSecret } from "@/server/env";
import { buildAuthUrl, randomToken } from "@/server/integrations/google/oauth";

// Step 1: send the visitor to Google, remembering state + PKCE verifier in a short-lived signed cookie.
export async function GET(request: NextRequest) {
  const config = googleConfig();
  if (!config) return NextResponse.redirect(new URL("/login?error=not_configured", request.url));

  const state = randomToken();
  const verifier = randomToken(48);
  const next = safeNextPath(request.nextUrl.searchParams.get("next"));

  const response = NextResponse.redirect(buildAuthUrl(config, state, verifier));
  response.cookies.set(OAUTH_STATE_COOKIE, signToken({ state, verifier, next }, OAUTH_STATE_MAX_AGE_SECONDS, sessionSecret()), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/auth/google",
    maxAge: OAUTH_STATE_MAX_AGE_SECONDS,
  });
  return response;
}
