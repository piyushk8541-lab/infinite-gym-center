"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  BarChart3,
  CalendarDays,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Users,
  X,
} from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { logoutAction } from "@/app/actions";
import { initials } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { PublicUser } from "@/types";

const memberNav = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/book", label: "Book a session", icon: CalendarDays },
  { href: "/membership", label: "Membership", icon: CreditCard },
  { href: "/profile", label: "Settings", icon: Settings },
];

const adminNav = [
  { href: "/admin", label: "Control center", icon: LayoutDashboard },
  { href: "/admin#customers", label: "Customers", icon: Users },
  { href: "/admin#bookings", label: "Bookings", icon: CalendarDays },
  { href: "/admin#analytics", label: "Analytics", icon: BarChart3 },
];

export function DashboardShell({
  user,
  variant,
  children,
}: {
  user: PublicUser;
  variant: "member" | "admin";
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const nav = variant === "admin" ? adminNav : memberNav;

  async function handleLogout() {
    await logoutAction();
    router.refresh();
    router.push("/");
  }

  return (
    <div className="min-h-[calc(100vh-33px)] bg-ink-950 lg:grid lg:grid-cols-[260px_1fr]">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r border-white/10 bg-ink-900 transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-[72px] items-center justify-between border-b border-white/10 px-6">
          <Logo />
          <button
            className="text-white/60 lg:hidden"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="border-b border-white/10 px-6 py-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-lime/30 bg-lime/10 text-sm font-bold text-lime">
              {initials(user.fullName)}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{user.fullName}</p>
              <p className="truncate text-xs text-white/40">{user.email}</p>
            </div>
          </div>
          <Badge tone={variant === "admin" ? "blue" : "lime"} className="mt-4">
            {variant === "admin" ? "Administrator" : "Member"}
          </Badge>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-6">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition",
                pathname === item.href.split("#")[0] && !item.href.includes("#")
                  ? "bg-lime/10 text-lime"
                  : "text-white/55 hover:bg-white/5 hover:text-white",
              )}
            >
              <item.icon className="h-4 w-4" /> {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-white/10 p-4">
          <Button variant="outline" size="sm" className="w-full" onClick={handleLogout}>
            <LogOut className="h-4 w-4" /> Sign out
          </Button>
        </div>
      </aside>

      {open ? (
        <button
          className="fixed inset-0 z-40 bg-black/70 lg:hidden"
          onClick={() => setOpen(false)}
          aria-label="Close overlay"
        />
      ) : null}

      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b border-white/10 bg-ink-950/85 px-5 backdrop-blur-xl sm:px-8">
          <button
            className="text-white lg:hidden"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="hidden text-xs font-bold uppercase tracking-[0.2em] text-white/40 lg:block">
            {variant === "admin" ? "Business Control Center" : "Member Dashboard"}
          </div>
          <div className="flex items-center gap-3">
            <Badge tone="amber">Demo data</Badge>
            <span className="hidden text-xs text-white/40 sm:block">USD · en-US</span>
          </div>
        </header>
        <main className="p-5 sm:p-8">{children}</main>
      </div>
    </div>
  );
}
