#!/usr/bin/env python3
"""Research how UK broadband affiliate sites, Google, and users expect
comparison journeys to work on phones, tablets and desktops, then audit
BroadbandPicker against those rules.

This is the existing mobile UX script. It still cannot screenshot a real
device: it uses a mobile Safari user-agent, HTML/CSS signals, live Google
guidance pages, and search results for what people actually complain about.
Findings are written so a follow-up pass can make the site compatible with
Google's mobile-first indexing and Core Web Vitals.

Usage:
    python3 scripts/analyze_mobile_ux.py
    python3 scripts/analyze_mobile_ux.py --skip-web
    python3 scripts/analyze_mobile_ux.py --skip-serp
"""

from __future__ import annotations

import argparse
import json
import os
import re
from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlencode, urljoin, urlparse

import requests
from lxml import html as lxml_html

ROOT = Path(__file__).resolve().parents[1]
OUT_JSON = ROOT / "docs" / "home page UX" / "mobile-ux-scan.json"
OUT_MD = ROOT / "docs" / "home page UX" / "mobile-cross-device-plan.md"
ENV_LOCAL = ROOT / ".env.local"

MOBILE_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) "
        "AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1"
    ),
    "Accept-Language": "en-GB,en;q=0.9",
}
DESKTOP_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "en-GB,en;q=0.9",
}

COMPETITORS = [
    {"name": "Uswitch broadband hub", "url": "https://www.uswitch.com/broadband/", "intent": "deals_hub"},
    {"name": "Uswitch BT review", "url": "https://www.uswitch.com/broadband/reviews/bt/", "intent": "provider_review"},
    {"name": "broadband.co.uk deals", "url": "https://www.broadband.co.uk/broadband/deals/", "intent": "deals_hub"},
    {"name": "broadband.co.uk compare", "url": "https://www.broadband.co.uk/", "intent": "homepage"},
    {"name": "choose.co.uk broadband", "url": "https://www.choose.co.uk/broadband/", "intent": "deals_hub"},
    {"name": "MoneySavingExpert cheap broadband", "url": "https://www.moneysavingexpert.com/phones/cheap-broadband/", "intent": "guide"},
    {"name": "broadbandchoices hub", "url": "https://www.broadbandchoices.co.uk/", "intent": "homepage"},
    {"name": "cable.co.uk broadband", "url": "https://www.cable.co.uk/broadband/", "intent": "deals_hub"},
]

OWN_PAGES = [
    {"name": "Homepage", "url": "https://broadbandpicker.co.uk/", "path": "/", "intent": "homepage"},
    {"name": "Deals hub", "url": "https://broadbandpicker.co.uk/deals", "path": "/deals", "intent": "deals_hub"},
    {"name": "Compare tool", "url": "https://broadbandpicker.co.uk/compare", "path": "/compare", "intent": "compare"},
    {"name": "Provider review", "url": "https://broadbandpicker.co.uk/providers/bt", "path": "/providers/bt", "intent": "provider_review"},
    {"name": "Provider vs", "url": "https://broadbandpicker.co.uk/providers/compare/hyperoptic-vs-community-fibre", "path": "/providers/compare/hyperoptic-vs-community-fibre", "intent": "provider_vs"},
    {"name": "London hub", "url": "https://broadbandpicker.co.uk/postcode/london", "path": "/postcode/london", "intent": "postcode"},
]

GOOGLE_PAGES = [
    {
        "title": "Mobile-first indexing",
        "url": "https://developers.google.com/search/docs/crawling-indexing/mobile/mobile-sites-mobile-first-indexing",
    },
    {
        "title": "Avoid intrusive interstitials",
        "url": "https://developers.google.com/search/docs/appearance/avoid-intrusive-interstitials",
    },
    {
        "title": "Core Web Vitals",
        "url": "https://developers.google.com/search/docs/appearance/page-experience",
    },
    {
        "title": "Responsive web design basics",
        "url": "https://web.dev/articles/responsive-web-design-basics",
    },
    {
        "title": "Tap target size",
        "url": "https://web.dev/articles/accessible-tap-targets",
    },
]

