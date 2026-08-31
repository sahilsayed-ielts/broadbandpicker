# Site technical SEO + GEO diagnosis

Generated 2026-08-31.
Site: https://broadbandpicker.co.uk
Produced by `scripts/plan_homepage_seo_geo.py` (site-diagnosis pass).

## What this is for

Technical work that makes BroadbandPicker easier for Google, AI Overviews and
LLMs to crawl, trust and quote. Schema is eligibility, not a ranking cheat.
Position 1 still needs the best answer, internal links, and crawl efficiency.
This list is the engineering backlog that sits under that content.

Honest constraint: nobody ships "rank 1 for broadband" with JSON-LD alone.
Uswitch and the comparison majors win head terms with brand + links. The
winnable jobs are: get cited in Overviews for questions we already answer,
get retrieved by ChatGPT/Perplexity/Gemini when someone asks for a UK
comparison, and take page-one (then position 1) on mid-tail queries the
majors leave thin (switch, social tariffs, postcode, provider vs provider).

## Snapshot

- Guides in dataset: 46
- Providers in dataset: 24
- Schema types declared in source: WebPage, FAQPage, Question, Answer, HowTo, HowToStep, AdministrativeArea, Country, Dataset, PropertyValue, ContactPage, Organization, ContactPoint, DefinedTermSet, DefinedTerm, ItemList, ListItem, CollectionPage, Service, AboutPage, BreadcrumbList, ImageObject, WebSite, SearchAction, Article, Offer, Product, Brand, UnitPriceSpecification, QuantitativeValue, OfferCatalog
- JSON-LD files missing `<` sanitise: 0
- Organization JSON-LD in layout: True
- `/llms.txt` in repo: True
- IndexNow: True
- AI crawlers named in robots.ts: Googlebot, Google-Extended, Google-CloudVertexBot, OAI-SearchBot, GPTBot, ChatGPT-User, ClaudeBot, anthropic-ai, PerplexityBot, Perplexity-User, Bingbot, Applebot, DuckDuckBot, Amazonbot, meta-externalagent
- P0 items still missing: 0 / 9

## Live page probe

Skipped (`--skip-web`) or no successful fetches.

### Technical URLs

Skipped.

### Competitor schema types seen this run

None extracted (JS shells or skipped).

UK comparison homepages are still thin on FAQPage and Organisation copy.
That is the gap: sitewide publisher entity + citeable HTML + honest Offer data.

## Schema by template

### Root layout (every URL)

- **File:** `app/layout.tsx`
- **Now:** No JSON-LD. MetadataBase, default title, robots, homepage canonical + hreflang.
- **Ship:** WebSite + Organization as an @graph with stable @id values. Remove homepage-only canonical and hreflang from the layout.
- **Types:** `WebSite`, `Organization`, `SearchAction`

### Homepage /

- **File:** `app/page.tsx`
- **Now:** WebSite, Organization, WebPage, FAQPage, HowTo. No ItemList on the featured table.
- **Ship:** Keep FAQPage + HowTo + WebPage. Point publisher at layout @id. Add ItemList for the five featured deals. Keep the 40-70 word citeable answer in HTML.
- **Types:** `WebPage`, `FAQPage`, `HowTo`, `ItemList`

### Deals /deals

- **File:** `app/deals/page.tsx + lib/dealSchema.ts`
- **Now:** CollectionPage + ItemList of Product/Offer. No priceValidUntil, no shippingDetails.
- **Ship:** Keep CollectionPage + ItemList. Add priceValidUntil from the dataset date. Do not invent shipping or return policy. If GSC reports Merchant listing errors, drop Product and keep Offer inside ListItem.
- **Types:** `CollectionPage`, `ItemList`, `Offer`, `OfferCatalog`

### Compare /compare

