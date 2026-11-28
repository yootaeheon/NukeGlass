import type { Metadata, Viewport } from "next";
import { Hanken_Grotesk, Newsreader, Noto_Sans_KR } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { RevealOnScroll } from "@/components/reveal-on-scroll";
import { LOCALES, localeInfo } from "@/i18n/config";
import { pageAlternates, resolveLang } from "@/i18n/server";
import { siteUrl } from "@/lib/site-url";
import "../globals.css";

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

// Korean glyphs (signs, menus, addresses, and the Korean site). Japanese and Chinese
// use the visitor's system fonts to keep pages light (see :lang() rules in globals.css).
const notoKr = Noto_Sans_KR({
  variable: "--font-noto-kr",
  weight: ["400", "500", "700"],
  preload: false,
  display: "swap",
});

export function generateStaticParams() {
  return LOCALES.map((l) => ({ lang: l.code }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang, dict } = await resolveLang(params);
  return {
    metadataBase: siteUrl(),
    title: { default: dict.meta.title, template: "%s · NukeGlass" },
    description: dict.meta.description,
    alternates: pageAlternates(lang, "/"),
  };
}

export const viewport: Viewport = {
  themeColor: "#fbf8f2",
};

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang, dict } = await resolveLang(params);

  return (
    <html
      lang={localeInfo(lang).htmlLang}
      className={`${newsreader.variable} ${hanken.variable} ${notoKr.variable} antialiased`}
    >
      <body className="flex min-h-svh flex-col">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-bg focus:p-3">
          {dict.nav.skip}
        </a>
        <SiteHeader lang={lang} nav={dict.nav} />
        <main id="main" className="flex-1 pt-16 lg:pt-[72px]">
          {children}
        </main>
        <SiteFooter lang={lang} dict={dict} />
        <RevealOnScroll />
      </body>
    </html>
  );
}
