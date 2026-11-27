"use client";

import { useEffect } from "react";
import { HERO_SEEN_KEY } from "@/lib/hero-seen";

// Marks the hero entry as seen once it has played, so later visits in this session (full loads or
// client navigation back home) skip it.
export function HeroSeen() {
  useEffect(() => {
    try {
      sessionStorage.setItem(HERO_SEEN_KEY, "1");
    } catch {
      // Private mode: the entry just plays again next time.
    }
    const timer = setTimeout(() => document.documentElement.classList.add("hero-seen"), 1700);
    return () => clearTimeout(timer);
  }, []);
  return null;
}
