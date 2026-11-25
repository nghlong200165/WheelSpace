import "server-only";

// Tags for cached storefront reads; Server Actions call updateTag() with these after writes.
export const CACHE_TAGS = {
  products: "products",
  settings: "settings",
} as const;
