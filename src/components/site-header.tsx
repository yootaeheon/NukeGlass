"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { LanguageSwitcher } from "./language-switcher";

export function SiteHeader({ lang, nav }: { lang: Locale; nav: Dictionary["nav"] }) {
  const pathname = usePathname();
  const overHero = pathname === `/${lang}`;
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  const links = [
    { href: localePath(lang, "/glasses"), label: nav.glasses },
    { href: `${localePath(lang, "/")}#how-it-works`, label: nav.how },
    { href: `${localePath(lang, "/")}#faq`, label: nav.faq },
    { href: localePath(lang, "/bookings"), label: nav.myBooking },
  ];

  useEffect(() => {
    if (!overHero) return;
    const onScroll = () => setScrolled(window.scrollY > 48);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [overHero]);

  // Close the menu after navigation (state adjusted during render, not in an effect)
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  const transparent = overHero && !scrolled && !open;

  return (
    <header
      className={`${overHero ? "fixed" : "sticky"} inset-x-0 top-0 z-40 transition-colors duration-300 ${
        transparent ? "on-dark bg-transparent text-white" : "bg-bg text-ink"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-4 px-margin">
        <Link href={localePath(lang, "/")} className="head shrink-0 text-[1.5rem]">
          NukeGlass
        </Link>
        <nav aria-label={nav.menu} className="hidden items-center gap-8 lg:flex">
          {links.map((item) => (
            <Link key={item.href} href={item.href} className="hover:underline">
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
        <nav id="mobile-nav" aria-label={nav.menu} className="border-t border-surface bg-bg px-margin pb-6 text-ink lg:hidden">
          <ul>
            {links.map((item) => (
              <li key={item.href}>
                <Link href={item.href} onClick={() => setOpen(false)} className="block py-4 text-lead">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link href={localePath(lang, "/book")} onClick={() => setOpen(false)} className="btn btn-primary mt-4 w-full">
            {nav.book}
          </Link>
        </nav>
      )}
    </header>
  );
}
