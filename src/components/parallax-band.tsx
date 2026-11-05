"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import type { Photo } from "@/lib/media";

// A full-width picture that moves a little slower than the page, with one line over it.
export function ParallaxBand({
  photo,
  alt,
  children,
  className = "min-h-[80svh]",
}: {
  photo: Photo;
  alt: string;
  children: React.ReactNode;
  className?: string;
}) {
  const box = useRef<HTMLDivElement>(null);
  const pic = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const el = box.current;
      const img = pic.current;
      if (!el || !img) return;
      const r = el.getBoundingClientRect();
      const progress = (window.innerHeight - r.top) / (window.innerHeight + r.height); // 0 → 1 across the screen
      img.style.transform = `translate3d(0, ${(progress - 0.5) * -14}%, 0) scale(1.18)`;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div ref={box} className={`on-dark relative flex overflow-hidden bg-field-dark text-white ${className}`}>
      <div ref={pic} className="absolute inset-0 will-change-transform" style={{ transform: "scale(1.18)" }}>
        <Image src={photo.src} alt={alt} fill sizes="100vw" className="object-cover" />
      </div>
      <div className="absolute inset-0 bg-[rgba(18,20,22,0.45)]" />
      <div className="relative mx-auto flex w-full max-w-[1440px] flex-col px-margin py-section">{children}</div>
    </div>
  );
}
