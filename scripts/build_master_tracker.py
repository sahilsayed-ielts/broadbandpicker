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

Both feed into one Master Tracker tab, ranked highest priority first.

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
    return DEFAULT_STATUS


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
        else:
            # Feature/audit/bet items have no external verification signal;
            # a hand-set Status ("In progress", "Done", ...) is a genuine
            # manual edit and must survive regeneration.
            item["status"] = manual_status or computed_status
        item["owner"] = manual.get("Owner") or ""
        item["target_date"] = manual.get("Target Date") or ""
        item["notes"] = manual.get("Notes") or ""
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