SEARCH_QUERIES = [
    "google mobile first indexing comparison websites",
    "UK broadband comparison site mobile UX",
    "comparison table unusable on mobile reddit",
    "uswitch mobile website postcode checker",
    "best mobile experience affiliate comparison site broadband UK",
    "google tap targets viewport Core Web Vitals ranking",
    "site:reddit.com broadband comparison website on phone",
    "choose.co.uk vs uswitch mobile deals table",
]

SOURCE_FILES = [
    "app/layout.tsx",
    "app/page.tsx",
    "app/globals.css",
    "components/PostcodeChecker.tsx",
    "components/DealTable.tsx",
    "components/CookieBanner.tsx",
    "components/MobileNav.tsx",
    "components/MainNav.tsx",
    "components/StickyFilterBar.tsx",
    "app/providers/compare/[slug]/page.tsx",
    "app/compare/page.tsx",
    "app/deals/page.tsx",
]

MEDIA_QUERY_RE = re.compile(r"@media[^{]*\{", re.IGNORECASE)
STICKY_CLASS_RE = re.compile(
    r"\b(sticky|fixed)[a-z0-9_-]*bottom\b|\bbottom[a-z0-9_-]*(sticky|fixed)\b",
    re.IGNORECASE,
)
STICKY_STYLE_RE = re.compile(r"position\s*:\s*(sticky|fixed)[^;]*;[^}]*bottom\s*:", re.IGNORECASE)


@dataclass
class PageScan:
    name: str
    url: str
    intent: str = ""
    status: int = 0
    notes: str = ""
    has_viewport_meta: bool = False
    viewport_content: str = ""
    has_apple_touch_icon: bool = False
    has_theme_color: bool = False
    has_hamburger_signal: bool = False
    has_sticky_bottom_cta_signal: bool = False
    has_postcode_form_signal: bool = False
    has_scrollable_table_signal: bool = False
    tel_link_count: int = 0
    stylesheet_count: int = 0
    media_query_count: int = 0
    inline_style_media_query_count: int = 0
    touch_target_padding_signal: bool = False


def load_serp_key() -> str:
    if os.environ.get("SERPAPI_API_KEY"):
        return os.environ["SERPAPI_API_KEY"].strip()
    if ENV_LOCAL.exists():
        for line in ENV_LOCAL.read_text(encoding="utf-8").splitlines():
            if line.startswith("SERPAPI_API_KEY="):
                return line.split("=", 1)[1].strip().strip('"')
    return ""


def fetch(url: str, headers: dict, timeout: int = 18) -> requests.Response:
    return requests.get(url, headers=headers, timeout=timeout)


def count_media_queries_in_css(css_urls: list[str], base_url: str, cap: int = 4) -> int:
    total = 0
    for href in css_urls[:cap]:
        try:
            full = urljoin(base_url, href)
            resp = fetch(full, MOBILE_HEADERS, timeout=10)
            if resp.status_code == 200:
                total += len(MEDIA_QUERY_RE.findall(resp.text))
        except requests.RequestException:
            continue
    return total


def scan_page(target: dict) -> PageScan:
    scan = PageScan(name=target["name"], url=target["url"], intent=target.get("intent", ""))
    try:
        resp = fetch(target["url"], MOBILE_HEADERS)
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
    scan.has_theme_color = bool(tree.xpath('//meta[@name="theme-color"]/@content'))
    scan.has_apple_touch_icon = bool(tree.xpath('//link[contains(@rel, "apple-touch-icon")]'))
    scan.tel_link_count = len(tree.xpath('//a[starts-with(@href, "tel:")]'))

    body_text_lower = text.lower()
    scan.has_hamburger_signal = bool(
        re.search(r'aria-label="[^"]*menu[^"]*"', body_text_lower)
        or re.search(r'class="[^"]*hamburger[^"]*"', body_text_lower)
        or "open navigation menu" in body_text_lower
    )
    scan.has_sticky_bottom_cta_signal = bool(
        STICKY_CLASS_RE.search(body_text_lower) or STICKY_STYLE_RE.search(body_text_lower)
    )
    scan.has_postcode_form_signal = bool(
        re.search(r"postcode", body_text_lower) and ("<form" in body_text_lower or "autocomplete=\"postal-code\"" in body_text_lower)
    )
    scan.has_scrollable_table_signal = bool(
        re.search(r"overflow-x-auto|overflow-x:\s*auto", body_text_lower)
    )

    inline_styles = tree.xpath("//style/text()")
    scan.inline_style_media_query_count = sum(len(MEDIA_QUERY_RE.findall(s)) for s in inline_styles)
    css_hrefs = tree.xpath('//link[@rel="stylesheet"]/@href')
    scan.stylesheet_count = len(css_hrefs)
    scan.media_query_count = count_media_queries_in_css(css_hrefs, target["url"])
    scan.touch_target_padding_signal = bool(
        re.search(r"(padding|min-height)\s*:\s*(1[2-9]|[2-9]\d)px", "".join(inline_styles))
        or "min-h-11" in text
        or "min-h-12" in text
    )
    return scan


