import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductRail } from "@/components/product-rail";
import { ParallaxBand } from "@/components/parallax-band";
import { GLASSES, getGlasses } from "@/lib/glasses";
import { PHOTOS, PRODUCT_IMAGES, SCENES, type Photo } from "@/lib/media";
import { LOCALES, localePath } from "@/i18n/config";
import { fmt } from "@/i18n/format";
import { pageAlternates, resolveLang } from "@/i18n/server";
import type { Dictionary } from "@/i18n/dictionaries/en";

export function generateStaticParams() {
  return LOCALES.flatMap((l) => GLASSES.map((g) => ({ lang: l.code, slug: g.slug })));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: PageProps<"/[lang]/glasses/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const { lang, dict } = await resolveLang(params);
  const g = getGlasses(slug);
  if (!g) return {};
  return {
    title: g.name,
    description: dict.catalog[g.slug].tagline,
    alternates: pageAlternates(lang, `/glasses/${slug}`),
    openGraph: { images: [PRODUCT_IMAGES[g.slug].src] },
  };
}

type SpecKey = keyof Dictionary["specLabels"];

// One picture per feature, in the order of dict.features: ask, directions, photos, audio
const FEATURE_PHOTOS: Photo[] = [PHOTOS.dancheong, SCENES.bukchonWalk, PHOTOS.palace, SCENES.marketDusk];

const d = (ms: number) => ({ "--d": `${ms}ms` }) as React.CSSProperties;

