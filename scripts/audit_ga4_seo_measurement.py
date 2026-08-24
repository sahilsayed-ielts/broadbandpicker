#!/usr/bin/env python3
"""Audit BroadbandPicker's GA4 instrumentation and generate an SEO measurement plan.

The audit is intentionally repository-first: it inventories events that are
actually implemented, maps them to the commercial/search journey, and flags
missing measurements. It does not claim that an event is reporting merely
because its name exists in source code. Validate production delivery in GA4
Realtime/DebugView after every analytics release.

Usage:
    python3 scripts/audit_ga4_seo_measurement.py
    python3 scripts/audit_ga4_seo_measurement.py --json docs/audit.json --markdown docs/plan.md
"""

from __future__ import annotations

import argparse
import json
import re
from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_JSON = ROOT / "docs" / "ga4-seo-measurement-audit.json"
DEFAULT_MARKDOWN = ROOT / "docs" / "ga4-seo-strategy-plan.md"
SCAN_ROOTS = (ROOT / "app", ROOT / "components", ROOT / "lib")


@dataclass(frozen=True)
class EventRequirement:
    event: str
    stage: str
    priority: str
    key_event: bool
    recommended_ga4_event: str | None
    question: str


REQUIREMENTS = (
    EventRequirement("page_view", "acquisition", "P0", False, "page_view", "Which organic landing pages attract visits?"),
    EventRequirement("postcode_submit", "intent", "P0", False, "search", "Which landing pages start a local availability journey?"),
    EventRequirement("outbound_provider_click", "commercial", "P0", True, "select_item", "Which organic pages and providers create qualified affiliate exits?"),
    EventRequirement("speed_test_started", "tool engagement", "P1", False, None, "Do organic visitors start the speed-test tool?"),
    EventRequirement("speed_test_completed", "tool engagement", "P1", False, None, "Which landing pages produce completed tests and comparison intent?"),
    EventRequirement("deal_filter_changed", "consideration", "P1", False, None, "Which price, speed and contract constraints matter?"),
    EventRequirement("compare_shortlist_added", "consideration", "P1", False, "select_item", "Which providers enter the final consideration set?"),
    EventRequirement("compare_basket_viewed", "consideration", "P1", False, "view_item_list", "Which visits reach active side-by-side comparison?"),
    EventRequirement("contact_form_submit", "lead", "P1", True, "generate_lead", "Which acquisition sources generate contact enquiries?"),
    EventRequirement("newsletter_signup", "retention", "P1", True, "sign_up", "Which SEO content builds a returning audience?"),
    EventRequirement("content_section_view", "content engagement", "P1", False, None, "Which answer sections are actually reached on long editorial pages?"),
    EventRequirement("faq_expand", "content engagement", "P2", False, "select_content", "Which questions reveal unmet search intent?"),
    EventRequirement("deal_results_empty", "friction", "P1", False, None, "Where do postcode/filter journeys produce no useful result?"),
    EventRequirement("web_vital", "technical SEO", "P1", False, None, "Which templates have poor LCP, INP or CLS for real users?"),
)

CUSTOM_DIMENSIONS = (
    ("content_type", "event", "Low-cardinality template family: guide, provider, comparison, local, tool or deal."),
    ("provider_slug", "event", "Provider involved in shortlist and affiliate interactions."),
    ("postcode_area", "event", "Outward postcode area only; never collect a full postcode."),
    ("speed_band", "event", "Result band rather than raw speed for segmentation."),
    ("filter_name", "event", "Deal constraint changed by the visitor."),
    ("filter_value", "event", "Selected low-cardinality filter value."),
    ("link_label", "event", "CTA wording used for the affiliate exit."),
    ("outbound_host", "event", "Affiliate/provider destination host."),
    ("section_id", "event", "Stable editorial section identifier, not visible copy."),
)

CUSTOM_METRICS = (
    ("download_mbps", "Average speed-test download result; also report by speed_band."),
    ("upload_mbps", "Average speed-test upload result."),
    ("ping_ms", "Average speed-test latency."),
    ("visible_deals", "Deal inventory remaining after filtering."),
    ("metric_value", "Numeric Web Vital value, analysed with metric_name."),
)

