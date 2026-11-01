import { describe, expect, it } from "vitest";
import {
  BOOKING_RULES,
  rentalDays,
  seoulToday,
  totalPriceUsd,
  validateBookingDates,
} from "./booking";

// 2026-11-01 23:30 KST == 2026-11-01 14:30 UTC
const NOW = new Date("2026-11-01T14:30:00Z");

describe("seoulToday", () => {
  it("uses the Seoul calendar date, not UTC", () => {
    // 2026-11-01 16:00 UTC is already 2026-11-02 01:00 in Seoul
    expect(seoulToday(new Date("2026-11-01T16:00:00Z"))).toBe("2026-11-02");
    expect(seoulToday(NOW)).toBe("2026-11-01");
  });
});

describe("rentalDays", () => {
  it("counts pick-up and return day inclusively", () => {
    expect(rentalDays("2026-11-04", "2026-11-04")).toBe(1);
    expect(rentalDays("2026-11-04", "2026-11-06")).toBe(3);
  });

  it("crosses month boundaries", () => {
    expect(rentalDays("2026-11-29", "2026-12-02")).toBe(4);
  });
});

describe("validateBookingDates", () => {
  it("accepts a valid range", () => {
    expect(validateBookingDates("2026-11-03", "2026-11-05", NOW)).toEqual({ ok: true, days: 3 });
  });

  it("rejects malformed and impossible dates", () => {
    expect(validateBookingDates("2026-13-01", "2026-13-02", NOW)).toMatchObject({ ok: false, error: "invalid_date" });
    expect(validateBookingDates("2026-02-30", "2026-03-01", NOW)).toMatchObject({ ok: false, error: "invalid_date" });
    expect(validateBookingDates("", "2026-11-05", NOW)).toMatchObject({ ok: false, error: "invalid_date" });
  });

  it("rejects a return date before the pick-up date", () => {
    expect(validateBookingDates("2026-11-06", "2026-11-05", NOW)).toMatchObject({ ok: false, error: "end_before_start" });
  });

  it("requires the minimum lead time in Seoul time", () => {
    // today (Seoul) is 11-01, lead time is 2 days -> earliest pick-up is 11-03
    expect(validateBookingDates("2026-11-02", "2026-11-03", NOW)).toMatchObject({ ok: false, error: "too_soon" });
    expect(validateBookingDates("2026-11-03", "2026-11-04", NOW)).toMatchObject({ ok: true });
  });

  it("rejects bookings too far ahead", () => {
    expect(validateBookingDates("2027-03-01", "2027-03-02", NOW)).toMatchObject({ ok: false, error: "too_far" });
  });

  it("caps the rental length", () => {
    const max = BOOKING_RULES.maxDays;
    expect(validateBookingDates("2026-11-03", "2026-11-16", NOW)).toMatchObject({ ok: true, days: max });
    expect(validateBookingDates("2026-11-03", "2026-11-17", NOW)).toMatchObject({ ok: false, error: "too_long" });
  });
});

describe("totalPriceUsd", () => {
  it("multiplies the daily rate by inclusive days", () => {
    expect(totalPriceUsd(29, "2026-11-04", "2026-11-06")).toBe(87);
  });
});
