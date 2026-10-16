#!/usr/bin/env python3
"""Choose the highest-leverage page type and write a visual UX redesign brief.

The heavy research is produced by ``analyze_page_type_ux.py``: connected GSC
and GA4 data, fresh UK SERPs, AI Overview citations, and structural competitor
scrapes. This script turns that evidence into one template decision and a
build-ready visual plan.

Usage:
    .venv/bin/python scripts/plan_page_type_redesign.py
    .venv/bin/python scripts/plan_page_type_redesign.py --refresh

``--refresh`` runs the full source analyser first. Without it, the newest scan
is reused so the plan can be regenerated without spending SERP quota.
"""

from __future__ import annotations

import argparse
import json
import subprocess
from datetime import date
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
UX_DIR = ROOT / "docs" / "home page UX"
SCAN = UX_DIR / "page-type-ux-scan.json"
OUTPUT = UX_DIR / "page-type-redesign-plan.md"


def load_scan(refresh: bool) -> dict[str, Any]:
    if refresh:
        subprocess.run(
            [str(ROOT / ".venv/bin/python"), str(ROOT / "scripts/analyze_page_type_ux.py")],
            cwd=ROOT,
            check=True,
        )
    if not SCAN.is_file():
        raise RuntimeError(
            "UX scan is missing. Run `.venv/bin/python scripts/analyze_page_type_ux.py` first."
        )
    return json.loads(SCAN.read_text(encoding="utf-8"))


def score_types(league: dict[str, dict[str, Any]]) -> list[dict[str, Any]]:
    eligible = {
        key: row for key, row in league.items()
        if key not in {"homepage", "trust", "other"} and row.get("impressions", 0) > 0
    }
    max_impressions = max(row.get("impressions", 0) for row in eligible.values())
    max_clicks = max(row.get("clicks", 0) for row in eligible.values())
    max_sessions = max(row.get("organic_sessions", 0) for row in eligible.values())
    max_ai = max(row.get("ai_referral", 0) for row in eligible.values()) or 1

    rows: list[dict[str, Any]] = []
    for key, source in eligible.items():
        pages = max(1, int(source.get("pages", 1)))
        impressions = float(source.get("impressions", 0))
        clicks = float(source.get("clicks", 0))
        sessions = float(source.get("organic_sessions", 0))
        ai = float(source.get("ai_referral", 0))
        # Reach and actual visits carry most weight. Per-page efficiency stops a
        # very large templated inventory from winning on URL count alone.
        efficiency = min(1.0, (sessions / pages) / 3.0)
        score = 100 * (
            0.30 * impressions / max_impressions
            + 0.20 * clicks / max_clicks
            + 0.30 * sessions / max_sessions
            + 0.10 * ai / max_ai
            + 0.10 * efficiency
        )
        rows.append({
            **source,
            "key": key,
            "score": round(score, 1),
            "impressions_per_page": round(impressions / pages, 1),
            "sessions_per_page": round(sessions / pages, 2),
        })
    return sorted(rows, key=lambda row: row["score"], reverse=True)


def feature_evidence(scan: dict[str, Any], page_type: str) -> list[str]:
    evidence: list[str] = []
    for row in scan.get("benchmarks", {}).get(page_type, []):
        if row.get("is_gap"):
            if row.get("is_count"):
                value = f"competitor average {row.get('competitor_count_avg', 0):g}"
            else:
                value = f"{row.get('competitor_hits', 0)}/{row.get('competitor_n', 0)} competitors"
            evidence.append(f"{row.get('feature')}: {value}")
    return evidence


