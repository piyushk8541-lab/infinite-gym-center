import { beforeEach, describe, expect, it } from "vitest";
import { getStore, resetStore } from "@/lib/demo/store";
import { verifyPassword } from "@/lib/security";
import { addDaysISO, todayISO } from "@/lib/format";

beforeEach(() => {
  resetStore();
});

const store = () => getStore();

describe("authentication", () => {
  it("registers a new customer with a hashed password", () => {
    const s = store();
    const user = s.createUser({
      email: "new.member@example.com",
      fullName: "New Member",
      phone: "+1 555 010",
      password: "SecurePass123!",
      role: "member",
    });
    expect(user.email).toBe("new.member@example.com");
    expect(user.emailVerified).toBe(false);
    expect(user.passwordHash).not.toContain("SecurePass123!");
    expect(verifyPassword("SecurePass123!", user.passwordHash)).toBe(true);
    expect(verifyPassword("wrong", user.passwordHash)).toBe(false);
  });

  it("validates seeded demo credentials", () => {
    const user = store().findUserByEmail("member@infinitegym.demo");
    expect(user).toBeDefined();
    expect(verifyPassword("DemoPass123!", user!.passwordHash)).toBe(true);
    expect(verifyPassword("nope", user!.passwordHash)).toBe(false);
  });
});

describe("membership", () => {
  it("purchases a plan with a clearly labelled simulated payment", () => {
    const s = store();
    const result = s.purchasePlan("usr_member", "plan_annual", "idem_purchase_1");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.payment.status).toBe("simulated");
    expect(result.data.payment.description).toContain("DEMO ONLY");
    expect(result.data.membership.status).toBe("active");
    expect(new Date(result.data.membership.expiresAt).getTime()).toBeGreaterThan(Date.now());
    expect(s.getActiveMembership("usr_member")?.planId).toBe("plan_annual");
  });

  it("handles a simulated payment failure without activating a plan", () => {
    const s = store();
    const result = s.purchasePlan("usr_member", "plan_weekly", "idem_fail_1", true);
    expect(result.ok).toBe(false);
    const payment = s.payments.find((item) => item.idempotencyKey === "idem_fail_1");
    expect(payment?.status).toBe("failed");
    expect(s.getActiveMembership("usr_member")?.planId).toBe("plan_monthly");
  });

  it("expires memberships past their expiration date", () => {
    const s = store();
    const membership = s.memberships.find((item) => item.userId === "usr_member")!;
    membership.expiresAt = new Date(Date.now() - 1000).toISOString();
    s.expireMemberships();
    expect(membership.status).toBe("expired");
    expect(membership.expirationNotified).toBe(true);
    expect(s.getActiveMembership("usr_member")).toBeNull();
  });

  it("allows an admin to edit prices, durations and benefits", () => {
    const plan = store().updatePlan("plan_monthly", {
      priceCents: 9900,
      durationDays: 45,
      benefits: ["Updated benefit A", "Updated benefit B"],
    });
    expect(plan?.priceCents).toBe(9900);
    expect(plan?.durationDays).toBe(45);
    expect(plan?.benefits).toHaveLength(2);
  });
});

