"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowUpRight,
  Bell,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  Loader2,
  Settings,
  Sparkles,
  Star,
  Users,
} from "lucide-react";
import { Badge, DemoBadge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { AreaTrendChart } from "@/components/charts/charts";
import { formatDate, formatUSD, todayISO } from "@/lib/format";
import {
  cancelBookingAction,
  markNotificationReadAction,
  redeemReferralAction,
  rescheduleBookingAction,
  submitFeedbackAction,
  verifyEmailAction,
} from "@/app/actions";
import { cn } from "@/lib/utils";
import type { BookingView, ChartPoint, Notification, Payment, PublicUser, SlotView } from "@/types";

interface Props {
  user: PublicUser;
  membership: { planName: string; expiresAt: string; status: string } | null;
  bookings: BookingView[];
  payments: Payment[];
  notifications: Notification[];
  slots: SlotView[];
  bookingTrend: ChartPoint[];
  referralCode: string;
}

export function MemberDashboard({
  user,
  membership,
  bookings,
  payments,
  notifications,
  slots,
  bookingTrend,
  referralCode,
}: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [rescheduleFor, setRescheduleFor] = useState<string | null>(null);
  const [targetSlot, setTargetSlot] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [redeemCode, setRedeemCode] = useState("");

  const today = todayISO();
  const upcoming = bookings.filter(
    (booking) => booking.status === "confirmed" && booking.slot.date >= today,
  );
  const availableToday = slots.filter((slot) => slot.date === today && !slot.isFull).length;
  const paidTotal = payments
    .filter((payment) => payment.status === "simulated" || payment.status === "succeeded")
    .reduce((sum, payment) => sum + payment.amountCents, 0);

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

  const metrics = [
    {
      label: "Active membership",
      value: membership ? membership.planName : "None",
      icon: Sparkles,
      tone: "text-lime",
    },
    {
      label: "Upcoming sessions",
      value: String(upcoming.length),
      icon: CalendarDays,
      tone: "text-electric-soft",
    },
    { label: "Slots open today", value: String(availableToday), icon: Users, tone: "text-lime" },
    { label: "Demo payments", value: formatUSD(paidTotal), icon: CreditCard, tone: "text-white" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="igc-eyebrow">Member dashboard · {formatDate(today)}</p>
          <h1 className="igc-display mt-3 text-3xl text-white sm:text-4xl">
            WELCOME BACK, {user.fullName.split(" ")[0].toUpperCase()}.
          </h1>
          <p className="mt-3 text-sm text-white/50">
            Your membership, sessions and payments in one place.
          </p>
        </div>
        <ButtonLink href="/book">
          <CalendarDays className="h-4 w-4" /> Book a new session
        </ButtonLink>
      </div>

      {!user.emailVerified ? (
        <div className="flex flex-col gap-4 rounded-2xl border border-amber-400/25 bg-amber-400/[0.07] p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold text-amber-200">Verify your email</p>
            <p className="mt-1 text-xs text-amber-100/60">
              Demo mode uses a one-click simulation. Production uses Supabase email confirmation.
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            disabled={busy === "verify"}
            onClick={() => run(() => verifyEmailAction(), "verify")}
          >
            {busy === "verify" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}{" "}
            Verify now
          </Button>
        </div>
      ) : null}

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

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.label} className="p-5">
            <div className="flex items-start justify-between">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/40">
                {metric.label}
              </p>
              <metric.icon className={cn("h-5 w-5", metric.tone)} />
            </div>
            <p className="mt-4 truncate text-lg font-bold text-white">{metric.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Training rhythm</CardTitle>
              <DemoBadge />
            </div>
          </CardHeader>
          <CardBody>
            <AreaTrendChart data={bookingTrend} prefix="" suffix=" bookings" />
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Active membership</CardTitle>
              <Badge tone={membership ? "lime" : "red"}>{membership ? "Active" : "None"}</Badge>
            </div>
          </CardHeader>
          <CardBody>
            {membership ? (
              <>
                <p className="igc-display text-2xl text-white">{membership.planName}</p>
                <p className="mt-2 text-sm text-white/50">
                  Expires {formatDate(membership.expiresAt)}
                </p>
                <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full w-[72%] rounded-full bg-lime" />
                </div>
                <p className="mt-2 text-xs text-white/35">
                  Renewal reminder queued in notifications.
                </p>
                <ButtonLink href="/membership" variant="outline" size="sm" className="mt-6 w-full">
                  Explore upgrade options <ArrowUpRight className="h-4 w-4" />
                </ButtonLink>
              </>
            ) : (
              <>
                <p className="text-sm text-white/55">You do not have an active membership yet.</p>
                <ButtonLink href="/membership" size="sm" className="mt-6 w-full">
                  Choose a plan
                </ButtonLink>
              </>
            )}
          </CardBody>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming sessions</CardTitle>
          </CardHeader>
          <CardBody className="space-y-4">
            {upcoming.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/15 p-8 text-center text-sm text-white/45">
                No upcoming sessions. Book one to get started.
              </div>
            ) : (
              upcoming.map((booking) => (
                <div key={booking.id} className="rounded-xl border border-white/10 bg-ink-900 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <Badge tone="blue">{booking.slot.session.category}</Badge>
                      <p className="mt-3 text-sm font-bold text-white">
                        {booking.slot.session.title}
                      </p>
                      <p className="mt-1 text-xs text-white/45">
                        {formatDate(booking.slot.date)} · {booking.slot.startTime}–
                        {booking.slot.endTime}
                      </p>
                    </div>
                    <Badge tone="lime">Confirmed</Badge>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="danger"
                      disabled={busy === booking.id}
                      onClick={() => run(() => cancelBookingAction(booking.id), booking.id)}
                    >
                      {busy === booking.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Cancel"
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setRescheduleFor(rescheduleFor === booking.id ? null : booking.id);
                        setTargetSlot("");
                      }}
                    >
                      {rescheduleFor === booking.id ? "Close" : "Reschedule"}
                    </Button>
                  </div>
                  {rescheduleFor === booking.id ? (
                    <div className="mt-4 rounded-xl border border-white/10 bg-ink-850 p-4">
                      <Field label="Move to slot">
                        <Select
                          value={targetSlot}
                          onChange={(event) => setTargetSlot(event.target.value)}
                        >
                          <option value="">Select an available slot</option>
                          {slots
                            .filter(
                              (slot) =>
                                slot.id !== booking.slotId && !slot.isFull && slot.date >= today,
                            )
                            .slice(0, 24)
                            .map((slot) => (
                              <option key={slot.id} value={slot.id}>
                                {formatDate(slot.date)} · {slot.startTime} · {slot.session.title} (
                                {slot.remaining} left)
                              </option>
                            ))}
                        </Select>
                      </Field>
                      <Button
                        size="sm"
                        className="mt-3"
                        disabled={!targetSlot || busy === `res-${booking.id}`}
                        onClick={() =>
                          run(
                            () => rescheduleBookingAction(booking.id, targetSlot),
                            `res-${booking.id}`,
                          )
                        }
                      >
                        Confirm move
                      </Button>
                    </div>
                  ) : null}
                </div>
              ))
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Notifications</CardTitle>
              <Bell className="h-4 w-4 text-lime" />
            </div>
          </CardHeader>
          <CardBody className="space-y-3">
            {notifications.slice(0, 6).map((notification) => (
              <button
                key={notification.id}
                type="button"
                onClick={() =>
                  run(() => markNotificationReadAction(notification.id), `ntf-${notification.id}`)
                }
                className={cn(
                  "w-full rounded-xl border p-3 text-left transition",
                  notification.read
                    ? "border-white/5 bg-ink-900/50 opacity-60"
                    : "border-white/10 bg-ink-900 hover:border-lime/30",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-bold text-white">{notification.title}</p>
                  {!notification.read ? (
                    <span className="h-1.5 w-1.5 rounded-full bg-lime" />
                  ) : null}
                </div>
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-white/45">
                  {notification.body}
                </p>
                <p className="mt-2 text-[10px] uppercase tracking-widest text-white/25">
                  {notification.deliveryStatus}
                </p>
              </button>
            ))}
            {notifications.length === 0 ? (
              <p className="text-sm text-white/45">No notifications yet.</p>
            ) : null}
          </CardBody>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Booking history</CardTitle>
          </CardHeader>
          <CardBody className="overflow-x-auto">
            <table className="igc-table">
              <thead>
                <tr>
                  <th>Session</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {bookings.slice(0, 8).map((booking) => (
                  <tr key={booking.id}>
                    <td className="font-semibold text-white">{booking.slot.session.title}</td>
                    <td>{formatDate(booking.slot.date)}</td>
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
                  </tr>
                ))}
              </tbody>
            </table>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Payment history</CardTitle>
          </CardHeader>
          <CardBody className="overflow-x-auto">
            <table className="igc-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {payments.slice(0, 8).map((payment) => (
                  <tr key={payment.id}>
                    <td className="max-w-[220px] truncate font-medium text-white">
                      {payment.description}
                    </td>
                    <td>{formatDate(payment.createdAt)}</td>
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
                    <td>{formatUSD(payment.amountCents)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardBody>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Account settings</CardTitle>
          </CardHeader>
          <CardBody>
            <p className="text-sm text-white/55">Manage your profile, contact details and photo.</p>
            <ButtonLink href="/profile" variant="outline" size="sm" className="mt-5 w-full">
              <Settings className="h-4 w-4" /> Open settings
            </ButtonLink>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Refer a friend</CardTitle>
          </CardHeader>
          <CardBody>
            <p className="text-xs text-white/45">Your demo referral code</p>
            <p className="mt-2 rounded-lg border border-lime/25 bg-lime/10 px-3 py-2 font-mono text-sm font-bold text-lime">
              {referralCode}
            </p>
            <div className="mt-4 flex gap-2">
              <Input
                value={redeemCode}
                onChange={(event) => setRedeemCode(event.target.value)}
                placeholder="Redeem a code"
                aria-label="Referral code"
              />
              <Button
                size="sm"
                variant="outline"
                disabled={busy === "redeem"}
                onClick={() => run(() => redeemReferralAction(redeemCode), "redeem")}
              >
                Redeem
              </Button>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Leave feedback</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-lime" />
              <Select
                value={rating}
                onChange={(event) => setRating(Number(event.target.value))}
                className="w-24"
              >
                {[5, 4, 3, 2, 1].map((value) => (
                  <option key={value} value={value}>
                    {value} ★
                  </option>
                ))}
              </Select>
            </div>
            <Textarea
              className="mt-3"
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder="Tell us what is working…"
            />
            <Button
              size="sm"
              className="mt-3 w-full"
              disabled={busy === "feedback"}
              onClick={() => run(() => submitFeedbackAction({ rating, comment }), "feedback")}
            >
              Submit feedback
            </Button>
          </CardBody>
        </Card>
      </div>

      <p className="text-center text-xs text-white/25">
        <Link href="/membership" className="hover:text-lime">
          Membership
        </Link>{" "}
        ·{" "}
        <Link href="/book" className="hover:text-lime">
          Booking
        </Link>{" "}
        · All figures are demonstration data.
      </p>
    </div>
  );
}
