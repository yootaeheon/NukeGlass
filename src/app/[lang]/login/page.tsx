import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { safeNextPath } from "@/lib/safe-redirect";
import { PHOTOS } from "@/lib/media";
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
    <div className="mx-auto grid max-w-[1440px] gap-12 px-margin py-12 lg:min-h-[calc(100svh-72px)] lg:grid-cols-12 lg:items-center lg:py-16">
      <div className="lg:col-span-5">
        <h1 className="display text-[clamp(2.5rem,1.6rem+3vw,4.5rem)]" data-reveal>
          {t.title}
        </h1>
        <p className="mt-6 max-w-[44ch] text-lead" data-reveal style={{ "--d": "90ms" } as React.CSSProperties}>
          {t.body}
        </p>

        <div className="mt-10" data-reveal style={{ "--d": "180ms" } as React.CSSProperties}>
          {isSupabaseConfigured() ? <SignInButtons next={next} t={t} /> : <p className="bg-surface p-5">{t.notOpen}</p>}
          {failed && (
            <p role="alert" className="mt-4 text-danger">
              {t.failed}
            </p>
          )}
        </div>
      </div>
      <div className="relative hidden aspect-[4/5] max-h-[calc(100svh-10rem)] w-full overflow-hidden bg-surface lg:col-span-6 lg:col-start-7 lg:block" data-reveal="media">
        <Image src={PHOTOS.hanokDoors.src} alt="" fill sizes="50vw" className="object-cover" />
      </div>
    </div>
  );
}
