-- INFINITE GYM CENTER — PostgreSQL / Supabase foundation
-- Demonstration schema. Apply with the Supabase CLI or SQL editor.
-- All seed rows in supabase/seed.sql are clearly labelled DEMO DATA.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Core identity
-- ---------------------------------------------------------------------------
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  full_name text not null,
  role text not null default 'member' check (role in ('member', 'trainer', 'admin')),
  phone text not null default '',
  avatar_url text not null default '',
  email_verified boolean not null default false,
  password_hash text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.customer_profiles (
  user_id uuid primary key references public.users(id) on delete cascade,
  emergency_contact text not null default '',
  goals text not null default '',
  notes text not null default '',
  updated_at timestamptz not null default now()
);

create table if not exists public.staff (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  full_name text not null,
  role text not null,
  specialty text not null default '',
  email text not null,
  schedule text not null default 'Weekdays',
  assigned_customers integer not null default 0 check (assigned_customers >= 0),
  active boolean not null default true,
  demo boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Membership
-- ---------------------------------------------------------------------------
create table if not exists public.membership_plans (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  tagline text not null default '',
  price_cents integer not null check (price_cents >= 0),
  duration_days integer not null check (duration_days > 0),
  benefits text[] not null default '{}',
  access_level text not null default 'Standard floor',
  booking_eligibility text not null default 'General access',
  featured boolean not null default false,
  active boolean not null default true,
  demo boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.customer_memberships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  plan_id uuid not null references public.membership_plans(id),
  status text not null default 'active' check (status in ('active', 'expired', 'cancelled', 'pending')),
  started_at timestamptz not null default now(),
  expires_at timestamptz not null,
  auto_renew boolean not null default false,
  expiration_notified boolean not null default false,
  demo boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Schedule & capacity
-- ---------------------------------------------------------------------------
create table if not exists public.gym_sessions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null check (category in (
    'General Gym Access', 'Morning Sessions', 'Afternoon Sessions', 'Evening Sessions',
    'Personal Training', 'Group Fitness Classes', 'Special Training Programs'
  )),
  description text not null default '',
  coach_id uuid references public.staff(id) on delete set null,
  duration_minutes integer not null default 60 check (duration_minutes > 0),
  price_cents integer not null default 0 check (price_cents >= 0),
  demo boolean not null default true
);

create table if not exists public.time_slots (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.gym_sessions(id) on delete cascade,
  slot_date date not null,
  start_time time not null,
  end_time time not null,
  capacity integer not null check (capacity > 0),
  blocked boolean not null default false,
  demo boolean not null default true,
  constraint time_slots_valid_window check (end_time > start_time)
);

create table if not exists public.gym_settings (
  id text primary key default 'gym_settings',
  operating_hours text not null default 'Mon-Fri 5:00 AM - 11:00 PM',
  holiday_dates date[] not null default '{}',
  daily_capacity integer not null default 240 check (daily_capacity > 0),
  timezone text not null default 'America/Chicago',
  demo boolean not null default true
);

-- ---------------------------------------------------------------------------
-- Bookings & payments
-- ---------------------------------------------------------------------------
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  slot_id uuid not null references public.time_slots(id) on delete cascade,
  status text not null default 'confirmed' check (status in ('confirmed', 'cancelled', 'completed', 'pending_payment')),
  created_at timestamptz not null default now(),
  amount_cents integer not null default 0 check (amount_cents >= 0),
  payment_id uuid,
  idempotency_key text not null unique,
  source text not null default 'web' check (source in ('web', 'admin')),
  demo boolean not null default true
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  kind text not null check (kind in ('membership', 'booking')),
  reference_id text not null,
  amount_cents integer not null check (amount_cents >= 0),
  currency text not null default 'USD',
  status text not null default 'pending' check (status in ('pending', 'succeeded', 'failed', 'refunded', 'simulated')),
  provider text not null default 'stripe' check (provider in ('stripe', 'demo')),
  provider_ref text unique,
  description text not null default '',
  created_at timestamptz not null default now(),
  refunded_at timestamptz,
  idempotency_key text not null unique,
  demo boolean not null default true
);

create table if not exists public.stripe_events (
  event_id text primary key,
  event_type text not null,
  received_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Notifications & growth
-- ---------------------------------------------------------------------------
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  type text not null default 'system',
  title text not null,
  body text not null,
  read boolean not null default false,
  channel text not null default 'in_app' check (channel in ('in_app', 'email')),
  delivery_status text not null default 'queued' check (delivery_status in ('queued', 'sent', 'skipped')),
  created_at timestamptz not null default now(),
  demo boolean not null default true
);

create table if not exists public.promotions (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  description text not null default '',
  discount_percent integer not null check (discount_percent between 1 and 100),
  active boolean not null default true,
  expires_at date not null,
  uses integer not null default 0,
  demo boolean not null default true
);

