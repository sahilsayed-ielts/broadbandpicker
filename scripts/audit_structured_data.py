#!/usr/bin/env python3
"""Site-wide structured-data audit: find every page with rich-result issues.

Mirrors the checks Google Search Console's URL Inspection shows under
"Enhancements" (Product snippets, Merchant listings, Breadcrumbs, FAQ,
Article), so issues can be found and fixed for the whole site in one pass
rather than one URL at a time.

1. Reads every URL from the sitemap (follows sitemap indexes).
2. Fetches each page and parses all JSON-LD blocks, walking nested nodes
   (a Product inside an ItemList is still a Product).
3. Validates each rich-result type against Google's required (ERROR) and
   recommended (WARNING) properties.
4. Optional --gsc N: asks Search Console's URL Inspection API for Google's
   own verdict on N URLs (quota: 2,000 inspections a day per property), so
   the local checks can be confirmed against what Google actually sees.

Run against the live site, or a local build before deploying:
    .venv/bin/python scripts/audit_structured_data.py
    .venv/bin/python scripts/audit_structured_data.py --base http://localhost:3100
    .venv/bin/python scripts/audit_structured_data.py --gsc 40

Outputs docs/structured-data-audit.{json,md}. Exit code 1 when any ERROR is
found, so it can gate a deploy.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
import xml.etree.ElementTree as ET
from collections import Counter, defaultdict
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.parse import urlsplit, urlunsplit
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
OUT_JSON = ROOT / "docs" / "structured-data-audit.json"
OUT_MD = ROOT / "docs" / "structured-data-audit.md"
LIVE = "https://broadbandpicker.co.uk"
GSC_SITE = "sc-domain:broadbandpicker.co.uk"
CREDENTIALS = Path("/Users/sahilrafiqsayed/broadbandpicker-ga4-credentials.json")
UA = "Mozilla/5.0 (compatible; BroadbandPicker-SchemaAudit/1.0)"
LD_RE = re.compile(r'<script[^>]+type=["\']application/ld\+json["\'][^>]*>(.*?)</script>', re.I | re.S)


def fetch(url: str, timeout: int = 25) -> tuple[int, str]:
    try:
        with urlopen(Request(url, headers={"User-Agent": UA}), timeout=timeout) as resp:
            return resp.status, resp.read().decode("utf-8", errors="replace")
    except HTTPError as exc:
        return exc.code, ""
    except (URLError, TimeoutError, OSError):
        return 0, ""


def sitemap_urls(base: str) -> list[str]:
    """All page URLs from the sitemap, rewritten onto `base` (for local builds)."""
    seen: list[str] = []
    queue = [f"{base}/sitemap.xml"]
    while queue:
        status, xml = fetch(queue.pop())
        if status != 200:
            continue
        tree = ET.fromstring(xml.encode())
        ns = {"s": "http://www.sitemaps.org/schemas/sitemap/0.9"}
        for loc in tree.findall(".//s:sitemap/s:loc", ns):
            queue.append(rebase(loc.text.strip(), base))
        for loc in tree.findall(".//s:url/s:loc", ns):
            seen.append(rebase(loc.text.strip(), base))
    return sorted(set(seen))


def rebase(url: str, base: str) -> str:
    parts, b = urlsplit(url), urlsplit(base)
    return urlunsplit((b.scheme, b.netloc, parts.path, parts.query, ""))


def walk(node: Any, out: list[dict[str, Any]]) -> None:
    if isinstance(node, dict):
        if "@type" in node:
            out.append(node)
        for value in node.values():
            walk(value, out)
    elif isinstance(node, list):
        for item in node:
            walk(item, out)


def types_of(node: dict[str, Any]) -> set[str]:
    raw = node.get("@type")
    return set(raw) if isinstance(raw, list) else {str(raw)}


def has(node: dict[str, Any], key: str) -> bool:
    value = node.get(key)
    return value not in (None, "", [], {})


def offers_of(node: dict[str, Any]) -> list[dict[str, Any]]:
    offers = node.get("offers")
    if isinstance(offers, dict):
        return [offers]
    if isinstance(offers, list):
        return [o for o in offers if isinstance(o, dict)]
    return []


def check_page(html: str) -> tuple[list[dict[str, str]], Counter]:
    """Return (issues, detected type counts) for one page's JSON-LD."""
    issues: list[dict[str, str]] = []
    detected: Counter = Counter()
    nodes: list[dict[str, Any]] = []
    for block in LD_RE.findall(html):
        try:
            walk(json.loads(block), nodes)
        except json.JSONDecodeError as exc:
            issues.append({"type": "JSON-LD", "severity": "ERROR", "issue": f"Unparseable JSON-LD ({exc.msg})", "item": ""})

    def add(kind: str, severity: str, issue: str, item: str) -> None:
        issues.append({"type": kind, "severity": severity, "issue": issue, "item": item[:90]})

    for node in nodes:
        t = types_of(node)
        name = str(node.get("name") or node.get("headline") or "")

        if "Product" in t:
            detected["Product snippets"] += 1
            if not has(node, "name"):
                add("Product snippets", "ERROR", 'Missing field "name"', name)
            if not (offers_of(node) or has(node, "review") or has(node, "aggregateRating")):
                add("Product snippets", "ERROR", 'Needs one of "offers", "review" or "aggregateRating"', name)
            # Google flags these as non-critical; we only record them, never fabricate them.
            if not has(node, "review"):
                add("Product snippets", "WARNING", 'Missing field "review"', name)
            if not has(node, "aggregateRating"):
                add("Product snippets", "WARNING", 'Missing field "aggregateRating"', name)

            # A Product with an Offer is also evaluated as a merchant listing.
            if offers_of(node):
                detected["Merchant listings"] += 1
                if not has(node, "image"):
                    add("Merchant listings", "ERROR", 'Missing field "image"', name)
                if not has(node, "description"):
                    add("Merchant listings", "WARNING", 'Missing field "description"', name)
                for offer in offers_of(node):
                    if not (has(offer, "price") or has(offer, "priceSpecification")):
                        add("Merchant listings", "ERROR", 'Offer missing "price"', name)
                    if not has(offer, "priceCurrency"):
                        add("Merchant listings", "ERROR", 'Offer missing "priceCurrency"', name)
                    if not has(offer, "shippingDetails"):
                        add("Merchant listings", "WARNING", 'Missing field "shippingDetails"', name)
                    if not has(offer, "hasMerchantReturnPolicy") and not has(node, "hasMerchantReturnPolicy"):
                        add("Merchant listings", "WARNING", 'Missing field "hasMerchantReturnPolicy"', name)
                    if not has(offer, "validFrom"):
                        add("Merchant listings", "WARNING", 'Missing field "validFrom"', name)

        if "BreadcrumbList" in t:
            detected["Breadcrumbs"] += 1
            items = node.get("itemListElement") or []
            if not items:
                add("Breadcrumbs", "ERROR", 'Missing "itemListElement"', name)
            for index, item in enumerate(items if isinstance(items, list) else []):
                if not isinstance(item, dict) or not has(item, "name"):
                    add("Breadcrumbs", "ERROR", 'ListItem missing "name"', name)
                if isinstance(item, dict) and not has(item, "position"):
                    add("Breadcrumbs", "ERROR", 'ListItem missing "position"', name)
                if isinstance(item, dict) and index < len(items) - 1 and not has(item, "item"):
                    add("Breadcrumbs", "ERROR", 'ListItem missing "item" URL', name)

        if "FAQPage" in t:
            detected["FAQ"] += 1
            for q in node.get("mainEntity") or []:
                if not isinstance(q, dict) or not has(q, "name"):
                    add("FAQ", "ERROR", 'Question missing "name"', name)
                elif not isinstance(q.get("acceptedAnswer"), dict) or not has(q["acceptedAnswer"], "text"):
                    add("FAQ", "ERROR", 'Question missing "acceptedAnswer.text"', str(q.get("name")))

        if t & {"Article", "NewsArticle", "BlogPosting"}:
            detected["Article"] += 1
            if not has(node, "headline"):
                add("Article", "WARNING", 'Missing field "headline"', name)
            if not has(node, "image"):
                add("Article", "WARNING", 'Missing field "image"', name)
            if not has(node, "datePublished"):
                add("Article", "WARNING", 'Missing field "datePublished"', name)
            if not has(node, "author"):
                add("Article", "WARNING", 'Missing field "author"', name)

    return issues, detected


