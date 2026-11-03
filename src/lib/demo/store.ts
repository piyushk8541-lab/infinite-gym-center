import { addDaysISO, todayISO } from "@/lib/format";
import { hashPassword, newId } from "@/lib/security";
import type {
  AdminSnapshot,
  Booking,
  BookingView,
  Campaign,
  ChartPoint,
  CustomerMembership,
  DashboardMetrics,
  Feedback,
  GymSession,
  GymSettings,
  Lead,
  MembershipPlan,
  NewsletterSubscriber,
  Notification,
  NotificationType,
  Payment,
  PlanPerformancePoint,
  Promotion,
  PublicUser,
  Referral,
  Role,
  SessionCategory,
  SlotView,
  Staff,
  TimeSlot,
  User,
} from "@/types";

const DEMO_PASSWORD = "DemoPass123!";
const DAY_MS = 86_400_000;

export interface CreateBookingInput {
  userId: string;
  slotId: string;
  idempotencyKey: string;
  simulatePaymentFailure?: boolean;
}

export interface CreateBookingResult {
  booking: Booking;
  payment: Payment | null;
  duplicate: boolean;
}

export interface DemoStore {
  users: User[];
  plans: MembershipPlan[];
  memberships: CustomerMembership[];
  sessions: GymSession[];
  slots: TimeSlot[];
  bookings: Booking[];
  payments: Payment[];
  notifications: Notification[];
  staff: Staff[];
  promotions: Promotion[];
  leads: Lead[];
  subscribers: NewsletterSubscriber[];
  feedback: Feedback[];
  campaigns: Campaign[];
  referrals: Referral[];
  settings: GymSettings;
  resetTokens: Map<string, { userId: string; expiresAt: number }>;
  stripeEvents: Set<string>;
  bookingIdempotency: Map<string, string>;
  paymentIdempotency: Map<string, string>;

  createUser(input: {
    email: string;
    fullName: string;
    phone: string;
    password: string;
    role: Role;
  }): User;
  findUserByEmail(email: string): User | undefined;
  createNotification(input: {
    userId: string;
    type: NotificationType;
    title: string;
    body: string;
    channel?: "in_app" | "email";
  }): Notification;
  createResetToken(email: string): string | null;
  consumeResetToken(token: string): string | null;
  expireMemberships(): void;
  getActiveMembership(userId: string): CustomerMembership | null;
  listSlots(date?: string, category?: SessionCategory | "All"): SlotView[];
  getSlotView(slotId: string): SlotView | null;
  listBookings(userId?: string): BookingView[];
  listPayments(userId?: string): Payment[];
  listNotifications(userId?: string): Notification[];
  createBooking(
    input: CreateBookingInput,
  ): { ok: true; data: CreateBookingResult } | { ok: false; error: string };
  cancelBooking(
    bookingId: string,
    userId: string,
    admin?: boolean,
  ): { ok: true; data: Booking } | { ok: false; error: string };
  rescheduleBooking(
    bookingId: string,
    newSlotId: string,
    userId: string,
    admin?: boolean,
  ): { ok: true; data: Booking } | { ok: false; error: string };
  purchasePlan(
    userId: string,
    planId: string,
    idempotencyKey: string,
    simulateFailure?: boolean,
  ):
    | { ok: true; data: { membership: CustomerMembership; payment: Payment } }
    | { ok: false; error: string };
  updatePlan(planId: string, patch: Partial<MembershipPlan>): MembershipPlan | null;
  createSlot(input: {
    sessionId: string;
    date: string;
    startTime: string;
    endTime: string;
    capacity: number;
  }): TimeSlot | null;
  updateSlotCapacity(
    slotId: string,
    capacity: number,
  ): { ok: true; data: TimeSlot } | { ok: false; error: string };
  blockDate(date: string): GymSettings;
  listCustomers(): Array<
    PublicUser & { membership: string; membershipStatus: string; bookings: number }
  >;
  updateCustomerMembership(userId: string, action: "activate" | "suspend"): User | null;
  addStaff(input: Omit<Staff, "id" | "assignedCustomers" | "active" | "demo">): Staff;
  createPromotion(input: Omit<Promotion, "id" | "uses" | "active" | "demo">): Promotion;
  createLead(input: Pick<Lead, "name" | "email" | "interest" | "message">): Lead;
  subscribeNewsletter(email: string): NewsletterSubscriber;
  submitFeedback(userId: string | null, rating: number, comment: string): Feedback;
  createCampaign(input: Pick<Campaign, "name" | "audience">): Campaign;
  redeemReferral(code: string, userId: string): boolean;
  markNotificationRead(id: string): void;
  recordStripeEvent(
    eventId: string,
    type: string,
    payload: { referenceId?: string; providerRef?: string; amountCents?: number },
  ): { duplicate: boolean };
  getAdminSnapshot(): AdminSnapshot;
}

declare global {
  var __IGC_DEMO_STORE__: DemoStore | undefined;
}

function isoNow(): string {
  return new Date().toISOString();
}

function isDemoCapacityUser(user: User): boolean {
  return user.email.endsWith("@demo.local");
}

