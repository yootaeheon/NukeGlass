import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FrameDrawing } from "@/components/frame-drawing";
import { GLASSES, RETURN_CHECKLIST, SEOUL_ETIQUETTE, SETUP_GUIDE, getGlasses } from "@/lib/glasses";

export function generateStaticParams() {
  return GLASSES.map((g) => ({ slug: g.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: PageProps<"/glasses/[slug]">): Promise<Metadata> {
  const g = getGlasses((await params).slug);
  return g ? { title: g.name, description: g.tagline } : {};
}

export default async function GlassesDetail({ params }: PageProps<"/glasses/[slug]">) {
  const g = getGlasses((await params).slug);
  if (!g) notFound();
  const others = GLASSES.filter((o) => o.slug !== g.slug);

  return (
    <>
      {/* Product */}
      <section aria-labelledby="name" className="mx-auto grid max-w-[1440px] gap-10 px-margin pb-section pt-12 lg:grid-cols-12 lg:pt-20">
        <div className="bg-surface p-8 text-ink sm:p-16 lg:col-span-7">
          <FrameDrawing shape={g.shape} label={`${g.name}, line drawing`} className="w-full" />
        </div>
        <div className="lg:col-span-5">
          <p className="text-muted">{g.brand}</p>
          <h1 id="name" className="head mt-2 text-head">
            {g.name}
          </h1>
          <p className="mt-4 text-lead">{g.tagline}</p>
          <p className="nums mt-8 text-lead font-semibold">${g.dailyUsd} a day</p>
          <p className="mt-2 text-muted">Charging case and USB-C cable included.</p>
          <Link href={`/book?model=${g.slug}`} className="btn btn-primary mt-8 hidden w-full lg:inline-flex">
            Choose dates
          </Link>
        </div>
      </section>

      {/* Mobile booking bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-between gap-4 bg-bg px-margin pb-[max(12px,env(safe-area-inset-bottom))] pt-3 shadow-[0_-8px_24px_rgba(18,20,22,0.10)] lg:hidden">
        <p className="nums font-semibold">${g.dailyUsd} a day</p>
        <Link href={`/book?model=${g.slug}`} className="btn btn-primary">
          Choose dates
        </Link>
      </div>

      {/* What it does in Seoul */}
      <section aria-labelledby="features-title" className="mx-auto max-w-[1440px] px-margin pt-section">
        <h2 id="features-title" className="head text-head">
          What it does in Seoul
        </h2>
        <div className="mt-12 space-y-16">
          {g.features.map((f, i) => (
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
          Specs
        </h2>
        <table className="mt-10 w-full max-w-[900px] border-collapse text-left">
          <tbody>
            {g.specs.map(([label, value]) => (
              <tr key={label}>
                <th scope="row" className="w-1/3 border-b border-line py-4 pr-6 font-normal text-muted">
                  {label}
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
            Set up in five minutes
          </h2>
          <ol className="mt-12 grid gap-x-10 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
            {SETUP_GUIDE.map((s) => (
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
          <h2 className="head text-head">Good to know in Seoul</h2>
          <div className="mt-10 space-y-8">
            {SEOUL_ETIQUETTE.map((e) => (
              <div key={e.title}>
                <h3 className="font-medium">{e.title}</h3>
                <p className="mt-1 max-w-[52ch] text-muted">{e.body}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="lg:col-span-5 lg:col-start-8">
          <h2 className="head text-head">Before you return it</h2>
          <ul className="mt-10 space-y-4">
            {RETURN_CHECKLIST.map((item) => (
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
          Questions about this pair
        </h2>
        <dl className="mt-10 space-y-10">
          {g.faq.map((f) => (
            <div key={f.title} className="grid gap-3 lg:grid-cols-12">
              <dt className="text-lead font-medium lg:col-span-6">{f.title}</dt>
              <dd className="max-w-[52ch] text-muted lg:col-span-5 lg:col-start-8">{f.body}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Others (extra bottom space on mobile for the fixed booking bar) */}
      <section aria-labelledby="others-title" className="mx-auto max-w-[1440px] px-margin pb-[calc(var(--section-gap)+5rem)] pt-section lg:pb-section">
        <h2 id="others-title" className="head text-head">
          The other four
        </h2>
        <ul className="mt-10">
          {others.map((o) => (
            <li key={o.slug}>
              <Link
                href={`/glasses/${o.slug}`}
                className="group grid min-h-16 grid-cols-[1fr_auto] items-baseline gap-x-6 border-b border-line py-5 hover:bg-surface sm:grid-cols-[2fr_1fr_auto]"
              >
                <span className="font-medium group-hover:underline">{o.name}</span>
                <span className="hidden text-muted sm:block">{o.bestFor}</span>
                <span className="nums">${o.dailyUsd} / day</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
