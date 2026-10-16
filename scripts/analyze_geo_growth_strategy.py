#!/usr/bin/env python3
"""Turn live Search Console growth into a GEO / LLM content strategy.

Where the other SEO scripts each cover one slice --
generate_weekly_seo_intelligence.py scores existing pages,
analyze_serp_geo_opportunities.py runs a fixed seed-query list,
analyze_page_type_ux.py audits page-type UX -- this script starts from the
question "which topics / query clusters are gaining impressions right now,
which of those trigger a UK AI Overview we are not cited in, and what new
pages should we build (aligned to broadband affiliate programmes) to win
that traffic and those citations".

Signal model for "generative AI performance" (there is no direct Search
Console API breakdown for AI Overviews, so this is a documented proxy):
  - growth in question-shaped / conversational GSC queries
  - Search Console searchAppearance rows
  - SerpApi AI Overview presence + citation domains for the UK (opt-in)
  - GA4 ai_referral_visit events by landing page

Search Console and GA4 are joined only by canonical landing page, never by
user.

Outputs:
  docs/geo-serp-research/<date>-geo-growth-strategy.json
  docs/geo-serp-research/<date>-geo-growth-strategy.md
  docs/page-build-pipeline/geo-topic-cluster-strategy.json  (read by build_master_tracker.py)

Usage:
  python3 scripts/analyze_geo_growth_strategy.py                     # GSC + GA4 only, reuse SERP cache
  python3 scripts/analyze_geo_growth_strategy.py --run-serp --serp-limit 15
  python3 scripts/analyze_geo_growth_strategy.py --skip-tracker
  python3 scripts/analyze_geo_growth_strategy.py --report-only docs/geo-serp-research/2026-09-06-geo-growth-strategy.json
  python3 scripts/analyze_geo_growth_strategy.py --trending --run-serp --skip-tracker
"""

from __future__ import annotations

import argparse
import json
import math
import os
import re
import sys
import time
from collections import Counter, defaultdict
from dataclasses import asdict, dataclass, field
from datetime import date, datetime, timedelta, timezone
from pathlib import Path
from typing import Any

from google.auth.transport.requests import Request
from google.oauth2 import service_account

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_CREDENTIALS = Path("/Users/sahilrafiqsayed/broadbandpicker-ga4-credentials.json")
SERP_CACHE_DIR = ROOT / "docs" / "geo-serp-research"
CANONICAL_STRATEGY = ROOT / "docs" / "page-build-pipeline" / "geo-topic-cluster-strategy.json"
TRACKER_SCRIPT = ROOT / "scripts" / "build_master_tracker.py"
AWIN_ADVERTISERS_DIR = ROOT / "Awin" / "advertisers"
PARTNER_BRANDS_FILE = ROOT / "data" / "partner-brand-options.json"

SITE = "sc-domain:broadbandpicker.co.uk"
SITE_ORIGIN = "https://broadbandpicker.co.uk"
GA4_PROPERTY = "551202232"
GSC_BASE = "https://www.googleapis.com/webmasters/v3"
GA_BASE = "https://analyticsdata.googleapis.com/v1beta"
SCOPES = [
    "https://www.googleapis.com/auth/webmasters.readonly",
    "https://www.googleapis.com/auth/analytics.readonly",
]

# A cluster needs at least this many current-window impressions before it can
# be ranked, so a single fluke query cannot manufacture a "growing topic".
CLUSTER_IMPRESSION_FLOOR = 120


# ---------------------------------------------------------------------------
# Google API client (same pattern as generate_weekly_seo_intelligence.py)
# ---------------------------------------------------------------------------

class GoogleClient:
    def __init__(self, credentials_path: Path) -> None:
        self.credentials = service_account.Credentials.from_service_account_file(
            str(credentials_path), scopes=SCOPES
        )

    def request(self, method: str, url: str, payload: dict | None = None) -> dict:
        import urllib.error
        import urllib.request

        if not self.credentials.valid:
            self.credentials.refresh(Request())
        body = None if payload is None else json.dumps(payload).encode("utf-8")
        request = urllib.request.Request(
            url,
            data=body,
            method=method,
            headers={
                "Authorization": f"Bearer {self.credentials.token}",
                "Content-Type": "application/json",
            },
        )
        try:
            with urllib.request.urlopen(request, timeout=60) as response:
                raw = response.read().decode("utf-8")
                return json.loads(raw) if raw else {}
        except urllib.error.HTTPError as exc:
            detail = exc.read().decode("utf-8", errors="replace")
            raise RuntimeError(f"Google API returned HTTP {exc.code}: {detail}") from exc


def canonical_path(value: str) -> str:
    import urllib.parse

    if not value or value == "(not set)":
        return "/"
    try:
        parsed = urllib.parse.urlsplit(value if "://" in value else f"{SITE_ORIGIN}{value}")
        path = parsed.path or "/"
    except ValueError:
        path = value.split("?", 1)[0] or "/"
    return path.rstrip("/") or "/"


def gsc_query(client: GoogleClient, start: date, end: date, dimensions: list[str]) -> list[dict]:
    import urllib.parse

    site = urllib.parse.quote(SITE, safe="")
    rows: list[dict] = []
    row_limit = 25000
    for page_index in range(10):
        response = client.request(
            "POST",
            f"{GSC_BASE}/sites/{site}/searchAnalytics/query",
            {
                "startDate": start.isoformat(),
                "endDate": end.isoformat(),
                "type": "web",
                "dimensions": dimensions,
                "dataState": "final",
                "rowLimit": row_limit,
                "startRow": page_index * row_limit,
                "aggregationType": "auto",
            },
        )
        batch = response.get("rows", [])
        rows.extend(batch)
        if len(batch) < row_limit:
            break
    return rows


def ga4_report(
    client: GoogleClient,
    start: date,
    end: date,
    dimensions: list[str],
    metrics: list[str],
    dimension_filter: dict | None = None,
) -> list[dict]:
    payload: dict = {
        "dateRanges": [{"startDate": start.isoformat(), "endDate": end.isoformat()}],
        "dimensions": [{"name": name} for name in dimensions],
        "metrics": [{"name": name} for name in metrics],
        "limit": "100000",
    }
    if dimension_filter:
        payload["dimensionFilter"] = dimension_filter
    response = client.request("POST", f"{GA_BASE}/properties/{GA4_PROPERTY}:runReport", payload)
    rows = []
    for row in response.get("rows", []):
        rows.append(
            {
                "dimensions": [value.get("value", "") for value in row.get("dimensionValues", [])],
                "metrics": [float(value.get("value", 0) or 0) for value in row.get("metricValues", [])],
            }
        )
    return rows


def pct_change(current: float, previous: float) -> float | None:
    if previous == 0:
        return None if current == 0 else 100.0
    return round((current - previous) / previous * 100, 1)


def suspicious_query(value: str) -> bool:
    """Keep anomalous non-English query rows from manufacturing SEO wins."""
    if not value:
        return False
    non_ascii = sum(1 for character in value if ord(character) > 127)
    return non_ascii / len(value) >= 0.25


# ---------------------------------------------------------------------------
# SerpApi (same pattern as analyze_page_type_ux.py)
# ---------------------------------------------------------------------------

JUNK_DOMAINS = {"", "google.com", "youtube.com", "translate.google.com", "webcache.googleusercontent.com"}


def env_key(name: str) -> str | None:
    if os.environ.get(name):
        return os.environ[name]
    env_path = ROOT / ".env.local"
    if env_path.exists():
        for line in env_path.read_text().splitlines():
            line = line.strip()
            if line.startswith(f"{name}="):
                return line.split("=", 1)[1].strip()
    return None


def serp_domain(link: str) -> str:
    return re.sub(r"^https?://(www\.)?", "", link or "").split("/")[0].lower()


def is_junk_domain(domain: str) -> bool:
    d = (domain or "").lower()
    return not d or d in JUNK_DOMAINS or "google.com" in d


def serp_quota(key: str) -> dict[str, Any]:
    import requests

    r = requests.get("https://serpapi.com/account", params={"api_key": key}, timeout=20)
    r.raise_for_status()
    return r.json()


def serp_search(key: str, query: str) -> dict[str, Any]:
    import requests

    r = requests.get(
        "https://serpapi.com/search",
        params={
            "engine": "google", "q": query, "gl": "uk", "hl": "en",
            "location": "United Kingdom", "api_key": key,
        },
        timeout=40,
    )
    r.raise_for_status()
    data = r.json()
    organic = data.get("organic_results", []) or []
    ai = data.get("ai_overview", {}) or {}

    ai_text_parts: list[str] = []
    for block in ai.get("text_blocks", []) or []:
        if block.get("snippet"):
            ai_text_parts.append(block["snippet"])
        for item in block.get("list", []) or []:
            if item.get("snippet"):
                ai_text_parts.append(item["snippet"])
    ai_text = " ".join(ai_text_parts)

    ai_domains: list[str] = []
    for ref in (ai.get("references", []) or []):
        dom = serp_domain(ref.get("link", ""))
        source = (ref.get("source") or "").strip().lower()
        if is_junk_domain(dom) and source and "." in source and " " not in source:
            dom = source
        if not is_junk_domain(dom):
            ai_domains.append(dom)

    domains = [serp_domain(o.get("link", "")) for o in organic[:10]]
    return {
        "query": query,
        "organic_domains": domains,
        "has_ai_overview": bool(ai),
        "ai_overview_text": ai_text[:2000],
        "ai_domains": ai_domains,
        "bp_organic_rank": next((i + 1 for i, d in enumerate(domains) if "broadbandpicker.co.uk" in d), None),
        "bp_in_ai_overview": "broadbandpicker" in ai_text.lower()
        or any("broadbandpicker" in d for d in ai_domains),
        "people_also_ask": [q.get("question") for q in data.get("related_questions", []) or [] if q.get("question")],
        "related_searches": [r.get("query") for r in data.get("related_searches", []) or [] if r.get("query")],
    }


def all_serp_caches() -> list[Path]:
    """Every prior SerpApi output, oldest first, so newer rows win on merge."""
    if not SERP_CACHE_DIR.exists():
        return []
    seen: set[Path] = set()
    ordered: list[Path] = []
    for pattern in ("*-raw.json", "*-page-ux-raw.json", "*-geo-growth-strategy.json"):
        for path in sorted(SERP_CACHE_DIR.glob(pattern)):
            if path not in seen:
                seen.add(path)
                ordered.append(path)
    return ordered


