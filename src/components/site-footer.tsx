import Link from "next/link";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { PHOTO_CREDITS } from "@/lib/media";

// Contact channel is a placeholder until the CEO picks one (WhatsApp / email / KakaoTalk).
export function SiteFooter({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const f = dict.footer;
  const columns = [
    {
      title: f.explore,
      links: [
        { href: localePath(lang, "/glasses"), label: dict.nav.glasses },
        { href: `${localePath(lang, "/")}#how-it-works`, label: dict.nav.how },
        { href: localePath(lang, "/book"), label: dict.nav.book },
      ],
    },
    {
      title: f.help,
      links: [
        { href: `${localePath(lang, "/")}#faq`, label: dict.nav.faq },
        { href: localePath(lang, "/policy"), label: dict.policy.link },
        { href: localePath(lang, "/bookings"), label: dict.nav.myBooking },
      ],
    },
  ];

  return (
    <footer className="on-dark bg-field-dark text-white">
      <div className="mx-auto max-w-[1440px] px-margin pb-8 pt-24">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="max-w-[44ch] text-lead">{f.about}</p>
            <a
              href="mailto:hello@nukeglass.example"
              className="mt-8 inline-flex min-h-12 items-center text-lead underline decoration-white/40 underline-offset-4 hover:decoration-white"
            >
              hello@nukeglass.example
            </a>
          </div>
          {columns.map((c) => (
            <nav key={c.title} aria-label={c.title} className="lg:col-span-2 lg:first-of-type:col-start-8">
              <h2 className="text-small text-field-dark-muted">{c.title}</h2>
              <ul className="mt-4 space-y-1">
                {c.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="inline-flex min-h-11 items-center hover:underline">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <p aria-hidden="true" className="head mt-24 select-none whitespace-nowrap text-[clamp(3.5rem,19.5vw,18rem)] leading-[0.8] tracking-[-0.04em]">
          NukeGlass
        </p>

        <div className="mt-10 flex flex-col gap-4 text-small text-field-dark-muted lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-1">
            <p>{f.trademark}</p>
            <p>{f.illustrative}</p>
          </div>
          <details className="max-w-[640px]">
            <summary className="inline-flex min-h-11 items-center underline">{f.credits}</summary>
            <ul className="mt-2 space-y-1">
              {PHOTO_CREDITS.map((c) => (
                <li key={c.page}>
                  <a href={c.page} className="hover:underline" rel="noopener noreferrer">
                    {c.title}
                  </a>{" "}
                  · {c.by} · {c.licence}
                </li>
              ))}
            </ul>
          </details>
          <p>Seoul, 2026</p>
        </div>
      </div>
    </footer>
  );
}
