const BASE = "http://next.invalid";

/** Only same-site paths are allowed after sign-in, to avoid open redirects. */
export function safeNextPath(value: string | null | undefined, fallback = "/bookings"): string {
  // URL parsers drop tabs/newlines and treat "\" as "/", so "/\t/evil.com" would become "//evil.com".
  if (!value || /[\u0000-\u001f\u007f\\]/.test(value)) return fallback;
  if (!value.startsWith("/") || value.startsWith("//")) return fallback;
  try {
    const url = new URL(value, BASE);
    if (url.origin !== BASE) return fallback;
    return url.pathname + url.search + url.hash;
  } catch {
    return fallback;
  }
}
