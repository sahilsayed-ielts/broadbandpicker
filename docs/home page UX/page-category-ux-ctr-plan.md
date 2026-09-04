# Page-type UX benchmark for CTR and GEO

Generated 2026-09-04. Written by `scripts/analyze_page_type_ux.py`.

This brief starts from real data, not a competitor wishlist: Search Console picks the page types that are working, SerpApi shows who wins those queries in Google and in AI Overviews, and the UX scrape shows the feature gap.

- GSC window: **2026-08-05 to 2026-09-01** vs prior **2026-07-08 to 2026-08-04** (3-day lag, final data)
- SERP data: cached SERP file 2026-09-04-page-ux-raw.json, 10 searches used
- Backlink/authority signal is a **proxy** (ranking ubiquity + AI citations + hand-kept domain tiers). No paid link API is wired.


## Site totals

| Metric | Last 28d | Prior 28d | Change |
|---|---|---|---|
| Impressions | 98,571 | 14,165 | +596% |
| Clicks | 125 | 12 | +942% |
| CTR | 0.13% | 0.08% | — |
| Avg position | 51.3 | 47.8 | worse |

Site average position drifts down while impressions multiply because new pages enter the index at low positions. Read the per-type position change, not the site average.


## What is actually working (page-type league table)

| Type | Impr | Clicks | CTR | Avg pos | Pos vs prior | Impr/decl/new | AI refs | Winning? |
|---|---|---|---|---|---|---|---|---|
| Editorial guide | 68,601 | 36 | 0.05% | 55.7 | -1.2 (better) | 4/4/23 | 0 | yes |
| Postcode and local | 9,542 | 58 | 0.61% | 22.5 | -0.8 (better) | 6/3/1118 | 0 | yes |
| Provider review | 5,414 | 14 | 0.26% | 47.4 | -3.3 (better) | 0/3/18 | 0 | yes |
| Provider deals page | 4,110 | 1 | 0.02% | 58.7 | +3.5 (worse) | 1/2/0 | 0 | yes |
| Homepage | 3,225 | 6 | 0.19% | 32.2 | -8.3 (better) | 1/0/0 | 0 | yes |
| Interactive tool | 3,050 | 1 | 0.03% | 79.1 | +1.0 (worse) | 0/1/2 | 0 | yes |
| Compare tool | 2,818 | 0 | 0.00% | 49.0 | +3.8 (worse) | 0/1/1 | 0 |  |
| Provider vs provider | 915 | 8 | 0.87% | 18.3 | +0.0 (flat) | 0/0/11 | 0 | yes |
| Original research | 444 | 1 | 0.23% | 13.7 | +0.0 (flat) | 0/0/2 | 0 | yes |
| Deals hub | 418 | 0 | 0.00% | 50.3 | +0.0 (flat) | 0/0/1 | 0 |  |
| Trust and methodology | 34 | 0 | 0.00% | 13.7 | +5.1 (worse) | 0/1/4 | 0 |  |

Winning = real impression share and either improving position, already near page 1, earning clicks, or getting AI referral. Those are the types the rest of this brief works on.


---

## Editorial guide

GSC: **68,601 impressions, 36 clicks, CTR 0.05%, avg position 55.7** (-1.2 vs prior 28d, better). 4 pages improving, 4 declining, 23 newly ranking.


### Our pages of this type

| Page | Impr | Clicks | CTR | Pos | Pos vs prior |
|---|---|---|---|---|---|
| `/guides/best-broadband-and-tv-deals` | 26,372 | 20 | 0.08% | 61.3 | +1.7 |
| `/guides/best-phone-and-broadband-deals` | 25,105 | 0 | 0.00% | 51.4 | +0.0 |
| `/guides/best-full-fibre-broadband-uk` | 7,092 | 3 | 0.04% | 51.1 | +2.0 |
| `/guides/best-business-broadband-providers-uk` | 2,943 | 0 | 0.00% | 80.9 | +3.5 |
| `/guides/satellite-broadband-uk` | 1,683 | 0 | 0.00% | 66.8 | -1.2 |
| `/guides/black-friday-broadband-deals-uk` | 818 | 0 | 0.00% | 25.9 | +0.0 |
| `/guides/cheapest-broadband-uk` | 673 | 3 | 0.45% | 37.5 | -13.7 |
| `/guides/broadband-help-if-you-claim-benefits-uk` | 582 | 1 | 0.17% | 59.7 | +0.0 |

### Queries these pages actually rank for (top by impressions)

`fibre optic broadband`, `fibre broadband`, `best broadband and tv deals`, `compare broadband and tv`, `broadband and tv deals`, `tv and broadband deals`, `tv package deals`, `best tv and broadband deals`


### Pages that dominate these SERPs (popularity proxy)

| Page | Domain | Tier | Best rank | Query coverage | Top-3 | AI cites | Score |
|---|---|---|---|---|---|---|---|
| www.comparethemarket.com/broadband/packages/broadband-and-tv/ | comparethemarket.com | major comparison | 2 | 4 | 4 | 2 | 21 |
| www.moneysavingexpert.com/broadband-and-tv/ | moneysavingexpert.com | major comparison | 1 | 3 | 3 | 0 | 17 |
| www.openreach.com/fibre-checker | openreach.com | regulator/gov | 1 | 2 | 2 | 1 | 15 |
| www.virginmedia.com/broadband/broadband-and-tv | virginmedia.com | major provider | 2 | 4 | 2 | 1 | 13 |
| www.bt.com/tv/packages | bt.com | major provider | 1 | 3 | 1 | 1 | 11 |
| www.uswitch.com/broadband/guides/full-fibre-broadband/ | uswitch.com | major comparison | 3 | 2 | 1 | 2 | 10 |

