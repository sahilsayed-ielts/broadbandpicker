#!/usr/bin/env python3
"""Build the master build tracker: one prioritised Excel list of everything
still to build for BroadbandPicker.co.uk — new pages AND product/UX features.

Combines two sources:
1. The Content Gap Roadmap tab of docs/broadbandpicker-keyword-mapping.xlsx
   (page builds, each with an SEO Build Priority Score and Revenue Priority
   Score already computed by scripts/build_keyword_mapping.py).
2. A curated list of feature/UX/content-strategy builds from the growth
   playbook (docs/competitor-landscape-scan.json research + the sequencing
   already agreed), each hand-scored on the same rough 0-100 scale so the
   two sources can be ranked together honestly rather than presented as two
   disconnected lists.

Both feed into one Master Tracker tab, ranked highest priority first. A separate
Pending Build Priority tab is generated from the same records so the next work
queue is explicit and contains no completed items.

Re-running is safe: Status, Owner, Target Date and Notes are preserved from
the previous docs/master-build-tracker.xlsx if one exists (matched by a
stable Item ID), so manual progress updates are never overwritten by a
regeneration.

Usage:
    python3 scripts/build_master_tracker.py
    python3 scripts/build_master_tracker.py --source docs/broadbandpicker-keyword-mapping.xlsx
"""

from __future__ import annotations

import argparse
import subprocess
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from openpyxl import Workbook, load_workbook
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.utils import get_column_letter
from openpyxl.worksheet.table import Table, TableStyleInfo

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_OUTPUT = ROOT / "docs" / "master-build-tracker.xlsx"
DEFAULT_SOURCE = ROOT / "docs" / "broadbandpicker-keyword-mapping.xlsx"
RUN_DATE = datetime.now(timezone.utc).date().isoformat()

# Preserved across regenerations by Item ID.
MANUAL_HEADERS = ("Status", "Owner", "Target Date", "Notes")
DEFAULT_STATUS = "Not started"

# ---------------------------------------------------------------------------
# Feature / UX / content-strategy builds — curated from the growth playbook.
# Hand-scored on the same rough 0-100 scale as the page-build priority score
# so both sources can be ranked in one list without pretending the numbers
# came from the same formula.
# ---------------------------------------------------------------------------