def load_cached_serp(path: Path) -> dict[str, dict[str, Any]]:
    """Normalise any previous SerpApi output into {query: serp_result}."""
    payload = json.loads(path.read_text(encoding="utf-8"))
    results: dict[str, dict[str, Any]] = {}

    def add(query: str, entry: dict[str, Any]) -> None:
        if query:
            results[query.lower().strip()] = entry

    if isinstance(payload.get("results"), list):  # geo-serp-research raw file
        for row in payload["results"]:
            add(row.get("query", ""), {
                "has_ai_overview": bool(row.get("has_ai_overview")),
                "ai_domains": [serp_domain(x) for x in row.get("ai_overview_domains", [])],
                "bp_in_ai_overview": bool(row.get("bp_in_ai_overview")),
                "bp_organic_rank": row.get("bp_organic_rank"),
                "people_also_ask": row.get("people_also_ask", []) or [],
                "related_searches": row.get("related_searches", []) or [],
                "organic_domains": [e.get("domain") for e in row.get("organic_top10", []) if e.get("domain")],
            })
    for res in payload.get("serp", {}).values():  # page-ux raw file
        add(res.get("query", ""), {
            "has_ai_overview": bool(res.get("has_ai_overview")),
            "ai_domains": [r.get("domain") for r in res.get("ai_references", []) if r.get("domain")],
            "bp_in_ai_overview": bool(res.get("bp_in_ai_overview")),
            "bp_organic_rank": res.get("bp_organic_rank"),
            "people_also_ask": res.get("people_also_ask", []) or [],
            "related_searches": [],
            "organic_domains": [e.get("domain") for e in res.get("organic_top10", []) if e.get("domain")],
        })
    for entry in payload.get("cluster_serp", {}).values():  # a previous full run of this script
        for probe in entry.get("probes", []):
            add(probe.get("query", ""), {
                "has_ai_overview": bool(probe.get("has_ai_overview")),
                "ai_domains": probe.get("ai_domains", []) or [],
                "bp_in_ai_overview": bool(probe.get("bp_in_ai_overview")),
                "bp_organic_rank": probe.get("bp_organic_rank"),
                "people_also_ask": probe.get("people_also_ask", []) or [],
                "related_searches": probe.get("related_searches", []) or [],
                "organic_domains": probe.get("organic_domains", []) or [],
            })
    return results


# ---------------------------------------------------------------------------
# Topic-cluster taxonomy + query classification
# ---------------------------------------------------------------------------

BRANDS: dict[str, str | None] = {
    # brand phrase -> Awin advertiser slug (None = relevant provider, no programme file)
    "bt": "bt-broadband", "sky": "sky-roi", "virgin media": "virgin-media", "virgin": "virgin-media",
    "ee": "ee-home-broadband", "vodafone": "vodafone-ltd", "plusnet": "plusnet-broadband",
    "talktalk": "talktalk-phone-and-broadband", "now broadband": None, "now tv": None,
    "three": None, "giffgaff": "giffgaff", "hyperoptic": "hyperoptic-b2c",
    "community fibre": "community-fibre", "connect fibre": "connect-fibre", "zzoomm": "zzoomm",
    "trooli": "trooli-full-fibre-broadband", "toob": "toob", "zen": "zen-internet",
    "cuckoo": "cuckoo-broadband", "national broadband": "national-broadband",
    "highland broadband": "highland-broadband", "pine media": "pine-media-broadband",
    "shell energy": None, "john lewis": None, "utility warehouse": None, "brsk": None,
    "youfibre": None, "gigaclear": None, "cityfibre": None, "nexfibre": None, "netomnia": None,
    "lightning fibre": None, "onestream": None, "origin broadband": None, "starlink": None,
    "broadband genie": "broadband-genie",
}

# Ordered: earlier clusters win a tie. Each entry:
#   key, label, regex, default intent, default journey stage, relevant provider slugs, page type
CLUSTERS: list[dict[str, Any]] = [
    {
        "key": "social-tariffs-affordability", "label": "Social tariffs & affordability",
        "re": r"social tariff|universal credit|on benefits|low income|pension credit|pip |"
              r"income support|jobseeker|means tested|cheap broadband help|broadband help|"
              r"free broadband|struggling to pay|can't afford",
        "intent": "informational", "journey": "consideration", "page_type": "guide",
        "providers": ["community-fibre", "national-broadband"],
    },
    {
        "key": "switching-and-rights", "label": "Switching & consumer rights",
        "re": r"\bswitch|one touch switch|contract end|end of contract|out of contract|"
              r"leave.*contract|early termination|exit fee|cancellation fee|price rise|"
              r"mid-contract|complaint|ombudsman|cancel broadband|moving house|home move|"
              r"keep my (number|email)|notice period",
        "intent": "informational", "journey": "retention", "page_type": "guide",
        "providers": [],
    },
    {
        "key": "business-broadband", "label": "Business & landlord broadband",
        "re": r"business broadband|office broadband|static ip|leased line|sme broadband|"
              r"company broadband|landlord|\bhmo\b|dedicated line|sla broadband",
        "intent": "commercial-investigation", "journey": "consideration", "page_type": "guide",
        "providers": ["zen-internet", "bt-business-broadband"],
    },
    {
        "key": "full-fibre-explainer", "label": "Full fibre / technology explainers",
        "re": r"full fibre|\bfttp\b|\bfttc\b|\bftt\w\b|what is fibre|fibre optic|"
              r"how does fibre|copper broadband|\badsl\b|\bg\.fast\b|openreach|altnet network|"
              r"dark fibre|symmetric",
        "intent": "informational", "journey": "awareness", "page_type": "guide",
        "providers": [],
    },
    {
        "key": "speed-troubleshooting", "label": "Speed advice & troubleshooting",
        "re": r"slow broadband|why is my (broadband|wifi|internet)|buffering|high (ping|latency)|"
              r"\bping\b|upload speed|download speed|what speed do i need|speed do i need|"
              r"mbps do i need|drops out|keeps dropping|speed test|not getting.*speed",
        "intent": "informational", "journey": "retention", "page_type": "tool",
        "providers": [],
    },
    {
        "key": "router-wifi", "label": "Routers, Wi-Fi & home coverage",
        "re": r"\brouter\b|\bmesh\b|wi-?fi ?[567]|wi-?fi ?6e|extender|wifi booster|"
              r"dead zone|black ?spot|powerline|access point|\beero\b|nest wifi|"
              r"wifi (not working|keeps|drops|range|coverage|signal)",
        "intent": "informational", "journey": "awareness", "page_type": "guide",
        "providers": [],
    },
    {
        "key": "phone-and-broadband", "label": "Phone + broadband & line rental",
        "re": r"phone and broadband|broadband and phone|telephone and broadband|"
              r"broadband and (line rental|landline|home phone|telephone|calls)|"
              r"landline and broadband|home phone and broadband|line rental|"
              r"unlimited (calls|phone calls)|broadband with home phone|"
              r"phone.*broadband package|broadband.*landline deal",
        "intent": "commercial-investigation", "journey": "consideration", "page_type": "guide",
        "providers": ["talktalk-phone-and-broadband"],
    },
    {
        "key": "best-broadband-shortlist", "label": "Best broadband / provider shortlist",
        "re": r"^(the )?(best|top|good|recommended) (broadband|fibre broadband|"
              r"full ?fibre broadband|internet|isp|broadband provider|broadband providers|"
              r"fibre broadband provider)( uk| in the uk| provider| right now)?$|"
              r"^(fibre|fibre optic|full ?fibre|superfast) broadband( uk)?$|"
              r"^broadband providers?( uk)?$|^broadband comparison( uk)?$|"
              r"^compare broadband( uk| providers)?$|^which broadband( is best| should i get)?$|"
              r"^good broadband provider$|^home broadband( uk)?$|"
              r"^broadband provider recommendations$",
        "intent": "commercial-investigation", "journey": "consideration", "page_type": "best-for",
        "providers": [],
    },
    {
        "key": "mobile-5g-home", "label": "5G / 4G home & no-landline broadband",
        "re": r"5g home|4g home|mobile broadband|home broadband without|no landline|"
              r"without a phone line|sim only broadband|wireless broadband|home wifi sim",
        "intent": "commercial-investigation", "journey": "consideration", "page_type": "guide",
        "providers": ["ee-home-broadband", "vodafone-ltd", "three"],
    },
    {
        "key": "tv-bundles", "label": "Broadband + TV bundles",
        "re": r"broadband and tv|tv and broadband|tv (bundle|package|deal)|sky sports|"
              r"tnt sports|netflix (included|bundle)|discovery\+|broadband with tv",
        "intent": "commercial-investigation", "journey": "consideration", "page_type": "guide",
        "providers": ["sky-roi", "talktalk-phone-and-broadband", "virgin-media"],
    },
    {
        "key": "best-for-use-case", "label": "Best-for use-case comparisons",
        "re": r"best broadband for|best (fibre|provider|deal) for|broadband for (gaming|streaming|"
              r"working from home|home working|students?|a? ?large family|families|rural|"
              r"the elderly|pensioners|caravan|narrowboat|new build)|gaming broadband",
        "intent": "commercial-investigation", "journey": "consideration", "page_type": "best-for",
        "providers": [],
    },
    {
        "key": "provider-comparison", "label": "Provider-vs-provider comparisons",
        "re": r"\b(vs\.?|versus)\b|\bcompared to\b|\bbetter than\b|"
              r"\bdifference between\b .+\band\b|"
              r"\b(bt|sky|ee|vodafone|plusnet|talktalk|virgin|hyperoptic|zzoomm|trooli|"
              r"community fibre|connect fibre|youfibre)\b\s+or\s+"
              r"\b(bt|sky|ee|vodafone|plusnet|talktalk|virgin|hyperoptic|zzoomm|trooli|"
              r"community fibre|connect fibre|youfibre)\b",
        "intent": "commercial-investigation", "journey": "decision", "page_type": "provider-vs",
        "providers": [],
    },
    {
        "key": "altnet", "label": "Altnet / alternative networks",
        "re": r"altnet|alternative network|community fibre|connect fibre|hyperoptic|zzoomm|"
              r"trooli|\btoob\b|brsk|youfibre|gigaclear|cityfibre|netomnia|nexfibre|"
              r"lightning fibre|highland broadband|full fibre provider near",
        "intent": "commercial-investigation", "journey": "consideration", "page_type": "guide",
        "providers": ["connect-fibre", "community-fibre", "zzoomm", "trooli-full-fibre-broadband",
                      "highland-broadband", "hyperoptic-b2c"],
    },
    {
        "key": "postcode-local", "label": "Postcode & local availability",
        "re": r"in my area|my postcode|check availability|availability checker|broadband in [a-z]|"
              r"deals in [a-z]|providers in [a-z]|\b[a-z]{1,2}\d{1,2}[a-z]?\b.*broadband|"
              r"broadband.*\b[a-z]{1,2}\d{1,2}[a-z]?\b",
        "intent": "transactional", "journey": "decision", "page_type": "postcode",
        "providers": [],
    },
    {
        "key": "deals-and-pricing", "label": "Deals, price & cost",
        "re": r"\bdeal|cheap|cheapest|\boffer|discount|voucher|cashback|"
              r"price|cost|per month|a month|under [£$]?\d|no setup fee|no upfront|"
              r"free (installation|setup|gift)|reward card|black friday|new customer",
        "intent": "transactional", "journey": "decision", "page_type": "guide",
        "providers": [],
    },
    {
        "key": "provider-review", "label": "Single-provider reviews & navigational",
        "re": r"\b(bt|sky|virgin ?media|virgin|ee|vodafone|plusnet|talktalk|now broadband|"
              r"three|giffgaff|hyperoptic|community fibre|connect fibre|zzoomm|trooli|toob|"
              r"zen|cuckoo|shell energy|john lewis|utility warehouse|youfibre|gigaclear|"
              r"cityfibre|nexfibre|origin broadband|onestream)\b"
              r"(.*(review|reviews|broadband|fibre|complaint|customer service|any good|login|"
              r"contact|app|speed|outage|down))?",
        "intent": "commercial-investigation", "journey": "decision", "page_type": "provider-review",
        "providers": [],
    },
]

