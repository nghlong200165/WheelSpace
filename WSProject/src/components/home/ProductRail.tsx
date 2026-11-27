"use client";

import { useRef } from "react";
import { ArrowLeftIcon, ArrowRightIcon } from "@/components/shop/icons";

// Horizontal, snap-scrolling row of cards with arrow buttons; a mouse can also drag it.
export function ProductRail({ title, eyebrow, children }: { title: React.ReactNode; eyebrow: string; children: React.ReactNode }) {
  const rail = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; left: number; moved: boolean } | null>(null);

  const scroll = (dir: number) => rail.current?.scrollBy({ left: dir * rail.current.clientWidth * 0.8, behavior: "smooth" });

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 pt-28 sm:px-8">
      <div className="flex items-end justify-between gap-6">
        <div data-reveal className="flex flex-col gap-3">
          <span className="text-[13px] tracking-[0.14em] text-accent tabular-nums">{eyebrow}</span>
          <h2 className="text-[clamp(32px,4.4vw,56px)] leading-[1.05] font-extralight tracking-tight">{title}</h2>
        </div>
        <div data-reveal style={{ "--i": 1 } as React.CSSProperties} className="flex gap-2.5">
          {[-1, 1].map((dir) => (
            <button
              key={dir}
              type="button"
              onClick={() => scroll(dir)}
              aria-label={dir < 0 ? "Xem mẫu trước" : "Xem mẫu sau"}
              className="grid size-12 cursor-pointer place-items-center rounded-full border border-line transition-[background-color,color,border-color,scale] duration-300 hover:border-ink hover:bg-ink hover:text-white active:scale-90"
            >
              {dir < 0 ? <ArrowLeftIcon /> : <ArrowRightIcon />}
            </button>
          ))}
        </div>
      </div>
      <div
        ref={rail}
        onPointerDown={(e) => {
          if (e.pointerType !== "mouse") return;
          drag.current = { x: e.clientX, left: rail.current!.scrollLeft, moved: false };
        }}
        onPointerMove={(e) => {
          const d = drag.current;
          if (!d) return;
          const dx = e.clientX - d.x;
          if (Math.abs(dx) > 5 && !d.moved) {
            d.moved = true;
            rail.current!.dataset.dragging = "";
          }
          if (d.moved) rail.current!.scrollLeft = d.left - dx;
        }}
        onPointerUp={() => {
          drag.current = null;
          // Let the click that ends a drag fire first, so it can be swallowed below.
          setTimeout(() => delete rail.current?.dataset.dragging, 0);
        }}
        onPointerLeave={() => {
          drag.current = null;
          delete rail.current?.dataset.dragging;
        }}
        onClickCapture={(e) => {
          if (rail.current?.dataset.dragging !== undefined) e.preventDefault();
        }}
        className="-mx-4 flex cursor-grab snap-x snap-mandatory gap-6 overflow-x-auto px-4 pt-3 pb-10 [scrollbar-width:none] data-dragging:cursor-grabbing data-dragging:snap-none sm:-mx-8 sm:px-8 [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>
    </section>
  );
}

export function RailItem({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-[min(78vw,340px)] shrink-0 snap-start">
      {children}
    </div>
  );
}
