#!/usr/bin/env python3
"""Audit leading UK affiliate/comparison sites for UX and Google SERP signals.

This is competitive research, not content scraping for reuse: it records what
each competitor's broadband landing page *does* (tools present, trust signals,
content depth, navigation, schema) so BroadbandPicker's UX/content/functionality
roadmap is evidence-led rather than guessed. It does not copy or store their
prose.

Usage:
    python3 scripts/scrape_competitor_landscape.py
    python3 scripts/scrape_competitor_landscape.py --output docs/my-scan.json

Many of these sites are JS-rendered SPAs or sit behind bot protection, so a
plain HTTP GET often only returns the initial HTML shell. The script reports
that honestly per target (`js_rendered_suspected`) rather than pretending a
thin response is a full read — treat those rows as "needs a manual look",
not missing data.
"""

from __future__ import annotations

import argparse
import json
import re
import time
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from urllib.parse import urljoin

import requests
from lxml import html

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_OUTPUT = ROOT / "docs" / "competitor-landscape-scan.json"
RUN_DATE = datetime.now(timezone.utc).date().isoformat()
USER_AGENT = (
    "BroadbandPickerCompetitorResearchBot/1.0 "
    "(UX/content research; contact: https://broadbandpicker.co.uk/contact)"
)

TARGETS = [
    ("BroadbandPicker", "https://broadbandpicker.co.uk/"),
    ("Uswitch", "https://www.uswitch.com/broadband/"),
    ("Compare the Market", "https://www.comparethemarket.com/broadband/"),
    ("MoneySuperMarket", "https://www.moneysupermarket.com/broadband/"),
    ("Which? best deals", "https://www.which.co.uk/reviews/broadband/article/best-cheap-fibre-and-broadband-deals-abddl2F4Vf5B"),
    ("Which? Switch Broadband", "https://broadband.which.co.uk/"),
    ("broadbandchoices", "https://www.broadbandchoices.co.uk/"),
    ("choose.co.uk", "https://www.choose.co.uk/broadband/"),
    ("broadband.co.uk", "https://www.broadband.co.uk/broadband"),
    ("MoneySavingExpert", "https://www.moneysavingexpert.com/"),
    ("NerdWallet UK", "https://www.nerdwallet.com/uk/"),
    ("Go.Compare", "https://www.gocompare.com/"),
]

TRUST_SIGNAL_PATTERNS = [
    ("award", r"\baward"),
    ("as_seen_in_press", r"as (?:seen|featured) in"),
    ("trustpilot", r"trustpilot"),
    ("review_count", r"[\d,]{3,}\+?\s*(?:reviews|ratings)"),
    ("regulator_mention", r"\bofcom\b"),
    ("accreditation", r"which\?\s*(?:recommended|trusted)|fca regulated|ico registered"),
]
TOOL_SIGNAL_PATTERNS = [
    ("postcode_checker", r"postcode|enter your address|check availability"),
    ("speed_test", r"speed test|test your speed"),
    ("comparison_table", r"compare deals|comparison table|<table"),
    ("price_alert", r"price alert|notify me|email me deals"),
    ("live_chat", r"live chat|chat with us|intercom|drift\.load|zendesk"),
    ("calculator", r"calculator|cost calculator|savings calculator"),
    ("filter_widget", r"filter by|refine your search|sort by"),
    ("video_content", r"<video|youtube\.com/embed|wistia|vimeo"),
]


@dataclass
class SiteScan:
    name: str
    url: str
    status: int | str = ""
    title: str = ""
    meta_description: str = ""
    canonical_url: str = ""
    og_site_name: str = ""
    favicon_url: str = ""
    favicon_sizes: str = ""
    favicon_content_type: str = ""
    favicon_status: int | str = ""
    title_length: int = 0
    meta_description_length: int = 0
    h1: str = ""
    h2_count: int = 0
    word_count: int = 0
    html_bytes: int = 0
    js_rendered_suspected: bool = False
    nav_labels: list[str] = field(default_factory=list)
    schema_types: list[str] = field(default_factory=list)
    website_names: list[str] = field(default_factory=list)
    organization_names: list[str] = field(default_factory=list)
    organization_logos: list[str] = field(default_factory=list)
    trust_signals_found: list[str] = field(default_factory=list)
    tool_signals_found: list[str] = field(default_factory=list)
    internal_link_count: int = 0
    notes: str = ""


def fetch(url: str, timeout: int = 20) -> requests.Response:
    return requests.get(
        url,
        headers={
            "User-Agent": USER_AGENT,
            "Accept-Language": "en-GB,en;q=0.9",
        },
        timeout=timeout,
    )


