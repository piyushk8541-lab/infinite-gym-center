"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { hasSupabaseConfig } from "./config";
import type { Database } from "@/types/database.types";

export function createSupabaseBrowserClient(): SupabaseClient<Database> | null {
  if (!hasSupabaseConfig()) return null;
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
