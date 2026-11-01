"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function cancelBooking(formData: FormData): Promise<void> {
  const code = formData.get("code");
  if (typeof code !== "string" || !/^[A-Z0-9]{8}$/.test(code)) return;

  const supabase = await createClient();
  if (!supabase) return;
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return;

  // The RPC only cancels the caller's own reservation while it is still "requested".
  const { error } = await supabase.rpc("cancel_reservation", { p_code: code });
  revalidatePath("/bookings");
  if (error) {
    console.error("cancel_reservation failed", { code: error.code });
    redirect("/bookings?cancel=failed");
  }
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase?.auth.signOut();
  revalidatePath("/", "layout");
}
