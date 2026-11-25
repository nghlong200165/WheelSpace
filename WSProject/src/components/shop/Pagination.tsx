import Link from "next/link";

// 1 … 4 5 6 … 12 — always shows first, last and the neighbours of the current page.
function pageList(current: number, count: number): (number | "…")[] {
  const pages = new Set([1, count, current - 1, current, current + 1].filter((p) => p >= 1 && p <= count));
  const sorted = [...pages].sort((a, b) => a - b);
  return sorted.flatMap((p, i) => (i > 0 && p - sorted[i - 1] > 1 ? ["…" as const, p] : [p]));
}

const cell = "flex h-11 min-w-11 items-center justify-center px-2 text-sm";

export function Pagination({ page, pageCount, href }: { page: number; pageCount: number; href: (page: number) => string }) {
  if (pageCount <= 1) return null;
  return (
    <nav aria-label="Phân trang" className="flex items-center justify-center gap-1 pt-6">
      {page > 1 ? (
        <Link href={href(page - 1)} className={cell} aria-label="Trang trước">
          ←
        </Link>
      ) : (
        <span className={`${cell} text-line`} aria-hidden="true">
          ←
        </span>
      )}
      {pageList(page, pageCount).map((p, i) =>
        p === "…" ? (
          <span key={`gap-${i}`} className={`${cell} text-muted`}>
            …
          </span>
        ) : p === page ? (
          <span key={p} aria-current="page" className={`${cell} bg-ink text-white`}>
            {p}
          </span>
        ) : (
          <Link key={p} href={href(p)} className={cell}>
            {p}
          </Link>
        ),
      )}
      {page < pageCount ? (
        <Link href={href(page + 1)} className={cell} aria-label="Trang sau">
          →
        </Link>
      ) : (
        <span className={`${cell} text-line`} aria-hidden="true">
          →
        </span>
      )}
    </nav>
  );
}
