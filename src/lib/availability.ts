import "server-only";
import { createAdminSupabase } from "./supabase/admin";
import { DEMO_SERVICES, DEMO_THERAPISTS } from "./demo-data";
import { athensNowParts, athensWallToUTC, weekdayOf } from "./timezone";
import type { Therapist } from "./types";

const SLOT_STEP_MINUTES = 15;

export interface Slot {
  time: string; // "HH:mm" hora local de Grecia
  therapistId: string;
  therapistName: string;
}

export async function getDaySlots(opts: {
  serviceId: string;
  date: string; // "YYYY-MM-DD"
  therapistId?: string;
}): Promise<Slot[]> {
  const db = createAdminSupabase();
  const weekday = weekdayOf(opts.date);
  const { date: today, time: nowTime } = athensNowParts();
  const isToday = opts.date === today;
  const isPast = opts.date < today;
  if (isPast) return [];

  let durationMinutes = 45;
  if (db) {
    const { data } = await db
      .from("services")
      .select("duration_minutes")
      .eq("id", opts.serviceId)
      .maybeSingle();
    if (data) durationMinutes = data.duration_minutes;
  } else {
    const demo = DEMO_SERVICES.find((s) => s.id === opts.serviceId);
    if (demo) durationMinutes = demo.duration_minutes;
  }

  let therapists: Therapist[] = [];
  if (db) {
    let q = db.from("therapists").select("*").eq("active", true);
    if (opts.therapistId) q = q.eq("id", opts.therapistId);
    const { data } = await q;
    therapists = (data as Therapist[]) ?? [];
  } else {
    therapists = opts.therapistId
      ? DEMO_THERAPISTS.filter((t) => t.id === opts.therapistId)
      : DEMO_THERAPISTS;
  }
  if (therapists.length === 0) return [];

  const slots: Slot[] = [];

  for (const therapist of therapists) {
    let windows: { start_time: string; end_time: string }[] = [];
    if (db) {
      const { data } = await db
        .from("therapist_availability")
        .select("start_time,end_time")
        .eq("therapist_id", therapist.id)
        .eq("weekday", weekday);
      windows = data ?? [];
    } else if (weekday >= 1 && weekday <= 5) {
      windows = [{ start_time: "09:00:00", end_time: "17:00:00" }];
    }
    if (windows.length === 0) continue;

    let busy: { start_at: string; end_at: string }[] = [];
    if (db) {
      const dayStartUTC = athensWallToUTC(opts.date, "00:00").toISOString();
      const dayEndUTC = athensWallToUTC(opts.date, "23:59").toISOString();
      const { data } = await db
        .from("appointments")
        .select("start_at,end_at")
        .eq("therapist_id", therapist.id)
        .neq("status", "cancelled")
        .gte("start_at", dayStartUTC)
        .lte("start_at", dayEndUTC);
      busy = data ?? [];
    }

    for (const w of windows) {
      const [wsH, wsM] = w.start_time.slice(0, 5).split(":").map(Number);
      const [weH, weM] = w.end_time.slice(0, 5).split(":").map(Number);
      let cursor = wsH * 60 + wsM;
      const windowEnd = weH * 60 + weM;

      while (cursor + durationMinutes <= windowEnd) {
        const hh = String(Math.floor(cursor / 60)).padStart(2, "0");
        const mm = String(cursor % 60).padStart(2, "0");
        const timeStr = `${hh}:${mm}`;

        if (!(isToday && timeStr <= nowTime)) {
          const slotStartUTC = athensWallToUTC(opts.date, timeStr);
          const slotEndMs = slotStartUTC.getTime() + durationMinutes * 60000;

          const overlaps = busy.some((b) => {
            const bStart = new Date(b.start_at).getTime();
            const bEnd = new Date(b.end_at).getTime();
            return slotStartUTC.getTime() < bEnd && slotEndMs > bStart;
          });

          if (!overlaps) {
            slots.push({ time: timeStr, therapistId: therapist.id, therapistName: therapist.full_name });
          }
        }
        cursor += SLOT_STEP_MINUTES;
      }
    }
  }

  slots.sort((a, b) => a.time.localeCompare(b.time));
  return slots;
}
