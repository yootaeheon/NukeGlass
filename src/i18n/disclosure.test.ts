import { describe, expect, it } from "vitest";
import en from "./dictionaries/en";
import ja from "./dictionaries/ja";
import ko from "./dictionaries/ko";
import zhCn from "./dictionaries/zh-cn";
import zhTw from "./dictionaries/zh-tw";

// The hero film and the product pictures are AI-generated, and the film once showed
// floating captions. Visitors must be told both that it is AI-made and that the
// glasses have no screen, in every language.
const noScreen = {
  en: "no screen",
  ja: "画面はなく",
  ko: "화면이 없",
  "zh-cn": "没有屏幕",
  "zh-tw": "沒有螢幕",
};
const dicts = { en, ja, ko, "zh-cn": zhCn, "zh-tw": zhTw };

describe("AI and no-screen disclosures", () => {
  for (const [lang, dict] of Object.entries(dicts)) {
    it(`${lang}: the hero note says the film is AI-made and the glasses have no screen`, () => {
      expect(dict.hero.videoNote).toContain("AI");
      expect(dict.hero.videoNote).toContain(noScreen[lang as keyof typeof noScreen]);
    });

    it(`${lang}: the footer says the pictures are AI-made`, () => {
      expect(dict.footer.illustrative).toContain("AI");
    });
  }
});
