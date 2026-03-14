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
| `CRON_SECRET` | Auth for `/api/digest` cron |

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

## Match Mode Pages

- `/browse` — Match Mode toggle button (mobile only, `lg:hidden`)
- Debug: append `?matchDebug=1` to any browse URL to see scoring overlay
