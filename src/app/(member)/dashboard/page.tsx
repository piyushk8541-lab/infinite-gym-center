import type { Metadata } from "next";
import { requirePageUser, toPublicUser } from "@/lib/auth";
import { getStore } from "@/lib/demo/store";
import { MemberDashboard } from "@/components/dashboard/member-dashboard";
import type { ChartPoint } from "@/types";

export const metadata: Metadata = { title: "Member Dashboard" };

export default async function DashboardPage() {
  const user = await requirePageUser();
  const store = getStore();
  const membership = store.getActiveMembership(user.id);
  const plan = membership ? store.plans.find((item) => item.id === membership.planId) : null;
  const referral = store.referrals.find((item) => item.referrerUserId === user.id);
  const bookingTrend: ChartPoint[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
    (label, index) => ({
      label,
      value: [2, 3, 1, 4, 3, 5, 2][index],
    }),
  );

  return (
    <MemberDashboard
      user={toPublicUser(user)}
      membership={
        membership && plan
          ? { planName: plan.name, expiresAt: membership.expiresAt, status: membership.status }
          : null
      }
      bookings={store.listBookings(user.id)}
      payments={store.listPayments(user.id)}
      notifications={store.listNotifications(user.id)}
      slots={store.listSlots()}
      bookingTrend={bookingTrend}
      referralCode={referral?.code ?? "INFINITE-DEMO"}
    />
  );
}
