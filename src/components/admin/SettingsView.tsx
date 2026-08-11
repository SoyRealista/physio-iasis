"use client";

import { useEffect, useState } from "react";
import { useLang } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/client";
import type { ClinicSettings } from "@/lib/types";

export default function SettingsView() {
  const { t } = useLang();
  const supabase = createClient();
  const [settings, setSettings] = useState<ClinicSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    supabase
      .from("clinic_settings")
      .select("*")
      .eq("id", 1)
      .single()
      .then(({ data }) => setSettings(data as ClinicSettings));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function save() {
    if (!supabase || !settings) return;
    setSaving(true);
    await supabase
      .from("clinic_settings")
      .update({
        clinic_name: settings.clinic_name,
        address: settings.address,
        phone: settings.phone,
        email: settings.email,
        opening_hours_note_el: settings.opening_hours_note_el,
        opening_hours_note_en: settings.opening_hours_note_en,
      })
      .eq("id", 1);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (!settings) return <p className="text-sm text-ink-soft">…</p>;

  return (
    <div className="max-w-xl">
      <h1 className="font-display text-2xl text-ink">{t("admin.settingsTitle")}</h1>
      <div className="mt-5 space-y-4 rounded-2xl border border-line bg-paper p-5">
        <Field label={t("admin.clinicName")}>
          <input
            value={settings.clinic_name}
            onChange={(e) => setSettings({ ...settings, clinic_name: e.target.value })}
            className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm"
          />
        </Field>
        <Field label={t("admin.address")}>
          <input
            value={settings.address}
            onChange={(e) => setSettings({ ...settings, address: e.target.value })}
            className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm"
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label={t("admin.phone")}>
            <input
              value={settings.phone}
              onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
              className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm"
            />
          </Field>
          <Field label="Email">
            <input
              value={settings.email}
              onChange={(e) => setSettings({ ...settings, email: e.target.value })}
              className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm"
            />
          </Field>
        </div>
        <Field label={t("admin.hoursEl")}>
          <input
            value={settings.opening_hours_note_el}
            onChange={(e) => setSettings({ ...settings, opening_hours_note_el: e.target.value })}
            className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm"
          />
        </Field>
        <Field label={t("admin.hoursEn")}>
          <input
            value={settings.opening_hours_note_en}
            onChange={(e) => setSettings({ ...settings, opening_hours_note_en: e.target.value })}
            className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm"
          />
        </Field>
        <div className="flex items-center gap-3">
          <button
            onClick={save}
            disabled={saving}
            className="rounded-full bg-primary-600 px-5 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {t("admin.save")}
          </button>
          {saved && <span className="text-sm text-primary-700">{t("admin.saved")}</span>}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-medium text-ink-soft">{label}</label>
      <div className="mt-1">{children}</div>
    </div>
  );
}