- **File:** `app/compare/page.tsx`
- **Now:** CollectionPage, ItemList, FAQPage, BreadcrumbList.
- **Ship:** Keep. Link ItemList entries to /providers/[slug]. Add dateModified already present.
- **Types:** `CollectionPage`, `ItemList`, `FAQPage`, `BreadcrumbList`

### Provider /providers/[slug]

- **File:** `app/providers/[slug]/page.tsx`
- **Now:** Article, FAQPage, Product/Offer, BreadcrumbList. Article has no image, no publisher.logo, no inLanguage.
- **Ship:** Article + FAQPage + Service (the ISP) + Offer. Add image, publisher.logo, inLanguage en-GB, isAccessibleForFree, citation[], about. Service.areaServed = GB.
- **Types:** `Article`, `FAQPage`, `Service`, `Offer`, `Brand`

### Head-to-head /providers/compare/[slug]

- **File:** `app/providers/compare/[slug]/page.tsx`
- **Now:** Article + FAQPage.
- **Ship:** Article + FAQPage + ItemList for the comparison table. Optional HowTo for choosing between the two.
- **Types:** `Article`, `FAQPage`, `ItemList`

### Guide /guides/[slug]

- **File:** `app/guides/[slug]/page.tsx`
- **Now:** Article + FAQPage. Missing image (required for Article rich results), citation, about, wordCount.
- **Ship:** Article with image, publisher.logo, wordCount, articleSection, about, citation. FAQPage only when FAQs are on the page. HowTo on how-to-switch-broadband-uk.
- **Types:** `Article`, `FAQPage`, `HowTo`, `BreadcrumbList`

### Postcode /postcode/[area]

- **File:** `app/postcode/[area]/page.tsx`
- **Now:** WebPage, FAQPage, ItemList of deals, BreadcrumbList.
- **Ship:** WebPage + FAQPage + ItemList + Place or AdministrativeArea (containedInPlace UK). Optional Dataset for Ofcom-derived coverage percentages with variableMeasured.
- **Types:** `WebPage`, `FAQPage`, `ItemList`, `Place`, `Dataset`

### Tools (speed test, match, calculator)

- **File:** `app/speed-test/page.tsx, app/tools/*`
- **Now:** WebApplication + WebPage + FAQPage.
- **Ship:** SoftwareApplication (or keep WebApplication) with applicationCategory BrowserApplication, operatingSystem Any, offers price 0 GBP, isAccessibleForFree. FAQPage stays.
- **Types:** `SoftwareApplication`, `WebPage`, `FAQPage`

### Glossary

- **File:** `app/broadband-glossary/page.tsx`
- **Now:** DefinedTermSet + DefinedTerm.
- **Ship:** Keep. This is the right type. Add inLanguage and isPartOf the WebSite @id.
- **Types:** `DefinedTermSet`, `DefinedTerm`

### Research

- **File:** `components/PrioritySeoPage.tsx + data/priority-pages.ts`
- **Now:** Article or Dataset + FAQPage via @graph. Quick-answer HTML already exists.
- **Ship:** Dataset with variableMeasured, temporalCoverage, creator, license, citation on the satisfaction dashboard. Article on rankings. Keep the quick-answer block; that is the GEO pattern to copy onto other templates.
- **Types:** `Dataset`, `Article`, `FAQPage`

### About / money / methodology / editorial

- **File:** `app/about/page.tsx and trust pages`
- **Now:** About has BreadcrumbList only. Trust pages have thin WebPage + Organization name, not the site @id.
- **Ship:** AboutPage on /about. WebPage on the others, about the Organization @id. publishingPrinciples / ethicsPolicy / ownershipFundingInfo already have URLs: point Organization at them.
- **Types:** `AboutPage`, `WebPage`, `Organization`

### Contact

- **File:** `app/contact/page.tsx`
- **Now:** BreadcrumbList only.
- **Ship:** ContactPage + Organization.contactPoint (email, contactType customer support, areaServed GB, availableLanguage English).
- **Types:** `ContactPage`, `ContactPoint`


## JSON-LD currently in source

