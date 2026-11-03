import type { Metadata } from "next";
import { Check, Info } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getStore } from "@/lib/demo/store";
import { PlanCard } from "@/components/membership/plan-card";
import { SectionHeading } from "@/components/ui/section-heading";
import { ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Membership" };

export default async function MembershipPage() {
  const store = getStore();
  const user = await getCurrentUser();
  const active = user ? store.getActiveMembership(user.id) : null;
  const plans = store.plans.filter((plan) => plan.active);

  return (
    <>
      <section className="relative overflow-hidden border-b border-white/10 bg-ink-900 py-20 md:py-28">
        <div className="bg-grid absolute inset-0 opacity-30" />
        <div className="igc-container relative">
          <div className="flex flex-wrap items-center gap-3">
            <Badge tone="amber">Demonstration pricing</Badge>
            <Badge tone="blue">USD · en-US</Badge>
          </div>
          <h1 className="igc-display mt-7 max-w-4xl text-4xl text-white sm:text-5xl md:text-6xl">
            MEMBERSHIP THAT <span className="text-lime">MOVES WITH YOU</span>.
          </h1>
          <p className="mt-7 max-w-2xl text-base leading-relaxed text-white/55 md:text-lg">
            Six configurable plans, one connected account. Every price and benefit below is sample
            data and is editable live from the admin control center pending owner approval.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/book">Book a session</ButtonLink>
            <ButtonLink href="/login" variant="outline">
              Member sign in
            </ButtonLink>
          </div>
        </div>
      </section>

      <section className="igc-section bg-ink-950">
        <div className="igc-container">
          <div className="mb-10 flex flex-col gap-4 rounded-2xl border border-amber-400/20 bg-amber-400/[0.06] p-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-3">
              <Info className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />
              <p className="text-sm text-amber-100/80">
                <strong className="text-amber-200">Sample pricing.</strong> These figures are
                demonstration data only. The business owner can edit every plan, price, duration and
                benefit from the admin dashboard before launch.
              </p>
            </div>
            <Badge tone="amber">Awaiting owner approval</Badge>
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                signedIn={Boolean(user)}
                active={active?.planId === plan.id}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="igc-section border-t border-white/10 bg-ink-900">
        <div className="igc-container grid gap-10 lg:grid-cols-2">
          <SectionHeading
            eyebrow="Included with every plan"
            title={
              <>
                NO HIDDEN <span className="text-lime">ASTERISKS</span>.
              </>
            }
            description="Access permissions and booking eligibility are explicit on every plan. Upgrade suggestions appear automatically in the member dashboard."
          />
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              "Smart capacity booking",
              "Digital membership card",
              "Booking + payment history",
              "Email + in-app notifications",
              "Referral and promo support",
              "Admin-managed pricing",
              "USD receipts and records",
              "Role-based secure access",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-ink-850 px-4 py-4 text-sm text-white/70"
              >
                <Check className="h-4 w-4 text-lime" /> {item}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
