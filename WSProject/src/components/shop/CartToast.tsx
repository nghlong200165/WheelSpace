"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CART_ADDED_EVENT, type CartAddedDetail } from "@/lib/fly-to-cart";

// Bottom toast after a quick add: slides up, stays 2.6s, slides away.
export function CartToast() {
  const [toast, setToast] = useState<(CartAddedDetail & { id: number }) | null>(null);

  useEffect(() => {
    const onAdded = (e: Event) => setToast({ ...(e as CustomEvent<CartAddedDetail>).detail, id: Date.now() });
    window.addEventListener(CART_ADDED_EVENT, onAdded);
    return () => window.removeEventListener(CART_ADDED_EVENT, onAdded);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(timer);
  }, [toast]);

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 bg-ink px-5 py-3.5 text-[13px] text-white shadow-[0_12px_32px_rgba(0,0,0,0.25)] transition-[translate,opacity] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        toast ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-[calc(100%+2rem)] opacity-0"
      }`}
    >
      {toast && (
        <>
          <span className={`size-2 shrink-0 rounded-full ${toast.ok ? "bg-[#3ccf6e]" : "bg-[#f5b942]"}`} />
          <span>{toast.message}</span>
          <Link href="/cart" className="ml-2 text-white underline hover:text-white">
            Xem giỏ
          </Link>
        </>
      )}
    </div>
  );
}