def gsc_inspect(urls: list[str]) -> dict[str, dict[str, Any]]:
    from google.auth.transport.requests import AuthorizedSession
    from google.oauth2 import service_account

    creds = service_account.Credentials.from_service_account_file(
        str(CREDENTIALS), scopes=["https://www.googleapis.com/auth/webmasters"]
    )
    session = AuthorizedSession(creds)
    results: dict[str, dict[str, Any]] = {}
    for url in urls:
        live_url = rebase(url, LIVE)
        resp = session.post(
            "https://searchconsole.googleapis.com/v1/urlInspection/index:inspect",
            json={"inspectionUrl": live_url, "siteUrl": GSC_SITE},
            timeout=60,
        )
        if resp.status_code != 200:
            results[live_url] = {"error": f"HTTP {resp.status_code}"}
            continue
        r = resp.json().get("inspectionResult", {})
        idx, rich = r.get("indexStatusResult", {}), r.get("richResultsResult", {})
        counts: Counter = Counter()
        for detected in rich.get("detectedItems", []):
            for item in detected.get("items", []):
                for issue in item.get("issues", []):
                    counts[(detected["richResultType"], issue["severity"], issue["issueMessage"])] += 1
        results[live_url] = {
            "coverage": idx.get("coverageState"),
            "last_crawl": idx.get("lastCrawlTime"),
            "rich_verdict": rich.get("verdict"),
            "issues": [{"type": k[0], "severity": k[1], "issue": k[2], "count": v} for k, v in counts.items()],
        }
    return results


