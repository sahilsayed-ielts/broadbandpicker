# BroadbandPicker SEO + GEO Content Strategy

Updated: 2026-06-21

## Goal

Turn BroadbandPicker into a UK broadband authority site that wins:

- high-intent organic traffic from Google and Bing
- citation visibility inside AI-generated search experiences
- repeat traffic from users researching providers, prices, switching, and broadband rights

This strategy is designed for BroadbandPicker's current model: UK broadband affiliate marketing with comparison tools, provider pages, guides, postcode intent, and trust/editorial pages.

## Important strategic reality

GEO is not separate from SEO anymore.

Google's current guidance says there are no special extra requirements to appear in AI Overviews or AI Mode beyond strong SEO fundamentals, indexability, snippet eligibility, and helpful content. Bing's current AI guidance is similar, but adds a useful operational layer: cited pages tend to win when they are clear, well-structured, evidence-backed, current, and easy to ground to a specific query.

For BroadbandPicker, that means:

- do not chase "AI hacks"
- build pages that are easy to index, easy to understand, easy to cite, and easy to trust
- make the site the clearest source for UK broadband facts, comparisons, and rights guidance

## Research Snapshot: The UK Broadband Market

### 1. The market is now a mix of national retail brands, infrastructure owners, and altnets

UK broadband decisions are no longer just "BT vs Sky vs Virgin". Users are navigating:

- Openreach-based providers: BT, EE, Sky, TalkTalk, Plusnet, NOW Broadband, Vodafone and others
- Virgin Media O2's cable and fibre footprint
- altnets and fibre specialists such as Community Fibre, Hyperoptic, Toob, and CityFibre-backed retail options
- niche premium providers such as Zen Internet
- fallback alternatives such as 4G and 5G home broadband in weak fixed-line areas

Content implication:

- users need both provider guidance and network/technology guidance
- "best provider" content must be segmented by use case and by location
- BroadbandPicker should explain network type, not just brand

### 2. Availability and technology confusion are still major search opportunities

Broadband users still struggle with:

- FTTC vs FTTP vs cable vs 5G home broadband
- whether "full fibre" is available at their exact address
- why speeds differ by street, property type, and network
- whether a cheaper provider uses the same underlying line

Content implication:

- explanatory pages and postcode-led decision pages remain foundational
- comparison pages should always explain the network beneath the retail brand

### 3. Price transparency and contract timing are major consumer pain points

Ofcom's newer rules require providers to state mid-contract price rises in pounds and pence rather than through unknown future inflation formulas. That makes switching, contract-end timing, and price-rise content commercially important and useful.

Content implication:

- contract-end, price-rise, and switching content is not just support content; it is money content
- BroadbandPicker should own "what happens when my broadband contract ends?" and "can I leave after a price rise?" style queries

### 4. Social tariffs are still under-discovered

Recent UK reporting on Ofcom's 2026 pricing and consumer engagement findings says:

- over 30 social tariffs are available
- 70% of eligible households still do not know they exist
- 532,000 broadband customers were using a social tariff by June 2025
- 28% of broadband customers were out of contract and often paying more than in-contract users

Content implication:

- affordability content is both a public-service trust builder and an organic traffic opportunity
- social tariff pages should be a core authority pillar, not an afterthought

### 5. AI search favors decision-heavy and comparison-heavy queries

Google says AI Overviews and AI Mode are especially useful for complex questions, nuanced comparisons, and multi-step exploration. Broadband is exactly that kind of category:

- "BT vs Sky for gaming"
- "best broadband if moving house"
- "is full fibre worth it"
- "which providers do not raise prices mid-contract"
- "can I get broadband without a phone line"

Content implication:

- BroadbandPicker should prioritize comparison-heavy and explanation-heavy pages over thin deal pages
- answer-first layouts will matter more than long generic intros

## What Current Search Platforms Say

### Google

Current Google Search Central guidance says:

