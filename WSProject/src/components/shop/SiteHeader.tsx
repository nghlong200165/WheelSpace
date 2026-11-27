import Link from "next/link";
import { Suspense } from "react";
import { Logo } from "@/components/ui/Logo";
import { AccountLink, AccountLinkFallback } from "./AccountLink";
import { CartLink } from "./CartLink";
import { MainNav } from "./MainNav";
import { StickyHeader } from "./StickyHeader";
import { SearchIcon } from "./icons";

export function SiteHeader() {
  return (
    <StickyHeader>
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-10 gap-y-4 px-4 py-5 sm:px-8">
        <Link href="/" aria-label="WheelSpace, về trang chủ" className="group py-1 text-[15px]">
          <Logo />
        </Link>
        <MainNav />
        <div className="flex items-center sm:gap-4">
          <Link href="/products" aria-label="Tìm kiếm" className="flex p-3">
            <SearchIcon />
          </Link>
          <Suspense fallback={<AccountLinkFallback />}>
            <AccountLink />
          </Suspense>
          <CartLink />
        </div>
      </div>
    </StickyHeader>
  );
}
