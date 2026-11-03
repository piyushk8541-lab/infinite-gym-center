import Link from "next/link";
import { ArrowUpRight, Instagram, Mail, MapPin, Phone } from "lucide-react";
import { Logo } from "@/components/ui/logo";

const columns = [
  {
    title: "Platform",
    links: [
      { label: "Smart Booking", href: "/book" },
      { label: "Membership", href: "/membership" },
      { label: "Customer Dashboard", href: "/dashboard" },
      { label: "Admin Control Center", href: "/admin" },
    ],
  },
  {
    title: "Explore",
    links: [
      { label: "Programs", href: "/#programs" },
      { label: "Facilities", href: "/#facilities" },
      { label: "Personal Training", href: "/#trainers" },
      { label: "FAQ", href: "/#faq" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/#experience" },
      { label: "Contact", href: "/#contact" },
      { label: "Privacy", href: "/#contact" },
      { label: "Terms", href: "/#contact" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-ink-900">
      <div className="igc-container py-16 md:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_2fr]">
          <div>
            <Logo />
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-white/50">
              A premium American fitness club experience powered by smart capacity management,
              membership intelligence and coaching that never stops.
            </p>
            <div className="mt-7 flex flex-col gap-2 text-sm text-white/55">
              <span className="inline-flex items-center gap-2">
                <MapPin className="h-4 w-4 text-lime" /> 1200 Infinity Way, Suite 100, Austin, TX
                78701 (demo)
              </span>
              <span className="inline-flex items-center gap-2">
                <Phone className="h-4 w-4 text-lime" /> +1 (512) 555-0100 (demo)
              </span>
              <span className="inline-flex items-center gap-2">
                <Mail className="h-4 w-4 text-lime" /> hello@infinitegym.demo
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {columns.map((column) => (
              <div key={column.title}>
                <p className="mb-5 text-[11px] font-bold uppercase tracking-[0.22em] text-white/40">
                  {column.title}
                </p>
                <ul className="space-y-3">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="inline-flex items-center gap-1 text-sm text-white/60 transition hover:text-lime"
                      >
                        {link.label}{" "}
                        <ArrowUpRight className="h-3 w-3 opacity-0 transition group-hover:opacity-100" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-white/10 pt-8 text-xs text-white/35 md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} INFINITE GYM CENTER. Demonstration build. All pricing,
            testimonials and metrics are sample data.
          </p>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-2">
              <Instagram className="h-4 w-4" /> @infinitegym (demo)
            </span>
            <span>USD · en-US</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
