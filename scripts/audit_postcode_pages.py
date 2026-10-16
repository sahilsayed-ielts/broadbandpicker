#!/usr/bin/env python3
"""Postcode page inventory audit: which postcode pages earn their place in Google.

The site publishes three kinds of /postcode/ page from one template:
  - city: hand-written priority pages (data/priority-pages.ts) and the /postcode hub
  - curated: the postcode areas in data/postcodes.ts (some with local intel)
  - district: auto-generated from Ofcom district coverage data
    (data/postcode-district-coverage.json), the bulk of the inventory

Google's spam policies treat many near-identical, auto-generated pages made
mainly to rank ("scaled content abuse") as low value, and its indexing
guidance says to keep low-value URLs out of sitemaps and the index so crawl
effort goes to pages that help people. This script measures each class on
the evidence Google itself uses:

1. Inventory: every URL in /postcode/sitemap.xml, classified.
2. Demand: Search Console impressions, clicks and position per URL
   (last 90 days, final data), and how many URLs in each class earn any.
3. Index status: URL Inspection API verdict for a stratified sample
   (default 25 per class; quota 2,000/day).
4. Content: fetches a sample of each class and measures visible word count
   and how much of each page's text is shared template boilerplate
   (5-word shingles that appear on most pages of the class) versus text
   unique to that page.

Outputs docs/postcode-page-audit.{json,md}.

Usage:
    .venv/bin/python scripts/audit_postcode_pages.py
    .venv/bin/python scripts/audit_postcode_pages.py --inspect-per-class 40 --content-per-class 60
"""

from __future__ import annotations

import argparse
import html as htmllib
import json
import random
import time
import re
import xml.etree.ElementTree as ET
from collections import Counter, defaultdict
from concurrent.futures import ThreadPoolExecutor
from datetime import date, timedelta
from pathlib import Path
from statistics import median
from typing import Any
from urllib.parse import quote, urlsplit
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
OUT_JSON = ROOT / "docs" / "postcode-page-audit.json"
OUT_MD = ROOT / "docs" / "postcode-page-audit.md"
SITE = "https://broadbandpicker.co.uk"
GSC_SITE = "sc-domain:broadbandpicker.co.uk"
CREDENTIALS = Path("/Users/sahilrafiqsayed/broadbandpicker-ga4-credentials.json")
UA = "Mozilla/5.0 (compatible; BroadbandPicker-PostcodeAudit/1.0)"
CITY_SLUGS = {"london", "manchester", "birmingham", "bristol", "leeds", "liverpool", "glasgow", "edinburgh", "sheffield"}


def fetch(url: str) -> tuple[int, str]:
    try:
        with urlopen(Request(url, headers={"User-Agent": UA}), timeout=30) as resp:
            return resp.status, resp.read().decode("utf-8", errors="replace")
    except Exception as exc:  # noqa: BLE001
        return getattr(exc, "code", 0), ""


def curated_prefixes() -> set[str]:
    text = (ROOT / "data" / "postcodes.ts").read_text(encoding="utf-8")
    return {m.lower() for m in re.findall(r"prefix:\s*'([A-Za-z0-9]+)'", text)}


def classify(path: str, curated: set[str]) -> str:
    slug = path.rstrip("/").split("/")[-1].lower()
    if path.rstrip("/") == "/postcode" or slug in CITY_SLUGS:
        return "city"
    return "curated" if slug in curated else "district"


def visible_text(html: str) -> str:
    main = re.search(r"<main\b[^>]*>(.*?)</main>", html, re.S | re.I)
    body = main.group(1) if main else html
    body = re.sub(r"<(script|style|noscript|svg|nav|footer)[^>]*>.*?</\1>", " ", body, flags=re.S | re.I)
    return re.sub(r"\s+", " ", htmllib.unescape(re.sub(r"<[^>]+>", " ", body))).strip()


def shingles(text: str, n: int = 5) -> set[str]:
    words = re.findall(r"[a-z0-9£%']+", text.lower())
    # Mask numbers so "48% gigabit" and "71% gigabit" count as the same template sentence.
    words = ["#" if re.fullmatch(r"[£]?\d[\d.,%]*", w) else w for w in words]
    return {" ".join(words[i : i + n]) for i in range(max(0, len(words) - n + 1))}


def google_session():
    from google.auth.transport.requests import AuthorizedSession
    from google.oauth2 import service_account

    creds = service_account.Credentials.from_service_account_file(
        str(CREDENTIALS), scopes=["https://www.googleapis.com/auth/webmasters"]
    )
    return AuthorizedSession(creds)


