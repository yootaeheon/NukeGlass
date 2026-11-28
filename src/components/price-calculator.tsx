"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { localePath, type Locale } from "@/i18n/config";
import { fmt } from "@/i18n/format";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { BOOKING_RULES, discountPct, priceForDays } from "@/lib/booking";
import { GLASSES } from "@/lib/glasses";
import { PRODUCT_IMAGES } from "@/lib/media";

// Takes only the strings it shows, so the rest of the dictionary stays out of the client bundle
export function PriceCalculator({
  lang,
  t,
  dayLabels,
}: {
  lang: Locale;
  t: Dictionary["home"];
  dayLabels: Pick<Dictionary["book"], "day" | "days">;
}) {
  const [slug, setSlug] = useState(GLASSES[0].slug);
  const [days, setDays] = useState(5);
  const g = GLASSES.find((x) => x.slug === slug) ?? GLASSES[0];
  const sum = priceForDays(g.dailyUsd, days);
  const saved = g.dailyUsd * days - sum;
  const pct = discountPct(days);

  return (
    <div className="grid gap-10 lg:grid-cols-12" data-ui>
      <div className="rounded-2xl relative aspect-[3/2] self-start overflow-hidden bg-product lg:col-span-6">
        {GLASSES.map((x) => (
          <Image
            key={x.slug}
            src={PRODUCT_IMAGES[x.slug].src}
            alt={x.slug === slug ? x.name : ""}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className={`object-cover transition-[opacity,transform] duration-700 motion-reduce:transition-none ease-[var(--ease-out)] ${
              x.slug === slug ? "scale-100 opacity-100" : "scale-95 opacity-0"
            }`}
          />
        ))}
      </div>

      <div className="lg:col-span-5 lg:col-start-8">
        <fieldset>
          <legend className="font-medium">{t.calcGlasses}</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {GLASSES.map((x) => (
              <label key={x.slug} className="cursor-pointer">
                <input
                  type="radio"
                  name="calc-model"
                  value={x.slug}
                  checked={x.slug === slug}
                  onChange={() => setSlug(x.slug)}
                  className="peer sr-only"
                />
                <span className="inline-flex min-h-11 items-center rounded-full bg-bg px-4 text-small transition-colors duration-200 hover:bg-accent-tint peer-checked:bg-ink peer-checked:text-white peer-focus-visible:outline-2 peer-focus-visible:outline-accent">
                  {x.name.replace(/^(Ray-Ban|Oakley) Meta /, "").replace(/ \(Gen 2\)$/, "")}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="mt-8">
          <label htmlFor="calc-days" className="flex items-baseline justify-between font-medium">
            <span>{t.calcDays}</span>
            <span className="nums text-lead">{fmt(days === 1 ? dayLabels.day : dayLabels.days, { n: days })}</span>
          </label>
          <input
            id="calc-days"
            type="range"
            min={1}
            max={BOOKING_RULES.maxDays}
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="range mt-2"
          />
        </div>

        <div className="mt-8 rounded-2xl bg-bg p-6 shadow-[var(--shadow-sm)]" aria-live="polite">
          <p className="text-small text-muted">{t.calcTotal}</p>
          <p className="nums head mt-1 text-[clamp(3rem,2rem+4vw,5.5rem)] leading-none">
            <span key={sum} className="inline-block animate-[fade_360ms_var(--ease-out)_both] motion-reduce:animate-none">${sum}</span>
            {pct > 0 && <span className="ml-3 align-middle text-lead font-medium text-accent">−{pct}%</span>}
          </p>
          <p className="mt-3 text-ink">{fmt(t.calcPerDay, { n: (sum / days).toFixed(days > 1 && sum % days ? 2 : 0) })}</p>
          <p className="mt-1 text-small text-muted">{saved > 0 ? fmt(t.calcSave, { n: saved }) : t.calcNoSave}</p>
        </div>

        <Link href={localePath(lang, `/book?model=${slug}`)} className="btn btn-primary mt-6 w-full sm:w-auto">
          {t.calcBook} <span className="arrow ml-3" aria-hidden="true">→</span>
        </Link>
      </div>
    </div>
  );
}
