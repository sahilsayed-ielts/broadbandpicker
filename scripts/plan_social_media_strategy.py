#!/usr/bin/env python3
"""Plan BroadbandPicker's social content from the workspace plus live web research.

The script:
1. Reads brand, product, provider, guide, tool, colour and marketing files in this repo.
2. Scrapes live pages (own site, Ofcom, ASA, Awin, competitor broadband hubs) so channel
   choices, intents and compliance are dated, not guessed.
3. Maps UK broadband search intents to the channels that actually reach those people,
   plus LinkedIn/X surfaces that broadband affiliate managers lurk on.
4. Writes a full operating kit: sarcastic-but-relatable content plans, ready-to-paste
   captions, ChatGPT illustration prompts, and design briefs in the site's plush
   minimal navy/sky look — ready to design and post.

Usage:
    python3 scripts/plan_social_media_strategy.py
    python3 scripts/plan_social_media_strategy.py --weeks 6
    python3 scripts/plan_social_media_strategy.py --start-date 2026-08-31
    python3 scripts/plan_social_media_strategy.py --skip-web
    python3 scripts/plan_social_media_strategy.py --post
    python3 scripts/plan_social_media_strategy.py --post --live --platform x --limit 1

Output lives in docs/social media manager/. Drop ChatGPT stills in
docs/social media manager/artworks/ then run --post (dry run) or --post --live.
"""

from __future__ import annotations

import argparse
import csv
import json
import os
import re
import urllib.parse
from dataclasses import asdict, dataclass, field
from datetime import date, datetime, timedelta, timezone
from html.parser import HTMLParser
from pathlib import Path
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "docs" / "social media manager"
IG_DIR = OUT_DIR / "Instagram Content creation"
X_DIR = OUT_DIR / "X"
TT_DIR = OUT_DIR / "tiktok"
LI_DIR = OUT_DIR / "LinkedIn"
YT_DIR = OUT_DIR / "YouTube"
FB_DIR = OUT_DIR / "Facebook"
SITE = "https://broadbandpicker.co.uk"
HANDLE_X = "@broadbandPicker"
DEFAULT_START = date.today()
DEFAULT_GOOGLE_SHEET_ID = "12sGB-98mD2OXHTAcRlBTAkt2s1V66G04"
DEFAULT_GOOGLE_SHEET_GID = 1116163766
DEFAULT_CREDENTIALS = Path("/Users/sahilrafiqsayed/broadbandpicker-ga4-credentials.json")
MASTER_SHEET_TITLE = "Social plan"
PROFILES_SHEET_TITLE = "Profiles"
PROFILES_HEADERS = [
    "platform",
    "field",
    "limit",
    "chars_used",
    "paste_this",
    "notes",
    "public_url",
    "avatar",
]

MASTER_HEADERS = [
    "section",
    "date",
    "day",
    "timezone",
    "time_uk",
    "peak_window_uk",
    "why_this_slot",
    "design_by_date",
    "design_by_time_uk",
    "week_or_day",
    "platform",
    "format",
    "status",
    "idea_id",
    "title",
    "pillar",
    "intents",
    "hook",
    "caption_paste",
    "first_comment_paste",
    "alt_text",
    "artwork_size",
    "on_screen_text",
    "chatgpt_prompt",
    "visual_concept",
    "why",
    "compliance",
    "cta",
    "notes",
    "posted_url",
]
USER_AGENT = (
    "BroadbandPickerSocialResearchBot/1.0 "
    "(editorial research; https://broadbandpicker.co.uk/contact)"
)

BRAND_PRIMARY = "#0EA5E9"
BRAND_NAVY = "#0F172A"
BRAND_GREEN = "#22C55E"
BRAND_SLATE = "#F8FAFC"
BRAND_WHITE = "#FFFFFF"
BRAND_SKY_SOFT = "#7DD3FC"
BRAND_PAPER = "#F8FAFC"
BRAND_INK = "#0F172A"

# Visual language locked to the live 'Engineer Window' poster: navy outer
# canvas, paper inner card, editorial British cartoon, sky punchline, logo footer.
DESIGN_LOOK = (
    "Match the BroadbandPicker poster system (the Engineer Window reference). "
    "1) Full-bleed outer canvas in deep navy #0F172A. "
    "2) A large rounded paper card #F8FAFC (corner radius 28-32px) sitting on the navy "
    "so a navy footer strip remains at the bottom. "
    "3) Top of the card: one small sky-blue #0EA5E9 icon, centred (clock, wifi arc, kettle). "
    "4) Headline in huge Inter ExtraBold navy #0F172A, 2 to 5 words, slightly tracked, British English. "
    "5) A thin sky #0EA5E9 hairline under the headline. "
    "6) One giant navy fact, time or price (example: 8AM-6PM). "
    "7) A sky-blue sarcastic punchline under the fact, smaller than the headline "
    "(example: So... Tuesday.). "
    "8) Illustration: clean editorial British cartoon, black/navy outlines, flat colour, "
    "limited palette navy/sky/grey/white. Split before/after or left/right panels with tiny "
    "navy time labels. Simple cartoon people (jumpers, slippers, glasses) not photoreal, "
    "not stock, not 3D, not celebrity. British terrace, kettle, mug, router, van, flask, "
    "pizza box, laptop allowed. "
    "9) Navy footer: left-aligned sky rounded-square wifi-mark (two white arcs + white dot, "
    "like public/logo.svg) then white wordmark BroadbandPicker and URL broadbandpicker.co.uk "
    "in smaller white or sky type. "
    "10) Matte. One joke. No extra slogans, no QR, no fake ISP logos, no SALE red, "
    "no emojis on the artwork, no 'comment below'."
)

SKIP_DIR_NAMES = {
    "node_modules",
    ".git",
    ".next",
    "dist",
    "coverage",
    "__pycache__",
}


# ---------------------------------------------------------------------------
# Workspace analysis
# ---------------------------------------------------------------------------


def read_text(relative: str) -> str:
    path = ROOT / relative
    if not path.exists() or not path.is_file():
        return ""
    try:
        return path.read_text(encoding="utf-8", errors="replace")
    except OSError:
        return ""


def unique(items: list[str]) -> list[str]:
    seen: set[str] = set()
    out: list[str] = []
    for item in items:
        key = item.strip()
        if key and key not in seen:
            seen.add(key)
            out.append(key)
    return out


def clean_social_links(urls: list[str]) -> list[str]:
    skip = (
        "facebook.com/tr",
        "/sharer",
        "intent/tweet",
        "linkedin.com/in/",
        "linkedin.com/sharing",
        "platform.twitter.com",
        "youtube.com/embed",
    )
    kept: list[str] = []
    for url in unique(urls):
        low = url.lower()
        if any(bit in low for bit in skip):
            continue
        kept.append(url)
    return kept[:16]


@dataclass
class BrandProfile:
    site: str = SITE
    name: str = "BroadbandPicker"
    tagline: str = "Independent UK broadband comparison"
    positioning: str = ""
    revenue_model: str = ""
    colours: dict[str, str] = field(default_factory=dict)
    fonts: list[str] = field(default_factory=list)
    logo_files: list[str] = field(default_factory=list)
    social_handles: dict[str, str] = field(default_factory=dict)
    emails: dict[str, str] = field(default_factory=dict)
    providers: list[str] = field(default_factory=list)
    guides: list[dict[str, str]] = field(default_factory=list)
    tools: list[dict[str, str]] = field(default_factory=list)
    cities: list[str] = field(default_factory=list)
    content_pillars: list[str] = field(default_factory=list)
    existing_x_posts: list[str] = field(default_factory=list)
    audience_notes: list[str] = field(default_factory=list)
    commercial_goals: list[str] = field(default_factory=list)
    trust_pages: list[str] = field(default_factory=list)
    key_urls: dict[str, str] = field(default_factory=dict)
    files_read: list[str] = field(default_factory=list)
    warnings: list[str] = field(default_factory=list)
    web_research: dict[str, Any] = field(default_factory=dict)
    search_intents: list[dict[str, str]] = field(default_factory=list)
    competitor_social: list[dict[str, Any]] = field(default_factory=list)
    launch_posture: str = "day_zero_no_posts_yet"


def extract_css_colours(css: str) -> dict[str, str]:
    found = dict(re.findall(r"--brand-([a-z]+):\s*(#[0-9A-Fa-f]{3,8})", css))
    colours = {
        "primary": found.get("primary", BRAND_PRIMARY),
        "navy": found.get("secondary", BRAND_NAVY),
        "accent": found.get("accent", BRAND_GREEN),
        "background": BRAND_SLATE,
        "white": BRAND_WHITE,
    }
    return colours


def extract_providers(source: str) -> list[str]:
    names = re.findall(r"^\s+name:\s+'([^']+)'", source, flags=re.MULTILINE)
    return unique(names)


def extract_guides(source: str) -> list[dict[str, str]]:
    guides: list[dict[str, str]] = []
    for match in re.finditer(
        r"slug:\s*'([^']+)',\s*title:\s*'([^']+)'",
        source,
        flags=re.DOTALL,
    ):
        slug, title = match.group(1), match.group(2)
        if slug in {
            "deals-and-pricing",
            "switching-and-rights",
            "technology-and-speeds",
            "providers-and-comparisons",
            "use-cases-and-lifestyle",
            "affordability",
        }:
            continue
        guides.append(
            {
                "slug": slug,
                "title": title,
                "url": f"{SITE}/guides/{slug}",
            }
        )
    return guides


def extract_emails(text: str) -> list[str]:
    return unique(re.findall(r"[a-zA-Z0-9._%+-]+@broadbandpicker\.co\.uk", text))


def extract_handles(text: str) -> dict[str, str]:
    handles: dict[str, str] = {}
    x = re.search(r"https://x\.com/([A-Za-z0-9_]+)", text)
    if x:
        handles["x"] = f"@{x.group(1)}"
    ig = re.search(r"instagram\.com/([A-Za-z0-9_.]+)", text)
    if ig:
        handles["instagram"] = f"@{ig.group(1)}"
    tt = re.search(r"tiktok\.com/@([A-Za-z0-9_.]+)", text)
    if tt:
        handles["tiktok"] = f"@{tt.group(1)}"
    return handles


def extract_cities() -> list[str]:
    cities: list[str] = []
    postcode_dir = ROOT / "app" / "postcode"
    if postcode_dir.exists():
        for child in sorted(postcode_dir.iterdir()):
            if child.is_dir() and child.name not in {"[area]"} and not child.name.startswith("."):
                cities.append(child.name.replace("-", " ").title())
    source = read_text("data/postcodes.ts")
    cities.extend(re.findall(r"city:\s*'([^']+)'", source))
    return unique(cities)


def list_tools() -> list[dict[str, str]]:
    tools = [
        {"name": "Postcode checker", "url": f"{SITE}", "job": "Show deals available at an address"},
        {"name": "Compare", "url": f"{SITE}/compare", "job": "Side-by-side provider comparison"},
        {"name": "Deals", "url": f"{SITE}/deals", "job": "Live UK broadband deal table"},
        {"name": "Speed test", "url": f"{SITE}/speed-test", "job": "Check whether the line is actually doing what it promised"},
        {"name": "Broadband Match quiz", "url": f"{SITE}/tools/broadband-match", "job": "Match a household to a package type"},
        {"name": "Cost calculator", "url": f"{SITE}/tools/broadband-cost-calculator", "job": "See the real cost of a contract, not just month one"},
        {"name": "Glossary", "url": f"{SITE}/broadband-glossary", "job": "Plain-English broadband terms"},
    ]
    return tools


def collect_logo_files() -> list[str]:
    candidates = [
        "public/logo.svg",
        "public/logo.png",
        "app/icon.svg",
        "docs/branding-and-marketing/broadbandpicker-logo-icon.png",
        "docs/branding-and-marketing/broadbandpicker-logo-icon.svg",
    ]
    return [path for path in candidates if (ROOT / path).exists()]


def analyse_workspace() -> BrandProfile:
    brand = BrandProfile()
    files = {
        "app/globals.css": read_text("app/globals.css"),
        "app/layout.tsx": read_text("app/layout.tsx"),
        "app/page.tsx": read_text("app/page.tsx"),
        "app/about/page.tsx": read_text("app/about/page.tsx"),
        "app/how-we-make-money/page.tsx": read_text("app/how-we-make-money/page.tsx"),
        "app/contact/page.tsx": read_text("app/contact/page.tsx"),
        "data/providers.ts": read_text("data/providers.ts"),
        "data/guides.ts": read_text("data/guides.ts"),
        "docs/content-plan.md": read_text("docs/content-plan.md"),
        "docs/seo-geo-content-strategy-2026-06.md": read_text("docs/seo-geo-content-strategy-2026-06.md"),
        "docs/affiliate-outreach-email.txt": read_text("docs/affiliate-outreach-email.txt"),
        "docs/branding-and-marketing/x-content-calendar.md": read_text(
            "docs/branding-and-marketing/x-content-calendar.md"
        ),
        "docs/branding-and-marketing/README.md": read_text("docs/branding-and-marketing/README.md"),
        "components/Logo.tsx": read_text("components/Logo.tsx"),
        "app/how-we-review-broadband/page.tsx": read_text("app/how-we-review-broadband/page.tsx"),
        "app/editorial-policy/page.tsx": read_text("app/editorial-policy/page.tsx"),
        "lib/affiliate.ts": read_text("lib/affiliate.ts"),
        "docs/adsense-readiness-plan.md": read_text("docs/adsense-readiness-plan.md"),
        "docs/competitor-landscape-scan.json": read_text("docs/competitor-landscape-scan.json"),
        "docs/home page UX/homepage-redesign-analysis.md": read_text(
            "docs/home page UX/homepage-redesign-analysis.md"
        ),
    }
    brand.files_read = [path for path, text in files.items() if text]
    css, layout, home, about, money, contact = (
        files["app/globals.css"],
        files["app/layout.tsx"],
        files["app/page.tsx"],
        files["app/about/page.tsx"],
        files["app/how-we-make-money/page.tsx"],
        files["app/contact/page.tsx"],
    )

    brand.colours = extract_css_colours(css)
    if "Inter" in layout:
        brand.fonts = ["Inter", "system-ui"]
    brand.logo_files = collect_logo_files()
    brand.social_handles = extract_handles(about + layout + home)
    if "x" not in brand.social_handles:
        brand.social_handles["x"] = HANDLE_X
        brand.warnings.append("X handle inferred from existing footer; confirm the live username.")
    brand.social_handles.setdefault("instagram", "@broadbandpicker")
    brand.social_handles.setdefault("tiktok", "@broadbandpicker")
    brand.social_handles.setdefault("linkedin", "BroadbandPicker")

    emails = extract_emails(contact + files["docs/affiliate-outreach-email.txt"] + about)
    brand.emails = {
        "partnerships": next((e for e in emails if e.startswith("partnerships")), "partnerships@broadbandpicker.co.uk"),
        "editorial": next((e for e in emails if e.startswith("editorial")), "editorial@broadbandpicker.co.uk"),
        "hello": next((e for e in emails if e.startswith("hello")), "hello@broadbandpicker.co.uk"),
    }

    brand.providers = extract_providers(files["data/providers.ts"])
    brand.guides = extract_guides(files["data/guides.ts"])
    brand.tools = list_tools()
    brand.cities = extract_cities()
    brand.content_pillars = [
        "Deals and pricing (loyalty tax, out-of-contract, 'up to' speeds)",
        "Switching and rights (One Touch Switch, exit fees, April price rises)",
        "British household chaos (WFH, football, flatshares, rural waits)",
        "Technology without the lecture (full fibre vs 'fibre', routers in cupboards)",
        "Affordability without punching down (social tariffs as a scandal of awareness)",
        "Brand trust (independent comparison, affiliate honesty, postcode truth)",
    ]
    brand.trust_pages = [
        f"{SITE}/about",
        f"{SITE}/how-we-make-money",
        f"{SITE}/how-we-review-broadband",
        f"{SITE}/editorial-policy",
        f"{SITE}/contact",
    ]
    brand.key_urls = {
        "home": SITE,
        "deals": f"{SITE}/deals",
        "compare": f"{SITE}/compare",
        "providers": f"{SITE}/providers",
        "guides": f"{SITE}/guides",
        "speed_test": f"{SITE}/speed-test",
        "match": f"{SITE}/tools/broadband-match",
        "calculator": f"{SITE}/tools/broadband-cost-calculator",
        "social_tariffs": f"{SITE}/guides/broadband-social-tariffs-uk",
        "price_rises": f"{SITE}/guides/broadband-price-rises-2026",
        "switch": f"{SITE}/guides/how-to-switch-broadband-uk",
        "partnerships_mail": f"mailto:{brand.emails['partnerships']}",
    }

    if "independent UK broadband comparison" in about.lower() or "independent UK broadband comparison service" in about:
        brand.positioning = (
            "Independent UK broadband comparison. Compare deals by postcode, understand "
            "speeds and contracts, and switch without spending an evening on hold."
        )
    else:
        brand.positioning = "UK broadband comparison by postcode, provider, speed and price."

    if "affiliate commissions" in money.lower():
        brand.revenue_model = (
            "Free for consumers. Revenue from affiliate commissions when someone clicks "
            "through and signs up. Rankings are not sold. Providers can be listed with or "
            "without an affiliate relationship."
        )
    else:
        brand.revenue_model = "UK broadband affiliate comparison."

    brand.audience_notes = [
        "UK households paying a loyalty tax after the cheap intro period.",
        "Renters, students, and shared houses who treat the router like a housegod.",
        "WFH people whose upload speed is a personality flaw.",
        "Football-and-Netflix households who discover contention at 7pm.",
        "Rural and not-spot users who have been promised full fibre since the Coalition.",
        "Affiliate managers, ISP partnerships teams, and Awin advertisers who need a serious publisher.",
    ]
    brand.commercial_goals = [
        "Make broadbandpicker.co.uk the default place Brits go to compare broadband.",
        "Grow branded search and direct traffic so comparison sessions convert.",
        "Earn affiliate sign-ups without sounding like a deal farm.",
        "Look established enough that providers approach BroadbandPicker to join the affiliate roster.",
        "Use social proof (audience, engagement, content quality) as an Awin and advertiser signal.",
    ]

    calendar = files["docs/branding-and-marketing/x-content-calendar.md"]
    brand.existing_x_posts = []
    brand.warnings.append(
        "DAY ZERO: treat every channel as never posted. Handles may exist on the site "
        "(X is linked from the footer) but there is no content, no grid, no pin, no "
        "followers to speak of. Do not 'keep posting'. Launch. The old X calendar in "
        "docs/branding-and-marketing is unused — too polite, and it assumed an audience."
    )
    if calendar:
        brand.warnings.append(
            "An unused polite X calendar exists in docs/branding-and-marketing. Ignore it."
        )
    landscape = files.get("docs/competitor-landscape-scan.json") or ""
    if '"Uswitch"' in landscape:
        brand.warnings.append(
            "Workspace competitor scan: UK comparison homepages are SVG/logo-heavy, no "
            "lifestyle photography. Social grids should match that — editorial, not stock."
        )

    if not brand.providers:
        brand.warnings.append("Could not parse provider names from data/providers.ts.")
    if not brand.guides:
        brand.warnings.append("Could not parse guides from data/guides.ts.")

    _ = home  # homepage scanned so the brand brief stays tied to live copy
    brand.search_intents = search_intent_rows()
    return brand


# ---------------------------------------------------------------------------
# Live web research / scrape
# ---------------------------------------------------------------------------


class _TextExtractor(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self._skip = False
        self.parts: list[str] = []
        self.title = ""
        self._in_title = False

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag in {"script", "style", "noscript", "svg"}:
            self._skip = True
        if tag == "title":
            self._in_title = True

    def handle_endtag(self, tag: str) -> None:
        if tag in {"script", "style", "noscript", "svg"}:
            self._skip = False
        if tag == "title":
            self._in_title = False
        if tag in {"p", "h1", "h2", "h3", "li", "br", "div"}:
            self.parts.append("\n")

    def handle_data(self, data: str) -> None:
        if self._skip:
            return
        text = re.sub(r"\s+", " ", data).strip()
        if not text:
            return
        if self._in_title and not self.title:
            self.title = text
        self.parts.append(text)


def http_get(url: str, timeout: int = 18) -> dict[str, Any]:
    row: dict[str, Any] = {
        "url": url,
        "ok": False,
        "status": 0,
        "title": "",
        "excerpt": "",
        "bytes": 0,
        "error": "",
        "fetched_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "social_links": [],
        "og_title": "",
        "og_description": "",
    }
    try:
        request = Request(
            url,
            headers={
                "User-Agent": USER_AGENT,
                "Accept": "text/html,application/xhtml+xml;q=0.9,*/*;q=0.8",
                "Accept-Language": "en-GB,en;q=0.8",
            },
            method="GET",
        )
        with urlopen(request, timeout=timeout) as response:
            raw = response.read()
            row["status"] = getattr(response, "status", 200)
            row["bytes"] = len(raw)
            html = raw.decode("utf-8", errors="replace")
    except HTTPError as exc:
        row["status"] = exc.code
        row["error"] = f"HTTP {exc.code}"
        return row
    except (URLError, TimeoutError, OSError) as exc:
        row["error"] = str(exc)[:240]
        return row
    except Exception as exc:  # noqa: BLE001 — research must never crash the planner
        row["error"] = f"{type(exc).__name__}: {exc}"[:240]
        return row

    parser = _TextExtractor()
    try:
        parser.feed(html)
        parser.close()
    except Exception:
        parser.title = ""
    text = re.sub(r"\n{3,}", "\n\n", "\n".join(parser.parts))
    text = re.sub(r"[ \t]{2,}", " ", text).strip()
    row["ok"] = True
    row["title"] = parser.title[:200]
    row["excerpt"] = text[:2500]
    row["social_links"] = clean_social_links(re.findall(
        r'https?://(?:www\.)?(?:x\.com|twitter\.com|instagram\.com|tiktok\.com|facebook\.com|linkedin\.com/(?:company|in|showcase)|youtube\.com/(?:@|c/|channel/|user/)|youtu\.be)/[A-Za-z0-9_@./-]+',
        html,
        flags=re.I,
    ))
    og_t = re.search(r'property=["\']og:title["\']\s+content=["\']([^"\']+)', html, flags=re.I)
    if not og_t:
        og_t = re.search(r'content=["\']([^"\']+)["\']\s+property=["\']og:title["\']', html, flags=re.I)
    og_d = re.search(r'property=["\']og:description["\']\s+content=["\']([^"\']+)', html, flags=re.I)
    if not og_d:
        og_d = re.search(r'content=["\']([^"\']+)["\']\s+property=["\']og:description["\']', html, flags=re.I)
    row["og_title"] = (og_t.group(1) if og_t else "")[:180]
    row["og_description"] = (og_d.group(1) if og_d else "")[:280]
    return row


def curated_market_intelligence() -> dict[str, Any]:
    """Dated UK facts used when a scrape is thin, JS-blocked, or a PDF.

    Sources were checked in-session (Ofcom, ASA, Awin, DataReportal, comparison
    hubs). Live fetches sit beside these so the kit degrades honestly.
    """
    return {
        "as_of": "2026-08",
        "uk_social_reach_pct_18plus_monthly": {
            "YouTube": 66.9,
            "Facebook & Messenger": 66.1,
            "WhatsApp": 63.4,
            "Instagram": 55.6,
            "Reddit": 42.4,
            "TikTok": 39.4,
            "X": 27.8,
            "LinkedIn": 27.8,
            "Pinterest": 18.0,
            "Snapchat": 16.0,
            "Threads": 5.9,
            "Bluesky": 3.9,
            "source": "Ofcom Online Nations 2025, as compiled by Dan Slee / Datawrapper",
        },
        "ofcom_media": {
            "adult_social_users_pct": 89,
            "social_users_16_34_pct": 97,
            "actively_post_share_comment_pct": 49,
            "actively_post_share_comment_pct_2024": 61,
            "adults_online_hours_per_day": 4.5,
            "youtube_uk_ad_users_m": 55.5,
            "facebook_uk_ad_users_m": 38.8,
            "tiktok_uk_ad_users_18plus_m": 26.8,
            "implication": (
                "Half of UK social users now lurk. Design for screenshots, tags, "
                "saves and shares — not for people who will write a paragraph."
            ),
        },
        "broadband_market": {
            "one_touch_switch_launched": "2024-09-12",
            "residential_switches_since_ots": "2 million+",
            "social_tariff_options": "30+",
            "social_tariff_price_band": "£12.50–£24 / month",
            "social_tariff_takeup_jun_2025": 532000,
            "eligible_unaware_oct_2025_pct": 70,
            "eligible_takeup_pct": "<9%",
            "full_fibre_homes_pct_approx": "80%+",
            "source": "Ofcom Pricing and Consumer Engagement 2025/26; Telecoms Consumer Charter 2026",
        },
        "affiliate_and_ads": {
            "awin": (
                "Manual publisher review. Live, content-rich site beats a parked domain. "
                "Advertisers check promotional type, audience fit, brand-safety of "
                "neighbouring content, and whether similar ISPs already work with you. "
                "Social following is a supporting signal, not a substitute for the site. "
                "Comparison sites are an official Awin publisher type."
            ),
            "asa_cap": (
                "Affiliate links or codes in social copy make that post an ad. "
                "Label specific deal posts #ad / #affiliate, upfront. Organic jokes "
                "with no outbound deal link are brand content, but any hard claim "
                "('cheapest in the UK', a named speed, a named price) still needs "
                "to be qualified and dated. Brand and affiliate are jointly on the hook."
            ),
        },
        "competitor_gap": (
            "Uswitch, MoneySuperMarket, Compare the Market, broadbandchoices and "
            "choose.co.uk talk like comparison engines. MoneySavingExpert talks like "
            "a consumer champion. Which? talks like a lab. None of them run a "
            "consistently funny, design-led UK broadband brand on TikTok. Instagram "
            "is the professional shopfront: providers judge the grid in three seconds. "
            "Which? has already called out ISPs for barely posting about social "
            "tariffs. X and TikTok take the sarcasm. Instagram takes the publisher look."
        ),
        "sources": [
            "https://www.ofcom.org.uk/media-use-and-attitudes/online-habits/from-apps-to-ai-search-how-the-uk-goes-online-in-2025",
            "https://www.ofcom.org.uk/media-use-and-attitudes/media-habits-adults/passive-social-media-use-ai-companionship-and-online-side-hustles-uk-adults-media-and-online-lives-revealed",
            "https://datareportal.com/reports/digital-2026-united-kingdom",
            "https://www.asa.org.uk/news/get-yourself-affiliated-with-the-rules-on-affiliate-marketing.html",
            "https://www.asa.org.uk/advice-online/remit-social-media.html",
            "https://advertiser-success.awin.com/s/article/How-do-I-decide-which-publishers-to-approve-onto-my-programme",
            "https://www.awin.com/gb/publishers/other-partner-types",
            "https://www.gov.uk/government/publications/telecoms-consumer-charter/telecoms-consumer-charter",
        ],
    }


def research_targets() -> list[tuple[str, str, str]]:
    return [
        ("own_home", "BroadbandPicker homepage", f"{SITE}/"),
        ("own_about", "BroadbandPicker about", f"{SITE}/about"),
        ("own_money", "How we make money", f"{SITE}/how-we-make-money"),
        ("own_deals", "Deals table", f"{SITE}/deals"),
        ("ofcom_online", "Ofcom: how the UK goes online 2025", "https://www.ofcom.org.uk/media-use-and-attitudes/online-habits/from-apps-to-ai-search-how-the-uk-goes-online-in-2025"),
        ("ofcom_habits", "Ofcom: adults media habits 2026", "https://www.ofcom.org.uk/media-use-and-attitudes/media-habits-adults/passive-social-media-use-ai-companionship-and-online-side-hustles-uk-adults-media-and-online-lives-revealed"),
        ("asa_affiliate", "ASA: affiliate marketing rules", "https://www.asa.org.uk/news/get-yourself-affiliated-with-the-rules-on-affiliate-marketing.html"),
        ("asa_social", "ASA: social media remit", "https://www.asa.org.uk/advice-online/remit-social-media.html"),
        ("awin_compare", "Awin: comparison-site publishers", "https://www.awin.com/gb/publishers/other-partner-types"),
        ("awin_approve", "Awin: how advertisers approve publishers", "https://advertiser-success.awin.com/s/article/How-do-I-decide-which-publishers-to-approve-onto-my-programme"),
        ("charter", "UK Telecoms Consumer Charter", "https://www.gov.uk/government/publications/telecoms-consumer-charter/telecoms-consumer-charter"),
        ("uswitch", "Uswitch broadband hub", "https://www.uswitch.com/broadband/"),
        ("uswitch_home", "Uswitch homepage (social links)", "https://www.uswitch.com/"),
        ("ctm", "Compare the Market broadband", "https://www.comparethemarket.com/broadband/"),
        ("msm", "MoneySuperMarket broadband", "https://www.moneysupermarket.com/broadband/"),
        ("gocompare", "Go.Compare broadband", "https://www.gocompare.com/broadband/"),
        ("mse", "MoneySavingExpert cheap broadband", "https://www.moneysavingexpert.com/broadband-and-tv/cheap-broadband/"),
        ("mse_home", "MoneySavingExpert home", "https://www.moneysavingexpert.com/"),
        ("which", "Which? broadband deals", "https://www.which.co.uk/reviews/broadband/article/best-cheap-fibre-and-broadband-deals-abddl2F4Vf5B"),
        ("choices", "broadbandchoices hub", "https://www.broadbandchoices.co.uk/"),
        ("choose", "choose.co.uk broadband", "https://www.choose.co.uk/broadband/"),
        ("confused", "Confused.com broadband", "https://www.confused.com/broadband"),
        ("broadband_co_uk", "broadband.co.uk hub", "https://www.broadband.co.uk/broadband"),
        ("topcashback", "TopCashback (affiliate)", "https://www.topcashback.co.uk/"),
        ("datareportal", "DataReportal Digital 2026 UK", "https://datareportal.com/reports/digital-2026-united-kingdom"),
        ("uswitch_agency", "Uswitch Wilderness social AOR", "https://www.marketing-beat.co.uk/2025/08/04/uswitch-appoints-wilderness/"),
        ("msm_chatgpt", "MSM ChatGPT + marketing mix 2026", "https://www.marketingweek.com/moneysupermarket-chatgpt-ppc-marketing-loyalty/"),
        ("nationwide_tiktok", "Young UK money advice on TikTok", "https://www.independent.co.uk/money/britons-tiktok-nationwide-b2939028.html"),
        ("ig_setup_checklist", "Instagram business setup checklist 2026", "https://creatorflow.so/blog/instagram-business-account-setup-checklist/"),
        ("ig_branding", "Instagram branding guide 2026", "https://magnt.com/instagram-branding-guide"),
        ("ig_captions_meta", "Instagram on captions 2026", "https://www.socialmediatoday.com/news/instagram-stresses-the-importance-of-captions/828554/"),
        ("ig_monzo", "Monzo Instagram (professional UK consumer)", "https://www.instagram.com/monzo/"),
        ("ig_octopus", "Octopus Energy Instagram", "https://www.instagram.com/octopusenergy/"),
        ("ig_which", "Which? Instagram", "https://www.instagram.com/whichuk/"),
        ("ig_mse", "MoneySavingExpert Instagram", "https://www.instagram.com/moneysavingexpert/"),
        ("ig_uswitch", "Uswitch Instagram", "https://www.instagram.com/uswitch/"),
        ("ig_ctm", "Compare the Market Instagram", "https://www.instagram.com/comparethemarket/"),
        ("ig_starling", "Starling Bank Instagram", "https://www.instagram.com/starlingbank/"),
        ("ig_virgin", "Virgin Media Instagram", "https://www.instagram.com/virginmedia/"),
        ("ig_ee", "EE Instagram", "https://www.instagram.com/ee/"),
        ("ig_hyperoptic", "Hyperoptic Instagram", "https://www.instagram.com/hyperoptic/"),
        ("x_limits", "X bio and profile limits 2026", "https://replysocial.co/blog/x-character-limit-2026"),
        ("x_which", "Which? on X (professional UK consumer)", "https://x.com/WhichUK"),
        ("x_monzo", "Monzo on X", "https://x.com/monzo"),
        ("x_octopus", "Octopus Energy on X", "https://x.com/OctopusEnergy"),
        ("x_mse", "MoneySavingExpert on X", "https://x.com/MoneySavingExp"),
        ("tt_bio_limits", "TikTok bio field limits 2026", "https://boomp.net/resources/questions/tiktok-bio-character-limit-2026"),
        ("yt_limits", "YouTube channel description limits 2026", "https://postlen.app/en/blog/youtube-character-limits"),
        ("fb_limits", "Facebook page description limits 2026", "https://marketingtoolsprohub.com/blogs/character-counter/social-media-character-limits-2026.html"),
    ]


def run_web_research(skip: bool = False) -> dict[str, Any]:
    payload: dict[str, Any] = {
        "generated_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "skipped": skip,
        "curated": curated_market_intelligence(),
        "fetches": [],
        "notes": [],
    }
    if skip:
        payload["notes"].append("Live fetch skipped (--skip-web). Curated 2026 market facts still applied.")
        payload["competitor_social"] = analyse_competitor_social([])
        payload["instagram_professional"] = analyse_instagram_professional([])
        return payload
    for key, label, url in research_targets():
        row = http_get(url)
        row["key"] = key
        row["label"] = label
        payload["fetches"].append(row)
        flag = "ok" if row["ok"] else f"fail ({row.get('error') or row.get('status')})"
        payload["notes"].append(f"{label}: {flag}")
    ok = sum(1 for row in payload["fetches"] if row["ok"])
    payload["notes"].insert(0, f"Live fetches: {ok}/{len(payload['fetches'])} succeeded.")
    payload["notes"].append(
        "JS-heavy comparison homepages often return a shell. Treat those excerpts as "
        "presence checks, not as a full read — the competitor-landscape scan in docs/ "
        "already covers structural UX. Competitor *social* strategy is in competitor_social."
    )
    payload["competitor_social"] = analyse_competitor_social(payload["fetches"])
    payload["instagram_professional"] = analyse_instagram_professional(payload["fetches"])
    return payload


def curated_competitor_social() -> list[dict[str, Any]]:
    """How UK top affiliate/comparison brands actually use social in 2026."""
    return [
        {
            "brand": "Uswitch",
            "type": "National comparison (RVU). Broadband + energy + mobiles. Awin/direct.",
            "goal": "Remain the default compare-and-switch brand; recruit Gen Z/millennials who do not open comparison sites.",
            "social_move": (
                "Aug 2025: appointed Wilderness as social AOR. Brief is TikTok-first, "
                "Instagram/Facebook consultancy, 'major life stages' content. They are "
                "paying an agency because organic personality was missing."
            ),
            "what_they_post": "Deal graphics, 'save £X', life-stage explainers once the agency lands. Historically TV + PPC, not a funny account.",
            "handles_known": "Site footer typically X/Facebook/YouTube. TikTok being built, not native-born.",
            "gap_for_us": (
                "They will professionalise TikTok with an agency voice. They will not "
                "sound like a mate in a British kitchen. Occupy 'independent and actually "
                "funny about broadband' before their anniversary work fills the feed. "
                "Do not copy their save-£X red. Look more expensive than them, talk ruder."
            ),
            "do_not_copy": "Voucher red, 'save up to £395', meerkat energy, agency-smooth life-stage films.",
        },
        {
            "brand": "MoneySuperMarket / MONY Group",
            "type": "National comparison + MSE + Quidco. Huge PPC. Affiliate + lead-gen.",
            "goal": "Defend against AI search eating comparison; SuperSaveClub loyalty; ChatGPT distribution.",
            "social_move": (
                "2025 marketing spend £194m. PPC costs +21%. They trialled moving mix "
                "out of PPC into social with 'initial good results', then still spent "
                "the money on brand + PPC. First UK comparison brand inside ChatGPT."
            ),
            "what_they_post": "Brand films, club/loyalty, generic money-saving. Not broadband-native comedy.",
            "handles_known": "@moneysupermarket, YouTube, Facebook.",
            "gap_for_us": (
                "They buy attention. We cannot. We have to earn the first 1,000 followers "
                "with comments. Social is a side bet for them; it is the whole brand-build "
                "for us. They will never dunk on loyalty tax hard — they sell the same ISPs."
            ),
            "do_not_copy": "Superhero brand films, club points, 'we've helped UK families save £2.8bn'.",
        },
        {
            "brand": "MoneySavingExpert (Martin Lewis)",
            "type": "Consumer-champion publisher. Email list is the product. Affiliate on tools.",
            "goal": "Trust, email sign-ups, 'Martin said so'. Broadband is a tool, not a personality.",
            "social_move": "Facebook + Martin-as-news. Tips, warnings, TV clips. Almost no TikTok comedy.",
            "what_they_post": "Top deals, scam warnings, 'do this today'. Authority, not jokes.",
            "handles_known": "@MoneySavingExp, Facebook/MoneySavingExpert.",
            "gap_for_us": (
                "Do not compete on authority in week 1. Compete on shareability. "
                "When we do social tariffs, match their seriousness — that's the MSE lane "
                "we are allowed to borrow, because Which? already proved ISPs don't post it."
            ),
            "do_not_copy": "Martin-face thumbnails, 'THIS WEEKEND ONLY', email-capture everything.",
        },
        {
            "brand": "Compare the Market / Go.Compare",
            "type": "Insurance-first comparison. Broadband is a tab. TV-ad brands.",
            "goal": "Brand recall (meerkat / Gio Compario), then quote. Social is TV residue.",
            "social_move": "YouTube ads, character IP, almost no broadband-native organic.",
            "what_they_post": "Characters, car insurance. Broadband is an afterthought.",
            "handles_known": "@ComparetheMkt, @gocompare.",
            "gap_for_us": "They own funny TV. They do not own funny broadband. Stay in our niche.",
            "do_not_copy": "Mascots. Opera. Meerkats. BroadbandPicker is not a character.",
        },
        {
            "brand": "Which?",
            "type": "Subscription consumer champion. Tests, not affiliate-first.",
            "goal": "Membership. Lab credibility. Policy noise (social tariffs).",
            "social_move": "X + Facebook as press office. Called out ISPs for not posting social tariffs.",
            "what_they_post": "Test scores, 'best buy', regulator stories.",
            "handles_known": "@WhichUK.",
            "gap_for_us": (
                "Borrow the social-tariff public-service post. Do not borrow the beige. "
                "Which? will never make a Keep Calm router poster."
            ),
            "do_not_copy": "Best Buy roundels, membership CTAs, lab-coat photography.",
        },
        {
            "brand": "broadbandchoices / choose.co.uk / broadband.co.uk",
            "type": "Broadband-specialist affiliate SEO sites. Our closest product comps.",
            "goal": "Postcode-checker sessions → Awin. Rank for 'cheap broadband'.",
            "social_move": "Thin or absent. SEO is the channel. Social is a neglected footer icon.",
            "what_they_post": "Occasional deal graphic, if anything.",
            "handles_known": "Often a dormant Facebook or X.",
            "gap_for_us": (
                "Specialist broadband affiliates in the UK almost do not do social. "
                "A designed, funny, independent specialist can look like the category "
                "leader in 30 days of posting — because nobody else is standing there."
            ),
            "do_not_copy": "SEO-title posts ('Cheapest Broadband Deals UK 2026'), stacked logos, from-£19 banners.",
        },
        {
            "brand": "TopCashback / Quidco",
            "type": "Cashback affiliates. Community + Facebook + app.",
            "goal": "Clicks on merchant rates. Not a comparison publisher.",
            "social_move": "Facebook groups, 'hot rates', user community. High engagement, low prestige.",
            "what_they_post": "Rate alerts, '4% at X'.",
            "handles_known": "Facebook-first.",
            "gap_for_us": "Never look like a cashback account. Providers judge that in three seconds and reject Awin applications.",
            "do_not_copy": "Hot rate banners, emoji stacks, 'click our link'.",
        },
    ]


def analyse_competitor_social(fetches: list[dict[str, Any]]) -> list[dict[str, Any]]:
    curated = curated_competitor_social()
    by_brand_fetch: dict[str, list[dict[str, Any]]] = {}
    for row in fetches:
        key = str(row.get("key") or "")
        brand = key.split("_")[0]
        if brand in {
            "uswitch", "ctm", "msm", "gocompare", "mse", "which",
            "choices", "choose", "confused", "broadband", "topcashback",
        }:
            by_brand_fetch.setdefault(brand, []).append(row)
    aliases = {
        "Uswitch": ["uswitch"],
        "MoneySuperMarket / MONY Group": ["msm"],
        "MoneySavingExpert (Martin Lewis)": ["mse"],
        "Compare the Market / Go.Compare": ["ctm", "gocompare"],
        "Which?": ["which"],
        "broadbandchoices / choose.co.uk / broadband.co.uk": ["choices", "choose", "broadband"],
        "TopCashback / Quidco": ["topcashback"],
    }
    out = []
    for row in curated:
        live_links: list[str] = []
        live_notes: list[str] = []
        for alias in aliases.get(row["brand"], []):
            for fetch in by_brand_fetch.get(alias, []):
                live_links.extend(fetch.get("social_links") or [])
                flag = "ok" if fetch.get("ok") else f"fail {fetch.get('status') or fetch.get('error')}"
                live_notes.append(f"{fetch.get('label')}: {flag}")
        item = dict(row)
        item["live_social_links"] = unique(live_links)
        item["live_fetch_notes"] = live_notes
        out.append(item)
    return out


def analyse_instagram_professional(fetches: list[dict[str, Any]]) -> dict[str, Any]:
    """How professional UK consumer / comparison Instagram accounts are actually set up."""
    live: list[dict[str, str]] = []
    for row in fetches:
        key = str(row.get("key") or "")
        if not key.startswith("ig_"):
            continue
        live.append({
            "key": key,
            "label": str(row.get("label") or ""),
            "url": str(row.get("url") or ""),
            "ok": "yes" if row.get("ok") else "no",
            "status": str(row.get("status") or row.get("error") or ""),
            "og_title": str(row.get("og_title") or "")[:180],
            "og_description": str(row.get("og_description") or "")[:280],
            "excerpt": str(row.get("excerpt") or "")[:400],
        })
    return {
        "as_of": "2026-08",
        "live_profiles": live,
        "what_professional_accounts_do": [
            "Business or creator account, not a personal profile. Category set. Email button on.",
            "Name field is searchable (brand + niche keyword), 30 characters. Handle matches the brand.",
            "Profile photo is the logo on a clean brand field, 320x320, no words in the circle.",
            "Bio is three short lines, 150 characters: who you are, the differentiator, one CTA. One CTA only.",
            "Website field holds the site. Bio does not repeat a long URL.",
            "Highlights are a mini-site: About, How it works, Switch, Deals, FAQs. Branded covers, one-word titles.",
            "The first 9 grid tiles are planned as a publisher, not a meme dump. Same palette, same type, same footer.",
            "Feed mix is educational carousels, one-fact quote cards, and short explainer Reels. Saves beat likes.",
            "Caption: first two lines do the job before 'more'. Keywords in the caption (Instagram search reads them). Save / link-in-bio as the ask.",
            "Three to five niche hashtags. No emoji walls, no hashtag soup, no 'link in comments'.",
            "Reels work muted. First frame is a poster. End card is the brand, not a voucher.",
            "Stories are weekday habit: polls, this-or-that, one fact, one link sticker.",
        ],
        "scraped_bios": {
            "monzo": "Hi, we're Monzo. We're a bank that lives on your phone.",
            "octopusenergy": "We believe energy should be better. A better experience for you, your wallet, and the planet.",
            "uswitch_tagline": "We do more to get you a better deal on energy, broadband, mobiles, personal finance, and insurance.",
        },
        "do_not_copy": [
            "Uswitch / MSM voucher-red 'save £X' deal tiles.",
            "Cashback emoji rate alerts.",
            "SearchSwitchSave-style emoji, hashtag dump and 'mission is simple' About copy.",
            "Impact-on-white meme pages. Providers judge the grid in three seconds.",
            "Mascots (meerkats, Gio Compario).",
            "Linktree of twelve links. One site, one job: the postcode checker.",
        ],
        "implication": (
            "Instagram is the professional shopfront for BroadbandPicker. X and TikTok "
            "can be rude. The IG grid, bio and highlights have to look like Which? "
            "crossed with Octopus: calm, useful, independent, navy/sky, no SALE energy."
        ),
        "sources": [
            "https://creatorflow.so/blog/instagram-business-account-setup-checklist/",
            "https://magnt.com/instagram-branding-guide",
            "https://www.socialmediatoday.com/news/instagram-stresses-the-importance-of-captions/828554/",
            "https://www.instagram.com/monzo/",
            "https://www.instagram.com/octopusenergy/",
        ],
    }


def ig_name_field() -> str:
    return "BroadbandPicker | UK Broadband"


def ig_bio_text() -> str:
    return (
        "Independent UK broadband comparison\n"
        "Postcode first. Rankings not sold.\n"
        "Compare fibre deals"
    )


def linkedin_overview_text() -> str:
    return (
        "Independent UK broadband comparison. Enter a postcode, see fibre and full fibre "
        "deals that can actually serve that address, then pick by price, speed and contract.\n\n"
        "BroadbandPicker is a free comparison site for UK households. We compare packages from "
        "24 providers, from BT, Sky, Virgin Media, EE, TalkTalk, Vodafone and Plusnet through "
        "to regional full fibre names such as Hyperoptic, Community Fibre and Toob. Tables cover "
        "monthly price, typical speed, contract length and setup fees. Rankings are not sold.\n\n"
        "Availability is by address, never by a national advert. Two houses on the same road can "
        "see different networks, so a \"from £19\" headline is not a deal until you check the postcode.\n\n"
        "We also publish provider reviews and plain English guides on switching (including One Touch "
        "Switch), full fibre versus cabinet fibre, social tariffs, and what speed a household actually "
        "needs. Scoring draws on live provider pricing, Ofcom Connected Nations data and Ofcom complaints figures.\n\n"
        "The site is free. If you click Get Deal and sign up, we may earn an affiliate commission. "
        "That does not buy a higher rank, and we still list providers we do not earn from. Affiliate "
        "relationships are disclosed. We work through the Awin network.\n\n"
        "If you work at an ISP, altnet or affiliate network and want a listing conversation, write to "
        "partnerships@broadbandpicker.co.uk.\n\n"
        "Compare deals: https://broadbandpicker.co.uk"
    )


def youtube_about_text() -> str:
    return (
        "Independent UK broadband comparison. Check fibre and full fibre deals at your postcode. "
        "Rankings are not sold.\n\n"
        "BroadbandPicker is a free comparison site. Enter a postcode, see the packages that can "
        "serve that address, then pick by price, speed and contract. We compare 24 UK providers. "
        "Affiliate commission does not buy a higher rank.\n\n"
        "This channel explains switching (One Touch Switch), full fibre versus cabinet fibre, "
        "social tariffs, and the speed a household actually needs. Guides are dated. Deals vary "
        "by address.\n\n"
        "Compare: https://broadbandpicker.co.uk\n"
        "How we make money: https://broadbandpicker.co.uk/how-we-make-money\n"
        "How we review: https://broadbandpicker.co.uk/how-we-review-broadband\n"
        "Partnerships: partnerships@broadbandpicker.co.uk"
    )


def facebook_about_long() -> str:
    return (
        "BroadbandPicker is an independent UK broadband comparison site. You enter a postcode, "
        "we show fibre and full fibre deals that can serve that address, and you pick by price, "
        "speed and contract.\n\n"
        "We compare 24 providers, from BT, Sky, Virgin Media, EE, TalkTalk, Vodafone and Plusnet "
        "through to regional full fibre names. Rankings are not sold. The site is free. If you "
        "click Get Deal and sign up, we may earn an affiliate commission. That does not buy a "
        "higher rank, and we still list providers we do not earn from.\n\n"
        "Availability is always by address. A national from-price is not a deal until you check "
        "the postcode.\n\n"
        "Website: https://broadbandpicker.co.uk\n"
        "How we make money: https://broadbandpicker.co.uk/how-we-make-money"
    )


def platform_profiles(brand: BrandProfile) -> list[dict[str, str]]:
    """Paste-ready profile fields for every BroadbandPicker social account.

    Limits are 2026 platform caps from live docs plus competitor scrapes
    (Which?, Monzo, Octopus Energy, MoneySavingExpert, Uswitch).
    """
    avatar = "docs/branding-and-marketing/broadbandpicker-logo-icon.png"
    hello = brand.emails.get("hello", "hello@broadbandpicker.co.uk")
    partners = brand.emails.get("partnerships", "partnerships@broadbandpicker.co.uk")
    ig_bio = ig_bio_text()
    li_overview = linkedin_overview_text()
    yt_about = youtube_about_text()
    fb_long = facebook_about_long()
    x_bio = "Independent UK broadband comparison. Postcode first. Rankings are not sold."
    tt_bio = "UK broadband comparison. Postcode first. Rankings not sold."
    fb_short = (
        "Independent UK broadband comparison. Check fibre deals at your postcode. "
        "Rankings are not sold."
    )
    pin_about = (
        "Independent UK broadband comparison. Check fibre and full fibre deals at your "
        "postcode. Rankings are not sold. Free to use. Availability is by address."
    )
    wa_desc = "Independent UK broadband comparison. Check your postcode."
    threads_bio = ig_bio
    rows = [
        # X
        {"platform": "X", "field": "Display name", "limit": "50", "paste": "BroadbandPicker", "notes": "No emoji. Which? uses the brand name only.", "url": "https://x.com/broadbandPicker", "avatar": avatar},
        {"platform": "X", "field": "Username", "limit": "15", "paste": "broadbandPicker", "notes": "Already live in the site footer. Do not change it.", "url": "https://x.com/broadbandPicker", "avatar": avatar},
        {"platform": "X", "field": "Bio", "limit": "160", "paste": x_bio, "notes": "Website goes in the Website field, not here. Scraped pattern: Which? and Octopus state what they are in one or two sentences. Monzo uses X for support only. We use X for discovery.", "url": "https://x.com/broadbandPicker", "avatar": avatar},
        {"platform": "X", "field": "Location", "limit": "30", "paste": "United Kingdom", "notes": "Monzo uses United Kingdom. Octopus uses Soho, London. We stay national.", "url": "https://x.com/broadbandPicker", "avatar": avatar},
        {"platform": "X", "field": "Website", "limit": "100", "paste": SITE, "notes": "The clickable link. Do not also paste the URL into the bio.", "url": "https://x.com/broadbandPicker", "avatar": avatar},
        {"platform": "X", "field": "Avatar", "limit": "400x400", "paste": avatar, "notes": "Circle crop. Logo on navy, no wordmark in the corners.", "url": "https://x.com/broadbandPicker", "avatar": avatar},
        {"platform": "X", "field": "Header", "limit": "1500x500", "paste": "Navy #0F172A field. Wifi-mark left. Line: Independent UK broadband comparison.", "notes": "Keep type out of the avatar overlap on the left.", "url": "https://x.com/broadbandPicker", "avatar": avatar},
        # Instagram
        {"platform": "Instagram", "field": "Name", "limit": "30", "paste": ig_name_field(), "notes": "Searchable. Brand plus niche keyword.", "url": "https://www.instagram.com/broadbandpicker/", "avatar": avatar},
        {"platform": "Instagram", "field": "Username", "limit": "30", "paste": "broadbandpicker", "notes": "Business account. Category: Internet Company.", "url": "https://www.instagram.com/broadbandpicker/", "avatar": avatar},
        {"platform": "Instagram", "field": "Bio", "limit": "150", "paste": ig_bio, "notes": "Three lines. No hashtags, no emoji, no URL. Website field holds the link.", "url": "https://www.instagram.com/broadbandpicker/", "avatar": avatar},
        {"platform": "Instagram", "field": "Website", "limit": "1 URL", "paste": SITE, "notes": "One link. No Linktree.", "url": "https://www.instagram.com/broadbandpicker/", "avatar": avatar},
        {"platform": "Instagram", "field": "Email", "limit": "contact button", "paste": hello, "notes": "Consumer contact. Partnerships stay on LinkedIn.", "url": "https://www.instagram.com/broadbandpicker/", "avatar": avatar},
        {"platform": "Instagram", "field": "Highlights", "limit": "7 covers", "paste": "About | How it works | Switch | Full fibre | Tariffs | Deals | Guides", "notes": "Navy covers, one sky icon each. Full frames in Instagram Content creation/account-setup.md", "url": "https://www.instagram.com/broadbandpicker/", "avatar": avatar},
        # TikTok
        {"platform": "TikTok", "field": "Display name", "limit": "30", "paste": "BroadbandPicker", "notes": "TikTok search reads this. Keep it the brand. Do not put a slogan here.", "url": "https://www.tiktok.com/@broadbandpicker", "avatar": avatar},
        {"platform": "TikTok", "field": "Username", "limit": "24", "paste": "broadbandpicker", "notes": "Business account so the website link is available.", "url": "https://www.tiktok.com/@broadbandpicker", "avatar": avatar},
        {"platform": "TikTok", "field": "Bio", "limit": "80", "paste": tt_bio, "notes": "Tightest bio of any platform. Plan for 80 even if some accounts now show 160. No hashtags in the bio.", "url": "https://www.tiktok.com/@broadbandpicker", "avatar": avatar},
        {"platform": "TikTok", "field": "Website", "limit": "1 URL", "paste": SITE, "notes": "Business accounts can add a link. One URL, the site.", "url": "https://www.tiktok.com/@broadbandpicker", "avatar": avatar},
        # LinkedIn
        {"platform": "LinkedIn", "field": "Page name", "limit": "100", "paste": "BroadbandPicker", "notes": "Company page, not a personal profile.", "url": "https://www.linkedin.com/company/broadband-picker/", "avatar": avatar},
        {"platform": "LinkedIn", "field": "Tagline", "limit": "120", "paste": "Independent UK broadband comparison. Check your postcode for fibre and full fibre deals.", "notes": "Shows under the name. Same industry bucket as Uswitch: Technology, Information and Internet.", "url": "https://www.linkedin.com/company/broadband-picker/", "avatar": avatar},
        {"platform": "LinkedIn", "field": "Overview", "limit": "2000", "paste": li_overview, "notes": "First 150-200 characters are the search snippet. Full paste is in LinkedIn/account-setup.md", "url": "https://www.linkedin.com/company/broadband-picker/", "avatar": avatar},
        {"platform": "LinkedIn", "field": "Website", "limit": "1 URL", "paste": SITE, "notes": "https://broadbandpicker.co.uk/", "url": "https://www.linkedin.com/company/broadband-picker/", "avatar": avatar},
        {"platform": "LinkedIn", "field": "Industry", "limit": "picker", "paste": "Technology, Information and Internet", "notes": "Same as Uswitch.", "url": "https://www.linkedin.com/company/broadband-picker/", "avatar": avatar},
        {"platform": "LinkedIn", "field": "Contact", "limit": "email", "paste": partners, "notes": "ISP and Awin conversations.", "url": "https://www.linkedin.com/company/broadband-picker/", "avatar": avatar},
        {"platform": "LinkedIn", "field": "Specialties", "limit": "20 phrases", "paste": "UK broadband comparison, Broadband deals, Full fibre broadband, Fibre broadband, Postcode checker, Broadband switching, One Touch Switch, ISP comparison, Provider reviews, Social tariffs, FTTP, Altnets, Affiliate marketing, Awin, Comparison website, Consumer advice, Ofcom, Broadband guides, Independent comparison, UK telecoms", "notes": "Hidden search field. Up to 20.", "url": "https://www.linkedin.com/company/broadband-picker/", "avatar": avatar},
        # YouTube
        {"platform": "YouTube", "field": "Channel name", "limit": "100", "paste": "BroadbandPicker", "notes": "Keep it short. Search cards truncate.", "url": "https://www.youtube.com/@broadbandpicker", "avatar": avatar},
        {"platform": "YouTube", "field": "Handle", "limit": "3-30", "paste": "broadbandpicker", "notes": "youtube.com/@broadbandpicker", "url": "https://www.youtube.com/@broadbandpicker", "avatar": avatar},
        {"platform": "YouTube", "field": "About", "limit": "1000", "paste": yt_about, "notes": "First ~150 characters appear in search. Lead with independent UK broadband comparison.", "url": "https://www.youtube.com/@broadbandpicker", "avatar": avatar},
        {"platform": "YouTube", "field": "Links", "limit": "5", "paste": f"{SITE} | {SITE}/deals | {SITE}/guides/how-to-switch-broadband-uk | {SITE}/guides/broadband-social-tariffs-uk | mailto:{partners}", "notes": "Site, deals, switch, social tariffs, partnerships.", "url": "https://www.youtube.com/@broadbandpicker", "avatar": avatar},
        # Facebook
        {"platform": "Facebook", "field": "Page name", "limit": "75", "paste": "BroadbandPicker", "notes": "Month 2. Do not open before the IG grid exists.", "url": "https://www.facebook.com/broadbandpicker", "avatar": avatar},
        {"platform": "Facebook", "field": "Username", "limit": "50", "paste": "broadbandpicker", "notes": "facebook.com/broadbandpicker", "url": "https://www.facebook.com/broadbandpicker", "avatar": avatar},
        {"platform": "Facebook", "field": "Category", "limit": "picker", "paste": "Website", "notes": "Or Internet company if Website is missing.", "url": "https://www.facebook.com/broadbandpicker", "avatar": avatar},
        {"platform": "Facebook", "field": "Short description", "limit": "255", "paste": fb_short, "notes": "Appears in About and search.", "url": "https://www.facebook.com/broadbandpicker", "avatar": avatar},
        {"platform": "Facebook", "field": "About", "limit": "50000", "paste": fb_long, "notes": "Full page About. Put the URL in the post, not link-in-bio language.", "url": "https://www.facebook.com/broadbandpicker", "avatar": avatar},
        {"platform": "Facebook", "field": "Website", "limit": "1 URL", "paste": SITE, "notes": "", "url": "https://www.facebook.com/broadbandpicker", "avatar": avatar},
        {"platform": "Facebook", "field": "Email", "limit": "contact", "paste": hello, "notes": "", "url": "https://www.facebook.com/broadbandpicker", "avatar": avatar},
        # YouTube already done
        # WhatsApp
        {"platform": "WhatsApp Channel", "field": "Name", "limit": "60", "paste": "BroadbandPicker", "notes": "Month 2. Follow-only channel, not a group chat.", "url": "", "avatar": avatar},
        {"platform": "WhatsApp Channel", "field": "Description", "limit": "139", "paste": wa_desc, "notes": "Ofcom: WhatsApp reaches ~63% of UK adults. Keep this a weekly deal note, not a chat.", "url": "", "avatar": avatar},
        # Pinterest
        {"platform": "Pinterest", "field": "Profile name", "limit": "30", "paste": "BroadbandPicker", "notes": "Later. Movers and checklists.", "url": "https://www.pinterest.com/broadbandpicker", "avatar": avatar},
        {"platform": "Pinterest", "field": "Username", "limit": "30", "paste": "broadbandpicker", "notes": "", "url": "https://www.pinterest.com/broadbandpicker", "avatar": avatar},
        {"platform": "Pinterest", "field": "About", "limit": "500", "paste": pin_about, "notes": "Pinterest search likes plain keywords: UK broadband, full fibre, switching.", "url": "https://www.pinterest.com/broadbandpicker", "avatar": avatar},
        # Threads
        {"platform": "Threads", "field": "Name", "limit": "30", "paste": "BroadbandPicker", "notes": "Same login as Instagram. Use only if a joke is too long for an IG caption.", "url": "https://www.threads.net/@broadbandpicker", "avatar": avatar},
        {"platform": "Threads", "field": "Bio", "limit": "150", "paste": threads_bio, "notes": "Same three lines as Instagram.", "url": "https://www.threads.net/@broadbandpicker", "avatar": avatar},
    ]
    for row in rows:
        row["chars"] = str(len(row["paste"]))
    return rows


def profiles_all_md(brand: BrandProfile) -> str:
    rows = platform_profiles(brand)
    blocks: list[str] = []
    current = ""
    for row in rows:
        if row["platform"] != current:
            current = row["platform"]
            blocks.append(f"\n## {current}\n")
            if row.get("url"):
                blocks.append(f"Public URL: {row['url']}\n")
        limit = row["limit"]
        used = row["chars"]
        blocks.append(
            f"### {row['field']} ({used} / {limit})\n\n"
            f"```\n{row['paste']}\n```\n\n"
            f"{row['notes']}\n"
        )
    scraped = (
        "Live scrapes this kit used:\n"
        "- Which? on X: \"Which? is the UK's consumer champion, here to make life simpler, fairer and safer for everyone.\" Location UK.\n"
        "- Octopus Energy on X: \"We believe energy should be better...\" Location Soho, London. Website field used.\n"
        "- Monzo on X: support-only bio. We do not copy that. We need discovery.\n"
        "- MoneySavingExpert on X: job of the site in one sentence, founder mention, location.\n"
        "- Uswitch @uswitch on X is a squatted/empty French account. Claim exact handles or a clear UK variant.\n"
        "- Instagram: Monzo, Octopus, Which?, Starling, EE, Virgin Media, Hyperoptic (see Instagram strategy).\n"
        "- LinkedIn: Uswitch About is a short better-deal line plus specialties. Ours is longer because broadband is the whole company.\n"
    )
    return (
        "# BroadbandPicker social profiles: bios and setup\n\n"
        "Paste these into each account. Website lives in the website field, not stuffed into the bio. "
        "Same navy logo everywhere. No voucher language. No emoji walls.\n\n"
        f"{scraped}\n"
        "Instagram grid and highlights: `Instagram Content creation/account-setup.md`.\n"
        "LinkedIn Overview also lives in `LinkedIn/account-setup.md`.\n"
        + "".join(blocks)
    )


def linkedin_account_setup_md(brand: BrandProfile) -> str:
    overview = linkedin_overview_text()
    tagline = "Independent UK broadband comparison. Check your postcode for fibre and full fibre deals."
    return f"""# LinkedIn company page setup: BroadbandPicker

Public URL: https://www.linkedin.com/company/broadband-picker/

Industry: Technology, Information and Internet
Website: {SITE}
Contact: {brand.emails['partnerships']}

## Tagline ({len(tagline)} / 120)

```
{tagline}
```

## Overview ({len(overview)} / 2000)

```
{overview}
```

## Specialties

UK broadband comparison, Broadband deals, Full fibre broadband, Fibre broadband, Postcode checker, Broadband switching, One Touch Switch, ISP comparison, Provider reviews, Social tariffs, FTTP, Altnets, Affiliate marketing, Awin, Comparison website, Consumer advice, Ofcom, Broadband guides, Independent comparison, UK telecoms
"""


def professional_ig_hashtags() -> str:
    return "#UKBroadband #FullFibre #BroadbandDeals"


def professional_ig_posts(brand: BrandProfile) -> list[dict[str, Any]]:
    """Publisher-grade Instagram posts. Not the X/TikTok joke bank."""
    home = SITE
    about = f"{SITE}/about"
    money = f"{SITE}/how-we-make-money"
    deals = brand.key_urls.get("deals", f"{SITE}/deals")
    switch = brand.key_urls.get("switch", f"{SITE}/guides/how-to-switch-broadband-uk")
    social = brand.key_urls.get("social_tariffs", f"{SITE}/guides/broadband-social-tariffs-uk")
    fibre = f"{SITE}/guides/fttp-vs-fttc-explained"
    speed = brand.key_urls.get("speed_guide", f"{SITE}/guides/broadband-speeds-explained")
    providers = ", ".join(brand.providers[:8]) or "BT, Sky, Virgin Media, EE, TalkTalk, Vodafone, Plusnet, Hyperoptic"
    n_providers = len(brand.providers) or 24

    def cap(hook: str, body: str, url: str, idea_id: str, extra_tags: str = "") -> str:
        tagged = utm(url, "instagram", idea_id)
        tags = professional_ig_hashtags()
        if extra_tags:
            tags = f"{tags} {extra_tags}".strip()
        return (
            f"{hook}\n\n{body}\n\n"
            f"Independent comparison. Rankings are not sold.\n\n"
            f"Save this if you are reviewing your broadband this month.\n\n"
            f"Link in bio\n{tagged}\n\n{tags}"
        )

    posts = [
        {
            "id": "IG-001",
            "grid": "1,1",
            "format": "carousel",
            "title": "Who we are",
            "hook": "Independent UK broadband comparison.",
            "url": about,
            "first_comment": "Start with your postcode, not a national advert. Questions welcome.",
            "alt": "BroadbandPicker carousel. Independent UK broadband comparison. Postcode first. Rankings not sold.",
            "slides": [
                "Independent UK broadband comparison",
                "Enter a postcode. See deals that can serve that address.",
                f"{n_providers} providers. Price, speed, contract, setup.",
                "Rankings are not sold.",
                "broadbandpicker.co.uk",
            ],
            "caption": "",
            "visual": (
                "Five-slide carousel, 1080x1350. Navy outer canvas, paper rounded card, "
                "Inter ExtraBold headline, sky hairline, navy footer with wifi-mark. "
                "Slide 1: wifi-mark + Independent UK broadband comparison. "
                "No cartoons on this set. Objects only: postcode box, tick, bill."
            ),
        },
        {
            "id": "IG-002",
            "grid": "1,2",
            "format": "carousel",
            "title": "Why the postcode comes first",
            "hook": "A national 'from £19' is not a deal until you check the address.",
            "url": home,
            "first_comment": "Two houses on the same road can see different networks. That is the point of the checker.",
            "alt": "BroadbandPicker carousel. Why broadband deals depend on your postcode.",
            "slides": [
                "Why the postcode comes first",
                "Openreach, Virgin, CityFibre and smaller builders did not wire the country evenly.",
                "Two houses on the same road can see different speeds and prices.",
                "Check the address. Then compare.",
                "Free postcode checker. broadbandpicker.co.uk",
            ],
            "caption": "",
            "visual": "Carousel. Map-of-Britain silhouette in navy on paper, two terrace houses with different sky ticks. No fake ISP logos.",
        },
        {
            "id": "IG-003",
            "grid": "1,3",
            "format": "carousel",
            "title": "Rankings are not sold",
            "hook": "Affiliate commission does not buy a higher rank.",
            "url": money,
            "first_comment": "Full disclosure is on the site: how we make money, and how we review.",
            "alt": "BroadbandPicker carousel. How the site is funded. Rankings are not sold.",
            "slides": [
                "How we make money",
                "The site is free to use.",
                "If you click Get Deal and sign up, we may earn a commission.",
                "That does not buy a higher rank. We still list providers we do not earn from.",
                "Read it in full: /how-we-make-money",
            ],
            "caption": "",
            "visual": "Carousel. Simple three-step: click, sign up, commission. Then a large 'Rankings are not sold' slide. Green tick only on that line.",
        },
        {
            "id": "IG-004",
            "grid": "2,1",
            "format": "carousel",
            "title": "How switching works now",
            "hook": "You do not have to phone your old provider to leave.",
            "url": switch,
            "first_comment": "One Touch Switch started 12 September 2024. Still check exit fees if you are in contract.",
            "alt": "BroadbandPicker carousel. One Touch Switch explained in plain English.",
            "slides": [
                "How switching broadband works now",
                "Pick the new deal. The new provider handles the move.",
                "Ofcom: more than two million residential switches completed.",
                "Still check exit fees if you are in contract.",
                "Guide: how to switch broadband UK",
            ],
            "caption": "",
            "visual": "Carousel. Three numbered steps on paper cards. No phone-handset panic cartoon as the hero. Calm process diagram.",
        },
        {
            "id": "IG-005",
            "grid": "2,2",
            "format": "carousel",
            "title": "Social tariffs exist",
            "hook": "If you qualify for certain benefits, cheaper social tariffs sit around £12.50 to £24 a month.",
            "url": social,
            "first_comment": "Ofcom found most eligible households have never heard of these. Share this with someone who might qualify.",
            "alt": "BroadbandPicker carousel. UK broadband social tariffs explained.",
            "slides": [
                "Social tariffs exist",
                "Roughly £12.50 to £24 a month if you qualify.",
                "Same networks. Smaller bill.",
                "Ofcom: most eligible households have never heard of them.",
                "We do not earn from pointing this out. Guide in bio.",
            ],
            "caption": "",
            "visual": "Serious public-service carousel. Navy, paper, one green tick. No jokes on this set. Large price band on slide 2.",
        },
        {
            "id": "IG-006",
            "grid": "2,3",
            "format": "carousel",
            "title": "Fibre versus full fibre",
            "hook": "If the package does not say full fibre or FTTP, copper may still be in the mix.",
            "url": fibre,
            "first_comment": "FTTC is fibre to the cabinet. FTTP is glass all the way to the premises. The words on the advert are not the same thing.",
            "alt": "BroadbandPicker carousel. Fibre versus full fibre, FTTC versus FTTP.",
            "slides": [
                "Fibre versus full fibre",
                "Fibre on an advert often means FTTC: copper from the cabinet.",
                "Full fibre / FTTP is glass to the premises.",
                "Upload and evening speed usually hold up better on full fibre.",
                "Check the technology at your postcode.",
            ],
            "caption": "",
            "visual": "Split diagram: cabinet + copper on the left, house + glass on the right. Labelled FTTC and FTTP. Navy/sky only.",
        },
        {
            "id": "IG-007",
            "grid": "3,1",
            "format": "carousel",
            "title": "What speed you actually need",
            "hook": "Gigabit is optional. The right line is not.",
            "url": speed,
            "first_comment": "These are typical household ranges, not a promise. Availability is still by postcode.",
            "alt": "BroadbandPicker carousel. Typical UK household broadband speeds.",
            "slides": [
                "What speed do you actually need?",
                "One or two people: 30 to 80 Mbps",
                "Working from home: 80 to 150 Mbps",
                "Busy family: 150 to 300 Mbps",
                "Then check the postcode. None of this exists if the network does not reach the door.",
            ],
            "caption": "",
            "visual": "Four household rows, huge Mbps numbers, small labels. No gamers in RGB. Editorial, not esports.",
        },
        {
            "id": "IG-008",
            "grid": "3,2",
            "format": "carousel",
            "title": "Out of contract usually costs more",
            "hook": "Staying loyal is often the expensive option.",
            "url": deals,
            "first_comment": "Look at the out-of-contract price on your bill, not only the intro rate you remember.",
            "alt": "BroadbandPicker carousel. Introductory broadband price versus out-of-contract price.",
            "slides": [
                "Out of contract usually costs more",
                "Intro deals end. Plenty of households keep paying the higher rate.",
                "New customers on the same network often pay less.",
                "Compare before you assume staying is cheaper.",
                "Deals table: broadbandpicker.co.uk/deals",
            ],
            "caption": "",
            "visual": "Two bill cards labelled Intro and Out of contract. No 'hostage' language on the artwork. Clean numbers as a pattern, not a named fake tariff.",
        },
        {
            "id": "IG-009",
            "grid": "3,3",
            "format": "feed",
            "title": "Check your postcode",
            "hook": "Start here. The only comparison that is honest.",
            "url": home,
            "first_comment": "Free to use. Availability is by address.",
            "alt": "BroadbandPicker post. Check your postcode. Independent UK broadband comparison.",
            "slides": [
                "Check your postcode",
                f"Compare {n_providers} UK providers",
                "Rankings are not sold",
                "broadbandpicker.co.uk",
            ],
            "caption": "",
            "visual": "Single 1080x1350 poster. Giant 'Check your postcode'. Wifi-mark. Navy footer. This is the brand tile providers screenshot.",
        },
        {
            "id": "IG-010",
            "grid": "week 2",
            "format": "carousel",
            "title": "Providers we compare",
            "hook": f"We compare {n_providers} UK broadband providers.",
            "url": f"{SITE}/compare",
            "first_comment": "National names and regional full fibre. Listed whether or not they pay us.",
            "alt": "BroadbandPicker carousel. UK broadband providers compared on the site.",
            "slides": [
                f"{n_providers} UK providers",
                providers,
                "Regional full fibre sits in the same table.",
                "We list providers with or without an affiliate deal.",
                "Compare side by side",
            ],
            "caption": "",
            "visual": "Word list on paper, not a logo salad. Do not reproduce BT/Sky/Virgin marks. Typeset names in Inter.",
        },
        {
            "id": "IG-011",
            "grid": "week 2",
            "format": "reel",
            "title": "30 seconds: how to compare broadband",
            "hook": "Postcode. Compare. Switch.",
            "url": home,
            "first_comment": "Sound on for the VO. It also works muted. First frame is the poster.",
            "alt": "BroadbandPicker Reel. Three steps to compare UK broadband at your postcode.",
            "slides": [
                "How to compare broadband in 30 seconds",
                "1. Enter your postcode",
                "2. Filter by price, speed, contract",
                "3. The new provider usually handles the switch",
            ],
            "caption": "",
            "visual": "Vertical 1080x1920. Three title cards, 8-10 seconds, dry British VO, navy end card. No trending audio required.",
        },
        {
            "id": "IG-012",
            "grid": "week 2",
            "format": "reel",
            "title": "Full fibre in 20 seconds",
            "hook": "Full fibre means glass to the premises. Fibre on an advert often does not.",
            "url": fibre,
            "first_comment": "Save this before you buy a 'fibre' package that is still copper from the cabinet.",
            "alt": "BroadbandPicker Reel. Full fibre versus cabinet fibre explained.",
            "slides": [
                "Fibre on the advert is not always full fibre",
                "FTTC = copper from the cabinet",
                "FTTP = glass to the house",
                "Check the technology, then the postcode",
            ],
            "caption": "",
            "visual": "Simple motion diagram, 15-20 seconds, muted-first type. End card URL.",
        },
    ]

    bodies = {
        "IG-001": (
            "BroadbandPicker is a free UK comparison site. "
            "You enter a postcode, we show fibre and full fibre deals that can serve that address, "
            "and you pick by price, speed and contract.\n\n"
            f"We compare {n_providers} providers, including {providers}. "
            "Methodology is public. Affiliate relationships are disclosed."
        ),
        "IG-002": (
            "UK broadband is sold nationally and delivered locally. "
            "Openreach, Virgin Media, CityFibre and smaller full fibre builders did not wire the country evenly.\n\n"
            "Check the address first. Then compare the packages that can actually land on your street."
        ),
        "IG-003": (
            "The site is free. If you click Get Deal and sign up, we may earn an affiliate commission through Awin. "
            "That is a standard comparison-site model.\n\n"
            "Commission does not buy a higher rank. We still list providers we do not earn from. "
            "Detail sits on how we make money and how we review broadband."
        ),
        "IG-004": (
            "One Touch Switch has been live since 12 September 2024. "
            "You pick the new deal. The new provider usually handles the move with your old one.\n\n"
            "Ofcom reports more than two million residential switches. "
            "You still check exit fees if you are inside a contract."
        ),
        "IG-005": (
            "Social tariffs are cheaper broadband packages for households on qualifying benefits. "
            "Prices sit roughly at £12.50 to £24 a month.\n\n"
            "Ofcom has found most eligible households have never heard of them. "
            "We publish the guide because it is useful, not because it is a commercial campaign."
        ),
        "IG-006": (
            "A lot of UK advertising still says fibre when the last stretch is copper from a cabinet (FTTC). "
            "Full fibre, or FTTP, is glass all the way to the premises.\n\n"
            "It is usually stronger on upload and less likely to fall apart at 7pm. "
            "If a package does not say full fibre or FTTP, assume copper may still be in the mix."
        ),
        "IG-007": (
            "You do not need a gigabit to email a solicitor. You do need a line that matches the household.\n\n"
            "Typical ranges, not a fake perfect Mbps. Then check the postcode, because none of this exists "
            "if the network does not reach the door."
        ),
        "IG-008": (
            "Introductory deals end. Plenty of households keep paying the out-of-contract rate "
            "while new customers on the same network pay less.\n\n"
            "Compare before you assume staying is cheaper. We do not invent a named price. "
            "Your bill and your postcode are the source of truth."
        ),
        "IG-009": (
            "Free to use. Availability is by address, never by a national advert. "
            f"Compare {n_providers} UK providers on price, speed and contract.\n\n"
            "Rankings are not sold."
        ),
        "IG-010": (
            f"National names and regional full fibre sit in the same table. "
            f"Examples we cover: {providers}.\n\n"
            "We list providers whether or not we have an affiliate relationship."
        ),
        "IG-011": (
            "Three steps. Enter the postcode. Compare what is actually available. "
            "If you switch, the new provider usually handles the move.\n\n"
            "Works muted. Link in bio."
        ),
        "IG-012": (
            "Learn the two letters before you buy the speed. "
            "FTTC still uses copper from the cabinet. FTTP is full fibre to the premises.\n\n"
            "Then check whether that technology actually reaches your address."
        ),
    }
    extra_tags = {
        "IG-004": "#OneTouchSwitch",
        "IG-005": "#SocialTariffs",
        "IG-006": "#FTTP",
        "IG-007": "#BroadbandSpeeds",
    }
    for post in posts:
        post["caption"] = cap(
            post["hook"],
            bodies[post["id"]],
            post["url"],
            post["id"],
            extra_tags.get(post["id"], ""),
        )
    return posts


def professional_ig_highlights() -> list[dict[str, str]]:
    return [
        {
            "title": "About",
            "job": "Who we are, independent claim, site URL",
            "frames": "1) Independent UK broadband comparison. 2) Postcode first. 3) Rankings not sold. 4) Link to /about.",
        },
        {
            "title": "How it works",
            "job": "Three steps + disclosure",
            "frames": "1) Enter postcode. 2) Compare price, speed, contract. 3) Switch. 4) How we make money, one frame.",
        },
        {
            "title": "Switch",
            "job": "One Touch Switch, no hold music myth",
            "frames": "1) You pick the deal. 2) New provider handles the move. 3) Check exit fees. 4) Guide link.",
        },
        {
            "title": "Full fibre",
            "job": "FTTP versus FTTC",
            "frames": "1) Fibre on the advert. 2) Copper from the cabinet. 3) Glass to the house. 4) Check the postcode.",
        },
        {
            "title": "Tariffs",
            "job": "Social tariffs, public service",
            "frames": "1) They exist. 2) £12.50 to £24 band. 3) Most eligible households have not heard. 4) Guide link.",
        },
        {
            "title": "Deals",
            "job": "How to read a row, not a voucher wall",
            "frames": "1) Intro versus out of contract. 2) Speed is typical, not 'up to' as a promise. 3) Setup fees. 4) /deals.",
        },
        {
            "title": "Guides",
            "job": "The library",
            "frames": "1) Speeds. 2) Switching. 3) Social tariffs. 4) Cheapest broadband UK. Link stickers.",
        },
    ]


def professional_ig_stories() -> list[dict[str, str]]:
    return [
        {"day": "Monday", "series": "Bill check", "mechanic": "Poll: in contract or out of contract? Then one fact about intro versus out-of-contract price."},
        {"day": "Tuesday", "series": "Tech", "mechanic": "This or that: full fibre or cheaper cabinet fibre. One labelled diagram."},
        {"day": "Wednesday", "series": "Speed", "mechanic": "Slider: what do you pay. Then the household Mbps ranges."},
        {"day": "Thursday", "series": "Switch", "mechanic": "Question sticker: still think you have to phone them? One Touch Switch frame."},
        {"day": "Friday", "series": "Useful", "mechanic": "One guide cover. Link sticker to that guide. No more than one link per set."},
        {"day": "Saturday", "series": "Buffering watch", "mechanic": "If a big fixture is on, a calm 'evening speed' reminder. Not a meme dump."},
        {"day": "Sunday", "series": "Admin", "mechanic": "If you do one useful thing this week: check the postcode. Link sticker."},
    ]


def search_intent_rows() -> list[dict[str, str]]:
    """UK broadband intents this site is built for, mapped to channels and jokes."""
    return [
        {
            "intent": "Cheap / cheapest broadband deals",
            "queries": "cheap broadband, cheapest broadband UK, broadband deals under £20, broadband from £20",
            "who": "Bill-payers hunting a lower monthly. High CPC, high affiliate value.",
            "channels": "TikTok, Instagram Reels, Facebook, Pinterest, YouTube 'cheap broadband 2026'",
            "content": "Loyalty-tax hostage joke; Greggs-vs-gigabit; social-tariff public service; under-£20 carousel",
            "site": f"{SITE}/deals · {SITE}/guides/cheapest-broadband-uk · {SITE}/guides/broadband-deals-under-20",
            "why_channel": "TikTok discovers the 16–34s who still live at home and the 25–40s who pay the bill. Facebook still owns 35–60 bill-payers. YouTube catches typed search.",
        },
        {
            "intent": "Compare / best broadband UK",
            "queries": "compare broadband, best broadband UK, best broadband providers, BT vs Virgin",
            "who": "Researchers opening five tabs. This is the homepage job.",
            "channels": "Instagram carousels, YouTube, X, Reddit replies",
            "content": "Same-cabinet-different-jumper; speed-you-actually-need; provider roast that stays accurate",
            "site": f"{SITE}/compare · {SITE}/providers · {SITE}/guides/best-broadband-providers-uk",
            "why_channel": "Carousels get saves. YouTube ranks for 'best broadband'. Reddit is where the high-intent argument already happens.",
        },
        {
            "intent": "Postcode / in my area / availability",
            "queries": "broadband in my area, [postcode] broadband, full fibre near me, [city] broadband deals",
            "who": "Movers, new tenants, anyone who has been lied to by a national advert.",
            "channels": "All consumer channels, with city-named Stories and X replies",
            "content": "Coming-soon-since-2014; check the postcode not the poster; local buffering times",
            "site": f"{SITE} (postcode checker) · {SITE}/postcode/…",
            "why_channel": "Availability is address-level. The joke exists to force the postcode box.",
        },
        {
            "intent": "Full fibre / fastest / gigabit",
            "queries": "full fibre broadband, FTTP vs FTTC, gigabit broadband, fastest broadband UK",
            "who": "People who were sold 'fibre' and got copper. Gamers. Bragging rights.",
            "channels": "TikTok, Reels, YouTube explainers, IG carousel",
            "content": "Fibre I barely know her; gigabit is a personality; two-door cartoon",
            "site": f"{SITE}/guides/full-fibre-broadband-explained · {SITE}/guides/fttp-vs-fttc-explained",
            "why_channel": "The fibre/liar confusion is the most useful joke in the market. Short video teaches it.",
        },
        {
            "intent": "How to switch / One Touch Switch",
            "queries": "how to switch broadband, One Touch Switch, switching broadband without downtime",
            "who": "Out-of-contract or furious. Admin-phobic.",
            "channels": "YouTube how-to, Instagram carousel, Facebook, TikTok POV",
            "content": "Switching used to be emigrating; chatbot of Theseus; engineer window",
            "site": f"{SITE}/guides/how-to-switch-broadband-uk · {SITE}/guides/one-touch-switching-explained",
            "why_channel": "YouTube SEO for 'how to switch'. Facebook for the 40+ who still think they have to phone up.",
        },
        {
            "intent": "Out of contract / loyalty tax",
            "queries": "out of contract broadband, broadband loyalty tax, cheaper if I stay, existing customer broadband",
            "who": "The business model of the UK ISP. Highest share-to-group-chat energy.",
            "channels": "X, TikTok, Instagram, Facebook",
            "content": "Hostage situation with better Wi-Fi; new customer £19 / you £41",
            "site": f"{SITE}/deals · {SITE}/guides/broadband-for-existing-customers",
            "why_channel": "Rage travels. People tag the bill-payer. This is the brand's origin myth.",
        },
        {
            "intent": "April price rises / mid-contract",
            "queries": "broadband price rise 2026, April broadband increase, can I leave after price rise",
            "who": "Anyone who got the email. Cyclical, appointment virality.",
            "channels": "All. Prep in February. Peak March–April.",
            "content": "April the other tax month; pounds-not-CPI joke",
            "site": f"{SITE}/guides/broadband-price-rises-2026 · {SITE}/guides/can-i-leave-broadband-early-after-price-rise",
            "why_channel": "News + bills = Facebook shares and X quote-tweets. LinkedIn for the policy take.",
        },
        {
            "intent": "Social tariffs / benefits / affordability",
            "queries": "broadband social tariff, cheap broadband Universal Credit, broadband on benefits",
            "who": "Eligible households (most have never heard of it) and the people who love them.",
            "channels": "Facebook, Instagram carousel, X, WhatsApp, YouTube",
            "content": "Serious voice. 70% unaware. Share even if it isn't you.",
            "site": f"{SITE}/guides/broadband-social-tariffs-uk · {SITE}/guides/broadband-help-if-you-claim-benefits-uk",
            "why_channel": "Which? found ISPs barely post this. Facebook 35–60 is the bill-payer. Trust-builder for Awin.",
        },
        {
            "intent": "Students / flatshares / first bill",
            "queries": "student broadband, university wifi, HMO broadband, cheap broadband for students",
            "who": "September gold. Parents pay; kids pick the meme.",
            "channels": "TikTok first, Instagram, Snapchat skip (TikTok covers it)",
            "content": "Four people, one router, FIFA; Wi-Fi name roast",
            "site": f"{SITE}/guides/best-broadband-for-students · {SITE}/guides/student-broadband-by-university-city",
            "why_channel": "Discovery graph. Tags are built in. Peak Aug–Oct.",
        },
        {
            "intent": "Moving house",
            "queries": "broadband when moving house, set up broadband new home, moving house internet",
            "who": "High commercial intent dressed as a sitcom. May–September.",
            "channels": "Pinterest, Instagram, YouTube, Facebook, Google Search via YouTube",
            "content": "Kettle, Wi-Fi, sofa optional; check the postcode",
            "site": f"{SITE}/guides/broadband-moving-house",
            "why_channel": "Pinterest is where movers save checklists. YouTube is where they search the night before.",
        },
        {
            "intent": "WFH / upload / Zoom",
            "queries": "best broadband for working from home, upload speed WFH, Zoom keeps freezing",
            "who": "Professionals whose upload is a personality flaw.",
            "channels": "LinkedIn (soft), Instagram, TikTok, X",
            "content": "You're muted — that's the broadband; impressionist Zoom",
            "site": f"{SITE}/guides/best-broadband-for-working-from-home",
            "why_channel": "LinkedIn is where WFH people live at 9am. TikTok is where they go at 7pm.",
        },
        {
            "intent": "Streaming / football / buffering at 7pm",
            "queries": "broadband for streaming, buffering football, why is netflix slow at night",
            "who": "Appointment virality every Saturday 19:00–22:00.",
            "channels": "TikTok, X (live), Instagram Reels, Stories",
            "content": "Yellow warning of buffering; 89th minute; 2am vs 7pm speed test",
            "site": f"{SITE}/guides/best-broadband-for-streaming · {SITE}/speed-test",
            "why_channel": "X is the 89th-minute complaint desk. TikTok finds people who have never heard of a comparison site.",
        },
        {
            "intent": "Gaming / ping",
            "queries": "best broadband for gaming UK, ping vs download speed, fibre for xbox",
            "who": "Teens and the parent who pays. Vanity Mbps vs actual ping.",
            "channels": "TikTok, YouTube, Instagram, Reddit r/broadband",
            "content": "Gigabit is a personality; ping is the game",
            "site": f"{SITE}/guides/best-broadband-for-gaming-uk",
            "why_channel": "YouTube search + TikTok stitches of lag clips.",
        },
        {
            "intent": "Slow Wi-Fi / speed test / router in cupboard",
            "queries": "why is my wifi slow, speed test UK, where to put router, mesh wifi",
            "who": "People who need a diagnosis before a switch.",
            "channels": "TikTok, Reels, YouTube, Stories stickers",
            "content": "Cupboard under the stairs; 2am vs 7pm; mesh as a plaster",
            "site": f"{SITE}/speed-test · {SITE}/guides/best-mesh-wifi-for-your-broadband-router",
            "why_channel": "Participatory (post your numbers). Speed test is the product.",
        },
        {
            "intent": "Rural / not-spot / 5G home / satellite",
            "queries": "rural broadband UK, not spot, 5G home broadband, Starlink vs fibre",
            "who": "Underserved, high gratitude, parish-Facebook sharers.",
            "channels": "Facebook, X, Instagram feed (not Reels-first)",
            "content": "Fibre van is the British Yeti; honest plan B",
            "site": f"{SITE}/guides/best-broadband-for-rural-areas-uk · {SITE}/guides/best-5g-home-broadband-uk · {SITE}/guides/starlink-vs-fibre-broadband-uk",
            "why_channel": "Facebook local groups still move rural information. Don't dunk on the users — dunk on the promises.",
        },
        {
            "intent": "TV + broadband bundles",
            "queries": "broadband and TV deals, Sky TV and broadband, Virgin TV bundle",
            "who": "Households who think they have to buy the sport to buy the line.",
            "channels": "Facebook, Instagram, YouTube",
            "content": "Two products arguing in a trench coat; unbundle joke",
            "site": f"{SITE}/guides/best-broadband-and-tv-deals · {SITE}/guides/best-phone-and-broadband-deals",
            "why_channel": "Older bill-payers, sport households. Facebook + YouTube search.",
        },
        {
            "intent": "Complaints / ombudsman / chatbot hell",
            "queries": "broadband ombudsman, complain about ISP, ISP chatbot, leave broadband early",
            "who": "People at the end of their tether. Helpful-funny, then a rights page.",
            "channels": "X, Reddit, TikTok storytime, Instagram carousel",
            "content": "Chatbot of Theseus; have you tried restarting yourself",
            "site": f"{SITE}/guides/broadband-complaints-and-ombudsman-uk · {SITE}/guides/broadband-contract-end-rights",
            "why_channel": "X and Reddit are the complaint squares. Don't pile on a live outage with an affiliate link.",
        },
        {
            "intent": "Business / landlord / HMO / affiliate B2B",
            "queries": "business broadband UK, landlord broadband, HMO wifi, broadband affiliate programme",
            "who": "Landlords, small offices, and — separately — ISP partnership managers.",
            "channels": "LinkedIn primary; X secondary; site trust pages always on",
            "content": "We list you even without an affiliate deal; methodology; market notes",
            "site": f"{SITE}/guides/best-business-broadband-providers-uk · {SITE}/how-we-make-money · mailto:partnerships@broadbandpicker.co.uk",
            "why_channel": "This is how providers find you. LinkedIn is the media kit that never sleeps.",
        },
    ]


def attach_intents(bank: list["Idea"]) -> None:
    mapping: dict[str, list[str]] = {
        "X-001": ["Out of contract / loyalty tax", "Cheap / cheapest broadband deals"],
        "X-002": ["Streaming / football / buffering at 7pm"],
        "X-003": ["Slow Wi-Fi / speed test / router in cupboard"],
        "X-004": ["Full fibre / fastest / gigabit", "Compare / best broadband UK"],
        "X-005": ["Streaming / football / buffering at 7pm"],
        "X-006": ["Out of contract / loyalty tax"],
        "X-007": ["Slow Wi-Fi / speed test / router in cupboard"],
        "X-008": ["How to switch / One Touch Switch"],
        "X-009": ["Postcode / in my area / availability", "Rural / not-spot / 5G home / satellite"],
        "X-010": ["How to switch / One Touch Switch", "Out of contract / loyalty tax"],
        "X-011": ["Full fibre / fastest / gigabit"],
        "X-012": ["Students / flatshares / first bill"],
        "X-013": ["Social tariffs / benefits / affordability"],
        "X-014": ["Complaints / ombudsman / chatbot hell"],
        "X-015": ["Slow Wi-Fi / speed test / router in cupboard"],
        "X-016": ["April price rises / mid-contract"],
        "X-017": ["Students / flatshares / first bill"],
        "X-018": ["Compare / best broadband UK", "WFH / upload / Zoom"],
        "X-019": ["Compare / best broadband UK"],
        "X-020": ["WFH / upload / Zoom"],
        "X-021": ["How to switch / One Touch Switch"],
        "X-022": ["Cheap / cheapest broadband deals"],
        "X-023": ["Slow Wi-Fi / speed test / router in cupboard"],
        "X-024": ["Slow Wi-Fi / speed test / router in cupboard"],
        "X-025": ["Business / landlord / HMO / affiliate B2B"],
        "X-026": ["Slow Wi-Fi / speed test / router in cupboard", "Streaming / football / buffering at 7pm"],
        "X-027": ["Streaming / football / buffering at 7pm"],
        "X-028": ["Moving house"],
        "X-029": ["Complaints / ombudsman / chatbot hell", "How to switch / One Touch Switch"],
        "X-030": ["Cheap / cheapest broadband deals"],
        "X-031": ["Slow Wi-Fi / speed test / router in cupboard"],
        "X-032": ["Rural / not-spot / 5G home / satellite"],
        "X-033": ["How to switch / One Touch Switch"],
        "X-034": ["Business / landlord / HMO / affiliate B2B"],
        "X-035": ["Cheap / cheapest broadband deals"],
        "X-036": ["How to switch / One Touch Switch"],
        "X-037": ["Cheap / cheapest broadband deals", "Postcode / in my area / availability"],
        "X-038": ["TV + broadband bundles"],
        "X-039": ["Gaming / ping"],
        "X-040": ["Out of contract / loyalty tax"],
        "X-041": ["Complaints / ombudsman / chatbot hell"],
        "X-042": ["Rural / not-spot / 5G home / satellite"],
        "X-043": ["Slow Wi-Fi / speed test / router in cupboard"],
        "X-044": ["Cheap / cheapest broadband deals"],
        "X-045": ["How to switch / One Touch Switch"],
        "X-046": ["Social tariffs / benefits / affordability", "Business / landlord / HMO / affiliate B2B"],
        "X-047": ["How to switch / One Touch Switch", "Business / landlord / HMO / affiliate B2B"],
        "X-048": ["How to switch / One Touch Switch"],
        "X-049": ["April price rises / mid-contract", "Out of contract / loyalty tax"],
        "X-050": ["Business / landlord / HMO / affiliate B2B"],
    }
    for idea in bank:
        idea.search_intents = mapping.get(idea.id, ["Compare / best broadband UK"])


# ---------------------------------------------------------------------------
# Channel strategy
# ---------------------------------------------------------------------------


def channel_rows(brand: BrandProfile) -> list[dict[str, str]]:
    return [
        {
            "channel": "X (Twitter)",
            "priority": "P0 — claim today, post as if empty (footer link exists, zero content)",
            "open": "Yes now. Treat as unlaunched.",
            "handle": brand.social_handles.get("x", HANDLE_X),
            "why": (
                "The site footer already points here, so journalists and affiliate managers who "
                "Google us will land on an empty-looking profile unless we pin something sharp "
                "on day 1. UK broadband rage, Ofcom news and 7pm complainers already live on X. "
                "Best cold-start channel for polls and one-liners that do not need followers."
            ),
            "audience": "Switchers, tech-adjacent adults, journalists, altnet watchers, complainers at 7pm.",
            "content": "Sarcastic one-liners, polls, quote remixes, outage colour commentary, deal 'public health warnings'.",
            "cadence": "5-7 posts/week. UK peak: Tue-Thu 08:00-09:30 and 17:30-19:00 Europe/London. Design stills by 17:00 two working days before.",
            "success": "Profile clicks, quote-tweets, follows from journalists, branded search lift.",
            "b2b": "Industry people lurk here. A sharp account is a walking media kit.",
        },
        {
            "channel": "Instagram",
            "priority": "P0 — open this week",
            "open": "Yes now",
            "handle": brand.social_handles.get("instagram", "@broadbandpicker"),
            "why": (
                "The professional shopfront. Providers, Awin reviewers and bill-payers judge the grid "
                "in three seconds. Educational carousels, a finished bio and branded highlights make "
                "BroadbandPicker look like a publisher. Jokes live on X and TikTok, not in the first 9 tiles."
            ),
            "audience": "25–40 bill-payers, renters, young families, plus ISP/affiliate people who lurk.",
            "content": "Professional carousels, explainer Reels, weekday Story series, branded highlights. Bio + first 9 planned as a 3x3.",
            "cadence": "Feed Tue-Thu 12:00 or 18:00 UK. Reels 18:30-20:00 weekdays. Stories 19:00. Design feed/Reel stills 2 working days before; Stories the day before 12:00.",
            "success": "Shares, saves, sticker replies, profile visits, link-in-bio clicks to postcode checker.",
            "b2b": "A living visual identity. Providers judge professionalism in 3 seconds.",
        },
        {
            "channel": "TikTok",
            "priority": "P0 — open this week, same content engine as Reels",
            "open": "Yes now",
            "handle": brand.social_handles.get("tiktok", "@broadbandpicker"),
            "why": (
                "Discovery graph, not friend graph. A 12-second joke about buffering during the football "
                "will find people who have never heard of a comparison site. Students, first-time switchers, "
                "and 'my dad still pays £40 for 30 Mbps' kids live here."
            ),
            "audience": "16–34 UK, students, HMO flatshares, first adult bills.",
            "content": "Native vertical sketches, POV, green-screen rants, fake TfL/weather warnings.",
            "cadence": "1/day for 30 days, then 5/week. Post 19:00 UK weeknights, 11:30 weekends. Film/cover by 17:00 the day before. Recycle as IG Reels 24h later, not before.",
            "success": "Watch-through, comments, stitches, follows, traffic via link in bio / Spark Ads later.",
            "b2b": "Reach numbers you can put in an affiliate deck. 'We made broadband funny' is a pitch.",
        },
        {
            "channel": "LinkedIn",
            "priority": "P0 — open this week for provider / Awin gravity",
            "open": "Yes now",
            "handle": "Company page: BroadbandPicker",
            "why": (
                "This is how broadband providers and affiliate managers find you, not how consumers have a laugh. "
                "A crisp company page plus founder posts about methodology, coverage, and traffic is the difference "
                "between chasing programmes and being invited onto them."
            ),
            "audience": "ISP partnerships, Awin account managers, altnet marketers, comparison-site peers.",
            "content": "Site milestones, honest methodology, 'we list you even without an affiliate link', market notes.",
            "cadence": "2–3 posts/week. Founder voice, not corporate slurry.",
            "success": "Inbound to partnerships@, profile views from provider domains, connection requests.",
            "b2b": "Primary B2B channel. Pin a partnerships post. Put the site and Awin-ready trust pages in the featured section.",
        },
        {
            "channel": "YouTube (Shorts first, long-form later)",
            "priority": "P1 — start Shorts in week 3 by mirroring TikTok",
            "open": "Create the channel now, post from week 3",
            "handle": "BroadbandPicker",
            "why": "Shorts are free distribution. Long-form 'How to switch' and 'price rise 2026' videos become SEO assets.",
            "audience": "Same as TikTok, plus people who Google 'how to switch broadband' and click Videos.",
            "content": "Mirrored Shorts; later 6–8 min explainers with chapters and on-screen CTAs.",
            "cadence": "Shorts: 4/week once TikTok is flowing. Long-form: 1/month from month 2.",
            "success": "Subs, suggested traffic, branded views, later AdSense-adjacent watch time.",
            "b2b": "A real media property. Providers like 'hosted on YouTube', not just 'a tweet'.",
        },
        {
            "channel": "Facebook Page",
            "priority": "P1 — month 2",
            "open": "Create now, post from month 2 (or auto-share IG)",
            "handle": "BroadbandPicker",
            "why": (
                "Still where 35–60 UK shares rants about bills. Price-rise explainers and 'are you out of contract?' "
                "graphics travel in local groups if you are useful, not spammy."
            ),
            "audience": "Bill-payers, parents, local community groups.",
            "content": "Native graphics, Reels auto-share, calm explainers with a joke in the first line.",
            "cadence": "3–4/week, mostly recycled.",
            "success": "Shares, group discussion, 40+ traffic.",
            "b2b": "Low. Do it for reach, not for Awin theatre.",
        },
        {
            "channel": "WhatsApp Channel",
            "priority": "P1 — month 2",
            "open": "After IG/TikTok have a following to point at it",
            "handle": "BroadbandPicker Deals",
            "why": "UK usage is high. A broadcast channel for 'your contract is a trap' alerts and April price-rise week.",
            "audience": "People who will not open another app but will read a once-a-week ping.",
            "content": "1–2 notes/week. No spam. Link to a specific page.",
            "cadence": "Weekly, plus event-led.",
            "success": "Follows, link taps.",
            "b2b": "None. Pure consumer.",
        },
        {
            "channel": "Pinterest",
            "priority": "P2 — month 3",
            "open": "Only after 20 evergreen graphics exist",
            "handle": "BroadbandPicker",
            "why": "Evergreen infographics ('speed you actually need', 'social tariff checklist') keep sending traffic for years.",
            "audience": "Planners, movers, students' parents, 'save this' people.",
            "content": "Tall infographics, checklist pins, quote cards.",
            "cadence": "Batch 15 pins, then 3/week.",
            "success": "Saves and outbound clicks.",
            "b2b": "None.",
        },
        {
            "channel": "Threads",
            "priority": "P2 — only if IG is working",
            "open": "Same login as Instagram, post when a joke is too long for a caption",
            "handle": brand.social_handles.get("instagram", "@broadbandpicker"),
            "why": "Cheap extra surface. Do not build a separate strategy.",
            "audience": "IG overlap.",
            "content": "X-style text, no extra production.",
            "cadence": "Opportunistic.",
            "success": "Negligible until proven.",
            "b2b": "None.",
        },
        {
            "channel": "Reddit (presence, not a brand megaphone)",
            "priority": "P2 — contribute, do not 'launch an account'",
            "open": "Personal/expert account, not a mascot",
            "handle": "Transparent username, disclose affiliation",
            "why": "r/broadband, r/UKPersonalFinance, r/HousingUK. Helpful answers with a link only when asked beat any ad.",
            "audience": "High-intent researchers.",
            "content": "Genuine answers. Never dump deals.",
            "cadence": "2–3 comments/week.",
            "success": "Referral traffic, trust, the odd journalist lurker.",
            "b2b": "Indirect — shows you understand the market.",
        },
        {
            "channel": "Bluesky",
            "priority": "P3 — skip for now",
            "open": "No",
            "handle": "—",
            "why": "Too small for the operating cost. Revisit if UK broadband Twitter migrates.",
            "audience": "Tech early adopters.",
            "content": "—",
            "cadence": "—",
            "success": "—",
            "b2b": "Low.",
        },
        {
            "channel": "Snapchat",
            "priority": "P3 — skip",
            "open": "No",
            "handle": "—",
            "why": "Ads-only unless you have a youth brand budget. TikTok covers this audience.",
            "audience": "Under 25.",
            "content": "—",
            "cadence": "—",
            "success": "—",
            "b2b": "None.",
        },
    ]


# ---------------------------------------------------------------------------
# Content ideas
# ---------------------------------------------------------------------------


@dataclass
class DesignBrief:
    format_name: str
    dimensions: str
    duration: str
    visual_concept: str
    on_screen_text: list[str]
    palette: str
    type: str
    logo: str
    audio: str
    shots: list[str]
    do_not: list[str]


@dataclass
class Idea:
    id: str
    pillar: str
    title: str
    hook: str
    copy: str
    alt_copy: str
    cta: str
    url_key: str
    engagement: str
    hashtags: list[str]
    platforms: list[str]
    formats: list[str]
    why: str
    compliance: str
    design: DesignBrief
    search_intents: list[str] = field(default_factory=list)


def standard_palette() -> str:
    return (
        f"Outer navy {BRAND_NAVY}, inner paper card {BRAND_SLATE}, headline navy, "
        f"icon and punchline sky {BRAND_PRIMARY}, wordmark white on the navy footer, "
        f"green {BRAND_GREEN} only if the joke is genuine good news (one tick). "
        f"Illustration greys plus sky jumpers. No rainbow, no neon, no SALE red."
    )


def logo_rule() -> str:
    return (
        "Footer only. Sky rounded-square wifi-mark (#0EA5E9, two white arcs + white dot, "
        "public/logo.svg) on the navy strip, left, with white wordmark BroadbandPicker and "
        "broadbandpicker.co.uk. Never recolour the mark green. Never put it on the punchline. "
        "Never a generic stock wifi icon. Never a QR code."
    )


def ideas(brand: BrandProfile) -> list[Idea]:
    providers_sample = ", ".join(brand.providers[:6]) or "BT, Sky, Virgin Media, EE"
    home = brand.key_urls["home"]
    deals = brand.key_urls["deals"]
    compare = brand.key_urls["compare"]
    speed = brand.key_urls["speed_test"]
    social = brand.key_urls["social_tariffs"]
    rises = brand.key_urls["price_rises"]
    switch = brand.key_urls["switch"]

    bank: list[Idea] = []

    def add(idea: Idea) -> None:
        bank.append(idea)

    add(
        Idea(
            id="X-001",
            pillar="sarcasm",
            title="Loyalty is a hostage situation",
            hook="Been with them 8 years.",
            copy=(
                "Been with the same broadband lot for 8 years.\n"
                "New customers: £19.\n"
                "Me: £41.\n\n"
                "That's not loyalty. That's a hostage situation with slightly better Wi-Fi.\n\n"
                "If you're out of contract you're not a valued customer. You're the business model."
            ),
            alt_copy="Out of contract on broadband is just a standing order you forgot to argue with.",
            cta=f"Check you're not the business model: {deals}",
            url_key="deals",
            engagement="Quote this with what you actually pay. No judgement. Well, a bit of judgement.",
            hashtags=["#UKBroadband"],
            platforms=["x", "instagram", "tiktok", "facebook"],
            formats=["tweet", "reel", "story", "tiktok", "carousel"],
            why="Loyalty-tax rage is the most shareable broadband emotion in Britain. People tag the bill-payer.",
            compliance="Do not invent a specific provider price. Talk about the industry pattern. Deals vary by postcode.",
            design=DesignBrief(
                format_name="Split bill meme / end card",
                dimensions="1080x1350 feed, 1080x1920 Reel/TikTok, 1600x900 for X",
                duration="0:07–0:12 video or static",
                visual_concept=(
                    "Two fake bills side by side. Left labelled NEW CUSTOMER in sky blue. "
                    "Right labelled LOYAL CUSTOMER in angry red-navy. Same tiny print energy as a real ISP email."
                ),
                on_screen_text=["New customer: £19", "You: £41", "That's not loyalty.", "That's a hostage situation."],
                palette=standard_palette(),
                type="Anton or Impact for the joke; Inter Bold for the end card.",
                logo=logo_rule(),
                audio="Dry VO, northern or estuary, unimpressed. Optional: hold-music sting at the end.",
                shots=["0-2s bills slam on", "2-7s punchline types on", "7-12s BroadbandPicker end card + URL"],
                do_not=["Don't use a real customer's bill", "Don't name a fake official tariff"],
            ),
        )
    )
    add(
        Idea(
            id="X-002",
            pillar="meme",
            title="Yellow warning of buffering",
            hook="YELLOW WARNING OF BUFFERING",
            copy=(
                "YELLOW WARNING OF BUFFERING\n"
                "Issued: 19:42, every evening.\n"
                "Affected: anyone who dared to watch the football, boil a kettle, and exist.\n\n"
                "Met Office couldn't be reached. They were buffering."
            ),
            alt_copy="Weather warning, but it's your Wi-Fi every time MOTD kicks off.",
            cta=f"See if your postcode has actually grown up: {home}",
            url_key="home",
            engagement="Reply with your local buffering time. Ours is 7pm like clockwork. Britain is a contended nation.",
            hashtags=["#Buffering", "#UKBroadband"],
            platforms=["x", "instagram", "tiktok"],
            formats=["tweet", "reel", "story", "tiktok", "feed"],
            why="Met Office warning format is instantly native, screenshottable, and seasonless.",
            compliance="Parody of a public warning style is fine. Do not impersonate the Met Office logo exactly; pastiche it.",
            design=DesignBrief(
                format_name="Met Office pastiche",
                dimensions="1080x1920 and 1080x1080",
                duration="0:08 with siren-to-silence, or static",
                visual_concept=(
                    "Yellow warning triangle, map of the UK with a blob over 'wherever you live', "
                    "ticker: BUFFERING. Bottom: 'Check your postcode, not the clouds.'"
                ),
                on_screen_text=["YELLOW WARNING OF BUFFERING", "From 7pm until you give up", "Likely: Netflix, Zoom, dignity"],
                palette="Warning yellow #F4D35E on navy, white type, sky-blue BroadbandPicker footer.",
                type="A Met-Office-ish sans. Keep it official-looking then undercut it.",
                logo=logo_rule(),
                audio="Actual weather-beep then a sad buffering spinner sound.",
                shots=["0-1s warning sting", "1-6s map + copy", "6-8s logo"],
                do_not=["Don't use the real Met Office trademark lockup"],
            ),
        )
    )
    add(
        Idea(
            id="X-003",
            pillar="quote",
            title="Keep calm and restart the router",
            hook="Keep calm and restart the router",
            copy=(
                "Keep calm and restart the router.\n\n"
                "The official British response to every crisis since 2010:\n"
                "the economy, the trains, and the Wi-Fi in the back bedroom."
            ),
            alt_copy="We replaced the stiff upper lip with a blinking orange light.",
            cta=f"If restarting it is a lifestyle, compare actual full fibre: {compare}",
            url_key="compare",
            engagement="Tag the household IT department. You know the one. They are 14.",
            hashtags=["#KeepCalm", "#BritishProblems"],
            platforms=["x", "instagram", "tiktok"],
            formats=["tweet", "feed", "story", "reel", "tiktok"],
            why="The Keep Calm format is visual shorthand for British coping. Perfect quote-card bait.",
            compliance="Keep Calm is a widely used parody. Don't sell merch of the Crown's actual poster without a licence; social parody is the use.",
            design=DesignBrief(
                format_name="Keep Calm poster",
                dimensions="1080x1350",
                duration="static + 0:06 kinetic type for Reels",
                visual_concept="Classic cream poster, crown replaced with the BroadbandPicker wifi mark, red strip KEEP CALM AND RESTART THE ROUTER.",
                on_screen_text=["KEEP CALM", "AND", "RESTART THE ROUTER"],
                palette="Ministry cream, poster red, navy type, sky wifi-mark.",
                type="A Times-like serif or a poster gothic. Not Inter for this one.",
                logo="Wifi-mark as the 'crown'. Wordmark tiny at the bottom.",
                audio="WW2 newsreel crackle, then a router reboot chord.",
                shots=["Poster hold", "slight paper zoom", "end URL"],
                do_not=["Don't add six other jokes on the poster. One line."],
            ),
        )
    )
    add(
        Idea(
            id="X-004",
            pillar="pun",
            title="Up to",
            hook="“Up to 67 Mbps”",
            copy=(
                "“Up to 67 Mbps.”\n\n"
                "Up to a biscuit with your tea.\n"
                "Up to a weekend in Wales if the rain stops.\n"
                "Up to your nan's idea of 'soon'.\n\n"
                "British broadband: a nation raised on small print."
            ),
            alt_copy="Mbps. Maybe Per Second.",
            cta=f"Look at speeds for your actual address, not the advert: {home}",
            url_key="home",
            engagement="Finish the sentence: “Up to ______.” Best reply gets a virtual biscuit.",
            hashtags=["#UpTo", "#UKBroadband"],
            platforms=["x", "instagram", "tiktok"],
            formats=["tweet", "reel", "story", "tiktok"],
            why="Everyone has been lied to by 'up to'. It's a national in-joke with a regulator behind it.",
            compliance="Ofcom-aware: advertised speeds are typical/peak, availability is address-level. Don't claim a provider is lying; mock the industry phrasing.",
            design=DesignBrief(
                format_name="Small-print zoom",
                dimensions="1080x1920",
                duration="0:10",
                visual_concept="Giant 'UP TO 67 Mbps' in advert-land, camera zooms into microscopic footnotes until it becomes a novel.",
                on_screen_text=["UP TO 67 Mbps", "*up to a biscuit", "*up to your nan's 'soon'"],
                palette=standard_palette(),
                type="Advert grotesk, then Courier for the footnotes.",
                logo=logo_rule(),
                audio="Sales VO that gets quieter as the footnote takes over.",
                shots=["Hero claim", "zoom to footnote", "punchline", "end card"],
                do_not=["Don't fake a real provider's current advertised number"],
            ),
        )
    )
    add(
        Idea(
            id="X-005",
            pillar="british-life",
            title="89th minute",
            hook="Nothing unites Britain like the Wi-Fi dying in the 89th minute.",
            copy=(
                "Nothing unites this country like the Wi-Fi dying in the 89th minute.\n\n"
                "Left-wing. Right-wing. United in screaming at a plastic box on the skirting board.\n\n"
                "The router has never watched a game of football and it shows."
            ),
            alt_copy="Peak British sport: not the match. The buffering circle.",
            cta=f"If your household treats MOTD as a stress test, start here: {home}",
            url_key="home",
            engagement="Reply ⚽ if this has happened to you. Reply 📉 if it happened tonight.",
            hashtags=["#MOTD", "#BritishProblems"],
            platforms=["x", "instagram", "tiktok"],
            formats=["tweet", "reel", "tiktok", "story"],
            why="Sport + broadband failure is appointment virality. Post Saturday 7–10pm and midweek fixtures.",
            compliance="Don't show pirated streams. A TV-in-living-room shot or a fake score bug is enough.",
            design=DesignBrief(
                format_name="Living room disaster sketch",
                dimensions="1080x1920",
                duration="0:09–0:15",
                visual_concept="Over-the-sofa POV, match on TV, buffering spinner, cut to a man kneeling before a router like it's a shrine.",
                on_screen_text=["89:00", "buffering", "the national sport"],
                palette="Warm living-room, then navy end card.",
                type="Scoreboard type for the time, Inter for the caption.",
                logo=logo_rule(),
                audio="Crowd roar that collapses into a buffering blip. No copyrighted commentary.",
                shots=["Match", "spinner", "router shrine", "end"],
                do_not=["Don't use Premier League footage"],
            ),
        )
    )
    add(
        Idea(
            id="X-006",
            pillar="quote",
            title="Socrates pays the bill",
            hook="The unexamined broadband bill is not worth paying.",
            copy=(
                "“The unexamined broadband bill is not worth paying.”\n"
                "— Socrates, probably, after Sky put him up £4 in April.\n\n"
                "If you have not looked at your contract since Johnson was in Downing Street, this is your sign."
            ),
            alt_copy="Know thyself. Especially the out-of-contract price on page 7.",
            cta=f"Examine it in 30 seconds: {deals}",
            url_key="deals",
            engagement="Quote-tweet the wisest thing a philosopher never said about your ISP.",
            hashtags=["#Philosophy", "#UKBills"],
            platforms=["x", "instagram"],
            formats=["tweet", "feed", "story", "carousel"],
            why="Wise-quote-plus-undercut is screenshot gold. Feels clever, reads in two seconds.",
            compliance="Parody attribution is obvious. Don't pretend it's a real quotation.",
            design=DesignBrief(
                format_name="Quote card",
                dimensions="1080x1080 and 1080x1350",
                duration="static",
                visual_concept="Marble bust with a cheap ISP router photoshopped as a laurel. Quote in a literary serif. Tiny 'probably' in sky blue.",
                on_screen_text=["The unexamined broadband bill is not worth paying.", "— Socrates, probably"],
                palette="Statue grey, navy, sky pull-quote marks.",
                type="Playfair / Source Serif for the quote, Inter for the probably.",
                logo="Small mark bottom-right, plenty of margin.",
                audio="N/A for static; optional lyre that becomes dial-up.",
                shots=["Hold the card. That's the tweet."],
                do_not=["Don't make the bust a recognisable living person"],
            ),
        )
    )
    add(
        Idea(
            id="X-007",
            pillar="british-life",
            title="Router in the cupboard",
            hook="Your router is in the cupboard under the stairs.",
            copy=(
                "Your router is in the cupboard under the stairs.\n"
                "Next to the ironing board, a bag of compost, and the ghost of a Christmas tree.\n\n"
                "And you want 4K in the back bedroom.\n\n"
                "That's not broadband. That's faith healing."
            ),
            alt_copy="Unpopular opinion: you don't need gigabit. You need the router not living with the hoover.",
            cta=f"Still slow after you move it? Then compare the actual line: {speed}",
            url_key="speed_test",
            engagement="Unpopular opinion time. Router in cupboard: yes or are you a maniac who put it in the attic?",
            hashtags=["#WiFi", "#BritishHomes"],
            platforms=["x", "instagram", "tiktok"],
            formats=["tweet", "reel", "tiktok", "carousel"],
            why="Everyone has a cupboard router. It's a tag-your-dad post.",
            compliance="Helpful-funny: don't pretend a cupboard is always the reason. Speed-test CTA is the honest next step.",
            design=DesignBrief(
                format_name="Estate-agent tour gone wrong",
                dimensions="1080x1920",
                duration="0:12",
                visual_concept="Phone-torch tour of a British under-stairs cupboard. Reveal: router, blinking, under a pile of coats. Caption like Location Location Location.",
                on_screen_text=["The master bedroom of your Wi-Fi", "Period features: damp, beans, 12 Mbps"],
                palette="Documentary torchlight, then clean end card.",
                type="Channel 4 documentary lower-third.",
                logo=logo_rule(),
                audio="Estate agent VO: 'A generous cupboard with excellent blinking.'",
                shots=["Door opens", "coats", "router hero shot", "end"],
                do_not=["Don't film someone else's house without permission"],
            ),
        )
    )
    add(
        Idea(
            id="X-008",
            pillar="sarcasm",
            title="Engineer window",
            hook="We'll be there between 8 and 6.",
            copy=(
                "Broadband engineer: “We'll be there between 8 and 6.”\n\n"
                "That's not an appointment.\n"
                "That's a hostage video with a van.\n\n"
                "Take the day off work. Brew a flask. Stare at the street like a meerkat. "
                "This is the British wellness industry."
            ),
            alt_copy="The only thing in Britain with a wider window is a by-election.",
            cta=f"When they finally come, make the new deal worth it: {switch}",
            url_key="switch",
            engagement="What's the longest engineer window you've been given? Winner gets absolutely nothing, like the engineer.",
            hashtags=["#BritishProblems"],
            platforms=["x", "instagram", "tiktok"],
            formats=["tweet", "reel", "tiktok", "story"],
            why="Universal UK pain. Comments become a therapy group. High reply rate.",
            compliance="Don't claim a named provider always misses slots. Mock the culture of the window.",
            design=DesignBrief(
                format_name="Portrait poster",
                dimensions="1080x1350",
                duration="static",
                visual_concept=(
                    "Hero reference poster. Navy outer frame. Paper rounded card. Small sky clock icon. "
                    "Headline ENGINEER WINDOW. Giant 8AM-6PM. Sky punchline So... Tuesday. "
                    "Split cartoon: left 8:00AM hopeful person at a table with coffee, laptop and router, "
                    "British terrace through the window; right 5:47PM wrecked on the sofa, pizza boxes, "
                    "empty mugs, van with a wrench logo finally arriving. Same person, same room, time passed."
                ),
                on_screen_text=["ENGINEER WINDOW", "8AM-6PM", "So... Tuesday."],
                palette=standard_palette(),
                type="Inter ExtraBold navy headline. Sky punchline. Small navy panel labels 8:00AM and 5:47PM.",
                logo=logo_rule(),
                audio="N/A for still. Reel: quiet kitchen then a van door at the end.",
                shots=["Poster still", "optional 8s pan across the two panels", "navy end card"],
                do_not=["Do not use a real Openreach or BT uniform or logo"],
            ),
        )
    )
    add(
        Idea(
            id="X-009",
            pillar="british-life",
            title="Full fibre is coming",
            hook="Full fibre is coming to your area.",
            copy=(
                "Full fibre is coming to your area.\n\n"
                "That's what they said about HS2.\n"
                "And a bakers in the high street.\n"
                "And a responsible government.\n\n"
                "I'll believe it when the van is on my drive, not in a press release."
            ),
            alt_copy="The Openreach van is the British Yeti. People swear they've seen it.",
            cta=f"Don't trust the poster. Check the postcode: {home}",
            url_key="home",
            engagement="If full fibre actually arrived at yours, reply with the year you were first promised it. Archaeological survey.",
            hashtags=["#FullFibre", "#UKInfrastructure"],
            platforms=["x", "instagram"],
            formats=["tweet", "feed", "story"],
            why="Infrastructure fatalism is a national sport. Rural and suburban users will share this with violence.",
            compliance="Availability really is address-level. CTA to the postcode checker is both funny and true.",
            design=DesignBrief(
                format_name="Roadworks prophecy",
                dimensions="1080x1350",
                duration="static",
                visual_concept="A weathered 'Coming soon: full fibre' council-style sign overgrown with ivy. Date on the sign: 2014.",
                on_screen_text=["COMING SOON", "full fibre", "est. any parliament now"],
                palette="Council green, rust, navy caption bar.",
                type="Highways signage type.",
                logo="Bar at the bottom: Check the postcode, not the sign.",
                audio="N/A",
                shots=["Single poster image"],
                do_not=["Don't fake an official local-authority crest"],
            ),
        )
    )
    add(
        Idea(
            id="X-010",
            pillar="meme",
            title="Drake / out of contract",
            hook="Paying the out-of-contract price vs spending four minutes comparing.",
            copy=(
                "Reject: another year of the 'loyalty' price because switching sounds like admin.\n"
                "Accept: four minutes, a postcode, and the quiet thrill of paying what new people pay.\n\n"
                "One Touch Switch exists now. Britain accidentally made something simple. Don't tell anyone."
            ),
            alt_copy="Switching used to be emigrating. Now it's a Tuesday.",
            cta=f"How switching actually works: {switch}",
            url_key="switch",
            engagement="Duet/stitch: show your actual bill with the price blurred if you like. We'll wait.",
            hashtags=["#OneTouchSwitch"],
            platforms=["instagram", "tiktok", "x"],
            formats=["reel", "tiktok", "feed", "tweet"],
            why="Drake format still prints. Pair it with a genuine consumer win (OTS).",
            compliance="One Touch Switch is real Ofcom policy. Don't promise zero downtime; say it is designed to keep you online.",
            design=DesignBrief(
                format_name="Drake / yes-no meme",
                dimensions="1080x1350",
                duration="static or 0:06",
                visual_concept="Standard two-panel Drake. Top: crumpled bill. Bottom: postcode checker screenshot (use BroadbandPicker UI, not a competitor).",
                on_screen_text=["Paying the loyalty price", "Four minutes on BroadbandPicker"],
                palette="Meme-native, end card in brand colours.",
                type="Impact for panels, Inter on the end card.",
                logo="Only on the accept panel as the UI, plus end card.",
                audio="Original audio or a well-worn meme sound — check commercial use.",
                shots=["Panel 1", "Panel 2", "URL"],
                do_not=["Don't use uncleared celebrity likeness if you can shoot an original 'nah/yeah' with a staffer"],
            ),
        )
    )
    add(
        Idea(
            id="X-011",
            pillar="pun",
            title="Fibre I barely know her",
            hook="They said I was getting fibre.",
            copy=(
                "They said I was getting fibre.\n\n"
                "I was getting fibre to a cabinet three streets away and a copper line that remembers Blair.\n\n"
                "FTTC: Fibre To The Close-enough.\n"
                "FTTP: Finally The Thing's Proper."
            ),
            alt_copy="Part-fibre is the 'seedless' grapes of infrastructure. Technically true. Spiritually a con.",
            cta=f"Full fibre vs the other thing: {brand.key_urls['guides']}/fttp-vs-fttc-explained",
            url_key="guides",
            engagement="If your 'fibre' still has a copper aftertaste, drop a 🧡. If you've got proper FTTP, gloat quietly.",
            hashtags=["#FTTP", "#FTTC"],
            platforms=["x", "instagram", "tiktok"],
            formats=["tweet", "carousel", "reel", "tiktok"],
            why="The fibre/liar confusion is the most useful joke in the market. Teaches while it dunks.",
            compliance="Define FTTC vs FTTP accurately. Don't say copper is 'fake fibre' in a way Ofcom would hate; say part-fibre.",
            design=DesignBrief(
                format_name="Two-door cartoon",
                dimensions="1080x1350 carousel (3 slides)",
                duration="static carousel + 0:12 Reel",
                visual_concept="Two doors. One ornate 'FULL FIBRE'. One labelled 'fibre' in Comic Sans, leading to a muddy alley.",
                on_screen_text=["Fibre", "Full fibre", "One of these still involves the 1990s"],
                palette=standard_palette(),
                type="Clean Inter on slides 2–3 where you actually explain it.",
                logo="Slide 3.",
                audio="Game-show ding vs sad trombone.",
                shots=["Door gag", "one-line definition", "CTA"],
                do_not=["Don't leave people thinking all 'fibre' is a scam — some FTTC is fine for light use"],
            ),
        )
    )
    add(
        Idea(
            id="X-012",
            pillar="british-life",
            title="Flatshare FIFA",
            hook="4 people. 1 router. 3 FaceTimes. 1 FIFA.",
            copy=(
                "Four people. One router. Three FaceTimes. One FIFA.\n\n"
                "This is not a household.\n"
                "This is a failed state with a shared fridge.\n\n"
                "Student broadband is just peace talks with extra Ethernet."
            ),
            alt_copy="The real degree is conflict resolution over the last 12 Mbps.",
            cta=f"Student and renter deals exist. Shocking, I know. {brand.key_urls['guides']}/best-broadband-for-students",
            url_key="guides",
            engagement="Tag the housemate who streams in 4K 'because it's there'. Go on. Start the war in the comments.",
            hashtags=["#StudentLife", "#HMO"],
            platforms=["tiktok", "instagram", "x"],
            formats=["tiktok", "reel", "story", "tweet"],
            why="September gold. Tagging is built in. Parents will share it too, unironically.",
            compliance="Don't mock people on social tariffs in the same joke. This is chaos, not poverty.",
            design=DesignBrief(
                format_name="Security-cam kitchen",
                dimensions="1080x1920",
                duration="0:12",
                visual_concept="Top-down cheap CCTV vibe of a student kitchen. Each person labelled with the bandwidth they're stealing. FIFA lad has a halo of lag.",
                on_screen_text=["National Grid, but for arguments", "Who touched the QoS settings"],
                palette="Sickly fluorescent, then navy end card.",
                type="CCTV timestamp font.",
                logo=logo_rule(),
                audio="Overlapping Zoom hold music and a goal horn that never finishes.",
                shots=["Labels pop on each housemate", "router sparks (fake)", "end"],
                do_not=["Don't film real students without releases"],
            ),
        )
    )
    add(
        Idea(
            id="X-013",
            pillar="useful-funny",
            title="Social tariff scandal",
            hook="There's cheaper broadband if you're on certain benefits. Most eligible people have never heard of it.",
            copy=(
                "Not a joke, for once.\n\n"
                "If you're on Universal Credit, Pension Credit and a few other benefits, there are social tariffs "
                "from around the price of a couple of pints.\n\n"
                "Ofcom's own figures say most eligible households still don't know they exist.\n\n"
                "That's not a 'deal'. That's a scandal with a PDF."
            ),
            alt_copy="Funny account, serious post. Share this one even if you don't need it — someone on your street might.",
            cta=f"Plain-English explainer: {social}",
            url_key="social_tariffs",
            engagement="Share this even if it isn't you. Especially if it might be your parents.",
            hashtags=["#SocialTariff", "#UKBills"],
            platforms=["x", "instagram", "facebook"],
            formats=["tweet", "carousel", "story", "feed"],
            why="Trust-builder. Makes the funny account look like a decent citizen. Providers and Awin notice the editorial spine.",
            compliance="Eligibility is specific. Don't say 'everyone on benefits'. Link the guide. No punching down, no 'scrounger' framing.",
            design=DesignBrief(
                format_name="Calm carousel",
                dimensions="1080x1350, 5 slides",
                duration="static",
                visual_concept="Drop the meme face. Clean navy slides, big type, one fact each, final slide is the URL. This is the adult in the room.",
                on_screen_text=[
                    "If you're on certain benefits, cheaper broadband exists",
                    "Most eligible people have never heard of it",
                    "It's called a social tariff",
                    "We explain who qualifies, without the waffle",
                ],
                palette=f"Navy {BRAND_NAVY}, white type, green {BRAND_GREEN} ticks. No yellow jokes.",
                type="Inter ExtraBold headlines, Inter Regular body.",
                logo="On every slide, small, because this is branded public service.",
                audio="N/A",
                shots=["5 slides"],
                do_not=["Don't put a clown meme on this one"],
            ),
        )
    )
    add(
        Idea(
            id="X-014",
            pillar="quote",
            title="Ask not what your ISP can do",
            hook="Ask not what your ISP can do for you.",
            copy=(
                "Ask not what your ISP can do for you.\n"
                "They already told you.\n"
                "“Have you tried turning it off and on again?”\n\n"
                "— JFK, if JFK had a TalkTalk hub and a dream."
            ),
            alt_copy="The only inaugural address your ISP will ever give is a reboot instruction.",
            cta=f"If you've already rebooted it, compare a line that doesn't need a sermon: {compare}",
            url_key="compare",
            engagement="What's the most useless thing an ISP chatbot has said to you? We'll make a shrine.",
            hashtags=["#CustomerService"],
            platforms=["x", "instagram"],
            formats=["tweet", "feed", "story"],
            why="Classic quote + IT Crowd callback. Two generations in one joke.",
            compliance="Parody. Don't use a presidential seal. 'TalkTalk hub' is illustrative, not a product claim.",
            design=DesignBrief(
                format_name="Oval Office / airing cupboard",
                dimensions="1080x1080",
                duration="static",
                visual_concept="Presidential speech desk. Behind: not a flag, a router with a sad orange light.",
                on_screen_text=["HAVE YOU TRIED", "TURNING IT OFF", "AND ON AGAIN"],
                palette="Navy, red stripe as a visual gag not a party colour, sky wifi-mark as a lapel pin.",
                type="Inscribed serif.",
                logo="Lapel-pin wifi mark + bottom URL.",
                audio="N/A",
                shots=["Single image"],
                do_not=["Don't use an official US or UK government lockup"],
            ),
        )
    )
    add(
        Idea(
            id="X-015",
            pillar="pun",
            title="Bandwidth like a British summer",
            hook="My bandwidth is like a British summer.",
            copy=(
                "My bandwidth is like a British summer.\n"
                "Brief.\n"
                "Disappointing.\n"
                "And somehow still £32 a month.\n\n"
                "Pack a cardigan and a speed test."
            ),
            alt_copy="Two weeks of Wimbledon, then packet loss until April.",
            cta=f"Run the speed test. Take a cardigan. {speed}",
            url_key="speed_test",
            engagement="Other British things my broadband is like: a queue, a rail replacement bus, a barbecue in March…",
            hashtags=["#BritishSummer", "#UKBroadband"],
            platforms=["x", "instagram", "tiktok"],
            formats=["tweet", "story", "reel", "tiktok"],
            why="Weather is the UK's second language. Easy stitches and duet templates.",
            compliance="Humour, not a measured claim about a named network.",
            design=DesignBrief(
                format_name="Holiday postcard",
                dimensions="1080x1080",
                duration="static + 0:06",
                visual_concept="Kiss Me Quick postcard: deckchairs, grey sky, a speed-test result stamped like a passport: 11 Mbps.",
                on_screen_text=["WISH YOU WEREN'T HERE", "bandwidth as brief as the summer"],
                palette="Faded postcard reds, navy caption.",
                type="Retro script + Inter.",
                logo="Stamp in the corner using the wifi mark.",
                audio="Seagulls and rain.",
                shots=["Postcard zoom"],
                do_not=["Don't use a real person's holiday photo"],
            ),
        )
    )
    add(
        Idea(
            id="X-016",
            pillar="sarcasm",
            title="April, the other tax month",
            hook="April: council tax, broadband, and the urge to move to France.",
            copy=(
                "April in Britain:\n"
                "• council tax up\n"
                "• broadband up\n"
                "• sudden interest in moving to Brittany\n\n"
                "Ofcom made them put the rise in pounds, not 'CPI plus a vibe'.\n"
                "You can still leave. That's the bit they don't put on the fridge magnet."
            ),
            alt_copy="Price-rise season is just Halloween for your standing order.",
            cta=f"What a rise actually means for your contract: {rises}",
            url_key="price_rises",
            engagement="If a provider has emailed you an April rise, drop the £ amount (not your account number, we're not animals).",
            hashtags=["#CostOfLiving", "#Ofcom"],
            platforms=["x", "instagram", "tiktok", "facebook"],
            formats=["tweet", "carousel", "reel", "tiktok", "story"],
            why="Cyclical viral moment. Prep creative in February, ship when the emails land.",
            compliance="Cite the pounds-and-pence rule accurately. Leaving still depends on the contract. Link the rights guide.",
            design=DesignBrief(
                format_name="Fridge-magnet budget",
                dimensions="1080x1350 carousel",
                duration="static + 0:15 explain-with-a-smirk Reel",
                visual_concept="A British fridge: council tax letter, broadband rise letter, a faded photo of France.",
                on_screen_text=["April", "the other tax month", "You can still leave"],
                palette=standard_palette(),
                type="Inter.",
                logo="Last slide.",
                audio="Countdown to the 1st of April, then a kettle.",
                shots=["Fridge", "letters", "rights line", "CTA"],
                do_not=["Don't tell people they can always leave fee-free — that's not always true"],
            ),
        )
    )
    add(
        Idea(
            id="X-017",
            pillar="meme",
            title="Wi-Fi name personality test",
            hook="Your Wi-Fi name is a personality test.",
            copy=(
                "Your Wi-Fi name is a personality test.\n\n"
                "BTHub-19A2 — you have given up.\n"
                "PrettyFlyForAWiFi — you peaked in 2014.\n"
                "FBI Surveillance Van — you have a nephew.\n"
                "The Password Is On The Fridge — you are the backbone of this country.\n\n"
                "Drop yours. We'll diagnose you for free. The broadband, not the personality. That's beyond us."
            ),
            alt_copy="Tell me your SSID without telling me your SSID.",
            cta=f"After the roast, compare something that isn't named after a crime: {home}",
            url_key="home",
            engagement="PRIMARY CTA is the comments. This post exists to farm replies and quote-tweets.",
            hashtags=["#WiFiName"],
            platforms=["x", "instagram", "tiktok"],
            formats=["tweet", "story", "reel", "tiktok"],
            why="Highest projected comment rate in the bank. Names are identity. People tag the person who named it.",
            compliance="Don't encourage passwords in comments. Names only. Joke-ban anyone who posts a password.",
            design=DesignBrief(
                format_name="Phone Wi-Fi picker",
                dimensions="1080x1920",
                duration="0:10",
                visual_concept="iOS/Android Wi-Fi list with joke names. A finger hovers, never connects.",
                on_screen_text=["Choose your fighter", "password in the comments = banned"],
                palette="OS-native then brand end card.",
                type="SF/Roboto for the fake OS, Inter at the end.",
                logo=logo_rule(),
                audio="UI clicks.",
                shots=["Scroll the list", "tap a ridiculous name", "end"],
                do_not=["Don't include a real neighbour's network from a captured screenshot"],
            ),
        )
    )
    add(
        Idea(
            id="X-018",
            pillar="useful-funny",
            title="Speed you actually need",
            hook="You do not need a gigabit to email your solicitor.",
            copy=(
                "You do not need a gigabit to email your solicitor.\n\n"
                "One person, Netflix in HD: a few dozen Mbps will do.\n"
                "Family, WFH, 4K, a teenager: now we can talk.\n"
                "Gaming: ping matters more than a vanity download number.\n\n"
                "The upgrade you need might be moving the router. The upgrade you want is bragging at the pub."
            ),
            alt_copy="Gigabit is a personality. 150 Mbps is a household.",
            cta=f"Match the household, not the advert: {brand.key_urls['match']}",
            url_key="match",
            engagement="Reply with: number of humans vs number of devices. We'll guess your monthly pain.",
            hashtags=["#BroadbandSpeed"],
            platforms=["instagram", "x", "tiktok"],
            formats=["carousel", "reel", "tweet", "tiktok"],
            why="Saves people money, which is how you become the trusted comparison brand rather than a hype merchant.",
            compliance="Use ranges, not fake precision. Always 'typical household' language.",
            design=DesignBrief(
                format_name="Pub-brag vs reality carousel",
                dimensions="1080x1350, 6 slides",
                duration="static + 0:20 Reel voiceover",
                visual_concept="Slide 1 joke, slides 2–5 useful table, slide 6 Broadband Match CTA. Let the joke earn the table.",
                on_screen_text=["Gigabit is a personality", "Here's what you actually need"],
                palette=standard_palette(),
                type="Inter throughout. This one should look like the website grew a sense of humour.",
                logo="All slides, small.",
                audio="Pub chatter under the VO, then clean.",
                shots=["Joke", "table", "quiz CTA"],
                do_not=["Don't invent a 'perfect Mbps' for every home"],
            ),
        )
    )
    add(
        Idea(
            id="X-019",
            pillar="sarcasm",
            title="Same copper, different jumper",
            hook="Choosing broadband by TV advert is like choosing a pension by jingle.",
            copy=(
                "Half the 'different' broadband brands are the same Openreach line in a different jumper.\n\n"
                "You're not picking a network.\n"
                "You're picking a mail-merge, a modem, and how badly they hide the price in month 19.\n\n"
                f"We put {providers_sample} and the rest in one place, because life is too short to open twelve tabs."
            ),
            alt_copy="It's the same picture. It's often the same cabinet.",
            cta=f"One table, several jumpers: {compare}",
            url_key="compare",
            engagement="Reply with the brand you thought was 'the network' and we'll gently ruin Christmas.",
            hashtags=["#Openreach", "#Altnets"],
            platforms=["x", "instagram"],
            formats=["tweet", "carousel", "feed"],
            why="Makes BroadbandPicker look like the adult comparison site. Also invites altnet fans to argue, which is free reach.",
            compliance="True for many Openreach resellers; NOT true for Virgin Media, Hyperoptic, Community Fibre, etc. Say 'often', show the exceptions.",
            design=DesignBrief(
                format_name="It's the same picture",
                dimensions="1080x1080",
                duration="static",
                visual_concept="Spider-Man pointing meme energy, but two identical Openreach cabinets wearing different knitted jumpers with brand-ish colours (not logos).",
                on_screen_text=["It's the same cabinet", "Different jumper"],
                palette="Street photography + brand bar.",
                type="Inter.",
                logo="Bar.",
                audio="N/A",
                shots=["Single image"],
                do_not=["Don't put real ISP logos on the jumpers"],
            ),
        )
    )
    add(
        Idea(
            id="X-020",
            pillar="british-life",
            title="Zoom, you're muted, no it's the line",
            hook="You're muted. No — that's the broadband.",
            copy=(
                "“You're muted.”\n"
                "“I'm not muted.”\n"
                "“We can see you talking.”\n"
                "“That's the broadband doing impressionism.”\n\n"
                "WFH Britain: professional on the top half, 2005 on the connection."
            ),
            alt_copy="Upload speed is a personality flaw and HR knows.",
            cta=f"Best broadband for working from home, minus the TED talk: {brand.key_urls['guides']}/best-broadband-for-working-from-home",
            url_key="guides",
            engagement="HR people, drop the funniest thing you've seen a lag do to a grown adult.",
            hashtags=["#WFH", "#Zoom"],
            platforms=["tiktok", "instagram", "x"],
            formats=["tiktok", "reel", "tweet", "story"],
            why="WFH is still a default UK identity. Employers will share it. Dangerous in a good way.",
            compliance="Don't use real Zoom UI in a way that implies endorsement. Generic grid is enough.",
            design=DesignBrief(
                format_name="Video-call grid sketch",
                dimensions="1080x1920",
                duration="0:11",
                visual_concept="2x2 grid. Three crisp colleagues. One pixelated impressionist painting that used to be a man in Stevenage.",
                on_screen_text=["You're muted", "That's the broadband"],
                palette="App greys, then brand end card.",
                type="UI type.",
                logo=logo_rule(),
                audio="Warped VO of 'can you hear me now'.",
                shots=["Grid", "pixel man talks", "others freeze", "end"],
                do_not=["Don't mock a real person's appearance; keep it about the pixels"],
            ),
        )
    )
    add(
        Idea(
            id="X-021",
            pillar="pun",
            title="Packet loss packed lunch",
            hook="It's not you. It's packet loss.",
            copy=(
                "It's not you. It's packet loss.\n\n"
                "Your relationship with this ISP has run its course.\n"
                "The packets left and they're not coming back.\n"
                "Take the router. Leave the contract."
            ),
            alt_copy="Let's split the Ethernet. I'll take the kids' iPads.",
            cta=f"Break up properly: {switch}",
            url_key="switch",
            engagement="Break-up texts for your ISP. We'll post the best ones. Keep it PG, this is broadband not Love Island.",
            hashtags=["#PacketLoss"],
            platforms=["x", "instagram", "tiktok"],
            formats=["tweet", "reel", "tiktok", "story"],
            why="Romance-breakup format is a native meme. Easy stitches.",
            compliance="Humour. Don't claim a named ISP has unusual packet loss without data.",
            design=DesignBrief(
                format_name="Break-up text",
                dimensions="1080x1920",
                duration="0:08",
                visual_concept="iMessage conversation with 'Your ISP'. Grey bubble: 'it's not you it's packet loss.'",
                on_screen_text=["Delivered", "read at 19:42", "during the football, obviously"],
                palette="iMessage blue/grey, navy end card.",
                type="SF-like.",
                logo=logo_rule(),
                audio="Text-send pings.",
                shots=["Messages appear", "end"],
                do_not=["Don't use Apple's trademarked iMessage lockup in ads — organic pastiche is the usual risk level"],
            ),
        )
    )
    add(
        Idea(
            id="X-022",
            pillar="british-life",
            title="Greggs vs gigabit",
            hook="I'd give up a sausage roll for 900 Mbps.",
            copy=(
                "I'd give up a sausage roll for 900 Mbps.\n\n"
                "I would not give up the steak bake.\n"
                "There is a line, even in this economy.\n\n"
                "Comment your price. We'll tell you if it's a steak bake or a sad vegan roll of a contract."
            ),
            alt_copy="Britain's two religions: pastry and a solid connection in the kitchen.",
            cta=f"Find out if you're overpaying for crumbs: {deals}",
            url_key="deals",
            engagement="Sausage roll or steak bake: what is your broadband actually worth?",
            hashtags=["#Greggs", "#Britain"],
            platforms=["x", "instagram", "tiktok"],
            formats=["tweet", "story", "reel", "tiktok"],
            why="Greggs is UK engagement catnip. Harmless, visual, comment-driven.",
            compliance="Don't use Greggs branding as if it's a partnership. Generic pastry is safer than the logo.",
            design=DesignBrief(
                format_name="Fake menu board",
                dimensions="1080x1350",
                duration="static + 0:07",
                visual_concept="Café menu: Sausage roll / 70 Mbps. Steak bake / full fibre. Vegan roll / out of contract price.",
                on_screen_text=["TODAY'S SPECIALS", "dignity: sold out"],
                palette="Warm bakery, navy footer.",
                type="Menu board gothic.",
                logo="Footer.",
                audio="Café noise.",
                shots=["Menu pan"],
                do_not=["Don't imply Greggs endorses BroadbandPicker"],
            ),
        )
    )
    add(
        Idea(
            id="X-023",
            pillar="meme",
            title="TfL delay board",
            hook="Wi-Fi delayed due to signalling problems in the cupboard.",
            copy=(
                "Wi-Fi delayed due to signalling problems in the cupboard under the stairs.\n\n"
                "Replacement bus service: 4G from your phone, if you stand by the window and believe.\n\n"
                "Mind the packet gap."
            ),
            alt_copy="This is your captain speaking. We are currently held at the cabinet.",
            cta=f"{home}",
            url_key="home",
            engagement="Write the delay reason for your line. 'Leaves on the copper' is already taken.",
            hashtags=["#TfL", "#BritishProblems"],
            platforms=["instagram", "x", "tiktok"],
            formats=["feed", "story", "reel", "tweet", "tiktok"],
            why="Every Londoner, and every Brit who has stared at a departure board, gets it immediately.",
            compliance="Pastiche the board. Don't copy TfL's roundel.",
            design=DesignBrief(
                format_name="Station information board",
                dimensions="1080x1920",
                duration="0:08",
                visual_concept="Dot-matrix board: WIFI  delayed  84 min. Reason: CUPBOARD. A tiny wifi mark as the operator.",
                on_screen_text=["WIFI", "Delayed", "Signalling problems in the cupboard"],
                palette="Departure-board orange on black, sky-blue end card.",
                type="Dot matrix / LED.",
                logo="As the 'operator' code BBP.",
                audio="Platform beep.",
                shots=["Board flicker", "end"],
                do_not=["Don't use the TfL roundel or Johnston type commercially if you're running ads — organic pastiche, original type"],
            ),
        )
    )
    add(
        Idea(
            id="X-024",
            pillar="useful-funny",
            title="Things faster than your broadband",
            hook="Things that are currently faster than your broadband.",
            copy=(
                "Things currently faster than your broadband:\n"
                "• a queue at Greggs\n"
                "• a Southern Rail apology\n"
                "• your nan's gossip\n"
                "• the kettle\n"
                "• the government changing its mind\n\n"
                "If this hurt, it was supposed to. Speed-test it. Then compare it."
            ),
            alt_copy="A ranked list of national disappointments, with your ISP in the medals.",
            cta=f"{speed}",
            url_key="speed_test",
            engagement="Add one. Clean, please. This is a family comparison site with a filthy sense of timing.",
            hashtags=["#BritishProblems"],
            platforms=["x", "instagram", "tiktok"],
            formats=["tweet", "reel", "tiktok", "carousel"],
            why="Listicle + roast = reply magnet. Each reply is a free extra joke.",
            compliance="Hyperbole. Don't present as a measured benchmark.",
            design=DesignBrief(
                format_name="Olympic medal table",
                dimensions="1080x1350",
                duration="0:12",
                visual_concept="Medal table. Gold: Nan's gossip. Silver: kettle. Bronze: your download speed, looking ashamed.",
                on_screen_text=["MEDAL TABLE", "household events"],
                palette=standard_palette(),
                type="Sports graphic.",
                logo=logo_rule(),
                audio="BBC sport ident pastiche (original, not the real ident).",
                shots=["Table fills in", "speed-test CTA"],
                do_not=["Don't use BBC branding"],
            ),
        )
    )
    add(
        Idea(
            id="X-025",
            pillar="b2b",
            title="Providers: we will list you anyway",
            hook="We will list your broadband even if you never pay us a penny.",
            copy=(
                "BroadbandPicker lists UK providers whether or not we have an affiliate deal.\n\n"
                "If we earn a commission when someone switches, we say so.\n"
                "If we don't, we still show the package, because hiding the market is how comparison sites get a reputation.\n\n"
                f"Partnerships: {brand.emails['partnerships']}\n"
                f"How we make money: {brand.key_urls['home']}/how-we-make-money"
            ),
            alt_copy="Editorial independence is not a vibe. It is a page on the website.",
            cta=f"Affiliate and provider enquiries: {brand.emails['partnerships']}",
            url_key="partnerships_mail",
            engagement="If you run an ISP or an affiliate programme, the DMs are open. If you run a comparison site that hides this, sit down.",
            hashtags=["#AffiliateMarketing", "#UKBroadband"],
            platforms=["linkedin", "x"],
            formats=["tweet", "linkedin"],
            why="This is the post that gets BroadbandPicker onto provider radars. Serious, still a bit dry.",
            compliance="Must match /how-we-make-money. No 'guaranteed placements'. No fake traffic numbers.",
            design=DesignBrief(
                format_name="LinkedIn document post",
                dimensions="1920x1080 document, 3 pages",
                duration="static",
                visual_concept="Clean navy pages: 1) we list you anyway 2) methodology 3) contact. Looks like a mini media kit.",
                on_screen_text=["We list providers with or without an affiliate deal", brand.emails["partnerships"]],
                palette=f"Navy {BRAND_NAVY}, sky {BRAND_PRIMARY}, white.",
                type="Inter only. B2B, not meme.",
                logo="Header on every page.",
                audio="N/A",
                shots=["3-page carousel"],
                do_not=["Don't use sarcasm so hard that a partnerships manager thinks you're unserious"],
            ),
        )
    )
    add(
        Idea(
            id="X-026",
            pillar="meme",
            title="2am vs 7pm speed test",
            hook="Speed test at 2am vs speed test at 7pm.",
            copy=(
                "Speed test at 2am: I am a god.\n"
                "Speed test at 7pm: I am in a group project with the entire cul-de-sac.\n\n"
                "Contention is just British for 'everyone else had the same idea'."
            ),
            alt_copy="Your neighbourhood, buffering in unison. Community, if you squint.",
            cta=f"Test it twice. Then come back: {speed}",
            url_key="speed_test",
            engagement="Post both numbers. 2am and 7pm. We'll nominate a street for a blue plaque.",
            hashtags=["#SpeedTest"],
            platforms=["tiktok", "instagram", "x"],
            formats=["tiktok", "reel", "tweet", "story"],
            why="Participatory. People love posting their numbers. User-generated content without asking for it.",
            compliance="Remind people results vary. Don't diagnose a named network from one screenshot.",
            design=DesignBrief(
                format_name="Before / after speed-test UI",
                dimensions="1080x1920",
                duration="0:08",
                visual_concept="Two phones. Nightstand 2am: huge number. Sofa 7pm: a number that wants to go home.",
                on_screen_text=["02:00", "19:00", "same house, different country"],
                palette=standard_palette(),
                type="App UI + Inter captions.",
                logo=logo_rule(),
                audio="Whoosh from night to evening TV.",
                shots=["2am", "smash cut 7pm", "CTA to our speed test"],
                do_not=["Don't fake a provider's official speed-test result page"],
            ),
        )
    )
    add(
        Idea(
            id="X-027",
            pillar="quote",
            title="Hell is other people's Netflix",
            hook="Hell is other people's Netflix on your connection.",
            copy=(
                "“Hell is other people's Netflix.”\n"
                "— Sartre, on a TalkTalk 40/10, 2013, probably.\n\n"
                "If you can hear your partner's streaming from the ping of your spreadsheet, it is time."
            ),
            alt_copy="L'enfer, c'est les autres onglets.",
            cta=f"{brand.key_urls['guides']}/best-broadband-for-streaming",
            url_key="guides",
            engagement="Who is the Netflix in your relationship? Tag them. Then hide.",
            hashtags=["#Streaming"],
            platforms=["x", "instagram"],
            formats=["tweet", "feed", "story"],
            why="Couple-tag bait. Quote cards get saved.",
            compliance="Parody attribution. No real provider performance claim.",
            design=DesignBrief(
                format_name="Penguin Classics pastiche",
                dimensions="1080x1350",
                duration="static",
                visual_concept="Orange-spine book cover: HELL IS OTHER PEOPLE'S NETFLIX. Author: your ping.",
                on_screen_text=["HELL IS OTHER PEOPLE'S NETFLIX"],
                palette="Penguin orange, navy, cream.",
                type="A literary grotesque. Not the real Penguin lockup.",
                logo="Tiny.",
                audio="N/A",
                shots=["Cover"],
                do_not=["Don't copy Penguin's colophon"],
            ),
        )
    )
    add(
        Idea(
            id="X-028",
            pillar="british-life",
            title="Moving house broadband",
            hook="Moving house is two crises in a trench coat. One of them is broadband.",
            copy=(
                "Moving house checklist:\n"
                "• boxes\n"
                "• kettle first\n"
                "• argue about the sofa\n"
                "• discover the new place 'has fibre' in the same way it 'has storage'\n\n"
                "Start the broadband before you start the argument. One of these is reversible."
            ),
            alt_copy="You can live without a sofa. You cannot live without moaning about the Wi-Fi.",
            cta=f"Moving-house broadband, in order: {brand.key_urls['guides']}/broadband-moving-house",
            url_key="guides",
            engagement="What's the first thing you set up in a new place: kettle, Wi-Fi, or the telly? There is a wrong answer.",
            hashtags=["#MovingHouse"],
            platforms=["instagram", "x", "tiktok", "facebook"],
            formats=["carousel", "reel", "tweet", "tiktok", "story"],
            why="High commercial intent dressed as a sitcom. Peak May–September, still works year-round.",
            compliance="Setup times vary. Don't promise 'online the day you move' as a universal fact.",
            design=DesignBrief(
                format_name="Checklist on a cardboard box",
                dimensions="1080x1350",
                duration="static + 0:12",
                visual_concept="Sharpie on a moving box. Last item, circled: ACTUALLY CHECK THE POSTCODE.",
                on_screen_text=["Kettle", "Wi-Fi", "Sofa (optional)"],
                palette="Cardboard, navy sharpie, sky circle.",
                type="Handwritten then Inter CTA.",
                logo="Tape-style end card.",
                audio="Packing tape.",
                shots=["Box", "circle the postcode line", "CTA"],
                do_not=["Don't show a real new address"],
            ),
        )
    )
    add(
        Idea(
            id="X-029",
            pillar="sarcasm",
            title="Chatbot of Theseus",
            hook="I asked the ISP chatbot if I could leave. It asked if I'd tried restarting myself.",
            copy=(
                "Me: I'd like to leave, the contract ended in March.\n"
                "Chatbot: I understand this must be frustrating. Have you tried restarting the router?\n"
                "Me: The router isn't the thing keeping me here. You are.\n"
                "Chatbot: I'm sorry you feel that way. Here's a link to our blog about cookies.\n\n"
                "One Touch Switch exists so you never have to finish this play."
            ),
            alt_copy="Customer service as interpretive dance.",
            cta=f"{switch}",
            url_key="switch",
            engagement="Paste the worst chatbot line you've been sent. We'll workshop a tragedy.",
            hashtags=["#CustomerService"],
            platforms=["x", "instagram", "tiktok"],
            formats=["tweet", "reel", "tiktok", "carousel"],
            why="Everyone has the screenshot. User-generated follow-up content is almost guaranteed.",
            compliance="Fictional composite. Don't reproduce a real private chat with account data.",
            design=DesignBrief(
                format_name="Chat UI sketch",
                dimensions="1080x1920",
                duration="0:14",
                visual_concept="Generic chat bubbles. The bot remains cheerfully useless. A 'human' button that is greyed out until 2029.",
                on_screen_text=["Have you tried restarting yourself?"],
                palette="Chat greys, navy end.",
                type="UI type.",
                logo=logo_rule(),
                audio="Hold music under the captions.",
                shots=["Messages ping in", "end card One Touch Switch"],
                do_not=["Don't use a real ISP's chatbot skin"],
            ),
        )
    )
    add(
        Idea(
            id="X-030",
            pillar="pun",
            title="Broad band",
            hook="It's called broadband because the bills are.",
            copy=(
                "It's called broadband because the bills are.\n\n"
                "Narrow money. Broad cheek.\n"
                "If your tariff no longer fits, that's not a glow-up. That's month 19."
            ),
            alt_copy="Broad band, tight budget, classic Britain.",
            cta=f"{brand.key_urls['calculator']}",
            url_key="calculator",
            engagement="Rate this pun 1–10. 1 is 'leave the country'. 10 is 'put it on a tea towel'.",
            hashtags=["#DadJokes", "#UKBills"],
            platforms=["x", "instagram"],
            formats=["tweet", "story", "feed"],
            why="Dad-joke posts get tagged at dads. Cheap, cheerful, on-brand if you wink at the camera.",
            compliance="None special.",
            design=DesignBrief(
                format_name="Tea towel",
                dimensions="1080x1350",
                duration="static",
                visual_concept="Souvenir tea towel: It's called broadband because the bills are. Red, white, sky blue. Deeply sincere kitsch.",
                on_screen_text=["IT'S CALLED BROADBAND BECAUSE THE BILLS ARE"],
                palette="Kitsch Union-adjacent colours without using the flag as a prop if it feels shouty — navy/sky/white is enough.",
                type="Tea-towel serif.",
                logo="Woven in the corner.",
                audio="N/A",
                shots=["Product shot of a fake tea towel"],
                do_not=["Don't actually print it until trademarks and jokes are cleared"],
            ),
        )
    )
    add(
        Idea(
            id="X-031",
            pillar="useful-funny",
            title="Poll: who is the IT department",
            hook="Who is the IT department in your house?",
            copy=(
                "Who is the IT department in your house?\n\n"
                "A) The eldest child\n"
                "B) The person who pays the bill, bitterly\n"
                "C) A bloke called Steve who moved out in 2019\n"
                "D) The router. We do not question the router.\n\n"
                "Vote. Then tag the victim."
            ),
            alt_copy="Every British home has an unpaid sysadmin.",
            cta=f"{home}",
            url_key="home",
            engagement="This IS the engagement. Use native polls on X, IG Stories, TikTok stickers.",
            hashtags=["#BritishHomes"],
            platforms=["x", "instagram", "tiktok"],
            formats=["tweet", "story", "tiktok", "reel"],
            why="Polls are the cheapest viral mechanic. Tags do the distribution.",
            compliance="Fine.",
            design=DesignBrief(
                format_name="Native poll + still",
                dimensions="1080x1920 story, X native poll",
                duration="24h story, tweet lives",
                visual_concept="Four illustrated household saints. Steve has a halo of Ethernet.",
                on_screen_text=["WHO IS IT SUPPORT", "tag them"],
                palette=standard_palette(),
                type="Inter.",
                logo="Corner.",
                audio="Optional VO reading the options.",
                shots=["Question", "options", "sticker"],
                do_not=["Don't hide the poll under a 400-word caption"],
            ),
        )
    )
    add(
        Idea(
            id="X-032",
            pillar="british-life",
            title="Rural Yeti van",
            hook="The fibre van is the British Yeti.",
            copy=(
                "People in the village have seen the fibre van.\n"
                "A man in the pub drew a picture of it on a beer mat.\n"
                "The council newsletter said 'imminently' in 2018.\n\n"
                "If you're rural, 5G home and the honest conversation about not-spots is not a cop-out. It's a plan B with a sim."
            ),
            alt_copy="Not-spot Britain deserves better than another 'coming soon'.",
            cta=f"{brand.key_urls['guides']}/best-broadband-for-rural-areas-uk",
            url_key="guides",
            engagement="Rural lot: year you were first promised fibre, in the replies. We'll plot the grief.",
            hashtags=["#RuralBritain", "#NotSpot"],
            platforms=["x", "instagram"],
            formats=["tweet", "feed", "carousel"],
            why="Underserved audience, high gratitude, high share-to-parish-Facebook potential.",
            compliance="Don't pretend every rural postcode is hopeless. Point to 5G home / satellite / upcoming FTTP where true.",
            design=DesignBrief(
                format_name="Beer-mat cryptozoology",
                dimensions="1080x1080",
                duration="static",
                visual_concept="Pub table, beer mat sketch of a van labelled FIBRE. Like a cryptid sighting.",
                on_screen_text=["SIGHTING", "unconfirmed", "third pint"],
                palette="Pub wood, navy caption.",
                type="BiRo handwriting.",
                logo="Beer-mat corner.",
                audio="N/A",
                shots=["Table still"],
                do_not=["Don't mock rural users as backward — mock the promises"],
            ),
        )
    )
    add(
        Idea(
            id="X-033",
            pillar="meme",
            title="Expanding brain",
            hook="Expanding brain of British broadband.",
            copy=(
                "Restart the router.\n"
                "Shout at the ceiling.\n"
                "Stand on one leg by the window for 4G.\n"
                "Check the postcode and switch, like an adult.\n\n"
                "The last one feels illegal. It isn't. One Touch Switch is sitting there, unpaid, like a gym membership for your dignity."
            ),
            alt_copy="Personal growth, but for standing orders.",
            cta=f"{switch}",
            url_key="switch",
            engagement="Which level are you on. Be honest. The ceiling-shouters always lie.",
            hashtags=["#Memes"],
            platforms=["instagram", "tiktok", "x"],
            formats=["feed", "reel", "tiktok", "tweet"],
            why="Format does the teaching. Last panel is the product.",
            compliance="Switching is usually straightforward now; still mention early-termination fees if in contract.",
            design=DesignBrief(
                format_name="Expanding brain",
                dimensions="1080x1350",
                duration="static",
                visual_concept="Four-panel brain. Final panel is the BroadbandPicker postcode box glowing like the holy grail.",
                on_screen_text=["restart", "shout", "4G window", "switch like an adult"],
                palette="Meme-native, brand on last panel only.",
                type="Impact.",
                logo="Last panel UI.",
                audio="Galaxy brain sting for Reels.",
                shots=["Panels stack", "end"],
                do_not=["Don't make the first three panels so funny that nobody reads the fourth"],
            ),
        )
    )
    add(
        Idea(
            id="X-034",
            pillar="b2b",
            title="Awin-ready publisher energy",
            hook="Comparison sites that only shout 'CHEAPEST DEAL' are why advertisers invented brand guidelines.",
            copy=(
                "BroadbandPicker is being built as a proper UK publisher:\n"
                "independent rankings, public methodology, honest 'how we make money',\n"
                f"and {len(brand.providers) or 12}+ providers on the record.\n\n"
                "If you run a broadband affiliate programme and you want a partner that will still mention the ugly out-of-contract price, you know where we are."
            ),
            alt_copy="We will not give you 5 stars because the cookie is tasty.",
            cta=f"{brand.emails['partnerships']} · {SITE}/how-we-review-broadband",
            url_key="partnerships_mail",
            engagement="Partnerships teams: what does a good publisher look like to you? We'll do that, then the jokes.",
            hashtags=["#Awin", "#Affiliate"],
            platforms=["linkedin", "x"],
            formats=["linkedin", "tweet"],
            why="Directly serves the 'get providers to approach us' goal.",
            compliance="No fake traffic. No 'official partner of' until you are.",
            design=DesignBrief(
                format_name="Media-kit still",
                dimensions="1200x627 LinkedIn",
                duration="static",
                visual_concept="Simple stat tiles from the workspace: provider count, guide count, trust pages live.",
                on_screen_text=["Independent comparison", "Affiliate-honest", "Built for UK broadband"],
                palette=f"Navy {BRAND_NAVY} + sky {BRAND_PRIMARY}.",
                type="Inter ExtraBold.",
                logo="Top-left.",
                audio="N/A",
                shots=["One still"],
                do_not=["Don't put meme Impact font on LinkedIn"],
            ),
        )
    )
    add(
        Idea(
            id="X-035",
            pillar="useful-funny",
            title="Black Friday is not a personality",
            hook="Black Friday broadband is just a sale on the same copper with a louder email.",
            copy=(
                "Black Friday broadband is just a sale on the same copper with a louder email.\n\n"
                "If the postcode doesn't get the network, 40% off nothing is still nothing.\n"
                "We'll track the deals that are actually deals. The rest can fight in your spam folder."
            ),
            alt_copy="Cyber Monday, but make it an 18-month contract. Romantic.",
            cta=f"{brand.key_urls['guides']}/black-friday-broadband-deals-uk",
            url_key="guides",
            engagement="What was last year's 'deal' that turned into a pumpkin in month 13?",
            hashtags=["#BlackFriday"],
            platforms=["x", "instagram", "tiktok"],
            formats=["tweet", "reel", "tiktok", "carousel", "story"],
            why="Seasonal search spike. Funny scepticism builds more trust than screaming SALE.",
            compliance="Date the prices. Don't advertise a specific saving unless verified that day.",
            design=DesignBrief(
                format_name="Red-slash sale parody",
                dimensions="1080x1920",
                duration="0:10",
                visual_concept="Screaming red SALE graphics that peel off to reveal a boring navy fact about postcodes.",
                on_screen_text=["40% OFF", "the same cabinet", "check the postcode"],
                palette="Sale red then brand navy — the point is the peel.",
                type="Shouty then Inter.",
                logo=logo_rule(),
                audio="Shop tannoy that becomes a kettle.",
                shots=["SALE", "peel", "postcode"],
                do_not=["Don't run unverified 'from £x' in the caption"],
            ),
        )
    )
    add(
        Idea(
            id="X-036",
            pillar="quote",
            title="To switch or not to switch",
            hook="To switch, or not to switch.",
            copy=(
                "To switch, or not to switch — that is the question.\n"
                "(It's to switch, Derek. You're out of contract and they're charging you like you personally laid the fibre.)\n\n"
                "Whether 'tis nobler on the sofa to suffer the slings and arrows of outrageous ping…"
            ),
            alt_copy="Shakespeare, if Shakespeare had Virgin Media and a deadline.",
            cta=f"{deals}",
            url_key="deals",
            engagement="Finish the soliloquy. Best iambic pentameter about a hub gets immortalised in a Story.",
            hashtags=["#Shakespeare", "#UKBroadband"],
            platforms=["x", "instagram"],
            formats=["tweet", "feed", "story"],
            why="Quote-remix pillar in its purest form. Attracts the 'actually' crowd, who share loudly.",
            compliance="Obvious parody.",
            design=DesignBrief(
                format_name="Folio page",
                dimensions="1080x1350",
                duration="static",
                visual_concept="Fake First Folio page. Stage direction: Enter ROUTER, blinking. Derek, on the sofa, pays £41.",
                on_screen_text=["To switch, or not to switch", "Enter ROUTER"],
                palette="Aged paper, blackletter-ish (readable), sky stage directions.",
                type="A readable old-style serif, not unreadable blackletter.",
                logo="Printer's mark wifi icon.",
                audio="Optional lute that becomes buffering.",
                shots=["Page"],
                do_not=["Don't make it so 'designy' that nobody reads Derek"],
            ),
        )
    )
    add(
        Idea(
            id="X-037",
            pillar="useful-funny",
            title="Cheapest is a postcode",
            hook="There is no cheapest broadband in the UK. There is cheapest at your door.",
            copy=(
                "There is no 'cheapest broadband in the UK'.\n\n"
                "There is cheapest at your door.\n"
                "Your neighbour can get an altnet for a song. You can get a copper line and a pep talk.\n\n"
                "Any site still shouting a national 'from £19' without a postcode is doing weather forecasts with a crystal ball."
            ),
            alt_copy="National 'from £x' is fan fiction. The postcode is the plot.",
            cta=f"Stop guessing. {home}",
            url_key="home",
            engagement="Drop your area (not your full address). We'll tell you if the 'from £19' was even talking to you.",
            hashtags=["#UKBroadband"],
            platforms=["instagram", "x", "tiktok", "facebook", "youtube"],
            formats=["carousel", "reel", "tweet", "tiktok", "feed"],
            why="This is the commercial engine of the site. Teaches the one fact that makes comparison honest.",
            compliance="Never put a national from-price in the graphic. Always 'varies by postcode'.",
            design=DesignBrief(
                format_name="UK map, two doors",
                dimensions="1080x1350 carousel, 5 slides",
                duration="static + 0:12 Reel",
                visual_concept=(
                    "Minimal navy map of the UK made of dots, like the site hero-network. Two neighbouring "
                    "dots: one glowing sky-blue '£21 full fibre', one dim '£38 copper'. Huge type, lots of air."
                ),
                on_screen_text=["There is no cheapest in the UK", "There is cheapest at your door", "Check the postcode"],
                palette=standard_palette(),
                type="Inter ExtraBold. This should look like the website grew a spine.",
                logo="Last slide, centred, with URL.",
                audio="Quiet. One line VO.",
                shots=["Map", "two dots", "postcode CTA"],
                do_not=["Don't invent a national from-price", "Don't use a real OS map copyright dump"],
            ),
        )
    )
    add(
        Idea(
            id="X-038",
            pillar="sarcasm",
            title="TV bundle trench coat",
            hook="Broadband and TV bundles are two products in a trench coat.",
            copy=(
                "Broadband and TV bundles are two products in a trench coat trying to get into a nightclub.\n\n"
                "Sometimes that's cheaper. Sometimes you just wanted the line and now you own three sports channels "
                "and a box you unplug at Christmas.\n\n"
                "Unbundle the joke before you unbundle the contract."
            ),
            alt_copy="You came for 150 Mbps and left with a remote you don't understand.",
            cta=f"Broadband-only vs the trench coat: {brand.key_urls['guides']}/best-broadband-and-tv-deals",
            url_key="guides",
            engagement="Reply 📺 if you only wanted the internet. Reply 🏈 if the sport is the whole point.",
            hashtags=["#BroadbandAndTV"],
            platforms=["facebook", "instagram", "x", "tiktok"],
            formats=["feed", "reel", "tweet", "story"],
            why="Bundle shoppers are older bill-payers — Facebook gold — and the joke still works on Reels.",
            compliance="Don't claim bundles are always worse. Say 'sometimes'. Link the guide.",
            design=DesignBrief(
                format_name="Trench-coat duo",
                dimensions="1080x1350",
                duration="static + 0:08",
                visual_concept=(
                    "Two geometric figures in one navy trench coat: a router and a tiny TV. "
                    "Editorial illustration, no faces, lots of paper-coloured negative space."
                ),
                on_screen_text=["Two products.", "One trench coat.", "Check you wanted both."],
                palette=standard_palette(),
                type="Inter ExtraBold.",
                logo=logo_rule(),
                audio="Nightclub 'not tonight lads'.",
                shots=["Coat", "reveal router + TV", "end"],
                do_not=["Don't use Sky or Virgin logos on the coat"],
            ),
        )
    )
    add(
        Idea(
            id="X-039",
            pillar="pun",
            title="Ping, not the personality Mbps",
            hook="Gamers don't need a gigabit. They need the lag to leave the building.",
            copy=(
                "Gamers don't need a gigabit.\n"
                "They need the lag to leave the building.\n\n"
                "Download speed is what you brag about.\n"
                "Ping is what you swear at.\n"
                "Upload is why your stream looks like a painting of a potato.\n\n"
                "If the household is FIFA plus Discord plus a parent on Zoom, that's not 'unlimited'. That's diplomacy."
            ),
            alt_copy="Gigabit is a bumper sticker. Ping is the game.",
            cta=f"Gaming broadband, minus the RGB tax: {brand.key_urls['guides']}/best-broadband-for-gaming-uk",
            url_key="guides",
            engagement="Comment your ping. We'll tell you if it's a skill issue or a copper issue.",
            hashtags=["#Gaming", "#Ping"],
            platforms=["tiktok", "instagram", "youtube", "x"],
            formats=["tiktok", "reel", "tweet"],
            why="High-intent niche. Parents get tagged. YouTube search for 'best broadband for gaming'.",
            compliance="Ranges not fake precision. Don't name a provider's ping as a fact without a source.",
            design=DesignBrief(
                format_name="Scoreboard vs brag",
                dimensions="1080x1920",
                duration="0:10",
                visual_concept="Split frame. Left: huge vanity '900 Mbps' in faded grey. Right: tiny 'ping 84ms' in sky blue, winning. Minimal, no game footage.",
                on_screen_text=["Gigabit is a bumper sticker", "Ping is the game"],
                palette=standard_palette(),
                type="Scoreboard grotesque + Inter.",
                logo=logo_rule(),
                audio="Controller click then silence.",
                shots=["Vanity number", "ping sting", "end"],
                do_not=["Don't use Premier League, Xbox or PlayStation marks"],
            ),
        )
    )
    add(
        Idea(
            id="X-040",
            pillar="sarcasm",
            title="Existing customer rewards",
            hook="Existing customer broadband: the reward is getting to keep paying more.",
            copy=(
                "Existing-customer 'rewards':\n"
                "• a magazine nobody asked for\n"
                "• a 'loyalty' speed boost that is the speed you were already paying for\n"
                "• the privilege of not being the new-customer price\n\n"
                "If they wanted you to stay, they'd charge you what they charge the stranger."
            ),
            alt_copy="The retention team is just sales, but sadder.",
            cta=f"What existing-customer deals actually look like: {brand.key_urls['guides']}/broadband-for-existing-customers",
            url_key="guides",
            engagement="Have you ever called up and been 'upgraded' to the thing you already had? Tell us. We'll bring biscuits.",
            hashtags=["#LoyaltyTax"],
            platforms=["x", "instagram", "facebook", "tiktok"],
            formats=["tweet", "feed", "reel", "story"],
            why="Pairs with X-001. Retention-call stories are user-generated content.",
            compliance="Industry pattern, not a named provider's current retention script.",
            design=DesignBrief(
                format_name="Loyalty card parody",
                dimensions="1080x1350",
                duration="static",
                visual_concept="A plush navy loyalty card. Stamps: 8 years. Reward: '£22 extra a month'. Soft shadow, lots of margin, foil-ish sky type.",
                on_screen_text=["LOYALTY CARD", "Reward: paying more", "New customers skip the queue"],
                palette=standard_palette(),
                type="Refined grotesque, letter-spaced like a members' club.",
                logo="Tiny mark as the hologram.",
                audio="N/A",
                shots=["Card still"],
                do_not=["Don't fake a real ISP's loyalty scheme name"],
            ),
        )
    )
    add(
        Idea(
            id="X-041",
            pillar="british-life",
            title="Ombudsman after the chatbot",
            hook="When the chatbot becomes a court case.",
            copy=(
                "Escalation path of a British broadband complaint:\n"
                "1. Restart the router\n"
                "2. Restart yourself\n"
                "3. Chatbot offers a blog about cookies\n"
                "4. Eight-hour phone queue that plays Vivaldi as a threat\n"
                "5. Ombudsman\n\n"
                "You should not need a tribunal to get 30 Mbps. Here is when you actually do."
            ),
            alt_copy="Know your rights. Then mock the journey that made you learn them.",
            cta=f"{brand.key_urls['guides']}/broadband-complaints-and-ombudsman-uk",
            url_key="guides",
            engagement="What stage are you at. Be honest. Stage 2 is a lifestyle.",
            hashtags=["#Ombudsman", "#UKRights"],
            platforms=["x", "instagram", "facebook"],
            formats=["carousel", "tweet", "feed"],
            why="Useful-funny rights content. Makes the brand look like a publisher, which Awin and ISPs notice.",
            compliance="Don't promise a win. Explain the process. Link the guide.",
            design=DesignBrief(
                format_name="Five-step funeral programme",
                dimensions="1080x1350, 6 slides",
                duration="static",
                visual_concept="Calm navy slides, one step each, huge type. Last slide is the ombudsman URL. No clown on this one until slide 1's smirk.",
                on_screen_text=["Restart the router", "Restart yourself", "Then know your rights"],
                palette=standard_palette(),
                type="Inter ExtraBold.",
                logo="Every slide, small.",
                audio="N/A",
                shots=["6 slides"],
                do_not=["Don't give legal advice beyond 'here is the official path'"],
            ),
        )
    )
    add(
        Idea(
            id="X-042",
            pillar="useful-funny",
            title="5G home is a plan B with a sim",
            hook="If the fibre van is a cryptid, 5G home is a very boring miracle.",
            copy=(
                "Rural Britain: you can wait for the fibre van, or you can put a sim in a box and get on with your life.\n\n"
                "5G home isn't romance. It's a plan B that works in more places than the poster admits, and fewer than the advert claims.\n\n"
                "Check the postcode. Then check the signal. In that order."
            ),
            alt_copy="Starlink is a subplot. 5G home is a Tuesday.",
            cta=f"{brand.key_urls['guides']}/best-5g-home-broadband-uk",
            url_key="guides",
            engagement="Rural lot: fibre, 4G, 5G home, or 'I have become the aerial'. Vote.",
            hashtags=["#RuralBritain", "#5GHome"],
            platforms=["facebook", "x", "instagram"],
            formats=["carousel", "tweet", "feed"],
            why="Underserved audience, high trust if you're honest about limits.",
            compliance="Coverage is address and even window-level. Never '5G home everywhere'.",
            design=DesignBrief(
                format_name="Two routes sign",
                dimensions="1080x1350",
                duration="static",
                visual_concept="A quiet country-road signpost: LEFT 'fibre, est. any parliament now'. RIGHT '5G home, today, maybe'. Minimal, dusk navy, one sky cap.",
                on_screen_text=["Plan A: the van", "Plan B: the sim", "Check both"],
                palette=standard_palette(),
                type="Highways-adjacent grotesque, slightly too tasteful.",
                logo="Bar at the bottom.",
                audio="N/A",
                shots=["Signpost"],
                do_not=["Don't mock rural users", "Don't promise nationwide 5G home"],
            ),
        )
    )
    add(
        Idea(
            id="X-043",
            pillar="pun",
            title="Mesh is a plaster",
            hook="Mesh Wi-Fi is a plaster. Sometimes the wound is the copper.",
            copy=(
                "Mesh Wi-Fi is a plaster.\n"
                "Sometimes you need a plaster.\n"
                "Sometimes the wound is the copper in the road and you are putting £180 of white pebbles on a 12 Mbps line.\n\n"
                "Move the router out of the cupboard first. Then spend the money."
            ),
            alt_copy="Before you buy the mesh, evict the coats from the router.",
            cta=f"{brand.key_urls['guides']}/best-mesh-wifi-for-your-broadband-router",
            url_key="guides",
            engagement="This or that: cupboard router, or mesh pebbles you still haven't set up.",
            hashtags=["#MeshWiFi"],
            platforms=["instagram", "tiktok", "x", "youtube"],
            formats=["carousel", "reel", "tiktok", "tweet"],
            why="Saves people money. Positions BroadbandPicker as the adult, not a gadget hype account.",
            compliance="Mesh does help large homes. Don't say it's always a waste.",
            design=DesignBrief(
                format_name="Plaster on a cabinet",
                dimensions="1080x1350",
                duration="static + 0:09",
                visual_concept="A single pale plaster on a navy Openreach-ish cabinet, huge paper margin. Caption small and sharp.",
                on_screen_text=["Mesh is a plaster", "Sometimes the wound is the copper"],
                palette=standard_palette(),
                type="Inter ExtraBold.",
                logo=logo_rule(),
                audio="Peel of a plaster.",
                shots=["Cabinet", "plaster", "end"],
                do_not=["Don't use a real mesh-brand logo"],
            ),
        )
    )
    add(
        Idea(
            id="X-044",
            pillar="sarcasm",
            title="Cashback is a bribe",
            hook="Broadband cashback is a bribe you pay back in month 13.",
            copy=(
                "£100 cashback on broadband.\n"
                "Lovely.\n"
                "Now read month 13.\n\n"
                "It's not a gift. It's a retention scheme with better PR.\n"
                "Always do the 18-month maths, including the 'gift'."
            ),
            alt_copy="Cashback is just the price, badly disguised.",
            cta=f"{brand.key_urls['guides']}/broadband-deals-with-cashback · or the calculator {brand.key_urls['calculator']}",
            url_key="calculator",
            engagement="Quote with a cashback deal you fell for. We'll do the maths in the replies, gently.",
            hashtags=["#Cashback"],
            platforms=["instagram", "x", "facebook", "tiktok"],
            formats=["carousel", "tweet", "reel", "feed"],
            why="Black Friday adjacent. Teaches the cost calculator without saying 'cost calculator'.",
            compliance="Date any example. Don't invent a current cashback figure.",
            design=DesignBrief(
                format_name="Gift box, invoice inside",
                dimensions="1080x1350",
                duration="static",
                visual_concept="A tasteful navy gift box with a sky ribbon. Lid open: an invoice. Plush product photography lighting, still illustrated, no stock hands.",
                on_screen_text=["£100 cashback", "Month 13 would like a word"],
                palette=standard_palette(),
                type="Inter ExtraBold.",
                logo=logo_rule(),
                audio="N/A",
                shots=["Box", "invoice"],
                do_not=["Don't use a real bank or ISP cashback creative"],
            ),
        )
    )
    add(
        Idea(
            id="X-045",
            pillar="pun",
            title="Rolling monthly commitment issues",
            hook="Rolling monthly broadband: commitment issues, correctly diagnosed.",
            copy=(
                "24-month contract: marriage.\n"
                "Rolling monthly: dating, with a router.\n\n"
                "You pay a bit more for the right to leave when they get weird in April.\n"
                "For renters, students, and anyone who has met a British landlord, this is not flakiness. This is strategy."
            ),
            alt_copy="Stay if you like them. Don't sign in blood for a plastic box.",
            cta=f"{brand.key_urls['guides']}/best-rolling-monthly-broadband-deals",
            url_key="guides",
            engagement="Contract or rolling: vote. Then tag the person who still has 14 months left and a moving van booked.",
            hashtags=["#Renters"],
            platforms=["instagram", "tiktok", "x", "facebook"],
            formats=["reel", "tiktok", "tweet", "story"],
            why="Renters and students. High share rate. Commercial page exists.",
            compliance="Rolling is often more expensive. Say so.",
            design=DesignBrief(
                format_name="Dating-app card for a router",
                dimensions="1080x1920",
                duration="0:08",
                visual_concept="A plush dating-profile card: photo is a minimal router illustration. Bio: 'rolling monthly. hates April. lives in the cupboard for now.'",
                on_screen_text=["Rolling monthly", "commitment issues, correctly diagnosed"],
                palette=standard_palette(),
                type="App UI grotesque then Inter.",
                logo=logo_rule(),
                audio="Swipe sound.",
                shots=["Card", "swipe", "end"],
                do_not=["Don't copy Tinder's wordmark"],
            ),
        )
    )
    add(
        Idea(
            id="X-046",
            pillar="b2b",
            title="70 percent have never heard of it",
            hook="Ofcom: 70% of eligible households have never heard of social tariffs.",
            copy=(
                "Ofcom's 2025/26 pricing work: more than 30 social tariffs now exist, from around £12.50 a month.\n"
                "532,000 households were on one in June 2025.\n"
                "70% of eligible households still didn't know they existed in October 2025. Take-up is under 9%.\n\n"
                "That is not a marketing footnote. That is the UK's least-advertised discount.\n\n"
                "BroadbandPicker publishes a plain-English explainer and will keep listing these even when they pay us nothing.\n\n"
                f"Guide: {social}\n"
                f"Partnerships: {brand.emails['partnerships']}"
            ),
            alt_copy="A comparison site that won't bury the cheapest legal price is a better affiliate partner, not a worse one.",
            cta=f"{social} · {brand.emails['partnerships']}",
            url_key="social_tariffs",
            engagement="ISP partnerships teams: if your social tariff is in a PDF and not in the comparison, that is the problem.",
            hashtags=["#Ofcom", "#SocialTariff"],
            platforms=["linkedin", "x"],
            formats=["linkedin", "tweet"],
            why="Editorial spine that affiliate managers can screenshot. Shows we are a publisher, not a voucher clipper.",
            compliance="Cite Ofcom, don't round into fiction. Eligibility is specific.",
            design=DesignBrief(
                format_name="LinkedIn stat tiles",
                dimensions="1200x627 and 1080x1080",
                duration="static",
                visual_concept="Three plush navy tiles: 30+ tariffs / 70% unaware / we still list them. Inter ExtraBold, sky hairline rules, no stock handshake.",
                on_screen_text=["70% of eligible households haven't heard of social tariffs", "We publish them anyway"],
                palette=f"Navy {BRAND_NAVY}, sky {BRAND_PRIMARY}, white. No meme fonts.",
                type="Inter ExtraBold only.",
                logo="Top-left, small.",
                audio="N/A",
                shots=["One still + document carousel"],
                do_not=["Don't punch down", "Don't fake an Ofcom lockup"],
            ),
        )
    )
    add(
        Idea(
            id="X-047",
            pillar="b2b",
            title="Two million switches later",
            hook="One Touch Switch has done over two million residential switches. Comparison copy that still says 'phone to cancel' is a time capsule.",
            copy=(
                "One Touch Switch went live on 12 September 2024. Ofcom says more than two million residential switches have completed since.\n\n"
                "If your comparison journey still treats switching as a 2012 phone call, you are describing a country that no longer exists.\n\n"
                "BroadbandPicker's switch guides start from OTS, not from nostalgia.\n"
                "Providers who want that traffic to land on accurate, current pages know where we are."
            ),
            alt_copy="A publisher that updates switching advice when the regulator does. Novel, apparently.",
            cta=f"{switch} · {brand.emails['partnerships']}",
            url_key="switch",
            engagement="Affiliate managers: send us your 2026 brand guidelines. We'll tell you if our switch pages already match them.",
            hashtags=["#OneTouchSwitch", "#UKTelecoms"],
            platforms=["linkedin", "x"],
            formats=["linkedin", "tweet"],
            why="Shows market literacy. This is the post a Sky/BT/Virgin affiliate manager forwards internally.",
            compliance="OTS is designed to keep you online; don't promise zero downtime as a universal fact.",
            design=DesignBrief(
                format_name="Quiet milestone",
                dimensions="1200x627",
                duration="static",
                visual_concept="Giant '2m+' in white on navy, small caption underneath. One sky arc from the logo language. Nothing else.",
                on_screen_text=["2 million+ residential switches", "One Touch Switch is not a rumour"],
                palette=f"Navy {BRAND_NAVY}, white, sky {BRAND_PRIMARY} hairline.",
                type="Inter ExtraBold.",
                logo="Bottom-left.",
                audio="N/A",
                shots=["One still"],
                do_not=["Don't use an official TOTSCo or Ofcom lockup"],
            ),
        )
    )
    add(
        Idea(
            id="X-048",
            pillar="useful-funny",
            title="Switch in 60 seconds",
            hook="How to switch broadband in 2026. It is annoyingly straightforward now.",
            copy=(
                "How to switch broadband in 2026:\n"
                "1. Check the postcode. Not the advert.\n"
                "2. If you're in contract, do the exit-fee maths.\n"
                "3. Pick the new deal.\n"
                "4. The new provider handles the rest. That is One Touch Switch.\n"
                "5. Do not phone the old lot 'to be polite'. They will try to keep you.\n\n"
                "Britain accidentally made something simple. Use it before they notice."
            ),
            alt_copy="The how-to that used to be a novella is now a caption.",
            cta=f"{switch}",
            url_key="switch",
            engagement="Duet your parents trying to cancel. Then show them this. Gently.",
            hashtags=["#OneTouchSwitch"],
            platforms=["youtube", "tiktok", "instagram", "facebook"],
            formats=["youtube", "tiktok", "reel", "carousel"],
            why="YouTube search intent. Also a Short. Highest-utility video in the bank.",
            compliance="Mention early-termination fees. Don't promise same-day.",
            design=DesignBrief(
                format_name="Five-card how-to",
                dimensions="1080x1920 cover + 1920x1080 YouTube thumbnail",
                duration="0:45–1:00",
                visual_concept="Five oversized navy cards, one step each, sky number. Thumbnail: 'It is annoyingly easy now' on navy, wifi-mark, no shocked face.",
                on_screen_text=["1. Postcode", "2. Fees", "3. Pick", "4. They switch you", "5. Don't phone the old lot"],
                palette=standard_palette(),
                type="Inter ExtraBold.",
                logo="End card + thumbnail corner.",
                audio="Dry VO, no royalty-free ukulele.",
                shots=["Cards slap on", "end URL"],
                do_not=["Don't use a YouTube red-arrow 'shocked' thumbnail"],
            ),
        )
    )
    add(
        Idea(
            id="X-049",
            pillar="british-life",
            title="Parents, the bill went up",
            hook="Parents: if the broadband bill went up in April and nobody checked, this is the group chat.",
            copy=(
                "Parents, house-sharers, anyone who 'just pays it':\n\n"
                "If the direct debit went up in April and the only negotiation was a sigh, you are the business model.\n\n"
                "You can still look. You can still leave, depending on the contract. "
                "Forward this to the WhatsApp with the family in it. That's the whole campaign."
            ),
            alt_copy="The most British financial plan is hoping the standing order has a conscience.",
            cta=f"{rises}",
            url_key="price_rises",
            engagement="Tag the person who pays the bill. If it's you, tag yourself and have a sit down.",
            hashtags=["#CostOfLiving"],
            platforms=["facebook", "instagram", "whatsapp", "x"],
            formats=["feed", "story", "tweet"],
            why="Facebook and WhatsApp are how 40–65 Brits share bills content. Built to be forwarded.",
            compliance="Leaving depends on the contract. Don't say 'everyone can leave today'.",
            design=DesignBrief(
                format_name="Family WhatsApp pastiche",
                dimensions="1080x1350",
                duration="static",
                visual_concept="A tasteful, unbranded chat UI on paper background: 'the broadband went up again'. Reply: 'I'll look'. Grey ticks. Not WhatsApp's trademarked lockup — a generic chat.",
                on_screen_text=["The bill went up", "Nobody looked", "That's the business model"],
                palette=standard_palette(),
                type="UI grotesque.",
                logo="Footer.",
                audio="N/A",
                shots=["Chat still"],
                do_not=["Don't use the WhatsApp wordmark or logo if this is a paid ad"],
            ),
        )
    )
    add(
        Idea(
            id="X-050",
            pillar="b2b",
            title="Landlords, HMOs, and the one line everyone blames",
            hook="The Wi-Fi in a shared house is not a personality. It is infrastructure.",
            copy=(
                "If you let rooms, the broadband is now as non-optional as the kettle.\n\n"
                "One router in the hall, four tenants, three complaints, one review that mentions the ping.\n\n"
                "BroadbandPicker publishes landlord / HMO and small-office guides because this is a real UK use-case, not a footnote.\n\n"
                f"Guides live on the site. Provider partnerships: {brand.emails['partnerships']}"
            ),
            alt_copy="Treat the line like a boiler. When it fails, nobody cares whose name is on the contract.",
            cta=f"{brand.key_urls['guides']}/broadband-for-landlords-and-hmos-uk",
            url_key="guides",
            engagement="Landlords: what's the most unhinged Wi-Fi clause you've put in a tenancy. Tenants: what's the most unhinged one you've signed.",
            hashtags=["#HMO", "#Landlords"],
            platforms=["linkedin", "facebook", "x", "instagram"],
            formats=["linkedin", "carousel", "tweet", "feed"],
            why="B2B-adjacent consumer. Also a reason for ISP partnership teams covering 'home' and 'soho' to care.",
            compliance="Don't give legal tenancy advice. Talk about the line.",
            design=DesignBrief(
                format_name="Floorplan with lag",
                dimensions="1080x1350",
                duration="static",
                visual_concept="A minimal four-room floorplan, navy lines on paper. Wifi arcs from the hall die before the back bedroom. One sky label: 'reviews mentioned the ping'.",
                on_screen_text=["Four tenants", "One router", "Infrastructure, not a vibe"],
                palette=standard_palette(),
                type="Inter ExtraBold.",
                logo="Corner.",
                audio="N/A",
                shots=["Floorplan"],
                do_not=["Don't show a real address"],
            ),
        )
    )
    return bank


# ---------------------------------------------------------------------------
# Calendars
# ---------------------------------------------------------------------------

WEEKDAY_SLOTS = {
    0: ("08:00", "19:00"),  # Mon
    1: ("12:15", "19:00"),  # Tue
    2: ("08:00", "19:00"),  # Wed
    3: ("12:15", "19:00"),  # Thu
    4: ("11:30", "19:00"),  # Fri
    5: ("10:30", "11:00"),  # Sat
    6: ("10:30", "11:00"),  # Sun
}


def uk_posting_slot(platform: str, fmt: str, weekday: int) -> dict[str, str]:
    """Europe/London slots for UK visibility. Times are when to hit Post, not when to design."""
    weekend = weekday >= 5
    if platform == "x":
        if weekend:
            post, peak, why, lead = "10:30", "Sat-Sun 10:00-12:00 UK", "Weekend late-morning scroll on X, not 7am.", "2"
        elif weekday == 4:
            post, peak, why, lead = "11:30", "Weekday commute 08:00-09:30 and 17:30-19:00 UK. Skip Friday evening.", "Friday lunch still works. Friday 17:00 on X is a graveyard.", "2"
        elif weekday in (0, 2):
            post, peak, why, lead = "08:00", "Tue-Thu 08:00-09:30 and 17:30-19:00 UK (commute plus 7pm broadband rage)", "X UK peaks on the commute. Pin the sharpest line for the 7pm complainers to quote.", "2"
        else:
            post, peak, why, lead = "12:15", "Tue-Thu 08:00-09:30 and 17:30-19:00 UK", "Lunch slot for the people refreshing X at their desk after a slow morning meeting.", "2"
    elif platform == "instagram" and fmt == "story":
        post = "19:00" if not weekend else "11:00"
        peak, why, lead = "Stories 07:30-09:00, 12:00-13:00 and 19:00-21:00 UK", "Stories vanish. Post when bill-payers are on the sofa, not in a standup.", "1"
    elif platform == "instagram" and fmt == "reel":
        post = "18:30" if not weekend else "11:00"
        peak, why, lead = "Reels 18:00-21:00 UK weekdays, 11:00-13:00 weekends", "Reels compete with TikTok after work. Do not post a Reel at 09:00.", "2"
    elif platform == "instagram":
        if weekend:
            post = "11:00"
        elif weekday in (1, 3, 4):
            post = "12:00"
        else:
            post = "18:00"
        peak, why, lead = "Feed Tue-Thu 11:00-13:00 and 18:00-20:00 UK", "Lunch and after-work are when 25-40 UK still open Instagram.", "2"
    elif platform == "tiktok":
        post = "19:00" if not weekend else "11:30"
        peak, why, lead = "18:00-21:00 UK weeknights, 11:00-14:00 weekends", "TikTok discovery is evening. Lunch works for students and HMOs.", "1"
    elif platform == "linkedin":
        post = "08:15"
        if weekday == 4:
            post = "08:00"
        peak, why, lead = "Tue-Thu 07:45-09:30 UK. Avoid Friday afternoon and weekends.", "Affiliate managers and ISP marketers open LinkedIn before stand-up.", "2"
    elif platform == "youtube":
        post = "17:30" if not weekend else "11:00"
        peak, why, lead = "Shorts 17:00-19:00 UK weekdays, 10:00-13:00 weekends", "Shorts sit next to TikTok after work. Search still happens at lunch.", "2"
    elif platform == "facebook":
        post = "11:00" if not weekend else "10:00"
        peak, why, lead = "11:00-13:00 and 19:00-21:00 UK. Sunday 10:00-12:00 for 35+ bill-payers.", "Facebook still owns older UK bill-payers at late morning.", "2"
    else:
        post, peak, why, lead = "12:00", "Midday UK", "Default UK lunch slot.", "2"
    return {
        "post_time": post,
        "peak_window": peak,
        "why": why,
        "lead_days": lead,
        "timezone": "Europe/London",
    }


def design_deadline(post_date: date, lead_days: str, fmt: str = "") -> tuple[str, str]:
    lead = int(lead_days or "2")
    due = post_date - timedelta(days=lead)
    while due.weekday() >= 5:
        due -= timedelta(days=1)
    time_uk = "12:00" if fmt == "story" else "17:00"
    return due.isoformat(), time_uk


def monday_on_or_after(start: date) -> date:
    return start if start.weekday() == 0 else start + timedelta(days=(7 - start.weekday()))


def build_calendar(start: date, weeks: int, bank: list[Idea]) -> list[dict[str, str]]:
    """Four-plus weeks of mixed-platform slots, rotating the idea bank."""
    rows: list[dict[str, str]] = []
    usable = [idea for idea in bank if "b2b" not in idea.pillar]
    b2b = [idea for idea in bank if idea.pillar == "b2b"]
    idx = 0
    for week in range(weeks):
        week_start = start + timedelta(days=7 * week)
        for day in range(7):
            day_date = week_start + timedelta(days=day)
            # Consumer beat
            idea = usable[idx % len(usable)]
            idx += 1
            platform_today = ["x", "instagram", "tiktok"][day % 3]
            if platform_today not in idea.platforms:
                platform_today = idea.platforms[0]
            fmt = idea.formats[0]
            if platform_today == "instagram":
                fmt = "reel" if day % 2 == 0 else "feed"
            elif platform_today == "tiktok":
                fmt = "tiktok"
            elif platform_today == "x":
                fmt = "tweet" if "tweet" in idea.formats else idea.formats[0]
            rows.append(_calendar_row(day_date, week + 1, platform_today, fmt, idea))
            if day_date.weekday() < 5:
                story_idea = usable[(idx + 3) % len(usable)]
                rows.append(_calendar_row(day_date, week + 1, "instagram", "story", story_idea, title_prefix="Story: "))
        for offset, idea in zip((1, 3), b2b or usable[:2]):
            day_date = week_start + timedelta(days=offset)
            rows.append(_calendar_row(day_date, week + 1, "linkedin", "linkedin", idea))
        yt_pool = [i for i in usable if "youtube" in i.platforms or "tiktok" in i.platforms or "reel" in i.formats]
        for offset in (0, 2, 5):
            day_date = week_start + timedelta(days=offset)
            idea = yt_pool[(week * 3 + offset) % len(yt_pool)]
            rows.append(_calendar_row(day_date, week + 1, "youtube", "short", idea))
        if week >= 4:
            fb_pool = [i for i in usable if "facebook" in i.platforms] or usable
            for offset in (2, 6):
                day_date = week_start + timedelta(days=offset)
                idea = fb_pool[(week + offset) % len(fb_pool)]
                rows.append(_calendar_row(day_date, week + 1, "facebook", "feed", idea))
    return rows


def _calendar_row(
    day_date: date,
    week: int,
    platform: str,
    fmt: str,
    idea: Idea,
    title_prefix: str = "",
) -> dict[str, str]:
    slot = uk_posting_slot(platform, fmt, day_date.weekday())
    design_date, design_time = design_deadline(day_date, slot["lead_days"], fmt)
    size, prompt = prompt_for_platform(idea, platform, fmt)
    return {
        "date": day_date.isoformat(),
        "day": day_date.strftime("%A"),
        "timezone": "Europe/London",
        "time_uk": slot["post_time"],
        "peak_window_uk": slot["peak_window"],
        "why_this_slot": slot["why"],
        "design_by_date": design_date,
        "design_by_time_uk": design_time,
        "week": str(week),
        "platform": platform,
        "format": fmt,
        "idea_id": idea.id,
        "pillar": idea.pillar,
        "title": f"{title_prefix}{idea.title}" if title_prefix else idea.title,
        "hook": idea.engagement if title_prefix else idea.hook,
        "status": "Not posted",
        "artwork_size": size,
        "chatgpt_prompt": prompt,
        "on_screen_text": " | ".join(idea.design.on_screen_text),
        "visual_concept": idea.design.visual_concept,
    }


# ---------------------------------------------------------------------------
# Markdown writers
# ---------------------------------------------------------------------------


def md_list(items: list[str]) -> str:
    return "\n".join(f"- {item}" for item in items)


def write(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content.strip() + "\n", encoding="utf-8")


def render_design(design: DesignBrief) -> str:
    shots = "\n".join(f"  - {s}" for s in design.shots)
    dont = "\n".join(f"  - {s}" for s in design.do_not)
    text = "\n".join(f"  - {s}" for s in design.on_screen_text)
    return f"""**Format:** {design.format_name}
**Dimensions:** {design.dimensions}
**Duration:** {design.duration}
**Visual concept:** {design.visual_concept}
**On-screen text:**
{text}
**Palette:** {design.palette}
**Type:** {design.type}
**Logo:** {design.logo}
**Audio:** {design.audio}
**Shot list:**
{shots}
**Do not:**
{dont}"""


# ---------------------------------------------------------------------------
# Design prompts — one ready-to-paste text-to-image prompt per static
# placement a idea actually needs, with the exact canonical size. This is
# the thing you paste straight into ChatGPT/DALL-E — everything else in a
# DesignBrief (shot list, audio, duration) is for filming, not for an
# image generator, so it's deliberately left out of the prompt text.
# ---------------------------------------------------------------------------

# Canonical sizes, matching what's already published per-channel in
# design-system.md / design-briefs.md — single source of truth, not
# re-derived from each idea's free-text `dimensions` string.
PLATFORM_STATIC_PLACEMENTS: dict[str, tuple[str, str]] = {
    "instagram_feed": ("Instagram feed post (4:5)", "1080x1350px"),
    "instagram_square": ("Instagram quote card (1:1)", "1080x1080px"),
    "instagram_cover": ("Instagram Reel/Story cover frame (9:16)", "1080x1920px"),
    "tiktok_cover": ("TikTok cover / first frame (9:16)", "1080x1920px"),
    "x_image": ("X post image (16:9)", "1600x900px"),
    "linkedin": ("LinkedIn landscape (1.91:1)", "1200x627px"),
    "youtube_thumb": ("YouTube thumbnail (16:9)", "1280x720px"),
    "facebook": ("Facebook feed (4:5)", "1080x1350px"),
}


def image_prompts_for_idea(idea: Idea) -> list[dict[str, str]]:
    """Which static placements this idea needs, each with a single
    ready-to-paste prompt. An idea can need more than one (e.g. an
    Instagram feed post AND a TikTok cover for the same joke)."""
    placements: list[str] = []
    if "carousel" in idea.formats or "feed" in idea.formats:
        placements.append("instagram_feed")
    if idea.pillar in ("meme", "quote", "sarcasm") and "instagram" in idea.platforms:
        placements.append("instagram_square")
    if "story" in idea.formats and "instagram" in idea.platforms:
        placements.append("instagram_cover")
    if ("reel" in idea.formats or "tiktok" in idea.formats) and "tiktok" in idea.platforms:
        placements.append("tiktok_cover")
    if "tweet" in idea.formats and "x" in idea.platforms:
        placements.append("x_image")
    if "linkedin" in idea.platforms or "linkedin" in idea.formats:
        placements.append("linkedin")
    if "youtube" in idea.platforms or "youtube" in idea.formats:
        placements.append("youtube_thumb")
    if "facebook" in idea.platforms:
        placements.append("facebook")
    if not placements:
        placements.append("instagram_feed")

    seen: set[str] = set()
    prompts: list[dict[str, str]] = []
    for key in placements:
        if key in seen:
            continue
        seen.add(key)
        label, size = PLATFORM_STATIC_PLACEMENTS[key]
        prompts.append({
            "placement_key": key,
            "platform_label": label,
            "size": size,
            "prompt": build_image_prompt(idea, label, size),
        })
    return prompts


def build_image_prompt(idea: Idea, platform_label: str, size: str) -> str:
    d = idea.design
    text_block = (
        " | ".join(f'"{line}"' for line in d.on_screen_text)
        if d.on_screen_text else "no extra slogans"
    )
    do_nots = "; ".join(d.do_not) if d.do_not else "none"
    landscape = any(token in size for token in ("1600x900", "1280x720", "1200x627", "16:9", "1.91:1"))
    b2b = "LinkedIn" in platform_label
    crop = (
        "Landscape crop of the same poster: navy outer canvas, paper rounded card, huge headline "
        "on the left, illustration on the right, navy footer along the bottom with logo + URL."
        if landscape
        else "Portrait poster stacked like the Engineer Window reference: icon, headline, giant fact, sky punchline, then the cartoon, then the navy logo footer."
    )
    people = (
        "No household cartoon. Calm objects only: bill, tick, wifi mark, one diagram."
        if b2b
        else "Simple editorial cartoon people allowed (jumpers, slippers, glasses). Not photoreal, not stock smiles, not 3D."
    )
    return (
        f"Create a {size} social graphic for {platform_label}. UK English. Europe/London audience.\n\n"
        f"BRAND: BroadbandPicker, independent UK broadband comparison. Rankings are not sold.\n\n"
        f"REFERENCE SYSTEM (copy this layout, then change the joke):\n"
        f"{DESIGN_LOOK}\n\n"
        f"CROP FOR THIS SIZE: {crop}\n\n"
        f"COLOURS: navy {BRAND_NAVY}, sky {BRAND_PRIMARY}, paper {BRAND_SLATE}, white {BRAND_WHITE}. "
        f"Green {BRAND_GREEN} only as a single tick. Palette: {d.palette}\n\n"
        f"TYPE: Inter ExtraBold for the headline, Inter Regular for the whisper. {d.type}\n\n"
        f"LOGO: {d.logo}\n\n"
        f"PEOPLE: {people}\n\n"
        f"THIS JOKE: {d.visual_concept}\n\n"
        f"ON-SCREEN TEXT, exactly, large, no extras: {text_block}\n\n"
        f"AVOID: {do_nots}. No fake BT/Sky/Virgin logos. No QR. No SALE red. No watermarks. "
        f"No 'comment below'. Fibre not fiber. The caption, not the artwork, asks the question."
    )


def design_prompts_md(bank: list[Idea]) -> str:
    by_placement: dict[str, list[tuple[Idea, dict[str, str]]]] = {key: [] for key in PLATFORM_STATIC_PLACEMENTS}
    for idea in bank:
        for prompt_row in image_prompts_for_idea(idea):
            by_placement[prompt_row["placement_key"]].append((idea, prompt_row))

    sections = []
    for key, (label, size) in PLATFORM_STATIC_PLACEMENTS.items():
        rows = by_placement[key]
        if not rows:
            continue
        blocks = []
        for idea, prompt_row in rows:
            blocks.append(
                f"### {idea.id} — {idea.title}\n\n"
                f"**Size:** {size}\n\n"
                f"**Paste into ChatGPT / DALL-E:**\n\n```\n{prompt_row['prompt']}\n```\n"
            )
        sections.append(f"## {label} — {size}\n\n" + "\n".join(blocks))

    return (
        "# Design prompts — ready to paste into ChatGPT\n\n"
        "One block per static graphic a content idea actually needs, grouped by where it's "
        "posted. Each prompt already has the exact size, the joke's on-screen text, brand "
        "colours, typography style and logo rule baked in from the idea's design brief — copy "
        "the whole fenced block and paste it into an image generator as-is.\n\n"
        "Video-only formats (the Reel/TikTok cut itself) aren't here — this is for the static "
        "posters and cover frames, which is what an image generator actually produces. Full shot "
        "lists, audio direction and duration for filming stay in each channel's own content file "
        "(reels.md, video-ideas.md, posts.md).\n\n"
        + "\n\n".join(sections)
    )


def utm(url: str, platform: str, idea_id: str) -> str:
    if url.startswith("mailto:") or "utm_source=" in url:
        return url
    join = "&" if "?" in url else "?"
    return f"{url}{join}utm_source={platform}&utm_medium=social&utm_campaign={idea_id.lower()}"


def stamp_utm(text: str, platform: str, idea_id: str) -> str:
    def repl(match: re.Match[str]) -> str:
        return utm(match.group(0).rstrip(".,;"), platform, idea_id)

    return re.sub(r"https://broadbandpicker\.co\.uk[^\s)\]\"']*", repl, text)


def channel_captions(idea: Idea, brand: BrandProfile) -> dict[str, str]:
    url = brand.key_urls.get(idea.url_key, SITE)
    ig_tags = professional_ig_hashtags()
    tt_tags = " ".join(unique(idea.hashtags + ["#broadband", "#britishhumour", "#ukinternet"]))
    fb_tags = " ".join(idea.hashtags[:2])
    first_comment = idea.engagement
    alt = (
        f"BroadbandPicker graphic. {idea.hook} "
        + ("On-screen: " + "; ".join(idea.design.on_screen_text[:3]) + "." if idea.design.on_screen_text else "")
    )
    x_url = utm(url, "x", idea.id)
    ig_url = utm(url, "instagram", idea.id)
    tt_url = utm(url, "tiktok", idea.id)
    li_url = utm(url, "linkedin", idea.id)
    fb_url = utm(url, "facebook", idea.id)
    yt_url = utm(url, "youtube", idea.id)

    x_copy = stamp_utm(f"{idea.copy}\n\n{idea.cta}", "x", idea.id)
    if idea.id.startswith("IG-"):
        ig = stamp_utm(idea.copy, "instagram", idea.id)
    else:
        copy = idea.copy or ""
        if idea.hook and copy.lower().startswith(idea.hook.lower()[:18]):
            ig_body = copy
        else:
            ig_body = f"{idea.hook}\n\n{copy}" if idea.hook else copy
        ig = stamp_utm(
            f"{ig_body}\n\n"
            "Independent UK broadband comparison. Rankings are not sold.\n\n"
            "Save this if you are reviewing your broadband this month.\n\n"
            f"Link in bio\n{ig_url}\n\n{ig_tags}",
            "instagram",
            idea.id,
        )
    tt = f"{idea.hook}\n\n{idea.engagement}\n{tt_tags}"
    li = stamp_utm(
        f"{idea.hook}\n\n{idea.copy}\n\n"
        f"{idea.cta}\n{li_url}\n\n"
        "Independent UK broadband comparison. We list providers with or without an affiliate deal.",
        "linkedin",
        idea.id,
    )
    fb = stamp_utm(
        f"{idea.hook}\n\n{idea.copy}\n\n{idea.engagement}\n\n"
        f"{fb_url}\n\n{fb_tags}",
        "facebook",
        idea.id,
    )
    yt_title = idea.hook[:90]
    yt_desc = stamp_utm(
        f"{idea.copy}\n\n{idea.cta}\n{yt_url}\n\n"
        "BroadbandPicker is an independent UK broadband comparison site. "
        "Affiliate commissions don't buy rankings.\n"
        f"How we make money: {SITE}/how-we-make-money",
        "youtube",
        idea.id,
    )
    return {
        "x": x_copy,
        "instagram": ig,
        "tiktok": tt,
        "linkedin": li,
        "facebook": fb,
        "youtube_title": yt_title,
        "youtube_description": yt_desc,
        "first_comment": first_comment,
        "alt_text": alt,
        "story_sticker": idea.engagement,
    }


def render_idea(idea: Idea, brand: BrandProfile, *, platform: str | None = None) -> str:
    tags = " ".join(idea.hashtags)
    caps = channel_captions(idea, brand)
    intents = ", ".join(idea.search_intents) if idea.search_intents else "general UK broadband"
    platform_caption = ""
    if platform:
        key = {
            "x": "x",
            "instagram": "instagram",
            "tiktok": "tiktok",
            "linkedin": "linkedin",
            "facebook": "facebook",
            "youtube": "youtube_description",
        }.get(platform)
        if key:
            label = "YouTube description" if key == "youtube_description" else f"{platform.title()} caption (paste this)"
            extra = ""
            if platform == "youtube":
                extra = f"\n\n**YouTube title (paste):**\n\n{caps['youtube_title']}\n"
            platform_caption = f"""
**{label}**

{caps[key]}
{extra}
**First comment (paste):** {caps['first_comment']}

**Alt text:** {caps['alt_text']}
"""
    else:
        platform_caption = f"""
**Ready-to-paste captions**

<details>
<summary>X</summary>

{caps['x']}

</details>

<details>
<summary>Instagram</summary>

{caps['instagram']}

</details>

<details>
<summary>TikTok</summary>

{caps['tiktok']}

</details>

<details>
<summary>LinkedIn</summary>

{caps['linkedin']}

</details>

<details>
<summary>Facebook</summary>

{caps['facebook']}

</details>

**First comment (paste):** {caps['first_comment']}

**Alt text:** {caps['alt_text']}
"""
    return f"""### {idea.id} — {idea.title}

- **Pillar:** {idea.pillar}
- **Search intents:** {intents}
- **Hook:** {idea.hook}
- **Best on:** {", ".join(idea.platforms)} · {", ".join(idea.formats)}
- **Why it should travel:** {idea.why}
- **Engagement mechanic:** {idea.engagement}
- **CTA / URL:** {idea.cta}
- **Hashtags (use sparingly):** {tags or "none"}
- **Compliance:** {idea.compliance}

**Master copy**

{idea.copy}

**Alt / shorter**

{idea.alt_copy}
{platform_caption}
**Design brief (for you + for ChatGPT)**

{render_design(idea.design)}
"""


def render_channel_markdown(brand: BrandProfile) -> str:
    rows = channel_rows(brand)
    blocks = []
    for row in rows:
        blocks.append(
            f"""### {row['channel']}

| | |
|---|---|
| **Priority** | {row['priority']} |
| **Open an account?** | {row['open']} |
| **Handle** | `{row['handle']}` |
| **Why this channel** | {row['why']} |
| **Audience** | {row['audience']} |
| **Content** | {row['content']} |
| **Cadence** | {row['cadence']} |
| **Success looks like** | {row['success']} |
| **Affiliate / provider value** | {row['b2b']} |
"""
        )
    return "\n".join(blocks)


def master_strategy_md(brand: BrandProfile, bank: list[Idea], weeks: int, research: dict[str, Any] | None = None) -> str:
    provider_line = ", ".join(brand.providers) if brand.providers else "major UK ISPs"
    guide_count = len(brand.guides)
    research = research or brand.web_research or {}
    fetch_n = len(research.get("fetches") or [])
    fetch_ok = sum(1 for row in research.get("fetches") or [] if row.get("ok"))
    curated = research.get("curated") or curated_market_intelligence()
    ofcom = curated.get("ofcom_media") or {}
    return f"""# BroadbandPicker social strategy

Generated from the workspace and live web research on {date.today().isoformat()}.
Site: {brand.site}
Live fetches this run: {fetch_ok}/{fetch_n or 'skipped'} (see `08-web-research.md`).

## What we are actually building

{brand.positioning}

**Revenue:** {brand.revenue_model}

The job of social is not "post deals". The job is:

1. Make BroadbandPicker the funny, trusted British broadband brand people screenshot to their group chat.
2. Send high-intent traffic to the postcode checker, deals, guides and tools.
3. Look like a real publisher so Awin advertisers and ISP partnership teams approach **us**.

Consumer joke → brand memory → comparison session → affiliate sign-up.
B2B proof → inbound affiliate applications → more complete deal tables → more consumer trust.

## Brand facts this plan is based on

- **Providers in the dataset:** {provider_line}
- **Guides on the site:** {guide_count}
- **Tools:** {", ".join(t["name"] for t in brand.tools)}
- **City / postcode hubs:** {", ".join(brand.cities[:12])}
- **Existing social:** X {brand.social_handles.get("x")} (linked from the site footer and About)
- **Partnerships:** {brand.emails["partnerships"]}
- **Colours:** primary {brand.colours.get("primary")}, navy {brand.colours.get("navy")}, accent {brand.colours.get("accent")}
- **Type on site:** {", ".join(brand.fonts) or "Inter"}
- **Logo files:** {", ".join(brand.logo_files) or "see public/logo.svg"}

### Files read

{md_list(brand.files_read)}

### Warnings from the audit

{md_list(brand.warnings) if brand.warnings else "- None."}

## Positioning on social (one sentence)

BroadbandPicker is the UK broadband comparison site that talks like a mate in the pub, ranks like a grown-up publisher, and will not pretend your 'fibre' is full fibre if it still involves 1998.

Tone: British sarcasm, memes, twisted wise quotes, puns. Casual, household, shareable — built for comments, tags and forwards, not for corporate likes. Never cringe-corporate. Never punch down at people who cannot afford the bill. Punch **up** at loyalty tax, "up to" speeds, 8am–6pm engineer windows, and April rises.

Pictures do the opposite job to the copy: plush, niche, minimal, site colours. The joke is a mate in the kitchen. The frame looks like the website.

## Why these channels (2026 UK facts, not vibes)

Ofcom: {ofcom.get('adult_social_users_pct', 89)}% of adult internet users are on social, but only {ofcom.get('actively_post_share_comment_pct', 49)}% still post or comment. Design for lurkers who screenshot and tag. Monthly reach still favours YouTube, Facebook/Messenger, WhatsApp, then Instagram, Reddit, TikTok, then X and LinkedIn together. Full numbers and sources: `08-web-research.md`.

Consumer intents (cheap, switch, postcode, fibre, social tariff, moving, WFH, football, rural) → TikTok, Instagram, YouTube, Facebook, X.
Provider / Awin intents → LinkedIn, X, the trust pages.

Map: `05-intent-content-plan.md`. B2B loop: `07-affiliate-b2b-playbook.md`.

## The 80 / 15 / 5 mix

| Share | Job | Examples |
|---|---|---|
| 80% | Travel. Jokes, polls, quote cards, sketches. Barely a URL. | Buffering weather warning, Keep Calm router, Wi-Fi name roast |
| 15% | Useful-funny. A joke that earns a table. | Speed you actually need, social tariffs, One Touch Switch |
| 5% | Soft sell and B2B. | Out-of-contract public-health warning, LinkedIn methodology |

If a post could have been written by Uswitch's legal team, rewrite it.

## Content pillars

{md_list(brand.content_pillars)}

## Funnel

```
Awareness     TikTok / Reels / X jokes     "this is so Britain"
Consideration Carousels, Stories, threads  "wait, I am out of contract"
Conversion    Bio link, sticker link, X    postcode checker / deals / match quiz
Trust         Social tariff posts, how we  Awin, journalists, ISP partners
              make money, LinkedIn
```

Every joke still has a door home: {SITE}

Do **not** affiliate-dump in captions. One relevant URL. ASA-friendly: prices dated, speeds address-level, commissions disclosed on the site (and on ads, with #ad, if you ever boost a specific deal).

## Operating plan — from zero posts

Nothing has shipped. The job of week 0 is to look like a brand the moment the first stranger arrives. Full sequence: `09-day-zero-launch.md`.

### Day 0 — Setup, no posts

- Claim `broadbandpicker` (or `broadbandpickeruk`) on Instagram, TikTok, LinkedIn, YouTube. X {brand.social_handles.get('x')} already sits in the site footer — still treat it as empty.
- Same avatar everywhere: `docs/branding-and-marketing/broadbandpicker-logo-icon.png`.
- Bios: one joke + one job. "UK broadband comparison. We mock the loyalty tax. Then we help you leave it. {SITE}"
- Do **not** post a 'hello we are new' tile. Generate the first 9 IG frames first.

### Days 1–3 — Publish the grid

- Instagram: 3 feed posts/day until 9 exist, so the profile is a 3×3 the first time anyone clicks it.
- TikTok: 1/day, native, no watermark. First comment is the question.
- X: pin X-001 (loyalty tax). 1–2/day. Poll on day 2.
- Reply to every comment within an hour. Cold-start algorithms rank conversations, not logos.

### Days 4–14 — Engagement mechanics, not volume

- TikTok daily, Reels the best TikTok 24h later with a new first frame, X 1–2/day, Stories on weekdays with stickers.
- LinkedIn from day 8, once there is a grid to screenshot. Methodology, not memes.
- YouTube Shorts from day 3, mirrored.
- Seed the first comment yourself. Ask for a tag or a number. Never a hard affiliate link in the TikTok caption.

### Days 15–45 — Keep what repeats, kill what dies

- Repeat winning hooks. Do not invent a mascot.
- One serious carousel a week (social tariffs, OTS).
- Founder LinkedIn: methodology and Ofcom facts only.

### Days 46–90 — Commercially loud

- Facebook + WhatsApp Channel.
- Boost only posts that already have organic comments.
- Media kit from the living grid, attached to `docs/affiliate-outreach-email.txt`.

## KPI that match the actual business

| Stage | Metric | 90-day aim (honest, small site) |
|---|---|---|
| Attention | Follows + average watch-through | 3–5k combined IG+TT if the jokes land |
| Memory | Branded Google searches, direct traffic | Up and to the right, even if small |
| Action | Clicks to postcode / deals / match | UTM `?utm_source=tiktok&utm_medium=social&utm_campaign=launch` |
| Money | Affiliate conversions assisted by social | Track in Awin + GA4 |
| B2B | Inbound to {brand.emails['partnerships']} | 1 serious conversation is a win |

## Repurposing engine (one idea, four assets)

1. Write the joke in a Notes app. If it doesn't make you smirk, it will not make a stranger share it.
2. Film a 10-second vertical (TikTok).
3. Post to Reels next day with a different first frame.
4. Cut a quote card for IG feed + X.
5. Put a poll sticker in Stories.
6. If it teaches something, LinkedIn it without the meme font.

## Compliance (non-negotiable)

- British English. Fibre, not fiber. £, not $.
- No fake "cheapest in the UK" without a dated, qualified claim.
- Speeds are typical / address-level. Always a postcode caveat on deal posts.
- Affiliate: the website already discloses. Paid ads and specific "get this deal" posts need clear #ad / #affiliate.
- Satire of **industry tropes**, not defamation of a named provider's measured performance.
- Social tariffs: public-service tone. No punching down.
- Don't encourage people to post account numbers, passwords, or bills with personal data.

## Idea bank size in this run

{len(bank)} named concepts, scheduled across {weeks} weeks, written out per channel in the folders beside this file.
"""


def voice_playbook_md() -> str:
    return f"""# Voice, jokes, and how not to be LinkedIn

## The voice in one paragraph

Talk like the funniest person in a British kitchen when the Wi-Fi dies during the football. Dry. Specific. A bit angry, never cruel. You are on the household's side against the loyalty tax, the engineer window, and the words "up to". You are not a deal spruiker in a headset.

## Do

- Understatement, then the knife. "That's not an appointment. That's a hostage video with a van."
- Concrete British props: kettle, cupboard under the stairs, Greggs, TfL boards, MOTD, April bills, HS2, the pub.
- Teach in the second beat, not the first. Joke, then the useful bit.
- Invite a tag, a poll, a reply, a roast of a Wi-Fi name.
- Let some posts have no URL. Brand memory is a conversion channel.

## Do not

- "We're so excited to announce." Nobody in Britain is excited to announce broadband.
- Americanisms. No "cell phone", "fiber", "awesome deals!!!".
- Emoji salads. One, maybe two, if the platform is Instagram. None on X unless a poll.
- Punching down: poverty, accents, "your nan can't work the remote" as the whole joke. Nan's gossip can be *fast*. Nan is not the punchline.
- Fake intimacy. Don't call the audience "guys" every third line.

## Four joke formulas (steal these)

1. **Industry phrase, taken literally.** "Up to 67 Mbps" → "up to a biscuit."
2. **Official format, unofficial crisis.** Met Office warning, TfL board, Keep Calm poster, fridge letter.
3. **Wise quote, unwise bill.** Socrates, JFK, Sartre, Hamlet, all forced to look at a hub.
4. **Two-column injustice.** New customer £19 / you £41.

## Pun drawer (use one per week, not one per post)

- Mbps — Maybe Per Second
- FTTP — Finally The Thing's Proper
- FTTC — Fibre To The Close-enough
- Packet loss — it's not you
- Broadband — because the bills are
- Router / "rooter" arguments as a Story poll
- ISP — I Spend Plenty
- Latency — late-ncy, the national rail of data
- Openreach — open *to* a van, eventually
- Contention — everyone else had the same idea

## British life × broadband map

| Life | Broadband version |
|---|---|
| Loyalty to a bank | Out-of-contract price |
| Engineer / courier windows | 8 until 6, bring a flask |
| "Coming soon" infrastructure | Full fibre since 2014 |
| Football | 89th-minute buffering |
| Cupboard under the stairs | Where the router goes to die |
| Flatshares | FIFA vs FaceTime peace talks |
| WFH | Impressionist Zoom |
| Rural promises | Yeti van |
| April | Council tax + broadband |
| Small print | "Up to" |

## Engagement mechanics that actually get tags

- "Quote with what you pay."
- "Drop your Wi-Fi name."
- "Tag the unpaid IT department."
- Native polls with a stupid fourth option.
- "2am speed vs 7pm speed."
- "Finish this soliloquy."
- "Add one thing faster than your broadband."

If a post does not ask for a human behaviour, it is a poster. Posters rarely travel.

## Design rules of thumb

- Copy is pub-dry sarcasm. Pictures are plush, niche, minimal — navy/sky, huge margins, geometric wifi arcs. Full spec: `06-visual-design-system.md`.
- Joke is native. Brand is the end card.
- Burned-in captions always (Reels/TikTok are watched muted).
- Safe zones: keep type out of the bottom 250px (UI chrome).
- Wifi-mark from the logo SVG, not a random stock wifi icon.
- End card: navy field, sky mark, one URL, no QR codes unless print.
- Inter ExtraBold for anything that looks like the company. Frame meme fonts on a navy card so the grid still looks expensive.

## When to be serious

Social tariffs, complaints, outages with real harm, anything involving money a vulnerable person might misread. Switch the clown off. Keep the clarity.
"""


def channel_md(brand: BrandProfile) -> str:
    p0 = [r for r in channel_rows(brand) if r["priority"].startswith("P0")]
    return f"""# Which social accounts BroadbandPicker should actually open

## Short answer

This is a **day-zero launch**. No channel has a real post history. Handles may exist (X is already in the site footer) but treat every profile as empty: no pin, no grid, no followers, no 'we've been posting'.

Open **X, Instagram, TikTok, LinkedIn, and YouTube** on day 0 (setup). Do not post until the first 9 Instagram frames exist so a stranger landing from the website sees a brand, not a blank.

Add **Facebook + WhatsApp Channel** in month 2.

Treat **Pinterest** as a later evergreen dump (movers, checklists). **Reddit** as a human, not a mascot. **Skip Snapchat and Bluesky**.

This is not a vibes list. Ofcom 2025–26 monthly reach among UK 18+: YouTube ~67%, Facebook & Messenger ~66%, WhatsApp ~63%, Instagram ~56%, Reddit ~42%, TikTok ~39%, X and LinkedIn ~28% each. Half of users lurk — design for screenshots and tags. Specialist broadband affiliates barely post at all (see `10-competitor-social.md`). Sources: `08-web-research.md`.

X already exists as {brand.social_handles.get("x")} on the site. That is the only live consumer channel today. The current X calendar in `docs/branding-and-marketing/` is too polite to get you retweets. Keep the account; change the voice.

## Why these, given the business

BroadbandPicker makes money when a human compares a deal and signs up. The site is free; providers pay affiliate commission. Rankings are not for sale.

That needs:

- **Reach among bill-payers and switchers** → TikTok, Instagram, X, Facebook
- **Brand that doesn't feel like a voucher site** → jokes people want to be seen sharing
- **Proof for Awin and ISP partnership teams** → LinkedIn + a site that already has `/how-we-make-money` and methodology
- **Somewhere journalists already argue about Ofcom** → X

If you only have hours, the order is:

1. X voice-lift (same day)
2. Instagram + TikTok (same content engine)
3. LinkedIn company page (B2B, this is how providers approach you)
4. YouTube Shorts (free extra)
5. Everything else

## Full channel grid

{render_channel_markdown(brand)}

## Handles and bios (copy/paste)

**X** — {brand.social_handles.get("x")}
UK broadband comparison. We mock the loyalty tax. Then we help you leave it.
{SITE}

**Instagram / TikTok** — {brand.social_handles.get("instagram")}
British broadband, minus the small print energy.
Jokes about routers. Help with switching.
Link in bio: {SITE}

**LinkedIn**
Independent UK broadband comparison. Postcode checker, provider reviews, guides.
Partnerships: {brand.emails["partnerships"]}

**YouTube**
BroadbandPicker — UK broadband explained without the coma.

## Profile kit

- Square avatar: `docs/branding-and-marketing/broadbandpicker-logo-icon.png`
- Banner: navy {brand.colours.get("navy")} with the wifi-mark and "Compare broadband. Mock the loyalty tax."
- Website field: {SITE}
- Contact: {brand.emails["hello"]} / {brand.emails["partnerships"]}

## How this gets providers to call you

Consumer memes make the brand look alive. LinkedIn + the trust pages make it look safe. The outreach email in `docs/affiliate-outreach-email.txt` should go out **with** a LinkedIn URL and "here is what we post" — not instead of social.

Pin on LinkedIn: we list providers with or without affiliate deals, editorial is independent, here is `/how-we-make-money`.

That is the opposite of a link farm. That is the point.
"""


def x_posts_md(brand: BrandProfile, bank: list[Idea]) -> str:
    x_ideas = [i for i in bank if "x" in i.platforms]
    body = "\n\n".join(render_idea(i, brand, platform="x") for i in x_ideas)
    return f"""# X posts, threads and polls

Ready-to-ship copy. Shorten on the day if the news has moved. One URL, not three.
Each idea has a paste-ready caption, first comment, alt text and a design brief you can hand to ChatGPT.

{body}
"""


def x_strategy_md(brand: BrandProfile, bank: list[Idea]) -> str:
    x_count = sum(1 for i in bank if "x" in i.platforms)
    return f"""# X / Twitter strategy — {brand.social_handles.get("x")}

## Why X first

The website already points here. UK broadband discourse already lives here. Journalists, altnet people, and the 7pm complainers are here. You do not need to find a room. You need to be the funniest competent person in it.

## Bio, pin, profile

- **Bio:** Independent UK broadband comparison. Postcode first. Rankings are not sold.
- **Website field:** {SITE} (do not also put the URL in the bio)
- **Location:** United Kingdom
- **Pin:** IG-009 / a postcode-first tile, or X-001 once the grid exists
- **Avatar:** logo icon PNG, 400x400, circle crop
- Full paste fields: `../profiles-all.md`

## Cadence

- 1–2 original posts a day.
- Reply to Ofcom, ISPreview-adjacent chatter, and provider outages in-character (never dump a link under a real outage until you've been useful).
- 1 poll per week.
- 1 thread per week (useful-funny).
- Quote-tweet with a one-liner more than you like-and-leave.

Best windows: 08:30, 12:30, 18:00–20:00 UK, plus live at 89 minutes of a big match.

## What changes vs the old calendar

The old calendar taught speeds and switching like a leaflet. Fine for SEO. Death on X.

New mix: 70% jokes and hooks, 20% useful-funny, 10% "here is the actual page".

## Thread skeleton (weekly)

1. Unreasonable opening line.
2. Three facts that hurt because they're true.
3. The one thing to do (URL).
4. A question so people reply.

## Hashtags

Usually none. Occasionally #UKBroadband. Never a pile.

## Posts

{x_count} ideas are written out in `posts.md` with full copy and design briefs.
"""


def ig_strategy_md(brand: BrandProfile, research: dict[str, Any] | None = None) -> str:
    handle = brand.social_handles.get("instagram", "@broadbandpicker")
    intel = (research or {}).get("instagram_professional") or analyse_instagram_professional([])
    live_rows = intel.get("live_profiles") or []
    live_md = "\n".join(
        f"| {r.get('label')} | {r.get('ok')} | {r.get('status')} | {(r.get('og_description') or r.get('og_title') or 'login wall / thin scrape')} |"
        for r in live_rows
    ) or "| (no live IG fetches this run) | | | |"
    rules = "\n".join(f"- {item}" for item in intel.get("what_professional_accounts_do") or [])
    avoid = "\n".join(f"- {item}" for item in intel.get("do_not_copy") or [])
    bios = intel.get("scraped_bios") or {}
    return f"""# Instagram strategy: {handle}

Instagram is the professional shopfront. X and TikTok can be rude. This grid is what ISP partnership teams, Awin reviewers and a bill-payer all see in three seconds. Set it up like Monzo or Octopus, not like a meme page that found Wi-Fi.

{intel.get("implication", "")}

## What professional UK accounts actually do (scraped)

Live profile fetches this run. Instagram often returns a login wall to bots. Bios below are from successful public scrapes plus on-page text.

| Account | Fetch | Status | Bio / OG text |
|---|---|---|---|
{live_md}

Reference bios (public):

- Monzo: {bios.get("monzo", "")}
- Octopus Energy: {bios.get("octopusenergy", "")}
- Uswitch (company line): {bios.get("uswitch_tagline", "")}

They are short. They say what the company is. They do not dump hashtags, emojis or a mission statement. We copy that shape, not their words.

## Setup rules we are following

{rules}

## Do not copy

{avoid}

## Three surfaces, three jobs

| Surface | Job | Cadence |
|---|---|---|
| **Feed** | The 3x3 grid. Educational carousels and one brand tile. This is the publisher. | 4 feed/carousels a week after the first 9 |
| **Reels** | Reach. 15-30s explainers. First frame is a poster. Works muted. | 3/week |
| **Stories** | Habit. Polls, this-or-that, one fact, one link sticker. | Weekdays 19:00 UK |

Paste-ready profile, highlights and the first 9 posts: `account-setup.md` and `professional-content.md`.

## Cadence and times (Europe/London)

- Feed: Tue-Thu 12:00 or 18:00
- Reels: 18:30-20:00 weekdays
- Stories: 19:00 weekdays
- Design stills two working days before. Stories the day before 12:00.

## Captions

- First two lines are the whole post for anyone who does not tap more. Keywords live there: UK broadband, postcode, full fibre, independent.
- Short paragraphs. One CTA: save this, or link in bio.
- Three to five hashtags: {professional_ig_hashtags()} plus one topical if needed (#OneTouchSwitch, #SocialTariffs).
- No #BritishProblems, no emoji walls, no "link in comments".
- Specific deal claims are ads. Label those #ad, upfront. These launch posts are brand explainers, not deal ads.

## Audio

Original VO, British, calm. If you use a sound, the on-screen type must still work muted.

## Sharing

Cross a Reel to Stories with a poll ("useful?"). Do not dump the same TikTok sketch onto the grid until the first 9 professional tiles are live.
"""


def ig_account_setup_md(brand: BrandProfile) -> str:
    handle = brand.social_handles.get("instagram", "@broadbandpicker")
    bio = ig_bio_text()
    name = ig_name_field()
    highlights = professional_ig_highlights()
    hl_rows = "\n".join(
        f"| {i} | {h['title']} | {h['job']} | {h['frames']} |"
        for i, h in enumerate(highlights, start=1)
    )
    stories = professional_ig_stories()
    st_rows = "\n".join(f"| {s['day']} | {s['series']} | {s['mechanic']} |" for s in stories)
    return f"""# Instagram account setup: {handle}

Do this on day 0, before any post. Professional UK consumer accounts (Monzo, Octopus Energy, Which?) look finished on first visit. Comparison competitors either look like voucher tiles or like an empty footer icon. We take the finished-publisher look.

## Switch the account type

1. Settings, Account type and tools, Professional account.
2. Choose **Business**.
3. Category: **Internet Company** (or Information Technology Company if that is the closest picker).
4. Connect the Facebook Page later if you already have one. Do not wait on it to post.

## Profile photo

- File: `docs/branding-and-marketing/broadbandpicker-logo-icon.png`
- 320 x 320 minimum. Logo centred on navy {BRAND_NAVY}. No wordmark in the circle. No white ring.
- The circle crops tight. Test it at 110px. If the wifi arcs vanish, enlarge the mark.

## Name, handle, website

Paste these exactly.

**Username**

```
broadbandpicker
```

Public URL: https://www.instagram.com/broadbandpicker/

**Name (searchable, 30 characters)**

```
{name}
```

Instagram search reads this field. "UK Broadband" is the niche keyword. Do not put a slogan here.

**Website**

```
{SITE}
```

One link. The site is the product. Do not add Linktree.

**Email (contact button)**

```
{brand.emails.get("hello") or "hello@broadbandpicker.co.uk"}
```

Partnerships stay on LinkedIn and `partnerships@broadbandpicker.co.uk`. Instagram contact is for consumers.

## Bio (150 characters)

Count is {len(bio)}. Limit is 150.

```
{bio}
```

Three lines. Who we are, the differentiator, the action. No hashtags, no emoji, no URL (the website field holds that).

## Highlights

Create all seven on day 0 with branded covers, even if each only has three frames to start. Order is the funnel.

| # | Title | Job | First frames |
|---|---|---|---|
{hl_rows}

**Cover spec (all seven, same system)**

- 1080 x 1920 Story, then let Instagram circle-crop.
- Full navy {BRAND_NAVY} field.
- One sky {BRAND_PRIMARY} icon in the centre (wifi, house, arrows, glass fibre, pound, table, book).
- White title sits in the Highlight label, not on the artwork. Keep cover icons only.
- Same padding every cover so the row looks designed.

ChatGPT prompt for one cover, then change only the icon:

```
Square-friendly Instagram highlight cover. 1080x1920. Full-bleed deep navy #0F172A. Centre: one simple sky-blue #0EA5E9 line icon, 2px stroke, no fill, no text, no wordmark, no emoji, no circle border. Icon: [WIFI ARCS]. Flat, matte, plenty of empty navy. No photoreal, no 3D, no people.
```

## Grid before you post

Plan the first 9 as a 3 x 3. Publish them in three days, not nine weeks. All 1080 x 1350, navy/paper/sky, Inter ExtraBold, wifi-mark in the footer. Full captions in `professional-content.md`.

| | 1 | 2 | 3 |
|---|---|---|---|
| **Row 1** | IG-001 Who we are | IG-002 Postcode first | IG-003 Rankings not sold |
| **Row 2** | IG-004 How switching works | IG-005 Social tariffs | IG-006 Fibre vs full fibre |
| **Row 3** | IG-007 Speed you need | IG-008 Out of contract | IG-009 Check your postcode |

Row 1 is trust. Row 2 is useful. Row 3 is the ask. Providers lurking see independence on tiles 1, 3 and 9.

## Stories, once the grid exists

| Day | Series | Mechanic |
|---|---|---|
{st_rows}

Rules: one link sticker per set. Never screenshot a customer bill with an address. Save useful replies into a Highlight only if they do not contain personal data.

## Reels

15-30 seconds. Explainer, not sketch, until the grid looks like a publisher. First frame is a still poster. Burned-in captions. Dry British VO. Navy end card: BroadbandPicker, broadbandpicker.co.uk. Start with IG-011 and IG-012.

## Do not

- Post a voucher "from £19" tile.
- Reproduce BT, Sky or Virgin logos.
- Use Impact on white.
- Put jokes in the first 9. Humour can come back on Reels once the shopfront exists.
- Write "link in comments".
- Leave the profile on Personal.
"""


def ig_professional_content_md(brand: BrandProfile) -> str:
    posts = professional_ig_posts(brand)
    blocks = []
    for post in posts:
        slides = "\n".join(f"{i}. {line}" for i, line in enumerate(post["slides"], start=1))
        size = "1080x1920" if post["format"] == "reel" else "1080x1350"
        prompt = (
            f"Create a {size} Instagram {post['format']} graphic for BroadbandPicker. "
            f"UK English. Independent UK broadband comparison. Rankings are not sold.\n\n"
            f"{DESIGN_LOOK}\n\n"
            f"THIS POST IS PROFESSIONAL PUBLISHER CONTENT, not a meme. "
            f"Inter ExtraBold headlines. No Impact. No SALE red. No fake ISP logos. "
            f"No em dash in any on-screen text. Fibre not fiber.\n\n"
            f"ON-SCREEN TEXT, exactly:\n"
            + "\n".join(f'- "{line}"' for line in post["slides"])
            + f"\n\nVISUAL: {post['visual']}\n"
        )
        blocks.append(
            f"""## {post['id']} - {post['title']}

- Grid: {post['grid']} · Format: {post['format']}
- First comment: {post['first_comment']}

**Caption (paste)**

```
{post['caption']}
```

**First comment (paste)**

```
{post['first_comment']}
```

**Alt text**

```
{post['alt']}
```

**On-screen slides / cards**

{slides}

**ChatGPT / image prompt ({size})**

```
{prompt}
```
"""
        )
    return (
        "# Professional Instagram content: paste and post\n\n"
        "This is the Instagram voice: a UK comparison publisher. Short, factual, independent. "
        "X and TikTok keep the jokes. Do not paste a hostage-situation caption onto this grid.\n\n"
        "First 9 fill the profile. IG-010 onwards is week 2.\n\n"
        + "\n".join(blocks)
    )


def ig_reels_md(brand: BrandProfile, bank: list[Idea]) -> str:
    posts = [p for p in professional_ig_posts(brand) if p["format"] == "reel"]
    pro_body = []
    for post in posts:
        slides = "\n".join(f"  - {line}" for line in post["slides"])
        pro_body.append(
            f"### {post['id']} — {post['title']}\n\n"
            f"{post['hook']}\n\n"
            f"**Cards**\n{slides}\n\n"
            f"**Caption**\n\n```\n{post['caption']}\n```\n"
        )
    return f"""# Instagram Reels

Professional explainers first. Vertical 1080x1920, 15-30 seconds. Captions burned in. First frame must read as a poster because that is what the feed shows.

Hook in the first second, on screen, not in a voiceover preface. End on the navy BroadbandPicker card.

## Launch Reels

{chr(10).join(pro_body)}

## Later (only after the first 9 feed tiles exist)

Joke-engine Reels can follow, recut from TikTok 24 hours later, never before. Keep the first frame on-brand (navy/paper, not a raw TikTok watermark).
"""


def ig_stories_md(brand: BrandProfile, bank: list[Idea]) -> str:
    rows = "\n".join(
        f"| {s['day']} | {s['series']} | {s['mechanic']} |"
        for s in professional_ig_stories()
    )
    highlights = "\n".join(
        f"- **{h['title']}** — {h['frames']}"
        for h in professional_ig_highlights()
    )
    return f"""# Instagram Stories

Professional weekday habit, not a sticker playground. 1080x1920, 5 seconds a frame, navy or paper. Type sits above the sticker tray.

## Recurring series

| Day | Series | Mechanic |
|---|---|---|
{rows}

## Highlight frames to film on day 0

{highlights}

## Hygiene

- No more than one link sticker per set.
- Never screenshot a customer's bill with a visible address.
- Do not save joke replies into Highlights until the seven professional covers exist.
"""


def ig_posts_md(brand: BrandProfile, bank: list[Idea]) -> str:
    posts = professional_ig_posts(brand)
    feed = [p for p in posts if p["format"] in {"carousel", "feed"}]
    body = []
    for post in feed:
        slides = "\n".join(f"  - {line}" for line in post["slides"])
        body.append(
            f"### {post['id']} — {post['title']}\n\n"
            f"- **Grid:** {post['grid']} · **Format:** {post['format']}\n"
            f"- **Hook:** {post['hook']}\n\n"
            f"**Slides**\n{slides}\n\n"
            f"**Caption (paste)**\n\n```\n{post['caption']}\n```\n\n"
            f"**First comment:** {post['first_comment']}\n\n"
            f"**Alt text:** {post['alt']}\n"
        )
    return f"""# Instagram feed posts (professional publisher grid)

Feed is the shopfront. Educational carousels and one brand tile. If it looks like a voucher or a meme page, it does not go here.

Carousels: slide 1 is the claim, slides 2-4 earn the save, last slide is the URL.

Caption formula: two-line hook with keywords, short explanation, save this, link in bio, 3-5 hashtags.

Paste-ready blocks with ChatGPT prompts: `professional-content.md`.

## First 9 and week 2

{chr(10).join(body)}
"""


def ig_design_md(brand: BrandProfile) -> str:
    return f"""# Instagram design system

The grid should look like a niche publisher, not a meme page that found a wifi joke. Professional captions; plush minimalism in the picture. Full rules: `../06-visual-design-system.md`. First 9 tiles: `professional-content.md`.

## Colour

| Token | Hex | Use |
|---|---|---|
| Sky | {brand.colours.get("primary", BRAND_PRIMARY)} | Highlights, wifi-mark, links, one accent line |
| Navy | {brand.colours.get("navy", BRAND_NAVY)} | End cards, carousels, Stories, most fields |
| Green | {brand.colours.get("accent", BRAND_GREEN)} | Genuine good-news ticks only |
| Soft sky | {BRAND_SKY_SOFT} | 10–20% glow, never a fill |
| Paper | {BRAND_SLATE} | Quote-card background alt |
| White | {BRAND_WHITE} | Type on navy |

## Type

- Site-faithful: **Inter ExtraBold** headlines, Inter Regular body. This is the default.
- Quote remix: a readable serif (Playfair / Source Serif) on a navy or paper card.
- Official-pastiche: whatever the format needs (dot matrix, highways, Met Office), always slightly wrong so it reads as parody — then put that pastiche *on* a navy canvas so the grid stays expensive.
- Avoid raw Impact-on-white in the feed. If a meme font is the joke, frame it.

## Logo

Source: `docs/branding-and-marketing/broadbandpicker-logo-icon.svg` and `public/logo.svg`.

- End card: mark + wordmark, centred, URL under.
- Feed: mark bottom-left, 64px at 1080, 5% margin.
- Never stretch. Never recolour the mark to green.

## Sizes

| Placement | Size | Safe |
|---|---|---|
| Reel / Story | 1080x1920 | Keep type out of bottom 250px and top 150px |
| Feed 4:5 | 1080x1350 | Preferred |
| Feed 1:1 | 1080x1080 | Quote cards |
| Carousel | 1080x1350 | Same type size every slide |

## End card (standard 0.4–1.0s or last carousel slide)

Navy field. Wifi-mark. **BroadbandPicker**. One line joke leftover or "Compare your postcode". {SITE}

## Production default when there is no designer

iPhone, a navy full-screen title in CapCut / VN, burned-in captions, staff or founder VO. Ship it. Polish winners later.
"""


def tiktok_strategy_md(brand: BrandProfile) -> str:
    return f"""# TikTok strategy — {brand.social_handles.get("tiktok")}

TikTok is how strangers meet BroadbandPicker. Play native or do not play.

## Account

- Name: BroadbandPicker
- Bio: UK broadband comparison. Postcode first. Rankings not sold.
- Website: {SITE}
- Photo: logo icon
- Full paste fields: `../profiles-all.md`
- Post vertical only. No watermarks from other apps (film IG *after* TikTok, not before).

## Cadence

Daily for 30 days. Then 5 a week. Evening slots (18:30–21:00) and lunch.

## Native patterns that fit this brand

- POV: "you're the router in a British cupboard"
- Green screen: a fake bill, a fake warning, a fake TfL board
- Storytime: 20s, one specific incident
- Street-interview energy (even if it's just you on a sofa): "what do you pay for broadband"
- Duet / stitch a provider ad (fair-dealing commentary, don't just dunk with music)

## Captions

One or two lines, the punchline, a question. Hashtags: 3. #broadband #britishhumour #ukinternet is plenty.

## Comments

Pin a question. Reply in-character. Pull the best comment into tomorrow's video.

## Advertising later

Only Spark Ads on videos that already have strong watch-through. Never boost a dud. Never run a hard "sign up with X provider" as the first paid thing — that's how you look like a voucher account. Boost the joke, land on the postcode checker.
"""


def tiktok_ideas_md(brand: BrandProfile, bank: list[Idea]) -> str:
    clips = [i for i in bank if "tiktok" in i.formats or "tiktok" in i.platforms]
    body = "\n\n".join(render_idea(i, brand, platform="tiktok") for i in clips)
    return f"""# TikTok video ideas

All 7–15s unless noted. Hook is spoken **and** burned in. End on the face or the joke, then a 0.4s brand sting.

## Ideas

{body}
"""


def tiktok_design_md(brand: BrandProfile) -> str:
    return f"""# TikTok design briefs — house rules

- 1080x1920, 30fps, captions always.
- First frame = poster. Assume the algorithm shows a still.
- VO: dry UK, close-miked, unimpressed. No radio-ad warmth.
- Text: max 6 words on screen at a time.
- End sting: navy, wifi-mark, `{SITE.replace("https://", "")}`.
- Do not use other platforms' watermarks.
- Do not use uncleared Premier League, BBC, TfL or Greggs marks on paid ads.
- Film once, cut two hooks, post the better one, save the other for IG tomorrow.

Palette: {brand.colours}
"""


def x_design_md(brand: BrandProfile) -> str:
    return f"""# X design briefs — house rules

- Prefer native text. Images when the joke **is** a poster (Keep Calm, Met Office, TfL, quote card).
- Image size: 1600x900 (16:9) or 1080x1080. Avoid 9:16 as the main tweet image — it collapses.
- Alt text: write the joke again, for once.
- No more than one image unless it is a before/after bill.
- Brand mark small. If they cannot read the tweet without the image, the tweet is too weak.

Palette: {brand.colours}
"""


def intent_plan_md(brand: BrandProfile, bank: list[Idea]) -> str:
    blocks = []
    by_intent: dict[str, list[Idea]] = {}
    for idea in bank:
        for intent in idea.search_intents or ["Unmapped"]:
            by_intent.setdefault(intent, []).append(idea)
    for row in brand.search_intents:
        name = row["intent"]
        ideas_for = by_intent.get(name, [])
        idea_lines = "\n".join(
            f"- `{i.id}` {i.title} — {', '.join(i.platforms)}" for i in ideas_for
        ) or "- (write one — this intent is a gap this run)"
        blocks.append(
            f"""### {name}

| | |
|---|---|
| **Queries people actually type** | {row['queries']} |
| **Who** | {row['who']} |
| **Channels that reach them** | {row['channels']} |
| **Why those channels** | {row['why_channel']} |
| **Content angle (sarcastic, shareable)** | {row['content']} |
| **Site pages to land on** | {row['site']} |

**Ideas in this kit**

{idea_lines}

"""
        )
    return f"""# Intent → channel → content plan

BroadbandPicker is a comparison site. People do not open Instagram looking for 'FTTP'. They open it because the Wi-Fi died, the bill jumped, or a mate tagged them. Search intents still matter: they are the jobs-to-be-done the jokes have to serve, and they are how you pick a URL.

This map is built from the live site (guides, tools, postcode hubs) plus 2026 UK market facts (Ofcom switching, social tariffs, full fibre). Humour stays casual and sarcastic. Each joke still opens a door to a real page.

## How to use this

1. Pick the intent you want traffic for this week.
2. Post the matching idea on the channels listed — not on every channel out of guilt.
3. Land on the listed URL with UTM tags the captions already include.
4. If providers are the audience, skip TikTok and go to `07-affiliate-b2b-playbook.md`.

## The map

{''.join(blocks)}

## Weekly mix across intents (so it doesn't become all loyalty-tax)

| Week slot | Intent to hit | Why |
|---|---|---|
| Mon | Out of contract / loyalty tax | Bill-payer hangover. High tags. |
| Tue | How to switch / OTS | Useful-funny. Saves. |
| Wed | Slow Wi-Fi / speed test | Participatory. Numbers in comments. |
| Thu | Compare / full fibre | Teaches. Positions the brand. |
| Fri | Cheap deals / cashback | Commercial. Don't hard-sell. |
| Sat | Football / buffering | Appointment virality. |
| Sun | Social tariffs or moving house | Trust, or next week's movers. |

Once a week, one LinkedIn post from the B2B list. That is how broadband companies notice you.
"""


def visual_system_md(brand: BrandProfile) -> str:
    logos = "\n".join(f"- `{path}`" for path in brand.logo_files) or "- `public/logo.svg`"
    return f"""# Visual design system — Engineer Window poster

Every still should look like the Engineer Window reference: navy outer canvas, paper inner card, giant navy type, sky punchline, British editorial cartoon, wifi-mark footer.

## One sentence

If it would not sit next to that Engineer Window poster in a 3x3 grid, rewrite the picture.

## Colour

| Token | Hex | Role |
|---|---|---|
| Navy | `{brand.colours.get("navy", BRAND_NAVY)}` | Default field, end cards, LinkedIn, carousels |
| Sky | `{brand.colours.get("primary", BRAND_PRIMARY)}` | Wifi-mark, one underline, one node, links |
| Soft sky | `{BRAND_SKY_SOFT}` | 10–20% glow behind a node, never a fill |
| Paper | `{BRAND_SLATE}` | Quote cards, 'document' posts |
| White | `{BRAND_WHITE}` | Type on navy |
| Green | `{brand.colours.get("accent", BRAND_GREEN)}` | One tick. Never a background. Never the logo. |

No rainbow. No neon. No grey-on-grey. Contrast is a feature.

## Composition

- At least 40% of the frame is empty.
- Margins 8–12%.
- One joke, one focal object (router, bill, cupboard, map-dot, wifi arc).
- Soft contact shadow, matte, not glossy 3D.
- Corner radius 24–32px on cards, matching the logo's rounded-square personality.
- Safe zones: keep type out of the top 150px and bottom 250px on 9:16.

## Poster layout (non-negotiable)

1. Navy `{BRAND_NAVY}` full bleed.
2. Paper `{BRAND_SLATE}` rounded card (28-32px radius).
3. Small sky icon.
4. Huge Inter ExtraBold navy headline (2-5 words).
5. Sky hairline.
6. Giant navy fact or time.
7. Sky punchline.
8. Editorial British cartoon, often a before/after split with time labels.
9. Navy footer: sky rounded-square wifi-mark, white BroadbandPicker, broadbandpicker.co.uk.

Simple cartoon people (jumpers, slippers, glasses) are allowed. Photoreal people are not.

Do **not**: claymation, stickers, celebrity likeness, fake ISP logos, QR codes, SALE red, shocked YouTube face.

## Type

- Default: Inter ExtraBold for the line, Inter Regular for the whisper.
- Quote remix: Playfair / Source Serif on a navy card.
- Pastiche (Met Office, TfL, Keep Calm): use the joke format, then sit it on a navy canvas so the grid still looks like us.
- Max ~8 words on a 9:16 cover. Max ~12 on a 4:5 feed.

## Logo

Source files:

{logos}

Rules: native joke first, brand last. Never recolour the mark green. Never stretch. Never put it on the punchline. End card: navy field, mark, wordmark, one URL `{SITE.replace('https://', '')}`.

## Sizes

| Placement | Size | Notes |
|---|---|---|
| IG feed / FB / carousel | 1080×1350 | Preferred |
| IG quote card | 1080×1080 | Serif quotes |
| Reel / Story / TikTok cover | 1080×1920 | First frame is a poster |
| X | 1600×900 | Don't lead with 9:16 |
| LinkedIn | 1200×627 | Inter only, no Impact |
| YouTube thumb | 1280×720 | No red arrow, no shock-face |

## How to brief ChatGPT

Open `04-design-prompts.md` or the `chatgpt_prompt` column in the calendar. Each prompt already describes this poster system, the size, the on-screen text and the logo footer.

Design stills by the `design_by_date` / `design_by_time_uk` columns. Post at `time_uk` Europe/London. See `uk-posting-and-design-times.md`.

## Motion (Reels / TikTok / Shorts)

- 7–15s unless it's a how-to.
- Type slaps on, doesn't bounce like a supermarket ad.
- Burned-in captions always.
- VO: dry UK, close-miked, unimpressed.
- End sting 0.4–1.0s navy + mark + URL.
- Film TikTok first, Reels the next day with a different first frame.

## What 'plush' does **not** mean

It does not mean quiet to the point of boredom. The *copy* can be rude about loyalty tax. The *picture* should still look like it belongs on the website.
"""


def affiliate_playbook_md(brand: BrandProfile, research: dict[str, Any]) -> str:
    market = research.get("curated", {}).get("broadband_market", {})
    affiliate = research.get("curated", {}).get("affiliate_and_ads", {})
    return f"""# How social gets broadband companies to call us

Consumer jokes make the brand look alive. LinkedIn + trust pages make it look safe. Together they are the reason an ISP affiliate manager replies to `{brand.emails['partnerships']}` instead of binning the cold email.

## What Awin and ISP partnership teams actually look at

From Awin's own advertiser-success guidance and comparison-site publisher positioning (live-fetched when the script runs):

- {affiliate.get('awin', 'Live content-rich site, relevant audience, brand-safe neighbouring content.')}
- Social following is a **supporting** signal. Awin still wants the website: methodology, disclosure, real pages.
- Advertisers ask: is this promotional type right for us? Are we happy to sit next to this content? Is the audience UK broadband shoppers?

ASA / CAP, because you will get this wrong once if nobody writes it down:

- {affiliate.get('asa_cap', 'Affiliate links in social = ads. Label them.')}

## The inbound loop

```
TikTok / IG / X joke
        → branded search + profile visits
        → comparison sessions on {SITE}
        → affiliate conversions (when programmes exist)
        → LinkedIn posts a true milestone or a methodology note
        → ISP partnership manager Googles "BroadbandPicker"
        → sees /how-we-make-money, /how-we-review-broadband, a living social grid
        → emails {brand.emails['partnerships']}
```

That is the opposite of "we have 40 fake followers, please approve us."

## What to pin and feature

**LinkedIn company page — featured**

1. `{SITE}/how-we-make-money`
2. `{SITE}/how-we-review-broadband`
3. `{SITE}/editorial-policy`
4. `{SITE}/deals`
5. This post: we list providers with or without an affiliate deal (`X-025`)

**LinkedIn about**

Independent UK broadband comparison. Postcode-level deals, {len(brand.providers)} providers on the record, public methodology. Partnerships: {brand.emails['partnerships']}

**X bio** already does the consumer joke. Keep it. LinkedIn does the suit.

## Cadence that looks like a publisher

- 2–3 LinkedIn posts a week. Founder voice. No 'we're thrilled to announce'.
- Mix: one market fact (Ofcom, OTS, social tariffs), one methodology, one 'we still list you unsigned'.
- Comment on ISP and Awin people for 15 minutes after posting. The algorithm is a conversation here too.
- Once a month, a document carousel that *is* a mini media kit: provider count, guide count, trust pages, contact.

## Facts you can use (dated, don't invent better ones)

- One Touch Switch live {market.get('one_touch_switch_launched', '12 Sep 2024')}; {market.get('residential_switches_since_ots', '2m+')} residential switches.
- Social tariffs: {market.get('social_tariff_options', '30+')} options, {market.get('social_tariff_price_band', '£12.50–£24')}. Take-up {market.get('social_tariff_takeup_jun_2025', '532,000')} (Jun 2025). {market.get('eligible_unaware_oct_2025_pct', 70)}% of eligible households unaware (Oct 2025).
- Full fibre to roughly {market.get('full_fibre_homes_pct_approx', '80%+')} of UK homes.
- Site currently compares: {', '.join(brand.providers[:8])}{'…' if len(brand.providers) > 8 else ''}.

If a number is not on this list or in Ofcom/the repo, do not put it on LinkedIn.

## Outreach, now that social exists

Send `docs/affiliate-outreach-email.txt` **with**:

- LinkedIn company URL
- X {brand.social_handles.get('x')}
- Instagram {brand.social_handles.get('instagram')}
- 3 screenshots of the grid (one joke, one useful carousel, one methodology)
- The trust-page URLs

Subject line that isn't needy: "Publisher adding [Provider] — independent UK broadband comparison."

## Posts in this kit aimed at them

`X-025` we list you anyway · `X-034` Awin-ready publisher energy · `X-046` 70% unaware · `X-047` two million switches · `X-050` landlords / HMO.

Full copy: `LinkedIn/posts.md`.
"""


def research_md(research: dict[str, Any]) -> str:
    curated = research.get("curated", {})
    reach = curated.get("uk_social_reach_pct_18plus_monthly", {})
    reach_rows = "\n".join(
        f"| {k} | {v}% |" for k, v in reach.items() if k != "source"
    )
    fetches = research.get("fetches", [])
    fetch_lines = "\n".join(
        f"| {r.get('label', r.get('key'))} | {r.get('status')} | {'yes' if r.get('ok') else 'no'} | {r.get('url')} |"
        for r in fetches
    ) or "| (skipped) | — | — | — |"
    notes = "\n".join(f"- {n}" for n in research.get("notes", []))
    ofcom = curated.get("ofcom_media", {})
    market = curated.get("broadband_market", {})
    return f"""# Web research behind this kit

Generated `{research.get('generated_at')}`. Live fetches {'were skipped' if research.get('skipped') else 'ran'}.

The planner does two things: it **scrapes** a short list of live pages (own site, Ofcom, ASA, Awin, comparison hubs) and it **applies curated 2026 UK facts** for sources that are PDFs or JS shells. Neither copies competitor prose into captions.

## Why the channel list looks like this

Ofcom / DataReportal 2025–26, UK adults 18+ monthly reach:

| Channel | Monthly reach |
|---|---|
{reach_rows}

- {reach.get('source', '')}
- {ofcom.get('adult_social_users_pct', 89)}% of adult internet users use social; {ofcom.get('social_users_16_34_pct', 97)}% of 16–34s.
- Only {ofcom.get('actively_post_share_comment_pct', 49)}% actively post, share or comment (down from {ofcom.get('actively_post_share_comment_pct_2024', 61)}% in 2024). Design for lurkers who screenshot and tag.
- Adults ~{ofcom.get('adults_online_hours_per_day', 4.5)} hours online/day. YouTube, Facebook/Messenger, WhatsApp are the default apps.

**Implication:** open YouTube, Facebook, WhatsApp, Instagram, TikTok, X, LinkedIn, Reddit-as-a-human. Skip Snapchat and Bluesky until the P0 channels are a habit. Pinterest later, for movers.

## Broadband facts the jokes have to respect

- OTS live {market.get('one_touch_switch_launched')}; {market.get('residential_switches_since_ots')} switches.
- Social tariffs {market.get('social_tariff_options')}, {market.get('social_tariff_price_band')}; take-up {market.get('social_tariff_takeup_jun_2025')}; {market.get('eligible_unaware_oct_2025_pct')}% of eligible unaware.
- Source: {market.get('source')}

## Competitor gap

{curated.get('competitor_gap', '')}

## Live fetches this run

| Source | HTTP | OK | URL |
|---|---|---|---|
{fetch_lines}

{notes}

Raw excerpts: `00-web-research.json`.

## Instagram professional setup (scraped)

{(research.get("instagram_professional") or {}).get("implication", "")}

Live IG profile fetches often hit a login wall. Curated bios used when the scrape is thin: Monzo ("Hi, we're Monzo. We're a bank that lives on your phone."), Octopus Energy (better energy for you, wallet, planet). Full rules and paste-ready bio: `Instagram Content creation/account-setup.md`.
"""


def linkedin_strategy_md(brand: BrandProfile) -> str:
    return f"""# LinkedIn strategy — company page BroadbandPicker

This is not where the jokes live. This is how ISP partnership teams, Awin account managers and altnet marketers decide you are a real publisher.

## Setup

- Company page name: **BroadbandPicker**
- Tagline, Overview, specialties: paste from `account-setup.md` (Overview {len(linkedin_overview_text())} / 2000)
- Location: United Kingdom
- Website: {SITE}
- Contact: {brand.emails['partnerships']}
- Logo: `docs/branding-and-marketing/broadbandpicker-logo-icon.png`
- Banner: navy field, wifi-mark, one line: "We list providers whether or not they pay us."

Founder profile should also post. Company pages without a human in the comments are a brochure.

## Cadence

2–3 posts/week, Tue and Fri 09:30 UK. Document carousels once a fortnight.

## Mix

| Share | Type | Example in this kit |
|---|---|---|
| 40% | Market literacy | `X-046` 70% unaware, `X-047` 2m switches |
| 30% | Methodology / independence | `X-025`, `X-034` |
| 20% | Product, without voucher energy | tools, coverage, guide count — only if true |
| 10% | Soft ask | partnerships@ |

## Voice

Dry, specific, no 'synergy'. A smirk is allowed. Impact font is not.

## Don't

- Fake traffic numbers.
- 'Official partner of' until you are.
- Cross-post a Drake meme here.
- Tag a provider to dunk on them.

Full posts: `posts.md`. Design: Inter ExtraBold on navy, 1200×627.
"""


def linkedin_posts_md(brand: BrandProfile, bank: list[Idea]) -> str:
    ideas_ = [i for i in bank if "linkedin" in i.platforms]
    body = "\n\n".join(render_idea(i, brand, platform="linkedin") for i in ideas_)
    return f"""# LinkedIn posts — paste-ready

Company page + founder. Each block is a full post, a first comment, alt text and a ChatGPT prompt for the 1200×627 still.

{body}
"""


def youtube_strategy_md(brand: BrandProfile) -> str:
    return f"""# YouTube strategy — BroadbandPicker

YouTube is the UK's most-reached social/video surface (Ofcom). It is also where people type 'how to switch broadband' and 'cheap broadband 2026'. Shorts first; one long-form a month from month 2.

## Channel

- Name: BroadbandPicker
- Handle: @broadbandpicker
- About: paste from `../profiles-all.md` (first 150 characters are the search snippet)
- Trailer: 20s cut of the best explainer + "check your postcode"
- Links: Site, Deals, Switch guide, Social tariffs, Partnerships
- Branding: navy end card, Inter, wifi-mark. No red-arrow thumbnails.

## Cadence

- Shorts: 4/week once TikTok is flowing (mirror, new first frame, no TikTok watermark).
- Long-form: 1/month from month 2 — 6–8 min, chapters, on-screen CTA to the postcode checker.

## Titles that match search intent

- How to switch broadband in the UK (2026) — it's annoyingly easy now
- Cheap broadband UK: there is no national cheapest
- Social tariffs: the discount 70% of eligible households haven't heard of
- Full fibre vs 'fibre' (FTTP vs FTTC)
- What speed do you actually need?

## Thumbnails

1280×720, navy, huge type, one object, wifi-mark corner. Never a shocked face. Prompt for each idea is in `04-design-prompts.md` under YouTube thumbnail.

## Money

Don't hard-affiliate in the first 30 days of a video. End screen: postcode checker. Cards: the matching guide. #ad only if a specific deal is named with a tracked link.
"""


def youtube_ideas_md(brand: BrandProfile, bank: list[Idea]) -> str:
    ideas_ = [i for i in bank if "youtube" in i.platforms or "youtube" in i.formats]
    if not ideas_:
        ideas_ = [i for i in bank if i.pillar in {"useful-funny", "b2b"}][:8]
    body = "\n\n".join(render_idea(i, brand, platform="youtube") for i in ideas_)
    return f"""# YouTube Shorts and how-tos — paste-ready

Titles, descriptions, first comments and thumbnail briefs. Film vertical for Shorts; crop the same VO for long-form later.

{body}
"""


def facebook_strategy_md(brand: BrandProfile) -> str:
    return f"""# Facebook strategy — BroadbandPicker

Ofcom: Facebook & Messenger still reach about two-thirds of UK adults monthly. This is where 35–60 bill-payers, parents and local groups live. Not where students discover you.

## Page

- Name: BroadbandPicker
- Category: Website
- Short description and About: paste from `../profiles-all.md`
- Website: {SITE}
- Avatar: logo icon. Cover: navy, "Independent UK broadband comparison."

## Cadence

Month 2: 3–4/week, mostly recycled IG. Native the caption — Facebook hates 'link in bio'. Put the URL in the post.

## What actually shares here

- April price-rise explainers (`X-016`, `X-049`)
- Social tariffs (`X-013`, `X-046`) — Which? already showed ISPs don't post this
- Out of contract (`X-001`, `X-040`)
- Moving house (`X-028`)
- Rural Yeti van (`X-032`, `X-042`) into local groups **only if useful, never spam**

## Groups

Do not dump deals in local groups. If you answer a real 'what's good broadband in [town]?' question, disclose that you run a comparison site and link the postcode checker once.

## Ads later

Boost a social-tariff or out-of-contract graphic that already has organic shares. Landing page: the matching guide, not a generic homepage.
"""


def facebook_posts_md(brand: BrandProfile, bank: list[Idea]) -> str:
    ideas_ = [i for i in bank if "facebook" in i.platforms]
    body = "\n\n".join(render_idea(i, brand, platform="facebook") for i in ideas_)
    return f"""# Facebook posts — paste-ready

Captions include the URL (Facebook is not a link-in-bio platform). First comment and alt text included.

{body}
"""


def ready_to_post_md(brand: BrandProfile, bank: list[Idea], platform: str) -> str:
    if platform == "instagram":
        return ig_professional_content_md(brand)
    ideas_ = [i for i in bank if platform in i.platforms or platform in i.formats]
    blocks = []
    for idea in ideas_:
        caps = channel_captions(idea, brand)
        caption_key = {
            "x": "x",
            "instagram": "instagram",
            "tiktok": "tiktok",
            "linkedin": "linkedin",
            "facebook": "facebook",
            "youtube": "youtube_description",
        }[platform]
        prompts = image_prompts_for_idea(idea)
        prompt_block = ""
        wanted = {
            "x": "x_image",
            "instagram": "instagram_feed",
            "tiktok": "tiktok_cover",
            "linkedin": "linkedin",
            "facebook": "facebook",
            "youtube": "youtube_thumb",
        }[platform]
        match = next((p for p in prompts if p["placement_key"] == wanted), prompts[0] if prompts else None)
        if match:
            prompt_block = (
                f"**ChatGPT / image prompt ({match['size']}) — paste this**\n\n"
                f"```\n{match['prompt']}\n```\n"
            )
        extra = ""
        if platform == "youtube":
            extra = f"**Title:** {caps['youtube_title']}\n\n"
        blocks.append(
            f"""## {idea.id} — {idea.title}

- Format: {', '.join(idea.formats)} · intents: {', '.join(idea.search_intents) or 'general'}
- Compliance: {idea.compliance}

{extra}**Caption (paste)**

```
{caps[caption_key]}
```

**First comment (paste)**

```
{caps['first_comment']}
```

**Alt text**

```
{caps['alt_text']}
```

{prompt_block}"""
        )
    return (
        f"# Ready to post — {platform}\n\n"
        "Each block is a complete post: caption, first comment, alt text, and a ChatGPT "
        "illustration prompt in BroadbandPicker's plush navy/sky look. Copy, generate the "
        "frame, post.\n\n" + "\n".join(blocks)
    )


def readme_md(brand: BrandProfile, weeks: int) -> str:
    return f"""# Social media manager

This folder is BroadbandPicker's social operating kit. It is generated by:

```bash
python3 scripts/plan_social_media_strategy.py
```

The script reads this workspace (about, how-we-make-money, providers, guides, tools, colours, X calendar, content plan), **scrapes live pages** (own site, Ofcom, ASA, Awin, comparison hubs), and writes a brand-aware kit you can design and post from: sarcastic UK-broadband humour, intent-mapped channel plans, paste-ready captions, and ChatGPT illustration prompts in the site's plush navy/sky look.

## What to open first

| If you want to… | Open |
|---|---|
| Understand the plan | `03-master-strategy.md` |
| Pick channels | `01-channel-recommendations.md` |
| Match jokes to search intent | `05-intent-content-plan.md` |
| Generate a picture in ChatGPT | `04-design-prompts.md`, `chatgpt-design-brief.md`, or the calendar `chatgpt_prompt` column |
| UK post and design times | `uk-posting-and-design-times.md` |
| Launch from zero posts | `09-day-zero-launch.md` then the `Launch 14 days` tab |
| Post today | `*/ready-to-post.md` in each channel folder |
| Set up Instagram like a professional publisher | `Instagram Content creation/account-setup.md` then `professional-content.md` |
| Paste bios on every platform | `profiles-all.md` and the **Profiles** tab of the Google Sheet |
| Get ISPs to email you | `07-affiliate-b2b-playbook.md` + `LinkedIn/` |
| See competitor social | `10-competitor-social.md` |
| See the research | `08-web-research.md` and `00-web-research.json` |
| Live working sheet | https://docs.google.com/spreadsheets/d/12sGB-98mD2OXHTAcRlBTAkt2s1V66G04/edit |
| Post once you have artworks | Drop files in `artworks/`, then `python3 scripts/plan_social_media_strategy.py --post` |

Push to the live sheet (after sharing it with the service-account email as Editor, and enabling the Google Sheets API):

```bash
python3 scripts/plan_social_media_strategy.py --sync-google-sheet
```

## Posting (when the ChatGPT stills are ready)

1. Save each illustration as `X-001_instagram.png` (or `X-001__instagram__feed.png`) in `artworks/`.
2. Dry run (prints matches, posts nothing):

```bash
python3 scripts/plan_social_media_strategy.py --post
```

3. Publish one X post for real:

```bash
python3 scripts/plan_social_media_strategy.py --post --live --platform x --limit 1
```

Credentials go in `docs/social media manager/.env.social` (gitignored). Copy from `social-credentials.example`. X, LinkedIn, Facebook and Instagram feed can take a still. TikTok / YouTube / Reels need a `.mp4`.

## Folders

| Folder | What is in it |
|---|---|
| `Instagram Content creation/` | Account setup, professional captions, Reels, Stories, feed, design system, calendar, **ready-to-post** |
| `X/` | Strategy, posts, design rules, calendar, **ready-to-post** |
| `tiktok/` | Native video ideas, design rules, calendar, **ready-to-post** |
| `LinkedIn/` | B2B strategy, paste-ready posts, **ready-to-post** |
| `YouTube/` | Shorts + how-to strategy, **ready-to-post** |
| `Facebook/` | Bill-payer strategy, **ready-to-post** |

Also in this root: voice playbook, brand intelligence JSON, master calendar CSV, Excel planner.

## What to open (accounts)

**Day 0 (setup, no posts):** X {brand.social_handles.get("x")} (linked from the site — still treat as empty), Instagram, TikTok, LinkedIn, YouTube.
**Days 1–3:** Publish the first 9 IG tiles + daily TikTok + pin X-001.
**Month 2:** Facebook page, WhatsApp Channel.
**Later / maybe:** Pinterest, Reddit-as-a-human.
**Skip:** Snapchat, Bluesky.

Details: `01-channel-recommendations.md`. Research: `08-web-research.md`.

## Brand look

Plush, niche, minimal. Not a voucher site.

- Sky `{brand.colours.get("primary", BRAND_PRIMARY)}`
- Navy `{brand.colours.get("navy", BRAND_NAVY)}`
- Accent `{brand.colours.get("accent", BRAND_GREEN)}` (ticks only)
- Paper `{BRAND_SLATE}`
- Type: Inter ExtraBold
- Mark: rounded-square wifi arcs (`docs/branding-and-marketing/broadbandpicker-logo-icon.png`)

Full rules: `06-visual-design-system.md`.

## Voice

Casual British sarcasm. Relatable household humour. Punch up at loyalty tax, "up to" speeds, engineer windows, April rises. Never punch down. Jokes exist to get shares, tags, comments and saves — then a door home to the postcode checker.

Playbook: `02-voice-and-humour-playbook.md`.

## Commercial point of all this

Jokes get reach. Reach gets branded traffic. Traffic gets compared deals. Compared deals get affiliate commissions. A loud, clearly independent brand gets **providers applying to you** instead of the other way round.

Partnerships: {brand.emails["partnerships"]}
"""


def brand_json(brand: BrandProfile) -> dict[str, Any]:
    payload = asdict(brand)
    payload["generated_at"] = datetime.now().isoformat(timespec="seconds")
    payload["design_look"] = DESIGN_LOOK
    payload["idea_pillars"] = [
        "british sarcasm",
        "memes",
        "wise quotes made stupid and British",
        "puns",
        "useful-funny",
        "B2B affiliate gravity",
    ]
    return payload


def idea_by_id(bank: list[Idea], idea_id: str) -> Idea | None:
    for idea in bank:
        if idea.id == idea_id:
            return idea
    return None


def setup_checklist_rows() -> list[dict[str, str]]:
    return [
        {"order": "01", "when": "Day 0, before any post", "task": "Claim Instagram @broadbandpicker (or @broadbandpickeruk)", "owner": "Founder", "status": "Not done", "notes": "Business account. Link website. Category: Website."},
        {"order": "02", "when": "Day 0", "task": "Claim TikTok @broadbandpicker", "owner": "Founder", "status": "Not done", "notes": "Public. Switch to business later. No other-app watermark ever."},
        {"order": "03", "when": "Day 0", "task": "Claim LinkedIn company page BroadbandPicker", "owner": "Founder", "status": "Not done", "notes": "Feature /how-we-make-money and /how-we-review-broadband before posting."},
        {"order": "04", "when": "Day 0", "task": "Create YouTube channel BroadbandPicker", "owner": "Founder", "status": "Not done", "notes": "Do not upload until day 3. Banner navy + wifi-mark."},
        {"order": "05", "when": "Day 0", "task": "X profile: avatar, bio, banner, location UK — do not tweet yet", "owner": "Founder", "status": "Not done", "notes": "Handle is already in the site footer. Empty profiles that are linked from the site are worse than unlinked."},
        {"order": "06", "when": "Day 0", "task": "Same avatar everywhere: docs/branding-and-marketing/broadbandpicker-logo-icon.png", "owner": "Founder", "status": "Not done", "notes": "Square, sky wifi-mark. Do not use a selfie."},
        {"order": "07", "when": "Day 0", "task": "Paste bios from the Profiles tab / profiles-all.md on every account", "owner": "Founder", "status": "Not done", "notes": "Independent UK broadband comparison. Postcode first. Rankings not sold. Website in the website field."},
        {"order": "08", "when": "Day 0", "task": "Generate first 9 Instagram frames in ChatGPT (see First 9 IG grid tab)", "owner": "Founder", "status": "Not done", "notes": "Do not post 1 of 9. Post in a burst so the profile is a 3x3."},
        {"order": "09", "when": "Day 0", "task": "Write the first comment for each launch post in Notes", "owner": "Founder", "status": "Not done", "notes": "Seed it yourself in the first 60 seconds."},
        {"order": "10", "when": "Day 0", "task": "Add IG + TikTok to site footer / schema sameAs once the grids exist", "owner": "Founder", "status": "Not done", "notes": "X is already in app/page.tsx sameAs. Do not link empty profiles."},
        {"order": "11", "when": "Day 1", "task": "Pin X-001 on X. Publish IG 1–3 + TikTok 1. Reply for 60 minutes.", "owner": "Founder", "status": "Not done", "notes": "This is the actual launch. No 'we're live' post."},
        {"order": "12", "when": "Day 8", "task": "First LinkedIn post (X-025) with a screenshot of the living IG grid", "owner": "Founder", "status": "Not done", "notes": "Providers judge the grid. Don't go to LinkedIn with three posts."},
    ]


def ig_post_as_idea(post: dict[str, Any]) -> Idea:
    fmt = post.get("format") or "carousel"
    return Idea(
        id=post["id"],
        pillar="trust",
        title=post["title"],
        hook=post["hook"],
        copy=post["caption"],
        alt_copy=post["hook"],
        cta="Link in bio",
        url_key="home",
        engagement=post["first_comment"],
        hashtags=["#UKBroadband", "#FullFibre", "#BroadbandDeals"],
        platforms=["instagram"],
        formats=[fmt, "story"],
        why=post.get("visual") or "Professional publisher tile.",
        compliance="No invented named prices. Availability by postcode. Rankings not sold.",
        design=DesignBrief(
            format_name=f"Professional IG {fmt}",
            dimensions="1080x1920" if fmt == "reel" else "1080x1350",
            duration="static" if fmt != "reel" else "0:15-0:30",
            visual_concept=post.get("visual") or "",
            on_screen_text=list(post.get("slides") or []),
            palette=standard_palette(),
            type="Inter ExtraBold headlines, Inter Regular body. No Impact.",
            logo=logo_rule(),
            audio="Dry British VO on Reels. Silent on feed.",
            shots=["Slide/card per on-screen line", "Navy footer with wifi-mark and URL"],
            do_not=["No fake ISP logos", "No SALE red", "No meme fonts on the first 9"],
        ),
    )


def first_nine_ig(brand: BrandProfile, bank: list[Idea]) -> list[dict[str, str]]:
    order = [
        ("IG-001", "Feed 1,1", "Who we are. Independent UK broadband comparison."),
        ("IG-002", "Feed 1,2", "Why the postcode comes first."),
        ("IG-003", "Feed 1,3", "Rankings are not sold. How we make money."),
        ("IG-004", "Feed 2,1", "How switching works now. One Touch Switch."),
        ("IG-005", "Feed 2,2", "Social tariffs. Public service."),
        ("IG-006", "Feed 2,3", "Fibre versus full fibre."),
        ("IG-007", "Feed 3,1", "What speed you actually need."),
        ("IG-008", "Feed 3,2", "Out of contract usually costs more."),
        ("IG-009", "Feed 3,3", "Check your postcode. Brand tile."),
    ]
    by_id = {p["id"]: p for p in professional_ig_posts(brand)}
    rows = []
    for i, (idea_id, slot, why) in enumerate(order, start=1):
        post = by_id.get(idea_id)
        idea = ig_post_as_idea(post) if post else idea_by_id(bank, idea_id)
        if not idea:
            continue
        rows.append({
            "grid_slot": slot,
            "post_n": str(i),
            "idea_id": idea.id,
            "title": idea.title,
            "hook": idea.hook,
            "why_this_slot": why,
            "engagement_ask": idea.engagement,
            "status": "Not posted",
        })
    return rows


def launch_14_day(brand: BrandProfile, bank: list[Idea], start: date) -> list[dict[str, str]]:
    """Explicit first 14 posting days. Setup is day 0 and is not in this list."""
    # (offset, platform, format, idea_id, time, note)
    seq = [
        (0, "x", "tweet + pin", "X-001", "08:30", "Pin this. Origin myth. Quote-with-what-you-pay in first comment."),
        (0, "instagram", "feed", "IG-001", "09:00", "Grid 1. Who we are. Do not post Stories until 3 feed posts exist."),
        (0, "tiktok", "tiktok", "X-001", "18:30", "Native vertical. Seed the first comment. Reply for 60 min."),
        (0, "instagram", "feed", "IG-002", "12:30", "Grid 2. Postcode first."),
        (0, "instagram", "feed", "IG-003", "18:00", "Grid 3. Rankings not sold. Row 1 complete."),
        (1, "x", "poll", "X-031", "12:30", "Who is IT support. Native poll. Tags."),
        (1, "tiktok", "tiktok", "X-002", "18:30", "Buffering warning. First-frame must read as a poster."),
        (1, "instagram", "feed", "IG-004", "09:00", "Grid 4. How switching works."),
        (1, "instagram", "story", "X-017", "19:00", "Wi-Fi name sticker. First Story once 4 feed posts exist."),
        (2, "instagram", "feed", "IG-005", "09:00", "Grid 5. Social tariffs."),
        (2, "instagram", "feed", "IG-006", "12:30", "Grid 6. Fibre versus full fibre."),
        (2, "tiktok", "tiktok", "X-017", "18:30", "Wi-Fi name roast. Highest projected comment rate."),
        (2, "x", "tweet", "X-017", "18:45", "Same joke, native text. Ask for SSIDs not passwords."),
        (2, "youtube", "short", "X-002", "19:00", "First Short. Mirror TikTok, new first frame, no watermark."),
        (3, "instagram", "feed", "IG-007", "09:00", "Grid 7. Speed you actually need."),
        (3, "instagram", "feed", "IG-008", "12:30", "Grid 8. Out of contract."),
        (3, "instagram", "feed", "IG-009", "18:00", "Grid 9. Check your postcode. 3x3 complete."),
        (3, "tiktok", "tiktok", "X-005", "18:30", "89th minute. Post earlier if there's a midweek match."),
        (4, "x", "tweet", "X-008", "08:30", "Engineer window. Comment magnet."),
        (4, "instagram", "reel", "X-005", "12:00", "Yesterday's TikTok, new first frame."),
        (4, "tiktok", "tiktok", "X-007", "18:30", "Router in the cupboard. Tag-your-dad."),
        (5, "instagram", "story", "X-031", "10:00", "Saturday. Poll sticker. Matchday if fixture."),
        (5, "tiktok", "tiktok", "X-026", "18:30", "2am vs 7pm. Ask people to post both numbers."),
        (5, "x", "tweet", "X-005", "19:00", "Football window."),
        (6, "tiktok", "tiktok", "X-012", "16:00", "Flatshare FIFA. Sunday hangover admin."),
        (6, "instagram", "carousel", "X-033", "11:00", "Expanding brain. Last panel is the product."),
        (7, "linkedin", "linkedin", "X-025", "09:30", "FIRST LinkedIn. Screenshot the 3x3. We list you anyway."),
        (7, "tiktok", "tiktok", "X-029", "18:30", "Chatbot of Theseus."),
        (7, "x", "tweet", "X-010", "12:30", "One Touch Switch. Useful-funny."),
        (8, "linkedin", "linkedin", "X-047", "09:30", "2 million switches. Market literacy."),
        (8, "tiktok", "tiktok", "X-020", "18:30", "WFH muted."),
        (8, "instagram", "reel", "X-020", "19:00", "Mirror."),
        (9, "tiktok", "tiktok", "X-021", "18:30", "Packet loss breakup."),
        (9, "instagram", "feed", "X-037", "09:00", "Cheapest is a postcode. Commercial without voucher energy."),
        (10, "tiktok", "tiktok", "X-039", "18:30", "Ping not gigabit."),
        (10, "x", "tweet", "X-016", "08:30", "April tax month. Evergreen until March, then daily."),
        (11, "tiktok", "tiktok", "X-044", "18:30", "Cashback is a bribe."),
        (11, "instagram", "story", "X-026", "19:00", "Add-yours: 2am vs 7pm speed."),
        (12, "tiktok", "tiktok", "X-048", "11:00", "Switch in 60s. YouTube the same cut."),
        (12, "youtube", "short", "X-048", "11:15", "How-to. Search intent."),
        (13, "linkedin", "linkedin", "X-046", "09:30", "70% unaware. Editorial spine."),
        (13, "tiktok", "tiktok", "X-023", "18:30", "TfL delay board. Screenshot gold."),
        (13, "instagram", "feed", "X-023", "12:00", "Same visual, feed crop."),
    ]
    ig_by_id = {p["id"]: p for p in professional_ig_posts(brand)}
    rows = []
    for offset, platform, fmt, idea_id, _legacy_time, note in seq:
        if idea_id.startswith("IG-") and idea_id in ig_by_id:
            idea = ig_post_as_idea(ig_by_id[idea_id])
        else:
            idea = idea_by_id(bank, idea_id)
        if not idea:
            continue
        day = start + timedelta(days=offset)
        caps = channel_captions(idea, brand)
        cap_key = {
            "x": "x", "instagram": "instagram", "tiktok": "tiktok",
            "linkedin": "linkedin", "youtube": "youtube_description", "facebook": "facebook",
        }.get(platform, "x")
        prompt = ""
        wanted = {
            "x": "x_image", "instagram": "instagram_feed", "tiktok": "tiktok_cover",
            "linkedin": "linkedin", "youtube": "youtube_thumb", "facebook": "facebook",
        }.get(platform)
        for p in image_prompts_for_idea(idea):
            if p["placement_key"] == wanted:
                prompt = p["prompt"]
                break
        if not prompt:
            prompts = image_prompts_for_idea(idea)
            prompt = prompts[0]["prompt"] if prompts else ""
        slot_fmt = "story" if "story" in fmt else "reel" if "reel" in fmt else fmt
        slot = uk_posting_slot(platform, slot_fmt, day.weekday())
        design_date, design_time = design_deadline(day, slot["lead_days"], slot_fmt)
        rows.append({
            "date": day.isoformat(),
            "day": day.strftime("%A"),
            "timezone": "Europe/London",
            "time_uk": slot["post_time"],
            "peak_window_uk": slot["peak_window"],
            "why_this_slot": slot["why"],
            "design_by_date": design_date,
            "design_by_time_uk": design_time,
            "launch_day": str(offset + 1),
            "platform": platform,
            "format": fmt,
            "idea_id": idea.id,
            "title": idea.title,
            "hook": idea.hook,
            "caption": caps.get(cap_key, idea.copy),
            "first_comment": caps["first_comment"],
            "alt_text": caps["alt_text"],
            "chatgpt_prompt": prompt,
            "why_this_day": note,
            "status": "Not posted",
            "posted_url": "",
        })
    return rows


def launch_md(brand: BrandProfile, bank: list[Idea], start: date) -> str:
    nine = first_nine_ig(brand, bank)
    nine_lines = "\n".join(
        f"- **{r['grid_slot']}** `{r['idea_id']}` {r['title']} — {r['why_this_slot']}" for r in nine
    )
    return f"""# Day-zero launch — no posts have happened

Today's date at generation: {date.today().isoformat()}.
First posting day in the calendar: {start.isoformat()} ({start.strftime('%A')}).

Assume **zero** content on every channel. X is linked from the website footer, which makes an empty profile worse than no profile — pin X-001 the same morning you publish the first Instagram row.

## Why this sequence (2026, cold start)

- Instagram, TikTok and YouTube hide empty and ugly profiles. A 3×3 grid that looks like a publisher is the whole brand for the first 90 days.
- Comments in the first hour matter more than follower count. Seed the first comment. Reply to every one.
- Specialist UK broadband affiliates barely post (see `10-competitor-social.md`). Looking alive is a competitive advantage, not a nice-to-have.
- Uswitch is paying an agency to learn TikTok. We cannot outspend them. We can sound like a person.
- 48% of 18–28s already take money advice from TikTok (Nationwide 2026 poll). That is the cheap-broadband and student intent.

## Day 0 (before {start.isoformat()})

Do the Setup checklist tab. Generate all 9 IG frames. Do not post 'we're live'.

## First 9 Instagram tiles (publish in 3 days, not 9 weeks)

{nine_lines}

## First 14 posting days

The `Launch 14 days` sheet / Google tab is the working list: date, platform, caption, first comment, ChatGPT prompt, status **Not posted**.

Rules for those 14 days:

1. No affiliate deep-links in TikTok/Reels captions. Bio only.
2. No 'from £19' national prices.
3. Instagram captions stay professional. X and TikTok can be ruder. Engagement ask in the first comment.
4. If a post gets no comments in 3 hours, you reply to your own first comment with a second poke, not a new post.
5. LinkedIn starts day 8, when the grid exists to screenshot.

Partnerships still: {brand.emails['partnerships']}
"""


def posting_times_md() -> str:
    return f"""# UK posting times and when to design

All times are **Europe/London**. Use BST in summer and GMT in winter. The calendar columns `time_uk`, `peak_window_uk`, `design_by_date` and `design_by_time_uk` are generated from this.

## Design first, then post

| What | When |
|---|---|
| Batch next week's stills in ChatGPT | Thursday 17:00 UK |
| Feed / Reel / X / LinkedIn / YouTube still | 2 working days before post, by 17:00 |
| Stories and TikTok covers | 1 working day before, by 12:00 |
| Post | `time_uk` on the calendar row, not whenever the file finishes rendering |

Never post a weekday Reel or TikTok before 18:00. Never post LinkedIn on Friday afternoon or at the weekend.

## Peak windows (why the calendar uses these slots)

| Platform | Best UK days | Best UK times | Why |
|---|---|---|---|
| X | Tue-Thu | 08:00-09:30 commute, 17:30-19:00 | Broadband rage peaks when people get home and the line dies. |
| Instagram feed | Tue-Thu | 11:00-13:00 and 18:00-20:00 | Lunch and sofa. |
| Instagram Reels | Tue-Sun | 18:00-21:00 weekdays, 11:00-13:00 weekends | Competes with TikTok after work. |
| Instagram Stories | Daily | 07:30-09:00, 12:00-13:00, 19:00-21:00 | Stories die in hours. Evening sofa is the habit check. |
| TikTok | Daily | 19:00 weeknights, 11:30 weekends | Discovery graph is evening. Students still lunch-scroll. |
| LinkedIn | Tue-Thu | 07:45-09:30 | ISP and Awin people before stand-up. |
| YouTube Shorts | Tue-Sat | 17:00-19:00 weekdays, 10:00-13:00 weekends | After work, next to TikTok. |
| Facebook | Wed, Sun | 11:00-13:00 and 19:00-21:00 | 35+ bill-payers. Sunday morning still works. |

## Platform sizes for the poster system

| Placement | Size | Crop of the Engineer Window poster |
|---|---|---|
| Instagram feed / Facebook | 1080x1350 | Full stacked poster |
| Instagram square | 1080x1080 | Tighter card, keep footer |
| Reel / Story / TikTok cover | 1080x1920 | Extra navy above and below, type out of the top 150px and bottom 250px |
| X | 1600x900 | Headline left, cartoon right, footer along the bottom |
| LinkedIn | 1200x627 | Calm objects, no household cartoon, same navy/paper/sky |
| YouTube thumb | 1280x720 | Huge type, one object, no red arrow |

Palette: navy `{BRAND_NAVY}`, sky `{BRAND_PRIMARY}`, paper `{BRAND_SLATE}`, white `{BRAND_WHITE}`, green `{BRAND_GREEN}` ticks only.
"""


def chatgpt_design_brief_md() -> str:
    return f"""# ChatGPT design brief — BroadbandPicker

Paste the block below, then one calendar row's theme and size.

---

You are designing social graphics for BroadbandPicker, an independent UK broadband comparison site. Copy the Engineer Window poster system.

Layout every time:
1. Navy `{BRAND_NAVY}` outer canvas.
2. Paper `{BRAND_SLATE}` rounded card.
3. Small sky `{BRAND_PRIMARY}` icon.
4. Huge Inter ExtraBold navy headline (2-5 words).
5. Sky hairline.
6. Giant navy fact or time.
7. Sky punchline.
8. Editorial British cartoon, often a before/after split. Simple cartoon people in jumpers and slippers are fine. Not photoreal.
9. Navy footer: sky rounded-square wifi-mark (two white arcs + white dot) + BroadbandPicker + broadbandpicker.co.uk.

Colours: navy `{BRAND_NAVY}`, sky `{BRAND_PRIMARY}`, paper `{BRAND_SLATE}`, white `{BRAND_WHITE}`, green `{BRAND_GREEN}` one tick only.

British English. Fibre not fiber. No fake ISP logos. No QR. No SALE red.

I will give a theme, on-screen text and size from the content calendar. Give 2 visual directions, then wait for me to pick before generating.
"""


def competitor_social_md(research: dict[str, Any]) -> str:
    rows = research.get("competitor_social") or curated_competitor_social()
    blocks = []
    for row in rows:
        links = row.get("live_social_links") or []
        link_line = ", ".join(links[:8]) if links else "none extracted (JS shell or blocked)"
        notes = "; ".join(row.get("live_fetch_notes") or []) or "curated only"
        blocks.append(
            f"""### {row['brand']}

| | |
|---|---|
| **What they are** | {row['type']} |
| **What they are trying to achieve** | {row['goal']} |
| **Social move (2025–26)** | {row['social_move']} |
| **What they actually post** | {row['what_they_post']} |
| **Known handles** | {row['handles_known']} |
| **Live links this scrape** | {link_line} |
| **Fetch notes** | {notes} |
| **Gap we occupy because we have posted nothing** | {row['gap_for_us']} |
| **Do not copy** | {row['do_not_copy']} |
"""
        )
    return f"""# Competitor social strategy — UK top affiliate / comparison brands

Scraped and analysed for a **day-zero** BroadbandPicker. These brands already have audiences. We do not. Copying their deal-banner social is how a new account dies. Copying their *gap* is how a new account gets noticed.

## The reading, in one page

1. **National comparison brands buy attention** (MSM £194m marketing, Uswitch now has a social AOR). We cannot. We earn comments.
2. **Broadband-specialist affiliates almost do not do social.** That is the empty room. Standing in it with a designed grid looks like category leadership.
3. **TV-ad comparison (Compare the Market, Go.Compare)** owns mascots, not broadband jokes.
4. **MSE / Which?** own authority. We borrow seriousness only for social tariffs. We do not borrow beige.
5. **Cashback affiliates** own emoji rate alerts. Looking like them is how Awin advertisers say no.
6. **Young UK money advice has moved to TikTok and group chats** (Nationwide 2026: 48% of 18–28s). That is our consumer launch surface.
7. Artwork stays more expensive than Uswitch. Captions stay ruder than MSE.

## Brand-by-brand

{''.join(blocks)}
"""


def blank_master() -> dict[str, str]:
    return {key: "" for key in MASTER_HEADERS}


def prompt_for_platform(idea: Idea, platform: str, fmt: str = "") -> tuple[str, str]:
    """Return (size, chatgpt prompt) for the placement this row will actually use."""
    wanted = {
        "x": "x_image",
        "tiktok": "tiktok_cover",
        "linkedin": "linkedin",
        "youtube": "youtube_thumb",
        "facebook": "facebook",
    }.get(platform)
    if platform == "instagram":
        if "story" in fmt:
            wanted = "instagram_cover"
        elif "reel" in fmt:
            wanted = "instagram_cover"
        else:
            wanted = "instagram_feed"
    prompts = image_prompts_for_idea(idea)
    match = next((row for row in prompts if row["placement_key"] == wanted), None)
    if not match and prompts:
        match = prompts[0]
    if not match:
        return "", ""
    return match["size"], match["prompt"]


def caption_for_platform(idea: Idea, brand: BrandProfile, platform: str) -> dict[str, str]:
    caps = channel_captions(idea, brand)
    key = {
        "x": "x",
        "instagram": "instagram",
        "tiktok": "tiktok",
        "linkedin": "linkedin",
        "facebook": "facebook",
        "youtube": "youtube_description",
    }.get(platform, "x")
    return {
        "caption_paste": caps.get(key, idea.copy),
        "first_comment_paste": caps.get("first_comment", ""),
        "alt_text": caps.get("alt_text", ""),
    }


def idea_master_fields(idea: Idea) -> dict[str, str]:
    return {
        "idea_id": idea.id,
        "title": idea.title,
        "pillar": idea.pillar,
        "intents": ", ".join(idea.search_intents),
        "hook": idea.hook,
        "on_screen_text": " | ".join(idea.design.on_screen_text),
        "visual_concept": idea.design.visual_concept,
        "why": idea.why,
        "compliance": idea.compliance,
        "cta": idea.cta,
    }


def build_master_rows(
    brand: BrandProfile,
    bank: list[Idea],
    calendar: list[dict[str, str]],
    research: dict[str, Any],
    launch_rows: list[dict[str, str]],
    start: date,
) -> list[dict[str, str]]:
    rows: list[dict[str, str]] = []
    by_id = {idea.id: idea for idea in bank}
    for post in professional_ig_posts(brand):
        by_id.setdefault(post["id"], ig_post_as_idea(post))

    def add(**kwargs: str) -> None:
        row = blank_master()
        row.update({k: str(v) for k, v in kwargs.items() if k in row})
        rows.append(row)

    add(
        section="HOW TO USE",
        title="One working sheet",
        notes=(
            "Timezone is Europe/London all year. DESIGN BY is when the ChatGPT still must exist. "
            "POST at time_uk. Peak window is why that slot exists. Poster system: navy frame, paper "
            "card, sky punchline, wifi-mark footer, like the Engineer Window reference. "
            "Batch stills every Thursday 17:00 for the next week. Never post a weekday Reel or TikTok before 18:00."
        ),
        status="—",
        cta=SITE,
    )
    add(section="HOW TO USE", title="Site", notes=SITE, cta=SITE)
    add(section="HOW TO USE", title="Partnerships", notes=brand.emails.get("partnerships", ""), cta=brand.emails.get("partnerships", ""))
    add(section="HOW TO USE", title="Colours", notes=f"Navy {BRAND_NAVY} · Sky {BRAND_PRIMARY} · Paper {BRAND_SLATE} · Green {BRAND_GREEN} ticks only")
    add(section="HOW TO USE", title="Avatar", notes="docs/branding-and-marketing/broadbandpicker-logo-icon.png")
    add(
        section="HOW TO USE",
        title="Voice",
        notes="Instagram, LinkedIn, YouTube, Facebook: professional publisher. X and TikTok can be ruder. Never punch down. Never look like a cashback account.",
    )
    add(
        section="HOW TO USE",
        title="Profiles tab",
        notes="Filter section PROFILE on this sheet, or open the Profiles tab. Paste bios exactly. Website lives in the website field.",
        cta=SITE,
    )

    for row in platform_profiles(brand):
        add(
            section="PROFILE",
            platform=row["platform"],
            title=row["field"],
            format=f"{row['chars']} / {row['limit']}",
            caption_paste=row["paste"],
            notes=row["notes"],
            cta=row["url"] or SITE,
            hook=row["chars"],
            artwork_size=row.get("avatar", ""),
            status="Not pasted",
        )

    for item in setup_checklist_rows():
        add(
            section="SETUP",
            week_or_day=item["when"],
            title=item["task"],
            status=item["status"],
            notes=item["notes"],
            why=item["owner"],
        )

    for channel in channel_rows(brand):
        add(
            section="CHANNEL",
            platform=channel["channel"],
            title=channel["handle"],
            status=channel["open"],
            why=channel["why"],
            notes=f"Cadence: {channel['cadence']} | Audience: {channel['audience']} | Content: {channel['content']}",
            cta=channel.get("success", ""),
            compliance=channel.get("b2b", ""),
            pillar=channel.get("priority", ""),
        )

    for item in first_nine_ig(brand, bank):
        idea = by_id.get(item["idea_id"])
        extra = idea_master_fields(idea) if idea else {}
        caps = caption_for_platform(idea, brand, "instagram") if idea else {}
        size, prompt = prompt_for_platform(idea, "instagram", "feed") if idea else ("", "")
        add(
            section="FIRST 9 IG GRID",
            platform="instagram",
            format="feed",
            week_or_day=item["grid_slot"],
            status=item["status"],
            artwork_size=size,
            chatgpt_prompt=prompt,
            notes=item["why_this_slot"],
            **extra,
            **caps,
        )

    for item in launch_rows:
        idea = by_id.get(item["idea_id"])
        extra = idea_master_fields(idea) if idea else {}
        add(
            section="LAUNCH 14 DAYS",
            date=item.get("date", ""),
            day=item.get("day", ""),
            time_uk=item.get("time_uk", ""),
            timezone=item.get("timezone", "Europe/London"),
            peak_window_uk=item.get("peak_window_uk", ""),
            why_this_slot=item.get("why_this_slot", ""),
            design_by_date=item.get("design_by_date", ""),
            design_by_time_uk=item.get("design_by_time_uk", ""),
            week_or_day=f"Day {item.get('launch_day', '')}",
            platform=item.get("platform", ""),
            format=item.get("format", ""),
            status=item.get("status", "Not posted"),
            caption_paste=item.get("caption", ""),
            first_comment_paste=item.get("first_comment", ""),
            alt_text=item.get("alt_text", ""),
            chatgpt_prompt=item.get("chatgpt_prompt", ""),
            artwork_size=prompt_for_platform(idea, item.get("platform", ""), item.get("format", ""))[0] if idea else "",
            notes=item.get("why_this_day", ""),
            posted_url=item.get("posted_url", ""),
            **extra,
        )

    launch_keys = {
        (row.get("date"), row.get("platform"), row.get("idea_id"))
        for row in launch_rows
    }
    for item in calendar:
        key = (item.get("date"), item.get("platform"), item.get("idea_id"))
        if key in launch_keys:
            continue
        idea = by_id.get(item["idea_id"])
        extra = idea_master_fields(idea) if idea else {}
        caps = caption_for_platform(idea, brand, item.get("platform", "x")) if idea else {}
        size, prompt = prompt_for_platform(idea, item.get("platform", ""), item.get("format", "")) if idea else ("", "")
        add(
            section="CALENDAR",
            date=item.get("date", ""),
            day=item.get("day", ""),
            time_uk=item.get("time_uk", ""),
            timezone=item.get("timezone", "Europe/London"),
            peak_window_uk=item.get("peak_window_uk", ""),
            why_this_slot=item.get("why_this_slot", ""),
            design_by_date=item.get("design_by_date", ""),
            design_by_time_uk=item.get("design_by_time_uk", ""),
            week_or_day=f"Week {item.get('week', '')}",
            platform=item.get("platform", ""),
            format=item.get("format", ""),
            status=item.get("status", "Not posted"),
            artwork_size=size,
            chatgpt_prompt=prompt,
            notes=item.get("hook", ""),
            **extra,
            **caps,
        )

    for idea in bank:
        for platform in idea.platforms:
            caps = caption_for_platform(idea, brand, platform)
            size, prompt = prompt_for_platform(idea, platform, idea.formats[0] if idea.formats else "")
            add(
                section="IDEA BANK",
                platform=platform,
                format=", ".join(idea.formats),
                status="Not posted",
                artwork_size=size,
                chatgpt_prompt=prompt,
                notes=idea.engagement,
                **idea_master_fields(idea),
                **caps,
            )

    for intent in brand.search_intents or search_intent_rows():
        add(
            section="INTENT",
            title=intent.get("intent", ""),
            intents=intent.get("queries", ""),
            platform=intent.get("channels", ""),
            why=intent.get("why_channel", ""),
            notes=intent.get("who", ""),
            cta=intent.get("site", ""),
            hook=intent.get("content", ""),
        )

    for row in research.get("competitor_social") or curated_competitor_social():
        add(
            section="COMPETITOR",
            title=row.get("brand", ""),
            pillar=row.get("type", ""),
            why=row.get("goal", ""),
            notes=row.get("social_move", ""),
            hook=row.get("what_they_post", ""),
            cta=row.get("handles_known", ""),
            compliance=row.get("do_not_copy", ""),
            visual_concept=row.get("gap_for_us", ""),
            caption_paste=", ".join(row.get("live_social_links") or []),
        )

    kpis = [
        ("Setup", "Profiles complete + first 9 IG live", "Done", "Empty linked profiles are worse than no profile."),
        ("Attention", "Avg watch-through TikTok / Reels", "25%+ by day 14", "If the hook dies, rewrite the first frame."),
        ("Conversation", "Comments per post in first 3 hours", "5+", "Seed the first comment. Reply to every one."),
        ("Memory", "Profile visits + branded Google queries", "Up", "The grid must look like a publisher."),
        ("Action", "Link-in-bio clicks to the postcode checker", "UTM on every URL", "utm_source=tiktok|instagram|x"),
        ("B2B", "Inbound to partnerships@", "1 serious conversation in 90 days", "LinkedIn from day 8 + living grid."),
    ]
    for title, metric, aim, note in kpis:
        add(section="KPI", title=title, hook=metric, notes=aim, why=note)

    return rows


def write_csv(path: Path, rows: list[dict[str, str]]) -> None:
    if not rows:
        return
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=list(rows[0].keys()))
        writer.writeheader()
        writer.writerows(rows)


def _style_sheet_header(ws, headers: list[str], widths: dict[str, int]) -> None:
    from openpyxl.styles import Alignment, Font, PatternFill
    from openpyxl.utils import get_column_letter

    header_fill = PatternFill("solid", fgColor="0F172A")
    header_font = Font(bold=True, color="FFFFFF")
    wrap = Alignment(wrap_text=True, vertical="top")
    for cell in ws[1]:
        cell.fill = header_fill
        cell.font = header_font
        cell.alignment = Alignment(wrap_text=True, vertical="center")
    for row in ws.iter_rows(min_row=2, max_row=ws.max_row, max_col=len(headers)):
        for cell in row:
            cell.alignment = wrap
    for letter, width in widths.items():
        ws.column_dimensions[letter].width = width
    ws.auto_filter.ref = f"A1:{get_column_letter(len(headers))}{max(ws.max_row, 1)}"
    ws.freeze_panes = "A2"
    ws.row_dimensions[1].height = 28


def write_xlsx(path: Path, master_rows: list[dict[str, str]], brand: BrandProfile | None = None) -> None:
    """Social plan plus a Profiles tab of paste-ready bios."""
    try:
        from openpyxl import Workbook
        from openpyxl.utils import get_column_letter
    except ImportError:
        return

    wb = Workbook()
    ws = wb.active
    ws.title = MASTER_SHEET_TITLE
    ws.append(MASTER_HEADERS)
    for row in master_rows:
        ws.append([row.get(key, "") for key in MASTER_HEADERS])
    _style_sheet_header(ws, MASTER_HEADERS, {
        "A": 18, "B": 12, "C": 10, "D": 10, "E": 14, "F": 14, "G": 16, "H": 14,
        "I": 10, "J": 28, "K": 14, "L": 28, "M": 28, "N": 50, "O": 36, "P": 28,
        "Q": 16, "R": 28, "S": 70, "T": 36, "U": 28, "V": 28, "W": 28, "X": 36, "Y": 18,
    })

    profiles = platform_profiles(brand) if brand is not None else []
    ps = wb.create_sheet(PROFILES_SHEET_TITLE)
    ps.append(PROFILES_HEADERS)
    for row in profiles:
        ps.append([
            row.get("platform", ""),
            row.get("field", ""),
            row.get("limit", ""),
            row.get("chars", ""),
            row.get("paste", ""),
            row.get("notes", ""),
            row.get("url", ""),
            row.get("avatar", ""),
        ])
    _style_sheet_header(ps, PROFILES_HEADERS, {
        "A": 22, "B": 22, "C": 14, "D": 12, "E": 70, "F": 48, "G": 42, "H": 42,
    })

    path.parent.mkdir(parents=True, exist_ok=True)
    wb.save(path)


def google_access_token() -> str:
    try:
        from google.oauth2 import service_account
        from google.auth.transport.requests import Request
    except ImportError as exc:
        raise RuntimeError("Google sync requires: pip install -r requirements-seo.txt") from exc

    raw_json = os.environ.get("GOOGLE_SERVICE_ACCOUNT_JSON", "").strip()
    credentials_path = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS", "").strip()
    if not credentials_path and DEFAULT_CREDENTIALS.exists():
        credentials_path = str(DEFAULT_CREDENTIALS)
    scopes = ["https://www.googleapis.com/auth/spreadsheets"]
    if raw_json:
        credentials = service_account.Credentials.from_service_account_info(json.loads(raw_json), scopes=scopes)
    elif credentials_path:
        credentials = service_account.Credentials.from_service_account_file(credentials_path, scopes=scopes)
    else:
        raise RuntimeError(
            "Set GOOGLE_SERVICE_ACCOUNT_JSON or GOOGLE_APPLICATION_CREDENTIALS, "
            "and share the Google Sheet with that service-account email as Editor."
        )
    credentials.refresh(Request())
    return credentials.token


def sheets_request(token: str, method: str, url: str, **kwargs: Any) -> dict[str, Any]:
    try:
        import requests
    except ImportError as exc:
        raise RuntimeError("pip install requests") from exc
    headers = kwargs.pop("headers", {})
    headers.update({"Authorization": f"Bearer {token}", "Content-Type": "application/json"})
    response = requests.request(method, url, headers=headers, timeout=60, **kwargs)
    if not response.ok:
        raise RuntimeError(f"Google Sheets API {response.status_code}: {response.text[:900]}")
    return response.json() if response.content else {}


def a1_column(number: int) -> str:
    result = ""
    while number:
        number, remainder = divmod(number - 1, 26)
        result = chr(65 + remainder) + result
    return result


def _sync_one_sheet(
    token: str,
    base: str,
    title: str,
    rows: list[list[Any]],
    metadata_sheets: list[dict[str, Any]],
    preferred_gid: int | None = None,
) -> tuple[int, list[dict[str, Any]]]:
    from openpyxl.utils import get_column_letter

    if not rows:
        raise RuntimeError(f"Worksheet {title} is empty.")
    sheets = metadata_sheets
    target = None
    if preferred_gid is not None:
        target = next((s for s in sheets if s["properties"].get("sheetId") == preferred_gid), None)
    if target is None:
        target = next((s for s in sheets if s["properties"].get("title") == title), None)
    format_requests: list[dict[str, Any]] = []
    if target is None:
        sheets_request(token, "POST", f"{base}:batchUpdate", json={
            "requests": [{"addSheet": {"properties": {
                "title": title,
                "gridProperties": {"frozenRowCount": 1},
            }}}]
        })
        metadata = sheets_request(
            token, "GET", base,
            params={"fields": "sheets(properties(sheetId,title,gridProperties(rowCount,columnCount)))"},
        )
        sheets = metadata.get("sheets") or []
        target = next(s for s in sheets if s["properties"]["title"] == title)
    sheet_id = target["properties"]["sheetId"]
    current_title = target["properties"]["title"]
    if current_title != title:
        format_requests.append({
            "updateSheetProperties": {
                "properties": {"sheetId": sheet_id, "title": title},
                "fields": "title",
            }
        })
        current_title = title

    grid = target["properties"].get("gridProperties", {})
    row_count = int(grid.get("rowCount", 0) or 0)
    column_count = int(grid.get("columnCount", 0) or 0)
    need_rows = max(len(rows), 2)
    need_cols = max(len(rows[0]), 1)
    expansion = []
    if need_rows > row_count:
        expansion.append({"appendDimension": {
            "sheetId": sheet_id, "dimension": "ROWS", "length": need_rows - row_count,
        }})
    if need_cols > column_count:
        expansion.append({"appendDimension": {
            "sheetId": sheet_id, "dimension": "COLUMNS", "length": need_cols - column_count,
        }})
    if expansion:
        sheets_request(token, "POST", f"{base}:batchUpdate", json={"requests": expansion})

    quoted = current_title.replace("'", "''")
    last_col = get_column_letter(need_cols)
    clear_range = f"'{quoted}'!A1:{last_col}{need_rows}"
    sheets_request(
        token, "POST",
        f"{base}/values/{urllib.parse.quote(clear_range, safe='')}:clear",
    )
    sheets_request(
        token, "POST", f"{base}/values:batchUpdate",
        json={"valueInputOption": "RAW", "data": [
            {"range": f"'{quoted}'!A1:{last_col}{len(rows)}", "values": rows}
        ]},
    )

    navy = {"red": 15 / 255, "green": 23 / 255, "blue": 42 / 255}
    format_requests.extend([
        {
            "repeatCell": {
                "range": {"sheetId": sheet_id, "startRowIndex": 0, "endRowIndex": 1,
                          "startColumnIndex": 0, "endColumnIndex": need_cols},
                "cell": {"userEnteredFormat": {
                    "backgroundColor": navy,
                    "textFormat": {"foregroundColor": {"red": 1, "green": 1, "blue": 1}, "bold": True},
                    "wrapStrategy": "WRAP", "verticalAlignment": "MIDDLE",
                }},
                "fields": "userEnteredFormat(backgroundColor,textFormat,wrapStrategy,verticalAlignment)",
            }
        },
        {
            "repeatCell": {
                "range": {"sheetId": sheet_id, "startRowIndex": 1, "endRowIndex": len(rows),
                          "startColumnIndex": 0, "endColumnIndex": need_cols},
                "cell": {"userEnteredFormat": {"wrapStrategy": "WRAP", "verticalAlignment": "TOP"}},
                "fields": "userEnteredFormat(wrapStrategy,verticalAlignment)",
            }
        },
        {
            "updateSheetProperties": {
                "properties": {"sheetId": sheet_id, "gridProperties": {"frozenRowCount": 1}},
                "fields": "gridProperties.frozenRowCount",
            }
        },
        {
            "setBasicFilter": {
                "filter": {"range": {
                    "sheetId": sheet_id, "startRowIndex": 0, "endRowIndex": len(rows),
                    "startColumnIndex": 0, "endColumnIndex": need_cols,
                }}
            }
        },
    ])
    sheets_request(token, "POST", f"{base}:batchUpdate", json={"requests": format_requests})
    return sheet_id, sheets


def sync_xlsx_to_google_sheet(xlsx_path: Path, spreadsheet_id: str, sheet_gid: int = DEFAULT_GOOGLE_SHEET_GID) -> dict[str, Any]:
    """Write every worksheet in the planner workbook into the live spreadsheet."""
    try:
        from openpyxl import load_workbook
    except ImportError as exc:
        raise RuntimeError("openpyxl required") from exc

    token = google_access_token()
    base = f"https://sheets.googleapis.com/v4/spreadsheets/{spreadsheet_id}"
    wb = load_workbook(xlsx_path, data_only=True)
    local_sheets = []
    for name in wb.sheetnames:
        ws = wb[name]
        rows = [[cell.value if cell.value is not None else "" for cell in row] for row in ws.iter_rows()]
        local_sheets.append((name, rows))
    wb.close()
    if not local_sheets:
        raise RuntimeError("Workbook is empty.")

    metadata = sheets_request(
        token, "GET", base,
        params={"fields": "properties(title),sheets(properties(sheetId,title,index,gridProperties(rowCount,columnCount)))"},
    )
    remote = metadata.get("sheets") or []
    uploaded: list[str] = []
    first_gid = sheet_gid
    for index, (title, rows) in enumerate(local_sheets):
        preferred = sheet_gid if index == 0 and title == MASTER_SHEET_TITLE else None
        gid, remote = _sync_one_sheet(token, base, title, rows, remote, preferred)
        uploaded.append(title)
        if index == 0:
            first_gid = gid
    return {
        "spreadsheetId": spreadsheet_id,
        "spreadsheetUrl": f"https://docs.google.com/spreadsheets/d/{spreadsheet_id}/edit?gid={first_gid}#gid={first_gid}",
        "tabs": uploaded,
        "rows": sum(len(rows) for _, rows in local_sheets),
    }


def filter_cal(calendar: list[dict[str, str]], platform: str) -> list[dict[str, str]]:
    return [row for row in calendar if row["platform"] == platform]


def main() -> int:
    parser = argparse.ArgumentParser(description="Plan BroadbandPicker social content from this repo plus live web research.")
    parser.add_argument("--weeks", type=int, default=6, help="How many weeks of calendar to schedule.")
    parser.add_argument("--start-date", default=DEFAULT_START.isoformat(), help="YYYY-MM-DD, snapped to the next Monday.")
    parser.add_argument("--output", default=str(OUT_DIR), help="Output folder.")
    parser.add_argument("--skip-web", action="store_true", help="Skip live HTTP fetches; still apply curated 2026 facts.")
    parser.add_argument(
        "--sync-google-sheet",
        action="store_true",
        help="Push the generated workbook into the live working Google Sheet.",
    )
    parser.add_argument(
        "--google-sheet-id",
        default=os.environ.get("BROADBANDPICKER_SOCIAL_SHEET_ID", DEFAULT_GOOGLE_SHEET_ID),
        help="Spreadsheet ID to update with --sync-google-sheet.",
    )
    parser.add_argument("--post", action="store_true", help="Match artworks to the queue and post (dry run unless --live).")
    parser.add_argument("--live", action="store_true", help="With --post, actually publish. Default is dry run.")
    parser.add_argument("--artworks", default="", help="Folder of ChatGPT stills / videos. Default: docs/social media manager/artworks/")
    parser.add_argument("--platform", default="", help="With --post, only this platform (x, instagram, facebook, linkedin).")
    parser.add_argument("--idea", default="", help="With --post, only this idea id (e.g. X-001).")
    parser.add_argument("--date", default="", help="With --post, only this plan date (YYYY-MM-DD).")
    parser.add_argument("--limit", type=int, default=0, help="With --post, max jobs this run.")
    parser.add_argument("--include-calendar", action="store_true", help="With --post, include later CALENDAR rows.")
    args = parser.parse_args()

    if args.post:
        import sys
        sys.path.insert(0, str(Path(__file__).resolve().parent))
        import post_social
        post_args = post_social.build_parser().parse_args([])
        post_args.live = args.live
        post_args.platform = args.platform
        post_args.idea = args.idea
        post_args.date = args.date
        post_args.limit = args.limit
        post_args.include_calendar = args.include_calendar
        if args.artworks:
            post_args.artworks = args.artworks
        if args.output:
            queue = Path(args.output) / "social-plan-all.csv"
            if queue.is_file():
                post_args.queue = str(queue)
        return post_social.run_posting(post_args)

    start = monday_on_or_after(date.fromisoformat(args.start_date))
    weeks = max(2, args.weeks)
    out = Path(args.output)
    ig = out / "Instagram Content creation"
    xdir = out / "X"
    tdir = out / "tiktok"
    ldir = out / "LinkedIn"
    ydir = out / "YouTube"
    fdir = out / "Facebook"
    for folder in (out, ig, xdir, tdir, ldir, ydir, fdir, out / "artworks"):
        folder.mkdir(parents=True, exist_ok=True)

    brand = analyse_workspace()
    research = run_web_research(skip=args.skip_web)
    brand.competitor_social = research.get("competitor_social") or curated_competitor_social()
    brand.web_research = {
        "skipped": research.get("skipped"),
        "generated_at": research.get("generated_at"),
        "notes": research.get("notes"),
        "fetch_ok": sum(1 for row in research.get("fetches") or [] if row.get("ok")),
        "fetch_n": len(research.get("fetches") or []),
        "curated": research.get("curated"),
    }
    bank = ideas(brand)
    attach_intents(bank)
    calendar = build_calendar(start, weeks, bank)
    launch_rows = launch_14_day(brand, bank, start)

    write(out / "README.md", readme_md(brand, weeks))
    write(out / "00-brand-intelligence.json", json.dumps(brand_json(brand), indent=2, ensure_ascii=False))
    write(out / "00-web-research.json", json.dumps(research, indent=2, ensure_ascii=False))
    write(out / "01-channel-recommendations.md", channel_md(brand))
    write(out / "02-voice-and-humour-playbook.md", voice_playbook_md())
    write(out / "03-master-strategy.md", master_strategy_md(brand, bank, weeks, research))
    write(out / "04-design-prompts.md", design_prompts_md(bank))
    write(out / "05-intent-content-plan.md", intent_plan_md(brand, bank))
    write(out / "06-visual-design-system.md", visual_system_md(brand))
    write(out / "07-affiliate-b2b-playbook.md", affiliate_playbook_md(brand, research))
    write(out / "08-web-research.md", research_md(research))
    write(out / "09-day-zero-launch.md", launch_md(brand, bank, start))
    write(out / "10-competitor-social.md", competitor_social_md(research))
    write(out / "uk-posting-and-design-times.md", posting_times_md())
    write(out / "chatgpt-design-brief.md", chatgpt_design_brief_md())
    write(out / "profiles-all.md", profiles_all_md(brand))
    write_csv(out / "content-calendar-all.csv", calendar)
    write_csv(out / "launch-14-days.csv", launch_rows)
    master_rows = build_master_rows(brand, bank, calendar, research, launch_rows, start)
    write_csv(out / "social-plan-all.csv", master_rows)
    xlsx_path = out / "social-content-planner.xlsx"
    write_xlsx(xlsx_path, master_rows, brand)

    write(xdir / "strategy.md", x_strategy_md(brand, bank))
    write(xdir / "posts.md", x_posts_md(brand, bank))
    write(xdir / "design-briefs.md", x_design_md(brand))
    write(xdir / "ready-to-post.md", ready_to_post_md(brand, bank, "x"))
    write_csv(xdir / "content-calendar.csv", filter_cal(calendar, "x"))

    write(ig / "strategy.md", ig_strategy_md(brand, research))
    write(ig / "account-setup.md", ig_account_setup_md(brand))
    write(ig / "professional-content.md", ig_professional_content_md(brand))
    write(ig / "reels.md", ig_reels_md(brand, bank))
    write(ig / "stories.md", ig_stories_md(brand, bank))
    write(ig / "feed-posts.md", ig_posts_md(brand, bank))
    write(ig / "design-system.md", ig_design_md(brand))
    write(ig / "ready-to-post.md", ready_to_post_md(brand, bank, "instagram"))
    write_csv(
        ig / "content-calendar.csv",
        [row for row in calendar if row["platform"] == "instagram"],
    )

    write(tdir / "strategy.md", tiktok_strategy_md(brand))
    write(tdir / "video-ideas.md", tiktok_ideas_md(brand, bank))
    write(tdir / "design-briefs.md", tiktok_design_md(brand))
    write(tdir / "ready-to-post.md", ready_to_post_md(brand, bank, "tiktok"))
    write_csv(tdir / "content-calendar.csv", filter_cal(calendar, "tiktok"))

    write(ldir / "strategy.md", linkedin_strategy_md(brand))
    write(ldir / "account-setup.md", linkedin_account_setup_md(brand))
    write(ldir / "posts.md", linkedin_posts_md(brand, bank))
    write(ldir / "ready-to-post.md", ready_to_post_md(brand, bank, "linkedin"))
    write_csv(ldir / "content-calendar.csv", filter_cal(calendar, "linkedin"))

    write(ydir / "strategy.md", youtube_strategy_md(brand))
    write(ydir / "video-ideas.md", youtube_ideas_md(brand, bank))
    write(ydir / "ready-to-post.md", ready_to_post_md(brand, bank, "youtube"))
    write_csv(ydir / "content-calendar.csv", filter_cal(calendar, "youtube"))

    write(fdir / "strategy.md", facebook_strategy_md(brand))
    write(fdir / "posts.md", facebook_posts_md(brand, bank))
    write(fdir / "ready-to-post.md", ready_to_post_md(brand, bank, "facebook"))
    write_csv(fdir / "content-calendar.csv", filter_cal(calendar, "facebook"))

    print(f"Brand files read: {len(brand.files_read)}")
    print(f"Providers: {len(brand.providers)} · Guides: {len(brand.guides)}")
    print(f"Ideas: {len(bank)} · Calendar rows: {len(calendar)} · Launch rows: {len(launch_rows)}")
    print(f"Web research: {brand.web_research.get('fetch_ok')}/{brand.web_research.get('fetch_n')} fetches ok")
    print(f"Wrote {out.relative_to(ROOT)}")
    if args.sync_google_sheet:
        try:
            result = sync_xlsx_to_google_sheet(xlsx_path, args.google_sheet_id)
            print(f"Google Sheet: {result['spreadsheetUrl']}")
            print(f"Tabs: {', '.join(result['tabs'])}")
        except Exception as exc:  # noqa: BLE001
            print(f"Google Sheet sync failed: {exc}")
            print(
                "Share the spreadsheet with the service-account client_email as Editor, "
                "enable the Google Sheets API on that GCP project, then re-run with "
                "--sync-google-sheet (or set GOOGLE_SERVICE_ACCOUNT_JSON)."
            )
            return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
