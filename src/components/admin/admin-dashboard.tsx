"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  Activity,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  Download,
  Gift,
  Loader2,
  Mail,
  Megaphone,
  RotateCcw,
  Search,
  Settings,
  ShieldCheck,
  TrendingUp,
  Users,
} from "lucide-react";
import { Badge, DemoBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import {
  AreaTrendChart,
  BarTrendChart,
  DonutChart,
  LineTrendChart,
} from "@/components/charts/charts";
import { formatDate, formatUSD, todayISO } from "@/lib/format";
import {
  addStaffAction,
  blockDateAction,
  cancelBookingAction,
  createCampaignAction,
  createPromotionAction,
  createSlotAction,
  resetDemoDataAction,
  sendQueuedEmailsAction,
  updateCustomerMembershipAction,
  updatePlanAction,
  updateSlotCapacityAction,
} from "@/app/actions";
import { cn } from "@/lib/utils";
import type { AdminSnapshot, MembershipPlan, Payment, SlotView } from "@/types";

type Tab =
  | "overview"
  | "customers"
  | "bookings"
  | "plans"
  | "schedule"
  | "payments"
  | "staff"
  | "growth"
  | "notifications"
  | "settings";

const tabs: Array<{ id: Tab; label: string; icon: typeof Activity }> = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "customers", label: "Customers", icon: Users },
  { id: "bookings", label: "Bookings", icon: CalendarDays },
  { id: "plans", label: "Plans", icon: CreditCard },
  { id: "schedule", label: "Schedule", icon: Activity },
  { id: "payments", label: "Payments", icon: CreditCard },
  { id: "staff", label: "Staff", icon: ShieldCheck },
  { id: "growth", label: "Growth", icon: TrendingUp },
  { id: "notifications", label: "Notifications", icon: Mail },
  { id: "settings", label: "Settings", icon: Settings },
];

interface Props {
  snapshot: AdminSnapshot;
  integrations: { stripe: boolean; email: boolean; supabase: boolean };
}

