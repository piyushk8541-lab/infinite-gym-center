import Image from "next/image";
import { Check, Dumbbell, HeartPulse, MoveUpRight, Waves } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { ButtonLink } from "@/components/ui/button";

const features = [
  { icon: Dumbbell, label: "Olympic lifting platforms" },
  { icon: HeartPulse, label: "Cardio deck & engineered zones" },
  { icon: Waves, label: "Recovery + mobility studio" },
  { icon: MoveUpRight, label: "Performance turf track" },
];

const equipment = [
  "Free weights to 150 lb",
  "Selectorized strength",
  "Sleds & rigs",
  "Assault bikes",
  "Rowers & ski ergs",
  "Smart capacity sensors",
];

export function Facilities() {
  return (
    <section id="facilities" className="igc-section bg-ink-950">
      <div className="igc-container grid items-center gap-14 lg:grid-cols-2">
        <div className="relative">
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-white/10">
            <Image
              src="/images/strength-zone.png"
              alt="Premium strength training zone"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-ink-950/70 via-transparent to-transparent" />
          </div>
          <div className="absolute -bottom-6 -right-4 hidden rounded-2xl border border-lime/25 bg-ink-900 p-5 shadow-glow sm:block">
            <p className="font-display text-3xl font-black text-lime">24/7</p>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white/45">
              Member access windows
            </p>
          </div>
        </div>
        <div>
          <SectionHeading
            eyebrow="03 / Facilities"
            title={
              <>
                EVERY SQUARE FOOT <span className="text-lime">EARNED</span>.
              </>
            }
            description="A deliberately designed training environment. No clutter, no waiting for equipment, no compromises on the details that matter."
          />
          <div className="mt-10 grid gap-3 sm:grid-cols-2">
            {features.map((feature) => (
              <div
                key={feature.label}
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-ink-850 px-4 py-4"
              >
                <feature.icon className="h-5 w-5 text-lime" />
                <span className="text-sm font-medium text-white/75">{feature.label}</span>
              </div>
            ))}
          </div>
          <ul className="mt-8 grid grid-cols-2 gap-3">
            {equipment.map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm text-white/50">
                <Check className="h-4 w-4 text-electric-soft" /> {item}
              </li>
            ))}
          </ul>
          <ButtonLink href="/membership" className="mt-10">
            Explore membership
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
