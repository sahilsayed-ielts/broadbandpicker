#!/usr/bin/env python3
"""Deep research for the page-type redesign: data, audience and affiliate benchmark.

``plan_page_type_redesign.py`` picks the template to redesign from the page-type
league in ``page-type-ux-scan.json``. This script goes deeper on that winner so
the redesign is grounded in evidence rather than taste:

1. Page-type decision -- fresh GSC (28 days vs prior 28) and GA4 (organic
   sessions, engagement, AI referrals, commercial events) aggregated by page
   type, scored for reach, use and per-page leverage.
2. Audience -- who the winning pages actually serve: the query intents they
   rank for (commercial "best/cheap/deals", informational "what/how", audience
   segments such as students, gamers, benefits claimants, business), device
   split, ranking-position buckets (is this a UX problem or an authority
   problem?), and People Also Ask questions from the cached UK SERPs.
3. Template sub-types -- the winning type's URLs split into commercial
   roundups, explainers, audience guides and seasonal pages, because one
   template rarely serves all of them.
4. Affiliate benchmark -- the equivalent pages on the UK broadband affiliate
   and comparison sites that earn most from this market. Pages are discovered
   by crawling each site's broadband hub for links matching our top topics,
   then scraped for 40+ UX, trust, monetisation and GEO features. Sites behind
   bot protection (MoneySuperMarket, CompareTheMarket, GoCompare, Forbes) are
   kept as SERP-only evidence: their ranking titles and positions from the
   cached SerpApi results.
5. Gap matrix -- prevalence of each feature among affiliates vs our own top
   pages of the same type, with a commercial/SEO rationale per feature.

Outputs (docs/home page UX/):
- page-type-redesign-research.json   full machine-readable evidence
- page-type-redesign-research.md     readable summary used to write the plan

Usage:
    .venv/bin/python scripts/research_page_type_redesign.py
    .venv/bin/python scripts/research_page_type_redesign.py --max-per-site 3
    .venv/bin/python scripts/research_page_type_redesign.py --skip-scrape   # data only

No SerpApi quota is spent: SERP evidence comes from the newest cached
``docs/geo-serp-research/*-page-ux-raw.json`` (refresh it with
``analyze_page_type_ux.py``).
"""

from __future__ import annotations

import argparse
import json
import re
import sys
import time
from collections import Counter, defaultdict
from dataclasses import asdict
from datetime import date, timedelta
from pathlib import Path
from typing import Any
from urllib.parse import urljoin, urlsplit

sys.path.insert(0, str(Path(__file__).resolve().parent))

from analyze_page_type_ux import (  # noqa: E402
    DEFAULT_CREDENTIALS, GA4_PROPERTY, GA_BASE, GSC_LAG_DAYS, GSC_WINDOW_DAYS,
    SERP_CACHE_DIR, SITE, TYPE_META, GoogleClient, classify_page_type, gsc_query,
    http_get, path_of, scan_html,
)

ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "docs" / "home page UX"
OUT_JSON = OUT_DIR / "page-type-redesign-research.json"
OUT_MD = OUT_DIR / "page-type-redesign-research.md"

EXCLUDED_TYPES = {"homepage", "trust", "other"}
COMMERCIAL_EVENTS = ("outbound_provider_click", "postcode_submit", "newsletter_signup_request")

# ---------------------------------------------------------------------------
# Audience and sub-type classifiers
# ---------------------------------------------------------------------------

QUERY_INTENTS: list[tuple[str, str]] = [
    ("best / top", r"\b(best|top|recommended)\b"),
    ("cheap / price", r"\b(cheap|cheapest|price|cost|£|budget|affordable|free)\b"),
    ("deals / offers", r"\b(deals?|offers?|packages?|bundles?|discounts?)\b"),
    ("question", r"^(what|how|why|which|can|do|does|is|are|should|when|who|where)\b|\?"),
    ("comparison", r"\b(vs|versus|compare|comparison|or)\b"),
    ("provider-named", r"\b(bt|sky|virgin|ee|vodafone|talktalk|plusnet|hyperoptic|community fibre|"
                       r"zen|shell|now|youfibre|cuckoo|giffgaff|three|o2|toob|onestream|origin)\b"),
    ("contract terms", r"\b(no contract|rolling|monthly|30 day|12 month|short term|price rise|mid.contract)\b"),
    ("speed / tech", r"\b(speed|mbps|gig|fibre|fiber|5g|4g|wifi|wi-fi|router|mesh|ethernet|esim)\b"),
    ("local", r"\b(near me|in my area|postcode|london|manchester|birmingham|glasgow|leeds|bristol)\b"),
]
AUDIENCE_SEGMENTS: list[tuple[str, str]] = [
    ("Students", r"\b(student|university|uni|halls)\b"),
    ("Gamers", r"\b(gaming|gamer|ps5|xbox|ping|latency|gta)\b"),
    ("Benefits / low income", r"\b(benefit|universal credit|social tariff|low income|pension|pensioner|elderly)\b"),
    ("Business", r"\b(business|office|leased line|static ip|sme|voip)\b"),
    ("Families / households", r"\b(family|household|kids|large home)\b"),
    ("Movers / renters", r"\b(moving|move house|renter|renting|new build|landlord)\b"),
    ("Streamers / TV", r"\b(tv|netflix|stream|streaming|sport|sky sports|tnt)\b"),
    ("Phone / landline users", r"\b(phone|landline|calls|digital voice)\b"),
    ("Mobile bundlers", r"\b(mobile|sim|esim|bundle)\b"),
    ("Rural", r"\b(rural|satellite|starlink|village|countryside)\b"),
]


def guide_subtype(path: str) -> str:
    slug = path.rsplit("/", 1)[-1]
    if re.search(r"black-friday|christmas|cyber|sale", slug):
        return "seasonal"
    if re.search(r"(^best-|cheapest|-deals|^top-|-providers-uk$|discounts)", slug):
        return "commercial roundup"
    if re.search(r"(student|benefit|social-tariff|business|gaming|pensioner|rural|no-credit)", slug):
        return "audience guide"
    if re.search(r"(explained|^what-|^how-|^why-|checklist|^can-|^is-|^do-|-guide$|rights|fix-|replace-)", slug):
        return "explainer / how-to"
    if path in ("/guides", "/broadband-glossary"):
        return "hub"
    return "explainer / how-to"


