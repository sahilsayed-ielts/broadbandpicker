#!/usr/bin/env python3
"""Analyse the visual design of popular UK broadband affiliate/comparison
homepages: imagery vs illustration use, hero treatment, interactive-library
signals, colour/gradient use, and footer patterns (logo placement, social
icons, accordion/back-to-top interactivity) — to inform a BroadbandPicker
homepage and footer visual redesign (design/UX only, not a content
rewrite).

This is a structural HTTP scrape, not a rendered screenshot: it can see
what markup, images and script libraries a page ships, but it cannot see
final layout, animation timing or true rendered colour the way a browser
screenshot would. Every finding below is labelled with what it actually
detected, so a judgement call built on it stays honest about its evidence.

Usage:
    python3 scripts/analyze_homepage_visual_design.py
    python3 scripts/analyze_homepage_visual_design.py --output "docs/home page UX/my-scan.json"
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
DEFAULT_OUTPUT = ROOT / "docs" / "home page UX" / "homepage-visual-design-scan.json"
RUN_DATE = datetime.now(timezone.utc).date().isoformat()
USER_AGENT = (
    "BroadbandPickerDesignResearchBot/1.0 "
    "(homepage visual-design research; contact: https://broadbandpicker.co.uk/contact)"
)

# UK broadband comparison/affiliate homepages confirmed reachable in prior
# research this project has done (docs/competitor-landscape-scan.json,
# docs/navigation-pattern-scan.json).
TARGETS = [
    ("Uswitch", "https://www.uswitch.com/broadband/"),
    ("Which? Switch Broadband", "https://broadband.which.co.uk/"),
    ("broadband.co.uk", "https://www.broadband.co.uk/broadband"),
    ("choose.co.uk", "https://www.choose.co.uk/broadband/"),
    ("MoneySavingExpert", "https://www.moneysavingexpert.com/phones/cheap-broadband/"),
]

INTERACTIVE_LIBRARY_SIGNALS = {
    "swiper": r"swiper",
    "slick_carousel": r"slick(?:-|\.)(?:carousel|min)",
    "aos_scroll_animate": r"\baos\b|data-aos=",
    "framer_motion": r"framer-motion",
    "lottie_animation": r"lottie",
    "gsap": r"\bgsap\b",
    "embla_carousel": r"embla",
}


@dataclass
class HomepageScan:
    name: str
    url: str
    status: int | str = ""
    notes: str = ""
    total_img_tags: int = 0
    hero_img_tags: int = 0
    inline_svg_count: int = 0
    css_background_image_refs: int = 0
    gradient_signal_count: int = 0
    rounded_corner_signal_count: int = 0
    interactive_libraries_detected: list[str] = field(default_factory=list)
    hero_heading_text: str = ""
    sample_image_alts: list[str] = field(default_factory=list)
    footer_has_logo: bool = False
    footer_logo_signal: str = ""
    footer_social_icon_count: int = 0
    footer_has_back_to_top: bool = False
    footer_has_accordion: bool = False
    footer_link_hover_transition_count: int = 0


def fetch(url: str, timeout: int = 20) -> requests.Response:
    return requests.get(url, headers={"User-Agent": USER_AGENT, "Accept-Language": "en-GB,en;q=0.9"}, timeout=timeout)


def scan_site(name: str, url: str) -> HomepageScan:
    scan = HomepageScan(name=name, url=url)
    try:
        response = fetch(url)
        scan.status = response.status_code
        if response.status_code != 200 or not response.content:
            scan.notes = f"Non-200 or empty response ({response.status_code})"
            return scan

        tree = html.fromstring(response.content)
        raw = response.text

        all_imgs = tree.xpath("//img")
        scan.total_img_tags = len(all_imgs)
        scan.sample_image_alts = [
            (img.get("alt") or "").strip() for img in all_imgs[:60] if (img.get("alt") or "").strip()
        ][:15]

        # "Hero" approximated as the first ~1/4 of img tags in document order —
        # a real render would confirm above-the-fold, this is a proxy.
        hero_slice = all_imgs[: max(1, len(all_imgs) // 4)]
        scan.hero_img_tags = len(hero_slice)

        scan.inline_svg_count = len(tree.xpath("//svg"))
        scan.css_background_image_refs = len(re.findall(r"background-image\s*:\s*url\(", raw, re.I))
        scan.gradient_signal_count = len(re.findall(r"linear-gradient\(|radial-gradient\(", raw, re.I))
        scan.rounded_corner_signal_count = len(re.findall(r"border-radius\s*:\s*[1-9]", raw, re.I))

        detected = []
        for lib, pattern in INTERACTIVE_LIBRARY_SIGNALS.items():
            if re.search(pattern, raw, re.I):
                detected.append(lib)
        scan.interactive_libraries_detected = detected

        h1_text = " ".join(tree.xpath("//h1//text()")).strip()
        scan.hero_heading_text = re.sub(r"\s+", " ", h1_text)[:150]

        footer_nodes = tree.xpath("//footer | //*[@role='contentinfo']")
        if footer_nodes:
            footer = footer_nodes[0]
            footer_html = html.tostring(footer, encoding="unicode").lower()

            logo_imgs = footer.xpath(
                ".//img[contains(translate(@alt,'LOGO','logo'),'logo')] | "
                ".//img[contains(translate(@class,'LOGO','logo'),'logo')] | "
                ".//img[contains(translate(@src,'LOGO','logo'),'logo')] | "
                ".//svg[contains(translate(@class,'LOGO','logo'),'logo')] | "
                ".//*[contains(translate(@class,'LOGO','logo'),'logo')]//img"
            )
            scan.footer_has_logo = len(logo_imgs) > 0
            if logo_imgs:
                el = logo_imgs[0]
                scan.footer_logo_signal = (el.get("alt") or el.get("class") or el.tag or "")[:60]

            social_domains = ("facebook.com", "twitter.com", "x.com", "instagram.com",
                               "linkedin.com", "youtube.com", "tiktok.com")
            social_links = [
                a for a in footer.xpath(".//a[@href]")
                if any(d in (a.get("href") or "") for d in social_domains)
            ]
            scan.footer_social_icon_count = len(social_links)

            scan.footer_has_accordion = bool(footer.xpath(".//details")) or bool(
                re.search(r'aria-expanded="(true|false)"', footer_html)
            )
            scan.footer_has_back_to_top = bool(
                re.search(r"back to top|scroll to top|#top\"|#top'", footer_html)
            ) or bool(tree.xpath("//a[contains(translate(@aria-label,'BACKTOTOP','backtotop'),'back to top')]"))

            scan.footer_link_hover_transition_count = len(
                re.findall(r'class="[^"]*(?:hover:|transition)[^"]*"', footer_html)
            )

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

    payload = {
        "generated": RUN_DATE,
        "method": "Static HTTP fetch + HTML/CSS-text pattern analysis — not a rendered screenshot. "
                  "Treat findings as structural evidence of what a page ships, not a confirmed final render.",
        "sites": results,
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    print(f"Saved {args.output.resolve()}")
    print(json.dumps({"sites_scanned": len(results)}, indent=2))


if __name__ == "__main__":
    main()
