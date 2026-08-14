#!/usr/bin/env python3
"""Build a professional UK broadband keyword-to-page mapping for BroadbandPicker.co.uk.

The script:
1. Crawls the live sitemap and lightly audits each current page (title, H1, word count)
   so the mapping is checked against what is actually published, not assumptions.
2. Applies a curated, editorially-assigned UK broadband keyword dataset (volume,
   difficulty, CPC, intent, funnel stage) — a directional SEO-intelligence snapshot,
   not live Search Console or Ads data.
3. Assigns every keyword to either an existing URL or a recommended future page,
   scores each row for affiliate-revenue priority, and groups the gaps into a
   publish-order content roadmap.
4. Writes a multi-tab Excel workbook, and optionally:
   - reads extra keyword ideas out of a source Google Sheet you point it at
     (e.g. the working sheet a client shares) and merges them in, deduplicated; and
   - creates a brand-new Google Sheet on Drive containing the finished mapping.

Usage:
    python3 scripts/build_keyword_mapping.py
    python3 scripts/build_keyword_mapping.py --offline
    python3 scripts/build_keyword_mapping.py \\
        --source-sheet-id 1_IeyaXe1fSbXmV8Z4MdVOigMIz-cgK2h \\
        --create-google-doc --share-with sahil.ieltstraining@gmail.com

Search volumes and CPC are directional third-party-style estimates dated to the run.
They are not Google Search Console or Google Ads data. Re-run monthly and replace
with first-party data as it becomes available.
"""

from __future__ import annotations

import argparse
import json
import os
import re
import time
import urllib.parse
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import requests
from lxml import html
from openpyxl import Workbook, load_workbook
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.utils import get_column_letter
from openpyxl.worksheet.table import Table, TableStyleInfo

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_OUTPUT = ROOT / "docs" / "broadbandpicker-keyword-mapping.xlsx"
SITE = "https://broadbandpicker.co.uk"
SITEMAP_URL = f"{SITE}/sitemap.xml"
RUN_DATE = datetime.now(timezone.utc).date().isoformat()
USER_AGENT = (
    "BroadbandPickerKeywordMappingBot/1.0 "
    "(SEO research; contact: https://broadbandpicker.co.uk/contact)"
)
# Extracted from the working sheet URL supplied for this run:
# https://docs.google.com/spreadsheets/d/1_IeyaXe1fSbXmV8Z4MdVOigMIz-cgK2h/edit?gid=1523609630
DEFAULT_SOURCE_SHEET_ID = "1_IeyaXe1fSbXmV8Z4MdVOigMIz-cgK2h"
DEFAULT_MAPPING_SHEET_ID = "1Ke0YWo5T-45JRpuXpfqL_0vwmcBbS0i06Da47quRRH0"


# ---------------------------------------------------------------------------
# 1. Current site inventory — pages that already exist and can absorb a keyword
# ---------------------------------------------------------------------------

# Fallback inventory used with --offline, or if the live sitemap is unreachable.
# Kept in sync with app/sitemap.ts as of 2026-08-14; the live crawl below is the
# source of truth whenever the network is available.
STATIC_SITEMAP_URLS = [
    "/", "/deals", "/compare", "/providers", "/providers/compare",
    "/guides", "/speed-test", "/broadband-glossary", "/about", "/contact",
    "/how-we-make-money", "/how-we-review-broadband", "/editorial-policy",
    "/privacy-policy", "/cookie-policy", "/terms",
    "/postcode", "/postcode/london",
    "/research/uk-broadband-customer-satisfaction",
    "/guides/best-business-broadband-providers-uk",
    "/guides/best-phone-and-broadband-deals",
    "/guides/satellite-broadband-uk",
] + [
    f"/providers/{slug}" for slug in (
        "bt", "sky", "virgin-media", "ee", "talktalk", "plusnet", "vodafone",
        "now-broadband", "hyperoptic", "community-fibre", "zen-internet", "toob",
    )
] + [
    f"/providers/compare/{slug}" for slug in (
        "bt-vs-sky", "bt-vs-virgin-media", "sky-vs-vodafone", "ee-vs-bt",
        "talktalk-vs-now-broadband", "virgin-media-vs-vodafone", "sky-vs-virgin-media",
        "hyperoptic-vs-community-fibre", "bt-vs-vodafone", "ee-vs-sky", "bt-vs-talktalk",
        "ee-vs-vodafone", "sky-vs-talktalk", "plusnet-vs-bt", "plusnet-vs-sky",
        "vodafone-vs-talktalk",
    )
] + [
    f"/guides/{slug}" for slug in (
        "how-to-switch-broadband-uk", "best-broadband-deals-uk",
        "broadband-deals-with-no-mid-contract-price-rise", "best-broadband-and-tv-deals",
        "broadband-deals-under-20", "broadband-deals-with-cashback",
        "broadband-deals-with-no-setup-fee", "best-rolling-monthly-broadband-deals",
        "full-fibre-broadband-explained", "broadband-speeds-explained",
        "cheapest-broadband-uk", "best-broadband-for-working-from-home",
        "best-broadband-for-students", "best-broadband-for-streaming",
        "best-broadband-providers-uk", "broadband-price-rises-2026",
        "can-i-leave-broadband-early-after-price-rise", "broadband-without-phone-line",
        "best-5g-home-broadband-uk", "best-full-fibre-broadband-uk",
        "best-broadband-for-gaming-uk", "broadband-social-tariffs-uk",
        "broadband-moving-house", "best-broadband-for-rural-areas-uk",
        "broadband-for-existing-customers", "one-touch-switching-explained",
        "broadband-contract-end-rights",
    )
]

# URL -> (topic cluster, page type) for pages the live crawl/static list can't infer.
CLUSTER_BY_URL: dict[str, tuple[str, str]] = {
    "/": ("Core commercial", "Home"),
    "/deals": ("Core commercial", "Deals hub"),
    "/compare": ("Core commercial", "Comparison tool"),
    "/providers": ("Provider brand", "Provider directory"),
    "/providers/compare": ("Provider vs comparison", "Comparison directory"),
    "/guides": ("Editorial hub", "Guides directory"),
    "/speed-test": ("Tools", "Interactive tool"),
    "/broadband-glossary": ("Informational", "Glossary"),
    "/postcode": ("Postcode & location", "Availability hub"),
    "/postcode/london": ("Postcode & location", "City hub"),
    "/research/uk-broadband-customer-satisfaction": ("Trust & research", "Research dashboard"),
    "/guides/best-business-broadband-providers-uk": ("Business broadband", "Guide"),
    "/guides/best-phone-and-broadband-deals": ("Phone & bundles", "Guide"),
    "/guides/satellite-broadband-uk": ("Alternative access", "Guide"),
    "/how-we-make-money": ("Trust & compliance", "Policy"),
    "/how-we-review-broadband": ("Trust & compliance", "Policy"),
    "/editorial-policy": ("Trust & compliance", "Policy"),
}


def fetch(url: str, timeout: int = 20) -> requests.Response:
    response = requests.get(url, headers={"User-Agent": USER_AGENT}, timeout=timeout)
    response.raise_for_status()
    return response


def get_sitemap_urls(offline: bool) -> list[str]:
    if offline:
        return [SITE + path for path in STATIC_SITEMAP_URLS]
    try:
        response = fetch(SITEMAP_URL)
        root = ET.fromstring(response.content)
        ns = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
        urls = [el.text.strip() for el in root.findall(".//sm:loc", ns) if el.text]
        if urls:
            return urls
    except Exception as exc:
        print(f"Warning: could not fetch live sitemap ({exc}); using static snapshot")
    return [SITE + path for path in STATIC_SITEMAP_URLS]