**Page-1 titles for these queries:**

- comparethemarket.com: Compare Our BEST Broadband and TV Deals 2026
- moneysavingexpert.com: Broadband & TV Deals
- openreach.com: Fibre broadband availability checker
- virginmedia.com: TV and Broadband Deals | Award Winning | September 2026
- bt.com: Our Best TV & Broadband Deals | TV & Broadband Packages
- uswitch.com: What is full fibre broadband, and is it available in your area?


_UX scrape: 2 of 4 top competitor pages read; blocked (bot protection): comparethemarket.com, moneysavingexpert.com. Blocked pages still count in the SERP tables above._


**People Also Ask (match these as H2s / FAQ):**

- Is fiber optics better than broadband?
- Is fiber-optic broadband better?
- Who is the best fibre broadband provider?
- How do they connect fibre broadband to your house?
- Who is best for full fibre broadband?
- Which is better, fibre or broadband?
- Do I really need full fibre broadband?
- Is fiber internet better than Wi-Fi?


### UX feature matrix (ours vs the winners we could read)

| Feature | Ours | Top competitors | Gap? |
|---|---|---|---|
| Year in title | yes | 1/2 |  |
| Concise answer / verdict block up top | yes | 0/2 |  |
| Question-shaped H2s (PAA match) | 1.7 | avg 0.5 |  |
| Visible FAQ section | yes | 2/2 |  |
| FAQPage schema | yes | 1/2 |  |
| BreadcrumbList schema | yes | 1/2 |  |
| On-this-page jump links | yes | 1/2 |  |
| Visible last-updated / verified date | yes | 0/2 |  |
| Author / reviewed-by byline | yes | 1/2 |  |
| Price/speed/contract comparison table | yes | 0/2 |  |
| Pros and cons | no | 0/2 |  |
| Related links / internal linking block | yes | 0/2 |  |

### Recommendations

**P1 · GEO: be quotable in the AI answer**

- Evidence: 3 of 8 sampled editorial guide queries show an AI Overview; BroadbandPicker is cited in 0. Domains that do get cited: bt.com, comparethemarket.com, confused.com, ee.co.uk, hyperoptic.com, moneysupermarket.com, openreach.com, plus.net, sky.com, uswitch.com, virginmedia.com.
- GSC: AI referral visits to this type in GA4: 0.
- Apply to: `/guides/best-broadband-and-tv-deals`, `/guides/best-phone-and-broadband-deals`, `/guides/best-full-fibre-broadband-uk`, `/guides/best-business-broadband-providers-uk`, `/guides/satellite-broadband-uk`, `/guides/black-friday-broadband-deals-uk`


---

## Homepage

GSC: **3,225 impressions, 6 clicks, CTR 0.19%, avg position 32.2** (-8.3 vs prior 28d, better). 1 pages improving, 0 declining, 0 newly ranking.


### Our pages of this type

| Page | Impr | Clicks | CTR | Pos | Pos vs prior |
|---|---|---|---|---|---|
| `/` | 3,225 | 6 | 0.19% | 32.2 | -8.3 |

### Queries these pages actually rank for (top by impressions)

`internet comparison`, `compare broadband deals`, `broadband deals compare`, `compare broadband packages`, `broadband price comparison`, `compare internet`, `best broadband deals by postcode`, `compare best broadband deals`


### Pages that dominate these SERPs (popularity proxy)

| Page | Domain | Tier | Best rank | Query coverage | Top-3 | AI cites | Score |
|---|---|---|---|---|---|---|---|
| www.comparethemarket.com/broadband/ | comparethemarket.com | major comparison | 2 | 6 | 6 | 6 | 35 |
| www.moneysavingexpert.com/compare-broadband-deals/ | moneysavingexpert.com | major comparison | 1 | 6 | 6 | 0 | 29 |
| www.moneysupermarket.com/broadband/ | moneysupermarket.com | major comparison | 1 | 6 | 4 | 0 | 23 |
| www.uswitch.com/broadband/ | uswitch.com | major comparison | 3 | 6 | 2 | 2 | 17 |
| www.broadbandchoices.co.uk/ | broadbandchoices.co.uk | major comparison | 4 | 6 | 0 | 0 | 9 |
| broadband.which.co.uk/ | broadband.which.co.uk | major comparison | 4 | 6 | 0 | 0 | 9 |

**Page-1 titles for these queries:**

- comparethemarket.com: Compare Cheap Broadband Deals - September 2026
- moneysavingexpert.com: Compare Broadband Deals September 2026
- moneysupermarket.com: Compare Broadband Deals - September 2026
- uswitch.com: Broadband Deals: Compare in September 2026
- broadbandchoices.co.uk: Broadband, TV, Landline & Mobile Comparison ...
- broadband.which.co.uk: Compare broadband, digital TV & landline packages in your ...


_UX scrape: 1 of 4 top competitor pages read; blocked (bot protection): comparethemarket.com, moneysavingexpert.com, moneysupermarket.com. Blocked pages still count in the SERP tables above._


**People Also Ask (match these as H2s / FAQ):**

