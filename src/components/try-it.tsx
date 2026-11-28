"use client";

import Image from "next/image";
import { useState, useSyncExternalStore } from "react";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { PHOTOS } from "@/lib/media";

const noop = () => () => {};

// The signs stay Korean in every language; what they mean comes from the dictionary.
// Each sits over a real photograph of the kind of place you meet it.
const SIGNS = [
  { ko: "관람 시간 09:00–18:00", photo: PHOTOS.dancheong },
  { ko: "된장찌개", photo: PHOTOS.jeon },
  { ko: "갈아타는 곳", photo: PHOTOS.platform },
  { ko: "주문은 카운터에서", photo: PHOTOS.myeongdong },
];

// Without JS every pair stays readable: the meaning is in the markup, only hidden after hydration.
export function TryIt({ signs }: { signs: Dictionary["tryIt"] }) {
  const [active, setActive] = useState<number | null>(0);
  const hydrated = useSyncExternalStore(noop, () => true, () => false);

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {SIGNS.map((s, i) => {
        const open = !hydrated || active === i;
        return (
          <div key={s.ko} className="relative" data-reveal="media" style={{ "--d": `${i * 80}ms` } as React.CSSProperties}>
            <button
              type="button"
              aria-expanded={open}
              aria-controls={`try-${i}`}
              onClick={() => setActive(active === i ? null : i)}
              className="rounded-2xl zoom group relative block aspect-[4/3] w-full sm:aspect-[4/5] overflow-hidden bg-field-dark text-left text-white"
            >
              <Image
                src={s.photo.src}
                alt=""
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover"
              />
              <span className="absolute inset-0 bg-[rgba(18,20,22,0.38)] transition-colors duration-500 group-hover:bg-[rgba(18,20,22,0.5)]" />
              <span className="absolute inset-x-0 top-0 p-5 text-small text-white/85">{signs[i].where}</span>
              <span lang="ko" className="ko absolute inset-x-0 top-12 px-5 text-[clamp(1.5rem,1.1rem+1.2vw,2rem)] leading-tight">
                {s.ko}
              </span>
              <span
                className={`absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 px-5 py-4 text-small transition-opacity duration-300 ${
                  open ? "opacity-0" : "opacity-100"
                }`}
                aria-hidden="true"
              >
                <span>Hey Meta…</span>
                <span className="grid size-10 place-items-center rounded-full bg-white text-lead text-ink transition-transform duration-300 group-hover:scale-110">
                  +
                </span>
              </span>
            </button>
            {/* The answer sits beside the button (not inside it) and over the tile's foot */}
            <p
              id={`try-${i}`}
              hidden={!open}
              className="pointer-events-none absolute inset-x-0 bottom-0 animate-[fade_420ms_var(--ease-out)_both] bg-accent px-5 py-5 text-lead text-white motion-reduce:animate-none"
            >
              {signs[i].meaning}
            </p>
          </div>
        );
      })}
    </div>
  );
}