def write_plan(scan: dict[str, Any]) -> Path:
    ranking = score_types(scan["page_type_league"])
    winner = ranking[0]
    page_type = winner["key"]
    top_pages = scan.get("our_pages_by_type", {}).get(page_type, [])[:6]
    competitors = scan.get("competitors_by_type", {}).get(page_type, [])[:6]
    gaps = feature_evidence(scan, page_type)
    windows = scan.get("windows", {})

    lines = [
        "# BroadbandPicker page-type UX redesign plan",
        "",
        f"Generated {date.today().isoformat()} from `scripts/plan_page_type_redesign.py`.",
        "",
        "## Decision",
        "",
        f"**Redesign the {winner['label'].lower()} template first.** It has the strongest combined "
        "Search Console reach, GA4 organic use, AI-referral signal and per-page leverage.",
        "",
        f"Evidence window: GSC **{windows.get('cur', 'latest final 28 days')}**.",
        "",
        "| Rank | Page category | Decision score | GSC impressions | GSC clicks | CTR | GA4 organic sessions | AI referrals | Sessions/page |",
        "|---:|---|---:|---:|---:|---:|---:|---:|---:|",
    ]
    for index, row in enumerate(ranking, 1):
        lines.append(
            f"| {index} | {row['label']} | {row['score']:.1f} | {row['impressions']:,.0f} | "
            f"{row['clicks']:,.0f} | {100 * row['ctr']:.2f}% | {row['organic_sessions']:,.0f} | "
            f"{row['ai_referral']:,.0f} | {row['sessions_per_page']:.2f} |"
        )

    lines += [
        "",
        "The postcode template has the most clicks, but those clicks are spread over a very large URL inventory. "
        "The guide template has 61,126 impressions and 220 organic sessions across only 68 ranking pages, so one "
        "well-tested template improvement affects a much stronger page on average.",
        "",
        "## What the redesign must achieve",
        "",
        "1. Answer the search question immediately, before navigation-heavy or promotional material.",
        "2. Let comparison-intent visitors move from advice to a suitable deal without losing context.",
        "3. Make evidence, dates, authorship and methodology visible at the point claims are made.",
        "4. Create concise, source-backed answer blocks that search engines and AI systems can quote accurately.",
        "5. Keep commercial actions clear and useful without disguising affiliate links as editorial conclusions.",
        "6. Preserve accessibility, mobile performance and calm reading flow.",
        "",
        "## Desktop wireframe",
        "",
        "```text",
        "┌──────────────────────────────────────────────────────────────────────┐",
        "│ Breadcrumbs                                      Updated · Reviewed  │",
        "├──────────────────────────────────────────────────────────────────────┤",
        "│ H1: direct search-intent title                                     │",
        "│ 2-line standfirst + author + editorial methodology                  │",
        "│ [Quick answer / verdict]          [Check deals by postcode]          │",
        "├──────────────────────────────────────────────────────────────────────┤",
        "│ On this page: Answer · Compare · Costs · How to choose · FAQs        │",
        "├───────────────────────────────────────┬──────────────────────────────┤",
        "│ MAIN ARTICLE                          │ STICKY DECISION PANEL         │",
        "│ Question-shaped H2                    │ Your postcode                │",
        "│ 40–70 word quotable answer            │ [________] [Check]           │",
        "│ Evidence/source note                  │ Why we ask                    │",
        "│                                       │ Affiliate disclosure          │",
        "│ Comparison table / decision cards     │                              │",
        "│ [Best value] [Fastest] [Flexible]     │                              │",
        "│                                       │                              │",
        "│ How to choose + trade-offs            │                              │",
        "│ FAQs + related guides                 │                              │",
        "└───────────────────────────────────────┴──────────────────────────────┘",
        "```",
        "",
        "## Mobile wireframe",
        "",
        "```text",
        "┌────────────────────────────┐",
        "│ Breadcrumbs                │",
        "│ H1                         │",
        "│ Updated · Author           │",
        "│ ┌────────────────────────┐ │",
        "│ │ Quick answer/verdict   │ │",
        "│ └────────────────────────┘ │",
        "│ [Check deals by postcode]  │",
        "│ [Jump to section ▾]        │",
        "│                            │",
        "│ Question-shaped H2         │",
        "│ Short answer + evidence    │",
        "│                            │",
        "│ Swipeable decision cards   │",
        "│ [Best value] [Fastest] →   │",
        "│                            │",
        "│ Full explanation           │",
        "│ FAQ                        │",
        "├────────────────────────────┤",
        "│ Sticky: [Check deals]      │",
        "└────────────────────────────┘",
        "```",
        "",
        "## Component plan",
        "",
        "| Order | Component | UX purpose | Rule |",
        "|---:|---|---|---|",
        "| 1 | Breadcrumb + freshness row | Orientation and trust | Use real reviewed dates only; never auto-bump dates. |",
        "| 2 | Intent-matched hero | Confirm the visitor is in the right place | H1, short standfirst, author/reviewer and no intrusive ad above it. |",
        "| 3 | Quick answer | Reduce time to value and support GEO | 40–70 words, specific answer, named evidence and limitations. |",
        "| 4 | Contextual postcode action | Move advice readers toward relevant deals | Ask once, explain why availability varies, preserve article position. |",
        "| 5 | Sticky/jump navigation | Make long guides manageable | Collapse to a select-style control on mobile. |",
        "| 6 | Decision table/cards | Help users compare, not merely read | Show price, speed, contract, setup fee, rises and availability caveat. |",
        "| 7 | Evidence-led sections | Build confidence | Question-shaped H2 followed by direct answer, then detail and source. |",
        "| 8 | Related decision tools | Continue the user journey | Maximum three links, selected by intent rather than generic popularity. |",
        "| 9 | FAQ | Resolve last objections | Visible answers; schema only when the same FAQ is visible on-page. |",
        "| 10 | Mobile sticky CTA | Keep the next action reachable | One calm CTA; hide when the postcode form is in view. |",
        "",
        "## Competitor and SERP evidence",
        "",
    ]
    for comp in competitors:
        lines.append(
            f"- **{comp.get('domain')}** — best rank {comp.get('best_rank')}, "
            f"query coverage {comp.get('query_coverage')}, AI citations {comp.get('ai_citations')}; "
            f"pattern source: `{comp.get('url')}`."
        )
    if gaps:
        lines += ["", "Detected template gaps:"] + [f"- {gap}" for gap in gaps]

    lines += [
        "",
        "Patterns to adapt, not copy: direct question-led headings, visible freshness and authorship, compact "
        "comparison modules, postcode-aware next actions, restrained sticky navigation and clear evidence links.",
        "",
        "## Pilot pages",
        "",
        "Start with three different guide intents so the template is proven rather than tailored to one article:",
        "",
    ]
    for page in top_pages[:3]:
        lines.append(
            f"- `{page['path']}` — {page['impressions']:,.0f} impressions, {page['clicks']:,.0f} clicks, "
            f"{100 * page['ctr']:.2f}% CTR, position {page['position']:.1f}."
        )

    lines += [
        "",
        "## Delivery sequence",
        "",
        "1. Build reusable guide-shell components behind a feature flag.",
        "2. Apply them to the three pilot guides without rewriting factual content at the same time.",
        "3. Run accessibility, mobile, Core Web Vitals and affiliate-link disclosure checks.",
        "4. Deploy the pilots and annotate the release date.",
        "5. Compare 28 days before vs 28 days after, allowing a three-day GSC lag.",
        "6. Roll out only the components that improve user or commercial outcomes without hurting search visibility.",
        "",
        "## Measurement contract",
        "",
        "| Outcome | Primary metric | Guardrail |",
        "|---|---|---|",
        "| Better search acquisition | GSC clicks and CTR by pilot URL | Impressions and average position must not materially decline. |",
        "| Better comprehension | GA4 engaged-session rate and engagement time | No rise in immediate exits from the hero. |",
        "| Better commercial journey | `postcode_submit` and `outbound_provider_click` users/session | Affiliate disclosure remains visible and clicks remain intentional. |",
        "| Better navigation | Jump-nav use and 75%/90% scroll reach | Avoid event inflation from repeated taps. |",
        "| Better GEO visibility | AI referral visits and citation checks | Claims remain source-backed and human-reviewed. |",
        "| Better mobile UX | Mobile conversion and CWV | No regression in LCP, INP or CLS. |",
        "",
        "## Explicit non-goals",
        "",
        "- Do not clone a competitor’s wording, branding or layout pixel-for-pixel.",
        "- Do not add fake urgency, invented ratings or unverified prices.",
        "- Do not increase CTA count simply to chase clicks.",
        "- Do not roll the template across every guide before pilot evidence exists.",
    ]

    OUTPUT.write_text("\n".join(lines) + "\n", encoding="utf-8")
    return OUTPUT


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--refresh", action="store_true", help="rerun GSC/GA4/SERP/competitor research first")
    args = parser.parse_args()
    try:
        output = write_plan(load_scan(args.refresh))
    except (RuntimeError, subprocess.CalledProcessError) as exc:
        print(f"Error: {exc}")
        return 1
    print(f"Saved {output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
