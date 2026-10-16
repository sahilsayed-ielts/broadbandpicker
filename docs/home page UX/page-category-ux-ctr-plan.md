# Page-type UX benchmark for CTR and GEO

Generated 2026-10-14. Written by `scripts/analyze_page_type_ux.py`.

This brief starts from real data, not a competitor wishlist: Search Console picks the page types that are working, SerpApi shows who wins those queries in Google and in AI Overviews, and the UX scrape shows the feature gap.

- GSC window: **2026-09-14 to 2026-10-11** vs prior **2026-08-17 to 2026-09-13** (3-day lag, final data)
- SERP data: fresh SerpApi run, cached to 2026-10-14-page-ux-raw.json, 35 searches used
- Backlink/authority signal is a **proxy** (ranking ubiquity + AI citations + hand-kept domain tiers). No paid link API is wired.


## Site totals

| Metric | Last 28d | Prior 28d | Change |
|---|---|---|---|
| Impressions | 132,045 | 113,586 | +16% |
| Clicks | 546 | 237 | +130% |
| CTR | 0.41% | 0.21% | — |
| Avg position | 32.7 | 40.9 | better |

Site average position drifts down while impressions multiply because new pages enter the index at low positions. Read the per-type position change, not the site average.


## What is actually working (page-type league table)

| Type | Impr | Clicks | CTR | Avg pos | Pos vs prior | Impr/decl/new | AI refs | Winning? |
|---|---|---|---|---|---|---|---|---|
| Editorial guide | 61,126 | 131 | 0.21% | 42.2 | -6.7 (better) | 21/15/28 | 8 | yes |
| Postcode and local | 23,395 | 260 | 1.11% | 16.0 | -3.4 (better) | 595/452/621 | 5 | yes |
| Provider review | 18,321 | 54 | 0.29% | 23.5 | -5.2 (better) | 18/2/1 | 0 | yes |
| Provider vs provider | 12,569 | 81 | 0.64% | 16.0 | +0.5 (worse) | 17/6/2 | 0 | yes |
| Interactive tool | 9,139 | 14 | 0.15% | 49.7 | -16.3 (better) | 2/1/1 | 1 | yes |
| Deals hub | 3,472 | 0 | 0.00% | 55.8 | +9.3 (worse) | 0/1/0 | 0 | yes |
| Original research | 2,257 | 4 | 0.18% | 7.2 | -4.3 (better) | 2/0/0 | 0 | yes |
| Compare tool | 1,496 | 2 | 0.13% | 40.4 | -4.6 (better) | 2/0/0 | 4 | yes |
| Provider deals page | 197 | 0 | 0.00% | 22.4 | -35.4 (better) | 3/1/0 | 0 |  |
| Trust and methodology | 72 | 0 | 0.00% | 21.0 | +10.6 (worse) | 3/3/2 | 0 |  |
| Homepage | 1 | 0 | 0.00% | 5.0 | -30.9 (better) | 1/0/0 | 0 |  |

Winning = real impression share and either improving position, already near page 1, earning clicks, or getting AI referral. Those are the types the rest of this brief works on.


---

## Editorial guide

GSC: **61,126 impressions, 131 clicks, CTR 0.21%, avg position 42.2** (-6.7 vs prior 28d, better). 21 pages improving, 15 declining, 28 newly ranking.


### Our pages of this type

| Page | Impr | Clicks | CTR | Pos | Pos vs prior |
|---|---|---|---|---|---|
| `/guides/best-phone-and-broadband-deals` | 13,671 | 2 | 0.01% | 52.6 | +0.4 |
| `/guides/broadband-and-mobile-bundle-discounts-uk` | 8,954 | 13 | 0.15% | 51.3 | +0.0 |
| `/guides/best-full-fibre-broadband-uk` | 6,058 | 8 | 0.13% | 31.6 | -20.0 |
| `/guides/best-business-broadband-providers-uk` | 4,262 | 5 | 0.12% | 48.7 | -32.4 |
| `/guides/best-rolling-monthly-broadband-deals` | 2,585 | 6 | 0.23% | 38.8 | +4.7 |
| `/guides/broadband-help-if-you-claim-benefits-uk` | 2,275 | 2 | 0.09% | 59.7 | +3.7 |
| `/guides/broadband-social-tariffs-uk` | 1,912 | 4 | 0.21% | 65.7 | +9.6 |
| `/guides/best-broadband-for-students` | 1,817 | 1 | 0.06% | 50.1 | -3.5 |

### Queries these pages actually rank for (top by impressions)

`best fibre broadband`, `fibre broadband`, `unlimited phone calls and broadband packages`, `fibre optic broadband`, `full fibre broadband`, `monthly broadband`, `best broadband uk`, `student broadband deals`


### Pages that dominate these SERPs (popularity proxy)

| Page | Domain | Tier | Best rank | Query coverage | Top-3 | AI cites | Score |
|---|---|---|---|---|---|---|---|
| www.openreach.com/fibre-broadband/ultrafast-full-fibre-broadband | openreach.com | regulator/gov | 1 | 1 | 1 | 5 | 17 |
| www.openreach.com/fibre-checker | openreach.com | regulator/gov | 1 | 1 | 1 | 4 | 15 |
| www.uswitch.com/broadband/guides/full-fibre-broadband/ | uswitch.com | major comparison | 4 | 1 | 0 | 6 | 12 |
| www.uswitch.com/broadband/guides/which-broadband-provider-has-best-val… | uswitch.com | major comparison | 3 | 1 | 1 | 4 | 11 |
| www.uswitch.com/broadband/compare/fibre_optic/ | uswitch.com | major comparison | — | 0 | 0 | 6 | 11 |
| www.connectfibre.co.uk/ | connectfibre.co.uk | other | 1 | 2 | 2 | 0 | 10 |

