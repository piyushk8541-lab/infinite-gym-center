import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getStore } from "@/lib/demo/store";
import { addDaysISO, todayISO } from "@/lib/format";
import { BookingBoard } from "@/components/booking/booking-board";
import { Badge } from "@/components/ui/badge";
import type { SessionCategory } from "@/types";

export const metadata: Metadata = { title: "Smart Session Booking" };

export default async function BookPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date } = await searchParams;
  const store = getStore();
  const user = await getCurrentUser();
  const today = todayISO();
  const maxDate = addDaysISO(today, 13);
  const selectedDate = date && date >= today && date <= maxDate ? date : today;
  const slots = store.listSlots(selectedDate);
  const membership = user ? store.getActiveMembership(user.id) : null;
  const categories = Array.from(
    new Set(store.sessions.map((session) => session.category)),
  ) as SessionCategory[];

  return (
    <>
      <section className="relative overflow-hidden border-b border-white/10 bg-ink-900 py-16 md:py-20">
        <div className="bg-grid absolute inset-0 opacity-30" />
        <div className="igc-container relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="flex flex-wrap gap-2">
              <Badge tone="lime">Live capacity</Badge>
              <Badge tone="amber">Demo schedule</Badge>
            </div>
            <h1 className="igc-display mt-6 text-4xl text-white sm:text-5xl md:text-6xl">
              BOOK SMARTER. <span className="text-lime">TRAIN HARDER</span>.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/55">
              Pick a date, filter a category and watch remaining capacity update after every
              confirmed booking. Paid sessions use a clearly labelled simulated payment in demo
              mode.
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-ink-850 px-5 py-4">
            <ShieldCheck className="h-6 w-6 text-lime" />
            <div>
              <p className="text-sm font-bold text-white">No overbooking</p>
              <p className="text-xs text-white/45">Transactional validation + idempotency</p>
            </div>
          </div>
        </div>
      </section>

      <section className="igc-section bg-ink-950">
        <div className="igc-container">
          <BookingBoard
            initialSlots={slots}
            categories={categories}
            selectedDate={selectedDate}
            today={today}
            maxDate={maxDate}
            signedIn={Boolean(user)}
            hasMembership={Boolean(membership)}
          />
        </div>
      </section>
    </>
  );
}
