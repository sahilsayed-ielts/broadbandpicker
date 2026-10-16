#!/usr/bin/env python3
"""Domain-authority research pull for BroadbandPicker (GSC + GA4 + free popularity data).

Domain authority (Moz DA / Ahrefs DR) is a third-party estimate built from
backlinks. We have no paid backlink API, and the Search Console API does not
expose the Links report, so this script measures the signals we *can* get
for real and that move with authority:

  GSC   - 16-month click/impression trend, branded vs non-branded demand
          (brand searches are the cleanest authority proxy we own), position
          buckets, striking-distance queries (pos 4-20) and low-CTR pages
          (quick wins), indexed-page breadth, countries, sitemaps status.
  GA4   - channel mix, referral sources (who already links to / sends us
          traffic - the closest thing to a backlink list the APIs give us),
          new vs returning users, engagement, tool + share + save events,
          and landing pages for tools/research (linkable-asset performance).
  Tranco - the free research-grade top-1M domain popularity list, to rank
          BroadbandPicker against the UK broadband affiliate leaders.

Output: docs/domain-authority-research/<date>-authority-data.json (+ a short
console summary). Spends no SerpApi quota.

Usage:
  .venv/bin/python scripts/research_domain_authority.py
  .venv/bin/python scripts/research_domain_authority.py --skip-tranco
"""

from __future__ import annotations

import argparse
import csv
import io
import json
import re
import sys
import zipfile
from collections import defaultdict
from datetime import date, timedelta
from pathlib import Path
from typing import Any
from urllib.parse import quote
from urllib.request import Request, urlopen

sys.path.insert(0, str(Path(__file__).resolve().parent))
from analyze_page_type_ux import (  # noqa: E402
    DEFAULT_CREDENTIALS,
    GA4_PROPERTY,
    GSC_SITE,
    GoogleClient,
    classify_page_type,
    path_of,
)

GSC_BASE = "https://searchconsole.googleapis.com/webmasters/v3"
GA_BASE = "https://analyticsdata.googleapis.com/v1beta"
ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "docs" / "domain-authority-research"

BRAND_RE = re.compile(r"broadband\s*picker|broadbandpicker|bb\s*picker", re.I)

# UK broadband affiliate / comparison leaders to place on the Tranco ranking.
COMPETITORS = [
    "uswitch.com", "moneysavingexpert.com", "broadbandchoices.co.uk", "cable.co.uk",
    "broadband.co.uk", "broadbandgenie.co.uk", "choose.co.uk", "ispreview.co.uk",
    "thinkbroadband.com", "comparethemarket.com", "moneysupermarket.com",
    "confused.com", "gocompare.com", "which.co.uk", "money.co.uk",
    "bestbroadbanddeals.co.uk", "broadbanddeals.co.uk", "techradar.com",
    "forbes.com", "independent.co.uk", "broadbandpicker.co.uk",
]


# ---------------------------------------------------------------------------
# GSC
# ---------------------------------------------------------------------------

def gsc(client: GoogleClient, start: date, end: date, dims: list[str], *,
        limit: int = 25000, filters: list[dict] | None = None) -> list[dict]:
    site = quote(GSC_SITE, safe="")
    rows: list[dict] = []
    start_row = 0
    while True:
        payload: dict[str, Any] = {
            "startDate": start.isoformat(), "endDate": end.isoformat(),
            "type": "web", "dimensions": dims, "rowLimit": min(limit, 25000),
            "startRow": start_row, "dataState": "all",
        }
        if filters:
            payload["dimensionFilterGroups"] = [{"filters": filters}]
        batch = client.request(
            "POST", f"{GSC_BASE}/sites/{site}/searchAnalytics/query", payload
        ).get("rows", [])
        rows.extend(batch)
        if len(batch) < 25000 or len(rows) >= limit:
            return rows
        start_row += 25000


def monthly_trend(client: GoogleClient, end: date) -> list[dict]:
    start = end - timedelta(days=486)  # ~16 months, the GSC maximum
    months: dict[str, dict[str, float]] = defaultdict(lambda: {"clicks": 0, "impressions": 0, "pos_w": 0})
    for r in gsc(client, start, end, ["date"]):
        m = r["keys"][0][:7]
        months[m]["clicks"] += r["clicks"]
        months[m]["impressions"] += r["impressions"]
        months[m]["pos_w"] += r["position"] * r["impressions"]
    out = []
    for m in sorted(months):
        v = months[m]
        out.append({
            "month": m, "clicks": int(v["clicks"]), "impressions": int(v["impressions"]),
            "avg_position": round(v["pos_w"] / v["impressions"], 1) if v["impressions"] else None,
        })
    return out


