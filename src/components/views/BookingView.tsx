"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Clock, Loader2, User } from "lucide-react";
import { useLang } from "@/lib/i18n";
import type { Service, Therapist } from "@/lib/types";

interface Slot {
  time: string;
  therapistId: string;
  therapistName: string;
}

function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function nextDays(n: number): Date[] {
  const out: Date[] = [];
  const base = new Date();
  base.setHours(0, 0, 0, 0);
  for (let i = 0; i < n; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    out.push(d);
  }
  return out;
}

export default function BookingView({
  services,
  therapists,
  initialServiceId,
}: {
  services: Service[];
  therapists: Therapist[];
  initialServiceId?: string;
}) {
  const { t, lang } = useLang();
  const [step, setStep] = useState(1);

  const [serviceId, setServiceId] = useState<string | undefined>(
    initialServiceId && services.some((s) => s.id === initialServiceId) ? initialServiceId : undefined
  );
  const [therapistId, setTherapistId] = useState<string | undefined>(undefined);
  const days = useMemo(() => nextDays(21), []);
  const [date, setDate] = useState<string>(toDateKey(days[0]));
  const [time, setTime] = useState<string | undefined>(undefined);
  const [pickedTherapistId, setPickedTherapistId] = useState<string | undefined>(undefined);

  const [slots, setSlots] = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [form, setForm] = useState({ fullName: "", email: "", phone: "", notes: "" });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<"idle" | "success" | "error">("idle");

  const service = services.find((s) => s.id === serviceId);

  useEffect(() => {
    if (step !== 3 || !serviceId) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoadingSlots(true);
    setTime(undefined);
    const params = new URLSearchParams({ serviceId, date });
    if (therapistId) params.set("therapistId", therapistId);
    fetch(`/api/availability?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => setSlots(data.slots ?? []))
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [step, serviceId, therapistId, date]);

  async function confirm() {
    if (!serviceId || !time) return;
    setSubmitting(true);
    setResult("idle");
    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId,
          therapistId,
          date,
          time,
          fullName: form.fullName,
          email: form.email || undefined,
          phone: form.phone || undefined,
          notes: form.notes || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setResult("error");
      } else {
        setResult("success");
      }
    } catch {
      setResult("error");
    } finally {
      setSubmitting(false);
    }
  }

  const steps = [t("booking.step1"), t("booking.step2"), t("booking.step3"), t("booking.step4")];

  if (result === "success") {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center sm:px-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 text-primary-700">
          <Check size={30} />
        </div>
        <h1 className="mt-6 font-display text-3xl text-ink">{t("booking.successTitle")}</h1>
        <p className="mt-3 text-ink-soft">{t("booking.successBody")}</p>
        {service && (
          <div className="mt-8 rounded-2xl border border-line bg-paper-alt/50 p-6 text-left text-sm">
            <p className="font-semibold text-ink">{lang === "el" ? service.name_el : service.name_en}</p>
            <p className="mt-1 text-ink-soft">
              {date} · {time} {pickedTherapistId ? `· ${therapists.find((th) => th.id === pickedTherapistId)?.full_name}` : ""}
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
      <h1 className="font-display text-4xl text-ink">{t("booking.title")}</h1>
      <p className="mt-2 text-ink-soft">{t("booking.subtitle")}</p>

      <div className="mt-8 flex items-center gap-2">
        {steps.map((label, i) => (
          <div key={label} className="flex flex-1 items-center gap-2">
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                i + 1 <= step ? "bg-primary-600 text-white" : "bg-paper-alt text-ink-soft"
              }`}
            >
              {i + 1}
            </div>
            <span className={`hidden text-xs font-medium sm:block ${i + 1 <= step ? "text-ink" : "text-ink-soft"}`}>
              {label}
            </span>
            {i < steps.length - 1 && <div className="h-px flex-1 bg-line" />}
          </div>
        ))}
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_320px]">
        <div>
          {step === 1 && (
            <div>
              <h2 className="font-display text-xl text-ink">{t("booking.chooseService")}</h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {services.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setServiceId(s.id)}
                    className={`rounded-xl border p-4 text-left transition-colors ${
                      serviceId === s.id
                        ? "border-primary-500 bg-primary-50"
                        : "border-line bg-paper hover:border-primary-300"
                    }`}
                  >
                    <p className="font-semibold text-ink">{lang === "el" ? s.name_el : s.name_en}</p>
                    <p className="mt-1 flex items-center gap-3 text-xs text-ink-soft">
                      <span className="flex items-center gap-1">
                        <Clock size={13} /> {s.duration_minutes} {t("home.minutes")}
                      </span>
                      <span className="font-semibold text-primary-700">{s.price}€</span>
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="font-display text-xl text-ink">{t("booking.chooseTherapist")}</h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <button
                  onClick={() => setTherapistId(undefined)}
                  className={`flex items-center gap-3 rounded-xl border p-4 text-left transition-colors ${
                    !therapistId ? "border-primary-500 bg-primary-50" : "border-line bg-paper hover:border-primary-300"
                  }`}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-paper-alt text-ink-soft">
                    <User size={18} />
                  </div>
                  <span className="font-medium text-ink">{t("booking.anyTherapist")}</span>
                </button>
                {therapists.map((th) => (
                  <button
                    key={th.id}
                    onClick={() => setTherapistId(th.id)}
                    className={`flex items-center gap-3 rounded-xl border p-4 text-left transition-colors ${
                      therapistId === th.id
                        ? "border-primary-500 bg-primary-50"
                        : "border-line bg-paper hover:border-primary-300"
                    }`}
                  >
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
                      style={{ backgroundColor: th.color }}
                    >
                      {th.full_name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-ink">{th.full_name}</p>
                      <p className="text-xs text-ink-soft">{lang === "el" ? th.title_el : th.title_en}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="font-display text-xl text-ink">{t("booking.step3")}</h2>
              <div className="mt-5 flex gap-2 overflow-x-auto pb-2">
                {days.map((d) => {
                  const key = toDateKey(d);
                  const active = key === date;
                  return (
                    <button
                      key={key}
                      onClick={() => setDate(key)}
                      className={`flex w-16 shrink-0 flex-col items-center rounded-xl border py-2.5 text-xs font-medium transition-colors ${
                        active ? "border-primary-500 bg-primary-50 text-primary-700" : "border-line text-ink-soft hover:border-primary-300"
                      }`}
                    >
                      <span className="uppercase">
                        {d.toLocaleDateString(lang === "el" ? "el-GR" : "en-GB", { weekday: "short" })}
                      </span>
                      <span className="mt-1 text-base font-semibold text-ink">{d.getDate()}</span>
                    </button>
                  );
                })}
              </div>

              <h3 className="mt-6 text-sm font-medium text-ink">{t("booking.chooseSlot")}</h3>
              <div className="mt-3 min-h-[3rem]">
                {loadingSlots ? (
                  <p className="flex items-center gap-2 text-sm text-ink-soft">
                    <Loader2 size={15} className="animate-spin" /> {t("booking.loadingSlots")}
                  </p>
                ) : slots.length === 0 ? (
                  <p className="text-sm text-ink-soft">{t("booking.noSlots")}</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {slots.map((s) => (
                      <button
                        key={`${s.time}-${s.therapistId}`}
                        onClick={() => {
                          setTime(s.time);
                          setPickedTherapistId(s.therapistId);
                        }}
                        className={`rounded-lg border px-3.5 py-2 text-sm font-medium transition-colors ${
                          time === s.time && pickedTherapistId === s.therapistId
                            ? "border-primary-600 bg-primary-600 text-white"
                            : "border-line text-ink hover:border-primary-300"
                        }`}
                      >
                        {s.time}
                        {!therapistId && <span className="ml-1.5 text-[10px] opacity-70">{s.therapistName}</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 className="font-display text-xl text-ink">{t("booking.step4")}</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="text-sm font-medium text-ink">{t("booking.fullName")}</label>
                  <input
                    required
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    className="mt-1.5 w-full rounded-lg border border-line bg-paper px-3.5 py-2.5 text-sm outline-none focus:border-primary-400"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-ink">{t("booking.email")}</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="mt-1.5 w-full rounded-lg border border-line bg-paper px-3.5 py-2.5 text-sm outline-none focus:border-primary-400"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-ink">{t("booking.phone")}</label>
                  <input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="mt-1.5 w-full rounded-lg border border-line bg-paper px-3.5 py-2.5 text-sm outline-none focus:border-primary-400"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-sm font-medium text-ink">{t("booking.notes")}</label>
                  <textarea
                    rows={3}
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    className="mt-1.5 w-full rounded-lg border border-line bg-paper px-3.5 py-2.5 text-sm outline-none focus:border-primary-400"
                  />
                </div>
              </div>
              {result === "error" && <p className="mt-4 text-sm text-accent-600">{t("booking.errorGeneric")}</p>}
            </div>
          )}

          <div className="mt-8 flex items-center justify-between">
            <button
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              disabled={step === 1}
              className="rounded-full border border-line px-5 py-2.5 text-sm font-semibold text-ink disabled:opacity-0"
            >
              {t("booking.back")}
            </button>
            {step < 4 ? (
              <button
                onClick={() => setStep((s) => s + 1)}
                disabled={(step === 1 && !serviceId) || (step === 3 && !time)}
                className="rounded-full bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
              >
                {t("booking.next")}
              </button>
            ) : (
              <button
                onClick={confirm}
                disabled={submitting || !form.fullName || (!form.email && !form.phone)}
                className="rounded-full bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
              >
                {submitting ? "…" : t("booking.confirm")}
              </button>
            )}
          </div>
        </div>

        <aside className="h-fit rounded-2xl border border-line bg-paper-alt/50 p-6">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-soft">{t("booking.summary")}</h3>
          {service ? (
            <div className="mt-3 space-y-2 text-sm">
              <p className="font-semibold text-ink">{lang === "el" ? service.name_el : service.name_en}</p>
              <p className="text-ink-soft">
                {t("booking.duration")}: {service.duration_minutes} {t("home.minutes")}
              </p>
              <p className="text-ink-soft">
                {t("booking.price")}: {service.price}€
              </p>
              {step >= 3 && (
                <p className="text-ink-soft">
                  {date} {time ? `· ${time}` : ""}
                </p>
              )}
              {pickedTherapistId && (
                <p className="text-ink-soft">{therapists.find((t2) => t2.id === pickedTherapistId)?.full_name}</p>
              )}
            </div>
          ) : (
            <p className="mt-3 text-sm text-ink-soft">—</p>
          )}
        </aside>
      </div>
    </div>
  );
}
