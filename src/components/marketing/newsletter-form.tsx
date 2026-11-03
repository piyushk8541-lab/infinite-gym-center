"use client";

import { useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { subscribeNewsletterAction } from "@/app/actions";

export function NewsletterForm() {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    const form = new FormData(event.currentTarget);
    const result = await subscribeNewsletterAction(String(form.get("email") ?? ""));
    setMessage(result.message ?? result.error ?? "Done.");
    setPending(false);
    if (result.ok) event.currentTarget.reset();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
      <Input
        name="email"
        type="email"
        required
        placeholder="you@example.com"
        aria-label="Email address"
        className="sm:flex-1"
      />
      <Button type="submit" disabled={pending}>
        {pending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            Subscribe <ArrowRight className="h-4 w-4" />
          </>
        )}
      </Button>
      {message ? (
        <p className="sr-only" role="status">
          {message}
        </p>
      ) : null}
    </form>
  );
}
