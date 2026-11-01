"use client";

import { useState, useSyncExternalStore } from "react";
import type { Dictionary } from "@/i18n/dictionaries/en";

const noop = () => () => {};

// The signs stay Korean in every language; what they mean comes from the dictionary.
const SIGNS_KO = ["관람 시간 09:00–18:00", "된장찌개", "갈아타는 곳", "주문은 카운터에서"];

// Without JS every pair stays readable: the meaning is in the markup, only hidden after hydration.
export function TryIt({ signs }: { signs: Dictionary["tryIt"] }) {
  const [active, setActive] = useState<number | null>(null);
  const hydrated = useSyncExternalStore(noop, () => true, () => false);

  return (
    <div className="grid grid-cols-2 gap-px bg-surface lg:grid-cols-4">
      {SIGNS_KO.map((ko, i) => {
        const open = !hydrated || active === i;
        return (
          <div key={ko} className="bg-bg">
            <button
              type="button"
              aria-expanded={open}
              aria-controls={`try-${i}`}
              onClick={() => setActive(active === i ? null : i)}
              className="flex min-h-32 w-full flex-col items-start justify-between gap-4 p-5 text-left transition-colors hover:bg-surface"
            >
              <span className="text-small text-muted">{signs[i].where}</span>
              <span lang="ko" className="ko text-lead">
                {ko}
              </span>
            </button>
            <p id={`try-${i}`} hidden={!open} className="bg-accent px-5 py-4 text-white">
              {signs[i].meaning}
            </p>
          </div>
        );
      })}
    </div>
  );
}
