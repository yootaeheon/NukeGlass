import Link from "next/link";

// Contact channel is a placeholder until the CEO picks one (WhatsApp / email / KakaoTalk).
export function SiteFooter() {
  return (
    <footer className="on-dark bg-accent text-white">
      <div className="mx-auto max-w-[1440px] px-margin pb-8 pt-20">
        <p className="max-w-[46ch] text-field-accent-muted">
          AI glasses for visitors to Korea. Picked up and returned at Incheon Airport. Every date and time on this site
          is Seoul time (KST).
        </p>
        <p className="head mt-12 break-words text-[clamp(1.5rem,0.5rem+5vw,6rem)]">hello@nukeglass.example</p>
        <div className="mt-16 flex flex-wrap gap-x-8 gap-y-2 text-small text-field-accent-muted">
          <Link href="/glasses" className="hover:underline">
            Glasses
          </Link>
          <Link href="/bookings" className="hover:underline">
            My booking
          </Link>
          <span>Ray-Ban, Oakley and Meta are trademarks of their owners. NukeGlass is an independent rental service.</span>
          <span>Seoul, 2026</span>
        </div>
      </div>
    </footer>
  );
}
