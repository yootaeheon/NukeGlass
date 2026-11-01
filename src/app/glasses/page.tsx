import type { Metadata } from "next";
import Link from "next/link";
import { FrameDrawing } from "@/components/frame-drawing";
import { GLASSES, type Glasses } from "@/lib/glasses";

export const metadata: Metadata = {
  title: "The five pairs",
  description: "Ray-Ban Meta and Oakley Meta AI glasses to rent by the day in Seoul.",
};

const spec = (label: string) => (g: Glasses) => g.specs.find(([l]) => l === label)?.[1] ?? "—";

const COMPARE_ROWS: [string, (g: Glasses) => string][] = [
  ["Best for", (g) => g.bestFor],
  ["Camera", spec("Camera")],
  ["Battery", spec("Battery")],
  ["Audio", spec("Audio")],
  ["Per day", (g) => `$${g.dailyUsd}`],
];

export default function GlassesPage() {
  return (
    <>
      <div className="mx-auto max-w-[1440px] px-margin pb-16 pt-16">
        <h1 className="display text-display">The five pairs</h1>
        <p className="mt-6 max-w-[52ch] text-lead text-muted">
          Every pair has a camera, open-ear speakers and Meta AI. Pick the frame that suits your face and your trip.
        </p>
      </div>

      {GLASSES.map((g, i) => (
        <section key={g.slug} aria-labelledby={`${g.slug}-name`} className={i % 2 === 0 ? "bg-surface" : "bg-bg"}>
          <div className="mx-auto grid max-w-[1440px] items-center gap-10 px-margin py-16 lg:grid-cols-12 lg:py-24">
            <div className="text-ink lg:col-span-6" data-reveal>
              <FrameDrawing shape={g.shape} label={`${g.name}, line drawing`} className="mx-auto w-full max-w-[560px]" />
            </div>
            <div className="lg:col-span-5 lg:col-start-8">
              <h2 id={`${g.slug}-name`} className="head text-head">
                {g.name}
              </h2>
              <p className="mt-4 text-lead">{g.tagline}</p>
              <p className="mt-4 text-muted">{g.facts.join(". ")}.</p>
              <p className="nums mt-6 text-lead font-semibold">${g.dailyUsd} a day</p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
                <Link href={`/book?model=${g.slug}`} className="btn btn-primary">
                  Book this pair
                </Link>
                <Link href={`/glasses/${g.slug}`} className="link min-h-12 content-center">
                  Features and guide
                </Link>
              </div>
            </div>
          </div>
        </section>
      ))}

      <section aria-labelledby="compare-title" className="mx-auto max-w-[1440px] px-margin py-section">
        <h2 id="compare-title" className="head text-head">
          Side by side
        </h2>
        <div className="mt-10 overflow-x-auto" tabIndex={0} role="region" aria-labelledby="compare-title">
          <table className="w-full min-w-[760px] border-collapse text-left">
            <thead>
              <tr>
                <th scope="col" className="sticky left-0 bg-bg py-3 pr-6">
                  <span className="sr-only">Spec</span>
                </th>
                {GLASSES.map((g) => (
                  <th key={g.slug} scope="col" className="border-b border-line px-4 py-3 align-bottom font-medium">
                    {g.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARE_ROWS.map(([label, get]) => (
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
