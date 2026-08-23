# Analytics measurement and reporting loop

## GA4 event contract

| Event | Trigger | Key parameters | Primary question |
| --- | --- | --- | --- |
| `postcode_submit` | A valid postcode is submitted | `postcode_area`, `component_size`, `destination_path` | Which entry points start local-deal journeys? |
| `speed_test_started` | A speed test begins | attribution and page context | How many visitors begin the tool? |
| `speed_test_completed` | All test phases complete | `ping_ms`, `download_mbps`, `upload_mbps`, `speed_band` | What is completion rate and what results lead to comparison? |
| `speed_test_failed` | The test fails | attribution and page context | Is reliability suppressing completion? |
| `deal_filter_changed` | A deal filter changes or clears | `filter_name`, `filter_value` | Which constraints matter to shoppers? |
| `deal_sort_changed` | Deal ordering changes | `sort_order`, `visible_deals` | How do visitors evaluate the table? |
| `compare_shortlist_added` | A provider is added to the compare shortlist | `provider_slug`, `shortlist_size` | Which providers reach a shopper's final consideration set? |
| `compare_shortlist_removed` | A provider is removed from the shortlist | `provider_slug`, `shortlist_size` | Which providers are rejected during comparison? |
| `compare_shortlist_cleared` | The shortlist is cleared | attribution and page context | How often do shoppers restart their decision? |
| `compare_shortlist_limit_reached` | A visitor tries to select more than three providers | `shortlist_size` | Is the three-provider comparison limit causing friction? |
| `compare_basket_viewed` | A visitor opens their side-by-side finalists | `shortlist_size`, `provider_slugs` | Which consideration sets reach active comparison? |
| `outbound_provider_click` | An affiliate CTA is clicked | `provider_slug`, `source_page`, `postcode_area`, `outbound_host`, `link_label` | Which journeys create qualified provider visits? |

Every event also carries a session-scoped `journey_id`, first `landing_page`, `referrer_host`,
`utm_source`, `utm_medium`, `utm_campaign` and current `page_path`. Full postcodes are never sent
to GA4. Only the outward postcode area is used.

## GA4 setup

1. Register only low-cardinality custom parameters needed in reports, such as `postcode_area`,
   `component_size`, `speed_band`, `filter_name`, `filter_value`, `sort_order`, `provider_slug`,
   `shortlist_size`, `outbound_host` and `link_label`, as event-scoped custom dimensions. Use
   GA4's built-in page, landing-page, referrer and campaign dimensions instead of duplicating them.
   Do not register `journey_id` or the comma-separated `provider_slugs` value as custom dimensions
   because their high cardinality can degrade reporting.
2. Register `ping_ms`, `download_mbps`, `upload_mbps` and `visible_deals` as custom metrics.
3. Mark `outbound_provider_click` as a key event. Keep `postcode_submit` and
   `speed_test_completed` as secondary journey events unless business reporting requires otherwise.
4. Build a funnel exploration: landing/session start → postcode submit or speed-test completion →
   filter/sort or shortlist engagement → side-by-side comparison → outbound provider click.

## Weekly reporting loop

1. Export GSC query and page performance for the last 28 days and compare it with the preceding
   28 days. Separate brand, provider, comparison, guide, local and tool route families.
2. Review GA4 event counts, unique users and completion rates by landing page and device category.
3. Join decisions at page/route-family level, not user level: prioritise pages with growing search
   demand but weak engagement, and fix journeys with strong engagement but weak outbound clicks.
4. Record the decision, owner and review date in the master tracker. Do not change priority from a
   single low-volume week; use at least 28 days unless a release introduced an obvious regression.

## Release validation

After production deployment and analytics consent:

1. Use GA4 DebugView or Realtime to submit a valid postcode, complete a speed test, change each
   deal filter, change the sort order and click a non-production/test-safe provider CTA if permitted.
2. Confirm each event arrives once with the expected parameters and no full postcode or email.
3. Confirm a returning visitor with stored consent remains granted after a page reload.
4. Recheck after 24 hours in standard GA4 reports because DebugView does not prove processing into
   reporting tables.
