import type { Metadata } from "next";
import { requirePageUser, toPublicUser } from "@/lib/auth";
import { getStore } from "@/lib/demo/store";
import { ProfileForm } from "@/components/dashboard/profile-form";

export const metadata: Metadata = { title: "Profile" };

export default async function ProfilePage() {
  const user = await requirePageUser();
  const store = getStore();
  const membership = store.getActiveMembership(user.id);
  const plan = membership ? store.plans.find((item) => item.id === membership.planId) : null;
  return (
    <ProfileForm
      user={toPublicUser(user)}
      membership={plan?.name ?? "No active plan"}
      bookingCount={store.listBookings(user.id).length}
      paymentCount={store.listPayments(user.id).length}
    />
  );
}
