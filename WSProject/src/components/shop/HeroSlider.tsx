"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore, type KeyboardEvent, type TouchEvent } from "react";

export type HeroSlide = { id: string; name: string; code: string; image: string };

const INTERVAL_MS = 5000;
const SWIPE_PX = 40;

function subscribeReducedMotion(onChange: () => void) {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)");
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => true, // server render: assume reduced motion so nothing auto-advances before hydration
  );
}

// Crossfading carousel of car photos. Every slide links to the product list.
// Auto-advances every 5s; pauses on hover, focus and touch; never auto-plays with reduced motion.
export function HeroSlider({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [touching, setTouching] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const reducedMotion = usePrefersReducedMotion();

  const count = slides.length;
  const playing = count > 1 && !reducedMotion && !hovered && !focused && !touching;

  // Restarts after every slide change, so manual navigation also resets the 5s timer.
  useEffect(() => {
    if (!playing) return;
    const timer = setTimeout(() => setIndex((i) => (i + 1) % count), INTERVAL_MS);
    return () => clearTimeout(timer);
  }, [playing, index, count]);

  const go = (delta: number) => setIndex((i) => (i + delta + count) % count);

  function onKeyDown(e: KeyboardEvent) {
    if (e.key === "ArrowLeft") go(-1);
    if (e.key === "ArrowRight") go(1);
  }

  function onTouchStart(e: TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
    setTouching(true);
  }

  function onTouchEnd(e: TouchEvent) {
    const start = touchStartX.current;
    touchStartX.current = null;
    setTouching(false);
    if (start === null) return;
    const dx = e.changedTouches[0].clientX - start;
    if (Math.abs(dx) > SWIPE_PX) go(dx < 0 ? 1 : -1);
  }

  const current = slides[index];

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Mẫu xe nổi bật"
      className="group/hero relative h-full w-full"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setFocused(false)}
      onKeyDown={onKeyDown}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <Link href="/products" className="absolute inset-0" aria-label={`${current.name}, xem bộ sưu tập`}>
        {slides.map((slide, i) => (
          <div
            key={slide.id}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} / ${count}`}
            aria-hidden={i !== index}
            className={`absolute inset-0 transition-opacity duration-700 ease-out motion-reduce:transition-none ${
              i === index ? "opacity-100" : "opacity-0"
            }`}
          >
            <Image
              src={slide.image}
              alt={slide.name}
              fill
              priority={i === 0}
              sizes="(min-width: 1280px) 700px, 100vw"
              className="object-cover"
            />
          </div>
        ))}
        {/* Soft gradient so the caption stays readable on light photos. */}
        <span className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-linear-to-t from-black/45 to-transparent" />
        <span className="absolute bottom-5 left-5 flex flex-col gap-1 text-white sm:bottom-6 sm:left-6">
          <span className="text-[11px] tracking-eyebrow text-white/80">{current.code}</span>
          <span className="text-sm font-medium sm:text-base">{current.name}</span>
        </span>
      </Link>

      {count > 1 && (
        <>
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Ảnh trước"
            className="absolute top-1/2 left-3 flex size-11 -translate-y-1/2 cursor-pointer items-center justify-center bg-surface/85 text-ink opacity-100 transition-opacity hover:bg-surface sm:opacity-0 sm:group-hover/hero:opacity-100 sm:focus-visible:opacity-100"
          >
            <Chevron direction="left" />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Ảnh tiếp theo"
            className="absolute top-1/2 right-3 flex size-11 -translate-y-1/2 cursor-pointer items-center justify-center bg-surface/85 text-ink opacity-100 transition-opacity hover:bg-surface sm:opacity-0 sm:group-hover/hero:opacity-100 sm:focus-visible:opacity-100"
          >
            <Chevron direction="right" />
          </button>
          <div className="absolute right-5 bottom-5 flex gap-1 sm:right-6 sm:bottom-6">
            {slides.map((slide, i) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Ảnh ${i + 1}: ${slide.name}`}
                aria-current={i === index}
                className="flex h-6 cursor-pointer items-center px-1"
              >
                <span className={`block h-0.5 transition-all ${i === index ? "w-6 bg-white" : "w-3 bg-white/55"}`} />
              </button>
            ))}
          </div>
        </>
      )}

      {/* Announce slide changes only when the visitor is driving the slider. */}
      <p className="sr-only" aria-live={playing ? "off" : "polite"}>
        Ảnh {index + 1} / {count}: {current.name}
      </p>
    </section>
  );
}

function Chevron({ direction }: { direction: "left" | "right" }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={direction === "left" ? "m15 6-6 6 6 6" : "m9 6 6 6-6 6"} />
    </svg>
  );
}
