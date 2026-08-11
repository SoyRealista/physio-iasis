"use client";

import Link from "next/link";
import { ArrowRight, CalendarClock, HeartHandshake, ShieldCheck } from "lucide-react";
import { useLang } from "@/lib/i18n";
import type { Service } from "@/lib/types";
import ServiceCard from "@/components/ServiceCard";

export default function HomeView({ services }: { services: Service[] }) {
  const { t } = useLang();

  const trust = [
    { icon: HeartHandshake, title: t("home.trust1Title"), body: t("home.trust1Body") },
    { icon: CalendarClock, title: t("home.trust2Title"), body: t("home.trust2Body") },
    { icon: ShieldCheck, title: t("home.trust3Title"), body: t("home.trust3Body") },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full opacity-40 blur-3xl"
          style={{ background: "radial-gradient(circle, var(--color-primary-200), transparent 70%)" }}
        />
        <div
          className="pointer-events-none absolute -left-24 top-40 h-72 w-72 rounded-full opacity-30 blur-3xl"
          style={{ background: "radial-gradient(circle, var(--color-accent-200), transparent 70%)" }}
        />
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <div className="max-w-2xl">
            <span className="inline-flex items-center rounded-full border border-primary-200 bg-primary-50 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wide text-primary-700">
              {t("home.badge")}
            </span>
            <h1 className="mt-6 font-display text-4xl leading-[1.1] text-ink sm:text-5xl lg:text-6xl">
              {t("home.heroTitle")}
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft">
              {t("home.heroSubtitle")}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/book"
                className="flex items-center gap-2 rounded-full bg-primary-600 px-6 py-3.5 text-sm font-semibold text-white shadow-md shadow-primary-900/15 transition-colors hover:bg-primary-700"
              >
                {t("home.ctaBook")} <ArrowRight size={16} />
              </Link>
              <Link
                href="/services"
                className="flex items-center gap-2 rounded-full border border-line bg-paper px-6 py-3.5 text-sm font-semibold text-ink transition-colors hover:border-primary-300"
              >
                {t("home.ctaServices")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="mx-auto max-w-6xl px-4 pb-4 sm:px-6">
        <div className="grid gap-5 sm:grid-cols-3">
          {trust.map((item) => (
            <div key={item.title} className="rounded-2xl border border-line bg-paper-alt/50 p-6">
              <item.icon className="text-primary-600" size={26} />
              <h3 className="mt-4 font-display text-base text-ink">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Services preview */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl text-ink">{t("home.servicesTitle")}</h2>
            <p className="mt-2 text-ink-soft">{t("home.servicesSubtitle")}</p>
          </div>
          <Link
            href="/services"
            className="flex items-center gap-1.5 text-sm font-semibold text-primary-700 hover:text-primary-800"
          >
            {t("home.seeAll")} <ArrowRight size={15} />
          </Link>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.slice(0, 3).map((s) => (
            <ServiceCard key={s.id} service={s} />
          ))}
        </div>
      </section>

      {/* CTA band */}
      <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-6 rounded-3xl bg-primary-700 p-10 text-white sm:flex-row sm:items-center sm:p-14">
          <div>
            <h3 className="font-display text-2xl sm:text-3xl">{t("home.ctaBandTitle")}</h3>
            <p className="mt-2 max-w-md text-primary-100">{t("home.ctaBandBody")}</p>
          </div>
          <Link
            href="/book"
            className="flex shrink-0 items-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-primary-700 transition-transform hover:scale-105"
          >
            {t("home.ctaBook")} <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}
