# INFINITE GYM CENTER

**Premium Gym Management, Membership & Smart Booking Platform**

A dark-luxury, fully responsive, full-stack demonstration platform for a large American fitness club. It combines a conversion-focused marketing site, member dashboard, smart capacity booking engine, admin business control center, Supabase/PostgreSQL schema and Stripe test-mode payment architecture.

> **DEMONSTRATION ENVIRONMENT.** All pricing, customers, testimonials, metrics, staff, leads and contact details are clearly labelled sample data. No real payment is processed unless valid Stripe **test** credentials are configured. Nothing is deployed.

---

## Quick start

```bash
git clone https://github.com/piyushk8541-lab/infinite-gym-center.git
cd infinite-gym-center
npm install
cp .env.example .env.local      # placeholders only — safe to commit nothing
npm run dev
```

Open `http://localhost:3000`. The app runs with a seeded in-memory demo store, so no database or payment keys are required to explore every workflow.

### Seeded demo accounts

| Role    | Email                      | Password       |
| ------- | -------------------------- | -------------- |
| Member  | `member@infinitegym.demo`  | `DemoPass123!` |
| Admin   | `admin@infinitegym.demo`   | `DemoPass123!` |
| Trainer | `trainer@infinitegym.demo` | `DemoPass123!` |

You can also register a new account, verify the demo email in one click, purchase a demonstration plan and book a session.

---

## What is implemented

### Customer-facing

- Premium landing page with the exact headline **TRAIN SMARTER. GET STRONGER. GO INFINITE.**
- Hero photography, benefits, 7 program categories, facilities showcase, personal training, demo-labelled testimonials, FAQ, lead capture, newsletter and contact.
- Six configurable membership plans with USD formatting, benefits, access permissions and booking eligibility.
- Responsive mobile navigation, loading/error/empty states and accessible forms.

### Authentication & profiles

- Registration, login, logout, one-click demo email verification, password-reset request and reset-token flow.
- Salted `scrypt` password hashing, signed `httpOnly` session cookies and server-side role guards (`member`, `trainer`, `admin`).
- Customer profile, contact details, profile-photo URL field, membership status, booking history and payment history.
- Supabase Auth/SSR adapters are prepared for production; see `docs/supabase.md`.

### Smart booking engine

- Date + category filtering, live remaining capacity (`6 SPOTS AVAILABLE`), automatic disable at capacity.
- Confirm, cancel and reschedule eligible bookings.
- Server-side revalidation of capacity, duplicate-booking protection, time-conflict checks and idempotency keys.
- Demo paid sessions create a clearly labelled **simulated** payment; a failure simulation verifies no charge and no confirmed booking.
- `supabase/migrations/0001_init.sql` contains the production-grade SQL equivalent: `SELECT … FOR UPDATE`, advisory transaction lock, partial unique index and `book_session()` transaction function.

### Customer dashboard

- Welcome, active membership + expiration, upcoming sessions, available slots, booking history, payment history, upgrade suggestions, notifications, account settings, referral code and feedback.
- Recharts visualisation and premium card system.

### Admin control center

- 9 business metrics and 5 chart families (revenue, membership growth, booking trends, registrations, plan performance).
- Customer search + activate/suspend, booking cancel, editable plan prices/benefits/durations, schedule creation, capacity control, holiday blocking, payment transactions with downloadable demo receipts, staff management, promotions, campaigns, leads, newsletter, feedback, referrals, notification outbox and integration settings.

### Integrations & growth

- Stripe test-mode Checkout architecture, signed webhook verification, idempotent event processing and refund status.
- Configurable email adapter (Resend/SMTP) with an honest queued/skipped outbox; SMS and push are future integrations.
- Referral codes, promo codes, special offers, lead capture, newsletter, campaigns, retention signals and feedback.

---

## Architecture

