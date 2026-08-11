"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  ListChecks,
  UserRound,
  Settings,
  LogOut,
  ArrowLeft,
} from "lucide-react";
import { useLang } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/client";
import LangSwitch from "@/components/LangSwitch";
import Logo from "@/components/Logo";

export default function AdminShell({ email, children }: { email: string; children: React.ReactNode }) {
  const { t } = useLang();
  const pathname = usePathname();
  const router = useRouter();

  const nav = [
    { href: "/admin", label: t("admin.navDashboard"), icon: LayoutDashboard, exact: true },
    { href: "/admin/agenda", label: t("admin.navAgenda"), icon: CalendarDays },
    { href: "/admin/clients", label: t("admin.navClients"), icon: Users },
    { href: "/admin/services", label: t("admin.navServices"), icon: ListChecks },
    { href: "/admin/therapists", label: t("admin.navTherapists"), icon: UserRound },
    { href: "/admin/settings", label: t("admin.navSettings"), icon: Settings },
  ];

  async function signOut() {
    const supabase = createClient();
    await supabase?.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen bg-paper-alt/40">
      <aside className="hidden w-60 shrink-0 flex-col bg-primary-800 text-primary-50 md:flex">
        <div className="flex items-center gap-2 px-5 py-5">
          <Logo className="h-7 w-7" />
          <span className="font-display text-lg">
            ΙΑΣΙΣ <span className="text-xs font-sans font-normal text-primary-200">admin</span>
          </span>
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {nav.map((item) => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  active ? "bg-primary-700 text-white" : "text-primary-100/80 hover:bg-primary-700/60"
                }`}
              >
                <item.icon size={17} /> {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="space-y-1 border-t border-primary-700/60 px-3 py-4">
          <Link
            href="/"
            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-primary-100/80 hover:bg-primary-700/60"
          >
            <ArrowLeft size={16} /> {t("admin.backToSite")}
          </Link>
          <button
            onClick={signOut}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-primary-100/80 hover:bg-primary-700/60"
          >
            <LogOut size={16} /> {t("admin.signOut")}
          </button>
        </div>
      </aside>

      <div className="flex-1">
        <header className="flex items-center justify-between border-b border-line bg-paper px-4 py-3 sm:px-6">
          <p className="text-sm text-ink-soft">{email}</p>
          <LangSwitch />
        </header>
        <div className="px-4 py-6 sm:px-6">{children}</div>
      </div>
    </div>
  );
}
