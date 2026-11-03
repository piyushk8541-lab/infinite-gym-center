import Image from "next/image";
import { ArrowDownRight, ArrowUpRight, Activity, Clock3, ShieldCheck, Users } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";

const stats = [
  { icon: Clock3, value: "05:00–23:00", label: "Club hours" },
  { icon: Activity, value: "30+", label: "Weekly sessions" },
  { icon: Users, value: "Certified", label: "Coaching team" },
  { icon: ShieldCheck, value: "Live", label: "Capacity tracking" },
];

export function Hero() {
  return (
    <section className="relative isolate flex min-h-[calc(100vh-105px)] items-center overflow-hidden border-b border-white/10">
      <Image
        src="/images/hero-gym.png"
        alt="Dark premium gym interior with electric blue and lime lighting"
        fill
        priority
        className="object-cover object-center"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-ink-950 via-ink-950/85 to-ink-950/25" />
      <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-transparent to-ink-950/40" />
      <div className="bg-grid absolute inset-0 opacity-40" />

      <div className="igc-container relative z-10 py-20 md:py-28">
        <div className="max-w-4xl animate-fade-up">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-lime/25 bg-lime/10 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.24em] text-lime">
            <span className="h-1.5 w-1.5 rounded-full bg-lime" /> Premium American fitness club ·
            Austin, TX (demo)
          </div>
          <h1 className="igc-display text-[clamp(2.8rem,7vw,6.6rem)] text-white">
            Train smarter.
            <br />
            Get stronger.
            <br />
            <span className="text-gradient">Go infinite.</span>
          </h1>
          <p className="mt-8 max-w-2xl text-base leading-relaxed text-white/65 md:text-lg">
            Elite equipment, coach-led programming and intelligent capacity management in one
            connected membership. Reserve your slot in seconds, train without the wait, and track
            every step of your progress.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
            <ButtonLink href="/book" size="lg">
              Book your session <ArrowUpRight className="h-4 w-4" />
            </ButtonLink>
            <ButtonLink href="/membership" variant="outline" size="lg">
              Become a member <ArrowDownRight className="h-4 w-4" />
            </ButtonLink>
          </div>
          <p className="mt-5 text-xs text-white/35">
            No real payments are processed in this demonstration environment.
          </p>
        </div>
      </div>

      <div className="relative z-10 w-full border-t border-white/10 bg-ink-950/70 backdrop-blur-md">
        <div className="igc-container grid grid-cols-2 gap-px bg-white/5 md:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex items-center gap-3 bg-ink-950/60 px-4 py-5 md:px-6"
            >
              <stat.icon className="h-5 w-5 shrink-0 text-lime" />
              <div>
                <p className="text-sm font-bold text-white">{stat.value}</p>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/40">
                  {stat.label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
