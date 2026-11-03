"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Loader2, LockKeyhole, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  loginAction,
  registerAction,
  requestPasswordResetAction,
  resetPasswordAction,
} from "@/app/actions";

type Mode = "login" | "register" | "forgot" | "reset";

const titles: Record<Mode, { eyebrow: string; title: string; body: string }> = {
  login: {
    eyebrow: "Welcome back",
    title: "SIGN IN TO GO INFINITE.",
    body: "Access your membership, upcoming sessions and booking history.",
  },
  register: {
    eyebrow: "Join the club",
    title: "CREATE YOUR ACCOUNT.",
    body: "One account for membership, smart booking and progress.",
  },
  forgot: {
    eyebrow: "Account recovery",
    title: "RESET YOUR PASSWORD.",
    body: "Enter your email and we will queue a secure reset link.",
  },
  reset: {
    eyebrow: "Account recovery",
    title: "CHOOSE A NEW PASSWORD.",
    body: "Use the demo reset token from your notification outbox.",
  },
};

export function AuthForm({
  mode,
  next = "/dashboard",
  token = "",
}: {
  mode: Mode;
  next?: string;
  token?: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const meta = titles[mode];

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage(null);
    const form = new FormData(event.currentTarget);
    let result: { ok: boolean; message?: string; error?: string };

    if (mode === "login") {
      result = await loginAction({ email: form.get("email"), password: form.get("password") });
    } else if (mode === "register") {
      result = await registerAction({
        fullName: form.get("fullName"),
        email: form.get("email"),
        phone: form.get("phone"),
        password: form.get("password"),
      });
    } else if (mode === "forgot") {
      result = await requestPasswordResetAction({ email: form.get("email") });
    } else {
      result = await resetPasswordAction({
        token: form.get("token"),
        password: form.get("password"),
      });
    }

    setMessage({ ok: result.ok, text: result.message ?? result.error ?? "Unexpected response." });
    setPending(false);
    if (result.ok && (mode === "login" || mode === "register")) {
      router.push(next);
      router.refresh();
    }
    if (result.ok && mode === "reset") {
      setTimeout(() => router.push("/login"), 900);
    }
  }

  return (
    <div>
      <Badge tone="amber" className="mb-6">
        Demo environment
      </Badge>
      <p className="igc-eyebrow">{meta.eyebrow}</p>
      <h1 className="igc-display mt-4 text-3xl text-white sm:text-4xl">{meta.title}</h1>
      <p className="mt-4 text-sm leading-relaxed text-white/50">{meta.body}</p>

      <form onSubmit={handleSubmit} className="mt-9 space-y-4">
        {mode === "register" ? (
          <>
            <Field label="Full name">
              <Input name="fullName" required placeholder="Alex Morgan" autoComplete="name" />
            </Field>
            <Field label="Phone">
              <Input name="phone" placeholder="+1 (512) 555-0100" autoComplete="tel" />
            </Field>
          </>
        ) : null}

        {mode === "reset" ? (
          <Field
            label="Reset token"
            hint="Demo token is delivered to the in-app notification outbox."
          >
            <Input name="token" required defaultValue={token} placeholder="rst_…" />
          </Field>
        ) : (
          <Field label="Email">
            <Input
              name="email"
              type="email"
              required
              placeholder="you@example.com"
              autoComplete="email"
            />
          </Field>
        )}

        {mode !== "forgot" ? (
          <Field
            label={mode === "reset" ? "New password" : "Password"}
            hint={mode === "register" ? "At least 8 characters." : undefined}
          >
            <Input
              name="password"
              type="password"
              required
              minLength={8}
              placeholder="••••••••"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
            />
          </Field>
        ) : null}

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              {mode === "login"
                ? "Sign in"
                : mode === "register"
                  ? "Create account"
                  : mode === "forgot"
                    ? "Send reset link"
                    : "Update password"}
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>

        {message ? (
          <p
            className={cn(
              "rounded-xl border px-4 py-3 text-sm",
              message.ok
                ? "border-lime/25 bg-lime/10 text-lime"
                : "border-red-500/25 bg-red-500/10 text-red-300",
            )}
            role="status"
          >
            {message.text}
          </p>
        ) : null}
      </form>

      <div className="mt-7 flex flex-wrap items-center justify-between gap-3 text-xs text-white/45">
        {mode === "login" ? (
          <>
            <Link href="/register" className="hover:text-lime">
              Create an account
            </Link>
            <Link href="/forgot-password" className="hover:text-lime">
              Forgot password?
            </Link>
          </>
        ) : mode === "register" ? (
          <Link href="/login" className="hover:text-lime">
            Already a member? Sign in
          </Link>
        ) : (
          <Link href="/login" className="hover:text-lime">
            Back to sign in
          </Link>
        )}
      </div>

      <div className="mt-9 rounded-2xl border border-white/10 bg-ink-850 p-5">
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-white/50">
          <ShieldCheck className="h-4 w-4 text-lime" /> Seeded demo accounts
        </p>
        <div className="mt-4 space-y-2 text-xs text-white/55">
          <p>
            <span className="text-white/35">Member:</span> member@infinitegym.demo /{" "}
            <code className="text-lime">DemoPass123!</code>
          </p>
          <p>
            <span className="text-white/35">Admin:</span> admin@infinitegym.demo /{" "}
            <code className="text-lime">DemoPass123!</code>
          </p>
          <p>
            <span className="text-white/35">Trainer:</span> trainer@infinitegym.demo /{" "}
            <code className="text-lime">DemoPass123!</code>
          </p>
        </div>
        <p className="mt-4 flex items-start gap-2 text-[11px] leading-relaxed text-white/35">
          <LockKeyhole className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          Passwords are salted with scrypt. Sessions use signed httpOnly cookies. Production should
          switch to Supabase Auth as documented.
        </p>
      </div>
    </div>
  );
}
