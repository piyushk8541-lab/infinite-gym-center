import type { Metadata } from "next";
import { requirePageUser } from "@/lib/auth";
import { getStore } from "@/lib/demo/store";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import { isStripeConfigured } from "@/lib/stripe";
import { emailProviderStatus } from "@/lib/notifications";
import { AdminDashboard } from "@/components/admin/admin-dashboard";

export const metadata: Metadata = { title: "Admin Control Center" };

export default async function AdminPage() {
  await requirePageUser("admin");
  const snapshot = getStore().getAdminSnapshot();
  return (
    <AdminDashboard
      snapshot={snapshot}
      integrations={{
        stripe: isStripeConfigured(),
        email: emailProviderStatus().configured,
        supabase: hasSupabaseConfig(),
      }}
    />
  );
}
