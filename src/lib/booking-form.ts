import { BOOKING_RULES, PICKUP_SLOTS, validateBookingDates, type DateError } from "./booking";
import { getGlasses, getPickupLocation } from "./glasses";
import type { Dictionary } from "@/i18n/dictionaries/en";

export const CONTACT_CHANNELS = ["whatsapp", "email", "kakaotalk", "line", "phone"] as const;
export type ContactChannel = (typeof CONTACT_CHANNELS)[number];

export type BookingRequest = {
  model: string;
  start: string;
  end: string;
  location: string;
  slot: string;
  name: string;
  channel: string;
  contact: string;
};

/** Keys of dictionary.errors; the UI turns them into text in the visitor's language. */
export type ErrorCode = keyof Dictionary["errors"];

export type FieldErrors = Partial<Record<keyof BookingRequest | "consent" | "dates", ErrorCode>>;

export type ParsedBooking = { ok: true; value: BookingRequest; days: number } | { ok: false; errors: FieldErrors };

const str = (v: FormDataEntryValue | null | undefined) => (typeof v === "string" ? v.trim() : "");

/** Validates the booking form. The DB re-checks dates, model and availability. */
export function parseBookingForm(form: { get(name: string): FormDataEntryValue | null }, now = new Date()): ParsedBooking {
  const value: BookingRequest = {
    model: str(form.get("model")),
    start: str(form.get("start")),
    end: str(form.get("end")),
    location: str(form.get("location")),
    slot: str(form.get("slot")),
    name: str(form.get("name")),
    channel: str(form.get("channel")),
    contact: str(form.get("contact")),
  };
  const errors: FieldErrors = {};

  if (!getGlasses(value.model)) errors.model = "model";

  const dates = validateBookingDates(value.start, value.end, now);
  if (!dates.ok) errors.dates = dates.error;

  if (!getPickupLocation(value.location)) errors.location = "location";
  if (!(PICKUP_SLOTS as readonly string[]).includes(value.slot)) errors.slot = "slot";

  if (value.name.length < 1 || value.name.length > 100) errors.name = "name";
  if (!(CONTACT_CHANNELS as readonly string[]).includes(value.channel)) errors.channel = "channel";

  if (value.channel === "email") {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.contact) || value.contact.length > 120) errors.contact = "contact_email";
  } else if (!/^\+?[0-9 ()-]{6,20}$/.test(value.contact) && !(value.channel === "kakaotalk" || value.channel === "line")) {
    errors.contact = "contact_phone";
  } else if (value.contact.length < 3 || value.contact.length > 120) {
    errors.contact = "contact_id";
  }

  if (form.get("consent") !== "on") errors.consent = "consent";

  if (Object.keys(errors).length > 0 || !dates.ok) return { ok: false, errors };
  return { ok: true, value, days: dates.days };
}

const RPC_ERRORS: readonly ErrorCode[] = [
  "sold_out",
  "too_many_requests",
  "not_authenticated",
  "too_soon",
  "too_far",
  "too_long",
  "end_before_start",
];

/** Maps an error raised by the request_reservation RPC to an error code; anything else is "generic". */
export function reservationErrorCode(dbMessage: string | undefined): ErrorCode {
  return RPC_ERRORS.find((code) => code === dbMessage) ?? "generic";
}

/** Numbers to fill into error texts such as "at least {n} days". */
export function errorVars(code: ErrorCode | DateError): Record<string, number> {
  switch (code) {
    case "too_soon":
      return { n: BOOKING_RULES.leadDays };
    case "too_far":
      return { n: BOOKING_RULES.horizonDays };
    case "too_long":
      return { n: BOOKING_RULES.maxDays };
    default:
      return {};
  }
}