FALLBACK_CLUSTER = {
    "key": "general-broadband", "label": "General broadband (unclustered)",
    "intent": "informational", "journey": "awareness", "page_type": "guide", "providers": [],
}

# Live routes that are not declared in the parsed data files (app routes,
# hubs, tools). Merged into the existing-coverage map so the script does not
# recommend "new page" for something that already exists.
KNOWN_PAGES: dict[str, list[str]] = {
    "speed-troubleshooting": ["/speed-test", "/tools/broadband-cost-calculator"],
    "postcode-local": ["/postcode", "/compare"],
    "best-broadband-shortlist": ["/compare", "/providers", "/deals"],
    "provider-comparison": ["/providers/compare"],
    "provider-review": ["/providers"],
    "deals-and-pricing": ["/deals"],
    "phone-and-broadband": ["/deals"],
    "tv-bundles": ["/deals"],
}

# Brand phrase -> /providers/<slug> path segment (review-template pages).
PROVIDER_PATHS: dict[str, str] = {
    "bt": "bt", "sky": "sky", "virgin media": "virgin-media", "virgin": "virgin-media",
    "ee": "ee", "vodafone": "vodafone", "plusnet": "plusnet",
    "talktalk": "talktalk", "now broadband": "now", "three": "three",
    "giffgaff": "giffgaff", "hyperoptic": "hyperoptic", "community fibre": "community-fibre",
    "connect fibre": "connect-fibre", "zzoomm": "zzoomm", "trooli": "trooli",
    "toob": "toob", "zen": "zen", "cuckoo": "cuckoo", "national broadband": "national-broadband",
    "highland broadband": "highland-broadband", "pine media": "pine-media",
}

_COMPILED = [(c, re.compile(c["re"], re.I)) for c in CLUSTERS]
_QUESTION_RE = re.compile(r"^(how|what|why|is|are|can|do|does|should|which|when|will|who)\b", re.I)
_CONVERSATIONAL_HINT = re.compile(r"\b(vs|worth it|better|explained|near me|for gaming|for streaming)\b", re.I)


def brands_in(text: str) -> list[str]:
    low = f" {text.lower()} "
    hits = []
    for phrase in BRANDS:
        if f" {phrase} " in low or low.strip().startswith(phrase + " ") or low.strip().endswith(" " + phrase):
            hits.append(phrase)
    return hits


def classify_query(query: str) -> dict[str, Any]:
    text = query.strip()
    cluster = FALLBACK_CLUSTER
    for candidate, pattern in _COMPILED:
        if pattern.search(text):
            cluster = candidate
            break
    words = text.split()
    conversational = bool(
        _QUESTION_RE.search(text)
        or _CONVERSATIONAL_HINT.search(text)
        or len(words) >= 6
        or " vs " in f" {text.lower()} "
    )
    intent = cluster["intent"]
    journey = cluster["journey"]
    # Transactional signals override a soft default on any cluster.
    if re.search(r"\b(deal|cheap|cheapest|price|cost|buy|order|sign up|switch to)\b", text, re.I):
        if cluster["key"] not in {"switching-and-rights", "full-fibre-explainer"}:
            intent, journey = "transactional", "decision"
    return {
        "cluster_key": cluster["key"],
        "cluster_label": cluster["label"],
        "page_type": cluster["page_type"],
        "intent": intent,
        "journey_stage": journey,
        "conversational": conversational,
        "brands": brands_in(text),
        "cluster_providers": cluster["providers"],
    }


# ---------------------------------------------------------------------------
# Affiliate alignment
# ---------------------------------------------------------------------------

def load_awin() -> dict[str, dict[str, Any]]:
    programmes: dict[str, dict[str, Any]] = {}
    for path in sorted(AWIN_ADVERTISERS_DIR.glob("*/programme.json")):
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            continue
        slug = data.get("slug") or path.parent.name
        programmes[slug] = {
            "advertiser": data.get("advertiser", slug),
            "relationship": (data.get("relationship") or "Unknown").strip(),
            "live_url": data.get("live_url", ""),
            "awin_advertiser_id": data.get("awin_advertiser_id"),
        }
    return programmes


