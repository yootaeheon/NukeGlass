"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { LanguageSwitcher } from "./language-switcher";

export function SiteHeader({ lang, nav }: { lang: Locale; nav: Dictionary["nav"] }) {
  const pathname = usePathname();
  const overHero = pathname === `/${lang}`;
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const lastY = useRef(0);

  const links = [
    { href: localePath(lang, "/glasses"), label: nav.glasses },
    { href: `${localePath(lang, "/")}#how-it-works`, label: nav.how },
    { href: `${localePath(lang, "/")}#faq`, label: nav.faq },
    { href: localePath(lang, "/bookings"), label: nav.myBooking },
  ];

  // Solid once the page moves; slides away while reading down, back on the way up
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 48);
      setHidden(y > 320 && y > lastY.current + 4);
      if (y < lastY.current - 4 || y <= 320) setHidden(false);
      lastY.current = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the menu after navigation (state adjusted during render, not in an effect)
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const transparent = overHero && !scrolled && !open;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-[background-color,color,transform] duration-500 ease-[var(--ease-out)] ${
        transparent ? "on-dark bg-transparent text-white" : "bg-bg text-ink"
      } ${hidden && !open ? "-translate-y-full" : "translate-y-0"}`}
    >
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-4 px-margin lg:h-[72px]">
        <Link href={localePath(lang, "/")} className="head shrink-0 text-[1.5rem]">
          NukeGlass
        </Link>
        <nav aria-label={nav.menu} className="hidden items-center gap-8 lg:flex">
          {links.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="relative py-2 after:absolute after:inset-x-0 after:bottom-0 after:h-[2px] after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-300 hover:after:scale-x-100"
            >
              {item.label}
            </Link>
          ))}
          <LanguageSwitcher lang={lang} label={nav.language} />
          <Link href={localePath(lang, "/book")} className={`btn ${transparent ? "btn-light" : "btn-primary"} !min-h-11`}>
            {nav.book}
          </Link>
        </nav>
        {/* Phone: language to the left of the Menu button */}
        <div className="flex items-center gap-1 lg:hidden">
          <LanguageSwitcher lang={lang} label={nav.language} />
          <button
            type="button"
            className="min-h-12 whitespace-nowrap px-1 font-medium"
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? nav.close : nav.menu}
          </button>
        </div>
      </div>
      {open && (
        <nav
          id="mobile-nav"
          aria-label={nav.menu}
          className="fixed inset-x-0 bottom-0 top-16 flex flex-col overflow-y-auto bg-bg px-margin pb-[max(24px,env(safe-area-inset-bottom))] text-ink lg:hidden"
        >
          <ul className="pt-6">
            {links.map((item, i) => (
              <li key={item.href} className="animate-[fade_500ms_var(--ease-out)_both]" style={{ animationDelay: `${i * 60}ms` }}>
                <Link href={item.href} onClick={() => setOpen(false)} className="head flex min-h-16 items-center justify-between text-[2rem]">
                  {item.label}
                  <span className="arrow text-lead" aria-hidden="true">
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <Link href={localePath(lang, "/book")} onClick={() => setOpen(false)} className="btn btn-primary mt-auto w-full">
            {nav.book}
          </Link>
        </nav>
      )}
    </header>
  );
}
