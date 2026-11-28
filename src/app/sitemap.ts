import type { MetadataRoute } from "next";
import { LOCALES, localePath } from "@/i18n/config";
import { GLASSES } from "@/lib/glasses";
import { siteUrl } from "@/lib/site-url";

// Public pages only, once per language, each pointing at its translations.
// Booking, sign-in and admin pages are left out: they are noindex.
const PATHS = ["/", "/glasses", ...GLASSES.map((g) => `/glasses/${g.slug}`), "/policy"];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  const abs = (path: string) => new URL(path, base).toString();

  return PATHS.flatMap((path) => {
    const languages = Object.fromEntries(LOCALES.map((l) => [l.htmlLang, abs(localePath(l.code, path))]));
    return LOCALES.map((l) => ({
      url: abs(localePath(l.code, path)),
      changeFrequency: "weekly" as const,
      priority: path === "/" ? 1 : 0.7,
      alternates: { languages },
    }));
  });
}
