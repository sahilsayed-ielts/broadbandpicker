#!/usr/bin/env python3
"""Scrape the leading UK broadband comparison sites for structural/UX signals.

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
    ("Uswitch", "https://www.uswitch.com/broadband/"),
    ("Compare the Market", "https://www.comparethemarket.com/broadband/"),
    ("MoneySuperMarket", "https://www.moneysupermarket.com/broadband/"),
    ("Which? best deals", "https://www.which.co.uk/reviews/broadband/article/best-cheap-fibre-and-broadband-deals-abddl2F4Vf5B"),
    ("Which? Switch Broadband", "https://broadband.which.co.uk/"),
    ("broadbandchoices", "https://www.broadbandchoices.co.uk/"),
    ("choose.co.uk", "https://www.choose.co.uk/broadband/"),
    ("broadband.co.uk", "https://www.broadband.co.uk/broadband"),
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
    h1: str = ""
    h2_count: int = 0
    word_count: int = 0
    html_bytes: int = 0
    js_rendered_suspected: bool = False
    nav_labels: list[str] = field(default_factory=list)
    schema_types: list[str] = field(default_factory=list)
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
        descriptions = tree.xpath(
            "//meta[translate(@name,'ABCDEFGHIJKLMNOPQRSTUVWXYZ',"
            "'abcdefghijklmnopqrstuvwxyz')='description']/@content"
        )
        scan.meta_description = descriptions[0].strip() if descriptions else ""
        h1s = [re.sub(r"\s+", " ", t).strip() for t in tree.xpath("//h1//text()")]
        scan.h1 = " / ".join(h for h in h1s if h)[:200]
        scan.h2_count = len(tree.xpath("//h2"))
        scan.word_count = len(re.findall(r"\b[\w'-]+\b", clean_text))

        nav_links = tree.xpath("//nav//a/text() | //header//a/text()")
        scan.nav_labels = sorted({re.sub(r"\s+", " ", n).strip() for n in nav_links if n.strip()})[:25]

        schema_types: set[str] = set()
        for raw in tree.xpath("//script[@type='application/ld+json']/text()"):
            try:
                payload = json.loads(raw)
                nodes = payload if isinstance(payload, list) else [payload]
                for node in nodes:
                    if isinstance(node, dict) and node.get("@type"):
                        value = node["@type"]
                        schema_types.update(value if isinstance(value, list) else [str(value)])
            except (json.JSONDecodeError, TypeError):
                pass
        scan.schema_types = sorted(schema_types)

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

    payload = {"generated": RUN_DATE, "sites": results}
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    print(f"Saved {args.output.resolve()}")
    print(json.dumps({"sites_scanned": len(results)}, indent=2))


if __name__ == "__main__":
    main()