def position_bucket(position: float) -> str:
    if position <= 3:
        return "1-3"
    if position <= 10:
        return "4-10"
    if position <= 20:
        return "11-20"
    if position <= 50:
        return "21-50"
    return "50+"


# ---------------------------------------------------------------------------
# Data: GSC + GA4
# ---------------------------------------------------------------------------

def windows() -> dict[str, date]:
    end = date.today() - timedelta(days=GSC_LAG_DAYS)
    start = end - timedelta(days=GSC_WINDOW_DAYS - 1)
    prev_end = start - timedelta(days=1)
    prev_start = prev_end - timedelta(days=GSC_WINDOW_DAYS - 1)
    return {"start": start, "end": end, "prev_start": prev_start, "prev_end": prev_end}


def ga4_report(client: GoogleClient, start: date, end: date, dimensions: list[str],
               metrics: list[str]) -> list[dict[str, Any]]:
    payload = {
        "dateRanges": [{"startDate": start.isoformat(), "endDate": end.isoformat()}],
        "dimensions": [{"name": d} for d in dimensions],
        "metrics": [{"name": m} for m in metrics],
        "limit": "100000",
    }
    try:
        resp = client.request("POST", f"{GA_BASE}/properties/{GA4_PROPERTY}:runReport", payload)
    except Exception as exc:  # noqa: BLE001
        print(f"GA4 report skipped ({dimensions}): {exc}", file=sys.stderr)
        return []
    rows = []
    for row in resp.get("rows", []):
        dims = [v.get("value", "") for v in row.get("dimensionValues", [])]
        vals = [float(v.get("value", 0) or 0) for v in row.get("metricValues", [])]
        rows.append({**dict(zip(dimensions, dims)), **dict(zip(metrics, vals))})
    return rows


def gather_data(client: GoogleClient) -> dict[str, Any]:
    w = windows()
    print(f"GSC window {w['start']} to {w['end']} (vs {w['prev_start']} to {w['prev_end']})")
    cur_pages = gsc_query(client, w["start"], w["end"], ["page"])
    prev_pages = gsc_query(client, w["prev_start"], w["prev_end"], ["page"])
    page_query = gsc_query(client, w["start"], w["end"], ["page", "query"])
    page_device = gsc_query(client, w["start"], w["end"], ["page", "device"])

    print("GA4: sessions/engagement by page, channel and device")
    ga_sessions = ga4_report(
        client, w["start"], w["end"],
        ["pagePath", "sessionDefaultChannelGroup", "deviceCategory"],
        ["sessions", "engagedSessions", "userEngagementDuration", "screenPageViews"],
    )
    print("GA4: events by page")
    ga_events = ga4_report(client, w["start"], w["end"], ["pagePath", "eventName"], ["eventCount"])

    return {
        "windows": {k: v.isoformat() for k, v in w.items()},
        "cur_pages": cur_pages, "prev_pages": prev_pages,
        "page_query": page_query, "page_device": page_device,
        "ga_sessions": ga_sessions, "ga_events": ga_events,
    }


def league(data: dict[str, Any]) -> list[dict[str, Any]]:
    agg: dict[str, dict[str, float]] = defaultdict(lambda: defaultdict(float))
    pages_per_type: dict[str, set[str]] = defaultdict(set)
    for row in data["cur_pages"]:
        path = path_of(row["keys"][0])
        t = classify_page_type(path)
        agg[t]["impressions"] += row["impressions"]
        agg[t]["clicks"] += row["clicks"]
        agg[t]["pos_weighted"] += row["position"] * row["impressions"]
        pages_per_type[t].add(path)
    for row in data["prev_pages"]:
        t = classify_page_type(path_of(row["keys"][0]))
        agg[t]["prev_impressions"] += row["impressions"]
        agg[t]["prev_clicks"] += row["clicks"]
    for row in data["ga_sessions"]:
        t = classify_page_type(path_of(row["pagePath"]))
        agg[t]["sessions_all"] += row["sessions"]
        agg[t]["engaged_all"] += row["engagedSessions"]
        agg[t]["engagement_seconds"] += row["userEngagementDuration"]
        if "Organic" in row["sessionDefaultChannelGroup"]:
            agg[t]["organic_sessions"] += row["sessions"]
    for row in data["ga_events"]:
        t = classify_page_type(path_of(row["pagePath"]))
        if row["eventName"] in COMMERCIAL_EVENTS:
            agg[t][row["eventName"]] += row["eventCount"]
        if row["eventName"] == "ai_referral_visit":
            agg[t]["ai_referral"] += row["eventCount"]

    eligible = {t: v for t, v in agg.items() if t not in EXCLUDED_TYPES and v["impressions"] > 0}

    def top(key: str) -> float:
        return max((v.get(key, 0) for v in eligible.values()), default=0) or 1

    rows = []
    for t, v in eligible.items():
        pages = max(1, len(pages_per_type[t]))
        sessions = v.get("sessions_all", 0)
        clicks_out = v.get("outbound_provider_click", 0)
        efficiency = min(1.0, (v.get("organic_sessions", 0) / pages) / 3.0)
        score = 100 * (
            0.30 * v["impressions"] / top("impressions")
            + 0.20 * v["clicks"] / top("clicks")
            + 0.30 * v.get("organic_sessions", 0) / top("organic_sessions")
            + 0.10 * v.get("ai_referral", 0) / top("ai_referral")
            + 0.10 * efficiency
        )
        rows.append({
            "key": t,
            "label": TYPE_META.get(t, {}).get("label", t),
            "score": round(score, 1),
            "pages": pages,
            "impressions": v["impressions"],
            "clicks": v["clicks"],
            "ctr": v["clicks"] / v["impressions"] if v["impressions"] else 0,
            "avg_position": v["pos_weighted"] / v["impressions"] if v["impressions"] else 0,
            "impression_change_pct": (
                100 * (v["impressions"] - v.get("prev_impressions", 0)) / v["prev_impressions"]
                if v.get("prev_impressions") else None
            ),
            "click_change_pct": (
                100 * (v["clicks"] - v.get("prev_clicks", 0)) / v["prev_clicks"]
                if v.get("prev_clicks") else None
            ),
            "organic_sessions": v.get("organic_sessions", 0),
            "sessions_all": sessions,
            "engagement_rate": v.get("engaged_all", 0) / sessions if sessions else 0,
            "avg_engagement_seconds": v.get("engagement_seconds", 0) / sessions if sessions else 0,
            "outbound_provider_click": clicks_out,
            "postcode_submit": v.get("postcode_submit", 0),
            "newsletter_signup_request": v.get("newsletter_signup_request", 0),
            "outbound_per_100_sessions": 100 * clicks_out / sessions if sessions else 0,
            "ai_referral": v.get("ai_referral", 0),
        })
    return sorted(rows, key=lambda r: r["score"], reverse=True)


