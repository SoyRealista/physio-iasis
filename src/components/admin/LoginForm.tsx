"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/client";
import Logo from "@/components/Logo";

export default function LoginForm() {
  const { t } = useLang();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) return;
    setLoading(true);
    setError(false);
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (authError) {
      setError(true);
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  if (!supabase) {
    return (
      <div className="mx-auto mt-24 max-w-sm rounded-2xl border border-line bg-paper-alt/50 p-6 text-center text-sm text-ink-soft">
        {t("admin.setupNotice")}
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-sm flex-col justify-center px-4">
      <div className="mb-8 flex flex-col items-center text-primary-700">
        <Logo className="h-10 w-10" />
        <h1 className="mt-4 font-display text-2xl text-ink">{t("admin.loginTitle")}</h1>
        <p className="mt-1 text-sm text-ink-soft">{t("admin.loginSubtitle")}</p>
      </div>
      <form onSubmit={submit} className="space-y-4 rounded-2xl border border-line bg-paper p-6">
        <div>
          <label className="text-sm font-medium text-ink">{t("admin.email")}</label>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-line bg-paper px-3.5 py-2.5 text-sm outline-none focus:border-primary-400"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-ink">{t("admin.password")}</label>
          <input
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-line bg-paper px-3.5 py-2.5 text-sm outline-none focus:border-primary-400"
          />
        </div>
        {error && <p className="text-sm text-accent-600">{t("admin.loginError")}</p>}
        <button
          disabled={loading}
          className="w-full rounded-full bg-primary-600 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {loading ? "…" : t("admin.loginButton")}
        </button>
      </form>
    </div>
  );
}
