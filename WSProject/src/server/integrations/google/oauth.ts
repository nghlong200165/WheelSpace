import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { ServiceError } from "../../services/errors";

// Google OAuth 2.0 authorization code flow with PKCE.
// https://developers.google.com/identity/protocols/oauth2/web-server

const AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const USERINFO_URL = "https://openidconnect.googleapis.com/v1/userinfo";

export type GoogleConfig = { clientId: string; clientSecret: string; redirectUri: string };

export type GoogleProfile = {
  sub: string;
  email: string;
  name: string;
  picture: string | null;
};

export function randomToken(bytes = 32): string {
  return randomBytes(bytes).toString("base64url");
}

export function codeChallenge(verifier: string): string {
  return createHash("sha256").update(verifier).digest("base64url");
}

export function buildAuthUrl(config: GoogleConfig, state: string, verifier: string): string {
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: "code",
    scope: "openid email profile",
    state,
    code_challenge: codeChallenge(verifier),
    code_challenge_method: "S256",
    prompt: "select_account",
  });
  return `${AUTH_URL}?${params}`;
}

export async function exchangeCodeForProfile(config: GoogleConfig, code: string, verifier: string): Promise<GoogleProfile> {
  const tokenRes = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      redirect_uri: config.redirectUri,
      grant_type: "authorization_code",
      code,
      code_verifier: verifier,
    }),
  });
  if (!tokenRes.ok) throw new ServiceError("Google từ chối yêu cầu đăng nhập");
  const { access_token: accessToken } = (await tokenRes.json()) as { access_token?: string };
  if (!accessToken) throw new ServiceError("Google không trả về access token");

  // Read the profile straight from Google over TLS, so the ID token does not need local verification.
  const infoRes = await fetch(USERINFO_URL, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!infoRes.ok) throw new ServiceError("Không đọc được thông tin tài khoản Google");
  const info = (await infoRes.json()) as {
    sub?: string;
    email?: string;
    email_verified?: boolean;
    name?: string;
    picture?: string;
  };
  if (!info.sub || !info.email || info.email_verified !== true) {
    throw new ServiceError("Tài khoản Google chưa xác minh email");
  }
  return {
    sub: info.sub,
    email: info.email,
    name: info.name || info.email.split("@")[0],
    picture: info.picture ?? null,
  };
}
