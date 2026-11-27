"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { MiniCar } from "./MiniCar";

const SHOW_AFTER_MS = 120; // fast (prefetched) navigations never show the bar
const GIVE_UP_MS = 10000; // a click that never changes the URL must not leave it running

// Thin red line along the top with a 1:64 car on its tip, shown while a navigation is pending.
// The App Router has no "navigation started" event, so this listens for internal link clicks and
// GET form submits, and treats a change of pathname or query as "done". Render inside <Suspense>
// (it reads the search params).
export function RouteProgress() {
  const pathname = usePathname();
  const search = useSearchParams().toString();
  const bar = useRef<HTMLDivElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const pending = useRef(false);

  useEffect(() => {
    const clear = () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
    const start = () => {
      clear();
      pending.current = true;
      timers.current.push(
        setTimeout(() => {
          if (!pending.current || !bar.current) return;
          bar.current.dataset.phase = "run";
          document.documentElement.dataset.navigating = "";
        }, SHOW_AFTER_MS),
        setTimeout(finish, GIVE_UP_MS),
      );
    };

    const onClick = (e: MouseEvent) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const link = (e.target as Element | null)?.closest("a");
      if (!link || (link.target && link.target !== "_self") || link.hasAttribute("download")) return;
      const url = new URL(link.href, location.href);
      if (url.origin !== location.origin) return;
      if (url.pathname === location.pathname && url.search === location.search) return;
      start();
    };
    const onSubmit = (e: SubmitEvent) => {
      // Only forms that navigate (next/form renders action="/products"). Server Action forms have no
      // path action and stay on the page, so they must not start the bar.
      const form = e.target as HTMLFormElement;
      if (form.method.toLowerCase() === "get" && form.getAttribute("action")?.startsWith("/")) start();
    };

    document.addEventListener("click", onClick, true);
    document.addEventListener("submit", onSubmit, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("submit", onSubmit, true);
      clear();
    };
  }, []);

  function finish() {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    pending.current = false;
    delete document.documentElement.dataset.navigating;
    const el = bar.current;
    if (!el || !el.dataset.phase || el.dataset.phase === "fade") return;
    el.dataset.phase = "done";
    timers.current.push(
      setTimeout(() => (el.dataset.phase = "fade"), 350),
      setTimeout(() => delete el.dataset.phase, 900),
    );
  }

  // The URL changed: the new page is on screen.
  useEffect(() => {
    if (pending.current) finish();
  }, [pathname, search]);

  return (
    <div
      ref={bar}
      aria-hidden="true"
      className="route-progress pointer-events-none fixed top-0 left-0 z-60 h-0.75 bg-[linear-gradient(90deg,transparent,var(--color-accent)_30%)]"
    >
      {/* Hangs just under the line: the line reads as the light trail behind the car. */}
      <MiniCar className="absolute top-0 -right-9 w-11 text-ink" />
    </div>
  );
}
