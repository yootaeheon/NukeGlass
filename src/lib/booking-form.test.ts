import { describe, expect, it } from "vitest";
import { errorVars, parseBookingForm, reservationErrorCode } from "./booking-form";

const NOW = new Date("2026-11-01T03:00:00Z"); // 12:00 KST

function form(overrides: Record<string, string | undefined> = {}) {
  const base: Record<string, string | undefined> = {
    model: "ray-ban-meta-wayfarer",
    start: "2026-11-04",
    end: "2026-11-06",
    location: "icn-t1",
    slot: "10:00",
    name: "Alex Kim",
    channel: "whatsapp",
    contact: "+1 415 555 0100",
    consent: "on",
    ...overrides,
  };
  return { get: (k: string) => base[k] ?? null };
}

describe("parseBookingForm", () => {
  it("accepts a complete request", () => {
    const r = parseBookingForm(form(), NOW);
    expect(r).toMatchObject({ ok: true, days: 3, value: { model: "ray-ban-meta-wayfarer", slot: "10:00" } });
  });

  it("rejects unknown models, locations and slots", () => {
    const r = parseBookingForm(form({ model: "x", location: "seoul-station", slot: "03:00" }), NOW);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(Object.keys(r.errors).sort()).toEqual(["location", "model", "slot"]);
  });

  it("reports date problems on the dates field", () => {
    const r = parseBookingForm(form({ start: "2026-11-01" }), NOW);
    expect(r).toMatchObject({ ok: false, errors: { dates: "too_soon" } });
    expect(errorVars("too_soon")).toEqual({ n: 2 });
  });

  it("requires consent", () => {
    const r = parseBookingForm(form({ consent: undefined }), NOW);
    expect(r).toMatchObject({ ok: false, errors: { consent: "consent" } });
  });

  it("checks the contact format per channel", () => {
    expect(parseBookingForm(form({ channel: "email", contact: "nope" }), NOW).ok).toBe(false);
    expect(parseBookingForm(form({ channel: "email", contact: "a@b.co" }), NOW).ok).toBe(true);
    expect(parseBookingForm(form({ channel: "kakaotalk", contact: "alex_kim" }), NOW).ok).toBe(true);
    expect(parseBookingForm(form({ channel: "phone", contact: "call me" }), NOW).ok).toBe(false);
  });

  it("trims and bounds the name", () => {
    expect(parseBookingForm(form({ name: "   " }), NOW).ok).toBe(false);
    expect(parseBookingForm(form({ name: "x".repeat(101) }), NOW).ok).toBe(false);
  });
});

describe("reservationErrorCode", () => {
  it("passes known RPC errors through and hides unknown ones", () => {
    expect(reservationErrorCode("sold_out")).toBe("sold_out");
    expect(reservationErrorCode("too_many_requests")).toBe("too_many_requests");
    expect(reservationErrorCode("duplicate key value violates unique constraint")).toBe("generic");
    expect(reservationErrorCode(undefined)).toBe("generic");
  });
});
