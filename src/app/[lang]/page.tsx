import Link from "next/link";
import { HeroVideo } from "@/components/hero-video";
import { TryIt } from "@/components/try-it";
import { ProductRail } from "@/components/product-rail";
import { StickySteps } from "@/components/sticky-steps";
import { ParallaxBand } from "@/components/parallax-band";
import { PriceCalculator } from "@/components/price-calculator";
import { Icon, type IconName } from "@/components/icons";
import Image from "next/image";
import { PHOTOS, PRODUCT_IMAGES, SCENES } from "@/lib/media";
import { localePath } from "@/i18n/config";
import { resolveLang } from "@/i18n/server";

// Different sizes on purpose: a wide picture, a taller one, then the reverse
const MOMENTS = [
  {
    photo: SCENES.momentDirections,
    className: "lg:col-span-7",
    aspect: "aspect-[16/10]",
  },
  {
    photo: SCENES.momentTouch,
    className: "lg:col-span-5 lg:mt-20",
    aspect: "aspect-[4/3]",
  },
  {
    photo: SCENES.momentAsk,
    className: "lg:col-span-5",
    aspect: "aspect-[4/3]",
  },
  {
    photo: SCENES.momentCall,
    className: "lg:col-span-7 lg:mt-20",
    aspect: "aspect-[16/10]",
  },
];

const KO_WORDS = [
  "근정전",
  "된장찌개",
  "갈아타는 곳",
  "아이스 아메리카노",
  "주문은 카운터에서",
  "북촌로",
  "관람 시간",
  "출구",
];

// One per question, in the order of dict.home.faq
const FAQ_ICONS: IconName[] = [
  "phone",
  "battery",
  "chat",
  "pin",
  "glasses",
  "camera",
  "shield",
];

