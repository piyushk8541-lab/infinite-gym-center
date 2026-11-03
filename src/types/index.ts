export type Role = "member" | "trainer" | "admin";

export type SessionCategory =
  | "General Gym Access"
  | "Morning Sessions"
  | "Afternoon Sessions"
  | "Evening Sessions"
  | "Personal Training"
  | "Group Fitness Classes"
  | "Special Training Programs";

export type MembershipStatus = "active" | "expired" | "cancelled" | "pending";
export type BookingStatus = "confirmed" | "cancelled" | "completed" | "pending_payment";
export type PaymentStatus = "pending" | "succeeded" | "failed" | "refunded" | "simulated";
export type NotificationType =
  | "booking_confirmed"
  | "booking_cancelled"
  | "session_reminder"
  | "membership_expiring"
  | "payment_succeeded"
  | "payment_failed"
  | "membership_renewed"
  | "system";

export interface SessionPayload {
  userId: string;
  role: Role;
  exp: number;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  phone: string;
  avatarUrl: string;
  createdAt: string;
  emailVerified: boolean;
  passwordHash: string;
  demo: boolean;
}

export interface PublicUser {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  phone: string;
  avatarUrl: string;
  createdAt: string;
  emailVerified: boolean;
}

export interface MembershipPlan {
  id: string;
  name: string;
  tagline: string;
  priceCents: number;
  durationDays: number;
  benefits: string[];
  accessLevel: string;
  bookingEligibility: string;
  featured: boolean;
  active: boolean;
  demo: boolean;
}

export interface CustomerMembership {
  id: string;
  userId: string;
  planId: string;
  status: MembershipStatus;
  startedAt: string;
  expiresAt: string;
  autoRenew: boolean;
  expirationNotified: boolean;
  demo: boolean;
}

export interface GymSession {
  id: string;
  title: string;
  category: SessionCategory;
  description: string;
  coachId: string | null;
  durationMinutes: number;
  priceCents: number;
  demo: boolean;
}

export interface TimeSlot {
  id: string;
  sessionId: string;
  date: string;
  startTime: string;
  endTime: string;
  capacity: number;
  blocked: boolean;
  demo: boolean;
}

export interface Booking {
  id: string;
  userId: string;
  slotId: string;
  status: BookingStatus;
  createdAt: string;
  amountCents: number;
  paymentId: string | null;
  idempotencyKey: string;
  source: "web" | "admin";
  demo: boolean;
}

export interface Payment {
  id: string;
  userId: string;
  kind: "membership" | "booking";
  referenceId: string;
  amountCents: number;
  currency: "USD";
  status: PaymentStatus;
  provider: "stripe" | "demo";
  providerRef: string | null;
  description: string;
  createdAt: string;
  refundedAt: string | null;
  idempotencyKey: string;
  demo: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  read: boolean;
  channel: "in_app" | "email";
  deliveryStatus: "queued" | "sent" | "skipped";
  createdAt: string;
  demo: boolean;
}

export interface Staff {
  id: string;
  fullName: string;
  role: string;
  specialty: string;
  email: string;
  assignedCustomers: number;
  schedule: string;
  active: boolean;
  demo: boolean;
}

export interface Promotion {
  id: string;
  code: string;
  description: string;
  discountPercent: number;
  active: boolean;
  expiresAt: string;
  uses: number;
  demo: boolean;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  interest: string;
  message: string;
  status: "new" | "contacted" | "converted";
  createdAt: string;
  demo: boolean;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  createdAt: string;
  demo: boolean;
}

export interface Feedback {
  id: string;
  userId: string | null;
  rating: number;
  comment: string;
  createdAt: string;
  demo: boolean;
}

export interface Campaign {
  id: string;
  name: string;
  audience: string;
  status: "draft" | "active" | "paused";
  createdAt: string;
  demo: boolean;
}

export interface Referral {
  id: string;
  referrerUserId: string;
  code: string;
  redeemedBy: string | null;
  createdAt: string;
  demo: boolean;
}

export interface GymSettings {
  id: string;
  operatingHours: string;
  holidayDates: string[];
  dailyCapacity: number;
  timezone: string;
  demo: boolean;
}

export interface SlotView extends TimeSlot {
  session: GymSession;
  booked: number;
  remaining: number;
  isFull: boolean;
}

export interface BookingView extends Booking {
  slot: SlotView;
}

export interface DashboardMetrics {
  totalCustomers: number;
  activeMemberships: number;
  newRegistrations: number;
  totalBookings: number;
  todaysBookings: number;
  availableCapacity: number;
  monthlyRevenueCents: number;
  membershipRenewals: number;
  cancelledBookings: number;
}

export interface ChartPoint {
  label: string;
  value: number;
}

export interface PlanPerformancePoint {
  name: string;
  members: number;
  revenueCents: number;
}

export interface AdminSnapshot {
  metrics: DashboardMetrics;
  revenueSeries: ChartPoint[];
  membershipGrowth: ChartPoint[];
  bookingTrends: ChartPoint[];
  registrations: ChartPoint[];
  planPerformance: PlanPerformancePoint[];
  customers: Array<PublicUser & { membership: string; membershipStatus: string; bookings: number }>;
  bookings: BookingView[];
  plans: MembershipPlan[];
  payments: Payment[];
  staff: Staff[];
  promotions: Promotion[];
  leads: Lead[];
  feedback: Feedback[];
  campaigns: Campaign[];
  subscribers: NewsletterSubscriber[];
  referrals: Referral[];
  notifications: Notification[];
  settings: GymSettings;
  slots: SlotView[];
}

export interface ActionResult<T = unknown> {
  ok: boolean;
  data?: T;
  error?: string;
  message?: string;
}