function categorySlug(category: SessionCategory): string {
  return category
    .toLowerCase()
    .replace(/[^a-z]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function createSeedStore(): DemoStore {
  const now = isoNow();
  const today = todayISO();

  const users: User[] = [
    {
      id: "usr_admin",
      email: "admin@infinitegym.demo",
      fullName: "Jordan Ellis",
      role: "admin",
      phone: "+1 (512) 555-0100",
      avatarUrl: "",
      createdAt: now,
      emailVerified: true,
      passwordHash: hashPassword(DEMO_PASSWORD),
      demo: true,
    },
    {
      id: "usr_member",
      email: "member@infinitegym.demo",
      fullName: "Alex Morgan",
      role: "member",
      phone: "+1 (512) 555-0142",
      avatarUrl: "",
      createdAt: now,
      emailVerified: true,
      passwordHash: hashPassword(DEMO_PASSWORD),
      demo: true,
    },
    {
      id: "usr_trainer",
      email: "trainer@infinitegym.demo",
      fullName: "Sam Rivera",
      role: "trainer",
      phone: "+1 (512) 555-0177",
      avatarUrl: "",
      createdAt: now,
      emailVerified: true,
      passwordHash: hashPassword(DEMO_PASSWORD),
      demo: true,
    },
    {
      id: "usr_crowd",
      email: "capacity@demo.local",
      fullName: "Capacity Demo",
      role: "member",
      phone: "",
      avatarUrl: "",
      createdAt: now,
      emailVerified: true,
      passwordHash: hashPassword(DEMO_PASSWORD),
      demo: true,
    },
  ];

  const plans: MembershipPlan[] = [
    {
      id: "plan_daily",
      name: "Daily Pass",
      tagline: "One day. Full access.",
      priceCents: 1500,
      durationDays: 1,
      benefits: [
        "Full gym floor access",
        "Locker room + showers",
        "One group class",
        "No commitment",
      ],
      accessLevel: "Standard floor",
      bookingEligibility: "General access + 1 class",
      featured: false,
      active: true,
      demo: true,
    },
    {
      id: "plan_weekly",
      name: "Weekly Membership",
      tagline: "Seven days of momentum.",
      priceCents: 4900,
      durationDays: 7,
      benefits: [
        "Unlimited gym floor access",
        "All group fitness classes",
        "Smart capacity booking",
        "Guest pass: 1",
      ],
      accessLevel: "Standard floor + studios",
      bookingEligibility: "All standard sessions",
      featured: false,
      active: true,
      demo: true,
    },
    {
      id: "plan_monthly",
      name: "Monthly Membership",
      tagline: "The member favorite.",
      priceCents: 8900,
      durationDays: 30,
      benefits: [
        "Unlimited gym access",
        "All group classes",
        "Priority smart booking",
        "Monthly body composition scan",
        "Member referral rewards",
      ],
      accessLevel: "Full club",
      bookingEligibility: "All sessions except 1:1 PT packages",
      featured: true,
      active: true,
      demo: true,
    },
    {
      id: "plan_quarterly",
      name: "Quarterly Membership",
      tagline: "Train with a 90-day plan.",
      priceCents: 23900,
      durationDays: 90,
      benefits: [
        "Everything in Monthly",
        "Quarterly coaching consult",
        "10% off special programs",
        "Freeze option: 14 days",
      ],
      accessLevel: "Full club",
      bookingEligibility: "All sessions + program priority",
      featured: false,
      active: true,
      demo: true,
    },
    {
      id: "plan_annual",
      name: "Annual Membership",
      tagline: "Best value. Go infinite.",
      priceCents: 79900,
      durationDays: 365,
      benefits: [
        "Everything in Quarterly",
        "2 personal training sessions",
        "VIP equipment access",
        "Annual guest week",
        "Locked-in rate",
      ],
      accessLevel: "Full club + VIP",
      bookingEligibility: "All sessions + VIP windows",
      featured: true,
      active: true,
      demo: true,
    },
    {
      id: "plan_pt",
      name: "Personal Training Package",
      tagline: "Eight sessions. One transformation.",
      priceCents: 49900,
      durationDays: 60,
      benefits: [
        "8 x 60-minute 1:1 sessions",
        "Custom programming",
        "Nutrition baseline",
        "Progress tracking",
        "Dedicated coach",
      ],
      accessLevel: "Coach-led",
      bookingEligibility: "Personal Training sessions",
      featured: false,
      active: true,
      demo: true,
    },
  ];

  const sessions: GymSession[] = [
    {
      id: "ses_general",
      title: "Open Gym Access",
      category: "General Gym Access",
      description: "Full access to the strength floor, cardio deck and functional training zone.",
      coachId: null,
      durationMinutes: 1080,
      priceCents: 0,
      demo: true,
    },
    {
      id: "ses_morning",
      title: "Sunrise Strength",
      category: "Morning Sessions",
      description: "Coach-led early strength block with guided warm-up and mobility.",
      coachId: "stf_1",
      durationMinutes: 90,
      priceCents: 0,
      demo: true,
    },
    {
      id: "ses_afternoon",
      title: "Midday Performance",
      category: "Afternoon Sessions",
      description: "Efficient lunch-hour conditioning and technique work.",
      coachId: "stf_2",
      durationMinutes: 90,
      priceCents: 0,
      demo: true,
    },
    {
      id: "ses_evening",
      title: "Peak Hour Training",
      category: "Evening Sessions",
      description: "Our flagship after-work floor session with full coach coverage.",
      coachId: "stf_1",
      durationMinutes: 90,
      priceCents: 0,
      demo: true,
    },
    {
      id: "ses_pt",
      title: "1:1 Personal Training",
      category: "Personal Training",
      description: "A dedicated coach, a custom plan and undivided attention.",
      coachId: "stf_3",
      durationMinutes: 60,
      priceCents: 6500,
      demo: true,
    },
    {
      id: "ses_group",
      title: "Infinite HIIT",
      category: "Group Fitness Classes",
      description: "High-energy interval training built for all fitness levels.",
      coachId: "stf_2",
      durationMinutes: 60,
      priceCents: 1500,
      demo: true,
    },
    {
      id: "ses_special",
      title: "Athlete Lab",
      category: "Special Training Programs",
      description: "Small-group specialty programming: power, speed and resilience.",
      coachId: "stf_3",
      durationMinutes: 90,
      priceCents: 2500,
      demo: true,
    },
  ];

  const slotTemplates: Array<{
    sessionId: string;
    startTime: string;
    endTime: string;
    capacity: number;
  }> = [
    { sessionId: "ses_general", startTime: "05:00", endTime: "23:00", capacity: 40 },
    { sessionId: "ses_morning", startTime: "06:00", endTime: "07:30", capacity: 24 },
    { sessionId: "ses_pt", startTime: "09:00", endTime: "10:00", capacity: 4 },
    { sessionId: "ses_afternoon", startTime: "12:00", endTime: "13:30", capacity: 24 },
    { sessionId: "ses_evening", startTime: "17:00", endTime: "18:30", capacity: 30 },
    { sessionId: "ses_group", startTime: "18:45", endTime: "19:45", capacity: 20 },
    { sessionId: "ses_special", startTime: "20:00", endTime: "21:30", capacity: 16 },
  ];

  const slots: TimeSlot[] = [];
  for (let offset = 0; offset < 14; offset += 1) {
    const date = addDaysISO(today, offset);
    for (const template of slotTemplates) {
      const session = sessions.find((item) => item.id === template.sessionId)!;
      slots.push({
        id: `slot_${date}_${categorySlug(session.category)}`,
        sessionId: template.sessionId,
        date,
        startTime: template.startTime,
        endTime: template.endTime,
        capacity: template.capacity,
        blocked: false,
        demo: true,
      });
    }
  }

  const memberships: CustomerMembership[] = [
    {
      id: "mem_1",
      userId: "usr_member",
      planId: "plan_monthly",
      status: "active",
      startedAt: new Date(Date.now() - 9 * DAY_MS).toISOString(),
      expiresAt: new Date(Date.now() + 21 * DAY_MS).toISOString(),
      autoRenew: true,
      expirationNotified: false,
      demo: true,
    },
    {
      id: "mem_2",
      userId: "usr_admin",
      planId: "plan_annual",
      status: "active",
      startedAt: new Date(Date.now() - 40 * DAY_MS).toISOString(),
      expiresAt: new Date(Date.now() + 325 * DAY_MS).toISOString(),
      autoRenew: true,
      expirationNotified: false,
      demo: true,
    },
    {
      id: "mem_3",
      userId: "usr_trainer",
      planId: "plan_quarterly",
      status: "active",
      startedAt: new Date(Date.now() - 20 * DAY_MS).toISOString(),
      expiresAt: new Date(Date.now() + 70 * DAY_MS).toISOString(),
      autoRenew: false,
      expirationNotified: false,
      demo: true,
    },
  ];

  const bookings: Booking[] = [];
  // 24 of 30 seats taken on today's Peak Hour Training -> "6 SPOTS AVAILABLE".
  for (let i = 0; i < 24; i += 1) {
    bookings.push({
      id: `bkg_crowd_${i}`,
      userId: "usr_crowd",
      slotId: `slot_${today}_evening-sessions`,
      status: "confirmed",
      createdAt: now,
      amountCents: 0,
      paymentId: null,
      idempotencyKey: `seed_evening_${i}`,
      source: "web",
      demo: true,
    });
  }
  bookings.push(
    {
      id: "bkg_member_1",
      userId: "usr_member",
      slotId: `slot_${addDaysISO(today, 1)}_group-fitness-classes`,
      status: "confirmed",
      createdAt: now,
      amountCents: 1500,
      paymentId: "pay_2",
      idempotencyKey: "seed_member_group",
      source: "web",
      demo: true,
    },
    {
      id: "bkg_member_2",
      userId: "usr_member",
      slotId: `slot_${addDaysISO(today, 2)}_personal-training`,
      status: "confirmed",
      createdAt: now,
      amountCents: 6500,
      paymentId: "pay_3",
      idempotencyKey: "seed_member_pt",
      source: "web",
      demo: true,
    },
  );

  const payments: Payment[] = [
    {
      id: "pay_1",
      userId: "usr_member",
      kind: "membership",
      referenceId: "mem_1",
      amountCents: 8900,
      currency: "USD",
      status: "simulated",
      provider: "demo",
      providerRef: null,
      description: "DEMO ONLY - Monthly Membership (no real charge)",
      createdAt: new Date(Date.now() - 9 * DAY_MS).toISOString(),
      refundedAt: null,
      idempotencyKey: "seed_pay_1",
      demo: true,
    },
    {
      id: "pay_2",
      userId: "usr_member",
      kind: "booking",
      referenceId: "bkg_member_1",
      amountCents: 1500,
      currency: "USD",
      status: "simulated",
      provider: "demo",
      providerRef: null,
      description: "DEMO ONLY - Infinite HIIT booking (no real charge)",
      createdAt: now,
      refundedAt: null,
      idempotencyKey: "seed_pay_2",
      demo: true,
    },
    {
      id: "pay_3",
      userId: "usr_member",
      kind: "booking",
      referenceId: "bkg_member_2",
      amountCents: 6500,
      currency: "USD",
      status: "simulated",
      provider: "demo",
      providerRef: null,
      description: "DEMO ONLY - 1:1 Personal Training (no real charge)",
      createdAt: now,
      refundedAt: null,
      idempotencyKey: "seed_pay_3",
      demo: true,
    },
    {
      id: "pay_4",
      userId: "usr_member",
      kind: "booking",
      referenceId: "bkg_failed",
      amountCents: 2500,
      currency: "USD",
      status: "failed",
      provider: "demo",
      providerRef: null,
      description: "DEMO ONLY - failed payment example (no charge)",
      createdAt: new Date(Date.now() - 3 * DAY_MS).toISOString(),
      refundedAt: null,
      idempotencyKey: "seed_pay_4",
      demo: true,
    },
  ];

  const notifications: Notification[] = [
    {
      id: "ntf_1",
      userId: "usr_member",
      type: "booking_confirmed",
      title: "Booking confirmed",
      body: "Infinite HIIT is on your schedule. Arrive 10 minutes early.",
      read: false,
      channel: "in_app",
      deliveryStatus: "queued",
      createdAt: now,
      demo: true,
    },
    {
      id: "ntf_2",
      userId: "usr_member",
      type: "payment_succeeded",
      title: "Payment recorded (demo)",
      body: "A simulated $89.00 membership payment was recorded. No real charge occurred.",
      read: false,
      channel: "in_app",
      deliveryStatus: "queued",
      createdAt: now,
      demo: true,
    },
    {
      id: "ntf_3",
      userId: "usr_member",
      type: "membership_expiring",
      title: "Membership renews soon",
      body: "Your Monthly Membership renews in 21 days.",
      read: true,
      channel: "in_app",
      deliveryStatus: "queued",
      createdAt: now,
      demo: true,
    },
    {
      id: "ntf_4",
      userId: "usr_member",
      type: "session_reminder",
      title: "Upcoming session",
      body: "Your personal training session is in 2 days.",
      read: false,
      channel: "in_app",
      deliveryStatus: "queued",
      createdAt: now,
      demo: true,
    },
    {
      id: "ntf_5",
      userId: "usr_admin",
      type: "system",
      title: "New registration",
      body: "Alex Morgan joined the platform (demo data).",
      read: false,
      channel: "in_app",
      deliveryStatus: "queued",
      createdAt: now,
      demo: true,
    },
    {
      id: "ntf_6",
      userId: "usr_admin",
      type: "membership_renewed",
      title: "Renewal processed",
      body: "A demo membership renewal was recorded.",
      read: true,
      channel: "in_app",
      deliveryStatus: "queued",
      createdAt: now,
      demo: true,
    },
  ];

  const staff: Staff[] = [
    {
      id: "stf_1",
      fullName: "Sam Rivera",
      role: "Head Strength Coach",
      specialty: "Strength & conditioning",
      email: "sam@infinitegym.demo",
      assignedCustomers: 18,
      schedule: "Mon-Fri 5:00 AM - 2:00 PM",
      active: true,
      demo: true,
    },
    {
      id: "stf_2",
      fullName: "Dana Brooks",
      role: "Group Fitness Lead",
      specialty: "HIIT & metabolic conditioning",
      email: "dana@infinitegym.demo",
      assignedCustomers: 32,
      schedule: "Mon-Sat 11:00 AM - 8:00 PM",
      active: true,
      demo: true,
    },
    {
      id: "stf_3",
      fullName: "Marcus Chen",
      role: "Performance Coach",
      specialty: "Athletic performance & PT",
      email: "marcus@infinitegym.demo",
      assignedCustomers: 12,
      schedule: "Tue-Sat 7:00 AM - 7:00 PM",
      active: true,
      demo: true,
    },
  ];

  const promotions: Promotion[] = [
    {
      id: "prm_1",
      code: "INFINITE20",
      description: "20% off first membership (demo)",
      discountPercent: 20,
      active: true,
      expiresAt: addDaysISO(today, 45),
      uses: 14,
      demo: true,
    },
    {
      id: "prm_2",
      code: "BRINGAFRIEND",
      description: "Referral credit for member + guest (demo)",
      discountPercent: 15,
      active: true,
      expiresAt: addDaysISO(today, 90),
      uses: 7,
      demo: true,
    },
  ];

  const leads: Lead[] = [
    {
      id: "led_1",
      name: "Taylor Reed",
      email: "taylor@example.com",
      interest: "Monthly Membership",
      message: "Interested in evening classes.",
      status: "new",
      createdAt: now,
      demo: true,
    },
    {
      id: "led_2",
      name: "Chris Patel",
      email: "chris@example.com",
      interest: "Personal Training",
      message: "Want a strength program.",
      status: "contacted",
      createdAt: now,
      demo: true,
    },
    {
      id: "led_3",
      name: "Jamie Lee",
      email: "jamie@example.com",
      interest: "Annual Membership",
      message: "",
      status: "new",
      createdAt: now,
      demo: true,
    },
  ];

  const subscribers: NewsletterSubscriber[] = [
    { id: "sub_1", email: "newsletter1@example.com", createdAt: now, demo: true },
    { id: "sub_2", email: "newsletter2@example.com", createdAt: now, demo: true },
  ];

  const feedback: Feedback[] = [
    {
      id: "fb_1",
      userId: "usr_member",
      rating: 5,
      comment: "The smart capacity display makes planning effortless.",
      createdAt: now,
      demo: true,
    },
    {
      id: "fb_2",
      userId: null,
      rating: 5,
      comment: "Best training floor I have used. Coaches are excellent.",
      createdAt: now,
      demo: true,
    },
    {
      id: "fb_3",
      userId: null,
      rating: 4,
      comment: "Love the evening sessions, would like more weekend slots.",
      createdAt: now,
      demo: true,
    },
  ];

  const campaigns: Campaign[] = [
    {
      id: "cmp_1",
      name: "New Year Strong",
      audience: "Leads - no membership",
      status: "active",
      createdAt: now,
      demo: true,
    },
    {
      id: "cmp_2",
      name: "Bring a Friend",
      audience: "Active members",
      status: "draft",
      createdAt: now,
      demo: true,
    },
  ];

  const referrals: Referral[] = [
    {
      id: "ref_1",
      referrerUserId: "usr_member",
      code: "ALEX-INFINITE",
      redeemedBy: null,
      createdAt: now,
      demo: true,
    },
  ];

  const settings: GymSettings = {
    id: "gym_settings",
    operatingHours: "Mon-Fri 5:00 AM - 11:00 PM | Sat-Sun 6:00 AM - 10:00 PM",
    holidayDates: [],
    dailyCapacity: 240,
    timezone: "America/Chicago",
    demo: true,
  };

  const resetTokens = new Map<string, { userId: string; expiresAt: number }>();
  const stripeEvents = new Set<string>();
  const bookingIdempotency = new Map<string, string>();
  const paymentIdempotency = new Map<string, string>();

  const store: DemoStore = {
    users,
    plans,
    memberships,
    sessions,
    slots,
    bookings,
    payments,
    notifications,
    staff,
    promotions,
    leads,
    subscribers,
    feedback,
    campaigns,
    referrals,
    settings,
    resetTokens,
    stripeEvents,
    bookingIdempotency,
    paymentIdempotency,

    createUser(input) {
      const user: User = {
        id: newId("usr"),
        email: input.email,
        fullName: input.fullName,
        role: input.role,
        phone: input.phone,
        avatarUrl: "",
        createdAt: isoNow(),
        emailVerified: false,
        passwordHash: hashPassword(input.password),
        demo: true,
      };
      users.push(user);
      return user;
    },

    findUserByEmail(email) {
      return users.find((user) => user.email === email);
    },

    createNotification(input) {
      const notification: Notification = {
        id: newId("ntf"),
        userId: input.userId,
        type: input.type,
        title: input.title,
        body: input.body,
        read: false,
        channel: input.channel ?? "in_app",
        deliveryStatus: "queued",
        createdAt: isoNow(),
        demo: true,
      };
      notifications.push(notification);
      return notification;
    },

    createResetToken(email) {
      const user = users.find((candidate) => candidate.email === email);
      if (!user) return null;
      const token = `rst_${newId("token")}`;
      resetTokens.set(token, { userId: user.id, expiresAt: Date.now() + 60 * 60 * 1000 });
      this.createNotification({
        userId: user.id,
        type: "system",
        title: "Password reset requested",
        body: `DEMO RESET TOKEN (no email sent): ${token}`,
      });
      return token;
    },

    consumeResetToken(token) {
      const entry = resetTokens.get(token);
      if (!entry || entry.expiresAt < Date.now()) {
        resetTokens.delete(token);
        return null;
      }
      resetTokens.delete(token);
      return entry.userId;
    },

    expireMemberships() {
      const current = Date.now();
      for (const membership of memberships) {
        if (membership.status === "active" && new Date(membership.expiresAt).getTime() <= current) {
          membership.status = "expired";
          if (!membership.expirationNotified) {
            membership.expirationNotified = true;
            this.createNotification({
              userId: membership.userId,
              type: "membership_expiring",
              title: "Membership expired",
              body: "Your membership has expired. Renew to keep booking sessions.",
            });
          }
        }
      }
    },

    getActiveMembership(userId) {
      this.expireMemberships();
      return (
        memberships
          .filter(
            (membership) =>
              membership.userId === userId &&
              membership.status === "active" &&
              new Date(membership.expiresAt).getTime() > Date.now(),
          )
          .sort((a, b) => new Date(b.expiresAt).getTime() - new Date(a.expiresAt).getTime())[0] ??
        null
      );
    },

    listSlots(date, category = "All") {
      this.expireMemberships();
      const today = todayISO();
      if (date && date < today) return [];
      const target = date ?? today;
      const candidates = slots.filter((slot) => {
        if (slot.blocked || settings.holidayDates.includes(slot.date)) return false;
        if (date) return slot.date === target;
        return slot.date >= today;
      });
      const filtered =
        category === "All"
          ? candidates
          : candidates.filter(
              (slot) => sessions.find((s) => s.id === slot.sessionId)?.category === category,
            );
      return filtered
        .map((slot) => this.getSlotView(slot.id))
        .filter((slot): slot is SlotView => slot !== null)
        .sort((a, b) => `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`));
    },

    getSlotView(slotId) {
      const slot = slots.find((candidate) => candidate.id === slotId);
      if (!slot) return null;
      const session = sessions.find((candidate) => candidate.id === slot.sessionId) ?? sessions[0];
      const booked = bookings.filter(
        (booking) => booking.slotId === slot.id && booking.status === "confirmed",
      ).length;
      const remaining = Math.max(0, slot.capacity - booked);
      return { ...slot, session, booked, remaining, isFull: remaining <= 0 };
    },

    listBookings(userId) {
      return bookings
        .filter((booking) => (userId ? booking.userId === userId : true))
        .map((booking) => {
          const slot = this.getSlotView(booking.slotId);
          if (!slot) return null;
          return { ...booking, slot } satisfies BookingView;
        })
        .filter((booking): booking is BookingView => booking !== null)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    },

    listPayments(userId) {
      return payments
        .filter((payment) => (userId ? payment.userId === userId : true))
        .slice()
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    },

    listNotifications(userId) {
      return notifications
        .filter((notification) => (userId ? notification.userId === userId : true))
        .slice()
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    },

    createBooking(input) {
      const existingId = bookingIdempotency.get(input.idempotencyKey);
      if (existingId) {
        const booking = bookings.find((candidate) => candidate.id === existingId);
        if (booking) {
          const payment = booking.paymentId
            ? (payments.find((p) => p.id === booking.paymentId) ?? null)
            : null;
          return { ok: true, data: { booking, payment, duplicate: true } };
        }
      }

      const slot = slots.find((candidate) => candidate.id === input.slotId);
      if (!slot || slot.blocked || settings.holidayDates.includes(slot.date)) {
        return { ok: false, error: "This time slot is unavailable." };
      }
      const view = this.getSlotView(slot.id)!;
      const membership = this.getActiveMembership(input.userId);
      if (!membership) {
        return {
          ok: false,
          error: "An active membership is required before booking. Choose a plan first.",
        };
      }

      const doubleBooked = bookings.some(
        (booking) =>
          booking.userId === input.userId &&
          booking.slotId === slot.id &&
          booking.status === "confirmed",
      );
      if (doubleBooked) {
        return { ok: false, error: "You already have a booking for this slot." };
      }

      const conflict = bookings.some((booking) => {
        if (booking.userId !== input.userId || booking.status !== "confirmed") return false;
        const other = slots.find((candidate) => candidate.id === booking.slotId);
        return other?.date === slot.date && other?.startTime === slot.startTime;
      });
      if (conflict) {
        return { ok: false, error: "You already have a session booked at this time." };
      }

      if (view.isFull) {
        return { ok: false, error: "This session is full. Please choose another slot." };
      }

      const bookingId = newId("bkg");
      let payment: Payment | null = null;
      let bookingStatus: Booking["status"] = "confirmed";

      if (view.session.priceCents > 0) {
        const paymentId = newId("pay");
        if (input.simulatePaymentFailure) {
          payment = {
            id: paymentId,
            userId: input.userId,
            kind: "booking",
            referenceId: bookingId,
            amountCents: view.session.priceCents,
            currency: "USD",
            status: "failed",
            provider: "demo",
            providerRef: null,
            description: "DEMO ONLY - simulated failed payment (no real charge)",
            createdAt: isoNow(),
            refundedAt: null,
            idempotencyKey: input.idempotencyKey,
            demo: true,
          };
          payments.push(payment);
          bookingStatus = "pending_payment";
          this.createNotification({
            userId: input.userId,
            type: "payment_failed",
            title: "Payment failed (demo)",
            body: "The simulated payment failed. No charge was made and the booking was not confirmed.",
          });
        } else {
          payment = {
            id: paymentId,
            userId: input.userId,
            kind: "booking",
            referenceId: bookingId,
            amountCents: view.session.priceCents,
            currency: "USD",
            status: "simulated",
            provider: "demo",
            providerRef: null,
            description: `DEMO ONLY - ${view.session.title} booking (no real charge)`,
            createdAt: isoNow(),
            refundedAt: null,
            idempotencyKey: input.idempotencyKey,
            demo: true,
          };
          payments.push(payment);
          paymentIdempotency.set(input.idempotencyKey, payment.id);
        }
      }

      const booking: Booking = {
        id: bookingId,
        userId: input.userId,
        slotId: slot.id,
        status: bookingStatus,
        createdAt: isoNow(),
        amountCents: view.session.priceCents,
        paymentId: payment?.id ?? null,
        idempotencyKey: input.idempotencyKey,
        source: "web",
        demo: true,
      };
      bookings.push(booking);
      bookingIdempotency.set(input.idempotencyKey, booking.id);

      if (bookingStatus === "pending_payment") {
        return {
          ok: false,
          error: "Simulated payment failed. No charge was made; please try again.",
        };
      }

      this.createNotification({
        userId: input.userId,
        type: "booking_confirmed",
        title: "Booking confirmed",
        body: `${view.session.title} on ${view.date} at ${view.startTime}. ${view.remaining - 1} spots remain after your booking.`,
      });
      return { ok: true, data: { booking, payment, duplicate: false } };
    },

    cancelBooking(bookingId, userId, admin = false) {
      const booking = bookings.find((candidate) => candidate.id === bookingId);
      if (!booking) return { ok: false, error: "Booking not found." };
      if (!admin && booking.userId !== userId) return { ok: false, error: "Not authorized." };
      if (booking.status !== "confirmed" && booking.status !== "pending_payment") {
        return { ok: false, error: "This booking can no longer be cancelled." };
      }
      booking.status = "cancelled";
      if (booking.paymentId) {
        const payment = payments.find((candidate) => candidate.id === booking.paymentId);
        if (payment && payment.provider === "demo") {
          payment.status = "refunded";
          payment.refundedAt = isoNow();
        }
      }
      this.createNotification({
        userId: booking.userId,
        type: "booking_cancelled",
        title: "Booking cancelled",
        body: "Your session has been cancelled and capacity has been released.",
      });
      return { ok: true, data: booking };
    },

    rescheduleBooking(bookingId, newSlotId, userId, admin = false) {
      const booking = bookings.find((candidate) => candidate.id === bookingId);
      if (!booking) return { ok: false, error: "Booking not found." };
      if (!admin && booking.userId !== userId) return { ok: false, error: "Not authorized." };
      if (booking.status !== "confirmed")
        return { ok: false, error: "Only confirmed bookings can be rescheduled." };
      const newView = this.getSlotView(newSlotId);
      if (!newView || newView.isFull || newView.blocked) {
        return { ok: false, error: "The selected destination slot is unavailable or full." };
      }
      const conflict = bookings.some((candidate) => {
        if (
          candidate.id === booking.id ||
          candidate.userId !== booking.userId ||
          candidate.status !== "confirmed"
        )
          return false;
        const other = slots.find((slot) => slot.id === candidate.slotId);
        return other?.date === newView.date && other?.startTime === newView.startTime;
      });
      if (conflict) return { ok: false, error: "You already have a session at that time." };
      booking.slotId = newSlotId;
      booking.createdAt = isoNow();
      booking.idempotencyKey = newId("idem");
      this.createNotification({
        userId: booking.userId,
        type: "booking_confirmed",
        title: "Session rescheduled",
        body: `Your session moved to ${newView.date} at ${newView.startTime}.`,
      });
      return { ok: true, data: booking };
    },

    purchasePlan(userId, planId, idempotencyKey, simulateFailure = false) {
      const existingPaymentId = paymentIdempotency.get(idempotencyKey);
      if (existingPaymentId) {
        const payment = payments.find((candidate) => candidate.id === existingPaymentId);
        const membership = memberships.find(
          (candidate) => candidate.userId === userId && candidate.status === "active",
        );
        if (payment && membership) return { ok: true, data: { membership, payment } };
      }
      const plan = plans.find((candidate) => candidate.id === planId && candidate.active);
      if (!plan) return { ok: false, error: "Membership plan not found." };

      const payment: Payment = {
        id: newId("pay"),
        userId,
        kind: "membership",
        referenceId: plan.id,
        amountCents: plan.priceCents,
        currency: "USD",
        status: simulateFailure ? "failed" : "simulated",
        provider: "demo",
        providerRef: null,
        description: `DEMO ONLY - ${plan.name} (no real charge)`,
        createdAt: isoNow(),
        refundedAt: null,
        idempotencyKey,
        demo: true,
      };
      payments.push(payment);
      paymentIdempotency.set(idempotencyKey, payment.id);

      if (simulateFailure) {
        this.createNotification({
          userId,
          type: "payment_failed",
          title: "Payment failed (demo)",
          body: "Simulated membership payment failed. No charge was made.",
        });
        return { ok: false, error: "Simulated payment failed. No charge was made." };
      }

      for (const membership of memberships) {
        if (membership.userId === userId && membership.status === "active")
          membership.status = "cancelled";
      }
      const membership: CustomerMembership = {
        id: newId("mem"),
        userId,
        planId: plan.id,
        status: "active",
        startedAt: isoNow(),
        expiresAt: new Date(Date.now() + plan.durationDays * DAY_MS).toISOString(),
        autoRenew: false,
        expirationNotified: false,
        demo: true,
      };
      memberships.push(membership);
      this.createNotification({
        userId,
        type: "membership_renewed",
        title: "Membership activated (demo)",
        body: `${plan.name} is active. This is simulated demo data; no real payment was processed.`,
      });
      return { ok: true, data: { membership, payment } };
    },

    updatePlan(planId, patch) {
      const plan = plans.find((candidate) => candidate.id === planId);
      if (!plan) return null;
      Object.assign(plan, patch);
      return plan;
    },

    createSlot(input) {
      if (settings.holidayDates.includes(input.date)) return null;
      if (!sessions.some((session) => session.id === input.sessionId)) return null;
      const slot: TimeSlot = {
        id: `slot_${input.date}_${newId("custom").slice(-8)}`,
        sessionId: input.sessionId,
        date: input.date,
        startTime: input.startTime,
        endTime: input.endTime,
        capacity: input.capacity,
        blocked: false,
        demo: true,
      };
      slots.push(slot);
      return slot;
    },

    updateSlotCapacity(slotId, capacity) {
      const slot = slots.find((candidate) => candidate.id === slotId);
      if (!slot) return { ok: false, error: "Slot not found." };
      const view = this.getSlotView(slotId);
      if (view && capacity < view.booked) {
        return { ok: false, error: `Capacity cannot be below ${view.booked} existing bookings.` };
      }
      slot.capacity = capacity;
      return { ok: true, data: slot };
    },

    blockDate(date) {
      if (!settings.holidayDates.includes(date)) settings.holidayDates.push(date);
      for (const slot of slots) if (slot.date === date) slot.blocked = true;
      return settings;
    },

    listCustomers() {
      return users
        .filter((user) => user.role === "member" && !isDemoCapacityUser(user))
        .map((user) => {
          const membership = this.getActiveMembership(user.id);
          const plan = membership
            ? plans.find((candidate) => candidate.id === membership.planId)
            : null;
          return {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            role: user.role,
            phone: user.phone,
            avatarUrl: user.avatarUrl,
            createdAt: user.createdAt,
            emailVerified: user.emailVerified,
            membership: plan?.name ?? "No active plan",
            membershipStatus: membership?.status ?? "expired",
            bookings: bookings.filter(
              (booking) => booking.userId === user.id && booking.status === "confirmed",
            ).length,
          };
        });
    },

    updateCustomerMembership(userId, action) {
      const user = users.find((candidate) => candidate.id === userId);
      if (!user) return null;
      const active = memberships.find(
        (candidate) => candidate.userId === userId && candidate.status === "active",
      );
      if (action === "suspend") {
        if (active) active.status = "cancelled";
        this.createNotification({
          userId,
          type: "system",
          title: "Membership suspended",
          body: "An administrator suspended your membership.",
        });
      } else {
        for (const membership of memberships) {
          if (membership.userId === userId && membership.status === "active")
            membership.status = "cancelled";
        }
        memberships.push({
          id: newId("mem"),
          userId,
          planId: "plan_monthly",
          status: "active",
          startedAt: isoNow(),
          expiresAt: new Date(Date.now() + 30 * DAY_MS).toISOString(),
          autoRenew: false,
          expirationNotified: false,
          demo: true,
        });
        this.createNotification({
          userId,
          type: "membership_renewed",
          title: "Membership activated",
          body: "An administrator activated a 30-day demo membership.",
        });
      }
      return user;
    },

    addStaff(input) {
      const member: Staff = {
        id: newId("stf"),
        fullName: input.fullName,
        role: input.role,
        specialty: input.specialty,
        email: input.email,
        schedule: input.schedule,
        assignedCustomers: 0,
        active: true,
        demo: true,
      };
      staff.push(member);
      return member;
    },

    createPromotion(input) {
      const promotion: Promotion = {
        id: newId("prm"),
        code: input.code,
        description: input.description,
        discountPercent: input.discountPercent,
        expiresAt: input.expiresAt,
        active: true,
        uses: 0,
        demo: true,
      };
      promotions.push(promotion);
      return promotion;
    },

    createLead(input) {
      const lead: Lead = {
        id: newId("led"),
        name: input.name,
        email: input.email,
        interest: input.interest,
        message: input.message,
        status: "new",
        createdAt: isoNow(),
        demo: true,
      };
      leads.push(lead);
      return lead;
    },

    subscribeNewsletter(email) {
      const existing = subscribers.find((subscriber) => subscriber.email === email);
      if (existing) return existing;
      const subscriber: NewsletterSubscriber = {
        id: newId("sub"),
        email,
        createdAt: isoNow(),
        demo: true,
      };
      subscribers.push(subscriber);
      return subscriber;
    },

    submitFeedback(userId, rating, comment) {
      const entry: Feedback = {
        id: newId("fb"),
        userId,
        rating,
        comment,
        createdAt: isoNow(),
        demo: true,
      };
      feedback.push(entry);
      return entry;
    },

    createCampaign(input) {
      const campaign: Campaign = {
        id: newId("cmp"),
        name: input.name,
        audience: input.audience,
        status: "draft",
        createdAt: isoNow(),
        demo: true,
      };
      campaigns.push(campaign);
      return campaign;
    },

    redeemReferral(code, userId) {
      const referral = referrals.find((candidate) => candidate.code === code.toUpperCase());
      if (!referral || referral.redeemedBy) return false;
      referral.redeemedBy = userId;
      return true;
    },

    markNotificationRead(id) {
      const notification = notifications.find((candidate) => candidate.id === id);
      if (notification) notification.read = true;
    },

    recordStripeEvent(eventId, type, payload) {
      if (stripeEvents.has(eventId)) return { duplicate: true };
      stripeEvents.add(eventId);
      const payment = payments.find(
        (candidate) =>
          candidate.providerRef === payload.providerRef ||
          candidate.idempotencyKey === payload.referenceId ||
          candidate.id === payload.referenceId,
      );
      if (payment) {
        if (type === "checkout.session.completed" || type === "payment_intent.succeeded") {
          payment.status = "succeeded";
          payment.provider = "stripe";
          this.createNotification({
            userId: payment.userId,
            type: "payment_succeeded",
            title: "Payment confirmed",
            body: "Stripe confirmed your payment.",
          });
        } else if (type === "payment_intent.payment_failed") {
          payment.status = "failed";
          this.createNotification({
            userId: payment.userId,
            type: "payment_failed",
            title: "Payment failed",
            body: "Stripe reported a failed payment. No charge was captured.",
          });
        } else if (type === "charge.refunded") {
          payment.status = "refunded";
          payment.refundedAt = isoNow();
        }
      }
      return { duplicate: false };
    },

    getAdminSnapshot(): AdminSnapshot {
      this.expireMemberships();
      const monthKey = new Date().toISOString().slice(0, 7);
      const realUsers = users.filter((user) => user.role === "member" && !isDemoCapacityUser(user));
      const activeMemberships = memberships.filter(
        (membership) =>
          membership.status === "active" && new Date(membership.expiresAt).getTime() > Date.now(),
      );
      const futureSlots = this.listSlots();
      const availableCapacity = futureSlots.reduce((sum, slot) => sum + slot.remaining, 0);
      const monthlyRevenueCents = payments
        .filter(
          (payment) =>
            (payment.status === "simulated" || payment.status === "succeeded") &&
            payment.createdAt.startsWith(monthKey),
        )
        .reduce((sum, payment) => sum + payment.amountCents, 0);

      const metrics: DashboardMetrics = {
        totalCustomers: realUsers.length,
        activeMemberships: activeMemberships.length,
        newRegistrations: realUsers.filter(
          (user) => new Date(user.createdAt).getTime() > Date.now() - 30 * DAY_MS,
        ).length,
        totalBookings: bookings.filter((booking) => booking.status === "confirmed").length,
        todaysBookings: bookings.filter((booking) => booking.createdAt.slice(0, 10) === todayISO())
          .length,
        availableCapacity,
        monthlyRevenueCents,
        membershipRenewals: memberships.filter((membership) =>
          membership.startedAt.startsWith(monthKey),
        ).length,
        cancelledBookings: bookings.filter((booking) => booking.status === "cancelled").length,
      };

      const monthLabels: string[] = [];
      for (let i = 5; i >= 0; i -= 1) {
        const d = new Date();
        d.setUTCMonth(d.getUTCMonth() - i);
        monthLabels.push(
          new Intl.DateTimeFormat("en-US", { month: "short", timeZone: "UTC" }).format(d),
        );
      }
      const revenueSeries: ChartPoint[] = monthLabels.map((label, index) => ({
        label,
        value: [4200, 5100, 4800, 6200, 7100, 8450][index],
      }));
      const membershipGrowth: ChartPoint[] = monthLabels.map((label, index) => ({
        label,
        value: [120, 142, 161, 188, 214, 246][index],
      }));
      const registrations: ChartPoint[] = monthLabels.map((label, index) => ({
        label,
        value: [18, 22, 19, 31, 28, 36][index],
      }));
      const bookingTrends: ChartPoint[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
        (label, index) => ({ label, value: [38, 44, 41, 52, 61, 58, 67][index] }),
      );
      const planPerformance: PlanPerformancePoint[] = plans.map((plan) => {
        const members = memberships.filter(
          (membership) => membership.planId === plan.id && membership.status === "active",
        ).length;
        return { name: plan.name, members, revenueCents: members * plan.priceCents };
      });

      return {
        metrics,
        revenueSeries,
        membershipGrowth,
        bookingTrends,
        registrations,
        planPerformance,
        customers: this.listCustomers(),
        bookings: this.listBookings(),
        plans: plans.slice(),
        payments: this.listPayments(),
        staff: staff.slice(),
        promotions: promotions.slice(),
        leads: leads.slice(),
        feedback: feedback.slice(),
        campaigns: campaigns.slice(),
        subscribers: subscribers.slice(),
        referrals: referrals.slice(),
        notifications: this.listNotifications(),
        settings,
        slots: futureSlots,
      };
    },
  };

  return store;
}

export function getStore(): DemoStore {
  if (!globalThis.__IGC_DEMO_STORE__) {
    globalThis.__IGC_DEMO_STORE__ = createSeedStore();
  }
  return globalThis.__IGC_DEMO_STORE__;
}

/** Test helper: rebuilds the deterministic demo dataset. */
export function resetStore(): DemoStore {
  globalThis.__IGC_DEMO_STORE__ = createSeedStore();
  return globalThis.__IGC_DEMO_STORE__;
}
