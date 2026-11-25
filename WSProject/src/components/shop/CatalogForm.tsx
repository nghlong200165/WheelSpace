"use client";

import Form from "next/form";
import { createContext, useContext, useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";

// true while the visitor has changed filters that are not applied yet.
const DirtyContext = createContext(false);

// GET form around the whole catalog (client-side navigation to /products?...).
// Filters apply only when the visitor presses "Tìm kiếm" (or Enter in the search box);
// the sort select applies at once. The scroll position is kept, so nothing jumps.
// Page is never part of the form, so any change goes back to page 1.
export function CatalogForm({ children }: { children: ReactNode }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [dirty, setDirty] = useState(false);

  function onChange(e: ChangeEvent<HTMLFormElement>) {
    if ((e.target as unknown as HTMLElement).tagName === "SELECT") formRef.current?.requestSubmit();
    else setDirty(true);
  }

  // Keep shared links short: empty fields and the default sort are left out of the URL
  // (disabled controls are not submitted; the form remounts after navigation anyway).
  function onSubmit(e: FormEvent<HTMLFormElement>) {
    const controls = Array.from(e.currentTarget.elements) as (HTMLInputElement | HTMLSelectElement)[];
    const skipped = controls.filter((el) => el.name && (el.value === "" || (el.name === "sort" && el.value === "newest")));
    skipped.forEach((el) => (el.disabled = true));
    setTimeout(() => skipped.forEach((el) => (el.disabled = false)));
  }

  return (
    <Form ref={formRef} action="/products" scroll={false} onChange={onChange} onSubmit={onSubmit} className="contents">
      <DirtyContext value={dirty}>{children}</DirtyContext>
    </Form>
  );
}

export function FilterSubmitButton() {
  const dirty = useContext(DirtyContext);
  return (
    <button
      type="submit"
      className={`min-h-12 cursor-pointer text-[13px] tracking-[0.12em] transition-colors ${
        dirty ? "bg-ink text-white" : "border border-ink bg-surface text-ink"
      }`}
    >
      TÌM KIẾM
    </button>
  );
}

// Filters stay open on desktop; on phones they collapse behind a "Bộ lọc" button.
export function FilterPanel({ activeCount, children }: { activeCount: number; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex flex-col gap-4 lg:w-60 lg:shrink-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="catalog-filters"
        className="flex min-h-11 cursor-pointer items-center justify-between border border-line bg-surface px-4 text-[13px] tracking-[0.12em] lg:hidden"
      >
        BỘ LỌC{activeCount > 0 ? ` (${activeCount})` : ""}
        <span aria-hidden="true">{open ? "−" : "+"}</span>
      </button>
      <div id="catalog-filters" className={`${open ? "flex" : "hidden"} flex-col gap-9 lg:flex`}>
        {children}
      </div>
    </div>
  );
}
