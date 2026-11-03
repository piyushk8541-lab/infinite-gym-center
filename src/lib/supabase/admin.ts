import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import { hasSupabaseAdminConfig } from "./config";
import type { Database } from "@/types/database.types";

/** Service-role client. SERVER ONLY. Never import into a Client Component. */
export function createSupabaseAdminClient(): SupabaseClient<Database> | null {
  if (!hasSupabaseAdminConfig()) return null;
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
