"use client";

import { useEffect, useState } from "react";

// Sticks to the top; once the page scrolls it gets a frosted background and a soft shadow. Its
// height never changes, or the content below would jump while scrolling.
export function StickyHeader({ children }: { children: React.ReactNode }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      data-scrolled={scrolled || undefined}
      className="group/header sticky top-0 z-40 border-b border-line bg-ground transition-[background-color,box-shadow] duration-500 data-scrolled:bg-ground/80 data-scrolled:shadow-[0_8px_24px_rgba(18,18,18,0.06)] data-scrolled:backdrop-blur-md data-scrolled:backdrop-saturate-150"
    >
      {children}
    </header>
  );
}