```
src/
├── app/
│   ├── (marketing)/     Landing, membership, smart booking
│   ├── (auth)/          Login, register, password reset
│   ├── (member)/        Dashboard, profile
│   ├── admin/           Business control center
│   ├── api/             Stripe webhook + health
│   └── actions.ts       All guarded server actions
├── components/          ui, layout, marketing, booking, dashboard, admin, charts
├── lib/
│   ├── demo/store.ts    Transactional demo domain layer + seed
│   ├── auth/            Sessions, registration, guards
│   ├── supabase/        Browser, server and admin clients
│   ├── stripe.ts        Lazy test-mode client
│   ├── notifications.ts Configurable email adapter
│   ├── validation.ts    Zod schemas
│   └── security.ts      scrypt + HMAC helpers
├── modules/             Reserved domain module boundaries
├── types/               Domain + database types
supabase/
├── migrations/0001_init.sql   Tables, indexes, RLS, booking function
├── seed.sql                  Clearly labelled demo data
└── policies/README.md        Access-control notes
docs/                   Architecture, setup, Supabase, Stripe, testing, demo data
tests/                  Vitest workflow tests
```

The running demo uses `src/lib/demo/store.ts` (a `globalThis` singleton seeded with realistic data). Every mutation goes through server actions and Zod validation. Swapping the store for the prepared Supabase clients is a configuration change, documented in `docs/supabase.md`.

---

## Scripts

| Command                                          | Purpose                         |
| ------------------------------------------------ | ------------------------------- |
| `npm run dev`                                    | Start Next.js on `0.0.0.0:3000` |
| `npm run build`                                  | Production build                |
| `npm run start`                                  | Serve the production build      |
| `npm run typecheck`                              | `tsc --noEmit`                  |
| `npm run lint`                                   | ESLint                          |
| `npm run format` / `format:check`                | Prettier                        |
| `npm test`                                       | Vitest workflow tests           |
| `npm run validate`                               | typecheck + lint + test + build |
| `npm run db:migrate` / `db:seed` / `db:generate` | Supabase helper messages        |

---

## Environment

Copy `.env.example` to `.env.local`. It contains **placeholders only**:

- `AUTH_SECRET`, `NEXT_PUBLIC_APP_URL`, `DEMO_MODE`
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_DB_URL`
- `STRIPE_SECRET_KEY` (`sk_test_…`), `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (`pk_test_…`), `STRIPE_WEBHOOK_SECRET` (`whsec_…`)
- `EMAIL_PROVIDER`, `RESEND_API_KEY`, `EMAIL_FROM`, `SMTP_*`

`.gitignore` excludes `.env`, `.env.*`, keys, certificates, logs, build output and local scratch files. `.env.example` is explicitly allowed. **Never commit real credentials.** No raw card numbers are ever stored or handled by the application.

---

## Security & reliability

- Server-side role guards on every protected page and action.
- Zod validation on all external input.
- Signed, `httpOnly`, `sameSite=lax` session cookies; production cookies are `secure`.
- Stripe webhook signature verification before any state change; event ids are deduplicated.
- Idempotency keys on bookings and payments; partial unique index in SQL for active bookings.
- Duplicate/overbooking prevention with slot-row locking in the SQL engine.
- Row Level Security, `security definer` role lookup and a role-escalation trigger.
- Centralised error handling, clear empty/loading/error states and meaningful messages.
- No API keys, secret keys or private credentials in frontend code.

---

## Testing

```bash
npm test
npm run validate
```

Vitest covers: registration/login helpers, membership purchase, session booking, capacity reached, double-booking prevention, idempotency, payment success/failure, cancellation, rescheduling, admin schedule/capacity management, membership expiration, Stripe webhook idempotency, plan editing and growth forms. See `docs/testing.md`.

---

## Deployment (not performed)

The project is Vercel-ready: `npm run build`, set the environment variables above, apply `supabase/migrations/0001_init.sql` + `supabase/seed.sql`, and configure the Stripe webhook to `https://<domain>/api/stripe/webhook`. **This task intentionally stops before deployment.**

---

## Demo-data disclaimer

Every plan price, testimonial, customer, metric, staff member, lead, address and phone number is sample data pending business-owner approval. Simulated payments are labelled `DEMO ONLY` and never represent a real charge. Replace licensed photography and verified reviews before commercial launch.

## License

MIT — see `LICENSE`.
