import Link from "next/link";
import { ArrowLeft, Dumbbell, ShieldCheck, Sparkles } from "lucide-react";
import { Logo } from "@/components/ui/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-[calc(100vh-33px)] lg:grid-cols-[1.05fr_1fr]">
      <div className="relative hidden overflow-hidden border-r border-white/10 lg:block">
        <div className="absolute inset-0 bg-[url('/images/hero-gym.png')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-br from-ink-950/95 via-ink-950/70 to-electric-dark/40" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <Logo />
          <div className="max-w-lg">
            <p className="igc-eyebrow">Member access</p>
            <h2 className="igc-display mt-6 text-5xl text-white">
              YOUR TRAINING. FULLY CONNECTED.
            </h2>
            <p className="mt-6 text-base leading-relaxed text-white/60">
              Book sessions, track capacity, manage your membership and keep every workout in one
              place.
            </p>
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {[
                { icon: Dumbbell, label: "Smart booking" },
                { icon: ShieldCheck, label: "Secure access" },
                { icon: Sparkles, label: "Member perks" },
              ].map((item) => (
                <div key={item.label} className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <item.icon className="h-5 w-5 text-lime" />
                  <p className="mt-3 text-xs font-semibold text-white/70">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-white/50 hover:text-lime"
          >
            <ArrowLeft className="h-4 w-4" /> Back to site
          </Link>
        </div>
      </div>
      <div className="flex items-center justify-center px-5 py-12 sm:px-10">
        <div className="w-full max-w-md">
          <div className="mb-10 lg:hidden">
            <Logo />
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
