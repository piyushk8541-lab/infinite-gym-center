-- INFINITE GYM CENTER — DEMO DATA ONLY
-- Apply AFTER 0001_init.sql. Every row below is sample data pending owner approval.
-- Prices are demonstration values in USD cents.

insert into public.membership_plans
  (id, name, tagline, price_cents, duration_days, benefits, access_level, booking_eligibility, featured, active, demo)
values
  ('11111111-1111-1111-1111-111111111101', 'Daily Pass', 'One day. Full access.', 1500, 1,
   array['Full gym floor access','Locker room + showers','One group class','No commitment'],
   'Standard floor', 'General access + 1 class', false, true, true),
  ('11111111-1111-1111-1111-111111111102', 'Weekly Membership', 'Seven days of momentum.', 4900, 7,
   array['Unlimited gym floor access','All group fitness classes','Smart capacity booking','Guest pass: 1'],
   'Standard floor + studios', 'All standard sessions', false, true, true),
  ('11111111-1111-1111-1111-111111111103', 'Monthly Membership', 'The member favorite.', 8900, 30,
   array['Unlimited gym access','All group classes','Priority smart booking','Monthly body composition scan','Member referral rewards'],
   'Full club', 'All sessions except 1:1 PT packages', true, true, true),
  ('11111111-1111-1111-1111-111111111104', 'Quarterly Membership', 'Train with a 90-day plan.', 23900, 90,
   array['Everything in Monthly','Quarterly coaching consult','10% off special programs','Freeze option: 14 days'],
   'Full club', 'All sessions + program priority', false, true, true),
  ('11111111-1111-1111-1111-111111111105', 'Annual Membership', 'Best value. Go infinite.', 79900, 365,
   array['Everything in Quarterly','2 personal training sessions','VIP equipment access','Annual guest week','Locked-in rate'],
   'Full club + VIP', 'All sessions + VIP windows', true, true, true),
  ('11111111-1111-1111-1111-111111111106', 'Personal Training Package', 'Eight sessions. One transformation.', 49900, 60,
   array['8 x 60-minute 1:1 sessions','Custom programming','Nutrition baseline','Progress tracking','Dedicated coach'],
   'Coach-led', 'Personal Training sessions', false, true, true)
on conflict (id) do nothing;

insert into public.gym_sessions
  (id, title, category, description, duration_minutes, price_cents, demo)
values
  ('22222222-2222-2222-2222-222222222201', 'Open Gym Access', 'General Gym Access', 'Full access to the strength floor, cardio deck and functional zone.', 1080, 0, true),
  ('22222222-2222-2222-2222-222222222202', 'Sunrise Strength', 'Morning Sessions', 'Coach-led early strength block.', 90, 0, true),
  ('22222222-2222-2222-2222-222222222203', 'Midday Performance', 'Afternoon Sessions', 'Efficient lunch-hour conditioning.', 90, 0, true),
  ('22222222-2222-2222-2222-222222222204', 'Peak Hour Training', 'Evening Sessions', 'Flagship after-work floor session.', 90, 0, true),
  ('22222222-2222-2222-2222-222222222205', '1:1 Personal Training', 'Personal Training', 'A dedicated coach and a custom plan.', 60, 6500, true),
  ('22222222-2222-2222-2222-222222222206', 'Infinite HIIT', 'Group Fitness Classes', 'High-energy interval training.', 60, 1500, true),
  ('22222222-2222-2222-2222-222222222207', 'Athlete Lab', 'Special Training Programs', 'Small-group specialty programming.', 90, 2500, true)
on conflict (id) do nothing;

insert into public.gym_settings (id, operating_hours, daily_capacity, timezone, demo)
values ('gym_settings', 'Mon-Fri 5:00 AM - 11:00 PM | Sat-Sun 6:00 AM - 10:00 PM', 240, 'America/Chicago', true)
on conflict (id) do nothing;

-- 14 days of demo slots. Fixed UUID suffixes keep the seed idempotent.
insert into public.time_slots (id, session_id, slot_date, start_time, end_time, capacity, demo)
select
  ('33333333-3333-3333-3333-' || lpad((s.day_offset * 10 + s.seq)::text, 12, '0'))::uuid,
  s.session_id::uuid,
  current_date + s.day_offset,
  s.start_time::time,
  s.end_time::time,
  s.capacity,
  true
from (
  select d.day_offset, t.seq, t.session_id, t.start_time, t.end_time, t.capacity
  from generate_series(0, 13) as d(day_offset)
  cross join (values
    (1, '22222222-2222-2222-2222-222222222201', '05:00', '23:00', 40),
    (2, '22222222-2222-2222-2222-222222222202', '06:00', '07:30', 24),
    (3, '22222222-2222-2222-2222-222222222205', '09:00', '10:00', 4),
    (4, '22222222-2222-2222-2222-222222222203', '12:00', '13:30', 24),
    (5, '22222222-2222-2222-2222-222222222204', '17:00', '18:30', 30),
    (6, '22222222-2222-2222-2222-222222222206', '18:45', '19:45', 20),
    (7, '22222222-2222-2222-2222-222222222207', '20:00', '21:30', 16)
  ) as t(seq, session_id, start_time, end_time, capacity)
) as s
on conflict (id) do nothing;

insert into public.promotions (code, description, discount_percent, active, expires_at, demo)
values
  ('INFINITE20', '20% off first membership (demo)', 20, true, current_date + 45, true),
  ('BRINGAFRIEND', 'Referral credit for member + guest (demo)', 15, true, current_date + 90, true)
on conflict (code) do nothing;
