import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseConfigured, supabaseKey, supabaseUrl } from "@/lib/supabase/config";
import { LOCALE_COOKIE, isLocale, matchLocale } from "@/i18n/config";

// 1. Paths without a language go to the visitor's language:
//    saved choice (cookie) first, then the browser's Accept-Language, then English.
// 2. On sign-in-related pages, refresh the Supabase session cookie. Authorization is
//    checked again on the server in each page and action; this is not access control.
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const segment = pathname.split("/")[1];

  if (!isLocale(segment)) {
    const saved = request.cookies.get(LOCALE_COOKIE)?.value;
    const locale = isLocale(saved) ? saved : matchLocale(request.headers.get("accept-language"));
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
    return NextResponse.redirect(url);
  }

  let response = NextResponse.next({ request });
  const rest = pathname.slice(segment.length + 1);
  if (!isSupabaseConfigured() || !/^\/(book|bookings|login)(\/|$)/.test(rest)) return response;

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (toSet) => {
        toSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        toSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });
  await supabase.auth.getUser();
  return response;
}

export const config = {
  // Everything except Next internals, the OAuth callback and files with an extension
  matcher: ["/((?!_next/|api/|auth/|.*\\..*).*)"],
};
