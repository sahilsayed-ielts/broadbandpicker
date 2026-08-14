# Provider Deal Agent

This repo now includes a provider deal sync worker that refreshes commercial deal fields from official provider broadband pages without rewriting page components by hand.

## What It Updates

- `data/provider-live-deals.json`
- `docs/provider-deal-sync-report.md`

The main site still uses `data/providers.ts` as the canonical provider model, but it now overlays live commercial fields from `data/provider-live-deals.json` when a provider sync succeeds.

## Fields That Can Refresh

- `affiliateUrl`
- `monthlyPriceFrom`
- `speeds`
- `contractLengths`
- `setupFee`
- `pricingVerifiedDate`
- the primary commercial source note on provider pages

## Commands

```bash
npm run deals:sync
```

Dry run:

```bash
npm run deals:sync:dry
```

Single provider:

```bash
node scripts/provider-deal-agent.mjs --provider=bt
```

## Safety Model

- The agent fetches official provider broadband pages only.
- It extracts offer candidates from embedded script payloads first, then visible text.
- It validates price, speed, and contract length before accepting an offer.
- If a provider page blocks scraping or yields no validated offers, the previous snapshot is kept.
- The report file shows which providers updated and which need manual review.

## Limitation

Not every provider exposes a clean public deal feed. Some pages are heavily client-rendered, geo-gated, or anti-bot protected. Because of that, this agent is designed to fail safe:

- successful providers update automatically
- blocked or ambiguous providers stay on their previous snapshot
- the report tells you what needs human checking
