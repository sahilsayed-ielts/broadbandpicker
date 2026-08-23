#!/usr/bin/env python3
"""Analyse UX patterns for BroadbandPicker's core page TYPES — deals/
comparison listings, individual provider reviews, guide/article pages, and
postcode/location hubs — against popular pages of the same theme, not just
the homepage. `scripts/analyze_homepage_visual_design.py` and
`scripts/scrape_navigation_patterns.py` already cover the homepage and nav;
this extends the same evidence-led approach to the templates behind
/deals, /providers/[slug], /guides/[slug] and /postcode.

Method and caveat are identical to the earlier scripts: static HTTP fetch +
HTML/CSS-text pattern analysis, not a rendered screenshot. Treat findings
as structural evidence of what a page ships, not a confirmed final render.

Usage:
    python3 scripts/analyze_page_type_ux.py
    python3 scripts/analyze_page_type_ux.py --output "docs/home page UX/my-scan.json"
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
DEFAULT_OUTPUT = ROOT / "docs" / "home page UX" / "page-type-ux-scan.json"
RUN_DATE = datetime.now(timezone.utc).date().isoformat()
USER_AGENT = (
    "BroadbandPickerUXResearchBot/1.0 "
    "(page-type UX research; contact: https://broadbandpicker.co.uk/contact)"
)

# One or more real pages of each theme. Kept short and targeted rather than
# broad — depth of analysis per page matters more than site count here.
TARGETS: dict[str, list[tuple[str, str]]] = {
    "deals_listing": [
        ("Uswitch broadband hub (deals + reviews)", "https://www.uswitch.com/broadband/"),
        ("broadband.co.uk deals", "https://www.broadband.co.uk/broadband/deals/"),
        ("choose.co.uk broadband", "https://www.choose.co.uk/broadband/"),
    ],
    "provider_review": [
        ("Uswitch BT review", "https://www.uswitch.com/broadband/reviews/bt/"),
        ("Uswitch provider reviews index", "https://www.uswitch.com/broadband/reviews/"),
    ],
    "guide_article": [
        ("Uswitch speed guide", "https://www.uswitch.com/broadband/guides/broadband-speeds/"),
        ("MoneySavingExpert cheap broadband guide", "https://www.moneysavingexpert.com/phones/cheap-broadband/"),
    ],
    "postcode_hub": [
        ("Uswitch postcode entry", "https://www.uswitch.com/broadband/"),
    ],
}


@dataclass
class PageScan:
    category: str
    name: str
    url: str
    status: int | str = ""
    notes: str = ""
    word_count: int = 0
    h2_count: int = 0
    h3_count: int = 0
    table_count: int = 0
    has_sticky_filter_signal: bool = False
    has_card_layout_signal: bool = False
    has_badge_chip_signal: bool = False
    has_toc_signal: bool = False
    has_reading_progress_signal: bool = False
    has_related_content_signal: bool = False
    has_rating_widget_signal: bool = False
    has_pros_cons_signal: bool = False
    has_comparison_checkbox_signal: bool = False
    has_illustration_or_icon_heavy_signal: bool = False
    inline_svg_count: int = 0


def fetch(url: str, timeout: int = 20) -> requests.Response:
    return requests.get(url, headers={"User-Agent": USER_AGENT, "Accept-Language": "en-GB,en;q=0.9"}, timeout=timeout)


def scan_page(category: str, name: str, url: str) -> PageScan:
    scan = PageScan(category=category, name=name, url=url)
    try:
        response = fetch(url)
        scan.status = response.status_code
        if response.status_code != 200 or not response.content:
            scan.notes = f"Non-200 or empty response ({response.status_code})"
            return scan

        tree = html.fromstring(response.content)
        raw_lower = response.text.lower()
        text_content = " ".join(tree.xpath("//body//text()[normalize-space()]"))
        scan.word_count = len(re.findall(r"\b[\w'-]+\b", text_content))
        scan.h2_count = len(tree.xpath("//h2"))
        scan.h3_count = len(tree.xpath("//h3"))
        scan.table_count = len(tree.xpath("//table"))
        scan.inline_svg_count = len(tree.xpath("//svg"))

        scan.has_sticky_filter_signal = bool(
            re.search(r'class="[^"]*(sticky|is-fixed|filter-bar|filters-sticky)[^"]*"', raw_lower)
        )
        scan.has_card_layout_signal = bool(
            re.search(r'class="[^"]*(card|deal-card|product-card|tile)[^"]*"', raw_lower)
        )
        scan.has_badge_chip_signal = bool(
            re.search(r'class="[^"]*(badge|chip|pill|tag)[^"]*"', raw_lower)
        ) or any(t in text_content.lower() for t in ("best value", "editor's pick", "most popular", "recommended"))
        scan.has_toc_signal = bool(
            re.search(r'class="[^"]*(table-of-contents|toc|jump-link|jump-to)[^"]*"', raw_lower)
        ) or "jump to" in text_content.lower() or "on this page" in text_content.lower()
        scan.has_reading_progress_signal = bool(
            re.search(r'class="[^"]*(reading-progress|progress-bar|scroll-progress)[^"]*"', raw_lower)
        )
        scan.has_related_content_signal = bool(
            re.search(r'class="[^"]*(related|you-might-also|recommended-articles|read-next)[^"]*"', raw_lower)
        ) or "related" in text_content.lower()
        scan.has_rating_widget_signal = bool(
            re.search(r'class="[^"]*(rating|stars|score-badge|trustscore)[^"]*"', raw_lower)
        )
        scan.has_pros_cons_signal = bool(
            re.search(r'class="[^"]*(pros-cons|pros-and-cons)[^"]*"', raw_lower)
        ) or ("pros" in text_content.lower() and "cons" in text_content.lower())
        scan.has_comparison_checkbox_signal = bool(
            tree.xpath("//input[@type='checkbox']")
        ) and ("compare" in text_content.lower())
        scan.has_illustration_or_icon_heavy_signal = scan.inline_svg_count > 15

    except Exception as exc:
        scan.notes = str(exc)[:250]
    return scan


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    args = parser.parse_args()

    results: list[dict[str, Any]] = []
    for category, targets in TARGETS.items():
        for name, url in targets:
            print(f"Scanning [{category}] {name} ({url})")
            scan = scan_page(category, name, url)
            results.append(asdict(scan))
            time.sleep(0.5)

    payload = {
        "generated": RUN_DATE,
        "method": "Static HTTP fetch + HTML/CSS-text pattern analysis — not a rendered screenshot.",
        "pages": results,
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    print(f"Saved {args.output.resolve()}")
    print(json.dumps({"pages_scanned": len(results)}, indent=2))


if __name__ == "__main__":
    main()
