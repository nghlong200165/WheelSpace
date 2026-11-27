"use client";

import { addToCart } from "@/lib/cart";
import { announceCart, flyToCart } from "@/lib/fly-to-cart";

// Round "+" on a product card: adds one to the cart and flies the card picture into the header.
export function QuickAdd({ productId, name, stock }: { productId: string; name: string; stock: number }) {
  function add(e: React.MouseEvent<HTMLButtonElement>) {
    const added = addToCart(productId, 1, stock);
    if (added === 0) {
      announceCart({ message: `Giỏ đã có đủ ${stock} chiếc ${name} còn lại.`, ok: false });
      return;
    }
    const source = e.currentTarget.closest("[data-card]")?.querySelector("[data-fly-source]") ?? null;
    flyToCart(source, { message: `Đã thêm ${name} vào giỏ.`, ok: true });
  }

  return (
    <button
      type="button"
      onClick={add}
      aria-label={`Thêm nhanh ${name} vào giỏ`}
      className="pointer-events-auto absolute right-3 bottom-3 grid size-10 cursor-pointer place-items-center rounded-full bg-surface text-ink opacity-0 shadow-[0_6px_16px_rgba(0,0,0,0.18)] transition-[opacity,scale,background-color,color] duration-450 ease-[cubic-bezier(0.34,1.56,0.64,1)] scale-60 group-hover/card:scale-100 group-hover/card:opacity-100 hover:bg-accent hover:text-white focus-visible:scale-100 focus-visible:opacity-100 pointer-coarse:scale-100 pointer-coarse:opacity-100"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    </button>
  );
}
