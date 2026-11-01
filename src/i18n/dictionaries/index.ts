import "server-only";
import type { Locale } from "../config";
import type { Dictionary } from "./en";

const loaders: Record<Locale, () => Promise<Dictionary>> = {
  en: () => import("./en").then((m) => m.default),
  ja: () => import("./ja").then((m) => m.default),
  "zh-cn": () => import("./zh-cn").then((m) => m.default),
  "zh-tw": () => import("./zh-tw").then((m) => m.default),
  ko: () => import("./ko").then((m) => m.default),
};

export function getDictionary(locale: Locale): Promise<Dictionary> {
  return loaders[locale]();
}

export type { Dictionary };
