"use client";

import Image from "next/image";
import { useRef, useState, type KeyboardEvent, type TouchEvent } from "react";

const SWIPE_PX = 40;

// Main photo + thumbnails. Arrow keys and swipe change the photo.
export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [index, setIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const count = images.length;

  if (count === 0) {
    return (
      <div data-gallery-main className="relative flex aspect-4/3 items-center justify-center bg-placeholder">
        <span className="text-xs tracking-eyebrow text-muted">CHƯA CÓ ẢNH</span>
      </div>
    );
  }

  const go = (delta: number) => setIndex((i) => (i + delta + count) % count);

  function onKeyDown(e: KeyboardEvent) {
    if (e.key === "ArrowLeft") go(-1);
    if (e.key === "ArrowRight") go(1);
  }

  function onTouchEnd(e: TouchEvent) {
    const start = touchStartX.current;
    touchStartX.current = null;
    if (start === null) return;
    const dx = e.changedTouches[0].clientX - start;
    if (Math.abs(dx) > SWIPE_PX) go(dx < 0 ? 1 : -1);
  }

  return (
    <div className="flex flex-col gap-3" aria-roledescription="carousel" aria-label={`Ảnh ${name}`}>
      <div
        data-gallery-main
        className="group/gallery relative aspect-4/3 overflow-hidden bg-placeholder outline-none focus-visible:ring-2 focus-visible:ring-ink"
        tabIndex={count > 1 ? 0 : -1}
        onKeyDown={onKeyDown}
        onTouchStart={(e) => (touchStartX.current = e.touches[0].clientX)}
        onTouchEnd={onTouchEnd}
      >
        {images.map((src, i) => (
          <Image
            key={src}
            src={src}
            alt={`${name} – ảnh ${i + 1}/${count}`}
            fill
            priority={i === 0}
            sizes="(min-width: 1024px) 640px, 100vw"
            aria-hidden={i !== index}
            className={`object-cover transition-opacity duration-300 motion-reduce:transition-none ${i === index ? "opacity-100" : "opacity-0"}`}
          />
        ))}
        {count > 1 && (
          <>
            <GalleryArrow side="left" onClick={() => go(-1)} />
            <GalleryArrow side="right" onClick={() => go(1)} />
            <span className="absolute right-3 bottom-3 bg-surface/90 px-2.5 py-1 text-[11px] tracking-wider">
              {index + 1} / {count}
            </span>
          </>
        )}
      </div>

      {count > 1 && (
        <ul className="grid grid-cols-5 gap-2 sm:gap-3">
          {images.map((src, i) => (
            <li key={src}>
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Xem ảnh ${i + 1}`}
                aria-current={i === index}
                className={`relative block aspect-square w-full cursor-pointer overflow-hidden bg-placeholder outline-offset-2 ${
                  i === index ? "outline outline-1 outline-ink" : "opacity-70 hover:opacity-100"
                }`}
              >
                <Image src={src} alt="" fill sizes="120px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <p className="sr-only" aria-live="polite">
        Ảnh {index + 1} / {count}
      </p>
    </div>
  );
}

function GalleryArrow({ side, onClick }: { side: "left" | "right"; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={side === "left" ? "Ảnh trước" : "Ảnh tiếp theo"}
      className={`absolute top-1/2 ${side === "left" ? "left-3" : "right-3"} flex size-11 -translate-y-1/2 cursor-pointer items-center justify-center bg-surface/85 hover:bg-surface sm:opacity-0 sm:group-hover/gallery:opacity-100 sm:focus-visible:opacity-100`}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d={side === "left" ? "m15 6-6 6 6 6" : "m9 6 6 6-6 6"} />
      </svg>
    </button>
  );
}