def scan_site(name: str, url: str) -> SiteScan:
    scan = SiteScan(name=name, url=url)
    try:
        response = fetch(url)
        scan.status = response.status_code
        scan.html_bytes = len(response.content)
        if response.status_code != 200 or not response.content:
            scan.notes = f"Non-200 or empty response ({response.status_code})"
            return scan

        tree = html.fromstring(response.content)
        text_content = " ".join(tree.xpath("//body//text()[normalize-space()]"))
        clean_text = re.sub(r"\s+", " ", text_content).strip()
        lower = clean_text.lower()

        scan.title = " ".join(tree.xpath("//title/text()")).strip()
        scan.title_length = len(scan.title)
        descriptions = tree.xpath(
            "//meta[translate(@name,'ABCDEFGHIJKLMNOPQRSTUVWXYZ',"
            "'abcdefghijklmnopqrstuvwxyz')='description']/@content"
        )
        scan.meta_description = descriptions[0].strip() if descriptions else ""
        scan.meta_description_length = len(scan.meta_description)
        canonicals = tree.xpath("//link[translate(@rel,'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz')='canonical']/@href")
        scan.canonical_url = canonicals[0].strip() if canonicals else ""
        site_names = tree.xpath("//meta[translate(@property,'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz')='og:site_name']/@content")
        scan.og_site_name = site_names[0].strip() if site_names else ""

        icon_nodes = tree.xpath(
            "//link[contains(concat(' ', translate(@rel,'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'), ' '), ' icon ')]"
        )
        if icon_nodes:
            icon = icon_nodes[0]
            scan.favicon_url = urljoin(response.url, icon.get('href', ''))
            scan.favicon_sizes = icon.get('sizes', '')
            try:
                icon_response = fetch(scan.favicon_url)
                scan.favicon_status = icon_response.status_code
                scan.favicon_content_type = icon_response.headers.get('Content-Type', '').split(';')[0]
            except Exception as exc:
                scan.favicon_status = "error"
                scan.notes = f"Favicon fetch failed: {str(exc)[:100]}"
        h1s = [re.sub(r"\s+", " ", t).strip() for t in tree.xpath("//h1//text()")]
        scan.h1 = " / ".join(h for h in h1s if h)[:200]
        scan.h2_count = len(tree.xpath("//h2"))
        scan.word_count = len(re.findall(r"\b[\w'-]+\b", clean_text))

        nav_links = tree.xpath("//nav//a/text() | //header//a/text()")
        scan.nav_labels = sorted({re.sub(r"\s+", " ", n).strip() for n in nav_links if n.strip()})[:25]

        schema_types: set[str] = set()
        website_names: set[str] = set()
        organization_names: set[str] = set()
        organization_logos: set[str] = set()

        def walk_schema(value: Any) -> None:
            if isinstance(value, list):
                for item in value:
                    walk_schema(item)
                return
            if not isinstance(value, dict):
                return
            node_type = value.get("@type")
            types = node_type if isinstance(node_type, list) else [node_type] if node_type else []
            schema_types.update(str(item) for item in types)
            if "WebSite" in types:
                for key in ("name", "alternateName"):
                    names = value.get(key, [])
                    names = names if isinstance(names, list) else [names]
                    website_names.update(str(item) for item in names if item)
            if "Organization" in types:
                if value.get("name"):
                    organization_names.add(str(value["name"]))
                logo = value.get("logo")
                if isinstance(logo, str):
                    organization_logos.add(logo)
                elif isinstance(logo, dict) and logo.get("url"):
                    organization_logos.add(str(logo["url"]))
            for child in value.values():
                if isinstance(child, (dict, list)):
                    walk_schema(child)

        for raw in tree.xpath("//script[@type='application/ld+json']/text()"):
            try:
                payload = json.loads(raw)
                walk_schema(payload)
            except (json.JSONDecodeError, TypeError):
                pass
        scan.schema_types = sorted(schema_types)
        scan.website_names = sorted(website_names)
        scan.organization_names = sorted(organization_names)
        scan.organization_logos = sorted(organization_logos)

        scan.trust_signals_found = [
            label for label, pattern in TRUST_SIGNAL_PATTERNS if re.search(pattern, lower)
        ]
        raw_html_lower = response.text.lower()
        scan.tool_signals_found = [
            label for label, pattern in TOOL_SIGNAL_PATTERNS
            if re.search(pattern, lower) or re.search(pattern, raw_html_lower)
        ]

        links = tree.xpath("//a[@href]/@href")
        domain_fragment = url.split("//")[-1].split("/")[0].replace("www.", "")
        scan.internal_link_count = sum(
            1 for link in links if link.startswith("/") or domain_fragment in link
        )

        # A thin body with almost no headings/words but a normal HTML size
        # strongly suggests client-side rendering hid the real content.
        if scan.word_count < 120 and scan.h2_count == 0:
            scan.js_rendered_suspected = True
            scan.notes = "Body text is thin — likely JS-rendered; treat as needing a manual look, not as a full read."

    except Exception as exc:
        scan.notes = str(exc)[:250]
    return scan


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    args = parser.parse_args()

    results: list[dict[str, Any]] = []
    for name, url in TARGETS:
        print(f"Scanning {name} ({url})")
        scan = scan_site(name, url)
        results.append(asdict(scan))
        time.sleep(0.5)

    successful = [site for site in results if site["status"] == 200]
    benchmarks = {
        "successful_scans": len(successful),
        "sites_with_fetchable_favicon": sum(1 for site in successful if site["favicon_status"] == 200),
        "sites_with_website_schema": sum(1 for site in successful if "WebSite" in site["schema_types"]),
        "sites_with_organization_schema": sum(1 for site in successful if "Organization" in site["schema_types"]),
        "sites_with_og_site_name": sum(1 for site in successful if site["og_site_name"]),
        "median_title_length": sorted(site["title_length"] for site in successful)[len(successful) // 2] if successful else 0,
        "median_meta_description_length": sorted(site["meta_description_length"] for site in successful)[len(successful) // 2] if successful else 0,
    }
    payload = {
        "generated": RUN_DATE,
        "scope": "Structural, branding and SERP-source signals only; no competitor prose is retained or reused.",
        "benchmarks": benchmarks,
        "sites": results,
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    print(f"Saved {args.output.resolve()}")
    print(json.dumps({"sites_scanned": len(results)}, indent=2))


if __name__ == "__main__":
    main()
