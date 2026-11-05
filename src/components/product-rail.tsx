import Image from "next/image";
import Link from "next/link";
import { localePath, type Locale } from "@/i18n/config";
import { fmt } from "@/i18n/format";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { GLASSES, type Glasses } from "@/lib/glasses";
import { PRODUCT_IMAGES } from "@/lib/media";

// The pairs side by side: two columns on phones and tablets (an odd first pair runs full width), one row on wide screens.
export function ProductRail({ lang, dict, items = GLASSES }: { lang: Locale; dict: Dictionary; items?: Glasses[] }) {
  return (
    <ul className="grid grid-cols-2 gap-x-3 gap-y-10 lg:grid-cols-5">
      {items.map((g, i) => (
        <li
          key={g.slug}
          className={i === 0 && items.length % 2 === 1 ? "col-span-2 lg:col-span-1" : undefined}
          data-reveal
          style={{ "--d": `${i * 70}ms` } as React.CSSProperties}
        >
          <Link href={localePath(lang, `/glasses/${g.slug}`)} className="zoom group block">
            <span className="relative block aspect-[4/3] overflow-hidden bg-product">
              <Image
                src={PRODUCT_IMAGES[g.slug].src}
                alt={g.name}
                fill
                sizes="(min-width: 1024px) 20vw, 50vw"
                className="object-cover object-center"
              />
              <span className="absolute left-4 top-4 text-small text-muted">{g.brand}</span>
            </span>
            <span className="mt-4 block font-medium group-hover:underline">{g.name.replace(/^(Ray-Ban|Oakley) Meta /, "")}</span>
            <span className="mt-1 block text-small text-muted">{dict.catalog[g.slug].bestFor}</span>
            <span className="nums mt-2 block font-semibold">{fmt(dict.common.perDay, { price: g.dailyUsd })}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