def load_live_brands() -> set[str]:
    try:
        data = json.loads(PARTNER_BRANDS_FILE.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return set()
    return {b["slug"] for b in data.get("brands", []) if b.get("slug")}


def affiliate_readiness(
    provider_slugs: list[str], awin: dict[str, dict[str, Any]], live_brands: set[str]
) -> dict[str, Any]:
    buckets: dict[str, list[str]] = defaultdict(list)
    for slug in dict.fromkeys(provider_slugs):
        if not slug or slug not in awin:
            continue
        rel = awin[slug]["relationship"].lower()
        name = awin[slug]["advertiser"]
        if slug in live_brands:
            buckets["live_cta_ready"].append(name)
        elif rel == "joined":
            buckets["joined"].append(name)
        elif rel == "pending":
            buckets["pending"].append(name)
        elif rel == "rejected":
            buckets["rejected"].append(name)
        else:
            buckets["other"].append(f"{name} ({awin[slug]['relationship']})")

    if buckets["live_cta_ready"]:
        recommended = (
            f"Attach a tracked CTA for {buckets['live_cta_ready'][0]} "
            f"(live Awin programme); keep the editorial answer provider-neutral."
        )
        fit = 1.3
    elif buckets["joined"]:
        recommended = (
            f"{buckets['joined'][0]} is a joined Awin programme — confirm the brand link is "
            f"wired into partner-brand-options.json, then add a tracked CTA."
        )
        fit = 1.1
    elif buckets["pending"]:
        recommended = (
            "Informational only for now — relevant programmes ("
            + ", ".join(buckets["pending"][:3])
            + ") are still pending. Ship the answer, add a CTA when one is approved."
        )
        fit = 0.9
    else:
        recommended = (
            "Informational only — no relevant broadband affiliate programme is live. "
            "Use the page for topical authority, internal links to /compare and monetisable pages."
        )
        fit = 0.75
    return {
        "live_cta_ready": buckets["live_cta_ready"],
        "joined": buckets["joined"],
        "pending": buckets["pending"],
        "rejected": buckets["rejected"],
        "other": buckets["other"],
        "recommended_cta": recommended,
        "fit_factor": fit,
    }


# ---------------------------------------------------------------------------
# Existing content inventory (gap detection)
# ---------------------------------------------------------------------------

def existing_content() -> dict[str, list[str]]:
    """Return {cluster_key: [live URLs already covering it]} by matching slugs."""
    slugs: list[tuple[str, str]] = []  # (url, haystack)
    guides = ROOT / "data" / "guides.ts"
    if guides.exists():
        text = guides.read_text(encoding="utf-8")
        # Only the `guides` array holds real pages; `guideCategories` above it does not.
        anchor = text.find("export const guides")
        body = text[anchor:] if anchor != -1 else text
        for match in re.finditer(r"slug:\s*'([^']+)'", body):
            block = body[match.end():match.end() + 400]
            cat = re.search(r"category:\s*'([^']+)'", block)
            slugs.append((f"/guides/{match.group(1)}", f"{match.group(1)} {cat.group(1) if cat else ''}"))
    comps = ROOT / "data" / "provider-comparisons.ts"
    if comps.exists():
        for slug in re.findall(r"slug:\s*'([^']+)'", comps.read_text(encoding="utf-8")):
            slugs.append((f"/providers/compare/{slug}", f"{slug} vs comparison"))
    prio = ROOT / "data" / "priority-pages.ts"
    if prio.exists():
        for path in re.findall(r"path:\s*'([^']+)'", prio.read_text(encoding="utf-8")):
            slugs.append((path, path))

    coverage: dict[str, list[str]] = defaultdict(list)
    for url, haystack in slugs:
        info = classify_query(haystack.replace("-", " "))
        coverage[info["cluster_key"]].append(url)
    for cluster_key, urls in KNOWN_PAGES.items():
        for url in urls:
            if url not in coverage[cluster_key]:
                coverage[cluster_key].append(url)
    return coverage


# ---------------------------------------------------------------------------
# Cluster aggregation
# ---------------------------------------------------------------------------

@dataclass
class ClusterQuery:
    query: str
    impressions: float
    prev_impressions: float
    clicks: float
    position: float
    conversational: bool
    intent: str
    journey_stage: str

    @property
    def delta(self) -> float:
        return self.impressions - self.prev_impressions


@dataclass
class Cluster:
    key: str
    label: str
    page_type: str
    impressions: float = 0.0
    prev_impressions: float = 0.0
    clicks: float = 0.0
    prev_clicks: float = 0.0
    _pos_weight: float = 0.0
    queries: list[ClusterQuery] = field(default_factory=list)
    brands: Counter = field(default_factory=Counter)
    intents: Counter = field(default_factory=Counter)
    journeys: Counter = field(default_factory=Counter)

    def add(self, cq: ClusterQuery, brands: list[str]) -> None:
        self.impressions += cq.impressions
        self.prev_impressions += cq.prev_impressions
        self.clicks += cq.clicks
        self._pos_weight += cq.position * cq.impressions
        self.queries.append(cq)
        for b in brands:
            self.brands[b] += cq.impressions
        self.intents[cq.intent] += cq.impressions
        self.journeys[cq.journey_stage] += cq.impressions

    @property
    def avg_position(self) -> float:
        return round(self._pos_weight / self.impressions, 1) if self.impressions else 0.0

    @property
    def conversational_share(self) -> float:
        conv = sum(q.impressions for q in self.queries if q.conversational)
        return round(conv / self.impressions, 3) if self.impressions else 0.0

    @property
    def new_query_share(self) -> float:
        new = sum(1 for q in self.queries if q.prev_impressions == 0 and q.impressions > 0)
        return round(new / len(self.queries), 3) if self.queries else 0.0


def build_clusters(
    query_rows: list[dict], prev_query_rows: list[dict], prev_clicks_rows: list[dict]
) -> dict[str, Cluster]:
    prev_by_query: dict[str, float] = defaultdict(float)
    for row in prev_query_rows:
        q = row["keys"][0]
        if not suspicious_query(q):
            prev_by_query[q] += float(row.get("impressions", 0))

    clusters: dict[str, Cluster] = {}
    prev_cluster_clicks: dict[str, float] = defaultdict(float)

    # Previous-window cluster clicks (for the click trend line).
    for row in prev_query_rows:
        q = row["keys"][0]
        if suspicious_query(q):
            continue
        info = classify_query(q)
        prev_cluster_clicks[info["cluster_key"]] += float(row.get("clicks", 0))

    for row in query_rows:
        q = row["keys"][0]
        if suspicious_query(q):
            continue
        info = classify_query(q)
        cq = ClusterQuery(
            query=q,
            impressions=float(row.get("impressions", 0)),
            prev_impressions=prev_by_query.get(q, 0.0),
            clicks=float(row.get("clicks", 0)),
            position=float(row.get("position", 0)),
            conversational=info["conversational"],
            intent=info["intent"],
            journey_stage=info["journey_stage"],
        )
        cluster = clusters.setdefault(
            info["cluster_key"],
            Cluster(key=info["cluster_key"], label=info["cluster_label"], page_type=info["page_type"]),
        )
        cluster.add(cq, info["brands"])

    for key, cluster in clusters.items():
        cluster.prev_clicks = prev_cluster_clicks.get(key, 0.0)
    return clusters


def growth_score(cluster: Cluster, max_impressions: float, max_delta: float) -> float:
    delta = max(0.0, cluster.impressions - cluster.prev_impressions)
    demand = math.log1p(cluster.impressions) / math.log1p(max_impressions) if max_impressions else 0.0
    momentum = 0.0
    change = pct_change(cluster.impressions, cluster.prev_impressions)
    if change is not None:
        momentum = max(-0.3, min(1.0, change / 200.0))
    delta_norm = math.log1p(delta) / math.log1p(max_delta) if max_delta else 0.0
    score = (
        0.40 * demand
        + 0.30 * delta_norm
        + 0.18 * max(0.0, momentum)
        + 0.12 * cluster.conversational_share
    )
    return round(score * 100, 1)


# ---------------------------------------------------------------------------
# GEO block spec + recommendation assembly
# ---------------------------------------------------------------------------

GEO_BLOCK_SPEC: dict[str, str] = {
    "social-tariffs-affordability": "40-70 word answer naming the current cheapest social tariff and the eligibility benefits, with a dated Ofcom social-tariff reference and a comparison table of tariff, speed and monthly price by provider.",
    "switching-and-rights": "40-70 word direct answer plus a HowTo step list matching the visible copy, dated Ofcom One Touch Switch / automatic-compensation references, and an FAQ answering the top People Also Ask.",
    "business-broadband": "40-70 word answer contrasting business vs consumer broadband on SLA, static IP and support, a specs table by provider, and named sources for leased-line install times and pricing.",
    "full-fibre-explainer": "40-70 word plain-English definition, an FTTP vs FTTC vs cable comparison table, an Openreach / altnet coverage figure with date, and a diagram-style bullet list of how the connection reaches the home.",
    "speed-troubleshooting": "40-70 word answer with a concrete Mbps recommendation by household size / activity, an interactive or tabular speed calculator, and named Ofcom average-speed data with date.",
    "router-wifi": "40-70 word answer on when a mesh / new router actually helps, a comparison table of router types and typical coverage, and clear next steps that link to provider hardware.",
    "mobile-5g-home": "40-70 word answer on who 5G/4G home broadband suits, a table comparing it to fixed-line on speed, latency, data and price, and named Ofcom mobile-coverage data with date.",
    "tv-bundles": "40-70 word answer on the cheapest genuine broadband+TV route now, a table of bundle, channels, broadband speed and total monthly cost, and dated pricing.",
    "best-for-use-case": "40-70 word verdict naming the top pick and runner-up for the use case, a scored comparison table (speed, price, contract, upload), and the measurable reason each was chosen.",
    "provider-comparison": "40-70 word verdict on which provider wins and for whom, a head-to-head table (real current price, Ofcom complaints, coverage, Trustpilot, contract), and dated sources.",
    "altnet": "40-70 word answer on what an altnet is and the trade-offs, a table of the main UK altnets by footprint, top speed and price, and a postcode-availability pointer.",
    "postcode-local": "40-70 word answer on how to check availability and what is typically available in the area, a table of providers, technology and speed for the location, and a live postcode-checker link.",
    "deals-and-pricing": "40-70 word answer naming the current best-value deal and its true monthly cost after any mid-contract rise, a ranked deals table with dates, and the methodology link.",
    "provider-review": "40-70 word verdict on the provider with its standout strength and weakness, a fact box (price, speed, coverage, Ofcom complaints, Trustpilot, contract) and dated sources.",
    "general-broadband": "40-70 word direct answer to the primary question, one supporting comparison table with dated figures, and named external sources (Ofcom / provider).",
}


@dataclass
class Recommendation:
    record_type: str  # "New page" | "Refresh existing"
    cluster_key: str
    cluster_label: str
    page_type: str
    intent: str
    journey_stage: str
    impressions: float
    impression_change_pct: float | None
    conversational_share: float
    avg_position: float
    growth_score: float
    ai_overview_signal: str
    bp_cited: str
    existing_coverage: list[str]
    recommended_url: str
    working_title: str
    primary_queries: list[str]
    secondary_queries: list[str]
    rising_queries: list[str]
    paa_to_answer: list[str]
    related_prompts: list[str]
    affiliate_partners: list[str]
    affiliate_readiness: str
    geo_block_spec: str
    internal_links: list[str]
    priority_score: float


def slugify(text: str) -> str:
    return re.sub(r"-+", "-", re.sub(r"[^a-z0-9]+", "-", text.lower())).strip("-")


_STOP_TOKENS = {"the", "and", "for", "uk", "best", "guides", "providers", "provider"}


def _tokens(text: str) -> set[str]:
    """Lowercase word set with a light singular fold so provider/providers match."""
    out = {re.sub(r"s$", "", w) for w in re.findall(r"[a-z0-9]+", text.lower()) if len(w) >= 2}
    return out - _STOP_TOKENS


def suggest_url(cluster: Cluster, primary_queries: list[str]) -> str:
    seed = primary_queries[0] if primary_queries else cluster.label
    slug = slugify(seed)[:60].strip("-")
    if cluster.page_type == "provider-vs":
        brands = re.findall(r"[a-z]+", slug)
        return f"/providers/compare/{slug}" if slug else "/providers/compare"
    if cluster.page_type == "postcode":
        return "/postcode"
    if cluster.page_type in {"guide", "best-for", "tool"}:
        if "uk" not in slug.split("-"):
            slug = f"{slug}-uk"
        return f"/guides/{slug}"
    if cluster.page_type == "provider-review":
        return "/providers"
    return f"/guides/{slug}"


def internal_links_for(cluster_key: str) -> list[str]:
    base = ["/compare", "/deals"]
    extra = {
        "switching-and-rights": ["/guides/how-to-switch-broadband-uk", "/guides/broadband-price-rises-2026"],
        "full-fibre-explainer": ["/guides/full-fibre-broadband-explained", "/guides/fttp-vs-fttc-explained"],
        "social-tariffs-affordability": ["/guides/broadband-social-tariffs-uk", "/guides/cheapest-broadband-uk"],
        "best-for-use-case": ["/guides/best-broadband-providers-uk"],
        "provider-comparison": ["/providers", "/compare"],
        "altnet": ["/postcode", "/guides/best-full-fibre-broadband-uk"],
        "postcode-local": ["/postcode", "/compare"],
        "deals-and-pricing": ["/guides/best-broadband-deals-uk", "/deals"],
        "speed-troubleshooting": ["/speed-test", "/tools/broadband-cost-calculator"],
        "business-broadband": ["/guides/best-business-broadband-providers-uk"],
        "tv-bundles": ["/guides/best-broadband-and-tv-deals"],
        "mobile-5g-home": ["/guides/best-5g-home-broadband-uk", "/guides/broadband-without-phone-line"],
        "router-wifi": ["/guides/best-mesh-wifi-for-your-broadband-router"],
    }
    return list(dict.fromkeys(base + extra.get(cluster_key, [])))


# ---------------------------------------------------------------------------
# SERP enrichment per cluster
# ---------------------------------------------------------------------------

def representative_queries(cluster: Cluster, n: int = 2) -> list[str]:
    ranked = sorted(cluster.queries, key=lambda q: (q.conversational, q.impressions), reverse=True)
    picks: list[str] = []
    for q in ranked:
        if q.query not in picks:
            picks.append(q.query)
        if len(picks) >= n:
            break
    return picks


def enrich_clusters_with_serp(
    ranked_clusters: list[tuple[Cluster, float]],
    serp_by_query: dict[str, dict[str, Any]],
    run_live: bool,
    serp_limit: int,
) -> tuple[dict[str, dict[str, Any]], dict[str, Any]]:
    plan: list[tuple[str, str]] = []
    for cluster, _ in ranked_clusters:
        for q in representative_queries(cluster, 2):
            plan.append((cluster.key, q))

    meta: dict[str, Any] = {"mode": "cache", "queries_run": 0, "searches_left": None}
    live_results: dict[str, dict[str, Any]] = {}

    if run_live:
        key = env_key("SERPAPI_API_KEY")
        if not key:
            print("SERPAPI_API_KEY not set (env or .env.local); staying on cache.", file=sys.stderr)
        else:
            quota = serp_quota(key)
            left = int(quota.get("total_searches_left", 0))
            print(f"SerpApi plan: {quota.get('plan_name')}, searches left: {left}")
            chosen = plan[:serp_limit]
            if left < len(chosen):
                print(
                    f"Only {left} SerpApi searches left but {len(chosen)} planned. "
                    f"Lower --serp-limit or top up the plan.",
                    file=sys.stderr,
                )
                sys.exit(1)
            for i, (ckey, q) in enumerate(chosen, 1):
                print(f"  [{i}/{len(chosen)}] ({ckey}) {q}")
                try:
                    res = serp_search(key, q)
                    live_results[q.lower().strip()] = res
                except Exception as exc:  # noqa: BLE001
                    print(f"    ERROR: {exc}", file=sys.stderr)
                time.sleep(1.0)
            after = int(serp_quota(key).get("total_searches_left", left))
            meta = {"mode": "live", "queries_run": len(live_results),
                    "searches_used": left - after, "searches_left": after}
            print(f"SerpApi searches used: {left - after}; left: {after}")

    combined = dict(serp_by_query)
    combined.update(live_results)

    per_cluster: dict[str, dict[str, Any]] = {}
    for cluster, _ in ranked_clusters:
        probes = []
        for q in representative_queries(cluster, 2):
            hit = combined.get(q.lower().strip())
            if hit:
                probes.append({"query": q, **hit})
        has_ai = [p for p in probes if p.get("has_ai_overview")]
        cited = [p for p in has_ai if p.get("bp_in_ai_overview")]
        comp_domains = Counter()
        for p in has_ai:
            for d in p.get("ai_domains", []):
                if d and "broadbandpicker" not in d and not is_junk_domain(d):
                    comp_domains[d] += 1
        paa: list[str] = []
        related: list[str] = []
        for p in probes:
            paa.extend(p.get("people_also_ask", []) or [])
            related.extend(p.get("related_searches", []) or [])
        if not probes:
            signal = "not measured this run"
        elif has_ai:
            signal = f"AI Overview on {len(has_ai)}/{len(probes)} probe queries"
        else:
            signal = f"no AI Overview on {len(probes)} probe queries"
        per_cluster[cluster.key] = {
            "signal": signal,
            "bp_cited": "yes" if cited else ("no" if has_ai else "n/a"),
            "competitor_domains": [d for d, _ in comp_domains.most_common(8)],
            "paa": list(dict.fromkeys(paa))[:8],
            "related_prompts": list(dict.fromkeys(related))[:8],
            "probes": probes,
        }
    return per_cluster, meta


# ---------------------------------------------------------------------------
# Assemble strategy
# ---------------------------------------------------------------------------

def build_recommendations(
    clusters: dict[str, Cluster],
    top_n: int,
    serp: dict[str, dict[str, Any]],
    awin: dict[str, dict[str, Any]],
    live_brands: set[str],
    coverage: dict[str, list[str]],
) -> tuple[list[Recommendation], list[dict[str, Any]]]:
    eligible = [c for c in clusters.values() if c.impressions >= CLUSTER_IMPRESSION_FLOOR]
    max_impr = max((c.impressions for c in eligible), default=1.0)
    max_delta = max((max(0.0, c.impressions - c.prev_impressions) for c in eligible), default=1.0)
    scored = sorted(
        ((c, growth_score(c, max_impr, max_delta)) for c in eligible),
        key=lambda pair: pair[1],
        reverse=True,
    )

    league: list[dict[str, Any]] = []
    for cluster, score in scored:
        league.append({
            "cluster_key": cluster.key,
            "cluster_label": cluster.label,
            "growth_score": score,
            "impressions": round(cluster.impressions),
            "prev_impressions": round(cluster.prev_impressions),
            "impression_change_pct": pct_change(cluster.impressions, cluster.prev_impressions),
            "clicks": round(cluster.clicks),
            "avg_position": cluster.avg_position,
            "query_count": len(cluster.queries),
            "conversational_share": cluster.conversational_share,
            "new_query_share": cluster.new_query_share,
            "dominant_intent": cluster.intents.most_common(1)[0][0] if cluster.intents else "",
            "dominant_journey_stage": cluster.journeys.most_common(1)[0][0] if cluster.journeys else "",
            "existing_coverage": coverage.get(cluster.key, []),
        })

    recommendations: list[Recommendation] = []
    for cluster, score in scored[:top_n]:
        if cluster.key == "general-broadband":
            # Kept in the league table for transparency, but "unclustered" is not
            # a page you can build -- its queries need finer classification first.
            continue
        cluster_serp = serp.get(cluster.key, {})
        by_impr = sorted(cluster.queries, key=lambda q: q.impressions, reverse=True)
        by_delta = sorted(cluster.queries, key=lambda q: q.delta, reverse=True)
        primary = [q.query for q in by_impr[:3]]
        secondary = [q.query for q in by_impr[3:8]]
        rising = [f"{q.query} (+{round(q.delta)})" for q in by_delta[:5] if q.delta > 0]

        provider_slugs: list[str] = []
        for spec in CLUSTERS:
            if spec["key"] == cluster.key:
                provider_slugs.extend(spec["providers"])
                break
        for brand, _weight in cluster.brands.most_common(5):
            slug = BRANDS.get(brand)
            if slug:
                provider_slugs.append(slug)
        readiness = affiliate_readiness(provider_slugs, awin, live_brands)

        existing = list(coverage.get(cluster.key, []))
        # Navigational brand queries map to the existing /providers/<brand> review
        # template, not to a brand-new page.
        if cluster.key == "provider-review":
            brand_paths = [
                f"/providers/{PROVIDER_PATHS[brand]}"
                for brand, _w in cluster.brands.most_common(3)
                if brand in PROVIDER_PATHS
            ]
            existing = [p for p in brand_paths if p not in existing] + existing

        bp_cited = cluster_serp.get("bp_cited", "n/a")
        has_page = len(existing) > 0
        # Refresh when a page exists but is not winning the AI answer; otherwise build new.
        record_type = "Refresh existing" if (has_page and bp_cited != "yes") else "New page"
        if not has_page:
            record_type = "New page"

        if record_type == "Refresh existing":
            seed_tokens = _tokens(" ".join(primary) if primary else cluster.label)

            def _match(url: str) -> tuple[int, int]:
                url_tokens = _tokens(url)
                # Most shared tokens, then the tightest fit (fewest unrelated tokens).
                return len(seed_tokens & url_tokens), -len(url_tokens - seed_tokens)

            recommended_url = max(existing, key=_match)
            title = f"Add AI-answer blocks to {recommended_url}"
            if len(existing) > 1:
                title += f" (+{len(existing) - 1} more in cluster)"
        else:
            recommended_url = suggest_url(cluster, primary)
            seed = primary[0] if primary else cluster.label
            title = seed[:1].upper() + seed[1:]
            if "uk" not in title.lower():
                title += " (UK)"

        ai_gap = 1.4 if (cluster_serp.get("signal", "").startswith("AI Overview") and bp_cited != "yes") else (
            0.8 if bp_cited == "yes" else 1.0
        )
        difficulty = {"provider-vs": 1.6, "guide": 1.3, "best-for": 1.4, "tool": 1.8,
                      "postcode": 1.2, "provider-review": 1.5}.get(cluster.page_type, 1.3)
        comp_penalty = 1.0 + 0.05 * len(cluster_serp.get("competitor_domains", []))
        priority = round(score * ai_gap * readiness["fit_factor"] / (difficulty * comp_penalty), 1)

        recommendations.append(Recommendation(
            record_type=record_type,
            cluster_key=cluster.key,
            cluster_label=cluster.label,
            page_type=cluster.page_type,
            intent=cluster.intents.most_common(1)[0][0] if cluster.intents else "",
            journey_stage=cluster.journeys.most_common(1)[0][0] if cluster.journeys else "",
            impressions=round(cluster.impressions),
            impression_change_pct=pct_change(cluster.impressions, cluster.prev_impressions),
            conversational_share=cluster.conversational_share,
            avg_position=cluster.avg_position,
            growth_score=score,
            ai_overview_signal=cluster_serp.get("signal", "not measured this run"),
            bp_cited=bp_cited,
            existing_coverage=existing,
            recommended_url=recommended_url,
            working_title=title,
            primary_queries=primary,
            secondary_queries=secondary,
            rising_queries=rising,
            paa_to_answer=cluster_serp.get("paa", []),
            related_prompts=cluster_serp.get("related_prompts", []),
            affiliate_partners=(
                readiness["live_cta_ready"] or readiness["joined"] or readiness["pending"]
            ),
            affiliate_readiness=readiness["recommended_cta"],
            geo_block_spec=GEO_BLOCK_SPEC.get(cluster.key, GEO_BLOCK_SPEC["general-broadband"]),
            internal_links=internal_links_for(cluster.key),
            priority_score=priority,
        ))

    recommendations.sort(key=lambda r: r.priority_score, reverse=True)
    return recommendations, league


# ---------------------------------------------------------------------------
# Rendering + canonical file for the tracker
# ---------------------------------------------------------------------------

def render_markdown(payload: dict[str, Any]) -> str:
    s = payload["summary"]
    lines = [
        "# BroadbandPicker GEO topic-cluster growth strategy",
        "",
        f"Generated: {payload['generated_at']}",
        f"Window: {payload['current_window']['start']} to {payload['current_window']['end']} "
        f"vs {payload['previous_window']['start']} to {payload['previous_window']['end']}",
        "",
        "## Executive summary",
        "",
        f"- GSC impressions: **{s['gsc_impressions']:,.0f}** ({s['gsc_impression_change_pct']:+.1f}% vs previous window)",
        f"- GSC clicks: **{s['gsc_clicks']:,.0f}** ({s['gsc_click_change_pct']:+.1f}%)",
        f"- Conversational / question-shaped share of impressions: **{s['conversational_impression_share']:.1%}** "
        f"({s['conversational_change_pp']:+.1f}pp)",
        f"- GA4 AI-referral visits (minimum, some assistants hide the referrer): **{s['ai_referral_visits']:g}**",
        f"- Topic clusters ranked: **{s['clusters_ranked']}**; SERP enrichment mode: **{payload['serp_meta']['mode']}** "
        f"({payload['serp_meta'].get('queries_run', 0)} live queries)",
        "",
        "## Growing topic clusters",
        "",
        "| Cluster | Growth | Impressions | Change | Avg pos | Conversational | Intent | Journey | Existing pages |",
        "| --- | ---: | ---: | ---: | ---: | ---: | --- | --- | ---: |",
    ]
    for row in payload["cluster_league"]:
        lines.append(
            f"| {row['cluster_label']} | {row['growth_score']:.0f} | {row['impressions']:,} | "
            f"{(row['impression_change_pct'] or 0):+.0f}% | {row['avg_position']:.0f} | "
            f"{row['conversational_share']:.0%} | {row['dominant_intent']} | "
            f"{row['dominant_journey_stage']} | {len(row['existing_coverage'])} |"
        )
    lines += ["", "## Recommended pages & refreshes", ""]
    for i, rec in enumerate(payload["recommendations"], 1):
        lines += [
            f"### {i}. [{rec['record_type']}] {rec['working_title']}  ·  priority {rec['priority_score']}",
            "",
            f"- Cluster: **{rec['cluster_label']}** ({rec['intent']} · {rec['journey_stage']})",
            f"- URL: `{rec['recommended_url']}`  ·  page type: {rec['page_type']}",
            f"- AI Overview: {rec['ai_overview_signal']}; BroadbandPicker cited: {rec['bp_cited']}",
            f"- Primary queries: {', '.join(rec['primary_queries']) or '—'}",
            f"- Rising queries: {', '.join(rec['rising_queries']) or '—'}",
            f"- People Also Ask to answer: {', '.join(rec['paa_to_answer']) or '—'}",
            f"- Related prompts to cover: {', '.join(rec['related_prompts']) or '—'}",
            f"- Affiliate: {rec['affiliate_readiness']}",
            f"- GEO answer block: {rec['geo_block_spec']}",
            f"- Internal links: {', '.join(rec['internal_links'])}",
            "",
        ]
    lines += [
        "## Measurement interpretation",
        "",
        "- \"Generative AI performance\" here is a proxy: Search Console has no AI Overview API breakdown. "
        "It combines conversational-query growth, searchAppearance, opt-in SerpApi AI Overview checks (UK) "
        "and GA4 ai_referral_visit.",
        "- Search Console and GA4 are joined only by canonical landing page, never by user.",
        "- AI-referral and AI Overview citation counts are minimums.",
        "- A high growth or priority score marks an evidence-backed opportunity, not a ranking guarantee.",
        "",
        "## Search appearance (Search Console)",
        "",
        "| Appearance | Clicks | Impressions | CTR | Position |",
        "| --- | ---: | ---: | ---: | ---: |",
    ]
    for row in payload.get("search_appearance", []):
        lines.append(
            f"| {row['appearance']} | {row['clicks']:.0f} | {row['impressions']:.0f} | "
            f"{row['ctr']:.2%} | {row['position']:.1f} |"
        )
    return "\n".join(lines) + "\n"


def write_canonical_strategy(payload: dict[str, Any]) -> None:
    CANONICAL_STRATEGY.parent.mkdir(parents=True, exist_ok=True)
    CANONICAL_STRATEGY.write_text(
        json.dumps(
            {
                "generated_at": payload["generated_at"],
                "current_window": payload["current_window"],
                "previous_window": payload["previous_window"],
                "summary": payload["summary"],
                "serp_meta": payload["serp_meta"],
                "cluster_league": payload["cluster_league"],
                "recommendations": payload["recommendations"],
            },
            indent=2,
            ensure_ascii=False,
        )
        + "\n",
        encoding="utf-8",
    )


# ---------------------------------------------------------------------------
# Trending worldwide / UK topics mapped onto broadband SEO + GEO
# ---------------------------------------------------------------------------

TRENDING_PLAN_CANONICAL = ROOT / "docs" / "page-build-pipeline" / "trending-content-plan.json"

# Only map a trend when BroadbandPicker can add original utility. Politics,
# celebrity and scorecards are recorded then skipped.
TREND_THEME_RULES: list[dict[str, Any]] = [
    {
        "id": "gaming-online",
        "keywords": (
            "gta", "gta 6", "gta vi", "grand theft auto", "playstation", "xbox",
            "nintendo", "fortnite", "call of duty", "steam", "ea sports fc",
            "ps5", "xbox series",
        ),
        "cluster": "best-for-use-case",
        "theme": "Online play needs low ping and a stable full-fibre line, not only a high download headline.",
        "existing": ["/guides/best-broadband-for-gaming-uk", "/speed-test"],
        "action": "refresh-plus-conditional-new",
        "working_title": "GTA 6 and 2026 online games: UK broadband, ping and evening congestion",
        "proposed_url": "/guides/gta-6-broadband-uk",
        "refresh_url": "/guides/best-broadband-for-gaming-uk",
        "primary_queries": [
            "best broadband for gaming UK",
            "GTA 6 internet speed UK",
            "GTA 6 ping broadband",
        ],
        "geo_block": "For online games, latency and a stable connection usually matter more than a gigabit headline. Check the provider ping, evening slowdown and the written speed estimate for your address. Do not treat an unverified download size as a speed requirement.",
    },
    {
        "id": "live-sport-streaming",
        "keywords": (
            "world cup", "fifa", "premier league", "champions league", "six nations",
            "wimbledon", "f1", "formula 1", "sky sports", "tnt sports",
        ),
        "cluster": "tv-bundles",
        "theme": "Match-day 4K and multi-room sport is an upload-and-congestion problem as well as a TV-bundle problem.",
        "existing": ["/guides/best-broadband-and-tv-deals", "/guides/best-broadband-for-streaming-uk"],
        "action": "refresh",
        "working_title": "Watching live sport in 4K on UK broadband: speed, congestion and TV bundles",
        "proposed_url": "/guides/best-broadband-for-streaming-uk",
        "refresh_url": "/guides/best-broadband-for-streaming-uk",
        "primary_queries": [
            "best broadband for streaming UK",
            "broadband for 4K football",
            "World Cup broadband UK",
        ],
        "geo_block": "A busy household watching live sport should compare advertised average speed, the personalised minimum guarantee and whether several 4K streams share the line at kick-off. TV rights and app logins are separate from the broadband contract.",
    },
    {
        "id": "wifi-and-devices",
        "keywords": (
            "iphone", "ios 27", "ios 26", "apple event", "wifi 7", "wi-fi 7",
            "pixel", "samsung galaxy", "router",
        ),
        "cluster": "router-wifi",
        "theme": "New phones and Wi-Fi 7 headlines still depend on the incoming line and in-home wireless, not the handset alone.",
        "existing": ["/guides/wifi-7-explained-uk", "/guides/best-mesh-wifi-for-your-broadband-router"],
        "action": "refresh",
        "working_title": "Wi-Fi 7 and new phones on UK broadband: what actually changes",
        "proposed_url": "/guides/wifi-7-explained-uk",
        "refresh_url": "/guides/wifi-7-explained-uk",
        "primary_queries": [
            "is wifi 7 worth it",
            "best mesh wifi UK",
            "wifi 7 broadband UK",
        ],
        "geo_block": "Wi-Fi 7 only helps if the router, devices and incoming full-fibre service all support it. A new phone cannot fix a slow copper line or a congested evening cabinet.",
    },
    {
        "id": "working-from-home-video",
        "keywords": (
            "teams outage", "zoom", "remote work", "working from home", "office 365",
        ),
        "cluster": "best-for-use-case",
        "theme": "Calls and uploads fail first when upload speed and latency are poor.",
        "existing": ["/guides/best-broadband-for-working-from-home", "/speed-test"],
        "action": "refresh",
        "working_title": "Upload speed for video calls on UK broadband",
        "proposed_url": "/guides/best-broadband-for-working-from-home",
        "refresh_url": "/guides/best-broadband-for-working-from-home",
        "primary_queries": [
            "best broadband for working from home",
            "what upload speed for zoom",
            "why is my wifi bad on video calls",
        ],
        "geo_block": "Video calls need reliable upload and low latency more than a high download number. Compare the upload figure and the personalised minimum guarantee, then test by Ethernet if Wi-Fi is the suspect.",
    },
    {
        "id": "ai-and-cloud",
        "keywords": (
            "chatgpt", "openai", "gemini", "claude", "copilot", "ai",
        ),
        "cluster": "speed-troubleshooting",
        "theme": "AI tools and cloud backups compete with streaming for upload and evening capacity.",
        "existing": ["/guides/what-broadband-speed-do-i-need", "/speed-test"],
        "action": "refresh",
        "working_title": "Broadband for AI tools, cloud backups and always-on households",
        "proposed_url": "/guides/what-broadband-speed-do-i-need",
        "refresh_url": "/guides/what-broadband-speed-do-i-need",
        "primary_queries": [
            "what broadband speed do I need",
            "broadband for cloud backup",
            "is 100 Mbps enough 2026",
        ],
        "geo_block": "Always-on AI clients and cloud backups use upload as well as download. Size the line to simultaneous use at the property, not to a single headline speed.",
    },
]


def _norm_trend(value: str) -> str:
    return re.sub(r"\s+", " ", (value or "").lower()).strip()


def keyword_in_hay(keyword: str, hay: str) -> bool:
    needle = _norm_trend(keyword)
    if len(needle) <= 3:
        return re.search(rf"(^|[^a-z0-9]){re.escape(needle)}([^a-z0-9]|$)", hay) is not None
    return needle in hay


def match_trend_rule(query: str, breakdown: list[str] | None = None) -> dict[str, Any] | None:
    hay = " ".join([_norm_trend(query)] + [_norm_trend(item) for item in (breakdown or [])])
    for rule in TREND_THEME_RULES:
        if any(keyword_in_hay(keyword, hay) for keyword in rule["keywords"]):
            return rule
    return None


def fetch_trending_now(key: str, geo: str, hours: int = 168) -> dict[str, Any]:
    import requests

    response = requests.get(
        "https://serpapi.com/search",
        params={
            "engine": "google_trends_trending_now",
            "geo": geo,
            "hours": hours,
            "api_key": key,
        },
        timeout=40,
    )
    response.raise_for_status()
    data = response.json()
    rows = []
    for item in data.get("trending_searches") or []:
        rows.append(
            {
                "query": item.get("query") or "",
                "search_volume": item.get("search_volume"),
                "increase_percentage": item.get("increase_percentage"),
                "active": item.get("active"),
                "categories": [c.get("name") for c in (item.get("categories") or []) if c.get("name")],
                "trend_breakdown": (item.get("trend_breakdown") or [])[:8],
            }
        )
    return {"geo": geo, "hours": hours, "rows": rows, "error": data.get("error")}


def fetch_google_trends_interest(key: str, query: str, geo: str | None) -> dict[str, Any]:
    import requests

    params: dict[str, Any] = {
        "engine": "google_trends",
        "q": query,
        "date": "now 7-d",
        "api_key": key,
        "data_type": "TIMESERIES",
    }
    if geo:
        params["geo"] = geo
    response = requests.get("https://serpapi.com/search", params=params, timeout=40)
    response.raise_for_status()
    data = response.json()
    timeline = ((data.get("interest_over_time") or {}).get("timeline_data")) or []
    values = []
    for point in timeline:
        for val in point.get("values") or []:
            extracted = val.get("extracted_value")
            if isinstance(extracted, (int, float)):
                values.append(extracted)
    return {
        "query": query,
        "geo": geo or "worldwide",
        "points": len(values),
        "latest": values[-1] if values else None,
        "peak": max(values) if values else None,
        "average": round(sum(values) / len(values), 1) if values else None,
    }


def summarise_trending_rows(bundle: dict[str, Any], region_label: str) -> list[dict[str, Any]]:
    out = []
    for row in bundle.get("rows") or []:
        rule = match_trend_rule(row.get("query", ""), row.get("trend_breakdown") or [])
        out.append(
            {
                "region": region_label,
                "query": row.get("query"),
                "search_volume": row.get("search_volume"),
                "increase_percentage": row.get("increase_percentage"),
                "categories": row.get("categories") or [],
                "breakdown": row.get("trend_breakdown") or [],
                "broadband_relevant": bool(rule),
                "theme_id": rule["id"] if rule else None,
                "theme": rule["theme"] if rule else None,
            }
        )
    return out


def build_trending_recommendations(
    matched: list[dict[str, Any]],
    serp_by_query: dict[str, dict[str, Any]],
    coverage: dict[str, list[str]],
    gta_interest: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    by_id: dict[str, dict[str, Any]] = {}
    for row in matched:
        if not row.get("theme_id"):
            continue
        bucket = by_id.setdefault(
            row["theme_id"],
            {"rule": next(r for r in TREND_THEME_RULES if r["id"] == row["theme_id"]), "trends": []},
        )
        bucket["trends"].append(row)

    recs = []
    for theme_id, bucket in by_id.items():
        rule = bucket["rule"]
        probes = []
        for query in rule["primary_queries"]:
            hit = serp_by_query.get(query.lower().strip())
            if hit:
                probes.append(hit)
        has_ai = [p for p in probes if p.get("has_ai_overview")]
        cited = [p for p in has_ai if p.get("bp_in_ai_overview")]
        organic_ranks = [p.get("bp_organic_rank") for p in probes if p.get("bp_organic_rank")]
        paa: list[str] = []
        related: list[str] = []
        for probe in probes:
            paa.extend(probe.get("people_also_ask") or [])
            related.extend(probe.get("related_searches") or [])
        existing = list(dict.fromkeys(rule["existing"] + coverage.get(rule["cluster"], [])))[:8]
        if organic_ranks and min(organic_ranks) <= 5:
            record_type = "refresh"
            url = rule["refresh_url"]
        elif rule["action"] == "refresh":
            record_type = "refresh"
            url = rule["refresh_url"]
        else:
            record_type = "new-page"
            url = rule["proposed_url"]
        recs.append(
            {
                "theme_id": theme_id,
                "record_type": record_type,
                "working_title": rule["working_title"],
                "recommended_url": url,
                "refresh_url": rule["refresh_url"],
                "cluster": rule["cluster"],
                "theme": rule["theme"],
                "geo_block": rule["geo_block"],
                "primary_queries": rule["primary_queries"],
                "trigger_trends": [
                    {
                        "region": t["region"],
                        "query": t["query"],
                        "search_volume": t["search_volume"],
                        "increase_percentage": t["increase_percentage"],
                    }
                    for t in bucket["trends"][:6]
                ],
                "existing_coverage": existing,
                "ai_overview_signal": (
                    f"AI Overview on {len(has_ai)}/{len(probes)} UK probes"
                    if probes
                    else "not measured this run"
                ),
                "bp_cited": "yes" if cited else ("no" if has_ai else "n/a"),
                "bp_best_organic_rank": min(organic_ranks) if organic_ranks else None,
                "paa_to_answer": list(dict.fromkeys(paa))[:8],
                "related_prompts": list(dict.fromkeys(related))[:8],
                "seo_notes": [
                    "Write for the broadband job, not the celebrity or scorecard.",
                    "Do not invent GTA 6 file sizes, hardware specs or required Mbps.",
                    "Use British English, answer-first excerpts, sourced claims and a FAQ drawn from People Also Ask.",
                ],
                "geo_notes": [
                    "Lead with a citeable 40 to 80 word answer that an AI Overview can quote.",
                    "Name the Ofcom or provider source next to any speed, coverage or rights claim.",
                    "Keep the same facts in the mobile DOM; do not hide the answer behind a table.",
                ],
                "gta_interest": gta_interest if theme_id == "gaming-online" else [],
            }
        )
    recs.sort(key=lambda item: (0 if item["theme_id"] == "gaming-online" else 1, item["working_title"]))
    return recs


def render_trending_markdown(payload: dict[str, Any]) -> str:
    lines = [
        "# Trending topics content plan (SEO and GEO)",
        "",
        f"Generated: {payload['generated_at'][:10]}",
        "",
        "This plan maps live Google Trends (UK and a worldwide English-language proxy) onto BroadbandPicker jobs: comparing UK broadband, ping, streaming, Wi-Fi and switching. Trends without a genuine broadband task are listed then discarded.",
        "",
        "## How to use this",
        "",
        "- Refresh an existing guide when we already cover the job.",
        "- Add a new URL only when UK SERP probes show a distinct query and we are not already on page one.",
        "- Do not build doorway pages that only wrap a meme, transfer rumour or match score.",
        "",
        "## Research snapshot",
        "",
        f"- SerpApi mode: **{payload['serp_meta'].get('mode')}** ({payload['serp_meta'].get('queries_run', 0)} calls, {payload['serp_meta'].get('searches_left')} left)",
        f"- UK trending rows: **{payload['counts']['uk']}**; worldwide-proxy rows: **{payload['counts']['worldwide_proxy']}**",
        f"- Rows with a broadband theme: **{payload['counts']['relevant']}**",
        "",
        "## UK trending searches (mapped or skipped)",
        "",
        "| Trend | Volume | Change | Categories | Broadband theme |",
        "| --- | ---: | ---: | --- | --- |",
    ]
    for row in payload["uk_trends"][:25]:
        lines.append(
            f"| {row['query']} | {row.get('search_volume') or '—'} | "
            f"{row.get('increase_percentage') if row.get('increase_percentage') is not None else '—'}% | "
            f"{', '.join(row.get('categories') or []) or '—'} | "
            f"{row.get('theme_id') or 'skip'} |"
        )
    lines += [
        "",
        "## Worldwide proxy trending searches (US, 7 days)",
        "",
        "| Trend | Volume | Change | Broadband theme |",
        "| --- | ---: | ---: | --- |",
    ]
    for row in payload["worldwide_trends"][:20]:
        lines.append(
            f"| {row['query']} | {row.get('search_volume') or '—'} | "
            f"{row.get('increase_percentage') if row.get('increase_percentage') is not None else '—'}% | "
            f"{row.get('theme_id') or 'skip'} |"
        )
    if payload.get("gta_interest"):
        lines += ["", "## GTA 6 search interest (Google Trends, last 7 days)", ""]
        for row in payload["gta_interest"]:
            lines.append(
                f"- {row['geo']}: latest {row.get('latest')}, peak {row.get('peak')}, "
                f"average {row.get('average')} (0-100 interest, {row.get('points')} points)"
            )
    lines += ["", "## Recommended content", ""]
    if not payload["recommendations"]:
        lines.append("No mapped broadband jobs from this trend window.")
    for i, rec in enumerate(payload["recommendations"], 1):
        triggers = ", ".join(
            f"{t['query']} ({t['region']})" for t in rec.get("trigger_trends") or []
        ) or "—"
        lines += [
            f"### {i}. [{rec['record_type']}] {rec['working_title']}",
            "",
            f"- URL: `{rec['recommended_url']}` (refresh base: `{rec['refresh_url']}`)",
            f"- Why now: {rec['theme']}",
            f"- Trigger trends: {triggers}",
            f"- UK AI Overview: {rec['ai_overview_signal']}; BroadbandPicker cited: {rec['bp_cited']}; best organic rank: {rec['bp_best_organic_rank'] or 'not on first page of probes'}",
            f"- Primary queries: {', '.join(rec['primary_queries'])}",
            f"- People Also Ask: {', '.join(rec['paa_to_answer']) or '—'}",
            f"- Related prompts: {', '.join(rec['related_prompts']) or '—'}",
            f"- Existing coverage: {', '.join(rec['existing_coverage']) or 'none'}",
            f"- GEO answer to publish: {rec['geo_block']}",
            "",
            "SEO: " + " ".join(rec["seo_notes"]),
            "",
            "GEO: " + " ".join(rec["geo_notes"]),
            "",
        ]
    lines += [
        "## Editorial constraints",
        "",
        "- British English. No em dashes. No invented prices, ping figures, file sizes or ratings.",
        "- Affiliate CTAs stay after the answer, never instead of it.",
        "- Thin trend round-ups fail AdSense and Search quality rules; every page must complete a comparison or explainer job.",
        "",
    ]
    return "\n".join(lines) + "\n"


def run_trending(args: argparse.Namespace) -> dict[str, Any]:
    key = env_key("SERPAPI_API_KEY")
    coverage = existing_content()
    meta: dict[str, Any] = {"mode": "none", "queries_run": 0, "searches_left": None}
    uk_bundle: dict[str, Any] = {"geo": "GB", "hours": 168, "rows": []}
    us_bundle: dict[str, Any] = {"geo": "US", "hours": 168, "rows": []}
    gta_interest: list[dict[str, Any]] = []
    serp_by_query: dict[str, dict[str, Any]] = {}

    if not args.run_serp:
        print("Pass --run-serp to fetch Google Trends and UK SERP probes.", file=sys.stderr)
    elif not key:
        print("SERPAPI_API_KEY not set; cannot fetch live trends.", file=sys.stderr)
    else:
        quota = serp_quota(key)
        left = int(quota.get("total_searches_left", 0))
        print(f"SerpApi plan: {quota.get('plan_name')}, searches left: {left}")
        planned = 2 + 2 + min(8, args.serp_limit)
        if left < 4:
            print("Need at least 4 SerpApi searches for UK + worldwide trends.", file=sys.stderr)
            sys.exit(1)
        used = 0

        def spend(label: str, fn: Any) -> Any:
            nonlocal used
            print(f"  [{used + 1}] {label}")
            result = fn()
            used += 1
            time.sleep(1.0)
            return result

        uk_bundle = spend("trending now GB 7d", lambda: fetch_trending_now(key, "GB", 168))
        us_bundle = spend("trending now US 7d (worldwide proxy)", lambda: fetch_trending_now(key, "US", 168))
        try:
            gta_interest.append(spend("Google Trends GTA 6 GB", lambda: fetch_google_trends_interest(key, "GTA 6", "GB")))
            gta_interest.append(spend("Google Trends GTA 6 worldwide", lambda: fetch_google_trends_interest(key, "GTA 6", None)))
        except Exception as exc:  # noqa: BLE001
            print(f"    GTA 6 interest skipped: {exc}", file=sys.stderr)

        uk_rows = summarise_trending_rows(uk_bundle, "UK")
        us_rows = summarise_trending_rows(us_bundle, "worldwide-proxy")
        needed_queries: list[str] = []
        for row in uk_rows + us_rows:
            rule = next((item for item in TREND_THEME_RULES if item["id"] == row.get("theme_id")), None)
            if not rule:
                continue
            for query in rule["primary_queries"]:
                if query not in needed_queries:
                    needed_queries.append(query)
        # Always probe the GTA / gaming set so the example theme is evidenced.
        for query in TREND_THEME_RULES[0]["primary_queries"]:
            if query not in needed_queries:
                needed_queries.append(query)
        remaining = max(0, args.serp_limit - used)
        probes = needed_queries[:remaining]
        if left - used < len(probes):
            probes = probes[: max(0, left - used - 1)]
        for query in probes:
            try:
                serp_by_query[query.lower().strip()] = spend(f"UK SERP {query}", lambda q=query: serp_search(key, q))
            except Exception as exc:  # noqa: BLE001
                print(f"    ERROR {query}: {exc}", file=sys.stderr)
        after = int(serp_quota(key).get("total_searches_left", left))
        meta = {
            "mode": "live",
            "queries_run": used,
            "searches_used": left - after,
            "searches_left": after,
            "plan_name": quota.get("plan_name"),
        }
        print(f"SerpApi searches used: {left - after}; left: {after}")

    uk_rows = summarise_trending_rows(uk_bundle, "UK")
    us_rows = summarise_trending_rows(us_bundle, "worldwide-proxy")
    matched = [row for row in uk_rows + us_rows if row.get("broadband_relevant")]
    recommendations = build_trending_recommendations(matched, serp_by_query, coverage, gta_interest)

    return {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "serp_meta": meta,
        "counts": {
            "uk": len(uk_rows),
            "worldwide_proxy": len(us_rows),
            "relevant": len(matched),
        },
        "uk_trends": uk_rows,
        "worldwide_trends": us_rows,
        "gta_interest": gta_interest,
        "recommendations": recommendations,
        "skipped_examples": [row["query"] for row in uk_rows if not row.get("broadband_relevant")][:12],
    }


def emit_trending(payload: dict[str, Any], args: argparse.Namespace) -> None:
    stamp = datetime.now(timezone.utc).date().isoformat()
    json_path = args.json or (SERP_CACHE_DIR / f"{stamp}-trending-content-plan.json")
    md_path = args.markdown or (SERP_CACHE_DIR / f"{stamp}-trending-content-plan.md")
    SERP_CACHE_DIR.mkdir(parents=True, exist_ok=True)
    json_path.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    md_path.write_text(render_trending_markdown(payload), encoding="utf-8")
    TRENDING_PLAN_CANONICAL.parent.mkdir(parents=True, exist_ok=True)
    TRENDING_PLAN_CANONICAL.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Saved {json_path}")
    print(f"Saved {md_path}")
    print(f"Saved {TRENDING_PLAN_CANONICAL}")
    print("\nMapped recommendations:")
    if not payload["recommendations"]:
        print("  none this window")
    for rec in payload["recommendations"]:
        print(f"  [{rec['record_type']}] {rec['recommended_url']}  ({rec['theme_id']})")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def run(args: argparse.Namespace) -> dict[str, Any]:
    client = GoogleClient(args.credentials)
    current_end = date.today() - timedelta(days=3)
    current_start = current_end - timedelta(days=args.days - 1)
    previous_end = current_start - timedelta(days=1)
    previous_start = previous_end - timedelta(days=args.days - 1)

    print(f"GSC window {current_start}..{current_end} vs {previous_start}..{previous_end}")
    query_rows = gsc_query(client, current_start, current_end, ["query"])
    prev_query_rows = gsc_query(client, previous_start, previous_end, ["query"])

    # Property-level totals: query-dimension rows undercount clicks badly because
    # Search Console withholds low-volume queries, so headline numbers come from
    # the date dimension instead.
    def window_totals(start: date, end: date) -> dict[str, float]:
        acc = {"clicks": 0.0, "impressions": 0.0}
        for row in gsc_query(client, start, end, ["date"]):
            acc["clicks"] += float(row.get("clicks", 0))
            acc["impressions"] += float(row.get("impressions", 0))
        return acc

    totals_current = window_totals(current_start, current_end)
    totals_previous = window_totals(previous_start, previous_end)
    try:
        appearance_rows = gsc_query(client, current_start, current_end, ["searchAppearance"])
    except Exception as exc:  # noqa: BLE001
        print(f"searchAppearance query skipped: {exc}", file=sys.stderr)
        appearance_rows = []

    # GA4 AI-referral visits by landing page (minimum count).
    ai_referral = 0.0
    try:
        for row in ga4_report(
            client, current_start, current_end,
            ["landingPagePlusQueryString", "eventName"], ["eventCount"],
            {"filter": {"fieldName": "eventName", "stringFilter": {"value": "ai_referral_visit"}}},
        ):
            ai_referral += row["metrics"][0]
    except Exception as exc:  # noqa: BLE001
        print(f"GA4 ai_referral_visit query skipped: {exc}", file=sys.stderr)

    clusters = build_clusters(query_rows, prev_query_rows, prev_query_rows)
    awin = load_awin()
    live_brands = load_live_brands()
    coverage = existing_content()

    eligible = [c for c in clusters.values() if c.impressions >= CLUSTER_IMPRESSION_FLOOR]
    max_impr = max((c.impressions for c in eligible), default=1.0)
    max_delta = max((max(0.0, c.impressions - c.prev_impressions) for c in eligible), default=1.0)
    ranked = sorted(
        ((c, growth_score(c, max_impr, max_delta)) for c in eligible),
        key=lambda pair: pair[1], reverse=True,
    )[: args.top_clusters]

    serp_cache: dict[str, dict[str, Any]] = {}
    cache_files: list[str] = []
    for cache_path in all_serp_caches():
        try:
            rows = load_cached_serp(cache_path)
        except (OSError, json.JSONDecodeError, KeyError) as exc:
            print(f"Could not read SERP cache {cache_path}: {exc}", file=sys.stderr)
            continue
        serp_cache.update(rows)
        cache_files.append(cache_path.name)
    if serp_cache:
        print(f"Loaded {len(serp_cache)} cached SERP rows from {len(cache_files)} file(s)")
    cluster_serp, serp_meta = enrich_clusters_with_serp(
        ranked, serp_cache, run_live=args.run_serp, serp_limit=args.serp_limit
    )
    serp_meta.setdefault("cache_files", cache_files)

    recommendations, league = build_recommendations(
        clusters, args.top_clusters, cluster_serp, awin, live_brands, coverage
    )

    total_impr = totals_current["impressions"]
    prev_total_impr = totals_previous["impressions"]
    total_clicks = totals_current["clicks"]
    prev_total_clicks = totals_previous["clicks"]
    classified_impr = sum(c.impressions for c in clusters.values())
    conv_impr = sum(q.impressions for c in clusters.values() for q in c.queries if q.conversational)
    prev_conv = 0.0
    prev_classified = 0.0
    for row in prev_query_rows:
        q = row["keys"][0]
        if suspicious_query(q):
            continue
        impr = float(row.get("impressions", 0))
        prev_classified += impr
        if classify_query(q)["conversational"]:
            prev_conv += impr
    # Share is measured against classified (query-dimension) impressions, which is
    # the only base the conversational count is drawn from.
    conv_share = conv_impr / classified_impr if classified_impr else 0.0
    prev_conv_share = prev_conv / prev_classified if prev_classified else 0.0

    payload = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "current_window": {"start": current_start.isoformat(), "end": current_end.isoformat()},
        "previous_window": {"start": previous_start.isoformat(), "end": previous_end.isoformat()},
        "summary": {
            "gsc_impressions": total_impr,
            "gsc_impression_change_pct": pct_change(total_impr, prev_total_impr) or 0.0,
            "gsc_clicks": total_clicks,
            "gsc_click_change_pct": pct_change(total_clicks, prev_total_clicks) or 0.0,
            "classified_impressions": round(classified_impr),
            "conversational_impression_share": round(conv_share, 4),
            "conversational_change_pp": round((conv_share - prev_conv_share) * 100, 1),
            "ai_referral_visits": ai_referral,
            "clusters_ranked": len(ranked),
            "clusters_total": len(clusters),
        },
        "serp_meta": serp_meta,
        "cluster_league": league,
        "cluster_serp": cluster_serp,
        "recommendations": [asdict(r) for r in recommendations],
        "search_appearance": [
            {
                "appearance": row.get("keys", ["unknown"])[0],
                "clicks": float(row.get("clicks") or 0),
                "impressions": float(row.get("impressions") or 0),
                "ctr": float(row.get("ctr") or 0),
                "position": float(row.get("position") or 0),
            }
            for row in appearance_rows
        ],
    }
    return payload


def emit(payload: dict[str, Any], args: argparse.Namespace) -> None:
    stamp = datetime.now(timezone.utc).date().isoformat()
    json_path = args.json or (SERP_CACHE_DIR / f"{stamp}-geo-growth-strategy.json")
    md_path = args.markdown or (SERP_CACHE_DIR / f"{stamp}-geo-growth-strategy.md")
    SERP_CACHE_DIR.mkdir(parents=True, exist_ok=True)
    json_path.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    md_path.write_text(render_markdown(payload), encoding="utf-8")
    write_canonical_strategy(payload)
    print(f"Saved {json_path}")
    print(f"Saved {md_path}")
    print(f"Saved {CANONICAL_STRATEGY}")

    print("\nTop clusters by growth:")
    for row in payload["cluster_league"][:8]:
        print(f"  {row['growth_score']:5.1f}  {row['cluster_label']:38} "
              f"{row['impressions']:>7,} impr  ({(row['impression_change_pct'] or 0):+.0f}%)")
    print("\nTop recommendations:")
    for rec in payload["recommendations"][:6]:
        print(f"  {rec['priority_score']:5.1f}  [{rec['record_type']:16}] {rec['recommended_url']}")

    if not args.skip_tracker:
        import subprocess

        print("\nRebuilding master tracker...")
        result = subprocess.run(
            [sys.executable, str(TRACKER_SCRIPT)], cwd=ROOT, capture_output=True, text=True
        )
        sys.stdout.write(result.stdout)
        if result.returncode != 0:
            sys.stderr.write(result.stderr)
            print("Master tracker rebuild failed; the strategy JSON is still written.", file=sys.stderr)


def main() -> int:
    parser = argparse.ArgumentParser(
        description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter
    )
    parser.add_argument("--credentials", type=Path, default=DEFAULT_CREDENTIALS)
    parser.add_argument("--days", type=int, default=28, help="Window length in days (default 28)")
    parser.add_argument("--top-clusters", type=int, default=12)
    parser.add_argument("--run-serp", action="store_true", help="Spend SerpApi quota (opt-in)")
    parser.add_argument("--serp-limit", type=int, default=15, help="Max SerpApi searches this run")
    parser.add_argument("--skip-tracker", action="store_true", help="Do not rebuild master-build-tracker.xlsx")
    parser.add_argument("--json", type=Path, help="Override the strategy JSON output path")
    parser.add_argument("--markdown", type=Path, help="Override the strategy Markdown output path")
    parser.add_argument("--report-only", type=Path, help="Re-render Markdown + canonical file from an existing JSON, no network")
    parser.add_argument(
        "--trending",
        action="store_true",
        help="Research UK and worldwide trending searches and write a broadband SEO/GEO content plan",
    )
    args = parser.parse_args()

    if args.report_only:
        payload = json.loads(args.report_only.read_text(encoding="utf-8"))
        md_path = args.markdown or args.report_only.with_suffix(".md")
        if payload.get("recommendations") and "uk_trends" in payload:
            md_path.write_text(render_trending_markdown(payload), encoding="utf-8")
            TRENDING_PLAN_CANONICAL.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
        else:
            md_path.write_text(render_markdown(payload), encoding="utf-8")
            write_canonical_strategy(payload)
        print(f"Saved {md_path}")
        return 0

    if args.trending:
        payload = run_trending(args)
        emit_trending(payload, args)
        return 0

    if not args.credentials.is_file():
        print(f"Credential file not found: {args.credentials}", file=sys.stderr)
        return 2

    payload = run(args)
    emit(payload, args)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
