# Homepage SEO + GEO + UX plan

Generated 2026-08-31.
Site: https://broadbandpicker.co.uk

This file is written by `scripts/plan_homepage_seo_geo.py`. It is a brief for the live
homepage: generic broadband queries, not city or category URLs.

## What BroadbandPicker is

UK broadband price comparison / affiliate publisher. Not a telecoms operator. Same industry bucket as Uswitch and broadbandchoices.

**Revenue:** Free for consumers. Affiliate commission when a visitor clicks through and signs up. Rankings are not sold. Providers can appear with or without an affiliate relationship.

**Providers in the dataset:** 24 (BT, Sky, Virgin Media, EE, TalkTalk, Plusnet, Vodafone, NOW Broadband…)

**Tools already on the site:** Postcode checker (homepage), Compare, Deals table, Speed test, Broadband Match quiz, Cost calculator, Glossary

**Trust URLs:** https://broadbandpicker.co.uk/about, https://broadbandpicker.co.uk/how-we-make-money, https://broadbandpicker.co.uk/how-we-review-broadband, https://broadbandpicker.co.uk/editorial-policy

## Current homepage audit

| Field | Value |
|---|---|
| Title | Compare Broadband Deals UK | BroadbandPicker |
| H1 | Compare Broadband Deals for Your Postcode |
| Meta description | Compare UK broadband deals by postcode. Free checker for fibre and full-fibre packages from BT, Sky, Virgin Media, EE and more. Rankings are not sold. |
| Approx. words in TSX text | 1716 |
| Em dashes in `app/page.tsx` | 0 |
| AI-tell patterns | none detected in markup |
| Header postcode checker | True |
| Header nav labels | Compare, Deals, Providers, In your area, Guides, Tools, All providers, Provider vs provider, Popular providers, Find your area, Popular areas |
| Header em dashes | 0 |
| Footer columns | Compare, Tools, In your area, Guides, Company, Legal |
| Footer hrefs | 27 |
| Footer social | True |
| Footer disclosure | True |
| Footer em dashes | 0 |
| Logo SVGs | 24 |
| Logo intrinsic outliers | brsk.svg intrinsic 240x80, community-fibre.svg intrinsic 214x57, cuckoo.svg intrinsic 240x72, ee.svg intrinsic 200x351, gigaclear.svg intrinsic 240x72, onestream.svg intrinsic 240x72, shell-energy.svg intrinsic 240x72 |
| Equal-tile logo rail | True |

GSC Search Generative AI Features export: homepage has **15** impressions in that extract. Guides currently absorb more AI-overview impressions than `/`. The homepage needs citeable answers, not just a checker, if we want LLMs to quote it.

Files read:

- app/page.tsx
- app/layout.tsx
- components/MainNav.tsx
- components/MobileNav.tsx
- app/about/page.tsx
- app/how-we-make-money/page.tsx
- app/how-we-review-broadband/page.tsx
- app/editorial-policy/page.tsx
- data/providers.ts
- data/guides.ts
- docs/content-plan.md
- docs/ga4-seo-strategy-plan.md
- docs/home page UX/homepage-redesign-analysis.md
- lib/affiliate.ts
- components/ProviderLogo.tsx
- components/HomepageLogoRail.tsx

## Homepage keyword cluster

These are the searches that should reach `/`, not `/guides/cheapest-broadband-uk` or `/postcode/london`.

| Keyword | Volume | KD | CPC | Intent | Role | Cannibal risk |
|---|---|---|---|---|---|---|
| broadband | 246,000 | 78 | 3.80 | Informational | primary | Low: homepage should rank |
| broadband uk | 33,100 | 55 | 4.10 | Informational | primary | Low: homepage should rank |
| compare broadband | 14,800 | 58 | 5.90 | Commercial | primary | Low: homepage should rank |
| broadband comparison | 5,400 | 48 | 5.40 | Commercial | primary | Low: homepage should rank |
| broadband checker | 14,800 | 42 | 3.20 | Transactional tool | primary | Low: homepage should rank |
| broadband in my area | 12,100 | 40 | 3.50 | Local commercial | primary | Low: homepage should rank |
| home broadband | 14,800 | 52 | 4.00 | Informational | secondary | Medium: share with a child URL |
| internet deals uk | 9,900 | 60 | 6.10 | Commercial | secondary | Medium: share with a child URL |
| broadband providers uk | 22,200 | 62 | 4.80 | Commercial | secondary | Medium: share with a child URL |
| switch broadband | 8,100 | 38 | 4.20 | Transactional | secondary | Medium: share with a child URL |
| fibre broadband | 90,500 | 68 | 5.50 | Informational | supporting | Medium: share with a child URL |
| full fibre broadband | 40,500 | 58 | 5.80 | Informational | supporting | Medium: share with a child URL |
| broadband deals | 165,000 | 71 | 8.32 | Commercial | supporting | High: keep a teaser and link out |
| compare broadband deals | 9,900 | 62 | 6.40 | Commercial | supporting | High: keep a teaser and link out |
| best broadband uk | 22,200 | 64 | 6.00 | Commercial | supporting | Medium: share with a child URL |
| cheap broadband | 49,500 | 55 | 4.58 | Commercial | supporting | Medium: share with a child URL |
| broadband postcode | 2,900 | 28 | 2.80 | Transactional tool | supporting | Medium: share with a child URL |
| what broadband do i need | 3,600 | 24 | 2.10 | Informational | supporting | Medium: share with a child URL |
| ofcom broadband | 2,400 | 32 | 1.40 | Informational | trust | Medium: share with a child URL |
| one touch switch | 5,400 | 22 | 1.80 | Informational | trust | Medium: share with a child URL |

