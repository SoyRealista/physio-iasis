"use client";

import Link from "next/link";
import { Clock, ArrowRight } from "lucide-react";
import { useLang } from "@/lib/i18n";
import type { Service } from "@/lib/types";

export default function ServiceCard({ service }: { service: Service }) {
  const { t, lang } = useLang();
  const name = lang === "el" ? service.name_el : service.name_en;
  const description = lang === "el" ? service.description_el : service.description_en;

  return (
    <div className="group flex h-full flex-col rounded-2xl border border-line bg-paper p-6 transition-shadow hover:shadow-lg hover:shadow-primary-900/5">
      <h3 className="font-display text-lg text-ink">{name}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-soft">{description}</p>
      <div className="mt-5 flex items-center justify-between text-sm">
        <span className="flex items-center gap-1.5 text-ink-soft">
          <Clock size={15} /> {service.duration_minutes} {t("home.minutes")}
        </span>
        <span className="font-semibold text-primary-700">
          {t("home.from")} {service.price}€
        </span>
      </div>
      <Link
        href={`/book?service=${service.id}`}
        className="mt-4 flex items-center justify-center gap-1.5 rounded-full border border-primary-200 bg-primary-50 py-2.5 text-sm font-semibold text-primary-700 transition-colors group-hover:bg-primary-600 group-hover:text-white"
      >
        {t("services.bookThis")} <ArrowRight size={15} />
      </Link>
    </div>
  );
}
