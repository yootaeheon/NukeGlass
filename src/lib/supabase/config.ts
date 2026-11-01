// Supabase is optional until the project is created (cost gate 5).
// Without valid env vars the site runs in catalog-only mode: browsing works,
// sign-in and booking show a "not open yet" state instead of crashing.
export const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim();
export const supabaseKey = (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "").trim();

/**
 * A project URL is just an origin, e.g. https://abcd.supabase.co (or a local http://127.0.0.1:54321).
 * Dashboard links (https://supabase.com/dashboard/project/...) and URLs with a path are rejected,
 * because sign-in would otherwise send visitors to a 404 page.
 */
export function isValidSupabaseUrl(value: string): boolean {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.protocol !== "http:") return false;
    if (url.hostname === "supabase.com" || url.hostname.endsWith(".supabase.com")) return false;
    return url.pathname === "/" && !url.search && !url.hash;
  } catch {
    return false;
  }
}

let warned = false;

export function isSupabaseConfigured(): boolean {
  if (!supabaseUrl || !supabaseKey) return false;
  if (isValidSupabaseUrl(supabaseUrl)) return true;
  if (!warned) {
    warned = true;
    // The value itself is never logged.
    console.warn(
      "NEXT_PUBLIC_SUPABASE_URL must be the project URL (https://<ref>.supabase.co), not a dashboard link; sign-in and booking stay off.",
    );
  }
  return false;
}