**Primary title pattern:** Compare Broadband Deals UK | postcode checker. Keep the live title. Do not retitle to Cheap Broadband and steal `/deals`.

**Primary H1:** Compare Broadband Deals for Your Postcode. It already matches the cluster.

## Competitor homepages (live scrape)

Readable pages: 0. Median word count on fetched HTML: n/a.
Postcode UX on 0 pages. FAQ mention on 0. Schema on 0. FAQPage on 0.



| Source | HTTP | OK | Words | Postcode | FAQ | H1 |
|---|---|---|---|---|---|---|
| Uswitch broadband | skipped | no | 0 | n | n | — |
| Uswitch home | skipped | no | 0 | n | n | — |
| broadband.co.uk | skipped | no | 0 | n | n | — |
| choose.co.uk | skipped | no | 0 | n | n | — |
| Go.Compare broadband | skipped | no | 0 | n | n | — |
| Confused.com broadband | skipped | no | 0 | n | n | — |
| Which? Switch | skipped | no | 0 | n | n | — |
| MoneySuperMarket broadband | skipped | no | 0 | n | n | — |
| Compare the Market broadband | skipped | no | 0 | n | n | — |
| Broadband Genie | skipped | no | 0 | n | n | — |
| MoneySavingExpert cheap broadband | skipped | no | 0 | n | n | — |
| Ofcom broadband | skipped | no | 0 | n | n | — |

Sample H2s seen: none

### Header and footer chrome on competitor pages

Postcode in the header on 0 readable pages. Social in the footer on 0. Affiliate disclosure in the footer on 0.



Nav labels seen: none

Footer labels seen: none

## Copy rules (anti-AI, pro-citation)

- British English. Fibre, not fiber. Organisation, not organization in running copy unless it is a schema field.
- No em dash (U+2014). Use a comma, a colon, a full stop, or a hyphen.
- No AI tells: delve, landscape, in today's world, whether you're, it's important to note, unlock, elevate, seamless, comprehensive guide, let's dive, robust, leverage, cutting-edge, game-changer.
- Do not open every section with a definition of broadband. Answer the search, then explain.
- Put a direct 40 to 70 word answer under the first H2 so AI Overviews and LLMs have something to quote.
- Date prices and Ofcom facts. Link /how-we-review-broadband and /how-we-make-money.
- Affiliate honesty in the same breath as the deal table, not a footer afterthought.
- Specific names: BT, Sky, Virgin Media, EE, TalkTalk, Vodafone, Plusnet, Hyperoptic, Community Fibre, Toob.
- Short sentences mixed with longer ones. One joke is allowed. A paragraph of jokes is not.
- Internal links to /deals, /compare, /guides/how-to-switch-broadband-uk, /guides/cheapest-broadband-uk, /guides/broadband-social-tariffs-uk, /speed-test, /tools/broadband-match.

## GEO: get quoted by AI Overviews and LLMs

- Lead sections with a plain-English claim a model can lift without the surrounding marketing.
- FAQ answers of 2 to 4 sentences, one fact each, with a source or a dated caveat.
- JSON-LD: WebSite + SearchAction, Organization, WebPage, FAQPage, HowTo for the three steps. Sanitize < in stringify.
- sameAs social profiles. Organization logo. dateModified from the deals snapshot.
- Speakable-style first paragraph: who we are, what the tool does, that availability is by address.
- Cite Ofcom (One Touch Switch, social tariffs, full fibre coverage) rather than inventing stats.
- Do not cloak. The HTML the crawler sees is the HTML the user sees.
- Track AI referrals with the existing ai_referral_visit event. Do not add hidden prompt text.

First 60-word answer to put under an H2, as a model-liftable paragraph:

> BroadbandPicker is a free UK comparison site. You enter a postcode, we show the
> broadband deals that can actually serve that address, and you pick a package by
> price, speed and contract. We may earn a commission if you sign up. That does not
> buy a higher rank. Availability is always by address, never by a national advert.