export function AdminDashboard({ snapshot, integrations }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("overview");
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  async function run(
    action: () => Promise<{ ok: boolean; message?: string; error?: string }>,
    key: string,
  ) {
    setBusy(key);
    setMessage(null);
    const result = await action();
    setMessage({ ok: result.ok, text: result.message ?? result.error ?? "Done." });
    setBusy(null);
    router.refresh();
  }

  const metricCards = [
    { label: "Registered customers", value: snapshot.metrics.totalCustomers, icon: Users },
    { label: "Active memberships", value: snapshot.metrics.activeMemberships, icon: ShieldCheck },
    { label: "New registrations", value: snapshot.metrics.newRegistrations, icon: TrendingUp },
    { label: "Total bookings", value: snapshot.metrics.totalBookings, icon: CalendarDays },
    { label: "Today's bookings", value: snapshot.metrics.todaysBookings, icon: Activity },
    { label: "Available capacity", value: snapshot.metrics.availableCapacity, icon: CheckCircle2 },
    {
      label: "Monthly revenue",
      value: formatUSD(snapshot.metrics.monthlyRevenueCents),
      icon: CreditCard,
    },
    { label: "Renewals", value: snapshot.metrics.membershipRenewals, icon: RotateCcw },
    { label: "Cancelled bookings", value: snapshot.metrics.cancelledBookings, icon: BarChart3 },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="igc-eyebrow">Business control center · {formatDate(todayISO())}</p>
          <h1 className="igc-display mt-3 text-3xl text-white sm:text-4xl">
            EVERYTHING. <span className="text-lime">ONE PLACE</span>.
          </h1>
          <p className="mt-3 text-sm text-white/50">
            Manage customers, capacity, pricing, staff, payments and growth without editing code.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge tone="amber">Demo data</Badge>
          <Badge tone="blue">Admin</Badge>
        </div>
      </div>

      {message ? (
        <p
          className={cn(
            "rounded-xl border px-4 py-3 text-sm",
            message.ok
              ? "border-lime/25 bg-lime/10 text-lime"
              : "border-red-500/25 bg-red-500/10 text-red-300",
          )}
          role="status"
        >
          {message.text}
        </p>
      ) : null}

      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-bold uppercase tracking-[0.1em] transition",
              tab === item.id
                ? "border-lime/40 bg-lime/10 text-lime"
                : "border-white/10 bg-ink-850 text-white/50 hover:text-white",
            )}
          >
            <item.icon className="h-3.5 w-3.5" /> {item.label}
          </button>
        ))}
      </div>

      {tab === "overview" ? (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {metricCards.map((metric) => (
              <Card key={metric.label} className="p-5">
                <div className="flex items-start justify-between">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">
                    {metric.label}
                  </p>
                  <metric.icon className="h-4 w-4 text-lime" />
                </div>
                <p className="mt-4 text-2xl font-black text-white">{metric.value}</p>
              </Card>
            ))}
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <ChartCard title="Monthly revenue (USD demo)">
              <AreaTrendChart data={snapshot.revenueSeries} prefix="$" />
            </ChartCard>
            <ChartCard title="Membership growth">
              <LineTrendChart data={snapshot.membershipGrowth} color="#2F6BFF" />
            </ChartCard>
            <ChartCard title="Daily booking trends">
              <BarTrendChart data={snapshot.bookingTrends} color="#C8FF3D" />
            </ChartCard>
            <ChartCard title="Customer registrations">
              <BarTrendChart data={snapshot.registrations} color="#6E97FF" />
            </ChartCard>
          </div>
          <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
            <ChartCard title="Membership plan performance">
              <DonutChart
                data={snapshot.planPerformance.map((item) => ({
                  label: item.name,
                  value: item.members,
                }))}
              />
            </ChartCard>
            <Card>
              <CardHeader>
                <CardTitle>Integration status</CardTitle>
              </CardHeader>
              <CardBody className="space-y-3">
                <IntegrationRow
                  label="Supabase / PostgreSQL"
                  configured={integrations.supabase}
                  detail={
                    integrations.supabase
                      ? "Connected"
                      : "Demo in-memory store · migrations ready in supabase/migrations"
                  }
                />
                <IntegrationRow
                  label="Stripe test mode"
                  configured={integrations.stripe}
                  detail={
                    integrations.stripe
                      ? "Test keys configured"
                      : "Not configured · no real payments processed"
                  }
                />
                <IntegrationRow
                  label="Email provider"
                  configured={integrations.email}
                  detail={
                    integrations.email
                      ? "Configured"
                      : "Queued-only · configure RESEND_API_KEY or SMTP"
                  }
                />
                <div className="rounded-xl border border-white/10 bg-ink-900 p-4 text-xs leading-relaxed text-white/45">
                  This dashboard edits the live demo dataset. In production the same actions map to
                  Supabase tables protected by Row Level Security. All sample prices and metrics are
                  labelled demonstration data.
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      ) : null}

      {tab === "customers" ? <CustomersPanel snapshot={snapshot} run={run} busy={busy} /> : null}
      {tab === "bookings" ? <BookingsPanel snapshot={snapshot} run={run} busy={busy} /> : null}
      {tab === "plans" ? <PlansPanel plans={snapshot.plans} run={run} busy={busy} /> : null}
      {tab === "schedule" ? <SchedulePanel snapshot={snapshot} run={run} busy={busy} /> : null}
      {tab === "payments" ? <PaymentsPanel payments={snapshot.payments} /> : null}
      {tab === "staff" ? <StaffPanel snapshot={snapshot} run={run} busy={busy} /> : null}
      {tab === "growth" ? <GrowthPanel snapshot={snapshot} run={run} busy={busy} /> : null}
      {tab === "notifications" ? (
        <NotificationsPanel snapshot={snapshot} integrations={integrations} run={run} busy={busy} />
      ) : null}
      {tab === "settings" ? (
        <SettingsPanel snapshot={snapshot} integrations={integrations} run={run} busy={busy} />
      ) : null}
    </div>
  );
}

type RunFn = (
  action: () => Promise<{ ok: boolean; message?: string; error?: string }>,
  key: string,
) => Promise<void>;

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{title}</CardTitle>
          <DemoBadge />
        </div>
      </CardHeader>
      <CardBody>{children}</CardBody>
    </Card>
  );
}

