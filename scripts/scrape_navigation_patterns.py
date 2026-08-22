#!/usr/bin/env python3
"""Scrape header/navigation/footer structure from best-in-class UK broadband
comparison sites plus a globally-recognised affiliate/comparison UX
benchmark, to inform concrete recommendations for BroadbandPicker's own
homepage, nav, header and footer.

This is structural research, not content scraping for reuse: it records
what each site's header/nav/footer *does* (link counts, labels, presence of
search/postcode entry, trust signals, footer column structure) so IA
decisions are evidence-led. It does not copy or store their prose.

Usage:
    python3 scripts/scrape_navigation_patterns.py
    python3 scripts/scrape_navigation_patterns.py --output docs/my-scan.json
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
DEFAULT_OUTPUT = ROOT / "docs" / "navigation-pattern-scan.json"
RUN_DATE = datetime.now(timezone.utc).date().isoformat()
USER_AGENT = (
    "BroadbandPickerUXResearchBot/1.0 "
    "(navigation/IA research; contact: https://broadbandpicker.co.uk/contact)"
)

# Best-in-class UK broadband comparison sites (confirmed readable in prior
# research) plus a widely-cited best-in-world affiliate/comparison UX
# benchmark (NerdWallet — different vertical, included specifically for
# header/nav/footer pattern, not broadband content) and the UK's most
# trusted consumer-money brand (MoneySavingExpert), since "best in the
# world" for this kind of site legitimately spans outside pure broadband.
TARGETS = [
    ("Uswitch", "https://www.uswitch.com/broadband/"),
    ("Which? Switch Broadband", "https://broadband.which.co.uk/"),
    ("broadband.co.uk", "https://www.broadband.co.uk/broadband"),
    ("choose.co.uk", "https://www.choose.co.uk/broadband/"),
    ("MoneySavingExpert", "https://www.moneysavingexpert.com/phones/cheap-broadband/"),
    ("NerdWallet (UX benchmark, non-broadband)", "https://www.nerdwallet.com/"),
]


@dataclass
class NavScan:
    name: str
    url: str
    status: int | str = ""
    notes: str = ""
    header_nav_link_count: int = 0
    header_nav_labels: list[str] = field(default_factory=list)
    has_search_or_postcode_in_header: bool = False
    has_sticky_header_signal: bool = False
    has_breadcrumbs: bool = False
    has_trust_badge_near_top: bool = False
    footer_link_count: int = 0
    footer_column_headings: list[str] = field(default_factory=list)
    has_mega_menu_signal: bool = False


def fetch(url: str, timeout: int = 20) -> requests.Response:
    return requests.get(url, headers={"User-Agent": USER_AGENT, "Accept-Language": "en-GB,en;q=0.9"}, timeout=timeout)


def scan_site(name: str, url: str) -> NavScan:
    scan = NavScan(name=name, url=url)
    try:
        response = fetch(url)
        scan.status = response.status_code
        if response.status_code != 200 or not response.content:
            scan.notes = f"Non-200 or empty response ({response.status_code})"
            return scan

        tree = html.fromstring(response.content)
        raw_lower = response.text.lower()

        header_nodes = tree.xpath("//header | //*[@role='banner']")
        nav_nodes = tree.xpath("//nav")
        header_and_top_nav = header_nodes + (nav_nodes[:1] if nav_nodes else [])

        header_links: list[str] = []
        for node in header_and_top_nav:
            header_links.extend(
                re.sub(r"\s+", " ", t).strip()
                for t in node.xpath(".//a/text()")
                if re.sub(r"\s+", " ", t).strip()
            )
        scan.header_nav_labels = sorted(set(header_links))[:20]
        scan.header_nav_link_count = len(header_links)

        scan.has_search_or_postcode_in_header = any(
            node.xpath(".//input[@type='search'] | .//input[contains(translate(@placeholder,'POSTCODEZIP','postcodezip'),'postcode')] | .//input[contains(translate(@placeholder,'POSTCODEZIP','postcodezip'),'zip')] | .//*[@role='search']")
            for node in header_and_top_nav
        ) or bool(re.search(r'placeholder="[^"]*(postcode|zip code)[^"]*"', raw_lower))

        scan.has_sticky_header_signal = bool(
            re.search(r'class="[^"]*(sticky|fixed-top|is-fixed|header--fixed)[^"]*"', raw_lower)
        )

        scan.has_breadcrumbs = bool(
            tree.xpath("//*[contains(translate(@aria-label,'BREADCRUMB','breadcrumb'),'breadcrumb')]")
        ) or '"@type":"breadcrumblist"' in raw_lower.replace(" ", "")

        top_text = " ".join(tree.xpath("//body//text()[normalize-space()]")[:400]).lower()
        scan.has_trust_badge_near_top = any(
            term in top_text[:3000] for term in ("trustpilot", "excellent rated", "as seen on", "as seen in", "4.5 out of 5", "4.6 out of 5", "4.7 out of 5")
        )

        scan.has_mega_menu_signal = bool(
            re.search(r'class="[^"]*(mega-menu|megamenu|mega_menu|dropdown-menu)[^"]*"', raw_lower)
        ) or any(len(node.xpath(".//ul//ul")) > 0 for node in nav_nodes[:1])

        footer_nodes = tree.xpath("//footer | //*[@role='contentinfo']")
        footer_links: list[str] = []
        footer_headings: list[str] = []
        for node in footer_nodes:
            footer_links.extend(node.xpath(".//a"))
            footer_headings.extend(
                re.sub(r"\s+", " ", t).strip()
                for t in node.xpath(".//h1//text() | .//h2//text() | .//h3//text() | .//h4//text() | .//h5//text()")
                if re.sub(r"\s+", " ", t).strip()
            )
        scan.footer_link_count = len(footer_links)
        scan.footer_column_headings = footer_headings[:15]

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
