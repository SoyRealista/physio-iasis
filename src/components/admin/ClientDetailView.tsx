"use client";

import { useEffect, useState } from "react";
import { useLang } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/client";
import type { Client } from "@/lib/types";

interface Appt {
  id: string;
  start_at: string;
  status: string;
  price: number;
  services: { name_el: string; name_en: string } | null;
  therapists: { full_name: string } | null;
}

export default function ClientDetailView({ clientId }: { clientId: string }) {
  const { t, lang } = useLang();
  const supabase = createClient();
  const [client, setClient] = useState<Client | null>(null);
  const [appts, setAppts] = useState<Appt[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    (async () => {
      const [{ data: c }, { data: a }] = await Promise.all([
        supabase.from("clients").select("*").eq("id", clientId).single(),
        supabase
          .from("appointments")
          .select("id, start_at, status, price, services(name_el,name_en), therapists(full_name)")
          .eq("client_id", clientId)
          .order("start_at", { ascending: false }),
      ]);
      setClient(c as Client);
      setAppts((a as unknown as Appt[]) ?? []);
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId]);

  async function save() {
    if (!supabase || !client) return;
    setSaving(true);
    await supabase
      .from("clients")
      .update({
        full_name: client.full_name,
        email: client.email,
        phone: client.phone,
        birth_date: client.birth_date,
        medical_notes: client.medical_notes,
      })
      .eq("id", clientId);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (loading || !client) return <p className="text-sm text-ink-soft">…</p>;

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
      <div>
        <h1 className="font-display text-2xl text-ink">{client.full_name}</h1>
        <div className="mt-5 space-y-4 rounded-2xl border border-line bg-paper p-5">
          <Field label={t("admin.fullName")}>
            <input
              value={client.full_name}
              onChange={(e) => setClient({ ...client, full_name: e.target.value })}
              className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Email">
              <input
                value={client.email ?? ""}
                onChange={(e) => setClient({ ...client, email: e.target.value })}
                className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm"
              />
            </Field>
            <Field label={t("admin.phone")}>
              <input
                value={client.phone ?? ""}
                onChange={(e) => setClient({ ...client, phone: e.target.value })}
                className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm"
              />
            </Field>
          </div>
          <Field label={t("admin.birthDate")}>
            <input
              type="date"
              value={client.birth_date ?? ""}
              onChange={(e) => setClient({ ...client, birth_date: e.target.value })}
              className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm"
            />
          </Field>
          <Field label={t("admin.medicalNotes")}>
            <textarea
              rows={5}
              value={client.medical_notes ?? ""}
              onChange={(e) => setClient({ ...client, medical_notes: e.target.value })}
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

      <div>
        <h2 className="font-display text-xl text-ink">{t("admin.appointmentHistory")}</h2>
        <div className="mt-4 overflow-hidden rounded-2xl border border-line bg-paper">
          {appts.length === 0 ? (
            <p className="p-5 text-sm text-ink-soft">{t("admin.noAppointmentsYet")}</p>
          ) : (
            <table className="w-full text-sm">
              <tbody>
                {appts.map((a) => (
                  <tr key={a.id} className="border-b border-line last:border-0">
                    <td className="px-4 py-3 text-ink-soft">
                      {new Date(a.start_at).toLocaleDateString(lang === "el" ? "el-GR" : "en-GB")}
                    </td>
                    <td className="px-4 py-3 text-ink">{lang === "el" ? a.services?.name_el : a.services?.name_en}</td>
                    <td className="px-4 py-3 text-ink-soft">{a.therapists?.full_name}</td>
                    <td className="px-4 py-3 text-ink-soft">{a.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
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
