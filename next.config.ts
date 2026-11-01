import type { NextConfig } from "next";

// Cache Components stays off for now: most pages are static, and the booking
// pages read the session on every request. Revisit once the flow is stable.
const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
