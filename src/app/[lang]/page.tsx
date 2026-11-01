import Link from "next/link";
import { HeroScenes } from "@/components/hero-scenes";
import { TryIt } from "@/components/try-it";
import { FrameDrawing } from "@/components/frame-drawing";
import { GLASSES } from "@/lib/glasses";
import { localePath } from "@/i18n/config";
import { fmt } from "@/i18n/format";
import { resolveLang } from "@/i18n/server";

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang, dict } = await resolveLang(params);
  const t = dict.home;
  const fromPrice = Math.min(...GLASSES.map((g) => g.dailyUsd));

  return (
    <>
      <HeroScenes lang={lang} t={dict.hero} />

      {/* Translation: look at it, ask */}
      <section aria-labelledby="translate-title" className="mx-auto max-w-[1440px] px-margin pt-section">
        <div className="grid gap-10 lg:grid-cols-12">
          <h2 id="translate-title" className="display text-display lg:col-span-7" data-reveal>
            {t.translateTitle}
          </h2>
          <p className="max-w-[46ch] self-end text-lead text-muted lg:col-span-5" data-reveal>
            {t.translateBody}
          </p>
        </div>
        <div className="mt-12" data-reveal>
          <TryIt signs={dict.tryIt} />
          <p className="mt-4 max-w-[60ch] text-small text-muted">{t.tryNote}</p>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" aria-labelledby="how-title" className="mx-auto max-w-[1440px] scroll-mt-20 px-margin pt-section">
        <h2 id="how-title" className="sr-only">
          {t.howTitle}
        </h2>
        <ol className="space-y-14">
          {t.steps.map((s, i) => (
            <li key={s.line} style={{ paddingLeft: `calc(${i} * min(6vw, 8rem))` }} data-reveal>
              <p className="head text-head">{s.line}</p>
              <p className="mt-3 max-w-[52ch] text-muted">{s.detail}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Models */}
      <section aria-labelledby="models-title" className="mx-auto max-w-[1440px] px-margin pt-section">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h2 id="models-title" className="display text-display" data-reveal>
              {t.modelsTitle}
            </h2>
            <div className="mt-10 hidden bg-surface p-10 text-ink lg:block" data-reveal>
              <FrameDrawing
                shape="wayfarer"
                label={fmt(dict.common.lineDrawing, { name: GLASSES[0].name })}
                className="w-full"
              />
            </div>
          </div>
          <ul className="lg:col-span-7 lg:col-start-6">
            {GLASSES.map((g) => (
              <li key={g.slug}>
                <Link
                  href={localePath(lang, `/glasses/${g.slug}`)}
                  className="group grid min-h-16 grid-cols-[1fr_auto] items-baseline gap-x-6 gap-y-1 border-b border-line py-5 transition-colors hover:bg-surface"
                >
                  <span className="text-lead font-medium group-hover:underline">{g.name}</span>
                  <span className="nums font-semibold">{fmt(dict.common.perDay, { price: g.dailyUsd })}</span>
                  <span className="text-muted">{dict.catalog[g.slug].bestFor}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Price */}
      <section aria-labelledby="price-title" className="mt-section bg-surface">
        <div className="mx-auto max-w-[1440px] px-margin py-section">
          <h2 id="price-title" className="display text-display" data-reveal>
            {t.priceBefore} <span className="nums inline-block bg-accent px-[0.12em] text-white">${fromPrice}</span>{" "}
            {t.priceAfter}
          </h2>
          <div className="mt-12 grid gap-8 md:grid-cols-12">
            <div className="max-w-[52ch] md:col-span-7">
              <p>{t.priceBody}</p>
              <Link href={localePath(lang, "/policy")} className="link mt-4 inline-flex min-h-12 items-center">
                {dict.policy.link}
              </Link>
            </div>
            <div className="md:col-span-4 md:col-start-9 md:justify-self-end">
              <Link href={localePath(lang, "/glasses")} className="btn btn-primary w-full md:w-auto">
                {t.seeAll}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" aria-labelledby="faq-title" className="mx-auto max-w-[1440px] scroll-mt-20 px-margin py-section">
        <h2 id="faq-title" className="head text-head">
          {t.faqTitle}
        </h2>
        <dl className="mt-12 space-y-12">
          {t.faq.map((f) => (
            <div key={f.q} className="grid gap-3 lg:grid-cols-12">
              <dt className="text-lead font-medium lg:col-span-6">{f.q}</dt>
              <dd className="max-w-[52ch] text-muted lg:col-span-5 lg:col-start-8">{f.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Closing */}
      <section aria-labelledby="closing-title" className="on-dark flex min-h-[80svh] bg-field-dark text-white lg:min-h-[90svh]">
        <div className="mx-auto flex w-full max-w-[1440px] flex-col justify-between px-margin py-section">
          <h2 id="closing-title" className="display text-display">
            {t.closingA}
            <br />
            {t.closingB}
          </h2>
          <div className="mt-16 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <p className="max-w-[44ch] text-field-dark-muted">{t.closingBody}</p>
            <Link href={localePath(lang, "/book")} className="btn btn-primary w-full md:w-auto">
              {dict.nav.book}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
