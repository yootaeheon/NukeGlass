import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import en from "../i18n/dictionaries/en";
import ja from "../i18n/dictionaries/ja";
import ko from "../i18n/dictionaries/ko";
import zhCn from "../i18n/dictionaries/zh-cn";
import zhTw from "../i18n/dictionaries/zh-tw";
import { CLOSER_LOOK, CLOSER_LOOK_KEYS } from "./closer-look";

const dicts = { en, ja, ko, "zh-cn": zhCn, "zh-tw": zhTw };

// A model with pictures but no text (or the reverse) would silently lose the section.
describe("closer look", () => {
  const slugs = Object.keys(CLOSER_LOOK);

  it("has pictures and text for the same models in every language", () => {
    for (const dict of Object.values(dicts)) {
      expect(Object.keys(dict.closerLook.models).sort()).toEqual([...slugs].sort());
    }
  });

  it("has a picture file and non-empty text for every feature", () => {
    for (const slug of slugs) {
      const photos = CLOSER_LOOK[slug as keyof typeof CLOSER_LOOK]!;
      for (const key of CLOSER_LOOK_KEYS) {
        expect(existsSync(join(process.cwd(), "public", photos[key].src)), photos[key].src).toBe(true);
        for (const dict of Object.values(dicts)) {
          const text = (dict.closerLook.models as Record<string, Record<string, Record<string, string>>>)[slug][key];
          expect(text.label && text.body && text.alt).toBeTruthy();
        }
      }
    }
  });
});
