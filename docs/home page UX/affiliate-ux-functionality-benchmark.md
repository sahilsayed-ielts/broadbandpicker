# Affiliate UX/functionality benchmark

Generated 2026-10-14. Companion to `page-category-ux-ctr-plan.md`.

What actual broadband affiliate and comparison sites build -- filters, alerts, quizzes, chat, trust signals -- checked against our own key page templates, regardless of whether that template is currently a GSC winner. This is a direct site-by-site scrape (no SerpApi, no query dependency), so it covers sites the query-driven benchmark never happens to surface.

Sites scanned: 22/23 readable; blocked or bot-walled: forbes.com/advisor.

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
| Filter controls (speed / price / contract / provider) | 9/14 (64%) | /deals | /compare, /postcode/london | **GAP** |
| Sort by (cheapest / fastest / rating) | 8/14 (57%) | /deals | /compare, /postcode/london | **GAP** |
| 'X deals available / compared' count | 8/14 (57%) | /deals | /compare, /postcode/london | **GAP** |
| Save / shortlist a deal | 6/12 (50%) | none | /deals, /providers/bt, /compare | **GAP** |
| Load more / pagination on long result lists | 3/9 (33%) | none | /deals, /compare |  |
| Address-level lookup after postcode | 2/12 (17%) | none | /deals, /, /postcode/london |  |
| Broadband-only / +TV / +mobile tabs | 1/7 (14%) | none | /deals, /providers/bt/deals |  |
| Offer-ends countdown / urgency signal | 1/7 (14%) | none | /deals, /providers/bt/deals |  |
| Live chat / chat-to-an-advisor widget | 2/15 (13%) | none | /deals, /providers/bt, /postcode/london |  |
| How-we-compare / methodology link near the table | 1/9 (11%) | /deals, /, /compare | — |  |
| Trustpilot / Feefo / press-mention badges | 1/10 (10%) | /providers/bt | /deals, / |  |
| Speed slider / minimum-speed filter | 0/9 (0%) | none | /deals, /compare |  |
| Add-to-compare basket (pick N, compare side by side) | 0/9 (0%) | /compare | /deals |  |
| Price / deal alert signup | 0/12 (0%) | /deals, /postcode/london | — |  |
| Match quiz / 'find my perfect broadband' wizard | 0/7 (0%) | none | /deals, / |  |
| Existing vs new customer toggle | 0/10 (0%) | none | /deals, /providers/bt/deals, /providers/bt |  |
| Video review / explainer embed | 0/3 (0%) | none | /providers/bt |  |
| Request-a-callback form | 0/10 (0%) | none | /deals, /providers/bt |  |

## Recommendations

**P1 · Filter controls (speed / price / contract / provider)**

Lets a visitor narrow a long results list themselves instead of scrolling a national table.

- Evidence: 9/14 relevant affiliate sites have this (64%): bestbroadbanddeals.co.uk, broadband.co.uk, cable.co.uk, choose.co.uk, uswitch.com.
- Already on: /deals.
- Missing on: /compare, /postcode/london

**P1 · Sort by (cheapest / fastest / rating)**

Cheapest-first is the default almost everyone expects on a comparison table.

- Evidence: 8/14 relevant affiliate sites have this (57%): broadband.co.uk, cable.co.uk, choose.co.uk, uswitch.com.
- Already on: /deals.
- Missing on: /compare, /postcode/london

**P1 · 'X deals available / compared' count**

A concrete number reads as more trustworthy than an open-ended table.

- Evidence: 8/14 relevant affiliate sites have this (57%): broadband.co.uk, cable.co.uk, techradar.com, uswitch.com.
- Already on: /deals.
- Missing on: /compare, /postcode/london

**P1 · Save / shortlist a deal**

Lets a visitor who isn't ready to switch today come back to the same shortlist.

- Evidence: 6/12 relevant affiliate sites have this (50%): cable.co.uk, confused.com, uswitch.com.
- Missing on: /deals, /providers/bt, /compare


## What we already match or beat

- How-we-compare / methodology link near the table -- present on /deals, /, /compare
- Trustpilot / Feefo / press-mention badges -- present on /providers/bt
- Add-to-compare basket (pick N, compare side by side) -- present on /compare
- Price / deal alert signup -- present on /deals, /postcode/london

