"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CheckCircle2, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/format";
import { updateProfileAction, verifyEmailAction } from "@/app/actions";
import type { PublicUser } from "@/types";

export function ProfileForm({
  user,
  membership,
  bookingCount,
  paymentCount,
}: {
  user: PublicUser;
  membership: string;
  bookingCount: number;
  paymentCount: number;
}) {
  const router = useRouter();
  const [fullName, setFullName] = useState(user.fullName);
  const [phone, setPhone] = useState(user.phone);
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    const result = await updateProfileAction({ fullName, phone, avatarUrl });
    setMessage(result.message ?? result.error ?? "Done.");
    setPending(false);
    router.refresh();
  }

  async function handleVerify() {
    setPending(true);
    const result = await verifyEmailAction();
    setMessage(result.message ?? result.error ?? "Done.");
    setPending(false);
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <p className="igc-eyebrow">Account settings</p>
        <h1 className="igc-display mt-3 text-3xl text-white sm:text-4xl">YOUR PROFILE.</h1>
        <p className="mt-3 text-sm text-white/50">
          Contact information, membership status and account activity.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Membership", value: membership },
          { label: "Bookings", value: String(bookingCount) },
          { label: "Payments", value: String(paymentCount) },
        ].map((item) => (
          <Card key={item.label} className="p-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/40">
              {item.label}
            </p>
            <p className="mt-3 truncate text-lg font-bold text-white">{item.value}</p>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Personal information</CardTitle>
            <Badge tone="lime">{user.role}</Badge>
          </div>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name">
              <Input
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                required
              />
            </Field>
            <Field label="Email">
              <Input value={user.email} disabled className="opacity-60" />
            </Field>
            <Field label="Phone">
              <Input
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="+1 (512) 555-0100"
              />
            </Field>
            <Field label="Profile photo URL" hint="Demo field. Production uses Supabase Storage.">
              <Input
                value={avatarUrl}
                onChange={(event) => setAvatarUrl(event.target.value)}
                placeholder="https://…"
              />
            </Field>
            <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
              <Button type="submit" disabled={pending}>
                {pending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Save className="h-4 w-4" /> Save changes
                  </>
                )}
              </Button>
              {!user.emailVerified ? (
                <Button type="button" variant="outline" disabled={pending} onClick={handleVerify}>
                  <CheckCircle2 className="h-4 w-4" /> Verify email (demo)
                </Button>
              ) : (
                <Badge tone="lime">Email verified</Badge>
              )}
              {message ? (
                <p className="text-sm text-lime" role="status">
                  {message}
                </p>
              ) : null}
            </div>
          </form>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account activity</CardTitle>
        </CardHeader>
        <CardBody className="grid gap-3 text-sm text-white/55 sm:grid-cols-2">
          <p>
            <span className="text-white/35">Member since:</span> {formatDate(user.createdAt)}
          </p>
          <p>
            <span className="text-white/35">Email status:</span>{" "}
            {user.emailVerified ? "Verified (demo)" : "Pending verification"}
          </p>
          <p>
            <span className="text-white/35">Role:</span> {user.role}
          </p>
          <p>
            <span className="text-white/35">Environment:</span> Demonstration data
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
