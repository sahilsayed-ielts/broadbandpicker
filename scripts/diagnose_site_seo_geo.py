#!/usr/bin/env python3
"""Sitewide technical SEO + GEO diagnosis for BroadbandPicker.

Called from scripts/plan_homepage_seo_geo.py (same entry point). Can also run
alone: python3 scripts/diagnose_site_seo_geo.py

Output:
    docs/site-technical-seo-geo-diagnosis.md
    docs/site-technical-seo-geo-diagnosis.json
"""

from __future__ import annotations

import json
import re
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
SITE = "https://broadbandpicker.co.uk"
OUT_MD = ROOT / "docs" / "site-technical-seo-geo-diagnosis.md"
OUT_JSON = ROOT / "docs" / "site-technical-seo-geo-diagnosis.json"
USER_AGENT = (
    "BroadbandPickerSiteDiagnosisBot/1.0 "
    "(SEO/GEO research; https://broadbandpicker.co.uk/contact)"
)

OWN_PAGE_PROBES = [
    ("Homepage", "/"),
    ("Deals", "/deals"),
    ("Compare", "/compare"),
    ("Providers hub", "/providers"),
    ("Provider (BT)", "/providers/bt"),
    ("Provider vs provider", "/providers/compare/ee-vs-talktalk"),
    ("Guide (switch)", "/guides/how-to-switch-broadband-uk"),
    ("Guide (cheapest)", "/guides/cheapest-broadband-uk"),
    ("Postcode (London)", "/postcode/london"),
    ("Postcode hub", "/postcode"),
    ("About", "/about"),
    ("How we make money", "/how-we-make-money"),
    ("How we review", "/how-we-review-broadband"),
    ("Editorial policy", "/editorial-policy"),
    ("Research (satisfaction)", "/research/uk-broadband-customer-satisfaction"),
    ("Glossary", "/broadband-glossary"),
    ("Speed test", "/speed-test"),
    ("Broadband Match", "/tools/broadband-match"),
    ("Cost calculator", "/tools/broadband-cost-calculator"),
]

TECH_PROBES = [
    "/robots.txt",
    "/sitemap.xml",
    "/ads.txt",
    "/llms.txt",
    "/llms-full.txt",
    "/rss.xml",
    "/feed.xml",
    "/manifest.webmanifest",
    "/logo.png",
]

AI_CRAWLERS_WANTED = [
    "Googlebot",
    "Google-Extended",
    "Google-CloudVertexBot",
    "OAI-SearchBot",
    "GPTBot",
    "ChatGPT-User",
    "ClaudeBot",
    "anthropic-ai",
    "PerplexityBot",
    "Perplexity-User",
    "Bingbot",
    "Applebot",
    "DuckDuckBot",
    "Amazonbot",
    "meta-externalagent",
]

SCHEMA_TYPE_RE = re.compile(r"['\"]@type['\"]\s*:\s*['\"]([A-Z][A-Za-z0-9]{2,60})['\"]")
LDJSON_RE = re.compile(r"application/ld\+json", re.I)
SANITIZE_RE = re.compile(r"\.replace\(/</g")


def unique(items: list[str]) -> list[str]:
    seen: set[str] = set()
    out: list[str] = []
    for item in items:
        key = item.strip()
        if key and key not in seen:
            seen.add(key)
            out.append(key)
    return out


def read_text(relative: str) -> str:
    path = ROOT / relative
    if not path.is_file():
        return ""
    try:
        return path.read_text(encoding="utf-8", errors="replace")
    except OSError:
        return ""


def http_get(url: str, timeout: int = 18, max_bytes: int = 700_000) -> dict[str, Any]:
    row: dict[str, Any] = {
        "url": url,
        "ok": False,
        "status": 0,
        "error": "",
        "bytes": 0,
        "schema_types": [],
        "ldjson_blocks": 0,
        "title": "",
        "canonical": "",
        "has_faq": False,
        "excerpt": "",
    }
    try:
        request = Request(
            url,
            headers={
                "User-Agent": USER_AGENT,
                "Accept": "text/html,application/xhtml+xml,text/plain;q=0.9,*/*;q=0.8",
                "Accept-Language": "en-GB,en;q=0.8",
            },
            method="GET",
        )
        with urlopen(request, timeout=timeout) as response:
            raw = response.read(max_bytes)
            row["status"] = getattr(response, "status", 200)
            row["bytes"] = len(raw)
            body = raw.decode("utf-8", errors="replace")
    except HTTPError as exc:
        row["status"] = exc.code
        row["error"] = f"HTTP {exc.code}"
        return row
    except (URLError, TimeoutError, OSError) as exc:
        row["error"] = str(exc)[:200]
        return row

    row["ok"] = True
    row["schema_types"] = unique(SCHEMA_TYPE_RE.findall(body))
    row["ldjson_blocks"] = len(LDJSON_RE.findall(body))
    row["has_faq"] = "faq" in body.lower() or "frequently asked" in body.lower()
    title = re.search(r"<title[^>]*>([\s\S]*?)</title>", body, flags=re.I)
    row["title"] = re.sub(r"\s+", " ", title.group(1)).strip()[:180] if title else ""
    canon = re.search(
        r'<link[^>]+rel=["\']canonical["\'][^>]+href=["\']([^"\']+)["\']',
        body,
        flags=re.I,
    )
    if not canon:
        canon = re.search(
            r'<link[^>]+href=["\']([^"\']+)["\'][^>]+rel=["\']canonical["\']',
            body,
            flags=re.I,
        )
    row["canonical"] = canon.group(1) if canon else ""
    row["loc_count"] = body.count("<loc>")
    row["excerpt"] = re.sub(r"\s+", " ", body)[:400]
    return row


