#!/usr/bin/env python3
"""Audit and continuously improve BroadbandPicker's speed-test product.

This is the deterministic guardrail around the researched page-building pipeline. It:
* scrapes leading speed-test and UK comparison pages for current product/content signals;
* checks the local or production ping, download and upload endpoints;
* verifies the page's SEO, GEO, accessibility, affiliate and GA4 implementation contract;
* writes an evidence report for editorial review; and
* can hand the page to the standard researched build/deploy/tracker pipeline.

It never promises rankings or AI citations. Those are outcomes controlled by search engines.
"""

from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

import requests
from lxml import html

ROOT = Path(__file__).resolve().parents[1]
SITE = "https://broadbandpicker.co.uk"
REPORT = ROOT / "docs" / "speed-test-audit.json"
PAGE = ROOT / "app" / "speed-test" / "page.tsx"
COMPONENT = ROOT / "components" / "SpeedTest.tsx"
USER_AGENT = "BroadbandPickerSpeedTestAudit/1.0 (+https://broadbandpicker.co.uk/contact)"

COMPETITORS = [
    ("Ookla Speedtest", "https://www.speedtest.net/"),
    ("FAST.com", "https://fast.com/"),
    ("Cloudflare Speed Test", "https://speed.cloudflare.com/"),
    ("Uswitch Broadband Speed Test", "https://www.uswitch.com/broadband/speedtest/"),
    ("Broadband.co.uk Speed Test", "https://www.broadband.co.uk/broadband-speed-test"),
]

KEYWORD_MAP = [
    {"keyword": "internet speed test", "role": "primary reach", "uk_volume": 1220000, "difficulty": 66, "slot": "title, intro, tool"},
    {"keyword": "broadband speed test", "role": "primary UK", "uk_volume": 201000, "difficulty": 59, "slot": "title, H1, tool"},
    {"keyword": "internet speed test free", "role": "secondary", "uk_volume": 12100, "difficulty": 58, "slot": "intro and FAQ"},
    {"keyword": "broadband speed test in UK", "role": "secondary", "uk_volume": 6600, "difficulty": 11, "slot": "answer-first section"},
    {"keyword": "internet speed test download and upload", "role": "secondary", "uk_volume": 880, "difficulty": 65, "slot": "tool labels and methodology"},
    {"keyword": "internet speed test ping", "role": "secondary", "uk_volume": 170, "difficulty": 60, "slot": "results and definitions"},
    {"keyword": "Wi-Fi speed test vs Ethernet", "role": "supporting intent", "uk_volume": None, "difficulty": None, "slot": "accuracy guide and FAQ"},
]


def fetch(url: str, method: str = "GET", **kwargs) -> requests.Response:
    return requests.request(method, url, headers={"User-Agent": USER_AGENT}, timeout=30, **kwargs)


def scrape_competitors() -> list[dict]:
    rows = []
    for name, url in COMPETITORS:
        item = {"name": name, "url": url, "checked": datetime.now(timezone.utc).date().isoformat()}
        try:
            response = fetch(url)
            response.raise_for_status()
            tree = html.fromstring(response.content)
            text = " ".join(tree.xpath("//body//text()[normalize-space()]"))
            headings = [re.sub(r"\s+", " ", " ".join(node.itertext())).strip() for node in tree.xpath("//h1|//h2")]
            lower = text.lower()
            item.update({
                "status": response.status_code,
                "headings": headings[:20],
                "signals": {
                    "download": "download" in lower,
                    "upload": "upload" in lower,
                    "latency_or_ping": "latency" in lower or "ping" in lower,
                    "loaded_latency": "loaded" in lower and "latency" in lower,
                    "accuracy_guidance": "accurate" in lower or "accuracy" in lower,
                    "troubleshooting": "slow" in lower or "problem" in lower,
                    "commercial_next_step": "compare" in lower or "deal" in lower,
                },
                "visible_words": len(re.findall(r"\b[\w'-]+\b", text)),
            })
        except Exception as exc:
            item.update({"status": "unavailable", "error": str(exc)[:240]})
        rows.append(item)
    return rows


