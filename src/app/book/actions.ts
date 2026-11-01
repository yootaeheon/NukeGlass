"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { parseBookingForm, reservationErrorMessage, type FieldErrors } from "@/lib/booking-form";

export type BookingState = { errors?: FieldErrors; formError?: string };

export async function requestBooking(_prev: BookingState, formData: FormData): Promise<BookingState> {
  const supabase = await createClient();
  if (!supabase) return { formError: "Bookings are not open yet." };

  // Authorization is checked here, not only on the page.
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { formError: reservationErrorMessage("not_authenticated") };

  const parsed = parseBookingForm(formData);
  if (!parsed.ok) return { errors: parsed.errors };

  const v = parsed.value;
  const { data, error } = await supabase.rpc("request_reservation", {
    p_model_slug: v.model,
    p_start_date: v.start,
    p_end_date: v.end,
    p_pickup_location: v.location,
    p_pickup_slot: v.slot,
    p_contact_name: v.name,
    p_contact_channel: v.channel,
    p_contact_value: v.contact,
  });

  if (error) {
    // Never log the form: it holds the customer's name and contact.
    console.error("request_reservation failed", { code: error.code, message: error.message });
    return { formError: reservationErrorMessage(error.message) };
  }

  const code = (data as { reservation_code: string }[] | null)?.[0]?.reservation_code;
  redirect(code ? `/bookings?new=${encodeURIComponent(code)}` : "/bookings");
}
