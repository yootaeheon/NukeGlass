// Supported site languages. The URL segment is the code; htmlLang/intl are BCP 47 tags.
// Order is the order shown in the language menu. Add a language here and in dictionaries/.
export const LOCALES = [
  { code: "en", label: "English", htmlLang: "en", intl: "en-GB" },
  { code: "ja", label: "日本語", htmlLang: "ja", intl: "ja-JP" },
  { code: "zh-cn", label: "简体中文", htmlLang: "zh-Hans", intl: "zh-CN" },
  { code: "zh-tw", label: "繁體中文", htmlLang: "zh-Hant", intl: "zh-TW" },
  { code: "ko", label: "한국어", htmlLang: "ko", intl: "ko-KR" },
] as const;

export type Locale = (typeof LOCALES)[number]["code"];

export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE = "NEXT_LOCALE";

export function isLocale(value: string | null | undefined): value is Locale {
  return LOCALES.some((l) => l.code === value);
}

export function localeInfo(locale: Locale) {
  return LOCALES.find((l) => l.code === locale)!;
}

/** Prefix an app path with the locale: localePath("ja", "/glasses") -> "/ja/glasses". */
export function localePath(locale: Locale, path: string): string {
  if (path === "/" || path === "") return `/${locale}`;
  return `/${locale}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Replace the locale segment of a pathname, keeping the rest. */
export function switchLocalePath(pathname: string, to: Locale): string {
  const parts = pathname.split("/");
  if (isLocale(parts[1])) parts[1] = to;
  else parts.splice(1, 0, to);
  return parts.join("/") || `/${to}`;
}

/**
 * Pick a locale from an Accept-Language header. Matches exact tags first, then
 * language families (zh-HK/zh-MO -> zh-tw, other zh -> zh-cn).
 */
export function matchLocale(acceptLanguage: string | null | undefined): Locale {
  if (!acceptLanguage) return DEFAULT_LOCALE;
  const prefs = acceptLanguage
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().toLowerCase().split(";");
      const q = params.find((p) => p.trim().startsWith("q="));
      return { tag, q: q ? Number(q.trim().slice(2)) || 0 : 1 };
    })
    .filter((p) => p.tag && p.q > 0)
    .sort((a, b) => b.q - a.q);

  for (const { tag } of prefs) {
    if (tag.startsWith("zh")) {
      return /hant|-tw|-hk|-mo/.test(tag) ? "zh-tw" : "zh-cn";
    }
    const base = tag.split("-")[0];
    if (isLocale(base)) return base;
  }
  return DEFAULT_LOCALE;
}