describe("smart booking engine", () => {
  it("seeds the 24-of-30 capacity example", () => {
    const view = store().getSlotView(`slot_${todayISO()}_evening-sessions`);
    expect(view?.capacity).toBe(30);
    expect(view?.booked).toBe(24);
    expect(view?.remaining).toBe(6);
    expect(view?.isFull).toBe(false);
  });

  it("disables booking once capacity is reached", () => {
    const s = store();
    const slotId = `slot_${todayISO()}_evening-sessions`;
    const updated = s.updateSlotCapacity(slotId, 24);
    expect(updated.ok).toBe(true);
    expect(s.getSlotView(slotId)?.isFull).toBe(true);
    const result = s.createBooking({ userId: "usr_member", slotId, idempotencyKey: "idem_full_1" });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/full/i);
  });

  it("rejects capacity below existing bookings", () => {
    const s = store();
    const result = s.updateSlotCapacity(`slot_${todayISO()}_evening-sessions`, 10);
    expect(result.ok).toBe(false);
  });

  it("prevents double bookings for the same member and slot", () => {
    const s = store();
    const slotId = `slot_${addDaysISO(todayISO(), 3)}_morning-sessions`;
    const first = s.createBooking({
      userId: "usr_member",
      slotId,
      idempotencyKey: "idem_double_1",
    });
    expect(first.ok).toBe(true);
    const second = s.createBooking({
      userId: "usr_member",
      slotId,
      idempotencyKey: "idem_double_2",
    });
    expect(second.ok).toBe(false);
    if (!second.ok) expect(second.error).toMatch(/already|time/i);
  });

  it("is idempotent for duplicate submissions", () => {
    const s = store();
    const slotId = `slot_${addDaysISO(todayISO(), 4)}_afternoon-sessions`;
    const key = "idem_repeat_1";
    const first = s.createBooking({ userId: "usr_member", slotId, idempotencyKey: key });
    const second = s.createBooking({ userId: "usr_member", slotId, idempotencyKey: key });
    expect(first.ok).toBe(true);
    expect(second.ok).toBe(true);
    if (second.ok) expect(second.data.duplicate).toBe(true);
    expect(s.bookings.filter((booking) => booking.idempotencyKey === key)).toHaveLength(1);
  });

  it("records a simulated payment for a paid session", () => {
    const s = store();
    const slotId = `slot_${addDaysISO(todayISO(), 5)}_personal-training`;
    const result = s.createBooking({ userId: "usr_member", slotId, idempotencyKey: "idem_paid_1" });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.payment?.status).toBe("simulated");
    expect(result.data.payment?.amountCents).toBe(6500);
    expect(result.data.payment?.description).toContain("DEMO ONLY");
  });

  it("does not confirm a booking when a demo payment fails", () => {
    const s = store();
    const slotId = `slot_${addDaysISO(todayISO(), 6)}_group-fitness-classes`;
    const result = s.createBooking({
      userId: "usr_member",
      slotId,
      idempotencyKey: "idem_paid_fail_1",
      simulatePaymentFailure: true,
    });
    expect(result.ok).toBe(false);
    const booking = s.bookings.find((item) => item.idempotencyKey === "idem_paid_fail_1");
    expect(booking?.status).toBe("pending_payment");
    const payment = s.payments.find((item) => item.idempotencyKey === "idem_paid_fail_1");
    expect(payment?.status).toBe("failed");
  });

  it("releases capacity and refunds a demo payment on cancellation", () => {
    const s = store();
    const slotId = `slot_${addDaysISO(todayISO(), 7)}_general-gym-access`;
    const before = s.getSlotView(slotId)!.remaining;
    const booking = s.createBooking({
      userId: "usr_member",
      slotId,
      idempotencyKey: "idem_cancel_1",
    });
    expect(booking.ok).toBe(true);
    if (!booking.ok) return;
    expect(s.getSlotView(slotId)!.remaining).toBe(before - 1);
    const cancelled = s.cancelBooking(booking.data.booking.id, "usr_member");
    expect(cancelled.ok).toBe(true);
    expect(s.getSlotView(slotId)!.remaining).toBe(before);
  });

  it("reschedules a confirmed booking to another available slot", () => {
    const s = store();
    const from = `slot_${addDaysISO(todayISO(), 8)}_morning-sessions`;
    const to = `slot_${addDaysISO(todayISO(), 9)}_morning-sessions`;
    const booking = s.createBooking({
      userId: "usr_member",
      slotId: from,
      idempotencyKey: "idem_resched_1",
    });
    expect(booking.ok).toBe(true);
    if (!booking.ok) return;
    const result = s.rescheduleBooking(booking.data.booking.id, to, "usr_member");
    expect(result.ok).toBe(true);
    expect(s.bookings.find((item) => item.id === booking.data.booking.id)?.slotId).toBe(to);
  });
});

