"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { Photo } from "@/lib/media";

type Step = { line: string; detail: string };

// How it works: the steps scroll past while the picture beside them stays put and
// changes to match the step in the middle of the screen. On phones each step carries
// its own picture.
export function StickySteps({ steps, photos, alts }: { steps: Step[]; photos: Photo[]; alts: string[] }) {
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.step));
        }
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    refs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div className="grid gap-12 lg:grid-cols-12">
      <div className="hidden lg:col-span-6 lg:block">
        <div className="sticky top-24 aspect-[4/5] max-h-[calc(100svh-8rem)] w-full overflow-hidden bg-surface">
          {photos.map((p, i) => (
            <Image
              key={p.src}
              src={p.src}
              alt={alts[i]}
              fill
              sizes="50vw"
              className={`object-cover transition-[opacity,transform] duration-[900ms] ease-[var(--ease-out)] ${
                i === active ? "scale-100 opacity-100" : "scale-[1.06] opacity-0"
              }`}
            />
          ))}
          <p className="nums absolute bottom-5 left-5 bg-bg px-3 py-1 text-small font-medium" aria-hidden="true">
            {active + 1} / {steps.length}
          </p>
        </div>
      </div>
      <ol className="lg:col-span-5 lg:col-start-8">
        {steps.map((s, i) => (
          <li
            key={s.line}
            ref={(el) => {
              refs.current[i] = el;
            }}
            data-step={i}
            className="flex min-h-[48svh] flex-col justify-center py-10 first:pt-0 lg:min-h-[70svh]"
          >
            <div className="relative mb-8 aspect-[3/2] overflow-hidden bg-surface lg:hidden" data-reveal="media">
              <Image src={photos[i].src} alt={alts[i]} fill sizes="100vw" className="object-cover" />
            </div>
            <p
              className={`head text-[clamp(1.75rem,1.2rem+2vw,3rem)] transition-colors duration-500 ${
                i === active ? "text-ink" : "lg:text-ink/30"
              }`}
            >
              {s.line}
            </p>
            <p className={`mt-4 max-w-[46ch] transition-colors duration-500 ${i === active ? "text-ink" : "lg:text-ink/40"}`}>
              {s.detail}
            </p>
          </li>
        ))}
      </ol>
    </div>
  );
}
