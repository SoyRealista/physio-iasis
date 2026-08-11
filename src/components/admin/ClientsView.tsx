"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/client";
import type { Client } from "@/lib/types";

export default function ClientsView() {
  const { t } = useLang();
  const supabase = createClient();
  const [clients, setClients] = useState<Client[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newClient, setNewClient] = useState({ full_name: "", email: "", phone: "" });

  async function load() {
    if (!supabase) return;
    setLoading(true);
    const { data } = await supabase.from("clients").select("*").order("full_name", { ascending: true });
    setClients((data as Client[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function createClientRow(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase || !newClient.full_name) return;
    await supabase.from("clients").insert({
      full_name: newClient.full_name,
      email: newClient.email || null,
      phone: newClient.phone || null,
    });
    setNewClient({ full_name: "", email: "", phone: "" });
    setCreating(false);
    load();
  }

  const filtered = clients.filter((c) => {
    const q = query.toLowerCase();
    return (
      c.full_name.toLowerCase().includes(q) ||
      (c.email ?? "").toLowerCase().includes(q) ||
      (c.phone ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl text-ink">{t("admin.clientsTitle")}</h1>
        <button
          onClick={() => setCreating((v) => !v)}
          className="flex items-center gap-1.5 rounded-full bg-primary-600 px-4 py-2 text-sm font-semibold text-white"
        >
          <Plus size={15} /> {t("admin.newClient")}
        </button>
      </div>

      {creating && (
        <form onSubmit={createClientRow} className="mt-4 grid gap-3 rounded-2xl border border-line bg-paper p-4 sm:grid-cols-3">
          <input
            required
            placeholder={t("admin.fullName")}
            value={newClient.full_name}
            onChange={(e) => setNewClient({ ...newClient, full_name: e.target.value })}
            className="rounded-lg border border-line bg-paper px-3 py-2 text-sm"
          />
          <input
            placeholder="Email"
            value={newClient.email}
            onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
            className="rounded-lg border border-line bg-paper px-3 py-2 text-sm"
          />
          <input
            placeholder={t("admin.phone")}
            value={newClient.phone}
            onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
            className="rounded-lg border border-line bg-paper px-3 py-2 text-sm"
          />
          <div className="flex gap-2 sm:col-span-3">
            <button className="rounded-full bg-primary-600 px-4 py-2 text-sm font-semibold text-white">
              {t("admin.save")}
            </button>
            <button type="button" onClick={() => setCreating(false)} className="rounded-full border border-line px-4 py-2 text-sm">
              {t("admin.cancel")}
            </button>
          </div>
        </form>
      )}

      <div className="mt-5 flex items-center gap-2 rounded-lg border border-line bg-paper px-3 py-2">
        <Search size={16} className="text-ink-soft" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("admin.searchClients")}
          className="w-full bg-transparent text-sm outline-none"
        />
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-line bg-paper">
        {loading ? (
          <p className="p-6 text-sm text-ink-soft">…</p>
        ) : (
          <table className="w-full text-sm">
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-b border-line last:border-0 hover:bg-paper-alt/50">
                  <td className="px-4 py-3">
                    <Link href={`/admin/clients/${c.id}`} className="font-medium text-ink hover:text-primary-700">
                      {c.full_name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-ink-soft">{c.email}</td>
                  <td className="px-4 py-3 text-ink-soft">{c.phone}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