- Who has the best internet in the UK?
- Which internet is the best in my area?
- Who is the cheapest internet provider in the UK?
- Who is cheaper than BT?
- Who is doing the best broadband deals at the moment?
- What are Martin Lewis' best fibre broadband deals?
- Who is the best broadband supplier in the UK?
- How much should you pay for broadband per month?


### UX feature matrix (ours vs the winners we could read)

| Feature | Ours | Top competitors | Gap? |
|---|---|---|---|
| Current month in title | no | 1/1 | **GAP** |
| Concise answer / verdict block up top | no | 0/1 |  |
| Visible FAQ section | yes | 1/1 |  |
| FAQPage schema | yes | 1/1 |  |
| BreadcrumbList schema | no | 0/1 |  |
| Visible last-updated / verified date | yes | 1/1 |  |
| Postcode / availability input | yes | 1/1 |  |
| Price/speed/contract comparison table | yes | 0/1 |  |
| Card layout (not table-only) | no | 0/1 |  |
| Badges / chips (Best value, Fastest) | yes | 1/1 |  |
| Product / Offer schema | yes | 1/1 |  |
| Related links / internal linking block | no | 0/1 |  |
| Get Deal CTAs on page | 9.0 | avg 11.0 |  |

### Recommendations

**P0 · Current month in title**

- Evidence: 1/1 top competitor pages have this. Top pages for this topic: comparethemarket.com, moneysavingexpert.com, moneysupermarket.com.
- GSC: 3,225 impressions, 6 clicks, avg pos 32.2 (-8.3 vs prior 28d), 1 pages improving / 0 declining.
- Apply to: `/`

**P1 · GEO: be quotable in the AI answer**

- Evidence: 3 of 8 sampled homepage queries show an AI Overview; BroadbandPicker is cited in 0. Domains that do get cited: comparethemarket.com, uswitch.com.
- GSC: AI referral visits to this type in GA4: 0.
- Apply to: `/`


---

## Postcode and local

GSC: **9,542 impressions, 58 clicks, CTR 0.61%, avg position 22.5** (-0.8 vs prior 28d, better). 6 pages improving, 3 declining, 1118 newly ranking.


### Our pages of this type

| Page | Impr | Clicks | CTR | Pos | Pos vs prior |
|---|---|---|---|---|---|
| `/postcode/da1` | 1,905 | 0 | 0.00% | 10.1 | +0.1 |
| `/postcode/london` | 1,364 | 1 | 0.07% | 40.4 | +0.5 |
| `/postcode/manchester` | 474 | 0 | 0.00% | 55.1 | +0.0 |
| `/postcode/liverpool` | 289 | 0 | 0.00% | 53.8 | +0.0 |
| `/postcode/ng1` | 254 | 0 | 0.00% | 12.4 | +0.0 |
| `/postcode/rg1` | 221 | 0 | 0.00% | 14.7 | +0.0 |
| `/postcode/glasgow` | 205 | 0 | 0.00% | 39.6 | +0.0 |
| `/postcode/so14` | 194 | 1 | 0.52% | 22.0 | +0.0 |

### Queries these pages actually rank for (top by impressions)

`broadband deals in dartford`, `broadband deals nottingham`, `broadband deals in canterbury`, `broadband deals in reading`, `broadband deals in nottingham`, `internet providers london`, `broadband deals in luton`, `broadband deals in romford`


### Pages that dominate these SERPs (popularity proxy)

| Page | Domain | Tier | Best rank | Query coverage | Top-3 | AI cites | Score |
|---|---|---|---|---|---|---|---|
| www.uswitch.com/broadband/nottingham/ | uswitch.com | major comparison | 1 | 2 | 2 | 2 | 15 |
| www.moneysavingexpert.com/compare-broadband-deals/ | moneysavingexpert.com | major comparison | 1 | 2 | 2 | 0 | 13 |
| www.broadband.co.uk/broadband/in/canterbury | broadband.co.uk | major comparison | 1 | 1 | 1 | 2 | 11 |
| www.gocompare.com/broadband/areas/nottingham/ | gocompare.com | other | 2 | 2 | 2 | 2 | 10 |
| www.comparethemarket.com/broadband/london/ | comparethemarket.com | major comparison | 1 | 1 | 1 | 0 | 9 |
| www.uswitch.com/broadband/providers/ | uswitch.com | major comparison | 3 | 1 | 1 | 2 | 9 |

**Page-1 titles for these queries:**

- uswitch.com: Broadband deals in Nottingham September 2026
- moneysavingexpert.com: Compare Broadband Deals September 2026
- broadband.co.uk: Canterbury Internet Providers Compared
- gocompare.com: Compare Broadband in Nottingham | September 2026
- comparethemarket.com: Compare Our BEST Broadband Deals For London 2026
- uswitch.com: Compare UK Internet Providers - Broadband


_UX scrape: 3 of 4 top competitor pages read; blocked (bot protection): moneysavingexpert.com. Blocked pages still count in the SERP tables above._


**People Also Ask (match these as H2s / FAQ):**

- Who is doing the best broadband deals at the moment?
- What are Martin Lewis' best fibre broadband deals?
- How much should I be paying for broadband and landline?
- Which is better, BT or Sky broadband?
- What is the best internet provider in Nottingham?
- Who is the cheapest and best internet provider?
- Which broadband is best and cheapest?
- Which internet provider is the best in Kent?


### UX feature matrix (ours vs the winners we could read)

