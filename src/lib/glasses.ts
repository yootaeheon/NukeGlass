// Rental catalog. Customer-facing text (taglines, specs, guides) lives in
// src/i18n/dictionaries; this file holds only facts that do not change by language.
// dailyUsd values are draft prices (see the rental terms draft in Notion).

export type FrameShape = "wayfarer" | "skyler" | "blayzer" | "hstn" | "vanguard";

export type GlassesSlug =
  | "ray-ban-meta-wayfarer"
  | "ray-ban-meta-skyler"
  | "ray-ban-meta-blayzer-optics"
  | "oakley-meta-hstn"
  | "oakley-meta-vanguard";

export type Glasses = {
  slug: GlassesSlug;
  name: string;
  brand: "Ray-Ban Meta" | "Oakley Meta";
  shape: FrameShape;
  dailyUsd: number;
};

export const GLASSES: Glasses[] = [
  { slug: "ray-ban-meta-wayfarer", name: "Ray-Ban Meta Wayfarer (Gen 2)", brand: "Ray-Ban Meta", shape: "wayfarer", dailyUsd: 29 },
  { slug: "ray-ban-meta-skyler", name: "Ray-Ban Meta Skyler (Gen 2)", brand: "Ray-Ban Meta", shape: "skyler", dailyUsd: 29 },
  {
    slug: "ray-ban-meta-blayzer-optics",
    name: "Ray-Ban Meta Blayzer Optics (Gen 2)",
    brand: "Ray-Ban Meta",
    shape: "blayzer",
    dailyUsd: 32,
  },
  { slug: "oakley-meta-hstn", name: "Oakley Meta HSTN", brand: "Oakley Meta", shape: "hstn", dailyUsd: 32 },
  { slug: "oakley-meta-vanguard", name: "Oakley Meta Vanguard", brand: "Oakley Meta", shape: "vanguard", dailyUsd: 35 },
];

export function getGlasses(slug: string): Glasses | undefined {
  return GLASSES.find((g) => g.slug === slug);
}

export const PICKUP_LOCATIONS = [
  { id: "icn-t1", nameKo: "인천국제공항 제1여객터미널" },
  { id: "icn-t2", nameKo: "인천국제공항 제2여객터미널" },
] as const;

export type PickupLocationId = (typeof PICKUP_LOCATIONS)[number]["id"];

export function getPickupLocation(id: string) {
  return PICKUP_LOCATIONS.find((l) => l.id === id);
}
