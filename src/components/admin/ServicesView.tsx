"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X, Check } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/client";
import type { Service } from "@/lib/types";

type Draft = Omit<Service, "id" | "sort_order"> & { id?: string; sort_order?: number };

const BLANK: Draft = {
  name_el: "",
  name_en: "",
  description_el: "",
  description_en: "",
  duration_minutes: 45,
  price: 30,
  active: true,
};

export default function ServicesView() {
  const { t } = useLang();
  const supabase = createClient();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | "new" | null>(null);
  const [draft, setDraft] = useState<Draft>(BLANK);

  async function load() {
    if (!supabase) return;
    setLoading(true);
    const { data } = await supabase.from("services").select("*").order("sort_order", { ascending: true });
    setServices((data as Service[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function startEdit(s: Service) {
    setEditingId(s.id);
    setDraft(s);
  }

  function startNew() {
    setEditingId("new");
    setDraft({ ...BLANK, sort_order: services.length });
  }

  async function save() {
    if (!supabase) return;
    if (editingId === "new") {
      await supabase.from("services").insert(draft);
    } else if (editingId) {
      await supabase.from("services").update(draft).eq("id", editingId);
    }
    setEditingId(null);
    load();
  }

  async function remove(id: string) {
    if (!supabase || !confirm(t("admin.confirmDelete"))) return;
    await supabase.from("services").delete().eq("id", id);
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-ink">{t("admin.servicesTitle")}</h1>
        <button
          onClick={startNew}
          className="flex items-center gap-1.5 rounded-full bg-primary-600 px-4 py-2 text-sm font-semibold text-white"
        >
          <Plus size={15} /> {t("admin.newService")}
        </button>
      </div>

      {editingId === "new" && (
        <div className="mt-4">
          <ServiceForm draft={draft} setDraft={setDraft} onSave={save} onCancel={() => setEditingId(null)} t={t} />
        </div>
      )}

      <div className="mt-4 space-y-3">
        {loading ? (
          <p className="text-sm text-ink-soft">…</p>
        ) : (
          services.map((s) =>
            editingId === s.id ? (
              <ServiceForm key={s.id} draft={draft} setDraft={setDraft} onSave={save} onCancel={() => setEditingId(null)} t={t} />
            ) : (
              <div key={s.id} className="flex items-center justify-between rounded-2xl border border-line bg-paper p-4">
                <div>
                  <p className="font-medium text-ink">
                    {s.name_el} <span className="text-ink-soft">/ {s.name_en}</span>
                    {!s.active && <span className="ml-2 rounded-full bg-stone-200 px-2 py-0.5 text-[10px] text-stone-600">off</span>}
                  </p>
                  <p className="mt-0.5 text-xs text-ink-soft">
                    {s.duration_minutes} min · {s.price}€
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => startEdit(s)} className="rounded-full border border-line p-2 hover:bg-paper-alt">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => remove(s.id)} className="rounded-full border border-line p-2 hover:bg-paper-alt">
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

function ServiceForm({
  draft,
  setDraft,
  onSave,
  onCancel,
  t,
}: {
  draft: Draft;
  setDraft: (d: Draft) => void;
  onSave: () => void;
  onCancel: () => void;
  t: (k: string) => string;
}) {
  return (
    <div className="space-y-3 rounded-2xl border border-primary-300 bg-primary-50/40 p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          placeholder={t("admin.nameEl")}
          value={draft.name_el}
          onChange={(e) => setDraft({ ...draft, name_el: e.target.value })}
          className="rounded-lg border border-line bg-paper px-3 py-2 text-sm"
        />
        <input
          placeholder={t("admin.nameEn")}
          value={draft.name_en}
          onChange={(e) => setDraft({ ...draft, name_en: e.target.value })}
          className="rounded-lg border border-line bg-paper px-3 py-2 text-sm"
        />
        <textarea
          placeholder={t("admin.descriptionEl")}
          value={draft.description_el}
          onChange={(e) => setDraft({ ...draft, description_el: e.target.value })}
          className="rounded-lg border border-line bg-paper px-3 py-2 text-sm sm:col-span-2"
        />
        <textarea
          placeholder={t("admin.descriptionEn")}
          value={draft.description_en}
          onChange={(e) => setDraft({ ...draft, description_en: e.target.value })}
          className="rounded-lg border border-line bg-paper px-3 py-2 text-sm sm:col-span-2"
        />
        <label className="text-xs text-ink-soft">
          {t("admin.duration")}
          <input
            type="number"
            value={draft.duration_minutes}
            onChange={(e) => setDraft({ ...draft, duration_minutes: Number(e.target.value) })}
            className="mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm"
          />
        </label>
        <label className="text-xs text-ink-soft">
          {t("admin.price")}
          <input
            type="number"
            value={draft.price}
            onChange={(e) => setDraft({ ...draft, price: Number(e.target.value) })}
            className="mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm"
          />
        </label>
      </div>
      <label className="flex items-center gap-2 text-sm text-ink">
        <input
          type="checkbox"
          checked={draft.active}
          onChange={(e) => setDraft({ ...draft, active: e.target.checked })}
        />
        {t("admin.active")}
      </label>
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
