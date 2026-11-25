import Link from "next/link";
import { Suspense } from "react";
import { AccountLink, AccountLinkFallback } from "./AccountLink";
import { BagIcon, SearchIcon } from "./icons";

export function SiteHeader() {
  return (
    <header className="border-b border-line">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-10 gap-y-4 px-4 py-5 sm:px-8">
        <Link href="/" className="text-[15px] font-semibold tracking-brand">
          WHEELSPACE
        </Link>
        <nav aria-label="Điều hướng chính" className="order-3 flex w-full flex-wrap gap-x-5 gap-y-2 text-xs tracking-eyebrow sm:gap-x-8 sm:order-none sm:w-auto">
          <Link href="/products" className="py-2">
            SẢN PHẨM
          </Link>
          <Link href="/products?rarity=rare" className="py-2">
            CHASE &amp; LIMITED
          </Link>
          <Link href="/order-lookup" className="py-2">
            TRA CỨU ĐƠN
          </Link>
        </nav>
        <div className="flex items-center sm:gap-4">
          <Link href="/products" aria-label="Tìm kiếm" className="flex p-3">
            <SearchIcon />
          </Link>
          <Suspense fallback={<AccountLinkFallback />}>
            <AccountLink />
          </Suspense>
          <Link href="/cart" className="flex items-center gap-2 p-3 text-[13px] sm:px-0 sm:py-3">
            <BagIcon />
            <span className="sr-only sm:not-sr-only">Giỏ hàng</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