function IntegrationRow({
  label,
  configured,
  detail,
}: {
  label: string;
  configured: boolean;
  detail: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-white/10 bg-ink-900 p-4">
      <div>
        <p className="text-sm font-bold text-white">{label}</p>
        <p className="mt-1 text-xs text-white/45">{detail}</p>
      </div>
      <Badge tone={configured ? "lime" : "amber"}>{configured ? "Ready" : "Demo"}</Badge>
    </div>
  );
}

function CustomersPanel({
  snapshot,
  run,
  busy,
}: {
  snapshot: AdminSnapshot;
  run: RunFn;
  busy: string | null;
}) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(
    () =>
      snapshot.customers.filter((customer) =>
        `${customer.fullName} ${customer.email} ${customer.membership}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [snapshot.customers, query],
  );
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Customer management</CardTitle>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search customers…"
              className="pl-9"
            />
          </div>
        </div>
      </CardHeader>
      <CardBody className="overflow-x-auto">
        <table className="igc-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Email</th>
              <th>Membership</th>
              <th>Status</th>
              <th>Bookings</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((customer) => (
              <tr key={customer.id}>
                <td className="font-semibold text-white">{customer.fullName}</td>
                <td>{customer.email}</td>
                <td>{customer.membership}</td>
                <td>
                  <Badge tone={customer.membershipStatus === "active" ? "lime" : "red"}>
                    {customer.membershipStatus}
                  </Badge>
                </td>
                <td>{customer.bookings}</td>
                <td>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={busy === `a-${customer.id}`}
                      onClick={() =>
                        run(
                          () => updateCustomerMembershipAction(customer.id, "activate"),
                          `a-${customer.id}`,
                        )
                      }
                    >
                      Activate
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      disabled={busy === `s-${customer.id}`}
                      onClick={() =>
                        run(
                          () => updateCustomerMembershipAction(customer.id, "suspend"),
                          `s-${customer.id}`,
                        )
                      }
                    >
                      Suspend
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 ? (
          <p className="py-8 text-center text-sm text-white/40">No customers match this search.</p>
        ) : null}
      </CardBody>
    </Card>
  );
}

function BookingsPanel({
  snapshot,
  run,
  busy,
}: {
  snapshot: AdminSnapshot;
  run: RunFn;
  busy: string | null;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Booking management</CardTitle>
          <Badge tone="blue">{snapshot.bookings.length} records</Badge>
        </div>
      </CardHeader>
      <CardBody className="overflow-x-auto">
        <table className="igc-table">
          <thead>
            <tr>
              <th>Member</th>
              <th>Session</th>
              <th>Date / time</th>
              <th>Status</th>
              <th>Amount</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {snapshot.bookings.slice(0, 40).map((booking) => (
              <tr key={booking.id}>
                <td>
                  {snapshot.customers.find((customer) => customer.id === booking.userId)
                    ?.fullName ?? booking.userId}
                </td>
                <td className="font-semibold text-white">{booking.slot.session.title}</td>
                <td>
                  {formatDate(booking.slot.date)} · {booking.slot.startTime}
                </td>
                <td>
                  <Badge
                    tone={
                      booking.status === "confirmed"
                        ? "lime"
                        : booking.status === "cancelled"
                          ? "red"
                          : "amber"
                    }
                  >
                    {booking.status}
                  </Badge>
                </td>
                <td>{formatUSD(booking.amountCents)}</td>
                <td>
                  <Button
                    size="sm"
                    variant="danger"
                    disabled={booking.status !== "confirmed" || busy === booking.id}
                    onClick={() => run(() => cancelBookingAction(booking.id, true), booking.id)}
                  >
                    Cancel
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardBody>
    </Card>
  );
}

function PlanEditor({
  plan,
  run,
  busy,
}: {
  plan: MembershipPlan;
  run: RunFn;
  busy: string | null;
}) {
  const [price, setPrice] = useState((plan.priceCents / 100).toFixed(2));
  const [duration, setDuration] = useState(plan.durationDays);
  const [tagline, setTagline] = useState(plan.tagline);
  const [benefits, setBenefits] = useState(plan.benefits.join("\n"));
  const [featured, setFeatured] = useState(plan.featured);
  const [active, setActive] = useState(plan.active);
  return (
    <div className="rounded-2xl border border-white/10 bg-ink-850 p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-bold text-white">{plan.name}</p>
        <DemoBadge />
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Field label="Price (USD)">
          <Input
            type="number"
            min="0"
            step="0.01"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
          />
        </Field>
        <Field label="Duration (days)">
          <Input
            type="number"
            min="1"
            value={duration}
            onChange={(event) => setDuration(Number(event.target.value))}
          />
        </Field>
      </div>
      <div className="mt-3">
        <Field label="Tagline">
          <Input value={tagline} onChange={(event) => setTagline(event.target.value)} />
        </Field>
      </div>
      <div className="mt-3">
        <Field label="Benefits (one per line)">
          <Textarea value={benefits} onChange={(event) => setBenefits(event.target.value)} />
        </Field>
      </div>
      <div className="mt-3 flex flex-wrap gap-5 text-xs text-white/55">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={featured}
            onChange={(event) => setFeatured(event.target.checked)}
            className="accent-lime"
          />{" "}
          Featured
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={active}
            onChange={(event) => setActive(event.target.checked)}
            className="accent-lime"
          />{" "}
          Active
        </label>
      </div>
      <Button
        size="sm"
        className="mt-4 w-full"
        disabled={busy === plan.id}
        onClick={() =>
          run(
            () =>
              updatePlanAction(plan.id, {
                priceCents: Math.max(0, Math.round(Number(price) * 100)),
                durationDays: Math.max(1, duration),
                tagline,
                benefits: benefits
                  .split("\n")
                  .map((item) => item.trim())
                  .filter(Boolean),
                featured,
                active,
              }),
            plan.id,
          )
        }
      >
        {busy === plan.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save plan"}
      </Button>
    </div>
  );
}

function PlansPanel({
  plans,
  run,
  busy,
}: {
  plans: MembershipPlan[];
  run: RunFn;
  busy: string | null;
}) {
  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-amber-400/20 bg-amber-400/[0.06] p-5 text-sm text-amber-100/80">
        <strong className="text-amber-200">Editable demonstration pricing.</strong> Changes apply
        immediately to the membership page and are labelled as sample data until the business owner
        approves real pricing.
      </div>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {plans.map((plan) => (
          <PlanEditor key={plan.id} plan={plan} run={run} busy={busy} />
        ))}
      </div>
    </div>
  );
}

function SchedulePanel({
  snapshot,
  run,
  busy,
}: {
  snapshot: AdminSnapshot;
  run: RunFn;
  busy: string | null;
}) {
  const [sessionId, setSessionId] = useState(snapshot.plans.length ? "ses_general" : "ses_general");
  const [date, setDate] = useState(todayISO());
  const [start, setStart] = useState("07:00");
  const [end, setEnd] = useState("08:00");
  const [capacity, setCapacity] = useState(20);
  const [blockDate, setBlockDate] = useState(todayISO());
  const [capacityEdits, setCapacityEdits] = useState<Record<string, number>>({});

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_1.1fr]">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Add a time slot</CardTitle>
          </CardHeader>
          <CardBody className="space-y-3">
            <Field label="Session">
              <Select value={sessionId} onChange={(event) => setSessionId(event.target.value)}>
                {[
                  "ses_general",
                  "ses_morning",
                  "ses_afternoon",
                  "ses_evening",
                  "ses_pt",
                  "ses_group",
                  "ses_special",
                ].map((id) => (
                  <option key={id} value={id}>
                    {snapshot.slots.find((slot) => slot.session.id === id)?.session.title ?? id}
                  </option>
                ))}
              </Select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Date">
                <Input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
              </Field>
              <Field label="Capacity">
                <Input
                  type="number"
                  min="1"
                  value={capacity}
                  onChange={(event) => setCapacity(Number(event.target.value))}
                />
              </Field>
              <Field label="Start">
                <Input
                  type="time"
                  value={start}
                  onChange={(event) => setStart(event.target.value)}
                />
              </Field>
              <Field label="End">
                <Input type="time" value={end} onChange={(event) => setEnd(event.target.value)} />
              </Field>
            </div>
            <Button
              className="w-full"
              disabled={busy === "create-slot"}
              onClick={() =>
                run(
                  () =>
                    createSlotAction({ sessionId, date, startTime: start, endTime: end, capacity }),
                  "create-slot",
                )
              }
            >
              Create slot
            </Button>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Block a date / holiday</CardTitle>
          </CardHeader>
          <CardBody className="space-y-3">
            <Field label="Date">
              <Input
                type="date"
                value={blockDate}
                onChange={(event) => setBlockDate(event.target.value)}
              />
            </Field>
            <Button
              variant="outline"
              className="w-full"
              disabled={busy === "block"}
              onClick={() => run(() => blockDateAction(blockDate), "block")}
            >
              Block date
            </Button>
            {snapshot.settings.holidayDates.length > 0 ? (
              <div className="flex flex-wrap gap-2 pt-2">
                {snapshot.settings.holidayDates.map((holiday) => (
                  <Badge key={holiday} tone="red">
                    {holiday}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-xs text-white/35">No blocked dates yet.</p>
            )}
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Operating settings</CardTitle>
          </CardHeader>
          <CardBody className="space-y-2 text-sm text-white/55">
            <p>
              <span className="text-white/35">Hours:</span> {snapshot.settings.operatingHours}
            </p>
            <p>
              <span className="text-white/35">Daily capacity:</span>{" "}
              {snapshot.settings.dailyCapacity}
            </p>
            <p>
              <span className="text-white/35">Timezone:</span> {snapshot.settings.timezone}
            </p>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Upcoming slots & capacity</CardTitle>
            <Badge tone="blue">{snapshot.slots.length}</Badge>
          </div>
        </CardHeader>
        <CardBody className="max-h-[720px] space-y-2 overflow-y-auto">
          {snapshot.slots.slice(0, 40).map((slot: SlotView) => (
            <div
              key={slot.id}
              className="flex flex-col gap-2 rounded-xl border border-white/10 bg-ink-900 p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="truncate text-xs font-bold text-white">{slot.session.title}</p>
                <p className="mt-1 text-[11px] text-white/40">
                  {formatDate(slot.date)} · {slot.startTime} · {slot.booked}/{slot.capacity} booked
                  · {slot.remaining} left
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={slot.booked}
                  value={capacityEdits[slot.id] ?? slot.capacity}
                  onChange={(event) =>
                    setCapacityEdits((prev) => ({ ...prev, [slot.id]: Number(event.target.value) }))
                  }
                  className="h-9 w-20 px-2 text-xs"
                  aria-label={`Capacity for ${slot.session.title}`}
                />
                <Button
                  size="sm"
                  variant="outline"
                  disabled={busy === `cap-${slot.id}`}
                  onClick={() =>
                    run(
                      () =>
                        updateSlotCapacityAction(slot.id, capacityEdits[slot.id] ?? slot.capacity),
                      `cap-${slot.id}`,
                    )
                  }
                >
                  Set
                </Button>
              </div>
            </div>
          ))}
        </CardBody>
      </Card>
    </div>
  );
}

function PaymentsPanel({ payments }: { payments: Payment[] }) {
  function downloadReceipt(payment: Payment) {
    const content = [
      "INFINITE GYM CENTER — DEMONSTRATION RECEIPT",
      "==========================================",
      `Receipt ID: ${payment.id}`,
      `Date: ${formatDate(payment.createdAt)}`,
      `Description: ${payment.description}`,
      `Amount: ${formatUSD(payment.amountCents)} ${payment.currency}`,
      `Status: ${payment.status}`,
      `Provider: ${payment.provider}`,
      `Refunded: ${payment.refundedAt ? formatDate(payment.refundedAt) : "No"}`,
      "",
      "DEMO DATA — no real payment was processed.",
    ].join("\n");
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `igc-demo-receipt-${payment.id}.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  }
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Payment transactions</CardTitle>
          <DemoBadge />
        </div>
      </CardHeader>
      <CardBody className="overflow-x-auto">
        <table className="igc-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Member</th>
              <th>Description</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Refund</th>
              <th>Receipt</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr key={payment.id}>
                <td className="font-mono text-xs text-white/45">{payment.id.slice(0, 12)}</td>
                <td className="text-xs">{payment.userId}</td>
                <td className="max-w-[240px] truncate text-white/75">{payment.description}</td>
                <td>{formatUSD(payment.amountCents)}</td>
                <td>
                  <Badge
                    tone={
                      payment.status === "simulated" || payment.status === "succeeded"
                        ? "lime"
                        : payment.status === "failed"
                          ? "red"
                          : "amber"
                    }
                  >
                    {payment.status}
                  </Badge>
                </td>
                <td>{payment.refundedAt ? formatDate(payment.refundedAt) : "—"}</td>
                <td>
                  <Button size="sm" variant="ghost" onClick={() => downloadReceipt(payment)}>
                    <Download className="h-3.5 w-3.5" /> .txt
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardBody>
    </Card>
  );
}

