"use client";

import { useLang } from "@/lib/i18n";
import type { Service } from "@/lib/types";
import ServiceCard from "@/components/ServiceCard";

export default function ServicesView({ services }: { services: Service[] }) {
  const { t } = useLang();

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="max-w-2xl">
        <h1 className="font-display text-4xl text-ink">{t("services.title")}</h1>
        <p className="mt-3 text-lg text-ink-soft">{t("services.subtitle")}</p>
      </div>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((s) => (
          <ServiceCard key={s.id} service={s} />
        ))}
      </div>
    </div>
  );
}
