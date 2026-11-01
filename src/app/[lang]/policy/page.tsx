import type { Metadata } from "next";
import { pageAlternates, resolveLang } from "@/i18n/server";

export async function generateMetadata({ params }: PageProps<"/[lang]/policy">): Promise<Metadata> {
  const { lang, dict } = await resolveLang(params);
  return { title: dict.policy.metaTitle, alternates: pageAlternates(lang, "/policy") };
}

// Draft terms (planning team, 2026-11-01). The Notion planning page is the source of truth.
export default async function PolicyPage({ params }: PageProps<"/[lang]/policy">) {
  const { dict } = await resolveLang(params);
  const t = dict.policy;

  return (
    <div className="mx-auto max-w-[1440px] px-margin py-16 lg:py-24">
      <h1 className="head text-title">{t.title}</h1>
      <p className="mt-4 max-w-[60ch] bg-surface p-4 text-muted">{t.draft}</p>
      <dl className="mt-12 max-w-[900px] space-y-8">
        {t.items.map((item) => (
          <div key={item.title} className="grid gap-2 border-b border-line pb-8 md:grid-cols-[14rem_1fr] md:gap-8">
            <dt className="font-medium">{item.title}</dt>
            <dd className="text-muted">{item.body}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
