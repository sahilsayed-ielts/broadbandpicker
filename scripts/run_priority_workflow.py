#!/usr/bin/env python3
"""Refresh SEO evidence, choose one canonical next priority, and optionally build it.

The component scripts remain independently runnable. This orchestrator fixes the
handoff between them so "what is next?" always means the same evidence-backed URL.

Usage:
    python3 scripts/run_priority_workflow.py
    python3 scripts/run_priority_workflow.py --fresh-serp
    python3 scripts/run_priority_workflow.py --build
    python3 scripts/run_priority_workflow.py --skip-refresh
"""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
from datetime import date, datetime, timezone
from pathlib import Path
from typing import Any
from urllib.parse import urlparse

from openpyxl import load_workbook

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs"
WEEKLY = DOCS / "weekly-seo-intelligence.json"
CONTENT = DOCS / "content-priority-analysis.json"
UX_SCAN = DOCS / "home page UX" / "page-type-ux-scan.json"
TRACKER = DOCS / "master-build-tracker.xlsx"
MEASUREMENT_LOG = DOCS / "page-build-pipeline" / "content-change-measurement-log.json"
OUTPUT_JSON = DOCS / "page-build-pipeline" / "canonical-next-priority.json"
OUTPUT_MD = DOCS / "page-build-pipeline" / "canonical-next-priority.md"
MAPPING_SHEET_ID = "1Ke0YWo5T-45JRpuXpfqL_0vwmcBbS0i06Da47quRRH0"
COOLDOWN_DAYS = 28
MAX_PRIMARY_POSITION = 30.0


def run_stage(command: list[str]) -> None:
    print(f"\n▶ {' '.join(command)}")
    subprocess.run(command, cwd=ROOT, check=True)


def load_json(path: Path, default: Any) -> Any:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (FileNotFoundError, json.JSONDecodeError, OSError):
        return default


def canonical_path(value: str) -> str:
    if value.startswith("http"):
        return urlparse(value).path.rstrip("/") or "/"
    return "/" + value.strip("/") if value != "/" else "/"


def page_type(path: str) -> str:
    if path == "/":
        return "homepage"
    if path == "/deals" or path.startswith("/deals/"):
        return "deals_hub"
    if path.startswith("/postcode/"):
        return "postcode"
    if path.startswith("/providers/compare/"):
        return "provider_vs"
    if path.startswith("/providers/") and path.endswith("/deals"):
        return "provider_deals"
    if path.startswith("/providers/"):
        return "provider_review"
    if path.startswith("/research/"):
        return "research"
    if path == "/tools" or path.startswith("/tools/"):
        return "tool"
    if path in ("/compare", "/providers"):
        return "compare"
    if path in (
        "/about", "/how-we-make-money", "/how-we-review-broadband",
        "/editorial-policy", "/contact", "/privacy-policy", "/terms",
        "/cookie-policy",
    ):
        return "trust"
    return "guide" if path.startswith("/guides/") else "other"


def recent_changes() -> dict[str, date]:
    changes = load_json(MEASUREMENT_LOG, {}).get("changes", [])
    result: dict[str, date] = {}
    for change in changes:
        raw = change.get("change_date") or change.get("recorded_at") or change.get("created_at")
        if not raw:
            continue
        try:
            result[canonical_path(change.get("url", ""))] = date.fromisoformat(str(raw)[:10])
        except ValueError:
            continue
    return result


def tracker_page_candidates() -> list[dict[str, Any]]:
    if not TRACKER.exists():
        return []
    wb = load_workbook(TRACKER, read_only=True, data_only=True)
    if "Pending Build Priority" not in wb.sheetnames:
        return []
    rows = list(wb["Pending Build Priority"].iter_rows(values_only=True))
    if not rows:
        return []
    pos = {str(value): index for index, value in enumerate(rows[0])}
    candidates = []
    for row in rows[1:]:
        target = str(row[pos.get("Target", 9)] or "")
        if row[pos.get("Type", 2)] != "Page" or not target.startswith("http"):
            continue
        candidates.append({
            "path": canonical_path(target),
            "title": str(row[pos.get("Title", 4)] or target),
            "score": float(row[pos.get("Priority Score", 5)] or 0),
            "source": "Master tracker pending page",
            "source_rank": 4,
            "reason": "Highest remaining researched page-build priority in the master tracker.",
        })
    return candidates


