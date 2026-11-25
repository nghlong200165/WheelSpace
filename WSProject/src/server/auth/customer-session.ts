import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { sessionSecret } from "../env";
import { getUserById } from "../services/users";
import { CUSTOMER_COOKIE, CUSTOMER_MAX_AGE_SECONDS, createCustomerToken, verifyCustomerToken } from "./token";
import type { UserDTO } from "@/lib/schemas/user";

export function customerCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: CUSTOMER_MAX_AGE_SECONDS,
  };
}

export function createCustomerSessionValue(user: Pick<UserDTO, "id" | "sessionVersion">): string {
  return createCustomerToken(user.id, user.sessionVersion, sessionSecret());
}

// For Server Actions (route handlers set the cookie on their own response).
export async function startCustomerSession(user: Pick<UserDTO, "id" | "sessionVersion">): Promise<void> {
  (await cookies()).set(CUSTOMER_COOKIE, createCustomerSessionValue(user), customerCookieOptions());
}

export async function endCustomerSession(): Promise<void> {
  (await cookies()).delete(CUSTOMER_COOKIE);
}

// The logged-in customer, or null for guests and for sessions invalidated by a password change.
export async function getCurrentCustomer(): Promise<UserDTO | null> {
  const token = (await cookies()).get(CUSTOMER_COOKIE)?.value;
  // Token expiry is checked against the current time, so this must run at request time only.
  await connection();
  const session = token ? verifyCustomerToken(token, sessionSecret()) : null;
  if (!session) return null;
  const user = await getUserById(session.uid);
  return user && user.sessionVersion === session.sv ? user : null;
}

export async function getCustomerId(): Promise<string | null> {
  return (await getCurrentCustomer())?.id ?? null;
}

// For pages that need an account (e.g. /account); guests are sent to /login.
export async function requireCustomer(next: string): Promise<UserDTO> {
  const user = await getCurrentCustomer();
  if (!user) redirect(`/login?next=${encodeURIComponent(next)}`);
  return user;
}