def scan_workspace_schema() -> dict[str, Any]:
    files: list[Path] = []
    for folder in (ROOT / "app", ROOT / "components", ROOT / "lib"):
        if folder.is_dir():
            files.extend(folder.rglob("*.tsx"))
            files.extend(folder.rglob("*.ts"))
    by_file: dict[str, list[str]] = {}
    unsanitized: list[str] = []
    all_types: list[str] = []
    for path in files:
        rel = str(path.relative_to(ROOT))
        try:
            text = path.read_text(encoding="utf-8", errors="replace")
        except OSError:
            continue
        types = unique(SCHEMA_TYPE_RE.findall(text))
        if types:
            by_file[rel] = types
            all_types.extend(types)
        if "application/ld+json" in text and not SANITIZE_RE.search(text):
            unsanitized.append(rel)
    return {
        "by_file": by_file,
        "all_types": unique(all_types),
        "unsanitized_jsonld_files": unsanitized,
        "file_count": len(by_file),
    }


def workspace_signals() -> dict[str, Any]:
    layout = read_text("app/layout.tsx")
    robots = read_text("app/robots.ts")
    sitemap = read_text("app/sitemap.ts")
    about = read_text("app/about/page.tsx")
    homepage = read_text("app/page.tsx")
    deal_schema = read_text("lib/dealSchema.ts")
    breadcrumb = read_text("components/BreadcrumbNav.tsx")
    guides = read_text("data/guides.ts")
    providers = read_text("data/providers.ts")
    return {
        "layout_sets_homepage_canonical": "canonical: 'https://broadbandpicker.co.uk'" in layout
        and "alternates:" in layout,
        "layout_has_hreflang_homepage": "'en-GB': 'https://broadbandpicker.co.uk'" in layout,
        "layout_has_organization_jsonld": "siteOrganizationGraph" in layout
        or ("Organization" in layout and "ld+json" in layout),
        "layout_has_twitter": "twitter:" in layout or "summary_large_image" in layout,
        "layout_has_og_image": bool(re.search(r"openGraph:[\s\S]{0,500}images", layout)),
        "homepage_has_website_jsonld": "'WebSite'" in homepage or '"WebSite"' in homepage,
        "homepage_has_organization_jsonld": "organizationJsonLd" in homepage or "'Organization'" in homepage,
        "about_has_jsonld": "ld+json" in about,
        "about_em_dashes": about.count("\u2014") + about.count("—"),
        "has_person_schema": "'Person'" in homepage or "'Person'" in about,
        "has_indexnow": "indexnow"
        in (
            layout
            + robots
            + sitemap
            + deal_schema
            + read_text("package.json")
            + read_text("lib/indexNow.ts")
        ).lower()
        or any("indexnow" in path.name.lower() for path in (ROOT / "public").glob("*")),
        "has_llms_txt": (ROOT / "public" / "llms.txt").is_file(),
        "has_ads_txt": (ROOT / "public" / "ads.txt").is_file(),
        "has_llms_full": (ROOT / "public" / "llms-full.txt").is_file(),
        "has_rss_feed": (ROOT / "app" / "feed.xml" / "route.ts").is_file(),
        "has_article_helper": "function articleJsonLd" in read_text("lib/siteSchema.ts"),
        "has_software_application": "SoftwareApplication" in read_text("lib/siteSchema.ts"),
        "has_switch_howto": "HowTo" in read_text("app/guides/[slug]/page.tsx"),
        "has_postcode_place": "AdministrativeArea" in read_text("app/postcode/[area]/page.tsx"),
        "has_about_page_schema": "AboutPage" in about,
        "has_offer_catalog": "OfferCatalog" in deal_schema
        or "buildOfferCatalogJsonLd" in deal_schema,
        "has_logo_png": (ROOT / "public" / "logo.png").is_file(),
        "robots_has_oai_searchbot": "OAI-SearchBot" in robots,
        "robots_has_chatgpt_user": "ChatGPT-User" in robots,
        "robots_has_bingbot": "Bingbot" in robots,
        "robots_has_applebot": "Applebot" in robots,
        "sitemap_uses_now": "lastModified: now" in sitemap,
        "product_offer_has_price_valid_until": "priceValidUntil" in deal_schema,
        "product_offer_has_shipping": "shippingDetails" in deal_schema,
        "breadcrumb_sanitizes": bool(SANITIZE_RE.search(breadcrumb)),
        "guide_count": len(re.findall(r"^\s+slug:\s+'", guides, flags=re.M)),
        "provider_count": len(re.findall(r"^\s+name:\s+'", providers, flags=re.M)),
        "ai_crawlers_in_robots": [bot for bot in AI_CRAWLERS_WANTED if bot in robots],
    }