def gather_candidates() -> list[dict[str, Any]]:
    candidates: list[dict[str, Any]] = []
    weekly = load_json(WEEKLY, {})
    for item in weekly.get("opportunities", []):
        if not item.get("priority_eligible") or item.get("category") == "Monitor":
            continue
        position = float(item.get("position") or 0)
        # The next-build queue is meant to produce a near-term ranking and CTR
        # gain. A high-impression page below the top 30 can still be a valuable
        # strategic project, but it is not as easy to rank as an existing page
        # already close to page one. Keep those deeper pages in the analytics
        # report instead of letting raw impression volume dominate this queue.
        if position <= 0 or position > MAX_PRIMARY_POSITION:
            continue
        candidates.append({
            "path": canonical_path(item["page"]), "title": item["page"],
            "score": float(item.get("score", 0)), "source": "Weekly GSC/GA4 intelligence",
            "source_rank": 1,
            "reason": item.get("recommended_action") or item.get("category", "Evidence-led SEO opportunity"),
            "metrics": {key: item.get(key) for key in ("clicks", "impressions", "ctr", "position", "sessions", "ai_referral_visits")},
            "top_queries": item.get("top_queries", []),
        })

    content = load_json(CONTENT, {})
    for item in content.get("top_refresh_candidates", []):
        candidates.append({
            "path": canonical_path(item["path"]), "title": item["path"],
            "score": float(item.get("refresh_score", 0)), "source": "Live content-depth/GEO audit",
            "source_rank": 2,
            "reason": "; ".join(item.get("missing_geo_signals", [])) or "Audited refresh opportunity",
            "metrics": {key: item.get(key) for key in ("word_count", "mapped_volume", "ai_feature_impressions", "checked_date")},
        })
    for item in content.get("top_new_build_gaps", []):
        target = item.get("url") or item.get("target_url") or ""
        if not target:
            continue
        candidates.append({
            "path": canonical_path(target), "title": item.get("title") or target,
            "score": float(item.get("seo_priority_score", 0) or 0), "source": "Keyword-mapped new-page gap",
            "source_rank": 3, "reason": "Highest-scoring researched content gap not confirmed live.",
            "metrics": {"monthly_volume": item.get("volume")},
        })
    candidates.extend(tracker_page_candidates())
    return candidates


def ux_requirements(path: str) -> list[dict[str, str]]:
    kind = page_type(path)
    scan = load_json(UX_SCAN, {})
    requirements = []
    for item in scan.get("recommendations", []):
        if item.get("page_type") != kind:
            continue
        requirements.append({
            "priority": item.get("priority", ""),
            "feature": item.get("feature", ""),
            "evidence": " ".join(filter(None, [item.get("evidence", ""), item.get("gsc", "")])),
        })
    return sorted(requirements, key=lambda row: ({"P0": 0, "P1": 1, "P2": 2}.get(row["priority"], 9), row["feature"]))


