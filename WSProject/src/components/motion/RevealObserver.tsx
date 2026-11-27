"use client";

import { useEffect } from "react";

// Fades in every [data-reveal] element the first time it scrolls into view. Stagger with
// style={{ "--i": n }}. The hidden start state is CSS (globals.css, under html.reveal-ready, so
// content stays visible without JavaScript); the fade itself uses element.animate() rather than a
// class, because elements can come into view before React has hydrated them, and changing their
// className would cause a hydration mismatch.
export function RevealObserver() {
  useEffect(() => {
    const root = document.documentElement;
    if (!("IntersectionObserver" in window)) return;
    root.classList.add("reveal-ready");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const seen = new WeakSet<Element>();

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target;
          io.unobserve(el);
          const index = Number(getComputedStyle(el).getPropertyValue("--i")) || 0;
          el.animate(
            [
              { opacity: 0, transform: "translateY(32px)" },
              { opacity: 1, transform: "none" },
            ],
            {
              duration: reduce ? 0 : 1000,
              delay: reduce ? 0 : index * 90,
              easing: "cubic-bezier(0.16, 1, 0.3, 1)",
              fill: "both",
            },
          );
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    const watch = () =>
      document.querySelectorAll("[data-reveal]").forEach((el) => {
        if (seen.has(el)) return;
        seen.add(el);
        io.observe(el);
      });
    watch();
    const mo = new MutationObserver(watch);
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
      root.classList.remove("reveal-ready");
    };
  }, []);
  return null;
}
