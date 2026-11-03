import { ArrowUpRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";

export function CtaBand() {
  return (
    <section className="relative overflow-hidden border-y border-lime/20 bg-lime">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(47,107,255,0.35),transparent_45%)]" />
      <div className="igc-container relative flex flex-col items-start justify-between gap-8 py-14 md:flex-row md:items-center">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-ink-950/60">
            No limits. No waiting.
          </p>
          <h2 className="igc-display mt-3 text-3xl text-ink-950 md:text-5xl">GO INFINITE TODAY.</h2>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <ButtonLink href="/book" variant="secondary" size="lg">
            Book your session <ArrowUpRight className="h-4 w-4" />
          </ButtonLink>
          <ButtonLink
            href="/membership"
            variant="outline"
            size="lg"
            className="border-ink-950/25 bg-ink-950 text-white hover:border-ink-950 hover:bg-ink-800"
          >
            Become a member
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
