// Rental catalog. Specs follow Meta's Korean launch notice (2026-05) and
// product pages; anything not confirmed is left out rather than guessed.
// dailyUsd values are provisional until pricing is confirmed by the CEO.

export type FrameShape = "wayfarer" | "skyler" | "blayzer" | "hstn" | "vanguard";

export type Feature = { title: string; body: string };

export type Glasses = {
  slug: string;
  name: string;
  brand: "Ray-Ban Meta" | "Oakley Meta";
  shape: FrameShape;
  tagline: string;
  bestFor: string;
  dailyUsd: number;
  facts: string[];
  specs: [label: string, value: string][];
  features: Feature[];
  faq: Feature[];
};

const SHARED_FEATURES: Feature[] = [
  {
    title: "Ask what you are looking at.",
    body: "Say “Hey Meta, look and tell me what this is.” The glasses take a quick look through the camera and answer in your ear. Useful at palace signs, museum labels and shop fronts.",
  },
  {
    title: "Hear directions, keep your phone away.",
    body: "Your phone’s map app speaks its walking directions through the open-ear speakers, so you can look at the street instead of the screen.",
  },
  {
    title: "Snap the palace hands-free.",
    body: "Press the capture button for a photo, hold it for video. A light on the frame tells people nearby that you are recording.",
  },
  {
    title: "Music and calls, open-ear.",
    body: "Speakers sit just above your ears. You hear your music and calls and still hear the crossing signal.",
  },
];

const SHARED_FAQ: Feature[] = [
  {
    title: "Do I need my own phone?",
    body: "Yes. The glasses pair with the free Meta AI app on iPhone or Android. Mobile data or Wi-Fi on your phone is needed for AI answers.",
  },
  {
    title: "Can I wear them with my prescription?",
    body: "These frames come with clear or sun lenses, not your prescription. If you wear contact lenses you are all set.",
  },
];

export const GLASSES: Glasses[] = [
  {
    slug: "ray-ban-meta-wayfarer",
    name: "Ray-Ban Meta Wayfarer (Gen 2)",
    brand: "Ray-Ban Meta",
    shape: "wayfarer",
    tagline: "The classic shape. The one most people pick.",
    bestFor: "Everyday sightseeing",
    dailyUsd: 29,
    facts: ["Up to 8 hours of battery", "12 MP ultra-wide camera", "Clear or sun lenses"],
    specs: [
      ["Camera", "12 MP ultra-wide, 3K video"],
      ["Battery", "Up to 8 hours, plus the charging case"],
      ["Audio", "Open-ear speakers, multi-mic array"],
      ["Control", "“Hey Meta”, touchpad, capture button"],
      ["App", "Meta AI (iOS and Android)"],
    ],
    features: SHARED_FEATURES,
    faq: SHARED_FAQ,
  },
  {
    slug: "ray-ban-meta-skyler",
    name: "Ray-Ban Meta Skyler (Gen 2)",
    brand: "Ray-Ban Meta",
    shape: "skyler",
    tagline: "A softer cat-eye frame for smaller faces.",
    bestFor: "Cafés and city walks",
    dailyUsd: 29,
    facts: ["Up to 8 hours of battery", "12 MP ultra-wide camera", "Clear or sun lenses"],
    specs: [
      ["Camera", "12 MP ultra-wide, 3K video"],
      ["Battery", "Up to 8 hours, plus the charging case"],
      ["Audio", "Open-ear speakers, multi-mic array"],
      ["Control", "“Hey Meta”, touchpad, capture button"],
      ["App", "Meta AI (iOS and Android)"],
    ],
    features: SHARED_FEATURES,
    faq: SHARED_FAQ,
  },
  {
    slug: "ray-ban-meta-blayzer-optics",
    name: "Ray-Ban Meta Blayzer Optics (Gen 2)",
    brand: "Ray-Ban Meta",
    shape: "blayzer",
    tagline: "A square optical frame that looks like normal glasses.",
    bestFor: "Museums and long days",
    dailyUsd: 32,
    facts: ["Up to 8 hours of battery", "12 MP ultra-wide camera", "Clear optical lenses"],
    specs: [
      ["Camera", "12 MP ultra-wide, 3K video"],
      ["Battery", "Up to 8 hours, plus the charging case"],
      ["Audio", "Open-ear speakers, multi-mic array"],
      ["Control", "“Hey Meta”, touchpad, capture button"],
      ["App", "Meta AI (iOS and Android)"],
    ],
    features: SHARED_FEATURES,
    faq: SHARED_FAQ,
  },
  {
    slug: "oakley-meta-hstn",
    name: "Oakley Meta HSTN",
    brand: "Oakley Meta",
    shape: "hstn",
    tagline: "A bolder sport-lifestyle frame for sunny days out.",
    bestFor: "Han River and day trips",
    dailyUsd: 32,
    facts: ["3K video camera", "Open-ear speakers", "PRIZM lenses on some styles"],
    specs: [
      ["Camera", "Ultra-wide, 3K video"],
      ["Battery", "All-day use with the charging case"],
      ["Audio", "Open-ear speakers"],
      ["Lenses", "Sun lenses, PRIZM on some styles"],
      ["App", "Meta AI (iOS and Android)"],
    ],
    features: SHARED_FEATURES,
    faq: SHARED_FAQ,
  },
  {
    slug: "oakley-meta-vanguard",
    name: "Oakley Meta Vanguard",
    brand: "Oakley Meta",
    shape: "vanguard",
    tagline: "A wraparound performance shield for hiking and running.",
    bestFor: "Bukhansan hikes and runs",
    dailyUsd: 35,
    facts: ["IP67 water and dust resistance", "12 MP ultra-wide camera", "Wind-noise reduction"],
    specs: [
      ["Camera", "12 MP ultra-wide"],
      ["Water and dust", "IP67"],
      ["Audio", "Open-ear speakers, wind-noise reduction"],
      ["Lenses", "PRIZM shield"],
      ["App", "Meta AI (iOS and Android)"],
    ],
    features: SHARED_FEATURES,
    faq: [
      ...SHARED_FAQ,
      {
        title: "Can I sweat in them?",
        body: "Yes. Vanguard is rated IP67 against water and dust. Rinse with fresh water and dry before you return it.",
      },
    ],
  },
];

