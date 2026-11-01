import type { Metadata } from "next";
import Link from "next/link";
import { FrameDrawing } from "@/components/frame-drawing";
import { GLASSES, type Glasses } from "@/lib/glasses";
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
      <div className="mx-auto max-w-[1440px] px-margin pb-16 pt-16">
        <h1 className="display text-display">{t.title}</h1>
        <p className="mt-6 max-w-[52ch] text-lead text-muted">{t.intro}</p>
      </div>

      {GLASSES.map((g, i) => {
        const c = dict.catalog[g.slug];
        return (
          <section key={g.slug} aria-labelledby={`${g.slug}-name`} className={i % 2 === 0 ? "bg-surface" : "bg-bg"}>
            <div className="mx-auto grid max-w-[1440px] items-center gap-10 px-margin py-16 lg:grid-cols-12 lg:py-24">
              <div className="text-ink lg:col-span-6" data-reveal>
                <FrameDrawing
                  shape={g.shape}
                  label={fmt(dict.common.lineDrawing, { name: g.name })}
                  className="mx-auto w-full max-w-[560px]"
                />
              </div>
              <div className="lg:col-span-5 lg:col-start-8">
                <h2 id={`${g.slug}-name`} className="head text-head">
                  {g.name}
                </h2>
                <p className="mt-4 text-lead">{c.tagline}</p>
                <ul className="mt-4 text-muted">
                  {c.facts.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
                <p className="nums mt-6 text-lead font-semibold">{fmt(dict.common.aDay, { price: g.dailyUsd })}</p>
                <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
                  <Link href={localePath(lang, `/book?model=${g.slug}`)} className="btn btn-primary">
                    {t.book}
                  </Link>
                  <Link href={localePath(lang, `/glasses/${g.slug}`)} className="link min-h-12 content-center">
                    {t.details}
                  </Link>
                </div>
              </div>
            </div>
          </section>
        );
      })}

      <section aria-labelledby="compare-title" className="mx-auto max-w-[1440px] px-margin py-section">
        <h2 id="compare-title" className="head text-head">
          {t.compareTitle}
        </h2>
        <div className="mt-10 overflow-x-auto" tabIndex={0} role="region" aria-labelledby="compare-title">
          <table className="w-full min-w-[760px] border-collapse text-left">
            <thead>
              <tr>
                <th scope="col" className="sticky left-0 bg-bg py-3 pr-6">
                  <span className="sr-only">{t.spec}</span>
                </th>
                {GLASSES.map((g) => (
                  <th key={g.slug} scope="col" className="border-b border-line px-4 py-3 align-bottom font-medium">
                    {g.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(([label, get]) => (
                <tr key={label}>
                  <th scope="row" className="sticky left-0 border-b border-line bg-bg py-3 pr-6 font-normal text-muted">
                    {label}
                  </th>
                  {GLASSES.map((g) => (
                    <td key={g.slug} className="nums border-b border-line px-4 py-3">
                      {get(g)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