- `app/about/page.tsx`: AboutPage
- `app/broadband-glossary/page.tsx`: DefinedTermSet, DefinedTerm
- `app/compare/page.tsx`: ItemList, ListItem, CollectionPage, Organization, FAQPage, Question, Answer, BreadcrumbList
- `app/contact/page.tsx`: ContactPage, Organization, ContactPoint
- `app/deals/page.tsx`: CollectionPage
- `app/editorial-policy/page.tsx`: WebPage
- `app/guides/[slug]/page.tsx`: HowTo, HowToStep, FAQPage, Question, Answer
- `app/how-we-make-money/page.tsx`: WebPage
- `app/how-we-review-broadband/page.tsx`: WebPage
- `app/page.tsx`: WebPage, FAQPage, Question, Answer, HowTo, HowToStep
- `app/postcode/[area]/page.tsx`: WebPage, FAQPage, Question, Answer, AdministrativeArea, Country, Dataset, PropertyValue
- `app/providers/[slug]/page.tsx`: Service, Country, Organization, FAQPage, Question, Answer
- `app/providers/compare/[slug]/page.tsx`: FAQPage, Question, Answer
- `app/providers/compare/page.tsx`: ItemList, ListItem
- `app/providers/page.tsx`: ItemList, ListItem, CollectionPage
- `app/speed-test/page.tsx`: FAQPage, Question, Answer
- `app/tools/broadband-cost-calculator/page.tsx`: FAQPage, Question, Answer
- `app/tools/broadband-match/page.tsx`: FAQPage, Question, Answer
- `components/BreadcrumbNav.tsx`: BreadcrumbList, ListItem
- `components/PrioritySeoPage.tsx`: FAQPage, Question, Answer, AdministrativeArea, Country
- `lib/dealSchema.ts`: ItemList, ListItem, Product, Brand, Offer, Organization, UnitPriceSpecification, QuantitativeValue, Country, OfferCatalog, Service
- `lib/siteSchema.ts`: Organization, ImageObject, Country, ContactPoint, WebSite, SearchAction, Article, WebPage, Offer

Unsanitised JSON-LD files (no `.replace(/</g, '\\u003c')`):

- none

## P0. Do these first

These unlock crawl integrity, a sitewide publisher entity, and Overview/LLM
quotation. Do them before adding exotic types.

