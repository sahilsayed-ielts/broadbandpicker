#!/usr/bin/env python3
"""Research and plan the BroadbandPicker homepage for generic UK broadband search.

The homepage should win the queries that are not a specific guide, city or
provider: "broadband", "compare broadband", "broadband UK", "broadband checker",
"broadband in my area". Category terms (cheapest, social tariffs, gaming) stay
on their own URLs so we do not cannibalise.

The script:
1. Reads this workspace (homepage, about, money, methodology, providers,
   tools, GSC AI-overview exports, existing competitor scans).
2. Scrapes live UK comparison homepages for content shape, FAQ, schema,
   postcode UX and citeable facts (not their prose).
3. Builds a homepage keyword set from first-party mapping + GSC + search
   demand estimates.
4. Writes an SEO + GEO + UX brief: section order, copy rules (no AI tells,
   no em dashes), interactive elements, illustration slots, JSON-LD.

Usage:
    python3 scripts/plan_homepage_seo_geo.py
    python3 scripts/plan_homepage_seo_geo.py --skip-web

Output:
    docs/home page UX/homepage-seo-geo-plan.json
    docs/home page UX/homepage-seo-geo-plan.md
"""

from __future__ import annotations

import argparse
import csv
import json
import re
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from html.parser import HTMLParser
from pathlib import Path
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "docs" / "home page UX"
SITE = "https://broadbandpicker.co.uk"
USER_AGENT = (
    "BroadbandPickerHomepageResearchBot/1.0 "
    "(SEO/GEO research; https://broadbandpicker.co.uk/contact)"
)

COMPETITORS = [
    ("Uswitch broadband", "https://www.uswitch.com/broadband/"),
    ("Uswitch home", "https://www.uswitch.com/"),
    ("broadband.co.uk", "https://www.broadband.co.uk/broadband"),
    ("choose.co.uk", "https://www.choose.co.uk/broadband/"),
    ("Go.Compare broadband", "https://www.gocompare.com/broadband/"),
    ("Confused.com broadband", "https://www.confused.com/broadband"),
    ("Which? Switch", "https://broadband.which.co.uk/"),
    ("MoneySuperMarket broadband", "https://www.moneysupermarket.com/broadband/"),
    ("Compare the Market broadband", "https://www.comparethemarket.com/broadband/"),
    ("Broadband Genie", "https://www.broadbandgenie.co.uk/"),
    ("MoneySavingExpert cheap broadband", "https://www.moneysavingexpert.com/phones/cheap-broadband/"),
    ("Ofcom broadband", "https://www.ofcom.org.uk/phones-and-broadband"),
]


# ---------------------------------------------------------------------------
# Workspace
# ---------------------------------------------------------------------------


def read_text(relative: str) -> str:
    path = ROOT / relative
    if not path.is_file():
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


def count_em_dashes(text: str) -> int:
    return text.count("\u2014") + text.count("—")


def ai_tell_hits(text: str) -> list[str]:
    patterns = [
        r"\bdelve\b",
        r"\blandscape\b",
        r"\bin today's world\b",
        r"\bwhether you're\b",
        r"\bit's important to note\b",
        r"\bunlock\b",
        r"\belevate\b",
        r"\bseamless(ly)?\b",
        r"\bcomprehensive guide\b",
        r"\bin this article\b",
        r"\blet's dive\b",
        r"\brobust\b",
        r"\bleverage\b",
        r"\bcutting-edge\b",
        r"\bgame-changer\b",
        r"\bnestled\b",
        r"\bembark\b",
    ]
    hits: list[str] = []
    lower = text.lower()
    for pat in patterns:
        if re.search(pat, lower):
            hits.append(pat)
    if "\u2014" in text or "—" in text:
        hits.append("em-dash")
    return unique(hits)


def extract_providers(source: str) -> list[str]:
    return unique(re.findall(r"^\s+name:\s+'([^']+)'", source, flags=re.MULTILINE))


def extract_headings(tsx: str) -> list[str]:
    return re.findall(r"<h[1-3][^>]*>(.*?)</h[1-3]>", tsx, flags=re.S)