def brand_trend(client: GoogleClient, end: date) -> list[dict]:
    """Monthly branded query clicks/impressions (authority + word-of-mouth proxy)."""
    start = end - timedelta(days=486)
    months: dict[str, dict[str, float]] = defaultdict(lambda: {"clicks": 0, "impressions": 0})
    for r in gsc(client, start, end, ["date", "query"]):
        if BRAND_RE.search(r["keys"][1]):
            m = r["keys"][0][:7]
            months[m]["clicks"] += r["clicks"]
            months[m]["impressions"] += r["impressions"]
    return [{"month": m, **{k: int(v) for k, v in months[m].items()}} for m in sorted(months)]


def position_bucket(pos: float) -> str:
    if pos <= 3:
        return "1-3"
    if pos <= 10:
        return "4-10"
    if pos <= 20:
        return "11-20"
    if pos <= 50:
        return "21-50"
    return "51+"


def query_analysis(client: GoogleClient, start: date, end: date) -> dict[str, Any]:
    rows = gsc(client, start, end, ["query"])
    brand = {"clicks": 0, "impressions": 0, "queries": 0}
    nonbrand = {"clicks": 0, "impressions": 0, "queries": 0}
    buckets: dict[str, dict[str, float]] = defaultdict(lambda: {"queries": 0, "impressions": 0, "clicks": 0})
    brand_queries = []
    for r in rows:
        q = r["keys"][0]
        tgt = brand if BRAND_RE.search(q) else nonbrand
        tgt["clicks"] += r["clicks"]
        tgt["impressions"] += r["impressions"]
        tgt["queries"] += 1
        if tgt is brand:
            brand_queries.append({"query": q, "clicks": r["clicks"], "impressions": r["impressions"],
                                  "position": round(r["position"], 1)})
        b = buckets[position_bucket(r["position"])]
        b["queries"] += 1
        b["impressions"] += r["impressions"]
        b["clicks"] += r["clicks"]

    striking = [
        {"query": r["keys"][0], "impressions": int(r["impressions"]), "clicks": int(r["clicks"]),
         "ctr": round(r["ctr"] * 100, 2), "position": round(r["position"], 1)}
        for r in rows
        if 4 <= r["position"] <= 20 and r["impressions"] >= 50 and not BRAND_RE.search(r["keys"][0])
    ]
    striking.sort(key=lambda x: x["impressions"], reverse=True)
    return {
        "total_queries": len(rows),
        "brand": brand, "non_brand": nonbrand,
        "brand_share_of_clicks_pct": round(100 * brand["clicks"] / max(1, brand["clicks"] + nonbrand["clicks"]), 1),
        "brand_queries": sorted(brand_queries, key=lambda x: x["impressions"], reverse=True)[:30],
        "position_buckets": {k: {kk: int(vv) for kk, vv in v.items()} for k, v in sorted(buckets.items())},
        "striking_distance": striking[:60],
    }


# Rough expected CTR by position for UK desktop+mobile mix (industry curves,
# conservative). Used only to rank pages whose snippet under-performs.
EXPECTED_CTR = {1: 25, 2: 14, 3: 9, 4: 6.5, 5: 5, 6: 4, 7: 3.2, 8: 2.6, 9: 2.2, 10: 1.9}


def page_analysis(client: GoogleClient, start: date, end: date) -> dict[str, Any]:
    rows = gsc(client, start, end, ["page"])
    by_type: dict[str, dict[str, float]] = defaultdict(lambda: {"pages": 0, "clicks": 0, "impressions": 0, "pos_w": 0})
    low_ctr = []
    for r in rows:
        p = path_of(r["keys"][0])
        t = classify_page_type(p)
        a = by_type[t]
        a["pages"] += 1
        a["clicks"] += r["clicks"]
        a["impressions"] += r["impressions"]
        a["pos_w"] += r["position"] * r["impressions"]
        pos = r["position"]
        if pos <= 10 and r["impressions"] >= 200:
            exp = EXPECTED_CTR.get(max(1, round(pos)), 1.9)
            actual = r["ctr"] * 100
            if actual < exp * 0.6:
                low_ctr.append({
                    "page": p, "impressions": int(r["impressions"]), "clicks": int(r["clicks"]),
                    "ctr": round(actual, 2), "expected_ctr": exp, "position": round(pos, 1),
                    "missed_clicks_est": int(r["impressions"] * (exp - actual) / 100),
                })
    low_ctr.sort(key=lambda x: x["missed_clicks_est"], reverse=True)
    types = {
        t: {"pages": int(v["pages"]), "clicks": int(v["clicks"]), "impressions": int(v["impressions"]),
            "avg_position": round(v["pos_w"] / v["impressions"], 1) if v["impressions"] else None}
        for t, v in sorted(by_type.items(), key=lambda kv: -kv[1]["impressions"])
    }
    top_pages = sorted(rows, key=lambda r: r["clicks"], reverse=True)[:25]
    return {
        "pages_with_impressions": len(rows),
        "pages_with_clicks": sum(1 for r in rows if r["clicks"] > 0),
        "by_type": types,
        "low_ctr_pages": low_ctr[:30],
        "top_pages_by_clicks": [
            {"page": path_of(r["keys"][0]), "clicks": int(r["clicks"]), "impressions": int(r["impressions"]),
             "position": round(r["position"], 1)} for r in top_pages
        ],
    }


