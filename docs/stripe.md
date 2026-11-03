# Stripe test-mode integration

## Configure

```bash
cp .env.example .env.local
# Add sk_test_…, pk_test_… and whsec_… values
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Use test card `4242 4242 4242 4242`, any future expiry and any CVC.

## Flow

1. `initiateStripeCheckoutAction` (server action) creates a Checkout Session with `mode: "payment"`, USD `price_data`, metadata and an idempotency key. It returns only a hosted `session.url`; no card data is collected by this app.
2. The customer completes payment on Stripe's hosted page.
3. `POST /api/stripe/webhook` reads the raw body, verifies `stripe-signature` via `constructEvent`, then records the event id before mutating state.
4. `checkout.session.completed`, `payment_intent.payment_failed` and `charge.refunded` update the payment record and notification outbox.
5. Repeated webhook deliveries return `{ duplicate: true }` without a second state change.

## Safety rules

- Only `sk_test_` keys are accepted by `getStripe()`; placeholder values are treated as unconfigured.
- If credentials are absent, the app creates a `simulated` payment record with `DEMO ONLY` in the description. It never says a real charge occurred.
- No PAN, CVV, expiry or magnetic-stripe data is stored, logged or transmitted to our database.
- `STRIPE_WEBHOOK_SECRET` is server-only and never prefixed with `NEXT_PUBLIC_`.
- Receipts in the admin panel are downloadable demo text files; production receipts should come from Stripe's hosted invoice/receipt URLs.

## Setup instructions embedded in the product

The Admin → Settings tab shows the four-step test setup and an explicit warning that simulated payments are not real charges.
