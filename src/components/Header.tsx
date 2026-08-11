"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useLang } from "@/lib/i18n";
import LangSwitch from "./LangSwitch";
import Logo from "./Logo";

export default function Header() {
  const { t } = useLang();
  const [open, setOpen] = useState(false);

  const links = [
    { href: "/", label: t("nav.home") },
    { href: "/services", label: t("nav.services") },
    { href: "/about", label: t("nav.about") },
    { href: "/contact", label: t("nav.contact") },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 text-primary-700" onClick={() => setOpen(false)}>
          <Logo className="h-8 w-8" />
          <span className="font-display text-xl tracking-tight text-ink">
            Physio <span className="italic text-primary-600">ΙΑΣΙΣ</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-ink-soft transition-colors hover:text-primary-700"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <LangSwitch />
          <Link
            href="/book"
            className="rounded-full bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-primary-900/10 transition-colors hover:bg-primary-700"
          >
            {t("nav.book")}
          </Link>
        </div>

        <button
          className="flex h-9 w-9 items-center justify-center rounded-full text-ink md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-line bg-paper px-4 pb-5 pt-2 md:hidden">
          <nav className="flex flex-col gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-2 py-2.5 text-sm font-medium text-ink-soft hover:bg-paper-alt hover:text-ink"
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="mt-3 flex items-center justify-between gap-3">
            <LangSwitch />
            <Link
              href="/book"
              onClick={() => setOpen(false)}
              className="flex-1 rounded-full bg-primary-600 px-4 py-2.5 text-center text-sm font-semibold text-white"
            >
              {t("nav.book")}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
