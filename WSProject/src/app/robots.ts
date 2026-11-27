import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-url";

// /robots.txt: keep crawlers out of private and per-visitor pages.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/account", "/cart", "/login", "/register", "/auth", "/api"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
