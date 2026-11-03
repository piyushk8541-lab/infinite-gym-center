"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowUpRight, Check, CreditCard, Loader2 } from "lucide-react";
import { Badge, DemoBadge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { formatUSD } from "@/lib/format";
import { initiateStripeCheckoutAction, purchasePlanAction } from "@/app/actions";
import { cn } from "@/lib/utils";
import type { MembershipPlan } from "@/types";

function makeKey() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `key_${Date.now()}_${Math.random()}`;
}

export function PlanCard({
  plan,
  signedIn,
  active,
}: {
  plan: MembershipPlan;
  signedIn: boolean;
  active: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [stripePending, setStripePending] = useState(false);
  const [simulateFailure, setSimulateFailure] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  async function handlePurchase() {
    setPending(true);
    setMessage(null);
    const result = await purchasePlanAction(plan.id, makeKey(), simulateFailure);
    setMessage({ ok: result.ok, text: result.message ?? result.error ?? "Unexpected response." });
    setPending(false);
    if (result.ok) router.refresh();
  }

  async function handleStripe() {
    setStripePending(true);
    setMessage(null);
    const result = await initiateStripeCheckoutAction("membership", plan.id);
    if (result.ok && result.data?.url) {
      window.location.href = result.data.url;
      return;
    }
    setMessage({ ok: false, text: result.error ?? "Stripe checkout unavailable." });
    setStripePending(false);
  }

  return (
    <article
      className={cn(
        "relative flex h-full flex-col rounded-2xl border p-7 transition duration-300 hover:-translate-y-1",
        plan.featured
          ? "border-lime/40 bg-gradient-to-b from-lime/[0.09] to-ink-850 shadow-glow"
          : "border-white/10 bg-ink-850 hover:border-white/20",
      )}
    >
      {plan.featured ? (
        <span className="absolute -top-3 left-7 rounded-full bg-lime px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-ink-950">
          Most popular
        </span>
      ) : null}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-xl font-bold text-white">{plan.name}</h3>
          <p className="mt-1 text-sm text-white/45">{plan.tagline}</p>
        </div>
        <DemoBadge />
      </div>

      <div className="mt-7 flex items-end gap-2">
        <span className="igc-display text-4xl text-white">{formatUSD(plan.priceCents)}</span>
        <span className="mb-1 text-xs font-semibold uppercase tracking-widest text-white/35">
          /{" "}
          {plan.durationDays === 1
            ? "day"
            : plan.durationDays === 365
              ? "year"
              : `${plan.durationDays} days`}
        </span>
      </div>

      <ul className="mt-7 flex-1 space-y-3">
        {plan.benefits.map((benefit) => (
          <li key={benefit} className="flex items-start gap-2.5 text-sm text-white/65">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-lime" /> {benefit}
          </li>
        ))}
      </ul>

      <div className="mt-6 grid gap-2 rounded-xl border border-white/10 bg-ink-900/60 p-4 text-xs text-white/50">
        <div className="flex justify-between gap-3">
          <span className="text-white/35">Access</span>
          <span className="text-right text-white/70">{plan.accessLevel}</span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-white/35">Booking</span>
          <span className="text-right text-white/70">{plan.bookingEligibility}</span>
        </div>
      </div>

      {active ? (
        <Badge tone="lime" className="mt-5 w-fit">
          Your current plan
        </Badge>
      ) : null}

      <div className="mt-6 space-y-3">
        {signedIn ? (
          <>
            <Button type="button" onClick={handlePurchase} disabled={pending} className="w-full">
              {pending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Demo purchase <ArrowUpRight className="h-4 w-4" />
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleStripe}
              disabled={stripePending}
              className="w-full"
            >
              {stripePending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <CreditCard className="h-4 w-4" /> Pay with Stripe (test)
                </>
              )}
            </Button>
            <label className="flex items-center gap-2 text-xs text-white/40">
              <input
                type="checkbox"
                checked={simulateFailure}
                onChange={(event) => setSimulateFailure(event.target.checked)}
                className="accent-lime"
              />
              Simulate a failed demo payment
            </label>
          </>
        ) : (
          <ButtonLink href="/login?next=/membership" className="w-full">
            Sign in to purchase
          </ButtonLink>
        )}
        {message ? (
          <p
            className={cn("text-xs leading-relaxed", message.ok ? "text-lime" : "text-red-300")}
            role="status"
          >
            {message.text}
          </p>
        ) : (
          <p className="text-[11px] leading-relaxed text-white/30">
            Demonstration pricing only. No real charge is made without Stripe test credentials.
          </p>
        )}
      </div>
    </article>
  );
}
