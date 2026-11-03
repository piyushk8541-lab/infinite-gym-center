import { Hero } from "@/components/marketing/hero";
import { Benefits } from "@/components/marketing/benefits";
import { Programs } from "@/components/marketing/programs";
import { Facilities } from "@/components/marketing/facilities";
import { Trainers } from "@/components/marketing/trainers";
import { Testimonials } from "@/components/marketing/testimonials";
import { Faq } from "@/components/marketing/faq";
import { ContactCta } from "@/components/marketing/contact-cta";
import { CtaBand } from "@/components/marketing/cta-band";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Benefits />
      <Programs />
      <Facilities />
      <Trainers />
      <Testimonials />
      <CtaBand />
      <Faq />
      <ContactCta />
    </>
  );
}