**Page-1 titles for these queries:**

- openreach.com: Full Fibre Broadband
- openreach.com: Fibre broadband availability checker
- uswitch.com: What is full fibre broadband, and is it available in your area?
- uswitch.com: Which broadband provider has the best value for money?
- connectfibre.co.uk: Connect Fibre - Flawless Full Fibre Broadband


_UX scrape: 4 of 4 top competitor pages read. Blocked pages still count in the SERP tables above._


**People Also Ask (match these as H2s / FAQ):**

- What broadband and landline deals are available for pensioners?
- Which is the best internet fiber?
- Is full fibre broadband the best?
- What is the best Wi-Fi provider?
- Which is better, fibre or broadband?
- What are TalkTalk's current broadband and phone deals?
- What is connect fibre?
- What broadband can I get?


### UX feature matrix (ours vs the winners we could read)

| Feature | Ours | Top competitors | Gap? |
|---|---|---|---|
| Year in title | yes | 0/4 |  |
| Concise answer / verdict block up top | yes | 0/4 |  |
| Question-shaped H2s (PAA match) | 0.0 | avg 8.8 | **GAP** |
| Visible FAQ section | yes | 3/4 |  |
| FAQPage schema | yes | 3/4 |  |
| BreadcrumbList schema | yes | 4/4 |  |
| On-this-page jump links | yes | 2/4 |  |
| Visible last-updated / verified date | yes | 2/4 |  |
| Author / reviewed-by byline | yes | 2/4 |  |
| Price/speed/contract comparison table | yes | 1/4 |  |
| Pros and cons | no | 1/4 |  |
| Related links / internal linking block | yes | 0/4 |  |

### Recommendations

**P1 · Question-shaped H2s (PAA match)**

- Evidence: 4/4 top competitor pages have this (avg 8.8). Top pages for this topic: openreach.com, uswitch.com.
- GSC: 61,126 impressions, 131 clicks, avg pos 42.2 (-6.7 vs prior 28d), 21 pages improving / 15 declining.
- Apply to: `/guides/best-phone-and-broadband-deals`, `/guides/broadband-and-mobile-bundle-discounts-uk`, `/guides/best-full-fibre-broadband-uk`, `/guides/best-business-broadband-providers-uk`, `/guides/best-rolling-monthly-broadband-deals`, `/guides/broadband-help-if-you-claim-benefits-uk`

**P1 · GEO: be quotable in the AI answer**

- Evidence: 4 of 8 sampled editorial guide queries show an AI Overview; BroadbandPicker is cited in 0. Domains that do get cited: cityfibre.com, confused.com, ee.co.uk, moneysupermarket.com, openreach.com, uswitch.com.
- GSC: AI referral visits to this type in GA4: 8.
- Apply to: `/guides/best-phone-and-broadband-deals`, `/guides/broadband-and-mobile-bundle-discounts-uk`, `/guides/best-full-fibre-broadband-uk`, `/guides/best-business-broadband-providers-uk`, `/guides/best-rolling-monthly-broadband-deals`, `/guides/broadband-help-if-you-claim-benefits-uk`


---

## Postcode and local

GSC: **23,395 impressions, 260 clicks, CTR 1.11%, avg position 16.0** (-3.4 vs prior 28d, better). 595 pages improving, 452 declining, 621 newly ranking.


### Our pages of this type

| Page | Impr | Clicks | CTR | Pos | Pos vs prior |
|---|---|---|---|---|---|
| `/postcode/da1` | 2,789 | 3 | 0.11% | 9.6 | -0.5 |
| `/postcode/glasgow` | 1,152 | 5 | 0.43% | 20.1 | -16.0 |
| `/postcode/manchester` | 1,151 | 4 | 0.35% | 42.3 | -9.2 |
| `/postcode/bt1` | 943 | 0 | 0.00% | 37.7 | -14.1 |
| `/postcode/london` | 930 | 8 | 0.86% | 23.6 | -12.2 |
| `/postcode/edinburgh` | 881 | 9 | 1.02% | 21.3 | -9.6 |
| `/postcode/birmingham` | 752 | 7 | 0.93% | 28.7 | -8.8 |
| `/postcode/leeds` | 696 | 3 | 0.43% | 33.4 | -11.7 |

### Queries these pages actually rank for (top by impressions)

`broadband deals in dartford`, `broadband deals manchester`, `broadband deals in manchester`, `broadband deals belfast`, `broadband deals glasgow`, `broadband deals ni`, `broadband manchester`, `broadband deals leeds`


### Pages that dominate these SERPs (popularity proxy)

| Page | Domain | Tier | Best rank | Query coverage | Top-3 | AI cites | Score |
|---|---|---|---|---|---|---|---|
| www.moneysupermarket.com/broadband/in-manchester/ | moneysupermarket.com | major comparison | 1 | 1 | 1 | 3 | 13 |
| www.moneysupermarket.com/broadband/glasgow/ | moneysupermarket.com | major comparison | 1 | 1 | 1 | 3 | 13 |
| www.comparethemarket.com/broadband/manchester/ | comparethemarket.com | major comparison | 2 | 1 | 1 | 2 | 10 |
| www.uswitch.com/broadband/manchester/ | uswitch.com | major comparison | 4 | 1 | 0 | 5 | 10 |
| www.broadbandchoices.co.uk/broadband/glasgow | broadbandchoices.co.uk | major comparison | 2 | 1 | 1 | 2 | 10 |
| www.uswitch.com/broadband/glasgow/ | uswitch.com | major comparison | 9 | 1 | 0 | 5 | 10 |

