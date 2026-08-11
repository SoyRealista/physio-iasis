import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import { athensNowParts, athensWallToUTC } from "@/lib/timezone";
import DashboardView from "@/components/admin/DashboardView";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const supabase = await createServerSupabase();
  if (!supabase) redirect("/admin/login");

  const { date: today } = athensNowParts();
  const dayStart = athensWallToUTC(today, "00:00").toISOString();
  const dayEnd = athensWallToUTC(today, "23:59").toISOString();
  const monthStartDate = `${today.slice(0, 7)}-01`;
  const monthStart = athensWallToUTC(monthStartDate, "00:00").toISOString();

  const [todayCount, pendingCount, clientsCount, paidThisMonth] = await Promise.all([
    supabase
      .from("appointments")
      .select("id", { count: "exact", head: true })
      .gte("start_at", dayStart)
      .lte("start_at", dayEnd)
      .neq("status", "cancelled"),
    supabase.from("appointments").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("clients").select("id", { count: "exact", head: true }),
    supabase.from("appointments").select("price").eq("payment_status", "paid").gte("start_at", monthStart),
  ]);

  const revenue = (paidThisMonth.data ?? []).reduce((sum, a) => sum + Number(a.price), 0);

  return (
    <DashboardView
      todayCount={todayCount.count ?? 0}
      pendingCount={pendingCount.count ?? 0}
      clientsCount={clientsCount.count ?? 0}
      revenue={revenue}
    />
  );
}
