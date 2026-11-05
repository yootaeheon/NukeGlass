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
  throneHall: commons(
    "gyeongbokgung-palace-geunjeongjeon-hall",
    1920,
    1280,
    "Geunjeongjeon, Gyeongbokgung Palace",
    "Brady Bellini",
    "CC0",
    "https://commons.wikimedia.org/wiki/File:Gyeongbokgung(palace)_Geunjeongjeon(hall).jpg",
  ),
  palace: commons(
    "gyeonghoeru-royal-banquet-hall-at-gyeongbokgung-palace",
    1920,
    1280,
    "Gyeonghoeru at Gyeongbokgung Palace",
    "Frank Schulenburg",
    "CC BY-SA 4.0",
    "https://commons.wikimedia.org/wiki/File:Gyeonghoeru_(Royal_Banquet_Hall)_at_Gyeongbokgung_Palace,_Seoul.jpg",
  ),
  market: commons(
    "gwangjang-market-seoul-01",
    1920,
    1280,
    "Gwangjang Market, Seoul",
    "Bgag",
    "CC0",
    "https://commons.wikimedia.org/wiki/File:Gwangjang_Market,_Seoul_01.jpg",
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
  insadong: commons(
    "seoul-jongno-district-insa-dong-insadong-gil",
    1920,
    1080,
    "Insadong-gil",
    "Dr. Thomas Liptak",
    "CC BY-SA 4.0",
    "https://commons.wikimedia.org/wiki/File:Seoul,_Jongno_District,_Insa-dong,_Insadong-gil.jpg",
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
} satisfies Record<string, Photo>;

/** Illustrative product renders (AI-generated), one per model, on the --product ground */
export const PRODUCT_IMAGES: Record<GlassesSlug, Photo> = {
  "ray-ban-meta-wayfarer": { src: "/products/ray-ban-meta-wayfarer.jpg", width: 1536, height: 1024 },
  "ray-ban-meta-skyler": { src: "/products/ray-ban-meta-skyler.jpg", width: 1536, height: 1024 },
  "ray-ban-meta-blayzer-optics": { src: "/products/ray-ban-meta-blayzer-optics.jpg", width: 1536, height: 1024 },
  "oakley-meta-hstn": { src: "/products/oakley-meta-hstn.jpg", width: 1536, height: 1024 },
  "oakley-meta-vanguard": { src: "/products/oakley-meta-vanguard.jpg", width: 1536, height: 1024 },
};

export const PHOTO_CREDITS = Object.values(PHOTOS).flatMap((p) => (p.credit ? [p.credit] : []));