def audience(data: dict[str, Any], page_type: str, serp: dict[str, Any]) -> dict[str, Any]:
    intents: Counter = Counter()
    intent_clicks: Counter = Counter()
    segments: Counter = Counter()
    buckets: Counter = Counter()
    bucket_clicks: Counter = Counter()
    queries: Counter = Counter()
    query_pos: dict[str, list[float]] = defaultdict(list)
    subtype_impr: Counter = Counter()
    subtype_clicks: Counter = Counter()
    subtype_pages: dict[str, set[str]] = defaultdict(set)
    total = 0.0
    for row in data["page_query"]:
        path = path_of(row["keys"][0])
        if classify_page_type(path) != page_type:
            continue
        q = row["keys"][1].lower()
        impr, clicks = row["impressions"], row["clicks"]
        total += impr
        queries[q] += impr
        query_pos[q].append(row["position"])
        hit = False
        for label, pattern in QUERY_INTENTS:
            if re.search(pattern, q):
                intents[label] += impr
                intent_clicks[label] += clicks
                hit = True
        if not hit:
            intents["generic head term"] += impr
        for label, pattern in AUDIENCE_SEGMENTS:
            if re.search(pattern, q):
                segments[label] += impr
        b = position_bucket(row["position"])
        buckets[b] += impr
        bucket_clicks[b] += clicks
        st = guide_subtype(path) if page_type == "guide" else page_type
        subtype_impr[st] += impr
        subtype_clicks[st] += clicks
        subtype_pages[st].add(path)

    devices: Counter = Counter()
    device_clicks: Counter = Counter()
    for row in data["page_device"]:
        if classify_page_type(path_of(row["keys"][0])) == page_type:
            devices[row["keys"][1]] += row["impressions"]
            device_clicks[row["keys"][1]] += row["clicks"]
    ga_devices: Counter = Counter()
    for row in data["ga_sessions"]:
        if classify_page_type(path_of(row["pagePath"])) == page_type:
            ga_devices[row["deviceCategory"]] += row["sessions"]

    paa: list[str] = []
    for q, x in serp.items():
        if x.get("type") == page_type:
            paa.extend(x.get("people_also_ask", []))

    def share(counter: Counter, denom: float) -> list[dict[str, Any]]:
        return [{"label": k, "impressions": v, "share_pct": round(100 * v / denom, 1) if denom else 0}
                for k, v in counter.most_common()]

    return {
        "total_query_impressions": total,
        "intents": [
            {**r, "clicks": intent_clicks.get(r["label"], 0)} for r in share(intents, total)
        ],
        "segments": share(segments, total),
        "position_buckets": [
            {"bucket": b, "impressions": buckets.get(b, 0), "clicks": bucket_clicks.get(b, 0),
             "share_pct": round(100 * buckets.get(b, 0) / total, 1) if total else 0}
            for b in ("1-3", "4-10", "11-20", "21-50", "50+")
        ],
        "gsc_devices": [{"device": d, "impressions": v, "clicks": device_clicks[d]} for d, v in devices.most_common()],
        "ga4_devices": [{"device": d, "sessions": v} for d, v in ga_devices.most_common()],
        "top_queries": [
            {"query": q, "impressions": v,
             "avg_position": round(sum(query_pos[q]) / len(query_pos[q]), 1)}
            for q, v in queries.most_common(40)
        ],
        "subtypes": [
            {"subtype": st, "impressions": v, "clicks": subtype_clicks[st],
             "pages": len(subtype_pages[st]),
             "share_pct": round(100 * v / total, 1) if total else 0}
            for st, v in subtype_impr.most_common()
        ],
        "people_also_ask": sorted(set(paa)),
    }


def top_pages(data: dict[str, Any], page_type: str, n: int = 12) -> list[dict[str, Any]]:
    sessions: Counter = Counter()
    engaged: Counter = Counter()
    outbound: Counter = Counter()
    for row in data["ga_sessions"]:
        p = path_of(row["pagePath"])
        sessions[p] += row["sessions"]
        engaged[p] += row["engagedSessions"]
    for row in data["ga_events"]:
        if row["eventName"] == "outbound_provider_click":
            outbound[path_of(row["pagePath"])] += row["eventCount"]
    rows = []
    for row in data["cur_pages"]:
        p = path_of(row["keys"][0])
        if classify_page_type(p) != page_type:
            continue
        rows.append({
            "path": p, "subtype": guide_subtype(p) if page_type == "guide" else page_type,
            "impressions": row["impressions"], "clicks": row["clicks"],
            "ctr": row["ctr"], "position": row["position"],
            "sessions": sessions.get(p, 0),
            "engagement_rate": engaged[p] / sessions[p] if sessions.get(p) else None,
            "outbound_clicks": outbound.get(p, 0),
        })
    return sorted(rows, key=lambda r: r["impressions"], reverse=True)[:n]


# ---------------------------------------------------------------------------
# SERP evidence (cached, no quota)
# ---------------------------------------------------------------------------

def load_serp() -> dict[str, Any]:
    merged: dict[str, Any] = {}
    for f in sorted(SERP_CACHE_DIR.glob("*-page-ux-raw.json")):
        try:
            merged.update(json.loads(f.read_text(encoding="utf-8")).get("serp", {}))
        except (json.JSONDecodeError, OSError):
            continue
    return merged