SEO_SCORECARD = (
    ("Search demand", "GSC impressions, clicks, CTR and average position", "Query + canonical landing page", "28 days vs previous 28 days"),
    ("Landing quality", "Organic sessions, engaged sessions, engagement rate and average engagement time", "Landing page + device", "Weekly"),
    ("Intent activation", "postcode_submit users / organic landing sessions", "Landing page + content_type", "Weekly"),
    ("Comparison activation", "filter, shortlist or comparison users / organic landing sessions", "Landing page", "Weekly"),
    ("Affiliate CTR", "outbound_provider_click users / organic landing sessions", "Landing page + provider_slug", "Weekly"),
    ("Tool completion", "speed_test_completed users / speed_test_started users", "Device + browser", "Weekly"),
    ("Content depth", "90% scroll users and content_section_view reach", "Landing page + section_id", "Monthly after enough volume"),
    ("SEO conversion", "Key-event users / organic landing sessions", "Landing page + session source/medium", "28 days vs previous 28 days"),
    ("Technical experience", "LCP p75, INP p75, CLS p75 and error rate", "content_type + device", "Weekly"),
)


def source_files() -> list[Path]:
    return sorted(path for root in SCAN_ROOTS for path in root.rglob("*") if path.suffix in {".ts", ".tsx"})


def inventory_events() -> dict[str, list[str]]:
    inventory: dict[str, set[str]] = {}
    patterns = (
        re.compile(r"trackEvent\(\s*['\"]([a-zA-Z0-9_]+)['\"]"),
        re.compile(r"gtag\(\s*['\"]event['\"]\s*,\s*['\"]([a-zA-Z0-9_]+)['\"]"),
    )
    for path in source_files():
        text = path.read_text(encoding="utf-8")
        for pattern in patterns:
            for match in pattern.finditer(text):
                event = match.group(1)
                inventory.setdefault(event, set()).add(str(path.relative_to(ROOT)))
        # The ternary event in ComparisonTable cannot be captured as a literal call.
        if "compare_shortlist_removed" in text and "compare_shortlist_added" in text:
            inventory.setdefault("compare_shortlist_added", set()).add(str(path.relative_to(ROOT)))
            inventory.setdefault("compare_shortlist_removed", set()).add(str(path.relative_to(ROOT)))
    return {event: sorted(paths) for event, paths in sorted(inventory.items())}


def build_payload() -> dict[str, object]:
    inventory = inventory_events()
    requirements = []
    for item in REQUIREMENTS:
        row = asdict(item)
        row["implemented"] = item.event in inventory
        row["source_files"] = inventory.get(item.event, [])
        requirements.append(row)

    implemented_required = sum(bool(row["implemented"]) for row in requirements)
    p0_missing = [row["event"] for row in requirements if row["priority"] == "P0" and not row["implemented"]]
    p1_missing = [row["event"] for row in requirements if row["priority"] == "P1" and not row["implemented"]]
    return {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "scope": "Repository instrumentation audit plus GA4/GSC SEO measurement design; not a GA4 reporting-data export.",
        "summary": {
            "events_found": len(inventory),
            "required_events_implemented": implemented_required,
            "required_events_total": len(requirements),
            "coverage_percent": round(implemented_required / len(requirements) * 100, 1),
            "p0_missing": p0_missing,
            "p1_missing": p1_missing,
        },
        "event_inventory": inventory,
        "requirements": requirements,
        "custom_dimensions": [dict(name=name, scope=scope, purpose=purpose) for name, scope, purpose in CUSTOM_DIMENSIONS],
        "custom_metrics": [dict(name=name, purpose=purpose) for name, purpose in CUSTOM_METRICS],
        "seo_scorecard": [dict(area=area, metrics=metrics, breakdown=breakdown, cadence=cadence) for area, metrics, breakdown, cadence in SEO_SCORECARD],
        "guardrails": [
            "Never send full postcodes, names, email addresses, phone numbers or query strings containing personal data to GA4.",
            "Mark commercial outcomes as key events; do not mark every engagement event as a key event.",
            "Avoid registering journey_id, full URLs with query strings or free-text values as custom dimensions because of high cardinality.",
            "Use GSC for rankings, queries, impressions and CTR; use GA4 for onsite behaviour and key events. Join at canonical landing-page level.",
            "Use at least 28 days of data for SEO prioritisation unless diagnosing a release regression.",
        ],
    }


