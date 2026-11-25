// Offline check of the Google OAuth exchange with a stubbed fetch (no network, no real Google app needed).
//   node --conditions=react-server --import tsx scripts/check-google-oauth.ts

import { buildAuthUrl, codeChallenge, exchangeCodeForProfile } from "@/server/integrations/google/oauth";

const config = { clientId: "client-id", clientSecret: "client-secret", redirectUri: "http://localhost:3000/auth/google/callback" };
let failures = 0;
function check(name: string, ok: boolean) {
  if (!ok) failures++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}`);
}

function stubGoogle(userinfo: object, tokenStatus = 200) {
  const calls: { url: string; body?: string; auth?: string }[] = [];
  globalThis.fetch = (async (input: string | URL, init?: RequestInit) => {
    const url = String(input);
    calls.push({ url, body: init?.body?.toString(), auth: (init?.headers as Record<string, string>)?.Authorization });
    if (url.includes("oauth2.googleapis.com/token")) {
      return new Response(JSON.stringify({ access_token: "at-123" }), { status: tokenStatus });
    }
    return new Response(JSON.stringify(userinfo), { status: 200 });
  }) as typeof fetch;
  return calls;
}

// Auth URL
const url = new URL(buildAuthUrl(config, "state-1", "verifier-1"));
check("auth URL has PKCE S256 challenge", url.searchParams.get("code_challenge") === codeChallenge("verifier-1") && url.searchParams.get("code_challenge_method") === "S256");
check("auth URL has state + redirect_uri + scopes", url.searchParams.get("state") === "state-1" && url.searchParams.get("redirect_uri") === config.redirectUri && url.searchParams.get("scope") === "openid email profile");

async function main() {
  // Successful exchange
  const calls = stubGoogle({ sub: "g-1", email: "khach@gmail.com", email_verified: true, name: "Nguyễn Văn A", picture: "https://lh3.googleusercontent.com/a/x" });
  const profile = await exchangeCodeForProfile(config, "code-1", "verifier-1");
  check("profile mapped", profile.sub === "g-1" && profile.email === "khach@gmail.com" && profile.name === "Nguyễn Văn A");
  check("token request sends code_verifier + secret", !!calls[0].body?.includes("code_verifier=verifier-1") && !!calls[0].body?.includes("client_secret=client-secret"));
  check("userinfo called with bearer token", calls[1].auth === "Bearer at-123");

  // Unverified email
  stubGoogle({ sub: "g-2", email: "x@example.com", email_verified: false });
  check("unverified email rejected", await exchangeCodeForProfile(config, "c", "v").then(() => false, () => true));

  // Token endpoint error
  stubGoogle({}, 400);
  check("token error rejected", await exchangeCodeForProfile(config, "c", "v").then(() => false, () => true));

  // Name fallback
  stubGoogle({ sub: "g-3", email: "noname@gmail.com", email_verified: true });
  check("missing name falls back to email prefix", (await exchangeCodeForProfile(config, "c", "v")).name === "noname");

  console.log(failures ? `\n${failures} failed` : "\nall passed");
  process.exitCode = failures ? 1 : 0;
}

main();