def serp_winners(serp: dict[str, Any], page_type: str) -> list[dict[str, Any]]:
    by_domain: dict[str, dict[str, Any]] = {}
    for q, x in serp.items():
        if x.get("type") != page_type:
            continue
        for o in x.get("organic_top10", []):
            d = by_domain.setdefault(o["domain"], {"domain": o["domain"], "appearances": 0,
                                                   "best_rank": 99, "examples": []})
            d["appearances"] += 1
            d["best_rank"] = min(d["best_rank"], o.get("rank", 99))
            if len(d["examples"]) < 3:
                d["examples"].append({"query": q, "rank": o.get("rank"), "title": o.get("title"),
                                      "url": o.get("link")})
        for ref in x.get("ai_references", []) or []:
            dom = ref.get("domain") or urlsplit(ref.get("link", "")).netloc.replace("www.", "")
            if dom:
                by_domain.setdefault(dom, {"domain": dom, "appearances": 0, "best_rank": 99,
                                           "examples": []})
                by_domain[dom]["ai_citations"] = by_domain[dom].get("ai_citations", 0) + 1
    return sorted(by_domain.values(), key=lambda d: (-d["appearances"], d["best_rank"]))


# ---------------------------------------------------------------------------
# Affiliate benchmark: discover equivalent pages, then scrape features
# ---------------------------------------------------------------------------

# Topics drawn from our highest-impression guide URLs. Pattern is matched
# against competitor URL paths during discovery.
TOPICS: list[tuple[str, str]] = [
    ("phone + broadband", r"(phone-and-broadband|broadband-and-phone|broadband-phone|landline|calls)"),
    ("mobile bundles", r"(mobile-and-broadband|broadband-and-mobile|mobile-broadband|bundle)"),
    ("full fibre", r"(full-fibre|fibre-optic|fibre_optic|fibre-broadband|/fibre)"),
    ("no contract / rolling", r"(no-contract|rolling|30-day|one-month|monthly|short-term|12-month)"),
    ("students", r"student"),
    ("gaming", r"gaming"),
    ("social tariffs", r"(social-tariff|benefit|low-income|pensioner)"),
    ("business", r"business"),
    ("cheap", r"cheap"),
    ("TV bundles", r"(tv-and-broadband|broadband-and-tv|tv-broadband|digital_tv|broadband-tv)"),
    ("speed", r"(speed|mbps)"),
]

# Sites ordered roughly by UK broadband affiliate weight. `seeds` are hubs
# crawled for links. `kind` describes the business model being learned from.
AFFILIATE_SITES: list[dict[str, Any]] = [
    {"name": "Uswitch", "domain": "uswitch.com", "kind": "comparison giant (affiliate)",
     "seeds": ["https://www.uswitch.com/broadband/", "https://www.uswitch.com/broadband/guides/"]},
    {"name": "MoneySavingExpert", "domain": "moneysavingexpert.com", "kind": "consumer-champion editorial + comparison",
     "seeds": ["https://www.moneysavingexpert.com/compare-broadband-deals/",
               "https://www.moneysavingexpert.com/broadband-and-tv/"]},
    {"name": "Broadband Choices", "domain": "broadbandchoices.co.uk", "kind": "specialist comparison (affiliate)",
     "seeds": ["https://www.broadbandchoices.co.uk/", "https://www.broadbandchoices.co.uk/guides"]},
    {"name": "Cable.co.uk", "domain": "cable.co.uk", "kind": "specialist comparison + original research",
     "seeds": ["https://www.cable.co.uk/broadband/", "https://www.cable.co.uk/guides/"]},
    {"name": "Broadband Genie", "domain": "broadbandgenie.co.uk", "kind": "specialist comparison (affiliate)",
     "seeds": ["https://www.broadbandgenie.co.uk/", "https://www.broadbandgenie.co.uk/broadband/help"]},
    {"name": "money.co.uk", "domain": "money.co.uk", "kind": "finance comparison (affiliate)",
     "seeds": ["https://www.money.co.uk/broadband"]},
    {"name": "Choose", "domain": "choose.co.uk", "kind": "specialist comparison + guides",
     "seeds": ["https://www.choose.co.uk/broadband/", "https://www.choose.co.uk/guide/"]},
    {"name": "Confused.com", "domain": "confused.com", "kind": "price-comparison giant",
     "seeds": ["https://www.confused.com/broadband"]},
    {"name": "Which?", "domain": "which.co.uk", "kind": "independent reviews (trust leader)",
     "seeds": ["https://broadband.which.co.uk/", "https://www.which.co.uk/reviews/broadband"]},
    {"name": "TechRadar", "domain": "techradar.com", "kind": "tech publisher (affiliate deals)",
     "seeds": ["https://www.techradar.com/uk/broadband", "https://www.techradar.com/news/best-broadband-deals"]},
    {"name": "broadband.co.uk", "domain": "broadband.co.uk", "kind": "specialist comparison",
     "seeds": ["https://www.broadband.co.uk/broadband/", "https://www.broadband.co.uk/broadband/help/"]},
    {"name": "ISPreview", "domain": "ispreview.co.uk", "kind": "industry news (topical authority)",
     "seeds": ["https://www.ispreview.co.uk/"], "path_filter": r"\.html$"},
    {"name": "Best Broadband Deals", "domain": "bestbroadbanddeals.co.uk", "kind": "independent affiliate",
     "seeds": ["https://bestbroadbanddeals.co.uk/"]},
]

# Behind bot protection for a static fetch; learned from via SERP evidence only.
SERP_ONLY_SITES = ["moneysupermarket.com", "comparethemarket.com", "gocompare.com", "forbes.com"]

# Multi-vertical sites (money.co.uk, Confused, MSE, TechRadar) link to car
# insurance, SIM-only and news from their broadband hubs; keep discovery to
# broadband category/guide pages. ISPreview is news-led, so allow its articles.
BROADBAND_PATH = r"(broadband|fibre|wifi|internet)"
EXCLUDE_PATH = r"(/go/|/mobiles?/|/sim-only|/news/|/pro/|/gaming/$|/deals/best-[a-z-]+-\d{8}|/for-businesses|/postcode)"

LINK_RE = re.compile(r'<a\b[^>]*href=["\']([^"\'#]+)["\']', re.I)


def same_site(url: str, domain: str) -> bool:
    host = urlsplit(url).netloc.lower()
    return host == domain or host.endswith("." + domain)


