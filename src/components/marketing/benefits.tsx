import { Activity, CalendarCheck, CreditCard, Gauge, Sparkles, Users } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";

const benefits = [
  {
    icon: Gauge,
    title: "Live capacity",
    body: "See exactly how many spots remain before you book. No surprises, no overcrowded floors.",
  },
  {
    icon: CalendarCheck,
    title: "Instant booking",
    body: "Reserve, reschedule or cancel eligible sessions from any device in under thirty seconds.",
  },
  {
    icon: CreditCard,
    title: "One membership",
    body: "Plans, renewals, receipts and payment history live in a single secure member profile.",
  },
  {
    icon: Activity,
    title: "Coach-led programs",
    body: "Strength, conditioning, HIIT and specialty tracks designed by certified coaches.",
  },
  {
    icon: Users,
    title: "Referral rewards",
    body: "Invite friends, share a code and grow the community while unlocking member perks.",
  },
  {
    icon: Sparkles,
    title: "Premium facilities",
    body: "Best-in-class equipment, recovery zones and an environment built for serious work.",
  },
];

export function Benefits() {
  return (
    <section id="experience" className="igc-section bg-ink-950">
      <div className="igc-container">
        <SectionHeading
          eyebrow="01 / The infinite advantage"
          title={
            <>
              BUILT AROUND <span className="text-lime">YOUR TIME</span>.
            </>
          }
          description="We removed the friction between deciding to train and actually showing up. Every part of the platform is engineered to convert intent into consistency."
        />
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((benefit, index) => (
            <div
              key={benefit.title}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-ink-850 p-7 transition duration-300 hover:-translate-y-1 hover:border-lime/30 hover:bg-ink-800"
            >
              <span className="absolute right-5 top-5 font-display text-4xl font-black text-white/[0.04]">
                0{index + 1}
              </span>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-lime/25 bg-lime/10 text-lime">
                <benefit.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-6 text-lg font-bold text-white">{benefit.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-white/50">{benefit.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
