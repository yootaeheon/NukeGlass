import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { safeNextPath } from "@/lib/safe-redirect";
import { isLocale } from "@/i18n/config";

// OAuth (Google, later others) returns here with a one-time code.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const next = safeNextPath(searchParams.get("next"));
  // Stay in the visitor's language on failure too (next looks like "/ja/book?model=…").
  const seg = next.split("/")[1];
  const prefix = isLocale(seg) ? `/${seg}` : "";

  const supabase = await createClient();
  if (supabase && code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(next, origin));
  }
  return NextResponse.redirect(new URL(`${prefix}/login?error=callback`, origin));
}
