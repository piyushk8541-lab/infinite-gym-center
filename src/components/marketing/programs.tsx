import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";

const programs = [
  {
    title: "Strength & Power",
    category: "General Gym Access",
    image: "/images/strength-zone.png",
    body: "Olympic platforms, free weights and a full strength floor engineered for progressive overload.",
  },
  {
    title: "Sunrise Strength",
    category: "Morning Sessions",
    image: "/images/hero-gym.png",
    body: "Coach-led early blocks that build momentum before the rest of the city wakes up.",
  },
  {
    title: "Midday Performance",
    category: "Afternoon Sessions",
    image: "/images/group-class.png",
    body: "Efficient conditioning sessions designed to fit inside a demanding workday.",
  },
  {
    title: "Peak Hour",
    category: "Evening Sessions",
    image: "/images/strength-zone.png",
    body: "Our flagship after-work floor session with full coaching coverage and live capacity.",
  },
  {
    title: "Infinite HIIT",
    category: "Group Fitness Classes",
    image: "/images/group-class.png",
    body: "High-energy intervals, scalable intensity and a room that pushes everyone forward.",
  },
  {
    title: "Athlete Lab",
    category: "Special Training Programs",
    image: "/images/personal-training.png",
    body: "Small-group specialty programming for speed, power and resilient athletic performance.",
  },
];

export function Programs() {
  return (
    <section id="programs" className="igc-section border-y border-white/10 bg-ink-900">
      <div className="igc-container">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            eyebrow="02 / Programs"
            title={
              <>
                A SESSION FOR <span className="text-electric-soft">EVERY GOAL</span>.
              </>
            }
            description="Seven booking categories, one intelligent schedule. Choose the format that matches your training day."
          />
          <ButtonLink href="/book" variant="outline" className="shrink-0">
            View live schedule <ArrowUpRight className="h-4 w-4" />
          </ButtonLink>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {programs.map((program) => (
            <article
              key={program.title}
              className="group overflow-hidden rounded-2xl border border-white/10 bg-ink-850 transition hover:border-white/20"
            >
              <div className="relative h-52 overflow-hidden">
                <Image
                  src={program.image}
                  alt={program.title}
                  fill
                  className="object-cover transition duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/20 to-transparent" />
                <Badge tone="blue" className="absolute left-4 top-4">
                  {program.category}
                </Badge>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-white">{program.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/50">{program.body}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
