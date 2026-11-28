import type { GlassesSlug } from "./glasses";

// Every picture on the site, with its credit. Photographs of Seoul come from Wikimedia
// Commons under the licences listed here (credited in the footer). Product and scene
// images are AI-generated stand-ins until our own shoot (DESIGN.md §8); they show no
// real product and are marked as illustrative in the footer.

export type Photo = {
  src: string;
  width: number;
  height: number;
  /** Set for found photographs: shown in the footer credits */
  credit?: { title: string; by: string; licence: string; page: string };
};

const commons = (file: string, width: number, height: number, title: string, by: string, licence: string, page: string): Photo => ({
  src: `/photos/${file}.jpg`,
  width,
  height,
  credit: { title, by, licence, page },
});

export const PHOTOS = {
  palace: commons(
    "gyeonghoeru-royal-banquet-hall-at-gyeongbokgung-palace",
    1920,
    1280,
    "Gyeonghoeru at Gyeongbokgung Palace",
    "Frank Schulenburg",
    "CC BY-SA 4.0",
    "https://commons.wikimedia.org/wiki/File:Gyeonghoeru_(Royal_Banquet_Hall)_at_Gyeongbokgung_Palace,_Seoul.jpg",
  ),
  myeongdong: commons(
    "myeongdong-at-night",
    1920,
    1082,
    "Myeongdong at night",
    "Christian Bolz",
    "CC BY-SA 4.0",
    "https://commons.wikimedia.org/wiki/File:Myeongdong_at_night.jpg",
  ),
  bukchon: commons(
    "bukchon-ro-11-gil-street-with-hanok",
    1920,
    1280,
    "Bukchon-ro 11-gil at blue hour",
    "Basile Morin",
    "CC BY-SA 4.0",
    "https://commons.wikimedia.org/wiki/File:Bukchon-ro_11-gil_street_with_hanok_houses_at_blue_hour_in_Bukchon_Hanok_Village_Seoul.jpg",
  ),
  dancheong: commons(
    "dancheong-decoration-in-the-taewonjeon-hall-gyeongbokgung",
    1920,
    1280,
    "Dancheong in Taewonjeon Hall, Gyeongbokgung",
    "Ethan Doyle White",
    "CC BY-SA 4.0",
    "https://commons.wikimedia.org/wiki/File:Dancheong_Decoration_in_the_Taewonjeon_Hall,_Gyeongbokgung.jpg",
  ),
  jeon: commons(
    "seoul-jongno-district-gwangjang-market-jeon",
    1920,
    1280,
    "Jeon at Gwangjang Market",
    "Dr. Thomas Liptak",
    "CC BY-SA 4.0",
    "https://commons.wikimedia.org/wiki/File:Seoul,_Jongno_District,_Gwangjang_Market,_Jeon.jpg",
  ),
  platform: commons(
    "seoul-metro-425-hoehyeon-station-platform-20181124",
    1920,
    1080,
    "Hoehyeon station platform, Seoul Metro",
    "LERK",
    "CC BY-SA 4.0",
    "https://commons.wikimedia.org/wiki/File:Seoul-metro-425-Hoehyeon-station-platform-20181124-080256.jpg",
  ),
  namsan: commons(
    "namsan-tower-sunset-seoul",
    1920,
    1435,
    "Namsan Tower at sunset",
    "Rtflakfizer",
    "CC BY-SA 4.0",
    "https://commons.wikimedia.org/wiki/File:Namsan_Tower_sunset,_Seoul.jpg",
  ),
  hanokDoors: commons(
    "traditional-hanok-house-with-wooden-doors-along",
    1920,
    1440,
    "Hanok house on a Bukchon slope",
    "Basile Morin",
    "CC BY-SA 4.0",
    "https://commons.wikimedia.org/wiki/File:Traditional_hanok_house_with_wooden_doors_along_a_steeply_sloping_street_in_Bukchon_Hanok_Village_Seoul.jpg",
  ),
} satisfies Record<string, Photo>;

/** Illustrative scenes (AI-generated) */
export const SCENES = {
  marketDusk: { src: "/scenes/market-dusk.jpg", width: 1536, height: 864 },
  airportPickup: { src: "/scenes/airport-pickup.jpg", width: 1536, height: 864 },
  bukchonWalk: { src: "/scenes/bukchon-walk.jpg", width: 1536, height: 864 },
  pairPhone: { src: "/scenes/pair-phone.jpg", width: 1024, height: 1024 },
  returnDesk: { src: "/scenes/return-desk.jpg", width: 1024, height: 1024 },
  // Stills from the hero film, for "moments" on the home page
  momentDirections: { src: "/scenes/moment-directions.jpg", width: 1600, height: 900 },
  momentTouch: { src: "/scenes/moment-touch.jpg", width: 1600, height: 900 },
  momentAsk: { src: "/scenes/moment-ask.jpg", width: 1600, height: 900 },
  momentCall: { src: "/scenes/moment-call.jpg", width: 1600, height: 900 },
} satisfies Record<string, Photo>;

/** Home hero film (AI-generated with Higgsfield, silent, no captions): a traveller in Seoul wearing the glasses */
export const HERO_VIDEO = {
  src: "/video/hero-features.mp4",
  poster: "/video/hero-features-poster.jpg",
  width: 1280,
  height: 720,
};

/** Illustrative product renders (AI-generated), one per model, on the --product ground */
export const PRODUCT_IMAGES: Record<GlassesSlug, Photo> = {
  "ray-ban-meta-wayfarer": { src: "/products/ray-ban-meta-wayfarer.jpg", width: 1536, height: 1024 },
  "ray-ban-meta-skyler": { src: "/products/ray-ban-meta-skyler.jpg", width: 1536, height: 1024 },
  "ray-ban-meta-blayzer-optics": { src: "/products/ray-ban-meta-blayzer-optics.jpg", width: 1536, height: 1024 },
  "oakley-meta-hstn": { src: "/products/oakley-meta-hstn.jpg", width: 1536, height: 1024 },
  "oakley-meta-vanguard": { src: "/products/oakley-meta-vanguard.jpg", width: 1536, height: 1024 },
};

export const LICENCE_URLS: Record<string, string> = {
  CC0: "https://creativecommons.org/publicdomain/zero/1.0/",
  "CC BY-SA 4.0": "https://creativecommons.org/licenses/by-sa/4.0/",
};

export const PHOTO_CREDITS = Object.values(PHOTOS).flatMap((p) => (p.credit ? [p.credit] : []));