def strip_tags(html: str) -> str:
    text = re.sub(r"<script[\s\S]*?</script>", " ", html, flags=re.I)
    text = re.sub(r"<style[\s\S]*?</style>", " ", text, flags=re.I)
    text = re.sub(r"<[^>]+>", " ", text)
    text = re.sub(r"&[a-z]+;", " ", text, flags=re.I)
    return re.sub(r"\s+", " ", text).strip()


@dataclass
class SiteAudit:
    files_read: list[str] = field(default_factory=list)
    provider_count: int = 0
    providers: list[str] = field(default_factory=list)
    homepage_h1: str = ""
    homepage_title: str = ""
    homepage_description: str = ""
    homepage_word_count: int = 0
    homepage_em_dashes: int = 0
    homepage_ai_tells: list[str] = field(default_factory=list)
    tools: list[str] = field(default_factory=list)
    trust_pages: list[str] = field(default_factory=list)
    gsc_homepage_ai_impressions: int | None = None
    gsc_top_pages: list[dict[str, Any]] = field(default_factory=list)
    revenue_model: str = ""
    industry: str = (
        "UK broadband price comparison / affiliate publisher. "
        "Not a telecoms operator. Same industry bucket as Uswitch and broadbandchoices."
    )


def load_gsc_ai_pages() -> tuple[int | None, list[dict[str, Any]]]:
    folder = ROOT / "data" / "GSC"
    pages_csv = None
    for path in folder.rglob("Pages.csv"):
        pages_csv = path
        break
    if not pages_csv:
        return None, []
    rows: list[dict[str, Any]] = []
    home_impr = None
    with pages_csv.open(encoding="utf-8", newline="") as handle:
        reader = csv.DictReader(handle)
        for row in reader:
            url = (row.get("Top pages") or row.get("Pages") or row.get("page") or "").strip()
            raw = row.get("Impressions") or row.get("impressions") or "0"
            try:
                impr = int(str(raw).replace(",", ""))
            except ValueError:
                impr = 0
            rows.append({"url": url, "impressions": impr})
            if url.rstrip("/") in {SITE, SITE + "/"}:
                home_impr = impr
    rows.sort(key=lambda item: item["impressions"], reverse=True)
    return home_impr, rows[:20]


def analyse_workspace() -> SiteAudit:
    audit = SiteAudit()
    files = {
        "app/page.tsx": read_text("app/page.tsx"),
        "app/about/page.tsx": read_text("app/about/page.tsx"),
        "app/how-we-make-money/page.tsx": read_text("app/how-we-make-money/page.tsx"),
        "app/how-we-review-broadband/page.tsx": read_text("app/how-we-review-broadband/page.tsx"),
        "app/editorial-policy/page.tsx": read_text("app/editorial-policy/page.tsx"),
        "data/providers.ts": read_text("data/providers.ts"),
        "data/guides.ts": read_text("data/guides.ts"),
        "docs/content-plan.md": read_text("docs/content-plan.md"),
        "docs/ga4-seo-strategy-plan.md": read_text("docs/ga4-seo-strategy-plan.md"),
        "docs/home page UX/homepage-redesign-analysis.md": read_text(
            "docs/home page UX/homepage-redesign-analysis.md"
        ),
        "lib/affiliate.ts": read_text("lib/affiliate.ts"),
    }
    audit.files_read = [path for path, text in files.items() if text]
    home = files["app/page.tsx"]
    audit.providers = extract_providers(files["data/providers.ts"])
    audit.provider_count = len(audit.providers)
    title = re.search(r"absolute:\s*'([^']+)'", home)
    desc = re.search(r"description:\s*\n?\s*'([^']+)'", home)
    h1 = re.search(r"<h1[^>]*>([\s\S]*?)</h1>", home)
    audit.homepage_title = title.group(1) if title else ""
    audit.homepage_description = desc.group(1) if desc else ""
    if h1:
        audit.homepage_h1 = re.sub(r"<[^>]+>", " ", h1.group(1))
        audit.homepage_h1 = re.sub(r"\s+", " ", audit.homepage_h1).strip()
    visible = strip_tags(home)
    audit.homepage_word_count = len(visible.split())
    audit.homepage_em_dashes = count_em_dashes(home)
    audit.homepage_ai_tells = ai_tell_hits(home)
    audit.tools = [
        "Postcode checker (homepage)",
        "Compare",
        "Deals table",
        "Speed test",
        "Broadband Match quiz",
        "Cost calculator",
        "Glossary",
    ]
    audit.trust_pages = [
        f"{SITE}/about",
        f"{SITE}/how-we-make-money",
        f"{SITE}/how-we-review-broadband",
        f"{SITE}/editorial-policy",
    ]
    money = files["app/how-we-make-money/page.tsx"].lower()
    if "affiliate" in money:
        audit.revenue_model = (
            "Free for consumers. Affiliate commission when a visitor clicks through "
            "and signs up. Rankings are not sold. Providers can appear with or without "
            "an affiliate relationship."
        )
    audit.gsc_homepage_ai_impressions, audit.gsc_top_pages = load_gsc_ai_pages()
    return audit


