"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";

// Until the hero footage is shot (docs/design/DESIGN.md §8), the hero plays these
// type-only scenes: the Korean the traveller sees, and the kind of answer they hear.
// Lines only say what the sign says; Meta AI Korean support is still to be checked on a real pair.
// When the files exist, set HERO_VIDEO and the same captions run over the video.
const HERO_VIDEO: { webm: string; mp4: string; poster: string } | null = null;

// The Korean the traveller sees stays Korean in every language; what they hear comes from the dictionary.
const SCENE_KO = ["근정전", "된장찌개 9,000원", "아이스 아메리카노", "북촌로"];

const SCENE_MS = 4800;

const REDUCE_QUERY = "(prefers-reduced-motion: reduce)";
function subscribeReducedMotion(cb: () => void) {
  const mq = window.matchMedia(REDUCE_QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

export function HeroScenes({ lang, t, exampleAnswer }: { lang: Locale; t: Dictionary["hero"]; exampleAnswer: string }) {
  const [index, setIndex] = useState(0);
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
  const setPlaying = (next: boolean | ((p: boolean) => boolean)) =>
    setChoice(typeof next === "function" ? next(wantsPlay) : next);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % SCENE_KO.length), SCENE_MS);
    return () => window.clearInterval(id);
  }, [playing]);

  // Pause while the tab is hidden; resume on return unless the visitor pressed Pause.
  useEffect(() => {
    const onVisibility = () => setTabHidden(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (playing) void v.play().catch(() => setChoice(false));
    else v.pause();
  }, [playing]);

  const scene = { ko: SCENE_KO[index], ...t.scenes[index] };

  return (
    <section aria-labelledby="hero-title" className="on-dark relative flex min-h-svh flex-col overflow-hidden bg-field-dark text-white">
      {HERO_VIDEO && (
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover"
          poster={HERO_VIDEO.poster}
          muted
          loop
          playsInline
          aria-hidden="true"
        >
          <source src={HERO_VIDEO.webm} type="video/webm" />
          <source src={HERO_VIDEO.mp4} type="video/mp4" />
        </video>
      )}

      {/* What the traveller sees: the Korean, large and quiet behind the headline */}
      {!HERO_VIDEO && (
        <div aria-hidden="true" className="absolute inset-0 flex items-end justify-center pb-[18svh]">
          <p
            key={scene.ko}
            lang="ko"
            className="ko animate-[scene_4800ms_var(--ease-out)_both] whitespace-nowrap text-[clamp(4rem,18vw,16rem)] leading-none text-white/[0.14] motion-reduce:animate-none"
          >
            {scene.ko}
          </p>
        </div>
      )}

      <div className="relative mx-auto flex w-full max-w-[1440px] flex-1 flex-col px-margin pb-8 pt-28">
        <h1 id="hero-title" className="display text-center text-display font-normal">
          {t.titleA}
          <br />
          {t.titleB}
        </h1>
        <div className="mx-auto mt-8 grid max-w-[1100px] gap-2 text-center text-lead text-white/90 md:mt-12 md:grid-cols-2 md:gap-16 md:text-left">
          <p>{t.subA}</p>
          <p className="md:text-right">{t.subB}</p>
        </div>

        <div className="mt-auto flex flex-col gap-6 pt-16">
          {/* What the traveller hears */}
          <div className="max-w-[40ch]">
            <p className="text-small text-field-dark-muted">
              {scene.place}
              {index < 3 && ` · ${exampleAnswer}`}
            </p>
            <p key={scene.heard} className="mt-1 text-lead animate-[fade_600ms_var(--ease-out)_both] motion-reduce:animate-none">
              {scene.heard}
            </p>
          </div>
          <div className="flex items-center justify-between gap-4">
            <Link href={localePath(lang, "/glasses")} className="btn btn-light w-full sm:w-auto">
              {t.cta}
            </Link>
            <button
              type="button"
              onClick={() => setPlaying((p) => !p)}
              className="min-h-12 shrink-0 px-2 text-small underline"
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
