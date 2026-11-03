# Architecture

## Runtime model

Next.js 15 App Router with React 19 and TypeScript strict mode. Marketing and auth routes are Server Components; interactive surfaces are small Client Components that call **Server Actions** (`src/app/actions.ts`). All domain state lives behind `getStore()` and never reaches the browser except as serialisable snapshots.

## Layers

1. **Presentation** — `src/app/*` routes and `src/components/*`.
2. **Application** — `src/app/actions.ts`: authentication guard → Zod validation → domain mutation → `revalidatePath`.
3. **Domain** — `src/lib/demo/store.ts`: users, plans, memberships, sessions, slots, bookings, payments, notifications, staff, promotions, leads, campaigns, feedback, referrals, settings.
4. **Integration adapters** — `src/lib/supabase/*`, `src/lib/stripe.ts`, `src/lib/notifications.ts`.
5. **Persistence** — `supabase/migrations/0001_init.sql`: PostgreSQL tables, indexes, constraints, RLS policies and transactional functions.

## Booking integrity

Demo layer (`createBooking`):

1. Idempotency key lookup returns the original booking for a repeated submission.
2. Active-membership check.
3. Duplicate active booking check for `userId + slotId`.
4. Same-time conflict check.
5. Capacity re-check against the current confirmed count.
6. Optional simulated payment; a simulated failure leaves the booking `pending_payment`.
7. Notification outbox entry.

SQL layer (`public.book_session`):

1. `pg_advisory_xact_lock(hashtext(slot_id))` serialises concurrent attempts.
2. `SELECT … FOR UPDATE` on the slot row.
3. Idempotency, duplicate and capacity checks inside the transaction.
4. `uq_active_booking_user_slot` partial unique index provides a final database guarantee.

## Payment integrity

- Stripe Checkout Sessions are created server-side with an idempotency key.
- The webhook verifies `stripe-signature` with `constructEvent` **before** any state change.
- `stripe_events.event_id` / `store.stripeEvents` deduplicate redelivery.
- Card data never enters the application; only provider references and amounts are stored.
- Without test credentials, the UI uses a `simulated` payment record labelled `DEMO ONLY`.

## Access control

- `requirePageUser(role?)` redirects unauthenticated or wrong-role users.
- `requireActionUser(role?)` throws a typed `AuthError` inside server actions.
- Supabase RLS mirrors the same rules at the database layer.
- Service-role access is server-only and never bundled into Client Components.

## Demo vs production

| Concern  | Demo (this build)                                    | Production path                     |
| -------- | ---------------------------------------------------- | ----------------------------------- |
| Data     | In-memory `globalThis` store, reseeded on cold start | Supabase PostgreSQL                 |
| Auth     | Signed local cookie + scrypt                         | Supabase Auth + SSR cookies         |
| Payments | Simulated, clearly labelled                          | Stripe test/live Checkout + webhook |
| Email    | Queued outbox                                        | Resend / SMTP adapter               |
| Storage  | Profile-photo URL field                              | Supabase Storage                    |

The folder `src/modules/` reserves explicit module boundaries (`auth`, `booking`, `membership`, `payment`, `admin`, `schedule`, `notifications`, `growth`, `staff`) for incremental extraction as the Supabase-backed repositories replace the demo store.
