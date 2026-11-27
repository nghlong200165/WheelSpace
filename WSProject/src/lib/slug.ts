// URL slugs for search engines: "Nissan Skyline GT-R (R34)" + "MGT-01" -> "mini-gt-nissan-skyline-gt-r-r34-mgt-01".
// The product page finds the product from the code at the end, so renaming a product keeps old links working.

export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function productSlug(product: { name: string; code: string }): string {
  const name = slugify(product.name).replace(/^mini-gt(-|$)/, "");
  return ["mini-gt", name, slugify(product.code)].filter(Boolean).join("-");
}

export function productHref(product: { name: string; code: string }): string {
  return `/products/${productSlug(product)}`;
}