def recommended_schema_by_template() -> list[dict[str, Any]]:
    return [
        {
            "template": "Root layout (every URL)",
            "file": "app/layout.tsx",
            "now": "No JSON-LD. MetadataBase, default title, robots, homepage canonical + hreflang.",
            "ship": "WebSite + Organization as an @graph with stable @id values. Remove homepage-only canonical and hreflang from the layout.",
            "types": ["WebSite", "Organization", "SearchAction"],
        },
        {
            "template": "Homepage /",
            "file": "app/page.tsx",
            "now": "WebSite, Organization, WebPage, FAQPage, HowTo. No ItemList on the featured table.",
            "ship": "Keep FAQPage + HowTo + WebPage. Point publisher at layout @id. Add ItemList for the five featured deals. Keep the 40-70 word citeable answer in HTML.",
            "types": ["WebPage", "FAQPage", "HowTo", "ItemList"],
        },
        {
            "template": "Deals /deals",
            "file": "app/deals/page.tsx + lib/dealSchema.ts",
            "now": "CollectionPage + ItemList of Product/Offer. No priceValidUntil, no shippingDetails.",
            "ship": "Keep CollectionPage + ItemList. Add priceValidUntil from the dataset date. Do not invent shipping or return policy. If GSC reports Merchant listing errors, drop Product and keep Offer inside ListItem.",
            "types": ["CollectionPage", "ItemList", "Offer", "OfferCatalog"],
        },
        {
            "template": "Compare /compare",
            "file": "app/compare/page.tsx",
            "now": "CollectionPage, ItemList, FAQPage, BreadcrumbList.",
            "ship": "Keep. Link ItemList entries to /providers/[slug]. Add dateModified already present.",
            "types": ["CollectionPage", "ItemList", "FAQPage", "BreadcrumbList"],
        },
        {
            "template": "Provider /providers/[slug]",
            "file": "app/providers/[slug]/page.tsx",
            "now": "Article, FAQPage, Product/Offer, BreadcrumbList. Article has no image, no publisher.logo, no inLanguage.",
            "ship": "Article + FAQPage + Service (the ISP) + Offer. Add image, publisher.logo, inLanguage en-GB, isAccessibleForFree, citation[], about. Service.areaServed = GB.",
            "types": ["Article", "FAQPage", "Service", "Offer", "Brand"],
        },
        {
            "template": "Head-to-head /providers/compare/[slug]",
            "file": "app/providers/compare/[slug]/page.tsx",
            "now": "Article + FAQPage.",
            "ship": "Article + FAQPage + ItemList for the comparison table. Optional HowTo for choosing between the two.",
            "types": ["Article", "FAQPage", "ItemList"],
        },
        {
            "template": "Guide /guides/[slug]",
            "file": "app/guides/[slug]/page.tsx",
            "now": "Article + FAQPage. Missing image (required for Article rich results), citation, about, wordCount.",
            "ship": "Article with image, publisher.logo, wordCount, articleSection, about, citation. FAQPage only when FAQs are on the page. HowTo on how-to-switch-broadband-uk.",
            "types": ["Article", "FAQPage", "HowTo", "BreadcrumbList"],
        },
        {
            "template": "Postcode /postcode/[area]",
            "file": "app/postcode/[area]/page.tsx",
            "now": "WebPage, FAQPage, ItemList of deals, BreadcrumbList.",
            "ship": "WebPage + FAQPage + ItemList + Place or AdministrativeArea (containedInPlace UK). Optional Dataset for Ofcom-derived coverage percentages with variableMeasured.",
            "types": ["WebPage", "FAQPage", "ItemList", "Place", "Dataset"],
        },
        {
            "template": "Tools (speed test, match, calculator)",
            "file": "app/speed-test/page.tsx, app/tools/*",
            "now": "WebApplication + WebPage + FAQPage.",
            "ship": "SoftwareApplication (or keep WebApplication) with applicationCategory BrowserApplication, operatingSystem Any, offers price 0 GBP, isAccessibleForFree. FAQPage stays.",
            "types": ["SoftwareApplication", "WebPage", "FAQPage"],
        },
        {
            "template": "Glossary",
            "file": "app/broadband-glossary/page.tsx",
            "now": "DefinedTermSet + DefinedTerm.",
            "ship": "Keep. This is the right type. Add inLanguage and isPartOf the WebSite @id.",
            "types": ["DefinedTermSet", "DefinedTerm"],
        },
        {
            "template": "Research",
            "file": "components/PrioritySeoPage.tsx + data/priority-pages.ts",
            "now": "Article or Dataset + FAQPage via @graph. Quick-answer HTML already exists.",
            "ship": "Dataset with variableMeasured, temporalCoverage, creator, license, citation on the satisfaction dashboard. Article on rankings. Keep the quick-answer block; that is the GEO pattern to copy onto other templates.",
            "types": ["Dataset", "Article", "FAQPage"],
        },
        {
            "template": "About / money / methodology / editorial",
            "file": "app/about/page.tsx and trust pages",
            "now": "About has BreadcrumbList only. Trust pages have thin WebPage + Organization name, not the site @id.",
            "ship": "AboutPage on /about. WebPage on the others, about the Organization @id. publishingPrinciples / ethicsPolicy / ownershipFundingInfo already have URLs: point Organization at them.",
            "types": ["AboutPage", "WebPage", "Organization"],
        },
        {
            "template": "Contact",
            "file": "app/contact/page.tsx",
            "now": "BreadcrumbList only.",
            "ship": "ContactPage + Organization.contactPoint (email, contactType customer support, areaServed GB, availableLanguage English).",
            "types": ["ContactPage", "ContactPoint"],
        },
    ]


