"use client";

import { useEffect, useRef } from "react";

// Oversized outlined "MINI GT 1:64" that drifts sideways as the page scrolls.
export function GiantType() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const top = el.parentElement!.getBoundingClientRect().top;
      el.style.transform = `translate3d(${(top - window.innerHeight) * 0.35}px, 0, 0)`;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  const phrase = (
    <>
      MINI GT <b className="font-semibold text-ink [-webkit-text-stroke:0]">1:64</b> · DIECAST{" "}
      <span className="text-accent [-webkit-text-stroke:0]">●</span>{" "}
    </>
  );
  return (
    <div aria-hidden="true" className="overflow-hidden pt-28 pb-10 whitespace-nowrap select-none">
      <div
        ref={ref}
        className="text-[clamp(80px,16vw,240px)] leading-[0.9] font-extralight tracking-[-0.03em] text-transparent will-change-transform [-webkit-text-stroke:1px_#c9c5bc]"
      >
        {phrase}
        {phrase}
      </div>
    </div>
  );
}