**Page-1 titles for these queries:**

- moneysupermarket.com: Broadband deals in Manchester - October 2026
- moneysupermarket.com: Broadband deals in Glasgow October 2026
- comparethemarket.com: Compare Our BEST Broadband Deals For Manchester 2026
- uswitch.com: Broadband deals in Manchester October 2026
- broadbandchoices.co.uk: Best Broadband Deals in Glasgow
- uswitch.com: Broadband deals in Glasgow October 2026


_UX scrape: 2 of 4 top competitor pages read; blocked (bot protection): moneysupermarket.com, comparethemarket.com. Blocked pages still count in the SERP tables above._


**People Also Ask (match these as H2s / FAQ):**

- Who has the best broadband deals at the moment?
- Who has the best broadband plans?
- How much should I be paying for broadband and landline?
- Is EE or Vodafone better for broadband?
- Who has the cheapest broadband plan?
- How much should you pay for broadband per month?
- Who is the cheapest and best internet provider?
- What are the best business broadband deals available?


### UX feature matrix (ours vs the winners we could read)

| Feature | Ours | Top competitors | Gap? |
|---|---|---|---|
| Year in title | no | 2/2 | **GAP** |
| Concise answer / verdict block up top | yes | 1/2 |  |
| Visible FAQ section | yes | 1/2 |  |
| FAQPage schema | yes | 1/2 |  |
| BreadcrumbList schema | yes | 2/2 |  |
| Visible last-updated / verified date | yes | 1/2 |  |
| Postcode / availability input | yes | 2/2 |  |
| Price/speed/contract comparison table | yes | 1/2 |  |
| Card layout (not table-only) | no | 0/2 |  |
| Badges / chips (Best value, Fastest) | yes | 2/2 |  |
| Related links / internal linking block | no | 0/2 |  |
| Get Deal CTAs on page | 7.3 | avg 6.0 |  |

### Recommendations

**P0 · Year in title**

- Evidence: 2/2 top competitor pages have this. Top pages for this topic: moneysupermarket.com, comparethemarket.com.
- GSC: 23,395 impressions, 260 clicks, avg pos 16.0 (-3.4 vs prior 28d), 595 pages improving / 452 declining.
- Apply to: `/postcode/da1`, `/postcode/glasgow`, `/postcode/manchester`, `/postcode/bt1`, `/postcode/london`, `/postcode/edinburgh`

**P0 · GEO: be quotable in the AI answer**

- Evidence: 4 of 8 sampled postcode and local queries show an AI Overview; BroadbandPicker is cited in 0. Domains that do get cited: bestbroadbanddeals.co.uk, broadband.co.uk, broadbandchoices.co.uk, broadbanddeals.co.uk, broadbandproviders.co.uk, broadbandswitch.uk, comparethemarket.com, fibrus.com, gocompare.com, homemove.com, moneysupermarket.com, reddit.com, talktalk.co.uk, three.co.uk, uswitch.com, virginmedia.com.
- GSC: AI referral visits to this type in GA4: 5.
- Apply to: `/postcode/da1`, `/postcode/glasgow`, `/postcode/manchester`, `/postcode/bt1`, `/postcode/london`, `/postcode/edinburgh`


---

## Interactive tool

GSC: **9,139 impressions, 14 clicks, CTR 0.15%, avg position 49.7** (-16.3 vs prior 28d, better). 2 pages improving, 1 declining, 1 newly ranking.

_Speed tests and calculators are client-side apps; the static scrape cannot see their widgets or result flow. Treat the feature matrix below as a floor, not the full picture._


### Our pages of this type

| Page | Impr | Clicks | CTR | Pos | Pos vs prior |
|---|---|---|---|---|---|
| `/tools/speed-test` | 5,782 | 10 | 0.17% | 43.2 | +0.0 |
| `/speed-test` | 2,834 | 1 | 0.04% | 68.9 | +1.7 |
| `/tools/broadband-cost-calculator` | 481 | 2 | 0.42% | 17.2 | -12.0 |
| `/tools/broadband-match` | 42 | 1 | 2.38% | 20.6 | -15.5 |

### Queries these pages actually rank for (top by impressions)

`internet speed`, `broadband speed test`, `speed test`, `speed test wifi`, `speed test internet`, `internet speed test`, `wifi speed test`, `broadband speed checker`


### Pages that dominate these SERPs (popularity proxy)

| Page | Domain | Tier | Best rank | Query coverage | Top-3 | AI cites | Score |
|---|---|---|---|---|---|---|---|
| www.speedtest.net/ | speedtest.net | other | 1 | 4 | 4 | 2 | 21 |
| broadbandtest.which.co.uk/ | broadbandtest.which.co.uk | major comparison | 2 | 3 | 3 | 0 | 15 |
| fast.com/en/gb/ | fast.com | other | 2 | 3 | 2 | 2 | 12 |
| www.broadbandspeedchecker.co.uk/ | broadbandspeedchecker.co.uk | other | 1 | 3 | 1 | 2 | 11 |
| www.virginmedia.com/broadband/speed-test | virginmedia.com | major provider | 4 | 3 | 0 | 2 | 8 |
| www.devolo.co.uk/en/speedtest | devolo.co.uk | other | 1 | 1 | 1 | 0 | 6 |

**Page-1 titles for these queries:**