def technical_actions(
    signals: dict[str, Any],
    live: dict[str, Any],
    schema_scan: dict[str, Any] | None = None,
) -> list[dict[str, Any]]:
    schema_scan = schema_scan or {}
    unsanitized = schema_scan.get("unsanitized_jsonld_files") or []
    has_jsonld_helper = (ROOT / "lib" / "jsonLd.ts").is_file() or (ROOT / "lib" / "jsonLd.tsx").is_file()
    robots_live = (live.get("tech") or {}).get("/robots.txt") or {}
    robots_body = robots_live.get("excerpt") or ""
    llms = (live.get("tech") or {}).get("/llms.txt") or {}
    sitemap_live = (live.get("tech") or {}).get("/sitemap.xml") or {}

    def status(missing: bool, partial: bool = False) -> str:
        if missing:
            return "missing"
        if partial:
            return "partial"
        return "done"

    actions = [
        {
            "id": "T01",
            "priority": "P0",
            "category": "Crawl",
            "action": "Stop the root layout from claiming the homepage canonical and en-GB hreflang.",
            "why": "Child routes that do not set alternates can inherit a homepage canonical. That collapses rankings into `/`. Layout should only set metadataBase. Each page sets its own canonical.",
            "where": "app/layout.tsx",
            "status": status(signals["layout_sets_homepage_canonical"]),
        },
        {
            "id": "T02",
            "priority": "P0",
            "category": "Schema",
            "action": "Move WebSite + Organization JSON-LD into the root layout as a single @graph with stable @id values.",
            "why": "Today the organisation entity only exists on `/`. Google, GPTBot and PerplexityBot need the same @id on every URL they quote. Include logo, sameAs, areaServed GB, publishingPrinciples, ethicsPolicy, ownershipFundingInfo, contactPoint.",
            "where": "app/layout.tsx. Pages keep page-specific types and point publisher to https://broadbandpicker.co.uk/#organisation",
            "status": (
                "done"
                if signals["layout_has_organization_jsonld"]
                else ("partial" if signals["homepage_has_organization_jsonld"] else "missing")
            ),
        },
        {
            "id": "T03",
            "priority": "P0",
            "category": "Schema",
            "action": "Add a shared jsonLdScript() helper that stringifies and replaces < with \\u003c.",
            "why": "Next.js JSON-LD guidance. Several templates (deals, providers, postcode, BreadcrumbNav, trust pages) skip the sanitiser. One helper stops XSS and keeps markup consistent.",
            "where": "lib/jsonLd.ts then BreadcrumbNav, dealSchema callers, provider/postcode/trust pages",
            "status": "done" if has_jsonld_helper and not unsanitized else "partial",
        },
        {
            "id": "T04",
            "priority": "P0",
            "category": "GEO / LLM",
            "action": "Publish /llms.txt and /llms-full.txt.",
            "why": "LLM crawlers look for a machine-readable map of the publisher: who you are, that you are independent, key URLs (/, /deals, /compare, methodology, money, editorial), and a one-paragraph citeable description. Missing this is a free citation loss.",
            "where": "public/llms.txt and public/llms-full.txt (or app/llms.txt/route.ts). Link them from /about and robots.txt.",
            "status": status(not signals["has_llms_txt"] and llms.get("status") != 200),
        },
        {
            "id": "T05",
            "priority": "P0",
            "category": "GEO",
            "action": "Put a 40-70 word HTML answer under H2 on every money template, not only homepage and PrioritySeoPage.",
            "why": "GSC AI-overview extract shows guides and some postcodes earning impressions; `/` has 15. Models quote visible HTML, not JSON-LD. Copy the PrioritySeoPage 'quick answer' pattern onto provider, guide, deals and postcode templates.",
            "where": "app/providers/[slug]/page.tsx, app/guides/[slug]/page.tsx, app/deals/page.tsx, app/postcode/[area]/page.tsx",
            "status": status(not (ROOT / "components" / "CiteableAnswer.tsx").is_file()),
        },
        {
            "id": "T06",
            "priority": "P0",
            "category": "Schema",
            "action": "Complete Article JSON-LD so Google Article rich results can fire.",
            "why": "Guides and provider reviews are Article without image or publisher.logo. Google's Article rich result requires headline, image, datePublished, dateModified, author, publisher.logo. That is also what Gemini and ChatGPT retrieve as 'a review'.",
            "where": "app/guides/[slug]/page.tsx, app/providers/[slug]/page.tsx, app/providers/compare/[slug]/page.tsx. Use /logo.png (already 1024px).",
            "status": status(not signals.get("has_article_helper")),
        },
        {
            "id": "T07",
            "priority": "P0",
            "category": "Schema",
            "action": "Harden Offer JSON-LD: priceValidUntil, priceCurrency GBP, availability. Do not add fake AggregateRating.",
            "why": "Product/Offer without priceValidUntil fails parts of the Rich Results Test. shippingDetails and return policy are for physical merchants; do not invent them. If GSC then flags Merchant listings, demote Product to Offer inside ItemList.",
            "where": "lib/dealSchema.ts",
            "status": status(not signals["product_offer_has_price_valid_until"]),
        },
        {
            "id": "T08",
            "priority": "P0",
            "category": "Crawl",
            "action": "Split the sitemap and stop stamping lastModified: now on every URL.",
            "why": "A single sitemap that marks every postcode and static page as modified today burns crawl budget and trains Google that dates are meaningless. Use real dataset/guide dates. Split sitemap-core.xml and sitemap-postcodes.xml under a sitemap index.",
            "where": "app/sitemap.ts (or app/sitemap-core.xml/route.ts + app/sitemap-postcodes.xml/route.ts)",
            "status": status(signals["sitemap_uses_now"]),
        },
        {
            "id": "T09",
            "priority": "P0",
            "category": "E-E-A-T",
            "action": "Add AboutPage JSON-LD, named byline, and Organization policy URLs.",
            "why": "AI Overviews prefer sources with a clear publisher, a methodology page, and a money page. /about currently has no JSON-LD. Organization should declare publishingPrinciples=/editorial-policy, ethicsPolicy=/how-we-review-broadband, ownershipFundingInfo=/how-we-make-money.",
            "where": "app/about/page.tsx, layout Organization graph",
            "status": status(not signals.get("has_about_page_schema")),
        },
        {
            "id": "T10",
            "priority": "P1",
            "category": "GEO / LLM",
            "action": "Allow the remaining retrieval crawlers in robots.ts.",
            "why": "OAI-SearchBot, GPTBot, ClaudeBot, PerplexityBot and Google-Extended are already allowed. Add ChatGPT-User, Bingbot, Applebot, DuckDuckBot, Google-CloudVertexBot, Perplexity-User, Amazonbot, meta-externalagent. Do not block Google-Extended.",
            "where": "app/robots.ts",
            "status": status(
                any(
                    bot not in (signals.get("ai_crawlers_in_robots") or [])
                    for bot in ["ChatGPT-User", "Bingbot", "Applebot", "DuckDuckBot"]
                )
            ),
        },
        {
            "id": "T11",
            "priority": "P1",
            "category": "GEO",
            "action": "Implement IndexNow on deal and provider updates.",
            "why": "Bing, DuckDuckGo and some LLM indexes honour IndexNow. Ping when providerDatasetUpdatedDate changes. Cheap compared with waiting on sitemap recrawl.",
            "where": "app/api/indexnow/route.ts + a hook in scripts that sync deals",
            "status": status(not signals["has_indexnow"]),
        },
        {
            "id": "T12",
            "priority": "P1",
            "category": "Schema",
            "action": "Add HowTo JSON-LD to the switch guide (the query is how-to, the homepage HowTo is only a teaser).",
            "why": "how to switch broadband is a primary GEO query. The dedicated guide should carry HowTo steps that match the visible HTML, plus FAQPage.",
            "where": "app/guides/[slug]/page.tsx when slug is how-to-switch-broadband-uk",
            "status": status(not signals.get("has_switch_howto")),
        },
        {
            "id": "T13",
            "priority": "P1",
            "category": "Schema",
            "action": "Add Place / AdministrativeArea on postcode pages, plus Dataset on coverage stats.",
            "why": "broadband in [town] and AI answers about coverage need a geo entity, not only a WebPage title. Ofcom-derived percentages belong in Dataset (variableMeasured, citation Ofcom) so models can quote a number with a date.",
            "where": "app/postcode/[area]/page.tsx",
            "status": status(not signals.get("has_postcode_place")),
        },
        {
            "id": "T14",
            "priority": "P1",
            "category": "Schema",
            "action": "Upgrade tools from WebApplication-only to SoftwareApplication with price 0.",
            "why": "Speed test, Broadband Match and the cost calculator are free software. SoftwareApplication with isAccessibleForFree and offers.price 0 is the type Google and LLMs expect for a tool.",
            "where": "app/speed-test/page.tsx, app/tools/broadband-match/page.tsx, app/tools/broadband-cost-calculator/page.tsx",
            "status": status(not signals.get("has_software_application")),
        },
        {
            "id": "T15",
            "priority": "P1",
            "category": "Schema",
            "action": "Add ContactPage + ContactPoint. Expand sameAs when LinkedIn and YouTube exist.",
            "why": "Organization.sameAs is currently X and Instagram. Knowledge panels and LLM publisher resolution use sameAs. Do not add empty profiles.",
            "where": "layout Organization graph, app/contact/page.tsx",
            "status": status("ContactPage" not in read_text("app/contact/page.tsx")),
        },
        {
            "id": "T16",
            "priority": "P1",
            "category": "Metadata",
            "action": "Set a default Open Graph image and twitter:card summary_large_image in the layout.",
            "why": "Most templates have no twitter card and no og:image. ChatGPT, Slack, LinkedIn and iMessage unfurl empty. Use /logo.png or a 1200x630 branded comparison card.",
            "where": "app/layout.tsx metadata.openGraph.images + metadata.twitter",
            "status": status(not signals["layout_has_twitter"]),
        },
        {
            "id": "T17",
            "priority": "P1",
            "category": "GEO",
            "action": "Ship an RSS or Atom feed of guides and research, listed in llms.txt.",
            "why": "Perplexity and some research crawlers still discover publishers via feeds. A /guides.xml of title, url, dateModified, first paragraph is enough.",
            "where": "app/guides.xml/route.ts or app/feed.xml/route.ts",
            "status": status(not signals.get("has_rss_feed")),
        },
        {
            "id": "T18",
            "priority": "P1",
            "category": "E-E-A-T",
            "action": "Add a Person author only when a named editor exists. Until then keep Organization author with url /about.",
            "why": "Fake Person schema is worse than an organisation byline. When a named reviewer ships, give them /about#[slug], jobTitle, sameAs, and a visible byline that matches the JSON-LD.",
            "where": "app/about/page.tsx, then Article.author",
            "status": "partial" if not signals["has_person_schema"] else "done",
        },
        {
            "id": "T19",
            "priority": "P1",
            "category": "Content / GEO",
            "action": "Visible sources block on every provider and postcode page, matching the guide template.",
            "why": "Guides already list sources. Providers have citation in JSON-LD only on some pages. Models prefer a heading called Sources with Ofcom / provider / methodology links they can keep in the footnote.",
            "where": "app/providers/[slug]/page.tsx, app/postcode/[area]/page.tsx",
            "status": status(not (ROOT / "components" / "SourcesList.tsx").is_file()),
        },
        {
            "id": "T20",
            "priority": "P2",
            "category": "Schema",
            "action": "OfferCatalog on /deals and Service.areaServed GB on provider pages.",
            "why": "Tells Google this is a UK comparison catalogue, not a random product grid. Low effort once the layout Organization @id exists.",
            "where": "app/deals/page.tsx, app/providers/[slug]/page.tsx",
            "status": status(not signals.get("has_offer_catalog")),
        },
        {
            "id": "T21",
            "priority": "P2",
            "category": "Performance",
            "action": "Audit LCP on `/` and postcode pages (hero SVG, sticky header, fonts).",
            "why": "Core Web Vitals remain a ranking factor. A sticky header plus a large hero SVG can delay LCP on mobile. Preload the hero, keep the trust strip out of the sticky header (already planned).",
            "where": "app/page.tsx, app/layout.tsx, next.config.ts headers",
            "status": status("preload" not in read_text("app/page.tsx")),
        },
        {
            "id": "T22",
            "priority": "P2",
            "category": "Crawl",
            "action": "Add security and cache headers in next.config. Do not noindex editorial pages.",
            "why": "Referrer-Policy, X-Content-Type-Options, and long-cache for /logos and /illustrations. Keep max-snippet -1 so AI Overviews can quote.",
            "where": "next.config.ts headers()",
            "status": status("Referrer-Policy" not in read_text("next.config.ts")),
        },
        {
            "id": "T23",
            "priority": "P2",
            "category": "Measurement",
            "action": "Track Rich Results and AI Overview pages in the weekly SEO job.",
            "why": "You already export GSC Search Generative AI Features and ai_referral_visit. Add Enhancement reports (FAQ, Article, Product, Breadcrumb) so schema that fails is visible the week it ships.",
            "where": "scripts/generate_weekly_seo_intelligence.py, GA4",
            "status": status("searchAppearance" not in read_text("scripts/generate_weekly_seo_intelligence.py")),
        },
        {
            "id": "T24",
            "priority": "P2",
            "category": "Schema",
            "action": "Do not add Review, AggregateRating, SpeakableSpecification, or QAPage.",
            "why": "No first-party review corpus with ratingCount. Speakable is Google News only. QAPage is for threaded Q&A. Fake ratings are a manual-action risk and would poison LLM trust.",
            "where": "lib/dealSchema.ts (keep the current omit), all templates",
            "status": "done",
        },
    ]

    # Annotate live sitemap / robots if fetched.
    if sitemap_live.get("status"):
        actions[7]["note"] = (
            f"Live sitemap HTTP {sitemap_live.get('status')}, "
            f"sampled loc count {sitemap_live.get('loc_count', 0)}."
        )
    if robots_body:
        actions[9]["note"] = "Live robots.txt fetched."
    return actions