| Feature | Ours | Top competitors | Gap? |
|---|---|---|---|
| Year in title | yes | 1/3 |  |
| Concise answer / verdict block up top | yes | 0/3 |  |
| Visible FAQ section | yes | 1/3 |  |
| FAQPage schema | yes | 0/3 |  |
| BreadcrumbList schema | yes | 1/3 |  |
| Visible last-updated / verified date | yes | 1/3 |  |
| Postcode / availability input | yes | 2/3 |  |
| Price/speed/contract comparison table | yes | 1/3 |  |
| Card layout (not table-only) | no | 0/3 |  |
| Badges / chips (Best value, Fastest) | yes | 2/3 |  |
| Related links / internal linking block | no | 0/3 |  |
| Get Deal CTAs on page | 7.3 | avg 3.3 |  |

### Recommendations

**P0 · GEO: be quotable in the AI answer**

- Evidence: 6 of 8 sampled postcode and local queries show an AI Overview; BroadbandPicker is cited in 0. Domains that do get cited: broadband.co.uk, broadbandcompared.co.uk, fibrecompare.com, gocompare.com, uswitch.com.
- GSC: AI referral visits to this type in GA4: 0.
- Apply to: `/postcode/da1`, `/postcode/london`, `/postcode/manchester`, `/postcode/liverpool`, `/postcode/ng1`, `/postcode/rg1`


---

## Provider review

GSC: **5,414 impressions, 14 clicks, CTR 0.26%, avg position 47.4** (-3.3 vs prior 28d, better). 0 pages improving, 3 declining, 18 newly ranking.


### Our pages of this type

| Page | Impr | Clicks | CTR | Pos | Pos vs prior |
|---|---|---|---|---|---|
| `/providers/bt` | 981 | 0 | 0.00% | 65.8 | +0.0 |
| `/providers/ee` | 931 | 0 | 0.00% | 55.8 | +0.0 |
| `/providers/vodafone` | 565 | 2 | 0.35% | 65.2 | +0.0 |
| `/providers/hyperoptic` | 520 | 0 | 0.00% | 54.4 | +1.9 |
| `/providers/brsk` | 466 | 0 | 0.00% | 39.0 | +0.0 |
| `/providers/zen-internet` | 377 | 2 | 0.53% | 40.4 | +0.0 |
| `/providers/now-broadband` | 318 | 0 | 0.00% | 58.4 | +0.0 |
| `/providers/onestream` | 283 | 3 | 1.06% | 13.1 | +0.0 |

### Queries these pages actually rank for (top by impressions)

`ee broadband`, `brsk broadband`, `bt broadband`, `brsk`, `ee packages`, `vodafone broadband deals`, `zen broadband`, `ee broadband deals`


### Pages that dominate these SERPs (popularity proxy)

| Page | Domain | Tier | Best rank | Query coverage | Top-3 | AI cites | Score |
|---|---|---|---|---|---|---|---|
| www.youfibre.com/brsk/ | youfibre.com | other | 1 | 2 | 2 | 3 | 14 |
| ee.co.uk/broadband | ee.co.uk | major provider | 1 | 2 | 1 | 0 | 9 |
| www.uswitch.com/broadband/reviews/brsk/ | uswitch.com | major comparison | 2 | 2 | 1 | 1 | 9 |
| www.uswitch.com/broadband/providers/ee/ | uswitch.com | major comparison | 3 | 1 | 1 | 1 | 8 |
| www.bt.com/broadband | bt.com | major provider | 1 | 1 | 1 | 0 | 8 |
| ee.co.uk/broadband/tv | ee.co.uk | major provider | 1 | 1 | 1 | 0 | 8 |

**Page-1 titles for these queries:**

- youfibre.com: Brsk
- ee.co.uk: EE Broadband Deals For September 2026
- uswitch.com: Brsk broadband review - is it any good?
- uswitch.com: EE Broadband Deals September 2026
- bt.com: BT Broadband deals
- ee.co.uk: EE TV Packages | TV & Broadband Deals


_UX scrape: 4 of 4 top competitor pages read. Blocked pages still count in the SERP tables above._


**People Also Ask (match these as H2s / FAQ):**

- Which broadband is better, BT or EE?
- Are there any current problems with EE broadband?
- Does EE use Openreach?
- Why is my EE fiber so slow?
- Is Brsk broadband any good?
- Is Brsk owned by Virgin Media?
- What has happened to Brsk broadband?
- Why is my Brsk WiFi so bad?


### UX feature matrix (ours vs the winners we could read)

| Feature | Ours | Top competitors | Gap? |
|---|---|---|---|
| Year in title | yes | 2/4 |  |
| Concise answer / verdict block up top | yes | 1/4 |  |
| Question-shaped H2s (PAA match) | 3.0 | avg 1.0 |  |
| Visible FAQ section | yes | 1/4 |  |
| FAQPage schema | yes | 1/4 |  |
| BreadcrumbList schema | yes | 2/4 |  |
| On-this-page jump links | no | 1/4 |  |
| Visible last-updated / verified date | yes | 1/4 |  |
| Author / reviewed-by byline | yes | 2/4 |  |
| Postcode / availability input | yes | 2/4 |  |
| Rating / score shown | yes | 2/4 |  |
| Pros and cons | yes | 1/4 |  |
| Product / Offer schema | yes | 1/4 |  |
| Related links / internal linking block | no | 0/4 |  |
| Get Deal CTAs on page | 6.3 | avg 3.2 |  |

### Recommendations

**P1 · GEO: be quotable in the AI answer**

