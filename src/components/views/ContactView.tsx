"use client";

import { useState } from "react";
import { Mail, MapPin, Phone, Clock, Send } from "lucide-react";
import { useLang } from "@/lib/i18n";
import type { ClinicSettings } from "@/lib/types";

export default function ContactView({ settings }: { settings: ClinicSettings }) {
  const { t, lang } = useLang();
  const [form, setForm] = useState({ full_name: "", email: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      setStatus("sent");
      setForm({ full_name: "", email: "", message: "" });
    } catch {
      setStatus("error");
    }
  }

  const info = [
    { icon: MapPin, label: t("contact.addressLabel"), value: settings.address },
    { icon: Phone, label: t("contact.phoneLabel"), value: settings.phone },
    { icon: Mail, label: t("contact.emailLabel"), value: settings.email },
    {
      icon: Clock,
      label: t("contact.hoursLabel"),
      value: lang === "el" ? settings.opening_hours_note_el : settings.opening_hours_note_en,
    },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <h1 className="font-display text-4xl text-ink">{t("contact.title")}</h1>
      <p className="mt-3 text-lg text-ink-soft">{t("contact.subtitle")}</p>

      <div className="mt-10 grid gap-10 lg:grid-cols-2">
        <div className="space-y-5">
          {info.map((item) => (
            <div key={item.label} className="flex items-start gap-3 rounded-xl border border-line bg-paper-alt/50 p-4">
              <item.icon size={18} className="mt-0.5 shrink-0 text-primary-600" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">{item.label}</p>
                <p className="mt-0.5 text-sm text-ink">{item.value}</p>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={submit} className="space-y-4 rounded-2xl border border-line bg-paper p-6">
          <div>
            <label className="text-sm font-medium text-ink">{t("contact.formName")}</label>
            <input
              required
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              className="mt-1.5 w-full rounded-lg border border-line bg-paper px-3.5 py-2.5 text-sm outline-none focus:border-primary-400"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-ink">{t("contact.formEmail")}</label>
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="mt-1.5 w-full rounded-lg border border-line bg-paper px-3.5 py-2.5 text-sm outline-none focus:border-primary-400"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-ink">{t("contact.formMessage")}</label>
            <textarea
              required
              rows={4}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="mt-1.5 w-full rounded-lg border border-line bg-paper px-3.5 py-2.5 text-sm outline-none focus:border-primary-400"
            />
          </div>
          <button
            disabled={status === "sending"}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-primary-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-700 disabled:opacity-60"
          >
            <Send size={15} /> {t("contact.formSend")}
          </button>
          {status === "sent" && <p className="text-sm text-primary-700">{t("contact.formSent")}</p>}
          {status === "error" && <p className="text-sm text-accent-600">{t("booking.errorGeneric")}</p>}
        </form>
      </div>
    </div>
  );
}