def select_next() -> dict[str, Any]:
    recent = recent_changes()
    today = date.today()
    unique: dict[str, dict[str, Any]] = {}
    suppressed: list[dict[str, Any]] = []
    for candidate in gather_candidates():
        path = candidate["path"]
        changed = recent.get(path)
        if changed and (today - changed).days < COOLDOWN_DAYS:
            suppressed.append({**candidate, "suppression_reason": f"Updated {changed}; inside {COOLDOWN_DAYS}-day measurement window"})
            continue
        existing = unique.get(path)
        if existing is None or (candidate["source_rank"], -candidate["score"]) < (existing["source_rank"], -existing["score"]):
            unique[path] = candidate
    ordered = sorted(unique.values(), key=lambda row: (row["source_rank"], -row["score"], row["path"]))
    if not ordered:
        raise RuntimeError("No buildable page priority remains after freshness suppression")
    winner = ordered[0]
    winner["url"] = f"https://broadbandpicker.co.uk{winner['path'] if winner['path'] != '/' else ''}"
    winner["page_type"] = page_type(winner["path"])
    winner["ux_geo_requirements"] = ux_requirements(winner["path"])
    return {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "selection_policy": [
            f"Eligible GSC/GA4 opportunities with measurable demand, average position 1-{MAX_PRIMARY_POSITION:g}, and no current-pipeline suppression",
            "High-impression pages ranking below position 30 stay in the strategic analytics queue but cannot displace a nearer-term rankable opportunity",
            "Live content-depth and GEO audit refresh candidates",
            "Keyword-mapped new-page gaps",
            "Remaining master-tracker page builds",
            f"Pages released in the last {COOLDOWN_DAYS} days are held for measurement before another rewrite",
            "Page-type UX/GEO findings become mandatory build requirements, not a separate competing queue",
        ],
        "next_priority": winner,
        "shortlist": ordered[:10],
        "recently_updated_suppressed": suppressed,
    }


def write_decision(payload: dict[str, Any]) -> None:
    OUTPUT_JSON.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_JSON.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    item = payload["next_priority"]
    requirements = "\n".join(
        f"- **{row['priority']} · {row['feature']}**: {row['evidence']}"
        for row in item["ux_geo_requirements"]
    ) or "- No additional page-type gap was detected in the latest UX/GEO scan."
    OUTPUT_MD.write_text(
        f"# Canonical next priority\n\nGenerated {payload['generated_at']}.\n\n"
        f"## {item['title']}\n\n- URL: `{item['url']}`\n- Source: {item['source']}\n"
        f"- Evidence score: {item['score']}\n- Reason: {item['reason']}\n- Page type: {item['page_type']}\n\n"
        f"## Mandatory UX/GEO requirements\n\n{requirements}\n\n"
        "## Workflow\n\n1. Refresh page-type SERP/UX/GEO evidence.\n2. Refresh weekly GSC and GA4 evidence.\n"
        "3. Audit existing content against new-page gaps.\n4. Rebuild the master tracker.\n"
        "5. Select this one canonical URL with the freshness cooldown applied.\n"
        "6. Pass the URL and its UX/GEO requirements into the page-building pipeline.\n"
        "7. Validate, deploy, update trackers, annotate GA4 and record the GSC baseline.\n",
        encoding="utf-8",
    )


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--fresh-serp", action="store_true", help="Spend SerpApi searches; default reuses the newest cache")
    parser.add_argument("--serp-limit", type=int, default=36)
    parser.add_argument("--skip-refresh", action="store_true", help="Choose from existing outputs without network analysis")
    parser.add_argument("--build", action="store_true", help="Build, validate, deploy and track the selected URL")
    args = parser.parse_args()

    if not args.skip_refresh:
        ux_command = [sys.executable, "scripts/analyze_page_type_ux.py"]
        ux_command += ["--serp-limit", str(args.serp_limit)] if args.fresh_serp else ["--no-serp"]
        run_stage(ux_command)
        run_stage([sys.executable, "scripts/generate_weekly_seo_intelligence.py"])
        run_stage([sys.executable, "scripts/analyze_content_priority.py", "--top", "30"])

    payload = select_next()
    write_decision(payload)
    if not args.skip_refresh:
        # Build the workbook after writing the decision so the master tracker
        # can expose the exact same canonical priority and shortlist.
        run_stage([sys.executable, "scripts/build_master_tracker.py"])
    item = payload["next_priority"]
    print(f"\nNEXT PRIORITY: {item['title']}")
    print(f"URL: {item['url']}")
    print(f"Selected by: {item['source']} (score {item['score']})")
    print(f"Decision packet: {OUTPUT_MD}")

    if args.build:
        run_stage([
            sys.executable, "scripts/build_keyword_mapping.py", "--skip-source-sheet",
            "--build-page-url", item["url"], "--deploy-production", "--approve-factual-review",
            "--update-google-sheet-id", MAPPING_SHEET_ID,
        ])
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
