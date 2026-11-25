import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { buttonPrimary, buttonSecondary } from "@/components/ui/fields";
import { requireAdmin } from "@/server/auth/session";
import { getProductStats, listProductsForAdmin } from "@/server/services/products";
import { formatVnd } from "@/lib/format";
import {
  CONDITIONS,
  CONDITION_LABELS,
  RARITIES,
  RARITY_LABELS,
  type Condition,
  type Rarity,
} from "@/lib/schemas/product";

export const metadata: Metadata = { title: "Sản phẩm" };

const SAVED_MESSAGES: Record<string, string> = {
  created: "Đã thêm sản phẩm.",
  updated: "Đã lưu thay đổi.",
  deleted: "Đã xóa sản phẩm.",
};

function pick<T extends string>(value: unknown, allowed: readonly T[]): T | undefined {
  return allowed.includes(value as T) ? (value as T) : undefined;
}

const selectClass = "h-11 border border-line bg-surface px-3 text-sm";

export default async function AdminProductsPage({ searchParams }: PageProps<"/admin/products">) {
  await requireAdmin();
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.trim() : "";
  const rarity = pick<Rarity>(params.rarity, RARITIES);
  const condition = pick<Condition>(params.condition, CONDITIONS);
  const saved = typeof params.saved === "string" ? SAVED_MESSAGES[params.saved] : undefined;

  const [products, stats] = await Promise.all([
    listProductsForAdmin({ q, rarity, condition }),
    getProductStats(),
  ]);
  const filtered = !!(q || rarity || condition);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-[28px] font-normal">Sản phẩm</h1>
          <span className="text-[13px] text-muted">
            {stats.total} sản phẩm · {stats.outOfStock} hết hàng · {stats.hidden} đang ẩn
          </span>
        </div>
        <Link href="/admin/products/new" className={buttonPrimary}>
          + Thêm sản phẩm
        </Link>
      </div>

      {saved && (
        <p role="status" className="border border-success px-4 py-3 text-sm text-success">
          {saved}
        </p>
      )}

      <form className="flex flex-wrap gap-3" role="search">
        <label htmlFor="q" className="sr-only">
          Tìm sản phẩm
        </label>
        <input
          id="q"
          name="q"
          type="search"
          defaultValue={q}
          placeholder="Tìm theo tên hoặc mã"
          className="h-11 flex-[1_1_260px] border border-line bg-surface px-3.5 text-sm"
        />
        <label htmlFor="rarity" className="sr-only">
          Độ hiếm
        </label>
        <select id="rarity" name="rarity" defaultValue={rarity ?? ""} className={selectClass}>
          <option value="">Tất cả độ hiếm</option>
          {RARITIES.map((r) => (
            <option key={r} value={r}>
              {RARITY_LABELS[r]}
            </option>
          ))}
        </select>
        <label htmlFor="condition" className="sr-only">
          Tình trạng
        </label>
        <select id="condition" name="condition" defaultValue={condition ?? ""} className={selectClass}>
          <option value="">Tất cả tình trạng</option>
          {CONDITIONS.map((c) => (
            <option key={c} value={c}>
              {CONDITION_LABELS[c]}
            </option>
          ))}
        </select>
        <button type="submit" className={buttonSecondary}>
          Lọc
        </button>
        {filtered && (
          <Link href="/admin/products" className="self-center text-[13px] underline">
            Xóa bộ lọc
          </Link>
        )}
      </form>

      <div className="overflow-x-auto bg-surface">
        <table className="w-full min-w-215 border-collapse text-sm">
          <thead>
            <tr className="text-left text-[11px] tracking-[0.14em] text-muted">
              <th scope="col" className="border-b border-line px-5 py-4 font-medium">SẢN PHẨM</th>
              <th scope="col" className="border-b border-line px-3 py-4 font-medium">ĐỘ HIẾM</th>
              <th scope="col" className="border-b border-line px-3 py-4 font-medium">TÌNH TRẠNG</th>
              <th scope="col" className="border-b border-line px-3 py-4 text-right font-medium">GIÁ</th>
              <th scope="col" className="border-b border-line px-3 py-4 text-right font-medium">TỒN</th>
              <th scope="col" className="border-b border-line px-3 py-4 font-medium">HIỂN THỊ</th>
              <th scope="col" className="border-b border-line px-5 py-4">
                <span className="sr-only">Thao tác</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td className="border-b border-line-soft px-5 py-3.5">
                  <div className="flex items-center gap-3.5">
                    <div className="relative h-10.5 w-14 shrink-0 bg-placeholder">
                      {p.images[0] && <Image src={p.images[0]} alt="" fill sizes="56px" className="object-cover" />}
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium">{p.name}</span>
                      <span className="text-xs text-muted">{p.brand ? `${p.brand} · ${p.code}` : p.code}</span>
                    </div>
                  </div>
                </td>
                <td className="border-b border-line-soft px-3 py-3.5">{RARITY_LABELS[p.rarity]}</td>
                <td className="border-b border-line-soft px-3 py-3.5">{CONDITION_LABELS[p.condition]}</td>
                <td className="border-b border-line-soft px-3 py-3.5 text-right">{formatVnd(p.price)}</td>
                <td className={`border-b border-line-soft px-3 py-3.5 text-right ${p.stock === 0 ? "text-accent" : ""}`}>
                  {p.stock}
                </td>
                <td className="border-b border-line-soft px-3 py-3.5">{p.isVisible ? "Hiện" : "Ẩn"}</td>
                <td className="border-b border-line-soft px-5 py-3.5 text-right">
                  <Link href={`/admin/products/${p.id}`} className="text-[13px] underline">
                    Sửa
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && (
          <p className="px-5 py-10 text-center text-sm text-muted">
            {filtered ? "Không tìm thấy sản phẩm phù hợp." : "Chưa có sản phẩm nào."}
          </p>
        )}
      </div>
    </>
  );
}
