#!/usr/bin/env python3
"""Capture live Google AI Overview state for one or more queries via SerpApi.

Standard step in the page-build/refresh pipeline: run this BEFORE finalising
content on any new or refreshed page, for the primary keyword and (when GSC
shows a large demand-vs-ranking gap) the highest-gap secondary keyword. It
tells you:

  - whether an AI Overview currently renders for the query,
  - whether BroadbandPicker is cited in it (bp_in_ai_overview),
  - which domains ARE cited (so gaps and competitor patterns are visible),
  - BroadbandPicker's plain organic rank in the top 10,
  - People Also Ask questions (candidate FAQ material),
  - the AI Overview's own extracted text (candidate facts -- but see the
    editorial-restraint rule below).

Editorial-restraint rule (established on the Liverpool build and to be
applied on every future build): a claim that appears ONLY in the AI
Overview text -- not independently verifiable via a primary/fetchable
source (operator page, regulator, or an independently-bylined and dated
report) -- must NOT be published. Log it in the research record as an
excluded/unverified observation instead, exactly as Liverpool's "Baltic
Broadband" and "Giant" claims were excluded pending independent
verification. This script's output is a RESEARCH SIGNAL, not a copy-paste
content source.

Usage:
    python3 scripts/capture_ai_overview.py --url https://broadbandpicker.co.uk/postcode/bristol \
        --query "broadband providers bristol" --query "fibre broadband bristol"

    python3 scripts/capture_ai_overview.py --url <url> --query "<q>" --out-dir docs/geo-serp-research

Every run is also written to docs/geo-serp-research/<date>-<page-slug>-ai-overview.json
so there is a durable, inspectable audit trail of what was actually checked and when --
the same discipline used elsewhere in the pipeline (thinkbroadband/Switchity fetch dates,
GSC/GA4 baselines in the content-change ledger).

Refuses to spend quota it doesn't have: prints total_searches_left before running,
and trims the query list (never silently over-spends) if quota is short.
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from datetime import date, datetime, timezone
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]

JUNK_DOMAINS = {
    "google.com", "www.google.com", "support.google.com", "policies.google.com",
    "accounts.google.com", "maps.google.com", "youtube.com", "www.youtube.com",
    "facebook.com", "www.facebook.com", "twitter.com", "x.com", "instagram.com",
    "tiktok.com", "www.tiktok.com", "pinterest.com", "serpapi.com",
}


def is_junk_domain(domain: str) -> bool:
    return not domain or domain in JUNK_DOMAINS


def env_key(name: str) -> str | None:
    import os

    if os.environ.get(name):
        return os.environ[name]
    env_path = ROOT / ".env.local"
    if env_path.exists():
        for line in env_path.read_text().splitlines():
            line = line.strip()
            if line.startswith(f"{name}="):
                return line.split("=", 1)[1].strip()
    return None


def serp_quota(key: str) -> dict[str, Any]:
    import requests

    r = requests.get("https://serpapi.com/account", params={"api_key": key}, timeout=20)
    r.raise_for_status()
    return r.json()


def serp_domain(link: str) -> str:
    return re.sub(r"^https?://(www\.)?", "", link or "").split("/")[0]


def resolve_ai_ref(ref: dict[str, Any]) -> dict[str, Any] | None:
    """Normalise one AI Overview reference to a real publisher domain.

    SerpApi often gives a google.com/goto redirect as `link` and the real
    publisher only in `source`. Drop junk, recover the publisher.
    """
    link = ref.get("link", "") or ""
    domain = serp_domain(link)
    source = (ref.get("source") or "").strip()
    if is_junk_domain(domain):
        if source and "." in source and " " not in source:
            domain, link = source.lower(), ""
        else:
            return None
    if is_junk_domain(domain):
        return None
    return {
        "title": ref.get("title"),
        "link": "" if link.startswith("https://www.google.com/") else link,
        "domain": domain.lower(),
        "source": source,
    }


def serp_search(key: str, query: str) -> dict[str, Any]:
    import requests

    r = requests.get(
        "https://serpapi.com/search",
        params={
            "engine": "google", "q": query, "gl": "uk", "hl": "en",
            "location": "United Kingdom", "api_key": key,
        },
        timeout=40,
    )
    r.raise_for_status()
    data = r.json()
    organic = data.get("organic_results", []) or []
    ai = data.get("ai_overview", {}) or {}

    ai_text_parts: list[str] = []
    for block in ai.get("text_blocks", []) or []:
        if block.get("snippet"):
            ai_text_parts.append(block["snippet"])
        for item in block.get("list", []) or []:
            if item.get("snippet"):
                ai_text_parts.append(item["snippet"])
    ai_text = " ".join(ai_text_parts)

    ai_refs: list[dict[str, Any]] = []
    for ref in (ai.get("references", []) or []):
        resolved = resolve_ai_ref(ref)
        if resolved:
            ai_refs.append(resolved)

    organic_top10 = [
        {
            "rank": i + 1,
            "domain": serp_domain(o.get("link", "")),
            "title": o.get("title"),
            "link": o.get("link"),
        }
        for i, o in enumerate(organic[:10])
    ]

    return {
        "query": query,
        "checked_at": datetime.now(timezone.utc).isoformat(),
        "organic_top10": organic_top10,
        "has_ai_overview": bool(ai),
        "ai_overview_needs_followup": bool(ai.get("page_token")),
        "ai_overview_text": ai_text[:2000],
        "ai_references": ai_refs,
        "ai_cited_domains": sorted({r["domain"] for r in ai_refs}),
        "bp_organic_rank": next(
            (o["rank"] for o in organic_top10 if "broadbandpicker.co.uk" in o["domain"]),
            None,
        ),
        "bp_in_ai_overview": "broadbandpicker" in ai_text.lower()
        or any("broadbandpicker" in (r["domain"] or "") for r in ai_refs),
        "people_also_ask": [q.get("question") for q in data.get("related_questions", []) or []],
    }


def slug_from_url(url: str) -> str:
    path = re.sub(r"^https?://[^/]+/?", "", url).strip("/")
    return re.sub(r"[^a-z0-9]+", "-", path.lower()).strip("-") or "page"


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--url", required=True, help="The BroadbandPicker page URL this capture is for")
    parser.add_argument("--query", action="append", required=True, dest="queries", help="Query to check (repeatable)")
    parser.add_argument("--out-dir", default=str(ROOT / "docs" / "geo-serp-research"))
    parser.add_argument("--max-queries", type=int, default=6, help="Hard cap on queries run in one invocation")
    args = parser.parse_args()

    key = env_key("SERPAPI_API_KEY")
    if not key:
        print("SERPAPI_API_KEY missing (env or .env.local); cannot capture AI Overview state.", file=sys.stderr)
        return 1

    queries = args.queries[: args.max_queries]

    quota_before = serp_quota(key)
    left = quota_before.get("total_searches_left", 0)
    print(f"SerpApi: {quota_before.get('plan_name')}, {left} searches left before this run")
    if left < len(queries):
        queries = queries[: max(0, left - 1)]
        print(f"  trimming to {len(queries)} quer{'y' if len(queries) == 1 else 'ies'} to stay within quota")
    if not queries:
        print("No quota available; aborting without spending anything.", file=sys.stderr)
        return 1

    results: dict[str, Any] = {}
    for i, q in enumerate(queries, 1):
        print(f"  [{i}/{len(queries)}] {q!r}")
        results[q] = serp_search(key, q)

    quota_after = serp_quota(key)
    print(f"SerpApi: {quota_after.get('total_searches_left')} searches left after this run")

    payload = {
        "page_url": args.url,
        "captured_at": datetime.now(timezone.utc).isoformat(),
        "queries_checked": queries,
        "quota_before": left,
        "quota_after": quota_after.get("total_searches_left"),
        "results": results,
        "summary": {
            q: {
                "has_ai_overview": r["has_ai_overview"],
                "bp_in_ai_overview": r["bp_in_ai_overview"],
                "bp_organic_rank": r["bp_organic_rank"],
                "ai_cited_domains": r["ai_cited_domains"],
            }
            for q, r in results.items()
        },
    }

    out_dir = Path(args.out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    out_path = out_dir / f"{date.today().isoformat()}-{slug_from_url(args.url)}-ai-overview.json"
    out_path.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
    print(f"\nWritten: {out_path}")

    print("\n=== Summary ===")
    for q, r in results.items():
        ai = "AI Overview PRESENT" if r["has_ai_overview"] else "no AI Overview"
        cited = "BP CITED" if r["bp_in_ai_overview"] else "BP not cited"
        rank = f"organic rank {r['bp_organic_rank']}" if r["bp_organic_rank"] else "not in top 10"
        domains = ", ".join(r["ai_cited_domains"]) or "(none resolved)"
        print(f"- {q!r}: {ai}, {cited}, {rank}")
        if r["has_ai_overview"]:
            print(f"    cited domains: {domains}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