- Evidence: 1 of 8 sampled provider review queries show an AI Overview; BroadbandPicker is cited in 0. Domains that do get cited: reddit.com, uswitch.com, www-staging.brsk.co.uk, youfibre.com.
- GSC: AI referral visits to this type in GA4: 0.
- Apply to: `/providers/bt`, `/providers/ee`, `/providers/vodafone`, `/providers/hyperoptic`, `/providers/brsk`, `/providers/zen-internet`


---

## Provider vs provider

GSC: **915 impressions, 8 clicks, CTR 0.87%, avg position 18.3** (+0.0 vs prior 28d, flat). 0 pages improving, 0 declining, 11 newly ranking.


### Our pages of this type

| Page | Impr | Clicks | CTR | Pos | Pos vs prior |
|---|---|---|---|---|---|
| `/providers/compare/ee-vs-talktalk` | 300 | 6 | 2.00% | 6.8 | +0.0 |
| `/providers/compare/virgin-media-vs-sky` | 268 | 0 | 0.00% | 44.2 | +0.0 |
| `/providers/compare/virgin-media-vs-vodafone` | 138 | 1 | 0.72% | 7.6 | +0.0 |
| `/providers/compare/bt-vs-hyperoptic` | 82 | 0 | 0.00% | 5.8 | +0.0 |
| `/providers/compare/sky-vs-virgin-media` | 71 | 0 | 0.00% | 13.0 | +0.0 |
| `/providers/compare/bt-vs-talktalk` | 29 | 1 | 3.45% | 4.2 | +0.0 |
| `/providers/compare/plusnet-vs-sky` | 8 | 0 | 0.00% | 10.2 | +0.0 |
| `/providers/compare` | 6 | 0 | 0.00% | 12.8 | +0.0 |

### Queries these pages actually rank for (top by impressions)

`sky vs virgin`, `sky v virgin`, `sky vs virgin broadband`, `sky or virgin`, `virgin vs sky`, `virgin or sky`, `virgin media vs sky`, `sky or virgin broadband`


### Pages that dominate these SERPs (popularity proxy)

| Page | Domain | Tier | Best rank | Query coverage | Top-3 | AI cites | Score |
|---|---|---|---|---|---|---|---|
| bestbroadbanddeals.co.uk/providers/guides/virgin-vs-sky/ | bestbroadbanddeals.co.uk | other | 2 | 4 | 4 | 16 | 32 |
| www.choose.co.uk/broadband/guide/sky-vs-virgin-media-broadband/ | choose.co.uk | major comparison | 9 | 1 | 0 | 24 | 28 |
| www.reddit.com/r/VirginMedia/comments/1nvwq3w/thinking_of_switching_fr… | reddit.com | forum/ugc | 1 | 4 | 4 | 4 | 23 |
| www.broadband.co.uk/broadband/help/sky-broadband-vs-virgin-broadband | broadband.co.uk | major comparison | 2 | 5 | 3 | 4 | 21 |
| bestbroadbanddeals.co.uk/broadband/providers/sky-vs-virgin-media/ | bestbroadbanddeals.co.uk | other | 3 | 1 | 1 | 16 | 20 |
| www.moneysavingexpert.com/broadband-and-tv/digital-tv-deals/ | moneysavingexpert.com | major comparison | 2 | 4 | 1 | 4 | 14 |

**Page-1 titles for these queries:**

- bestbroadbanddeals.co.uk: Sky vs Virgin Media | Which Provider is Better?
- choose.co.uk: Sky vs Virgin Media Broadband (2026): Speed vs Service?
- reddit.com: Thinking of switching from Sky to Virgin Media - worth it?
- broadband.co.uk: Virgin Media vs Sky Broadband: which is best?
- bestbroadbanddeals.co.uk: Sky vs Virgin Media Broadband | Which Provider Is Best?
- moneysavingexpert.com: Sky deals, Virgin & TalkTalk TV: Get £100s off - MSE


_UX scrape: 4 of 4 top competitor pages read. Blocked pages still count in the SERP tables above._


**People Also Ask (match these as H2s / FAQ):**

- Is Sky or Virgin TV better?
- Is it worth switching from Sky to Virgin?
- What channels does Sky have that Virgin doesn't?
- Is Virgin TV cheaper than Sky?
- Is it worth switching from Virgin Media to Sky?
- What are the disadvantages of Virgin Media?
- Is Sky TV losing customers in the UK?
- Who has better broadband, Sky or Virgin?


### UX feature matrix (ours vs the winners we could read)

| Feature | Ours | Top competitors | Gap? |
|---|---|---|---|
| Year in title | yes | 1/4 |  |
| Concise answer / verdict block up top | yes | 3/4 |  |
| Question-shaped H2s (PAA match) | 0.3 | avg 1.0 |  |
| Visible FAQ section | yes | 0/4 |  |
| FAQPage schema | yes | 0/4 |  |
| BreadcrumbList schema | yes | 3/4 |  |
| On-this-page jump links | no | 2/4 | **GAP** |
| Visible last-updated / verified date | yes | 2/4 |  |
| Author / reviewed-by byline | yes | 3/4 |  |
| Postcode / availability input | yes | 1/4 |  |
| Price/speed/contract comparison table | yes | 3/4 |  |
| Badges / chips (Best value, Fastest) | no | 2/4 | **GAP** |
| Rating / score shown | yes | 1/4 |  |
| Pros and cons | no | 1/4 |  |
| Related links / internal linking block | no | 1/4 |  |
| Get Deal CTAs on page | 3.0 | avg 6.0 |  |

