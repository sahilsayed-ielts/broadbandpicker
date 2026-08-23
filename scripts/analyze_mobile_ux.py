#!/usr/bin/env python3
"""Research mobile/responsive UX patterns on popular UK broadband affiliate
comparison sites, via static HTML + linked-CSS fetches (no headless browser,
no device emulation — this cannot see actual rendered layout at any
viewport, only markup/CSS signals that correlate with mobile-friendly
patterns). Findings feed a mobile-navigation and touch-experience pass on
BroadbandPicker.

Usage:
    python3 scripts/analyze_mobile_ux.py
"""

from __future__ import annotations

import json
import re
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urljoin

import requests
from lxml import html as lxml_html

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "docs" / "home page UX" / "mobile-ux-scan.json"

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) "
        "AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1"
    ),
    "Accept-Language": "en-GB,en;q=0.9",
}

TARGETS = [
    {"name": "Uswitch broadband hub", "url": "https://www.uswitch.com/broadband/"},
    {"name": "Uswitch BT review", "url": "https://www.uswitch.com/broadband/reviews/bt/"},
    {"name": "broadband.co.uk deals", "url": "https://www.broadband.co.uk/broadband/deals/"},
    {"name": "choose.co.uk broadband", "url": "https://www.choose.co.uk/broadband/"},
    {"name": "MoneySavingExpert cheap broadband guide", "url": "https://www.moneysavingexpert.com/phones/cheap-broadband/"},
]

MEDIA_QUERY_RE = re.compile(r"@media[^{]*\{", re.IGNORECASE)
STICKY_CLASS_RE = re.compile(r"\b(sticky|fixed)[a-z0-9_-]*bottom\b|\bbottom[a-z0-9_-]*(sticky|fixed)\b", re.IGNORECASE)
STICKY_STYLE_RE = re.compile(r"position\s*:\s*(sticky|fixed)[^;]*;[^}]*bottom\s*:", re.IGNORECASE)


@dataclass
class PageScan:
    name: str
    url: str
    status: int = 0
    notes: str = ""
    has_viewport_meta: bool = False
    viewport_content: str = ""
    has_apple_touch_icon: bool = False
    has_hamburger_signal: bool = False
    has_sticky_bottom_cta_signal: bool = False
    tel_link_count: int = 0
    stylesheet_count: int = 0
    media_query_count: int = 0
    inline_style_media_query_count: int = 0
    touch_target_padding_signal: bool = False


def fetch(url: str, timeout: int = 15) -> requests.Response:
    return requests.get(url, headers=HEADERS, timeout=timeout)


def count_media_queries_in_css(css_urls: list[str], base_url: str, cap: int = 4) -> int:
    total = 0
    for href in css_urls[:cap]:
        try:
            full = urljoin(base_url, href)
            resp = fetch(full, timeout=10)
            if resp.status_code == 200:
                total += len(MEDIA_QUERY_RE.findall(resp.text))
        except requests.RequestException:
            continue
    return total


def scan_page(target: dict) -> PageScan:
    scan = PageScan(name=target["name"], url=target["url"])
    try:
        resp = fetch(target["url"])
    except requests.RequestException as exc:
        scan.notes = f"Request failed: {exc}"
        return scan

    scan.status = resp.status_code
    if resp.status_code != 200 or not resp.text.strip():
        scan.notes = f"Non-200 or empty response ({resp.status_code})"
        return scan

    text = resp.text
    try:
        tree = lxml_html.fromstring(text)
    except Exception as exc:
        scan.notes = f"Parse failed: {exc}"
        return scan

    viewport = tree.xpath('//meta[@name="viewport"]/@content')
    scan.has_viewport_meta = bool(viewport)
    scan.viewport_content = viewport[0] if viewport else ""

    scan.has_apple_touch_icon = bool(tree.xpath('//link[contains(@rel, "apple-touch-icon")]'))

    scan.tel_link_count = len(tree.xpath('//a[starts-with(@href, "tel:")]'))

    body_text_lower = text.lower()
    scan.has_hamburger_signal = bool(
        re.search(r'aria-label="[^"]*menu[^"]*"', body_text_lower)
        or re.search(r'class="[^"]*hamburger[^"]*"', body_text_lower)
        or re.search(r'class="[^"]*burger[^"]*"', body_text_lower)
    )

    scan.has_sticky_bottom_cta_signal = bool(
        STICKY_CLASS_RE.search(body_text_lower) or STICKY_STYLE_RE.search(body_text_lower)
    )

    inline_styles = tree.xpath('//style/text()')
    scan.inline_style_media_query_count = sum(len(MEDIA_QUERY_RE.findall(s)) for s in inline_styles)

    css_hrefs = tree.xpath('//link[@rel="stylesheet"]/@href')
    scan.stylesheet_count = len(css_hrefs)
    scan.media_query_count = count_media_queries_in_css(css_hrefs, target["url"])

    scan.touch_target_padding_signal = bool(
        re.search(r"(padding|min-height)\s*:\s*(1[2-9]|[2-9]\d)px", "".join(inline_styles))
    )

    return scan


def main() -> None:
    scans = [scan_page(t) for t in TARGETS]
    payload = {
        "generated": datetime.now(timezone.utc).date().isoformat(),
        "method": (
            "Static HTTP fetch with a mobile Safari user agent, HTML/CSS-text pattern "
            "analysis. This cannot render or measure an actual mobile layout at any "
            "viewport width — it detects markup and CSS signals that correlate with "
            "mobile-friendly patterns (viewport meta, sticky bottom CTA classes, hamburger "
            "menu markers, tel: links, media query density), not visual confirmation."
        ),
        "pages": [asdict(s) for s in scans],
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(payload, indent=2), encoding="utf-8")

    print(f"Scanned {len(scans)} pages -> {OUT}")
    for s in scans:
        if s.notes:
            print(f"  [{s.status or 'ERR'}] {s.name}: {s.notes}")
        else:
            print(
                f"  [{s.status}] {s.name}: viewport={s.has_viewport_meta} "
                f"hamburger={s.has_hamburger_signal} sticky_cta={s.has_sticky_bottom_cta_signal} "
                f"tel_links={s.tel_link_count} media_queries={s.media_query_count}"
            )


if __name__ == "__main__":
    main()
