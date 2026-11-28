"use client";

import { ThemedImage } from "@/components/themed-image";
import { useEffect, useId, useRef, useState } from "react";
import type { CloserLookKey } from "@/lib/closer-look";
import type { GlassesSlug } from "@/lib/glasses";
import type { Photo } from "@/lib/media";
import { FeatureMotion } from "./feature-motion";

type Item = {
  key: CloserLookKey;
  label: string;
  body: string;
  alt: string;
  photo: Photo;
};

// Home page: the pair stays on screen while the page scrolls past, and each stretch of
// scroll shows one feature working on it. The section is tall; its inside sticks to the
// screen. The dots jump to a feature. Every feature's text stays in the page for
// screen readers; only its opacity changes.
const SCREENS_PER_FEATURE = 0.8;

export function FeatureStage({
  slug,
  title,
  items,
}: {
  slug: GlassesSlug;
  title: string;
  items: Item[];
}) {
  const id = useId();
  const section = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  // Stacked pictures can't be told apart by lazy loading: mount one when it is near
  const [seen, setSeen] = useState<ReadonlySet<number>>(() => new Set([0, 1]));
  const n = items.length;

  useEffect(() => {
    const node = section.current;
    if (!node) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = node.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      if (total <= 0) return;
      const p = Math.min(1, Math.max(0, -rect.top / total));
      const next = Math.min(n - 1, Math.floor(p * n));
      setActive(next);
      setSeen((prev) => {
        const want = [next, next + 1].filter((i) => i < n && !prev.has(i));
        if (want.length === 0) return prev;
        const grown = new Set(prev);
        want.forEach((i) => grown.add(i));
        return grown;
      });
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [n]);

  const go = (i: number) => {
    const node = section.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    const total = rect.height - window.innerHeight;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    window.scrollTo({
      top: window.scrollY + rect.top + ((i + 0.5) / n) * total,
      behavior: reduce ? "auto" : "smooth",
    });
  };

  return (
    <section
      ref={section}
      aria-labelledby={`${id}-title`}
      className="relative bg-stage"
      style={{ height: `calc(${n * SCREENS_PER_FEATURE} * 100svh + 100svh)` }}
    >
      {/* On a short, wide screen the words sit beside the picture instead of above it */}
      <div className="sticky top-0 flex h-[100svh] flex-col items-center overflow-hidden px-margin pb-6 pt-20 short:flex-row short:gap-8 short:pb-12 short:pt-16 lg:pt-24">
        <div className="w-full short:flex-1">
          <h2
            id={`${id}-title`}
            className="text-center font-medium text-ink/60"
          >
            {title}
          </h2>

          {/* Every feature's words share one cell; the current one is the visible one */}
          <ul className="mx-auto mt-3 grid w-full max-w-[60rem] text-center lg:mt-4">
            {items.map((item, i) => (
              <li
                key={item.key}
                className={`col-start-1 row-start-1 transition-[opacity,translate] duration-[600ms] ease-[var(--ease-out)] motion-reduce:transition-none ${
                  i === active
                    ? "translate-y-0 opacity-100"
                    : "pointer-events-none translate-y-3 opacity-0"
                }`}
              >
                <h3 className="display text-[clamp(2rem,1.2rem+3.4vw,4.25rem)] short:text-[2rem]">
                  {item.label}
                </h3>
                <p className="mx-auto mt-3 max-w-[44ch] lg:mt-4 lg:max-w-[62ch] lg:text-lead short:text-base">
                  {item.body}
                </p>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-4 grid min-h-0 w-full flex-1 place-items-center [container-type:size] short:mt-0 short:h-full">
          <div className="stage-pic relative aspect-[3/2] w-[min(100cqw,150cqh,72rem)]">
            {items.map((item, i) => (
              <div
                key={item.key}
                aria-hidden={i !== active}
                className={`absolute inset-0 transition-[opacity,scale] duration-[900ms] ease-[var(--ease-out)] motion-reduce:transition-none ${
                  i === active
                    ? "scale-100 opacity-100"
                    : "scale-[1.04] opacity-0"
                }`}
              >
                {seen.has(i) && (
                  <ThemedImage
                    photo={item.photo}
                    alt={i === active ? item.alt : ""}
                    fill
                    sizes="(min-width: 1024px) 1152px, 100vw"
                    className="object-cover"
                  />
                )}
                {i === active && (
                  <FeatureMotion slug={slug} feature={item.key} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-1 short:absolute short:inset-x-0 short:bottom-1 short:justify-center">
          {items.map((item, i) => (
            <button
              key={item.key}
              type="button"
              aria-label={item.label}
              aria-current={i === active ? "true" : undefined}
              onClick={() => go(i)}
              className="group grid h-11 min-w-8 place-items-center px-1"
            >
              <span
                className={`block h-2 rounded-full transition-[width,background-color] duration-500 ease-[var(--ease-out)] ${
                  i === active
                    ? "w-8 bg-ink"
                    : "w-2 bg-ink/25 group-hover:bg-ink/50"
                }`}
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
