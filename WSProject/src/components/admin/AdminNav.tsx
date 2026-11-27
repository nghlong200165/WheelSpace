import Link from "next/link";
import { Suspense } from "react";
import { Logo } from "@/components/ui/Logo";
import { logoutAction } from "@/server/actions/auth";
import { ActiveNavLinks, NavLinks } from "./AdminNavLinks";

export function AdminNav() {
  return (
    <nav
      aria-label="Menu quản trị"
      className="flex w-full flex-col gap-1 border-line bg-surface px-5 py-7 md:min-h-screen md:w-60 md:shrink-0 md:border-r"
    >
      <span className="px-3 pb-1 text-sm">
        <Logo size={20} />
      </span>
      <span className="px-3 pb-7 text-[11px] tracking-eyebrow text-muted">QUẢN TRỊ</span>
      <Suspense fallback={<NavLinks pathname={null} />}>
        <ActiveNavLinks />
      </Suspense>
      <span className="mx-3 my-5 h-px bg-line" />
      <Link href="/" className="px-3 py-3 text-[13px] text-muted">
        Xem cửa hàng ↗
      </Link>
      <form action={logoutAction}>
        <button type="submit" className="w-full cursor-pointer px-3 py-3 text-left text-[13px] text-muted hover:text-accent">
          Đăng xuất
        </button>
      </form>
    </nav>
  );
}