# ---------------------------------------------------------------------------
# Keywords (homepage cluster only)
# ---------------------------------------------------------------------------


def homepage_keywords() -> list[dict[str, Any]]:
    """Generic queries that should land on / not a guide or city page.

    Volumes are directional UK estimates in the same style as
    scripts/build_keyword_mapping.py, not live Ads data.
    """
    rows = [
        ("broadband", 246000, 78, 3.80, "Informational", "primary", "Head term. Own with H1 + postcode tool + definition."),
        ("broadband uk", 33100, 55, 4.10, "Informational", "primary", "Geo-qualified head term. Title and intro."),
        ("compare broadband", 14800, 58, 5.90, "Commercial", "primary", "Job of the homepage. H1 variant."),
        ("broadband comparison", 5400, 48, 5.40, "Commercial", "primary", "Same cluster as compare broadband."),
        ("broadband checker", 14800, 42, 3.20, "Transactional tool", "primary", "Postcode checker is the tool."),
        ("broadband in my area", 12100, 40, 3.50, "Local commercial", "primary", "Postcode CTA, not a city URL."),
        ("home broadband", 14800, 52, 4.00, "Informational", "secondary", "Household framing in body."),
        ("internet deals uk", 9900, 60, 6.10, "Commercial", "secondary", "Synonym. Do not make it the H1."),
        ("broadband providers uk", 22200, 62, 4.80, "Commercial", "secondary", "Logo bar + link to /providers."),
        ("switch broadband", 8100, 38, 4.20, "Transactional", "secondary", "OTS explainer + /guides/how-to-switch."),
        ("fibre broadband", 90500, 68, 5.50, "Informational", "supporting", "Define FTTP vs FTTC. Link the guide."),
        ("full fibre broadband", 40500, 58, 5.80, "Informational", "supporting", "Same. Do not steal the full-fibre guide."),
        ("broadband deals", 165000, 71, 8.32, "Commercial", "supporting", "Featured table, but /deals owns the hub."),
        ("compare broadband deals", 9900, 62, 6.40, "Commercial", "supporting", "Share with /compare. Homepage = start."),
        ("best broadband uk", 22200, 64, 6.00, "Commercial", "supporting", "Point to /guides/best-broadband-providers-uk."),
        ("cheap broadband", 49500, 55, 4.58, "Commercial", "supporting", "Point to /guides/cheapest-broadband-uk."),
        ("broadband postcode", 2900, 28, 2.80, "Transactional tool", "supporting", "Checker copy."),
        ("what broadband do i need", 3600, 24, 2.10, "Informational", "supporting", "Speed-need interactive + match quiz."),
        ("ofcom broadband", 2400, 32, 1.40, "Informational", "trust", "Cite Ofcom. Do not impersonate."),
        ("one touch switch", 5400, 22, 1.80, "Informational", "trust", "Rights block. Link the switch guide."),
    ]
    out = []
    for term, vol, diff, cpc, intent, role, note in rows:
        out.append({
            "keyword": term,
            "volume": vol,
            "difficulty": diff,
            "cpc": cpc,
            "intent": intent,
            "role": role,
            "homepage_job": note,
            "cannibal_risk": (
                "High: keep a teaser and link out"
                if role == "supporting" and "deals" in term
                else "Low: homepage should rank"
                if role == "primary"
                else "Medium: share with a child URL"
            ),
        })
    return out