def check_endpoints(base_url: str) -> list[dict]:
    checks = []
    for path, method, minimum_bytes in (("ping", "GET", 0), ("download", "GET", 5_000_000), ("upload", "POST", 0)):
        url = f"{base_url.rstrip('/')}/api/speedtest/{path}?audit={int(time.time())}"
        started = time.perf_counter()
        response = fetch(url, method=method, data=(b"broadbandpicker-audit" * 1024 if method == "POST" else None))
        elapsed = time.perf_counter() - started
        body_bytes = len(response.content)
        ok_codes = {200, 204}
        checks.append({
            "endpoint": path, "url": url, "status": response.status_code,
            "elapsed_ms": round(elapsed * 1000, 1), "bytes": body_bytes,
            "cache_control": response.headers.get("cache-control", ""),
            "passed": response.status_code in ok_codes and body_bytes >= minimum_bytes and "no-store" in response.headers.get("cache-control", ""),
        })
    return checks


def source_contract() -> dict:
    page = PAGE.read_text(encoding="utf-8")
    component = COMPONENT.read_text(encoding="utf-8")
    combined = page + "\n" + component
    requirements = {
        "download_upload_ping_jitter": all(term in component.lower() for term in ("download", "upload", "ping", "jitter")),
        "ga4_start_complete_failure_cta": all(term in component for term in ("speed_test_started", "speed_test_completed", "speed_test_failed", "speed_test_compare_clicked")),
        "accessible_live_status": "aria-live" in component and "focus-visible" in component,
        "responsive_results": "grid-cols-1" in component and "sm:grid-cols" in component,
        "methodology_and_limitations": all(term in page.lower() for term in ("methodology", "limitations", "ethernet", "wi-fi")),
        "affiliate_disclosure": "commission" in combined.lower() and "/compare" in combined,
        "faq_and_webapplication_schema": "FAQPage" in page and "WebApplication" in page,
        "primary_sources": "ofcom.org.uk" in page and "developers.google.com/search" in page,
    }
    return {"requirements": requirements, "passed": all(requirements.values())}


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--base-url", default=SITE, help="Production or local origin to test")
    parser.add_argument("--skip-scrape", action="store_true")
    parser.add_argument("--build-and-deploy", action="store_true", help="Run the standard researched page writer, Vercel deploy and Sheet sync after the audit")
    args = parser.parse_args()

    report = {
        "generated": datetime.now(timezone.utc).isoformat(),
        "page": f"{SITE}/speed-test",
        "objective": "A fast, trustworthy UK speed test that diagnoses the result and gives a relevant, disclosed comparison next step.",
        "ranking_note": "The pipeline targets usefulness and discoverability; it cannot guarantee position 1, AI Overview inclusion or LLM citations.",
        "keyword_source": "Ubersuggest UK live snapshot, 2026-08-23",
        "keyword_map": KEYWORD_MAP,
        "competitors": [] if args.skip_scrape else scrape_competitors(),
        "endpoint_checks": check_endpoints(args.base_url),
        "source_contract": source_contract(),
        "required_editorial_sections": [
            "answer-first explanation", "download, upload, ping and jitter definitions",
            "speed-by-household-task table", "Wi-Fi versus Ethernet testing protocol",
            "why tests differ", "minimum guaranteed speed and complaint steps",
            "transparent test methodology and limitations", "dated primary sources", "standalone FAQs",
        ],
        "affiliate_rules": [
            "Interpret the result before showing an offer", "Use postcode-led comparison rather than claiming one universal fastest provider",
            "Show commission disclosure beside the CTA", "Track the CTA without sending a postcode or test result as personal data",
        ],
    }
    report["passed"] = all(item["passed"] for item in report["endpoint_checks"]) and report["source_contract"]["passed"]
    REPORT.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"report": str(REPORT), "passed": report["passed"], "endpoint_checks": report["endpoint_checks"], "source_contract": report["source_contract"]}, indent=2))
    if not report["passed"]:
        raise SystemExit(1)
    if args.build_and_deploy:
        subprocess.run([
            sys.executable, str(ROOT / "scripts" / "build_keyword_mapping.py"),
            "--skip-source-sheet", "--max-pages", "1000",
            "--build-page-url", f"{SITE}/speed-test", "--deploy-production",
            "--approve-factual-review", "--update-google-sheet-id", "1Ke0YWo5T-45JRpuXpfqL_0vwmcBbS0i06Da47quRRH0",
        ], cwd=ROOT, check=True)


if __name__ == "__main__":
    main()
