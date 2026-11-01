import Link from "next/link";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";

// Contact channel is a placeholder until the CEO picks one (WhatsApp / email / KakaoTalk).
export function SiteFooter({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  return (
    <footer className="on-dark bg-accent text-white">
      <div className="mx-auto max-w-[1440px] px-margin pb-8 pt-20">
        <p className="max-w-[46ch] text-field-accent-muted">{dict.footer.about}</p>
        <p className="head mt-12 break-words text-[clamp(1.5rem,0.5rem+5vw,6rem)]">hello@nukeglass.example</p>
        <div className="mt-16 flex flex-wrap gap-x-8 gap-y-2 text-small text-field-accent-muted">
          <Link href={localePath(lang, "/glasses")} className="hover:underline">
            {dict.nav.glasses}
          </Link>
          <Link href={localePath(lang, "/policy")} className="hover:underline">
            {dict.policy.link}
          </Link>
          <Link href={localePath(lang, "/bookings")} className="hover:underline">
            {dict.nav.myBooking}
          </Link>
          <span>{dict.footer.trademark}</span>
          <span>Seoul, 2026</span>
        </div>
      </div>
    </footer>
  );
}
