#!/usr/bin/env python3
"""Evidence-led SEO/GEO review for /tools/speed-test.

Joins page/query-level GSC with GA4 landing-page and event data, then (when
SERPAPI_KEY is available) checks the UK's live organic/AI results for the
queries the page actually earns.  It writes a ranked, actionable brief rather
than promising position 1 or an AI citation.
"""

from __future__ import annotations

import argparse
import json
import os
import urllib.parse
import urllib.request
import re
from collections import Counter
from datetime import date, timedelta, timezone, datetime
from pathlib import Path

from generate_weekly_seo_intelligence import (
    DEFAULT_CREDENTIALS, GA4_PROPERTY, GoogleClient, SITE, SITE_ORIGIN,
    canonical_path, ga4_report, gsc_query, pct_change,
)

ROOT = Path(__file__).resolve().parents[1]
PAGE = f"{SITE_ORIGIN}/tools/speed-test"
OUT_JSON = ROOT / "docs/speed-test-seo-geo-analysis.json"
OUT_MD = ROOT / "docs/speed-test-seo-geo-analysis.md"
SERP_QUERIES = [
    "internet speed test", "broadband speed test", "internet speed test free",
    "broadband speed test UK", "speed test download upload", "speed test ping",
    "wifi speed test", "check broadband speed", "what is a good broadband speed",
]
COMPETITOR_PAGES = {
    "Ookla Speedtest": "https://www.speedtest.net/",
    "Cloudflare Speed Test": "https://speed.cloudflare.com/",
    "Uswitch Speed Test": "https://www.uswitch.com/broadband/speedtest/",
    "thinkbroadband Speed Test": "https://www.thinkbroadband.com/speedtest",
    "Broadband.co.uk Speed Test": "https://www.broadband.co.uk/broadband-speed-test",
}
GUIDANCE = [
    {"source": "Google AI features", "url": "https://developers.google.com/search/docs/appearance/ai-features", "rule": "No special AI markup is required; foundational SEO and visible, accurate content remain the requirement."},
    {"source": "Google helpful content", "url": "https://developers.google.com/search/docs/fundamentals/creating-helpful-content", "rule": "Demonstrate original value, clear sourcing, expertise and a satisfying people-first experience."},
    {"source": "OpenAI publisher guidance", "url": "https://help.openai.com/en/articles/12627856-publishers-and-developers-faq", "rule": "Allow OAI-SearchBot if ChatGPT discovery is desired and monitor referrals in analytics."},
]


def key(name: str) -> str | None:
    if os.environ.get(name):
        return os.environ[name]
    path = ROOT / ".env.local"
    if path.exists():
        for line in path.read_text().splitlines():
            if line.startswith(name + "="):
                return line.split("=", 1)[1].strip().strip('"')
    return None


