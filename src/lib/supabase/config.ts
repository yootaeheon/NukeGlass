// Supabase is optional until the project is created (cost gate 5).
// Without these env vars the site runs in catalog-only mode: browsing works,
// sign-in and booking show a "not open yet" state.
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";

export function isSupabaseConfigured(): boolean {
  return supabaseUrl.length > 0 && supabaseKey.length > 0;
}
