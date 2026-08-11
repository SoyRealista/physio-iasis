import "server-only";
import { createAdminSupabase } from "./supabase/admin";
import { DEMO_SERVICES, DEMO_THERAPISTS, DEMO_SETTINGS } from "./demo-data";
import type { ClinicSettings, Service, Therapist } from "./types";

export async function getServices(): Promise<Service[]> {
  const db = createAdminSupabase();
  if (!db) return DEMO_SERVICES;
  const { data, error } = await db
    .from("services")
    .select("*")
    .eq("active", true)
    .order("sort_order", { ascending: true });
  if (error || !data || data.length === 0) return DEMO_SERVICES;
  return data as Service[];
}

export async function getTherapists(): Promise<Therapist[]> {
  const db = createAdminSupabase();
  if (!db) return DEMO_THERAPISTS;
  const { data, error } = await db
    .from("therapists")
    .select("*")
    .eq("active", true)
    .order("full_name", { ascending: true });
  if (error || !data || data.length === 0) return DEMO_THERAPISTS;
  return data as Therapist[];
}

export async function getClinicSettings(): Promise<ClinicSettings> {
  const db = createAdminSupabase();
  if (!db) return DEMO_SETTINGS;
  const { data, error } = await db.from("clinic_settings").select("*").eq("id", 1).single();
  if (error || !data) return DEMO_SETTINGS;
  return data as ClinicSettings;
}