FEATURE_BUILDS: list[dict[str, Any]] = [
    {
        "item_id": "ops-conversion-reporting-loop",
        "type": "Measurement",
        "pillar": "Analytics",
        "title": "Validate conversion events and establish the GSC/analytics reporting loop",
        "description": (
            "Confirm postcode submits, speed-test completions, filter use, outbound provider "
            "clicks and assisted conversions are recorded reliably, then use query and "
            "engagement evidence to reprioritise future work."
        ),
        "priority_score": 63,
        "impact_score": 72,
        "effort": "Medium",
        "target": "GSC, analytics and conversion reporting",
        "dependencies": "Sufficient live traffic and event data",
        "source": "BroadbandPicker SEO & Content Plan — Live: Build Status / Technical SEO",
        "verified_status": "Done",
        "completion_notes": (
            "Shipped to Vercel production 2026-08-23: consent-aware GA4 events for postcode "
            "submits, speed-test starts/completions/failures, deal filter/sort use and outbound "
            "provider clicks, with session first-touch attribution and no full postcode sent. "
            "Measurement contract and weekly GSC/GA4 loop documented in docs/analytics-measurement-plan.md."
        ),
    },
    {
        "item_id": "growth-awin-advertiser-outreach",
        "type": "Partnerships",
        "pillar": "Monetisation",
        "title": "Continue selective Awin advertiser outreach",
        "description": (
            "Apply to best-fit provider programmes with tailored pitches, relevant live URLs, "
            "audience evidence, promotional method and compliance controls; log decisions and feedback. "
            "Real status pulled from the Awin Publisher API 2026-08-23 (see "
            "ops-awin-publisher-api-integration): joined -- TalkTalk, Broadband Genie, Zzoomm, "
            "Highland Broadband. Pending -- Sky ROI, Community Fibre, National Broadband, Trooli, "
            "Pine Media, Cuckoo, Zen Internet. Rejected -- BT (consumer + business), Vodafone, "
            "Plusnet, EE, Virgin Media, Hyperoptic, toob, giffgaff. The 8 rejected mainstream "
            "providers are the priority re-application targets; Zzoomm and Highland Broadband are "
            "approved but not yet added as providers on the site at all."
        ),
        "priority_score": 60,
        "impact_score": 70,
        "effort": "Medium",
        "target": "Awin publisher 2942019 and partner application log",
        "dependencies": "Current audience evidence and compliant commercial pages",
        "source": "BroadbandPicker SEO & Content Plan — Live: 90 Day Roadmap",
        "initial_status": "In progress",
    },
    {
        "item_id": "ops-adsense-site-review",
        "type": "Monetisation",
        "pillar": "Infrastructure",
        "title": "Complete AdSense site review and authorisation monitoring",
        "description": (
            "Monitor the existing AdSense review, consent implementation and ads.txt authorisation; "
            "resolve any concrete policy or crawler issue reported by AdSense."
        ),
        "priority_score": 58,
        "impact_score": 55,
        "effort": "Low",
        "target": "AdSense status and /ads.txt",
        "dependencies": "Google site-review processing",
        "source": "BroadbandPicker SEO & Content Plan — Live: Build Status",
        "initial_status": "In progress",
    },
    {
        "item_id": "growth-original-research-outreach",
        "type": "Growth",
        "pillar": "Content",
        "title": "Run original-research outreach and digital PR",
        "description": (
            "Build a relevant outreach list and earn citations and links to the live Ofcom-backed "
            "customer-satisfaction research."
        ),
        "priority_score": 54,
        "impact_score": 68,
        "effort": "Medium",
        "target": "/research/uk-broadband-customer-satisfaction",
        "dependencies": "Research page and source methodology are live",
        "source": "BroadbandPicker SEO & Content Plan — Live: Build Status / 90 Day Roadmap",
        "initial_status": "In progress",
    },
    {
        "item_id": "growth-quarterly-data-reprioritisation",
        "type": "Strategy",
        "pillar": "Growth",
        "title": "Reprioritise quarter two using GSC, engagement and affiliate evidence",
        "description": (
            "Review query/page performance, assisted conversions, Awin decisions and engagement "
            "data, then record the next-quarter build decisions."
        ),
        "priority_score": 53,
        "impact_score": 63,
        "effort": "Medium",
        "target": "Next-quarter decision log",
        "dependencies": "ops-conversion-reporting-loop and sufficient observation period",
        "source": "BroadbandPicker SEO & Content Plan — Live: 90 Day Roadmap",
    },
    {
        "item_id": "audit-core-web-vitals-reporting",
        "type": "Technical SEO",
        "pillar": "Performance",
        "title": "Establish monthly Core Web Vitals reporting by template",
        "description": "Track LCP, INP and CLS by page template and prioritise JS or image-weight fixes from evidence.",
        "priority_score": 47,
        "impact_score": 50,
        "effort": "Medium",
        "target": "Sitewide template performance report",
        "dependencies": "Field data or representative lab baselines",
        "source": "BroadbandPicker SEO & Content Plan — Live: Technical SEO",
    },
    {
        "item_id": "audit-broken-links-redirects",
        "type": "Technical SEO",
        "pillar": "Crawlability",
        "title": "Add routine broken-link and redirect reporting",
        "description": "Monitor broken inbound and internal URLs and maintain relevant one-hop redirects.",
        "priority_score": 44,
        "impact_score": 48,
        "effort": "Low",
        "target": "Sitewide crawl and redirect report",
        "dependencies": "None",
        "source": "BroadbandPicker SEO & Content Plan — Live: Technical SEO",
    },
    {
        "item_id": "ops-git-vercel-reconcile",
        "type": "Ops / risk",
        "pillar": "Infrastructure",
        "title": "Reconcile git history with the live Vercel deployment",
        "description": (
            "Production currently serves pages (the 16-page pipeline batch) that were "
            "deployed straight from local disk via `vercel --prod` and were never "
            "committed or pushed to git. Git and production have diverged — the next "
            "`git push` triggering a Vercel git-integration deploy, or any reset of the "
            "local working tree, risks rolling the live site back. Commit and push the "
            "current working tree to close the gap."
        ),
        "priority_score": 96,
        "impact_score": 90,
        "effort": "Low",
        "target": "Repository + Vercel project",
        "dependencies": "None — blocks everything else being deployed safely",
        "source": "Discovered while preparing this tracker",
    },
    {
        "item_id": "feat-product-offer-schema",
        "type": "Feature",
        "pillar": "Functionality",
        "title": "Product/Offer schema on deal cards",
        "description": (
            "Uswitch marks up individual deals as Product + Quotation JSON-LD — the "
            "basis for price/rating rich snippets in search results. BroadbandPicker's "
            "deal cards don't carry this yet. Contained, well-scoped, clear SEO payoff."
        ),
        "priority_score": 74,
        "impact_score": 70,
        "effort": "Low",
        "target": "components/DealCard and deal-listing pages",
        "dependencies": "None",
        "source": "docs/competitor-landscape-scan.json",
    },
    {
        "item_id": "feat-persistent-postcode",
        "type": "Feature",
        "pillar": "UX",
        "title": "Persistent postcode across the site",
        "description": (
            "Once a postcode is entered on /postcode, carry it (localStorage, no "
            "account needed) into /deals, /compare and every provider page so the "
            "journey feels personal rather than resetting the question each time."
        ),
        "priority_score": 71,
        "impact_score": 68,
        "effort": "Medium",
        "target": "PostcodeChecker + shared client state",
        "dependencies": "None",
        "source": "Growth playbook — UX pillar",
    },
    {
        "item_id": "feat-shortlist-compare-basket",
        "type": "Feature",
        "pillar": "UX",
        "title": "Shortlist / compare-basket pattern",
        "description": (
            "Let users tick 2–3 deals and see them side by side, matching Uswitch and "
            "broadband.co.uk. Current /compare is one full table — good for browsing, "
            "weaker for a final decision between finalists."
        ),
        "priority_score": 61,
        "impact_score": 64,
        "effort": "Medium",
        "target": "app/compare",
        "dependencies": "None",
        "source": "Growth playbook — UX pillar",
        "verified_status": "Done",
        "completion_notes": (
            "Shipped to Vercel production 2026-08-23: visitors can shortlist two or three "
            "providers on /compare, retain the shortlist in local storage, compare price, "
            "maximum speed, contract, setup fee, coverage and customer rating in responsive "
            "finalist cards, then continue to a provider review or tracked deal link. Includes "
            "accessible controls, a three-provider limit and GA4 shortlist/basket events."
        ),
    },
    {
        "item_id": "feat-review-aggregation-module",
        "type": "Feature",
        "pillar": "Functionality",
        "title": "Real review-aggregation trust module",
        "description": (
            "Blend the existing Ofcom-complaints research methodology with live "
            "Trustpilot scores into one visible trust module reused across provider "
            "and comparison pages, instead of a single quoted score per page."
        ),
        "priority_score": 59,
        "impact_score": 62,
        "effort": "Medium",
        "target": "New shared component, used on provider + comparison pages",
        "dependencies": "research/uk-broadband-customer-satisfaction methodology",
        "source": "Growth playbook — Functionality pillar",
    },
    {
        "item_id": "audit-city-hub-thinness",
        "type": "Content audit",
        "pillar": "Content",
        "title": "Verify each new city hub has a genuinely local fact",
        "description": (
            "8 new city hubs (Birmingham, Bristol, Edinburgh, Glasgow, Leeds, "
            "Liverpool, Manchester, Sheffield) plus 50 existing postcode-prefix pages "
            "is a lot of near-identical templates. Each needs at least one real local "
            "fact (a named local altnet, a real coverage figure) or it reads as "
            "duplicate content — audit before building the next batch of cities."
        ),
        "priority_score": 56,
        "impact_score": 50,
        "effort": "Medium",
        "target": "data/priority-pages.ts city entries",
        "dependencies": "None",
        "source": "Growth playbook — Content pillar",
    },
    {
        "item_id": "feat-price-drop-alerts",
        "type": "Feature",
        "pillar": "Functionality",
        "title": "Price-drop alerts",
        "description": (
            "data/provider-live-deals.json already tracks live pricing. An email/"
            "notification layer on top (\"tell me if broadband in my postcode drops "
            "below £X\") is mostly wiring, and it's a retention mechanic none of the "
            "readable competitors emphasised as much as their comparison tables."
        ),
        "priority_score": 49,
        "impact_score": 55,
        "effort": "Medium",
        "target": "New subscription flow + data/provider-live-deals.json",
        "dependencies": "Email delivery provider",
        "source": "Growth playbook — Functionality pillar",
    },
    {
        "item_id": "audit-mobile-checkout-flow",
        "type": "UX audit",
        "pillar": "UX",
        "title": "Mobile checkout-flow audit",
        "description": (
            "The competitor evidence (15k–23k word desktop hubs) is desktop-shaped. "
            "On mobile that content needs a different information architecture — "
            "sticky summary bar, collapsed sections, thumb-reachable CTAs. Worth a "
            "dedicated pass once analytics show where mobile users drop off."
        ),
        "priority_score": 45,
        "impact_score": 58,
        "effort": "Medium",
        "target": "Sitewide mobile layout",
        "dependencies": "Mobile analytics/drop-off data",
        "source": "Growth playbook — UX pillar",
    },
    {
        "item_id": "bet-annual-research-report",
        "type": "Bigger bet",
        "pillar": "Content",
        "title": "Annual 'State of UK Broadband' research report",
        "description": (
            "No competitor scanned publishes original research. Built on the "
            "existing /research page's methodology, an annual report is a natural "
            "press/backlink asset a comparison-table page can never be."
        ),
        "priority_score": 41,
        "impact_score": 65,
        "effort": "High",
        "target": "New annual research page + methodology extension",
        "dependencies": "research/uk-broadband-customer-satisfaction methodology",
        "source": "Growth playbook — Content pillar",
    },
    {
        "item_id": "bet-componentise-interactive-layer",
        "type": "Bigger bet",
        "pillar": "Functionality",
        "title": "Componentise the interactive layer on accessible primitives",
        "description": (
            "PostcodeChecker, SpeedTest, StickyFilterBar and SocialProofCounter "
            "already exist as separate components. As the shortlist and price-alert "
            "features land, adopt accessible primitives (Radix-style) underneath "
            "rather than hand-rolling focus/keyboard behaviour again each time."
        ),
        "priority_score": 38,
        "impact_score": 45,
        "effort": "High",
        "target": "components/",
        "dependencies": "feat-shortlist-compare-basket, feat-price-drop-alerts",
        "source": "Growth playbook — Functionality pillar",
    },
    {
        "item_id": "feat-uk-wide-postcode-coverage",
        "type": "Feature",
        "pillar": "Content/Trust",
        "title": "UK-wide real postcode coverage data (Ofcom)",
        "description": (
            "Only ~50 curated postcode prefixes had real local data; every other UK "
            "postcode showed a generic 'we're expanding coverage' fallback with no "
            "area-specific information. Built from Ofcom's open Connected Nations "
            "postcode-level dataset (Open Government Licence), aggregated to "
            "district level, covering all 2,818 UK postcode districts with real "
            "gigabit/superfast/ultrafast availability percentages."
        ),
        "priority_score": 80,
        "impact_score": 85,
        "effort": "Medium",
        "target": "data/postcode-district-coverage.json, data/postcodeDistrictCoverage.ts, app/postcode/[area]/page.tsx",
        "dependencies": "scripts/build_postcode_coverage.py (re-run when Ofcom publishes a newer postcode-level edition)",
        "source": "User request — real postcode-level availability",
    },
    {
        "item_id": "feat-broadband-match-quiz",
        "type": "Feature",
        "pillar": "Functionality",
        "title": "Broadband Match: personalised recommendation quiz",
        "description": (
            "Researched 2026-08-22 against Uswitch, Compare the Market, "
            "MoneySuperMarket, Which?, broadbandchoices, choose.co.uk and "
            "broadband.co.uk: none has a multi-question quiz that outputs a "
            "ranked provider/package recommendation — confirmed genuine gap, "
            "not a crowded feature. Closest analog, RightSpeed UK, only "
            "outputs a speed-tier range and hands off to a third-party site "
            "rather than affiliate-linking directly. Plan: 6-8 questions "
            "(reason for looking, household size, use cases — WFH/gaming/"
            "streaming/uploads, budget, contract-length preference, postcode), "
            "scored client-side against the existing provider dataset (speed, "
            "price, contract, Trustpilot, coverage — no new data pipeline "
            "needed), producing a ranked top 3 with per-pick reasoning and "
            "direct affiliate CTAs — going further than RightSpeed's speed-"
            "only output. Since AI Overviews cite static pages, not live quiz "
            "results (confirmed in research), pair the tool with internal "
            "links to/from the existing best-broadband-for-gaming/WFH/"
            "students/streaming guides so the underlying logic stays citable "
            "even though the live tool isn't. Directly serves the standing "
            "goal of making BroadbandPicker a site providers want in their "
            "affiliate programme: a completed-quiz click is a much stronger "
            "purchase-intent signal than a generic comparison-table click."
        ),
        "priority_score": 78,
        "impact_score": 83,
        "effort": "Medium-High",
        "target": "New route (e.g. /tools/broadband-match), new scoring component, reuses data/providers.ts + data/postcodes.ts + data/postcodeDistrictCoverage.ts",
        "dependencies": "None — reuses existing provider/coverage datasets",
        "source": "User request 2026-08-22, researched before scoring per the Strategic Lens process",
    },
    {
        "item_id": "feat-nav-header-footer-ia",
        "type": "Feature",
        "pillar": "UX",
        "title": "Navigation/header/footer IA improvements",
        "description": (
            "Researched via scripts/scrape_navigation_patterns.py against 5 best-in-class "
            "sites. broadband.co.uk (closest single-vertical comparable) stood out on sticky "
            "header, breadcrumbs and a trust badge near the top; BroadbandPicker already "
            "matches on the first two. Header nav link count split cleanly into supersite "
            "(127-556 links) vs specialist (21 links) patterns, confirming the growth "
            "playbook's 'specialist, not supersite' positioning. Added Postcode to primary "
            "nav; restructured the footer from 4 to 6 columns (added Tools, Find Broadband "
            "by Area, Research) to fix a crawl/link-equity gap for the postcode-district and "
            "tools pages built this session."
        ),
        "priority_score": 55,
        "impact_score": 60,
        "effort": "Low",
        "target": "app/layout.tsx",
        "dependencies": "None",
        "source": "User request 2026-08-22 — researched before implementing per the Strategic Lens process",
    },
    {
        "item_id": "feat-homepage-visual-redesign",
        "type": "Feature",
        "pillar": "UX",
        "title": "Homepage visual redesign: illustrations + interactivity",
        "description": (
            "Researched via scripts/analyze_homepage_visual_design.py against 5 UK broadband "
            "comparison homepages: none uses stock-photo hero banners; the dominant visual "
            "language is heavy inline SVG (Uswitch ships 195) and provider logos, no carousel/"
            "animation library detected anywhere. Generated 7 original on-brand SVG "
            "illustrations (scripts/generate_homepage_illustrations.py: hero network graphic, "
            "3 colour-filled step icons, 2 gradient blobs, a quiz illustration) rather than "
            "stock photography, matching what's actually proven in this vertical. Added a "
            "scroll-reveal component, hover interactions, and restructured the Broadband Match "
            "promo to a two-column illustrated layout. Content/copy unchanged, visual/UX only."
        ),
        "priority_score": 52,
        "impact_score": 55,
        "effort": "Medium",
        "target": "app/page.tsx, components/ScrollReveal.tsx, public/illustrations/",
        "dependencies": "None",
        "source": "User request 2026-08-23 — researched before implementing per the Strategic Lens process",
    },
    {
        "item_id": "feat-footer-logo-interactivity",
        "type": "Feature",
        "pillar": "UX",
        "title": "Footer logo placement and interactive elements",
        "description": (
            "Extended scripts/analyze_homepage_visual_design.py with footer-specific "
            "detection (logo, social icons, accordion/back-to-top, hover density). Confirmed "
            "directly in app/layout.tsx (not just inferred from the scan) that the footer had "
            "no logo at all. Added components/Logo.tsx (extracted from the header, reused "
            "larger in the footer with a tagline), made the 6 footer link columns "
            "<details open> elements with a mobile-only collapse toggle (desktop behaves "
            "exactly as static headings did, via lg:pointer-events-none, so nothing is at "
            "risk of accidental collapse), upgraded the social link to a hover-interactive "
            "pill button, and added a 'Back to top' link using the existing global "
            "smooth-scroll behaviour."
        ),
        "priority_score": 48,
        "impact_score": 40,
        "effort": "Low",
        "target": "app/layout.tsx, components/Logo.tsx",
        "dependencies": "None",
        "source": "User request 2026-08-23 — researched before implementing per the Strategic Lens process",
    },
    {
        "item_id": "feat-mega-menu-navigation",
        "type": "Feature",
        "pillar": "UX",
        "title": "Detailed mega-menu navigation",
        "description": (
            "Extended scripts/scrape_navigation_patterns.py with mega-menu structural "
            "detection (top-level item count, icons-in-dropdown, descriptive subtext, "
            "nesting depth). Found Uswitch uses icons in dropdown items and broadband.co.uk "
            "uses one-line descriptions under category groups — both implemented. Built "
            "components/MainNav.tsx: Providers, Postcode, Guides and Tools are now dropdowns "
            "with icons and descriptions; Compare and Deals stay direct links as primary "
            "single-destination actions. The Guides dropdown is a real mega-menu pulling the "
            "site's actual 6 guide categories and their real guides live from data/guides.ts "
            "— stays correct as the pipeline adds guides, no hardcoding. CSS-only "
            "(group-hover/group-focus-within), keyboard-reachable via Tab, no JS dependency."
        ),
        "priority_score": 50,
        "impact_score": 58,
        "effort": "Medium",
        "target": "components/MainNav.tsx, app/layout.tsx",
        "dependencies": "None",
        "source": "User request 2026-08-23 — researched before implementing per the Strategic Lens process",
    },
    {
        "item_id": "feat-page-type-ux-redesign",
        "type": "Feature",
        "pillar": "UX",
        "title": "Page-type UX redesign: deals, providers, guides, postcode hub",
        "description": (
            "New scripts/analyze_page_type_ux.py scans competitor pages by theme (deals "
            "listing, provider review, guide article, postcode/checker hub) rather than "
            "homepage-only, against Uswitch, broadband.co.uk, choose.co.uk and "
            "MoneySavingExpert (403, reported not bypassed). Confirmed signals: comparison "
            "checkboxes near-universal; badge/chip labels on deals listings + review index; "
            "TOC on the guide article + one deals listing; pros/cons on provider review + "
            "deals; related-content on provider review + deals; rating widget on one deals "
            "listing. No dedicated postcode-hub competitor page exists in this vertical. "
            "Shipped strictly against confirmed signals: computed Best Value/Fastest/Editor's "
            "Pick badges in components/DealTable.tsx; new components/RatingStars.tsx replacing "
            "plain-text Trustpilot scores plus a 'How {provider} compares' related-comparisons "
            "module on provider pages; a jump-to-section table of contents on guide pages via "
            "new lib/extractHeadings.tsx (JSX-tree heading-ID injection, avoids hand-editing "
            "40 existing guide definitions), gated behind 3+ headings; and the same "
            "cheapest/fastest badges plus rating stars carried onto postcode-hub provider "
            "cards since deals and hub serve the same comparison job."
        ),
        "priority_score": 49,
        "impact_score": 52,
        "effort": "Medium",
        "target": (
            "components/DealTable.tsx, components/RatingStars.tsx, lib/extractHeadings.tsx, "
            "app/providers/[slug]/page.tsx, app/guides/[slug]/page.tsx, "
            "app/postcode/[area]/page.tsx"
        ),
        "dependencies": "None",
        "source": "User request 2026-08-23 — researched before implementing per the Strategic Lens process",
    },
    {
        "item_id": "feat-mobile-cross-device-navigation",
        "type": "Feature",
        "pillar": "UX",
        "title": "Mobile and cross-device navigation overhaul",
        "description": (
            "New scripts/analyze_mobile_ux.py scanned Uswitch, broadband.co.uk and "
            "choose.co.uk (MoneySavingExpert 403, reported not bypassed) with a mobile "
            "Safari user agent for markup/CSS signals: viewport meta and hamburger menu "
            "markers were universal but already correct on our own site; tel: click-to-call "
            "was absent everywhere (0/4, skipped); sticky bottom CTA (1/4) and "
            "apple-touch-icon (2/4) were too weak/incomplete to act on. The real gap was "
            "found by direct inspection, not the scan: the mobile nav was a small anchored "
            "dropdown of 10 flat links with ~36px touch targets, while the desktop nav beside "
            "it was a full mega-menu, and the header postcode checker was desktop-only so "
            "phone users had no quick postcode access outside the homepage/deals page. "
            "Replaced it with new components/MobileNav.tsx: a full-width slide-down panel "
            "reusing the desktop mega-menu's own icon/link data (exported from MainNav.tsx, "
            "so the two can't drift apart), every link at a 44px (min-h-11) touch target, "
            "and the postcode checker embedded at the top so it's reachable from any page. "
            "Added anchor ids to /guides category sections so the new mobile Guides menu "
            "jumps to a real target instead of an unread query param."
        ),
        "priority_score": 51,
        "impact_score": 56,
        "effort": "Medium",
        "target": "components/MobileNav.tsx, components/MainNav.tsx, app/layout.tsx, app/guides/page.tsx",
        "dependencies": "None",
        "source": "User request 2026-08-23 — researched before implementing per the Strategic Lens process",
    },
    {
        "item_id": "feat-animated-interactive-mobile-menu",
        "type": "Feature",
        "pillar": "UX",
        "title": "Animated, interactive mobile menu with click-outside-to-close",
        "description": (
            "Direct UX/interaction-design request, not a scraping pass. Rewrote "
            "components/MobileNav.tsx from a native <details> element (no animation, no "
            "click-outside-to-close) to a controlled client component: hamburger icon morphs "
            "into an X on open; a blurred backdrop closes the menu on click or Escape; the "
            "panel and its sections slide/fade in with a staggered delay reusing the same "
            "transition idiom as components/ScrollReveal.tsx; Providers/Postcode/Guides/Tools "
            "became single-open accordions using a CSS-only grid-template-rows 0fr->1fr "
            "transition (no JS height measurement); the menu auto-closes on route change via "
            "usePathname(); background scroll is locked while open; focus moves into the panel "
            "on open and returns to the trigger on Escape. Global prefers-reduced-motion "
            "handling already in app/globals.css applies automatically. Not visually verified "
            "on a real device — no browser automation tool available this session, validated "
            "via build output, generated CSS and server-rendered markup only."
        ),
        "priority_score": 50,
        "impact_score": 54,
        "effort": "Medium",
        "target": "components/MobileNav.tsx",
        "dependencies": "None",
        "source": "User request 2026-08-23 — researched before implementing per the Strategic Lens process",
    },
    {
        "item_id": "feat-contact-form-email-delivery",
        "type": "Feature",
        "pillar": "Infrastructure",
        "title": "Working contact form delivering to a real inbox, no third-party service",
        "description": (
            "Previously /contact only offered mailto: links to unverified custom-domain "
            "addresses (editorial@/partnerships@/hello@broadbandpicker.co.uk). Built a real "
            "contact form (components/ContactForm.tsx) posting to a new "
            "app/api/contact route, which sends via Gmail SMTP using nodemailer — no "
            "Supabase, no database, no third-party form/CRM service, per explicit "
            "instruction. All submissions land in sayedsahil.elt@gmail.com (CONTACT_TO_EMAIL "
            "env var), sent from a Gmail account authenticated with an App Password "
            "(CONTACT_SMTP_USER / CONTACT_SMTP_PASS). Reply-To is set to the sender's own "
            "address so replying goes straight back to them. Spam mitigation without any "
            "external service: a hidden honeypot field (bots that fill every input get "
            "silently dropped) and a submit-time check rejecting anything sent under 1.5s "
            "after the form rendered. Server-side validates name/email/reason/message "
            "independently of the client. The original mailto: cards are kept underneath as "
            "a secondary direct-email option. Requires CONTACT_SMTP_USER/PASS to be set in "
            "Vercel — the API route fails gracefully with a friendly error and a server log "
            "line if they're absent, rather than silently dropping messages."
        ),
        "priority_score": 55,
        "impact_score": 50,
        "effort": "Low",
        "target": "app/api/contact/route.ts, components/ContactForm.tsx, app/contact/page.tsx",
        "dependencies": "CONTACT_SMTP_USER / CONTACT_SMTP_PASS Gmail App Password set in Vercel env vars",
        "source": "User request 2026-08-23 — researched before implementing per the Strategic Lens process",
        "initial_status": "In progress",
    },
    {
        "item_id": "feat-postcode-journey-personalisation",
        "type": "Feature",
        "pillar": "UX",
        "title": "Postcode-aware personalisation across the customer journey, free tier only",
        "description": (
            "User asked for a postcode -> select-your-house-number address picker with "
            "customised content, and explicitly asked whether it could be built free. "
            "Researched live (WebSearch, 2026-08-23): full UK address-level lookup (the data "
            "behind 'pick your house from a list') is Royal Mail's licensed PAF data, not open "
            "-- getAddress.io, a popular free-tier provider, was shut down in Oct 2025 after a "
            "Royal Mail/IDDQD IP claim; Ideal Postcodes gives a 1-month/50-credit trial then "
            "pay-as-you-go; no provider offers a genuine unlimited free tier at real traffic. "
            "Separately, even a working address picker wouldn't improve accuracy without a paid "
            "per-address line-checker API (Openreach or provider-specific), which is a "
            "commercial relationship, not a script. Presented both findings and 3 options to the "
            "user via AskUserQuestion; they chose the free path: deepen personalisation using "
            "data already held, no new API, no new cost. Shipped: extended the existing "
            "components/PostcodeContextBar.tsx (previously only on deals/compare/provider "
            "pages) to guide pages and all 3 tool pages (speed test, broadband match, cost "
            "calculator) so a stored postcode follows the visitor through the full journey; new "
            "components/ProviderAvailabilityBadge.tsx shows a real yes/no ('BT is/isn't listed "
            "as available in {town}') on provider review pages, but only for the 51 postcode "
            "areas with real availableProviders data in data/postcodes.ts -- silently renders "
            "nothing outside that set rather than guessing; new "
            "components/ReturningVisitorBanner.tsx greets a returning visitor on the homepage "
            "with a direct link back to their own postcode's deals."
        ),
        "priority_score": 53,
        "impact_score": 55,
        "effort": "Medium",
        "target": (
            "components/ProviderAvailabilityBadge.tsx, components/ReturningVisitorBanner.tsx, "
            "components/PostcodeContextBar.tsx, app/page.tsx, app/providers/[slug]/page.tsx, "
            "app/guides/[slug]/page.tsx, app/speed-test/page.tsx, app/tools/broadband-match/page.tsx, "
            "app/tools/broadband-cost-calculator/page.tsx"
        ),
        "dependencies": "None -- deliberately built on data already held, no new API/cost",
        "source": "User request 2026-08-23 — researched before implementing per the Strategic Lens process",
    },
    {
        "item_id": "ops-awin-publisher-api-integration",
        "type": "Tooling",
        "pillar": "Monetisation",
        "title": "Direct Awin Publisher API access — programme status and link generation",
        "description": (
            "User asked to connect Claude to their Awin account and provided a real API "
            "token. There's no one-click connector for Awin (unlike Google Drive/Gmail), "
            "so this uses Awin's own Publisher API directly. First live run corrected two "
            "wrong assumptions from documentation research: 'programmedetails' requires a "
            "specific advertiserId (not a bulk listing endpoint) -- the actual bulk-status "
            "endpoint is GET /publishers/{id}/programmes?relationship=X, and 'any' is not "
            "a valid value for it (loops joined/pending/suspended/rejected instead; "
            "'notjoined' returns the ~21k whole-platform catalogue so it's excluded from "
            "the default and only fetched on request). POST /publishers/{id}/"
            "linkbuilder/generate confirmed working, verified against TalkTalk (advertiser "
            "3674). REAL FINDING from the first run, both surfaced to the user and worth "
            "acting on: only 4 programmes are joined (TalkTalk, Broadband Genie, Zzoomm, "
            "Highland Broadband), 7 pending (Sky ROI, Community Fibre, National Broadband, "
            "Trooli, Pine Media, Cuckoo, Zen Internet), and 9 REJECTED including BT "
            "(both consumer and business), Vodafone, Plusnet, EE, Virgin Media, Hyperoptic "
            "and toob. Cross-checked data/providers.ts: none of the currently-live "
            "affiliateUrl values (including TalkTalk, which IS approved) use Awin's "
            "awin1.com tracking format -- they're all plain provider URLs, so the site is "
            "very likely not earning commission on any current outbound click, joined or "
            "not, despite the on-page commercial disclosures implying it might."
        ),
        "priority_score": 47,
        "impact_score": 45,
        "effort": "Low",
        "target": "scripts/awin_sync.py",
        "dependencies": "AWIN_API_TOKEN from the user's Awin account (user menu -> API Credentials)",
        "source": "User request 2026-08-23 — researched before implementing per the Strategic Lens process",
        "initial_status": "In progress",
    },
    {
        "item_id": "content-awin-approved-provider-deep-content",
        "type": "Content",
        "pillar": "Content",
        "title": "Deep, researched content for Awin-approved providers (TalkTalk, Zzoomm, Highland Broadband)",
        "description": (
            "Following the Awin programme-status pull (ops-awin-publisher-api-integration), "
            "built full researched content for the 3 real providers among the 4 joined "
            "programmes (Broadband Genie is a comparison site, not an ISP, and was excluded). "
            "Per docs/page-build-pipeline-brief.md Stage 3/4/4a: for each provider, fetched "
            "the provider's own site for current pricing/speeds/contract terms, WebSearched "
            "Trustpilot and, where relevant, Ofcom's own complaints data, and wrote an 8-section "
            "contentSections block plus FAQs matching the site's deepest existing template "
            "(Gigaclear). All copy hand-checked for zero em dashes and zero banned AI-tell "
            "vocabulary/phrases per the Stage 4a list. TalkTalk's existing entry was materially "
            "stale (Trustpilot claimed 2.8, real current figure 1.5 from 50k+ reviews in "
            "Trustpilot's 'Bad' band; Ofcom's Q1 2026 report names TalkTalk the UK's most "
            "complained-about broadband provider for the third consecutive quarter; the old "
            "'price-lock guarantee' highlight was false, two scheduled April 2027/2028 rises "
            "are now built into every contract) -- fully rewritten, not just extended. Zzoomm "
            "and Highland Broadband were brand-new Provider entries (real Awin tracking links, "
            "placeholder text-wordmark logos per the brief's guardrail against fabricating brand "
            "marks). In passing, corrected Plusnet's stale trustpilotScore field (3.9 -> 2.0, "
            "the real current figure) since new comparison copy was about to cite it -- Plusnet's "
            "own deep content rewrite is out of scope (not an Awin-approved programme). Two new "
            "comparison pages: talktalk-vs-plusnet (a genuinely stark, well-evidenced contrast -- "
            "same price bracket, opposite ends of Ofcom's complaints table) and "
            "zzoomm-vs-hyperoptic (two symmetrical full-fibre altnets with almost non-overlapping "
            "coverage footprints). Internal linking relies on the existing 'How {provider} "
            "compares' module built earlier this session; both new comparisons are discoverable "
            "via /providers/compare and the sitemap even where they don't make a crowded "
            "provider's top-3 related slice."
        ),
        "priority_score": 58,
        "impact_score": 62,
        "effort": "High",
        "target": (
            "data/providers.ts (talktalk, zzoomm, highland-broadband, plusnet trustpilotScore), "
            "data/provider-comparisons.ts (talktalk-vs-plusnet, zzoomm-vs-hyperoptic), "
            "public/logos/zzoomm.svg, public/logos/highland-broadband.svg"
        ),
        "dependencies": "ops-awin-publisher-api-integration",
        "source": "User request 2026-08-23 — researched before implementing per the Strategic Lens process",
    },
    {
        "item_id": "content-awin-pending-provider-deep-content",
        "type": "Content",
        "pillar": "Content",
        "title": "Deep, researched content for Awin-pending providers (Community Fibre, Cuckoo, Zen Internet, National Broadband, Trooli, Pine Media)",
        "description": (
            "Follow-up to content-awin-approved-provider-deep-content, extending the same "
            "research process to the 6 real UK-relevant advertisers pending Awin approval "
            "(Sky ROI excluded -- Republic of Ireland Sky, not UK, out of scope for a UK site, "
            "confirmed with the user). Community Fibre and Zen Internet were existing but thin "
            "entries, fully rewritten. Cuckoo was already deep and dated the previous day; "
            "verified rather than rewritten. National Broadband, Trooli and Pine Media were "
            "brand-new Provider entries. National Broadband is the site's first 4G/5G "
            "fixed-wireless provider (a genuinely new content category, not another fibre "
            "altnet); Pine Media is a hyperlocal single-city (Sheffield-only) provider with a "
            "two-tier product split (its own symmetrical GIG network vs an Openreach-based GLO "
            "product) that needed explaining clearly to avoid conflating the two. Key design "
            "decision: because these programmes are pending, not joined, affiliateUrl stays as "
            "each provider's own plain site URL rather than an Awin tracking link -- confirmed "
            "via a live API test that Awin's linkbuilder will generate a structurally valid "
            "tracking URL even for a pending programme, which would be misleading to publish "
            "since it likely would not earn commission (or could breach Awin's terms) before "
            "approval. Each reviewSources array carries an explicit 'pending, not yet approved' "
            "note on the Awin source, matching the existing Gigaclear convention. All copy "
            "hand-checked for zero em dashes and zero banned AI-tell vocabulary/phrases. Three "
            "new comparison pages, chosen for genuine evidentiary value over one-per-provider "
            "completeness: community-fibre-vs-hyperoptic (London's two biggest symmetrical "
            "altnets, direct competitors), trooli-vs-zzoomm (two multi-region altnets with "
            "near-zero coverage overlap and matching no-price-rise policies), and "
            "national-broadband-vs-highland-broadband (5G available now vs fibre still being "
            "built -- a genuine buy-now-or-wait decision for the same rural Scottish "
            "customer). Cuckoo, Zen Internet and Pine Media were deliberately left without a "
            "new comparison this round -- no natural, non-forced head-to-head partner existed "
            "for any of them without inventing artificial relevance."
        ),
        "priority_score": 55,
        "impact_score": 58,
        "effort": "High",
        "target": (
            "data/providers.ts (community-fibre, cuckoo, zen-internet, national-broadband, "
            "trooli, pine-media), data/provider-comparisons.ts (community-fibre-vs-hyperoptic, "
            "trooli-vs-zzoomm, national-broadband-vs-highland-broadband), "
            "public/logos/national-broadband.svg, public/logos/trooli.svg, "
            "public/logos/pine-media.svg"
        ),
        "dependencies": "content-awin-approved-provider-deep-content, ops-awin-publisher-api-integration",
        "source": "User request 2026-08-23 — researched before implementing per the Strategic Lens process",
    },
    {
        "item_id": "content-awin-rejected-provider-deep-content",
        "type": "Content",
        "pillar": "Content",
        "title": "Deep, researched content for Awin-rejected providers (BT, Virgin Media, EE, Vodafone, Plusnet, Hyperoptic, toob, giffgaff)",
        "description": (
            "Third and final batch in the Awin content series (after approved and pending), "
            "covering all 8 real providers rejected on Awin: BT (both consumer 3041 and "
            "business 3042 programmes), Virgin Media, EE, Vodafone, Plusnet, Hyperoptic, toob "
            "and giffgaff. All 7 existing entries were thin (no contentSections) and fully "
            "rewritten; giffgaff did not exist on the site at all and was added new. "
            "IMPORTANT CORRECTION made mid-batch: while researching BT's price rise, "
            "discovered Ofcom banned inflation-linked/percentage-based mid-contract price rise "
            "terms in all new contracts from 17 January 2025 (providers must now disclose a "
            "flat pounds-and-pence figure instead). This retroactively invalidated 5 sentences "
            "written in the two earlier Awin batches (Community Fibre, Zen Internet and Zzoomm "
            "entries in data/providers.ts, plus the Community Fibre vs Hyperoptic comparison) "
            "that described CPI-linked percentage rises as a current practice -- all 5 were "
            "corrected in this same batch before continuing, and this correction is itself the "
            "kind of thing worth surfacing: a fact later research revealed to be wrong wasn't "
            "left standing. Real findings surfaced across this batch: BT and EE both maintain "
            "two separate Trustpilot pages (a mobile/brand-dominated headline score and a much "
            "lower broadband-specific one, roughly 4.0 vs 1.5 for BT, 4.2 vs 1.3 for EE) -- the "
            "broadband-specific figure was used as the primary trustpilotScore field in both "
            "cases, with the discrepancy explained in the copy since it's a genuinely useful, "
            "non-obvious insight. Plusnet's low Trustpilot score sits alongside the *best* "
            "Ofcom complaints record of any major UK provider (4 per 100,000 in Q1 2026, "
            "against TalkTalk's 10, Vodafone's 8 and BT's 7) -- a real, evidenced gap between "
            "self-selected review-platform sentiment and regulatory complaint-volume data, "
            "explained rather than picking one source and ignoring the other. Virgin Media "
            "shows the same pattern in reverse: an extremely low Trustpilot score (~1.4) next "
            "to an Ofcom complaints record at or below the industry average. giffgaff is a "
            "genuinely new product (broadband launched September 2025 on Nexfibre, the Virgin "
            "Media O2 wholesale network, not Openreach) with no separate broadband Trustpilot "
            "page yet -- flagged honestly as thin evidence rather than borrowing giffgaff's "
            "much larger mobile-customer score uncritically. All affiliateUrl values stay as "
            "each provider's own plain site URL, since Awin rejected these applications outright "
            "(not merely pending) -- every reviewSources array states this explicitly. Three new "
            "comparison pages targeting genuine content gaps rather than one-per-provider "
            "completeness (this batch's providers already had extensive existing head-to-head "
            "coverage from earlier site work): bt-vs-hyperoptic (safe wide-coverage default vs "
            "better-value niche upgrade), plusnet-vs-ee (same BT Group parent, opposite ends of "
            "Ofcom's complaints table), toob-vs-giffgaff (two newer no-price-rise challenger "
            "brands on completely different networks). All copy hand-checked for zero em dashes "
            "and zero banned AI-tell vocabulary/phrases."
        ),
        "priority_score": 60,
        "impact_score": 65,
        "effort": "High",
        "target": (
            "data/providers.ts (bt, virgin-media, ee, vodafone, plusnet, hyperoptic, toob, "
            "giffgaff, plus corrections to community-fibre, zen-internet, zzoomm), "
            "data/provider-comparisons.ts (bt-vs-hyperoptic, plusnet-vs-ee, toob-vs-giffgaff, "
            "plus a correction to community-fibre-vs-hyperoptic), public/logos/giffgaff.svg"
        ),
        "dependencies": "ops-awin-publisher-api-integration, content-awin-approved-provider-deep-content, content-awin-pending-provider-deep-content",
        "source": "User request 2026-08-24 — researched before implementing per the Strategic Lens process",
    },
    {
        "item_id": "content-refresh-best-broadband-tv-deals-guide",
        "type": "Content",
        "pillar": "Content",
        "title": "Research-led editorial refresh: Best Broadband and TV Deals guide",
        "description": (
            "User-requested application of the same Stage 3/4/4a research process from the "
            "Awin content batches to a single existing guide page, "
            "/guides/best-broadband-and-tv-deals. Unlike the thin provider stubs rewritten in "
            "the Awin batches, this guide was already well-built (tables, methodology, 7 FAQs, "
            "real Ofcom citations, last checked 29 July 2026) -- not a stub needing a ground-up "
            "rewrite, so this was a verify-and-deepen pass grounded in fresh research rather "
            "than a full replacement. Scraped 2 top-ranking competitors (MoneySuperMarket, "
            "Uswitch) per Stage 3.0: found MoneySupermarket runs a 15-question FAQ (ours had "
            "7) and leads with an expert-quoted bundling-savings statistic. Traced that claim "
            "to its actual primary source rather than citing the secondary restatement: Ofcom's "
            "own February 2026 research, savings of £26-£48/month from bundling and pay-TV "
            "averaging £12/month within a bundle (23% real-terms fall) -- a stronger, more "
            "current, primary-sourced figure than the competitor's 2023-dated stat, added as a "
            "new section. Also found and added two genuinely new, specific facts the page "
            "didn't have: Virgin Media's Max Volt bundle (real current pricing including its "
            "two scheduled rises to April 2028) as a concrete worked example, and Virgin "
            "Media's 'Most Reliable Broadband Provider' win at the 2026 Uswitch Telecoms "
            "Awards (Opensignal-verified, a genuine third-party measurement). Named the "
            "specific Sky bundle example (Sky Stream, Sky TV, Netflix + Full Fibre 300, "
            "£35/month) that the existing copy referenced only vaguely. Added 2 new FAQs tied "
            "to the new content. Fixed 2 pre-existing em dashes found during the pass (a "
            "legitimate en-dash numeric range, '50-100Mbps', was left alone -- not an AI-tell, "
            "different typographic use). Updated the page's stated fact-check date and "
            "guides.ts updatedDate to 2026-08-24."
        ),
        "priority_score": 48,
        "impact_score": 45,
        "effort": "Medium",
        "target": "app/guides/[slug]/page.tsx (best-broadband-and-tv-deals), data/guides.ts",
        "dependencies": "None",
        "source": "User request 2026-08-24 — researched before implementing per the Strategic Lens process",
    },
    {
        "item_id": "ops-content-priority-analysis-tooling",
        "type": "Tooling",
        "pillar": "Content",
        "title": "Content priority analysis: real SEO + GEO signals, build vs. update on one list",
        "description": (
            "User asked for a script that does detailed SEO analysis of the site's own data "
            "and prioritises what to build vs. update, weighting generative-AI/GEO reports "
            "specifically. Built scripts/analyze_content_priority.py: combines real mapped "
            "search volume already researched in docs/broadbandpicker-keyword-mapping.xlsx "
            "with a live crawl of every provider/comparison/guide page (word count against "
            "this session's own depth floors, FAQPage schema, a detectable answer-first "
            "paragraph, a parsed checked/reviewed date). Mid-build discovered the user's "
            "actual request: a real Google Search Console 'Performance on Search Generative "
            "AI Features' export had been dropped into data/GSC/, which is ground truth for "
            "AI Overview surfacing, not a proxy -- rebuilt the script to load and heavily "
            "weight it. Caught and fixed two real bugs before reporting any findings: word "
            "counts of 15k-17k+ caused by the React RSC hydration payload inside <script> tags "
            "being counted as visible text, and every page falsely flagging 'no answer-first "
            "paragraph' because the <p> search matched header mega-menu labels before reaching "
            "the main content -- both fixed by parsing with lxml, stripping script/style, and "
            "scoping to <main>. Real finding once the GSC data was wired in: "
            "/guides/best-full-fibre-broadband-uk earned 512 real AI-feature impressions in the "
            "last 28 days while sitting at 636 words, the clearest 'already working, just needs "
            "depth' signal on the site -- now the top-ranked refresh target, above even "
            "/providers/sky's 172,237 monthly search volume, since Sky currently earns almost "
            "no AI-feature traction (4 impressions) and represents a different kind of "
            "opportunity. Sky also does not appear in any of the 3 Awin relationship lists at "
            "all (joined/pending/rejected), confirmed via a direct re-check -- no record of "
            "ever applying. Every row in the Content Gap Roadmap is already marked built "
            "(33/33), so there are currently no new-page gaps on the existing curated keyword "
            "list. Findings written up in docs/content-priority-analysis.md."
        ),
        "priority_score": 56,
        "impact_score": 60,
        "effort": "Medium",
        "target": "scripts/analyze_content_priority.py",
        "dependencies": "docs/broadbandpicker-keyword-mapping.xlsx (existing keyword research)",
        "source": "User request 2026-08-24 — researched before implementing per the Strategic Lens process",
    },
    {
        "item_id": "content-refresh-best-full-fibre-guide",
        "type": "Content",
        "pillar": "Content",
        "title": "Deep rewrite: Best Full Fibre Broadband UK guide (top content-priority-analysis target)",
        "description": (
            "Top-ranked target from scripts/analyze_content_priority.py's first real run: "
            "512 AI-feature impressions in the last 28 days (real GSC data) at only 636 words. "
            "Fully rewritten to 1,596 words, drawing on already-verified provider facts from "
            "the three Awin content batches (BT, EE, Vodafone, Plusnet, Community Fibre, "
            "Hyperoptic, toob, Zen Internet) plus new research for Sky and a genuinely "
            "counter-intuitive finding worth surfacing on its own: every major national "
            "provider has a low Trustpilot score, but Ofcom's Q1 2026 complaints data "
            "separates them clearly (Plusnet best at 4/100k, TalkTalk worst at 10/100k) -- "
            "explained as two measures of different things, not a contradiction. Also "
            "verified and included Vodafone's real 2026 award wins (Expert Reviews Broadband "
            "Awards, Uswitch Most Popular Provider) alongside its poor Ofcom complaints "
            "position, rather than picking one narrative. Caught and fixed a real bug before "
            "shipping: wrote several apostrophes as literal backslash-escapes ( \\' ) copying "
            "the .ts string-literal habit from data/providers.ts into JSX text content, where "
            "they would have rendered as a visible backslash -- fixed to the file's existing "
            "&apos; convention and verified against the live rendered HTML, not just the build "
            "passing, before considering it done."
        ),
        "priority_score": 54,
        "impact_score": 58,
        "effort": "Medium",
        "target": "app/guides/[slug]/page.tsx (best-full-fibre-broadband-uk), data/guides.ts",
        "dependencies": "ops-content-priority-analysis-tooling",
        "source": "User request 2026-08-24 — researched before implementing per the Strategic Lens process",
    },
    {
        "item_id": "content-refresh-cheapest-broadband-guide",
        "type": "Content",
        "pillar": "Content",
        "title": "Deep rewrite: Cheapest Broadband Deals UK guide (2nd content-priority-analysis target)",
        "description": (
            "Second target from scripts/analyze_content_priority.py's ranked list: 130 real "
            "GSC AI-feature impressions at 481 words, and materially stale (last touched "
            "2026-06-01, still citing NOW Broadband at a since-changed £17.99). Rewritten to "
            "1,101 words, drawing on session-verified pricing across 11 providers rather than "
            "fresh research for most of them. Real correction made: NOW Broadband's usable "
            "Full Fibre 75 now starts at £23/mo, not the stale £17.99 the old copy cited -- no "
            "longer reliably the cheapest option, now similar to or pricier than Plusnet "
            "(£21.99) and EE (£22.99). Real new finding: Community Fibre's Essential 35 at "
            "£12.50/mo is the genuinely cheapest full-fibre deal on the market (London/Surrey/"
            "Sussex only). Verified current social tariff pricing (Virgin Media £12.50, BT "
            "Home Essentials £15-20, Sky Broadband Basics £20 existing-customers-only) plus a "
            "real, citable Ofcom stat: ~4.2 million eligible households, only ~532,000 "
            "actually claiming one. Caught the same JSX-vs-.ts apostrophe-escaping bug found "
            "on the previous guide (one instance this time, in the NOW Broadband paragraph) "
            "before shipping -- confirmed via the file's own reviewSources-style checked-date "
            "convention. 1,101 words sits just under this session's own 1,200-word guide "
            "depth floor; left as is rather than padding for its own sake, since the content "
            "is already comprehensive (2 real data tables, 5 FAQs, all newly sourced)."
        ),
        "priority_score": 52,
        "impact_score": 55,
        "effort": "Medium",
        "target": "app/guides/[slug]/page.tsx (cheapest-broadband-uk), data/guides.ts",
        "dependencies": "ops-content-priority-analysis-tooling",
        "source": "User request 2026-08-24 — researched before implementing per the Strategic Lens process",
    },
    {
        "item_id": "content-refresh-best-business-broadband-guide",
        "type": "Content",
        "pillar": "Content",
        "title": "Deep rewrite: Best Business Broadband Providers UK guide (3rd content-priority-analysis target)",
        "description": (
            "Third target from scripts/analyze_content_priority.py's ranked list: 142 real "
            "GSC AI-feature impressions at 596 words. This page lives on a different template "
            "than the [slug]-based guides (app/guides/best-business-broadband-providers-uk/ "
            "is a standalone PrioritySeoPage route backed by data/priority-pages.ts), and had "
            "2 pre-existing em dashes fixed as part of the pass. Rewritten to 1,050 words with "
            "real, specific per-provider data: Vodafone Business has the most competitive "
            "entry-level price (~£20-22/mo excl. VAT), Zen Business leads on satisfaction "
            "(Which? Recommended since 2021, 84% score) -- consistent with, and corroborating, "
            "the consumer Zen Internet findings from the Awin-rejected batch, Virgin Media "
            "Business has the fastest raw speed (442 Mbps average), and a genuinely useful, "
            "specific stat: out-of-contract business customers overpay 24.86% more per month "
            "on average. Added a real contended-vs-uncontended leased-line explainer with "
            "current pricing (from ~£69/mo entry-level). Also fixed a real bug in the analysis "
            "script itself found while validating this page: DATE_RE didn't recognise the "
            "PrioritySeoPage template's 'Last researched and reviewed:' phrasing (colon, "
            "different verb), so every page on that template was incorrectly scored as having "
            "no checked date -- fixed and confirmed it also corrected the score for "
            "/guides/satellite-broadband-uk on the same template."
        ),
        "priority_score": 50,
        "impact_score": 52,
        "effort": "Medium",
        "target": "data/priority-pages.ts (business), scripts/analyze_content_priority.py",
        "dependencies": "ops-content-priority-analysis-tooling",
        "source": "User request 2026-08-24 — researched before implementing per the Strategic Lens process",
    },
    {
        "item_id": "bet-decouple-content-from-code",
        "type": "Bigger bet",
        "pillar": "Content",
        "title": "Decouple guide content from code deploys",
        "description": (
            "Every guide lives as a hand-written object in data/guides.ts plus "
            "matching JSX in app/guides/[slug]/page.tsx. Fine at 30 guides; at 100+ "
            "it becomes the bottleneck. Plan a move to MDX-per-guide or a lightweight "
            "headless CMS before volume forces it."
        ),
        "priority_score": 35,
        "impact_score": 48,
        "effort": "High",
        "target": "data/guides.ts, app/guides/[slug]/page.tsx",
        "dependencies": "None, but easier before the guide count grows further",
        "source": "Growth playbook — Content pillar",
    },
]

