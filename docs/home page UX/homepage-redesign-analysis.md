# Homepage visual redesign: analysis and what shipped

Evidence: `scripts/analyze_homepage_visual_design.py`, run 2026-08-23
against 5 UK broadband comparison/affiliate homepages
(`homepage-visual-design-scan.json` in this folder). This is a static
HTTP scrape, not a rendered screenshot — see the caveat in that file's
`method` field before treating any finding as a confirmed final render.

## What the scan found

| Site | Total `<img>` | Inline `<svg>` | CSS bg-image refs | Gradients | Interactive JS libs detected |
|---|---|---|---|---|---|
| Uswitch | 68 | **195** | 5 | 3 | none |
| Which? Switch Broadband | 11 | 16 | 0 | 0 | none |
| broadband.co.uk | 35 | 18 | 0 | 0 | none |
| choose.co.uk | 72 | 9 | 5 | 2 | none |
| MoneySavingExpert | — | — | — | — | blocked (403) |

Sample image `alt` text across every readable site was overwhelmingly
**provider brand logos** (Virgin Media, Vodafone, Zen, Plusnet, Hyperoptic,
Sky...), plus a couple of trust elements on Uswitch ("Uswitch Trustscore",
"author"). Not one readable site's sampled images suggested lifestyle
photography of people or houses.

## The finding that shaped the redesign

**Nobody in this vertical uses a stock-photo hero banner.** The dominant
visual language is heavy inline SVG (icons, trust badges) plus provider
logos — Uswitch alone ships 195 inline SVGs. No carousel/animation
library (Swiper, Slick, AOS, Framer Motion, Lottie, GSAP) was detected on
any readable site, consistent with a conservative, trust-first design
posture that makes sense for a finance-adjacent, YMYL-relevant category.

This matters because the request was for a "similar styled UX" to popular
sites in this specific industry, plus a personal preference for images,
illustrations and interactivity. Those aren't in conflict: the redesign
below delivers modern, illustrated and interactive, executed in the SVG
idiom that's actually proven here — not stock photography, which no
competitor in this vertical actually uses either.

## What shipped

- **`scripts/generate_homepage_illustrations.py`** generates 7 original,
  on-brand SVG illustrations into `public/illustrations/` — a hero
  "connectivity network" graphic (nodes/homes linked to a central hub),
  three colour-filled step icons (postcode, compare, switch) replacing the
  previous thin-stroke line icons, two soft gradient blob decorations, and
  a Broadband Match quiz illustration. All generated programmatically
  (parametric SVG paths, seeded so results are reproducible), not copied
  or adapted from any competitor's actual artwork.
- **Hero section**: the network illustration now sits behind the hero copy
  on `lg+` screens as a banner visual, keeping the postcode checker and
  headline as the untouched, always-visible primary content — no JS
  dependency gates anything above the fold.
- **"How BroadbandPicker Works"**: the three step icons are now
  colour-filled illustrations instead of single-stroke outlines, in
  larger badges, with a hover scale and a staggered scroll-reveal
  (`components/ScrollReveal.tsx`, an `IntersectionObserver` fade/slide-up
  respecting `prefers-reduced-motion`).
- **Broadband Match promo**: restructured from centred text-only to a
  two-column layout with the quiz illustration and a background blob,
  wrapped in the same scroll-reveal treatment.
- Both blob decorations are `aria-hidden`, `pointer-events-none` and
  purely decorative — they never sit in front of interactive content or
  affect layout flow.

## Follow-up: footer redesign (2026-08-23, later same day)

Extended `scripts/analyze_homepage_visual_design.py` (same script, not a
new one) with footer-specific detection: logo presence, social icon count,
accordion/back-to-top signals, hover-transition class density on footer
links. Re-ran against the same 5 sites.

| Site | Footer logo detected | Social icons | Accordion/back-to-top signal | Hover/transition class hits |
|---|---|---|---|---|
| Uswitch | **Yes** (`logo logo--rvu`) | 0 | No | 0 |
| Which? Switch Broadband | No | 0 | No | 0 |
| broadband.co.uk | No | 0 | No | 0 |
| choose.co.uk | No | 2 | No | 7 |
| MoneySavingExpert | blocked (403) | — | — | — |