- speedtest.net: Speedtest by Ookla - The Global Broadband Speed Test
- broadbandtest.which.co.uk: Broadband speed test - Which?
- fast.com: Internet speed test
- broadbandspeedchecker.co.uk: Broadband Speed Checker - UK's No.1 Broadband Speed Test
- virginmedia.com: Broadband Speed Test – Check Download, Upload, Latency
- devolo.co.uk: Speedtest – Test your Wi-Fi speed easily


_UX scrape: 4 of 4 top competitor pages read. Blocked pages still count in the SERP tables above._


### UX feature matrix (ours vs the winners we could read)

| Feature | Ours | Top competitors | Gap? |
|---|---|---|---|
| Concise answer / verdict block up top | no | 0/4 |  |
| Visible FAQ section | yes | 0/4 |  |
| FAQPage schema | yes | 0/4 |  |
| BreadcrumbList schema | yes | 0/4 |  |
| Visible last-updated / verified date | yes | 0/4 |  |
| Interactive calculator / slider | yes | 1/4 |  |
| Related links / internal linking block | no | 0/4 |  |

### Recommendations

**P1 · GEO: be quotable in the AI answer**

- Evidence: 1 of 8 sampled interactive tool queries show an AI Overview; BroadbandPicker is cited in 0. Domains that do get cited: broadbandspeedchecker.co.uk, fast.com, koreajoongangdaily.com, speedtest.net, virginmedia.com.
- GSC: AI referral visits to this type in GA4: 1.
- Apply to: `/tools/speed-test`, `/speed-test`, `/tools/broadband-cost-calculator`, `/tools/broadband-match`


---

## Provider review

GSC: **18,321 impressions, 54 clicks, CTR 0.29%, avg position 23.5** (-5.2 vs prior 28d, better). 18 pages improving, 2 declining, 1 newly ranking.


### Our pages of this type

| Page | Impr | Clicks | CTR | Pos | Pos vs prior |
|---|---|---|---|---|---|
| `/providers/talktalk` | 2,528 | 9 | 0.36% | 28.9 | -12.5 |
| `/providers/bt` | 2,462 | 1 | 0.04% | 32.9 | -23.9 |
| `/providers/zen-internet` | 1,419 | 0 | 0.00% | 15.1 | -21.4 |
| `/providers/toob` | 1,331 | 3 | 0.23% | 13.7 | +0.1 |
| `/providers/virgin-media` | 1,208 | 0 | 0.00% | 38.2 | -7.1 |
| `/providers/vodafone` | 1,054 | 2 | 0.19% | 40.8 | -17.7 |
| `/providers/hyperoptic` | 1,053 | 5 | 0.47% | 24.3 | -26.5 |
| `/providers/brsk` | 932 | 2 | 0.21% | 26.3 | -5.8 |

### Queries these pages actually rank for (top by impressions)

`zen internet`, `connect fibre`, `vodafone broadband`, `www bt com broadband`, `zrn internet`, `zzen internet`, `zen-internet`, `zne internet`


### Pages that dominate these SERPs (popularity proxy)

| Page | Domain | Tier | Best rank | Query coverage | Top-3 | AI cites | Score |
|---|---|---|---|---|---|---|---|
| www.uswitch.com/broadband/reviews/zen-internet/ | uswitch.com | major comparison | 2 | 2 | 2 | 2 | 14 |
| www.zen.co.uk/ | zen.co.uk | other | 1 | 2 | 2 | 2 | 13 |
| uk.trustpilot.com/review/zen.co.uk | uk.trustpilot.com | forum/ugc | 3 | 2 | 2 | 0 | 9 |
| www.vodafone.co.uk/broadband | vodafone.co.uk | major provider | 1 | 1 | 1 | 0 | 8 |
| www.bt.com/broadband/deals | bt.com | major provider | 1 | 1 | 1 | 0 | 8 |
| find-and-update.company-information.service.gov.uk/company/03101568 | find-and-update.company-information.service.gov.uk | regulator/gov | 4 | 2 | 0 | 0 | 6 |

**Page-1 titles for these queries:**

- uswitch.com: Zen Internet broadband review
- zen.co.uk: Zen Internet: Top Rated Broadband Providers |Home ...
- uk.trustpilot.com: Zen Internet Reviews | Read Customer Service ...
- vodafone.co.uk: Our best broadband deals | Award winning | October 2026
- bt.com: Best BT Broadband Deals
- find-and-update.company-information.service.gov.uk: ZEN INTERNET LIMITED overview - Companies House


_UX scrape: 3 of 4 top competitor pages read; blocked (bot protection): uk.trustpilot.com. Blocked pages still count in the SERP tables above._


**People Also Ask (match these as H2s / FAQ):**

- Is Zen a good internet provider?
- Who is Zen Internet owned by?
- Is Zen better than BT?
- Which network does Zen Internet use?
- Is Connect Fibre any good?
- Who owns Connect Fibre?
- Why is Connect Fibre not working?
- Do connect fibres use Openreach?


### UX feature matrix (ours vs the winners we could read)

| Feature | Ours | Top competitors | Gap? |
|---|---|---|---|
| Year in title | yes | 1/3 |  |
| Concise answer / verdict block up top | yes | 1/3 |  |
| Question-shaped H2s (PAA match) | 3.0 | avg 2.0 |  |
| Visible FAQ section | yes | 2/3 |  |
| FAQPage schema | yes | 1/3 |  |
| BreadcrumbList schema | yes | 2/3 |  |
| On-this-page jump links | no | 1/3 | **GAP** |
| Visible last-updated / verified date | yes | 1/3 |  |
| Author / reviewed-by byline | yes | 2/3 |  |
| Postcode / availability input | yes | 1/3 |  |
| Rating / score shown | yes | 1/3 |  |
| Pros and cons | yes | 1/3 |  |
| Product / Offer schema | yes | 2/3 |  |
| Related links / internal linking block | no | 0/3 |  |
| Get Deal CTAs on page | 6.7 | avg 0.0 |  |

