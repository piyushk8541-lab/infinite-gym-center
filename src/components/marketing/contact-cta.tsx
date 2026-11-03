import { Mail, MapPin, Phone } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { LeadForm } from "./lead-form";
import { NewsletterForm } from "./newsletter-form";

export function ContactCta() {
  return (
    <section id="contact" className="igc-section bg-ink-950">
      <div className="igc-container">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <SectionHeading
              eyebrow="07 / Get started"
              title={
                <>
                  YOUR NEXT SESSION <span className="text-lime">STARTS HERE</span>.
                </>
              }
              description="Tell us what you are working toward. A membership advisor will follow up — in this demo, your request is saved as clearly labelled sample lead data."
            />
            <div className="mt-10 space-y-4">
              {[
                {
                  icon: MapPin,
                  label: "Visit",
                  value: "1200 Infinity Way, Suite 100, Austin, TX 78701 (demo)",
                },
                { icon: Phone, label: "Call", value: "+1 (512) 555-0100 (demo)" },
                { icon: Mail, label: "Email", value: "hello@infinitegym.demo" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-start gap-4 rounded-xl border border-white/10 bg-ink-850 px-5 py-4"
                >
                  <item.icon className="mt-0.5 h-5 w-5 text-lime" />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/40">
                      {item.label}
                    </p>
                    <p className="mt-1 text-sm text-white/75">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-10 rounded-2xl border border-electric/25 bg-electric/5 p-6">
              <p className="text-sm font-bold text-white">Infinite Dispatch</p>
              <p className="mt-2 text-sm text-white/50">
                Programming drops, offers and club news. Demo newsletter only.
              </p>
              <div className="mt-5">
                <NewsletterForm />
              </div>
            </div>
          </div>
          <LeadForm />
        </div>
      </div>
    </section>
  );
}