def dimension_split(client: GoogleClient, start: date, end: date, dim: str) -> list[dict]:
    rows = gsc(client, start, end, [dim], limit=50)
    return [{"key": r["keys"][0], "clicks": int(r["clicks"]), "impressions": int(r["impressions"]),
             "position": round(r["position"], 1)} for r in sorted(rows, key=lambda r: -r["impressions"])[:15]]


def search_appearance(client: GoogleClient, start: date, end: date) -> list[dict]:
    try:
        return dimension_split(client, start, end, "searchAppearance")
    except RuntimeError as exc:
        return [{"error": str(exc)[:200]}]


def sitemaps(client: GoogleClient) -> list[dict]:
    site = quote(GSC_SITE, safe="")
    resp = client.request("GET", f"{GSC_BASE}/sites/{site}/sitemaps")
    out = []
    for s in resp.get("sitemap", []):
        contents = s.get("contents", [{}])
        out.append({
            "path": s.get("path"), "lastDownloaded": s.get("lastDownloaded"),
            "isPending": s.get("isPending"), "errors": s.get("errors"), "warnings": s.get("warnings"),
            "submitted": sum(int(c.get("submitted", 0)) for c in contents),
        })
    return out


# ---------------------------------------------------------------------------
# GA4
# ---------------------------------------------------------------------------

def ga4(client: GoogleClient, start: date, end: date, dims: list[str], metrics: list[str], *,
        limit: int = 200, dim_filter: dict | None = None, order_metric: str | None = None) -> list[dict]:
    payload: dict[str, Any] = {
        "dateRanges": [{"startDate": start.isoformat(), "endDate": end.isoformat()}],
        "dimensions": [{"name": d} for d in dims],
        "metrics": [{"name": m} for m in metrics],
        "limit": limit,
    }
    if dim_filter:
        payload["dimensionFilter"] = dim_filter
    if order_metric:
        payload["orderBys"] = [{"metric": {"metricName": order_metric}, "desc": True}]
    resp = client.request("POST", f"{GA_BASE}/properties/{GA4_PROPERTY}:runReport", payload)
    out = []
    for row in resp.get("rows", []):
        rec: dict[str, Any] = {d: v["value"] for d, v in zip(dims, row.get("dimensionValues", []))}
        for m, v in zip(metrics, row["metricValues"]):
            val = float(v["value"])
            rec[m] = round(val, 3) if not val.is_integer() else int(val)
        out.append(rec)
    return out


def ga4_analysis(client: GoogleClient, start: date, end: date) -> dict[str, Any]:
    out: dict[str, Any] = {}
    out["totals"] = ga4(client, start, end, [], ["sessions", "totalUsers", "newUsers", "engagementRate",
                                                  "averageSessionDuration", "screenPageViews"])
    out["channels"] = ga4(client, start, end, ["sessionDefaultChannelGroup"],
                          ["sessions", "engagedSessions", "totalUsers"], order_metric="sessions")
    out["referrals"] = ga4(
        client, start, end, ["sessionSource", "sessionMedium"], ["sessions", "engagedSessions"],
        dim_filter={"notExpression": {"filter": {"fieldName": "sessionMedium", "inListFilter": {
            "values": ["organic", "(none)", "cpc"]}}}},
        order_metric="sessions", limit=100,
    )
    out["new_vs_returning"] = ga4(client, start, end, ["newVsReturning"],
                                  ["totalUsers", "sessions", "engagementRate"])
    out["events"] = ga4(client, start, end, ["eventName"], ["eventCount", "totalUsers"],
                        order_metric="eventCount", limit=100)
    out["landing_pages"] = ga4(client, start, end, ["landingPage"],
                               ["sessions", "engagementRate", "newUsers"], order_metric="sessions", limit=60)
    out["tools_and_research"] = ga4(
        client, start, end, ["landingPage", "sessionDefaultChannelGroup"], ["sessions", "engagementRate"],
        dim_filter={"orGroup": {"expressions": [
            {"filter": {"fieldName": "landingPage", "stringFilter": {"matchType": "BEGINS_WITH", "value": v}}}
            for v in ("/tools", "/research", "/broadband-glossary", "/saved-deals", "/alerts")
        ]}},
        order_metric="sessions", limit=60,
    )
    out["devices"] = ga4(client, start, end, ["deviceCategory"], ["sessions", "engagementRate"])
    out["countries"] = ga4(client, start, end, ["country"], ["sessions"], order_metric="sessions", limit=10)
    return out