### Recommendations

**P0 · GEO: be quotable in the AI answer**

- Evidence: 3 of 8 sampled provider review queries show an AI Overview; BroadbandPicker is cited in 0. Domains that do get cited: en.wikipedia.org, uswitch.com, zen.co.uk.
- GSC: AI referral visits to this type in GA4: 0.
- Apply to: `/providers/talktalk`, `/providers/bt`, `/providers/zen-internet`, `/providers/toob`, `/providers/virgin-media`, `/providers/vodafone`

**P1 · On-this-page jump links**

- Evidence: 1/3 top competitor pages have this. Top pages for this topic: uswitch.com, zen.co.uk, uk.trustpilot.com.
- GSC: 18,321 impressions, 54 clicks, avg pos 23.5 (-5.2 vs prior 28d), 18 pages improving / 2 declining.
- Apply to: `/providers/talktalk`, `/providers/bt`, `/providers/zen-internet`, `/providers/toob`, `/providers/virgin-media`, `/providers/vodafone`


---

## Provider vs provider

GSC: **12,569 impressions, 81 clicks, CTR 0.64%, avg position 16.0** (+0.5 vs prior 28d, worse). 17 pages improving, 6 declining, 2 newly ranking.


### Our pages of this type

| Page | Impr | Clicks | CTR | Pos | Pos vs prior |
|---|---|---|---|---|---|
| `/providers/compare/sky-vs-virgin-media` | 1,698 | 9 | 0.53% | 17.8 | +16.8 |
| `/providers/compare/ee-vs-talktalk` | 1,641 | 22 | 1.34% | 4.9 | -1.2 |
| `/providers/compare` | 1,445 | 9 | 0.62% | 36.8 | +1.8 |
| `/providers/compare/virgin-media-vs-sky` | 1,270 | 6 | 0.47% | 24.2 | -10.9 |
| `/providers/compare/bt-vs-sky` | 857 | 1 | 0.12% | 33.6 | -16.5 |
| `/providers/compare/plusnet-vs-sky` | 830 | 5 | 0.60% | 7.7 | -0.6 |
| `/providers/compare/virgin-media-vs-vodafone` | 708 | 4 | 0.56% | 7.7 | +0.1 |
| `/providers/compare/community-fibre-vs-hyperoptic` | 702 | 6 | 0.85% | 6.6 | -0.4 |

### Queries these pages actually rank for (top by impressions)

`internet comparison`, `community fibre vs hyperoptic`, `sky vs virgin`, `best broadband uk`, `sky v virgin`, `talktalk group`, `plusnet vs sky broadband`, `virgin media vs sky`


### Pages that dominate these SERPs (popularity proxy)

| Page | Domain | Tier | Best rank | Query coverage | Top-3 | AI cites | Score |
|---|---|---|---|---|---|---|---|
| www.moneysavingexpert.com/broadband-and-tv/digital-tv-deals/ | moneysavingexpert.com | major comparison | 2 | 2 | 2 | 1 | 12 |
| www.reddit.com/r/VirginMedia/comments/1nvwq3w/thinking_of_switching_fr… | reddit.com | forum/ugc | 1 | 2 | 2 | 0 | 11 |
| bestbroadbanddeals.co.uk/providers/guides/virgin-vs-sky/ | bestbroadbanddeals.co.uk | other | 2 | 2 | 2 | 2 | 11 |
| www.uswitch.com/broadband/broadband-only/ | uswitch.com | major comparison | 1 | 1 | 1 | 1 | 10 |
| www.comparethemarket.com/broadband/packages/ | comparethemarket.com | major comparison | 2 | 1 | 1 | 1 | 8 |
| www.broadband.co.uk/broadband/help/sky-broadband-vs-virgin-broadband | broadband.co.uk | major comparison | 4 | 2 | 0 | 2 | 8 |

**Page-1 titles for these queries:**

- moneysavingexpert.com: Sky deals, Virgin & TalkTalk TV: Get £100s off - MSE
- reddit.com: Thinking of switching from Sky to Virgin Media - worth it?
- bestbroadbanddeals.co.uk: Sky vs Virgin Media | Which Provider is Better?
- uswitch.com: Broadband Only Deals: Compare in October 2026
- comparethemarket.com: Compare Broadband Packages 2026
- broadband.co.uk: Virgin Media vs Sky Broadband: which is best?


_UX scrape: 4 of 4 top competitor pages read. Blocked pages still count in the SERP tables above._


**People Also Ask (match these as H2s / FAQ):**

- Is EE better than Community Fibre?
- What is the best router for fibre broadband in the UK?
- How do I renew my Community Fibre contract?
- Is Community Fibre part of Openreach?
- Which is better for TV, Virgin or Sky?
- Is it worth changing from virgin to Sky?
- What channels does Sky have that Virgin doesn't?
- Is Sky TV losing customers in the UK?


### UX feature matrix (ours vs the winners we could read)

