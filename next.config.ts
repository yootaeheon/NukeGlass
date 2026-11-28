import type { NextConfig } from "next";

// Sent with every response. Kept to headers that cannot break sign-in (Google OAuth
// redirects) or Next's own inline scripts; a full script CSP needs nonces and is not here.
// HSTS is left to Vercel, which sends it for every deployment.
const SECURITY_HEADERS = [
  // No other site may put our pages (login, admin, booking) in a frame
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
];

// Files in public/ keep their name when replaced, so cache for a day, not forever.
const MEDIA_CACHE = [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=86400" }];

// Cache Components stays off for now: most pages are static, and the booking
// pages read the session on every request. Revisit once the flow is stable.
const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      { source: "/:path*", headers: SECURITY_HEADERS },
      { source: "/video/:path*", headers: MEDIA_CACHE },
      { source: "/features/:path*", headers: MEDIA_CACHE },
    ];
  },
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
