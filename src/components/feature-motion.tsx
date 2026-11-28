import type { CSSProperties } from "react";
import type { CloserLookKey } from "@/lib/closer-look";
import type { GlassesSlug } from "@/lib/glasses";

// The feature "working", drawn over its product picture in the closer look.
// Decorative only: hidden from assistive tech, and from visitors who ask for
// reduced motion (globals.css). Positions are percentages of the 3:2 picture, so they
// hold at every size. They belong to the pictures in public/features/<slug>/: when a
// picture is replaced, measure its spots again.

type Spot = readonly [left: number, top: number];

type Spots = {
  /** Centre of the camera lens in camera.jpg */
  camera: Spot;
  /** The indicator light in ask.jpg, and where the "Hey Meta" label sits */
  ask: Spot;
  askLabel: Spot;
  /** Centre of the speaker grille in audio.jpg */
  audio: Spot;
  /** control.jpg: the fingertip's path along the arm, and the capture button */
  swipe: readonly [from: Spot, to: Spot];
  button: Spot;
  /** The case lights in battery.jpg, left to right */
  battery: readonly Spot[];
  /** lenses.jpg: two pairs side by side, or one pair */
  lenses: "pair" | "single";
};

// The charging-case pictures share one composition, so the lights sit in the same place
const CASE_LIGHTS: readonly Spot[] = [
  [50.4, 71.9],
  [51.8, 71.2],
  [53.3, 70.55],
  [54.75, 69.9],
];

const SPOTS: Record<GlassesSlug, Spots> = {
  "ray-ban-meta-wayfarer": {
    camera: [43.7, 41.8],
    ask: [91.4, 40.1],
    askLabel: [86, 26],
    audio: [63.6, 70.2],
    swipe: [
      [42, 45.2],
      [66.3, 43],
    ],
    button: [67.6, 35.5],
    battery: [
      [50.3, 71.75],
      [51.7, 71.15],
      [53.2, 70.5],
      [54.8, 69.85],
    ],
    lenses: "pair",
  },
  "ray-ban-meta-skyler": {
    camera: [43.6, 42],
    ask: [90.3, 34.6],
    askLabel: [85, 20],
    audio: [62.4, 64],
    swipe: [
      [40, 44.5],
      [64, 43],
    ],
    button: [66.4, 35.7],
    battery: CASE_LIGHTS,
    lenses: "single",
  },
  "ray-ban-meta-blayzer-optics": {
    camera: [43.6, 40.2],
    ask: [89.7, 37.4],
    askLabel: [84, 23],
    audio: [62.4, 63.7],
    swipe: [
      [38, 40.5],
      [68, 40],
    ],
    button: [66.4, 32.4],
    battery: CASE_LIGHTS,
    lenses: "single",
  },
  "oakley-meta-hstn": {
    camera: [43.6, 40],
    ask: [90.5, 35.9],
    askLabel: [85, 21],
    audio: [62.4, 65.2],
    swipe: [
      [40, 42],
      [64, 41],
    ],
    button: [66.4, 35.7],
    battery: CASE_LIGHTS,
    lenses: "single",
  },
  "oakley-meta-vanguard": {
    camera: [48, 40.2],
    ask: [37.5, 38.4],
    askLabel: [62, 22],
    audio: [62.4, 65.2],
    swipe: [
      [40, 43],
      [64, 42],
    ],
    button: [66.4, 33.6],
    battery: CASE_LIGHTS,
    lenses: "single",
  },
};

const at = ([left, top]: Spot, vars: Record<string, string> = {}) =>
  ({ left: `${left}%`, top: `${top}%`, ...vars }) as CSSProperties;

const AMBER = "#ffc46b";
// The fingertip is 4.4% of the picture's width; its travel is given in its own size
const FINGER = 4.4;

export function FeatureMotion({ slug, feature }: { slug: GlassesSlug; feature: CloserLookKey }) {
  return (
    <div aria-hidden="true" className="fm">
      {motion(SPOTS[slug], feature)}
    </div>
  );
}

function motion(s: Spots, feature: CloserLookKey) {
  switch (feature) {
    // Gloss passing over the frame
    case "design":
      return <span className="fm-sweep" />;

    // The shutter closes on the lens, then a flash
    case "camera":
      return (
        <>
          <span className="fm-ring fm-shutter" style={at(s.camera, { "--s": "20%" })} />
          <span className="fm-flash" />
        </>
      );

    // The indicator light breathes while the glasses listen
    case "ask":
      return (
        <>
          <span className="fm-ring" style={at(s.ask, { "--s": "17%" })} />
          <span className="fm-ring" style={at(s.ask, { "--s": "17%", "--dl": "1200ms" })} />
          <span className="fm-dot" style={at(s.ask, { "--s": "2.2%" })} />
          <span className="fm-voice" style={at(s.askLabel)}>
            <i />
            <i style={{ "--dl": "150ms" } as CSSProperties} />
            <i style={{ "--dl": "300ms" } as CSSProperties} />
            <span lang="en">Hey Meta</span>
          </span>
        </>
      );

    // Sound leaving the speaker
    case "audio":
      return (
        <>
          <span className="fm-ring" style={at(s.audio, { "--s": "30%" })} />
          <span className="fm-ring" style={at(s.audio, { "--s": "30%", "--dl": "800ms" })} />
          <span className="fm-ring" style={at(s.audio, { "--s": "30%", "--dl": "1600ms" })} />
        </>
      );

    // A fingertip slides along the arm; the capture button answers
    case "control": {
      const [from, to] = s.swipe;
      // translate() percentages are of the fingertip itself: width for x, and its height
      // (the same length, since it is round) for y. The picture is 3:2, so a vertical
      // step of 1% of the picture is 1/1.5 % of its width.
      const dx = ((to[0] - from[0]) / FINGER) * 100;
      const dy = ((to[1] - from[1]) / 1.5 / FINGER) * 100;
      return (
        <>
          <span className="fm-swipe" style={at(from, { "--dx": `${dx.toFixed(0)}%`, "--dy": `${dy.toFixed(0)}%` })} />
          <span className="fm-ring" style={at(s.button, { "--s": "12%", "--t": "3200ms", "--dl": "1900ms" })} />
        </>
      );
    }

    // The case lights fill up
    case "battery":
      return (
        <>
          {s.battery.map((spot, i) => (
            <span
              key={spot[0]}
              className="fm-dot fm-charge"
              style={at(spot, { "--s": "0.95%", "--c": AMBER, "--dl": `${i * 320}ms` })}
            />
          ))}
        </>
      );

    // Two pairs: light moves from one to the other. One pair: light crosses the lenses.
    case "lenses":
      return s.lenses === "pair" ? (
        <>
          <span className="fm-shade" style={{ left: 0 }} />
          <span className="fm-shade" style={{ right: 0, "--dl": "2600ms" } as CSSProperties} />
        </>
      ) : (
        <span className="fm-sweep" />
      );
  }
}