describe("admin schedule & controls", () => {
  it("creates a slot, changes capacity and blocks a date", () => {
    const s = store();
    const date = addDaysISO(todayISO(), 20);
    const slot = s.createSlot({
      sessionId: "ses_evening",
      date,
      startTime: "15:00",
      endTime: "16:30",
      capacity: 10,
    });
    expect(slot).not.toBeNull();
    expect(s.getSlotView(slot!.id)?.capacity).toBe(10);
    expect(s.updateSlotCapacity(slot!.id, 12).ok).toBe(true);
    expect(s.getSlotView(slot!.id)?.capacity).toBe(12);
    s.blockDate(date);
    expect(s.listSlots(date)).toHaveLength(0);
    expect(s.settings.holidayDates).toContain(date);
  });

  it("activates and suspends a customer membership", () => {
    const s = store();
    s.updateCustomerMembership("usr_member", "suspend");
    expect(s.getActiveMembership("usr_member")).toBeNull();
    s.updateCustomerMembership("usr_member", "activate");
    expect(s.getActiveMembership("usr_member")?.status).toBe("active");
  });

  it("builds an admin snapshot with metrics and chart series", () => {
    const snapshot = store().getAdminSnapshot();
    expect(snapshot.metrics.totalCustomers).toBeGreaterThan(0);
    expect(snapshot.revenueSeries).toHaveLength(6);
    expect(snapshot.bookingTrends).toHaveLength(7);
    expect(snapshot.planPerformance.length).toBeGreaterThan(0);
    expect(snapshot.customers.length).toBeGreaterThan(0);
  });
});

describe("payments, webhooks & growth", () => {
  it("processes a Stripe webhook event only once", () => {
    const s = store();
    const payload = { referenceId: "pay_1", providerRef: "cs_test_1" };
    const first = s.recordStripeEvent("evt_test_1", "checkout.session.completed", payload);
    const second = s.recordStripeEvent("evt_test_1", "checkout.session.completed", payload);
    expect(first.duplicate).toBe(false);
    expect(second.duplicate).toBe(true);
    expect(s.payments.find((item) => item.id === "pay_1")?.status).toBe("succeeded");
  });

  it("captures leads, newsletter, feedback, promotions, staff, campaigns and referrals", () => {
    const s = store();
    expect(
      s.createLead({
        name: "Test Lead",
        email: "lead@example.com",
        interest: "Monthly",
        message: "",
      }).status,
    ).toBe("new");
    expect(s.subscribeNewsletter("news@example.com").email).toBe("news@example.com");
    expect(s.submitFeedback("usr_member", 5, "Excellent demo").rating).toBe(5);
    expect(
      s.createPromotion({
        code: "TEST10",
        description: "Test",
        discountPercent: 10,
        expiresAt: addDaysISO(todayISO(), 10),
      }).code,
    ).toBe("TEST10");
    expect(
      s.addStaff({
        fullName: "Test Coach",
        role: "Trainer",
        specialty: "Strength",
        email: "coach@example.com",
        schedule: "Weekdays",
      }).active,
    ).toBe(true);
    expect(s.createCampaign({ name: "Test Campaign", audience: "All" }).status).toBe("draft");
    expect(s.redeemReferral("ALEX-INFINITE", "usr_admin")).toBe(true);
    expect(s.redeemReferral("ALEX-INFINITE", "usr_member")).toBe(false);
  });

  it("creates password reset tokens and consumes them once", () => {
    const s = store();
    const token = s.createResetToken("member@infinitegym.demo");
    expect(token).not.toBeNull();
    expect(s.consumeResetToken(token!)).toBe("usr_member");
    expect(s.consumeResetToken(token!)).toBeNull();
  });
});
