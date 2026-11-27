import type { MetadataRoute } from "next";
import { connection } from "next/server";
import { getSitemapProducts } from "@/server/queries/storefront";
import { SITE_URL } from "@/lib/site-url";

// /sitemap.xml: the pages search engines should index. Cached with the product tag, so it
// follows admin edits.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Built on request, not at build time: the build machine (Vercel) can't count on reaching the
  // database, and a static sitemap made the whole build fail when it couldn't.
  await connection();
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