PAGE_TYPE_TO_PILLAR = {
    "Guide": "Content",
    "Provider page": "Content",
    "Comparison page": "Content",
    "City hub": "Content",
    "Interactive tool": "Functionality",
    "Research page": "Content",
}


def git(*args: str) -> str:
    try:
        return subprocess.run(
            ["git", *args], cwd=ROOT, capture_output=True, text=True, timeout=15
        ).stdout.strip()
    except Exception:
        return ""


def repo_sync_status() -> str:
    """One global snapshot fact, not a fragile per-row git-blame lookup:
    is the working tree currently dirty in areas that hold page-build content?"""
    watched = (
        "data/guides.ts", "data/provider-comparisons.ts", "data/priority-pages.ts",
        "data/providers.ts", "app/postcode", "app/guides", "app/providers",
    )
    dirty = git("status", "--short", *watched)
    return "Live but not committed to git" if dirty else "Committed"


def load_page_builds(source: Path) -> list[dict[str, Any]]:
    wb = load_workbook(source, data_only=True)
    ws = wb["Content Gap Roadmap"]
    rows = list(ws.iter_rows(values_only=True))
    headers, data_rows = rows[0], rows[1:]
    positions = {name: i for i, name in enumerate(headers)}
    sync = repo_sync_status()

    items: list[dict[str, Any]] = []
    for row in data_rows:
        def get(col: str) -> Any:
            return row[positions[col]] if positions.get(col) is not None else None

        url = get("Recommended URL") or ""
        slug = url.replace("https://broadbandpicker.co.uk/", "")
        status_field = get("Current Status") or ""
        page_type = get("Page Type") or ""
        items.append({
            "item_id": f"page-{slug}",
            "type": "Page",
            "pillar": PAGE_TYPE_TO_PILLAR.get(page_type, "Content"),
            "title": get("Page Title") or slug,
            "description": get("Why This Position") or "",
            "priority_score": get("SEO Build Priority Score") or 0,
            "impact_score": get("Revenue Priority Score") or 0,
            "effort": get("Ranking Difficulty Band") or "",
            "target": url,
            "dependencies": "",
            "source": "docs/broadbandpicker-keyword-mapping.xlsx — Content Gap Roadmap",
            "build_status": status_field,
            "repo_sync": sync if status_field.startswith("Built") else "",
            "cluster": get("Topic Cluster") or "",
            "keywords": get("Primary Keywords") or "",
            "volume": get("Combined Est. Volume") or "",
        })
    return items


