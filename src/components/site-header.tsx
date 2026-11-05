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
  const header = useRef<HTMLElement>(null);

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
      // Never slide away while a header control has keyboard focus
      const focusInside = header.current?.contains(document.activeElement) ?? false;
      setHidden(!focusInside && y > 320 && y > lastY.current + 4);
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

  // Open menu behaves like a dialog: page behind is inert and unscrollable, focus moves
  // in, Escape closes and returns focus to the Menu button, widening to desktop closes it.
  const menuButton = useRef<HTMLButtonElement>(null);
  const mobileNav = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!open) return;
    const behind = [document.getElementById("main"), document.querySelector("body > footer")];
    document.documentElement.style.overflow = "hidden";
    behind.forEach((el) => el?.setAttribute("inert", ""));
    mobileNav.current?.querySelector<HTMLElement>("a")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      menuButton.current?.focus();
    };
    const wide = window.matchMedia("(min-width: 1024px)");
    const onWide = () => wide.matches && setOpen(false);
    window.addEventListener("keydown", onKey);
    wide.addEventListener("change", onWide);
    return () => {
      document.documentElement.style.overflow = "";
      behind.forEach((el) => el?.removeAttribute("inert"));
      window.removeEventListener("keydown", onKey);
      wide.removeEventListener("change", onWide);
    };
  }, [open]);

  const transparent = overHero && !scrolled && !open;

  return (
    <header
      ref={header}
      onFocus={() => setHidden(false)}
      // Only add a translate while hidden: any translate makes the header the containing
      // block for the fixed mobile menu and squashes it to the bar's height.
      className={`fixed inset-x-0 top-0 z-40 transition-[background-color,color,translate] duration-500 ease-[var(--ease-out)] ${
        transparent ? "on-dark bg-transparent text-white" : "bg-bg text-ink"
      } ${hidden && !open ? "-translate-y-full" : ""}`}
    >
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-4 px-margin lg:h-[72px]">
        <Link href={localePath(lang, "/")} className="brand-mark shrink-0 text-[1.5rem]">
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
            ref={menuButton}
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
          ref={mobileNav}
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
