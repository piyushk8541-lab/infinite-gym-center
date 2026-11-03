# Local setup

## Requirements

- Node.js 20+ (tested on Node 22)
- npm 10+
- Git

## Steps

```bash
npm install
cp .env.example .env.local
npm run dev
```

`http://localhost:3000` serves the full demo. No environment variable is required for the in-memory store; `AUTH_SECRET` falls back to a clearly labelled demo-only value. Set a real random secret before any non-demo use.

## Validate

```bash
npm run typecheck
npm run lint
npm test
npm run build
npm run validate
```

## Preview server

The `dev` and `start` scripts bind to `0.0.0.0`, which is required for Arena/Vercel-style proxied previews. Avoid hard-coded `localhost` URLs in browser code; use `NEXT_PUBLIC_APP_URL` or relative paths.

## Health check

`GET /api/health` reports demo mode and the configuration state of Supabase, Stripe and email without exposing secrets.
