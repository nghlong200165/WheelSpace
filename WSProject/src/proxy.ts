import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/server/auth/token";

// Optimistic guard: sends visitors without a valid admin cookie to the login page.
// Pages and Server Actions still call requireAdmin() themselves.
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  if (pathname === "/admin/login") return NextResponse.next();

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const secret = process.env.SESSION_SECRET;
  if (token && secret && verifySessionToken(token, secret)) return NextResponse.next();

  const loginUrl = new URL("/admin/login", request.url);
  loginUrl.searchParams.set("next", pathname + search);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*"],
};
