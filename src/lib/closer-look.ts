import type { GlassesSlug } from "./glasses";
import type { Photo } from "./media";

// "Take a closer look" on the detail page: one picture per feature, opened one at a time.
// Pictures are AI-generated stand-ins (Higgsfield) until our own shoot; they show no real
// product and are covered by the footer's "illustrative" note. Text lives in
// dict.closerLook.models[slug][key]. A model without an entry here keeps the plain page.

export const CLOSER_LOOK_KEYS = ["design", "camera", "ask", "audio", "control", "battery", "lenses"] as const;
export type CloserLookKey = (typeof CLOSER_LOOK_KEYS)[number];

const pic = (slug: GlassesSlug, key: CloserLookKey): Photo => ({
  src: `/features/${slug}/${key}.jpg`,
  width: 1536,
  height: 1020,
});

export const CLOSER_LOOK: Partial<Record<GlassesSlug, Record<CloserLookKey, Photo>>> = {
  "ray-ban-meta-wayfarer": Object.fromEntries(
    CLOSER_LOOK_KEYS.map((k) => [k, pic("ray-ban-meta-wayfarer", k)]),
  ) as Record<CloserLookKey, Photo>,
};
