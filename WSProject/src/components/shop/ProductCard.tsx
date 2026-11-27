import Image from "next/image";
import Link from "next/link";
import { formatVnd } from "@/lib/format";
import { productHref } from "@/lib/slug";
import { CONDITION_LABELS, type ProductDTO } from "@/lib/schemas/product";
import { ArrowRightIcon } from "./icons";
import { QuickAdd } from "./QuickAdd";
import { SpecPlate } from "./SpecPlate";

export function RarityBadge({ rarity }: { rarity: ProductDTO["rarity"] }) {
  if (rarity === "normal") return null;
  return (
    <span
      className={`px-2.5 py-1 text-[10px] tracking-eyebrow text-white ${rarity === "chase" ? "bg-accent" : "bg-ink"}`}
    >
      {rarity === "chase" ? "CHASE" : "LIMITED"}
    </span>
  );
}

// Hover lifts the card onto a white sheet with a soft shadow, zooms the picture, slides up a
// "XEM CHI TIẾT" bar and shows a quick-add button. The padding is cancelled by the negative margin
// (and fits inside the grid gap) so cards line up as if there were none.
// `index` staggers the scroll-in animation within a row.
export function ProductCard({ product, sizes, index = 0 }: { product: ProductDTO; sizes: string; index?: number }) {
  const cover = product.images[0];
  return (
    <div
      data-card
      data-reveal
      style={{ "--i": index % 4 } as React.CSSProperties}
      className="group/card relative -m-2 p-2 transition-[translate,background-color,box-shadow] duration-450 ease-[cubic-bezier(0.16,1,0.3,1)] hover:z-10 hover:-translate-y-1.5 hover:bg-surface hover:shadow-[0_22px_44px_rgba(18,18,18,0.10)] focus-within:bg-surface motion-reduce:hover:translate-y-0 sm:-m-3 sm:p-3"
    >
      <Link href={productHref(product)} className="flex flex-col gap-4">
        <div data-fly-source className="relative aspect-4/3 overflow-hidden bg-placeholder">
          {cover ? (
            <Image
              src={cover}
              alt={product.name}
              fill
              sizes={sizes}
              className="object-cover transition-transform duration-1100 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/card:scale-[1.07]"
            />
          ) : (
            <SpecPlate code={product.code} brand={product.brand} />
          )}
          <div className="absolute top-3 left-3">
            <RarityBadge rarity={product.rarity} />
          </div>
          {product.stock === 0 && (
            <span className="absolute right-3 bottom-3 bg-surface px-2.5 py-1 text-[10px] tracking-eyebrow text-ink">
              HẾT HÀNG
            </span>
          )}
          <span className="absolute inset-x-0 bottom-0 flex translate-y-full items-center justify-between bg-ink/85 py-3.5 pr-16 pl-4 text-[11px] tracking-eyebrow text-white backdrop-blur-sm transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/card:translate-y-0">
            XEM CHI TIẾT <ArrowRightIcon size={16} />
          </span>
        </div>
        {/* Explicit ink: the global red link hover would otherwise tint the text. */}
        <div className="flex flex-col gap-1.5 text-ink">
          <span className="text-[11px] tracking-[0.14em] text-muted">
            {product.code} · {CONDITION_LABELS[product.condition]}
          </span>
          <span className="text-[15px] leading-snug font-medium">{product.name}</span>
          <span className="text-sm tabular-nums">{formatVnd(product.price)}</span>
        </div>
      </Link>
      {product.stock > 0 && (
        // Outside the link (a button can't sit in an <a>), overlaid on the picture box.
        <div className="pointer-events-none absolute inset-x-2 top-2 aspect-4/3 sm:inset-x-3 sm:top-3">
          <QuickAdd productId={product.id} name={product.name} stock={product.stock} />
        </div>
      )}
    </div>
  );
}