### Recommendations

**P0 · GEO: be quotable in the AI answer**

- Evidence: 4 of 8 sampled provider vs provider queries show an AI Overview; BroadbandPicker is cited in 0. Domains that do get cited: bestbroadbanddeals.co.uk, broadband.co.uk, broadbandswitch.uk, choose.co.uk, moneysavingexpert.com, reddit.com.
- GSC: AI referral visits to this type in GA4: 0.
- Apply to: `/providers/compare/ee-vs-talktalk`, `/providers/compare/virgin-media-vs-sky`, `/providers/compare/virgin-media-vs-vodafone`, `/providers/compare/bt-vs-hyperoptic`, `/providers/compare/sky-vs-virgin-media`, `/providers/compare/bt-vs-talktalk`

**P1 · On-this-page jump links**

- Evidence: 2/4 top competitor pages have this. Top pages for this topic: bestbroadbanddeals.co.uk, choose.co.uk, reddit.com.
- GSC: 915 impressions, 8 clicks, avg pos 18.3 (+0.0 vs prior 28d), 0 pages improving / 0 declining.
- Apply to: `/providers/compare/ee-vs-talktalk`, `/providers/compare/virgin-media-vs-sky`, `/providers/compare/virgin-media-vs-vodafone`, `/providers/compare/bt-vs-hyperoptic`, `/providers/compare/sky-vs-virgin-media`, `/providers/compare/bt-vs-talktalk`

**P1 · Badges / chips (Best value, Fastest)**

- Evidence: 2/4 top competitor pages have this. Top pages for this topic: bestbroadbanddeals.co.uk, choose.co.uk, reddit.com.
- GSC: 915 impressions, 8 clicks, avg pos 18.3 (+0.0 vs prior 28d), 0 pages improving / 0 declining.
- Apply to: `/providers/compare/ee-vs-talktalk`, `/providers/compare/virgin-media-vs-sky`, `/providers/compare/virgin-media-vs-vodafone`, `/providers/compare/bt-vs-hyperoptic`, `/providers/compare/sky-vs-virgin-media`, `/providers/compare/bt-vs-talktalk`


---

## Original research

GSC: **444 impressions, 1 clicks, CTR 0.23%, avg position 13.7** (+0.0 vs prior 28d, flat). 0 pages improving, 0 declining, 2 newly ranking.


### Our pages of this type

| Page | Impr | Clicks | CTR | Pos | Pos vs prior |
|---|---|---|---|---|---|
| `/research/broadband-customer-service-rankings-uk` | 397 | 1 | 0.25% | 13.9 | +0.0 |
| `/research/uk-broadband-customer-satisfaction` | 47 | 0 | 0.00% | 12.2 | +0.0 |

### Queries these pages actually rank for (top by impressions)

`which broadband provider has the happiest customers overall?`, `which broadband provider has best customer service`, `uk broadband providers customer satisfaction`, `show me broadband comparison sites that highlight customer service ratings and complaint stats by provider`, `comparing customer satisfaction between plusnet and major uk broadband brands`, `best rated broadband provider uk`, `best customer service broadband uk`, `best broadband customer service`


### Pages that dominate these SERPs (popularity proxy)

| Page | Domain | Tier | Best rank | Query coverage | Top-3 | AI cites | Score |
|---|---|---|---|---|---|---|---|
| www.uswitch.com/broadband/guides/which-broadband-provider-is-best-for-… | uswitch.com | major comparison | 1 | 5 | 5 | 0 | 25 |
| www.ofcom.org.uk/phones-and-broadband/service-quality/customer-service… | ofcom.org.uk | regulator/gov | 2 | 4 | 4 | 0 | 20 |
| www.moneysupermarket.com/broadband/guides/broadband-best-customer-serv… | moneysupermarket.com | major comparison | 3 | 5 | 2 | 0 | 14 |
| www.ofcom.org.uk/phones-and-broadband/service-quality/report | ofcom.org.uk | regulator/gov | 3 | 2 | 1 | 0 | 9 |
| broadband.which.co.uk/ | broadband.which.co.uk | major comparison | 2 | 2 | 1 | 0 | 8 |
| www.broadband.co.uk/broadband/help/best-broadband-customer-service | broadband.co.uk | major comparison | 4 | 4 | 0 | 0 | 7 |

**Page-1 titles for these queries:**

- uswitch.com: Which broadband provider has the best customer service?
- ofcom.org.uk: Best and worst telecoms customer service revealed
- moneysupermarket.com: Which Broadband Providers Have The Best Customer ...
- ofcom.org.uk: Comparing customer service: choosing the best home ...
- broadband.which.co.uk: Compare broadband, digital TV & landline packages in your ...
- broadband.co.uk: Best Broadband Customer Service UK 2026 | Top Rated ISPs


_UX scrape: 3 of 4 top competitor pages read; blocked (bot protection): moneysupermarket.com. Blocked pages still count in the SERP tables above._


**People Also Ask (match these as H2s / FAQ):**

- Who has the most reliable broadband in the UK?
- Is EE or Vodafone better for broadband?
- Which is better, BT or Sky broadband?
- What is the most used broadband in the UK?
- Which broadband provider has the best reviews in the UK?
- Which broadband provider has the least complaints?
- Which broadband provider has the most complaints?
- Which broadband provider is most reliable in the UK?


### UX feature matrix (ours vs the winners we could read)