create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_user_id uuid not null references public.users(id) on delete cascade,
  code text not null unique,
  redeemed_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  demo boolean not null default true
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  interest text not null default '',
  message text not null default '',
  status text not null default 'new' check (status in ('new', 'contacted', 'converted')),
  created_at timestamptz not null default now(),
  demo boolean not null default true
);

create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default now(),
  demo boolean not null default true
);

create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  rating integer not null check (rating between 1 and 5),
  comment text not null,
  created_at timestamptz not null default now(),
  demo boolean not null default true
);

create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  audience text not null default '',
  status text not null default 'draft' check (status in ('draft', 'active', 'paused')),
  created_at timestamptz not null default now(),
  demo boolean not null default true
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references public.users(id) on delete set null,
  action text not null,
  entity text not null,
  entity_id text not null default '',
  created_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);

-- ---------------------------------------------------------------------------
-- Indexes / integrity
-- ---------------------------------------------------------------------------
create index if not exists idx_bookings_slot_status on public.bookings(slot_id, status);
create index if not exists idx_bookings_user_created on public.bookings(user_id, created_at desc);
create index if not exists idx_time_slots_date on public.time_slots(slot_date, start_time);
create index if not exists idx_memberships_user_status on public.customer_memberships(user_id, status);
create index if not exists idx_payments_user_created on public.payments(user_id, created_at desc);
create index if not exists idx_notifications_user_read on public.notifications(user_id, read, created_at desc);
create index if not exists idx_leads_status on public.leads(status, created_at desc);

-- A member cannot hold two confirmed bookings for the same slot.
create unique index if not exists uq_active_booking_user_slot
  on public.bookings(user_id, slot_id)
  where status = 'confirmed';

-- ---------------------------------------------------------------------------
-- Transactional booking engine (server-side, race-safe)
-- ---------------------------------------------------------------------------
create or replace function public.book_session(
  p_user_id uuid,
  p_slot_id uuid,
  p_idempotency_key text
) returns public.bookings
language plpgsql
security definer
set search_path = public
as $$
declare
  v_slot public.time_slots%rowtype;
  v_price integer;
  v_booked integer;
  v_booking public.bookings;
begin
  -- Serialize concurrent attempts on the same slot.
  perform pg_advisory_xact_lock(hashtext(p_slot_id::text));

  select * into v_slot from public.time_slots where id = p_slot_id for update;
  if not found or v_slot.blocked then
    raise exception 'SLOT_UNAVAILABLE';
  end if;

  -- Idempotency: a repeated submission returns the original booking.
  select * into v_booking from public.bookings where idempotency_key = p_idempotency_key;
  if found then
    return v_booking;
  end if;

  if exists (
    select 1 from public.bookings
    where user_id = p_user_id and slot_id = p_slot_id and status = 'confirmed'
  ) then
    raise exception 'DUPLICATE_BOOKING';
  end if;

  select count(*) into v_booked
  from public.bookings
  where slot_id = p_slot_id and status = 'confirmed';

  if v_booked >= v_slot.capacity then
    raise exception 'SESSION_FULL';
  end if;

  select coalesce(price_cents, 0) into v_price
  from public.gym_sessions where id = v_slot.session_id;

  insert into public.bookings (user_id, slot_id, status, amount_cents, idempotency_key, source, demo)
  values (p_user_id, p_slot_id, 'confirmed', v_price, p_idempotency_key, 'web', true)
  returning * into v_booking;

  return v_booking;
end;
$$;

create or replace function public.expire_memberships() returns integer
language plpgsql security definer set search_path = public as $$
declare v_count integer;
begin
  update public.customer_memberships
  set status = 'expired', expiration_notified = true
  where status = 'active' and expires_at <= now() and expiration_notified = false;
  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.users enable row level security;
alter table public.customer_profiles enable row level security;
alter table public.staff enable row level security;
alter table public.membership_plans enable row level security;
alter table public.customer_memberships enable row level security;
alter table public.gym_sessions enable row level security;
alter table public.time_slots enable row level security;
alter table public.gym_settings enable row level security;
alter table public.bookings enable row level security;
alter table public.payments enable row level security;
alter table public.stripe_events enable row level security;
alter table public.notifications enable row level security;
alter table public.promotions enable row level security;
alter table public.referrals enable row level security;
alter table public.leads enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.feedback enable row level security;
alter table public.campaigns enable row level security;
alter table public.audit_logs enable row level security;

-- Security-definer role lookup avoids recursive RLS on public.users.
create or replace function public.current_user_role() returns text
language sql stable security definer set search_path = public as $$
  select role from public.users where id = auth.uid() limit 1;
$$;