- there are no extra requirements to appear in AI Overviews or AI Mode
- pages must be indexed and eligible to appear in Google Search with a snippet
- the same foundational SEO best practices still apply
- to control what appears in AI features, use standard Search controls such as `nosnippet`, `max-snippet`, `data-nosnippet`, or `noindex`

What this means for BroadbandPicker:

- AI visibility starts with snippet-eligible, indexable pages
- if you block snippets too aggressively, you also reduce AI Overview eligibility
- the right move is not opt-out; it is better formatting, evidence, and freshness

### Bing / Microsoft

Microsoft's February 10, 2026 AI Performance launch is extremely useful because it is explicit about what helps cited content:

- clarity
- structure
- completeness
- FAQ sections
- tables
- evidence-backed claims
- freshness
- consistent entity representation across formats

Microsoft also recommends IndexNow to help search and AI systems pick up updated content faster.

What this means for BroadbandPicker:

- every important page should be citation-ready
- freshness must be visible, not implied
- tables and FAQ sections are not decorative; they help citation visibility
- IndexNow should be implemented

### OpenAI

OpenAI's crawler documentation now makes an important distinction:

- `GPTBot` controls training access
- `OAI-SearchBot` is the crawler token that matters for Search inclusion and search-related crawl control
- `ChatGPT-User` is for user-initiated actions and is not the correct control for Search opt-out

What this means for BroadbandPicker:

- allowing `GPTBot` alone is not enough if the goal is ChatGPT search visibility
- `OAI-SearchBot` should be explicitly allowed in `robots.txt`

## BroadbandPicker Audit: Current Position

### Strengths already in place

- strong topical fit: the entire site is focused on one commercial niche
- useful page mix already exists: homepage, compare, deals, provider pages, guides, postcode pages, trust pages, speed test
- foundational metadata and schema are already present across key templates
- `robots.ts` already allows major crawlers and publishes a sitemap
- trust pages exist: editorial policy, how we make money, how we review broadband, glossary, about, contact
- broadband is framed as a decision category, not just a deal list

### Gaps holding the site back

#### 1. The site is still light on page depth relative to the category

There are guides and provider pages, but not yet enough page families to cover the full search demand curve:

- provider-vs-provider pages
- rights pages
- price-rise pages by provider
- local and regional availability explainers
- research / statistics pages
- current industry updates

#### 2. Most editorial pages are not citation-ready yet

Current guides have updated dates and article schema, but they generally do not yet show:

- visible author identity
- source lists / references
- "last verified" pricing dates
- evidence boxes quoting source institutions
- clear methodology callouts inside commercial content

This limits both E-E-A-T signaling and AI citation trust.

#### 3. There is no original data / research layer

Affiliate sites usually plateau when they only summarize third-party information. To earn links and LLM citations, BroadbandPicker needs some content that other publishers cite.

Right now the site has:

- comparison content
- explanatory content

It does not yet have:

- original studies
- statistics pages
- annual rankings with transparent methodology
- update-driven news or tracker pages

#### 4. Internal linking is present but not yet strategic

The current structure links between major sections, but it is not yet building strong intent clusters such as:

- social tariff cluster
- switching cluster
- provider comparison cluster
- price rise / consumer rights cluster
- broadband by use case cluster

#### 5. There is a schema risk on provider pages

Provider pages use `Product` + `AggregateRating` with a hardcoded `reviewCount: 100`. Unless that count is sourced and supportable, this is a schema risk. These pages would be safer as:

- `Article` or `Review` content with clearly attributed source ratings
- optionally a sourced aggregate rating if the count is real and traceable

#### 6. The site is missing one important crawler control

`app/robots.ts` currently allows `GPTBot`, but OpenAI now says `OAI-SearchBot` is the correct token for Search inclusion controls. This is a small but meaningful gap for LLM search visibility.

## Strategic Positioning

BroadbandPicker should not try to beat giant comparison brands by being broader.

It should beat them by being:

- clearer
- more transparent
- more current
- more evidence-based
- more UK-broadband-specific
- better at explaining trade-offs

