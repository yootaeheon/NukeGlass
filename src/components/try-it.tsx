"use client";

import { useState, useSyncExternalStore } from "react";

const noop = () => () => {};

const SIGNS = [
  { ko: "관람 시간 09:00–18:00", en: "Visiting hours: 9 am to 6 pm.", where: "Palace notice" },
  { ko: "된장찌개", en: "Doenjang-jjigae, soybean paste stew.", where: "Menu" },
  { ko: "갈아타는 곳", en: "Transfer to another line here.", where: "Subway sign" },
  { ko: "주문은 카운터에서", en: "Please order at the counter.", where: "Café" },
];

// Without JS every pair stays readable: the English is in the markup, only hidden after hydration.
export function TryIt() {
  const [active, setActive] = useState<number | null>(null);
  const hydrated = useSyncExternalStore(noop, () => true, () => false);

  return (
    <div className="grid grid-cols-2 gap-px bg-surface lg:grid-cols-4">
      {SIGNS.map((s, i) => {
        const open = !hydrated || active === i;
        return (
          <div key={s.ko} className="bg-bg">
            <button
              type="button"
              aria-expanded={open}
              aria-controls={`try-${i}`}
              onClick={() => setActive(active === i ? null : i)}
              className="flex min-h-32 w-full flex-col items-start justify-between gap-4 p-5 text-left transition-colors hover:bg-surface"
            >
              <span className="text-small text-muted">{s.where}</span>
              <span lang="ko" className="ko text-lead">
                {s.ko}
              </span>
            </button>
            <p id={`try-${i}`} hidden={!open} className="bg-accent px-5 py-4 text-white">
              {s.en}
            </p>
          </div>
        );
      })}
    </div>
  );
}
