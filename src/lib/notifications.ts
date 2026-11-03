/**
 * Configurable email delivery adapter.
 *
 * In the demo environment no provider is configured, so notifications are
 * stored in the in-app outbox with deliveryStatus = "queued" / "skipped".
 * The application never claims an email was sent unless a provider responds.
 * SMS and push are intentionally left as future integrations.
 */
export interface DeliveryResult {
  sent: boolean;
  reason: string;
  provider: string | null;
}

export function emailProviderStatus(): { configured: boolean; provider: string | null } {
  const provider = process.env.EMAIL_PROVIDER || "resend";
  const resend = Boolean(
    process.env.RESEND_API_KEY && !process.env.RESEND_API_KEY.includes("replace_me"),
  );
  const smtp = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER);
  return { configured: resend || smtp, provider: resend || smtp ? provider : null };
}

export async function deliverEmail(
  to: string,
  subject: string,
  body: string,
): Promise<DeliveryResult> {
  const status = emailProviderStatus();
  if (!status.configured) {
    return {
      sent: false,
      provider: null,
      reason: "No email provider configured. Notification remains queued in demo mode.",
    };
  }

  // Production adapter. Never called in demo mode; no secrets are logged.
  try {
    if (status.provider === "resend" && process.env.RESEND_API_KEY) {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM || "INFINITE GYM CENTER <noreply@example.com>",
          to,
          subject,
          text: body,
        }),
      });
      if (!response.ok) {
        return { sent: false, provider: "resend", reason: `Provider returned ${response.status}` };
      }
      return { sent: true, provider: "resend", reason: "Delivered" };
    }
  } catch (error) {
    return {
      sent: false,
      provider: status.provider,
      reason: error instanceof Error ? error.message : "Unknown provider error",
    };
  }

  return {
    sent: false,
    provider: status.provider,
    reason: "SMTP transport is not enabled in this build. Notification remains queued.",
  };
}
