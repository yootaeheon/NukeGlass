import type { Metadata, Viewport } from "next";
import { Hanken_Grotesk, Newsreader, Noto_Sans_KR } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { RevealOnScroll } from "@/components/reveal-on-scroll";
import "./globals.css";

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  axes: ["opsz"],
  style: ["normal"],
  display: "swap",
});

const hanken = Hanken_Grotesk({
  variable: "--font-hanken",
  subsets: ["latin"],
  display: "swap",
});

// Only for Korean glyphs (signs, menus, addresses)
const notoKr = Noto_Sans_KR({
  variable: "--font-noto-kr",
  weight: ["500"],
  preload: false,
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "NukeGlass · AI glasses for your Seoul trip",
    template: "%s · NukeGlass",
  },
  description:
    "Rent Ray-Ban Meta or Oakley Meta AI glasses by the day. Pick up at Incheon Airport, ask about signs and menus, hear walking directions, and drop them back before you fly.",
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${newsreader.variable} ${hanken.variable} ${notoKr.variable} antialiased`}>
      <body className="flex min-h-svh flex-col">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-bg focus:p-3">
          Skip to content
        </a>
        <SiteHeader />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter />
        <RevealOnScroll />
      </body>
    </html>
  );
}