| Feature | Ours | Top competitors | Gap? |
|---|---|---|---|
| Year in title | yes | 1/4 |  |
| Concise answer / verdict block up top | yes | 1/4 |  |
| Question-shaped H2s (PAA match) | 1.0 | avg 2.2 |  |
| Visible FAQ section | yes | 1/4 |  |
| FAQPage schema | yes | 0/4 |  |
| BreadcrumbList schema | yes | 3/4 |  |
| On-this-page jump links | yes | 1/4 |  |
| Visible last-updated / verified date | yes | 1/4 |  |
| Author / reviewed-by byline | yes | 2/4 |  |
| Postcode / availability input | yes | 1/4 |  |
| Price/speed/contract comparison table | yes | 2/4 |  |
| Badges / chips (Best value, Fastest) | no | 3/4 | **GAP** |
| Rating / score shown | yes | 1/4 |  |
| Pros and cons | no | 1/4 |  |
| Related links / internal linking block | no | 0/4 |  |
| Get Deal CTAs on page | 2.3 | avg 3.5 |  |

### Recommendations

**P0 · GEO: be quotable in the AI answer**

- Evidence: 3 of 8 sampled provider vs provider queries show an AI Overview; BroadbandPicker is cited in 0. Domains that do get cited: bestbroadbanddeals.co.uk, broadband.co.uk, broadband.which.co.uk, broadbandswitch.uk, choose.co.uk, comparefibre.co.uk, comparethemarket.com, confused.com, dealtree.compare, gocompare.com, moneysavingexpert.com, moneysupermarket.com, uswitch.com.
- GSC: AI referral visits to this type in GA4: 0.
- Apply to: `/providers/compare/sky-vs-virgin-media`, `/providers/compare/ee-vs-talktalk`, `/providers/compare`, `/providers/compare/virgin-media-vs-sky`, `/providers/compare/bt-vs-sky`, `/providers/compare/plusnet-vs-sky`

**P1 · Badges / chips (Best value, Fastest)**

- Evidence: 3/4 top competitor pages have this. Top pages for this topic: moneysavingexpert.com, reddit.com, bestbroadbanddeals.co.uk.
- GSC: 12,569 impressions, 81 clicks, avg pos 16.0 (+0.5 vs prior 28d), 17 pages improving / 6 declining.
- Apply to: `/providers/compare/sky-vs-virgin-media`, `/providers/compare/ee-vs-talktalk`, `/providers/compare`, `/providers/compare/virgin-media-vs-sky`, `/providers/compare/bt-vs-sky`, `/providers/compare/plusnet-vs-sky`


---

## Original research

GSC: **2,257 impressions, 4 clicks, CTR 0.18%, avg position 7.2** (-4.3 vs prior 28d, better). 2 pages improving, 0 declining, 0 newly ranking.


### Our pages of this type

| Page | Impr | Clicks | CTR | Pos | Pos vs prior |
|---|---|---|---|---|---|
| `/research/uk-broadband-customer-satisfaction` | 1,450 | 4 | 0.28% | 5.9 | -5.3 |
| `/research/broadband-customer-service-rankings-uk` | 807 | 0 | 0.00% | 9.5 | -2.0 |

### Queries these pages actually rank for (top by impressions)

`show me broadband comparison sites that highlight customer service ratings and complaint stats by provider`, `best customer service broadband`, `comparing customer satisfaction between plusnet and major uk broadband brands`, `uk broadband providers customer satisfaction`, `internet provider compare`, `do broadband review scores vary by region?`, `which broadband provider has the best customer service`, `which broadband companies have the best customer satisfaction scores?`


### Pages that dominate these SERPs (popularity proxy)

| Page | Domain | Tier | Best rank | Query coverage | Top-3 | AI cites | Score |
|---|---|---|---|---|---|---|---|
| www.civilservicejobs.service.gov.uk/csr/jobs.cgi | civilservicejobs.service.gov.uk | regulator/gov | 1 | 4 | 1 | 0 | 13 |
| www.uswitch.com/broadband/ | uswitch.com | major comparison | 1 | 1 | 1 | 2 | 12 |
| broadband.which.co.uk/ | broadband.which.co.uk | major comparison | 2 | 2 | 1 | 2 | 11 |
| www.uswitch.com/broadband/guides/which-broadband-provider-is-best-for-… | uswitch.com | major comparison | 1 | 1 | 1 | 1 | 10 |
| www.comparethemarket.com/broadband/ | comparethemarket.com | major comparison | 2 | 1 | 1 | 2 | 10 |
| www.moneysavingexpert.com/compare-broadband-deals/ | moneysavingexpert.com | major comparison | 3 | 1 | 1 | 2 | 10 |

**Page-1 titles for these queries:**

- civilservicejobs.service.gov.uk: Service Centre Support Team Member - Civil Service Jobs
- uswitch.com: Compare Broadband Deals - October 2026
- broadband.which.co.uk: Compare broadband, digital TV & landline packages in your ...
- uswitch.com: Which broadband provider has the best customer service?
- comparethemarket.com: Compare Cheap Broadband Deals - October 2026
- moneysavingexpert.com: Compare Broadband Deals October 2026


_UX scrape: 4 of 4 top competitor pages read. Blocked pages still count in the SERP tables above._


**People Also Ask (match these as H2s / FAQ):**

- Which broadband provider gets the most complaints?
- What is the best comparison site for broadband?
- Which broadband is Ofcom least complained about?
- What are the top 10 broadband providers in the UK?
- What are the best business broadband deals available?
- Which internet provider is most reliable?
- Which broadband is best in the UK?
- What are the reviews like for Rise fibre in the UK?


### UX feature matrix (ours vs the winners we could read)

