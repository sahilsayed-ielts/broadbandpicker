# BroadbandPicker GA4 SEO measurement strategy

Generated: 2026-08-24T21:31:27.201813+00:00

## Audit outcome

The repository contains **15 distinct analytics events** and covers **64.3%** of the proposed SEO/commercial measurement contract. Code presence is not proof of reporting: production events must also be checked in Realtime and DebugView.

## Event coverage and priorities

| Priority | Journey stage | Event | Status | GA4 alignment | Decision supported |
| --- | --- | --- | --- | --- | --- |
| P0 | acquisition | `page_view` | Implemented | `page_view` | Which organic landing pages attract visits? |
| P0 | intent | `postcode_submit` | Implemented | `search` | Which landing pages start a local availability journey? |
| P0 | commercial | `outbound_provider_click` | Implemented | `select_item` | Which organic pages and providers create qualified affiliate exits? |
| P1 | tool engagement | `speed_test_started` | Implemented | `Custom event` | Do organic visitors start the speed-test tool? |
| P1 | tool engagement | `speed_test_completed` | Implemented | `Custom event` | Which landing pages produce completed tests and comparison intent? |
| P1 | consideration | `deal_filter_changed` | Implemented | `Custom event` | Which price, speed and contract constraints matter? |
| P1 | consideration | `compare_shortlist_added` | Implemented | `select_item` | Which providers enter the final consideration set? |
| P1 | consideration | `compare_basket_viewed` | Implemented | `view_item_list` | Which visits reach active side-by-side comparison? |
| P1 | lead | `contact_form_submit` | Implemented | `generate_lead` | Which acquisition sources generate contact enquiries? |
| P1 | retention | `newsletter_signup` | Missing | `sign_up` | Which SEO content builds a returning audience? |
| P1 | content engagement | `content_section_view` | Missing | `Custom event` | Which answer sections are actually reached on long editorial pages? |
| P2 | content engagement | `faq_expand` | Missing | `select_content` | Which questions reveal unmet search intent? |
| P1 | friction | `deal_results_empty` | Missing | `Custom event` | Where do postcode/filter journeys produce no useful result? |
| P1 | technical SEO | `web_vital` | Missing | `Custom event` | Which templates have poor LCP, INP or CLS for real users? |

## Metrics that should drive SEO decisions

| Area | Metrics | Break down by | Cadence |
| --- | --- | --- | --- |
| Search demand | GSC impressions, clicks, CTR and average position | Query + canonical landing page | 28 days vs previous 28 days |
| Landing quality | Organic sessions, engaged sessions, engagement rate and average engagement time | Landing page + device | Weekly |
| Intent activation | postcode_submit users / organic landing sessions | Landing page + content_type | Weekly |
| Comparison activation | filter, shortlist or comparison users / organic landing sessions | Landing page | Weekly |
| Affiliate CTR | outbound_provider_click users / organic landing sessions | Landing page + provider_slug | Weekly |
| Tool completion | speed_test_completed users / speed_test_started users | Device + browser | Weekly |
| Content depth | 90% scroll users and content_section_view reach | Landing page + section_id | Monthly after enough volume |
| SEO conversion | Key-event users / organic landing sessions | Landing page + session source/medium | 28 days vs previous 28 days |
| Technical experience | LCP p75, INP p75, CLS p75 and error rate | content_type + device | Weekly |

## Recommended GA4 administration

### Key events

Mark `outbound_provider_click`, `contact_form_submit` and the future `newsletter_signup` as key events. Treat postcode submissions, filters, scrolls and tool starts as diagnostic micro-events so the key-event rate remains commercially meaningful.

### Event-scoped custom dimensions

| Parameter | Purpose |
| --- | --- |
| `content_type` | Low-cardinality template family: guide, provider, comparison, local, tool or deal. |
| `provider_slug` | Provider involved in shortlist and affiliate interactions. |
| `postcode_area` | Outward postcode area only; never collect a full postcode. |
| `speed_band` | Result band rather than raw speed for segmentation. |
| `filter_name` | Deal constraint changed by the visitor. |
| `filter_value` | Selected low-cardinality filter value. |
| `link_label` | CTA wording used for the affiliate exit. |
| `outbound_host` | Affiliate/provider destination host. |
| `section_id` | Stable editorial section identifier, not visible copy. |

### Custom metrics

| Parameter | Purpose |
| --- | --- |
| `download_mbps` | Average speed-test download result; also report by speed_band. |
| `upload_mbps` | Average speed-test upload result. |
| `ping_ms` | Average speed-test latency. |
| `visible_deals` | Deal inventory remaining after filtering. |
| `metric_value` | Numeric Web Vital value, analysed with metric_name. |

## Weekly GSC + GA4 decision loop

1. Export 28 days of GSC URL/query data and compare it with the preceding 28 days.
2. Group canonical landing pages into guide, provider, comparison, local, tool and deal templates.
3. Join GSC and GA4 at canonical landing-page level. Do not attempt a user-level join.
4. Prioritise high-impression pages with weak CTR for title/snippet work; high-click pages with weak engagement for intent/content work; and engaged pages with weak affiliate CTR for UX, offer or CTA work.
5. Protect winners: pages with growing non-brand clicks and strong key-event rates should receive freshness, internal links and supporting-cluster content before speculative new topics.
6. Record the hypothesis, change date and expected KPI in the master tracker, then review after a full 28-day window.

## Interpretation rules

- Average position is directional, not a single fixed rank. Segment by query, page, country and device before acting.
- Engagement rate alone is not a quality verdict. A visitor can get a concise answer and leave satisfied, so pair engagement with scroll/section reach and commercial intent events.
- Affiliate clicks are a qualified-exit proxy, not confirmed revenue. Reconcile them with Awin transaction reporting where possible.
- Compare users as well as event counts so repeated filter clicks do not inflate perceived demand.
- Preserve privacy: only outward postcode areas are suitable for analytics segmentation.

## Measurement guardrails

- Never send full postcodes, names, email addresses, phone numbers or query strings containing personal data to GA4.
- Mark commercial outcomes as key events; do not mark every engagement event as a key event.
- Avoid registering journey_id, full URLs with query strings or free-text values as custom dimensions because of high cardinality.
- Use GSC for rankings, queries, impressions and CTR; use GA4 for onsite behaviour and key events. Join at canonical landing-page level.
- Use at least 28 days of data for SEO prioritisation unless diagnosing a release regression.