def page_group(path: str) -> str:
    parts = [p for p in path.split("/") if p]
    if not parts:
        return "homepage"
    if parts[0] == "providers" and len(parts) > 1 and parts[1] == "compare":
        return "provider comparison"
    return {"providers": "provider", "postcode": "postcode", "guides": "guide", "deals": "deals",
            "research": "research", "tools": "tool"}.get(parts[0], "other")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--base", default=LIVE, help="site to audit (live or a local build)")
    parser.add_argument("--limit", type=int, default=0, help="audit only the first N sitemap URLs")
    parser.add_argument("--gsc", type=int, default=0, help="also inspect N affected URLs with Search Console")
    parser.add_argument("--workers", type=int, default=8)
    args = parser.parse_args()
    base = args.base.rstrip("/")

    urls = sitemap_urls(base)
    if args.limit:
        urls = urls[: args.limit]
    print(f"Auditing {len(urls)} URLs from {base}/sitemap.xml")

    def audit(url: str) -> dict[str, Any]:
        status, html = fetch(url)
        if status != 200:
            return {"url": url, "status": status, "issues": [], "detected": {}}
        issues, detected = check_page(html)
        return {"url": url, "status": status, "issues": issues, "detected": dict(detected)}

    with ThreadPoolExecutor(max_workers=args.workers) as pool:
        pages = list(pool.map(audit, urls))

    summary: Counter = Counter()
    pages_per_issue: dict[tuple[str, str, str], set[str]] = defaultdict(set)
    groups_per_issue: dict[tuple[str, str, str], Counter] = defaultdict(Counter)
    for page in pages:
        path = urlsplit(page["url"]).path
        for issue in page["issues"]:
            key = (issue["type"], issue["severity"], issue["issue"])
            summary[key] += 1
            pages_per_issue[key].add(path)
            groups_per_issue[key][page_group(path)] += 1
    failed = [p for p in pages if p["status"] != 200]
    error_pages = sorted({urlsplit(p["url"]).path for p in pages if any(i["severity"] == "ERROR" for i in p["issues"])})

    gsc: dict[str, Any] = {}
    if args.gsc:
        sample = [p["url"] for p in pages if any(i["severity"] == "ERROR" for i in p["issues"])][: args.gsc]
        print(f"Inspecting {len(sample)} URLs with Search Console…")
        gsc = gsc_inspect(sample)

    result = {
        "generated": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "base": base,
        "urls_audited": len(pages),
        "fetch_failures": [{"url": p["url"], "status": p["status"]} for p in failed],
        "pages_with_errors": error_pages,
        "summary": [
            {"type": k[0], "severity": k[1], "issue": k[2], "occurrences": n, "pages": len(pages_per_issue[k]),
             "by_page_type": dict(groups_per_issue[k])}
            for k, n in sorted(summary.items(), key=lambda kv: (kv[0][1] != "ERROR", -kv[1]))
        ],
        "gsc_inspection": gsc,
        "pages": pages,
    }
    OUT_JSON.parent.mkdir(parents=True, exist_ok=True)
    OUT_JSON.write_text(json.dumps(result, indent=2) + "\n", encoding="utf-8")

    lines = [
        "# Structured data audit", "",
        f"Generated {result['generated']} by `scripts/audit_structured_data.py` against `{base}`.", "",
        f"- URLs audited: **{len(pages)}** (fetch failures: {len(failed)})",
        f"- Pages with at least one ERROR: **{len(error_pages)}**", "",
        "| Type | Severity | Issue | Pages | Occurrences | Page types |", "|---|---|---|---:|---:|---|",
    ]
    for row in result["summary"]:
        groups = ", ".join(f"{k} {v}" for k, v in sorted(row["by_page_type"].items(), key=lambda kv: -kv[1]))
        lines.append(f"| {row['type']} | {row['severity']} | {row['issue']} | {row['pages']} | {row['occurrences']} | {groups} |")
    if gsc:
        lines += ["", "## Search Console URL Inspection (Google's own verdict)", "",
                  "| URL | Coverage | Last crawl | Rich results | Issues |", "|---|---|---|---|---|"]
        for url, r in gsc.items():
            issues = "; ".join(f"{i['severity']} {i['type']}: {i['issue']} ×{i['count']}" for i in r.get("issues", []))
            lines.append(f"| {urlsplit(url).path} | {r.get('coverage', r.get('error'))} | {r.get('last_crawl', '')} | {r.get('rich_verdict', '')} | {issues} |")
    if failed:
        lines += ["", "## Fetch failures", ""] + [f"- {p['url']} ({p['status']})" for p in failed]
    OUT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")

    for row in result["summary"]:
        print(f"{row['severity']:7} {row['type']:18} {row['issue']:48} pages={row['pages']}")
    print(f"Pages with errors: {len(error_pages)} / {len(pages)}. Saved {OUT_MD.relative_to(ROOT)}")
    return 1 if error_pages else 0


if __name__ == "__main__":
    raise SystemExit(main())