def discover_pages(site: dict[str, Any], max_pages: int, extra_urls: list[str]) -> list[dict[str, str]]:
    """Crawl seed hubs once, match links to TOPICS, return one URL per topic."""
    candidates: set[str] = set(u for u in extra_urls if same_site(u, site["domain"]))
    for seed in site["seeds"]:
        fetch = http_get(seed, timeout=15)
        time.sleep(0.4)
        if not fetch["ok"]:
            continue
        for href in LINK_RE.findall(fetch["html"]):
            url = urljoin(seed, href).split("?")[0]
            if (same_site(url, site["domain"]) and url.startswith("http")
                    and re.search(site.get("path_filter", BROADBAND_PATH), urlsplit(url).path.lower())
                    and not re.search(EXCLUDE_PATH, urlsplit(url).path.lower())):
                candidates.add(url.rstrip("/") + "/" if not re.search(r"\.\w{2,4}$", url) else url)
    picked: list[dict[str, str]] = []
    used: set[str] = set()
    for topic, pattern in TOPICS:
        matches = sorted(
            (u for u in candidates if re.search(pattern, urlsplit(u).path.lower()) and u not in used
             and not re.search(r"/(providers?|reviews?)/[^/]+/(deals/)?$|/postcode|/news/\d|login|account", u)),
            key=lambda u: (urlsplit(u).path.count("/"), len(u)),
        )
        if matches:
            picked.append({"topic": topic, "url": matches[0]})
            used.add(matches[0])
        if len(picked) >= max_pages:
            break
    return picked


def first_index(pattern: str, text: str) -> float | None:
    m = re.search(pattern, text, flags=re.I)
    return round(m.start() / max(1, len(text)), 3) if m else None


def guide_features(html: str) -> dict[str, Any]:
    """Features beyond PageScan that matter for commercial guides / category hubs."""
    raw = html.lower()
    body = re.sub(r"<(script|style|noscript)[^>]*>.*?</\1>", " ", raw, flags=re.S)
    text = re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", body))
    links = LINK_RE.findall(html)
    external_sources = [
        l for l in links
        if re.search(r"(ofcom\.org\.uk|gov\.uk|thinkbroadband|citizensadvice|ons\.gov|which\.co\.uk|"
                     r"openreach|parliament\.uk|ico\.org\.uk|asa\.org\.uk)", l.lower())
    ]
    prices = re.findall(r"£\s?\d+(?:\.\d{2})?\s*(?:a|per|/)\s*(?:month|mth|mo)", text)
    words = len(text.split())
    return {
        "deal_module_in_body": bool(re.search(r"(get deal|see deal|view deal|go to (site|deal)|"
                                              r"see offer|check availability)", text)),
        "price_per_month_mentions": len(prices),
        # Relative position (0 = top) of the first monthly price in visible text.
        "first_price_position": first_index(r"£\s?\d+(?:\.\d{2})?\s*(?:a|per|/)\s*(?:month|mth|mo)", text),
        "first_postcode_position": first_index(r"(enter (your|a) postcode|postcode)", text),
        "provider_logo_count": len(re.findall(
            r"<img[^>]+(?:alt|src)=[\"'][^\"']*(bt|sky|virgin|vodafone|talktalk|plusnet|hyperoptic|"
            r"community.?fibre|ee|shell|now|zen|youfibre|cuckoo)[^\"']*[\"']", raw)),
        "best_for_labels": len(re.findall(r"\bbest for\b", text)),
        "star_or_score": bool(re.search(r"(\d(\.\d)?\s*(/|out of)\s*(5|10)\b|class=\"[^\"]*(star|rating))", raw)),
        "author_bio_box": bool(re.search(r"(about the author|meet the (author|expert)|"
                                         r"(senior|chief|broadband|telecoms|consumer)\s+(editor|writer|expert|analyst))", text)),
        "author_credentials": bool(re.search(r"(years'? (of )?experience|has (written|covered)|"
                                             r"specialist in|qualified|journalist)", text)),
        "author_schema_person": '"@type":"person"' in raw.replace(" ", "") or '"@type": "person"' in raw,
        "expert_quote": len(re.findall(r"<blockquote\b", raw)) + len(re.findall(r"\b(says|said|explains)\s+[A-Z]", html)),
        "external_source_links": len(external_sources),
        "internal_link_count": sum(1 for l in links if l.startswith("/") and not l.startswith("//")),
        "image_count": len(re.findall(r"<img\b", raw)),
        "infographic_or_chart": bool(re.search(r"(infographic|<svg[^>]+class=\"[^\"]*chart|<canvas\b|recharts|highcharts)", raw)),
        "key_takeaways": bool(re.search(r"(key (takeaways|points|facts)|at a glance|in brief|the short answer|summary)", text)),
        "reading_time": bool(re.search(r"\b\d+\s*min(ute)?s?\s*read\b", text)),
        "tabs_ui": len(re.findall(r'role=["\']tab["\']', raw)),
        "accordions": len(re.findall(r"<details\b", raw)) + len(re.findall(r'aria-expanded=', raw)),
        "newsletter_signup": bool(re.search(r"(newsletter|sign up for (our|deal)|get (the best )?deals in your inbox)", text)),
        "was_this_helpful": bool(re.search(r"(was this (page|article|guide) (helpful|useful)|rate this (page|article))", text)),
        "affiliate_disclosure": bool(re.search(r"(we may (earn|receive)|commission|how we make money|"
                                               r"paid (by|from) (providers|partners)|affiliate)", text)),
        "price_rise_info": bool(re.search(r"(mid.contract|price rise|price increase|£\d+(\.\d{2})? (a|per) month (rise|increase))", text)),
        "setup_cost_info": bool(re.search(r"(set.?up (fee|cost|charge)|upfront cost|activation fee)", text)),
        "contract_length_info": bool(re.search(r"\b(12|18|24)[- ]month\b", text)),
        "speed_visual": bool(re.search(r"(class=\"[^\"]*speed[^\"]*(bar|meter|gauge)|average download speed)", raw)),
        "glossary_tooltips": len(re.findall(r"<abbr\b", raw)) + len(re.findall(r"(data-tooltip|role=\"tooltip\")", raw)),
        "social_share": bool(re.search(r"(share on (facebook|x|twitter|whatsapp)|sharer\.php|whatsapp://|twitter\.com/intent)", raw)),
        "comments_or_community": bool(re.search(r"(leave a comment|comments \(\d+|disqus|join the (discussion|forum))", text)),
        "sticky_cta_or_bar": bool(re.search(r"class=\"[^\"]*(sticky|fixed bottom|fixed-bottom|position-fixed)", raw)),
        "editorial_independence_statement": bool(re.search(r"(independent|impartial|unbiased|editorial (independence|standards|policy))", text)),
        "methodology_on_page": bool(re.search(r"(how we (choose|chose|pick|rank|compare|test|rate)|our methodology|why trust us)", text)),
        "ai_or_chat_assistant": bool(re.search(r"(ask (our )?(ai|assistant)|chat with|chatbot|ai assistant)", text)),
        "price_history_or_tracker": bool(re.search(r"(price history|price tracker|lowest price (in|for)|price drop)", text)),
        "user_reviews_or_ratings": bool(re.search(r"(customer reviews|user reviews|trustpilot|reviews from (real )?customers)", text)),
        "original_data": bool(re.search(r"(our (research|survey|analysis|data) (found|shows|reveals)|we (surveyed|analysed|analyzed|tested))", text)),
        "word_count_visible": words,
    }


