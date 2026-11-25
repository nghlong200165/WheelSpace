import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { CatalogForm, FilterPanel, FilterSubmitButton } from "@/components/shop/CatalogForm";
import { Pagination } from "@/components/shop/Pagination";
import { ProductCard } from "@/components/shop/ProductCard";
import { ChatIcon, SearchIcon } from "@/components/shop/icons";
import { getBrands, getCatalog, getStoreSettings } from "@/server/queries/storefront";
import {
  CATALOG_PAGE_SIZE,
  SORTS,
  SORT_LABELS,
  STOCK_FILTERS,
  STOCK_LABELS,
  activeFilterCount,
  catalogHref,
  parseCatalogParams,
  type CatalogFilter,
} from "@/lib/schemas/catalog";
import { CONDITIONS, CONDITION_LABELS, RARITIES, RARITY_LABELS } from "@/lib/schemas/product";

export const metadata: Metadata = {
  title: "Sản phẩm",
  description: "Mô hình Mini GT 1:64: hàng có sẵn, Chase, Limited, New / Lướt / Used. Ảnh chụp thật từng chiếc.",
};

export default function ProductsPage({ searchParams }: PageProps<"/products">) {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 pt-12 sm:px-8 sm:pt-14">
      {/* Filters live in the URL, which is only known at request time. */}
      <Suspense fallback={<CatalogSkeleton />}>
        <Catalog searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

function heading(f: CatalogFilter): { eyebrow: string; title: string } {
  const rareOnly = f.rarities.length === 2 && f.rarities.includes("chase") && f.rarities.includes("limited");
  if (f.q) return { eyebrow: "TÌM KIẾM", title: `Kết quả cho “${f.q}”` };
  if (f.brand) return { eyebrow: rareOnly ? "CHASE & LIMITED" : "HÃNG XE", title: f.brand };
  if (rareOnly) return { eyebrow: "PHIÊN BẢN ĐẶC BIỆT", title: "Chase & Limited" };
  return { eyebrow: "BỘ SƯU TẬP", title: "Tất cả sản phẩm" };
}

async function Catalog({ searchParams }: { searchParams: PageProps<"/products">["searchParams"] }) {
  const filter = parseCatalogParams(await searchParams);
  const [{ items, total, page, pageCount }, settings, brands] = await Promise.all([
    getCatalog(filter),
    getStoreSettings(),
    getBrands(),
  ]);
  const { eyebrow, title } = heading(filter);
  const activeCount = activeFilterCount(filter);
  const from = total === 0 ? 0 : (page - 1) * CATALOG_PAGE_SIZE + 1;
  const to = Math.min(page * CATALOG_PAGE_SIZE, total);

  return (
    <>
      <div className="flex flex-col gap-3">
        <span className="text-xs tracking-[0.2em] text-muted">{eyebrow}</span>
        <h1 className="text-[32px] leading-tight font-light tracking-tight sm:text-[40px]">{title}</h1>
      </div>

      {/* Keyed by the filter so the uncontrolled inputs reset when the URL changes
          without a full reload (e.g. "Xóa bộ lọc", back button). */}
      <CatalogForm key={catalogHref(filter, { page: 1 })}>
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-12">
          <FilterPanel activeCount={activeCount}>
            <div className="flex flex-col gap-2">
              <label htmlFor="q" className="text-[11px] tracking-eyebrow">
                TÌM KIẾM
              </label>
              <div className="flex border border-line bg-surface focus-within:border-ink">
                <input
                  id="q"
                  name="q"
                  type="search"
                  defaultValue={filter.q}
                  placeholder="Tên xe hoặc mã MGT"
                  className="h-11 min-w-0 flex-1 bg-transparent px-3.5 text-sm outline-none"
                />
                <button type="submit" aria-label="Tìm" className="flex w-11 cursor-pointer items-center justify-center">
                  <SearchIcon />
                </button>
              </div>
            </div>
            <CheckboxGroup legend="ĐỘ HIẾM" name="rarity" options={RARITIES.map((r) => [r, RARITY_LABELS[r]])} checked={filter.rarities} />
            <CheckboxGroup
              legend="TÌNH TRẠNG"
              name="condition"
              options={CONDITIONS.map((c) => [c, CONDITION_LABELS[c]])}
              checked={filter.conditions}
            />
            <CheckboxGroup legend="KHO HÀNG" name="stock" options={STOCK_FILTERS.map((s) => [s, STOCK_LABELS[s]])} checked={filter.stock} />
            <div className="flex flex-col gap-3">
              <FilterSubmitButton />
              {activeCount > 0 && (
                <Link href="/products" scroll={false} className="self-center py-2 text-[13px] underline">
                  Xóa bộ lọc
                </Link>
              )}
            </div>
          </FilterPanel>

          <div className="flex min-w-0 flex-1 flex-col gap-8">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-5">
              <span className="text-[13px] text-muted" aria-live="polite">
                {total === 0 ? "Không có sản phẩm" : `Hiển thị ${from}–${to} / ${total} sản phẩm`}
              </span>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
                <div className="flex items-center gap-3">
                  <label htmlFor="brand" className="text-[13px] text-muted">
                    Hãng xe
                  </label>
                  <select id="brand" name="brand" defaultValue={filter.brand} className="h-11 max-w-44 border border-line bg-surface px-3 text-sm">
                    <option value="">Tất cả hãng</option>
                    {brands.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                    {/* Keep a brand from an old link selectable even if it has no visible products now. */}
                    {filter.brand && !brands.includes(filter.brand) && <option value={filter.brand}>{filter.brand}</option>}
                  </select>
                </div>
                <div className="flex items-center gap-3">
                  <label htmlFor="sort" className="text-[13px] text-muted">
                    Sắp xếp
                  </label>
                  <select id="sort" name="sort" defaultValue={filter.sort} className="h-11 border border-line bg-surface px-3 text-sm">
                    {SORTS.map((s) => (
                      <option key={s} value={s}>
                        {SORT_LABELS[s]}
                      </option>
                    ))}
                  </select>
                </div>
                <noscript>
                  <button type="submit" className="h-11 border border-ink px-4 text-[13px]">
                    Áp dụng
                  </button>
                </noscript>
              </div>
            </div>

            {items.length > 0 ? (
              <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 xl:grid-cols-3">
                {items.map((p) => (
                  <ProductCard key={p.id} product={p} sizes="(min-width: 1280px) 300px, (min-width: 1024px) 30vw, 50vw" />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-start gap-4 bg-surface px-7 py-12">
                <p className="text-[15px]">Không tìm thấy mẫu phù hợp.</p>
                <p className="text-sm leading-relaxed text-muted">
                  Thử bỏ bớt bộ lọc, hoặc nhắn tin để chúng tôi kiểm tra nguồn hàng và nhận order mẫu bạn cần.
                </p>
                <div className="flex flex-wrap gap-3">
                  {activeCount > 0 && (
                    <Link href="/products" className="border border-ink px-5 py-3 text-[13px] tracking-[0.12em]">
                      XÓA BỘ LỌC
                    </Link>
                  )}
                  {settings.messengerUrl && (
                    <a
                      href={settings.messengerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-ink px-5 py-3 text-[13px] tracking-[0.12em] text-white hover:text-white"
                    >
                      <ChatIcon size={16} /> NHẮN TIN ĐỂ ORDER
                    </a>
                  )}
                </div>
              </div>
            )}

            <Pagination page={page} pageCount={pageCount} href={(p) => catalogHref(filter, { page: p })} />
          </div>
        </div>
      </CatalogForm>
    </>
  );
}

function CheckboxGroup({
  legend,
  name,
  options,
  checked,
}: {
  legend: string;
  name: string;
  options: [string, string][];
  checked: readonly string[];
}) {
  return (
    <fieldset className="flex flex-col gap-1">
      <legend className="pb-3 text-[11px] tracking-eyebrow">{legend}</legend>
      {options.map(([value, label]) => (
        <label key={value} className="flex min-h-9 cursor-pointer items-center gap-3 text-sm">
          <input type="checkbox" name={name} value={value} defaultChecked={checked.includes(value)} className="size-4.5 accent-ink" />
          {label}
        </label>
      ))}
    </fieldset>
  );
}

function CatalogSkeleton() {
  return (
    <div className="flex flex-col gap-10" aria-hidden="true">
      <div className="h-12 w-64 bg-placeholder" />
      <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 xl:grid-cols-3 lg:ml-72">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="flex flex-col gap-4">
            <div className="aspect-4/3 bg-placeholder" />
            <div className="h-4 w-2/3 bg-placeholder" />
          </div>
        ))}
      </div>
    </div>
  );
}