export function getGlasses(slug: string): Glasses | undefined {
  return GLASSES.find((g) => g.slug === slug);
}

export const SETUP_GUIDE: Feature[] = [
  {
    title: "Check the charge.",
    body: "Open the case. The light in front turns green when the glasses are charged. We hand them over fully charged.",
  },
  {
    title: "Install the Meta AI app.",
    body: "Download Meta AI from the App Store or Google Play and sign in with a Meta account. It is free.",
  },
  {
    title: "Pair the glasses.",
    body: "In the app, tap Add device. Keep the glasses in the open case near your phone and follow the prompts. It takes about five minutes.",
  },
  {
    title: "Learn the three controls.",
    body: "Say “Hey Meta” to ask. Tap or swipe the touchpad on the right arm for music and volume. Press the capture button for photos.",
  },
  {
    title: "Ask about a sign or a menu.",
    body: "Look at it and say “Hey Meta, look and translate this.” Language support comes from Meta and changes over time; we test every pair before hand-over.",
  },
  {
    title: "Get walking directions.",
    body: "Start walking directions in a map app on your phone, such as Naver Map or Google Maps. Its voice guidance plays through the glasses’ speakers, in the language the app is set to.",
  },
];

export const SEOUL_ETIQUETTE: Feature[] = [
  {
    title: "Ask before you film people.",
    body: "Filming people without their consent can be illegal in Korea. The capture light is there for a reason; never cover it.",
  },
  {
    title: "Palaces and the subway.",
    body: "Photos are fine in palace grounds, but some halls and exhibitions forbid them. On the subway, keep the camera off around other passengers.",
  },
  {
    title: "Make the battery last.",
    body: "Put the glasses back in the case at lunch. Fifteen minutes in the case gives you a few more hours.",
  },
];

export const RETURN_CHECKLIST = [
  "Back up your photos and videos in the Meta AI app.",
  "Remove the glasses from your Meta AI app.",
  "Put the glasses in the charging case.",
  "Pack the cable with the case.",
];

export const PICKUP_LOCATIONS = [
  {
    id: "icn-t1",
    name: "Incheon Airport, Terminal 1",
    nameKo: "인천국제공항 제1여객터미널",
    detail: "Exact meeting point is sent with your confirmation",
  },
  {
    id: "icn-t2",
    name: "Incheon Airport, Terminal 2",
    nameKo: "인천국제공항 제2여객터미널",
    detail: "Exact meeting point is sent with your confirmation",
  },
] as const;

export type PickupLocationId = (typeof PICKUP_LOCATIONS)[number]["id"];

export function getPickupLocation(id: string) {
  return PICKUP_LOCATIONS.find((l) => l.id === id);
}