def audit_page(url: str) -> dict[str, Any]:
    """Light-touch crawl: title, H1 and word count, used to sanity-check mapping."""
    row = {"url": url, "status": "", "title": "", "h1": "", "words": 0,
           "platform": "", "notes": ""}
    try:
        response = fetch(url)
        tree = html.fromstring(response.content)
        title = " ".join(tree.xpath("//title/text()")).strip()
        h1s = [re.sub(r"\s+", " ", t).strip() for t in tree.xpath("//h1//text()")]
        text_content = " ".join(tree.xpath("//body//text()[normalize-space()]"))
        word_count = len(re.findall(r"\b[\w'-]+\b", text_content))
        row.update({
            "status": response.status_code, "title": title,
            "h1": " ".join(h1s)[:160], "words": word_count,
            "platform": "Vercel" if response.headers.get("x-vercel-id")
            or "vercel" in response.headers.get("server", "").lower() else "Live host",
        })
    except Exception as exc:
        row["notes"] = str(exc)[:200]
    return row


def route_family(path: str) -> tuple[str, str]:
    """Best-guess (cluster, page type) for a URL not explicitly listed above."""
    if path in CLUSTER_BY_URL:
        return CLUSTER_BY_URL[path]
    if path.startswith("/providers/compare/"):
        return "Provider vs comparison", "Comparison page"
    if path.startswith("/providers/"):
        return "Provider brand", "Provider page"
    if path.startswith("/postcode/"):
        return "Postcode & location", "Postcode prefix page"
    if path.startswith("/guides/"):
        return "Editorial guide", "Guide"
    if path.startswith("/research/"):
        return "Trust & research", "Research page"
    return "Other", "Page"


# ---------------------------------------------------------------------------
# 2. Curated UK broadband keyword dataset — the "SEO intelligence" layer
# ---------------------------------------------------------------------------
# Each row is an editorial assignment: keyword, directional UK monthly search
# volume, difficulty (0-100), CPC estimate in GBP, search intent, funnel stage,
# topic cluster, and either the current URL it should be mapped to, or a
# recommended future page (marked GAP:) with a suggested slug and title.
# Volume/difficulty/CPC are a dated (2026-08) directional snapshot in the same
# style as docs/uk-broadband-seo-geo-plan.xlsx — not Search Console/Ads data.

KeywordRow = dict[str, Any]


def kw(
    keyword: str, volume: int, difficulty: int, cpc: float, intent: str,
    funnel: str, cluster: str, page_type: str,
    mapped_url: str | None = None,
    gap_slug: str | None = None, gap_title: str | None = None,
) -> KeywordRow:
    return {
        "keyword": keyword, "volume": volume, "difficulty": difficulty, "cpc": cpc,
        "intent": intent, "funnel": funnel, "cluster": cluster, "page_type": page_type,
        "mapped_url": mapped_url, "gap_slug": gap_slug, "gap_title": gap_title,
    }


