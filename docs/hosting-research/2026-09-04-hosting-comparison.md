# Hosting alternatives to Vercel

Generated 2026-09-04 by `scripts/research_hosting_alternatives.py`.

Static-HTML scrape of each provider's own pricing/docs pages (no JS execution, no API keys) -- a dated snapshot to sanity-check, not a quote. Marketing pricing pages change often and some figures live behind a calculator widget this scrape can't run; those are flagged as `verify manually` below rather than guessed.

## What this app actually needs from a host

- Next.js 16 App Router build support (not just static export)
- Server-side API routes (contact form, IndexNow ping, partner onboarding, speed-test proxy endpoints)
- Git push to main -> automatic production build and deploy, no manual step
- Automatic preview deployment per branch/PR
- Custom domain with managed SSL
- Environment variables set via dashboard (Supabase, GA4, Awin, SerpApi keys)
- Predictable cost at low-to-moderate traffic (current site is pre-scale)

## Feature signal matrix (scraped)

| Provider | Next.js | SSR/ISR | Git deploy | Preview deploys | Edge/serverless fn | Free tier | Bandwidth mentioned |
|---|---|---|---|---|---|---|---|
| Vercel (current) | yes | yes |  | yes |  | yes | yes |
| Netlify | yes | yes | yes | yes | yes | yes | yes |
| Cloudflare Workers/Pages | yes |  |  | yes | yes | yes | yes |
| AWS Amplify Hosting |  | yes |  |  | yes | yes | yes |
| Railway |  |  |  | yes |  | yes |  |
| Render |  |  | yes |  | yes | yes | yes |
| DigitalOcean App Platform |  |  |  |  | yes | yes | yes |
| Fly.io |  |  |  |  |  |  | yes |
| Self-hosted VPS + Coolify |  |  | yes |  |  |  |  |

## Per-provider detail

### Vercel (current)

Baseline -- built by the Next.js authors, first-party feature support is always current.

- Homepage: https://vercel.com
- Fetched: https://vercel.com/pricing
- **Could not fetch (verify manually): https://vercel.com/docs/frameworks/nextjs**
- Price figures found on page: $0 /mo, $20 /mo, $20 , $2 , $0.15 , $0.50 , $1 , $0.40 , $4 , $50 , $0.023 , $5 
- Bandwidth/data-transfer mentions:
  - “cluded then starting at $2 per 1m custom fast data transfer 100 gb / month included 1tb / month included then starting at $0”
  - “ons 2k / month included $5 per 1m custom blob data transfer 10 gb / month included starting at $0”
  - “60 per 1m custom sandbox data transfer 20 gb / month included starting at $0”

### Netlify

Closest like-for-like workflow to Vercel: same git-push model, its own Next.js runtime for SSR/ISR/API routes.

- Homepage: https://www.netlify.com
- Fetched: https://www.netlify.com/pricing/, https://docs.netlify.com/frameworks/next-js/overview/
- Price figures found on page: $0 , $9 /mo, $20 /mo, $5 , $10 , $40 , $15 , $9/mo

### Cloudflare Workers/Pages

No bandwidth charges at all (the single biggest structural cost difference vs Vercel/Netlify) via the OpenNext Cloudflare adapter for Next.js.

- Homepage: https://pages.cloudflare.com
- Fetched: https://pages.cloudflare.com/, https://developers.cloudflare.com/pages/platform/limits/, https://developers.cloudflare.com/workers/platform/pricing/
- Price figures found on page: $5 , $0.30 , $0.02 , $5.00 , $1.50 , $8.00 , $0 , $0.00 , $1.99 , $6.99 , $27.00 , $13.40 

### AWS Amplify Hosting

Full SSR support, pay-as-you-go; more AWS console/IAM overhead than the others.

- Homepage: https://aws.amazon.com/amplify/
- Fetched: https://aws.amazon.com/amplify/pricing/
- Price figures found on page: $200 , $0.01 , $0.025 , $0.10 , $0.023 , $0.15 , $0.30 , $0.20 , $15/mo, $6 , $0.023, $1.97 
- Bandwidth/data-transfer mentions:
  - “s until the app is deleted) data transfer out no cost up to 15 gb per month $0”

### Railway

Runs Next.js as a normal Node server (not edge-split); usage-based, simple git deploys.

- Homepage: https://railway.com
- Fetched: https://railway.com/pricing
- Price figures found on page: $ 0 per month, $5 , $1 per month, $ 5 , $ 20 , $20 , $ 0.00000386 , $ 0.00000772 , $ 0.00000006 , $ 0.05 , $ 0.015 , $1,000 
- Bandwidth/data-transfer mentions:
  - “ree free free bucket egress free free free free max storage 50 gb during trial, then 10 gb 1 tb unlimited unlimited networkin”

### Render

Same Node-server model as Railway; predictable flat-fee web-service tiers.

- Homepage: https://render.com
- Fetched: https://render.com/pricing
- Price figures found on page: $10, $100, $ 0 /mo, $ 25 /mo, $ 499 /mo, $0.25, $0/mo, $7/mo, $25/mo, $85/mo, $135/mo, $200/mo
- Bandwidth/data-transfer mentions:
  - “in touch connect your repo, and go deploy up to 25 services 5 gb of bandwidth included single-service previews global region”
  - “rt all hobby features, plus: unlimited seats &amp; services 25 gb bandwidth included full-stack previews horizontal autoscali”
  - “pace audit logs all pro features, plus: multiple workspaces 1 tb of bandwidth included extended metrics retention inbound ip”
  - “scaling — networking automatic private networking bandwidth 5 gb included per month then $0”

### DigitalOcean App Platform

PaaS on top of DO droplets; flat predictable tiers, git deploy, less edge-optimised than Vercel/Cloudflare.

- Homepage: https://www.digitalocean.com/products/app-platform
- Fetched: https://www.digitalocean.com/pricing/app-platform
- Price figures found on page: $0 /mo, $5 /mo, $ 0 , $ 5.00 , $ 10.00 , $ 12.00 , $ 25.00 , $ 50.00 , $25.00/mo, $0.02 , $7.00 , $ 3.00 

### Fly.io

Docker-based, deploys close to users globally; needs a GitHub Actions workflow for git-push deploys (not built in).

- Homepage: https://fly.io
- Fetched: https://fly.io/docs/about/pricing/
- Price figures found on page: $5, $0.15, $144, $20/mo, $1,440, $200/mo, $14,400, $2,000/mo, $36, $5/mo, $360, $50/mo

### Self-hosted VPS + Coolify

Open-source, self-hosted Vercel/Heroku alternative on your own VPS (e.g. Hetzner) -- cheapest at real scale, but you own the box.

- Homepage: https://coolify.io
- Fetched: https://coolify.io/
- No `$` figures found on the fetched page(s) -- verify manually (may be a calculator widget).

