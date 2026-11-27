"use client";

import Link from "next/link";
import { useState } from "react";
import { BRANDS, type Brand } from "@/lib/brands";
import { catalogHref, type CatalogFilter } from "@/lib/schemas/catalog";

const chip = "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-4 text-[13px] transition-colors";

// Row of brand pills above the product grid. Several brands can be selected; each click
// applies at once. Brands with no matching products are tucked behind "+ N hãng khác".
export function BrandChips({ filter, counts }: { filter: CatalogFilter; counts: Record<string, number> }) {
  const [showAll, setShowAll] = useState(false);
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const selected = new Set<Brand>(filter.brands);

  const toggle = (brand: Brand) =>
    catalogHref(filter, {
      brands: selected.has(brand) ? filter.brands.filter((b) => b !== brand) : [...filter.brands, brand],
      page: 1,
    });

  const available = BRANDS.filter((b) => (counts[b] ?? 0) > 0 || selected.has(b));
  const empty = BRANDS.filter((b) => !available.includes(b));

  return (
    <nav aria-label="Lọc theo hãng xe" className="flex flex-col gap-3">
      <span className="text-[11px] tracking-eyebrow text-muted">HÃNG XE</span>
      <ul className="flex flex-wrap gap-2">
        <li>
          <Link
            href={catalogHref(filter, { brands: [], page: 1 })}
            scroll={false}
            aria-current={selected.size === 0 ? "true" : undefined}
            className={`${chip} ${selected.size === 0 ? "border-ink bg-ink text-white hover:text-white" : "border-line bg-surface hover:border-ink"}`}
          >
            Tất cả <Count n={total} />
          </Link>
        </li>
        {available.map((brand) => {
          const on = selected.has(brand);
          return (
            <li key={brand}>
              <Link
                href={toggle(brand)}
                scroll={false}
                aria-pressed={on}
                className={`${chip} ${on ? "border-ink bg-ink text-white hover:text-white" : "border-line bg-surface hover:border-ink"}`}
              >
                {brand} <Count n={counts[brand] ?? 0} />
                {on && (
                  <span aria-hidden="true" className="-mr-1 text-[15px] leading-none">
                    ×
                  </span>
                )}
              </Link>
            </li>
          );
        })}
        {showAll &&
          empty.map((brand) => (
            <li key={brand}>
              <span aria-disabled="true" title="Chưa có mẫu phù hợp" className={`${chip} cursor-default border-line-soft text-[#9a978f]`}>
                {brand} <Count n={0} />
              </span>
            </li>
          ))}
        {empty.length > 0 && (
          <li>
            <button
              type="button"
              onClick={() => setShowAll((v) => !v)}
              aria-expanded={showAll}
              className={`${chip} cursor-pointer border-dashed border-line text-muted hover:border-ink hover:text-ink`}
            >
              {showAll ? "Thu gọn" : `+ ${empty.length} hãng khác`}
            </button>
          </li>
        )}
      </ul>
    </nav>
  );
}

function Count({ n }: { n: number }) {
  return <span className="text-[11px] opacity-70">{n}</span>;
}
