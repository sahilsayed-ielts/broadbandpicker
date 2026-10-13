# Onestream — affiliate implementation research

_Reviewed 13 October 2026 for BroadbandPicker publisher 2942019._

## Programme verification

- Awin advertiser: Onestream
- Advertiser ID: 23296
- Relationship: Joined
- Programme status: Active
- Primary market: United Kingdom
- Sector: Internet Service Provider
- Approved domains: `onestream.co.uk` and `*.onestream.co.uk`
- Live destination: `https://onestream.co.uk/`

The live Awin API changed this relationship from Pending to Joined on 13 October 2026. A publisher-specific deep link was generated through Awin's Link Builder API before implementation.

## Audience fit

Onestream is a strong fit for BroadbandPicker's UK residential-broadband audience. Its official site currently leads with an address checker, a 35 Mbps entry offer shown at £18.50 per month, unlimited downloads, simple switching and speeds up to 1,000 Mbps. The provider uses Openreach and offers both part-fibre and full-fibre services, so its relevance is highest on price-led comparisons, shorter-contract/student guidance, Openreach comparisons and the dedicated Onestream review.

Fit score: **9/10**. It is directly within the site's core category, has broad address-level relevance and gives users a clear next step. The score is not 10 because availability, final prices, setup costs, add-ons and speed vary by address, and the site must not present a national headline as a guaranteed personal offer.

## Editorial and consumer safeguards

- Keep editorial rankings independent of commission.
- Send users to the clean Onestream homepage/address checker rather than an unverified offer URL.
- Describe headline prices as dated “from” prices and require an address check.
- Tell readers to verify scheduled price rises, setup fees, router terms and optional extras.
- Do not claim that clicking alone earns commission; a qualifying, validated order is required.
- Place a clear affiliate disclosure next to focused Onestream calls to action.
- Use `rel="sponsored"` on affiliate links.

## Awin implementation applied

- Central provider link uses the Awin deep-link format with advertiser ID 23296 and publisher ID 2942019.
- The shared `AffiliateCTA` adds six placement-specific ClickRefs, a campaign value and a source URL at click time.
- ClickRef values are descriptive, lowercase-safe and capped at 50 characters.
- The shared component records GA4 outbound clicks and marks links `sponsored`, `noopener` and `noreferrer`.
- Because provider and deal pages read from the central provider record, the approved link now propagates to the Onestream review, provider directory cards, comparison tables, deal tables, saved deals and match-tool results wherever Onestream is actually displayed.

## Sources checked

- Awin live Publisher API programme record and Link Builder response, 13 October 2026.
- Awin Help: Link Builder deep links, ClickRef best practice, tracking methods and link-status guidance.
- ASA/CAP guidance on making affiliate advertising obviously identifiable.
- Onestream official homepage, broadband availability journey, switching guide, legal hub and residential price guide.
