"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowUpRight, LayoutDashboard, LogOut, Menu, X } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { Button, ButtonLink } from "@/components/ui/button";
import { logoutAction } from "@/app/actions";
import { cn } from "@/lib/utils";
import type { Role } from "@/types";

const links = [
  { href: "/#programs", label: "Programs" },
  { href: "/#facilities", label: "Facilities" },
  { href: "/membership", label: "Membership" },
  { href: "/#trainers", label: "Training" },
  { href: "/#contact", label: "Contact" },
];

export function SiteHeaderClient({ signedIn, role }: { signedIn: boolean; role?: Role }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const dashboardHref = role === "admin" ? "/admin" : "/dashboard";

  async function handleLogout() {
    await logoutAction();
    router.refresh();
    router.push("/");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-ink-950/85 backdrop-blur-xl">
      <div className="igc-container flex h-[72px] items-center justify-between gap-6">
        <Logo />

        <nav className="hidden items-center gap-8 lg:flex" aria-label="Main navigation">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-xs font-bold uppercase tracking-[0.16em] transition-colors",
                pathname === link.href ? "text-lime" : "text-white/60 hover:text-white",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {signedIn ? (
            <>
              <ButtonLink href={dashboardHref} variant="ghost" size="sm">
                <LayoutDashboard className="h-4 w-4" /> Dashboard
              </ButtonLink>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4" /> Sign out
              </Button>
            </>
          ) : (
            <ButtonLink href="/login" variant="ghost" size="sm">
              Sign in
            </ButtonLink>
          )}
          <ButtonLink href="/book" size="sm">
            Book a session <ArrowUpRight className="h-4 w-4" />
          </ButtonLink>
        </div>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-white lg:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-label="Toggle navigation"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open ? (
        <div className="border-t border-white/10 bg-ink-900 px-5 py-5 lg:hidden">
          <nav className="flex flex-col gap-1" aria-label="Mobile navigation">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-3 text-sm font-semibold text-white/75 hover:bg-white/5 hover:text-white"
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-4 grid grid-cols-2 gap-3">
              {signedIn ? (
                <>
                  <ButtonLink href={dashboardHref} variant="outline" size="sm">
                    Dashboard
                  </ButtonLink>
                  <Button variant="outline" size="sm" onClick={handleLogout}>
                    Sign out
                  </Button>
                </>
              ) : (
                <ButtonLink href="/login" variant="outline" size="sm">
                  Sign in
                </ButtonLink>
              )}
              <ButtonLink href="/book" size="sm" className="col-span-2">
                Book a session
              </ButtonLink>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
