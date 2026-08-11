"use client";

import { useLang } from "@/lib/i18n";
import type { Therapist } from "@/lib/types";

export default function AboutView({ therapists }: { therapists: Therapist[] }) {
  const { t, lang } = useLang();

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <h1 className="font-display text-4xl text-ink">{t("about.title")}</h1>
      <p className="mt-5 text-lg leading-relaxed text-ink-soft">{t("about.intro")}</p>

      <h2 className="mt-14 font-display text-2xl text-ink">{t("about.valuesTitle")}</h2>
      <ul className="mt-5 space-y-3">
        {[t("about.value1"), t("about.value2"), t("about.value3")].map((v) => (
          <li key={v} className="flex items-start gap-3 text-ink-soft">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-500" />
            {v}
          </li>
        ))}
      </ul>

      <h2 className="mt-14 font-display text-2xl text-ink">{t("about.teamTitle")}</h2>
      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        {therapists.map((th) => (
          <div key={th.id} className="flex items-start gap-4 rounded-2xl border border-line bg-paper-alt/50 p-6">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-lg font-semibold text-white"
              style={{ backgroundColor: th.color }}
            >
              {th.full_name.charAt(0)}
            </div>
            <div>
              <p className="font-display text-lg text-ink">{th.full_name}</p>
              <p className="text-sm font-medium text-primary-700">
                {lang === "el" ? th.title_el : th.title_en}
              </p>
              <p className="mt-1.5 text-sm text-ink-soft">{lang === "el" ? th.bio_el : th.bio_en}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
