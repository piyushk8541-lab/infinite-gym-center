import Image from "next/image";
import { ArrowUpRight, BadgeCheck, Star } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const coaches = [
  { name: "Sam Rivera", role: "Head Strength Coach", focus: "Strength & conditioning" },
  { name: "Dana Brooks", role: "Group Fitness Lead", focus: "HIIT & conditioning" },
  { name: "Marcus Chen", role: "Performance Coach", focus: "Athletic performance" },
];

export function Trainers() {
  return (
    <section id="trainers" className="igc-section border-y border-white/10 bg-ink-900">
      <div className="igc-container">
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <div>
            <SectionHeading
              eyebrow="04 / Personal training"
              title={
                <>
                  COACHING THAT <span className="text-electric-soft">COMPOUNDS</span>.
                </>
              }
              description="One-on-one programming, honest feedback and a plan that evolves with you. Every personal training session is booked through the same smart capacity engine."
            />
            <div className="mt-10 space-y-4">
              {coaches.map((coach) => (
                <div
                  key={coach.name}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-ink-850 px-5 py-4"
                >
                  <div className="flex items-center gap-4">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-xs font-bold text-lime">
                      {coach.name
                        .split(" ")
                        .map((part) => part[0])
                        .join("")}
                    </span>
                    <div>
                      <p className="text-sm font-bold text-white">{coach.name}</p>
                      <p className="text-xs text-white/45">
                        {coach.role} · {coach.focus}
                      </p>
                    </div>
                  </div>
                  <BadgeCheck className="h-5 w-5 text-lime" />
                </div>
              ))}
            </div>
            <ButtonLink href="/book" variant="outline" className="mt-10">
              Book a trainer <ArrowUpRight className="h-4 w-4" />
            </ButtonLink>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-white/10">
            <Image
              src="/images/personal-training.png"
              alt="Personal trainer coaching a member"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-950/80 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between rounded-2xl border border-white/10 bg-ink-950/80 p-5 backdrop-blur">
              <div>
                <div className="flex gap-1 text-lime">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-current" />
                  ))}
                </div>
                <p className="mt-2 text-sm font-semibold text-white">4.9 average demo rating</p>
              </div>
              <Badge tone="amber">Demo content</Badge>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
