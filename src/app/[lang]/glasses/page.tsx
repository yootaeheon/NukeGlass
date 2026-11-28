import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { GLASSES, type Glasses } from "@/lib/glasses";
import { PRODUCT_IMAGES } from "@/lib/media";
import { localePath } from "@/i18n/config";
import { fmt } from "@/i18n/format";
import { pageAlternates, resolveLang } from "@/i18n/server";
import type { Dictionary } from "@/i18n/dictionaries/en";

export async function generateMetadata({ params }: PageProps<"/[lang]/glasses">): Promise<Metadata> {
  const { lang, dict } = await resolveLang(params);
  return {
    title: dict.glassesPage.metaTitle,
    description: dict.glassesPage.metaDescription,
    alternates: pageAlternates(lang, "/glasses"),
  };
}

type SpecKey = keyof Dictionary["specLabels"];

const d = (ms: number) => ({ "--d": `${ms}ms` }) as React.CSSProperties;

export default async function GlassesPage({ params }: PageProps<"/[lang]/glasses">) {
  const { lang, dict } = await resolveLang(params);
  const t = dict.glassesPage;
  const spec = (key: SpecKey) => (g: Glasses) =>
    (dict.catalog[g.slug].specs as Partial<Record<SpecKey, string>>)[key] ?? "—";

  const rows: [string, (g: Glasses) => string][] = [
    [t.bestFor, (g) => dict.catalog[g.slug].bestFor],
    [dict.specLabels.camera, spec("camera")],
    [dict.specLabels.battery, spec("battery")],
    [dict.specLabels.audio, spec("audio")],
    [t.perDayRow, (g) => `$${g.dailyUsd}`],
  ];

  return (
    <>
      <div className="mx-auto grid max-w-[1440px] gap-8 px-margin pb-16 pt-16 lg:grid-cols-12 lg:items-end lg:pt-24">
        <h1 className="display text-display lg:col-span-7" data-reveal>
          {t.title}
        </h1>
        <p className="text-lead lg:col-span-4 lg:col-start-9" data-reveal style={d(90)}>
          {t.intro}
        </p>
      </div>

      {/* Jump to a pair */}
      <nav aria-label={t.title} className="mx-auto max-w-[1440px] px-margin pb-16">
        <ul className="flex flex-wrap gap-2">
          {GLASSES.map((g) => (
            <li key={g.slug}>
              <a
                href={`#${g.slug}`}
                className="rounded-full inline-flex min-h-11 items-center bg-surface px-4 transition-colors hover:bg-ink hover:text-white"
              >
                {g.name.replace(/ \(Gen 2\)$/, "")}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {GLASSES.map((g, i) => {
        const c = dict.catalog[g.slug];
        const flip = i % 2 === 1;
        return (
          <section key={g.slug} id={g.slug} aria-labelledby={`${g.slug}-name`} className="scroll-mt-24">
            <div className="mx-auto grid max-w-[1440px] items-center gap-10 px-margin pb-section lg:grid-cols-12">
              <Link
                href={localePath(lang, `/glasses/${g.slug}`)}
                className={`rounded-2xl zoom relative block aspect-[3/2] overflow-hidden bg-product lg:col-span-7 ${flip ? "lg:order-2 lg:col-start-6" : ""}`}
                data-reveal="media"
                tabIndex={-1}
                aria-hidden="true"
              >
                <Image src={PRODUCT_IMAGES[g.slug].src} alt="" fill sizes="(min-width: 1024px) 58vw, 100vw" className="object-cover" />
              </Link>
              <div className={`lg:col-span-4 ${flip ? "lg:order-1 lg:col-start-1" : "lg:col-start-9"}`}>
                <h2 id={`${g.slug}-name`} className="head text-[clamp(2rem,1.5rem+1.8vw,3.25rem)]" data-reveal>
                  {g.name.replace(/ \(Gen 2\)$/, "")}
                </h2>
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
                <p className="nums mt-8 text-[clamp(1.75rem,1.4rem+1vw,2.25rem)] font-semibold" data-reveal style={d(240)}>
                  {fmt(dict.common.aDay, { price: g.dailyUsd })}
                </p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center" data-reveal style={d(300)}>
                  <Link href={localePath(lang, `/book?model=${g.slug}`)} className="btn btn-primary">
                    {t.book}
                  </Link>
                  <Link href={localePath(lang, `/glasses/${g.slug}`)} className="link inline-flex min-h-12 items-center px-2 font-medium">
                    {t.details} <span className="arrow ml-2" aria-hidden="true">→</span>
                  </Link>
                </div>
              </div>
            </div>
          </section>
        );
      })}

      <section aria-labelledby="compare-title" className="bg-surface">
        <div className="mx-auto max-w-[1440px] px-margin py-section">
          <h2 id="compare-title" className="display text-display" data-reveal>
            {t.compareTitle}
          </h2>
          <div className="mt-12 overflow-x-auto" tabIndex={0} role="region" aria-labelledby="compare-title">
            <table className="w-full min-w-[860px] border-collapse text-left">
              <thead>
                <tr>
                  <th scope="col" className="sticky left-0 bg-surface py-3 pr-6">
                    <span className="sr-only">{t.spec}</span>
                  </th>
                  {GLASSES.map((g) => (
                    <th key={g.slug} scope="col" className="px-4 pb-4 align-bottom font-medium">
                      <span className="rounded-xl relative mb-3 block aspect-[3/2] overflow-hidden bg-product">
                        <Image src={PRODUCT_IMAGES[g.slug].src} alt="" fill sizes="180px" className="object-cover" />
                      </span>
                      {g.name.replace(/^(Ray-Ban|Oakley) Meta /, "")}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map(([label, get]) => (
                  <tr key={label}>
                    <th scope="row" className="sticky left-0 border-t border-line/40 bg-surface py-4 pr-6 font-normal text-muted">
                      {label}
                    </th>
                    {GLASSES.map((g) => (
                      <td key={g.slug} className="nums border-t border-line/40 px-4 py-4">
                        {get(g)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </>
  );
}
