import type { FrameShape } from "@/lib/glasses";

// Line drawings stand in for product photos until we shoot our own
// (official brand images need permission). Same angle and weight for every frame.

const LENSES: Record<FrameShape, string> = {
  wayfarer: "M28 46 L112 40 Q120 40 119 50 L112 92 Q110 102 98 102 L46 102 Q34 102 32 92 Z",
  skyler: "M30 52 Q36 38 64 40 L108 44 Q120 46 117 58 L110 88 Q106 102 90 102 L56 102 Q38 102 34 88 Z",
  blayzer: "M30 44 L114 44 Q120 44 120 50 L118 94 Q118 102 110 102 L38 102 Q30 102 30 94 Z",
  hstn: "M26 48 Q30 38 52 38 L106 38 Q122 38 120 54 L114 90 Q110 106 92 106 L50 106 Q32 106 28 90 Z",
  vanguard: "",
};

function mirror(path: string) {
  // reflect a left-lens path around x = 160
  return path.replace(/(-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)/g, (_, x, y) => `${320 - Number(x)} ${y}`);
}

export function FrameDrawing({ shape, label, className = "" }: { shape: FrameShape; label: string; className?: string }) {
  return (
    <svg viewBox="0 0 320 150" role="img" aria-label={label} className={className} fill="none">
      <g stroke="currentColor" strokeWidth="5" strokeLinejoin="round" strokeLinecap="round">
        {shape === "vanguard" ? (
          <>
            <path d="M20 54 Q40 30 110 34 L210 34 Q280 30 300 54 L292 84 Q284 108 250 108 Q206 108 186 86 Q172 72 160 72 Q148 72 134 86 Q114 108 70 108 Q36 108 28 84 Z" />
            <path d="M20 54 L4 50" />
            <path d="M300 54 L316 50" />
          </>
        ) : (
          <>
            <path d={LENSES[shape]} />
            <path d={mirror(LENSES[shape])} />
            <path d="M118 56 Q160 40 202 56" />
            <path d={shape === "hstn" ? "M26 50 L6 46" : "M30 50 L8 48"} />
            <path d={shape === "hstn" ? "M294 50 L314 46" : "M290 50 L312 48"} />
          </>
        )}
        {/* camera and capture LED on the hinge */}
        <circle cx={shape === "vanguard" ? 160 : 40} cy={shape === "vanguard" ? 48 : 56} r="5" />
      </g>
    </svg>
  );
}
