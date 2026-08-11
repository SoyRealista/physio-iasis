"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X, Check } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/client";
import type { Therapist, TherapistAvailability } from "@/lib/types";

type Draft = Omit<Therapist, "id"> & { id?: string };

const BLANK: Draft = {
  full_name: "",
  title_el: "",
  title_en: "",
  bio_el: "",
  bio_en: "",
  color: "#1f7a6a",
  active: true,
};

const WEEKDAYS_EL = ["Κυρ", "Δευ", "Τρί", "Τετ", "Πέμ", "Παρ", "Σάβ"];
const WEEKDAYS_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface DaySlot {
  enabled: boolean;
  start_time: string;
  end_time: string;
}

function blankSchedule(): DaySlot[] {
  return Array.from({ length: 7 }, (_, i) => ({
    enabled: i >= 1 && i <= 5,
    start_time: "09:00",
    end_time: "17:00",
  }));
}

export default function TherapistsView() {
  const { t, lang } = useLang();
  const supabase = createClient();
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | "new" | null>(null);
  const [draft, setDraft] = useState<Draft>(BLANK);
  const [schedule, setSchedule] = useState<DaySlot[]>(blankSchedule());

  async function load() {
    if (!supabase) return;
    setLoading(true);
    const { data } = await supabase.from("therapists").select("*").order("full_name", { ascending: true });
    setTherapists((data as Therapist[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function startEdit(th: Therapist) {
    setEditingId(th.id);
    setDraft(th);
    if (!supabase) return;
    const { data } = await supabase
      .from("therapist_availability")
      .select("*")
      .eq("therapist_id", th.id);
    const rows = (data as TherapistAvailability[]) ?? [];
    const next = blankSchedule().map((d, i) => {
      const row = rows.find((r) => r.weekday === i);
      return row
        ? { enabled: true, start_time: row.start_time.slice(0, 5), end_time: row.end_time.slice(0, 5) }
        : { ...d, enabled: false };
    });
    setSchedule(next);
  }

  function startNew() {
    setEditingId("new");
    setDraft(BLANK);
    setSchedule(blankSchedule());
  }

  async function save() {
    if (!supabase) return;
    let id = editingId !== "new" ? editingId : null;

    if (editingId === "new") {
      const { data, error } = await supabase.from("therapists").insert(draft).select("id").single();
      if (error || !data) return;
      id = data.id;
    } else if (editingId) {
      await supabase.from("therapists").update(draft).eq("id", editingId);
    }
    if (!id) return;

    await supabase.from("therapist_availability").delete().eq("therapist_id", id);
    const rows = schedule
      .map((d, weekday) => ({ ...d, weekday }))
      .filter((d) => d.enabled)
      .map((d) => ({ therapist_id: id, weekday: d.weekday, start_time: d.start_time, end_time: d.end_time }));
    if (rows.length > 0) await supabase.from("therapist_availability").insert(rows);

    setEditingId(null);
    load();
  }

  async function remove(id: string) {
    if (!supabase || !confirm(t("admin.confirmDelete"))) return;
    await supabase.from("therapists").delete().eq("id", id);
    load();
  }

  const weekdays = lang === "el" ? WEEKDAYS_EL : WEEKDAYS_EN;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-ink">{t("admin.therapistsTitle")}</h1>
        <button
          onClick={startNew}
          className="flex items-center gap-1.5 rounded-full bg-primary-600 px-4 py-2 text-sm font-semibold text-white"
        >
          <Plus size={15} /> {t("admin.newTherapist")}
        </button>
      </div>

      {editingId === "new" && (
        <div className="mt-4">
          <TherapistForm
            draft={draft}
            setDraft={setDraft}
            schedule={schedule}
            setSchedule={setSchedule}
            weekdays={weekdays}
            onSave={save}
            onCancel={() => setEditingId(null)}
            t={t}
          />
        </div>
      )}

      <div className="mt-4 space-y-3">
        {loading ? (
          <p className="text-sm text-ink-soft">…</p>
        ) : (
          therapists.map((th) =>
            editingId === th.id ? (
              <TherapistForm
                key={th.id}
                draft={draft}
                setDraft={setDraft}
                schedule={schedule}
                setSchedule={setSchedule}
                weekdays={weekdays}
                onSave={save}
                onCancel={() => setEditingId(null)}
                t={t}
              />
            ) : (
              <div key={th.id} className="flex items-center justify-between rounded-2xl border border-line bg-paper p-4">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
                    style={{ backgroundColor: th.color }}
                  >
                    {th.full_name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-ink">
                      {th.full_name}
                      {!th.active && <span className="ml-2 rounded-full bg-stone-200 px-2 py-0.5 text-[10px] text-stone-600">off</span>}
                    </p>
                    <p className="text-xs text-ink-soft">{lang === "el" ? th.title_el : th.title_en}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => startEdit(th)} className="rounded-full border border-line p-2 hover:bg-paper-alt">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => remove(th.id)} className="rounded-full border border-line p-2 hover:bg-paper-alt">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            )
          )
        )}
      </div>
    </div>
  );
}

function TherapistForm({
  draft,
  setDraft,
  schedule,
  setSchedule,
  weekdays,
  onSave,
  onCancel,
  t,
}: {
  draft: Draft;
  setDraft: (d: Draft) => void;
  schedule: DaySlot[];
  setSchedule: (s: DaySlot[]) => void;
  weekdays: string[];
  onSave: () => void;
  onCancel: () => void;
  t: (k: string) => string;
}) {
  function updateDay(i: number, patch: Partial<DaySlot>) {
    setSchedule(schedule.map((d, idx) => (idx === i ? { ...d, ...patch } : d)));
  }

  return (
    <div className="space-y-4 rounded-2xl border border-primary-300 bg-primary-50/40 p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          placeholder={t("admin.fullName")}
          value={draft.full_name}
          onChange={(e) => setDraft({ ...draft, full_name: e.target.value })}
          className="rounded-lg border border-line bg-paper px-3 py-2 text-sm sm:col-span-2"
        />
        <input
          placeholder={t("admin.titleEl")}
          value={draft.title_el}
          onChange={(e) => setDraft({ ...draft, title_el: e.target.value })}
          className="rounded-lg border border-line bg-paper px-3 py-2 text-sm"
        />
        <input
          placeholder={t("admin.titleEn")}
          value={draft.title_en}
          onChange={(e) => setDraft({ ...draft, title_en: e.target.value })}
          className="rounded-lg border border-line bg-paper px-3 py-2 text-sm"
        />
        <textarea
          placeholder={t("admin.bioEl")}
          value={draft.bio_el}
          onChange={(e) => setDraft({ ...draft, bio_el: e.target.value })}
          className="rounded-lg border border-line bg-paper px-3 py-2 text-sm sm:col-span-2"
        />
        <textarea
          placeholder={t("admin.bioEn")}
          value={draft.bio_en}
          onChange={(e) => setDraft({ ...draft, bio_en: e.target.value })}
          className="rounded-lg border border-line bg-paper px-3 py-2 text-sm sm:col-span-2"
        />
        <label className="flex items-center gap-2 text-xs text-ink-soft">
          {t("admin.color")}
          <input
            type="color"
            value={draft.color}
            onChange={(e) => setDraft({ ...draft, color: e.target.value })}
            className="h-8 w-14 rounded border border-line"
          />
        </label>
        <label className="flex items-center gap-2 text-sm text-ink">
          <input type="checkbox" checked={draft.active} onChange={(e) => setDraft({ ...draft, active: e.target.checked })} />
          {t("admin.active")}
        </label>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">{t("admin.weeklyAvailability")}</p>
        <div className="mt-2 space-y-1.5">
          {schedule.map((d, i) => (
            <div key={i} className="flex items-center gap-3 text-sm">
              <label className="flex w-24 items-center gap-2">
                <input type="checkbox" checked={d.enabled} onChange={(e) => updateDay(i, { enabled: e.target.checked })} />
                {weekdays[i]}
              </label>
              <input
                type="time"
                disabled={!d.enabled}
                value={d.start_time}
                onChange={(e) => updateDay(i, { start_time: e.target.value })}
                className="rounded-lg border border-line bg-paper px-2 py-1 text-sm disabled:opacity-40"
              />
              <span className="text-ink-soft">–</span>
              <input
                type="time"
                disabled={!d.enabled}
                value={d.end_time}
                onChange={(e) => updateDay(i, { end_time: e.target.value })}
                className="rounded-lg border border-line bg-paper px-2 py-1 text-sm disabled:opacity-40"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <button onClick={onSave} className="flex items-center gap-1.5 rounded-full bg-primary-600 px-4 py-2 text-sm font-semibold text-white">
          <Check size={14} /> {t("admin.save")}
        </button>
        <button onClick={onCancel} className="flex items-center gap-1.5 rounded-full border border-line px-4 py-2 text-sm">
          <X size={14} /> {t("admin.cancel")}
        </button>
      </div>
    </div>
  );
}