def scrape(url: str, name: str, side: str, topic: str) -> dict[str, Any]:
    fetch = http_get(url, timeout=18)
    row: dict[str, Any] = {"site": name, "side": side, "topic": topic, "url": url,
                           "status": fetch.get("status") or fetch.get("error"), "ok": False}
    if not fetch["ok"] or not fetch["html"]:
        return row
    base = asdict(scan_html("guide", side, name, url, fetch["html"], int(fetch["status"] or 200)))
    if base.get("is_bot_wall"):
        row["status"] = "bot wall"
        return row
    keep = ("title", "h1", "title_len", "title_has_year", "title_has_current_month", "word_count", "h2_count",
            "question_h2_count", "table_count", "has_postcode_input", "jsonld_types", "has_faq",
            "has_faq_schema", "has_breadcrumb_schema", "has_product_or_offer_schema", "has_toc",
            "has_card_layout", "has_badge_chip", "has_rating", "has_pros_cons", "has_compare_table",
            "has_related", "has_updated_date", "has_author_byline", "has_named_author",
            "has_concise_answer", "has_calculator_widget", "get_deal_cta_count", "has_filter_controls",
            "has_sort_control", "has_quiz_or_wizard", "has_price_alert", "has_video_content",
            "has_trust_badges", "has_methodology_link", "has_save_or_shortlist", "has_deal_count_badge",
            "has_existing_vs_new_customer", "has_bundle_toggle", "has_live_chat")
    row.update({k: base.get(k) for k in keep})
    row.update(guide_features(fetch["html"]))
    row["ok"] = True
    return row


# Feature -> (label, group, why it matters for a broadband affiliate)
FEATURE_CATALOGUE: list[tuple[str, str, str, str]] = [
    ("deal_module_in_body", "Live deal module inside the page", "Monetisation",
     "Top affiliates never make a commercial reader leave the page to see prices."),
    ("first_price_position", "Prices appear in the first 25% of the page", "Monetisation",
     "Commercial queries are answered with prices, not preamble."),
    ("get_deal_cta_count", "Deal CTAs (count)", "Monetisation", "Each CTA sits next to the claim it supports."),
    ("has_postcode_input", "Postcode / availability checker", "Monetisation",
     "Availability is the #1 broadband objection; the checker is the main conversion step."),
    ("best_for_labels", "'Best for…' labels on options", "Decision support",
     "Maps a deal to a need (students, gamers, families) instead of one opaque ranking."),
    ("has_compare_table", "Price/speed/contract comparison table", "Decision support",
     "Lets readers compare like with like at a glance."),
    ("has_card_layout", "Deal cards", "Decision support", "Mobile-friendly alternative to wide tables."),
    ("has_filter_controls", "Filters", "Decision support", "Readers narrow to their own needs."),
    ("has_sort_control", "Sort control", "Decision support", "Cheapest/fastest first on demand."),
    ("has_quiz_or_wizard", "Needs quiz / wizard", "Decision support", "Converts undecided readers."),
    ("has_calculator_widget", "Calculator / slider", "Decision support", "Personalises an abstract answer."),
    ("tabs_ui", "Tabs (e.g. broadband only / + TV)", "Decision support", "Keeps long comparisons scannable."),
    ("price_rise_info", "Mid-contract price-rise info", "Decision support",
     "UK-specific objection; Ofcom's 2025 rules made this a trust signal."),
    ("setup_cost_info", "Setup / upfront cost info", "Decision support", "Total cost, not headline price."),
    ("has_concise_answer", "Quick answer / key takeaways", "SEO / GEO",
     "Featured-snippet and AI-Overview friendly; respects reader time."),
    ("question_h2_count", "Question-shaped H2s (count)", "SEO / GEO", "Matches People Also Ask phrasing."),
    ("has_faq", "Visible FAQ", "SEO / GEO", "Catches long-tail objections."),
    ("has_toc", "Jump links / table of contents", "UX", "Long pages stay navigable."),
    ("has_breadcrumb_schema", "Breadcrumb schema", "SEO / GEO", "Hub-and-spoke structure for crawlers."),
    ("has_product_or_offer_schema", "Product / Offer schema", "SEO / GEO", "Price-rich results eligibility."),
    ("author_schema_person", "Person schema for author", "Authority (E-E-A-T)", "Machine-readable expertise."),
    ("has_named_author", "Named individual author", "Authority (E-E-A-T)",
     "Google's quality raters look for a real, accountable person."),
    ("author_bio_box", "Author bio box with role", "Authority (E-E-A-T)", "Shows why this person is qualified."),
    ("expert_quote", "Expert quotes / blockquotes (count)", "Authority (E-E-A-T)",
     "First-hand expertise and quotable lines for press and AI."),
    ("external_source_links", "Links to Ofcom / GOV.UK / primary sources (count)", "Authority (E-E-A-T)",
     "Claims are checkable; regulators are the strongest citations."),
    ("original_data", "Original research / data claims", "Authority (E-E-A-T)",
     "The single biggest earner of backlinks in this niche (Cable.co.uk's model)."),
    ("has_updated_date", "Visible updated / checked date", "Trust", "Broadband prices change weekly."),
    ("affiliate_disclosure", "Affiliate disclosure", "Trust", "Legal (CMA/ASA) and a trust signal."),
    ("methodology_on_page", "On-page 'how we choose' methodology", "Trust", "Answers 'is this rigged?'."),
    ("editorial_independence_statement", "Independence statement", "Trust", "Differentiates from provider sites."),
    ("has_trust_badges", "Trustpilot / press badges", "Trust", "Third-party proof."),
    ("user_reviews_or_ratings", "Customer reviews / ratings", "Trust", "Social proof from real users."),
    ("star_or_score", "Scores / ratings on options", "Trust", "Fast comparison signal."),
    ("key_takeaways", "Summary / key points box", "UX", "Skimmers get the answer."),
    ("reading_time", "Reading time", "UX", "Sets expectations on long guides."),
    ("accordions", "Accordions / expandable detail (count)", "UX", "Depth without clutter on mobile."),
    ("image_count", "Images (count)", "UX", "Visual rhythm and explanation."),
    ("infographic_or_chart", "Charts / infographics", "UX", "Linkable assets; explain data quickly."),
    ("glossary_tooltips", "Jargon tooltips (count)", "UX", "FTTP, Mbps, OTS explained in place."),
    ("has_video_content", "Video", "UX", "Dwell time and an extra SERP surface."),
    ("newsletter_signup", "Newsletter / deal alert signup", "Retention", "Owns the audience beyond Google."),
    ("has_price_alert", "Price alert", "Retention", "Captures 'not now' visitors."),
    ("has_save_or_shortlist", "Save / shortlist", "Retention", "Brings readers back to convert later."),
    ("was_this_helpful", "'Was this helpful?' feedback", "Retention", "Cheap UX research loop."),
    ("social_share", "Share buttons", "Retention", "WhatsApp sharing is common for household decisions."),
    ("has_related", "Related guides block", "SEO / GEO", "Topical clustering and internal links."),
    ("internal_link_count", "Internal links (count)", "SEO / GEO", "Distributes authority across the hub."),
    ("ai_or_chat_assistant", "AI / chat assistant", "Innovation", "Emerging; answers eligibility questions."),
    ("sticky_cta_or_bar", "Sticky CTA / bar", "Monetisation", "Next action always within reach."),
]
COUNT_FEATURES = {"get_deal_cta_count", "best_for_labels", "question_h2_count", "expert_quote",
                  "external_source_links", "accordions", "image_count", "glossary_tooltips",
                  "internal_link_count", "tabs_ui"}


