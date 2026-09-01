#!/usr/bin/env python3
"""Research what UK broadband queries/prompts actually surface in Google's
organic results, AI Overview, and People Also Ask -- and whether
BroadbandPicker shows up at all -- to find concrete SEO/GEO content
opportunities (new pages, page updates, interactive tools).

Uses the SerpApi Google engine (SERPAPI_API_KEY in .env.local). This is a
paid-quota API (check your plan at https://serpapi.com/manage-api-key) --
this script prints remaining quota before and after every run and supports
--limit to cap spend. Do not run it in a loop without a limit.

Usage:
    python3 scripts/analyze_serp_geo_opportunities.py --run
    python3 scripts/analyze_serp_geo_opportunities.py --run --limit 10
    python3 scripts/analyze_serp_geo_opportunities.py --report-only docs/geo-serp-research/2026-09-01-raw.json
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import requests

ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "docs" / "geo-serp-research"

# Curated, diverse UK broadband query set -- covers commercial comparison
# intent, switching/rights, technical explainers, affordability, and the
# more conversational phrasing people actually type into ChatGPT/AI
# Overviews rather than classic short-tail keywords. Grouped by cluster so
# findings can be attributed to a content area, not just a raw list.
SEED_QUERIES: list[tuple[str, str]] = [
    # Commercial comparison
    ("cheap broadband deals UK", "deals"),
    ("best broadband provider UK 2026", "deals"),
    ("fastest broadband UK", "deals"),
    ("best broadband for gaming UK", "best-for"),
    ("best broadband for streaming UK", "best-for"),
    ("best broadband for working from home", "best-for"),
    ("best broadband for large family", "best-for"),
    ("broadband deals with no price rise", "deals"),
    ("broadband with no setup fee", "deals"),
    ("cheapest full fibre broadband UK", "deals"),
    # Switching / rights
    ("how to switch broadband provider UK", "switching"),
    ("what happens when my broadband contract ends", "switching"),
    ("broadband price rise complaint", "switching"),
    ("can I leave broadband contract early", "switching"),
    ("one touch switch broadband explained", "switching"),
    # Technical / explainer
    ("is wifi 7 worth it", "technical"),
    ("what is full fibre broadband FTTP", "technical"),
    ("FTTC vs FTTP difference", "technical"),
    ("what broadband speed do I need", "technical"),
    ("what is a good upload speed for broadband", "technical"),
    ("why is my broadband slow in the evening", "technical"),
    # Affordability / social
    ("broadband social tariff eligibility", "affordability"),
    ("cheap broadband universal credit", "affordability"),
    ("broadband for pensioners UK", "affordability"),
    # Provider comparisons
    ("BT vs Sky broadband", "comparison"),
    ("Virgin Media vs BT broadband", "comparison"),
    ("EE vs Vodafone broadband", "comparison"),
    ("TalkTalk vs Plusnet broadband", "comparison"),
    # Altnet / emerging
    ("best altnet broadband UK", "altnet"),
    ("what is an altnet broadband provider", "altnet"),
    ("Connect Fibre reviews", "altnet"),
    # Tools-shaped queries
    ("how much broadband speed do I need calculator", "tools"),
    ("internet speed test UK", "tools"),
    ("broadband cost per month calculator", "tools"),
    # Postcode / local intent
    ("broadband deals in my area", "local"),
    ("check broadband availability postcode", "local"),
]


def get_key() -> str:
    key = os.environ.get("SERPAPI_API_KEY")
    if key:
        return key
    env_path = ROOT / ".env.local"
    if env_path.exists():
        for line in env_path.read_text().splitlines():
            if line.startswith("SERPAPI_API_KEY="):
                return line.split("=", 1)[1].strip()
    print("SERPAPI_API_KEY not set (env or .env.local).", file=sys.stderr)
    sys.exit(1)


def get_quota(key: str) -> dict[str, Any]:
    resp = requests.get("https://serpapi.com/account", params={"api_key": key}, timeout=20)
    resp.raise_for_status()
    return resp.json()


def flatten_ai_overview(ai_overview: dict[str, Any]) -> str:
    parts = []
    for block in ai_overview.get("text_blocks", []):
        if block.get("snippet"):
            parts.append(block["snippet"])
        for item in block.get("list", []) or []:
            if item.get("snippet"):
                parts.append(item["snippet"])
    return " ".join(parts)


def run_query(key: str, query: str) -> dict[str, Any]:
    resp = requests.get(
        "https://serpapi.com/search",
        params={"engine": "google", "q": query, "gl": "uk", "hl": "en", "location": "United Kingdom", "api_key": key},
        timeout=30,
    )
    resp.raise_for_status()
    data = resp.json()

    organic = data.get("organic_results", []) or []
    ai_overview = data.get("ai_overview", {}) or {}
    ai_text = flatten_ai_overview(ai_overview)

    domains = [re.sub(r"^https?://(www\.)?", "", r.get("link", "")).split("/")[0] for r in organic]
    bp_organic_rank = next((i + 1 for i, d in enumerate(domains) if "broadbandpicker.co.uk" in d), None)
    bp_in_ai_overview = "broadbandpicker" in ai_text.lower()

    return {
        "query": query,
        "organic_top10": [
            {"rank": i + 1, "domain": domains[i], "title": r.get("title"), "link": r.get("link")}
            for i, r in enumerate(organic[:10])
        ],
        "has_ai_overview": bool(ai_overview),
        "ai_overview_text": ai_text[:2000],
        "bp_organic_rank": bp_organic_rank,
        "bp_in_ai_overview": bp_in_ai_overview,
        "people_also_ask": [q.get("question") for q in data.get("related_questions", []) or []],
        "related_searches": [r.get("query") for r in data.get("related_searches", []) or []],
    }


def run(limit: int | None) -> Path:
    key = get_key()
    quota_before = get_quota(key)
    print(f"SerpApi plan: {quota_before['plan_name']}, searches left this month: {quota_before['total_searches_left']}")

    queries = SEED_QUERIES[:limit] if limit else SEED_QUERIES
    if quota_before["total_searches_left"] < len(queries):
        print(
            f"Only {quota_before['total_searches_left']} searches left this month, "
            f"but {len(queries)} queries requested. Reduce --limit.",
            file=sys.stderr,
        )
        sys.exit(1)

    print(f"Running {len(queries)} queries...")
    results = []
    for i, (query, cluster) in enumerate(queries, 1):
        print(f"  [{i}/{len(queries)}] {query}")
        try:
            result = run_query(key, query)
            result["cluster"] = cluster
            results.append(result)
        except Exception as e:
            print(f"    ERROR: {e}", file=sys.stderr)
        time.sleep(1)

    quota_after = get_quota(key)
    print(f"\nSearches used this run: {quota_before['total_searches_left'] - quota_after['total_searches_left']}")
    print(f"Searches left this month: {quota_after['total_searches_left']}")

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    date = datetime.now(timezone.utc).date().isoformat()
    out_path = OUT_DIR / f"{date}-raw.json"
    out_path.write_text(json.dumps({"generated": date, "results": results}, indent=2))
    print(f"\nRaw results written to {out_path}")
    return out_path


def summarize(raw_path: Path) -> None:
    data = json.loads(raw_path.read_text())
    results = data["results"]

    total = len(results)
    bp_organic = [r for r in results if r["bp_organic_rank"]]
    bp_ai = [r for r in results if r["bp_in_ai_overview"]]
    has_ai_overview = [r for r in results if r["has_ai_overview"]]

    print(f"\n=== Summary ({total} queries) ===")
    print(f"BroadbandPicker in organic top 10: {len(bp_organic)}/{total}")
    print(f"BroadbandPicker cited in AI Overview: {len(bp_ai)}/{total}")
    print(f"Queries with an AI Overview at all: {len(has_ai_overview)}/{total}")

    print("\n=== Domains appearing most often in organic top 10 (competitors) ===")
    from collections import Counter
    domain_counts: Counter = Counter()
    for r in results:
        for entry in r["organic_top10"]:
            domain_counts[entry["domain"]] += 1
    for domain, count in domain_counts.most_common(15):
        print(f"  {count:2d}  {domain}")

    print("\n=== Queries with NO BroadbandPicker presence anywhere (gap) ===")
    for r in results:
        if not r["bp_organic_rank"] and not r["bp_in_ai_overview"]:
            print(f"  [{r['cluster']}] {r['query']}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--run", action="store_true", help="Run the seed queries against SerpApi")
    parser.add_argument("--limit", type=int, help="Only run the first N seed queries (spend control)")
    parser.add_argument("--report-only", type=Path, help="Summarize an existing raw JSON file, no new API calls")
    args = parser.parse_args()

    if args.report_only:
        summarize(args.report_only)
    elif args.run:
        path = run(args.limit)
        summarize(path)
    else:
        parser.print_help()