## UX plan (modern, interactive, on-brand)

Keep the navy/sky system. Do not add stock photography. This vertical's winning
homepages are SVG + logos + a checker (see `homepage-redesign-analysis.md`).
Interactivity should be HTML-first islands (`use client` only where the click
does something), so Google and GPTBot still see the answers.

### Hero

- **Job:** Rank for compare broadband / broadband checker. Convert postcode.
- **Interactive:** Existing large PostcodeChecker. Keep it as the only primary CTA.
- **Visual:** Navy/sky field, hero-network SVG, no stock photo.
- **Copy:** H1 stays Compare Broadband Deals for Your Postcode. Subhead names fibre and full fibre without a national from-price.

### Proof strip

- **Job:** Trust in 3 seconds for humans and Awin reviewers.
- **Interactive:** SocialProofCounter already animates. Keep provider count live from data/providers.ts.
- **Visual:** Ticks, not badges bought from a widget farm.
- **Copy:** Comparing N providers. Free. Rankings not sold.

### Logo rail

- **Job:** broadband providers uk. Trust that we actually list the networks people search.
- **Interactive:** Equal CSS grid. Each tile links to /providers/[slug]. Hover border. No horizontal swipe on desktop.
- **Visual:** Identical tiles, same width and height. Logo sits in the tile with object-contain and padding so EE, Zen and wordmarks all render at one optical size. Intrinsic SVG width/height must never size the card. Navy/sky hover, paper cards, 1px slate hairline. Retired brands keep a tiny label that does not change the tile size.
- **Copy:** Compare deals from Britain's biggest broadband providers. No em dash.

### Featured deals

- **Job:** Commercial teaser. Do not replace /deals.
- **Interactive:** DealTable with Get Deal. Disclosure under the table.
- **Visual:** Existing table. No red SALE skin.
- **Copy:** Today's snapshot, dated. Link See all deals.

### What speed do you actually need

- **Job:** what broadband do i need. Saves. GEO quote.
- **Interactive:** Clickable household cards (1 person, couple, family, busy house) that reveal a typical Mbps range and a CTA to Broadband Match.
- **Visual:** Four original SVG tiles, sky/navy, not stock families.
- **Copy:** Gigabit is optional. Ping and upload matter. Be honest.

### How it works

- **Job:** HowTo schema. Reduce switch fear.
- **Interactive:** ScrollReveal on the three steps. Hover scale already there.
- **Visual:** icon-postcode, icon-compare, icon-switch.
- **Copy:** Postcode, compare, the new provider handles One Touch Switch. No em dash.

### Rights and loyalty tax

- **Job:** switch broadband, one touch switch. Citation bait.
- **Interactive:** Three fact cards with a source line. Link the guides.
- **Visual:** Minimal navy cards, one sky accent.
- **Copy:** Out of contract is the business model. OTS is real. Social tariffs exist and most eligible people have not heard of them.

### Deep editorial

- **Job:** Indexable depth for broadband / broadband uk. AI Overview source.
- **Interactive:** None required. HTML is the feature.
- **Visual:** Pull-quote of the 50-word answer. Small fibre vs cabinet diagram.
- **Copy:** 800 to 1400 words. Human. Dated. Internal links. No duplicate of a guide.

### FAQ

- **Job:** People Also Ask + FAQPage.
- **Interactive:** Existing FAQAccordion.
- **Visual:** Clean bordered list.
- **Copy:** Eight questions that match homepage queries, not category guides.

### Match quiz + newsletter

- **Job:** Engagement and return visits.
- **Interactive:** Existing quiz promo and NewsletterSignup.
- **Visual:** quiz-match.svg, blob decorations.
- **Copy:** Keep. Remove any leftover em dash.


## Header plan (sitewide, same SEO/GEO logic)

The header is on every URL. It should convert `broadband checker` / `broadband in my area` and tell crawlers this is an independent comparison publisher.

### Trust strip

- **Job:** GEO/Awin: independent claim on every URL, including guides.
- **Interactive:** None. Plain HTML links. Not sticky, so it does not steal hero height on mobile.
- **Visual:** Navy bar, tiny type, sky link.
- **Copy:** Independent UK broadband comparison. Rankings are not sold. How we make money.

### Sticky header

- **Job:** Logo home, nav, postcode conversion for broadband checker / in my area.
- **Interactive:** Existing PostcodeChecker. Hover dropdowns stay HTML so crawlers see the links.
- **Visual:** White field, sky mark, 1px sky hairline. Logo plus a small tagline on xl screens.
- **Copy:** Tagline: UK broadband comparison. Placeholder: Check your postcode.

### Nav labels