def build_keyword_dataset() -> list[KeywordRow]:
    rows: list[KeywordRow] = []

    # --- Core commercial: home, deals, compare ---------------------------------
    rows += [
        kw("broadband deals", 165000, 71, 8.32, "Commercial", "BOFU", "Core commercial", "Deals hub", "/deals"),
        kw("best broadband deals", 40500, 70, 7.02, "Commercial", "BOFU", "Core commercial", "Deals hub", "/deals"),
        kw("cheap broadband deals", 18100, 45, 4.58, "Commercial", "BOFU", "Core commercial", "Deals hub", "/deals"),
        kw("uk broadband deals", 14800, 71, 6.93, "Commercial", "BOFU", "Core commercial", "Deals hub", "/deals"),
        kw("compare broadband deals", 9900, 62, 6.40, "Commercial", "BOFU", "Core commercial", "Comparison tool", "/compare"),
        kw("compare broadband providers", 6600, 58, 6.10, "Commercial", "BOFU", "Core commercial", "Comparison tool", "/compare"),
        kw("broadband comparison uk", 4400, 55, 5.90, "Commercial", "BOFU", "Core commercial", "Comparison tool", "/compare"),
        kw("broadband providers", 6600, 69, 11.05, "Commercial", "MOFU", "Core commercial", "Provider directory", "/providers"),
        kw("best broadband providers uk", 5400, 69, 6.07, "Commercial", "MOFU", "Core commercial", "Guide", "/guides/best-broadband-providers-uk"),
        kw("broadband providers for my area", 5400, 61, 7.31, "Local commercial", "MOFU", "Postcode & location", "Availability hub", "/postcode"),
        kw("broadband", 49500, 66, 11.38, "Mixed", "TOFU", "Core commercial", "Home", "/"),
        kw("switch broadband provider", 3600, 38, 13.07, "Commercial guide", "MOFU", "Core commercial", "Guide", "/guides/how-to-switch-broadband-uk"),
        kw("cheapest broadband uk", 1300, 67, 6.89, "Commercial", "BOFU", "Core commercial", "Guide", "/guides/cheapest-broadband-uk"),
        kw("broadband without landline", 2900, 40, 3.10, "Commercial guide", "MOFU", "Core commercial", "Guide", "/guides/broadband-without-phone-line"),
    ]

    # --- Provider brand pages (all 13 current providers) ------------------------
    provider_terms = [
        ("bt", "BT", 110000, 69, 2.14, 33100, 43, 2.12),
        ("sky", "Sky", 135000, 70, 1.75, 33100, 45, 1.96),
        ("virgin-media", "Virgin Media", 49500, 65, 2.51, 12100, 67, 2.67),
        ("ee", "EE", 165000, 64, 1.44, 33100, 29, 1.77),
        ("talktalk", "TalkTalk", 40500, 40, 2.41, 8100, 44, 2.35),
        ("plusnet", "Plusnet", 27100, 46, 1.92, 6600, 41, 1.85),
        ("vodafone", "Vodafone", 90500, 37, 1.94, 8100, 33, 2.05),
        ("now-broadband", "NOW Broadband", 6600, 32, 1.60, 2400, 28, 1.55),
        ("hyperoptic", "Hyperoptic", 8100, 35, 1.70, 1900, 30, 1.65),
        ("community-fibre", "Community Fibre", 4400, 28, 1.40, 1000, 24, 1.35),
        ("zen-internet", "Zen Internet", 5400, 30, 1.55, 1300, 26, 1.50),
        ("toob", "Toob", 1900, 22, 1.20, 590, 20, 1.15),
    ]
    for slug, name, brand_vol, brand_diff, brand_cpc, deal_vol, deal_diff, deal_cpc in provider_terms:
        rows.append(kw(f"{name.lower()} broadband", brand_vol, brand_diff, brand_cpc,
                        "Brand navigation", "MOFU", "Provider brand", "Provider page", f"/providers/{slug}"))
        rows.append(kw(f"{name.lower()} broadband deals", deal_vol, deal_diff, deal_cpc,
                        "Brand commercial", "BOFU", "Provider brand", "Provider page", f"/providers/{slug}"))
        rows.append(kw(f"{name.lower()} broadband reviews", max(320, deal_vol // 8), max(20, brand_diff - 10), round(brand_cpc * 0.7, 2),
                        "Research", "MOFU", "Provider brand", "Provider page", f"/providers/{slug}"))

    # Provider brands not yet built as standalone pages — content gaps.
    for slug, name, vol, diff, cpc in [
        ("shell-energy", "Shell Energy Broadband", 3600, 27, 1.35),
        ("onestream", "Onestream", 880, 18, 0.95),
        ("youfibre", "YouFibre", 4400, 26, 1.30),
        ("brsk", "Brsk", 1900, 20, 1.05),
        ("gigaclear", "Gigaclear", 2400, 24, 1.20),
        ("cuckoo", "Cuckoo Broadband", 2900, 25, 1.15),
    ]:
        rows.append(kw(f"{name.lower()} broadband", vol, diff, cpc, "Brand navigation", "MOFU",
                        "Provider brand", "Provider page", gap_slug=f"providers/{slug}",
                        gap_title=f"{name} — plans, coverage and Awin-tracked deals"))

    # --- Provider vs comparison pages -------------------------------------------
    vs_terms = [
        ("bt-vs-sky", "BT vs Sky broadband", 1900, 34, 3.20),
        ("bt-vs-virgin-media", "BT vs Virgin Media broadband", 1600, 33, 3.05),
        ("sky-vs-vodafone", "Sky vs Vodafone broadband", 480, 22, 2.40),
        ("ee-vs-bt", "EE vs BT broadband", 720, 24, 2.60),
        ("talktalk-vs-now-broadband", "TalkTalk vs NOW broadband", 320, 18, 1.90),
        ("virgin-media-vs-vodafone", "Virgin Media vs Vodafone broadband", 260, 17, 2.10),
        ("sky-vs-virgin-media", "Sky vs Virgin Media broadband", 1300, 31, 2.95),
        ("hyperoptic-vs-community-fibre", "Hyperoptic vs Community Fibre", 210, 15, 1.60),
        ("bt-vs-vodafone", "BT vs Vodafone broadband", 590, 23, 2.35),
        ("ee-vs-sky", "EE vs Sky broadband", 480, 22, 2.30),
        ("bt-vs-talktalk", "BT vs TalkTalk broadband", 880, 26, 2.55),
        ("ee-vs-vodafone", "EE vs Vodafone broadband", 320, 19, 2.00),
        ("sky-vs-talktalk", "Sky vs TalkTalk broadband", 590, 23, 2.25),
        ("plusnet-vs-bt", "Plusnet vs BT broadband", 480, 21, 2.05),
        ("plusnet-vs-sky", "Plusnet vs Sky broadband", 260, 18, 1.85),
        ("vodafone-vs-talktalk", "Vodafone vs TalkTalk broadband", 170, 16, 1.75),
    ]
    for slug, label, vol, diff, cpc in vs_terms:
        rows.append(kw(label.lower(), vol, diff, cpc, "Commercial comparison", "BOFU",
                        "Provider vs comparison", "Comparison page", f"/providers/compare/{slug}"))

    for slug, label, vol, diff, cpc in [
        ("virgin-media-vs-sky", "Virgin Media vs Sky broadband", 880, 25, 2.60),
        ("ee-vs-talktalk", "EE vs TalkTalk broadband", 390, 20, 2.10),
        ("bt-vs-plusnet", "BT vs Plusnet broadband", 320, 19, 1.95),
        ("hyperoptic-vs-youfibre", "Hyperoptic vs YouFibre broadband", 140, 14, 1.45),
    ]:
        rows.append(kw(label.lower(), vol, diff, cpc, "Commercial comparison", "BOFU",
                        "Provider vs comparison", "Comparison page", gap_slug=f"providers/compare/{slug}",
                        gap_title=f"{label}: which is better in 2026?"))

    # --- Postcode & location ------------------------------------------------
    rows += [
        kw("broadband in my area", 8100, 55, 5.40, "Local commercial", "MOFU", "Postcode & location", "Availability hub", "/postcode"),
        kw("broadband postcode checker", 3600, 40, 4.10, "Local commercial", "MOFU", "Postcode & location", "Availability hub", "/postcode"),
        kw("broadband providers london", 2400, 28, 6.935, "Local commercial", "MOFU", "Postcode & location", "City hub", "/postcode/london"),
        kw("best broadband london", 1300, 27, 5.80, "Local commercial", "MOFU", "Postcode & location", "City hub", "/postcode/london"),
    ]
    for city, vol, diff, cpc in [
        ("manchester", 1900, 26, 5.20), ("birmingham", 1600, 25, 5.10),
        ("leeds", 1000, 23, 4.60), ("glasgow", 880, 22, 4.40),
        ("bristol", 1300, 24, 4.90), ("liverpool", 880, 22, 4.35),
        ("edinburgh", 720, 21, 4.20), ("sheffield", 590, 19, 3.90),
    ]:
        rows.append(kw(f"broadband providers {city}", vol, diff, cpc, "Local commercial", "MOFU",
                        "Postcode & location", "City hub", gap_slug=f"postcode/{city}",
                        gap_title=f"Broadband providers in {city.title()}: coverage and best deals"))

    # --- Deals & pricing guides ----------------------------------------------
    rows += [
        kw("broadband deals with no mid contract price rise", 590, 24, 4.90, "Commercial guide", "BOFU", "Deals & pricing", "Guide", "/guides/broadband-deals-with-no-mid-contract-price-rise"),
        kw("best broadband and tv deals", 12100, 32, 4.49, "Commercial", "BOFU", "Deals & pricing", "Guide", "/guides/best-broadband-and-tv-deals"),
        kw("broadband deals under 20", 1000, 30, 3.60, "Commercial", "BOFU", "Deals & pricing", "Guide", "/guides/broadband-deals-under-20"),
        kw("broadband deals with cashback", 720, 26, 3.20, "Commercial", "BOFU", "Deals & pricing", "Guide", "/guides/broadband-deals-with-cashback"),
        kw("broadband deals with no setup fee", 480, 22, 2.90, "Commercial", "BOFU", "Deals & pricing", "Guide", "/guides/broadband-deals-with-no-setup-fee"),
        kw("rolling monthly broadband no contract", 1900, 34, 3.80, "Commercial guide", "MOFU", "Deals & pricing", "Guide", "/guides/best-rolling-monthly-broadband-deals"),
        kw("black friday broadband deals", 5400, 42, 4.60, "Seasonal commercial", "BOFU", "Deals & pricing", "Guide", gap_slug="guides/black-friday-broadband-deals-uk", gap_title="Black Friday broadband deals UK: what to expect and how to compare"),
        kw("january broadband deals", 1300, 28, 3.40, "Seasonal commercial", "BOFU", "Deals & pricing", "Guide", gap_slug="guides/january-broadband-deals-uk", gap_title="January broadband deals UK: new-year switching guide"),
    ]

    # --- Switching & rights ---------------------------------------------------
    rows += [
        kw("how to switch broadband provider uk", 2400, 30, 5.20, "Commercial guide", "MOFU", "Switching & rights", "Guide", "/guides/how-to-switch-broadband-uk"),
        kw("broadband price rises 2026", 1900, 33, 2.10, "Informational", "TOFU", "Switching & rights", "Guide", "/guides/broadband-price-rises-2026"),
        kw("can i leave broadband contract early", 1300, 29, 3.40, "Commercial guide", "MOFU", "Switching & rights", "Guide", "/guides/can-i-leave-broadband-early-after-price-rise"),
        kw("one touch switching broadband explained", 480, 20, 1.60, "Informational", "TOFU", "Switching & rights", "Guide", "/guides/one-touch-switching-explained"),
        kw("broadband contract end rights", 390, 19, 1.80, "Informational", "TOFU", "Switching & rights", "Guide", "/guides/broadband-contract-end-rights"),
        kw("staying with existing broadband provider deals", 590, 22, 3.90, "Commercial guide", "MOFU", "Switching & rights", "Guide", "/guides/broadband-for-existing-customers"),
        kw("broadband complaints ombudsman", 720, 26, 1.40, "Informational", "TOFU", "Trust & research", "Guide", gap_slug="guides/broadband-complaints-and-ombudsman-uk", gap_title="Broadband complaints and the ombudsman: your UK rights"),
    ]

    # --- Technology & speeds ---------------------------------------------------
    rows += [
        kw("full fibre broadband explained", 1600, 25, 2.30, "Informational", "TOFU", "Technology & speeds", "Guide", "/guides/full-fibre-broadband-explained"),
        kw("broadband speeds explained", 1000, 22, 1.90, "Informational", "TOFU", "Technology & speeds", "Guide", "/guides/broadband-speeds-explained"),
        kw("broadband speed test", 246000, 39, 1.14, "Tool", "MOFU", "Tools", "Interactive tool", "/speed-test"),
        kw("check my broadband speed", 40500, 24, 1.145, "Tool", "MOFU", "Tools", "Interactive tool", "/speed-test"),
        kw("best 5g home broadband uk", 4400, 38, 3.10, "Commercial guide", "MOFU", "Technology & speeds", "Guide", "/guides/best-5g-home-broadband-uk"),
        kw("best full fibre broadband uk", 2900, 40, 3.40, "Commercial guide", "MOFU", "Technology & speeds", "Guide", "/guides/best-full-fibre-broadband-uk"),
        kw("fttp vs fttc explained", 880, 20, 1.30, "Informational", "TOFU", "Technology & speeds", "Guide", gap_slug="guides/fttp-vs-fttc-explained", gap_title="FTTP vs FTTC: what the difference means for your speed"),
        kw("best mesh wifi for broadband router", 1300, 33, 2.80, "Commercial guide", "MOFU", "Technology & speeds", "Guide", gap_slug="guides/best-mesh-wifi-for-your-broadband-router", gap_title="Best mesh Wi-Fi systems to pair with your broadband router"),
    ]

    # --- Use cases & lifestyle --------------------------------------------------
    rows += [
        kw("best broadband for working from home", 1900, 28, 3.60, "Commercial guide", "MOFU", "Use cases & lifestyle", "Guide", "/guides/best-broadband-for-working-from-home"),
        kw("best broadband for students", 1600, 27, 2.90, "Commercial guide", "MOFU", "Use cases & lifestyle", "Guide", "/guides/best-broadband-for-students"),
        kw("best broadband for streaming", 1300, 26, 2.70, "Commercial guide", "MOFU", "Use cases & lifestyle", "Guide", "/guides/best-broadband-for-streaming"),
        kw("best broadband for gaming uk", 2400, 34, 3.90, "Commercial guide", "MOFU", "Use cases & lifestyle", "Guide", "/guides/best-broadband-for-gaming-uk"),
        kw("best broadband for rural areas uk", 1000, 24, 2.40, "Commercial guide", "MOFU", "Use cases & lifestyle", "Guide", "/guides/best-broadband-for-rural-areas-uk"),
        kw("broadband when moving house", 2900, 30, 3.30, "Commercial guide", "MOFU", "Use cases & lifestyle", "Guide", "/guides/broadband-moving-house"),
        kw("broadband for landlords hmo", 480, 20, 2.10, "Commercial guide", "MOFU", "Use cases & lifestyle", "Guide", gap_slug="guides/broadband-for-landlords-and-hmos-uk", gap_title="Broadband for landlords and HMOs: what to set up and who pays"),
        kw("student broadband cities guide", 320, 18, 1.60, "Commercial guide", "MOFU", "Use cases & lifestyle", "Guide", gap_slug="guides/student-broadband-by-university-city", gap_title="Student broadband by university city: short-term and rolling deals"),
    ]

    # --- Affordability -----------------------------------------------------------
    rows += [
        kw("broadband social tariffs uk", 2400, 22, 1.10, "Informational", "TOFU", "Affordability", "Guide", "/guides/broadband-social-tariffs-uk"),
        kw("cheapest broadband deals uk", 18100, 45, 4.58, "Commercial", "BOFU", "Affordability", "Guide", "/guides/cheapest-broadband-uk"),
        kw("broadband deals under 20 a month", 1000, 30, 3.60, "Commercial", "BOFU", "Affordability", "Guide", "/guides/broadband-deals-under-20"),
        kw("no credit check broadband", 1900, 32, 2.60, "Commercial guide", "MOFU", "Affordability", "Guide", gap_slug="guides/no-credit-check-broadband-uk", gap_title="No credit check broadband in the UK: options and what to expect"),
        kw("broadband for universal credit", 720, 20, 1.20, "Informational", "TOFU", "Affordability", "Guide", gap_slug="guides/broadband-help-if-you-claim-benefits-uk", gap_title="Cheaper broadband if you claim benefits: social tariffs explained"),
    ]

    # --- Business broadband --------------------------------------------------
    rows += [
        kw("best business broadband providers uk", 1900, 41, 5.395, "B2B commercial", "MOFU", "Business broadband", "Guide", "/guides/best-business-broadband-providers-uk"),
        kw("business broadband providers", 1000, 49, 53.80, "B2B commercial", "MOFU", "Business broadband", "Guide", "/guides/best-business-broadband-providers-uk"),
        kw("leased line cost uk", 720, 30, 18.40, "B2B commercial", "BOFU", "Business broadband", "Guide", gap_slug="guides/leased-line-cost-uk-explained", gap_title="Leased line cost UK: what small businesses actually pay"),
        kw("static ip business broadband", 480, 24, 9.20, "B2B commercial", "MOFU", "Business broadband", "Guide", gap_slug="guides/static-ip-business-broadband-explained", gap_title="Static IP business broadband: when you need one and how much it costs"),
        kw("small office broadband setup", 390, 22, 6.10, "B2B commercial", "MOFU", "Business broadband", "Guide", gap_slug="guides/small-office-broadband-setup-uk", gap_title="Small office broadband setup: routers, backup and support checklist"),
    ]

    # --- Phone & bundles ----------------------------------------------------
    rows += [
        kw("phone and broadband deals", 14800, 57, 4.07, "Commercial", "BOFU", "Phone & bundles", "Guide", "/guides/best-phone-and-broadband-deals"),
        kw("landline broadband deals", 14800, 50, 4.23, "Commercial", "BOFU", "Phone & bundles", "Guide", "/guides/best-phone-and-broadband-deals"),
        kw("broadband without phone line", 2900, 40, 3.10, "Commercial guide", "MOFU", "Phone & bundles", "Guide", "/guides/broadband-without-phone-line"),
    ]

    # --- Trust & research -----------------------------------------------------
    rows += [
        kw("uk broadband customer satisfaction", 1600, 25, 3.41, "Research", "TOFU", "Trust & research", "Research page", "/research/uk-broadband-customer-satisfaction"),
        kw("best customer service broadband provider", 880, 27, 3.10, "Research", "MOFU", "Trust & research", "Research page", gap_slug="research/broadband-customer-service-rankings-uk", gap_title="Broadband customer service rankings: Ofcom-evidenced comparison"),
        kw("how we make money broadband picker", 40, 5, 0.00, "Brand/trust", "TOFU", "Trust & compliance", "Policy", "/how-we-make-money"),
    ]

    # --- Alternative access / satellite -------------------------------------
    rows += [
        kw("satellite broadband uk", 2400, 30, 2.90, "Commercial guide", "MOFU", "Alternative access", "Guide", "/guides/satellite-broadband-uk"),
        kw("starlink vs openreach broadband", 590, 24, 2.20, "Commercial comparison", "MOFU", "Alternative access", "Guide", gap_slug="guides/starlink-vs-fibre-broadband-uk", gap_title="Starlink vs fibre broadband: when satellite makes sense in the UK"),
    ]

    # --- Tools -----------------------------------------------------------------
    rows += [
        kw("broadband cost per mbps calculator", 210, 16, 1.10, "Tool", "MOFU", "Tools", "Interactive tool", gap_slug="tools/broadband-cost-calculator", gap_title="Broadband cost calculator: true monthly and contract-length cost"),
    ]

    # --- Informational / glossary -----------------------------------------------
    rows += [
        kw("broadband glossary terms explained", 480, 15, 0.90, "Informational", "TOFU", "Informational", "Glossary", "/broadband-glossary"),
        kw("what is fttp broadband", 1300, 21, 1.40, "Informational", "TOFU", "Informational", "Glossary", "/broadband-glossary"),
        kw("what is a good broadband speed", 2400, 23, 1.60, "Informational", "TOFU", "Informational", "Glossary", "/broadband-glossary"),
    ]

    return rows


# ---------------------------------------------------------------------------
# 3. Optional: pull extra keyword ideas out of the source Google Sheet
# ---------------------------------------------------------------------------

def read_source_sheet_keywords(sheet_id: str) -> list[str]:
    """Read every non-empty cell that looks like a keyword phrase from a shared sheet.

    Requires the sheet to be shared as at least Viewer with the service account
    used for GOOGLE_APPLICATION_CREDENTIALS / GOOGLE_SERVICE_ACCOUNT_JSON.
    """
    token = google_access_token(["https://www.googleapis.com/auth/spreadsheets.readonly"])
    base = f"https://sheets.googleapis.com/v4/spreadsheets/{sheet_id}"
    metadata = sheets_request(token, "GET", base + "?fields=sheets(properties(title))")
    found: set[str] = set()
    for sheet in metadata.get("sheets", []):
        title = sheet["properties"]["title"]
        quoted = urllib.parse.quote(f"'{title}'!A1:Z2000", safe="")
        values = sheets_request(token, "GET", f"{base}/values/{quoted}").get("values", [])
        for row in values:
            for cell in row:
                text = str(cell).strip().lower()
                if 3 <= len(text) <= 70 and re.search(r"[a-z]", text) and "broadband" in text:
                    found.add(text)
    return sorted(found)


def merge_source_keywords(rows: list[KeywordRow], extra_keywords: list[str]) -> list[KeywordRow]:
    existing = {r["keyword"] for r in rows}
    added = 0
    for phrase in extra_keywords:
        if phrase in existing:
            continue
        rows.append(kw(
            phrase, 0, 0, 0.0, "Unclassified — from source sheet", "Unscored",
            "From source sheet (needs triage)", "Unassigned",
            gap_slug=None, gap_title=None,
        ))
        existing.add(phrase)
        added += 1
    if added:
        print(f"Merged {added} additional keyword(s) from the source sheet (unscored, needs triage)")
    return rows


# ---------------------------------------------------------------------------
# 4. Scoring and workbook assembly
# ---------------------------------------------------------------------------

def priority_score(volume: int, difficulty: int, cpc: float, intent: str) -> float:
    """Weighted for an affiliate site: commercial value counts for more than
    on a pure-traffic play, since CPC/intent tracks likely Awin conversion value."""
    if volume == 0 and difficulty == 0 and cpc == 0:
        return 0.0
    intent_weight = 1.3 if "commercial" in intent.lower() or "b2b" in intent.lower() else 1.0
    demand = min(100, (volume ** 0.5) / 4) if volume else 5
    opportunity = max(5, 100 - difficulty)
    value = min(100, cpc * 3)
    return round((demand * 0.30 + opportunity * 0.30 + value * 0.40) * intent_weight, 1)


def ranking_ease_score(volume: int, difficulty: int, cpc: float, intent: str) -> float:
    """Score a keyword for a newer site's publish queue, with rankability first.

    Difficulty deliberately carries most of the weight. Demand and commercial
    value prevent tiny, low-value terms from dominating merely because they are
    easy. The score is directional and should be refreshed with first-party data.
    """
    if volume == 0 and difficulty == 0 and cpc == 0:
        return 0.0
    ease = max(0, min(100, 100 - difficulty))
    demand = min(100, (volume ** 0.5) / 4) if volume else 0
    commercial = 100 if "commercial" in intent.lower() or "b2b" in intent.lower() else 55
    value = min(100, cpc * 10)
    return round(ease * 0.60 + demand * 0.20 + commercial * 0.15 + value * 0.05, 1)


def difficulty_band(difficulty: float) -> str:
    if difficulty <= 20:
        return "Very easy"
    if difficulty <= 30:
        return "Easy"
    if difficulty <= 40:
        return "Moderate"
    if difficulty <= 55:
        return "Competitive"
    return "Very competitive"


def priority_rationale(difficulty: float, volume: int, intent: str, keyword_count: int) -> str:
    demand = "strong" if volume >= 1000 else "useful" if volume >= 300 else "niche"
    commercial = "commercial intent" if "commercial" in intent.lower() or "b2b" in intent.lower() else "supporting intent"
    return (
        f"{difficulty_band(difficulty)} opportunity (difficulty {difficulty:.0f}); "
        f"{demand} combined demand ({volume:,}/mo); {commercial}; "
        f"covers {keyword_count} mapped keyword{'s' if keyword_count != 1 else ''}."
    )


def affiliate_potential(cpc: float, intent: str) -> str:
    if cpc >= 5 or "commercial" in intent.lower() or "b2b" in intent.lower():
        return "High"
    if cpc >= 2:
        return "Medium"
    if cpc > 0:
        return "Low"
    return "Unscored"


def add_sheet(wb: Workbook, name: str, headers: list[str], rows: list[list[Any]]) -> Any:
    ws = wb.create_sheet(name)
    ws.append(headers)
    for row in rows:
        ws.append(row)
    style_sheet(ws)
    if rows and headers:
        ref = f"A1:{get_column_letter(len(headers))}{len(rows) + 1}"
        table = Table(displayName=re.sub(r"\W+", "", name)[:20] + "Table", ref=ref)
        table.tableStyleInfo = TableStyleInfo(name="TableStyleMedium2", showRowStripes=True)
        ws.add_table(table)
    return ws


def style_sheet(ws: Any) -> None:
    navy, pale = "0F172A", "EAF6F5"
    thin = Side(style="thin", color="D7E1E8")
    ws.freeze_panes = "A2"
    ws.auto_filter.ref = ws.dimensions
    ws.sheet_view.showGridLines = False
    for cell in ws[1]:
        cell.fill = PatternFill("solid", fgColor=navy)
        cell.font = Font(color="FFFFFF", bold=True)
        cell.alignment = Alignment(wrap_text=True, vertical="center")
    ws.row_dimensions[1].height = 34
    for row in ws.iter_rows(min_row=2):
        for cell in row:
            cell.alignment = Alignment(wrap_text=True, vertical="top")
            cell.border = Border(bottom=thin)
    for column in range(1, ws.max_column + 1):
        values = [str(ws.cell(row, column).value or "") for row in range(1, min(ws.max_row, 80) + 1)]
        width = min(48, max(10, max(len(v) for v in values) + 2))
        ws.column_dimensions[get_column_letter(column)].width = width
    for row in range(2, ws.max_row + 1):
        if row % 2 == 0:
            for cell in ws[row]:
                cell.fill = PatternFill("solid", fgColor=pale)


def build_workbook(
    output: Path, urls: list[str], audit: list[dict[str, Any]],
    keywords: list[KeywordRow], source_sheet_id: str | None,
) -> Workbook:
    wb = Workbook()
    wb.remove(wb.active)

    audited_by_url = {row["url"]: row for row in audit}
    live_paths = {urllib.parse.urlparse(u).path or "/" for u in urls}
    live_check_performed = any(row.get("status") for row in audit)

    # Enrich mapped rows and score everything.
    for row in keywords:
        row["priority"] = priority_score(row["volume"], row["difficulty"], row["cpc"], row["intent"])
        row["ranking_ease"] = ranking_ease_score(row["volume"], row["difficulty"], row["cpc"], row["intent"])
        row["affiliate_potential"] = affiliate_potential(row["cpc"], row["intent"])
        if row["mapped_url"]:
            path = row["mapped_url"]
            row["status"] = "Existing page" if path in live_paths or not urls else "Existing page (mapped)"
            row["target_url"] = SITE + path
        elif row["gap_slug"]:
            row["status"] = "Content gap — recommend new page"
            row["target_url"] = f"{SITE}/{row['gap_slug']}"
        else:
            row["status"] = "Unassigned — needs triage"
            row["target_url"] = ""

    # --- Read Me -----------------------------------------------------------
    readme = [
        ["Purpose", "Detailed keyword-to-page mapping for BroadbandPicker.co.uk, covering every live page and every recommended future page, prioritised for Awin affiliate revenue."],
        ["Generated", RUN_DATE],
        ["Site analysed", SITE],
        ["Source sheet analysed", f"https://docs.google.com/spreadsheets/d/{source_sheet_id}/edit" if source_sheet_id else "None supplied"],
        ["Evidence hierarchy", "Live sitemap crawl (page titles/H1/word count) + an editorially assigned, dated UK keyword snapshot + any keywords merged from the source sheet."],
        ["Volume/CPC caveat", "Monthly search volume and CPC are directional third-party-style estimates, not Google Search Console or Google Ads data. They are not additive across variants. Re-validate in Google Ads Keyword Planner/GSC before committing budget."],
        ["Scoring", "SEO Build Priority is rankability-first: 60% inverse keyword difficulty, 20% demand, 15% intent and 5% CPC. Revenue Priority remains available as a secondary commercial signal."],
        ["Objective", "Build a defensible, evidence-led UK broadband affiliate content plan: map demand to the right page type, close content gaps in priority order, and avoid duplicate/competing pages for the same keyword."],
        ["How to use", "Build the first non-complete page on Content Gap Roadmap. Each online run checks the live sitemap and HTTP response, moves completed pages below the active queue, labels their deployment status and strikes them through."],
        ["Re-run", "python3 scripts/build_keyword_mapping.py --create-google-doc --share-with <email>"],
    ]
    add_sheet(wb, "Read Me", ["Field", "Detail"], readme)

    # --- Keyword Mapping (main) --------------------------------------------
    mapping_headers = [
        "Keyword", "Est. Monthly UK Volume", "Difficulty (0-100)", "Est. CPC (GBP)",
        "Search Intent", "Funnel Stage", "Topic Cluster", "Page Type",
        "Mapping Status", "Mapped / Recommended URL", "SEO Ease Score", "Revenue Priority Score",
        "Affiliate Revenue Potential",
    ]
    mapping_rows = []
    for row in sorted(keywords, key=lambda r: r["priority"], reverse=True):
        mapping_rows.append([
            row["keyword"], row["volume"] or "", row["difficulty"] or "", row["cpc"] or "",
            row["intent"], row["funnel"], row["cluster"], row["page_type"],
            row["status"], row["target_url"], row["ranking_ease"], row["priority"], row["affiliate_potential"],
        ])
    add_sheet(wb, "Keyword Mapping", mapping_headers, mapping_rows)

    # --- Current Page Inventory --------------------------------------------
    inventory_headers = ["Path", "Topic Cluster", "Page Type", "Live Title", "H1", "Word Count", "Mapped Keywords", "Notes"]
    inventory_rows = []
    keyword_count_by_path: dict[str, list[str]] = {}
    for row in keywords:
        if row["mapped_url"]:
            keyword_count_by_path.setdefault(row["mapped_url"], []).append(row["keyword"])
    for url in urls:
        path = urllib.parse.urlparse(url).path or "/"
        cluster, page_type = route_family(path)
        crawled = audited_by_url.get(url, {})
        mapped_terms = keyword_count_by_path.get(path, [])
        inventory_rows.append([
            path, cluster, page_type, crawled.get("title", ""), crawled.get("h1", ""),
            crawled.get("words", ""), ", ".join(mapped_terms[:6]) + (f" (+{len(mapped_terms)-6} more)" if len(mapped_terms) > 6 else ""),
            crawled.get("notes", ""),
        ])
    add_sheet(wb, "Current Page Inventory", inventory_headers, inventory_rows)

    # --- Content Gap Roadmap -------------------------------------------------
    gap_headers = [
        "Next Build Priority", "Current Status", "Last Live Check", "Recommended URL", "Page Title", "Topic Cluster", "Page Type",
        "Primary Keywords", "Combined Est. Volume", "Weighted Difficulty", "Ranking Difficulty Band",
        "SEO Build Priority Score", "Revenue Priority Score", "Why This Position",
    ]
    gap_groups: dict[str, dict[str, Any]] = {}
    for row in keywords:
        if not row.get("gap_slug"):
            continue
        group = gap_groups.setdefault(row["gap_slug"], {
            "title": row.get("gap_title") or row["keyword"], "cluster": row["cluster"],
            "page_type": row["page_type"], "keywords": [], "volume": 0, "priority": 0.0,
            "weighted_difficulty": 0.0, "difficulty_weight": 0, "ranking_ease": 0.0,
            "commercial_intent": row["intent"], "max_cpc": 0.0,
        })
        group["keywords"].append(row["keyword"])
        group["volume"] += row["volume"]
        group["priority"] = max(group["priority"], row["priority"])
        weight = max(row["volume"], 1)
        group["weighted_difficulty"] += row["difficulty"] * weight
        group["difficulty_weight"] += weight
        group["max_cpc"] = max(group["max_cpc"], row["cpc"])
        if "commercial" in row["intent"].lower() or "b2b" in row["intent"].lower():
            group["commercial_intent"] = row["intent"]
    for slug, group in gap_groups.items():
        group["weighted_difficulty"] = round(
            group["weighted_difficulty"] / group["difficulty_weight"], 1
        ) if group["difficulty_weight"] else 100.0
        group["ranking_ease"] = ranking_ease_score(
            group["volume"], round(group["weighted_difficulty"]),
            group["max_cpc"], group["commercial_intent"],
        )
        target_url = f"{SITE}/{slug}"
        page_audit = audited_by_url.get(target_url, {})
        http_status = page_audit.get("status")
        group["complete"] = bool(http_status and 200 <= int(http_status) < 400)
        if group["complete"]:
            platform = page_audit.get("platform") or "Live host"
            group["status"] = "Built, live and deployed on Vercel" if platform == "Vercel" else "Built and live"
        elif target_url in audited_by_url and http_status:
            group["status"] = f"Built route detected; HTTP {http_status}"
        elif not live_check_performed:
            group["status"] = "Planned — live check unavailable"
        else:
            group["status"] = "Planned — not live"
        group["last_live_check"] = RUN_DATE if live_check_performed else ""
    gap_rows_sorted = sorted(
        gap_groups.items(),
        key=lambda kv: (
            kv[1]["complete"], -kv[1]["ranking_ease"], kv[1]["weighted_difficulty"],
            -kv[1]["volume"], -kv[1]["priority"],
        ),
    )
    gap_rows_out = []
    next_priority = 0
    completed_row_numbers = []
    for slug, group in gap_rows_sorted:
        if not group["complete"]:
            next_priority += 1
        else:
            completed_row_numbers.append(len(gap_rows_out) + 2)
        gap_rows_out.append([
            next_priority if not group["complete"] else "", group["status"], group["last_live_check"],
            f"{SITE}/{slug}", group["title"], group["cluster"], group["page_type"],
            "; ".join(group["keywords"]), group["volume"], group["weighted_difficulty"],
            difficulty_band(group["weighted_difficulty"]), group["ranking_ease"], group["priority"],
            priority_rationale(group["weighted_difficulty"], group["volume"], group["commercial_intent"], len(group["keywords"])),
        ])
    roadmap_ws = add_sheet(wb, "Content Gap Roadmap", gap_headers, gap_rows_out)
    for row_number in completed_row_numbers:
        for cell in roadmap_ws[row_number]:
            cell.font = Font(name=cell.font.name, size=cell.font.sz, bold=cell.font.bold,
                             italic=cell.font.italic, color=cell.font.color, strike=True)

    # --- Cluster Summary -----------------------------------------------------
    cluster_headers = ["Topic Cluster", "Keyword Count", "Total Est. Volume", "Existing-Page Keywords", "Content-Gap Keywords", "Avg Priority Score"]
    cluster_stats: dict[str, dict[str, Any]] = {}
    for row in keywords:
        stats = cluster_stats.setdefault(row["cluster"], {"count": 0, "volume": 0, "existing": 0, "gap": 0, "priority_sum": 0.0})
        stats["count"] += 1
        stats["volume"] += row["volume"]
        stats["priority_sum"] += row["priority"]
        if row["mapped_url"]:
            stats["existing"] += 1
        elif row["gap_slug"]:
            stats["gap"] += 1
    cluster_rows = []
    for cluster, stats in sorted(cluster_stats.items(), key=lambda kv: kv[1]["volume"], reverse=True):
        cluster_rows.append([
            cluster, stats["count"], stats["volume"], stats["existing"], stats["gap"],
            round(stats["priority_sum"] / stats["count"], 1) if stats["count"] else 0,
        ])
    add_sheet(wb, "Cluster Summary", cluster_headers, cluster_rows)

    # --- Methodology -----------------------------------------------------------
    methodology = [
        ["Site crawl", "Live sitemap.xml fetched at run time; each URL lightly audited for <title>, H1 and word count so mapped/gap status reflects the current build, not a stale snapshot."],
        ["Keyword universe", "Editorially assembled from the site's existing 13 provider pages, 15 vs-comparison pages, 30 guides, postcode hub, priority landing pages and known UK broadband search patterns, extended with high-intent gaps competitors typically rank for."],
        ["Volume/difficulty/CPC", "Directional UK estimates in the same style/scale as the existing docs/uk-broadband-seo-geo-plan.xlsx snapshot. Treat as ranking/prioritisation signal, not a traffic forecast."],
        ["Mapping status", "'Existing page' = a live URL already targets this term. 'Content gap' = no live page targets it; a specific new URL, title and cluster is recommended. 'Unassigned' = pulled from the source sheet and needs manual triage."],
        ["SEO build priority", "Content gaps are ordered by a 0-100 rankability-first score: 60% inverse keyword difficulty, 20% demand, 15% intent and 5% CPC. Easier pages lead; value signals break ties."],
        ["Revenue priority score", "Secondary 0-130 commercial score combining demand, inverse difficulty and CPC, boosted for commercial/B2B intent. It no longer controls publish order."],
        ["Build/deployment status", "On online runs, a planned page is marked complete only when its exact URL appears in the live sitemap and returns HTTP 2xx/3xx. Vercel is confirmed from response headers. Completed rows move below the active queue and are struck through."],
        ["Affiliate revenue potential", "High: CPC >= £5 or commercial/B2B intent. Medium: CPC £2-5. Low: CPC < £2. Unscored: source-sheet keyword pending triage."],
        ["Update cadence", "Re-run monthly, or after publishing new pages, so 'Existing page' status stays accurate and newly closed content gaps drop off the roadmap."],
    ]
    add_sheet(wb, "Methodology", ["Aspect", "Detail"], methodology)

    return wb


def validate(wb: Workbook) -> None:
    required = {"Read Me", "Keyword Mapping", "Current Page Inventory", "Content Gap Roadmap", "Cluster Summary", "Methodology"}
    missing = required - set(wb.sheetnames)
    if missing:
        raise RuntimeError(f"Workbook missing expected sheets: {sorted(missing)}")


# ---------------------------------------------------------------------------
# 5. Google auth + Sheets/Drive helpers (service account, same pattern as
#    scripts/build_uk_broadband_seo_plan.py)
# ---------------------------------------------------------------------------

def google_access_token(scopes: list[str]) -> str:
    try:
        from google.oauth2 import service_account
        from google.auth.transport.requests import Request
    except ImportError as exc:
        raise RuntimeError("Google sync requires: pip install -r requirements-seo.txt") from exc

    raw_json = os.environ.get("GOOGLE_SERVICE_ACCOUNT_JSON", "").strip()
    credentials_path = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS", "").strip()
    if raw_json:
        credentials = service_account.Credentials.from_service_account_info(json.loads(raw_json), scopes=scopes)
    elif credentials_path:
        credentials = service_account.Credentials.from_service_account_file(credentials_path, scopes=scopes)
    else:
        raise RuntimeError(
            "Set GOOGLE_SERVICE_ACCOUNT_JSON or GOOGLE_APPLICATION_CREDENTIALS. "
            "Share the source sheet (Viewer) and, for doc creation, no sharing is "
            "needed up front — the script shares the new file itself via --share-with."
        )
    credentials.refresh(Request())
    return credentials.token


def sheets_request(token: str, method: str, url: str, **kwargs: Any) -> dict[str, Any]:
    headers = kwargs.pop("headers", {})
    headers.update({"Authorization": f"Bearer {token}", "Content-Type": "application/json"})
    response = requests.request(method, url, headers=headers, timeout=60, **kwargs)
    if not response.ok:
        raise RuntimeError(f"Google API {response.status_code}: {response.text[:800]}")
    return response.json() if response.content else {}


def create_google_sheet_from_workbook(wb: Workbook, title: str, share_with: str | None) -> dict[str, Any]:
    """Create a brand-new Google Sheet on Drive containing every tab in wb."""
    token = google_access_token([
        "https://www.googleapis.com/auth/spreadsheets",
        "https://www.googleapis.com/auth/drive.file",
    ])
    create_body = {
        "properties": {"title": title},
        "sheets": [
            {"properties": {"title": name, "gridProperties": {"frozenRowCount": 1}}}
            for name in wb.sheetnames
        ],
    }
    created = sheets_request(token, "POST", "https://sheets.googleapis.com/v4/spreadsheets", json=create_body)
    spreadsheet_id = created["spreadsheetId"]
    base = f"https://sheets.googleapis.com/v4/spreadsheets/{spreadsheet_id}"

    data = []
    format_requests: list[dict[str, Any]] = []
    for sheet in wb.sheetnames:
        ws = wb[sheet]
        rows = [[cell.value if cell.value is not None else "" for cell in row] for row in ws.iter_rows()]
        if not rows:
            continue
        last_col = get_column_letter(len(rows[0]))
        data.append({"range": f"'{sheet}'!A1:{last_col}{len(rows)}", "values": rows})
        sheet_id = next(s["properties"]["sheetId"] for s in created["sheets"] if s["properties"]["title"] == sheet)
        format_requests.append({
            "repeatCell": {
                "range": {"sheetId": sheet_id, "startRowIndex": 0, "endRowIndex": 1},
                "cell": {"userEnteredFormat": {
                    "backgroundColor": {"red": 0.06, "green": 0.09, "blue": 0.16},
                    "textFormat": {"foregroundColor": {"red": 1, "green": 1, "blue": 1}, "bold": True},
                    "wrapStrategy": "WRAP",
                }},
                "fields": "userEnteredFormat(backgroundColor,textFormat,wrapStrategy)",
            }
        })
        format_requests.append({"setBasicFilter": {"filter": {"range": {"sheetId": sheet_id}}}})

    if data:
        sheets_request(token, "POST", f"{base}/values:batchUpdate", json={"valueInputOption": "RAW", "data": data})
    if format_requests:
        sheets_request(token, "POST", f"{base}:batchUpdate", json={"requests": format_requests})

    if share_with:
        drive_token = token  # drive.file scope covers files this credential created
        requests.post(
            f"https://www.googleapis.com/drive/v3/files/{spreadsheet_id}/permissions",
            headers={"Authorization": f"Bearer {drive_token}", "Content-Type": "application/json"},
            params={"sendNotificationEmail": "false"},
            json={"type": "user", "role": "writer", "emailAddress": share_with},
            timeout=30,
        ).raise_for_status()

    return {"spreadsheetId": spreadsheet_id, "spreadsheetUrl": created.get("spreadsheetUrl"), "sharedWith": share_with}


def update_google_sheet_from_workbook(wb: Workbook, spreadsheet_id: str) -> dict[str, Any]:
    """Synchronise this workbook into an existing native Google Sheet in place."""
    token = google_access_token(["https://www.googleapis.com/auth/spreadsheets"])
    base = f"https://sheets.googleapis.com/v4/spreadsheets/{spreadsheet_id}"
    metadata = sheets_request(
        token, "GET", base,
        params={"fields": "properties(title),sheets(properties(sheetId,title),tables(tableId,range))"},
    )
    remote = {sheet["properties"]["title"]: sheet for sheet in metadata.get("sheets", [])}
    missing = [name for name in wb.sheetnames if name not in remote]
    if missing:
        raise RuntimeError(f"Target Google Sheet is missing tabs: {missing}")

    values_payload = []
    format_requests: list[dict[str, Any]] = []
    for name in wb.sheetnames:
        ws = wb[name]
        rows = [[cell.value if cell.value is not None else "" for cell in row] for row in ws.iter_rows()]
        last_col = get_column_letter(ws.max_column)
        quoted_name = name.replace("'", "''")
        clear_range = urllib.parse.quote(f"'{quoted_name}'!A1:Z2000", safe="")
        sheets_request(token, "POST", f"{base}/values/{clear_range}:clear", json={})
        values_payload.append({"range": f"'{quoted_name}'!A1:{last_col}{ws.max_row}", "values": rows})
        sheet_id = remote[name]["properties"]["sheetId"]
        format_requests.append({
            "repeatCell": {
                "range": {"sheetId": sheet_id, "startRowIndex": 0, "endRowIndex": ws.max_row,
                          "startColumnIndex": 0, "endColumnIndex": ws.max_column},
                "cell": {"userEnteredFormat": {"wrapStrategy": "WRAP", "verticalAlignment": "TOP"}},
                "fields": "userEnteredFormat(wrapStrategy,verticalAlignment)",
            }
        })
        format_requests.append({
            "repeatCell": {
                "range": {"sheetId": sheet_id, "startRowIndex": 0, "endRowIndex": 1,
                          "startColumnIndex": 0, "endColumnIndex": ws.max_column},
                "cell": {"userEnteredFormat": {"textFormat": {"bold": True}}},
                "fields": "userEnteredFormat.textFormat.bold",
            }
        })
        tables = remote[name].get("tables", [])
        if tables:
            format_requests.append({
                "updateTable": {
                    "table": {"tableId": tables[0]["tableId"], "range": {
                        "sheetId": sheet_id, "startRowIndex": 0, "endRowIndex": ws.max_row,
                        "startColumnIndex": 0, "endColumnIndex": ws.max_column,
                    }},
                    "fields": "range",
                }
            })

    sheets_request(token, "POST", f"{base}/values:batchUpdate",
                   json={"valueInputOption": "RAW", "data": values_payload})
    if "Content Gap Roadmap" in wb.sheetnames:
        ws = wb["Content Gap Roadmap"]
        sheet_id = remote["Content Gap Roadmap"]["properties"]["sheetId"]
        for row_number in range(2, ws.max_row + 1):
            if str(ws.cell(row_number, 2).value or "").startswith("Built"):
                format_requests.append({
                    "repeatCell": {
                        "range": {"sheetId": sheet_id, "startRowIndex": row_number - 1,
                                  "endRowIndex": row_number, "startColumnIndex": 0,
                                  "endColumnIndex": ws.max_column},
                        "cell": {"userEnteredFormat": {"textFormat": {"strikethrough": True}}},
                        "fields": "userEnteredFormat.textFormat.strikethrough",
                    }
                })
    if format_requests:
        sheets_request(token, "POST", f"{base}:batchUpdate", json={"requests": format_requests})
    return {"spreadsheetId": spreadsheet_id,
            "spreadsheetUrl": f"https://docs.google.com/spreadsheets/d/{spreadsheet_id}/edit"}


# ---------------------------------------------------------------------------
# 6. CLI
# ---------------------------------------------------------------------------

def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    parser.add_argument("--offline", action="store_true", help="Skip the live sitemap crawl and use the static page snapshot")
    parser.add_argument("--max-pages", type=int, default=140, help="Maximum live pages to audit")
    parser.add_argument("--source-sheet-id", default=os.environ.get("BROADBANDPICKER_SOURCE_SHEET_ID", DEFAULT_SOURCE_SHEET_ID),
                         help="Google Sheet ID to read extra keyword ideas from (must be shared with the service account)")
    parser.add_argument("--skip-source-sheet", action="store_true", help="Do not read the source sheet even if an ID is set")
    parser.add_argument("--create-google-doc", action="store_true", help="Create a brand-new Google Sheet on Drive with the finished mapping")
    parser.add_argument("--update-google-sheet-id", default=os.environ.get("BROADBANDPICKER_MAPPING_SHEET_ID", ""),
                        help=f"Update an existing mapping Sheet in place (for this plan use {DEFAULT_MAPPING_SHEET_ID})")
    parser.add_argument("--doc-title", default=f"BroadbandPicker Keyword Mapping — {RUN_DATE}")
    parser.add_argument("--share-with", default=os.environ.get("BROADBANDPICKER_SHARE_EMAIL", ""),
                         help="Email to share the newly created Google Sheet with as Editor")
    args = parser.parse_args()

    urls = get_sitemap_urls(args.offline)
    print(f"Found {len(urls)} live sitemap URLs")
    audit = []
    if not args.offline:
        for index, url in enumerate(urls[:args.max_pages], 1):
            print(f"Auditing {index}/{min(len(urls), args.max_pages)}: {url}")
            audit.append(audit_page(url))
            time.sleep(0.05)

    keywords = build_keyword_dataset()
    print(f"Built {len(keywords)} curated keyword rows")

    if args.source_sheet_id and not args.skip_source_sheet:
        try:
            extra = read_source_sheet_keywords(args.source_sheet_id)
            keywords = merge_source_keywords(keywords, extra)
        except Exception as exc:
            print(f"Warning: could not read source sheet {args.source_sheet_id} ({exc}); continuing without it")

    wb = build_workbook(args.output.resolve(), urls, audit, keywords, args.source_sheet_id if not args.skip_source_sheet else None)
    validate(wb)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    wb.save(args.output.resolve())
    print(f"Saved {args.output.resolve()}")

    doc_result = None
    if args.create_google_doc:
        wb_for_upload = load_workbook(args.output.resolve())
        doc_result = create_google_sheet_from_workbook(wb_for_upload, args.doc_title, args.share_with or None)
        print(f"Created Google Sheet: {doc_result['spreadsheetUrl']}")
    elif args.update_google_sheet_id:
        wb_for_upload = load_workbook(args.output.resolve())
        doc_result = update_google_sheet_from_workbook(wb_for_upload, args.update_google_sheet_id)
        print(f"Updated Google Sheet: {doc_result['spreadsheetUrl']}")

    print(json.dumps({
        "output": str(args.output.resolve()),
        "sheets": load_workbook(args.output.resolve(), read_only=True).sheetnames,
        "site_urls": len(urls),
        "audited_pages": len(audit),
        "keyword_rows": len(keywords),
        "google_doc": doc_result,
    }, indent=2))


if __name__ == "__main__":
    main()
