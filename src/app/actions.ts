"use server";

import { revalidatePath } from "next/cache";
import {
  getCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
  requestPasswordReset,
  requireActionUser,
  resetPassword,
  verifyEmail,
} from "@/lib/auth";
import { getStore, resetStore } from "@/lib/demo/store";
import { deliverEmail, emailProviderStatus } from "@/lib/notifications";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import {
  bookingSchema,
  campaignSchema,
  feedbackSchema,
  leadSchema,
  newsletterSchema,
  planPatchSchema,
  promotionSchema,
  slotCreateSchema,
  staffSchema,
} from "@/lib/validation";
import type { ActionResult, Role } from "@/types";

function refreshAll() {
  revalidatePath("/");
  revalidatePath("/book");
  revalidatePath("/membership");
  revalidatePath("/dashboard");
  revalidatePath("/admin");
  revalidatePath("/profile");
}

function fail<T = unknown>(error: unknown): ActionResult<T> {
  return { ok: false, error: error instanceof Error ? error.message : "Unexpected error." };
}

async function requireRole(role: Role) {
  return requireActionUser(role);
}

export async function registerAction(input: unknown): Promise<ActionResult> {
  try {
    const result = await registerUser(input);
    if (result.ok) refreshAll();
    return result;
  } catch (error) {
    return fail(error);
  }
}

export async function loginAction(input: unknown): Promise<ActionResult> {
  try {
    const result = await loginUser(input);
    if (result.ok) refreshAll();
    return result;
  } catch (error) {
    return fail(error);
  }
}

export async function logoutAction(): Promise<ActionResult> {
  try {
    const result = await logoutUser();
    refreshAll();
    return result;
  } catch (error) {
    return fail(error);
  }
}

export async function verifyEmailAction(): Promise<ActionResult> {
  try {
    const user = await requireActionUser();
    const result = await verifyEmail(user.id);
    refreshAll();
    return result;
  } catch (error) {
    return fail(error);
  }
}

export async function requestPasswordResetAction(input: unknown): Promise<ActionResult> {
  try {
    return await requestPasswordReset(input);
  } catch (error) {
    return fail(error);
  }
}

export async function resetPasswordAction(input: unknown): Promise<ActionResult> {
  try {
    return await resetPassword(input);
  } catch (error) {
    return fail(error);
  }
}

export async function updateProfileAction(input: {
  fullName: string;
  phone: string;
  avatarUrl: string;
}): Promise<ActionResult> {
  try {
    const user = await requireActionUser();
    if (input.fullName.trim().length < 2) return { ok: false, error: "Enter your full name." };
    user.fullName = input.fullName.trim().slice(0, 80);
    user.phone = input.phone.trim().slice(0, 24);
    user.avatarUrl = input.avatarUrl.trim().slice(0, 300);
    refreshAll();
    return { ok: true, message: "Profile updated." };
  } catch (error) {
    return fail(error);
  }
}

export async function createBookingAction(input: {
  slotId: string;
  idempotencyKey: string;
  simulatePaymentFailure?: boolean;
}): Promise<ActionResult> {
  try {
    const user = await requireActionUser();
    const parsed = bookingSchema.safeParse(input);
    if (!parsed.success)
      return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid booking." };
    const result = getStore().createBooking({
      userId: user.id,
      slotId: parsed.data.slotId,
      idempotencyKey: parsed.data.idempotencyKey,
      simulatePaymentFailure: input.simulatePaymentFailure,
    });
    refreshAll();
    if (!result.ok) return { ok: false, error: result.error };
    return {
      ok: true,
      message: result.data.duplicate
        ? "This booking was already submitted. No duplicate was created."
        : "Booking confirmed. Capacity updated.",
      data: { bookingId: result.data.booking.id },
    };
  } catch (error) {
    return fail(error);
  }
}

export async function cancelBookingAction(bookingId: string, admin = false): Promise<ActionResult> {
  try {
    const user = await requireActionUser();
    const result = getStore().cancelBooking(bookingId, user.id, admin && user.role === "admin");
    refreshAll();
    if (!result.ok) return { ok: false, error: result.error };
    return { ok: true, message: "Booking cancelled and capacity released." };
  } catch (error) {
    return fail(error);
  }
}

export async function rescheduleBookingAction(
  bookingId: string,
  newSlotId: string,
  admin = false,
): Promise<ActionResult> {
  try {
    const user = await requireActionUser();
    const result = getStore().rescheduleBooking(
      bookingId,
      newSlotId,
      user.id,
      admin && user.role === "admin",
    );
    refreshAll();
    if (!result.ok) return { ok: false, error: result.error };
    return { ok: true, message: "Session rescheduled." };
  } catch (error) {
    return fail(error);
  }
}