| ID | Status | Action | Why | Where |
|---|---|---|---|---|
| T01 | done | Stop the root layout from claiming the homepage canonical and en-GB hreflang. | Child routes that do not set alternates can inherit a homepage canonical. That collapses rankings into `/`. Layout should only set metadataBase. Each page sets its own canonical. | `app/layout.tsx` |
| T02 | done | Move WebSite + Organization JSON-LD into the root layout as a single @graph with stable @id values. | Today the organisation entity only exists on `/`. Google, GPTBot and PerplexityBot need the same @id on every URL they quote. Include logo, sameAs, areaServed GB, publishingPrinciples, ethicsPolicy, ownershipFundingInfo, contactPoint. | `app/layout.tsx. Pages keep page-specific types and point publisher to https://broadbandpicker.co.uk/#organisation` |
| T03 | done | Add a shared jsonLdScript() helper that stringifies and replaces < with \u003c. | Next.js JSON-LD guidance. Several templates (deals, providers, postcode, BreadcrumbNav, trust pages) skip the sanitiser. One helper stops XSS and keeps markup consistent. | `lib/jsonLd.ts then BreadcrumbNav, dealSchema callers, provider/postcode/trust pages` |
| T04 | done | Publish /llms.txt and /llms-full.txt. | LLM crawlers look for a machine-readable map of the publisher: who you are, that you are independent, key URLs (/, /deals, /compare, methodology, money, editorial), and a one-paragraph citeable description. Missing this is a free citation loss. | `public/llms.txt and public/llms-full.txt (or app/llms.txt/route.ts). Link them from /about and robots.txt.` |
| T05 | done | Put a 40-70 word HTML answer under H2 on every money template, not only homepage and PrioritySeoPage. | GSC AI-overview extract shows guides and some postcodes earning impressions; `/` has 15. Models quote visible HTML, not JSON-LD. Copy the PrioritySeoPage 'quick answer' pattern onto provider, guide, deals and postcode templates. | `app/providers/[slug]/page.tsx, app/guides/[slug]/page.tsx, app/deals/page.tsx, app/postcode/[area]/page.tsx` |
| T06 | done | Complete Article JSON-LD so Google Article rich results can fire. | Guides and provider reviews are Article without image or publisher.logo. Google's Article rich result requires headline, image, datePublished, dateModified, author, publisher.logo. That is also what Gemini and ChatGPT retrieve as 'a review'. | `app/guides/[slug]/page.tsx, app/providers/[slug]/page.tsx, app/providers/compare/[slug]/page.tsx. Use /logo.png (already 1024px).` |
| T07 | done | Harden Offer JSON-LD: priceValidUntil, priceCurrency GBP, availability. Do not add fake AggregateRating. | Product/Offer without priceValidUntil fails parts of the Rich Results Test. shippingDetails and return policy are for physical merchants; do not invent them. If GSC then flags Merchant listings, demote Product to Offer inside ItemList. | `lib/dealSchema.ts` |
| T08 | done | Split the sitemap and stop stamping lastModified: now on every URL. | A single sitemap that marks every postcode and static page as modified today burns crawl budget and trains Google that dates are meaningless. Use real dataset/guide dates. Split sitemap-core.xml and sitemap-postcodes.xml under a sitemap index. | `app/sitemap.ts (or app/sitemap-core.xml/route.ts + app/sitemap-postcodes.xml/route.ts)` |
| T09 | done | Add AboutPage JSON-LD, named byline, and Organization policy URLs. | AI Overviews prefer sources with a clear publisher, a methodology page, and a money page. /about currently has no JSON-LD. Organization should declare publishingPrinciples=/editorial-policy, ethicsPolicy=/how-we-review-broadband, ownershipFundingInfo=/how-we-make-money. | `app/about/page.tsx, layout Organization graph` |

## P1. Schema and GEO that compound