- **Job:** Map head terms without stuffing. Compare, Deals, Providers, In your area, Guides, Tools.
- **Interactive:** Dropdowns already exist. Keep real hrefs inside them.
- **Visual:** Sky hover, no mega-menu animation libraries.
- **Copy:** Rename Postcode to In your area so it matches broadband in my area. Keep Postcode in the checker itself.


## Footer plan (sitewide sitemap + citeable org copy)

### Brand + citeable blurb

- **Job:** Organization snippet LLMs can quote on any page.
- **Interactive:** None.
- **Visual:** Logo at 36px, faint blob, navy field.
- **Copy:** Same 50-word independent-comparison claim as the homepage pull-quote. No em dash.

### Footer postcode

- **Job:** Second conversion for people who scrolled a guide.
- **Interactive:** PostcodeChecker island.
- **Visual:** Compact, not a second hero.
- **Copy:** Check broadband in your area. Availability is by address.

### Link columns

- **Job:** Internal links for compare / switch / cheap / social tariff / fibre.
- **Interactive:** Existing details accordion on small screens, static on lg.
- **Visual:** Six columns. Sky hover.
- **Copy:** Add How to switch, Social tariffs, Full fibre, Cheapest broadband, Partnerships. Keep legal and trust pages.

### Disclosure + social

- **Job:** ASA/Awin plus sameAs targets.
- **Interactive:** Existing social pills with hover scale. Back to top.
- **Visual:** Keep pills. Do not add empty TikTok until the account exists.
- **Copy:** Commission disclosure in one short paragraph. UK, not affiliated with any provider.


## FAQ to ship on the homepage

**How do I compare broadband deals in the UK?**

Enter your postcode. Availability, speed and price change street by street, so a national from-price is guesswork. BroadbandPicker lists the packages that can actually serve that address, then you compare monthly cost, contract length, setup fees and typical speed before you switch.

**Is BroadbandPicker free to use?**

Yes. The comparison is free. We may earn an affiliate commission if you click through and sign up with a provider. That fee does not change the order of the table. We still list providers we do not earn from. The full explanation is on How we make money.

**Why do broadband deals depend on my postcode?**

Different networks built different streets. Openreach, Virgin Media, CityFibre and smaller full-fibre builders do not cover the same homes. Two neighbours can see different speeds and different prices. Check the address, not the TV advert.

**What broadband speed do I actually need?**

One or two people browsing and watching HD are usually fine on a few dozen Mbps. A family that works from home and streams in 4K needs more, especially on the upload. Gaming cares more about ping than a vanity gigabit number. Use the household cards on this page or the Broadband Match quiz if you want a tailored range.

**What is the difference between fibre and full fibre?**

A lot of UK 'fibre' is fibre to a street cabinet and copper for the last stretch (FTTC). Full fibre, or FTTP, runs glass all the way to the premises. Full fibre is faster on the upload and more consistent at 7pm. If the listing does not say full fibre or FTTP, assume it may still involve copper.

**How does switching broadband work now?**

One Touch Switch, live since 12 September 2024, means the new provider handles the move and you stay online during the cutover in the usual case. You still need to check early-termination fees if you are in contract. Ofcom reports more than two million residential switches completed under the process.

**Are there cheaper broadband tariffs if I claim benefits?**

Yes. Social tariffs from participating providers sit roughly in the £12.50 to £24 a month range if you qualify (for example Universal Credit or Pension Credit). Ofcom has found that most eligible households still have not heard of them. We publish a plain-English guide rather than burying this in a PDF.

**Does staying loyal get me a better broadband price?**

Usually the opposite. Introductory prices end, and many households keep paying the higher out-of-contract rate. New-customer deals on the same network are often cheaper. Check your contract end date, then compare what is on offer at your postcode before you assume loyalty is being rewarded.


## Implementation notes for Next.js in this repo

- Header and footer live in `app/layout.tsx` (Server Component). Dropdowns and the postcode field stay HTML-visible. Mobile drawer is a client island.
- Homepage stays a Server Component in `app/page.tsx`. Interactive bits are client islands.
- JSON-LD via a `<script type="application/ld+json">` with `JSON.stringify(...).replace(/</g, '\\u003c')` as in the Next.js JSON-LD guide.
- New SVGs go through `scripts/generate_homepage_illustrations.py`, not stock.
- Do not introduce a carousel library. The competitor visual scan found none in this vertical.

## Sitewide technical diagnosis

The same run writes `docs/site-technical-seo-geo-diagnosis.md`: schema, crawl,
GEO and LLM-visibility work for the whole site, not just `/`. Schema alone
does not buy position 1. It makes pages eligible for rich results and easier
for AI Overviews and LLMs to quote.

## Success

- Rank and CTR for `compare broadband`, `broadband uk`, `broadband checker`, `broadband in my area`.
- AI Overview / LLM citations of the 60-word answer and the FAQ.
- Postcode submit rate on `/` holds or rises. Affiliate clicks from the featured table stay honest and labelled.
