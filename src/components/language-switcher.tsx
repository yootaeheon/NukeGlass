"use client";

import { usePathname, useRouter } from "next/navigation";
import { LOCALES, LOCALE_COOKIE, switchLocalePath, type Locale } from "@/i18n/config";

/** Native select: works with screen readers and the phone's own picker. Remembers the choice in a cookie. */
export function LanguageSwitcher({ lang, label }: { lang: Locale; label: string }) {
  const pathname = usePathname();
  const router = useRouter();

  function change(next: Locale) {
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
    router.push(switchLocalePath(pathname, next) + window.location.search + window.location.hash);
  }

  return (
    <label className="relative inline-flex min-h-12 items-center">
      <span className="sr-only">{label}</span>
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="pointer-events-none absolute left-1 size-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3Z" />
      </svg>
      <select
        value={lang}
        onChange={(e) => change(e.target.value as Locale)}
        className="min-h-12 cursor-pointer appearance-none bg-transparent py-2 pl-8 pr-1 font-medium text-current hover:underline"
      >
        {LOCALES.map((l) => (
          <option key={l.code} value={l.code} lang={l.htmlLang} className="text-ink">
            {l.label}
          </option>
        ))}
      </select>
    </label>
  );
}
