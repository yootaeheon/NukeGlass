"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { HERO_VIDEO } from "@/lib/media";

const REDUCE_QUERY = "(prefers-reduced-motion: reduce)";

type NetworkInformation = { saveData?: boolean; effectiveType?: string };

// "motion": play the film. "still": poster only (reduced motion, Save-Data, slow network).
// "unknown" on the server and during hydration, so nothing downloads before we know.
function motionPreference(): "motion" | "still" {
  if (window.matchMedia(REDUCE_QUERY).matches) return "still";
  const net = (navigator as Navigator & { connection?: NetworkInformation }).connection;
  if (net?.saveData || net?.effectiveType === "2g" || net?.effectiveType === "slow-2g") return "still";
  return "motion";
}
function subscribeMotion(cb: () => void) {
  const mq = window.matchMedia(REDUCE_QUERY);
  const net = (navigator as Navigator & { connection?: EventTarget }).connection;
  mq.addEventListener("change", cb);
  net?.addEventListener?.("change", cb);
  return () => {
    mq.removeEventListener("change", cb);
    net?.removeEventListener?.("change", cb);
  };
}

// Full-screen film of a traveller in Seoul wearing the glasses. Silent, looping, with a
// visible Pause control. Pauses while the tab is hidden or the hero is scrolled away.
export function HeroVideo({ lang, t }: { lang: Locale; t: Dictionary["hero"] }) {
  const section = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const pref = useSyncExternalStore(subscribeMotion, motionPreference, () => "unknown" as const);
  // null until the visitor presses Play/Pause
  const [choice, setChoice] = useState<boolean | null>(null);
  const [inView, setInView] = useState(true);
  const [tabHidden, setTabHidden] = useState(false);
  const wantsPlay = choice ?? pref === "motion";
  const playing = wantsPlay && inView && !tabHidden;

  useEffect(() => {
    const v = video.current;
    if (!v || pref === "unknown") return;
    if (playing) {
      v.play().catch((err: unknown) => {
        // Autoplay blocked: show Play. An AbortError only means pause() ran first.
        if (err instanceof DOMException && err.name === "NotAllowedError") setChoice(false);
      });
    }
    else v.pause();
  }, [playing, pref]);

  useEffect(() => {
    const onVisibility = () => setTabHidden(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting));
    if (section.current) io.observe(section.current);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      io.disconnect();
    };
  }, []);

  return (
    <section
      ref={section}
      aria-labelledby="hero-title"
      className="on-dark relative -mt-16 flex flex-col overflow-hidden bg-field-dark text-white lg:-mt-[72px] lg:min-h-svh"
    >
      {/* Phones and tablets: the whole 16:9 frame under the header, text below it.
          Desktop: full-bleed behind the text. */}
      <div aria-hidden="true" className="relative mt-16 aspect-video w-full lg:absolute lg:inset-0 lg:mt-0 lg:aspect-auto">
        <video
          ref={video}
          className="absolute inset-0 size-full object-cover"
          poster={HERO_VIDEO.poster}
          muted
          loop
          playsInline
          preload={pref === "motion" || choice ? "auto" : "none"}
        >
          <source src={HERO_VIDEO.src} type="video/mp4" />
        </video>
        {/* Desktop: neutral scrim so the white type reads on any frame */}
        <div className="absolute inset-0 hidden bg-[rgba(18,20,22,0.45)] lg:block" />
      </div>

      <div className="relative mx-auto flex w-full max-w-[1440px] flex-1 flex-col px-margin pb-6 pt-8 lg:pt-28">
        <div className="lg:mt-auto lg:pt-10">
          <h1 id="hero-title" className="display hero-title max-w-[14ch]" data-reveal>
            {t.titleA} {t.titleB}
          </h1>
          <p className="mt-6 max-w-[46ch] text-lead text-white" data-reveal style={{ "--d": "90ms" } as React.CSSProperties}>
            {t.subA} {t.subB}
          </p>
          <div
            className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"
            data-reveal
            style={{ "--d": "180ms" } as React.CSSProperties}
          >
            <Link href={localePath(lang, "/glasses")} className="btn btn-light">
              {t.cta}{" "}
              <span className="arrow ml-3" aria-hidden="true">
                →
              </span>
            </Link>
            <div className="flex items-center justify-between gap-4 sm:justify-end">
              <p className="text-small text-white">{t.videoNote}</p>
              <button
                type="button"
                onClick={() => setChoice(!wantsPlay)}
                disabled={pref === "unknown"}
                className="min-h-12 shrink-0 px-2 text-small underline disabled:invisible"
              >
                {wantsPlay ? t.pause : t.play}
              </button>
            </div>
          </div>
        </div>
      </div>
      <p className="sr-only">{t.srDescription}</p>
    </section>
  );
}
