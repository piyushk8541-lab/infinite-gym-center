import Stripe from "stripe";

let client: Stripe | null = null;

/**
 * Returns a Stripe client only when a real-looking test secret is configured.
 * Placeholder values from .env.example are treated as "not configured" so the
 * app never pretends a payment was processed.
 */
export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || key.includes("replace_me") || !key.startsWith("sk_test_")) return null;
  if (!client) client = new Stripe(key);
  return client;
}

export function isStripeConfigured(): boolean {
  return (
    getStripe() !== null &&
    Boolean(
      process.env.STRIPE_WEBHOOK_SECRET &&
      !process.env.STRIPE_WEBHOOK_SECRET.includes("replace_me"),
    )
  );
}

export function stripePublicKey(): string | null {
  const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  if (!key || key.includes("replace_me") || !key.startsWith("pk_test_")) return null;
  return key;
}
