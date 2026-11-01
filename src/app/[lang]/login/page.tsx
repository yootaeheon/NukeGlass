import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { safeNextPath } from "@/lib/safe-redirect";
import { localePath } from "@/i18n/config";
import { pageAlternates, resolveLang } from "@/i18n/server";
import { SignInButtons } from "./sign-in-buttons";

export async function generateMetadata({ params }: PageProps<"/[lang]/login">): Promise<Metadata> {
  const { lang, dict } = await resolveLang(params);
  return { title: dict.login.metaTitle, alternates: pageAlternates(lang, "/login"), robots: { index: false } };
}

export default async function LoginPage({ params, searchParams }: PageProps<"/[lang]/login">) {
  const { lang, dict } = await resolveLang(params);
  const t = dict.login;
  const query = await searchParams;
  const next = safeNextPath(typeof query.next === "string" ? query.next : null, localePath(lang, "/bookings"));
  const failed = query.error === "callback";

  if (await getCurrentUser()) redirect(next);

  return (
    <div className="mx-auto max-w-[1440px] px-margin py-16 lg:py-24">
      <div className="max-w-[520px]">
        <h1 className="head text-title">{t.title}</h1>
        <p className="mt-4 text-muted">{t.body}</p>

        <div className="mt-10">
          {isSupabaseConfigured() ? (
            <SignInButtons next={next} t={t} />
          ) : (
            <p className="bg-surface p-5">{t.notOpen}</p>
          )}
          {failed && (
            <p role="alert" className="mt-4 text-danger">
              {t.failed}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