| Feature | Ours | Top competitors | Gap? |
|---|---|---|---|
| Concise answer / verdict block up top | yes | 0/3 |  |
| Question-shaped H2s (PAA match) | 0.0 | avg 2.3 | **GAP** |
| Visible FAQ section | yes | 0/3 |  |
| FAQPage schema | yes | 0/3 |  |
| BreadcrumbList schema | yes | 1/3 |  |
| On-this-page jump links | no | 1/3 | **GAP** |
| Visible last-updated / verified date | yes | 3/3 |  |
| Author / reviewed-by byline | yes | 1/3 |  |
| Related links / internal linking block | no | 0/3 |  |

### Recommendations

**P0 · GEO: be quotable in the AI answer**

- Evidence: 4 of 8 sampled original research queries show an AI Overview; BroadbandPicker is cited in 0. Domains that do get cited: n/a.
- GSC: AI referral visits to this type in GA4: 0.
- Apply to: `/research/broadband-customer-service-rankings-uk`, `/research/uk-broadband-customer-satisfaction`

**P1 · Question-shaped H2s (PAA match)**

- Evidence: 2/3 top competitor pages have this (avg 2.3). Top pages for this topic: uswitch.com, ofcom.org.uk, moneysupermarket.com.
- GSC: 444 impressions, 1 clicks, avg pos 13.7 (+0.0 vs prior 28d), 0 pages improving / 0 declining.
- Apply to: `/research/broadband-customer-service-rankings-uk`, `/research/uk-broadband-customer-satisfaction`

**P1 · On-this-page jump links**

- Evidence: 1/3 top competitor pages have this. Top pages for this topic: uswitch.com, ofcom.org.uk, moneysupermarket.com.
- GSC: 444 impressions, 1 clicks, avg pos 13.7 (+0.0 vs prior 28d), 0 pages improving / 0 declining.
- Apply to: `/research/broadband-customer-service-rankings-uk`, `/research/uk-broadband-customer-satisfaction`


---

## Provider deals page

GSC: **4,110 impressions, 1 clicks, CTR 0.02%, avg position 58.7** (+3.5 vs prior 28d, worse). 1 pages improving, 2 declining, 0 newly ranking.


### Our pages of this type

| Page | Impr | Clicks | CTR | Pos | Pos vs prior |
|---|---|---|---|---|---|
| `/providers/virgin-media/deals` | 2,236 | 1 | 0.04% | 61.0 | +6.4 |
| `/providers/bt/deals` | 902 | 0 | 0.00% | 72.3 | +4.0 |
| `/providers/sky/deals` | 600 | 0 | 0.00% | 42.0 | -3.2 |
| `/providers/ee/deals` | 372 | 0 | 0.00% | 38.7 | +0.1 |

### Queries these pages actually rank for (top by impressions)

`virgin media deals`, `sky broadband deals`, `virgin media offers`, `best bt broadband deals`, `bt broadband deals`, `bt broadband deals new customer`, `virgin broadband deals`, `ee broadband deals`


### Pages that dominate these SERPs (popularity proxy)

| Page | Domain | Tier | Best rank | Query coverage | Top-3 | AI cites | Score |
|---|---|---|---|---|---|---|---|
| www.bt.com/broadband/deals | bt.com | major provider | 1 | 2 | 2 | 5 | 18 |
| www.virginmedia.com/broadband/broadband-and-tv | virginmedia.com | major provider | 1 | 2 | 2 | 4 | 16 |
| www.moneysavingexpert.com/compare-broadband-deals/virgin-broadband/vir… | moneysavingexpert.com | major comparison | 2 | 2 | 2 | 1 | 12 |
| www.virginmedia.com/broadband | virginmedia.com | major provider | 2 | 2 | 1 | 4 | 11 |
| www.bt.com/tv/packages | bt.com | major provider | 3 | 1 | 1 | 4 | 10 |
| www.bt.com/broadband | bt.com | major provider | 3 | 1 | 1 | 4 | 10 |

**Page-1 titles for these queries:**

- bt.com: Best BT Broadband Deals For September 2026 | BT.com
- virginmedia.com: TV and Broadband Deals | Award Winning | September 2026
- moneysavingexpert.com: Virgin Media broadband and TV deals
- virginmedia.com: Broadband Deals | Award Winning | September 2026
- bt.com: Our Best TV & Broadband Deals | TV & Broadband Packages
- bt.com: BT Broadband deals


_UX scrape: 3 of 4 top competitor pages read; blocked (bot protection): moneysavingexpert.com. Blocked pages still count in the SERP tables above._


**People Also Ask (match these as H2s / FAQ):**

- Do Virgin Media offer deals for existing customers?
- How to get a better deal with Virgin Media?
- What is the best package on Virgin Media?
- How do I reduce My Virgin Media bill?
- How to get cheaper Sky Broadband?
- Who is cheaper, BT or Sky?
- What is the best Sky Broadband deal right now?
- Can pensioners get Sky cheaper?


### UX feature matrix (ours vs the winners we could read)

| Feature | Ours | Top competitors | Gap? |
|---|---|---|---|
| Current month in title | no | 2/3 | **GAP** |
| Concise answer / verdict block up top | yes | 0/3 |  |
| Visible FAQ section | yes | 2/3 |  |
| FAQPage schema | yes | 0/3 |  |
| BreadcrumbList schema | yes | 0/3 |  |
| Visible last-updated / verified date | yes | 0/3 |  |
| Postcode / availability input | yes | 2/3 |  |
| Card layout (not table-only) | no | 2/3 | **GAP** |
| Product / Offer schema | no | 0/3 |  |
| Related links / internal linking block | no | 0/3 |  |
| Get Deal CTAs on page | 1.0 | avg 1.7 |  |

