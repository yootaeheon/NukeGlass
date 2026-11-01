import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FrameDrawing } from "@/components/frame-drawing";
import { GLASSES, getGlasses } from "@/lib/glasses";
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
  return { title: g.name, description: dict.catalog[g.slug].tagline, alternates: pageAlternates(lang, `/glasses/${slug}`) };
}

type SpecKey = keyof Dictionary["specLabels"];

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
      <section aria-labelledby="name" className="mx-auto grid max-w-[1440px] gap-10 px-margin pb-section pt-12 lg:grid-cols-12 lg:pt-20">
        <div className="bg-surface p-8 text-ink sm:p-16 lg:col-span-7">
          <FrameDrawing shape={g.shape} label={fmt(dict.common.lineDrawing, { name: g.name })} className="w-full" />
        </div>
        <div className="lg:col-span-5">
          <p className="text-muted">{g.brand}</p>
          <h1 id="name" className="head mt-2 text-head">
            {g.name}
          </h1>
          <p className="mt-4 text-lead">{c.tagline}</p>
          <p className="nums mt-8 text-lead font-semibold">{fmt(dict.common.aDay, { price: g.dailyUsd })}</p>
          <p className="mt-2 text-muted">{t.includes}</p>
          <Link href={bookHref} className="btn btn-primary mt-8 hidden w-full lg:inline-flex">
            {t.chooseDates}
          </Link>
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
      <section aria-labelledby="features-title" className="mx-auto max-w-[1440px] px-margin pt-section">
        <h2 id="features-title" className="head text-head">
          {t.featuresTitle}
        </h2>
        <div className="mt-12 space-y-16">
          {dict.features.map((f, i) => (
            <div key={f.title} className="grid gap-4 lg:grid-cols-12" data-reveal>
              <h3 className={`head text-[clamp(1.75rem,1.2rem+2vw,3rem)] lg:col-span-6 ${i % 2 ? "lg:col-start-7" : ""}`}>
                {f.title}
              </h3>
              <p className={`max-w-[52ch] text-muted lg:col-span-5 ${i % 2 ? "lg:col-start-7 lg:row-start-2" : "lg:col-start-8"}`}>
                {f.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Specs */}
      <section aria-labelledby="specs-title" className="mx-auto max-w-[1440px] px-margin pt-section">
        <h2 id="specs-title" className="head text-head">
          {t.specsTitle}
        </h2>
        <table className="mt-10 w-full max-w-[900px] border-collapse text-left">
          <tbody>
            {specs.map(([key, value]) => (
              <tr key={key}>
                <th scope="row" className="w-1/3 border-b border-line py-4 pr-6 font-normal text-muted">
                  {dict.specLabels[key]}
                </th>
                <td className="border-b border-line py-4">{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Guide */}
      <section aria-labelledby="guide-title" className="mt-section bg-surface">
        <div className="mx-auto max-w-[1440px] px-margin py-section">
          <h2 id="guide-title" className="head text-head">
            {t.guideTitle}
          </h2>
          <ol className="mt-12 grid gap-x-10 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
            {dict.guide.map((s) => (
              <li key={s.title} data-reveal>
                <h3 className="text-lead font-medium">{s.title}</h3>
                <p className="mt-2 max-w-[44ch] text-muted">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Etiquette + return */}
      <section className="mx-auto grid max-w-[1440px] gap-16 px-margin pt-section lg:grid-cols-12">
        <div className="lg:col-span-6">
          <h2 className="head text-head">{t.etiquetteTitle}</h2>
          <div className="mt-10 space-y-8">
            {dict.etiquette.map((e) => (
              <div key={e.title}>
                <h3 className="font-medium">{e.title}</h3>
                <p className="mt-1 max-w-[52ch] text-muted">{e.body}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="lg:col-span-5 lg:col-start-8">
          <h2 className="head text-head">{t.returnTitle}</h2>
          <ul className="mt-10 space-y-4">
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
      <section aria-labelledby="model-faq-title" className="mx-auto max-w-[1440px] px-margin pt-section">
        <h2 id="model-faq-title" className="head text-head">
          {t.faqTitle}
        </h2>
        <dl className="mt-10 space-y-10">
          {faq.map((f) => (
            <div key={f.title} className="grid gap-3 lg:grid-cols-12">
              <dt className="text-lead font-medium lg:col-span-6">{f.title}</dt>
              <dd className="max-w-[52ch] text-muted lg:col-span-5 lg:col-start-8">{f.body}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Others (extra bottom space on mobile for the fixed booking bar) */}
      <section
        aria-labelledby="others-title"
        className="mx-auto max-w-[1440px] px-margin pb-[calc(var(--section-gap)+5rem)] pt-section lg:pb-section"
      >
        <h2 id="others-title" className="head text-head">
          {t.othersTitle}
        </h2>
        <ul className="mt-10">
          {others.map((o) => (
            <li key={o.slug}>
              <Link
                href={localePath(lang, `/glasses/${o.slug}`)}
                className="group grid min-h-16 grid-cols-[1fr_auto] items-baseline gap-x-6 border-b border-line py-5 hover:bg-surface sm:grid-cols-[2fr_1fr_auto]"
              >
                <span className="font-medium group-hover:underline">{o.name}</span>
                <span className="hidden text-muted sm:block">{dict.catalog[o.slug].bestFor}</span>
                <span className="nums">{fmt(dict.common.perDay, { price: o.dailyUsd })}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
