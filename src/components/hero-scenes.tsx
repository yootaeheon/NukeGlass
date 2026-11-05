"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { localePath, type Locale } from "@/i18n/config";
import { fmt } from "@/i18n/format";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { PHOTOS } from "@/lib/media";

// Four real places in Seoul. Over each, the lens panel shows the Korean the traveller
// sees and types out the kind of answer they hear. Lines only say what the sign says;
// Meta AI Korean support is still to be checked on a real pair.
const SCENES = [
  { ko: "근정전", photo: PHOTOS.throneHall },
  { ko: "된장찌개 9,000원", photo: PHOTOS.market },
  { ko: "아이스 아메리카노", photo: PHOTOS.insadong },
  { ko: "북촌로", photo: PHOTOS.bukchon },
];

const SCENE_MS = 6000;
const TYPE_MS = 28;

const REDUCE_QUERY = "(prefers-reduced-motion: reduce)";
function subscribeReducedMotion(cb: () => void) {
  const mq = window.matchMedia(REDUCE_QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

export function HeroScenes({ lang, t, exampleAnswer }: { lang: Locale; t: Dictionary["hero"]; exampleAnswer: string }) {
  const [index, setIndex] = useState(0);
  const [typed, setTyped] = useState(0);
  const reduceMotion = useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCE_QUERY).matches,
    () => false,
  );
  // null until the visitor presses Play/Pause; reduced motion starts paused
  const [choice, setChoice] = useState<boolean | null>(null);
  const [tabHidden, setTabHidden] = useState(false);
  const wantsPlay = choice ?? !reduceMotion;
  const playing = wantsPlay && !tabHidden;

  const scene = { ...SCENES[index], ...t.scenes[index] };
  const answer = scene.heard;
  const shown = reduceMotion ? answer.length : typed;

  useEffect(() => {
    if (!playing) return;
    const id = window.setTimeout(() => {
      setIndex((i) => (i + 1) % SCENES.length);
      setTyped(0);
    }, SCENE_MS);
    return () => window.clearTimeout(id);
  }, [playing, index]);

  // Type the answer out once the Korean has appeared
  useEffect(() => {
    if (reduceMotion || typed >= answer.length) return;
    const id = window.setTimeout(() => setTyped((n) => n + 1), typed === 0 ? 700 : TYPE_MS);
    return () => window.clearTimeout(id);
  }, [typed, answer, reduceMotion]);

  // Pause while the tab is hidden; resume on return unless the visitor pressed Pause.
  useEffect(() => {
    const onVisibility = () => setTabHidden(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  const go = (i: number) => {
    setIndex(i);
    setTyped(0);
  };

  return (
    <section aria-labelledby="hero-title" className="on-dark relative -mt-16 flex min-h-svh flex-col overflow-hidden bg-field-dark text-white lg:-mt-[72px]">
      {/* The places, crossfading with a slow drift */}
      <div aria-hidden="true" className="absolute inset-0">
        {SCENES.map((s, i) => (
          <div
            key={s.ko}
            className={`absolute inset-0 transition-opacity duration-[1400ms] ease-[var(--ease-out)] ${i === index ? "opacity-100" : "opacity-0"}`}
          >
            <Image
              key={i === index ? `on-${index}` : `off-${i}`}
              src={s.photo.src}
              alt=""
              fill
              priority={i === 0}
              sizes="100vw"
              className={`object-cover ${i === index ? "drift" : ""}`}
              style={{ animationPlayState: playing ? "running" : "paused" }}
            />
          </div>
        ))}
        {/* Neutral scrim so the white type reads on any picture */}
        <div className="absolute inset-0 bg-[rgba(18,20,22,0.42)]" />
      </div>

      <div className="relative mx-auto flex w-full max-w-[1440px] flex-1 flex-col px-margin pb-6 pt-24 lg:pt-28">
        {/* Lens panel: what the glasses see and what you hear */}
        <div
          data-ui
          aria-live="off"
          className="w-full max-w-[420px] self-end bg-[rgba(18,20,22,0.72)] p-5 sm:p-6 lg:absolute lg:right-[var(--margin)] lg:top-[22%]"
        >
          <p className="flex items-center justify-between text-small text-field-dark-muted">
            <span>{t.see}</span>
            <span className="flex items-center gap-2">
              <span className="size-2 animate-pulse rounded-full bg-[#4ade80] motion-reduce:animate-none" />
              {scene.place}
            </span>
          </p>
          <p
            key={scene.ko}
            lang="ko"
            className="ko mt-2 animate-[fade_600ms_var(--ease-out)_both] text-[clamp(1.75rem,1.2rem+2vw,2.75rem)] leading-tight motion-reduce:animate-none"
          >
            {scene.ko}
          </p>
          <p className="mt-5 text-small text-field-dark-muted">
            {t.hear}
            {index < 3 && ` · ${exampleAnswer}`}
          </p>
          <p className="mt-1 min-h-[3.2em] text-lead">
            {answer.slice(0, shown)}
            {shown < answer.length && (
              <span className="ml-0.5 inline-block h-[1em] w-[2px] translate-y-[0.15em] animate-[caret_900ms_steps(1)_infinite] bg-white" />
            )}
          </p>
        </div>

        <div className="mt-auto pt-10">
          <h1 id="hero-title" className="display hero-title max-w-[14ch]" data-reveal>
            {t.titleA} {t.titleB}
          </h1>
          <p className="mt-6 max-w-[46ch] text-lead text-white" data-reveal style={{ "--d": "90ms" } as React.CSSProperties}>
            {t.subA} {t.subB}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row" data-reveal style={{ "--d": "180ms" } as React.CSSProperties}>
            <Link href={localePath(lang, "/glasses")} className="btn btn-light">
              {t.cta} <span className="arrow ml-3" aria-hidden="true">→</span>
            </Link>
          </div>

          {/* Scene index: one bar per place, the active one fills over its time */}
          <div className="mt-8 flex items-end gap-4 lg:mt-12">
            <ol className="grid flex-1 grid-cols-4 gap-2 sm:gap-4">
              {SCENES.map((s, i) => (
                <li key={s.ko}>
                  <button
                    type="button"
                    onClick={() => go(i)}
                    aria-label={fmt(t.scene, { n: i + 1 })}
                    aria-current={i === index ? "step" : undefined}
                    className="group block w-full py-3 text-left"
                  >
                    <span className="relative block h-[3px] overflow-hidden bg-white/25">
                      <span
                        key={i === index ? `bar-${index}-${playing}` : `bar-${i}`}
                        className={`absolute inset-0 origin-left bg-white ${
                          i < index ? "scale-x-100" : i === index ? (playing ? "" : "scale-x-100") : "scale-x-0"
                        }`}
                        style={i === index && playing ? { animation: `progress ${SCENE_MS}ms linear both` } : undefined}
                      />
                    </span>
                    <span
                      className={`mt-3 hidden truncate text-small transition-colors sm:block ${
                        i === index ? "text-white" : "text-white/60 group-hover:text-white"
                      }`}
                    >
                      {t.scenes[i].place.split(",")[0]}
                    </span>
                  </button>
                </li>
              ))}
            </ol>
            <button
              type="button"
              onClick={() => setChoice(!wantsPlay)}
              className="mb-1 min-h-12 shrink-0 px-2 text-small underline"
            >
              {playing ? t.pause : t.play}
            </button>
          </div>
        </div>
      </div>
      <p className="sr-only">{t.srDescription}</p>
    </section>
  );
}
