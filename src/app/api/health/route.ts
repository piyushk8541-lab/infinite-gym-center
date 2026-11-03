import { NextResponse } from "next/server";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import { isStripeConfigured } from "@/lib/stripe";
import { emailProviderStatus } from "@/lib/notifications";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    app: "INFINITE GYM CENTER",
    demoMode: true,
    timestamp: new Date().toISOString(),
    integrations: {
      supabase: hasSupabaseConfig() ? "configured" : "demo-in-memory-store",
      stripe: isStripeConfigured() ? "test-mode-configured" : "not-configured",
      email: emailProviderStatus().configured ? "configured" : "queued-only",
    },
  });
}
