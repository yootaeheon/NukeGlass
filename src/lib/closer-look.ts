import { GLASSES, type GlassesSlug } from "./glasses";
import type { Photo } from "./media";

// "Take a closer look" on the detail page: one picture per feature, opened one at a time.
// Pictures are AI-generated stand-ins (Higgsfield) until our own shoot; they show no real
// product and are covered by the footer's "illustrative" note. Text lives in
// dict.closerLook.models[slug][key]; the moving overlay for each picture is in
// components/feature-motion.tsx.

export const CLOSER_LOOK_KEYS = ["design", "camera", "ask", "audio", "control", "battery", "lenses"] as const;
export type CloserLookKey = (typeof CLOSER_LOOK_KEYS)[number];

// Bump a model's revision when one of its pictures is replaced: the image optimizer and
// browsers cache by URL, so a new file under the old name keeps showing the old picture.
const REVISION: Record<GlassesSlug, string> = {
  "ray-ban-meta-wayfarer": "v2",
  "ray-ban-meta-skyler": "v1",
  "ray-ban-meta-blayzer-optics": "v1",
  "oakley-meta-hstn": "v1",
  "oakley-meta-vanguard": "v1",
};

const pic = (slug: GlassesSlug, key: CloserLookKey): Photo => ({
  src: `/features/${slug}/${key}.${REVISION[slug]}.jpg`,
  width: 1536,
  height: 1020,
});

export const CLOSER_LOOK: Partial<Record<GlassesSlug, Record<CloserLookKey, Photo>>> = Object.fromEntries(
  GLASSES.map((g) => [g.slug, Object.fromEntries(CLOSER_LOOK_KEYS.map((k) => [k, pic(g.slug, k)]))]),
);
