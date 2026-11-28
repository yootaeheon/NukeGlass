import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site-url";

// The booking, sign-in and admin pages already carry `noindex` in their metadata.
// They are NOT disallowed here: a crawler that may not fetch a page never sees its
// noindex and can still list the bare URL. Only the OAuth callback is blocked.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/auth/"] },
    sitemap: new URL("/sitemap.xml", siteUrl()).toString(),
  };
}
