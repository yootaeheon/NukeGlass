import { describe, expect, it } from "vitest";
import { localePath, matchLocale, switchLocalePath } from "./config";
import { fmt, formatSeoulDate } from "./format";

describe("matchLocale", () => {
  it("picks the best supported language", () => {
    expect(matchLocale("ja-JP,ja;q=0.9,en;q=0.8")).toBe("ja");
    expect(matchLocale("fr-FR,fr;q=0.9,en;q=0.5")).toBe("en");
    expect(matchLocale("ko")).toBe("ko");
    expect(matchLocale(null)).toBe("en");
    expect(matchLocale("de;q=0, ko;q=0.3")).toBe("ko");
  });

  it("maps Chinese variants to simplified or traditional", () => {
    expect(matchLocale("zh-CN,zh;q=0.9")).toBe("zh-cn");
    expect(matchLocale("zh-TW")).toBe("zh-tw");
    expect(matchLocale("zh-HK,en;q=0.5")).toBe("zh-tw");
    expect(matchLocale("zh-Hant-HK")).toBe("zh-tw");
    expect(matchLocale("zh")).toBe("zh-cn");
  });
});

describe("locale paths", () => {
  it("prefixes and swaps the locale segment", () => {
    expect(localePath("ja", "/glasses")).toBe("/ja/glasses");
    expect(localePath("ko", "/")).toBe("/ko");
    expect(switchLocalePath("/en/glasses/oakley-meta-hstn", "zh-tw")).toBe("/zh-tw/glasses/oakley-meta-hstn");
    expect(switchLocalePath("/en", "ja")).toBe("/ja");
    expect(switchLocalePath("/glasses", "ko")).toBe("/ko/glasses");
  });
});

describe("format", () => {
  it("fills placeholders and leaves unknown ones", () => {
    expect(fmt("{n} days, {x}", { n: 3 })).toBe("3 days, {x}");
  });

  it("formats Seoul dates per language", () => {
    expect(formatSeoulDate("2026-11-04", "en")).toBe("Wed, 4 Nov 2026");
    expect(formatSeoulDate("2026-11-04", "ja")).toContain("11月4日");
    expect(formatSeoulDate("2026-11-04", "ko")).toContain("11월 4일");
  });
});
