import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { env } from "../env";
import { SESSION_COOKIE, SESSION_MAX_AGE_SECONDS, createSessionToken, verifySessionToken } from "./token";

function sessionSecret(): string {
  const secret = env().SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is not configured");
  return secret;
}

export async function startAdminSession(): Promise<void> {
  (await cookies()).set(SESSION_COOKIE, createSessionToken(sessionSecret()), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function endAdminSession(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
}

export async function isAdmin(): Promise<boolean> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  // Token expiry is checked against the current time, so this must run at request time only.
  await connection();
  return !!token && verifySessionToken(token, sessionSecret());
}

// Authoritative check for every admin page and Server Action (the proxy check is only optimistic).
export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) redirect("/admin/login");
}
