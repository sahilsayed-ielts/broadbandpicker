# Affiliate UX/functionality benchmark

Generated 2026-09-04. Companion to `page-category-ux-ctr-plan.md`.

What actual broadband affiliate and comparison sites build -- filters, alerts, quizzes, chat, trust signals -- checked against our own key page templates, regardless of whether that template is currently a GSC winner. This is a direct site-by-site scrape (no SerpApi, no query dependency), so it covers sites the query-driven benchmark never happens to surface.

Sites scanned: 23/23 readable.

## Our key pages checked

| Page type | Path | HTTP |
|---|---|---|
| Homepage | `/` | 200 |
| Deals hub | `/deals` | 200 |
| Postcode and local | `/postcode/london` | 200 |
| Provider review | `/providers/bt` | 200 |
| Provider vs provider | `/providers/compare/ee-vs-talktalk` | 200 |
| Provider deals page | `/providers/bt/deals` | 200 |
| Interactive tool | `/speed-test` | 200 |
| Compare tool | `/compare` | 200 |

## Feature prevalence and gaps

| Feature | Sites that have it | We have it on | Missing on | Gap? |
|---|---|---|---|---|
| Filter controls (speed / price / contract / provider) | 9/15 (60%) | /deals | /compare, /postcode/london | **GAP** |
| Sort by (cheapest / fastest / rating) | 8/15 (53%) | /deals | /compare, /postcode/london | **GAP** |
| 'X deals available / compared' count | 7/15 (47%) | /deals | /compare, /postcode/london | **GAP** |
| Save / shortlist a deal | 6/13 (46%) | none | /compare, /deals, /providers/bt | **GAP** |
| Load more / pagination on long result lists | 3/10 (30%) | none | /compare, /deals |  |
| Trustpilot / Feefo / press-mention badges | 3/11 (27%) | /providers/bt | /, /deals |  |
| How-we-compare / methodology link near the table | 2/10 (20%) | /compare, /deals, / | — |  |
| Live chat / chat-to-an-advisor widget | 3/16 (19%) | none | /postcode/london, /deals, /providers/bt |  |
| Address-level lookup after postcode | 2/13 (15%) | none | /postcode/london, /, /deals |  |
| Broadband-only / +TV / +mobile tabs | 1/8 (12%) | none | /providers/bt/deals, /deals |  |
| Existing vs new customer toggle | 1/11 (9%) | none | /providers/bt/deals, /deals, /providers/bt |  |
| Speed slider / minimum-speed filter | 0/10 (0%) | none | /compare, /deals |  |
| Add-to-compare basket (pick N, compare side by side) | 0/10 (0%) | /compare | /deals |  |
| Price / deal alert signup | 0/13 (0%) | /postcode/london, /deals | — |  |
| Match quiz / 'find my perfect broadband' wizard | 0/8 (0%) | none | /, /deals |  |
| Offer-ends countdown / urgency signal | 0/8 (0%) | none | /providers/bt/deals, /deals |  |
| Video review / explainer embed | 0/3 (0%) | none | /providers/bt |  |
| Request-a-callback form | 0/11 (0%) | none | /deals, /providers/bt |  |

## Recommendations

**P1 · Filter controls (speed / price / contract / provider)**

Lets a visitor narrow a long results list themselves instead of scrolling a national table.

- Evidence: 9/15 relevant affiliate sites have this (60%): bestbroadbanddeals.co.uk, broadband.co.uk, cable.co.uk, choose.co.uk, uswitch.com.
- Already on: /deals.
- Missing on: /compare, /postcode/london

**P1 · Sort by (cheapest / fastest / rating)**

Cheapest-first is the default almost everyone expects on a comparison table.

- Evidence: 8/15 relevant affiliate sites have this (53%): broadband.co.uk, cable.co.uk, choose.co.uk, uswitch.com.
- Already on: /deals.
- Missing on: /compare, /postcode/london

**P1 · 'X deals available / compared' count**

A concrete number reads as more trustworthy than an open-ended table.

- Evidence: 7/15 relevant affiliate sites have this (47%): broadband.co.uk, cable.co.uk, uswitch.com.
- Already on: /deals.
- Missing on: /compare, /postcode/london

**P1 · Save / shortlist a deal**

Lets a visitor who isn't ready to switch today come back to the same shortlist.

- Evidence: 6/13 relevant affiliate sites have this (46%): cable.co.uk, confused.com, uswitch.com.
- Missing on: /compare, /deals, /providers/bt


## What we already match or beat

- Trustpilot / Feefo / press-mention badges -- present on /providers/bt
- How-we-compare / methodology link near the table -- present on /compare, /deals, /
- Add-to-compare basket (pick N, compare side by side) -- present on /compare
- Price / deal alert signup -- present on /postcode/london, /deals