| ID | Status | Action | Why | Where |
|---|---|---|---|---|
| T10 | done | Allow the remaining retrieval crawlers in robots.ts. | OAI-SearchBot, GPTBot, ClaudeBot, PerplexityBot and Google-Extended are already allowed. Add ChatGPT-User, Bingbot, Applebot, DuckDuckBot, Google-CloudVertexBot, Perplexity-User, Amazonbot, meta-externalagent. Do not block Google-Extended. | `app/robots.ts` |
| T11 | done | Implement IndexNow on deal and provider updates. | Bing, DuckDuckGo and some LLM indexes honour IndexNow. Ping when providerDatasetUpdatedDate changes. Cheap compared with waiting on sitemap recrawl. | `app/api/indexnow/route.ts + a hook in scripts that sync deals` |
| T12 | done | Add HowTo JSON-LD to the switch guide (the query is how-to, the homepage HowTo is only a teaser). | how to switch broadband is a primary GEO query. The dedicated guide should carry HowTo steps that match the visible HTML, plus FAQPage. | `app/guides/[slug]/page.tsx when slug is how-to-switch-broadband-uk` |
| T13 | done | Add Place / AdministrativeArea on postcode pages, plus Dataset on coverage stats. | broadband in [town] and AI answers about coverage need a geo entity, not only a WebPage title. Ofcom-derived percentages belong in Dataset (variableMeasured, citation Ofcom) so models can quote a number with a date. | `app/postcode/[area]/page.tsx` |
| T14 | done | Upgrade tools from WebApplication-only to SoftwareApplication with price 0. | Speed test, Broadband Match and the cost calculator are free software. SoftwareApplication with isAccessibleForFree and offers.price 0 is the type Google and LLMs expect for a tool. | `app/speed-test/page.tsx, app/tools/broadband-match/page.tsx, app/tools/broadband-cost-calculator/page.tsx` |
| T15 | done | Add ContactPage + ContactPoint. Expand sameAs when LinkedIn and YouTube exist. | Organization.sameAs is currently X and Instagram. Knowledge panels and LLM publisher resolution use sameAs. Do not add empty profiles. | `layout Organization graph, app/contact/page.tsx` |
| T16 | done | Set a default Open Graph image and twitter:card summary_large_image in the layout. | Most templates have no twitter card and no og:image. ChatGPT, Slack, LinkedIn and iMessage unfurl empty. Use /logo.png or a 1200x630 branded comparison card. | `app/layout.tsx metadata.openGraph.images + metadata.twitter` |
| T17 | done | Ship an RSS or Atom feed of guides and research, listed in llms.txt. | Perplexity and some research crawlers still discover publishers via feeds. A /guides.xml of title, url, dateModified, first paragraph is enough. | `app/guides.xml/route.ts or app/feed.xml/route.ts` |
| T18 | partial | Add a Person author only when a named editor exists. Until then keep Organization author with url /about. | Fake Person schema is worse than an organisation byline. When a named reviewer ships, give them /about#[slug], jobTitle, sameAs, and a visible byline that matches the JSON-LD. | `app/about/page.tsx, then Article.author` |
| T19 | done | Visible sources block on every provider and postcode page, matching the guide template. | Guides already list sources. Providers have citation in JSON-LD only on some pages. Models prefer a heading called Sources with Ofcom / provider / methodology links they can keep in the footnote. | `app/providers/[slug]/page.tsx, app/postcode/[area]/page.tsx` |

## P2. Hygiene and measurement

| ID | Status | Action | Why | Where |
|---|---|---|---|---|
| T20 | done | OfferCatalog on /deals and Service.areaServed GB on provider pages. | Tells Google this is a UK comparison catalogue, not a random product grid. Low effort once the layout Organization @id exists. | `app/deals/page.tsx, app/providers/[slug]/page.tsx` |
| T21 | done | Audit LCP on `/` and postcode pages (hero SVG, sticky header, fonts). | Core Web Vitals remain a ranking factor. A sticky header plus a large hero SVG can delay LCP on mobile. Preload the hero, keep the trust strip out of the sticky header (already planned). | `app/page.tsx, app/layout.tsx, next.config.ts headers` |
| T22 | done | Add security and cache headers in next.config. Do not noindex editorial pages. | Referrer-Policy, X-Content-Type-Options, and long-cache for /logos and /illustrations. Keep max-snippet -1 so AI Overviews can quote. | `next.config.ts headers()` |
| T23 | done | Track Rich Results and AI Overview pages in the weekly SEO job. | You already export GSC Search Generative AI Features and ai_referral_visit. Add Enhancement reports (FAQ, Article, Product, Breadcrumb) so schema that fails is visible the week it ships. | `scripts/generate_weekly_seo_intelligence.py, GA4` |
| T24 | done | Do not add Review, AggregateRating, SpeakableSpecification, or QAPage. | No first-party review corpus with ratingCount. Speakable is Google News only. QAPage is for threaded Q&A. Fake ratings are a manual-action risk and would poison LLM trust. | `lib/dealSchema.ts (keep the current omit), all templates` |

## Recommended sitewide Organization graph