| Feature | Ours | Top competitors | Gap? |
|---|---|---|---|
| Concise answer / verdict block up top | yes | 0/4 |  |
| Question-shaped H2s (PAA match) | 0.0 | avg 5.0 | **GAP** |
| Visible FAQ section | yes | 1/4 |  |
| FAQPage schema | yes | 1/4 |  |
| BreadcrumbList schema | yes | 1/4 |  |
| On-this-page jump links | yes | 1/4 |  |
| Visible last-updated / verified date | yes | 1/4 |  |
| Author / reviewed-by byline | yes | 2/4 |  |
| Related links / internal linking block | no | 0/4 |  |

### Recommendations

**P0 · GEO: be quotable in the AI answer**

- Evidence: 4 of 8 sampled original research queries show an AI Overview; BroadbandPicker is cited in 0. Domains that do get cited: broadband.which.co.uk, broadbandchoices.co.uk, comparethemarket.com, confused.com, gocompare.com, moneysavingexpert.com, moneysupermarket.com, uswitch.com.
- GSC: AI referral visits to this type in GA4: 0.
- Apply to: `/research/uk-broadband-customer-satisfaction`, `/research/broadband-customer-service-rankings-uk`

**P1 · Question-shaped H2s (PAA match)**

- Evidence: 3/4 top competitor pages have this (avg 5.0). Top pages for this topic: civilservicejobs.service.gov.uk, uswitch.com, broadband.which.co.uk.
- GSC: 2,257 impressions, 4 clicks, avg pos 7.2 (-4.3 vs prior 28d), 2 pages improving / 0 declining.
- Apply to: `/research/uk-broadband-customer-satisfaction`, `/research/broadband-customer-service-rankings-uk`


---

## Compare tool

GSC: **1,496 impressions, 2 clicks, CTR 0.13%, avg position 40.4** (-4.6 vs prior 28d, better). 2 pages improving, 0 declining, 0 newly ranking.


### Our pages of this type

| Page | Impr | Clicks | CTR | Pos | Pos vs prior |
|---|---|---|---|---|---|
| `/compare` | 956 | 2 | 0.21% | 38.9 | -4.3 |
| `/providers` | 540 | 0 | 0.00% | 42.9 | -8.7 |

### Queries these pages actually rank for (top by impressions)

`broadband reviews`, `broadband comparison website that shows speed guarantees and setup fees`, `internet comparison`, `best broadband reviews`, `what broadband comparison website is most accurate for postcode level availability and install dates`, `best broadband`, `compare broadband speeds`, `compare broadband`


### Pages that dominate these SERPs (popularity proxy)

| Page | Domain | Tier | Best rank | Query coverage | Top-3 | AI cites | Score |
|---|---|---|---|---|---|---|---|
| www.uswitch.com/broadband/reviews/ | uswitch.com | major comparison | 1 | 2 | 2 | 0 | 13 |
| broadband.which.co.uk/ | broadband.which.co.uk | major comparison | 2 | 2 | 2 | 0 | 11 |
| www.uswitch.com/broadband/ | uswitch.com | major comparison | 1 | 1 | 1 | 0 | 9 |
| www.broadbandchoices.co.uk/providers/reviews | broadbandchoices.co.uk | major comparison | 3 | 2 | 1 | 0 | 8 |
| uk.trustpilot.com/review/theonebroadband.co.uk | uk.trustpilot.com | forum/ugc | 1 | 1 | 1 | 0 | 7 |
| www.moneysupermarket.com/broadband/ | moneysupermarket.com | major comparison | 2 | 1 | 1 | 0 | 7 |

**Page-1 titles for these queries:**

- uswitch.com: Broadband provider reviews 2026
- broadband.which.co.uk: Compare broadband, digital TV & landline packages in your ...
- uswitch.com: Compare Broadband Deals - October 2026
- broadbandchoices.co.uk: Broadband reviews: UK providers | broadbandchoices.co. ...
- uk.trustpilot.com: The One Broadband Reviews | Read Customer Service ...
- moneysupermarket.com: Compare Broadband Deals - October 2026


_UX scrape: 4 of 4 top competitor pages read. Blocked pages still count in the SERP tables above._


**People Also Ask (match these as H2s / FAQ):**

- Which broadband provider has the most complaints?
- What provider has the worst Wi-Fi?
- Who is the best broadband supplier in the UK?
- What are Martin Lewis' best broadband and landline deals?
- Which is better, BT or Sky broadband?
- Is EE or Vodafone better for broadband?


### UX feature matrix (ours vs the winners we could read)

| Feature | Ours | Top competitors | Gap? |
|---|---|---|---|
| Concise answer / verdict block up top | yes | 1/4 |  |
| Visible FAQ section | yes | 2/4 |  |
| FAQPage schema | yes | 2/4 |  |
| BreadcrumbList schema | yes | 1/4 |  |
| Visible last-updated / verified date | yes | 0/4 |  |
| Related links / internal linking block | no | 0/4 |  |

### Recommendations

**P1 · GEO: be quotable in the AI answer**

- Evidence: 3 of 8 sampled compare tool queries show an AI Overview; BroadbandPicker is cited in 0. Domains that do get cited: n/a.
- GSC: AI referral visits to this type in GA4: 4.
- Apply to: `/compare`, `/providers`


---

## Deals hub

GSC: **3,472 impressions, 0 clicks, CTR 0.00%, avg position 55.8** (+9.3 vs prior 28d, worse). 0 pages improving, 1 declining, 0 newly ranking.


### Our pages of this type

| Page | Impr | Clicks | CTR | Pos | Pos vs prior |
|---|---|---|---|---|---|
| `/deals` | 3,472 | 0 | 0.00% | 55.8 | +9.3 |

