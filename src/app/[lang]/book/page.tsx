import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { GLASSES, getGlasses } from "@/lib/glasses";
import { BOOKING_RULES, addDays, seoulToday } from "@/lib/booking";
import { localePath } from "@/i18n/config";
import { fmt } from "@/i18n/format";
import { resolveLang } from "@/i18n/server";
import { BookingForm } from "./booking-form";

export async function generateMetadata({ params }: PageProps<"/[lang]/book">): Promise<Metadata> {
  const { dict } = await resolveLang(params);
  return { title: dict.book.metaTitle };
}

export default async function BookPage({ params, searchParams }: PageProps<"/[lang]/book">) {
  const { lang, dict } = await resolveLang(params);
  const t = dict.book;
  const query = await searchParams;
  const requested = typeof query.model === "string" ? query.model : "";
  const model = getGlasses(requested)?.slug ?? GLASSES[0].slug;

  if (!isSupabaseConfigured()) {
    return (
      <div className="mx-auto max-w-[1440px] px-margin py-16 lg:py-24">
        <h1 className="head text-title">{t.notOpenTitle}</h1>
        <p className="mt-4 max-w-[52ch] text-muted">{t.notOpenBody}</p>
        <Link href={localePath(lang, "/glasses")} className="btn btn-primary mt-8">
          {t.seeGlasses}
        </Link>
      </div>
    );
  }

  const user = await getCurrentUser();
  if (!user) redirect(localePath(lang, `/login?next=${encodeURIComponent(localePath(lang, `/book?model=${model}`))}`));

  const today = seoulToday();
  return (
    <div className="mx-auto max-w-[760px] px-margin pt-12 lg:pt-16">
      <h1 className="head text-title">{t.title}</h1>
      <p className="mt-3 text-muted">{fmt(t.signedInAs, { email: user.email ?? t.yourAccount })}</p>
      <div className="mt-10">
        <BookingForm
          lang={lang}
          dict={{ book: dict.book, errors: dict.errors, pickup: dict.pickup, common: dict.common }}
          initialModel={model}
          defaultName={user.name ?? ""}
          minStart={addDays(today, BOOKING_RULES.leadDays)}
          maxStart={addDays(today, BOOKING_RULES.horizonDays)}
        />
      </div>
    </div>
  );
}
