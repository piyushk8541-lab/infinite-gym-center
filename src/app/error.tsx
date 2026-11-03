"use client";

import { Button } from "@/components/ui/button";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="igc-container flex min-h-[70vh] flex-col items-center justify-center text-center">
      <p className="igc-eyebrow">Something went wrong</p>
      <h1 className="igc-display mt-6 text-4xl text-white">WE HIT A TEMPORARY SETBACK.</h1>
      <p className="mt-5 max-w-lg text-white/55">
        Your data is safe. Try the action again or return to the dashboard.
      </p>
      <Button onClick={reset} className="mt-8">
        Try again
      </Button>
    </main>
  );
}
