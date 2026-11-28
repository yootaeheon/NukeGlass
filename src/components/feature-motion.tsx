import type { CSSProperties } from "react";
import type { CloserLookKey } from "@/lib/closer-look";

// The feature "working", drawn over its product picture in the closer look.
// Decorative only: hidden from assistive tech, and from visitors who ask for
// reduced motion (globals.css). Positions are percentages of the 3:2 picture, so they
// hold at every size; they belong to the Wayfarer pictures in public/features/.
const at = (left: number, top: number, vars: Record<string, string> = {}) =>
  ({ left: `${left}%`, top: `${top}%`, ...vars }) as CSSProperties;

const AMBER = "#ffc46b";

export function FeatureMotion({ feature }: { feature: CloserLookKey }) {
  return (
    <div aria-hidden="true" className="fm">
      {MOTION[feature]}
    </div>
  );
}

const MOTION: Record<CloserLookKey, React.ReactNode> = {
  // Gloss passing over the frame
  design: <span className="fm-sweep" />,

  // The shutter closes on the lens, then a flash
  camera: (
    <>
      <span className="fm-ring fm-shutter" style={at(43.7, 41.8, { "--s": "20%" })} />
      <span className="fm-flash" />
    </>
  ),

  // The corner light breathes while the glasses listen
  ask: (
    <>
      <span className="fm-ring" style={at(91.4, 40.1, { "--s": "17%" })} />
      <span className="fm-ring" style={at(91.4, 40.1, { "--s": "17%", "--dl": "1200ms" })} />
      <span className="fm-dot" style={at(91.4, 40.1, { "--s": "2.2%" })} />
      <span className="fm-voice" style={at(86, 26)}>
        <i />
        <i style={{ "--dl": "150ms" } as CSSProperties} />
        <i style={{ "--dl": "300ms" } as CSSProperties} />
        <span lang="en">Hey Meta</span>
      </span>
    </>
  ),

  // Sound leaving the speaker
  audio: (
    <>
      <span className="fm-ring" style={at(63.6, 70.2, { "--s": "30%" })} />
      <span className="fm-ring" style={at(63.6, 70.2, { "--s": "30%", "--dl": "800ms" })} />
      <span className="fm-ring" style={at(63.6, 70.2, { "--s": "30%", "--dl": "1600ms" })} />
    </>
  ),

  // A fingertip slides along the touchpad; the capture button answers
  control: (
    <>
      <span className="fm-swipe" style={at(42, 45.2, { "--dx": "552%", "--dy": "-33%" })} />
      <span className="fm-ring" style={at(67.6, 35.5, { "--s": "12%", "--t": "3200ms", "--dl": "1900ms" })} />
    </>
  ),

  // The case lights fill up
  battery: (
    <>
      {[
        [50.3, 71.75],
        [51.7, 71.15],
        [53.2, 70.5],
        [54.8, 69.85],
      ].map(([left, top], i) => (
        <span
          key={left}
          className="fm-dot fm-charge"
          style={at(left, top, { "--s": "0.95%", "--c": AMBER, "--dl": `${i * 320}ms` })}
        />
      ))}
    </>
  ),

  // Light moves between the clear pair and the sunglass pair
  lenses: (
    <>
      <span className="fm-shade" style={{ left: 0 }} />
      <span className="fm-shade" style={{ right: 0, "--dl": "2600ms" } as CSSProperties} />
    </>
  ),
};