def markdown_diagnosis(
    signals: dict[str, Any],
    schema_scan: dict[str, Any],
    live: dict[str, Any],
    actions: list[dict[str, Any]],
    templates: list[dict[str, Any]],
    competitor_schema: list[str],
) -> str:
    today = datetime.now(timezone.utc).date().isoformat()
    p0 = [a for a in actions if a["priority"] == "P0"]
    p1 = [a for a in actions if a["priority"] == "P1"]
    p2 = [a for a in actions if a["priority"] == "P2"]

    def rows(items: list[dict[str, Any]]) -> str:
        lines = [
            "| ID | Status | Action | Why | Where |",
            "|---|---|---|---|---|",
        ]
        for item in items:
            lines.append(
                "| "
                + item["id"]
                + " | "
                + item["status"]
                + " | "
                + item["action"]
                + " | "
                + item["why"]
                + " | `"
                + item["where"].replace("|", "/")
                + "` |"
            )
        return "\n".join(lines)

    live_pages = live.get("pages") or []
    live_rows = [
        "| Page | HTTP | Canonical | JSON-LD blocks | Schema types |",
        "|---|---|---|---|---|",
    ]
    for row in live_pages:
        types = ", ".join(row.get("schema_types") or []) or "none"
        live_rows.append(
            f"| {row.get('name')} | {row.get('status') or row.get('error') or 'n/a'} | "
            f"{row.get('canonical') or 'n/a'} | {row.get('ldjson_blocks', 0)} | {types} |"
        )

    tech = live.get("tech") or {}
    tech_lines = []
    for path, row in tech.items():
        tech_lines.append(
            f"- `{path}` HTTP {row.get('status') or row.get('error') or 'n/a'}"
            + (f", <loc> sample {row.get('loc_count')}" if path.endswith("sitemap.xml") else "")
        )

    file_lines = []
    for rel, types in sorted((schema_scan.get("by_file") or {}).items()):
        file_lines.append(f"- `{rel}`: {', '.join(types)}")

    template_blocks = []
    for item in templates:
        template_blocks.append(
            "### "
            + item["template"]
            + "\n\n- **File:** `"
            + item["file"]
            + "`\n- **Now:** "
            + item["now"]
            + "\n- **Ship:** "
            + item["ship"]
            + "\n- **Types:** "
            + ", ".join("`" + t + "`" for t in item["types"])
            + "\n"
        )

    unsanitized = schema_scan.get("unsanitized_jsonld_files") or []
    missing_p0 = sum(1 for a in p0 if a["status"] == "missing")
    crawlers = ", ".join(signals.get("ai_crawlers_in_robots") or []) or "none listed"

    return f"""# Site technical SEO + GEO diagnosis

Generated {today}.
Site: {SITE}
Produced by `scripts/plan_homepage_seo_geo.py` (site-diagnosis pass).

## What this is for

Technical work that makes BroadbandPicker easier for Google, AI Overviews and
LLMs to crawl, trust and quote. Schema is eligibility, not a ranking cheat.
Position 1 still needs the best answer, internal links, and crawl efficiency.
This list is the engineering backlog that sits under that content.

Honest constraint: nobody ships "rank 1 for broadband" with JSON-LD alone.
Uswitch and the comparison majors win head terms with brand + links. The
winnable jobs are: get cited in Overviews for questions we already answer,
get retrieved by ChatGPT/Perplexity/Gemini when someone asks for a UK
comparison, and take page-one (then position 1) on mid-tail queries the
majors leave thin (switch, social tariffs, postcode, provider vs provider).

## Snapshot

- Guides in dataset: {signals.get("guide_count")}
- Providers in dataset: {signals.get("provider_count")}
- Schema types declared in source: {", ".join(schema_scan.get("all_types") or []) or "none"}
- JSON-LD files missing `<` sanitise: {len(unsanitized)}
- Organization JSON-LD in layout: {signals.get("layout_has_organization_jsonld")}
- `/llms.txt` in repo: {signals.get("has_llms_txt")}
- IndexNow: {signals.get("has_indexnow")}
- AI crawlers named in robots.ts: {crawlers}
- P0 items still missing: {missing_p0} / {len(p0)}

## Live page probe

{chr(10).join(live_rows) if live_pages else "Skipped (`--skip-web`) or no successful fetches."}

### Technical URLs

{chr(10).join(tech_lines) if tech_lines else "Skipped."}

### Competitor schema types seen this run

{(", ".join(competitor_schema) if competitor_schema else "None extracted (JS shells or skipped).")}

UK comparison homepages are still thin on FAQPage and Organisation copy.
That is the gap: sitewide publisher entity + citeable HTML + honest Offer data.

## Schema by template

{chr(10).join(template_blocks)}

## JSON-LD currently in source

{chr(10).join(file_lines) if file_lines else "No @type matches."}

Unsanitised JSON-LD files (no `.replace(/</g, '\\\\u003c')`):

{chr(10).join(f"- `{p}`" for p in unsanitized) if unsanitized else "- none"}

## P0. Do these first

These unlock crawl integrity, a sitewide publisher entity, and Overview/LLM
quotation. Do them before adding exotic types.

{rows(p0)}

## P1. Schema and GEO that compound

{rows(p1)}

## P2. Hygiene and measurement

{rows(p2)}

## Recommended sitewide Organization graph

Put this in `app/layout.tsx` once, sanitised. Other pages reference the @id
instead of repeating a thinner Organization.

```json
{{
  "@context": "https://schema.org",
  "@graph": [
    {{
      "@type": "Organization",
      "@id": "https://broadbandpicker.co.uk/#organisation",
      "name": "BroadbandPicker",
      "url": "https://broadbandpicker.co.uk/",
      "logo": {{
        "@type": "ImageObject",
        "url": "https://broadbandpicker.co.uk/logo.png",
        "width": 1024,
        "height": 1024
      }},
      "description": "Independent UK broadband comparison. Rankings are not sold.",
      "areaServed": {{ "@type": "Country", "name": "United Kingdom" }},
      "sameAs": [
        "https://x.com/broadbandPicker",
        "https://www.instagram.com/broadbandpicker/"
      ],
      "publishingPrinciples": "https://broadbandpicker.co.uk/editorial-policy",
      "ethicsPolicy": "https://broadbandpicker.co.uk/how-we-review-broadband",
      "ownershipFundingInfo": "https://broadbandpicker.co.uk/how-we-make-money",
      "contactPoint": {{
        "@type": "ContactPoint",
        "contactType": "customer support",
        "url": "https://broadbandpicker.co.uk/contact",
        "email": "hello@broadbandpicker.co.uk",
        "areaServed": "GB",
        "availableLanguage": "English"
      }}
    }},
    {{
      "@type": "WebSite",
      "@id": "https://broadbandpicker.co.uk/#website",
      "url": "https://broadbandpicker.co.uk/",
      "name": "BroadbandPicker",
      "inLanguage": "en-GB",
      "publisher": {{ "@id": "https://broadbandpicker.co.uk/#organisation" }},
      "potentialAction": {{
        "@type": "SearchAction",
        "target": "https://broadbandpicker.co.uk/postcode/{{search_term_string}}",
        "query-input": "required name=search_term_string"
      }}
    }}
  ]
}}
```

Confirm the support email against `/contact` before shipping. Do not invent
a phone number or a postal address.

## llms.txt (ship next)

```
# BroadbandPicker
> Independent UK broadband comparison. You enter a postcode, we show the
> deals that can serve that address. Rankings are not sold.

Use these pages when citing BroadbandPicker:

- [Compare broadband](https://broadbandpicker.co.uk/): postcode checker and how comparison works
- [Deals](https://broadbandpicker.co.uk/deals): current UK broadband deals snapshot
- [How we review](https://broadbandpicker.co.uk/how-we-review-broadband): methodology
- [How we make money](https://broadbandpicker.co.uk/how-we-make-money): affiliate disclosure
- [Editorial policy](https://broadbandpicker.co.uk/editorial-policy)
- [Guides](https://broadbandpicker.co.uk/guides)
```

## Do not implement

- AggregateRating or Review without a real ratingCount.
- SpeakableSpecification (Google News sites only).
- FAQ rich-result chasing as a CTR tactic. Google limited FAQ rich results;
  keep FAQPage because models still read it.
- nosnippet / max-snippet:0 on editorial pages. That blocks Overviews.
- Blocking Google-Extended, GPTBot or OAI-SearchBot.
- Product shippingDetails / MerchantReturnPolicy fiction for broadband.
- Keyword-stuffed hidden text, prompt-injection in HTML comments, or
  cloaking a different answer for GPTBot than for Chrome.

## How this maps to the goal

1. **AI Overviews:** citeable 40-70 word HTML, FAQ answers with dates, Ofcom
   citations, Organization policies, Article with image. Overview quotes
   pages that answer first and show a source.
2. **LLM traffic:** llms.txt, robots allow retrieval bots, IndexNow for Bing
   class indexes, RSS, sameAs, about page, ai_referral_visit already tracking
   ChatGPT/Perplexity/Claude/Gemini.
3. **Google page 1 / position 1:** fix canonical inheritance, sitemap crawl
   budget, unique intent per URL (already a content rule), then earn links.
   Schema makes the result look complete. It does not outrank a stronger
   brand on `broadband` by itself.

## Success checks

- Rich Results Test: Article (guides, providers), Breadcrumb, Organization,
  Product/Offer or a clean ItemList with no GSC Merchant errors.
- `llms.txt` and `robots.txt` 200.
- GSC: no canonical-to-homepage cluster. AI-overview impressions on `/` and
  methodology URLs rise from the current extract (homepage 15).
- GA4 `ai_referral_visit` by landing page, not only homepage.
- Manual: ask ChatGPT, Gemini and Perplexity "compare UK broadband deals for
  a London postcode" and "is BroadbandPicker independent" after the
  Organization graph and llms.txt have been live for a crawl cycle.
"""


