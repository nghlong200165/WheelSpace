// Absolute site address for share previews, the sitemap and robots.txt.
// APP_URL when set, else the Vercel production domain, else local dev.
export const SITE_URL =
  process.env.APP_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");