### Queries these pages actually rank for (top by impressions)

`best broadband`, `internet comparison`, `wifi deals`, `internet deals`, `broadband only deals`, `best broadband deals uk`, `compare broadband prices`, `cheap broadband deals uk`


### Pages that dominate these SERPs (popularity proxy)

| Page | Domain | Tier | Best rank | Query coverage | Top-3 | AI cites | Score |
|---|---|---|---|---|---|---|---|
| www.comparethemarket.com/broadband/ | comparethemarket.com | major comparison | 1 | 3 | 2 | 2 | 17 |
| www.uswitch.com/broadband/ | uswitch.com | major comparison | 2 | 2 | 2 | 2 | 13 |
| www.uswitch.com/broadband/broadband-only/ | uswitch.com | major comparison | 1 | 1 | 1 | 3 | 13 |
| www.moneysavingexpert.com/compare-broadband-deals/ | moneysavingexpert.com | major comparison | 2 | 2 | 2 | 0 | 11 |
| ee.co.uk/broadband | ee.co.uk | major provider | 5 | 3 | 0 | 4 | 11 |
| www.virginmedia.com/broadband/broadband-only | virginmedia.com | major provider | 3 | 1 | 1 | 3 | 10 |

**Page-1 titles for these queries:**

- comparethemarket.com: Compare Cheap Broadband Deals - October 2026
- uswitch.com: Compare Broadband Deals - October 2026
- uswitch.com: Broadband Only Deals: Compare in October 2026
- moneysavingexpert.com: Compare Broadband Deals October 2026
- ee.co.uk: EE Broadband Deals For October 2026
- virginmedia.com: Broadband Only Deals | Award Winning | October 2026


_UX scrape: 3 of 4 top competitor pages read; blocked (bot protection): comparethemarket.com. Blocked pages still count in the SERP tables above._


**People Also Ask (match these as H2s / FAQ):**

- Who has the best Wi-Fi deals right now?
- What are the best Wi-Fi deals?
- Which is the best and cheapest Wi-Fi?
- What is the cheapest way to get Wi-Fi?
- Who has the best deal on the internet?
- Who has the cheapest internet right now?
- Who has the cheapest broadband plan?
- What is the cheapest way to get internet?


### UX feature matrix (ours vs the winners we could read)

| Feature | Ours | Top competitors | Gap? |
|---|---|---|---|
| Current month in title | yes | 3/3 |  |
| Year in title | yes | 3/3 |  |
| Concise answer / verdict block up top | yes | 1/3 |  |
| Visible FAQ section | no | 1/3 | **GAP** |
| FAQPage schema | no | 1/3 | **GAP** |
| BreadcrumbList schema | yes | 1/3 |  |
| Visible last-updated / verified date | yes | 0/3 |  |
| Postcode / availability input | yes | 3/3 |  |
| Price/speed/contract comparison table | yes | 2/3 |  |
| Card layout (not table-only) | no | 2/3 | **GAP** |
| Badges / chips (Best value, Fastest) | yes | 3/3 |  |
| Product / Offer schema | yes | 3/3 |  |
| Related links / internal linking block | no | 0/3 |  |
| Get Deal CTAs on page | 107.0 | avg 10.3 |  |

### Recommendations

**P1 · FAQPage schema**

- Evidence: 1/3 top competitor pages have this. Top pages for this topic: comparethemarket.com, uswitch.com.
- GSC: 3,472 impressions, 0 clicks, avg pos 55.8 (+9.3 vs prior 28d), 0 pages improving / 1 declining.
- Apply to: `/deals`

**P1 · GEO: be quotable in the AI answer**

- Evidence: 3 of 8 sampled deals hub queries show an AI Overview; BroadbandPicker is cited in 0. Domains that do get cited: broadband.which.co.uk, broadbandchoices.co.uk, bt.com, comparethemarket.com, ee.co.uk, gocompare.com, moneysupermarket.com, plus.net, sky.com, uswitch.com, virginmedia.com, vodafone.co.uk.
- GSC: AI referral visits to this type in GA4: 0.
- Apply to: `/deals`

**P2 · Visible FAQ section**

- Evidence: 1/3 top competitor pages have this. Top pages for this topic: comparethemarket.com, uswitch.com.
- GSC: 3,472 impressions, 0 clicks, avg pos 55.8 (+9.3 vs prior 28d), 0 pages improving / 1 declining.
- Apply to: `/deals`

**P2 · Card layout (not table-only)**

- Evidence: 2/3 top competitor pages have this. Top pages for this topic: comparethemarket.com, uswitch.com.
- GSC: 3,472 impressions, 0 clicks, avg pos 55.8 (+9.3 vs prior 28d), 0 pages improving / 1 declining.
- Apply to: `/deals`


---

## Build order

1. Page types with real impression share **and** improving position first — the SERP is already moving, UX converts it.
2. Fix the **GAP** rows above, highest priority per type.
3. GEO: put a 40-70 word quotable answer near the top of every winning type, matched to the question the AI Overview is answering.
4. Only then touch types with no rank movement.


## Copy rules

British English. No em dashes. Fibre not fiber. Rankings are not sold. No AggregateRating schema without a real dataset and count. No national from-price shown as universally available. Affiliate Get Deal labelled.


## Success

- Winning-type CTR up from the site average.
- `/deals` and provider-deals titles always equal the live month.
- Every winning type carries a quotable answer block and a matching FAQPage.
- GA4 `outbound_provider_click` per session up on provider-vs and postcode pages.
- BroadbandPicker cited in more AI Overviews for the sampled winning queries.