def load_previous_competitor_fetches() -> list[dict[str, Any]]:
    path = ROOT / "docs" / "home page UX" / "homepage-seo-geo-plan.json"
    if not path.is_file():
        return []
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError, TypeError):
        return []
    rows = data.get("competitor_fetches") or []
    return rows if isinstance(rows, list) else []


def run_site_diagnosis(
    *,
    skip_web: bool = False,
    competitor_fetches: list[dict[str, Any]] | None = None,
) -> dict[str, Any]:
    schema_scan = scan_workspace_schema()
    signals = workspace_signals()
    live: dict[str, Any] = {"pages": [], "tech": {}}
    if competitor_fetches is None:
        competitor_fetches = load_previous_competitor_fetches()

    if not skip_web:
        pages = []
        for name, path in OWN_PAGE_PROBES:
            row = http_get(SITE + path)
            row["name"] = name
            row["path"] = path
            pages.append(row)
        live["pages"] = pages
        tech = {}
        for path in TECH_PROBES:
            tech[path] = http_get(SITE + path, timeout=22, max_bytes=400_000)
        live["tech"] = tech

    competitor_schema = unique(
        [
            t
            for row in (competitor_fetches or [])
            for t in row.get("schema_types") or []
            if re.match(r"^[A-Z][A-Za-z0-9]{2,60}$", str(t))
        ]
    )
    templates = recommended_schema_by_template()
    actions = technical_actions(signals, live, schema_scan)
    payload = {
        "generated_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "site": SITE,
        "signals": signals,
        "schema_scan": schema_scan,
        "live": live,
        "competitor_schema_types": competitor_schema,
        "templates": templates,
        "actions": actions,
        "p0_missing": [a["id"] for a in actions if a["priority"] == "P0" and a["status"] == "missing"],
        "disclaimer": (
            "Schema and crawl work make citation and rich results possible. "
            "They do not by themselves rank position 1 for head terms."
        ),
    }
    OUT_MD.parent.mkdir(parents=True, exist_ok=True)
    OUT_JSON.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    OUT_MD.write_text(
        markdown_diagnosis(signals, schema_scan, live, actions, templates, competitor_schema),
        encoding="utf-8",
    )
    return payload


def main() -> int:
    import argparse

    parser = argparse.ArgumentParser(description="Diagnose BroadbandPicker technical SEO and GEO.")
    parser.add_argument("--skip-web", action="store_true")
    args = parser.parse_args()
    payload = run_site_diagnosis(skip_web=args.skip_web)
    print(f"Schema files: {payload['schema_scan']['file_count']}")
    print(f"P0 missing: {', '.join(payload['p0_missing']) or 'none'}")
    print(f"Wrote {OUT_MD.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