def gsc_performance(session, days: int) -> dict[str, dict[str, float]]:
    end = date.today() - timedelta(days=3)
    start = end - timedelta(days=days - 1)
    rows: list[dict[str, Any]] = []
    start_row = 0
    while True:
        resp = session.post(
            f"https://www.googleapis.com/webmasters/v3/sites/{quote(GSC_SITE, safe='')}/searchAnalytics/query",
            json={
                "startDate": start.isoformat(), "endDate": end.isoformat(), "dimensions": ["page"],
                "dimensionFilterGroups": [{"filters": [{"dimension": "page", "operator": "contains", "expression": "/postcode"}]}],
                "rowLimit": 25000, "startRow": start_row, "dataState": "final",
            },
            timeout=120,
        ).json()
        batch = resp.get("rows", [])
        rows.extend(batch)
        if len(batch) < 25000:
            break
        start_row += 25000
    out = {}
    for row in rows:
        path = urlsplit(row["keys"][0]).path.rstrip("/") or "/"
        out[path] = {"impressions": row["impressions"], "clicks": row["clicks"], "position": row["position"]}
    return out


def inspect(session, url: str) -> dict[str, Any]:
    resp = None
    for attempt in range(4):
        try:
            resp = session.post(
                "https://searchconsole.googleapis.com/v1/urlInspection/index:inspect",
                json={"inspectionUrl": url, "siteUrl": GSC_SITE}, timeout=60,
            )
            if resp.status_code in (429, 500, 503):
                raise ConnectionError(f"HTTP {resp.status_code}")
            break
        except Exception as exc:  # noqa: BLE001 - network resets are common on long runs
            if attempt == 3:
                return {"error": f"{type(exc).__name__}"}
            time.sleep(2 ** attempt * 2)
    if resp is None or resp.status_code != 200:
        return {"error": f"HTTP {getattr(resp, 'status_code', 0)}"}
    idx = resp.json().get("inspectionResult", {}).get("indexStatusResult", {})
    return {
        "coverage": idx.get("coverageState"),
        "verdict": idx.get("verdict"),
        "last_crawl": idx.get("lastCrawlTime"),
        "google_canonical": idx.get("googleCanonical"),
        "referring_urls": len(idx.get("referringUrls") or []),
        "sitemaps": idx.get("sitemap") or [],
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--days", type=int, default=90)
    parser.add_argument("--inspect-per-class", type=int, default=25)
    parser.add_argument("--content-per-class", type=int, default=40)
    parser.add_argument("--seed", type=int, default=7)
    args = parser.parse_args()
    random.seed(args.seed)

    status, xml = fetch(f"{SITE}/postcode/sitemap.xml")
    ns = {"s": "http://www.sitemaps.org/schemas/sitemap/0.9"}
    urls = [loc.text.strip() for loc in ET.fromstring(xml.encode()).findall(".//s:url/s:loc", ns)] if status == 200 else []
    curated = curated_prefixes()
    by_class: dict[str, list[str]] = defaultdict(list)
    for url in urls:
        by_class[classify(urlsplit(url).path, curated)].append(url)
    print("Inventory:", {k: len(v) for k, v in by_class.items()})

    session = google_session()
    perf = gsc_performance(session, args.days)
    sitemap_paths = {urlsplit(u).path.rstrip("/") for u in urls}
    off_sitemap = {p: v for p, v in perf.items() if p not in sitemap_paths}

    demand: dict[str, dict[str, Any]] = {}
    for cls, members in by_class.items():
        stats = [perf.get(urlsplit(u).path.rstrip("/")) for u in members]
        with_impr = [s for s in stats if s and s["impressions"] > 0]
        with_clicks = [s for s in stats if s and s["clicks"] > 0]
        demand[cls] = {
            "urls": len(members),
            "urls_with_impressions": len(with_impr),
            "urls_with_clicks": len(with_clicks),
            "impressions": sum(s["impressions"] for s in with_impr),
            "clicks": sum(s["clicks"] for s in with_impr),
            "median_position": round(median([s["position"] for s in with_impr]), 1) if with_impr else None,
            "top": sorted(
                ({"path": urlsplit(u).path, **perf[urlsplit(u).path.rstrip("/")]} for u in members if urlsplit(u).path.rstrip("/") in perf),
                key=lambda r: -r["impressions"],
            )[:10],
        }
    print("Demand:", {k: (v["urls_with_impressions"], v["clicks"]) for k, v in demand.items()})

    inspected: dict[str, list[dict[str, Any]]] = {}
    for cls, members in by_class.items():
        sample = members if len(members) <= args.inspect_per_class else random.sample(members, args.inspect_per_class)
        print(f"Inspecting {len(sample)} {cls} URLs…")
        rows = []
        for i, u in enumerate(sample, 1):
            rows.append({"url": u, **inspect(session, u)})
            if i % 10 == 0:
                print(f"  {cls}: {i}/{len(sample)}", flush=True)
        inspected[cls] = rows

    content: dict[str, dict[str, Any]] = {}
    for cls, members in by_class.items():
        sample = members if len(members) <= args.content_per_class else random.sample(members, args.content_per_class)
        with ThreadPoolExecutor(max_workers=8) as pool:
            pages = list(pool.map(fetch, sample))
        texts = [(u, visible_text(h)) for u, (s, h) in zip(sample, pages) if s == 200 and h]
        sets = [shingles(t) for _, t in texts]
        freq = Counter(sh for s in sets for sh in s)
        common = {sh for sh, n in freq.items() if n >= max(2, 0.5 * len(sets))}
        rows = []
        for (u, t), s in zip(texts, sets):
            unique = len(s - common)
            rows.append({"url": u, "words": len(t.split()), "unique_share": round(unique / len(s), 3) if s else 0})
        content[cls] = {
            "sampled": len(rows),
            "median_words": int(median([r["words"] for r in rows])) if rows else 0,
            "median_unique_share": round(median([r["unique_share"] for r in rows]), 3) if rows else 0,
            "pages": rows,
        }
    print("Content:", {k: (v["median_words"], v["median_unique_share"]) for k, v in content.items()})

    result = {
        "generated": date.today().isoformat(),
        "window_days": args.days,
        "inventory": {k: len(v) for k, v in by_class.items()},
        "demand": demand,
        "postcode_urls_in_gsc_not_in_sitemap": dict(sorted(off_sitemap.items(), key=lambda kv: -kv[1]["impressions"])[:50]),
        "postcode_urls_in_gsc_not_in_sitemap_count": len(off_sitemap),
        "index_sample": {
            cls: {"inspected": len(rows), "coverage": Counter(r.get("coverage") or r.get("error") for r in rows), "rows": rows}
            for cls, rows in inspected.items()
        },
        "content": content,
    }
    OUT_JSON.write_text(json.dumps(result, indent=2, default=dict) + "\n", encoding="utf-8")

    lines = [
        "# Postcode page audit", "",
        f"Generated {result['generated']} by `scripts/audit_postcode_pages.py`. Search Console window: last {args.days} days (final data).", "",
        "| Class | URLs in sitemap | URLs with impressions | URLs with clicks | Impressions | Clicks | Median position | Median words | Unique text share |",
        "|---|---:|---:|---:|---:|---:|---:|---:|---:|",
    ]
    for cls in ("city", "curated", "district"):
        d, c = demand.get(cls, {}), content.get(cls, {})
        if not d:
            continue
        lines.append(
            f"| {cls} | {d['urls']:,} | {d['urls_with_impressions']:,} | {d['urls_with_clicks']:,} | {d['impressions']:,.0f} | "
            f"{d['clicks']:,.0f} | {d['median_position']} | {c.get('median_words', '')} | {100 * c.get('median_unique_share', 0):.0f}% |"
        )
    lines += ["", "## Google index status (URL Inspection sample)", ""]
    for cls, block in result["index_sample"].items():
        lines.append(f"- **{cls}** ({block['inspected']} inspected): " + ", ".join(f"{k}: {v}" for k, v in block["coverage"].items()))
    lines += ["", f"## Postcode URLs Google shows that are not in the sitemap: {len(off_sitemap)}", ""]
    for path, v in list(result["postcode_urls_in_gsc_not_in_sitemap"].items())[:15]:
        lines.append(f"- `{path}`: {v['impressions']:,.0f} impressions, {v['clicks']:,.0f} clicks")
    for cls in ("city", "curated", "district"):
        if cls in demand:
            lines += ["", f"## Top {cls} pages by impressions", ""]
            lines += [f"- `{r['path']}`: {r['impressions']:,.0f} impr., {r['clicks']:,.0f} clicks, pos {r['position']:.1f}" for r in demand[cls]["top"]]
    OUT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"Saved {OUT_MD.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
