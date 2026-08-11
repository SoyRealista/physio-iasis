import "server-only";
import { createAdminSupabase } from "./supabase/admin";
import { athensWallToUTC } from "./timezone";
import { getDaySlots } from "./availability";

export interface BookingInput {
  serviceId: string;
  therapistId?: string;
  date: string; // "YYYY-MM-DD"
  time: string; // "HH:mm"
  fullName: string;
  email?: string;
  phone?: string;
  notes?: string;
  source: "web" | "bot";
}

export interface BookingResult {
  ok: boolean;
  error?: string;
  appointment?: {
    date: string;
    time: string;
    therapistName: string;
    serviceNameEl: string;
    serviceNameEn: string;
    durationMinutes: number;
    price: number;
  };
}

export async function createAppointment(input: BookingInput): Promise<BookingResult> {
  if (!input.fullName?.trim()) return { ok: false, error: "missing_name" };
  if (!input.email?.trim() && !input.phone?.trim()) return { ok: false, error: "missing_contact" };

  const db = createAdminSupabase();
  if (!db) return { ok: false, error: "demo_mode" };

  const { data: service } = await db
    .from("services")
    .select("*")
    .eq("id", input.serviceId)
    .maybeSingle();
  if (!service) return { ok: false, error: "service_not_found" };

  // Revalida el hueco justo antes de reservar (evita doble reserva por condición de carrera)
  const slots = await getDaySlots({
    serviceId: input.serviceId,
    date: input.date,
    therapistId: input.therapistId,
  });
  const match = input.therapistId
    ? slots.find((s) => s.time === input.time && s.therapistId === input.therapistId)
    : slots.find((s) => s.time === input.time);
  if (!match) return { ok: false, error: "slot_unavailable" };

  const startAt = athensWallToUTC(input.date, input.time);
  const endAt = new Date(startAt.getTime() + service.duration_minutes * 60000);

  let clientId: string | null = null;
  if (input.email) {
    const { data } = await db.from("clients").select("id").eq("email", input.email).maybeSingle();
    if (data) clientId = data.id;
  }
  if (!clientId && input.phone) {
    const { data } = await db.from("clients").select("id").eq("phone", input.phone).maybeSingle();
    if (data) clientId = data.id;
  }
  if (!clientId) {
    const { data, error } = await db
      .from("clients")
      .insert({ full_name: input.fullName, email: input.email || null, phone: input.phone || null })
      .select("id")
      .single();
    if (error || !data) return { ok: false, error: "client_create_failed" };
    clientId = data.id;
  }

  const { error: apptError } = await db.from("appointments").insert({
    client_id: clientId,
    therapist_id: match.therapistId,
    service_id: service.id,
    start_at: startAt.toISOString(),
    end_at: endAt.toISOString(),
    status: "pending",
    price: service.price,
    source: input.source,
    notes: input.notes || null,
  });
  if (apptError) return { ok: false, error: "appointment_create_failed" };

  return {
    ok: true,
    appointment: {
      date: input.date,
      time: input.time,
      therapistName: match.therapistName,
      serviceNameEl: service.name_el,
      serviceNameEn: service.name_en,
      durationMinutes: service.duration_minutes,
      price: service.price,
    },
  };
}