The brand position should be:

> The clearest and most evidence-backed UK broadband decision site for people who want to switch, save, or understand what they are buying.

## Content Architecture

BroadbandPicker should organize content into seven durable pillars.

### Pillar 1: Deals and switching intent

Purpose: capture bottom-funnel users ready to act.

Priority pages:

- Best Broadband Deals UK
- Cheapest Broadband Deals UK
- Broadband Deals With No Mid-Contract Price Rise
- Best Rolling Monthly Broadband Deals
- Best Broadband and TV Deals
- Broadband Deals for Existing Customers
- Broadband Deals Under GBP20
- Broadband Deals With Cashback / Gift Cards

Page format:

- answer summary in first 80 words
- table above the fold
- "last verified" date
- who the page is for
- methodology note
- FAQ

### Pillar 2: Provider reviews and provider comparisons

Purpose: own mid-funnel evaluation queries.

Priority pages:

- BT Broadband Review
- Sky Broadband Review
- Virgin Media Broadband Review
- EE Broadband Review
- Vodafone Broadband Review
- TalkTalk Broadband Review
- Plusnet Broadband Review
- Zen Internet Broadband Review
- Community Fibre Review
- Hyperoptic Review
- Toob Review

Priority comparison pages:

- BT vs Sky Broadband
- BT vs Virgin Media
- Sky vs Vodafone
- EE vs BT
- Hyperoptic vs Community Fibre
- TalkTalk vs NOW Broadband
- Zen vs BT
- Virgin Media vs Vodafone

Page format:

- who should choose it
- who should avoid it
- speeds / pricing / setup / complaints / coverage table
- price-rise policy
- contract length
- support quality
- source block
- alternatives section

### Pillar 3: Technology and availability education

Purpose: capture research intent and build authority.

Priority pages:

- FTTC vs FTTP Explained
- What Is Full Fibre Broadband
- Cable vs Full Fibre Broadband
- 5G Home Broadband vs Fixed Broadband
- Broadband Without a Phone Line
- What Broadband Speed Do I Need
- Minimum Guaranteed Speed Explained
- What Causes Slow Broadband
- Best Router Position for Faster Wi-Fi

Page format:

- simple definition first
- comparison table
- "when to choose X" section
- common mistakes
- internal links to commercial pages

### Pillar 4: Consumer rights, billing, and switching rules

Purpose: win trust and high-citation informational traffic.

Priority pages:

- How to Switch Broadband
- One Touch Switching Explained
- Can I Leave Broadband Early After a Price Rise
- Broadband Contract End Rights
- How to Avoid Out-of-Contract Broadband Prices
- How to Complain About Your Broadband Provider
- What to Do If Your Speed Is Below the Guaranteed Minimum
- Broadband Cooling-Off Period Explained
- Moving House Broadband Checklist

These pages are especially citation-friendly because they answer factual, high-friction questions.

### Pillar 5: Affordability and social tariffs

Purpose: capture underserved demand and build trust.

Priority pages:

- Broadband Social Tariffs UK
- Cheapest Social Tariffs by Provider
- Can You Switch to a Social Tariff Mid-Contract
- Universal Credit Broadband Help
- Broadband Help for Pension Credit Claimants
- Best Cheap Broadband for Low-Income Households

This pillar should be treated as a brand-building moat, not just a traffic play.

### Pillar 6: Local and postcode-led demand

Purpose: convert high-intent local availability demand.

Current postcode pages are a good start. Expand with:

- city pages: Best Broadband in London / Manchester / Birmingham / Leeds / Glasgow / Bristol
- network pages: Full Fibre Availability in [city]
- altnet pages: Community Fibre Areas / Hyperoptic Areas / Toob Coverage
- rural intent pages: Best Broadband for Rural Areas UK

Rule:

- local pages must not be thin templates
- each should explain network mix, strongest providers, and local switching advice

### Pillar 7: Research, rankings, and current updates

