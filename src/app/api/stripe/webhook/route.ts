import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getStore } from "@/lib/demo/store";

export const runtime = "nodejs";

/**
 * Secure Stripe webhook endpoint. Signature verification happens BEFORE any
 * state change, and event ids are stored to guarantee idempotent processing.
 * No card data is ever handled or persisted by this application.
 */
export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get("stripe-signature");
  const stripe = getStripe();

  if (!stripe || !secret || secret.includes("replace_me")) {
    return NextResponse.json(
      {
        error:
          "Stripe webhook is not configured. Add sk_test_ and whsec_ test values to .env.local.",
      },
      { status: 503 },
    );
  }
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header." }, { status: 400 });
  }

  const body = await request.text();
  let event: import("stripe").Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, secret);
  } catch (error) {
    return NextResponse.json(
      {
        error: `Webhook signature verification failed: ${error instanceof Error ? error.message : "unknown"}`,
      },
      { status: 400 },
    );
  }

  const object = event.data.object as unknown as {
    id?: string;
    metadata?: Record<string, string>;
    amount_total?: number;
  };
  const metadata = object.metadata ?? {};
  const result = getStore().recordStripeEvent(event.id, event.type, {
    referenceId: metadata.referenceId ?? object.id,
    providerRef: object.id,
    amountCents: object.amount_total,
  });

  return NextResponse.json({ received: true, duplicate: result.duplicate, type: event.type });
}
