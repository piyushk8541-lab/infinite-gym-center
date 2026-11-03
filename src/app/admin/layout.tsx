import { requirePageUser, toPublicUser } from "@/lib/auth";
import { DashboardShell } from "@/components/layout/dashboard-shell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requirePageUser("admin");
  return (
    <DashboardShell user={toPublicUser(user)} variant="admin">
      {children}
    </DashboardShell>
  );
}