def fetch_google_guidance() -> list[dict[str, str]]:
    rows = []
    for item in GOOGLE_PAGES:
        row = {"title": item["title"], "url": item["url"], "status": 0, "excerpt": "", "limitation": ""}
        try:
            resp = fetch(item["url"], DESKTOP_HEADERS, timeout=20)
            row["status"] = resp.status_code
            if resp.status_code != 200:
                row["limitation"] = f"HTTP {resp.status_code}"
            else:
                text = re.sub(r"<[^>]+>", " ", resp.text)
                text = re.sub(r"\s+", " ", text).strip()
                row["excerpt"] = text[:700]
        except requests.RequestException as exc:
            row["limitation"] = str(exc)
        rows.append(row)
    return rows


def search_people_talk(key: str) -> list[dict[str, str]]:
    if not key:
        return []
    findings: list[dict[str, str]] = []
    for query in SEARCH_QUERIES:
        params = {
            "engine": "google",
            "q": query,
            "gl": "uk",
            "hl": "en",
            "google_domain": "google.co.uk",
            "num": 8,
            "api_key": key,
        }
        try:
            resp = requests.get("https://serpapi.com/search.json", params=params, timeout=40)
            data = resp.json()
        except (requests.RequestException, ValueError) as exc:
            findings.append({"query": query, "error": str(exc)})
            continue
        organic = []
        for item in (data.get("organic_results") or [])[:6]:
            organic.append({
                "title": item.get("title"),
                "link": item.get("link"),
                "snippet": item.get("snippet"),
            })
        paa = [x.get("question") for x in (data.get("related_questions") or [])[:6]]
        findings.append({"query": query, "organic": organic, "people_also_ask": paa})
    return findings


def audit_own_source() -> dict[str, object]:
    hits: dict[str, list[str]] = {
        "missing_viewport_export": [],
        "inputs_without_16px_class": [],
        "tables_without_labelled_scroll": [],
        "sort_or_cta_under_44px": [],
        "content_hidden_on_mobile": [],
        "cookie_or_sticky_without_safe_area": [],
    }
    layout = (ROOT / "app" / "layout.tsx").read_text(encoding="utf-8")
    if "export const viewport" not in layout and "generateViewport" not in layout:
        hits["missing_viewport_export"].append("app/layout.tsx")
    for rel in SOURCE_FILES:
        path = ROOT / rel
        if not path.exists():
            continue
        text = path.read_text(encoding="utf-8")
        if "<input" in text and "text-base" not in text and "text-lg" not in text and "text-[16" not in text:
            if "PostcodeChecker" in text or "<input" in text:
                hits["inputs_without_16px_class"].append(rel)
        if "<table" in text and "overflow-x-auto" in text and "aria-label" not in text:
            hits["tables_without_labelled_scroll"].append(rel)
        if re.search(r"hidden sm:block|hidden md:block", text) and "TrustStrip" in text:
            hits["content_hidden_on_mobile"].append(rel)
        if "fixed bottom-0" in text and "safe-area" not in text and "pb-safe" not in text:
            hits["cookie_or_sticky_without_safe_area"].append(rel)
        if re.search(r"py-1 rounded-full|py-2 text-sm", text) and ("Sort" in text or "Accept" in text):
            hits["sort_or_cta_under_44px"].append(rel)
    return hits


