"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  Loader2,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Badge, DemoBadge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Select } from "@/components/ui/input";
import { formatShortDate, formatUSD } from "@/lib/format";
import { createBookingAction, initiateStripeCheckoutAction } from "@/app/actions";
import { cn } from "@/lib/utils";
import type { SessionCategory, SlotView } from "@/types";

function makeKey() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `key_${Date.now()}_${Math.random()}`;
}

interface Props {
  initialSlots: SlotView[];
  categories: SessionCategory[];
  selectedDate: string;
  today: string;
  maxDate: string;
  signedIn: boolean;
  hasMembership: boolean;
}

export function BookingBoard({
  initialSlots,
  categories,
  selectedDate,
  today,
  maxDate,
  signedIn,
  hasMembership,
}: Props) {
  const router = useRouter();
  const [slots, setSlots] = useState(initialSlots);
  const [date, setDate] = useState(selectedDate);
  const [category, setCategory] = useState<SessionCategory | "All">("All");
  const [selected, setSelected] = useState<SlotView | null>(null);
  const [pending, setPending] = useState(false);
  const [simulateFailure, setSimulateFailure] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [lastKey, setLastKey] = useState<string | null>(null);

  useEffect(() => setSlots(initialSlots), [initialSlots]);
  useEffect(() => setDate(selectedDate), [selectedDate]);

  const filtered = useMemo(
    () => (category === "All" ? slots : slots.filter((slot) => slot.session.category === category)),
    [slots, category],
  );

  function changeDate(value: string) {
    setDate(value);
    setSelected(null);
    setMessage(null);
    router.push(`/book?date=${value}`);
    router.refresh();
  }

  async function confirmBooking(idempotencyKey: string) {
    if (!selected) return;
    setPending(true);
    setMessage(null);
    const result = await createBookingAction({
      slotId: selected.id,
      idempotencyKey,
      simulatePaymentFailure: simulateFailure,
    });
    setMessage({ ok: result.ok, text: result.message ?? result.error ?? "Unexpected response." });
    setLastKey(idempotencyKey);
    setPending(false);
    if (result.ok) router.refresh();
  }

  async function startStripe() {
    if (!selected) return;
    setPending(true);
    const result = await initiateStripeCheckoutAction("booking", selected.id);
    if (result.ok && result.data?.url) {
      window.location.href = result.data.url;
      return;
    }
    setMessage({ ok: false, text: result.error ?? "Stripe checkout unavailable." });
    setPending(false);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
      <div>
        <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-ink-850 p-5 sm:flex-row sm:items-end">
          <label className="flex-1">
            <span className="igc-label">Select date</span>
            <input
              type="date"
              value={date}
              min={today}
              max={maxDate}
              onChange={(event) => changeDate(event.target.value)}
              className="igc-input"
              aria-label="Session date"
            />
          </label>
          <label className="flex-1">
            <span className="igc-label">Category</span>
            <Select
              value={category}
              onChange={(event) => setCategory(event.target.value as SessionCategory | "All")}
            >
              <option value="All">All categories</option>
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </Select>
          </label>
          <div className="flex items-center gap-2 pb-3 text-xs text-white/40">
            <CalendarDays className="h-4 w-4 text-lime" /> {formatShortDate(date)}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-white/15 bg-ink-900 p-12 text-center">
            <CalendarDays className="mx-auto h-8 w-8 text-white/25" />
            <p className="mt-4 text-sm font-semibold text-white">No sessions match this filter.</p>
            <p className="mt-2 text-sm text-white/40">
              Try another date or category. Blocked dates are hidden automatically.
            </p>
          </div>
        ) : (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {filtered.map((slot) => {
              const percent = Math.min(100, Math.round((slot.booked / slot.capacity) * 100));
              return (
                <article
                  key={slot.id}
                  className={cn(
                    "rounded-2xl border bg-ink-850 p-5 transition",
                    slot.isFull
                      ? "border-red-500/20 opacity-70"
                      : "border-white/10 hover:border-lime/30",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Badge tone={slot.isFull ? "red" : "blue"}>{slot.session.category}</Badge>
                      <h3 className="mt-3 text-base font-bold text-white">{slot.session.title}</h3>
                    </div>
                    <span className="text-right text-xs font-semibold text-white/45">
                      {slot.session.priceCents > 0
                        ? formatUSD(slot.session.priceCents)
                        : "Included"}
                    </span>
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-sm text-white/60">
                    <Clock3 className="h-4 w-4 text-lime" /> {slot.startTime} – {slot.endTime}
                    <span className="text-white/20">·</span>
                    <Users className="h-4 w-4 text-electric-soft" /> cap {slot.capacity}
                  </div>
                  <div className="mt-4">
                    <div className="mb-2 flex items-center justify-between text-xs">
                      <span
                        className={slot.isFull ? "font-bold text-red-300" : "font-bold text-lime"}
                      >
                        {slot.isFull
                          ? "FULL — BOOKING DISABLED"
                          : `${slot.remaining} SPOTS AVAILABLE`}
                      </span>
                      <span className="text-white/35">
                        {slot.booked}/{slot.capacity} booked
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all",
                          slot.isFull ? "bg-red-400" : "bg-lime",
                        )}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                  <div className="mt-5">
                    {!signedIn ? (
                      <ButtonLink
                        href="/login?next=/book"
                        variant="outline"
                        size="sm"
                        className="w-full"
                      >
                        Sign in to reserve
                      </ButtonLink>
                    ) : !hasMembership ? (
                      <ButtonLink href="/membership" variant="outline" size="sm" className="w-full">
                        Choose a membership
                      </ButtonLink>
                    ) : (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="w-full"
                        disabled={slot.isFull}
                        onClick={() => {
                          setSelected(slot);
                          setMessage(null);
                          setLastKey(null);
                        }}
                      >
                        {slot.isFull ? (
                          "Session full"
                        ) : (
                          <>
                            Select slot <ArrowRight className="h-4 w-4" />
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-2xl border border-white/10 bg-ink-850 p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Booking summary</h3>
            <DemoBadge />
          </div>
          {selected ? (
            <div className="mt-6 space-y-4">
              <div className="rounded-xl border border-lime/20 bg-lime/[0.06] p-4">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-lime">
                  {selected.session.category}
                </p>
                <p className="mt-2 text-base font-bold text-white">{selected.session.title}</p>
                <p className="mt-1 text-sm text-white/50">
                  {formatShortDate(selected.date)} · {selected.startTime}–{selected.endTime}
                </p>
                <p className="mt-3 text-sm font-semibold text-white">
                  {selected.session.priceCents > 0
                    ? formatUSD(selected.session.priceCents)
                    : "Included with membership"}
                </p>
              </div>
              <p className="flex items-start gap-2 text-xs leading-relaxed text-white/45">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-lime" />
                Server-side capacity re-check, duplicate-booking protection and idempotency keys run
                on every confirmation.
              </p>
              {selected.session.priceCents > 0 ? (
                <label className="flex items-center gap-2 text-xs text-white/45">
                  <input
                    type="checkbox"
                    checked={simulateFailure}
                    onChange={(event) => setSimulateFailure(event.target.checked)}
                    className="accent-lime"
                  />
                  Simulate a failed demo payment
                </label>
              ) : null}
              <Button
                type="button"
                className="w-full"
                disabled={pending}
                onClick={() => confirmBooking(makeKey())}
              >
                {pending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" /> Confirm demo booking
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={pending}
                onClick={startStripe}
              >
                <CreditCard className="h-4 w-4" /> Pay with Stripe (test)
              </Button>
              {lastKey && message?.ok ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  disabled={pending}
                  onClick={() => confirmBooking(lastKey)}
                >
                  Resubmit same request (idempotency test)
                </Button>
              ) : null}
              {message ? (
                <p
                  className={cn(
                    "text-xs leading-relaxed",
                    message.ok ? "text-lime" : "text-red-300",
                  )}
                  role="status"
                >
                  {message.text}
                </p>
              ) : null}
            </div>
          ) : (
            <div className="mt-6 rounded-xl border border-dashed border-white/15 p-8 text-center">
              <CalendarDays className="mx-auto h-7 w-7 text-white/25" />
              <p className="mt-4 text-sm font-semibold text-white">No slot selected</p>
              <p className="mt-2 text-xs leading-relaxed text-white/40">
                Choose an available time slot to see the confirmation details.
              </p>
            </div>
          )}
        </div>
        <div className="mt-4 rounded-2xl border border-electric/20 bg-electric/[0.06] p-5">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-electric-soft">
            Capacity example
          </p>
          <p className="mt-3 text-sm leading-relaxed text-white/55">
            Today&apos;s Peak Hour Training is seeded with{" "}
            <strong className="text-white">24 of 30</strong> spots taken, so the card displays{" "}
            <strong className="text-lime">6 SPOTS AVAILABLE</strong>. When it reaches 30, booking is
            disabled automatically.
          </p>
        </div>
      </aside>
    </div>
  );
}
