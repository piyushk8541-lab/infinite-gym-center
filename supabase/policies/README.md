# Row Level Security

All policies are defined in `supabase/migrations/0001_init.sql` so that a single
migration produces a fully protected database.

Key rules:

- Anonymous visitors may read active plans, sessions, non-blocked slots, gym settings and active promotions.
- Anonymous visitors may submit a lead or newsletter subscription, but cannot read them.
- Authenticated members may read only their own profile, memberships, bookings, payments, notifications and referrals.
- Members may mark their own notifications read and submit feedback.
- Administrators (`role = 'admin'`) can manage every business table.
- `public.current_user_role()` is a `security definer` function, avoiding recursive RLS on `public.users`.
- `prevent_role_change` blocks privilege escalation through a user-profile update.
- `uq_active_booking_user_slot` is a partial unique index that makes double bookings impossible at the database layer.
- `public.book_session()` locks the slot row with `SELECT … FOR UPDATE` and an advisory transaction lock before re-checking capacity, and returns the original booking for a repeated idempotency key.

The service-role key must only be used by server-side code (webhooks, admin server actions). It is never exposed to the browser.
