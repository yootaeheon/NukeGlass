"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const NAV = [
  { href: "/glasses", label: "Glasses" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#faq", label: "FAQ" },
  { href: "/bookings", label: "My booking" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const overHero = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

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
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-margin">
        <Link href="/" className="head text-[1.5rem]">
          NukeGlass
        </Link>
        <nav aria-label="Main" className="hidden items-center gap-8 lg:flex">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="hover:underline">
              {item.label}
            </Link>
          ))}
          <Link href="/book" className={`btn ${transparent ? "btn-light" : "btn-primary"} !min-h-11`}>
            Book glasses
          </Link>
        </nav>
        <button
          type="button"
          className="min-h-12 px-2 font-medium lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>
      {open && (
        <nav id="mobile-nav" aria-label="Main" className="border-t border-surface bg-bg px-margin pb-6 text-ink lg:hidden">
          <ul>
            {NAV.map((item) => (
              <li key={item.href}>
                <Link href={item.href} onClick={() => setOpen(false)} className="block py-4 text-lead">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link href="/book" onClick={() => setOpen(false)} className="btn btn-primary mt-4 w-full">
            Book glasses
          </Link>
        </nav>
      )}
    </header>
  );
}
