"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/client";

interface Row {
  id: string;
  start_at: string;
  end_at: string;
  status: string;
  payment_status: string;
  notes: string | null;
  clients: { full_name: string; email: string | null; phone: string | null } | null;
  services: { name_el: string; name_en: string } | null;
  therapists: { full_name: string; color: string } | null;
}

function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const STATUSES = ["pending", "confirmed", "completed", "cancelled", "no_show"] as const;
const PAYMENTS = ["unpaid", "paid", "waived"] as const;

export default function AgendaView() {
  const { t, lang } = useLang();
  const [date, setDate] = useState(() => toDateKey(new Date()));
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const load = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);
    const dayStart = new Date(`${date}T00:00:00`);
    const dayEnd = new Date(`${date}T23:59:59`);
    const { data } = await supabase
      .from("appointments")
      .select(
        "id, start_at, end_at, status, payment_status, notes, clients(full_name,email,phone), services(name_el,name_en), therapists(full_name,color)"
      )
      .gte("start_at", dayStart.toISOString())
      .lte("start_at", dayEnd.toISOString())
      .order("start_at", { ascending: true });
    setRows((data as unknown as Row[]) ?? []);
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  async function updateField(id: string, field: "status" | "payment_status", value: string) {
    if (!supabase) return;
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
    await supabase.from("appointments").update({ [field]: value }).eq("id", id);
  }

  function shiftDay(delta: number) {
    const d = new Date(`${date}T00:00:00`);
    d.setDate(d.getDate() + delta);
    setDate(toDateKey(d));
  }

  const statusLabel: Record<string, string> = {
    pending: t("admin.statusPending"),
    confirmed: t("admin.statusConfirmed"),
    completed: t("admin.statusCompleted"),
    cancelled: t("admin.statusCancelled"),
    no_show: t("admin.statusNoShow"),
  };
  const paymentLabel: Record<string, string> = {
    unpaid: t("admin.paymentUnpaid"),
    paid: t("admin.paymentPaid"),
    waived: t("admin.paymentWaived"),
  };
  const statusColor: Record<string, string> = {
    pending: "bg-amber-100 text-amber-800",
    confirmed: "bg-primary-100 text-primary-800",
    completed: "bg-emerald-100 text-emerald-800",
    cancelled: "bg-red-100 text-red-700",
    no_show: "bg-stone-200 text-stone-600",
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-ink">{t("admin.agendaTitle")}</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => shiftDay(-1)} className="rounded-full border border-line p-2 hover:bg-paper-alt">
            <ChevronLeft size={16} />
          </button>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-lg border border-line bg-paper px-3 py-2 text-sm"
          />
          <button onClick={() => shiftDay(1)} className="rounded-full border border-line p-2 hover:bg-paper-alt">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-line bg-paper">
        {loading ? (
          <p className="p-6 text-sm text-ink-soft">…</p>
        ) : rows.length === 0 ? (
          <p className="p-6 text-sm text-ink-soft">{t("admin.noAppointments")}</p>
        ) : (
          <table className="w-full text-sm">
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-line last:border-0">
                  <td className="whitespace-nowrap px-4 py-3">
                    <span className="flex items-center gap-1.5 font-medium text-ink">
                      <Clock size={14} className="text-ink-soft" />
                      {new Date(r.start_at).toLocaleTimeString(lang === "el" ? "el-GR" : "en-GB", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-ink">{r.clients?.full_name ?? "—"}</p>
                    <p className="text-xs text-ink-soft">{r.clients?.email || r.clients?.phone}</p>
                  </td>
                  <td className="px-4 py-3 text-ink-soft">
                    {lang === "el" ? r.services?.name_el : r.services?.name_en}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <span className="flex items-center gap-1.5 text-ink-soft">
                      <span
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ backgroundColor: r.therapists?.color }}
                      />
                      {r.therapists?.full_name}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={r.status}
                      onChange={(e) => updateField(r.id, "status", e.target.value)}
                      className={`rounded-full border-0 px-2.5 py-1 text-xs font-semibold ${statusColor[r.status]}`}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {statusLabel[s]}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={r.payment_status}
                      onChange={(e) => updateField(r.id, "payment_status", e.target.value)}
                      className="rounded-full border border-line bg-paper px-2.5 py-1 text-xs font-medium text-ink-soft"
                    >
                      {PAYMENTS.map((p) => (
                        <option key={p} value={p}>
                          {paymentLabel[p]}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