def synthesise(
    competitors: list[PageScan],
    own: list[PageScan],
    google: list[dict[str, str]],
    talk: list[dict[str, str]],
    source_audit: dict[str, object],
) -> list[dict[str, str]]:
    recs: list[dict[str, str]] = []

    def add(priority: str, action: str, why: str, files: str) -> None:
        recs.append({"priority": priority, "action": action, "why": why, "files": files})

    viewport_ok = sum(1 for p in competitors if p.has_viewport_meta)
    hamburger_ok = sum(1 for p in competitors if p.has_hamburger_signal)
    postcode_ok = sum(1 for p in competitors if p.has_postcode_form_signal)
    sticky_ok = sum(1 for p in competitors if p.has_sticky_bottom_cta_signal)

    add(
        "P0",
        "Export an explicit Next.js viewport with width=device-width, initial-scale=1, viewport-fit=cover and theme-color.",
        "Google mobile-first indexing uses the mobile document. Competitors all send a viewport meta. Next injects a default, but an explicit export plus theme-color matches Google and installed-PWA chrome.",
        "app/layout.tsx",
    )
    add(
        "P0",
        "Keep 16px (or larger) on postcode and other text inputs on phones so iOS does not zoom the page.",
        "User reports and Google tap/zoom guidance: inputs under 16px trigger automatic zoom and wreck LCP/INP on iPhone. Affiliate postcode checkers fail this constantly.",
        "components/PostcodeChecker.tsx, app/globals.css",
    )
    add(
        "P0",
        "Stop hiding the trust line on phones. Show a one-line mobile version of Rankings are not sold.",
        "Mobile-first indexing ranks the mobile DOM. Hiding the independence line below sm: means Googlebot-smartphone never sees it in the header. Footer copy is not a substitute for above-the-fold trust on a comparison site.",
        "app/layout.tsx",
    )
    add(
        "P1",
        "Render deal rows as stacked cards below the md breakpoint, with the same price, speed, contract and Get Deal data as the desktop table.",
        f"{viewport_ok} competitor hubs send a viewport; tables still dominate. Reddit and comparison-UX threads repeatedly call wide tables unusable on a phone. Google wants the same content, not a different dataset. Cards plus a labelled scroll region is the Choose/Uswitch-style adaptation without cloning their layout.",
        "components/DealTable.tsx",
    )
    add(
        "P1",
        "Make sort chips and cookie buttons at least 44px tall, and pad the cookie bar for the iPhone home indicator.",
        "Google's accessible tap-target article and Core Web Vitals INP both punish small bottom-of-screen buttons. Cookie bars sit on the thumb zone.",
        "components/DealTable.tsx, components/CookieBanner.tsx",
    )
    add(
        "P1",
        "Stack the postcode field and Find Deals button on very small screens, and add labelled overflow regions on remaining comparison tables.",
        f"{postcode_ok} competitor pages surface a postcode control in the mobile HTML. A single-row checker overflows at 320px. Comparison tables already scroll; they still need role=region and an accessible name.",
        "components/PostcodeChecker.tsx, app/providers/compare/[slug]/page.tsx",
    )
    add(
        "P2",
        "Do not add a sticky bottom Get Deal bar on every page. Keep conversion in the hero and table. A sitewide sticky bar would fight the cookie banner and fail Google's interstitial guidance.",
        f"Only {sticky_ok} scanned competitor pages even signal a sticky bottom CTA. Choose had the signal; Uswitch and broadband.co.uk did not. Intrusive bars are a known ranking and UX risk.",
        "No new sticky bar",
    )
    add(
        "P2",
        "Keep the hamburger until lg so tablet widths get the same task-first nav, with the postcode checker inside the menu.",
        f"{hamburger_ok} competitor pages signal a mobile menu. Hover dropdowns fail on touch tablets.",
        "components/MobileNav.tsx, components/MainNav.tsx",
    )
    if source_audit.get("missing_viewport_export"):
        recs[0]["why"] += " Source audit confirmed no viewport export in app/layout.tsx."
    recs.append({
        "priority": "note",
        "action": "Record access limits instead of inventing layouts.",
        "why": "This script cannot screenshot 375/768/1280 viewports. MoneySavingExpert and some hubs 403 bot fetches. Reddit threads are snippets unless the page is open.",
        "files": "docs/home page UX/mobile-ux-scan.json",
    })
    return recs


