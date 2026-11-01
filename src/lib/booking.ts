// Booking date rules. Dates are Seoul calendar dates ("YYYY-MM-DD");
// the DB stores UTC timestamps (see supabase/migrations).
// Policy values are PM defaults until confirmed in the Notion planning page.

export const BOOKING_RULES = {
  /** Earliest pick-up is this many days after today (Seoul). */
  leadDays: 2,
  /** How far ahead a pick-up date can be. */
  horizonDays: 90,
  /** Longest rental, pick-up and return day included. */
  maxDays: 14,
} as const;

export const PICKUP_SLOTS = ["10:00", "13:00", "16:00", "19:00"] as const;
export type PickupSlot = (typeof PICKUP_SLOTS)[number];

const DAY_MS = 86_400_000;
const KST_OFFSET_MS = 9 * 3_600_000; // Korea has no DST
const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Parses "YYYY-MM-DD" to a UTC-midnight epoch ms, or null if it is not a real date. */
function parseDate(value: string): number | null {
  const m = DATE_RE.exec(value);
  if (!m) return null;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const ms = Date.UTC(y, mo - 1, d);
  const back = new Date(ms);
  if (back.getUTCFullYear() !== y || back.getUTCMonth() !== mo - 1 || back.getUTCDate() !== d) return null;
  return ms;
}

function formatDate(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

export function seoulToday(now: Date = new Date()): string {
  return formatDate(now.getTime() + KST_OFFSET_MS);
}

export function addDays(date: string, days: number): string {
  const ms = parseDate(date);
  if (ms === null) throw new Error(`Invalid date: ${date}`);
  return formatDate(ms + days * DAY_MS);
}

/** Pick-up and return day both count. */
export function rentalDays(start: string, end: string): number {
  const s = parseDate(start);
  const e = parseDate(end);
  if (s === null || e === null) throw new Error("Invalid date");
  return Math.round((e - s) / DAY_MS) + 1;
}

export type DateError = "invalid_date" | "end_before_start" | "too_soon" | "too_far" | "too_long";

export type DateValidation = { ok: true; days: number } | { ok: false; error: DateError };

export function validateBookingDates(start: string, end: string, now: Date = new Date()): DateValidation {
  const s = parseDate(start);
  const e = parseDate(end);
  if (s === null || e === null) return { ok: false, error: "invalid_date" };
  if (e < s) return { ok: false, error: "end_before_start" };

  const today = parseDate(seoulToday(now))!;
  if (s < today + BOOKING_RULES.leadDays * DAY_MS) return { ok: false, error: "too_soon" };
  if (s > today + BOOKING_RULES.horizonDays * DAY_MS) return { ok: false, error: "too_far" };

  const days = rentalDays(start, end);
  if (days > BOOKING_RULES.maxDays) return { ok: false, error: "too_long" };
  return { ok: true, days };
}

/** Long-stay discount (draft rental terms): 4–6 days 10%, 7+ days 20%. Mirrors request_reservation in SQL. */
export function discountPct(days: number): number {
  if (days >= 7) return 20;
  if (days >= 4) return 10;
  return 0;
}

/** Whole US dollars, discount applied. */
export function totalPriceUsd(dailyUsd: number, start: string, end: string): number {
  const days = rentalDays(start, end);
  return Math.round((dailyUsd * days * (100 - discountPct(days))) / 100);
}
