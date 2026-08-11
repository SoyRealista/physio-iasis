"use client";

import Link from "next/link";
import { MapPin, Phone, Mail } from "lucide-react";
import { useLang } from "@/lib/i18n";
import Logo from "./Logo";
import { DEMO_SETTINGS } from "@/lib/demo-data";

export default function Footer() {
  const { t, lang } = useLang();
  const s = DEMO_SETTINGS;

  return (
    <footer className="border-t border-line bg-paper-alt/60">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-3">
          <div>
            <div className="flex items-center gap-2 text-primary-700">
              <Logo className="h-7 w-7" />
              <span className="font-display text-lg text-ink">
                Physio <span className="italic text-primary-600">ΙΑΣΙΣ</span>
              </span>
            </div>
            <p className="mt-3 max-w-xs text-sm text-ink-soft">{t("footer.tagline")}</p>
          </div>

          <div className="space-y-2 text-sm text-ink-soft">
            <p className="flex items-start gap-2">
              <MapPin size={16} className="mt-0.5 shrink-0 text-primary-600" /> {s.address}
            </p>
            <p className="flex items-center gap-2">
              <Phone size={16} className="shrink-0 text-primary-600" /> {s.phone}
            </p>
            <p className="flex items-center gap-2">
              <Mail size={16} className="shrink-0 text-primary-600" /> {s.email}
            </p>
          </div>

          <div className="flex flex-col gap-2 text-sm">
            <Link href="/services" className="text-ink-soft hover:text-primary-700">
              {t("nav.services")}
            </Link>
            <Link href="/book" className="text-ink-soft hover:text-primary-700">
              {t("nav.book")}
            </Link>
            <Link href="/admin" className="text-ink-soft hover:text-primary-700">
              {t("footer.admin")}
            </Link>
          </div>
        </div>

        <div className="mt-10 flex flex-col-reverse items-center justify-between gap-3 border-t border-line pt-6 text-xs text-ink-soft sm:flex-row">
          <p>
            © {new Date().getFullYear()} Physio ΙΑΣΙΣ. {t("footer.rights")}
          </p>
          <p className="text-[11px] uppercase tracking-wide text-ink-soft/70">
            {lang === "el" ? s.opening_hours_note_el : s.opening_hours_note_en}
          </p>
        </div>
      </div>
    </footer>
  );
}
