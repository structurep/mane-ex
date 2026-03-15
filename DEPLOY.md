# ManeExchange — Deployment Guide

## Local Development

```bash
cp .env.example .env.local   # fill in real values
npm install
npm run dev                   # starts on port 3002
```

## Environment Variables

### Required (set in Vercel dashboard)

| Variable | Where |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project settings |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase project settings |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase project settings |
| `STRIPE_SECRET_KEY` | Stripe dashboard |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhooks |
| `STRIPE_PRICE_*` (4 vars) | Stripe product prices |
| `RESEND_API_KEY` | Resend dashboard |
| `RESEND_FROM_EMAIL` | Verified sender domain |

### Optional

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SITE_URL` | Canonical URL for SEO |
| `NEXT_PUBLIC_APP_URL` | App URL for emails |
| `CRON_SECRET` | Auth for cron endpoints (digest + match alerts) |

> Vercel-Supabase integration auto-injects Supabase vars at deploy time.

## Deploy to Vercel

```bash
git push origin main          # triggers auto-deploy
# or manual:
npx vercel --prod
```

## Database Migrations

```bash
npx supabase db push          # applies pending migrations to production
```

## Cron Jobs

Configured in `vercel.json`. Both require `CRON_SECRET` set in Vercel env vars.

| Endpoint | Schedule | Purpose |
|----------|----------|---------|
| `/api/cron/weekly-digest` | Mondays 1pm UTC | Weekly email digest |
| `/api/match-alerts` | Every 30 minutes | Scan active users, score recent listings, create match alerts |

The match alerts cron:
- Protected by `Authorization: Bearer <CRON_SECRET>` header
- Scans users with interactions in the last 3 days
- Scores listings published in the last 3 days
- Creates alerts for listings scoring >= 70% match
- Idempotent (upsert with `ignoreDuplicates`)
- Caps at 100 users per run, 50 listings scored
- Returns JSON: `{ processed, alerts, duration_ms }`

## Match Mode Pages

- `/browse` — Match Mode toggle button (mobile only, `lg:hidden`)
- Debug: append `?matchDebug=1` to any browse URL to see scoring overlay
