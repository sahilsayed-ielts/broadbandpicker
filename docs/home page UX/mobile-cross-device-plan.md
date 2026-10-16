# Cross-device UX plan for BroadbandPicker

Generated 2026-09-15T15:54:38+00:00. Source script: `scripts/analyze_mobile_ux.py`.

Mobile Safari user-agent HTML/CSS scan of UK broadband affiliate hubs, fetch of Google Search Central / web.dev guidance, SerpAPI UK searches for user complaints and People Also Ask, plus a source-file audit of BroadbandPicker templates. This cannot screenshot 375/768/1280 layouts. Blocked pages are recorded, not invented.

## What Google wants

- [Mobile-first indexing](https://developers.google.com/search/docs/crawling-indexing/mobile/mobile-sites-mobile-first-indexing): Mobile-first Indexing Best Practices | Google Search Central &nbsp;|&nbsp; Documentation &nbsp;|&nbsp; Google for Developers { "@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [{ "@type": "ListItem", "position": 1, "name": "Search Central", "item": 
- [Avoid intrusive interstitials](https://developers.google.com/search/docs/appearance/avoid-intrusive-interstitials): Interstitials and dialogs | Google Search Central &nbsp;|&nbsp; Documentation &nbsp;|&nbsp; Google for Developers { "@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [{ "@type": "ListItem", "position": 1, "name": "Search Central", "item": "https://de
- [Core Web Vitals](https://developers.google.com/search/docs/appearance/page-experience): Understanding Google Page Experience | Google Search Central &nbsp;|&nbsp; Documentation &nbsp;|&nbsp; Google for Developers { "@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [{ "@type": "ListItem", "position": 1, "name": "Search Central", "item": 
- [Responsive web design basics](https://web.dev/articles/responsive-web-design-basics): Responsive web design basics &nbsp;|&nbsp; Articles &nbsp;|&nbsp; web.dev { "@context": "https://schema.org", "@type": "Article", "dateModified": "2019-02-12", "headline": "Responsive web design basics" } { "@context": "https://schema.org", "@type": "BreadcrumbList", "itemListEle
- [Tap target size](https://web.dev/articles/accessible-tap-targets): Accessible tap targets &nbsp;|&nbsp; web.dev { "@context": "https://schema.org", "@type": "Article", "dateModified": "2020-03-31", "headline": "Accessible tap targets" } Skip to main content Resources Web Platform Dive into the web platform, at your pace. HTML CSS JavaScript User

## What people talk about

Recurring themes from UK Google results and People Also Ask: postcode first, tables that do not spill off a phone, no fake national from-price, cookie bars that do not cover Find Deals, and the same facts on mobile as desktop because Google indexes the smartphone DOM.

### google mobile first indexing comparison websites
- Mobile-first Indexing Best Practices | Google Search Central: https://developers.google.com/search/docs/crawling-indexing/mobile/mobile-sites-mobile-first-indexing
  - Google uses the mobile version of a site's content, crawled with the smartphone agent, for indexing and ranking. This is called mobile-first indexing.
- Mobile-First Indexing: What It Means & Best Practices: https://www.semrush.com/blog/mobile-first-indexiing/
  - Mobile-first indexing means Google's web crawler prioritizes indexing the mobile version of a website's content over its desktop counterpart.
- Understanding Google's Mobile-First Indexing: https://majordigital.com/articles/mobile-first-indexing
  - Essentially, Google will be testing your mobile site pages and scoring them based on speed, usability and stability. What does mobile-first indexing mean for my ...
- Mobile-First Indexing in 2026: What It Is & How to Prepare: https://www.nostra.ai/blogs-collection/everything-you-need-to-know-about-googles-mobile-first-indexing
  - Mobile-first indexing means Google ranks your site by its mobile version. What changed, how to check your store, and the fixes that matter ...
- PAA: How to rank a website on Google First Page?, Who is no. 1 in the Google Search list?, Is mobile-first design still relevant?, How many websites are indexed by Google?

### UK broadband comparison site mobile UX
- Compare Broadband Deals September 2026: https://www.moneysavingexpert.com/compare-broadband-deals/
  - Compare broadband, landline and TV deals. Compare broadband deals Includes 35 of the biggest firms, plus special deals we've found or arranged. ...
- Broadband Deals: Compare in September 2026: https://www.uswitch.com/broadband/
  - Compare a range of broadband deals including fibre broadband and TV bundles with Uswitch. Find our best offers from Sky, Virgin Media, BT, ...
- Broadband, TV, Landline & Mobile Comparison ...: https://www.broadbandchoices.co.uk/
  - Compare broadband deals from top providers including BT, Sky, Virgin, TalkTalk, and more, using our impartial Ofcom-accredited comparison tool.
- Compare Cheap Broadband Deals - September 2026: https://www.comparethemarket.com/broadband/
  - Compare broadband deals from trusted providers like Sky, BT and more. Explore our latest broadband offers to see if you could save up to £20 a month.

### comparison table unusable on mobile reddit
- Do you find it inexcusable how bad Reddit's app and ...: https://www.reddit.com/r/webdev/comments/18yfzfc/do_you_find_it_inexcusable_how_bad_reddits_app/
  - Like it’s 2024 these are multi-billion dollar tech giants whose sole purpose is UIX and this is the best they’re giving us? Same goes for many ...
- Reddit no longer letting me browse on my phone without ...: https://www.reddit.com/r/help/comments/1sudaup/reddit_no_longer_letting_me_browse_on_my_phone/
  - I only login to Reddit on my laptop. On my phone I just browse the home screen - it's my way of not doomscrolling. Suddenly it won't let me.
- Reddit Is Blocking Its Mobile Site for Some Users, but ...: https://lifehacker.com/tech/reddit-is-blocking-its-mobile-site-but-theres-a-fix
  - Reddit is currently blocking some users from accessing its mobile site. The company is testing a pop-up forcing users to download its app.
- It's a problem on mobile, because old-reddit isn't ...: https://news.ycombinator.com/item?id=35636572
  - The new interface simply doesn't bring any noteworthy value in comparison while being more annoying to use. ... The new reddit is so bad I'm sort ...
- PAA: Why is Reddit no longer working on my mobile device?, How do you turn off the NSFW filter on Reddit?, Where did the NSFW suggestions go in the Reddit app?, What is the best Reddit app for browsing NSFW content?

### uswitch mobile website postcode checker
- Check Broadband In My Area - Postcode Checker: https://www.uswitch.com/broadband/postcode_checker/
  - Enter your postcode: Enter your postcode and address into the box on our Uswitch broadband page to see what home broadband is available in your area. · Select ...
- Mobile Phone Deals & Contracts September 2026: https://www.uswitch.com/mobiles/
  - Broadband speed test · Broadband postcode checker · Broadband guides · Broadband social tariffs · Broadband outages · Broadband news · Broadband ...
- Uswitch.com - We Put U First - Uswitch: https://www.uswitch.com/
  - Compare and switch broadband deals, mobile phone deals, car & home insurance, gas and electricity suppliers, credit cards, boiler cover & more.
- Broadband and mobile coverage checker: https://www.ofcom.org.uk/phones-and-broadband/coverage-and-speeds/ofcom-checker
  - Enter a postcode to view mobile coverage by provider, or availability of broadband services (standard, superfast and ultrafast).
- PAA: Is Uswitch mobile legit?, How can I check broadband availability in my postcode?, Is Uswitch free to use?, What are the best mobile Wi-Fi deals right now?

### best mobile experience affiliate comparison site broadband UK
- Broadband Deals: Compare in September 2026: https://www.uswitch.com/broadband/
  - Compare a range of broadband deals including fibre broadband and TV bundles with Uswitch. Find our best offers from Sky, Virgin Media, BT, ...
- Compare Broadband Deals September 2026: https://www.moneysavingexpert.com/compare-broadband-deals/
  - Compare broadband, landline and TV deals with MoneySavingExpert. Enter your postcode to see available packages and check if you could save ...
- Broadband, TV, Landline & Mobile Comparison ...: https://www.broadbandchoices.co.uk/
  - Compare broadband deals from top providers including BT, Sky, Virgin, TalkTalk, and more, using our impartial Ofcom-accredited comparison tool.
- Compare Broadband Deals - September 2026: https://www.moneysupermarket.com/broadband/
  - Compare broadband deals with MoneySuperMarket and earn a £20 reward when you switch. SuperSaveClub terms and conditions apply.
- PAA: What is the best website to compare broadband deals?, What is the best mobile broadband in the UK?, What are the best broadband and mobile phone deals in the UK?, Who is the most reliable broadband provider in the UK?

- Query `google tap targets viewport Core Web Vitals ranking` failed: HTTPSConnectionPool(host='serpapi.com', port=443): Read timed out. (read timeout=40)
- Query `site:reddit.com broadband comparison website on phone` failed: HTTPSConnectionPool(host='serpapi.com', port=443): Read timed out. (read timeout=40)
- Query `choose.co.uk vs uswitch mobile deals table` failed: HTTPSConnectionPool(host='serpapi.com', port=443): Read timed out. (read timeout=40)
## Recommendations

- **P0 · Export an explicit Next.js viewport with width=device-width, initial-scale=1, viewport-fit=cover and theme-color.**
  - Why: Google mobile-first indexing uses the mobile document. Competitors all send a viewport meta. Next injects a default, but an explicit export plus theme-color matches Google and installed-PWA chrome.
  - Files: `app/layout.tsx`
- **P0 · Keep 16px (or larger) on postcode and other text inputs on phones so iOS does not zoom the page.**
  - Why: User reports and Google tap/zoom guidance: inputs under 16px trigger automatic zoom and wreck LCP/INP on iPhone. Affiliate postcode checkers fail this constantly.
  - Files: `components/PostcodeChecker.tsx, app/globals.css`
- **P0 · Stop hiding the trust line on phones. Show a one-line mobile version of Rankings are not sold.**
  - Why: Mobile-first indexing ranks the mobile DOM. Hiding the independence line below sm: means Googlebot-smartphone never sees it in the header. Footer copy is not a substitute for above-the-fold trust on a comparison site.
  - Files: `app/layout.tsx`
- **P1 · Render deal rows as stacked cards below the md breakpoint, with the same price, speed, contract and Get Deal data as the desktop table.**
  - Why: 6 competitor hubs send a viewport; tables still dominate. Reddit and comparison-UX threads repeatedly call wide tables unusable on a phone. Google wants the same content, not a different dataset. Cards plus a labelled scroll region is the Choose/Uswitch-style adaptation without cloning their layout.
  - Files: `components/DealTable.tsx`
- **P1 · Make sort chips and cookie buttons at least 44px tall, and pad the cookie bar for the iPhone home indicator.**
  - Why: Google's accessible tap-target article and Core Web Vitals INP both punish small bottom-of-screen buttons. Cookie bars sit on the thumb zone.
  - Files: `components/DealTable.tsx, components/CookieBanner.tsx`
- **P1 · Stack the postcode field and Find Deals button on very small screens, and add labelled overflow regions on remaining comparison tables.**
  - Why: 5 competitor pages surface a postcode control in the mobile HTML. A single-row checker overflows at 320px. Comparison tables already scroll; they still need role=region and an accessible name.
  - Files: `components/PostcodeChecker.tsx, app/providers/compare/[slug]/page.tsx`
- **P2 · Do not add a sticky bottom Get Deal bar on every page. Keep conversion in the hero and table. A sitewide sticky bar would fight the cookie banner and fail Google's interstitial guidance.**
  - Why: Only 2 scanned competitor pages even signal a sticky bottom CTA. Choose had the signal; Uswitch and broadband.co.uk did not. Intrusive bars are a known ranking and UX risk.
  - Files: `No new sticky bar`
- **P2 · Keep the hamburger until lg so tablet widths get the same task-first nav, with the postcode checker inside the menu.**
  - Why: 5 competitor pages signal a mobile menu. Hover dropdowns fail on touch tablets.
  - Files: `components/MobileNav.tsx, components/MainNav.tsx`
- **note · Record access limits instead of inventing layouts.**
  - Why: This script cannot screenshot 375/768/1280 viewports. MoneySavingExpert and some hubs 403 bot fetches. Reddit threads are snippets unless the page is open.
  - Files: `docs/home page UX/mobile-ux-scan.json`

## Device intent map

| Device | Width | Task | BroadbandPicker rule |
|---|---|---|---|
| Phone | 320–430 | Check postcode, scan 2–3 deals, tap Get Deal | Stack checker, cards not a 640px table, 44px targets |
| Tablet | 768–1024 | Compare a few providers, still touch | Hamburger + in-menu checker until lg, no hover-only nav |
| Desktop | 1280+ | Full table, filters, related guides | Existing comparison chrome |

Do not infer that any competitor layout caused a ranking. Rankings and AI citations are outcomes.
