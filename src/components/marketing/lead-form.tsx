"use client";

import { useState } from "react";
import { ArrowUpRight, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { createLeadAction } from "@/app/actions";

export function LeadForm() {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage(null);
    const form = new FormData(event.currentTarget);
    const result = await createLeadAction({
      name: String(form.get("name") ?? ""),
      email: String(form.get("email") ?? ""),
      interest: String(form.get("interest") ?? ""),
      message: String(form.get("message") ?? ""),
    });
    setMessage({ ok: result.ok, text: result.message ?? result.error ?? "Something went wrong." });
    setPending(false);
    if (result.ok) event.currentTarget.reset();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-white/10 bg-ink-850 p-6 md:p-8"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name">
          <Input name="name" required placeholder="Your name" />
        </Field>
        <Field label="Email">
          <Input name="email" type="email" required placeholder="you@example.com" />
        </Field>
      </div>
      <div className="mt-4">
        <Field label="I'm interested in">
          <Select name="interest" defaultValue="Monthly Membership">
            <option>Monthly Membership</option>
            <option>Annual Membership</option>
            <option>Personal Training</option>
            <option>Group Classes</option>
            <option>Corporate Wellness</option>
          </Select>
        </Field>
      </div>
      <div className="mt-4">
        <Field label="Message" hint="Optional — tell us about your goals.">
          <Textarea name="message" placeholder="I want to train three evenings a week…" />
        </Field>
      </div>
      <Button type="submit" disabled={pending} className="mt-6 w-full">
        {pending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            Request a callback <ArrowUpRight className="h-4 w-4" />
          </>
        )}
      </Button>
      {message ? (
        <p
          className={`mt-4 flex items-start gap-2 text-sm ${message.ok ? "text-lime" : "text-red-300"}`}
        >
          {message.ok ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> : null}
          {message.text}
        </p>
      ) : (
        <p className="mt-4 text-xs text-white/35">
          Demo lead capture — stored locally as sample data, not emailed.
        </p>
      )}
    </form>
  );
}
