import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  images: {
    // Product photos uploaded from the admin, served by src/app/uploads/[...path]/route.ts.
    localPatterns: [{ pathname: "/uploads/**", search: "" }],
  },
  experimental: {
    // Product forms upload several phone photos at once (default limits are 1MB / 10MB).
    serverActions: { bodySizeLimit: "40mb" },
    proxyClientMaxBodySize: "40mb",
  },
};

export default nextConfig;
