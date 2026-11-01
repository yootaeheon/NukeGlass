"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DEFAULT_LOCALE, isLocale } from "@/i18n/config";
import { GLASSES } from "@/lib/glasses";

// Operator actions. The database checks is_admin() inside every function, so these
// actions only pass input through; a non-admin gets "forbidden" from the DB.

const STATUSES = ["confirmed", "picked_up", "returned", "cancelled"] as const;

function adminPath(formData: FormData) {
  const lang = formData.get("lang");
  return `/${typeof lang === "string" && isLocale(lang) ? lang : DEFAULT_LOCALE}/admin`;
}

function str(formData: FormData, key: string) {
  const v = formData.get(key);
  return typeof v === "string" ? v.trim() : "";
}

async function client() {
  const supabase = await createClient();
  if (!supabase) throw new Error("Supabase is not configured");
  return supabase;
}

function done(path: string, msg: string): never {
  revalidatePath(path);
  redirect(`${path}?msg=${encodeURIComponent(msg)}`);
}

export async function setStatus(formData: FormData): Promise<void> {
  const path = adminPath(formData);
  const code = str(formData, "code");
  const to = str(formData, "to");
  const reason = str(formData, "reason").slice(0, 300);
  if (!/^[A-Z0-9]{8}$/.test(code) || !(STATUSES as readonly string[]).includes(to)) done(path, "invalid");
  if (to === "cancelled" && !reason) done(path, "reason_required");

  const supabase = await client();
  const { error } = await supabase.rpc("admin_set_status", { p_code: code, p_to: to, p_reason: reason || null });
  if (error) {
    console.error("admin_set_status failed", { code: error.code, message: error.message });
    const known = ["invalid_transition", "reason_required", "not_found"];
    done(path, known.includes(error.message) ? error.message : "error");
  }
  done(path, `status:${to}`);
}

export async function addDevice(formData: FormData): Promise<void> {
  const path = adminPath(formData);
  const model = str(formData, "model");
  const label = str(formData, "label");
  if (!GLASSES.some((g) => g.slug === model) || !/^[A-Za-z0-9-]{1,40}$/.test(label)) done(path, "invalid_device");

  const supabase = await client();
  const { error } = await supabase.rpc("admin_add_device", { p_model_slug: model, p_label: label });
  if (error) {
    console.error("admin_add_device failed", { code: error.code, message: error.message });
    done(path, error.code === "23505" ? "duplicate_device" : "error");
  }
  done(path, "device_added");
}

export async function setDeviceActive(formData: FormData): Promise<void> {
  const path = adminPath(formData);
  const id = str(formData, "id");
  const active = str(formData, "active") === "true";
  if (!/^[0-9a-f-]{36}$/.test(id)) done(path, "invalid");

  const supabase = await client();
  const { error } = await supabase.rpc("admin_set_device_active", { p_id: id, p_active: active });
  if (error) {
    console.error("admin_set_device_active failed", { code: error.code, message: error.message });
    done(path, "error");
  }
  done(path, active ? "device_on" : "device_off");
}
