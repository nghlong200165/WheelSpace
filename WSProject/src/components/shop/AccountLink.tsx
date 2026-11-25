import Link from "next/link";
import { getCurrentCustomer } from "@/server/auth/customer-session";
import { UserIcon } from "./icons";

// Reads the session cookie, so it renders behind a Suspense boundary in the header.
export async function AccountLink() {
  const user = await getCurrentCustomer();
  if (!user) {
    return (
      <Link href="/login" className="flex items-center gap-2 p-3 text-[13px] sm:px-0 sm:py-3">
        <UserIcon />
        <span className="sr-only sm:not-sr-only">Đăng nhập</span>
      </Link>
    );
  }
  const firstName = user.name.trim().split(/\s+/).pop() ?? user.name;
  return (
    <Link href="/account" className="flex items-center gap-2 p-3 text-[13px] sm:px-0 sm:py-3" aria-label={`Tài khoản của ${user.name}`}>
      <UserIcon />
      <span className="sr-only sm:not-sr-only sm:max-w-24 sm:truncate">{firstName}</span>
    </Link>
  );
}

export function AccountLinkFallback() {
  return (
    <Link href="/account" className="flex items-center gap-2 p-3 text-[13px] sm:px-0 sm:py-3">
      <UserIcon />
      <span className="sr-only sm:not-sr-only">Tài khoản</span>
    </Link>
  );
}
