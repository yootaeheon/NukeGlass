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

export const DATE_ERROR_MESSAGES: Record<DateError, string> = {
  invalid_date: "Choose a pick-up date and a return date.",
  end_before_start: "The return date has to be on or after the pick-up date.",
  too_soon: `Pick-up has to be at least ${BOOKING_RULES.leadDays} days from today (Seoul time).`,
  too_far: `You can book up to ${BOOKING_RULES.horizonDays} days ahead.`,
  too_long: `The longest rental is ${BOOKING_RULES.maxDays} days.`,
};

/** Pick-up at the slot time (KST) until the end of the return day (KST), as UTC instants. */
export function kstWindowToUtc(start: string, end: string, slot: string): { startAt: Date; endAt: Date } {
  const s = parseDate(start);
  const e = parseDate(end);
  const m = /^(\d{2}):(\d{2})$/.exec(slot);
  if (s === null || e === null || !m) throw new Error("Invalid booking window");
  const slotMs = (Number(m[1]) * 60 + Number(m[2])) * 60_000;
  return {
    startAt: new Date(s + slotMs - KST_OFFSET_MS),
    endAt: new Date(e + DAY_MS - KST_OFFSET_MS),
  };
}

export function totalPriceUsd(dailyUsd: number, start: string, end: string): number {
  return dailyUsd * rentalDays(start, end);
}

const KST_DATE_FMT = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Seoul",
  weekday: "short",
  day: "numeric",
  month: "short",
  year: "numeric",
});

/** "Wed 4 Nov 2026" for a Seoul calendar date. */
export function formatSeoulDate(date: string): string {
  const ms = parseDate(date);
  if (ms === null) return date;
  // noon KST keeps the formatted day stable
  return KST_DATE_FMT.format(new Date(ms + 3 * 3_600_000)).replace(",", "");
}