# ---------------------------------------------------------------------------
# Tranco
# ---------------------------------------------------------------------------

def tranco_ranks(domains: list[str]) -> dict[str, Any]:
    url = "https://tranco-list.eu/top-1m.csv.zip"
    req = Request(url, headers={"User-Agent": "BroadbandPicker-research/1.0"})
    with urlopen(req, timeout=120) as resp:
        data = resp.read()
    zf = zipfile.ZipFile(io.BytesIO(data))
    name = zf.namelist()[0]
    wanted = set(domains)
    ranks: dict[str, int | None] = {d: None for d in domains}
    with zf.open(name) as fh:
        for row in csv.reader(io.TextIOWrapper(fh, encoding="utf-8")):
            if len(row) == 2 and row[1] in wanted:
                ranks[row[1]] = int(row[0])
    return {"source": url, "list_size": 1_000_000, "ranks": ranks}


# ---------------------------------------------------------------------------

def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--credentials", type=Path, default=DEFAULT_CREDENTIALS)
    ap.add_argument("--days", type=int, default=90)
    ap.add_argument("--skip-tranco", action="store_true")
    args = ap.parse_args()

    client = GoogleClient(args.credentials)
    end = date.today() - timedelta(days=2)
    start = end - timedelta(days=args.days - 1)
    prev_end = start - timedelta(days=1)
    prev_start = prev_end - timedelta(days=args.days - 1)

    result: dict[str, Any] = {"generated": date.today().isoformat(),
                              "window": {"start": start.isoformat(), "end": end.isoformat()},
                              "prior_window": {"start": prev_start.isoformat(), "end": prev_end.isoformat()}}

    print("GSC: monthly trend ...")
    result["gsc_monthly"] = monthly_trend(client, end)
    print("GSC: brand trend ...")
    result["gsc_brand_monthly"] = brand_trend(client, end)
    print("GSC: queries ...")
    result["gsc_queries"] = query_analysis(client, start, end)
    result["gsc_queries_prior"] = {k: v for k, v in query_analysis(client, prev_start, prev_end).items()
                                   if k in ("total_queries", "brand", "non_brand", "position_buckets")}
    print("GSC: pages ...")
    result["gsc_pages"] = page_analysis(client, start, end)
    result["gsc_countries"] = dimension_split(client, start, end, "country")
    result["gsc_devices"] = dimension_split(client, start, end, "device")
    result["gsc_search_appearance"] = search_appearance(client, start, end)
    result["gsc_sitemaps"] = sitemaps(client)

    print("GA4 ...")
    result["ga4"] = ga4_analysis(client, start, end)

    if not args.skip_tranco:
        print("Tranco ...")
        try:
            result["tranco"] = tranco_ranks(COMPETITORS)
        except Exception as exc:  # network / format change - non-fatal
            result["tranco"] = {"error": str(exc)[:200]}

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    out = OUT_DIR / f"{date.today().isoformat()}-authority-data.json"
    out.write_text(json.dumps(result, indent=2), encoding="utf-8")

    q = result["gsc_queries"]
    print(f"\nWrote {out.relative_to(ROOT)}")
    print(f"Non-brand clicks {q['non_brand']['clicks']:.0f} / impr {q['non_brand']['impressions']:.0f}; "
          f"brand clicks {q['brand']['clicks']:.0f} ({q['brand_share_of_clicks_pct']}%)")
    print(f"Striking-distance queries: {len(q['striking_distance'])}; "
          f"low-CTR pages: {len(result['gsc_pages']['low_ctr_pages'])}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
