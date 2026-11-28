"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { DEFAULT_LOCALE, isLocale, localePath, type Locale } from "@/i18n/config";

// Shown when a page throws (for example the booking database is unreachable).
// Error pages do not receive route params, so read the language from the path.
const TEXT: Record<Locale, { title: string; body: string; retry: string; home: string }> = {
  en: {
    title: "Something went wrong",
    body: "The page could not be loaded. Nothing was booked or changed. Please try again in a moment.",
    retry: "Try again",
    home: "Back to the home page",
  },
  ja: {
    title: "問題が発生しました",
    body: "ページを読み込めませんでした。予約や変更は行われていません。少し待ってからもう一度お試しください。",
    retry: "もう一度試す",
    home: "ホームに戻る",
  },
  "zh-cn": {
    title: "出了点问题",
    body: "页面无法加载。没有产生任何预订或更改。请稍后再试。",
    retry: "重试",
    home: "返回首页",
  },
  "zh-tw": {
    title: "發生了一點問題",
    body: "頁面無法載入。沒有產生任何預約或變更。請稍後再試。",
    retry: "重試",
    home: "回到首頁",
  },
  ko: {
    title: "문제가 생겼습니다",
    body: "페이지를 불러오지 못했습니다. 예약되거나 바뀐 것은 없습니다. 잠시 후 다시 시도해 주세요.",
    retry: "다시 시도",
    home: "홈으로 돌아가기",
  },
};

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const segment = usePathname().split("/")[1];
  const lang = isLocale(segment) ? segment : DEFAULT_LOCALE;
  const t = TEXT[lang];

  useEffect(() => {
    // The digest matches the server log entry; the message itself may hold user input
    console.error("page error", error.digest ?? "no digest");
  }, [error]);

  return (
    <div className="mx-auto max-w-[1440px] px-margin py-16 lg:py-24">
      <h1 className="display text-[clamp(2.5rem,1.6rem+3vw,4.5rem)]">{t.title}</h1>
      <p className="mt-4 max-w-[52ch] text-muted">{t.body}</p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button type="button" onClick={reset} className="btn btn-primary">
          {t.retry}
        </button>
        <Link href={localePath(lang, "/")} className="link inline-flex min-h-12 items-center px-2 font-medium">
          {t.home}
        </Link>
      </div>
    </div>
  );
}
