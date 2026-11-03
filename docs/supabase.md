# Supabase integration

## Apply the schema

```bash
# With the Supabase CLI linked to your project:
supabase db push                     # applies supabase/migrations/0001_init.sql
psql "$SUPABASE_DB_URL" -f supabase/seed.sql   # optional clearly labelled demo data
supabase gen types typescript --project-id <ref> > src/types/database.types.ts
```

Or paste the migration and seed into the Supabase SQL editor.

## What the migration creates

- 20+ entities: users, customer_profiles, staff, membership_plans, customer_memberships, gym_sessions, time_slots, gym_settings, bookings, payments, stripe_events, notifications, promotions, referrals, leads, newsletter_subscribers, feedback, campaigns, audit_logs.
- Indexes for slot/date, booking status, payment history, notifications and leads.
- Partial unique index `uq_active_booking_user_slot`.
- `book_session(uuid, uuid, text)` transactional booking function.
- `expire_memberships()` maintenance function.
- Row Level Security on every table with public-read catalogue policies, own-data member policies and admin management policies.
- `prevent_role_change` trigger against privilege escalation.

## Switch from the demo store

1. Fill `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`.
2. Replace `getStore()` calls in `src/app/actions.ts` and Server Components with repository modules backed by `createSupabaseServerClient()` / `createSupabaseAdminClient()`.
3. Use Supabase Auth for email verification and password resets instead of the local demo simulation.
4. Keep `book_session()` as the single write path for confirmed bookings.
5. Regenerate `src/types/database.types.ts`.

`src/lib/supabase/client.ts`, `server.ts`, `admin.ts` and `config.ts` are already wired with safe null returns when credentials are absent, so the demo build never attempts a network call.

## Storage

Profile photos should use a private Supabase Storage bucket with per-user policies. The demo profile form exposes a URL field only; no image upload is performed.