### Recommendations

**P1 · GEO: be quotable in the AI answer**

- Evidence: 2 of 8 sampled provider deals page queries show an AI Overview; BroadbandPicker is cited in 0. Domains that do get cited: bt.com, confused.com, gocompare.com, moneysavingexpert.com, moneysupermarket.com, uswitch.com, virginmedia.com.
- GSC: AI referral visits to this type in GA4: 0.
- Apply to: `/providers/virgin-media/deals`, `/providers/bt/deals`, `/providers/sky/deals`, `/providers/ee/deals`

**P2 · Current month in title**

- Evidence: 2/3 top competitor pages have this. Top pages for this topic: bt.com, virginmedia.com, moneysavingexpert.com.
- GSC: 4,110 impressions, 1 clicks, avg pos 58.7 (+3.5 vs prior 28d), 1 pages improving / 2 declining.
- Apply to: `/providers/virgin-media/deals`, `/providers/bt/deals`, `/providers/sky/deals`, `/providers/ee/deals`

**P2 · Card layout (not table-only)**

- Evidence: 2/3 top competitor pages have this. Top pages for this topic: bt.com, virginmedia.com, moneysavingexpert.com.
- GSC: 4,110 impressions, 1 clicks, avg pos 58.7 (+3.5 vs prior 28d), 1 pages improving / 2 declining.
- Apply to: `/providers/virgin-media/deals`, `/providers/bt/deals`, `/providers/sky/deals`, `/providers/ee/deals`


---

## Interactive tool

GSC: **3,050 impressions, 1 clicks, CTR 0.03%, avg position 79.1** (+1.0 vs prior 28d, worse). 0 pages improving, 1 declining, 2 newly ranking.

_Speed tests and calculators are client-side apps; the static scrape cannot see their widgets or result flow. Treat the feature matrix below as a floor, not the full picture._


### Our pages of this type

| Page | Impr | Clicks | CTR | Pos | Pos vs prior |
|---|---|---|---|---|---|
| `/speed-test` | 3,013 | 1 | 0.03% | 79.8 | +1.7 |
| `/tools/broadband-cost-calculator` | 31 | 0 | 0.00% | 21.7 | +0.0 |
| `/tools/broadband-match` | 6 | 0 | 0.00% | 27.5 | +0.0 |

### Queries these pages actually rank for (top by impressions)

`internet speed test`, `test internet speed`, `broadband speed test`, `my internet speed`, `broadband internet speed test`, `broadband test`, `free broadband speed test`, `internet speeds`


### Pages that dominate these SERPs (popularity proxy)

| Page | Domain | Tier | Best rank | Query coverage | Top-3 | AI cites | Score |
|---|---|---|---|---|---|---|---|
| www.speedtest.net/ | speedtest.net | other | 1 | 5 | 4 | 0 | 19 |
| fast.com/en/gb/ | fast.com | other | 1 | 5 | 4 | 0 | 19 |
| broadbandtest.which.co.uk/ | broadbandtest.which.co.uk | major comparison | 3 | 5 | 3 | 0 | 17 |
| www.broadbandspeedchecker.co.uk/ | broadbandspeedchecker.co.uk | other | 1 | 5 | 3 | 0 | 16 |
| www.virginmedia.com/broadband/speed-test | virginmedia.com | major provider | 2 | 5 | 1 | 0 | 10 |
| www.uswitch.com/broadband/speedtest/ | uswitch.com | major comparison | 4 | 5 | 0 | 0 | 8 |

**Page-1 titles for these queries:**

- speedtest.net: Speedtest by Ookla - The Global Broadband Speed Test
- fast.com: Internet speed test
- broadbandtest.which.co.uk: Broadband speed test - Which?
- broadbandspeedchecker.co.uk: Broadband Speed Checker - UK's No.1 Broadband Speed Test
- virginmedia.com: Broadband Speed Test – Check Download, Upload, Latency
- uswitch.com: Test your broadband speed


_UX scrape: 4 of 4 top competitor pages read. Blocked pages still count in the SERP tables above._


**People Also Ask (match these as H2s / FAQ):**

- What is a good broadband speed test?
- How can I check my broadband speed?
- What's a good speed for broadband?
- Who has the most accurate internet speed test?


### UX feature matrix (ours vs the winners we could read)

| Feature | Ours | Top competitors | Gap? |
|---|---|---|---|
| Concise answer / verdict block up top | yes | 0/4 |  |
| Visible FAQ section | yes | 0/4 |  |
| FAQPage schema | yes | 0/4 |  |
| BreadcrumbList schema | yes | 0/4 |  |
| Visible last-updated / verified date | yes | 0/4 |  |
| Interactive calculator / slider | yes | 1/4 |  |
| Related links / internal linking block | no | 0/4 |  |

### Recommendations

**P2 · GEO: be quotable in the AI answer**

- Evidence: 0 of 8 sampled interactive tool queries show an AI Overview; BroadbandPicker is cited in 0. Domains that do get cited: n/a.
- GSC: AI referral visits to this type in GA4: 0.
- Apply to: `/speed-test`, `/tools/broadband-cost-calculator`, `/tools/broadband-match`


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