# ---------------------------------------------------------------------------
# Live scrape
# ---------------------------------------------------------------------------


class _TextExtractor(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self._skip = False
        self.parts: list[str] = []
        self.title = ""
        self._in_title = False
        self.h1: list[str] = []
        self.h2: list[str] = []
        self._heading: str | None = None
        self._buf: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag in {"script", "style", "noscript", "svg"}:
            self._skip = True
        if tag == "title":
            self._in_title = True
        if tag in {"h1", "h2"}:
            self._heading = tag
            self._buf = []

    def handle_endtag(self, tag: str) -> None:
        if tag in {"script", "style", "noscript", "svg"}:
            self._skip = False
        if tag == "title":
            self._in_title = False
        if tag in {"h1", "h2"} and self._heading == tag:
            text = re.sub(r"\s+", " ", "".join(self._buf)).strip()
            if tag == "h1" and text:
                self.h1.append(text[:180])
            if tag == "h2" and text:
                self.h2.append(text[:160])
            self._heading = None
        if tag in {"p", "li", "h1", "h2", "h3", "br", "div"}:
            self.parts.append("\n")

    def handle_data(self, data: str) -> None:
        if self._skip:
            return
        text = re.sub(r"\s+", " ", data)
        if self._in_title and text.strip() and not self.title:
            self.title = text.strip()[:200]
        if self._heading:
            self._buf.append(text)
        if text.strip():
            self.parts.append(text)


def http_get(url: str, timeout: int = 18) -> dict[str, Any]:
    row: dict[str, Any] = {
        "url": url,
        "ok": False,
        "status": 0,
        "title": "",
        "h1": [],
        "h2": [],
        "word_count": 0,
        "has_postcode": False,
        "has_faq": False,
        "has_schema": False,
        "faq_signal": False,
        "table_signal": False,
        "form_signal": False,
        "excerpt": "",
        "error": "",
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
            html = raw.decode("utf-8", errors="replace")
    except HTTPError as exc:
        row["status"] = exc.code
        row["error"] = f"HTTP {exc.code}"
        return row
    except (URLError, TimeoutError, OSError) as exc:
        row["error"] = str(exc)[:200]
        return row

    parser = _TextExtractor()
    try:
        parser.feed(html)
        parser.close()
    except Exception:
        pass
    text = re.sub(r"\s+", " ", " ".join(parser.parts)).strip()
    lower = html.lower()
    row["ok"] = True
    row["title"] = parser.title
    row["h1"] = parser.h1[:3]
    row["h2"] = unique(parser.h2)[:12]
    row["word_count"] = len(text.split())
    row["has_postcode"] = bool(re.search(r"postcode|enter your address|check availability", lower))
    row["has_faq"] = "faq" in lower or "frequently asked" in lower
    row["has_schema"] = "application/ld+json" in lower or "schema.org" in lower
    row["faq_signal"] = '"faqpage"' in lower or "faqpage" in lower
    row["table_signal"] = "<table" in lower
    row["form_signal"] = "<form" in lower or "input" in lower
    row["excerpt"] = text[:900]
    return row


def scrape_competitors(skip: bool) -> list[dict[str, Any]]:
    if skip:
        return [{"name": name, "url": url, "ok": False, "error": "skipped"} for name, url in COMPETITORS]
    out = []
    for name, url in COMPETITORS:
        row = http_get(url)
        row["name"] = name
        out.append(row)
    return out


def competitor_patterns(fetches: list[dict[str, Any]]) -> dict[str, Any]:
    ok = [row for row in fetches if row.get("ok")]
    if not ok:
        return {"readable": 0, "notes": ["No live competitor HTML this run."]}
    return {
        "readable": len(ok),
        "median_words": sorted(row["word_count"] for row in ok)[len(ok) // 2],
        "with_postcode": sum(1 for row in ok if row.get("has_postcode")),
        "with_faq": sum(1 for row in ok if row.get("has_faq")),
        "with_schema": sum(1 for row in ok if row.get("has_schema")),
        "with_faqpage": sum(1 for row in ok if row.get("faq_signal")),
        "h1_samples": [row["h1"][0] for row in ok if row.get("h1")][:8],
        "h2_samples": unique([h for row in ok for h in row.get("h2") or []])[:20],
        "observation": (
            "UK comparison homepages lead with a postcode checker, a short H1 about "
            "deals or comparison, a provider logo strip, and a thin editorial block. "
            "FAQ and FAQPage schema are inconsistent. Word counts on JS shells look "
            "low even when the rendered page is long. BroadbandPicker should keep the "
            "checker first, then out-write them with citeable, dated, human copy and "
            "interactive modules that still index as HTML."
        ),
    }


# ---------------------------------------------------------------------------
# Brief
# ---------------------------------------------------------------------------


COPY_RULES = [
    "British English. Fibre, not fiber. Organisation, not organization in running copy unless it is a schema field.",
    "No em dash (U+2014). Use a comma, a colon, a full stop, or a hyphen.",
    "No AI tells: delve, landscape, in today's world, whether you're, it's important to note, unlock, elevate, seamless, comprehensive guide, let's dive, robust, leverage, cutting-edge, game-changer.",
    "Do not open every section with a definition of broadband. Answer the search, then explain.",
    "Put a direct 40 to 70 word answer under the first H2 so AI Overviews and LLMs have something to quote.",
    "Date prices and Ofcom facts. Link /how-we-review-broadband and /how-we-make-money.",
    "Affiliate honesty in the same breath as the deal table, not a footer afterthought.",
    "Specific names: BT, Sky, Virgin Media, EE, TalkTalk, Vodafone, Plusnet, Hyperoptic, Community Fibre, Toob.",
    "Short sentences mixed with longer ones. One joke is allowed. A paragraph of jokes is not.",
    "Internal links to /deals, /compare, /guides/how-to-switch-broadband-uk, /guides/cheapest-broadband-uk, /guides/broadband-social-tariffs-uk, /speed-test, /tools/broadband-match.",
]


GEO_RULES = [
    "Lead sections with a plain-English claim a model can lift without the surrounding marketing.",
    "FAQ answers of 2 to 4 sentences, one fact each, with a source or a dated caveat.",
    "JSON-LD: WebSite + SearchAction, Organization, WebPage, FAQPage, HowTo for the three steps. Sanitize < in stringify.",
    "sameAs social profiles. Organization logo. dateModified from the deals snapshot.",
    "Speakable-style first paragraph: who we are, what the tool does, that availability is by address.",
    "Cite Ofcom (One Touch Switch, social tariffs, full fibre coverage) rather than inventing stats.",
    "Do not cloak. The HTML the crawler sees is the HTML the user sees.",
    "Track AI referrals with the existing ai_referral_visit event. Do not add hidden prompt text.",
]


UX_PLAN = [
    {
        "slot": "Hero",
        "job": "Rank for compare broadband / broadband checker. Convert postcode.",
        "interactive": "Existing large PostcodeChecker. Keep it as the only primary CTA.",
        "visual": "Navy/sky field, hero-network SVG, no stock photo.",
        "copy": "H1 stays Compare Broadband Deals for Your Postcode. Subhead names fibre and full fibre without a national from-price.",
    },
    {
        "slot": "Proof strip",
        "job": "Trust in 3 seconds for humans and Awin reviewers.",
        "interactive": "SocialProofCounter already animates. Keep provider count live from data/providers.ts.",
        "visual": "Ticks, not badges bought from a widget farm.",
        "copy": "Comparing N providers. Free. Rankings not sold.",
    },
    {
        "slot": "Logo rail",
        "job": "broadband providers uk.",
        "interactive": "Horizontal swipe on mobile already exists.",
        "visual": "Real provider SVGs, rounded cards.",
        "copy": "Compare deals from the networks that actually reach UK homes.",
    },
    {
        "slot": "Featured deals",
        "job": "Commercial teaser. Do not replace /deals.",
        "interactive": "DealTable with Get Deal. Disclosure under the table.",
        "visual": "Existing table. No red SALE skin.",
        "copy": "Today's snapshot, dated. Link See all deals.",
    },
    {
        "slot": "What speed do you actually need",
        "job": "what broadband do i need. Saves. GEO quote.",
        "interactive": "Clickable household cards (1 person, couple, family, busy house) that reveal a typical Mbps range and a CTA to Broadband Match.",
        "visual": "Four original SVG tiles, sky/navy, not stock families.",
        "copy": "Gigabit is optional. Ping and upload matter. Be honest.",
    },
    {
        "slot": "How it works",
        "job": "HowTo schema. Reduce switch fear.",
        "interactive": "ScrollReveal on the three steps. Hover scale already there.",
        "visual": "icon-postcode, icon-compare, icon-switch.",
        "copy": "Postcode, compare, the new provider handles One Touch Switch. No em dash.",
    },
    {
        "slot": "Rights and loyalty tax",
        "job": "switch broadband, one touch switch. Citation bait.",
        "interactive": "Three fact cards with a source line. Link the guides.",
        "visual": "Minimal navy cards, one sky accent.",
        "copy": "Out of contract is the business model. OTS is real. Social tariffs exist and most eligible people have not heard of them.",
    },
    {
        "slot": "Deep editorial",
        "job": "Indexable depth for broadband / broadband uk. AI Overview source.",
        "interactive": "None required. HTML is the feature.",
        "visual": "Pull-quote of the 50-word answer. Small fibre vs cabinet diagram.",
        "copy": "800 to 1400 words. Human. Dated. Internal links. No duplicate of a guide.",
    },
    {
        "slot": "FAQ",
        "job": "People Also Ask + FAQPage.",
        "interactive": "Existing FAQAccordion.",
        "visual": "Clean bordered list.",
        "copy": "Eight questions that match homepage queries, not category guides.",
    },
    {
        "slot": "Match quiz + newsletter",
        "job": "Engagement and return visits.",
        "interactive": "Existing quiz promo and NewsletterSignup.",
        "visual": "quiz-match.svg, blob decorations.",
        "copy": "Keep. Remove any leftover em dash.",
    },
]


HOMEPAGE_FAQS = [
    {
        "question": "How do I compare broadband deals in the UK?",
        "answer": (
            "Enter your postcode. Availability, speed and price change street by street, "
            "so a national from-price is guesswork. BroadbandPicker lists the packages "
            "that can actually serve that address, then you compare monthly cost, contract "
            "length, setup fees and typical speed before you switch."
        ),
    },
    {
        "question": "Is BroadbandPicker free to use?",
        "answer": (
            "Yes. The comparison is free. We may earn an affiliate commission if you click "
            "through and sign up with a provider. That fee does not change the order of the "
            "table. We still list providers we do not earn from. The full explanation is on "
            "How we make money."
        ),
    },
    {
        "question": "Why do broadband deals depend on my postcode?",
        "answer": (
            "Different networks built different streets. Openreach, Virgin Media, CityFibre "
            "and smaller full-fibre builders do not cover the same homes. Two neighbours can "
            "see different speeds and different prices. Check the address, not the TV advert."
        ),
    },
    {
        "question": "What broadband speed do I actually need?",
        "answer": (
            "One or two people browsing and watching HD are usually fine on a few dozen Mbps. "
            "A family that works from home and streams in 4K needs more, especially on the "
            "upload. Gaming cares more about ping than a vanity gigabit number. Use the "
            "household cards on this page or the Broadband Match quiz if you want a tailored range."
        ),
    },
    {
        "question": "What is the difference between fibre and full fibre?",
        "answer": (
            "A lot of UK 'fibre' is fibre to a street cabinet and copper for the last stretch "
            "(FTTC). Full fibre, or FTTP, runs glass all the way to the premises. Full fibre "
            "is faster on the upload and more consistent at 7pm. If the listing does not say "
            "full fibre or FTTP, assume it may still involve copper."
        ),
    },
    {
        "question": "How does switching broadband work now?",
        "answer": (
            "One Touch Switch, live since 12 September 2024, means the new provider handles "
            "the move and you stay online during the cutover in the usual case. You still "
            "need to check early-termination fees if you are in contract. Ofcom reports more "
            "than two million residential switches completed under the process."
        ),
    },
    {
        "question": "Are there cheaper broadband tariffs if I claim benefits?",
        "answer": (
            "Yes. Social tariffs from participating providers sit roughly in the £12.50 to "
            "£24 a month range if you qualify (for example Universal Credit or Pension Credit). "
            "Ofcom has found that most eligible households still have not heard of them. We "
            "publish a plain-English guide rather than burying this in a PDF."
        ),
    },
    {
        "question": "Does staying loyal get me a better broadband price?",
        "answer": (
            "Usually the opposite. Introductory prices end, and many households keep paying "
            "the higher out-of-contract rate. New-customer deals on the same network are "
            "often cheaper. Check your contract end date, then compare what is on offer at "
            "your postcode before you assume loyalty is being rewarded."
        ),
    },
]


def markdown_plan(audit: SiteAudit, keywords: list[dict[str, Any]], fetches: list[dict[str, Any]], patterns: dict[str, Any]) -> str:
    kw_rows = "\n".join(
        f"| {k['keyword']} | {k['volume']:,} | {k['difficulty']} | {k['cpc']:.2f} | {k['intent']} | {k['role']} | {k['cannibal_risk']} |"
        for k in keywords
    )
    fetch_rows = "\n".join(
        f"| {r.get('name')} | {r.get('status') or r.get('error')} | {'yes' if r.get('ok') else 'no'} | {r.get('word_count', 0)} | "
        f"{'Y' if r.get('has_postcode') else 'n'} | {'Y' if r.get('has_faq') else 'n'} | {(r.get('h1') or ['—'])[0] if r.get('ok') else '—'} |"
        for r in fetches
    )
    ux_blocks = "\n".join(
        f"### {item['slot']}\n\n- **Job:** {item['job']}\n- **Interactive:** {item['interactive']}\n"
        f"- **Visual:** {item['visual']}\n- **Copy:** {item['copy']}\n"
        for item in UX_PLAN
    )
    faq_md = "\n".join(f"**{f['question']}**\n\n{f['answer']}\n" for f in HOMEPAGE_FAQS)
    gsc = audit.gsc_homepage_ai_impressions
    gsc_line = (
        f"GSC Search Generative AI Features export: homepage has **{gsc}** impressions "
        "in that extract. Guides currently absorb more AI-overview impressions than `/`. "
        "The homepage needs citeable answers, not just a checker, if we want LLMs to quote it."
        if gsc is not None
        else "No GSC AI-overview extract found in data/GSC."
    )
    tells = ", ".join(audit.homepage_ai_tells) if audit.homepage_ai_tells else "none detected in markup"
    return f"""# Homepage SEO + GEO + UX plan

Generated {datetime.now(timezone.utc).date().isoformat()}.
Site: {SITE}

This file is written by `scripts/plan_homepage_seo_geo.py`. It is a brief for the live
homepage: generic broadband queries, not city or category URLs.

## What BroadbandPicker is

{audit.industry}

**Revenue:** {audit.revenue_model or 'Affiliate comparison.'}

**Providers in the dataset:** {audit.provider_count} ({', '.join(audit.providers[:8])}{'…' if audit.provider_count > 8 else ''})

**Tools already on the site:** {', '.join(audit.tools)}

**Trust URLs:** {', '.join(audit.trust_pages)}

## Current homepage audit

| Field | Value |
|---|---|
| Title | {audit.homepage_title} |
| H1 | {audit.homepage_h1} |
| Meta description | {audit.homepage_description} |
| Approx. words in TSX text | {audit.homepage_word_count} |
| Em dashes in `app/page.tsx` | {audit.homepage_em_dashes} |
| AI-tell patterns | {tells} |

{gsc_line}

Files read:

{chr(10).join(f'- {p}' for p in audit.files_read)}

## Homepage keyword cluster

These are the searches that should reach `/`, not `/guides/cheapest-broadband-uk` or `/postcode/london`.

| Keyword | Volume | KD | CPC | Intent | Role | Cannibal risk |
|---|---|---|---|---|---|---|
{kw_rows}

**Primary title pattern:** Compare Broadband Deals UK | postcode checker. Keep the live title. Do not retitle to Cheap Broadband and steal `/deals`.

**Primary H1:** Compare Broadband Deals for Your Postcode. It already matches the cluster.

## Competitor homepages (live scrape)

Readable pages: {patterns.get('readable', 0)}. Median word count on fetched HTML: {patterns.get('median_words', 'n/a')}.
Postcode UX on {patterns.get('with_postcode', 0)} pages. FAQ mention on {patterns.get('with_faq', 0)}. Schema on {patterns.get('with_schema', 0)}. FAQPage on {patterns.get('with_faqpage', 0)}.

{patterns.get('observation', '')}

| Source | HTTP | OK | Words | Postcode | FAQ | H1 |
|---|---|---|---|---|---|---|
{fetch_rows}

Sample H2s seen: {', '.join(patterns.get('h2_samples') or []) or 'none'}

## Copy rules (anti-AI, pro-citation)

{chr(10).join(f'- {r}' for r in COPY_RULES)}

## GEO: get quoted by AI Overviews and LLMs

{chr(10).join(f'- {r}' for r in GEO_RULES)}

First 60-word answer to put under an H2, as a model-liftable paragraph:

> BroadbandPicker is a free UK comparison site. You enter a postcode, we show the
> broadband deals that can actually serve that address, and you pick a package by
> price, speed and contract. We may earn a commission if you sign up. That does not
> buy a higher rank. Availability is always by address, never by a national advert.

## UX plan (modern, interactive, on-brand)

Keep the navy/sky system. Do not add stock photography. This vertical's winning
homepages are SVG + logos + a checker (see `homepage-redesign-analysis.md`).
Interactivity should be HTML-first islands (`use client` only where the click
does something), so Google and GPTBot still see the answers.

{ux_blocks}

## FAQ to ship on the homepage

{faq_md}

## Implementation notes for Next.js in this repo

- Homepage stays a Server Component in `app/page.tsx`. Interactive bits are client islands.
- JSON-LD via a `<script type="application/ld+json">` with `JSON.stringify(...).replace(/</g, '\\\\u003c')` as in the Next.js JSON-LD guide.
- New SVGs go through `scripts/generate_homepage_illustrations.py`, not stock.
- Do not introduce a carousel library. The competitor visual scan found none in this vertical.

## Success

- Rank and CTR for `compare broadband`, `broadband uk`, `broadband checker`, `broadband in my area`.
- AI Overview / LLM citations of the 60-word answer and the FAQ.
- Postcode submit rate on `/` holds or rises. Affiliate clicks from the featured table stay honest and labelled.
"""


def main() -> int:
    parser = argparse.ArgumentParser(description="Plan BroadbandPicker homepage SEO, GEO and UX from the repo plus live scrapes.")
    parser.add_argument("--skip-web", action="store_true")
    parser.add_argument("--output-dir", default=str(OUT_DIR))
    args = parser.parse_args()
    out = Path(args.output_dir)
    out.mkdir(parents=True, exist_ok=True)

    audit = analyse_workspace()
    keywords = homepage_keywords()
    fetches = scrape_competitors(skip=args.skip_web)
    patterns = competitor_patterns(fetches)
    payload = {
        "generated_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "site": SITE,
        "audit": asdict(audit),
        "keywords": keywords,
        "competitor_fetches": fetches,
        "competitor_patterns": patterns,
        "copy_rules": COPY_RULES,
        "geo_rules": GEO_RULES,
        "ux_plan": UX_PLAN,
        "faqs": HOMEPAGE_FAQS,
    }
    (out / "homepage-seo-geo-plan.json").write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    (out / "homepage-seo-geo-plan.md").write_text(markdown_plan(audit, keywords, fetches, patterns), encoding="utf-8")
    print(f"Providers: {audit.provider_count}")
    print(f"Homepage em dashes: {audit.homepage_em_dashes} · AI tells: {audit.homepage_ai_tells or 'none'}")
    print(f"Keywords: {len(keywords)}")
    ok = sum(1 for row in fetches if row.get("ok"))
    print(f"Competitor fetches: {ok}/{len(fetches)}")
    print(f"Wrote { (out / 'homepage-seo-geo-plan.md').relative_to(ROOT) }")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
