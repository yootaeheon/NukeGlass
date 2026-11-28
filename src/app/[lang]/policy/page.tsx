import type { Metadata } from "next";
import Image from "next/image";
import { PHOTOS } from "@/lib/media";
import { pageAlternates, resolveLang } from "@/i18n/server";

export async function generateMetadata({ params }: PageProps<"/[lang]/policy">): Promise<Metadata> {
  const { lang, dict } = await resolveLang(params);
  return { title: dict.policy.metaTitle, alternates: pageAlternates(lang, "/policy") };
}

// Draft terms (planning team, 2026-11-01). The Notion planning page is the source of truth.
export default async function PolicyPage({ params }: PageProps<"/[lang]/policy">) {
  const { dict } = await resolveLang(params);
  const t = dict.policy;

  return (
    <>
      <div className="relative h-[38svh] min-h-[260px] overflow-hidden bg-field-dark" data-reveal="media">
        <Image src={PHOTOS.dancheong.src} alt="" fill priority sizes="100vw" className="object-cover" />
      </div>
      <div className="mx-auto grid max-w-[1440px] gap-12 px-margin py-16 lg:grid-cols-12 lg:py-24">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-28">
            <h1 className="display text-[clamp(2.5rem,1.6rem+3vw,4.5rem)]" data-reveal>
              {t.title}
            </h1>
            <p className="rounded-xl mt-6 bg-surface p-5 text-small" data-reveal style={{ "--d": "90ms" } as React.CSSProperties}>
              {t.draft}
            </p>
          </div>
        </div>
        <dl className="lg:col-span-7 lg:col-start-6">
          {t.items.map((item, i) => (
            <div
              key={item.title}
              className={`grid gap-2 py-8 md:grid-cols-[13rem_1fr] md:gap-8 ${i ? "border-t border-line/40" : "pt-0"}`}
              data-reveal
            >
              <dt className="text-lead font-medium">{item.title}</dt>
              <dd>{item.body}</dd>
            </div>
          ))}
        </dl>
      </div>
    </>
  );
}
