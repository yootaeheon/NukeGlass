import "server-only";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LOCALES, isLocale, type Locale } from "./config";
import { getDictionary } from "./dictionaries";

/** Validate the [lang] segment and load its dictionary (404 for unknown languages). */
export async function resolveLang(params: Promise<{ lang: string }>) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return { lang, dict: await getDictionary(lang) };
}

/** canonical + hreflang links for one page, e.g. pageAlternates("ja", "/glasses"). */
export function pageAlternates(lang: Locale, path: string): Metadata["alternates"] {
  const suffix = path === "/" ? "" : path;
  return {
    canonical: `/${lang}${suffix}`,
    languages: {
      ...Object.fromEntries(LOCALES.map((l) => [l.htmlLang, `/${l.code}${suffix}`])),
      "x-default": suffix || "/",
    },
  };
}