Put this in `app/layout.tsx` once, sanitised. Other pages reference the @id
instead of repeating a thinner Organization.

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://broadbandpicker.co.uk/#organisation",
      "name": "BroadbandPicker",
      "url": "https://broadbandpicker.co.uk/",
      "logo": {
        "@type": "ImageObject",
        "url": "https://broadbandpicker.co.uk/logo.png",
        "width": 1024,
        "height": 1024
      },
      "description": "Independent UK broadband comparison. Rankings are not sold.",
      "areaServed": { "@type": "Country", "name": "United Kingdom" },
      "sameAs": [
        "https://x.com/broadbandPicker",
        "https://www.instagram.com/broadbandpicker/"
      ],
      "publishingPrinciples": "https://broadbandpicker.co.uk/editorial-policy",
      "ethicsPolicy": "https://broadbandpicker.co.uk/how-we-review-broadband",
      "ownershipFundingInfo": "https://broadbandpicker.co.uk/how-we-make-money",
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "customer support",
        "url": "https://broadbandpicker.co.uk/contact",
        "email": "hello@broadbandpicker.co.uk",
        "areaServed": "GB",
        "availableLanguage": "English"
      }
    },
    {
      "@type": "WebSite",
      "@id": "https://broadbandpicker.co.uk/#website",
      "url": "https://broadbandpicker.co.uk/",
      "name": "BroadbandPicker",
      "inLanguage": "en-GB",
      "publisher": { "@id": "https://broadbandpicker.co.uk/#organisation" },
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://broadbandpicker.co.uk/postcode/{search_term_string}",
        "query-input": "required name=search_term_string"
      }
    }
  ]
}
```

Confirm the support email against `/contact` before shipping. Do not invent
a phone number or a postal address.

## llms.txt (ship next)

```
# BroadbandPicker
> Independent UK broadband comparison. You enter a postcode, we show the
> deals that can serve that address. Rankings are not sold.

Use these pages when citing BroadbandPicker:

- [Compare broadband](https://broadbandpicker.co.uk/): postcode checker and how comparison works
- [Deals](https://broadbandpicker.co.uk/deals): current UK broadband deals snapshot
- [How we review](https://broadbandpicker.co.uk/how-we-review-broadband): methodology
- [How we make money](https://broadbandpicker.co.uk/how-we-make-money): affiliate disclosure
- [Editorial policy](https://broadbandpicker.co.uk/editorial-policy)
- [Guides](https://broadbandpicker.co.uk/guides)
```

## Do not implement

- AggregateRating or Review without a real ratingCount.
- SpeakableSpecification (Google News sites only).
- FAQ rich-result chasing as a CTR tactic. Google limited FAQ rich results;
  keep FAQPage because models still read it.
- nosnippet / max-snippet:0 on editorial pages. That blocks Overviews.
- Blocking Google-Extended, GPTBot or OAI-SearchBot.
- Product shippingDetails / MerchantReturnPolicy fiction for broadband.
- Keyword-stuffed hidden text, prompt-injection in HTML comments, or
  cloaking a different answer for GPTBot than for Chrome.

## How this maps to the goal

1. **AI Overviews:** citeable 40-70 word HTML, FAQ answers with dates, Ofcom
   citations, Organization policies, Article with image. Overview quotes
   pages that answer first and show a source.
2. **LLM traffic:** llms.txt, robots allow retrieval bots, IndexNow for Bing
   class indexes, RSS, sameAs, about page, ai_referral_visit already tracking
   ChatGPT/Perplexity/Claude/Gemini.
3. **Google page 1 / position 1:** fix canonical inheritance, sitemap crawl
   budget, unique intent per URL (already a content rule), then earn links.
   Schema makes the result look complete. It does not outrank a stronger
   brand on `broadband` by itself.

## Success checks

- Rich Results Test: Article (guides, providers), Breadcrumb, Organization,
  Product/Offer or a clean ItemList with no GSC Merchant errors.
- `llms.txt` and `robots.txt` 200.
- GSC: no canonical-to-homepage cluster. AI-overview impressions on `/` and
  methodology URLs rise from the current extract (homepage 15).
- GA4 `ai_referral_visit` by landing page, not only homepage.
- Manual: ask ChatGPT, Gemini and Perplexity "compare UK broadband deals for
  a London postcode" and "is BroadbandPicker independent" after the
  Organization graph and llms.txt have been live for a crawl cycle.