const d = (ms: number) => ({ "--d": `${ms}ms` }) as React.CSSProperties;

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang, dict } = await resolveLang(params);
  const t = dict.home;

  return (
    <>
      <HeroVideo lang={lang} t={dict.hero} />

      {/* The five pairs */}
      <section
        aria-labelledby="lineup-title"
        className="mx-auto max-w-[1440px] px-margin pt-section"
      >
        <div className="mb-12 grid gap-6 lg:grid-cols-12 lg:items-end">
          <h2
            id="lineup-title"
            className="display text-display lg:col-span-7"
            data-reveal
          >
            {t.lineupTitle}
          </h2>
          <div
            className="lg:col-span-4 lg:col-start-9"
            data-reveal
            style={d(90)}
          >
            <p className="text-lead">{t.lineupBody}</p>
            <Link
              href={localePath(lang, "/glasses")}
              className="link mt-4 inline-flex min-h-12 items-center font-medium"
            >
              {t.compare}{" "}
              <span className="arrow ml-2" aria-hidden="true">
                →
              </span>
            </Link>
          </div>
        </div>
        <ProductRail lang={lang} dict={dict} />
      </section>

      {/* Moments: the features in ordinary use (stills from the hero film) */}
      <section
        aria-labelledby="moments-title"
        className="mx-auto max-w-[1440px] px-margin pt-section"
      >
        <h2
          id="moments-title"
          className="display max-w-[18ch] text-display"
          data-reveal
        >
          {t.momentsTitle}
        </h2>
        <ul className="mt-12 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-y-16">
          {MOMENTS.map((m, i) => (
            <li
              key={m.photo.src}
              className={m.className}
              data-reveal
              style={d((i % 2) * 90)}
            >
              <div
                className={`relative overflow-hidden rounded-2xl bg-surface shadow-[var(--shadow-sm)] ${m.aspect}`}
                data-reveal="media"
              >
                <Image
                  src={m.photo.src}
                  alt={t.moments[i].alt}
                  fill
                  sizes="(min-width: 1024px) 58vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>
              <p className="mt-4 max-w-[38ch] text-lead">{t.moments[i].line}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Translation: look at it, ask */}
      <div className="mt-section bg-surface">
        <section
          aria-labelledby="translate-title"
          className="mx-auto max-w-[1440px] px-margin py-section"
        >
          <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
            <h2
              id="translate-title"
              className="display text-display lg:col-span-7"
              data-reveal
            >
              {t.translateTitle}
            </h2>
            <p
              className="max-w-[46ch] text-lead lg:col-span-4 lg:col-start-9"
              data-reveal
              style={d(90)}
            >
              {t.translateBody}
            </p>
          </div>
          <div className="mt-12">
            <TryIt signs={dict.tryIt} />
            <p className="mt-5 max-w-[70ch] text-small text-muted">
              {t.tryNote}
            </p>
          </div>
        </section>
      </div>

      {/* Korean you will meet, running past */}
      <div
        aria-hidden="true"
        className="overflow-hidden bg-warm py-6 text-white"
      >
        <div className="marquee flex w-max gap-12 whitespace-nowrap">
          {[...KO_WORDS, ...KO_WORDS].map((w, i) => (
            <span
              key={i}
              lang="ko"
              className="ko flex items-center gap-12 text-[clamp(1.5rem,1rem+2vw,2.75rem)]"
            >
              {w}
              <span className="size-2 rounded-full bg-white/60" />
            </span>
          ))}
        </div>
      </div>

      {/* How it works */}
      <section
        id="how-it-works"
        aria-labelledby="how-title"
        className="mx-auto max-w-[1440px] scroll-mt-20 px-margin pt-section"
      >
        <h2
          id="how-title"
          className="display mb-12 text-display lg:mb-4"
          data-reveal
        >
          {t.howTitle}
        </h2>
        <StickySteps
          steps={t.steps}
          photos={[
            PRODUCT_IMAGES["ray-ban-meta-wayfarer"],
            SCENES.airportPickup,
            SCENES.pairPhone,
            SCENES.returnDesk,
          ]}
        />
      </section>

      {/* One picture, one line */}
      <section aria-labelledby="band-title" className="mt-section">
        <ParallaxBand
          photo={SCENES.marketDusk}
          alt=""
          className="min-h-[85svh]"
        >
          <div className="mt-auto max-w-[1320px]">
            <h2 id="band-title" className="display text-display" data-reveal>
              {t.bandLine}
            </h2>
            <p
              className="mt-8 max-w-[44ch] text-lead"
              data-reveal
              style={d(90)}
            >
              {t.bandBody}
            </p>
          </div>
        </ParallaxBand>
      </section>

      {/* Price */}
      <div className="bg-surface">
        <section
          aria-labelledby="price-title"
          className="mx-auto max-w-[1440px] px-margin py-section"
        >
          <div className="mb-12 grid gap-6 lg:grid-cols-12 lg:items-end">
            <h2
              id="price-title"
              className="display text-display lg:col-span-7"
              data-reveal
            >
              {t.calcTitle}
            </h2>
            <p
              className="text-lead lg:col-span-4 lg:col-start-9"
              data-reveal
              style={d(90)}
            >
              {t.calcBody}
            </p>
          </div>
          <PriceCalculator
            lang={lang}
            t={t}
            dayLabels={{ day: dict.book.day, days: dict.book.days }}
          />
          <div className="mt-12 grid gap-4 lg:grid-cols-12">
            <p className="max-w-[60ch] lg:col-span-7">{t.priceBody}</p>
            <Link
              href={localePath(lang, "/policy")}
              className="link inline-flex min-h-12 items-center font-medium lg:col-span-4 lg:col-start-9"
            >
              {dict.policy.link}{" "}
              <span className="arrow ml-2" aria-hidden="true">
                →
              </span>
            </Link>
          </div>
        </section>
      </div>

      {/* FAQ */}
      <section
        id="faq"
        aria-labelledby="faq-title"
        className="mx-auto max-w-[1440px] scroll-mt-20 px-margin py-section"
      >
        <div className="grid gap-10 lg:grid-cols-12">
          <h2
            id="faq-title"
            className="display text-display lg:sticky lg:top-24 lg:col-span-5 lg:self-start"
            data-reveal
          >
            {t.faqTitle}
          </h2>
          <div className="lg:col-span-6 lg:col-start-7">
            {t.faq.map((f, i) => (
              <details
                key={f.q}
                className="group bg-surface/0 py-1"
                open={i === 0}
                data-reveal
                style={d(i * 50)}
              >
                <summary className="flex min-h-16 items-center gap-4 py-4 text-lead font-medium transition-colors hover:text-accent">
                  <span className="icon-chip">
                    <Icon name={FAQ_ICONS[i % FAQ_ICONS.length]} />
                  </span>
                  <span className="flex-1">{f.q}</span>
                  <span
                    className="plus grid size-10 shrink-0 place-items-center rounded-full bg-surface text-lead"
                    aria-hidden="true"
                  >
                    +
                  </span>
                </summary>
                <p className="answer max-w-[56ch] pb-6 pl-[3.75rem] pr-14">
                  {f.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Closing */}
      <section aria-labelledby="closing-title">
        <ParallaxBand photo={PHOTOS.namsan} alt="" className="min-h-[90svh]">
          <h2 id="closing-title" className="display text-display" data-reveal>
            {t.closingA}
            <br />
            {t.closingB}
          </h2>
          <div className="mt-auto flex flex-col gap-6 pt-16 md:flex-row md:items-end md:justify-between">
            <p className="max-w-[44ch] text-lead" data-reveal style={d(90)}>
              {t.closingBody}
            </p>
            <Link
              href={localePath(lang, "/book")}
              className="btn btn-light w-full md:w-auto"
              data-reveal
              style={d(180)}
            >
              {dict.nav.book}{" "}
              <span className="arrow ml-3" aria-hidden="true">
                →
              </span>
            </Link>
          </div>
        </ParallaxBand>
      </section>
    </>
  );
}