def render_markdown(payload: dict[str, object]) -> str:
    summary = payload["summary"]
    requirements = payload["requirements"]
    lines = [
        "# BroadbandPicker GA4 SEO measurement strategy",
        "",
        f"Generated: {payload['generated_at']}",
        "",
        "## Audit outcome",
        "",
        f"The repository contains **{summary['events_found']} distinct analytics events** and covers "
        f"**{summary['coverage_percent']}%** of the proposed SEO/commercial measurement contract. "
        "Code presence is not proof of reporting: production events must also be checked in Realtime and DebugView.",
        "",
        "## Event coverage and priorities",
        "",
        "| Priority | Journey stage | Event | Status | GA4 alignment | Decision supported |",
        "| --- | --- | --- | --- | --- | --- |",
    ]
    for row in requirements:
        status = "Implemented" if row["implemented"] else "Missing"
        alignment = row["recommended_ga4_event"] or "Custom event"
        lines.append(f"| {row['priority']} | {row['stage']} | `{row['event']}` | {status} | `{alignment}` | {row['question']} |")

    lines += [
        "",
        "## Metrics that should drive SEO decisions",
        "",
        "| Area | Metrics | Break down by | Cadence |",
        "| --- | --- | --- | --- |",
    ]
    for row in payload["seo_scorecard"]:
        lines.append(f"| {row['area']} | {row['metrics']} | {row['breakdown']} | {row['cadence']} |")

    lines += [
        "",
        "## Recommended GA4 administration",
        "",
        "### Key events",
        "",
        "Mark `outbound_provider_click`, `contact_form_submit` and the future `newsletter_signup` as key events. "
        "Treat postcode submissions, filters, scrolls and tool starts as diagnostic micro-events so the key-event rate remains commercially meaningful.",
        "",
        "### Event-scoped custom dimensions",
        "",
        "| Parameter | Purpose |",
        "| --- | --- |",
    ]
    for row in payload["custom_dimensions"]:
        lines.append(f"| `{row['name']}` | {row['purpose']} |")
    lines += ["", "### Custom metrics", "", "| Parameter | Purpose |", "| --- | --- |"]
    for row in payload["custom_metrics"]:
        lines.append(f"| `{row['name']}` | {row['purpose']} |")

    lines += [
        "",
        "## Weekly GSC + GA4 decision loop",
        "",
        "1. Export 28 days of GSC URL/query data and compare it with the preceding 28 days.",
        "2. Group canonical landing pages into guide, provider, comparison, local, tool and deal templates.",
        "3. Join GSC and GA4 at canonical landing-page level. Do not attempt a user-level join.",
        "4. Prioritise high-impression pages with weak CTR for title/snippet work; high-click pages with weak engagement for intent/content work; and engaged pages with weak affiliate CTR for UX, offer or CTA work.",
        "5. Protect winners: pages with growing non-brand clicks and strong key-event rates should receive freshness, internal links and supporting-cluster content before speculative new topics.",
        "6. Record the hypothesis, change date and expected KPI in the master tracker, then review after a full 28-day window.",
        "",
        "## Interpretation rules",
        "",
        "- Average position is directional, not a single fixed rank. Segment by query, page, country and device before acting.",
        "- Engagement rate alone is not a quality verdict. A visitor can get a concise answer and leave satisfied, so pair engagement with scroll/section reach and commercial intent events.",
        "- Affiliate clicks are a qualified-exit proxy, not confirmed revenue. Reconcile them with Awin transaction reporting where possible.",
        "- Compare users as well as event counts so repeated filter clicks do not inflate perceived demand.",
        "- Preserve privacy: only outward postcode areas are suitable for analytics segmentation.",
        "",
        "## Measurement guardrails",
        "",
    ]
    lines.extend(f"- {guardrail}" for guardrail in payload["guardrails"])
    lines.append("")
    return "\n".join(lines)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--json", type=Path, default=DEFAULT_JSON)
    parser.add_argument("--markdown", type=Path, default=DEFAULT_MARKDOWN)
    args = parser.parse_args()

    payload = build_payload()
    args.json.parent.mkdir(parents=True, exist_ok=True)
    args.markdown.parent.mkdir(parents=True, exist_ok=True)
    args.json.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
    args.markdown.write_text(render_markdown(payload), encoding="utf-8")
    print(json.dumps(payload["summary"], indent=2))
    print(f"Saved {args.json.resolve()}")
    print(f"Saved {args.markdown.resolve()}")


if __name__ == "__main__":
    main()
