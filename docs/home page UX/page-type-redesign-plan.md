# BroadbandPicker page-type UX redesign plan

Generated 2026-10-14 from `scripts/plan_page_type_redesign.py`.

## Decision

**Redesign the editorial guide template first.** It has the strongest combined Search Console reach, GA4 organic use, AI-referral signal and per-page leverage.

Evidence window: GSC **2026-09-14 to 2026-10-11**.

| Rank | Page category | Decision score | GSC impressions | GSC clicks | CTR | GA4 organic sessions | AI referrals | Sessions/page |
|---:|---|---:|---:|---:|---:|---:|---:|---:|
| 1 | Editorial guide | 90.1 | 61,126 | 131 | 0.21% | 220 | 8 | 3.24 |
| 2 | Postcode and local | 59.6 | 23,395 | 260 | 1.11% | 158 | 5 | 0.09 |
| 3 | Compare tool | 33.8 | 1,496 | 2 | 0.13% | 131 | 4 | 65.50 |
| 4 | Interactive tool | 32.2 | 9,139 | 14 | 0.15% | 113 | 1 | 28.25 |
| 5 | Provider vs provider | 25.4 | 12,569 | 81 | 0.64% | 51 | 0 | 1.82 |
| 6 | Provider review | 24.4 | 18,321 | 54 | 0.29% | 40 | 0 | 1.74 |
| 7 | Deals hub | 12.1 | 3,472 | 0 | 0.00% | 3 | 0 | 3.00 |
| 8 | Original research | 8.6 | 2,257 | 4 | 0.18% | 4 | 0 | 2.00 |
| 9 | Provider deals page | 0.1 | 197 | 0 | 0.00% | 0 | 0 | 0.00 |

The postcode template has the most clicks, but those clicks are spread over a very large URL inventory. The guide template has 61,126 impressions and 220 organic sessions across only 68 ranking pages, so one well-tested template improvement affects a much stronger page on average.

## What the redesign must achieve

1. Answer the search question immediately, before navigation-heavy or promotional material.
2. Let comparison-intent visitors move from advice to a suitable deal without losing context.
3. Make evidence, dates, authorship and methodology visible at the point claims are made.
4. Create concise, source-backed answer blocks that search engines and AI systems can quote accurately.
5. Keep commercial actions clear and useful without disguising affiliate links as editorial conclusions.
6. Preserve accessibility, mobile performance and calm reading flow.

## Desktop wireframe

```text
┌──────────────────────────────────────────────────────────────────────┐
│ Breadcrumbs                                      Updated · Reviewed  │
├──────────────────────────────────────────────────────────────────────┤
│ H1: direct search-intent title                                     │
│ 2-line standfirst + author + editorial methodology                  │
│ [Quick answer / verdict]          [Check deals by postcode]          │
├──────────────────────────────────────────────────────────────────────┤
│ On this page: Answer · Compare · Costs · How to choose · FAQs        │
├───────────────────────────────────────┬──────────────────────────────┤
│ MAIN ARTICLE                          │ STICKY DECISION PANEL         │
│ Question-shaped H2                    │ Your postcode                │
│ 40–70 word quotable answer            │ [________] [Check]           │
│ Evidence/source note                  │ Why we ask                    │
│                                       │ Affiliate disclosure          │
│ Comparison table / decision cards     │                              │
│ [Best value] [Fastest] [Flexible]     │                              │
│                                       │                              │
│ How to choose + trade-offs            │                              │
│ FAQs + related guides                 │                              │
└───────────────────────────────────────┴──────────────────────────────┘
```

## Mobile wireframe

```text
┌────────────────────────────┐
│ Breadcrumbs                │
│ H1                         │
│ Updated · Author           │
│ ┌────────────────────────┐ │
│ │ Quick answer/verdict   │ │
│ └────────────────────────┘ │
│ [Check deals by postcode]  │
│ [Jump to section ▾]        │
│                            │
│ Question-shaped H2         │
│ Short answer + evidence    │
│                            │
│ Swipeable decision cards   │
│ [Best value] [Fastest] →   │
│                            │
│ Full explanation           │
│ FAQ                        │
├────────────────────────────┤
│ Sticky: [Check deals]      │
└────────────────────────────┘
```

## Component plan