def feature_present(row: dict[str, Any], attr: str) -> bool:
    v = row.get(attr)
    if attr == "first_price_position":
        return v is not None and v <= 0.25
    return bool(v)


def gap_matrix(comp: list[dict[str, Any]], ours: list[dict[str, Any]]) -> list[dict[str, Any]]:
    comp_ok = [r for r in comp if r.get("ok")]
    ours_ok = [r for r in ours if r.get("ok")]
    rows = []
    for attr, label, group, why in FEATURE_CATALOGUE:
        c_hits = [r for r in comp_ok if feature_present(r, attr)]
        o_hits = [r for r in ours_ok if feature_present(r, attr)]
        entry = {
            "attr": attr, "feature": label, "group": group, "why": why,
            "competitor_pct": round(100 * len(c_hits) / len(comp_ok)) if comp_ok else 0,
            "ours_pct": round(100 * len(o_hits) / len(ours_ok)) if ours_ok else 0,
            "example_sites": sorted({r["site"] for r in c_hits})[:6],
        }
        if attr in COUNT_FEATURES:
            def avg(rows_: list[dict[str, Any]]) -> float:
                return round(sum(float(r.get(attr) or 0) for r in rows_) / len(rows_), 1) if rows_ else 0.0
            entry["competitor_avg"] = avg(comp_ok)
            entry["ours_avg"] = avg(ours_ok)
        entry["gap_points"] = entry["competitor_pct"] - entry["ours_pct"]
        rows.append(entry)
    return sorted(rows, key=lambda r: -r["gap_points"])


# ---------------------------------------------------------------------------
# Report
# ---------------------------------------------------------------------------

def pct(v: float | None) -> str:
    return "n/a" if v is None else f"{v:+.0f}%"