Purpose: earn links, citations, and brand mentions.

Priority research assets:

- UK Broadband Complaints League Table
- UK Broadband Price Rise Tracker
- Best and Worst Broadband Providers by Complaints
- Social Tariff Awareness Gap in the UK
- Full Fibre Rollout Tracker by Nation and Region
- Out-of-Contract Broadband Penalty Report

Priority update pages:

- Broadband Price Rises [year]
- Black Friday Broadband Deals [year]
- Ofcom Complaints Update [quarter]
- Connected Nations Summary [year]

This is the biggest authority gap and the highest upside area for link earning.

## GEO-Friendly Page Design Standard

Every priority editorial page should follow this structure:

1. Direct answer block
2. Key facts at a glance
3. Comparison table
4. Explanation and trade-offs
5. Evidence / sources section
6. FAQ
7. Next-step internal links

### Direct answer block

First 60 to 100 words should answer the question plainly. Example:

> The best broadband for most UK households in 2026 is a 100-300 Mbps full-fibre package, because it balances speed, price, and reliability better than entry FTTC or premium gigabit plans.

This is good for:

- featured snippets
- AI Overviews
- Bing citations
- user trust

### Key facts at a glance

Use short bullets or cards for:

- from price
- max speed
- contract term
- price rise policy
- best for
- worst for
- last verified date

### Comparison tables

AI systems and users both love structured comparisons. BroadbandPicker should use tables aggressively for:

- provider comparisons
- speed tiers
- contract lengths
- complaint rates
- price-rise policies
- social tariff eligibility

### Evidence / sources section

Every guide and review should end with a visible references block such as:

- Ofcom complaints data
- Ofcom Connected Nations
- provider pricing pages
- provider terms and contract PDFs
- Trustpilot profile links

This is one of the strongest missing elements on the site today.

### Freshness signals

Every page that mentions prices, complaints, speeds, or rules should show:

- published date
- last updated date
- last verified date for prices or policy facts

## SEO Standards BroadbandPicker Should Adopt

### On-page

- one clear intent per page
- title tags front-loaded with the exact query theme
- answer-first intros
- subheadings written as questions or decision points
- strong comparison tables
- FAQs only when they add real value
- internal anchors for long pages

### Internal linking

Each page should link in four directions:

- up to its pillar hub
- across to comparable alternatives
- down to supporting explainers
- forward to the next decision page

Example:

`BT vs Sky Broadband` should link to:

- `BT Broadband Review`
- `Sky Broadband Review`
- `How to Switch Broadband`
- `Broadband Price Rises`
- `Best Broadband for Gaming`

### Schema

Priority schema stack:

- `Article` on guides and research pages
- `FAQPage` where genuinely present
- `BreadcrumbList`
- `Organization`
- `WebSite`
- `ItemList` for comparison collections

Recommended additions:

- `Person` author schema with real editorial bios
- `Review` schema where appropriate and supportable
- removal or correction of unsupported aggregate rating fields

### Entity consistency

Use consistent naming across pages:

- `Virgin Media` not sometimes `Virgin`
- `full fibre (FTTP)` on first mention
- `One Touch Switching (OTS)` on first mention
- `Ofcom` always as the cited regulator

This helps both search and AI systems resolve entities cleanly.

## Technical Backlog

### Immediate

- add `OAI-SearchBot` to `app/robots.ts`
- keep `Googlebot`, `GPTBot`, `ClaudeBot`, `PerplexityBot`, and `Google-Extended` rules explicit
- do not add restrictive `nosnippet` rules on key editorial pages

### Next

- implement IndexNow
- add visible references blocks to guide and provider templates
- add visible author / reviewer bylines
- add "last verified" field for pricing pages
- add source-specific provider facts instead of generic prose only
- add research/news content types
- create comparison route family for `/providers/compare/[a]-vs-[b]`

### Caution items

- review any schema that implies ratings or counts not directly supportable
- avoid thin programmatic local pages
- avoid using AI-written filler without source grounding and editorial review

