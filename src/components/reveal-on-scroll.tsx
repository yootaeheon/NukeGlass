"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

// Content is visible without JS; this only adds the entrance motion.
export function RevealOnScroll() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]:not(.is-in)"));
    if (els.length === 0) return;
    document.documentElement.classList.add("reveal-ready");
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          e.target.classList.add("is-in");
          io.unobserve(e.target);
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    // Anything already on the first screen enters right away (a moment later, so the
    // hidden state paints first and it still animates); the -10% margin below would otherwise keep a hero button near the
    // bottom edge hidden until the visitor scrolls.
    const first = els.filter((el) => el.getBoundingClientRect().top < window.innerHeight);
    const timer = window.setTimeout(() => first.forEach((el) => el.classList.add("is-in")), 60);
    els.filter((el) => !first.includes(el)).forEach((el) => io.observe(el));
    return () => {
      window.clearTimeout(timer);
      io.disconnect();
    };
  }, [pathname]);

  return null;
}