def markdown(result: dict[str, Any]) -> str:
    L: list[str] = []
    w = result["windows"]
    winner = result["league"][0]
    aud = result["audience"]
    L += [
        "# Page-type redesign research",
        "",
        f"Generated {result['generated']} by `scripts/research_page_type_redesign.py`. "
        f"GSC/GA4 window {w['start']} to {w['end']} vs {w['prev_start']} to {w['prev_end']}.",
        "",
        f"## 1. Decision: {winner['label']}",
        "",
        "| Rank | Type | Score | Pages | Impr. | Δ impr. | Clicks | CTR | Avg pos. | Organic sessions | Engaged | Outbound /100 sessions | AI referrals |",
        "|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|",
    ]
    for i, r in enumerate(result["league"], 1):
        L.append(
            f"| {i} | {r['label']} | {r['score']} | {r['pages']} | {r['impressions']:,.0f} | "
            f"{pct(r['impression_change_pct'])} | {r['clicks']:,.0f} | {100*r['ctr']:.2f}% | "
            f"{r['avg_position']:.1f} | {r['organic_sessions']:,.0f} | {100*r['engagement_rate']:.0f}% | "
            f"{r['outbound_per_100_sessions']:.1f} | {r['ai_referral']:,.0f} |"
        )
    L += ["", "## 2. Audience", "", "### Ranking position of impressions", "",
          "| Position | Impressions | Share | Clicks |", "|---|---:|---:|---:|"]
    for b in aud["position_buckets"]:
        L.append(f"| {b['bucket']} | {b['impressions']:,.0f} | {b['share_pct']}% | {b['clicks']:,.0f} |")
    L += ["", "### Query intent (a query can carry several)", "", "| Intent | Share of impressions | Clicks |", "|---|---:|---:|"]
    for r in aud["intents"]:
        L.append(f"| {r['label']} | {r['share_pct']}% | {r['clicks']:,.0f} |")
    L += ["", "### Audience segments", "", "| Segment | Share of impressions |", "|---|---:|"]
    for r in aud["segments"]:
        L.append(f"| {r['label']} | {r['share_pct']}% |")
    L += ["", "### Template sub-types", "", "| Sub-type | Pages | Share of impressions | Clicks |", "|---|---:|---:|---:|"]
    for r in aud["subtypes"]:
        L.append(f"| {r['subtype']} | {r['pages']} | {r['share_pct']}% | {r['clicks']:,.0f} |")
    L += ["", "### Devices", ""]
    L.append("GSC impressions: " + ", ".join(f"{d['device']} {d['impressions']:,.0f}" for d in aud["gsc_devices"]))
    L.append("")
    L.append("GA4 sessions: " + ", ".join(f"{d['device']} {d['sessions']:,.0f}" for d in aud["ga4_devices"]))
    L += ["", "### Top queries", "", "| Query | Impressions | Avg pos. |", "|---|---:|---:|"]
    for q in aud["top_queries"][:20]:
        L.append(f"| {q['query']} | {q['impressions']:,.0f} | {q['avg_position']} |")
    L += ["", "### People Also Ask (cached UK SERPs)", ""]
    L += [f"- {q}" for q in aud["people_also_ask"]]
    L += ["", "## 3. Our top pages", "", "| Page | Sub-type | Impr. | Clicks | Pos. | Sessions | Engaged | Outbound |",
          "|---|---|---:|---:|---:|---:|---:|---:|"]
    for p in result["our_top_pages"]:
        er = "n/a" if p["engagement_rate"] is None else f"{100*p['engagement_rate']:.0f}%"
        L.append(f"| `{p['path']}` | {p['subtype']} | {p['impressions']:,.0f} | {p['clicks']:,.0f} | "
                 f"{p['position']:.1f} | {p['sessions']:,.0f} | {er} | {p['outbound_clicks']:,.0f} |")
    L += ["", "## 4. Who wins the SERPs for these queries", "", "| Domain | Top-10 appearances | Best rank | Example |", "|---|---:|---:|---|"]
    for d in result["serp_winners"][:15]:
        ex = d["examples"][0] if d["examples"] else {}
        L.append(f"| {d['domain']} | {d['appearances']} | {d['best_rank']} | {ex.get('title', '')} |")
    L += ["", "## 5. Affiliate pages scraped", "", "| Site | Topic | Status | Words | First price at | Deal CTAs | Named author |", "|---|---|---|---:|---:|---:|---|"]
    for r in result["affiliate_scans"]:
        fp = r.get("first_price_position")
        L.append(f"| {r['site']} | {r['topic']} | {r['status']} | {r.get('word_count_visible', '')} | "
                 f"{'' if fp is None else f'{100*fp:.0f}%'} | {r.get('get_deal_cta_count', '')} | "
                 f"{'yes' if r.get('has_named_author') else ''} |")
    L += ["", f"SERP-only (bot protected): {', '.join(SERP_ONLY_SITES)}.", "",
          "## 6. Feature gap matrix (affiliates vs our top pages)", "",
          "| Feature | Group | Affiliates | Ours | Gap | Avg (aff. / ours) | Examples |", "|---|---|---:|---:|---:|---|---|"]
    for g in result["gap_matrix"]:
        avg = f"{g.get('competitor_avg', '')} / {g.get('ours_avg', '')}" if "competitor_avg" in g else ""
        L.append(f"| {g['feature']} | {g['group']} | {g['competitor_pct']}% | {g['ours_pct']}% | "
                 f"{g['gap_points']:+d} | {avg} | {', '.join(g['example_sites'][:4])} |")
    return "\n".join(L) + "\n"


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--credentials", type=Path, default=DEFAULT_CREDENTIALS)
    parser.add_argument("--max-per-site", type=int, default=4)
    parser.add_argument("--our-pages", type=int, default=8, help="our top pages of the winning type to scrape")
    parser.add_argument("--skip-scrape", action="store_true")
    args = parser.parse_args()

    if not args.credentials.is_file():
        print(f"Credentials not found: {args.credentials}", file=sys.stderr)
        return 2
    client = GoogleClient(args.credentials)
    data = gather_data(client)
    serp = load_serp()
    ranking = league(data)
    page_type = ranking[0]["key"]
    print(f"Winning page type: {page_type}")
    aud = audience(data, page_type, serp)
    ours_top = top_pages(data, page_type)
    winners = serp_winners(serp, page_type)

    affiliate_scans: list[dict[str, Any]] = []
    our_scans: list[dict[str, Any]] = []
    if not args.skip_scrape:
        serp_urls = [ex["url"] for d in winners for ex in d["examples"] if ex.get("url")]
        for site in AFFILIATE_SITES:
            pages = discover_pages(site, args.max_per_site, serp_urls)
            print(f"{site['name']}: {len(pages)} pages discovered")
            for p in pages:
                row = scrape(p["url"], site["name"], "affiliate", p["topic"])
                row["kind"] = site["kind"]
                affiliate_scans.append(row)
                print(f"  [{row['status']}] {p['topic']}: {p['url']}")
                time.sleep(0.5)
        for p in ours_top[: args.our_pages]:
            row = scrape(f"{SITE}{p['path']}", "BroadbandPicker", "ours", p["subtype"])
            our_scans.append(row)
            print(f"  [ours {row['status']}] {p['path']}")
            time.sleep(0.3)

    result = {
        "generated": date.today().isoformat(),
        "windows": data["windows"],
        "page_type": page_type,
        "league": ranking,
        "audience": aud,
        "our_top_pages": ours_top,
        "serp_winners": winners,
        "serp_only_sites": SERP_ONLY_SITES,
        "affiliate_scans": affiliate_scans,
        "our_scans": our_scans,
        "gap_matrix": gap_matrix(affiliate_scans, our_scans) if affiliate_scans else [],
    }
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    OUT_JSON.write_text(json.dumps(result, indent=2, default=str) + "\n", encoding="utf-8")
    OUT_MD.write_text(markdown(result), encoding="utf-8")
    print(f"Saved {OUT_JSON.relative_to(ROOT)} and {OUT_MD.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
