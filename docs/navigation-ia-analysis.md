# Navigation, header and footer: analysis and recommendations

Evidence: `scripts/scrape_navigation_patterns.py`, run 2026-08-22 against
5 readable sites (`docs/navigation-pattern-scan.json`; MoneySavingExpert
403'd and is reported as blocked, not silently omitted).

## What was found

| Site | Header nav links | Postcode/search in header | Sticky header | Breadcrumbs | Trust badge near top | Footer links |
|---|---|---|---|---|---|---|
| Uswitch | 370 | Yes | No signal detected | No signal detected | No signal detected | 33 |
| Which? Switch Broadband | 10 (shell only — real nav is JS-rendered behind "Menu") | Yes | No signal | No signal | No signal | 26 |
| broadband.co.uk | 127 | Yes | **Yes** | **Yes** | **Yes** | 13 |
| choose.co.uk | 21 | No | No signal | **Yes** | No signal | 11 |
| NerdWallet (UX benchmark, non-broadband) | 556 | Yes | No signal | No signal | No signal | 43 |
| MoneySavingExpert | — | — | — | — | — | blocked (403) |

**Read carefully**: "no signal detected" means the static-HTML heuristic
didn't find it — most of these sites are JS-heavy and likely do have
sticky headers or breadcrumbs that only appear after client-side render,
which a plain HTTP scrape can't see. Treat the "Yes" results as confirmed;
treat "no signal" as unknown, not "confirmed absent."

## The one clear pattern worth acting on

**Header nav link count splits cleanly into two groups**: the multi-vertical
supersites (Uswitch 370, NerdWallet 556, broadband.co.uk 127 via a mega-menu
covering reviews/deals/community/guides in one flyout) versus the
single-vertical specialists (choose.co.uk 21, covering broadband/mobile/TV
as one family). **BroadbandPicker is a single-vertical specialist** — the
choose.co.uk pattern is the right comparison, not Uswitch's. This confirms
rather than changes the growth playbook's "specialist, not supersite"
positioning: don't chase a mega-menu.

**broadband.co.uk is the standout on trust/wayfinding signals** despite a
lean footer (13 links) — sticky header, breadcrumbs, and a trust badge all
present near the top, on a single-vertical broadband site closest to
BroadbandPicker's own positioning. It's the most directly comparable
evidence here.

## Current BroadbandPicker state, checked against the same criteria

- **Sticky header**: already implemented (`sticky top-0 z-30` in
  `app/layout.tsx`) — matches broadband.co.uk's pattern. No change needed.
- **Postcode entry in header**: already implemented, but only at `xl:`
  breakpoint and above (`hidden xl:flex`) — desktop users below that width
  (a meaningful chunk of laptop screens) get no header postcode field and
  have to scroll to the hero. Worth loosening the breakpoint.
- **Breadcrumbs**: already implemented site-wide via `BreadcrumbNav`,
  matching choose.co.uk and broadband.co.uk. No change needed.
- **Trust badge near top**: not present, and **should not be fabricated**
  — BroadbandPicker doesn't yet have its own third-party review score or
  press mentions to display. This is a real gap but the fix is earning a
  Trustpilot presence and press coverage, not adding a badge with nothing
  behind it. Flagged for the tracker as a trust-building task, not a
  navigation-code change.
- **Header nav scale**: 6 items (Compare, Deals, Providers, Guides,
  Broadband Match, Speed Test) — correctly lean for a specialist site, but
  missing a first-class link to **Postcode/Areas**, which is now a major
  content pillar (2,818 Ofcom-backed district pages plus the curated town
  pages and city hubs) with zero nav representation.
- **Footer**: 4 columns (Compare, Guides, Company, Legal), well organised,
  but built before the Tools (Speed Test, Cost Calculator, Broadband
  Match), Postcode/area coverage, and Research pillars existed at their
  current scale — none of them get a footer column, which both hurts
  crawl/link-equity flow to thousands of pages and hides real
  differentiators (the Ofcom-backed area data, the research dashboard)
  from a footer-scanning visitor.

## Recommendations implemented this build

1. **Add a "Postcode" link to primary nav** (desktop + mobile) — the
   content pillar earns first-class nav status the same way Providers and
   Guides do.
2. **Restructure the footer from 4 to 6 columns**: split the existing
   "Compare" column, add a **Tools** column (Speed Test, Cost Calculator,
   Broadband Match) and a **Find Broadband by Area** column (the postcode
   hub plus a couple of city hub examples), and add the Research dashboard
   into Company. This directly fixes the crawl/link-equity gap for the
   area-coverage and tools content built this session.

## Follow-up: header postcode breakpoint (2026-08-22, later same day)

Implemented after explicit sign-off on the mitigation: shortened the
desktop nav label "Broadband Match" to "Match" (mobile menu keeps the full
label — that's a vertical dropdown with no width constraint) to free up
horizontal room, then widened the header postcode field from `hidden
xl:flex` to `hidden lg:flex`. The postcode field's container is `flex-1`
without `flex-shrink-0`, so if the `lg` breakpoint's low end (1024px) is
still tight, the field narrows gracefully rather than overflowing or
breaking layout — not pixel-verified against a real screenshot, but the
flex behaviour bounds the downside to "narrower field," not a broken
header.

## Follow-up: mega-menu redesign (2026-08-23)

Extended `scripts/scrape_navigation_patterns.py` (same script) with
mega-menu structural detection: top-level item count, submenu heading
samples, icons-in-dropdown, descriptive subtext under dropdown links,
nesting depth. Re-scanned the same sites.

| Site | Top-level items | Mega-menu | Icons in dropdown | Descriptive subtext under links |
|---|---|---|---|---|
| Uswitch | 7 | Yes | **Yes** | No |
| Which? Switch Broadband | 3 (JS-rendered shell, low confidence) | No | No | No |
| broadband.co.uk | 4 | Yes | No | **Yes** — one-line description under category groups |
| choose.co.uk | 3 | No | No | No |
| NerdWallet | 10 | No signal (JS-rendered) | No | No |

Two concrete, actionable patterns came out of this: **icons next to
dropdown items** (Uswitch) and **a one-line description under each
category/group**, not just a bare link (broadband.co.uk). Both are
achievable without JS and both directly serve "help users find what
they're looking for" rather than being decoration.

Also notable: 7 top-level nav items (Uswitch's count) is a reasonable
target — BroadbandPicker already sits at 7 (Compare, Deals, Providers,
Postcode, Guides, Tools, plus the postcode field itself), so the redesign
below organises *within* that count rather than adding more top-level
items.

**Shipped**: `components/MainNav.tsx` — Providers, Postcode, Guides and
Tools are now dropdowns (Compare and Deals stay direct links, since
they're primary single-destination actions, not categories). Each
dropdown item has an icon and, where useful, a one-line description
(e.g. "Real Ofcom-backed coverage for any UK postcode" under "Find your
area"). The **Guides** dropdown is a genuine mega-menu built from the
site's real 6 guide categories (`guideCategories` in `data/guides.ts`),
each showing its actual description and its first 3 guides, pulled live
from the data file — not hardcoded, so it stays correct as new guides are
added by the pipeline without another nav edit. Built with `group-hover`/
`group-focus-within` CSS (no JS), so it's keyboard-reachable via Tab as
well as mouse hover.

## Recommended but not implemented

- **A genuine trust badge near the top of the homepage** — hold until
  BroadbandPicker has real Trustpilot reviews or a press mention to show;
  do not fabricate one in the meantime.
