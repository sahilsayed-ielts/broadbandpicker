#!/usr/bin/env python3
"""Keyword mapping and a build-priority plan for content that would make
BroadbandPicker eligible for nine regional full-fibre altnet Awin programmes.

Unlike scripts/plan_awin_adjacency_content.py (adjacent verticals), these
advertisers are ISPs, squarely in the core genre. An ISP affiliate programme
approves a comparison site once it can see a relevant, sourced provider page and
some local coverage content. This script plans that content per altnet: a
provider review, one or two head-to-head comparisons against the dominant local
rival, and a local "best broadband in <area>" guide, plus shared altnet
explainers and a roundup that features all nine at once.

Keyword-metric honesty: no fabricated search volume, CPC or keyword-difficulty
numbers. The opportunity score is a transparent 0-100 composite of editorial 1-5
bands plus 1-3 bands, optionally nudged by live SerpApi SERP shape.

Outputs:
  docs/page-build-pipeline/altnet-awin-programmes.json  (read by build_master_tracker.py)

Usage:
  python3 scripts/plan_altnet_awin_content.py
  python3 scripts/plan_altnet_awin_content.py --run-serp --serp-limit 12
  python3 scripts/plan_altnet_awin_content.py --skip-tracker
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
import time
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
OUT_JSON = ROOT / "docs" / "page-build-pipeline" / "altnet-awin-programmes.json"
TRACKER_SCRIPT = ROOT / "scripts" / "build_master_tracker.py"


# ---------------------------------------------------------------------------
# The nine altnet Awin programmes and their researched footprint (2026-09-07).
# Footprint and price-from are directional, from provider sites plus Uswitch,
# Choose, ISPreview and thinkbroadband. Verify per provider before writing a page.
# ---------------------------------------------------------------------------
ALTNETS: dict[str, dict[str, Any]] = {
    "fibrus": {
        "name": "Fibrus", "advertiser_id": "38394", "slug": "fibrus",
        "footprint": "Northern Ireland (majority) plus Cumbria: Carlisle, Workington, Whitehaven, Kendal",
        "regions": ["Northern Ireland", "Cumbria"],
        "price_from": "about GBP 24 to 30 a month for Full Fibre 150",
        "notes": "Around 400,000 to 450,000 premises passed, Project Gigabit backed, no mid-contract price rises, FTTP.",
        "rival": ("bt", "BT"),
        "local_area": ("Northern Ireland", "/guides/best-broadband-northern-ireland"),
    },
    "airband": {
        "name": "Airband", "advertiser_id": "44469", "slug": "airband",
        "footprint": "Rural West Midlands, Wales and the South West: Shropshire, Herefordshire, Devon, Cornwall",
        "regions": ["West Midlands", "Wales", "South West England"],
        "price_from": "about GBP 30.50 a month for 160 Mbps",
        "notes": "Mix of FTTP and fixed wireless access, 12-month terms, symmetrical speeds, Wi-Fi 6 router, price fixed for the term. 71,000 homes added in 2024.",
        "rival": ("bt", "BT"),
        "local_area": ("the South West", "/guides/best-rural-broadband-south-west-england"),
    },
    "be-fibre": {
        "name": "Be Fibre", "advertiser_id": "60791", "slug": "be-fibre",
        "footprint": "Around 30 towns across England and Wales: Derbyshire, Essex, Gloucestershire, Greater Manchester and more",
        "regions": ["North West England", "East Midlands", "Essex", "Wales"],
        "price_from": "about GBP 19 to 24 a month for symmetrical 150 Mbps",
        "notes": "Symmetrical speeds, fixed price for the contract term, a 2.3 Gbps Be2300 top tier.",
        "rival": ("bt", "BT"),
        "local_area": ("Greater Manchester", "/guides/best-broadband-greater-manchester-altnets"),
    },
    "hey-broadband": {
        "name": "Hey!Broadband", "advertiser_id": "51115", "slug": "hey-broadband",
        "footprint": "Small towns and villages in the South East: Buckinghamshire, Oxfordshire, Surrey, West Sussex",
        "regions": ["Buckinghamshire", "Oxfordshire", "Surrey", "West Sussex"],
        "price_from": "about GBP 23 a month for symmetrical 150 Mbps",
        "notes": "Founded 2019, focus on smaller southeastern towns, Trustpilot around 3.9 out of 5, 24-month symmetrical plans.",
        "rival": ("bt", "BT"),
        "local_area": ("Surrey and West Sussex", "/guides/best-broadband-surrey-west-sussex-villages"),
    },
    "quickline": {
        "name": "Quickline", "advertiser_id": "80323", "slug": "quickline",
        "footprint": "Rural Yorkshire, Lincolnshire and the Humber",
        "regions": ["Yorkshire", "Lincolnshire", "Humber"],
        "price_from": "about GBP 24.99 a month for symmetrical 200 Mbps",
        "notes": "Over 500,000 premises passed, FTTP and fixed wireless, Project Gigabit contracts, Trustpilot 'Excellent', no mid-contract price rises, a Full Fibre 2300 tier.",
        "rival": ("bt", "BT"),
        "local_area": ("rural Yorkshire and Lincolnshire", "/guides/best-rural-broadband-yorkshire-lincolnshire"),
    },
    "gofibre": {
        "name": "GoFibre", "advertiser_id": "112018", "slug": "gofibre",
        "footprint": "Scotland (Scottish Borders, East Lothian, Fife, Aberdeenshire, Angus) plus Northumberland and Teesdale",
        "regions": ["Scottish Borders", "East Lothian", "Fife", "Northumberland"],
        "price_from": "about GBP 22.50 a month for 150 Mbps",
        "notes": "Free installation and router on all plans, no mid-contract price rises, 24-month terms, speeds 150 Mbps to 1 Gbps.",
        "rival": ("bt", "BT"),
        "local_area": ("the Scottish Borders", "/guides/best-broadband-scottish-borders"),
    },
    "voneus": {
        "name": "Voneus", "advertiser_id": "124008", "slug": "voneus",
        "footprint": "Rural villages across England, Wales and Scotland: Shropshire, Somerset, Cornwall, Pembrokeshire, Isle of Arran and more",
        "regions": ["rural England", "Wales", "Scotland"],
        "price_from": "about GBP 29.99 a month for symmetrical 500 Mbps",
        "notes": "Rural full fibre specialist, grew by acquiring smaller village networks, no mid-contract price rises, Voneus router, 24-month terms.",
        "rival": ("bt", "BT"),
        "local_area": ("rural villages", "/guides/best-broadband-for-uk-villages-altnets"),
    },
    "grain": {
        "name": "Grain", "advertiser_id": "125460", "slug": "grain",
        "footprint": "Kent, parts of Scotland (Perth, Fife) and northern England, described as Aberdeen to the south coast",
        "regions": ["Kent", "Scotland", "North East England"],
        "price_from": "about GBP 24 to 27 a month for Full Fibre 250",
        "notes": "Established 2016, HQ Carlisle, no phone line required, free installation, no mid-contract price rises, two social tariffs at 15 and 30 Mbps symmetrical.",
        "rival": ("bt", "BT"),
        "local_area": ("Kent", "/guides/best-broadband-kent-altnets"),
    },
    "lightning-fibre": {
        "name": "Lightning Fibre", "advertiser_id": "119853", "slug": "lightning-fibre",
        "footprint": "East Sussex: Eastbourne, Hastings, Hailsham, St Leonards, Heathfield, plus Brighton and Hove, Worthing and parts of Kent",
        "regions": ["East Sussex", "Brighton and Hove", "Kent"],
        "price_from": "about GBP 28 a month for symmetrical 300 Mbps, promotions from GBP 19 for the first six months",
        "notes": "East Sussex full-fibre builder, never raises price during the contract, multi-gigabit tiers up to 2.5 Gbps.",
        "rival": ("virgin-media", "Virgin Media"),
        "local_area": ("Eastbourne and East Sussex", "/guides/best-broadband-eastbourne-east-sussex"),
    },
}


def page(
    record_type: str,
    altnet_slug: str,
    page_type: str,
    title: str,
    slug: str,
    primary: str,
    secondary: list[str],
    intent: str,
    demand: int,
    difficulty: int,
    content_gap: int,
    commercial_value: int,
    geo_upside: int,
    awin_unlock: int,
    note: str = "",
    programmes: list[str] | None = None,
) -> dict[str, Any]:
    return {
        "record_type": record_type,
        "altnet": altnet_slug,
        "page_type": page_type,
        "working_title": title,
        "recommended_url": slug,
        "primary_keyword": primary,
        "secondary_keywords": secondary,
        "intent": intent,
        "target_awin_programmes": programmes or [altnet_slug],
        "bands": {
            "demand": demand, "difficulty": difficulty, "content_gap": content_gap,
            "commercial_value": commercial_value, "geo_upside": geo_upside, "awin_unlock": awin_unlock,
        },
        "note": note,
    }


def build_candidates() -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    for slug, a in ALTNETS.items():
        name = a["name"]
        low = name.lower().replace("!", "").replace("  ", " ")
        rival_slug, rival_name = a["rival"]

        # 1. Provider review page -- the core Awin-application asset.
        rows.append(page(
            "Provider review", slug, "Provider review",
            f"{name} broadband review", f"/providers/{a['slug']}",
            f"{low} broadband",
            [
                f"{low} broadband review",
                f"{low} broadband deals",
                f"is {low} broadband any good",
                f"{low} broadband coverage",
                f"{low} broadband prices",
                f"{low} vs {rival_name.lower()}",
            ],
            "Commercial investigation",
            demand=2, difficulty=1, content_gap=4, commercial_value=5, geo_upside=2, awin_unlock=3,
            note=f"{a['footprint']}. {a['notes']} Low brand-search volume but near-zero competition and it is the page the programme needs to see before approving.",
        ))

        # 2. Head-to-head against the dominant local alternative.
        rows.append(page(
            "Comparison", slug, "Comparison",
            f"{name} vs {rival_name} broadband", f"/providers/compare/{a['slug']}-vs-{rival_slug}",
            f"{low} vs {rival_name.lower()} broadband",
            [
                f"{rival_name.lower()} vs {low}",
                f"is {low} better than {rival_name.lower()}",
                f"{low} or {rival_name.lower()}",
                f"switch from {rival_name.lower()} to {low}",
                f"{low} vs {rival_name.lower()} price",
            ],
            "Commercial investigation",
            demand=2, difficulty=2, content_gap=4, commercial_value=5, geo_upside=2, awin_unlock=3,
            note=f"The decision most {name} researchers actually face: an altnet against the incumbent line at the same address. Requires a {a['slug']} provider entry first.",
            programmes=[slug, rival_slug],
        ))

        # 3. Local "best broadband in <area>" guide.
        area, area_slug = a["local_area"]
        rows.append(page(
            "Local guide", slug, "Local guide",
            f"Best broadband in {area}", area_slug,
            f"best broadband {area.lower()}",
            [
                f"broadband providers {area.lower()}",
                f"full fibre {area.lower()}",
                f"{a['regions'][0].lower()} broadband deals",
                f"rural broadband {area.lower()}",
                f"altnet broadband {area.lower()}",
            ],
            "Commercial investigation",
            demand=3, difficulty=3, content_gap=4, commercial_value=4, geo_upside=3, awin_unlock=3,
            note=f"Captures local intent and gives {name} a natural, non-brand placement. Overlaps the postcode strategy; several of these areas are outside the current city-hub set.",
        ))

    # 4. Shared altnet content that supports every application at once.
    all_slugs = list(ALTNETS.keys())
    rows.append(page(
        "Shared roundup", "all", "Buyer guide",
        "Best rural full-fibre altnet broadband UK 2026", "/guides/best-altnet-broadband-uk",
        "best altnet broadband uk",
        [
            "best rural full fibre broadband",
            "alternative network broadband uk",
            "altnet broadband providers list",
            "best small broadband providers uk",
            "full fibre without openreach",
        ],
        "Commercial investigation",
        demand=3, difficulty=3, content_gap=4, commercial_value=4, geo_upside=3, awin_unlock=3,
        note="One page that features all nine altnets plus the others already on site. Highest leverage: a single build that makes the case for approval to multiple programmes.",
        programmes=all_slugs,
    ))
    rows.append(page(
        "Shared explainer", "all", "Explainer",
        "What is an altnet broadband provider?", "/guides/what-is-an-altnet-broadband-provider",
        "what is an altnet",
        [
            "altnet meaning broadband",
            "alternative network provider",
            "is an altnet better than openreach",
            "list of uk altnets",
            "altnet vs openreach",
        ],
        "Informational",
        demand=3, difficulty=2, content_gap=4, commercial_value=2, geo_upside=3, awin_unlock=2,
        note="Definitional query with strong AI Overview upside and no strong UK consumer answer. Anchors the altnet cluster.",
        programmes=all_slugs,
    ))
    rows.append(page(
        "Shared explainer", "all", "Question and answer",
        "What happens if my altnet broadband provider goes bust?", "/guides/altnet-broadband-provider-goes-bust-uk",
        "what happens if my broadband provider goes bust",
        [
            "is altnet broadband safe",
            "altnet broadband risk",
            "broadband company administration what happens",
            "will i lose my broadband if the provider closes",
            "altnet consolidation uk",
        ],
        "Informational",
        demand=2, difficulty=2, content_gap=5, commercial_value=2, geo_upside=3, awin_unlock=2,
        note="A genuine buyer objection for regional altnets, almost unaddressed. Builds trust that helps every altnet convert.",
        programmes=all_slugs,
    ))
    return rows


# ---------------------------------------------------------------------------
# Scoring (same model as plan_awin_adjacency_content.py)
# ---------------------------------------------------------------------------
WEIGHTS = {
    "demand": 0.24,
    "ease": 0.22,
    "content_gap": 0.16,
    "geo_upside": 0.10,
    "commercial_value": 0.18,
    "awin_unlock": 0.10,
}


def opportunity_score(bands: dict[str, int]) -> float:
    score = (
        WEIGHTS["demand"] * bands["demand"] / 5
        + WEIGHTS["ease"] * (6 - bands["difficulty"]) / 5
        + WEIGHTS["content_gap"] * bands["content_gap"] / 5
        + WEIGHTS["geo_upside"] * bands["geo_upside"] / 3
        + WEIGHTS["commercial_value"] * bands["commercial_value"] / 5
        + WEIGHTS["awin_unlock"] * bands["awin_unlock"] / 3
    )
    return round(score * 100, 1)


# ---------------------------------------------------------------------------
# Optional SerpApi SERP-shape enrichment
# ---------------------------------------------------------------------------
def env_key(name: str) -> str | None:
    if os.environ.get(name):
        return os.environ[name]
    env_path = ROOT / ".env.local"
    if env_path.exists():
        for line in env_path.read_text().splitlines():
            line = line.strip()
            if line.startswith(f"{name}="):
                return line.split("=", 1)[1].strip()
    return None


FORUM_HOSTS = ("reddit.com", "facebook.com", "quora.com", "moneysavingexpert.com", "community.", "forums.")
AGGREGATOR_HOSTS = ("uswitch.com", "choose.co.uk", "broadband.co.uk", "comparefibre.co.uk", "thinkbroadband.com",
                    "switchity.co.uk", "broadbandswitch.uk", "moneysupermarket.com", "gocompare.com")


def serp_shape(key: str, query: str) -> dict[str, Any]:
    import requests

    r = requests.get(
        "https://serpapi.com/search",
        params={"engine": "google", "q": query, "gl": "uk", "hl": "en",
                "location": "United Kingdom", "api_key": key},
        timeout=40,
    )
    r.raise_for_status()
    data = r.json()
    organic = data.get("organic_results", []) or []
    domains = [re.sub(r"^https?://(www\.)?", "", o.get("link", "")).split("/")[0].lower() for o in organic[:10]]
    return {
        "query": query,
        "ai_overview": bool(data.get("ai_overview")),
        "top_domains": domains[:8],
        "forum_results_in_top10": sum(1 for d in domains if any(f in d for f in FORUM_HOSTS)),
        "aggregator_results_in_top10": sum(1 for d in domains if any(g in d for g in AGGREGATOR_HOSTS)),
        "bp_in_top10": any("broadbandpicker.co.uk" in d for d in domains),
        "brand_site_ranks_first": bool(domains and query.split()[0] in domains[0]),
        "people_also_ask": [q.get("question") for q in data.get("related_questions", []) or [] if q.get("question")][:6],
    }


def enrich_with_serp(rows: list[dict[str, Any]], limit: int) -> dict[str, Any]:
    key = env_key("SERPAPI_API_KEY")
    if not key:
        print("SERPAPI_API_KEY not set; skipping SERP enrichment.", file=sys.stderr)
        return {"mode": "skipped_no_key", "checked": 0}
    import requests

    quota = requests.get("https://serpapi.com/account", params={"api_key": key}, timeout=20).json()
    left = int(quota.get("total_searches_left", 0))
    print(f"SerpApi plan: {quota.get('plan_name')}, searches left: {left}")
    targets = rows[:limit]
    if left < len(targets):
        targets = targets[: max(0, left - 2)]
        print(f"Only {left} searches left; trimming to {len(targets)}.", file=sys.stderr)

    checked = 0
    for row in targets:
        q = row["primary_keyword"]
        print(f"  [{checked + 1}/{len(targets)}] {q}")
        try:
            shape = serp_shape(key, q)
        except Exception as exc:  # noqa: BLE001
            print(f"    ERROR: {exc}", file=sys.stderr)
            continue
        row["serp"] = shape
        if shape["ai_overview"]:
            row["bands"]["geo_upside"] = min(3, row["bands"]["geo_upside"] + 1)
        # An aggregator-heavy SERP with no dedicated editorial review is an open gap.
        if shape["aggregator_results_in_top10"] >= 4 and not shape["bp_in_top10"]:
            row["bands"]["content_gap"] = min(5, row["bands"]["content_gap"] + 1)
        if shape["forum_results_in_top10"] >= 3:
            row["bands"]["content_gap"] = min(5, row["bands"]["content_gap"] + 1)
        row["opportunity_score"] = opportunity_score(row["bands"])
        checked += 1
        time.sleep(1.2)

    after = int(requests.get("https://serpapi.com/account", params={"api_key": key}, timeout=20).json().get("total_searches_left", left))
    print(f"SerpApi searches used: {left - after}; left: {after}")
    return {"mode": "live", "checked": checked, "searches_used": left - after, "searches_left": after}


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--run-serp", action="store_true", help="Spend SerpApi quota to check SERP shape for the top candidates")
    parser.add_argument("--serp-limit", type=int, default=12)
    parser.add_argument("--skip-tracker", action="store_true")
    args = parser.parse_args()

    rows = build_candidates()
    for row in rows:
        row["opportunity_score"] = opportunity_score(row["bands"])
    rows.sort(key=lambda r: r["opportunity_score"], reverse=True)

    serp_meta: dict[str, Any] = {"mode": "editorial_only", "checked": 0}
    if args.run_serp:
        serp_meta = enrich_with_serp(rows, args.serp_limit)
        rows.sort(key=lambda r: r["opportunity_score"], reverse=True)

    for rank, row in enumerate(rows, 1):
        row["rank"] = rank

    per_altnet: dict[str, dict[str, Any]] = defaultdict(lambda: {"pages": 0, "score_sum": 0.0})
    for row in rows:
        a = per_altnet[row["altnet"]]
        a["pages"] += 1
        a["score_sum"] += row["opportunity_score"]
    altnet_summary = [
        {
            "altnet": slug,
            **({"name": "Shared (all altnets)"} if slug == "all" else {"name": ALTNETS[slug]["name"],
               "advertiser_id": ALTNETS[slug]["advertiser_id"],
               "footprint": ALTNETS[slug]["footprint"],
               "price_from": ALTNETS[slug]["price_from"]}),
            "pages": data["pages"],
            "avg_opportunity_score": round(data["score_sum"] / data["pages"], 1),
        }
        for slug, data in sorted(per_altnet.items(), key=lambda kv: -kv[1]["score_sum"] / kv[1]["pages"])
    ]

    payload = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "purpose": (
            "Content that would make BroadbandPicker eligible for nine regional full-fibre altnet "
            "Awin programmes. Per altnet: a provider review, a head-to-head against the local "
            "incumbent, and a local best-broadband guide, plus shared altnet explainers and a "
            "roundup. Build the provider review and roundup first, get them indexed, then apply "
            "with those pages as the relevance proof."
        ),
        "scoring_note": (
            "opportunity_score is a 0-100 composite of editorial 1-5 bands plus 1-3 bands, "
            "commercial_value weighted higher than the adjacency plan because these are direct ISP "
            "affiliate programmes. No fabricated search volume, CPC or keyword-difficulty numbers."
        ),
        "weights": WEIGHTS,
        "serp_meta": serp_meta,
        "altnets": {slug: {k: v for k, v in a.items() if k not in ("rival", "local_area")} for slug, a in ALTNETS.items()},
        "altnet_summary": altnet_summary,
        "pages": rows,
    }

    OUT_JSON.parent.mkdir(parents=True, exist_ok=True)
    OUT_JSON.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"\nSaved {OUT_JSON}")

    print(f"\n{len(rows)} candidate pages for {len(ALTNETS)} altnets, ranked by SEO opportunity:\n")
    print(f"  {'#':>3}  {'Score':>5}  {'Type':18}  {'Altnet':16}  Primary keyword")
    for row in rows:
        an = "shared" if row["altnet"] == "all" else ALTNETS[row["altnet"]]["name"]
        print(f"  {row['rank']:>3}  {row['opportunity_score']:>5.1f}  {row['page_type'][:18]:18}  {an[:16]:16}  {row['primary_keyword']}")
    print("\nAltnet order (avg opportunity):")
    for a in altnet_summary:
        print(f"  {a['avg_opportunity_score']:>5.1f}  {a['name']:24}  ({a['pages']} pages)")

    if not args.skip_tracker:
        import subprocess

        print("\nRebuilding master tracker...")
        result = subprocess.run([sys.executable, str(TRACKER_SCRIPT)], cwd=ROOT, capture_output=True, text=True)
        sys.stdout.write(result.stdout[-1500:])
        if result.returncode != 0:
            sys.stderr.write(result.stderr[-1500:])
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
