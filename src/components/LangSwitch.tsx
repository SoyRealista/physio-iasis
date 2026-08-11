"use client";

import { useLang } from "@/lib/i18n";

export default function LangSwitch() {
  const { lang, setLang } = useLang();

  return (
    <div className="flex items-center gap-1 rounded-full border border-line bg-paper-alt/60 p-1 text-xs font-semibold">
      {(["el", "en"] as const).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          className={`rounded-full px-2.5 py-1 uppercase transition-colors cursor-pointer ${
            lang === l ? "bg-primary-600 text-white" : "text-ink-soft hover:text-ink"
          }`}
          aria-pressed={lang === l}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
