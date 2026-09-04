#!/usr/bin/env python3
"""Page-type UX benchmark for BroadbandPicker: what is winning, why, and the UX gap.

This script no longer starts from a hand-picked list of competitors. It starts
from real data and works outward:

1. Pull Search Console (last 28 days vs the prior 28) by page and by page+query.
2. Work out which page TYPES are actually pulling their weight -- carrying
   impressions, improving average position, earning the clicks, and/or getting
   cited in AI answers. Those are the "winning" types.
3. For the real queries those winning pages rank for, pull Google UK organic
   results and AI Overviews from SerpApi.
4. Rank the competitor URLs that dominate those SERPs. With no paid backlink
   API wired, "authority" is a proxy: how many of our queries the URL ranks
   top-10 / top-3 for (ranking ubiquity), how often its domain is cited in an
   AI Overview, and a hand-maintained domain-authority tier. Labelled as a
   proxy everywhere it is used.
5. Scrape the UX feature set of our winning pages and of the top competitor
   pages for the same topic.
6. Write a prioritised UX recommendation set for the matching pages on our
   site, each backed by the GSC trend and the competitor feature prevalence.
7. Separately, run a curated affiliate-site functionality benchmark: a direct
   scrape of popular UK broadband affiliate/comparison sites (independent of
   query rank) checked for filters, compare baskets, price alerts, quizzes,
   live chat, trust badges and the like, matched against our own key page
   templates -- regardless of whether that template is a current GSC winner.

Outputs (docs/home page UX/):
- page-type-ux-scan.json                     full machine-readable scan
- page-category-ux-ctr-plan.md               the readable CTR/GEO brief
- competitor-ux-benchmark.md                 per-type feature matrix (ours vs the winners)
- affiliate-ux-functionality-benchmark.md    filters/alerts/quiz/chat/etc. gap list

Usage:
    python3 scripts/analyze_page_type_ux.py                  # full refresh
    python3 scripts/analyze_page_type_ux.py --serp-limit 15  # cheaper SERP run
    python3 scripts/analyze_page_type_ux.py --no-serp        # GSC + cached SERP
    python3 scripts/analyze_page_type_ux.py --no-functionality  # skip affiliate scrape
    python3 scripts/analyze_page_type_ux.py --skip-web       # no network at all
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
import time
from collections import Counter, defaultdict
from dataclasses import asdict, dataclass, field
from datetime import date, datetime, timedelta, timezone
from html.parser import HTMLParser
from pathlib import Path
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.parse import quote, urlsplit
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "docs" / "home page UX"
SERP_CACHE_DIR = ROOT / "docs" / "geo-serp-research"
SITE = "https://broadbandpicker.co.uk"
GSC_SITE = "sc-domain:broadbandpicker.co.uk"
GA4_PROPERTY = "551202232"
DEFAULT_CREDENTIALS = Path("/Users/sahilrafiqsayed/broadbandpicker-ga4-credentials.json")

GSC_BASE = "https://www.googleapis.com/webmasters/v3"
GA_BASE = "https://analyticsdata.googleapis.com/v1beta"
SCOPES = [
    "https://www.googleapis.com/auth/webmasters.readonly",
    "https://www.googleapis.com/auth/analytics.readonly",
]

# Big comparison sites (Akamai/Cloudflare) block obvious bots. A normal
# desktop Chrome string gets us Uswitch, broadband.co.uk, Which, Ofcom,
# Openreach, choose.co.uk. MSE / MoneySuperMarket / CompareTheMarket still
# 403 -- for those we fall back to the SerpApi title/snippet only.
USER_AGENT = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36"
)

# Never treated as a competitor page or an AI citation target.
JUNK_DOMAINS = {
    "google.com", "www.google.com", "translate.google.com", "webcache.googleusercontent.com",
    "youtube.com", "www.youtube.com", "m.youtube.com",
    "facebook.com", "www.facebook.com", "m.facebook.com",
    "twitter.com", "x.com", "instagram.com", "linkedin.com", "www.linkedin.com",
    "tiktok.com", "www.tiktok.com", "pinterest.com", "serpapi.com",
    "bing.com", "duckduckgo.com",
}


def is_junk_domain(domain: str) -> bool:
    d = (domain or "").lower().lstrip("www.")
    if not d or d in JUNK_DOMAINS or "google.com" in d:
        return True
    return d.startswith(("staging.", "www-staging.", "dev.", "test.")) or ".staging." in d
NOW = datetime.now(timezone.utc)
MONTH_YEAR = NOW.strftime("%B %Y")
CURRENT_MONTH = NOW.strftime("%B")

MONTHS = (
    "january", "february", "march", "april", "may", "june",
    "july", "august", "september", "october", "november", "december",
)

# How many days of GSC data to trust as final, and the comparison window.
GSC_LAG_DAYS = 3
GSC_WINDOW_DAYS = 28

# ---------------------------------------------------------------------------
# Page-type model
# ---------------------------------------------------------------------------

TYPE_META: dict[str, dict[str, Any]] = {
    "homepage": {
        "label": "Homepage",
        "fallback_queries": ["compare broadband deals", "broadband deals in my area"],
        "fallback_competitors": [
            ("MoneySavingExpert compare deals", "https://www.moneysavingexpert.com/compare-broadband-deals/"),
            ("Uswitch broadband hub", "https://www.uswitch.com/broadband/"),
        ],
    },
    "deals_hub": {
        "label": "Deals hub",
        "fallback_queries": ["cheap broadband deals UK", "cheapest full fibre broadband UK"],
        "fallback_competitors": [
            ("MoneySavingExpert compare deals", "https://www.moneysavingexpert.com/compare-broadband-deals/"),
            ("Uswitch providers list", "https://www.uswitch.com/broadband/providers/"),
        ],
    },
    "provider_review": {
        "label": "Provider review",
        "fallback_queries": ["BT broadband review", "Connect Fibre reviews"],
        "fallback_competitors": [
            ("Uswitch BT review", "https://www.uswitch.com/broadband/reviews/bt/"),
            ("broadband.co.uk BT", "https://www.broadband.co.uk/broadband/providers/bt/"),
        ],
    },
    "provider_vs": {
        "label": "Provider vs provider",
        "fallback_queries": ["BT vs Sky broadband", "Virgin Media vs BT broadband"],
        "fallback_competitors": [
            ("broadband.co.uk BT vs Sky", "https://www.broadband.co.uk/broadband/help/bt-broadband-vs-sky-broadband"),
        ],
    },
    "provider_deals": {
        "label": "Provider deals page",
        "fallback_queries": ["BT broadband deals", "Sky broadband deals"],
        "fallback_competitors": [
            ("BT broadband deals", "https://www.bt.com/broadband/deals"),
        ],
    },
    "guide": {
        "label": "Editorial guide",
        "fallback_queries": ["how to switch broadband provider UK", "what broadband speed do I need"],
        "fallback_competitors": [
            ("Ofcom switching", "https://www.ofcom.org.uk/phones-and-broadband/switching-provider/switching-broadband-provider"),
            ("Uswitch speeds guide", "https://www.uswitch.com/broadband/guides/broadband-speeds/"),
        ],
    },
    "postcode": {
        "label": "Postcode and local",
        "fallback_queries": ["check broadband availability postcode", "broadband deals in my area"],
        "fallback_competitors": [
            ("Ofcom coverage checker", "https://checker.ofcom.org.uk/en-gb/broadband-coverage"),
            ("Uswitch postcode checker", "https://www.uswitch.com/broadband/postcode_checker/"),
        ],
    },
    "tool": {
        "label": "Interactive tool",
        "fallback_queries": ["internet speed test UK", "how much broadband speed do I need calculator"],
        "fallback_competitors": [
            ("Speedtest by Ookla", "https://www.speedtest.net/"),
            ("Uswitch speed test", "https://www.uswitch.com/broadband/speedtest/"),
        ],
    },
    "research": {
        "label": "Original research",
        "fallback_queries": ["best broadband for customer service UK", "broadband customer satisfaction UK"],
        "fallback_competitors": [
            ("Ofcom complaints data", "https://www.ofcom.org.uk/phones-and-broadband/service-quality/complaints-about-broadband-landline-mobile-and-pay-tv-services"),
        ],
    },
    "compare": {
        "label": "Compare tool",
        "fallback_queries": ["compare broadband providers"],
        "fallback_competitors": [
            ("Uswitch compare", "https://www.uswitch.com/broadband/"),
        ],
    },
    "trust": {
        "label": "Trust and methodology",
        "fallback_queries": [],
        "fallback_competitors": [
            ("Uswitch about", "https://www.uswitch.com/about-us/"),
        ],
    },
    "other": {"label": "Other", "fallback_queries": [], "fallback_competitors": []},
}

# Hand-maintained domain-authority tiers. This is the backlink/popularity
# proxy -- not a link-graph measurement. Weight feeds popularity_score.
AUTHORITY_TIERS: list[tuple[str, int, tuple[str, ...]]] = [
    ("regulator/gov", 4, ("ofcom.org.uk", "gov.uk", "citizensadvice.org.uk", "openreach.com", "openreach.co.uk")),
    ("major comparison", 3, (
        "uswitch.com", "moneysavingexpert.com", "moneysupermarket.com", "comparethemarket.com",
        "confused.com", "broadbandchoices.co.uk", "broadband.co.uk", "cable.co.uk", "choose.co.uk",
        "which.co.uk", "usave.co.uk", "moneytothemasses.com",
    )),
    ("major provider", 2, (
        "bt.com", "sky.com", "virginmedia.com", "ee.co.uk", "vodafone.co.uk", "plus.net",
        "talktalk.co.uk", "nowtv.com", "hyperoptic.com", "community-fibre.co.uk",
    )),
    ("big media", 2, (
        "techradar.com", "tomsguide.com", "expertreviews.co.uk", "trustedreviews.com",
        "theguardian.com", "which.co.uk", "pcmag.com", "cnet.com",
    )),
    ("forum/ugc", 1, ("reddit.com", "quora.com", "trustpilot.com", "moneysavingexpert.com/forum")),
]


def domain_tier(domain: str) -> tuple[str, int]:
    d = domain.lower().lstrip("www.")
    for label, weight, members in AUTHORITY_TIERS:
        if any(d == m or d.endswith("." + m) or m in d for m in members):
            return label, weight
    return "other", 0


def classify_page_type(path: str) -> str:
    p = (path or "/").split("?")[0].split("#")[0].rstrip("/") or "/"
    if p == "/":
        return "homepage"
    if p == "/deals" or p.startswith("/deals/"):
        return "deals_hub"
    if p.startswith("/providers/compare"):
        return "provider_vs"
    if re.match(r"^/providers/[^/]+/deals$", p):
        return "provider_deals"
    if p == "/providers":
        return "compare"
    if p.startswith("/providers/"):
        return "provider_review"
    if p == "/postcode":
        return "postcode"
    if p.startswith("/postcode/"):
        return "postcode"
    if p in ("/guides", "/broadband-glossary"):
        return "guide"
    if p.startswith("/guides/"):
        return "guide"
    if p.startswith("/research/"):
        return "research"
    if p == "/speed-test" or p.startswith("/tools/"):
        return "tool"
    if p == "/compare":
        return "compare"
    if p in (
        "/about", "/how-we-make-money", "/how-we-review-broadband",
        "/editorial-policy", "/contact", "/privacy-policy", "/terms",
        "/cookie-policy",
    ):
        return "trust"
    return "other"


# ---------------------------------------------------------------------------
# Google APIs (Search Console + GA4), service-account auth
# ---------------------------------------------------------------------------

class GoogleClient:
    def __init__(self, credentials_path: Path) -> None:
        from google.auth.transport.requests import Request as GoogleRequest
        from google.oauth2 import service_account

        self._Request = GoogleRequest
        self.credentials = service_account.Credentials.from_service_account_file(
            str(credentials_path), scopes=SCOPES
        )

    def request(self, method: str, url: str, payload: dict | None = None) -> dict:
        import urllib.request as _rq

        if not self.credentials.valid:
            self.credentials.refresh(self._Request())
        body = None if payload is None else json.dumps(payload).encode("utf-8")
        req = _rq.Request(
            url, data=body, method=method,
            headers={
                "Authorization": f"Bearer {self.credentials.token}",
                "Content-Type": "application/json",
            },
        )
        try:
            with _rq.urlopen(req, timeout=60) as response:
                raw = response.read().decode("utf-8")
                return json.loads(raw) if raw else {}
        except HTTPError as exc:
            detail = exc.read().decode("utf-8", errors="replace")
            raise RuntimeError(f"Google API HTTP {exc.code}: {detail[:400]}") from exc


def gsc_query(client: GoogleClient, start: date, end: date, dimensions: list[str]) -> list[dict]:
    site = quote(GSC_SITE, safe="")
    response = client.request(
        "POST",
        f"{GSC_BASE}/sites/{site}/searchAnalytics/query",
        {
            "startDate": start.isoformat(),
            "endDate": end.isoformat(),
            "type": "web",
            "dimensions": dimensions,
            "dataState": "final",
            "rowLimit": 25000,
            "aggregationType": "auto",
        },
    )
    return response.get("rows", [])


def path_of(url_or_path: str) -> str:
    if not url_or_path:
        return "/"
    try:
        parsed = urlsplit(url_or_path if "://" in url_or_path else f"{SITE}{url_or_path}")
        path = parsed.path or "/"
    except ValueError:
        path = url_or_path.split("?", 1)[0] or "/"
    return path.rstrip("/") or "/"


@dataclass
class PageStat:
    path: str
    page_type: str
    clicks: float = 0.0
    impressions: float = 0.0
    ctr: float = 0.0
    position: float = 0.0
    prev_clicks: float = 0.0
    prev_impressions: float = 0.0
    prev_position: float = 0.0
    click_change: float = 0.0
    impression_change: float = 0.0
    position_change: float = 0.0  # negative = improved (moved up)
    ai_referral: float = 0.0
    organic_sessions: float = 0.0
    top_queries: list[dict[str, Any]] = field(default_factory=list)


def build_page_stats(
    cur_rows: list[dict], prev_rows: list[dict],
    pq_rows: list[dict],
    ai_by_page: dict[str, float], sessions_by_page: dict[str, float],
) -> dict[str, PageStat]:
    prev = {path_of(r["keys"][0]): r for r in prev_rows}
    pq: dict[str, list[dict]] = defaultdict(list)
    for r in pq_rows:
        page, query = r["keys"]
        pq[path_of(page)].append({
            "query": query,
            "clicks": r.get("clicks", 0.0),
            "impressions": r.get("impressions", 0.0),
            "position": r.get("position", 0.0),
        })

    stats: dict[str, PageStat] = {}
    for r in cur_rows:
        p = path_of(r["keys"][0])
        pr = prev.get(p, {})
        s = PageStat(path=p, page_type=classify_page_type(p))
        s.clicks = r.get("clicks", 0.0)
        s.impressions = r.get("impressions", 0.0)
        s.ctr = r.get("ctr", 0.0)
        s.position = r.get("position", 0.0)
        s.prev_clicks = pr.get("clicks", 0.0)
        s.prev_impressions = pr.get("impressions", 0.0)
        s.prev_position = pr.get("position", 0.0)
        s.click_change = s.clicks - s.prev_clicks
        s.impression_change = s.impressions - s.prev_impressions
        s.position_change = (s.position - s.prev_position) if s.prev_position else 0.0
        s.ai_referral = ai_by_page.get(p, 0.0)
        s.organic_sessions = sessions_by_page.get(p, 0.0)
        s.top_queries = sorted(
            pq.get(p, []), key=lambda q: q["impressions"], reverse=True
        )[:12]
        stats[p] = s
    return stats


def aggregate_by_type(stats: dict[str, PageStat]) -> dict[str, dict[str, Any]]:
    agg: dict[str, dict[str, Any]] = {}
    for s in stats.values():
        a = agg.setdefault(s.page_type, {
            "page_type": s.page_type,
            "label": TYPE_META.get(s.page_type, {}).get("label", s.page_type),
            "pages": 0, "indexed_pages": 0,
            "clicks": 0.0, "impressions": 0.0,
            "prev_clicks": 0.0, "prev_impressions": 0.0,
            "ai_referral": 0.0, "organic_sessions": 0.0,
            "_pos_weight": 0.0, "_pos_num": 0.0,
            "_prevpos_weight": 0.0, "_prevpos_num": 0.0,
            "improving_pages": 0, "declining_pages": 0, "new_pages": 0,
        })
        a["pages"] += 1
        if s.impressions > 0 and s.prev_impressions == 0:
            a["new_pages"] += 1
        if s.impressions > 0:
            a["indexed_pages"] += 1
        a["clicks"] += s.clicks
        a["impressions"] += s.impressions
        a["prev_clicks"] += s.prev_clicks
        a["prev_impressions"] += s.prev_impressions
        a["ai_referral"] += s.ai_referral
        a["organic_sessions"] += s.organic_sessions
        if s.impressions and s.position:
            a["_pos_weight"] += s.impressions
            a["_pos_num"] += s.position * s.impressions
        if s.prev_impressions and s.prev_position:
            a["_prevpos_weight"] += s.prev_impressions
            a["_prevpos_num"] += s.prev_position * s.prev_impressions
        if s.prev_position and s.position:
            if s.position < s.prev_position - 0.5:
                a["improving_pages"] += 1
            elif s.position > s.prev_position + 0.5:
                a["declining_pages"] += 1

    for a in agg.values():
        a["avg_position"] = (a["_pos_num"] / a["_pos_weight"]) if a["_pos_weight"] else 0.0
        a["prev_avg_position"] = (a["_prevpos_num"] / a["_prevpos_weight"]) if a["_prevpos_weight"] else 0.0
        a["position_change"] = (
            a["avg_position"] - a["prev_avg_position"] if a["prev_avg_position"] else 0.0
        )
        a["ctr"] = (a["clicks"] / a["impressions"]) if a["impressions"] else 0.0
        a["impression_change_pct"] = (
            100.0 * (a["impressions"] - a["prev_impressions"]) / a["prev_impressions"]
            if a["prev_impressions"] else (100.0 if a["impressions"] else 0.0)
        )
        for k in ("_pos_weight", "_pos_num", "_prevpos_weight", "_prevpos_num"):
            a.pop(k, None)
    return agg


def pick_winning_types(agg: dict[str, dict[str, Any]], total_impr: float) -> list[str]:
    """Types that are carrying the site: real impression share, and either
    improving position, already near page 1, or getting AI referral."""
    scored: list[tuple[float, str]] = []
    for t, a in agg.items():
        if t in ("other", "trust"):
            continue
        if a["impressions"] < max(400.0, 0.004 * total_impr):
            continue
        impr_share = a["impressions"] / total_impr if total_impr else 0.0
        pos_gain = max(0.0, -a["position_change"])          # positive when improved
        near_page1 = 1.0 if 0 < a["avg_position"] <= 20 else 0.0
        clicks_signal = min(1.0, a["clicks"] / 20.0)
        ai_signal = min(1.0, a["ai_referral"] / 5.0)
        improve_ratio = (
            a["improving_pages"] / max(1, a["improving_pages"] + a["declining_pages"])
        )
        score = (
            impr_share * 4.0
            + pos_gain * 0.15
            + near_page1 * 1.0
            + clicks_signal * 1.5
            + ai_signal * 1.0
            + improve_ratio * 1.0
        )
        scored.append((score, t))
    scored.sort(reverse=True)
    return [t for _, t in scored[:8]]


# ---------------------------------------------------------------------------
# SerpApi
# ---------------------------------------------------------------------------

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


def serp_quota(key: str) -> dict[str, Any]:
    import requests

    r = requests.get("https://serpapi.com/account", params={"api_key": key}, timeout=20)
    r.raise_for_status()
    return r.json()


def serp_domain(link: str) -> str:
    return re.sub(r"^https?://(www\.)?", "", link or "").split("/")[0]


def resolve_ai_ref(ref: dict[str, Any]) -> dict[str, Any] | None:
    """Normalise one AI Overview reference to a real publisher domain.

    SerpApi often gives a google.com/goto redirect as `link` and the real
    publisher only in `source`. Drop junk, recover the publisher.
    """
    link = ref.get("link", "") or ""
    domain = serp_domain(link)
    source = (ref.get("source") or "").strip()
    if is_junk_domain(domain):
        if source and "." in source and " " not in source:
            domain, link = source.lower(), ""
        else:
            return None
    if is_junk_domain(domain):
        return None
    return {
        "title": ref.get("title"),
        "link": "" if link.startswith("https://www.google.com/") else link,
        "domain": domain.lower(),
        "source": source,
    }


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

    ai_refs: list[dict[str, Any]] = []
    for ref in (ai.get("references", []) or []):
        resolved = resolve_ai_ref(ref)
        if resolved:
            ai_refs.append(resolved)

    return {
        "query": query,
        "organic_top10": [
            {
                "rank": i + 1,
                "domain": serp_domain(o.get("link", "")),
                "title": o.get("title"),
                "link": o.get("link"),
            }
            for i, o in enumerate(organic[:10])
        ],
        "has_ai_overview": bool(ai),
        "ai_overview_needs_followup": bool(ai.get("page_token")),
        "ai_overview_text": ai_text[:2000],
        "ai_references": ai_refs,
        "bp_organic_rank": next(
            (o["rank"] for o in [
                {"rank": i + 1, "domain": serp_domain(x.get("link", ""))}
                for i, x in enumerate(organic[:10])
            ] if "broadbandpicker.co.uk" in o["domain"]),
            None,
        ),
        "bp_in_ai_overview": "broadbandpicker" in ai_text.lower()
        or any("broadbandpicker" in ( r["domain"] or "") for r in ai_refs),
        "people_also_ask": [q.get("question") for q in data.get("related_questions", []) or []],
    }


def run_serp(
    key: str, type_to_queries: dict[str, list[str]], limit: int,
) -> tuple[dict[str, dict[str, Any]], dict[str, Any]]:
    """Run the highest-value queries across all winning types, deduped."""
    ranked: list[tuple[float, str, str]] = []
    seen: set[str] = set()
    for t, queries in type_to_queries.items():
        for rank, q in enumerate(queries):
            ql = q.lower().strip()
            if ql in seen:
                continue
            seen.add(ql)
            ranked.append((rank, t, q))
    ranked.sort(key=lambda x: x[0])
    chosen = [(t, q) for _, t, q in ranked][:limit]

    quota_before = serp_quota(key)
    left = quota_before.get("total_searches_left", 0)
    print(f"SerpApi: {quota_before.get('plan_name')}, {left} searches left")
    if left < len(chosen):
        chosen = chosen[:max(0, left - 2)]
        print(f"  trimming to {len(chosen)} queries to stay within quota")

    results: dict[str, dict[str, Any]] = {}
    query_type: dict[str, str] = {}
    for i, (t, q) in enumerate(chosen, 1):
        print(f"  [{i}/{len(chosen)}] ({t}) {q}")
        try:
            res = serp_search(key, q)
            res["type"] = t
            results[q] = res
            query_type[q] = t
        except Exception as exc:  # noqa: BLE001
            print(f"    ERROR: {exc}", file=sys.stderr)
        time.sleep(1.0)

    quota_after = serp_quota(key)
    used = left - quota_after.get("total_searches_left", left)
    meta = {
        "ran_at": NOW.isoformat(timespec="seconds"),
        "queries": list(results.keys()),
        "query_type": query_type,
        "searches_used": used,
        "searches_left": quota_after.get("total_searches_left"),
    }
    print(f"SerpApi searches used: {used}; left: {meta['searches_left']}")
    return results, meta


def latest_serp_cache() -> Path | None:
    if not SERP_CACHE_DIR.exists():
        return None
    candidates = sorted(SERP_CACHE_DIR.glob("*-page-ux-raw.json"))
    if candidates:
        return candidates[-1]
    generic = sorted(SERP_CACHE_DIR.glob("*-raw.json"))
    return generic[-1] if generic else None


def load_serp_cache(path: Path) -> tuple[dict[str, dict[str, Any]], dict[str, Any]]:
    payload = json.loads(path.read_text(encoding="utf-8"))
    if "serp" in payload:
        serp = payload["serp"]
        for res in serp.values():
            cleaned = []
            for ref in res.get("ai_references", []) or []:
                fixed = resolve_ai_ref(ref)
                if fixed:
                    cleaned.append(fixed)
            res["ai_references"] = cleaned
        return serp, payload.get("serp_meta", {"source": str(path)})
    # legacy geo-serp-research raw file: list under "results"
    out: dict[str, dict[str, Any]] = {}
    for row in payload.get("results", []) or []:
        q = row.get("query")
        if not q:
            continue
        out[q] = {
            "query": q,
            "organic_top10": row.get("organic_top10", []),
            "has_ai_overview": row.get("has_ai_overview", False),
            "ai_overview_text": row.get("ai_overview_text", ""),
            "ai_references": row.get("ai_references", []),
            "bp_organic_rank": row.get("bp_organic_rank"),
            "bp_in_ai_overview": row.get("bp_in_ai_overview", False),
            "people_also_ask": row.get("people_also_ask", []),
            "type": None,
        }
    return out, {"source": str(path), "legacy": True}


# ---------------------------------------------------------------------------
# Competitor ranking (backlink / popularity proxy)
# ---------------------------------------------------------------------------

@dataclass
class CompetitorPage:
    url: str
    domain: str
    page_type: str
    tier: str
    tier_weight: int
    query_coverage: int = 0     # queries where this URL is in top 10
    top3_coverage: int = 0      # queries where rank <= 3
    best_rank: int = 99
    ai_citations: int = 0       # AI Overviews citing this URL
    ai_domain_citations: int = 0  # AI Overviews citing this domain (any URL)
    sample_titles: list[str] = field(default_factory=list)
    popularity_score: float = 0.0


def rank_competitors(
    serp: dict[str, dict[str, Any]],
    type_to_queries: dict[str, list[str]],
) -> dict[str, list[CompetitorPage]]:
    q_to_type: dict[str, str] = {}
    for t, qs in type_to_queries.items():
        for q in qs:
            q_to_type.setdefault(q.lower().strip(), t)
    for q, res in serp.items():
        if res.get("type"):
            q_to_type.setdefault(q.lower().strip(), res["type"])

    by_type: dict[str, dict[str, CompetitorPage]] = defaultdict(dict)
    ai_domain_by_type: dict[str, Counter] = defaultdict(Counter)

    for q, res in serp.items():
        t = q_to_type.get(q.lower().strip()) or res.get("type") or "other"
        for ref in res.get("ai_references", []) or []:
            d = (ref.get("domain") or "").lower()
            if d and "broadbandpicker" not in d and not is_junk_domain(d):
                ai_domain_by_type[t][d] += 1
        for o in res.get("organic_top10", []) or []:
            url = o.get("link") or ""
            dom = (o.get("domain") or serp_domain(url)).lower()
            if not url or "broadbandpicker" in dom or is_junk_domain(dom):
                continue
            key = url.split("?")[0].split("#")[0]
            cp = by_type[t].get(key)
            if cp is None:
                tier, w = domain_tier(dom)
                cp = CompetitorPage(url=key, domain=dom, page_type=t, tier=tier, tier_weight=w)
                by_type[t][key] = cp
            cp.query_coverage += 1
            rank = o.get("rank") or 99
            cp.best_rank = min(cp.best_rank, rank)
            if rank <= 3:
                cp.top3_coverage += 1
            if o.get("title") and o["title"] not in cp.sample_titles:
                cp.sample_titles.append(o["title"])
        for ref in res.get("ai_references", []) or []:
            url = (ref.get("link") or "").split("?")[0].split("#")[0]
            dom = (ref.get("domain") or "").lower()
            if not url or "broadbandpicker" in dom or is_junk_domain(dom):
                continue
            cp = by_type[t].get(url)
            if cp is None:
                tier, w = domain_tier(dom)
                cp = CompetitorPage(url=url, domain=dom, page_type=t, tier=tier, tier_weight=w)
                by_type[t][url] = cp
            cp.ai_citations += 1

    out: dict[str, list[CompetitorPage]] = {}
    for t, pages in by_type.items():
        for cp in pages.values():
            cp.ai_domain_citations = ai_domain_by_type[t].get(cp.domain, 0)
            cp.popularity_score = round(
                3.0 * cp.top3_coverage
                + 1.0 * cp.query_coverage
                + 2.0 * cp.ai_citations
                + 1.0 * cp.ai_domain_citations
                + 1.0 * cp.tier_weight
                + (2.0 if cp.best_rank == 1 else 0.0),
                2,
            )
        out[t] = sorted(pages.values(), key=lambda c: c.popularity_score, reverse=True)
    return out


# ---------------------------------------------------------------------------
# UX scrape
# ---------------------------------------------------------------------------

@dataclass
class PageScan:
    page_type: str
    side: str  # ours | competitor
    name: str
    url: str
    status: int | str = ""
    notes: str = ""
    title: str = ""
    meta_description: str = ""
    h1: str = ""
    title_len: int = 0
    meta_len: int = 0
    title_has_current_month: bool = False
    title_has_year: bool = False
    title_stale_month: bool = False
    word_count: int = 0
    h2_count: int = 0
    question_h2_count: int = 0
    table_count: int = 0
    form_count: int = 0
    has_postcode_input: bool = False
    has_faq: bool = False
    has_faq_schema: bool = False
    has_breadcrumb_schema: bool = False
    has_product_or_offer_schema: bool = False
    has_aggregaterating_schema: bool = False
    schema_type_count: int = 0
    jsonld_types: list[str] = field(default_factory=list)
    has_toc: bool = False
    has_sticky_signal: bool = False
    has_card_layout: bool = False
    has_badge_chip: bool = False
    has_rating: bool = False
    has_pros_cons: bool = False
    has_compare_table: bool = False
    has_related: bool = False
    has_updated_date: bool = False
    has_author_byline: bool = False
    has_named_author: bool = False
    has_concise_answer: bool = False
    has_calculator_widget: bool = False
    get_deal_cta_count: int = 0
    # Affiliate-site functionality inventory (not CTR-scored, benchmarked separately)
    is_bot_wall: bool = False
    has_sort_control: bool = False
    has_filter_controls: bool = False
    has_compare_basket: bool = False
    has_price_alert: bool = False
    has_live_chat: bool = False
    has_callback_request: bool = False
    has_urgency_countdown: bool = False
    has_video_content: bool = False
    has_quiz_or_wizard: bool = False
    has_existing_vs_new_customer: bool = False
    has_bundle_toggle: bool = False
    has_trust_badges: bool = False
    has_app_promo: bool = False
    has_postcode_autocomplete: bool = False
    has_methodology_link: bool = False
    has_deal_count_badge: bool = False
    has_speed_filter: bool = False
    has_save_or_shortlist: bool = False
    has_load_more_or_pagination: bool = False


class _TextExtractor(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.parts: list[str] = []
        self.title = ""
        self._in_title = False
        self._skip = False

    def handle_starttag(self, tag, attrs):
        if tag in {"script", "style", "noscript"}:
            self._skip = True
        if tag == "title":
            self._in_title = True

    def handle_endtag(self, tag):
        if tag in {"script", "style", "noscript"}:
            self._skip = False
        if tag == "title":
            self._in_title = False

    def handle_data(self, data):
        if self._skip:
            return
        text = data.strip()
        if not text:
            return
        if self._in_title:
            self.title += text
        self.parts.append(text)


def http_get(url: str, timeout: int = 18) -> dict[str, Any]:
    row: dict[str, Any] = {"url": url, "ok": False, "status": 0, "html": "", "error": ""}
    try:
        request = Request(
            url,
            headers={
                "User-Agent": USER_AGENT,
                "Accept": "text/html,application/xhtml+xml;q=0.9,*/*;q=0.8",
                "Accept-Language": "en-GB,en;q=0.9",
            },
            method="GET",
        )
        with urlopen(request, timeout=timeout) as response:
            raw = response.read()
            row["status"] = getattr(response, "status", 200)
            row["html"] = raw.decode("utf-8", errors="replace")
            row["ok"] = True
    except HTTPError as exc:
        row["status"] = exc.code
        row["error"] = f"HTTP {exc.code}"
    except (URLError, TimeoutError, OSError) as exc:
        row["error"] = str(exc)[:240]
    except Exception as exc:  # noqa: BLE001
        row["error"] = f"{type(exc).__name__}: {exc}"[:240]
    return row


def extract_meta(html: str, name: str) -> str:
    patterns = [
        rf'<meta[^>]+name=["\']{name}["\'][^>]+content=["\']([^"\']+)',
        rf'<meta[^>]+content=["\']([^"\']+)["\'][^>]+name=["\']{name}["\']',
        rf'<meta[^>]+property=["\']{name}["\'][^>]+content=["\']([^"\']+)',
        rf'<meta[^>]+content=["\']([^"\']+)["\'][^>]+property=["\']{name}["\']',
    ]
    for pattern in patterns:
        match = re.search(pattern, html, flags=re.I)
        if match:
            return re.sub(r"\s+", " ", match.group(1)).strip()
    return ""


def extract_h1(html: str) -> str:
    match = re.search(r"<h1[^>]*>(.*?)</h1>", html, flags=re.I | re.S)
    if not match:
        return ""
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", match.group(1))).strip()


def _collect_jsonld_types(node: Any, types: list[str]) -> None:
    """Walk a JSON-LD structure fully: a Product/Offer nested three levels
    inside an ItemList (our deal-list schema) is still a real Product/Offer
    for a competitor-feature check, not just the outer @type."""
    if isinstance(node, dict):
        raw = node.get("@type")
        if isinstance(raw, list):
            types.extend(str(t) for t in raw)
        elif raw:
            types.append(str(raw))
        for value in node.values():
            _collect_jsonld_types(value, types)
    elif isinstance(node, list):
        for item in node:
            _collect_jsonld_types(item, types)


def jsonld_types(html: str) -> list[str]:
    types: list[str] = []
    for block in re.findall(
        r'<script[^>]+type=["\']application/ld\+json["\'][^>]*>(.*?)</script>',
        html, flags=re.I | re.S,
    ):
        try:
            data = json.loads(block)
        except json.JSONDecodeError:
            continue
        _collect_jsonld_types(data, types)
    return sorted(set(types))


def scan_html(page_type: str, side: str, name: str, url: str, html: str, status: int) -> PageScan:
    scan = PageScan(page_type=page_type, side=side, name=name, url=url, status=status)
    parser = _TextExtractor()
    try:
        parser.feed(html)
        parser.close()
    except Exception:
        pass
    text = re.sub(r"\s+", " ", " ".join(parser.parts))
    lower = text.lower()
    raw_lower = html.lower()

    scan.title = (parser.title or extract_meta(html, "og:title"))[:180]
    scan.meta_description = extract_meta(html, "description")[:280]
    scan.h1 = extract_h1(html)[:160]
    scan.title_len = len(scan.title)
    scan.meta_len = len(scan.meta_description)
    title_l = scan.title.lower()
    scan.title_has_current_month = CURRENT_MONTH.lower() in title_l
    scan.title_has_year = str(NOW.year) in scan.title
    other_months = [m for m in MONTHS if m != CURRENT_MONTH.lower() and m in title_l]
    scan.title_stale_month = bool(other_months) and not scan.title_has_current_month

    scan.word_count = len(re.findall(r"\b[\w'-]+\b", text))
    h2s = re.findall(r"<h2[^>]*>(.*?)</h2>", html, flags=re.I | re.S)
    scan.h2_count = len(h2s)
    scan.question_h2_count = sum(1 for h in h2s if "?" in re.sub(r"<[^>]+>", "", h))
    scan.table_count = len(re.findall(r"<table\b", html, flags=re.I))
    scan.form_count = len(re.findall(r"<form\b", html, flags=re.I))

    scan.has_postcode_input = bool(
        re.search(r'name=["\'][^"\']*postcode', raw_lower)
        or re.search(r'placeholder=["\'][^"\']*postcode', raw_lower)
        or "enter your postcode" in lower
        or "enter a postcode" in lower
    )
    scan.jsonld_types = jsonld_types(html)
    types_l = {t.lower() for t in scan.jsonld_types}
    scan.schema_type_count = len(types_l)
    scan.has_faq_schema = "faqpage" in types_l
    # FAQPage schema requires matching visible content (Google's policy), so
    # treat it as sufficient evidence even if the heading avoids the word "FAQ".
    scan.has_faq = (
        scan.has_faq_schema
        or "frequently asked" in lower
        or bool(re.search(r"<h2[^>]*>[^<]*faq", raw_lower))
    )
    scan.has_breadcrumb_schema = "breadcrumblist" in types_l
    scan.has_product_or_offer_schema = bool(
        {"product", "offer", "aggregateoffer", "offercatalog"} & types_l
    )
    scan.has_aggregaterating_schema = "aggregaterating" in types_l

    scan.has_toc = (
        "on this page" in lower
        or "jump to" in lower
        or "in this guide" in lower
        or bool(re.search(r'class="[^"]*(table-of-contents|\btoc\b|jump-link)[^"]*"', raw_lower))
    )
    scan.has_sticky_signal = bool(re.search(r'class="[^"]*(sticky|is-stuck)[^"]*"', raw_lower))
    scan.has_card_layout = bool(
        re.search(r'class="[^"]*(deal-card|product-card|provider-card|result-card|\bcard\b|tile)[^"]*"', raw_lower)
    )
    scan.has_badge_chip = bool(
        re.search(r'class="[^"]*(badge|chip|pill|tag)[^"]*"', raw_lower)
    ) or any(
        token in lower
        for token in ("best value", "editor's pick", "editors pick", "most popular", "our pick", "top pick")
    )
    scan.has_rating = "trustscore" in lower or "out of 5" in lower or bool(
        re.search(r'\b\d(\.\d)?\s*/\s*5\b', lower)
    ) or bool(re.search(r'class="[^"]*(rating|stars)[^"]*"', raw_lower))
    scan.has_pros_cons = ("pros" in lower and "cons" in lower) or (
        "what we like" in lower and "what we" in lower
    )
    scan.has_compare_table = scan.table_count > 0 and sum(
        1 for kw in ("price", "speed", "contract", "download", "upload", "monthly") if kw in lower
    ) >= 3
    scan.has_related = bool(
        re.search(r"related (guides|articles|deals|providers|reads)", lower)
        or "you might also" in lower
        or "read next" in lower
        or "further reading" in lower
    )
    scan.has_updated_date = bool(
        re.search(r"(last updated|updated on|updated:|prices verified|reviewed|fact.checked)\b.{0,40}\d{4}", lower)
        or re.search(r"(updated|reviewed)\s+\d{1,2}\s+(" + "|".join(MONTHS) + r")", lower)
    )
    # A named individual ("Reviewed by Jane Smith") is a stronger E-E-A-T
    # signal than a team credit ("Reviewed by BroadbandPicker editorial
    # team"), but both are a real byline -- track both, gap-check the broader one.
    scan.has_named_author = bool(re.search(r'\bby\s+[A-Z][a-z]+\s+[A-Z][a-z]+', text))
    scan.has_author_byline = (
        scan.has_named_author
        or bool(re.search(r"(written by|reviewed by|fact.checked by|our expert)", lower))
        or bool(re.search(r'rel=["\']author["\']', raw_lower))
    )
    scan.has_concise_answer = bool(
        re.search(r"(key takeaway|in short|the short answer|short version|at a glance|quick answer|tl;?dr|our verdict|bottom line)", lower)
    ) or bool(re.search(r'class="[^"]*(answer-box|summary-box|key-info|snapshot|callout|takeaway)[^"]*"', raw_lower))
    scan.has_calculator_widget = bool(
        re.search(r'type=["\']range["\']', raw_lower)
        or (re.search(r'type=["\']number["\']', raw_lower) and "calculat" in lower)
        or "slider" in raw_lower and "calculat" in lower
    )
    scan.get_deal_cta_count = (
        len(re.findall(r"get deal", lower))
        + len(re.findall(r"see (this )?deal", lower))
        + len(re.findall(r"view deal", lower))
    )

    # --- affiliate-site functionality inventory ---
    scan.is_bot_wall = is_bot_wall_html(lower)
    scan.has_sort_control = bool(
        re.search(r"sort by\b", lower)
        or bool(re.search(r'(name|id|aria-label)=["\'][^"\']*sort', raw_lower))
    )
    scan.has_filter_controls = bool(
        re.search(r'class="[^"]*(filter-panel|filter-bar|filters?\b)[^"]*"', raw_lower)
        or re.search(r"filter (by|results)", lower)
        or bool(re.search(r'<fieldset[^>]*>[^<]{0,40}filter', raw_lower))
    )
    scan.has_compare_basket = bool(
        re.search(r"compare\s*\(\d+\)", lower)
        or re.search(r"add to compare", lower)
        or re.search(r"compare up to \d", lower)
        or re.search(r"(comparison shortlist|compare selected|compare your (finalists|shortlist))", lower)
        or bool(re.search(r"<input[^>]+type=[\"']checkbox[\"']", raw_lower) and "shortlist" in lower)
    )
    scan.has_price_alert = bool(
        re.search(r"(price alert|deal alert|notify me|email me (this|these) deal|tell me when)", lower)
    )
    scan.has_live_chat = bool(
        re.search(r"(intercom|drift\.com|livechatinc|tawk\.to|zendesk|salesforce.*chat|"
                   r"chat.?bot|live chat|chat with (us|an? (advisor|agent|expert)))", raw_lower)
    )
    scan.has_callback_request = bool(
        re.search(r"(request a callback|call me back|arrange a callback|callback request)", lower)
    )
    scan.has_urgency_countdown = bool(
        re.search(r'class="[^"]*(countdown|timer)[^"]*"', raw_lower)
        or re.search(r"(offer ends|deal ends|ends in \d|hurry|while stocks last|limited time)", lower)
    )
    scan.has_video_content = bool(
        re.search(r"<video\b", raw_lower)
        or re.search(r"(youtube\.com/embed|player\.vimeo\.com|wistia)", raw_lower)
    )
    scan.has_quiz_or_wizard = bool(
        re.search(r"(find (my|your) perfect|which broadband is right for you|"
                   r"help me (choose|find|decide)|take the quiz|step 1 of|question 1 of)", lower)
    )
    scan.has_existing_vs_new_customer = bool(
        re.search(r"(existing customer|new customer)s?\b", lower)
        and re.search(r"(existing customer|new customer)s?\b.{0,80}(existing customer|new customer)s?\b", lower)
    )
    scan.has_bundle_toggle = bool(
        re.search(r'role=["\']tab["\']', raw_lower)
        and re.search(r"(broadband\s*(\+|and)\s*tv|broadband only|broadband\s*(\+|and)\s*mobile)", lower)
    )
    scan.has_trust_badges = bool(
        re.search(r"(trustpilot|feefo|reviews\.io|which\?\s*recommended|as seen (in|on))", lower)
    )
    scan.has_app_promo = bool(
        re.search(r"(app store|google play|apple app store|play\.google\.com|apps\.apple\.com)", raw_lower)
    )
    # Note: autocomplete="postal-code" is just a browser autofill hint, not an
    # address-lookup feature -- only count a real datalist or address picker.
    scan.has_postcode_autocomplete = bool(
        (re.search(r"<datalist\b", raw_lower) and scan.has_postcode_input)
        or re.search(r"(select your address|choose your address|select your property|pick your address)", lower)
    )
    scan.has_methodology_link = bool(
        re.search(r"(how we (compare|rank|review|make money)|our methodology|editorial policy)", lower)
    )
    scan.has_deal_count_badge = bool(
        re.search(r"\b\d{1,4}\+?\s*(deals?|packages?|providers?|offers?)\b\s*(available|compared|found)?", lower)
    )
    scan.has_speed_filter = bool(
        re.search(r'type=["\']range["\']', raw_lower) and "mbps" in lower
    ) or bool(re.search(r"(speed:|min(imum)? speed)\b.{0,60}mbps", lower))
    scan.has_save_or_shortlist = bool(
        re.search(r'class="[^"]*(save|shortlist|favourite|favorite|wishlist)[^"]*"', raw_lower)
        or re.search(r"(save this deal|add to shortlist|save for later)", lower)
    )
    scan.has_load_more_or_pagination = bool(
        re.search(r"(load more|show more (deals|results)|view more)", lower)
        or re.search(r'class="[^"]*pagination[^"]*"', raw_lower)
        or bool(re.search(r'rel=["\']next["\']', raw_lower))
    )
    return scan


BOT_WALL_MARKERS = (
    "pardon our interruption", "attention required", "just a moment",
    "verify you are a human", "are you a robot", "access denied",
    "request unsuccessful", "incapsula", "distil networks",
)


def is_bot_wall_html(lower_html: str) -> bool:
    return any(marker in lower_html for marker in BOT_WALL_MARKERS)


def scan_url(page_type: str, side: str, name: str, url: str) -> PageScan:
    fetch = http_get(url)
    if not fetch["ok"] or not fetch["html"]:
        scan = PageScan(page_type=page_type, side=side, name=name, url=url)
        scan.status = fetch.get("status") or fetch.get("error") or "fail"
        scan.notes = fetch.get("error") or f"HTTP {scan.status}"
        return scan
    scan = scan_html(page_type, side, name, url, fetch["html"], int(fetch["status"] or 200))
    if scan.is_bot_wall:
        scan.notes = "bot-protection interstitial (HTTP 200, no real content)"
    return scan


# Features we benchmark per page type. (attr, human label, applies-to types or None=all)
BENCHMARK_FEATURES: list[tuple[str, str, set[str] | None]] = [
    ("title_has_current_month", "Current month in title", {"deals_hub", "homepage", "provider_deals"}),
    ("title_has_year", "Year in title", {"provider_vs", "provider_review", "guide", "deals_hub", "postcode"}),
    ("has_concise_answer", "Concise answer / verdict block up top", None),
    ("question_h2_count", "Question-shaped H2s (PAA match)", {"guide", "provider_vs", "provider_review", "research"}),
    ("has_faq", "Visible FAQ section", None),
    ("has_faq_schema", "FAQPage schema", None),
    ("has_breadcrumb_schema", "BreadcrumbList schema", None),
    ("has_toc", "On-this-page jump links", {"guide", "provider_vs", "provider_review", "research"}),
    ("has_updated_date", "Visible last-updated / verified date", None),
    ("has_author_byline", "Author / reviewed-by byline", {"guide", "provider_review", "provider_vs", "research"}),
    ("has_postcode_input", "Postcode / availability input", {"homepage", "deals_hub", "postcode", "provider_review", "provider_vs", "provider_deals"}),
    ("has_compare_table", "Price/speed/contract comparison table", {"deals_hub", "provider_vs", "guide", "homepage", "postcode"}),
    ("has_card_layout", "Card layout (not table-only)", {"deals_hub", "homepage", "postcode", "provider_deals"}),
    ("has_badge_chip", "Badges / chips (Best value, Fastest)", {"deals_hub", "homepage", "provider_vs", "postcode"}),
    ("has_rating", "Rating / score shown", {"provider_review", "provider_vs"}),
    ("has_pros_cons", "Pros and cons", {"provider_review", "provider_vs", "guide"}),
    ("has_product_or_offer_schema", "Product / Offer schema", {"deals_hub", "provider_review", "provider_deals", "homepage"}),
    ("has_calculator_widget", "Interactive calculator / slider", {"tool"}),
    ("has_related", "Related links / internal linking block", None),
    ("get_deal_cta_count", "Get Deal CTAs on page", {"deals_hub", "provider_review", "provider_vs", "postcode", "homepage", "provider_deals"}),
]


def benchmark_type(page_type: str, our: list[PageScan], comp: list[PageScan]) -> list[dict[str, Any]]:
    comp_ok = [c for c in comp if c.status == 200]
    our_ok = [o for o in our if o.status == 200]
    rows: list[dict[str, Any]] = []
    for attr, label, applies in BENCHMARK_FEATURES:
        if applies is not None and page_type not in applies:
            continue
        is_count = attr.endswith("_count") or attr.endswith("_count") or attr == "get_deal_cta_count"

        def val(scan: PageScan) -> Any:
            v = getattr(scan, attr, 0)
            return v

        comp_hits = sum(1 for c in comp_ok if bool(val(c)))
        comp_count_avg = (
            round(sum(val(c) for c in comp_ok) / len(comp_ok), 1) if comp_ok and is_count else None
        )
        ours_present = any(bool(val(o)) for o in our_ok)
        ours_count_avg = (
            round(sum(val(o) for o in our_ok) / len(our_ok), 1) if our_ok and is_count else None
        )
        if is_count:
            # gap when the winners carry materially more of this element
            gap = bool(
                comp_count_avg is not None and comp_ok
                and comp_count_avg >= 2.0 * (ours_count_avg or 0.0) + 1.0
            )
        else:
            gap = (comp_hits >= max(1, len(comp_ok) // 2)) and not ours_present
        rows.append({
            "feature": label,
            "attr": attr,
            "is_count": is_count,
            "competitor_hits": comp_hits,
            "competitor_n": len(comp_ok),
            "competitor_count_avg": comp_count_avg,
            "ours_present": ours_present,
            "ours_count_avg": ours_count_avg,
            "is_gap": gap,
        })
    return rows


# ---------------------------------------------------------------------------
# Affiliate-site functionality benchmark
#
# Separate from the CTR benchmark above: a direct, curated look at what
# functionality actual broadband affiliate/comparison sites ship (filters,
# compare baskets, alerts, quizzes, live chat, trust badges...), independent
# of what currently ranks for our queries. Answers "what UX tooling do
# popular broadband sites have that we don't", mapped onto our own existing
# page types regardless of whether that type is a current GSC winner.
# ---------------------------------------------------------------------------

# One representative, real URL per page type on our own site.
OUR_KEY_PAGES: dict[str, str] = {
    "homepage": "/",
    "deals_hub": "/deals",
    "postcode": "/postcode/london",
    "provider_review": "/providers/bt",
    "provider_vs": "/providers/compare/ee-vs-talktalk",
    "provider_deals": "/providers/bt/deals",
    "tool": "/speed-test",
    "compare": "/compare",
}

# Popular UK broadband affiliate / comparison sites, by the page role they
# are being benchmarked for. Picked for reach (Uswitch, MSE-family, price
# comparison giants) and for being scrapeable -- Cloudflare/Akamai-walled
# sites (MoneySavingExpert, MoneySuperMarket, CompareTheMarket, GoCompare)
# are deliberately left out here since a static fetch cannot read them; the
# CTR benchmark above still counts their ranking and AI-citation signal.
CURATED_SITES: list[tuple[str, str, str]] = [
    ("uswitch.com", "deals_hub", "https://www.uswitch.com/broadband/"),
    ("cable.co.uk", "deals_hub", "https://www.cable.co.uk/broadband/"),
    ("choose.co.uk", "deals_hub", "https://www.choose.co.uk/broadband/"),
    ("money.co.uk", "deals_hub", "https://www.money.co.uk/broadband"),
    ("techradar.com", "deals_hub", "https://www.techradar.com/uk/broadband"),
    ("forbes.com/advisor", "deals_hub", "https://www.forbes.com/uk/advisor/broadband/"),
    ("bestbroadbanddeals.co.uk", "deals_hub", "https://bestbroadbanddeals.co.uk/"),
    ("broadband.co.uk", "deals_hub", "https://www.broadband.co.uk/broadband/deals/"),
    ("uswitch.com", "postcode", "https://www.uswitch.com/broadband/postcode_checker/"),
    ("uswitch.com", "postcode", "https://www.uswitch.com/broadband/nottingham/"),
    ("broadband.co.uk", "postcode", "https://www.broadband.co.uk/broadband/in/canterbury"),
    ("ofcom.org.uk", "postcode", "https://checker.ofcom.org.uk/en-gb/broadband-coverage"),
    ("openreach.com", "postcode", "https://www.openreach.com/fibre-checker"),
    ("uswitch.com", "provider_review", "https://www.uswitch.com/broadband/reviews/bt/"),
    ("broadband.co.uk", "provider_review", "https://www.broadband.co.uk/broadband/providers/bt/"),
    ("cable.co.uk", "provider_review", "https://www.cable.co.uk/broadband/providers/bt/"),
    ("speedtest.net", "tool", "https://www.speedtest.net/"),
    ("fast.com", "tool", "https://fast.com/en/gb/"),
    ("broadbandtest.which.co.uk", "tool", "https://broadbandtest.which.co.uk/"),
    ("broadbandspeedchecker.co.uk", "tool", "https://www.broadbandspeedchecker.co.uk/"),
    ("uswitch.com", "tool", "https://www.uswitch.com/broadband/speedtest/"),
    ("uswitch.com", "compare", "https://www.uswitch.com/broadband/compare/"),
    ("confused.com", "compare", "https://www.confused.com/broadband"),
]

# attr -> (human label, what it does for the visitor, our page types it applies to)
FUNCTIONALITY_FEATURES: list[tuple[str, str, str, set[str]]] = [
    ("has_filter_controls", "Filter controls (speed / price / contract / provider)",
     "Lets a visitor narrow a long results list themselves instead of scrolling a national table.",
     {"deals_hub", "compare", "postcode"}),
    ("has_sort_control", "Sort by (cheapest / fastest / rating)",
     "Cheapest-first is the default almost everyone expects on a comparison table.",
     {"deals_hub", "compare", "postcode"}),
    ("has_speed_filter", "Speed slider / minimum-speed filter",
     "Matches the 'what speed do I need' intent directly on the results, not just in a guide.",
     {"deals_hub", "compare"}),
    ("has_compare_basket", "Add-to-compare basket (pick N, compare side by side)",
     "Turns browsing into a decision: two or three shortlisted deals on one screen.",
     {"deals_hub", "compare"}),
    ("has_save_or_shortlist", "Save / shortlist a deal",
     "Lets a visitor who isn't ready to switch today come back to the same shortlist.",
     {"deals_hub", "provider_review", "compare"}),
    ("has_price_alert", "Price / deal alert signup",
     "Captures the visitor who bounces because 'not now' -- an email list an affiliate table alone can't build.",
     {"deals_hub", "postcode"}),
    ("has_quiz_or_wizard", "Match quiz / 'find my perfect broadband' wizard",
     "Converts an undecided visitor with 3-4 questions instead of asking them to read a table.",
     {"homepage", "deals_hub"}),
    ("has_existing_vs_new_customer", "Existing vs new customer toggle",
     "Out-of-contract price rises are a huge UK search intent; separate pricing paths serve both.",
     {"deals_hub", "provider_review", "provider_deals"}),
    ("has_bundle_toggle", "Broadband-only / +TV / +mobile tabs",
     "One table trying to show every bundle combination is unreadable; tabs keep it scannable.",
     {"deals_hub", "provider_deals"}),
    ("has_postcode_autocomplete", "Address-level lookup after postcode",
     "A postcode alone can span several exchanges; address-level narrows to what's actually buildable.",
     {"postcode", "homepage", "deals_hub"}),
    ("has_deal_count_badge", "'X deals available / compared' count",
     "A concrete number reads as more trustworthy than an open-ended table.",
     {"deals_hub", "postcode", "compare"}),
    ("has_urgency_countdown", "Offer-ends countdown / urgency signal",
     "Use sparingly and honestly -- only for deals with a real, verifiable end date.",
     {"deals_hub", "provider_deals"}),
    ("has_trust_badges", "Trustpilot / Feefo / press-mention badges",
     "Third-party proof matters more on an affiliate site than a first-party rating claim.",
     {"homepage", "deals_hub", "provider_review"}),
    ("has_methodology_link", "How-we-compare / methodology link near the table",
     "Answers the 'is this rigged' objection right where the CTA is, not buried in the footer.",
     {"deals_hub", "compare", "homepage"}),
    ("has_video_content", "Video review / explainer embed",
     "Video is a strong ranking and dwell-time signal on provider reviews and is AI-Overview-citable as a distinct media type.",
     {"provider_review", "guide"}),
    ("has_live_chat", "Live chat / chat-to-an-advisor widget",
     "Converts hesitant visitors who have a specific eligibility question a table can't answer.",
     {"deals_hub", "postcode", "provider_review"}),
    ("has_callback_request", "Request-a-callback form",
     "A lower-friction conversion than a phone number for a visitor not ready to self-serve.",
     {"deals_hub", "provider_review"}),
    ("has_app_promo", "App store / Google Play badges",
     "Signals an established, maintained brand; low effort if a companion app already exists.",
     {"homepage"}),
    ("has_load_more_or_pagination", "Load more / pagination on long result lists",
     "Avoids either truncating results or shipping one enormous page.",
     {"deals_hub", "compare"}),
]


def scan_functionality(pages: dict[str, str] | None = None) -> tuple[list[PageScan], dict[str, list[PageScan]]]:
    """Scan our key pages and the curated affiliate-site set once each."""
    our_pages = pages or OUR_KEY_PAGES
    scans: list[PageScan] = []
    for page_type, path in our_pages.items():
        url = f"{SITE}{path}"
        print(f"Scan [functionality/ours/{page_type}] {path}")
        scans.append(scan_url(page_type, "ours", path, url))
        time.sleep(0.2)
    by_type: dict[str, list[PageScan]] = defaultdict(list)
    for site_name, page_type, url in CURATED_SITES:
        print(f"Scan [functionality/site/{page_type}] {site_name}")
        s = scan_url(page_type, "affiliate_benchmark", site_name, url)
        scans.append(s)
        by_type[page_type].append(s)
        time.sleep(0.35)
    return scans, by_type


def functionality_benchmark(
    scans: list[PageScan], by_type: dict[str, list[PageScan]]
) -> list[dict[str, Any]]:
    our_by_type = {s.page_type: s for s in scans if s.side == "ours"}
    rows: list[dict[str, Any]] = []
    for attr, label, why, applies in FUNCTIONALITY_FEATURES:
        relevant_sites: list[PageScan] = []
        for t in applies:
            relevant_sites.extend(
                s for s in by_type.get(t, []) if s.status == 200 and not s.is_bot_wall
            )
        if not relevant_sites:
            continue
        hits = [s for s in relevant_sites if getattr(s, attr, False)]
        our_pages_with_it = [
            our_by_type[t].name for t in applies
            if t in our_by_type and getattr(our_by_type[t], attr, False)
        ]
        our_pages_missing = [
            our_by_type[t].name for t in applies
            if t in our_by_type and our_by_type[t].status == 200 and not getattr(our_by_type[t], attr, False)
        ]
        prevalence = len(hits) / len(relevant_sites)
        rows.append({
            "attr": attr,
            "feature": label,
            "why": why,
            "applies_to": sorted(applies),
            "site_hits": len(hits),
            "site_n": len(relevant_sites),
            "prevalence_pct": round(prevalence * 100),
            "example_sites": sorted({s.name for s in hits})[:5],
            "our_pages_with_it": our_pages_with_it,
            "our_pages_missing": our_pages_missing,
            "is_gap": prevalence >= 0.4 and bool(our_pages_missing),
        })
    rows.sort(key=lambda r: (not r["is_gap"], -r["prevalence_pct"]))
    return rows


def functionality_priority(row: dict[str, Any]) -> str:
    if row["prevalence_pct"] >= 70:
        return "P0"
    if row["prevalence_pct"] >= 40:
        return "P1"
    return "P2"


def functionality_markdown(generated: str, rows: list[dict[str, Any]], scans: list[PageScan]) -> str:
    lines = [
        "# Affiliate UX/functionality benchmark\n",
        f"Generated {generated}. Companion to `page-category-ux-ctr-plan.md`.\n",
        "What actual broadband affiliate and comparison sites build -- filters, alerts, "
        "quizzes, chat, trust signals -- checked against our own key page templates, "
        "regardless of whether that template is currently a GSC winner. "
        "This is a direct site-by-site scrape (no SerpApi, no query dependency), so it "
        "covers sites the query-driven benchmark never happens to surface.\n",
    ]

    scanned = [s for s in scans if s.side == "affiliate_benchmark"]
    ok = [s for s in scanned if s.status == 200 and not s.is_bot_wall]
    blocked = [s for s in scanned if s.status != 200 or s.is_bot_wall]
    lines.append(
        f"Sites scanned: {len(ok)}/{len(scanned)} readable"
        + (f"; blocked or bot-walled: {', '.join(sorted({s.name for s in blocked}))}" if blocked else "")
        + ".\n"
    )

    our_status = {s.page_type: s.status for s in scans if s.side == "ours"}
    lines.append("## Our key pages checked\n")
    lines.append("| Page type | Path | HTTP |")
    lines.append("|---|---|---|")
    for t, path in OUR_KEY_PAGES.items():
        lines.append(f"| {TYPE_META.get(t, {}).get('label', t)} | `{path}` | {our_status.get(t, '—')} |")

    lines.append("\n## Feature prevalence and gaps\n")
    lines.append("| Feature | Sites that have it | We have it on | Missing on | Gap? |")
    lines.append("|---|---|---|---|---|")
    for r in rows:
        have_label = ", ".join(r["our_pages_with_it"]) or "none"
        missing_label = ", ".join(r["our_pages_missing"]) or "—"
        lines.append(
            f"| {r['feature']} | {r['site_hits']}/{r['site_n']} ({r['prevalence_pct']}%) | "
            f"{have_label} | {missing_label} | {'**GAP**' if r['is_gap'] else ''} |"
        )

    lines.append("\n## Recommendations\n")
    for r in rows:
        if not r["is_gap"]:
            continue
        prio = functionality_priority(r)
        lines.append(f"**{prio} · {r['feature']}**\n")
        lines.append(f"{r['why']}\n")
        lines.append(
            f"- Evidence: {r['site_hits']}/{r['site_n']} relevant affiliate sites have this "
            f"({r['prevalence_pct']}%): {', '.join(r['example_sites'])}."
        )
        if r["our_pages_with_it"]:
            lines.append(f"- Already on: {', '.join(r['our_pages_with_it'])}.")
        lines.append(f"- Missing on: {', '.join(r['our_pages_missing'])}\n")

    lines.append(
        "\n## What we already match or beat\n\n"
        + "\n".join(
            f"- {r['feature']} -- present on {', '.join(r['our_pages_with_it'])}"
            for r in rows if r["our_pages_with_it"] and not r["is_gap"]
        )
        + "\n"
    )
    return "\n".join(lines) + "\n"


# ---------------------------------------------------------------------------
# Recommendations
# ---------------------------------------------------------------------------

def priority_for(agg_row: dict[str, Any], gap: dict[str, Any]) -> str:
    near_page1 = 0 < agg_row.get("avg_position", 0) <= 20
    improving = (
        agg_row.get("position_change", 0) < -0.5
        or agg_row.get("new_pages", 0) >= 5
    )
    if near_page1 or improving:
        return "P0" if gap["attr"] in {
            "title_has_current_month", "has_concise_answer", "has_postcode_input",
            "has_compare_table", "get_deal_cta_count", "title_has_year",
        } else "P1"
    return "P1" if gap["attr"] in {"has_concise_answer", "has_faq_schema"} else "P2"


def build_recommendations(
    winning_types: list[str],
    agg: dict[str, dict[str, Any]],
    type_pages: dict[str, list[PageStat]],
    type_to_queries: dict[str, list[str]],
    competitors: dict[str, list[CompetitorPage]],
    benchmarks: dict[str, list[dict[str, Any]]],
    serp: dict[str, dict[str, Any]],
) -> list[dict[str, Any]]:
    recs: list[dict[str, Any]] = []
    for t in winning_types:
        a = agg.get(t, {})
        label = TYPE_META.get(t, {}).get("label", t)
        our_urls = [f"{SITE}{p.path}" for p in sorted(
            type_pages.get(t, []), key=lambda x: x.impressions, reverse=True
        )[:8]]
        top_comp = [c for c in competitors.get(t, []) if c.popularity_score > 0][:4]
        ai_cited = sorted(
            {c.domain for c in competitors.get(t, []) if c.ai_citations or c.ai_domain_citations}
        )
        bench = benchmarks.get(t, [])
        for gap in bench:
            if not gap["is_gap"]:
                continue
            prio = priority_for(a, gap)
            comp_examples = ", ".join(dict.fromkeys(c.domain for c in top_comp[:3]))
            recs.append({
                "page_type": t,
                "label": label,
                "priority": prio,
                "feature": gap["feature"],
                "evidence": (
                    f"{gap['competitor_hits']}/{gap['competitor_n']} top competitor pages have this"
                    + (f" (avg {gap['competitor_count_avg']})" if gap["competitor_count_avg"] is not None else "")
                    + f". Top pages for this topic: {comp_examples or 'n/a'}."
                ),
                "gsc": (
                    f"{a.get('impressions', 0):,.0f} impressions, {a.get('clicks', 0):,.0f} clicks, "
                    f"avg pos {a.get('avg_position', 0):.1f} "
                    f"({a.get('position_change', 0):+.1f} vs prior 28d), "
                    f"{a.get('improving_pages', 0)} pages improving / {a.get('declining_pages', 0)} declining."
                ),
                "our_pages": our_urls,
                "ai_cited_domains": ai_cited,
            })
        # always-on GEO note per winning type
        bp_ai = sum(
            1 for q in type_to_queries.get(t, [])
            if serp.get(q, {}).get("bp_in_ai_overview")
        )
        ai_total = sum(
            1 for q in type_to_queries.get(t, [])
            if serp.get(q, {}).get("has_ai_overview")
        )
        geo_prio = (
            "P0" if ai_total >= 2 and bp_ai == 0 and 0 < a.get("avg_position", 99) <= 25
            else "P1" if ai_total >= 1
            else "P2"
        )
        recs.append({
            "page_type": t,
            "label": label,
            "priority": geo_prio,
            "feature": "GEO: be quotable in the AI answer",
            "evidence": (
                f"{ai_total} of {len(type_to_queries.get(t, []))} sampled {label.lower()} queries "
                f"show an AI Overview; BroadbandPicker is cited in {bp_ai}. "
                f"Domains that do get cited: {', '.join(ai_cited) or 'n/a'}."
            ),
            "gsc": f"AI referral visits to this type in GA4: {a.get('ai_referral', 0):,.0f}.",
            "our_pages": our_urls,
            "ai_cited_domains": ai_cited,
        })
    return recs


# ---------------------------------------------------------------------------
# Markdown
# ---------------------------------------------------------------------------

def _arrow(change: float, good_is_negative: bool = True) -> str:
    """Human label for a delta. For position, a lower number is better."""
    if abs(change) < 0.3:
        return "flat"
    up = change > 0
    good = (not up) if good_is_negative else up
    return "better" if good else "worse"


def markdown_report(
    generated: str,
    windows: dict[str, str],
    site_totals: dict[str, Any],
    agg: dict[str, dict[str, Any]],
    winning_types: list[str],
    type_pages: dict[str, list[PageStat]],
    type_to_queries: dict[str, list[str]],
    competitors: dict[str, list[CompetitorPage]],
    benchmarks: dict[str, list[dict[str, Any]]],
    scans: list[PageScan],
    recs: list[dict[str, Any]],
    serp: dict[str, dict[str, Any]],
    serp_meta: dict[str, Any],
) -> str:
    lines: list[str] = []
    add = lines.append

    add("# Page-type UX benchmark for CTR and GEO\n")
    add(f"Generated {generated}. Written by `scripts/analyze_page_type_ux.py`.\n")
    add(
        "This brief starts from real data, not a competitor wishlist: Search Console "
        "picks the page types that are working, SerpApi shows who wins those queries in "
        "Google and in AI Overviews, and the UX scrape shows the feature gap.\n"
    )
    add(
        f"- GSC window: **{windows['cur']}** vs prior **{windows['prev']}** "
        f"(3-day lag, final data)\n"
        f"- SERP data: {serp_meta.get('source', 'fresh SerpApi run')}"
        + (f", {serp_meta['searches_used']} searches used" if serp_meta.get("searches_used") else "")
        + "\n"
        f"- Backlink/authority signal is a **proxy** (ranking ubiquity + AI citations + "
        "hand-kept domain tiers). No paid link API is wired.\n"
    )

    add("\n## Site totals\n")
    add("| Metric | Last 28d | Prior 28d | Change |")
    add("|---|---|---|---|")
    add(
        f"| Impressions | {site_totals['impressions']:,.0f} | {site_totals['prev_impressions']:,.0f} | "
        f"{site_totals['impression_change_pct']:+.0f}% |"
    )
    add(
        f"| Clicks | {site_totals['clicks']:,.0f} | {site_totals['prev_clicks']:,.0f} | "
        f"{site_totals['click_change_pct']:+.0f}% |"
    )
    add(f"| CTR | {site_totals['ctr'] * 100:.2f}% | {site_totals['prev_ctr'] * 100:.2f}% | — |")
    add(
        f"| Avg position | {site_totals['avg_position']:.1f} | {site_totals['prev_avg_position']:.1f} | "
        f"{_arrow(site_totals['avg_position'] - site_totals['prev_avg_position'])} |"
    )
    add(
        "\nSite average position drifts down while impressions multiply because new "
        "pages enter the index at low positions. Read the per-type position change, "
        "not the site average.\n"
    )

    add("\n## What is actually working (page-type league table)\n")
    add("| Type | Impr | Clicks | CTR | Avg pos | Pos vs prior | Impr/decl/new | AI refs | Winning? |")
    add("|---|---|---|---|---|---|---|---|---|")
    for t, a in sorted(agg.items(), key=lambda kv: kv[1]["impressions"], reverse=True):
        add(
            f"| {a['label']} | {a['impressions']:,.0f} | {a['clicks']:,.0f} | "
            f"{a['ctr'] * 100:.2f}% | {a['avg_position']:.1f} | "
            f"{a['position_change']:+.1f} ({_arrow(a['position_change'])}) | "
            f"{a['improving_pages']}/{a['declining_pages']}/{a.get('new_pages', 0)} | "
            f"{a['ai_referral']:,.0f} | {'yes' if t in winning_types else ''} |"
        )
    add(
        "\nWinning = real impression share and either improving position, already near "
        "page 1, earning clicks, or getting AI referral. Those are the types the rest of "
        "this brief works on.\n"
    )

    for t in winning_types:
        a = agg[t]
        label = a["label"]
        add(f"\n---\n\n## {label}\n")
        add(
            f"GSC: **{a['impressions']:,.0f} impressions, {a['clicks']:,.0f} clicks, "
            f"CTR {a['ctr'] * 100:.2f}%, avg position {a['avg_position']:.1f}** "
            f"({a['position_change']:+.1f} vs prior 28d, {_arrow(a['position_change'])}). "
            f"{a['improving_pages']} pages improving, {a['declining_pages']} declining, "
            f"{a.get('new_pages', 0)} newly ranking.\n"
        )

        if t == "tool":
            add(
                "_Speed tests and calculators are client-side apps; the static scrape "
                "cannot see their widgets or result flow. Treat the feature matrix below "
                "as a floor, not the full picture._\n"
            )

        pages = sorted(type_pages.get(t, []), key=lambda x: x.impressions, reverse=True)[:8]
        if pages:
            add("\n### Our pages of this type\n")
            add("| Page | Impr | Clicks | CTR | Pos | Pos vs prior |")
            add("|---|---|---|---|---|---|")
            for p in pages:
                add(
                    f"| `{p.path}` | {p.impressions:,.0f} | {p.clicks:,.0f} | {p.ctr * 100:.2f}% | "
                    f"{p.position:.1f} | {p.position_change:+.1f} |"
                )

        queries = type_to_queries.get(t, [])
        if queries:
            add("\n### Queries these pages actually rank for (top by impressions)\n")
            add(", ".join(f"`{q}`" for q in queries[:10]) + "\n")

        comps = [c for c in competitors.get(t, []) if c.popularity_score > 0][:6]
        if comps:
            add("\n### Pages that dominate these SERPs (popularity proxy)\n")
            add("| Page | Domain | Tier | Best rank | Query coverage | Top-3 | AI cites | Score |")
            add("|---|---|---|---|---|---|---|---|")
            for c in comps:
                short = c.url.replace("https://", "").replace("http://", "")
                short = short[:70] + ("…" if len(short) > 70 else "")
                add(
                    f"| {short} | {c.domain} | {c.tier} | "
                    f"{c.best_rank if c.best_rank < 99 else '—'} | "
                    f"{c.query_coverage} | {c.top3_coverage} | "
                    f"{c.ai_citations + c.ai_domain_citations} | {c.popularity_score:g} |"
                )

            # what those page-1 rows say in the SERP (title patterns)
            titles: list[str] = []
            for c in comps[:6]:
                for st in c.sample_titles[:1]:
                    if st and st not in titles:
                        titles.append(f"{c.domain}: {st}")
            if titles:
                add("\n**Page-1 titles for these queries:**\n")
                for tl in titles[:6]:
                    add(f"- {tl}")
                add("")

        # which top competitors we could scrape vs which blocked us
        comp_scans = [s for s in scans if s.page_type == t and s.side == "competitor"]
        blocked = [s for s in comp_scans if s.status != 200]
        scraped = [s for s in comp_scans if s.status == 200]
        if comp_scans:
            note = f"UX scrape: {len(scraped)} of {len(comp_scans)} top competitor pages read"
            if blocked:
                note += f"; blocked (bot protection): {', '.join(serp_domain(s.url) for s in blocked)}"
            add(f"\n_{note}. Blocked pages still count in the SERP tables above._\n")

        paa: list[str] = []
        for q in type_to_queries.get(t, []):
            for question in serp.get(q, {}).get("people_also_ask", []) or []:
                if question and question not in paa:
                    paa.append(question)
        if paa:
            add("\n**People Also Ask (match these as H2s / FAQ):**\n")
            for question in paa[:8]:
                add(f"- {question}")
            add("")

        bench = benchmarks.get(t, [])
        if bench:
            add("\n### UX feature matrix (ours vs the winners we could read)\n")
            add("| Feature | Ours | Top competitors | Gap? |")
            add("|---|---|---|---|")
            for b in bench:
                ours = (
                    (f"{b['ours_count_avg']}" if b["ours_count_avg"] is not None else "")
                    if b["is_count"] else ("yes" if b["ours_present"] else "no")
                )
                comp = (
                    f"avg {b['competitor_count_avg']}" if b["is_count"] and b["competitor_count_avg"] is not None
                    else f"{b['competitor_hits']}/{b['competitor_n']}"
                )
                add(f"| {b['feature']} | {ours or '—'} | {comp} | {'**GAP**' if b['is_gap'] else ''} |")

        type_recs = [r for r in recs if r["page_type"] == t]
        if type_recs:
            add("\n### Recommendations\n")
            for r in sorted(type_recs, key=lambda x: x["priority"]):
                add(f"**{r['priority']} · {r['feature']}**\n")
                add(f"- Evidence: {r['evidence']}")
                add(f"- GSC: {r['gsc']}")
                add(f"- Apply to: {', '.join('`' + u.replace(SITE, '') + '`' for u in r['our_pages'][:6]) or 'n/a'}\n")

    add("\n---\n\n## Build order\n")
    add(
        "1. Page types with real impression share **and** improving position first — the "
        "SERP is already moving, UX converts it.\n"
        "2. Fix the **GAP** rows above, highest priority per type.\n"
        "3. GEO: put a 40-70 word quotable answer near the top of every winning type, "
        "matched to the question the AI Overview is answering.\n"
        "4. Only then touch types with no rank movement.\n"
    )
    add("\n## Copy rules\n")
    add(
        "British English. No em dashes. Fibre not fiber. Rankings are not sold. "
        "No AggregateRating schema without a real dataset and count. No national "
        "from-price shown as universally available. Affiliate Get Deal labelled.\n"
    )
    add("\n## Success\n")
    add(
        "- Winning-type CTR up from the site average.\n"
        "- `/deals` and provider-deals titles always equal the live month.\n"
        "- Every winning type carries a quotable answer block and a matching FAQPage.\n"
        "- GA4 `outbound_provider_click` per session up on provider-vs and postcode pages.\n"
        "- BroadbandPicker cited in more AI Overviews for the sampled winning queries.\n"
    )
    return "\n".join(lines) + "\n"


def benchmark_markdown(
    generated: str,
    winning_types: list[str],
    benchmarks: dict[str, list[dict[str, Any]]],
    competitors: dict[str, list[CompetitorPage]],
) -> str:
    lines = [
        "# Competitor UX benchmark by page type\n",
        f"Generated {generated}. Companion matrix to `page-category-ux-ctr-plan.md`.\n",
        "Ours vs the highest-popularity competitor pages for the queries our pages of "
        "that type actually rank for.\n",
    ]
    for t in winning_types:
        label = TYPE_META.get(t, {}).get("label", t)
        lines.append(f"\n## {label}\n")
        comps = [c for c in competitors.get(t, []) if c.popularity_score > 0][:5]
        if comps:
            lines.append("Benchmarked against: " + ", ".join(
                f"{c.domain} (score {c.popularity_score:g})" for c in comps
            ) + "\n")
        lines.append("| Feature | Ours | Competitors have it | Gap? |")
        lines.append("|---|---|---|---|")
        for b in benchmarks.get(t, []):
            ours = (
                (f"{b['ours_count_avg']}" if b["ours_count_avg"] is not None else "")
                if b["is_count"] else ("yes" if b["ours_present"] else "no")
            )
            comp = (
                f"avg {b['competitor_count_avg']}" if b["is_count"] and b["competitor_count_avg"] is not None
                else f"{b['competitor_hits']}/{b['competitor_n']}"
            )
            lines.append(f"| {b['feature']} | {ours or '—'} | {comp} | {'**GAP**' if b['is_gap'] else ''} |")
    return "\n".join(lines) + "\n"


# ---------------------------------------------------------------------------
# Orchestration
# ---------------------------------------------------------------------------

def gather_ga4(client: GoogleClient, start: date, end: date) -> tuple[dict[str, float], dict[str, float]]:
    """Best-effort: AI-referral visits and organic sessions per page."""
    ai_by_page: dict[str, float] = defaultdict(float)
    sessions_by_page: dict[str, float] = defaultdict(float)
    try:
        payload = {
            "dateRanges": [{"startDate": start.isoformat(), "endDate": end.isoformat()}],
            "dimensions": [{"name": "pagePath"}, {"name": "eventName"}],
            "metrics": [{"name": "eventCount"}],
            "limit": "100000",
        }
        resp = client.request("POST", f"{GA_BASE}/properties/{GA4_PROPERTY}:runReport", payload)
        for row in resp.get("rows", []):
            dims = [v.get("value", "") for v in row.get("dimensionValues", [])]
            metric = float(row.get("metricValues", [{}])[0].get("value", 0) or 0)
            page, event = path_of(dims[0]), dims[1]
            if event == "ai_referral_visit":
                ai_by_page[page] += metric
    except Exception as exc:  # noqa: BLE001
        print(f"GA4 AI-referral query skipped: {exc}", file=sys.stderr)
    try:
        payload = {
            "dateRanges": [{"startDate": start.isoformat(), "endDate": end.isoformat()}],
            "dimensions": [{"name": "pagePath"}, {"name": "sessionDefaultChannelGroup"}],
            "metrics": [{"name": "sessions"}],
            "limit": "100000",
        }
        resp = client.request("POST", f"{GA_BASE}/properties/{GA4_PROPERTY}:runReport", payload)
        for row in resp.get("rows", []):
            dims = [v.get("value", "") for v in row.get("dimensionValues", [])]
            metric = float(row.get("metricValues", [{}])[0].get("value", 0) or 0)
            if "Organic" in dims[1]:
                sessions_by_page[path_of(dims[0])] += metric
    except Exception as exc:  # noqa: BLE001
        print(f"GA4 organic-sessions query skipped: {exc}", file=sys.stderr)
    return ai_by_page, sessions_by_page


def run(
    *, credentials: Path, serp_limit: int, no_serp: bool, skip_web: bool,
    out_dir: Path, no_functionality: bool = False,
) -> dict[str, Any]:
    out_dir.mkdir(parents=True, exist_ok=True)

    if skip_web:
        payload = {"generated_at": NOW.isoformat(timespec="seconds"), "skipped": True}
        (out_dir / "page-type-ux-scan.json").write_text(
            json.dumps(payload, indent=2) + "\n", encoding="utf-8"
        )
        print("skip-web: wrote stub only")
        return payload

    if not credentials.is_file():
        print(f"Search Console credentials not found: {credentials}", file=sys.stderr)
        raise SystemExit(2)

    end = date.today() - timedelta(days=GSC_LAG_DAYS)
    start = end - timedelta(days=GSC_WINDOW_DAYS - 1)
    prev_end = start - timedelta(days=1)
    prev_start = prev_end - timedelta(days=GSC_WINDOW_DAYS - 1)
    windows = {
        "cur": f"{start.isoformat()} to {end.isoformat()}",
        "prev": f"{prev_start.isoformat()} to {prev_end.isoformat()}",
    }
    print(f"GSC windows: {windows['cur']}  vs  {windows['prev']}")

    client = GoogleClient(credentials)
    cur_pages = gsc_query(client, start, end, ["page"])
    prev_pages = gsc_query(client, prev_start, prev_end, ["page"])
    pq_rows = gsc_query(client, start, end, ["page", "query"])
    ai_by_page, sessions_by_page = gather_ga4(client, start, end)

    stats = build_page_stats(cur_pages, prev_pages, pq_rows, ai_by_page, sessions_by_page)
    total_impr = sum(s.impressions for s in stats.values())
    total_clicks = sum(s.clicks for s in stats.values())
    prev_total_impr = sum(s.prev_impressions for s in stats.values())
    prev_total_clicks = sum(s.prev_clicks for s in stats.values())
    site_totals = {
        "impressions": total_impr, "clicks": total_clicks,
        "prev_impressions": prev_total_impr, "prev_clicks": prev_total_clicks,
        "ctr": total_clicks / total_impr if total_impr else 0.0,
        "prev_ctr": prev_total_clicks / prev_total_impr if prev_total_impr else 0.0,
        "impression_change_pct": (
            100.0 * (total_impr - prev_total_impr) / prev_total_impr if prev_total_impr else 0.0
        ),
        "click_change_pct": (
            100.0 * (total_clicks - prev_total_clicks) / prev_total_clicks if prev_total_clicks else 0.0
        ),
        "avg_position": (
            sum(s.position * s.impressions for s in stats.values()) / total_impr if total_impr else 0.0
        ),
        "prev_avg_position": (
            sum(s.prev_position * s.prev_impressions for s in stats.values()) / prev_total_impr
            if prev_total_impr else 0.0
        ),
    }

    agg = aggregate_by_type(stats)
    winning_types = pick_winning_types(agg, total_impr)
    print(f"Winning types: {', '.join(winning_types)}")

    type_pages: dict[str, list[PageStat]] = defaultdict(list)
    for s in stats.values():
        type_pages[s.page_type].append(s)

    type_to_queries: dict[str, list[str]] = {}
    for t in winning_types:
        seen: set[str] = set()
        picked: list[str] = []
        pages = sorted(type_pages.get(t, []), key=lambda x: x.impressions, reverse=True)
        pool: list[tuple[float, str]] = []
        for p in pages[:12]:
            for q in p.top_queries:
                ql = q["query"].lower().strip()
                if ql in seen or len(ql) < 4:
                    continue
                seen.add(ql)
                pool.append((q["impressions"], q["query"]))
        pool.sort(reverse=True)
        picked = [q for _, q in pool[:8]]
        if not picked:
            picked = list(TYPE_META.get(t, {}).get("fallback_queries", []))
        type_to_queries[t] = picked

    # SERP
    serp: dict[str, dict[str, Any]] = {}
    serp_meta: dict[str, Any] = {}
    if no_serp:
        cache = latest_serp_cache()
        if cache:
            serp, serp_meta = load_serp_cache(cache)
            serp_meta["source"] = f"cached SERP file {cache.name}"
            print(f"Loaded cached SERP: {cache.name} ({len(serp)} queries)")
        else:
            print("No SERP cache found; competitor analysis will be thin", file=sys.stderr)
    else:
        key = env_key("SERPAPI_API_KEY")
        if not key:
            print("SERPAPI_API_KEY missing; falling back to cache", file=sys.stderr)
            cache = latest_serp_cache()
            if cache:
                serp, serp_meta = load_serp_cache(cache)
        else:
            serp, serp_meta = run_serp(key, type_to_queries, serp_limit)
            cache_path = SERP_CACHE_DIR / f"{date.today().isoformat()}-page-ux-raw.json"
            SERP_CACHE_DIR.mkdir(parents=True, exist_ok=True)
            cache_path.write_text(
                json.dumps({"generated": date.today().isoformat(), "serp": serp, "serp_meta": serp_meta}, indent=2, ensure_ascii=False) + "\n",
                encoding="utf-8",
            )
            serp_meta["source"] = f"fresh SerpApi run, cached to {cache_path.name}"

    competitors = rank_competitors(serp, type_to_queries)

    # UX scrape
    scans: list[PageScan] = []
    for t in winning_types:
        for p in sorted(type_pages.get(t, []), key=lambda x: x.impressions, reverse=True)[:3]:
            url = f"{SITE}{p.path}"
            print(f"Scan [ours/{t}] {p.path}")
            scans.append(scan_url(t, "ours", p.path, url))
            time.sleep(0.2)
        comp_urls = [c.url for c in competitors.get(t, []) if c.popularity_score > 0][:4]
        if not comp_urls:
            comp_urls = [u for _, u in TYPE_META.get(t, {}).get("fallback_competitors", [])]
        for url in comp_urls:
            print(f"Scan [comp/{t}] {url}")
            scans.append(scan_url(t, "competitor", serp_domain(url), url))
            time.sleep(0.3)

    benchmarks: dict[str, list[dict[str, Any]]] = {}
    for t in winning_types:
        our = [s for s in scans if s.page_type == t and s.side == "ours"]
        comp = [s for s in scans if s.page_type == t and s.side == "competitor"]
        benchmarks[t] = benchmark_type(t, our, comp)

    recs = build_recommendations(
        winning_types, agg, type_pages, type_to_queries, competitors, benchmarks, serp
    )

    generated = NOW.date().isoformat()
    md = markdown_report(
        generated, windows, site_totals, agg, winning_types, type_pages,
        type_to_queries, competitors, benchmarks, scans, recs, serp, serp_meta,
    )
    (out_dir / "page-category-ux-ctr-plan.md").write_text(md, encoding="utf-8")
    (out_dir / "competitor-ux-benchmark.md").write_text(
        benchmark_markdown(generated, winning_types, benchmarks, competitors), encoding="utf-8"
    )

    func_rows: list[dict[str, Any]] = []
    func_scans: list[PageScan] = []
    if not no_functionality:
        print("\nAffiliate UX/functionality benchmark:")
        func_scans, func_by_type = scan_functionality()
        func_rows = functionality_benchmark(func_scans, func_by_type)
        (out_dir / "affiliate-ux-functionality-benchmark.md").write_text(
            functionality_markdown(generated, func_rows, func_scans), encoding="utf-8"
        )
        print(f"Saved {out_dir / 'affiliate-ux-functionality-benchmark.md'}")

    # `build_keyword_mapping.py` filters this same `recommendations` list by
    # `page_type` to inject mandatory P0/P1 requirements into every new page
    # build (see docs/page-build-pipeline-brief.md Stage 1). The CTR/GEO recs
    # above only cover currently-winning GSC types, so a new page of a type
    # that isn't winning yet (deals_hub, compare -- both still scanned by the
    # functionality benchmark regardless of GSC standing) would otherwise get
    # zero requirements. Backfill from the functionality benchmark so every
    # OUR_KEY_PAGES type always has at least its functionality gaps to build against.
    covered_types = {r["page_type"] for r in recs}
    for row in func_rows:
        if not row["is_gap"]:
            continue
        for t in row["applies_to"]:
            if t in covered_types or t not in OUR_KEY_PAGES:
                continue
            recs.append({
                "page_type": t,
                "label": TYPE_META.get(t, {}).get("label", t),
                "priority": functionality_priority(row),
                "feature": row["feature"],
                "evidence": (
                    f"{row['site_hits']}/{row['site_n']} relevant affiliate sites have this "
                    f"({row['prevalence_pct']}%): {', '.join(row['example_sites'])}. {row['why']}"
                ),
                "gsc": "This page type is not a current GSC winner; functionality benchmark only.",
                "our_pages": [f"{SITE}{OUR_KEY_PAGES[t]}"],
                "ai_cited_domains": [],
            })

    payload = {
        "generated_at": NOW.isoformat(timespec="seconds"),
        "windows": windows,
        "site_totals": site_totals,
        "page_type_league": agg,
        "winning_types": winning_types,
        "type_to_queries": type_to_queries,
        "our_pages_by_type": {
            t: [asdict(p) for p in sorted(type_pages.get(t, []), key=lambda x: x.impressions, reverse=True)]
            for t in winning_types
        },
        "competitors_by_type": {
            t: [asdict(c) for c in competitors.get(t, [])[:12]] for t in winning_types
        },
        "benchmarks": benchmarks,
        "scans": [asdict(s) for s in scans],
        "recommendations": recs,
        "serp_meta": serp_meta,
        "functionality_benchmark": func_rows,
        "functionality_scans": [asdict(s) for s in func_scans],
    }
    (out_dir / "page-type-ux-scan.json").write_text(
        json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
    )
    ok = sum(1 for s in scans if s.status == 200)
    print(f"\nSaved {out_dir / 'page-category-ux-ctr-plan.md'}")
    print(f"Saved {out_dir / 'competitor-ux-benchmark.md'}")
    func_gaps = sum(1 for r in func_rows if r["is_gap"])
    print(
        f"Winning types: {len(winning_types)} · pages scanned {ok}/{len(scans)} · recs {len(recs)} "
        f"· functionality gaps {func_gaps}/{len(func_rows)}"
    )
    return payload


def run_page_type_ux(
    *,
    skip_web: bool = False,
    no_serp: bool = True,
    no_functionality: bool = True,
    serp_limit: int = 36,
    credentials: Path | None = None,
    out_dir: Path | None = None,
) -> dict[str, Any]:
    """Back-compat entry point used by `plan_homepage_seo_geo.py`.

    Defaults to `no_serp=True` and `no_functionality=True` so the homepage
    planner never spends SerpApi quota or does the extra affiliate-site
    scrape as a side effect; run this script directly for a full refresh.
    """
    return run(
        credentials=credentials or DEFAULT_CREDENTIALS,
        serp_limit=serp_limit,
        no_serp=no_serp,
        skip_web=skip_web,
        out_dir=out_dir or OUT_DIR,
        no_functionality=no_functionality,
    )


def main() -> int:
    parser = argparse.ArgumentParser(
        description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter
    )
    parser.add_argument("--credentials", type=Path, default=DEFAULT_CREDENTIALS)
    parser.add_argument("--serp-limit", type=int, default=36,
                        help="max SerpApi searches this run (default 36)")
    parser.add_argument("--no-serp", action="store_true",
                        help="use the newest cached SERP file, no API calls")
    parser.add_argument("--no-functionality", action="store_true",
                        help="skip the curated affiliate-site functionality scrape")
    parser.add_argument("--skip-web", action="store_true",
                        help="write a stub only, no network at all")
    parser.add_argument("--output-dir", type=Path, default=OUT_DIR)
    args = parser.parse_args()
    run(
        credentials=args.credentials,
        serp_limit=args.serp_limit,
        no_serp=args.no_serp,
        skip_web=args.skip_web,
        out_dir=args.output_dir,
        no_functionality=args.no_functionality,
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
