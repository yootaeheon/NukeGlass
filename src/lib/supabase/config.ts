// Supabase is optional until the project is created (cost gate 5).
// Without valid env vars the site runs in catalog-only mode: browsing works,
// sign-in and booking show a "not open yet" state instead of crashing.
export const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim();
export const supabaseKey = (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "").trim();

export function isValidSupabaseUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
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
    console.warn("NEXT_PUBLIC_SUPABASE_URL is not a valid http(s) URL; sign-in and booking stay off.");
  }
  return false;
}
