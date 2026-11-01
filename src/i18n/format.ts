import { localeInfo, type Locale } from "./config";

/** Fill {name} placeholders: fmt("{n} days", { n: 3 }) -> "3 days". */
export function fmt(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in vars ? String(vars[key]) : match));
}

const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/;

/** A Seoul calendar date ("2026-11-04") in the visitor's language, e.g. "Wed, 4 Nov 2026" / "2026年11月4日(水)". */
export function formatSeoulDate(date: string, locale: Locale): string {
  const m = DATE_ONLY.exec(date);
  if (!m) return date;
  // noon KST keeps the calendar day stable in every time zone
  const instant = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]), 3));
  return new Intl.DateTimeFormat(localeInfo(locale).intl, {
    timeZone: "Asia/Seoul",
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(instant);
}
