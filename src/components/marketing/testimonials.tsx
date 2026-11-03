import { Quote, Star } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { Badge } from "@/components/ui/badge";

const testimonials = [
  {
    name: "Taylor R.",
    role: "Monthly member",
    quote:
      "I can see exactly how many spots are left before I leave work. It completely changed how often I train.",
  },
  {
    name: "Chris P.",
    role: "Personal training client",
    quote:
      "The coaching is precise and the booking flow is effortless. Everything from scheduling to receipts is in one place.",
  },
  {
    name: "Jamie L.",
    role: "Annual member",
    quote:
      "It feels like a technology company built a gym. Dark, fast and genuinely premium without being complicated.",
  },
];

export function Testimonials() {
  return (
    <section className="igc-section bg-ink-950">
      <div className="igc-container">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading
            eyebrow="05 / Member stories"
            title={
              <>
                DEMO <span className="text-lime">TESTIMONIALS</span>.
              </>
            }
            description="The quotes below are clearly marked demonstration content. Replace with verified customer reviews before launch."
          />
          <Badge tone="amber">Demo content · not real reviews</Badge>
        </div>
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {testimonials.map((item) => (
            <figure
              key={item.name}
              className="relative flex h-full flex-col rounded-2xl border border-white/10 bg-ink-850 p-7"
            >
              <Quote className="h-7 w-7 text-lime/60" />
              <div className="mt-5 flex gap-1 text-lime">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-current" />
                ))}
              </div>
              <blockquote className="mt-5 flex-1 text-sm leading-relaxed text-white/70">
                “{item.quote}”
              </blockquote>
              <figcaption className="mt-7 border-t border-white/10 pt-5">
                <p className="text-sm font-bold text-white">{item.name}</p>
                <p className="text-xs text-white/40">{item.role}</p>
              </figcaption>
              <span className="absolute right-5 top-5 rounded-full border border-amber-400/20 bg-amber-400/10 px-2 py-1 text-[9px] font-bold uppercase tracking-widest text-amber-300">
                Demo
              </span>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
