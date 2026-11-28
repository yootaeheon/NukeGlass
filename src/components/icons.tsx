// One small icon family for the whole site: 24px grid, 1.75 stroke, round joins.
// Decorative: every icon sits beside the text that says the same thing.
type Name =
  | "calendar"
  | "plane"
  | "link"
  | "return"
  | "phone"
  | "battery"
  | "chat"
  | "pin"
  | "glasses"
  | "camera"
  | "shield";

const PATHS: Record<Name, React.ReactNode> = {
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="15" rx="3" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
      <path d="M8.5 14.5l2 2 4.5-4.5" />
    </>
  ),
  plane: (
    <path d="M10 19l1.5-5.5L5 11l1-2 6.5 1 3.2-5.2a1.6 1.6 0 0 1 2.8 1.6L15.5 12l1 6.5-2 1-2.5-6" />
  ),
  link: (
    <>
      <rect x="7" y="2.5" width="10" height="19" rx="2.5" />
      <path d="M10.5 18.5h3" />
      <path d="M10 9.5a3 3 0 0 1 4 0M11.2 11.8a1.2 1.2 0 0 1 1.6 0" />
    </>
  ),
  return: (
    <>
      <path d="M8 8H15a4.5 4.5 0 0 1 0 9H6" />
      <path d="M11 5L8 8l3 3" />
    </>
  ),
  phone: (
    <>
      <rect x="7" y="2.5" width="10" height="19" rx="2.5" />
      <path d="M10.5 18.5h3" />
    </>
  ),
  battery: (
    <>
      <rect x="2.5" y="7.5" width="16" height="9" rx="2.5" />
      <path d="M21.5 10.5v3M6 10.5v3M9.5 10.5v3" />
    </>
  ),
  chat: (
    <>
      <path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v7a2.5 2.5 0 0 1-2.5 2.5H11l-4.5 4v-4A2.5 2.5 0 0 1 4 13.5z" />
      <path d="M8.5 9h7M8.5 12h4" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s6.5-5.6 6.5-11a6.5 6.5 0 0 0-13 0c0 5.4 6.5 11 6.5 11z" />
      <circle cx="12" cy="10" r="2.3" />
    </>
  ),
  glasses: (
    <>
      <circle cx="7" cy="14" r="3.5" />
      <circle cx="17" cy="14" r="3.5" />
      <path d="M10.5 14h3M3.5 13l1.5-6M20.5 13L19 7" />
    </>
  ),
  camera: (
    <>
      <path d="M4 8.5A2.5 2.5 0 0 1 6.5 6h1.200l1.3-2h6l1.3 2h1.200A2.5 2.5 0 0 1 20 8.5v8a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 16.500z" />
      <circle cx="12" cy="12.5" r="3.2" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3l7 2.500v5.500c0 4.5-3 8-7 10-4-2-7-5.5-7-10V5.500z" />
      <path d="M9 12l2.2 2.200L15.2 10" />
    </>
  ),
};

export type IconName = Name;

export function Icon({
  name,
  className = "size-6",
}: {
  name: Name;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {PATHS[name]}
    </svg>
  );
}
