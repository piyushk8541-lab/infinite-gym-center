import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Tone = "lime" | "blue" | "neutral" | "amber" | "red" | "outline";

const tones: Record<Tone, string> = {
  lime: "bg-lime/15 text-lime border-lime/25",
  blue: "bg-electric/15 text-electric-soft border-electric/25",
  neutral: "bg-white/5 text-white/65 border-white/10",
  amber: "bg-amber-400/10 text-amber-300 border-amber-400/20",
  red: "bg-red-500/10 text-red-300 border-red-500/20",
  outline: "bg-transparent text-white/60 border-white/15",
};

export function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em]",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function DemoBadge({ className }: { className?: string }) {
  return (
    <Badge tone="amber" className={className}>
      Demo data
    </Badge>
  );
}
