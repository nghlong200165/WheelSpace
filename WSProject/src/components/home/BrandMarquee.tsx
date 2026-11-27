"use client";

import Link from "next/link";
import { useRef } from "react";

// Endless band of brand names; each one opens the catalogue filtered by that brand. Slows down
// under the pointer so a name can be clicked.
export function BrandMarquee({ brands }: { brands: string[] }) {
  const track = useRef<HTMLDivElement>(null);
  const setRate = (rate: number) => track.current?.getAnimations().forEach((a) => a.updatePlaybackRate(rate));

  const items = (copy: number) =>
    brands.map((brand) => (
      <Link
        key={`${copy}-${brand}`}
        href={`/products?brand=${encodeURIComponent(brand)}`}
        tabIndex={copy === 0 ? undefined : -1}
        aria-hidden={copy === 0 ? undefined : true}
        className="flex items-center gap-11 pr-11 text-[clamp(22px,3vw,40px)] font-extralight tracking-[0.08em] whitespace-nowrap transition-colors after:size-1.75 after:rounded-full after:bg-accent"
      >
        {brand.toUpperCase()}
      </Link>
    ));

  return (
    <nav
      aria-label="Hãng xe"
      className="overflow-hidden border-y border-line py-6 [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]"
    >
      <div
        ref={track}
        onMouseEnter={() => setRate(0.2)}
        onMouseLeave={() => setRate(1)}
        className="flex w-max animate-[marquee_40s_linear_infinite]"
      >
        {items(0)}
        {items(1)}
      </div>
    </nav>
  );
}
