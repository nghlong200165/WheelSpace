import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { CACHE_TAGS } from "../cache-tags";
import {
  countProductsByBrand,
  getVisibleProduct,
  listBannerProducts,
  listNewArrivals,
  listProductsForStore,
  listRelatedProducts,
  listRareProducts,
} from "../services/products";
import { CATALOG_PAGE_SIZE, type CatalogFilter } from "@/lib/schemas/catalog";
import type { ProductDTO } from "@/lib/schemas/product";
import { getSettings } from "../services/settings";

// Cached storefront reads (Next-specific layer on top of the framework-agnostic services).
// Admin Server Actions call updateTag() with the same tags, so edits show up immediately.

export async function getNewArrivals(limit = 4) {
  "use cache";
  cacheTag(CACHE_TAGS.products);
  cacheLife("hours");
  return listNewArrivals(limit);
}

export async function getBannerProducts(limit = 6) {
  "use cache";
  cacheTag(CACHE_TAGS.products);
  cacheLife("hours");
  return listBannerProducts(limit);
}

export async function getRareProducts(limit = 3) {
  "use cache";
  cacheTag(CACHE_TAGS.products);
  cacheLife("hours");
  return listRareProducts(limit);
}

// One cache entry per normalized filter (the filter object is the cache key).
export async function getCatalog(filter: CatalogFilter) {
  "use cache";
  cacheTag(CACHE_TAGS.products);
  cacheLife("hours");
  return listProductsForStore(filter, CATALOG_PAGE_SIZE);
}

export async function getBrandCounts(filter: CatalogFilter) {
  "use cache";
  cacheTag(CACHE_TAGS.products);
  cacheLife("hours");
  return countProductsByBrand(filter);
}

export async function getProduct(id: string) {
  "use cache";
  cacheTag(CACHE_TAGS.products);
  cacheLife("hours");
  return getVisibleProduct(id);
}

export async function getRelatedProducts(product: Pick<ProductDTO, "id" | "brand" | "rarity">, limit = 4) {
  "use cache";
  cacheTag(CACHE_TAGS.products);
  cacheLife("hours");
  return listRelatedProducts(product, limit);
}

export async function getStoreSettings() {
  "use cache";
  cacheTag(CACHE_TAGS.settings);
  cacheLife("hours");
  return getSettings();
}
