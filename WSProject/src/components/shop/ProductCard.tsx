import Image from "next/image";
import Link from "next/link";
import { formatVnd } from "@/lib/format";
import { CONDITION_LABELS, type ProductDTO } from "@/lib/schemas/product";

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

export function ProductCard({ product, sizes }: { product: ProductDTO; sizes: string }) {
  const cover = product.images[0];
  return (
    // Hover lifts the card onto a white sheet with a soft shadow. The padding is cancelled by the
    // negative margin (and fits inside the grid gap) so cards line up as if there were none.
    <Link
      href={`/products/${product.id}`}
      className="relative -m-2 flex flex-col gap-4 p-2 transition-[translate,background-color,box-shadow] duration-300 ease-out hover:z-10 hover:-translate-y-1 hover:bg-surface hover:shadow-[0_14px_32px_rgba(18,18,18,0.10)] focus-visible:-translate-y-1 focus-visible:bg-surface focus-visible:shadow-[0_14px_32px_rgba(18,18,18,0.10)] motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:-m-3 sm:p-3"
    >
      <div className="relative aspect-4/3 overflow-hidden bg-placeholder">
        {cover ? (
          <Image src={cover} alt={product.name} fill sizes={sizes} className="object-cover" />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center text-[11px] tracking-eyebrow text-muted">
            CHƯA CÓ ẢNH
          </span>
        )}
        <div className="absolute top-3 left-3">
          <RarityBadge rarity={product.rarity} />
        </div>
        {product.stock === 0 && (
          <span className="absolute right-3 bottom-3 bg-surface px-2.5 py-1 text-[10px] tracking-eyebrow text-ink">
            HẾT HÀNG
          </span>
        )}
      </div>
      {/* Explicit ink: the global red link hover would otherwise tint the text. */}
      <div className="flex flex-col gap-1.5 text-ink">
        <span className="text-[11px] tracking-[0.14em] text-muted">
          {product.code} · {CONDITION_LABELS[product.condition]}
        </span>
        <span className="text-[15px] leading-snug font-medium">{product.name}</span>
        <span className="text-sm">{formatVnd(product.price)}</span>
      </div>
    </Link>
  );
}
