"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { cn } from "@/lib/utils";

const faqs = [
  {
    q: "Is this a real gym or a demonstration?",
    a: "This is a clearly labelled demonstration environment for INFINITE GYM CENTER. Plans, prices, testimonials, customers, metrics and contact details are sample data pending business-owner approval.",
  },
  {
    q: "How does smart capacity work?",
    a: "Each time slot has a maximum capacity. The platform counts confirmed bookings and displays the remaining spots, for example '6 SPOTS AVAILABLE'. Once capacity is reached, the slot is automatically disabled.",
  },
  {
    q: "Can I double-book or be charged twice?",
    a: "No. Server-side validation blocks duplicate active bookings for the same member and slot, re-checks capacity inside the booking transaction, and uses idempotency keys so a repeated submission cannot create a second booking or payment.",
  },
  {
    q: "Are payments real?",
    a: "No. Stripe is integrated in test-mode architecture only. Without valid test credentials the app uses a clearly labelled simulated payment record and never claims a real charge occurred.",
  },
  {
    q: "Can I cancel or reschedule?",
    a: "Yes. Eligible confirmed bookings can be cancelled or moved to another available slot. Released capacity becomes available to other members immediately.",
  },
  {
    q: "What do I need to get started?",
    a: "Create a demo account, verify your email in one click, choose a demonstration membership, then book a session. Use the seeded demo accounts listed in the README for instant access.",
  },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="igc-section border-t border-white/10 bg-ink-900">
      <div className="igc-container grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
        <SectionHeading
          eyebrow="06 / FAQ"
          title={
            <>
              QUESTIONS, <span className="text-lime">ANSWERED</span>.
            </>
          }
          description="Everything a new member or business owner needs to know about the demonstration build."
        />
        <div className="divide-y divide-white/10 border-y border-white/10">
          {faqs.map((faq, index) => (
            <div key={faq.q}>
              <button
                type="button"
                onClick={() => setOpen(open === index ? null : index)}
                className="flex w-full items-center justify-between gap-6 py-5 text-left"
                aria-expanded={open === index}
              >
                <span className="text-sm font-semibold text-white md:text-base">{faq.q}</span>
                <ChevronDown
                  className={cn(
                    "h-5 w-5 shrink-0 text-lime transition-transform",
                    open === index && "rotate-180",
                  )}
                />
              </button>
              <div
                className={cn(
                  "grid transition-all duration-300",
                  open === index ? "grid-rows-[1fr] pb-6" : "grid-rows-[0fr]",
                )}
              >
                <div className="overflow-hidden">
                  <p className="max-w-2xl text-sm leading-relaxed text-white/55">{faq.a}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
