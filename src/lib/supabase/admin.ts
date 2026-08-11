import { createClient } from "@supabase/supabase-js";

/**
 * Cliente con service role — SOLO en código de servidor (route handlers / server actions).
 * Se usa para escrituras públicas (reservas web/bot) y para calcular disponibilidad
 * sin las restricciones de RLS. Nunca importar desde un componente cliente.
 */
export function createAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
