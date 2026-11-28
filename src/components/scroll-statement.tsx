"use client";

import { Fragment, useEffect, useRef, type CSSProperties } from "react";

// A large statement that lights up phrase by phrase as it is scrolled through.
// Without script, or with reduced motion, every phrase is fully lit (--p defaults to 1).
export function ScrollStatement({
  phrases,
  joiner,
  className = "",
}: {
  phrases: string[];
  /** " " for languages that put spaces between words, "" for the others */
  joiner: string;
  className?: string;
}) {
  const el = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const node = el.current;
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = node.getBoundingClientRect();
      const vh = window.innerHeight;
      // Starts as the first line comes up from the bottom, done before it leaves the middle
      const p = (vh * 0.85 - rect.top) / (rect.height + vh * 0.4);
      node.style.setProperty("--p", Math.min(1, Math.max(0, p)).toFixed(3));
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
  }, []);

  return (
    <p
      ref={el}
      className={`lit ${className}`}
      style={{ "--n": phrases.length } as CSSProperties}
    >
      {phrases.map((phrase, i) => (
        <Fragment key={phrase}>
          <span style={{ "--i": i } as CSSProperties}>{phrase}</span>
          {i < phrases.length - 1 ? joiner : ""}
        </Fragment>
      ))}
    </p>
  );
}