create or replace function public.prevent_role_change() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.role is distinct from old.role and coalesce(public.current_user_role(), '') <> 'admin' then
    raise exception 'Only administrators can change roles';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_prevent_role_change on public.users;
create trigger trg_prevent_role_change
before update on public.users
for each row execute function public.prevent_role_change();

-- Public read of active catalogue (anon + authenticated).
create policy "plans_public_read" on public.membership_plans for select using (active = true);
create policy "sessions_public_read" on public.gym_sessions for select using (true);
create policy "slots_public_read" on public.time_slots for select using (blocked = false);
create policy "settings_public_read" on public.gym_settings for select using (true);
create policy "promotions_public_read" on public.promotions for select using (active = true);

-- Own data.
create policy "users_select_own_or_admin" on public.users for select
  using (id = auth.uid() or public.current_user_role() = 'admin');
create policy "users_update_own" on public.users for update
  using (id = auth.uid()) with check (id = auth.uid());
create policy "profiles_own" on public.customer_profiles for all
  using (user_id = auth.uid() or public.current_user_role() = 'admin')
  with check (user_id = auth.uid() or public.current_user_role() = 'admin');
create policy "memberships_own_or_admin" on public.customer_memberships for select
  using (user_id = auth.uid() or public.current_user_role() = 'admin');
create policy "bookings_own_or_admin" on public.bookings for select
  using (user_id = auth.uid() or public.current_user_role() = 'admin');
create policy "payments_own_or_admin" on public.payments for select
  using (user_id = auth.uid() or public.current_user_role() = 'admin');
create policy "notifications_own_or_admin" on public.notifications for select
  using (user_id = auth.uid() or public.current_user_role() = 'admin');
create policy "notifications_update_own" on public.notifications for update
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "referrals_own_or_admin" on public.referrals for select
  using (referrer_user_id = auth.uid() or public.current_user_role() = 'admin');
create policy "feedback_insert_own" on public.feedback for insert
  with check (user_id is null or user_id = auth.uid());
create policy "feedback_select_own_or_admin" on public.feedback for select
  using (user_id is null or user_id = auth.uid() or public.current_user_role() = 'admin');

-- Admin-only management (service-role / admin JWT).
create policy "admin_all_staff" on public.staff for all
  using (public.current_user_role() = 'admin') with check (public.current_user_role() = 'admin');
create policy "admin_all_plans" on public.membership_plans for all
  using (public.current_user_role() = 'admin') with check (public.current_user_role() = 'admin');
create policy "admin_all_memberships" on public.customer_memberships for all
  using (public.current_user_role() = 'admin') with check (public.current_user_role() = 'admin');
create policy "admin_all_sessions" on public.gym_sessions for all
  using (public.current_user_role() = 'admin') with check (public.current_user_role() = 'admin');
create policy "admin_all_slots" on public.time_slots for all
  using (public.current_user_role() = 'admin') with check (public.current_user_role() = 'admin');
create policy "admin_all_settings" on public.gym_settings for all
  using (public.current_user_role() = 'admin') with check (public.current_user_role() = 'admin');
create policy "admin_all_bookings" on public.bookings for all
  using (public.current_user_role() = 'admin') with check (public.current_user_role() = 'admin');
create policy "admin_all_payments" on public.payments for all
  using (public.current_user_role() = 'admin') with check (public.current_user_role() = 'admin');
create policy "admin_all_notifications" on public.notifications for all
  using (public.current_user_role() = 'admin') with check (public.current_user_role() = 'admin');
create policy "admin_all_promotions" on public.promotions for all
  using (public.current_user_role() = 'admin') with check (public.current_user_role() = 'admin');
create policy "admin_all_leads" on public.leads for all
  using (public.current_user_role() = 'admin') with check (public.current_user_role() = 'admin');
create policy "admin_all_subscribers" on public.newsletter_subscribers for all
  using (public.current_user_role() = 'admin') with check (public.current_user_role() = 'admin');
create policy "admin_all_campaigns" on public.campaigns for all
  using (public.current_user_role() = 'admin') with check (public.current_user_role() = 'admin');
create policy "admin_all_audit" on public.audit_logs for all
  using (public.current_user_role() = 'admin') with check (public.current_user_role() = 'admin');
create policy "admin_all_stripe_events" on public.stripe_events for all
  using (public.current_user_role() = 'admin') with check (public.current_user_role() = 'admin');

-- Anonymous lead + newsletter capture (business growth without an account).
create policy "anon_insert_leads" on public.leads for insert with check (true);
create policy "anon_insert_subscribers" on public.newsletter_subscribers for insert with check (true);

grant execute on function public.book_session(uuid, uuid, text) to service_role;
grant execute on function public.expire_memberships() to service_role;
grant execute on function public.current_user_role() to anon, authenticated, service_role;
