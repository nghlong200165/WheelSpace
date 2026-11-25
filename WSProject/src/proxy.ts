import { NextResponse, type NextRequest } from "next/server";
import { CUSTOMER_COOKIE, SESSION_COOKIE, verifyCustomerToken, verifySessionToken } from "@/server/auth/token";

// Optimistic guard: sends visitors without a valid session cookie to the right login page
// with a real 307, before any HTML streams. Pages and Server Actions still check the session themselves.
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const secret = process.env.SESSION_SECRET;

  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") return NextResponse.next();
    const token = request.cookies.get(SESSION_COOKIE)?.value;
    if (token && secret && verifySessionToken(token, secret)) return NextResponse.next();
    return redirectToLogin(request, "/admin/login", pathname + search);
  }

  // /account
  const token = request.cookies.get(CUSTOMER_COOKIE)?.value;
  if (token && secret && verifyCustomerToken(token, secret)) return NextResponse.next();
  return redirectToLogin(request, "/login", pathname + search);
}

function redirectToLogin(request: NextRequest, loginPath: string, next: string) {
  const url = new URL(loginPath, request.url);
  url.searchParams.set("next", next);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/admin/:path*", "/account/:path*"],
};