def crawl_competitors() -> dict:
    """Extract visible structure/signals from current UK speed-test pages."""
    result = {}
    for name, url in COMPETITOR_PAGES.items():
        try:
            request = urllib.request.Request(url, headers={"User-Agent": "BroadbandPickerSEOResearch/1.0"})
            with urllib.request.urlopen(request, timeout=30) as response:
                source = response.read().decode("utf-8", errors="replace")
            text = re.sub(r"<[^>]+>", " ", source)
            text = re.sub(r"\s+", " ", text).strip().lower()
            headings = [re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", h)).strip() for h in re.findall(r"<h[1-3][^>]*>(.*?)</h[1-3]>", source, re.I | re.S)]
            result[name] = {"url": url, "status": getattr(response, "status", 200), "visible_words": len(re.findall(r"\b[\w'-]+\b", text)), "headings": headings[:20], "signals": {"download": "download" in text, "upload": "upload" in text, "ping": "ping" in text or "latency" in text, "jitter": "jitter" in text, "wifi_ethernet": "wi-fi" in text or "ethernet" in text, "troubleshooting": "slow" in text or "troubleshoot" in text, "faq": "faq" in text or "frequently asked" in text, "methodology": "method" in text or "how it works" in text}}
        except Exception as exc:
            result[name] = {"url": url, "status": "unavailable", "error": str(exc)[:200]}
    return result


def page_rows(rows: list[dict]) -> list[dict]:
    return [r for r in rows if canonical_path(r.get("keys", [""])[0]) == "/tools/speed-test"]


def metric_sum(rows: list[dict], index: int) -> float:
    return sum(float(r.get("metrics", [0])[index] or 0) for r in rows)


def serp_snapshot(queries: list[str]) -> dict:
    token = key("SERPAPI_KEY") or key("SERPAPI_API_KEY")
    if not token:
        return {"enabled": False, "reason": "SERPAPI_KEY not configured", "queries": []}
    output = []
    for query in queries:
        params = urllib.parse.urlencode({"engine": "google", "q": query, "gl": "uk", "hl": "en", "api_key": token})
        try:
            with urllib.request.urlopen("https://serpapi.com/search.json?" + params, timeout=45) as response:
                data = json.loads(response.read().decode())
            organic = data.get("organic_results", [])
            domains = [urllib.parse.urlsplit(r.get("link", "")).netloc.lower().removeprefix("www.") for r in organic[:10]]
            citations = []
            for block in data.get("ai_overview", {}).get("text_blocks", []) if isinstance(data.get("ai_overview"), dict) else []:
                for source in block.get("references", []) or []:
                    citations.append(source.get("link", ""))
            output.append({"query": query, "top10_domains": domains, "ai_overview": bool(data.get("ai_overview")), "ai_citations": citations})
        except Exception as exc:
            output.append({"query": query, "error": str(exc)[:200]})
    return {"enabled": True, "queries": output}


def recommendations(report: dict) -> list[dict]:
    current = report["gsc"]["current"]
    prior = report["gsc"]["prior"]
    recs = []
    if current["impressions"] and current["ctr"] < 0.03:
        recs.append({"priority": "P0", "action": "Run a title/snippet CTR test", "why": f"The page has {current['impressions']:.0f} impressions but only {current['ctr']:.2%} CTR; test a UK-specific title and benefit-led meta description without changing the URL."})
    if current["position"] > 10:
        recs.append({"priority": "P0", "action": "Strengthen answer-first relevance", "why": f"Average position is {current['position']:.1f}; put a concise definition, result interpretation and UK testing caveat immediately below the H1, then link to the methodology and troubleshooting sections."})
    if current["impressions"] > prior["impressions"] and current["clicks"] <= prior["clicks"]:
        recs.append({"priority": "P1", "action": "Convert impression growth into clicks", "why": "Impressions are growing without matching click growth; align title, H1, visible result copy and FAQ wording to the actual query language below."})
    if report["ga4"]["sessions"] and report["ga4"]["engagement_rate"] < 0.55:
        recs.append({"priority": "P1", "action": "Improve first-screen task completion", "why": f"GA4 engagement rate is {report['ga4']['engagement_rate']:.1%}; keep the test controls, trust explanation and result CTA above the fold on mobile."})
    recs.extend([
        {"priority": "P1", "action": "Build the secondary-intent cluster", "why": "Create clearly linked, answer-first sections for ping, jitter, upload/download differences, Wi-Fi versus Ethernet, slow results, and what speed households need; use observed GSC queries to choose headings."},
        {"priority": "P1", "action": "Increase AI Overview and LLM citability", "why": "Add 40–70 word standalone answers, dated methodology, transparent limitations, UK server/location details, and schema that matches visible text. Keep claims factual and quoteable; Google confirms there is no special AI markup requirement."},
        {"priority": "P2", "action": "Earn first-party and expert references", "why": "Publish a lightweight results methodology/data note and link it from relevant broadband guides; cite Ofcom and other primary sources, while avoiding invented accuracy or rank claims."},
        {"priority": "P2", "action": "Measure the commercial next step", "why": "Segment speed_test_started, speed_test_completed, speed_test_failed and speed_test_compare_clicked by landing page, device and result band; improve the CTA only where completion and outbound clicks support it."},
    ])
    return recs


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--credentials", type=Path, default=DEFAULT_CREDENTIALS)
    parser.add_argument("--days", type=int, default=28)
    parser.add_argument("--no-serp", action="store_true")
    args = parser.parse_args()
    end = date.today() - timedelta(days=2)
    start = end - timedelta(days=args.days - 1)
    prior_end = start - timedelta(days=1)
    prior_start = prior_end - timedelta(days=args.days - 1)
    client = GoogleClient(args.credentials)
    current_rows = page_rows(gsc_query(client, start, end, ["page"]))
    prior_rows = page_rows(gsc_query(client, prior_start, prior_end, ["page"]))
    query_rows = [r for r in gsc_query(client, start, end, ["page", "query"]) if canonical_path(r.get("keys", [""])[0]) == "/tools/speed-test"]
    def summary(rows: list[dict]) -> dict:
        clicks = sum(float(r.get("clicks", 0) or 0) for r in rows)
        impressions = sum(float(r.get("impressions", 0) or 0) for r in rows)
        return {"clicks": clicks, "impressions": impressions, "ctr": clicks / impressions if impressions else 0, "position": sum(float(r.get("position", 0)) * float(r.get("impressions", 0)) for r in rows) / impressions if impressions else 0}
    ga_rows = ga4_report(client, start, end, ["landingPagePlusQueryString"], ["sessions", "engagedSessions", "engagementRate"], {"filter": {"fieldName": "landingPagePlusQueryString", "stringFilter": {"matchType": "BEGINS_WITH", "value": "/tools/speed-test"}}})
    ga = {"sessions": metric_sum(ga_rows, 0), "engaged_sessions": metric_sum(ga_rows, 1), "engagement_rate": metric_sum(ga_rows, 1) / metric_sum(ga_rows, 0) if metric_sum(ga_rows, 0) else 0}
    report = {"generated": datetime.now(timezone.utc).isoformat(), "page": PAGE, "window": {"start": start.isoformat(), "end": end.isoformat(), "prior_start": prior_start.isoformat(), "prior_end": prior_end.isoformat()}, "gsc": {"current": summary(current_rows), "prior": summary(prior_rows), "queries": sorted([{"query": r["keys"][1], "clicks": r.get("clicks", 0), "impressions": r.get("impressions", 0), "ctr": r.get("ctr", 0), "position": r.get("position", 0)} for r in query_rows], key=lambda r: (-r["impressions"], r["position"]))[:100]}, "ga4": ga, "serp": serp_snapshot(SERP_QUERIES) if not args.no_serp else {"enabled": False, "reason": "disabled"}, "competitor_crawl": crawl_competitors(), "official_guidance": GUIDANCE}
    report["recommendations"] = recommendations(report)
    OUT_JSON.write_text(json.dumps(report, indent=2) + "\n")
    lines = [f"# Speed-test SEO/GEO analysis\n", f"Window: {start} to {end} (prior: {prior_start} to {prior_end})\n", "## GSC", json.dumps(report["gsc"], indent=2), "\n## GA4", json.dumps(ga, indent=2), "\n## Competitor crawl", json.dumps(report["competitor_crawl"], indent=2), "\n## Official guidance", json.dumps(GUIDANCE, indent=2), "\n## Recommendations\n"]
    lines.extend(f"### {r['priority']} — {r['action']}\n\n{r['why']}\n" for r in report["recommendations"])
    OUT_MD.write_text("\n".join(lines))
    print(json.dumps({"json": str(OUT_JSON), "markdown": str(OUT_MD), "recommendations": len(report["recommendations"])}, indent=2))


if __name__ == "__main__":
    main()