export async function purchasePlanAction(
  planId: string,
  idempotencyKey: string,
  simulateFailure = false,
): Promise<ActionResult> {
  try {
    const user = await requireActionUser();
    if (idempotencyKey.length < 8) return { ok: false, error: "Invalid submission key." };
    const result = getStore().purchasePlan(user.id, planId, idempotencyKey, simulateFailure);
    refreshAll();
    if (!result.ok) return { ok: false, error: result.error };
    return {
      ok: true,
      message: "Demo membership activated. No real payment was processed.",
      data: { paymentId: result.data.payment.id },
    };
  } catch (error) {
    return fail(error);
  }
}

export async function initiateStripeCheckoutAction(
  kind: "membership" | "booking",
  referenceId: string,
): Promise<ActionResult<{ url: string }>> {
  try {
    const user = await requireActionUser();
    if (!isStripeConfigured()) {
      return {
        ok: false,
        error:
          "Stripe test credentials are not configured. Copy .env.example to .env.local and add sk_test_ / whsec_ values. Use the labelled demo purchase instead; no charge has been made.",
      };
    }
    const stripe = getStripe()!;
    const store = getStore();
    const plan = kind === "membership" ? store.plans.find((item) => item.id === referenceId) : null;
    const booking =
      kind === "booking" ? store.bookings.find((item) => item.id === referenceId) : null;
    const slot = booking ? store.getSlotView(booking.slotId) : null;
    const amount = plan?.priceCents ?? slot?.session.priceCents ?? 0;
    const name = plan?.name ?? slot?.session.title ?? "INFINITE GYM CENTER session";
    if (amount <= 0) return { ok: false, error: "This item has no payable amount in demo mode." };
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const session = await stripe.checkout.sessions.create(
      {
        mode: "payment",
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: { name },
              unit_amount: amount,
            },
            quantity: 1,
          },
        ],
        customer_email: user.email,
        success_url: `${appUrl}/dashboard?checkout=success`,
        cancel_url: `${appUrl}/membership?checkout=cancelled`,
        metadata: { userId: user.id, kind, referenceId, demo: "true" },
        payment_intent_data: { metadata: { userId: user.id, kind, referenceId } },
      },
      { idempotencyKey: `checkout_${user.id}_${referenceId}_${Date.now()}` },
    );
    return {
      ok: true,
      data: { url: session.url ?? "" },
      message: "Stripe test Checkout Session created.",
    };
  } catch (error) {
    return fail(error);
  }
}

export async function updatePlanAction(planId: string, patch: unknown): Promise<ActionResult> {
  try {
    await requireRole("admin");
    const parsed = planPatchSchema.safeParse(patch);
    if (!parsed.success)
      return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid plan data." };
    const plan = getStore().updatePlan(planId, parsed.data);
    if (!plan) return { ok: false, error: "Plan not found." };
    refreshAll();
    return { ok: true, message: `${plan.name} updated.` };
  } catch (error) {
    return fail(error);
  }
}

export async function createSlotAction(input: unknown): Promise<ActionResult> {
  try {
    await requireRole("admin");
    const parsed = slotCreateSchema.safeParse(input);
    if (!parsed.success)
      return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid slot." };
    const slot = getStore().createSlot(parsed.data);
    if (!slot) return { ok: false, error: "That date is blocked or the session does not exist." };
    refreshAll();
    return { ok: true, message: "Time slot created." };
  } catch (error) {
    return fail(error);
  }
}

export async function updateSlotCapacityAction(
  slotId: string,
  capacity: number,
): Promise<ActionResult> {
  try {
    await requireRole("admin");
    const result = getStore().updateSlotCapacity(slotId, capacity);
    refreshAll();
    if (!result.ok) return { ok: false, error: result.error };
    return { ok: true, message: "Capacity updated." };
  } catch (error) {
    return fail(error);
  }
}

export async function blockDateAction(date: string): Promise<ActionResult> {
  try {
    await requireRole("admin");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return { ok: false, error: "Use YYYY-MM-DD." };
    getStore().blockDate(date);
    refreshAll();
    return { ok: true, message: `${date} blocked for bookings.` };
  } catch (error) {
    return fail(error);
  }
}

export async function updateCustomerMembershipAction(
  userId: string,
  action: "activate" | "suspend",
): Promise<ActionResult> {
  try {
    await requireRole("admin");
    const user = getStore().updateCustomerMembership(userId, action);
    if (!user) return { ok: false, error: "Customer not found." };
    refreshAll();
    return { ok: true, message: `Membership ${action}d for ${user.fullName}.` };
  } catch (error) {
    return fail(error);
  }
}

