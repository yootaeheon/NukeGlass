import Link from "next/link";
import { HeroScenes } from "@/components/hero-scenes";
import { TryIt } from "@/components/try-it";
import { FrameDrawing } from "@/components/frame-drawing";
import { GLASSES } from "@/lib/glasses";

const STEPS = [
  {
    line: "First, pick a pair and your dates.",
    detail: "Book by the day. Sign in with Google so you can find your booking later.",
  },
  {
    line: "Then collect them at Incheon Airport.",
    detail: "We meet you at Terminal 1 or 2 at the time you chose. The exact meeting point comes with your confirmation.",
  },
  {
    line: "Pair them with your phone in five minutes.",
    detail: "Install the free Meta AI app, open the case next to your phone and follow the prompts.",
  },
  {
    line: "Drop them back before you fly.",
    detail: "Hand the case back at the airport on your return day. We clean, charge and reset every pair.",
  },
];

const FAQ = [
  {
    q: "Do I need my own phone?",
    a: "Yes. The glasses pair with the free Meta AI app on iPhone or Android, and use your phone’s data or Wi-Fi.",
  },
  {
    q: "How long does the battery last?",
    a: "Most of a sightseeing day. Ray-Ban Meta Gen 2 runs up to 8 hours, and a short break in the charging case adds more.",
  },
  {
    q: "Will they understand Korean signs and speech?",
    a: "Translation comes from Meta AI, and its language support changes over time. We test the current Korean support on every pair before hand-over and tell you what works on the day.",
  },
  {
    q: "Do the glasses give walking directions?",
    a: "Your phone does. Start walking directions in a map app such as Naver Map or Google Maps and its voice plays through the glasses’ open-ear speakers, in the language the app is set to.",
  },
  {
    q: "I wear prescription glasses.",
    a: "Our frames come with clear or sun lenses, not your prescription. Contact lenses work well with them.",
  },
  {
    q: "Can I film anywhere?",
    a: "Filming people without their consent can be illegal in Korea. A light on the frame shows when you are recording. Some palace halls do not allow photos.",
  },
  {
    q: "What if I lose or break them?",
    a: "Tell us straight away. Our damage and loss terms come with your booking confirmation, before you pay anything.",
  },
];

export default function Home() {
  const fromPrice = Math.min(...GLASSES.map((g) => g.dailyUsd));

  return (
    <>
      <HeroScenes />

      {/* Translation: point at it, hear it */}
      <section aria-labelledby="translate-title" className="mx-auto max-w-[1440px] px-margin pt-section">
        <div className="grid gap-10 lg:grid-cols-12">
          <h2 id="translate-title" className="display text-display lg:col-span-7" data-reveal>
            Look at it. Ask what it says.
          </h2>
          <p className="max-w-[46ch] self-end text-lead text-muted lg:col-span-5" data-reveal>
            Look at a palace notice, a menu or a subway sign and ask Meta AI about it. The answer comes in your ear while
            your hands stay free. Tap a sign for an example.
          </p>
        </div>
        <div className="mt-12" data-reveal>
          <TryIt />
          <p className="mt-4 max-w-[60ch] text-small text-muted">
            Examples of what each sign says. Meta AI’s support for Korean changes over time, so we check it on every pair
            before hand-over and tell you what works on the day.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" aria-labelledby="how-title" className="mx-auto max-w-[1440px] scroll-mt-20 px-margin pt-section">
        <h2 id="how-title" className="sr-only">
          How it works
        </h2>
        <ol className="space-y-14">
          {STEPS.map((s, i) => (
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
              Five pairs, one day at a time.
            </h2>
            <div className="mt-10 hidden bg-surface p-10 text-ink lg:block" data-reveal>
              <FrameDrawing shape="wayfarer" label="Ray-Ban Meta Wayfarer, line drawing" className="w-full" />
            </div>
          </div>
          <ul className="lg:col-span-7 lg:col-start-6">
            {GLASSES.map((g) => (
              <li key={g.slug}>
                <Link
                  href={`/glasses/${g.slug}`}
                  className="group grid min-h-16 grid-cols-[1fr_auto] items-baseline gap-x-6 gap-y-1 border-b border-line py-5 transition-colors hover:bg-surface"
                >
                  <span className="text-lead font-medium group-hover:underline">{g.name}</span>
                  <span className="nums font-semibold">${g.dailyUsd} / day</span>
                  <span className="text-muted">{g.bestFor}</span>
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
            Glasses from{" "}
            <span className="nums inline-block bg-accent px-[0.12em] text-white">${fromPrice}</span> a day.
          </h2>
          <div className="mt-12 grid gap-8 md:grid-cols-12">
            <p className="max-w-[52ch] md:col-span-7">
              Every rental comes with the charging case and a USB-C cable. You pay per calendar day, pick-up and return
              day included. Prices are in US dollars.
            </p>
            <div className="md:col-span-4 md:col-start-9 md:justify-self-end">
              <Link href="/glasses" className="btn btn-primary w-full md:w-auto">
                See all five
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" aria-labelledby="faq-title" className="mx-auto max-w-[1440px] scroll-mt-20 px-margin py-section">
        <h2 id="faq-title" className="head text-head">
          Before you ask
        </h2>
        <dl className="mt-12 space-y-12">
          {FAQ.map((f) => (
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
            Your first sign
            <br />
            is waiting.
          </h2>
          <div className="mt-16 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <p className="max-w-[44ch] text-field-dark-muted">
              Book today, collect at Incheon Airport, and read Seoul from the first afternoon.
            </p>
            <Link href="/book" className="btn btn-primary w-full md:w-auto">
              Book glasses
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