def default_status_for(item: dict[str, Any]) -> str:
    build_status = item.get("build_status", "")
    if build_status.startswith("Built"):
        return "Done"
    return item.get("initial_status", DEFAULT_STATUS)


def load_manual_overrides(output: Path) -> dict[str, dict[str, Any]]:
    if not output.exists():
        return {}
    try:
        wb = load_workbook(output, data_only=True)
        ws = wb["Master Tracker"]
    except Exception:
        return {}
    rows = list(ws.iter_rows(values_only=True))
    if not rows:
        return {}
    headers, data_rows = rows[0], rows[1:]
    positions = {name: i for i, name in enumerate(headers)}
    if "Item ID" not in positions:
        return {}
    overrides: dict[str, dict[str, Any]] = {}
    for row in data_rows:
        item_id = row[positions["Item ID"]]
        if not item_id:
            continue
        overrides[item_id] = {
            header: row[positions[header]]
            for header in MANUAL_HEADERS
            if header in positions
        }
    return overrides


def add_sheet(wb: Workbook, name: str, headers: list[str], rows: list[list[Any]]) -> Any:
    ws = wb.create_sheet(name)
    ws.append(headers)
    for row in rows:
        ws.append(row)
    style_sheet(ws)
    if rows and headers:
        import re
        ref = f"A1:{get_column_letter(len(headers))}{len(rows) + 1}"
        table = Table(displayName=re.sub(r"\W+", "", name)[:20] + "Table", ref=ref)
        table.tableStyleInfo = TableStyleInfo(name="TableStyleMedium2", showRowStripes=True)
        ws.add_table(table)
    return ws


