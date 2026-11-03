import { requirePageUser, toPublicUser } from "@/lib/auth";
import { DashboardShell } from "@/components/layout/dashboard-shell";

export default async function MemberLayout({ children }: { children: React.ReactNode }) {
  const user = await requirePageUser();
  return (
    <DashboardShell user={toPublicUser(user)} variant="member">
      {children}
    </DashboardShell>
  );
}