| Order | Component | UX purpose | Rule |
|---:|---|---|---|
| 1 | Breadcrumb + freshness row | Orientation and trust | Use real reviewed dates only; never auto-bump dates. |
| 2 | Intent-matched hero | Confirm the visitor is in the right place | H1, short standfirst, author/reviewer and no intrusive ad above it. |
| 3 | Quick answer | Reduce time to value and support GEO | 40–70 words, specific answer, named evidence and limitations. |
| 4 | Contextual postcode action | Move advice readers toward relevant deals | Ask once, explain why availability varies, preserve article position. |
| 5 | Sticky/jump navigation | Make long guides manageable | Collapse to a select-style control on mobile. |
| 6 | Decision table/cards | Help users compare, not merely read | Show price, speed, contract, setup fee, rises and availability caveat. |
| 7 | Evidence-led sections | Build confidence | Question-shaped H2 followed by direct answer, then detail and source. |
| 8 | Related decision tools | Continue the user journey | Maximum three links, selected by intent rather than generic popularity. |
| 9 | FAQ | Resolve last objections | Visible answers; schema only when the same FAQ is visible on-page. |
| 10 | Mobile sticky CTA | Keep the next action reachable | One calm CTA; hide when the postcode form is in view. |

## Competitor and SERP evidence

- **openreach.com** — best rank 1, query coverage 1, AI citations 2; pattern source: `https://www.openreach.com/fibre-broadband/ultrafast-full-fibre-broadband`.
- **openreach.com** — best rank 1, query coverage 1, AI citations 1; pattern source: `https://www.openreach.com/fibre-checker`.
- **uswitch.com** — best rank 4, query coverage 1, AI citations 2; pattern source: `https://www.uswitch.com/broadband/guides/full-fibre-broadband/`.
- **uswitch.com** — best rank 3, query coverage 1, AI citations 0; pattern source: `https://www.uswitch.com/broadband/guides/which-broadband-provider-has-best-value-for-money/`.
- **uswitch.com** — best rank 99, query coverage 0, AI citations 2; pattern source: `https://www.uswitch.com/broadband/compare/fibre_optic/`.
- **connectfibre.co.uk** — best rank 1, query coverage 2, AI citations 0; pattern source: `https://www.connectfibre.co.uk/`.

Detected template gaps:
- Question-shaped H2s (PAA match): competitor average 8.8

Patterns to adapt, not copy: direct question-led headings, visible freshness and authorship, compact comparison modules, postcode-aware next actions, restrained sticky navigation and clear evidence links.

## Pilot pages

Start with three different guide intents so the template is proven rather than tailored to one article:

- `/guides/best-phone-and-broadband-deals` — 13,671 impressions, 2 clicks, 0.01% CTR, position 52.6.
- `/guides/broadband-and-mobile-bundle-discounts-uk` — 8,954 impressions, 13 clicks, 0.15% CTR, position 51.3.
- `/guides/best-full-fibre-broadband-uk` — 6,058 impressions, 8 clicks, 0.13% CTR, position 31.6.

## Delivery sequence

1. Build reusable guide-shell components behind a feature flag.
2. Apply them to the three pilot guides without rewriting factual content at the same time.
3. Run accessibility, mobile, Core Web Vitals and affiliate-link disclosure checks.
4. Deploy the pilots and annotate the release date.
5. Compare 28 days before vs 28 days after, allowing a three-day GSC lag.
6. Roll out only the components that improve user or commercial outcomes without hurting search visibility.

## Measurement contract

| Outcome | Primary metric | Guardrail |
|---|---|---|
| Better search acquisition | GSC clicks and CTR by pilot URL | Impressions and average position must not materially decline. |
| Better comprehension | GA4 engaged-session rate and engagement time | No rise in immediate exits from the hero. |
| Better commercial journey | `postcode_submit` and `outbound_provider_click` users/session | Affiliate disclosure remains visible and clicks remain intentional. |
| Better navigation | Jump-nav use and 75%/90% scroll reach | Avoid event inflation from repeated taps. |
| Better GEO visibility | AI referral visits and citation checks | Claims remain source-backed and human-reviewed. |
| Better mobile UX | Mobile conversion and CWV | No regression in LCP, INP or CLS. |

## Explicit non-goals

- Do not clone a competitor’s wording, branding or layout pixel-for-pixel.
- Do not add fake urgency, invented ratings or unverified prices.
- Do not increase CTA count simply to chase clicks.
- Do not roll the template across every guide before pilot evidence exists.
