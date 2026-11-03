import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ compact = false, className }: { compact?: boolean; className?: string }) {
  return (
    <Link
      href="/"
      className={cn("group inline-flex items-center gap-3", className)}
      aria-label="INFINITE GYM CENTER home"
    >
      <span className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-lime/40 bg-lime/10">
        <span className="absolute h-4 w-4 rounded-full border-2 border-lime" />
        <span className="absolute h-1.5 w-1.5 rounded-full bg-electric" />
      </span>
      <span className="leading-none">
        <span className="block font-display text-[15px] font-black uppercase tracking-[0.14em] text-white">
          Infinite
        </span>
        {!compact ? (
          <span className="mt-1 block text-[9px] font-bold uppercase tracking-[0.32em] text-lime">
            Gym Center
          </span>
        ) : null}
      </span>
    </Link>
  );
}