export default async function GlassesDetail({ params }: PageProps<"/[lang]/glasses/[slug]">) {
  const { slug } = await params;
  const { lang, dict } = await resolveLang(params);
  const g = getGlasses(slug);
  if (!g) notFound();
  const t = dict.detail;
  const c = dict.catalog[g.slug];
  const specs = Object.entries(c.specs) as [SpecKey, string][];
  const faq = g.slug === "oakley-meta-vanguard" ? [...dict.modelFaq, dict.vanguardFaq] : dict.modelFaq;
  const others = GLASSES.filter((o) => o.slug !== g.slug);
  const bookHref = localePath(lang, `/book?model=${g.slug}`);

  return (
    <>
      {/* Product */}
      <section aria-labelledby="name" className="mx-auto grid max-w-[1440px] gap-10 px-margin pb-section pt-8 lg:grid-cols-12 lg:pt-12">
        <div className="relative aspect-[3/2] overflow-hidden bg-product lg:col-span-8" data-reveal="media">
          <Image src={PRODUCT_IMAGES[g.slug].src} alt={g.name} fill priority sizes="(min-width: 1024px) 66vw, 100vw" className="object-cover" />
        </div>
        <div className="lg:col-span-4 lg:pt-6">
          <div className="lg:sticky lg:top-28">
            <h1 id="name" className="head text-[clamp(2.25rem,1.6rem+2vw,3.5rem)]" data-reveal>
              {g.name.replace(/ \(Gen 2\)$/, "")}
            </h1>
            <p className="mt-4 text-lead" data-reveal style={d(120)}>
              {c.tagline}
            </p>
            <ul className="mt-6 space-y-2" data-reveal style={d(180)}>
              {c.facts.map((f) => (
                <li key={f} className="flex items-center gap-3">
                  <span className="size-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
                  {f}
                </li>
              ))}
            </ul>
            <div className="mt-8 bg-surface p-6" data-reveal style={d(240)}>
              <p className="nums text-[clamp(2rem,1.6rem+1.2vw,2.75rem)] font-semibold leading-none">
                {fmt(dict.common.aDay, { price: g.dailyUsd })}
              </p>
              <p className="mt-3 text-small text-muted">{t.includes}</p>
              <Link href={bookHref} className="btn btn-primary mt-6 hidden w-full lg:inline-flex">
                {t.chooseDates} <span className="arrow ml-3" aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile booking bar */}
      <div
        data-bottom-bar
        className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-between gap-4 bg-bg px-margin pb-[max(12px,env(safe-area-inset-bottom))] pt-3 shadow-[0_-8px_24px_rgba(18,20,22,0.10)] lg:hidden"
      >
        <p className="nums font-semibold">{fmt(dict.common.aDay, { price: g.dailyUsd })}</p>
        <Link href={bookHref} className="btn btn-primary">
          {t.chooseDates}
        </Link>
      </div>

      {/* What it does in Seoul */}
      <section aria-labelledby="features-title" className="mx-auto max-w-[1440px] px-margin">
        <h2 id="features-title" className="display text-display" data-reveal>
          {t.featuresTitle}
        </h2>
        <div className="mt-16 space-y-24 lg:space-y-32">
          {dict.features.map((f, i) => (
            <div key={f.title} className="grid items-center gap-8 lg:grid-cols-12">
              <div
                className={`relative aspect-[3/2] overflow-hidden bg-surface lg:col-span-7 ${i % 2 ? "lg:order-2 lg:col-start-6" : ""}`}
                data-reveal="media"
              >
                <Image src={FEATURE_PHOTOS[i].src} alt="" fill sizes="(min-width: 1024px) 58vw, 100vw" className="object-cover" />
              </div>
              <div className={`lg:col-span-4 ${i % 2 ? "lg:order-1 lg:col-start-1" : "lg:col-start-9"}`}>
                <h3 className="head text-[clamp(1.75rem,1.2rem+2vw,3rem)]" data-reveal>
                  {f.title}
                </h3>
                <p className="mt-4 max-w-[46ch]" data-reveal style={d(90)}>
                  {f.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Specs */}
      <section aria-labelledby="specs-title" className="mx-auto grid max-w-[1440px] gap-10 px-margin pt-section lg:grid-cols-12">
        <h2 id="specs-title" className="display text-[clamp(2.25rem,1.4rem+3vw,4.5rem)] lg:col-span-5" data-reveal>
          {t.specsTitle}
        </h2>
        <table className="w-full border-collapse text-left lg:col-span-6 lg:col-start-7">
          <tbody>
            {specs.map(([key, value]) => (
              <tr key={key}>
                <th scope="row" className="w-1/3 border-b border-line/40 py-5 pr-6 font-normal text-muted">
                  {dict.specLabels[key]}
                </th>
                <td className="border-b border-line/40 py-5">{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Guide */}
      <section aria-labelledby="guide-title" className="mt-section bg-surface">
        <div className="mx-auto max-w-[1440px] px-margin py-section">
          <h2 id="guide-title" className="display text-[clamp(2.25rem,1.4rem+3vw,4.5rem)]" data-reveal>
            {t.guideTitle}
          </h2>
          <ol className="mt-14 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {dict.guide.map((s, i) => (
              <li key={s.title} className="bg-bg p-8" data-reveal style={d((i % 3) * 80)}>
                <h3 className="text-lead font-medium">{s.title}</h3>
                <p className="mt-3 max-w-[44ch]">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* In Seoul */}
      <ParallaxBand photo={PHOTOS.bukchon} alt="" className="min-h-[70svh]">
        <h2 className="display mt-auto max-w-[16ch] text-display" data-reveal>
          {t.etiquetteTitle}
        </h2>
      </ParallaxBand>

      {/* Etiquette + return */}
      <section className="mx-auto grid max-w-[1440px] gap-16 px-margin pt-section lg:grid-cols-12">
        <div className="space-y-10 lg:col-span-6">
          {dict.etiquette.map((e, i) => (
            <div key={e.title} data-reveal style={d(i * 80)}>
              <h3 className="text-lead font-medium">{e.title}</h3>
              <p className="mt-2 max-w-[52ch]">{e.body}</p>
            </div>
          ))}
        </div>
        <div className="bg-surface p-8 lg:col-span-5 lg:col-start-8" data-reveal>
          <h2 className="head text-[clamp(1.75rem,1.2rem+2vw,2.75rem)]">{t.returnTitle}</h2>
          <ul className="mt-8 space-y-3">
            {dict.returnChecklist.map((item) => (
              <li key={item}>
                <label className="flex min-h-12 cursor-pointer items-start gap-4">
                  <input type="checkbox" className="mt-1 size-5 shrink-0 accent-accent" />
                  <span>{item}</span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Model FAQ */}
      <section aria-labelledby="model-faq-title" className="mx-auto grid max-w-[1440px] gap-10 px-margin pt-section lg:grid-cols-12">
        <h2 id="model-faq-title" className="display text-[clamp(2.25rem,1.4rem+3vw,4.5rem)] lg:col-span-5" data-reveal>
          {t.faqTitle}
        </h2>
        <div className="lg:col-span-6 lg:col-start-7">
          {faq.map((f, i) => (
            <details key={f.title} open={i === 0} data-reveal style={d(i * 50)}>
              <summary className="flex min-h-16 items-center justify-between gap-6 py-4 text-lead font-medium transition-colors hover:text-accent">
                {f.title}
                <span className="plus grid size-10 shrink-0 place-items-center rounded-full bg-surface text-lead" aria-hidden="true">
                  +
                </span>
              </summary>
              <p className="answer max-w-[56ch] pb-6 pr-14">{f.body}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Others (extra bottom space on mobile for the fixed booking bar) */}
      <section
        aria-labelledby="others-title"
        className="mx-auto max-w-[1440px] px-margin pb-[calc(var(--section-gap)+5rem)] pt-section lg:pb-section"
      >
        <h2 id="others-title" className="display mb-12 text-[clamp(2.25rem,1.4rem+3vw,4.5rem)]" data-reveal>
          {t.othersTitle}
        </h2>
        <div className="lg:[&_ul]:grid-cols-4">
          <ProductRail lang={lang} dict={dict} items={others} />
        </div>
      </section>
    </>
  );
}