export async function addStaffAction(input: unknown): Promise<ActionResult> {
  try {
    await requireRole("admin");
    const parsed = staffSchema.safeParse(input);
    if (!parsed.success)
      return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid staff data." };
    getStore().addStaff({
      fullName: parsed.data.fullName,
      role: parsed.data.role,
      specialty: parsed.data.specialty,
      email: parsed.data.email,
      schedule: parsed.data.schedule ?? "Weekdays",
    });
    refreshAll();
    return { ok: true, message: "Trainer added." };
  } catch (error) {
    return fail(error);
  }
}

export async function createPromotionAction(input: unknown): Promise<ActionResult> {
  try {
    await requireRole("admin");
    const parsed = promotionSchema.safeParse(input);
    if (!parsed.success)
      return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid promotion." };
    getStore().createPromotion(parsed.data);
    refreshAll();
    return { ok: true, message: "Promotion created." };
  } catch (error) {
    return fail(error);
  }
}

export async function createCampaignAction(input: unknown): Promise<ActionResult> {
  try {
    await requireRole("admin");
    const parsed = campaignSchema.safeParse(input);
    if (!parsed.success)
      return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid campaign." };
    getStore().createCampaign(parsed.data);
    refreshAll();
    return { ok: true, message: "Campaign drafted." };
  } catch (error) {
    return fail(error);
  }
}

export async function submitFeedbackAction(input: unknown): Promise<ActionResult> {
  try {
    const user = await getCurrentUser();
    const parsed = feedbackSchema.safeParse(input);
    if (!parsed.success)
      return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid feedback." };
    getStore().submitFeedback(user?.id ?? null, parsed.data.rating, parsed.data.comment);
    refreshAll();
    return { ok: true, message: "Thank you — feedback saved as demo data." };
  } catch (error) {
    return fail(error);
  }
}

export async function redeemReferralAction(code: string): Promise<ActionResult> {
  try {
    const user = await requireActionUser();
    const ok = getStore().redeemReferral(code, user.id);
    refreshAll();
    return ok
      ? { ok: true, message: "Referral code redeemed (demo)." }
      : { ok: false, error: "Code not found or already used." };
  } catch (error) {
    return fail(error);
  }
}

export async function markNotificationReadAction(id: string): Promise<ActionResult> {
  try {
    const user = await requireActionUser();
    const store = getStore();
    const notification = store.notifications.find((item) => item.id === id);
    if (!notification || (notification.userId !== user.id && user.role !== "admin")) {
      return { ok: false, error: "Notification not found." };
    }
    store.markNotificationRead(id);
    refreshAll();
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

export async function sendQueuedEmailsAction(): Promise<ActionResult> {
  try {
    await requireRole("admin");
    const store = getStore();
    const status = emailProviderStatus();
    let sent = 0;
    let skipped = 0;
    for (const notification of store.notifications) {
      if (notification.deliveryStatus !== "queued") continue;
      if (!status.configured) {
        notification.deliveryStatus = "skipped";
        skipped += 1;
        continue;
      }
      const user = store.users.find((item) => item.id === notification.userId);
      if (!user) continue;
      const result = await deliverEmail(user.email, notification.title, notification.body);
      notification.channel = "email";
      notification.deliveryStatus = result.sent ? "sent" : "skipped";
      if (result.sent) sent += 1;
      else skipped += 1;
    }
    refreshAll();
    return {
      ok: true,
      message: status.configured
        ? `Email provider processed ${sent} queued notification(s); ${skipped} skipped.`
        : `No email provider configured. ${skipped} notification(s) remain marked as skipped/queued; nothing was claimed as sent.`,
    };
  } catch (error) {
    return fail(error);
  }
}

export async function resetDemoDataAction(): Promise<ActionResult> {
  try {
    await requireRole("admin");
    resetStore();
    refreshAll();
    return { ok: true, message: "Demo dataset reset to its seeded state." };
  } catch (error) {
    return fail(error);
  }
}

export async function createLeadAction(input: unknown): Promise<ActionResult> {
  try {
    const parsed = leadSchema.safeParse(input);
    if (!parsed.success)
      return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid form." };
    getStore().createLead(parsed.data);
    revalidatePath("/admin");
    return { ok: true, message: "Thanks — your request was saved as demo lead data." };
  } catch (error) {
    return fail(error);
  }
}

export async function subscribeNewsletterAction(email: string): Promise<ActionResult> {
  try {
    const parsed = newsletterSchema.safeParse({ email });
    if (!parsed.success) return { ok: false, error: "Enter a valid email." };
    getStore().subscribeNewsletter(parsed.data.email);
    revalidatePath("/admin");
    return { ok: true, message: "Subscribed (demo)." };
  } catch (error) {
    return fail(error);
  }
}