function StaffPanel({
  snapshot,
  run,
  busy,
}: {
  snapshot: AdminSnapshot;
  run: RunFn;
  busy: string | null;
}) {
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("Trainer");
  const [specialty, setSpecialty] = useState("Strength & conditioning");
  const [email, setEmail] = useState("");
  const [schedule, setSchedule] = useState("Weekdays");
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
      <Card>
        <CardHeader>
          <CardTitle>Add trainer / employee</CardTitle>
        </CardHeader>
        <CardBody className="space-y-3">
          <Field label="Full name">
            <Input
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              placeholder="Casey Jordan"
            />
          </Field>
          <Field label="Role">
            <Input value={role} onChange={(event) => setRole(event.target.value)} />
          </Field>
          <Field label="Specialty">
            <Input value={specialty} onChange={(event) => setSpecialty(event.target.value)} />
          </Field>
          <Field label="Email">
            <Input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="coach@infinitegym.demo"
            />
          </Field>
          <Field label="Schedule">
            <Input value={schedule} onChange={(event) => setSchedule(event.target.value)} />
          </Field>
          <Button
            className="w-full"
            disabled={busy === "staff"}
            onClick={() =>
              run(() => addStaffAction({ fullName, role, specialty, email, schedule }), "staff")
            }
          >
            Add staff
          </Button>
        </CardBody>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Staff & assignments</CardTitle>
        </CardHeader>
        <CardBody className="overflow-x-auto">
          <table className="igc-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Specialty</th>
                <th>Assigned</th>
                <th>Schedule</th>
              </tr>
            </thead>
            <tbody>
              {snapshot.staff.map((member) => (
                <tr key={member.id}>
                  <td className="font-semibold text-white">{member.fullName}</td>
                  <td>{member.role}</td>
                  <td>{member.specialty}</td>
                  <td>{member.assignedCustomers}</td>
                  <td>{member.schedule}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardBody>
      </Card>
    </div>
  );
}

function GrowthPanel({
  snapshot,
  run,
  busy,
}: {
  snapshot: AdminSnapshot;
  run: RunFn;
  busy: string | null;
}) {
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [discount, setDiscount] = useState(10);
  const [expiresAt, setExpiresAt] = useState(todayISO());
  const [campaignName, setCampaignName] = useState("");
  const [audience, setAudience] = useState("Active members");
  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Promotional discount codes</CardTitle>
          </CardHeader>
          <CardBody className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Code">
                <Input
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                  placeholder="SUMMER25"
                />
              </Field>
              <Field label="Discount %">
                <Input
                  type="number"
                  min="1"
                  max="100"
                  value={discount}
                  onChange={(event) => setDiscount(Number(event.target.value))}
                />
              </Field>
            </div>
            <Field label="Description">
              <Input
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Summer membership offer"
              />
            </Field>
            <Field label="Expires">
              <Input
                type="date"
                value={expiresAt}
                onChange={(event) => setExpiresAt(event.target.value)}
              />
            </Field>
            <Button
              className="w-full"
              disabled={busy === "promo"}
              onClick={() =>
                run(
                  () =>
                    createPromotionAction({
                      code,
                      description,
                      discountPercent: discount,
                      expiresAt,
                    }),
                  "promo",
                )
              }
            >
              Create promotion
            </Button>
            <div className="space-y-2 pt-3">
              {snapshot.promotions.map((promotion) => (
                <div
                  key={promotion.id}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-ink-900 p-3"
                >
                  <div>
                    <p className="font-mono text-xs font-bold text-lime">{promotion.code}</p>
                    <p className="mt-1 text-[11px] text-white/40">{promotion.description}</p>
                  </div>
                  <Badge tone="blue">
                    {promotion.discountPercent}% · {promotion.uses} uses
                  </Badge>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Campaign manager</CardTitle>
          </CardHeader>
          <CardBody className="space-y-3">
            <Field label="Campaign name">
              <Input
                value={campaignName}
                onChange={(event) => setCampaignName(event.target.value)}
                placeholder="Spring Strong"
              />
            </Field>
            <Field label="Audience">
              <Input value={audience} onChange={(event) => setAudience(event.target.value)} />
            </Field>
            <Button
              variant="outline"
              className="w-full"
              disabled={busy === "campaign"}
              onClick={() =>
                run(() => createCampaignAction({ name: campaignName, audience }), "campaign")
              }
            >
              <Megaphone className="h-4 w-4" /> Draft campaign
            </Button>
            <div className="space-y-2 pt-3">
              {snapshot.campaigns.map((campaign) => (
                <div
                  key={campaign.id}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-ink-900 p-3"
                >
                  <div>
                    <p className="text-xs font-bold text-white">{campaign.name}</p>
                    <p className="mt-1 text-[11px] text-white/40">{campaign.audience}</p>
                  </div>
                  <Badge tone={campaign.status === "active" ? "lime" : "neutral"}>
                    {campaign.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Lead capture</CardTitle>
          </CardHeader>
          <CardBody className="space-y-2">
            {snapshot.leads.map((lead) => (
              <div key={lead.id} className="rounded-xl border border-white/10 bg-ink-900 p-3">
                <p className="text-xs font-bold text-white">{lead.name}</p>
                <p className="mt-1 text-[11px] text-white/40">
                  {lead.email} · {lead.interest}
                </p>
                <Badge tone="amber" className="mt-2">
                  {lead.status}
                </Badge>
              </div>
            ))}
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Newsletter</CardTitle>
          </CardHeader>
          <CardBody className="space-y-2">
            {snapshot.subscribers.map((subscriber) => (
              <div
                key={subscriber.id}
                className="rounded-xl border border-white/10 bg-ink-900 p-3 text-xs text-white/60"
              >
                {subscriber.email}
              </div>
            ))}
            <p className="text-[11px] text-white/30">
              {snapshot.subscribers.length} demo subscribers
            </p>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Feedback & referrals</CardTitle>
          </CardHeader>
          <CardBody className="space-y-2">
            {snapshot.feedback.slice(0, 4).map((entry) => (
              <div key={entry.id} className="rounded-xl border border-white/10 bg-ink-900 p-3">
                <p className="text-xs text-lime">{"★".repeat(entry.rating)}</p>
                <p className="mt-1 text-[11px] leading-relaxed text-white/50">{entry.comment}</p>
              </div>
            ))}
            {snapshot.referrals.map((referral) => (
              <div key={referral.id} className="rounded-xl border border-lime/20 bg-lime/5 p-3">
                <p className="text-[10px] uppercase tracking-widest text-white/35">Referral code</p>
                <p className="mt-1 font-mono text-xs font-bold text-lime">{referral.code}</p>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

function NotificationsPanel({
  snapshot,
  integrations,
  run,
  busy,
}: {
  snapshot: AdminSnapshot;
  integrations: Props["integrations"];
  run: RunFn;
  busy: string | null;
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Notification outbox</CardTitle>
            <Badge tone="blue">{snapshot.notifications.length}</Badge>
          </div>
        </CardHeader>
        <CardBody className="max-h-[640px] space-y-2 overflow-y-auto">
          {snapshot.notifications.map((notification) => (
            <div key={notification.id} className="rounded-xl border border-white/10 bg-ink-900 p-4">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-bold text-white">{notification.title}</p>
                <Badge tone={notification.deliveryStatus === "sent" ? "lime" : "amber"}>
                  {notification.deliveryStatus}
                </Badge>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-white/50">{notification.body}</p>
              <p className="mt-2 text-[10px] uppercase tracking-widest text-white/25">
                {notification.type} · {notification.channel} · {formatDate(notification.createdAt)}
              </p>
            </div>
          ))}
        </CardBody>
      </Card>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Email delivery</CardTitle>
          </CardHeader>
          <CardBody className="space-y-3">
            <p className="text-xs leading-relaxed text-white/50">
              Notifications are stored in-app. With a configured provider, queued messages can be
              delivered. The app never claims an email was sent without a provider response.
            </p>
            <IntegrationRow
              label="Provider"
              configured={integrations.email}
              detail={integrations.email ? "Configured" : "Not configured"}
            />
            <Button
              className="w-full"
              variant="outline"
              disabled={busy === "email"}
              onClick={() => run(() => sendQueuedEmailsAction(), "email")}
            >
              {busy === "email" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Mail className="h-4 w-4" />
              )}{" "}
              Process queued emails
            </Button>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Supported events</CardTitle>
          </CardHeader>
          <CardBody className="space-y-2 text-xs text-white/50">
            {[
              "Successful bookings",
              "Booking cancellations",
              "Session reminders",
              "Membership expiration",
              "Successful payments",
              "Payment failures",
              "Membership renewals",
            ].map((item) => (
              <p key={item} className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-lime" /> {item}
              </p>
            ))}
            <p className="pt-2 text-[11px] text-white/30">
              SMS and push are optional future integrations.
            </p>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

function SettingsPanel({
  snapshot,
  integrations,
  run,
  busy,
}: {
  snapshot: AdminSnapshot;
  integrations: Props["integrations"];
  run: RunFn;
  busy: string | null;
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Gym configuration</CardTitle>
        </CardHeader>
        <CardBody className="space-y-3 text-sm text-white/55">
          <p>
            <span className="text-white/35">Operating hours:</span>{" "}
            {snapshot.settings.operatingHours}
          </p>
          <p>
            <span className="text-white/35">Daily capacity:</span> {snapshot.settings.dailyCapacity}{" "}
            members
          </p>
          <p>
            <span className="text-white/35">Timezone:</span> {snapshot.settings.timezone}
          </p>
          <p>
            <span className="text-white/35">Blocked dates:</span>{" "}
            {snapshot.settings.holidayDates.length
              ? snapshot.settings.holidayDates.join(", ")
              : "None"}
          </p>
          <p className="rounded-xl border border-white/10 bg-ink-900 p-4 text-xs leading-relaxed text-white/45">
            Schedule creation, capacity control, holiday blocking and staff assignment are all
            available from the Schedule and Staff tabs — no code changes required.
          </p>
        </CardBody>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Integrations & security</CardTitle>
        </CardHeader>
        <CardBody className="space-y-3">
          <IntegrationRow
            label="Supabase / PostgreSQL"
            configured={integrations.supabase}
            detail="Migrations, indexes and RLS policies in supabase/"
          />
          <IntegrationRow
            label="Stripe test mode"
            configured={integrations.stripe}
            detail="Checkout + signed webhook; no card data stored"
          />
          <IntegrationRow
            label="Email"
            configured={integrations.email}
            detail="Configurable Resend / SMTP adapter"
          />
          <div className="rounded-xl border border-white/10 bg-ink-900 p-4 text-xs leading-relaxed text-white/45">
            Security: role-guarded server actions, Zod validation, signed httpOnly sessions, webhook
            signature verification, idempotency keys and duplicate-booking protection. Replace
            .env.example placeholders before connecting real services.
          </div>
          <Button
            variant="danger"
            className="w-full"
            disabled={busy === "reset"}
            onClick={() => run(() => resetDemoDataAction(), "reset")}
          >
            <RotateCcw className="h-4 w-4" /> Reset demo dataset
          </Button>
        </CardBody>
      </Card>
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Stripe test setup</CardTitle>
        </CardHeader>
        <CardBody className="grid gap-4 text-sm text-white/55 md:grid-cols-2">
          <ol className="list-decimal space-y-2 pl-5 text-xs leading-relaxed text-white/50">
            <li>
              Copy <code className="text-lime">.env.example</code> to{" "}
              <code className="text-lime">.env.local</code>.
            </li>
            <li>
              Add Stripe test keys <code className="text-lime">sk_test_…</code>,{" "}
              <code className="text-lime">pk_test_…</code> and{" "}
              <code className="text-lime">whsec_…</code>.
            </li>
            <li>
              Run{" "}
              <code className="text-lime">
                stripe listen --forward-to localhost:3000/api/stripe/webhook
              </code>
              .
            </li>
            <li>Use test card 4242 4242 4242 4242. No raw card data touches this database.</li>
          </ol>
          <div className="rounded-xl border border-amber-400/20 bg-amber-400/[0.06] p-4 text-xs leading-relaxed text-amber-100/70">
            Until valid test credentials are present, the app uses a clearly labelled{" "}
            <strong>simulated</strong> payment record. It never claims a real payment was processed
            and never stores card details.
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