**Read carefully, same caveat as before**: this is a static-HTML heuristic
— "not detected" often means "not detectable this way" (JS-rendered icon,
background-image logo, or a class name my pattern didn't match), not
confirmed absent. Only Uswitch's footer logo and choose.co.uk's social
icons/hover density are the parts of this table with real confidence
behind them. Accordion/back-to-top patterns are genuinely common on
professional sites generally (established best practice beyond this
5-site sample) even though this scan didn't detect them here.

**The concrete, high-confidence gap**: BroadbandPicker's footer had no
logo at all before this change — confirmed by reading `app/layout.tsx`
directly, not inferred from the scan. That's the one finding worth acting
on regardless of the competitor sample's limits.

**Shipped**:
- `components/Logo.tsx` — the header's logo mark extracted into a shared
  component (was previously duplicated inline), used at a larger size with
  a short tagline at the top of the footer, above the newsletter signup.
- The six footer link columns are now `<details open>` elements — visible
  and expanded by default on every screen size (no content hidden, nothing
  gated behind JS), with a chevron toggle that's interactive only below
  the `lg` breakpoint. On desktop the columns render and behave exactly as
  static headings did before (`pointer-events-none` on the summary at
  `lg:`) — this avoids the real risk of a desktop visitor accidentally
  collapsing a column they expected to be a plain heading.
- The X/Twitter link is now a rounded pill button with a hover
  scale/border-colour transition, closer to choose.co.uk's
  interactive-hover footer link treatment.
- A "Back to top" link at the very bottom of the footer, using the
  existing global `scroll-behavior: smooth` (already set site-wide) — no
  new JS needed, targets a new `id="top"` on the header.

## Follow-up: page-type UX — hub, deals, provider, guide pages (2026-08-23)

New script: `scripts/analyze_page_type_ux.py`. Unlike the earlier scans
(homepage-only, nav-only), this one scans by **page theme** — deals
listings, provider reviews, guide articles, and postcode/checker hubs —
because a deals table and a long-form guide have different UX jobs and
shouldn't be redesigned off a homepage-only sample. Output:
`docs/home page UX/page-type-ux-scan.json`.

Targets: Uswitch (broadband hub, BT review, reviews index, speed guide),
broadband.co.uk deals, choose.co.uk broadband, MoneySavingExpert cheap
broadband guide (blocked, 403 — reported honestly, not retried/bypassed,
consistent with every prior scan this session).

**Signals found, by category**:
- **Comparison checkboxes**: present on nearly every page scanned,
  regardless of category — the closest thing to a universal pattern in
  this sample.
- **Badge/chip labels** ("Best deal", "Editor's pick" style): present on
  the deals listings and the provider-review index, absent from the
  single guide article sampled.
- **Table of contents**: present on the guide article and one deals
  listing (choose.co.uk), absent from the provider review.
- **Pros/cons blocks**: present on the provider review and the deals
  listings, not on the guide article.
- **Related-content modules**: present on the provider review and one
  deals listing.
- **Rating widgets**: present on one deals listing (broadband.co.uk),
  not detected elsewhere (static-HTML caveat applies — a JS-rendered
  star widget wouldn't be caught by this method either).
- **Postcode/checker hub**: no genuinely separate competitor hub page
  exists in this sample — Uswitch's postcode entry point lives on the
  same page as its deals hub. This category has no real competitor
  equivalent to benchmark against, so the postcode work below is
  informed by the cross-category signals (badges, ratings) rather than
  a dedicated hub-page comparison.

**Shipped, mapped to confirmed signals only**:
- **Deals** (`components/DealTable.tsx`): added computed "Best Value" /
  "Fastest" / "Editor's Pick" badge chips — cheapest, fastest and
  highest-rated deal in the current row set each earn one, matching the
  badge/chip signal confirmed on both deals listings scanned. The
  `badge` field already existed on `DealRow` but was never populated.
- **Providers** (`app/providers/[slug]/page.tsx`): replaced the plain-text
  Trustpilot score with a new `components/RatingStars.tsx` widget, and
  added a "How {provider} compares" module surfacing up to 3 relevant
  entries from `data/provider-comparisons.ts` — matching the rating-widget
  and related-content signals confirmed on the provider review.
- **Guides** (`app/guides/[slug]/page.tsx`): added a jump-to-section table
  of contents, matching the TOC signal confirmed on the guide article
  sampled. Built via a new `lib/extractHeadings.tsx` utility that walks
  the JSX-authored guide body and injects heading IDs, rather than
  hand-editing 40 existing guide content definitions — gated behind
  `toc.length >= 3` so short guides don't get a clutter TOC for 1–2
  sections. Confirmed the related-guides module the signal also predicted
  already existed on this page (no change needed there).
- **Postcode hub** (`app/postcode/[area]/page.tsx`): added the same
  "Cheapest here" / "Fastest here" badge chips and `RatingStars` to the
  per-provider cards, carrying the badge/rating signals across from the
  deals category since no dedicated hub-page competitor sample exists to
  benchmark against directly.

## Follow-up: mobile and cross-device navigation (2026-08-23, later same day)

New script: `scripts/analyze_mobile_ux.py`. Fetches with a mobile Safari
user agent and looks for markup/CSS signals that correlate with
mobile-friendly patterns — this cannot render or measure an actual layout
at any viewport width, so it's read as directional evidence, not visual
confirmation. Targets: Uswitch (hub + BT review), broadband.co.uk deals,
choose.co.uk broadband, MoneySavingExpert (blocked, 403 — reported, not
bypassed). Output: `docs/home page UX/mobile-ux-scan.json`.

| Signal | Result |
|---|---|
| Viewport meta tag | Universal (4/4 successful fetches) |
| Hamburger menu marker | Universal (4/4) |
| `tel:` click-to-call links | **None found (0/4)** — not a pattern this vertical uses |
| Sticky bottom CTA bar | Weak (1/4, choose.co.uk only) |
| `apple-touch-icon` | Mixed (2/4, Uswitch only) |

**Read carefully**: the viewport-meta and hamburger-menu findings are
universal but not new information — checked our own site directly and
confirmed both were already correct (Next.js ships the viewport meta by
default; a hamburger button already existed). The real, actionable gap
wasn't found in the competitor sample — it was found by reading our own
mobile nav directly: it was a small anchored dropdown of 10 flat text
links with no grouping, no icons, and touch targets around 36px tall
(under the ~44px Apple HIG / 48dp Material minimum), while the desktop
nav right next to it was a fully structured mega-menu. That mismatch,
not a competitor gap, is what this pass fixes.

**Shipped**:
- New `components/MobileNav.tsx` replacing the old flat dropdown in
  `app/layout.tsx`. Full-width slide-down panel (not a small anchored
  box) so it behaves the same on a narrow phone or a tablet in portrait,
  reusing the same `ICONS`/quick-link data the desktop mega-menu already
  uses (exported from `components/MainNav.tsx`) so the two stay
  structurally consistent and don't drift.
- Every link and section in the mobile panel uses `min-h-11` (44px) —
  meets the touch-target minimum the flat dropdown didn't.
- The postcode checker — the site's primary conversion tool — is now
  reachable from the mobile menu on every page. Previously the header's
  `PostcodeChecker` was `hidden lg:flex` (desktop-only); on mobile it
  only existed on the homepage and `/deals`, so a phone user reading a
  provider review or a guide had no quick way to check their postcode
  without navigating back to the homepage first.
- Added an anchor `id` to each guide category section on `/guides`
  (`app/guides/page.tsx`) so the mobile Guides menu can jump straight to
  a category instead of linking to a non-functional `?category=` query
  param that the page never read.

**Deliberately not done**:
- No `tel:` click-to-call link — the 0/4 signal says this isn't how the
  vertical works, and BroadbandPicker doesn't take orders by phone, so
  adding one would be adding UI for a workflow that doesn't exist.
- No sticky bottom mobile CTA bar — only 1/4 competitors show this
  signal, too weak to treat as a confirmed pattern, and it would be
  intrusive glued across long-form guide pages that make up a large share
  of the site.
- No `apple-touch-icon` — genuinely useful for iOS home-screen
  bookmarking and a real 2/4 signal, but it needs a proper rasterised
  icon asset, not something to improvise from primitive shapes; flagged
  for a follow-up with a real design asset rather than shipped half-done.
- Existing `overflow-x-auto` table wrapper (deal tables) and the compact
  CTA sizing inside dense list/table rows were left as-is — no competitor
  signal or direct inspection pointed at either as broken, and they're a
  legitimate density tradeoff a nav-focused pass shouldn't rewrite.

## Deliberately not done

- No stock photography was added or sourced — the evidence above says
  this industry doesn't use it, and sourcing real photos of UK homes/
  people would mean either paying for licensed stock (a budget decision,
  not mine to make unilaterally) or using placeholder imagery that would
  misrepresent the brand.
- No carousel/slider library was added — none of the scanned competitors
  use one, and adding one without a clear content need (nothing on the
  homepage requires paging through more items than fit on screen) would
  be interactivity for its own sake.
- Content and copy were not changed as part of this pass — this was a
  visual/UX pass only, per the brief.
