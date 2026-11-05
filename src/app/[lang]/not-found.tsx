"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DEFAULT_LOCALE, isLocale, localePath, type Locale } from "@/i18n/config";

// not-found does not receive route params, so read the language from the path.
const TEXT: Record<Locale, { title: string; body: string; home: string }> = {
  en: { title: "Page not found", body: "This page does not exist or has moved.", home: "Back to the home page" },
  ja: { title: "ページが見つかりません", body: "このページは存在しないか、移動しました。", home: "ホームに戻る" },
  "zh-cn": { title: "找不到页面", body: "此页面不存在或已移动。", home: "返回首页" },
  "zh-tw": { title: "找不到頁面", body: "此頁面不存在或已移動。", home: "回到首頁" },
  ko: { title: "페이지를 찾을 수 없습니다", body: "없는 페이지이거나 주소가 바뀌었습니다.", home: "홈으로 돌아가기" },
};

export default function NotFound() {
  const segment = usePathname().split("/")[1];
  const lang = isLocale(segment) ? segment : DEFAULT_LOCALE;
  const t = TEXT[lang];

  return (
    <div className="mx-auto max-w-[1440px] px-margin py-16 lg:py-24">
      <h1 className="display text-[clamp(2.5rem,1.6rem+3vw,4.5rem)]">{t.title}</h1>
      <p className="mt-4 text-muted">{t.body}</p>
      <Link href={localePath(lang, "/")} className="btn btn-primary mt-8">
        {t.home}
      </Link>
    </div>
  );
}
