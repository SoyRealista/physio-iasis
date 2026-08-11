"use client";

import Link from "next/link";
import { CalendarDays, Clock, Users, Euro, ArrowRight } from "lucide-react";
import { useLang } from "@/lib/i18n";

export default function DashboardView({
  todayCount,
  pendingCount,
  clientsCount,
  revenue,
}: {
  todayCount: number;
  pendingCount: number;
  clientsCount: number;
  revenue: number;
}) {
  const { t } = useLang();

  const stats = [
    { icon: CalendarDays, value: todayCount, label: t("admin.todayAppointments") },
    { icon: Clock, value: pendingCount, label: t("admin.pendingAppointments") },
    { icon: Users, value: clientsCount, label: t("admin.totalClients") },
    { icon: Euro, value: `${revenue.toFixed(0)}€`, label: t("admin.monthRevenue") },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl text-ink">{t("admin.dashboardTitle")}</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-line bg-paper p-5">
            <s.icon size={20} className="text-primary-600" />
            <p className="mt-3 text-2xl font-semibold text-ink">{s.value}</p>
            <p className="mt-0.5 text-xs text-ink-soft">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">{t("admin.quickLinks")}</p>
        <div className="mt-3 flex flex-wrap gap-3">
          <Link
            href="/admin/agenda"
            className="flex items-center gap-2 rounded-full bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white"
          >
            <CalendarDays size={16} /> {t("admin.goToAgenda")} <ArrowRight size={14} />
          </Link>
          <Link
            href="/admin/clients"
            className="flex items-center gap-2 rounded-full border border-line bg-paper px-5 py-2.5 text-sm font-semibold text-ink"
          >
            <Users size={16} /> {t("admin.manageClients")} <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
