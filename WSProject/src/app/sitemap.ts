import type { MetadataRoute } from "next";
import { getSitemapProducts } from "@/server/queries/storefront";
import { SITE_URL } from "@/lib/site-url";

// /sitemap.xml: the pages search engines should index. Cached with the product tag, so it
// follows admin edits.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getSitemapProducts();
  return [
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/products`, changeFrequency: "daily", priority: 0.9 },
    ...products.map((p) => ({
      url: `${SITE_URL}/products/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
