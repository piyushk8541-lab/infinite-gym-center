# Testing

## Commands

```bash
npm test          # Vitest workflow suite
npm run typecheck
npm run lint
npm run build
npm run validate  # all of the above
```

## Covered scenarios

| #   | Scenario                   | Assertion                                                                           |
| --- | -------------------------- | ----------------------------------------------------------------------------------- |
| 1   | New customer registration  | `createUser` adds a unique member with a hashed password                            |
| 2   | Customer login             | `verifyPassword` accepts the seeded demo password and rejects a wrong one           |
| 3   | Membership purchase        | Simulated payment + active membership with correct expiry                           |
| 4   | Session booking            | Confirmed booking created; capacity decremented                                     |
| 5   | Capacity reached           | `updateSlotCapacity` to current booked count makes the slot full and blocks booking |
| 6   | Double-booking prevention  | Second booking for same member + slot is rejected                                   |
| 7   | Duplicate submission       | Same idempotency key returns the original booking, no duplicate                     |
| 8   | Payment success            | Paid session creates a `simulated` payment record                                   |
| 9   | Payment failure            | Simulated failure leaves `pending_payment` / `failed` and no charge                 |
| 10  | Booking cancellation       | Status cancelled, capacity released, demo payment refunded                          |
| 11  | Rescheduling               | Booking moves to another available slot with conflict checks                        |
| 12  | Admin schedule management  | Create slot, change capacity, block date hides slots                                |
| 13  | Membership expiration      | Past `expiresAt` becomes `expired`; active membership becomes null                  |
| 14  | Stripe webhook idempotency | Same event id processed once                                                        |
| 15  | Plan editing               | Price/duration/benefits update                                                      |
| 16  | Growth forms               | Lead, newsletter, feedback, promotion, staff, campaign, referral                    |

## Manual smoke checklist

- `/` → hero, CTAs, FAQ, lead form, newsletter.
- `/membership` → six demo plans, purchase, failed-payment simulation, Stripe-configured error message.
- `/book` → date filter, category filter, `6 SPOTS AVAILABLE`, select → confirm → resubmit same key.
- `/dashboard` → cancel, reschedule, mark notification read, feedback, referral.
- `/admin` → edit a plan, create a slot, change capacity, block a date, cancel a booking, download a receipt, process queued emails, reset demo data.
- `/login`, `/register`, `/forgot-password`, `/reset-password`.
- `/api/health`.

All test data is reset with `resetStore()` between cases so the suite is deterministic.
