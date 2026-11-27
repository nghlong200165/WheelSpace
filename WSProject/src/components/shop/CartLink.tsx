"use client";

import Link from "next/link";
import { useCartCount } from "@/lib/cart";
import { BagIcon } from "./icons";

// Header cart link with the number of items (read from the browser-side cart).
export function CartLink() {
  const count = useCartCount();
  return (
    <Link
      href="/cart"
      data-cart-target
      aria-label={count > 0 ? `Giỏ hàng, ${count} sản phẩm` : "Giỏ hàng"}
      className="relative flex items-center gap-2 p-3 text-[13px] sm:px-0 sm:py-3"
    >
      <BagIcon />
      <span className="sr-only sm:not-sr-only">Giỏ hàng</span>
      {count > 0 && (
        // Keyed by the count so each change replays the bump.
        <span
          key={count}
          aria-hidden="true"
          className="animate-[bump_0.5s_cubic-bezier(0.34,1.56,0.64,1)] absolute top-1 left-6 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-accent px-1 text-[10px] leading-none font-medium text-white sm:static sm:h-5 sm:min-w-5"
        >
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