## 90-Day Execution Plan

### Days 1-30

- fix crawler gap with `OAI-SearchBot`
- create source / references pattern for guides and provider pages
- launch 8 highest-value commercial + decision pages:
  - Best Broadband Deals UK
  - Cheapest Broadband Deals UK
  - BT vs Sky Broadband
  - Virgin Media vs BT
  - Broadband Contract End Rights
  - Broadband Price Rises 2026
  - One Touch Switching Explained
  - Broadband Social Tariffs UK

### Days 31-60

- launch 6-8 provider comparison pages
- launch 4 rights / billing pages
- launch 4 use-case pages:
  - best broadband for gaming
  - best broadband for working from home
  - best broadband for students
  - best broadband for streaming
- build author bio system
- build evidence boxes for Ofcom / provider sources

### Days 61-90

- launch `/research`
- publish first 3 linkable research assets
- expand local / city pages
- launch ongoing complaints and price tracker format
- implement IndexNow and start measuring Bing AI citations

## KPIs

### Organic search

- non-brand clicks
- top 3 rankings for "best", "cheapest", "vs", "review", "social tariff", and "switch" query sets
- pages with impressions but weak CTR
- number of indexed guides, comparisons, and research pages

### GEO / AI visibility

- Bing AI Performance total citations
- number of cited URLs
- grounding query coverage in Bing Webmaster Tools
- referral traffic from AI/search assistants where measurable
- pages most frequently cited in AI experiences

### Authority

- referring domains to research pages
- branded search growth
- mentions in forums, news, and consumer advice content
- repeat users to guides and tools

## Recommended editorial rules

- no guide should publish without a source block
- no review should publish without at least one negative trade-off
- no pricing page should publish without a visible verification date
- no local page should publish without local network context
- no statistics claim should appear without date + source

## Final recommendation

BroadbandPicker should aim to become:

- the best broadband decision site for humans
- the easiest broadband source for search engines to understand
- the safest broadband source for AI systems to cite

That means prioritizing:

- evidence
- freshness
- structure
- comparisons
- rights guidance
- original research

If the site executes those consistently, it can compete above its size because most affiliate competitors still underinvest in transparency, source quality, and citation-ready formatting.

## Sources

Primary sources:

- Google Search Central: AI features and your website  
  https://developers.google.com/search/docs/appearance/ai-features
- Google Search Central: Optimizing for generative AI search  
  https://developers.google.com/search/docs/fundamentals/ai-optimization-guide
- Google Crawling Infrastructure: Google-Extended  
  https://developers.google.com/crawling/docs/crawlers-fetchers/google-common-crawlers
- Microsoft Bing Webmaster Blog: AI Performance in Bing Webmaster Tools Public Preview (2026-02-10)  
  https://blogs.bing.com/webmaster/February-2026/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview
- OpenAI crawler documentation  
  https://developers.openai.com/api/docs/bots

Regulator-backed / market context used for current UK broadband conditions:

- The Times reporting Ofcom's March 20, 2025 telecoms access review update  
  https://www.thetimes.co.uk/article/ofcom-uk-is-on-track-for-full-fibre-broadband-by-2027-ftnfdjvzz
- Financial Times reporting Ofcom's July 19, 2024 decision on mid-contract price rise rules  
  https://www.ft.com/content/fe8db852-d185-42b8-be99-459fa7a2362d
- The Guardian on January 17, 2025 implementation of Ofcom's fixed pounds-and-pence rules  
  https://www.theguardian.com/business/2025/jan/17/ofcom-ban-nasty-surprise-mid-contract-telecoms-price-rises
- The Sun reporting Ofcom's February 2026 pricing and consumer engagement findings  
  https://www.thesun.co.uk/money/38358029/households-missing-broadband-boost-how-to-claim/

Note: where direct Ofcom pages could not be reliably retrieved from this environment, current UK market figures above are attributed through contemporaneous reporting on Ofcom publications.
