import { DATE_ERROR_MESSAGES, PICKUP_SLOTS, validateBookingDates } from "./booking";
import { getGlasses, getPickupLocation } from "./glasses";

export const CONTACT_CHANNELS = [
  { id: "whatsapp", label: "WhatsApp" },
  { id: "email", label: "Email" },
  { id: "kakaotalk", label: "KakaoTalk" },
  { id: "line", label: "LINE" },
  { id: "phone", label: "Phone (SMS)" },
] as const;

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

export type FieldErrors = Partial<Record<keyof BookingRequest | "consent" | "dates", string>>;

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

  if (!getGlasses(value.model)) errors.model = "Choose a pair of glasses.";

  const dates = validateBookingDates(value.start, value.end, now);
  if (!dates.ok) errors.dates = DATE_ERROR_MESSAGES[dates.error];

  if (!getPickupLocation(value.location)) errors.location = "Choose where to collect the glasses.";
  if (!(PICKUP_SLOTS as readonly string[]).includes(value.slot)) errors.slot = "Choose a pick-up time.";

  if (value.name.length < 1 || value.name.length > 100) errors.name = "Enter the name we should ask for at pick-up.";
  if (!CONTACT_CHANNELS.some((c) => c.id === value.channel)) errors.channel = "Choose how we should reach you.";

  if (value.channel === "email") {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.contact) || value.contact.length > 120)
      errors.contact = "Enter an email address like name@example.com.";
  } else if (!/^\+?[0-9 ()-]{6,20}$/.test(value.contact) && !(value.channel === "kakaotalk" || value.channel === "line")) {
    errors.contact = "Enter a phone number with the country code, like +1 415 555 0100.";
  } else if (value.contact.length < 3 || value.contact.length > 120) {
    errors.contact = "Enter your ID or phone number.";
  }

  if (form.get("consent") !== "on") errors.consent = "Please agree so we can contact you about this booking.";

  if (Object.keys(errors).length > 0 || !dates.ok) return { ok: false, errors };
  return { ok: true, value, days: dates.days };
}

/** Maps errors raised by the request_reservation RPC to customer-facing text. */
export function reservationErrorMessage(dbMessage: string | undefined): string {
  switch (dbMessage) {
    case "sold_out":
      return "This pair is fully booked for those dates. Try other dates or another pair.";
    case "too_many_requests":
      return "You already have two booking requests waiting. Cancel one, or wait until we confirm them.";
    case "not_authenticated":
      return "Your sign-in expired. Please sign in again.";
    case "too_soon":
    case "too_far":
    case "too_long":
    case "end_before_start":
      return DATE_ERROR_MESSAGES[dbMessage];
    default:
      return "We could not save your booking. Please try again in a minute.";
  }
}