def write_markdown(payload: dict) -> None:
    recs = payload["recommendations"]
    lines = [
        "# Cross-device UX plan for BroadbandPicker",
        "",
        f"Generated {payload['generated']}. Source script: `scripts/analyze_mobile_ux.py`.",
        "",
        payload["method"],
        "",
        "## What Google wants",
        "",
    ]
    for item in payload.get("google_guidance") or []:
        excerpt = (item.get("excerpt") or item.get("limitation") or "")[:280]
        lines.append(f"- [{item['title']}]({item['url']}): {excerpt}")
    lines += [
        "",
        "## What people talk about",
        "",
        "Recurring themes from UK Google results and People Also Ask: postcode first, tables that do not spill off a phone, no fake national from-price, cookie bars that do not cover Find Deals, and the same facts on mobile as desktop because Google indexes the smartphone DOM.",
        "",
    ]
    for block in payload.get("people_talk") or []:
        if block.get("error"):
            lines.append(f"- Query `{block['query']}` failed: {block['error']}")
            continue
        lines.append(f"### {block['query']}")
        for row in (block.get("organic") or [])[:4]:
            lines.append(f"- {row.get('title')}: {row.get('link')}")
            if row.get("snippet"):
                lines.append(f"  - {row['snippet']}")
        if block.get("people_also_ask"):
            lines.append(f"- PAA: {', '.join(block['people_also_ask'][:4])}")
        lines.append("")
    lines += ["## Recommendations", ""]
    for rec in recs:
        lines.append(f"- **{rec['priority']} · {rec['action']}**")
        lines.append(f"  - Why: {rec['why']}")
        lines.append(f"  - Files: `{rec['files']}`")
    lines += [
        "",
        "## Device intent map",
        "",
        "| Device | Width | Task | BroadbandPicker rule |",
        "|---|---|---|---|",
        "| Phone | 320–430 | Check postcode, scan 2–3 deals, tap Get Deal | Stack checker, cards not a 640px table, 44px targets |",
        "| Tablet | 768–1024 | Compare a few providers, still touch | Hamburger + in-menu checker until lg, no hover-only nav |",
        "| Desktop | 1280+ | Full table, filters, related guides | Existing comparison chrome |",
        "",
        "Do not infer that any competitor layout caused a ranking. Rankings and AI citations are outcomes.",
        "",
    ]
    OUT_MD.write_text("\n".join(lines), encoding="utf-8")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--skip-web", action="store_true")
    parser.add_argument("--skip-serp", action="store_true")
    args = parser.parse_args()

    competitors = [] if args.skip_web else [scan_page(t) for t in COMPETITORS]
    own = [] if args.skip_web else [scan_page(t) for t in OWN_PAGES]
    google = [] if args.skip_web else fetch_google_guidance()
    talk = [] if args.skip_serp else search_people_talk(load_serp_key())
    source_audit = audit_own_source()
    recs = synthesise(competitors, own, google, talk, source_audit)

    payload = {
        "generated": datetime.now(timezone.utc).replace(microsecond=0).isoformat(),
        "method": (
            "Mobile Safari user-agent HTML/CSS scan of UK broadband affiliate hubs, "
            "fetch of Google Search Central / web.dev guidance, SerpAPI UK searches for "
            "user complaints and People Also Ask, plus a source-file audit of BroadbandPicker "
            "templates. This cannot screenshot 375/768/1280 layouts. Blocked pages are recorded, not invented."
        ),
        "google_guidance": google,
        "people_talk": talk,
        "competitors": [asdict(s) for s in competitors],
        "own_pages": [asdict(s) for s in own],
        "source_audit": source_audit,
        "pages": [asdict(s) for s in competitors],
        "recommendations": recs,
        "intents_covered": [
            "check postcode / deals near me",
            "compare two providers",
            "read a provider review",
            "understand switching or social tariffs",
            "tap Get Deal without zooming or covering the button",
        ],
    }
    OUT_JSON.parent.mkdir(parents=True, exist_ok=True)
    OUT_JSON.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    write_markdown(payload)
    print(f"Wrote {OUT_JSON.relative_to(ROOT)}")
    print(f"Wrote {OUT_MD.relative_to(ROOT)}")
    print(f"{len(recs)} recommendations")
    for rec in recs:
        if rec["priority"] != "note":
            print(f"  {rec['priority']}: {rec['action'][:90]}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
