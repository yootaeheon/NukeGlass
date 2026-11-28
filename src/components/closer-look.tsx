"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import type { CloserLookKey } from "@/lib/closer-look";
import type { Photo } from "@/lib/media";
import { FeatureMotion } from "./feature-motion";

type Item = { key: CloserLookKey; label: string; body: string; alt: string; photo: Photo };

// One feature open at a time; pressing the open one closes it. Desktop: the list on the
// left, the picture on the right crossfades (it keeps the last one while all are closed).
// Phone: the open row shows its own picture above its text.
export function CloserLook({ title, items }: { title: string; items: Item[] }) {
  const [open, setOpen] = useState<number | null>(0);
  const [shown, setShown] = useState(0);
  // Desktop frames are stacked in one box, so lazy loading can't tell them apart:
  // only mount a picture once its row has been opened.
  const [seen, setSeen] = useState<ReadonlySet<number>>(() => new Set([0]));
  const id = useId();
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const touched = useRef(false);

  // A row above may have just collapsed: keep the pressed row on screen
  useEffect(() => {
    if (!touched.current || open === null) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    buttons.current[open]?.scrollIntoView({ block: "nearest", behavior: reduce ? "auto" : "smooth" });
  }, [open]);

  const toggle = (i: number) => {
    touched.current = true;
    if (open === i) {
      setOpen(null);
    } else {
      setOpen(i);
      setShown(i);
      setSeen((prev) => (prev.has(i) ? prev : new Set(prev).add(i)));
    }
  };

  return (
    <section aria-labelledby={`${id}-title`} className="bg-surface">
      <div className="mx-auto max-w-[1440px] px-margin py-section">
        <h2 id={`${id}-title`} className="display text-[clamp(2.25rem,1.4rem+3vw,4.5rem)]" data-reveal>
          {title}
        </h2>

        <div className="mt-12 grid gap-10 lg:mt-16 lg:grid-cols-12 lg:items-start">
          <ul className="space-y-2 lg:col-span-4">
            {items.map((item, i) => {
              const isOpen = i === open;
              return (
                <li key={item.key} className={`transition-colors duration-[var(--dur-base)] ${isOpen ? "bg-bg" : ""}`}>
                  <button
                    ref={(el) => {
                      buttons.current[i] = el;
                    }}
                    id={`${id}-${item.key}-button`}
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={`${id}-${item.key}`}
                    onClick={() => toggle(i)}
                    className={`group flex min-h-14 w-full scroll-mt-24 items-center gap-4 px-4 text-left font-medium transition-colors ${
                      isOpen ? "" : "bg-bg/60 hover:bg-bg"
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`grid size-7 shrink-0 place-items-center transition-colors duration-[var(--dur-base)] ${
                        isOpen ? "bg-accent text-white" : "border border-ink text-ink group-hover:bg-ink group-hover:text-white"
                      }`}
                    >
                      <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.75">
                        <path d="M2.5 8h11" />
                        {!isOpen && <path d="M8 2.5v11" />}
                      </svg>
                    </span>
                    {item.label}
                  </button>
                  <div
                    id={`${id}-${item.key}`}
                    role="region"
                    aria-labelledby={`${id}-${item.key}-button`}
                    hidden={!isOpen}
                    className="px-4 pb-6 pl-[3.75rem]"
                  >
                    {/* Phone and tablet: the picture sits with its text */}
                    <div className="relative mb-5 aspect-[3/2] overflow-hidden bg-product lg:hidden">
                      <Image src={item.photo.src} alt={item.alt} fill sizes="100vw" className="object-cover" />
                      {isOpen && <FeatureMotion feature={item.key} />}
                    </div>
                    <p className="max-w-[46ch] animate-[fade_480ms_var(--ease-out)_both] motion-reduce:animate-none">
                      {item.body}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>

          {/* Desktop: one picture frame, crossfading between features */}
          <div
            className="relative hidden aspect-[3/2] overflow-hidden bg-product lg:sticky lg:top-28 lg:col-span-8 lg:block"
            data-reveal="media"
          >
            {items.map((item, i) => (
              <div
                key={item.key}
                aria-hidden={i !== shown}
                className={`absolute inset-0 transition-[opacity,transform] duration-[900ms] ease-[var(--ease-out)] motion-reduce:transition-none ${
                  i === shown ? "scale-100 opacity-100" : "scale-[1.03] opacity-0"
                }`}
              >
                {seen.has(i) && (
                  <Image
                    src={item.photo.src}
                    alt={i === shown ? item.alt : ""}
                    fill
                    sizes="66vw"
                    loading={i === 0 ? "eager" : "lazy"}
                    className="object-cover"
                  />
                )}
                {i === shown && <FeatureMotion feature={item.key} />}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
