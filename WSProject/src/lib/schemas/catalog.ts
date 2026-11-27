import { BRANDS, type Brand } from "../brands";
import { CONDITIONS, RARITIES, type Condition, type Rarity } from "./product";

// Storefront product list filters, read from / written to the URL (?q=&brand=&rarity=&condition=&stock=&sort=&page=).
// List filters (brand, rarity, condition, stock) can repeat: ?brand=Nissan&brand=Toyota.

export const CATALOG_PAGE_SIZE = 12;

export const SORTS = ["newest", "price_asc", "price_desc"] as const;
export type CatalogSort = (typeof SORTS)[number];

export const SORT_LABELS: Record<CatalogSort, string> = {
  newest: "Mới nhất",
  price_asc: "Giá thấp → cao",
  price_desc: "Giá cao → thấp",
};

export const STOCK_FILTERS = ["in", "out"] as const;
export type StockFilter = (typeof STOCK_FILTERS)[number];

export const STOCK_LABELS: Record<StockFilter, string> = {
  in: "Còn hàng",
  out: "Hết hàng (nhận order)",
};

export type CatalogFilter = {
  q: string;
  brands: Brand[];
  rarities: Rarity[];
  conditions: Condition[];
  stock: StockFilter[];
  sort: CatalogSort;
  page: number;
};

type RawParams = Record<string, string | string[] | undefined>;

function list(value: string | string[] | undefined): string[] {
  if (value === undefined) return [];
  return (Array.isArray(value) ? value : [value]).flatMap((v) => v.split(","));
}

function pickAll<T extends string>(values: string[], allowed: readonly T[]): T[] {
  return allowed.filter((a) => values.includes(a));
}

export function parseCatalogParams(params: RawParams): CatalogFilter {
  // "rare" is a shortcut used by the header / home links for Chase + Limited.
  const rarityValues = list(params.rarity).flatMap((v) => (v === "rare" ? ["chase", "limited"] : [v]));
  const page = Number(Array.isArray(params.page) ? params.page[0] : params.page);
  const sort = Array.isArray(params.sort) ? params.sort[0] : params.sort;
  const q = (Array.isArray(params.q) ? params.q[0] : params.q) ?? "";
  return {
    q: q.trim().slice(0, 80),
    brands: pickAll(list(params.brand), BRANDS),
    rarities: pickAll(rarityValues, RARITIES),
    conditions: pickAll(list(params.condition), CONDITIONS),
    stock: pickAll(list(params.stock), STOCK_FILTERS),
    sort: SORTS.includes(sort as CatalogSort) ? (sort as CatalogSort) : "newest",
    page: Number.isInteger(page) && page > 0 ? page : 1,
  };
}

// Canonical URL for a filter (defaults omitted), used for pagination and "remove filter" links.
export function catalogHref(filter: CatalogFilter, changes: Partial<CatalogFilter> = {}): string {
  const f = { ...filter, ...changes };
  const params = new URLSearchParams();
  if (f.q) params.set("q", f.q);
  f.brands.forEach((b) => params.append("brand", b));
  f.rarities.forEach((r) => params.append("rarity", r));
  f.conditions.forEach((c) => params.append("condition", c));
  f.stock.forEach((s) => params.append("stock", s));
  if (f.sort !== "newest") params.set("sort", f.sort);
  if (f.page > 1) params.set("page", String(f.page));
  const qs = params.toString();
  return qs ? `/products?${qs}` : "/products";
}

export function activeFilterCount(f: CatalogFilter): number {
  return (f.q ? 1 : 0) + f.brands.length + f.rarities.length + f.conditions.length + f.stock.length;
}