def style_sheet(ws: Any) -> None:
    navy, pale = "0F172A", "E2F2F6"
    thin = Side(style="thin", color="D7E1E8")
    ws.freeze_panes = "A2"
    ws.auto_filter.ref = ws.dimensions
    ws.sheet_view.showGridLines = False
    for cell in ws[1]:
        cell.fill = PatternFill("solid", fgColor=navy)
        cell.font = Font(color="FFFFFF", bold=True)
        cell.alignment = Alignment(wrap_text=True, vertical="center")
    ws.row_dimensions[1].height = 34
    for row in ws.iter_rows(min_row=2):
        for cell in row:
            cell.alignment = Alignment(wrap_text=True, vertical="top")
            cell.border = Border(bottom=thin)
    for column in range(1, ws.max_column + 1):
        values = [str(ws.cell(row, column).value or "") for row in range(1, min(ws.max_row, 80) + 1)]
        width = min(50, max(10, max(len(v) for v in values) + 2))
        ws.column_dimensions[get_column_letter(column)].width = width
    for row in range(2, ws.max_row + 1):
        if row % 2 == 0:
            for cell in ws[row]:
                cell.fill = PatternFill("solid", fgColor=pale)


def build_workbook(page_items: list[dict[str, Any]], overrides: dict[str, dict[str, Any]]) -> Workbook:
    all_items = FEATURE_BUILDS + page_items
    for item in all_items:
        manual = overrides.get(item["item_id"], {})
        computed_status = default_status_for(item)
        manual_status = manual.get("Status")
        if item["type"] == "Page":
            # Page status is independently verified by the keyword-mapping
            # pipeline's live crawl (build_status) every run — always trust
            # it fresh. A stale "Not started" written on a page's first
            # appearance in this tracker must never freeze it there once
            # the source data later confirms it shipped.
            item["status"] = computed_status
        elif item.get("verified_status"):
            item["status"] = item["verified_status"]
        else:
            # Feature/audit/bet items have no external verification signal;
            # a hand-set Status ("In progress", "Done", ...) is a genuine
            # manual edit and must survive regeneration.
            item["status"] = manual_status or computed_status
        item["owner"] = manual.get("Owner") or ""
        item["target_date"] = manual.get("Target Date") or ""
        item["notes"] = manual.get("Notes") or item.get("completion_notes", "")
    all_items.sort(key=lambda it: it["priority_score"], reverse=True)

    wb = Workbook()
    wb.remove(wb.active)

    readme = [
        ["Purpose", "One prioritised list of everything still to build for BroadbandPicker.co.uk — new pages and product/UX features together, ranked highest priority first."],
        ["Generated", RUN_DATE],
        ["Sources", "Page builds: docs/broadbandpicker-keyword-mapping.xlsx (Content Gap Roadmap). Feature builds: the growth playbook, scored on the same rough 0-100 scale."],
        ["Scoring", "Page rows use the existing SEO Build Priority Score / Revenue Priority Score from the keyword-mapping pipeline. Feature rows are hand-scored on the same scale — both numbers are directional priority signals, not a single unified formula."],
        ["Status is preserved", "Status, Owner, Target Date and Notes carry forward from the previous docs/master-build-tracker.xlsx on every re-run, matched by Item ID — safe to edit by hand."],
        ["Re-run", "python3 scripts/build_master_tracker.py"],
    ]
    add_sheet(wb, "Read Me", ["Field", "Detail"], readme)

    tracker_headers = [
        "Rank", "Item ID", "Type", "Pillar", "Title", "Priority Score", "Impact Score",
        "Effort", "Status", "Owner", "Target Date", "Notes",
    ]
    tracker_rows = []
    for rank, item in enumerate(all_items, 1):
        tracker_rows.append([
            rank, item["item_id"], item["type"], item["pillar"], item["title"],
            item["priority_score"], item["impact_score"], item["effort"],
            item["status"], item["owner"], item["target_date"], item["notes"],
        ])
    add_sheet(wb, "Master Tracker", tracker_headers, tracker_rows)

    pending_headers = [
        "Pending Rank", "Item ID", "Type", "Pillar", "Title", "Priority Score",
        "Impact Score", "Effort", "Status", "Target", "Dependencies", "Owner",
        "Target Date", "Notes",
    ]
    pending_rows = []
    pending_items = [item for item in all_items if item["status"] != "Done"]
    for rank, item in enumerate(pending_items, 1):
        pending_rows.append([
            rank, item["item_id"], item["type"], item["pillar"], item["title"],
            item["priority_score"], item["impact_score"], item["effort"],
            item["status"], item.get("target", ""), item.get("dependencies", ""),
            item["owner"], item["target_date"], item["notes"],
        ])
    add_sheet(wb, "Pending Build Priority", pending_headers, pending_rows)

    page_headers = [
        "Rank", "Title", "Cluster", "Priority Score", "Revenue Score", "Difficulty Band",
        "Build Status", "Repo Sync", "Status", "Keywords", "Volume/mo", "URL",
    ]
    page_rows = []
    sorted_pages = sorted(page_items, key=lambda it: it["priority_score"], reverse=True)
    for rank, item in enumerate(sorted_pages, 1):
        page_rows.append([
            rank, item["title"], item["cluster"], item["priority_score"], item["impact_score"],
            item["effort"], item["build_status"], item["repo_sync"], item["status"],
            item["keywords"], item["volume"], item["target"],
        ])
    add_sheet(wb, "Page Builds", page_headers, page_rows)

    feature_headers = [
        "Rank", "Type", "Pillar", "Title", "Description", "Priority Score", "Impact Score",
        "Effort", "Target", "Dependencies", "Status", "Source",
    ]
    feature_rows = []
    sorted_features = sorted(FEATURE_BUILDS, key=lambda it: it["priority_score"], reverse=True)
    for rank, item in enumerate(sorted_features, 1):
        feature_rows.append([
            rank, item["type"], item["pillar"], item["title"], item["description"],
            item["priority_score"], item["impact_score"], item["effort"], item["target"],
            item["dependencies"], item.get("status", DEFAULT_STATUS), item["source"],
        ])
    add_sheet(wb, "Feature & Strategy Builds", feature_headers, feature_rows)

    done = sum(1 for it in all_items if it["status"] == "Done")
    methodology = [
        ["Item count", f"{len(all_items)} total ({len(page_items)} page builds, {len(FEATURE_BUILDS)} feature/strategy builds); {done} already marked Done."],
        ["Page priority score", "Existing SEO Build Priority Score from the keyword-mapping pipeline — weighted toward CPC/commercial intent, tuned for affiliate revenue."],
        ["Feature priority score", "Hand-scored 0-100 reflecting the growth playbook's sequencing: infra risk and quick wins first, bigger bets last."],
        ["Repo Sync column", "A single snapshot check of `git status` across the folders that hold page-build content — not a per-row git-blame lookup. 'Live but not committed to git' means production and git have diverged for that batch of pages."],
        ["Pending queue", "Pending Build Priority contains only non-Done items from the combined page, feature, audit and strategy list, ordered by Priority Score."],
        ["Editing this file", "Status/Owner/Target Date/Notes are yours to edit freely — they survive the next `python3 scripts/build_master_tracker.py` run."],
    ]
    add_sheet(wb, "Methodology", ["Aspect", "Detail"], methodology)

    return wb


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--source", type=Path, default=DEFAULT_SOURCE)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    args = parser.parse_args()

    page_items = load_page_builds(args.source)
    overrides = load_manual_overrides(args.output)
    wb = build_workbook(page_items, overrides)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    wb.save(args.output)
    print(f"Saved {args.output.resolve()}")
    print(f"{len(page_items)} page builds + {len(FEATURE_BUILDS)} feature builds = "
          f"{len(page_items) + len(FEATURE_BUILDS)} tracked items")


if __name__ == "__main__":
    main()
