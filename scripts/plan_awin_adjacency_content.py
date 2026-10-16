#!/usr/bin/env python3
"""Keyword research and a build-priority plan for content clusters that would make
BroadbandPicker eligible for adjacent Awin affiliate programmes.

The site's current Awin pool is pure ISPs: the large ones have rejected a young
comparison site and the altnets are pending. Revenue growth needs authority in
adjacent verticals a broadband site is a credible affiliate for. This script
holds a curated candidate-page dataset for six on-genre clusters, assigns a
primary keyword and at least four secondary keywords per page, classifies the
page type, and scores each page for SEO opportunity so the master tracker can
sequence the build highest-opportunity-first.

Keyword-metric honesty: this script never emits fabricated search volume, CPC or
keyword-difficulty numbers. The opportunity score is a transparent 0-100
composite of editorial 1-5 bands (demand, difficulty, content gap, commercial
value) plus optional live SerpApi SERP-shape signal.

Outputs:
  docs/page-build-pipeline/other-awin-memberships.json  (read by build_master_tracker.py)

Usage:
  python3 scripts/plan_awin_adjacency_content.py                 # editorial scoring only
  python3 scripts/plan_awin_adjacency_content.py --run-serp --serp-limit 12
  python3 scripts/plan_awin_adjacency_content.py --skip-tracker
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
import time
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
OUT_JSON = ROOT / "docs" / "page-build-pipeline" / "other-awin-memberships.json"
TRACKER_SCRIPT = ROOT / "scripts" / "build_master_tracker.py"
SERP_CACHE_DIR = ROOT / "docs" / "geo-serp-research"


# ---------------------------------------------------------------------------
# Awin programmes these clusters would unlock or strengthen an application for.
# advertiser_id is the Awin merchant id where known; commission notes are
# directional and must be reconfirmed in the Awin advertiser directory.
# ---------------------------------------------------------------------------
AWIN_TARGETS: dict[str, dict[str, str]] = {
    "smarty": {"name": "SMARTY", "advertiser_id": "10933", "note": "SIM-only, GBP 6 to 15 per validated sale, 30-day cookie"},
    "mozillion": {"name": "Mozillion", "advertiser_id": "31539", "note": "SIM-only, up to GBP 20 per sale"},
    "id_mobile": {"name": "iD Mobile", "advertiser_id": "6366", "note": "SIM-only and handsets, Three network"},
    "o2_mobiles": {"name": "O2 Mobiles", "advertiser_id": "3235", "note": "contracts, SIM-only, PAYG"},
    "mesh_computers": {"name": "Mesh Computers", "advertiser_id": "3936", "note": "IT hardware incl. routers and mesh"},
    "wifi_hire_uk": {"name": "Wifi Hire UK", "advertiser_id": "123734", "note": "pocket wifi and 4G/5G router rental"},
    "router_retailers": {"name": "Router retailers (Currys, AO, TP-Link, Netgear, devolo)", "advertiser_id": "", "note": "networking hardware via retailer programmes"},
    "surfshark": {"name": "Surfshark", "advertiser_id": "", "note": "VPN, ~40% revenue share, 30-day cookie, on Awin"},
    "vpn_other": {"name": "IPVanish / PIA / other VPN", "advertiser_id": "", "note": "VPN, recurring revenue share; NordVPN UK is off Awin"},
    "now": {"name": "NOW", "advertiser_id": "", "note": "streaming and broadband"},
    "sky_roi": {"name": "Sky ROI", "advertiser_id": "12422", "note": "already pending; a TV cluster strengthens it"},
    "streaming_other": {"name": "Disney+, Paramount+, discovery+, BritBox", "advertiser_id": "", "note": "SVOD programmes"},
    "compare_my_move": {"name": "Compare My Move / reallymoving", "advertiser_id": "", "note": "removals and conveyancing quote comparison"},
    "voip": {"name": "Voipfone / bOnline / VoIP", "advertiser_id": "", "note": "landline replacement for home and small business"},
    "isp_pool": {"name": "ISP programmes (BT, Sky, EE, altnets)", "advertiser_id": "", "note": "core-broadband content strengthens every ISP application"},
}


def page(
    cluster: str,
    page_type: str,
    title: str,
    slug: str,
    primary: str,
    secondary: list[str],
    intent: str,
    awin: list[str],
    demand: int,
    difficulty: int,
    content_gap: int,
    commercial_value: int,
    geo_upside: int,
    awin_unlock: int,
    note: str = "",
) -> dict[str, Any]:
    return {
        "cluster": cluster,
        "page_type": page_type,
        "working_title": title,
        "recommended_url": slug,
        "primary_keyword": primary,
        "secondary_keywords": secondary,
        "intent": intent,
        "target_awin_programmes": awin,
        "bands": {
            "demand": demand,
            "difficulty": difficulty,
            "content_gap": content_gap,
            "commercial_value": commercial_value,
            "geo_upside": geo_upside,
            "awin_unlock": awin_unlock,
        },
        "note": note,
    }


# 1-5 bands are directional editorial estimates, not search-tool data.
#   demand: relative UK search interest (5 = high)
#   difficulty: how hard to rank against incumbents (5 = very hard)
#   content_gap: how weak the current top results are (5 = wide open)
#   commercial_value: affiliate revenue potential (5 = recurring / high CPA)
#   geo_upside: AI Overview / question-shaped citability (1-3)
#   awin_unlock: how directly the page supports an Awin application (1-3)
CANDIDATES: list[dict[str, Any]] = [
    # -- Cluster 1: Home Wi-Fi and networking hardware --------------------------
    page("Home Wi-Fi and networking hardware", "Buyer guide",
         "Best mesh Wi-Fi systems UK", "/guides/best-mesh-wifi-systems-uk",
         "best mesh wifi uk",
         ["best mesh wifi system", "mesh wifi vs extender", "best mesh wifi for a large house", "best budget mesh wifi uk", "mesh wifi for full fibre"],
         "Commercial investigation", ["mesh_computers", "router_retailers"],
         4, 3, 4, 3, 2, 3,
         "Site has best-mesh-wifi-for-your-broadband-router; this is the standalone buyer guide that anchors the cluster."),
    page("Home Wi-Fi and networking hardware", "Buyer guide",
         "Best Wi-Fi extenders and boosters UK", "/guides/best-wifi-extender-uk",
         "best wifi extender uk",
         ["wifi booster vs extender", "best wifi extender for a router", "do wifi extenders actually work", "best wifi extender for virgin media", "cheap wifi booster uk"],
         "Commercial investigation", ["router_retailers", "mesh_computers"],
         4, 3, 4, 3, 2, 3),
    page("Home Wi-Fi and networking hardware", "Explainer",
         "Wi-Fi 7 explained: is it worth it in 2026?", "/guides/wifi-7-explained-uk",
         "wifi 7 explained",
         ["is wifi 7 worth it", "wifi 7 vs wifi 6", "do i need a wifi 7 router", "wifi 7 uk availability", "what broadband speed for wifi 7"],
         "Informational", ["router_retailers", "isp_pool"],
         4, 2, 4, 2, 3, 2,
         "Question-heavy, strong AI Overview upside; low difficulty while the term is new."),
    page("Home Wi-Fi and networking hardware", "Question and answer",
         "Should you replace your broadband provider's router?", "/guides/replace-isp-router-uk",
         "should i replace my isp router",
         ["bt smart hub replacement", "sky broadband hub alternative", "best third party router uk", "virgin media modem mode", "is a better router worth it for broadband"],
         "Commercial investigation", ["router_retailers", "mesh_computers"],
         3, 2, 4, 3, 3, 3),
    page("Home Wi-Fi and networking hardware", "Buyer guide",
         "Best broadband router for a large house or thick walls", "/guides/best-router-for-large-house-uk",
         "best router for a large house",
         ["best wifi for a 4 bedroom house", "best router for thick walls", "wifi for a house over three floors", "best long range router uk"],
         "Commercial investigation", ["router_retailers", "mesh_computers"],
         3, 3, 4, 3, 2, 3),
    page("Home Wi-Fi and networking hardware", "Buyer guide",
         "Best gaming router UK 2026", "/guides/best-gaming-router-uk",
         "best gaming router uk",
         ["best router for low ping", "best router for ps5 and xbox", "gaming router vs normal router", "does a gaming router reduce lag"],
         "Commercial investigation", ["router_retailers"],
         3, 3, 3, 3, 2, 2),
    page("Home Wi-Fi and networking hardware", "Question and answer",
         "How to fix Wi-Fi dead spots and weak signal at home", "/guides/fix-wifi-dead-spots-uk",
         "how to fix wifi dead spots",
         ["wifi not reaching upstairs", "improve wifi signal at home", "why is my wifi bad in one room", "wifi black spots fix", "broadband fine but wifi slow"],
         "Informational", ["mesh_computers", "router_retailers"],
         4, 2, 4, 2, 3, 3,
         "High-volume support intent, currently answered mostly by forums and thin listicles."),
    page("Home Wi-Fi and networking hardware", "Comparison",
         "Powerline adapters vs mesh Wi-Fi: which is better?", "/guides/powerline-adapters-vs-mesh-wifi",
         "powerline adapter vs mesh wifi",
         ["do powerline adapters work", "best powerline adapter uk", "powerline vs wifi extender", "powerline adapter for gaming"],
         "Commercial investigation", ["router_retailers"],
         3, 2, 4, 3, 2, 2),
    page("Home Wi-Fi and networking hardware", "Buyer guide",
         "Best router for Virgin Media broadband", "/guides/best-router-for-virgin-media",
         "best router for virgin media",
         ["virgin media hub 5 alternative", "third party router virgin media", "virgin media modem mode setup", "improve virgin media wifi"],
         "Commercial investigation", ["router_retailers", "isp_pool"],
         3, 3, 3, 3, 2, 2),

    # -- Cluster 2: Broadband + mobile and SIM-only ----------------------------
    page("Broadband and mobile bundles", "Deals page",
         "Best SIM-only deals UK", "/guides/best-sim-only-deals-uk",
         "best sim only deals",
         ["cheap sim only deals", "unlimited data sim", "1 month rolling sim only", "sim only no credit check", "best sim only deal for me"],
         "Transactional", ["smarty", "mozillion", "id_mobile", "o2_mobiles"],
         5, 4, 2, 4, 2, 3,
         "Very competitive but the highest-demand entry point; needs a genuine angle, e.g. total-cost and network-coverage led rather than a raw table."),
    page("Broadband and mobile bundles", "Buyer guide",
         "Broadband and mobile bundle discounts explained", "/guides/broadband-and-mobile-bundle-discounts-uk",
         "broadband and mobile deals",
         ["ee together discount", "vodafone broadband and mobile discount", "virgin media o2 volt", "bt broadband and mobile bundle", "is a broadband and mobile bundle worth it"],
         "Commercial investigation", ["smarty", "id_mobile", "o2_mobiles", "isp_pool"],
         4, 3, 4, 4, 2, 3,
         "Directly on-genre: bundle discounts are a real broadband buying factor and nobody explains them well."),
    page("Broadband and mobile bundles", "Deals page",
         "Cheapest unlimited data SIM UK", "/guides/cheapest-unlimited-data-sim-uk",
         "cheapest unlimited data sim",
         ["unlimited data sim deals", "best unlimited sim uk", "unlimited 5g sim", "unlimited data sim for home broadband"],
         "Transactional", ["smarty", "mozillion", "id_mobile"],
         4, 4, 3, 4, 2, 3),
    page("Broadband and mobile bundles", "Explainer",
         "Best mobile network for coverage in the UK", "/guides/best-mobile-network-coverage-uk",
         "best mobile network for coverage",
         ["ee vs vodafone vs o2 vs three coverage", "best mobile network in my area", "which network has the best signal", "mobile signal checker uk"],
         "Commercial investigation", ["smarty", "id_mobile", "o2_mobiles"],
         4, 3, 3, 3, 3, 3),
    page("Broadband and mobile bundles", "Explainer",
         "eSIM explained: how it works and how to switch", "/guides/esim-explained-uk",
         "esim explained",
         ["what is an esim", "how to set up an esim", "esim vs physical sim", "does my phone support esim", "esim uk providers"],
         "Informational", ["smarty", "id_mobile"],
         4, 2, 4, 2, 3, 2,
         "Rising interest, low current difficulty, strong AI Overview upside."),
    page("Broadband and mobile bundles", "Question and answer",
         "How to keep your phone number when you switch network", "/guides/keep-your-number-pac-code-uk",
         "how to keep your phone number when switching",
         ["what is a pac code", "how to get a pac code", "stac code vs pac code", "port my number to a new network", "text 65075 pac"],
         "Informational", ["smarty", "id_mobile", "mozillion"],
         3, 2, 3, 2, 3, 2),
    page("Broadband and mobile bundles", "Comparison",
         "30-day rolling SIM vs a mobile contract", "/guides/rolling-sim-vs-contract-uk",
         "30 day sim vs contract",
         ["rolling monthly sim", "no contract sim uk", "is a rolling sim cheaper", "sim only vs pay monthly"],
         "Commercial investigation", ["smarty", "mozillion"],
         3, 3, 3, 3, 2, 2),

    # -- Cluster 3: PSTN and landline switch-off -------------------------------
    page("Landline switch-off", "Explainer",
         "The UK landline switch-off explained", "/guides/landline-switch-off-explained-uk",
         "landline switch off",
         ["pstn switch off 2027", "when is the landline being switched off", "copper phone line switch off", "digital voice switch over", "will i lose my home phone"],
         "Informational", ["voip", "isp_pool"],
         4, 2, 5, 2, 3, 3,
         "Timely, urgent, almost no strong consumer coverage. Positions the site as the authority on the landline-to-broadband transition."),
    page("Landline switch-off", "Explainer",
         "Digital Voice explained: what changes and what to do", "/guides/digital-voice-explained-uk",
         "digital voice explained",
         ["what is bt digital voice", "sky digital voice", "virgin media landline switch off", "do i need a special phone for digital voice", "digital voice power cut"],
         "Informational", ["voip", "isp_pool"],
         4, 2, 5, 2, 3, 3),
    page("Landline switch-off", "Question and answer",
         "Will my alarm, telecare or lift line work after the switch-off?", "/guides/telecare-alarms-landline-switch-off-uk",
         "will my house alarm work after the digital switchover",
         ["telecare after landline switch off", "careline digital switchover", "lift phone line switch off", "pendant alarm digital phone", "does my alarm need a phone line"],
         "Informational", ["voip", "isp_pool"],
         3, 1, 5, 1, 3, 2,
         "Genuine safety-critical information gap; low competition; high citability."),
    page("Landline switch-off", "Buyer guide",
         "Broadband with a home phone included after 2027", "/guides/broadband-with-home-phone-after-2027",
         "broadband with a landline included",
         ["home phone with broadband deals", "do i still need a landline", "broadband and phone package 2026", "digital voice included broadband"],
         "Commercial investigation", ["isp_pool", "voip"],
         4, 3, 4, 3, 2, 3),
    page("Landline switch-off", "Explainer",
         "The PSTN switch-off for small businesses", "/guides/pstn-switch-off-small-business-uk",
         "pstn switch off business",
         ["isdn switch off", "business phone line switch off", "what businesses need to do before 2027", "sip trunk vs pstn", "voip for small business uk"],
         "Commercial investigation", ["voip", "isp_pool"],
         3, 2, 4, 4, 2, 3,
         "B2B angle; overlaps the existing business-broadband cluster and unlocks VoIP programmes."),
    page("Landline switch-off", "Question and answer",
         "Landline switch-off with no mobile signal: what to do", "/guides/landline-switch-off-no-mobile-signal-uk",
         "landline switch off no mobile signal",
         ["battery backup unit for landline", "rural landline switch off", "resilience for digital voice", "what if the power goes out digital phone"],
         "Informational", ["voip", "isp_pool"],
         2, 1, 5, 1, 3, 2),

    # -- Cluster 4: Moving home ----------------------------------------------
    page("Moving home", "Checklist or tool",
         "Moving house broadband checklist and timeline", "/guides/moving-house-broadband-checklist-uk",
         "moving house broadband checklist",
         ["when to sort broadband when moving", "transfer broadband to a new house", "how far in advance to order broadband when moving", "can i take my broadband to my new home", "broadband not available at my new address"],
         "Informational", ["isp_pool", "compare_my_move"],
         4, 3, 4, 3, 3, 2,
         "Moving is the number-one broadband switching trigger; the site has broadband-moving-house but this is the actionable checklist."),
    page("Moving home", "Checklist or tool",
         "Change of address checklist: who to tell when you move", "/guides/change-of-address-checklist-uk",
         "change of address checklist",
         ["who to tell when you move house", "moving house admin checklist", "update my address uk", "moving house to do list", "notify dvla of address change"],
         "Informational", ["compare_my_move", "isp_pool"],
         5, 4, 3, 2, 3, 2,
         "Broad, high-demand, competitive; a genuine interactive checklist is the differentiator and the information-gain asset."),
    page("Moving home", "Checklist or tool",
         "Moving house utilities checklist", "/guides/moving-house-utilities-checklist-uk",
         "moving house utilities checklist",
         ["set up utilities in a new home", "meter readings when moving house", "when to switch energy when moving", "council tax when you move"],
         "Informational", ["compare_my_move"],
         3, 3, 3, 2, 2, 2),
    page("Moving home", "Question and answer",
         "What happens to your broadband contract when you move", "/guides/broadband-contract-when-you-move-uk",
         "moving house broadband contract",
         ["can i cancel broadband if i move house", "broadband early exit fee moving", "broadband home mover deal", "provider not available at new address", "broadband cooling off period moving"],
         "Informational", ["isp_pool"],
         4, 3, 3, 3, 3, 3),
    page("Moving home", "Buyer guide",
         "Broadband for student house shares", "/guides/broadband-for-student-house-shares-uk",
         "broadband for a student house",
         ["student house share broadband", "9 month broadband contract", "term time only broadband", "splitting a broadband bill", "best broadband for a shared house"],
         "Commercial investigation", ["isp_pool"],
         3, 2, 4, 3, 2, 3,
         "Complements the existing student-broadband-by-university-city page with the shared-house money angle."),
    page("Moving home", "Question and answer",
         "How long does it take to get broadband when you move?", "/guides/how-long-broadband-installation-uk",
         "how long does broadband installation take",
         ["openreach engineer wait time", "broadband activation time", "full fibre installation lead time", "how long without internet when switching"],
         "Informational", ["isp_pool"],
         3, 2, 4, 2, 3, 2),

    # -- Cluster 5: TV and streaming ---------------------------------------
    page("TV and streaming", "Buyer guide",
         "Best streaming services in the UK, compared", "/guides/best-streaming-services-uk",
         "best streaming services uk",
         ["which streaming service is best uk", "streaming services compared", "best value streaming uk", "how many streaming services do i need", "cheapest streaming service uk"],
         "Commercial investigation", ["now", "streaming_other", "sky_roi"],
         5, 4, 3, 3, 3, 3),
    page("TV and streaming", "Comparison",
         "NOW vs Sky: which is better value?", "/guides/now-vs-sky-uk",
         "now tv vs sky",
         ["now broadband vs sky", "is now cheaper than sky", "now membership vs sky glass", "now vs sky sports", "sky stream vs now"],
         "Commercial investigation", ["now", "sky_roi"],
         3, 3, 4, 4, 2, 3),
    page("TV and streaming", "Question and answer",
         "Cheapest way to watch Sky Sports and TNT Sports", "/guides/cheapest-way-to-watch-sky-sports-uk",
         "cheapest way to watch sky sports",
         ["sky sports without sky", "now sports day pass", "tnt sports cheapest", "watch premier league cheaply uk", "sky sports vs now sports"],
         "Commercial investigation", ["now", "sky_roi", "streaming_other"],
         4, 3, 4, 4, 3, 3),
    page("TV and streaming", "Comparison",
         "Fire TV Stick vs Chromecast vs Roku vs Apple TV", "/guides/streaming-stick-comparison-uk",
         "best streaming stick uk",
         ["fire tv stick vs chromecast", "roku vs fire stick", "cheapest streaming device uk", "best streaming device for 4k", "do i need a streaming stick"],
         "Commercial investigation", ["router_retailers", "streaming_other"],
         4, 3, 3, 3, 2, 2),
    page("TV and streaming", "Explainer",
         "Freely and Fetch TV explained: free TV without an aerial", "/guides/freely-and-fetch-tv-explained-uk",
         "what is freely tv",
         ["freely vs freeview", "freely explained", "fetch tv uk", "free tv over broadband", "watch tv without an aerial uk"],
         "Informational", ["now", "streaming_other", "isp_pool"],
         3, 2, 5, 2, 3, 2,
         "Freely is new and barely covered; wide gap, strong citability."),
    page("TV and streaming", "Question and answer",
         "Do you still need a TV licence for streaming?", "/guides/do-you-need-a-tv-licence-uk",
         "do i need a tv licence for streaming",
         ["tv licence for netflix", "tv licence rules 2026", "watch tv without a licence", "do i need a tv licence for iplayer", "tv licence for students"],
         "Informational", ["now", "streaming_other"],
         4, 3, 3, 2, 3, 2),

    # -- Cluster 6: VPN and broadband privacy --------------------------------
    page("VPN and broadband privacy", "Buyer guide",
         "Best VPN for UK broadband 2026", "/guides/best-vpn-uk",
         "best vpn uk",
         ["best vpn for streaming uk", "cheapest vpn uk", "best vpn 2026", "fastest vpn uk", "best vpn for home broadband"],
         "Commercial investigation", ["surfshark", "vpn_other"],
         5, 5, 2, 5, 2, 3,
         "Highest commercial value on the list (recurring revenue share) but the most competitive; needs a broadband-speed-tested angle to be credible."),
    page("VPN and broadband privacy", "Question and answer",
         "Does a VPN slow down your internet?", "/guides/does-a-vpn-slow-your-internet",
         "does a vpn slow down your internet",
         ["vpn speed loss", "why is my vpn slow", "fastest vpn for speed", "how much does a vpn slow broadband", "vpn vs no vpn speed test"],
         "Informational", ["surfshark", "vpn_other"],
         4, 3, 4, 4, 3, 3,
         "Perfect fit: a broadband site can run the actual speed tests competitors do not. Strong AI Overview upside."),
    page("VPN and broadband privacy", "Question and answer",
         "How to stop your ISP tracking your browsing", "/guides/stop-isp-tracking-browsing-uk",
         "how to stop your isp tracking you",
         ["does my isp see my browsing history", "hide browsing from isp", "isp data retention uk", "private dns vs vpn", "is my isp selling my data"],
         "Informational", ["surfshark", "vpn_other"],
         3, 3, 4, 4, 3, 3),
    page("VPN and broadband privacy", "Question and answer",
         "How to watch UK TV abroad", "/guides/watch-uk-tv-abroad",
         "how to watch uk tv abroad",
         ["bbc iplayer abroad", "itvx abroad", "watch uk tv on holiday", "vpn for iplayer", "uk streaming abroad vpn"],
         "Commercial investigation", ["surfshark", "vpn_other", "now"],
         4, 4, 3, 4, 3, 3),
    page("VPN and broadband privacy", "Question and answer",
         "Is a free VPN safe?", "/guides/is-a-free-vpn-safe",
         "is a free vpn safe",
         ["free vpn risks", "best free vpn uk", "free vpn vs paid", "are free vpns dangerous", "free vpn that works"],
         "Informational", ["surfshark", "vpn_other"],
         4, 3, 3, 4, 3, 2),
    page("VPN and broadband privacy", "Question and answer",
         "How to set up a VPN on your router", "/guides/set-up-vpn-on-router-uk",
         "how to set up a vpn on your router",
         ["router vpn uk", "vpn for the whole home", "best router for a vpn", "vpn on wifi router", "does a router vpn slow speed"],
         "Informational", ["surfshark", "vpn_other", "router_retailers"],
         3, 3, 4, 4, 2, 2,
         "Bridges the VPN and hardware clusters."),
]


# ---------------------------------------------------------------------------
# Scoring
# ---------------------------------------------------------------------------
WEIGHTS = {
    "demand": 0.28,
    "ease": 0.24,
    "content_gap": 0.18,
    "geo_upside": 0.12,
    "commercial_value": 0.10,
    "awin_unlock": 0.08,
}


def opportunity_score(bands: dict[str, int]) -> float:
    demand = bands["demand"] / 5
    ease = (6 - bands["difficulty"]) / 5
    gap = bands["content_gap"] / 5
    geo = bands["geo_upside"] / 3
    commercial = bands["commercial_value"] / 5
    unlock = bands["awin_unlock"] / 3
    score = (
        WEIGHTS["demand"] * demand
        + WEIGHTS["ease"] * ease
        + WEIGHTS["content_gap"] * gap
        + WEIGHTS["geo_upside"] * geo
        + WEIGHTS["commercial_value"] * commercial
        + WEIGHTS["awin_unlock"] * unlock
    )
    return round(score * 100, 1)


# ---------------------------------------------------------------------------
# Optional SerpApi SERP-shape enrichment (opt-in, capped)
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


FORUM_HOSTS = ("reddit.com", "facebook.com", "quora.com", "moneysavingexpert.com", "community.", "forums.")


def serp_shape(key: str, query: str) -> dict[str, Any]:
    import requests

    r = requests.get(
        "https://serpapi.com/search",
        params={"engine": "google", "q": query, "gl": "uk", "hl": "en",
                "location": "United Kingdom", "api_key": key},
        timeout=40,
    )
    r.raise_for_status()
    data = r.json()
    organic = data.get("organic_results", []) or []
    domains = [re.sub(r"^https?://(www\.)?", "", o.get("link", "")).split("/")[0].lower() for o in organic[:10]]
    forum_count = sum(1 for d in domains if any(f in d for f in FORUM_HOSTS))
    return {
        "query": query,
        "ai_overview": bool(data.get("ai_overview")),
        "ai_overview_needs_token": bool((data.get("ai_overview") or {}).get("page_token")),
        "top_domains": domains[:8],
        "forum_results_in_top10": forum_count,
        "bp_in_top10": any("broadbandpicker.co.uk" in d for d in domains),
        "people_also_ask": [q.get("question") for q in data.get("related_questions", []) or [] if q.get("question")][:6],
        "shopping_results": bool(data.get("shopping_results")),
    }


def enrich_with_serp(rows: list[dict[str, Any]], limit: int) -> dict[str, Any]:
    key = env_key("SERPAPI_API_KEY")
    if not key:
        print("SERPAPI_API_KEY not set; skipping SERP enrichment.", file=sys.stderr)
        return {"mode": "skipped_no_key", "checked": 0}
    import requests

    quota = requests.get("https://serpapi.com/account", params={"api_key": key}, timeout=20).json()
    left = int(quota.get("total_searches_left", 0))
    print(f"SerpApi plan: {quota.get('plan_name')}, searches left: {left}")
    targets = rows[:limit]
    if left < len(targets):
        print(f"Only {left} searches left; trimming to {max(0, left - 2)}.", file=sys.stderr)
        targets = targets[: max(0, left - 2)]

    checked = 0
    for row in targets:
        q = row["primary_keyword"]
        print(f"  [{checked + 1}/{len(targets)}] {q}")
        try:
            shape = serp_shape(key, q)
        except Exception as exc:  # noqa: BLE001
            print(f"    ERROR: {exc}", file=sys.stderr)
            continue
        row["serp"] = shape
        # Live SERP signal nudges the editorial bands, capped.
        if shape["ai_overview"]:
            row["bands"]["geo_upside"] = min(3, row["bands"]["geo_upside"] + 1)
        if shape["forum_results_in_top10"] >= 3:
            row["bands"]["content_gap"] = min(5, row["bands"]["content_gap"] + 1)
        if shape["shopping_results"] and row["intent"] == "Transactional":
            row["bands"]["difficulty"] = min(5, row["bands"]["difficulty"] + 1)
        row["opportunity_score"] = opportunity_score(row["bands"])
        checked += 1
        time.sleep(1.2)

    after = int(requests.get("https://serpapi.com/account", params={"api_key": key}, timeout=20).json().get("total_searches_left", left))
    print(f"SerpApi searches used: {left - after}; left: {after}")
    return {"mode": "live", "checked": checked, "searches_used": left - after, "searches_left": after}


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--run-serp", action="store_true", help="Spend SerpApi quota to check SERP shape for the top candidates")
    parser.add_argument("--serp-limit", type=int, default=12, help="Max SerpApi searches this run")
    parser.add_argument("--skip-tracker", action="store_true", help="Do not rebuild the master tracker")
    args = parser.parse_args()

    rows = [dict(c) for c in CANDIDATES]
    for row in rows:
        row["opportunity_score"] = opportunity_score(row["bands"])
    rows.sort(key=lambda r: r["opportunity_score"], reverse=True)

    serp_meta: dict[str, Any] = {"mode": "editorial_only", "checked": 0}
    if args.run_serp:
        serp_meta = enrich_with_serp(rows, args.serp_limit)
        rows.sort(key=lambda r: r["opportunity_score"], reverse=True)

    for rank, row in enumerate(rows, 1):
        row["rank"] = rank

    cluster_summary: dict[str, dict[str, Any]] = defaultdict(lambda: {"pages": 0, "score_sum": 0.0, "programmes": Counter()})
    for row in rows:
        c = cluster_summary[row["cluster"]]
        c["pages"] += 1
        c["score_sum"] += row["opportunity_score"]
        for p in row["target_awin_programmes"]:
            c["programmes"][p] += 1
    clusters = [
        {
            "cluster": name,
            "pages": data["pages"],
            "avg_opportunity_score": round(data["score_sum"] / data["pages"], 1),
            "top_awin_programmes": [
                {**AWIN_TARGETS.get(slug, {"name": slug}), "slug": slug, "pages": count}
                for slug, count in data["programmes"].most_common()
            ],
        }
        for name, data in sorted(cluster_summary.items(), key=lambda kv: -kv[1]["score_sum"] / kv[1]["pages"])
    ]

    payload = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "purpose": (
            "Content clusters that would make BroadbandPicker eligible for adjacent Awin affiliate "
            "programmes. On-genre only. Build highest opportunity score first, get the cluster indexed, "
            "then apply to the mapped programmes with those pages as the relevance proof."
        ),
        "scoring_note": (
            "opportunity_score is a 0-100 composite of editorial 1-5 bands (demand, difficulty, "
            "content_gap, commercial_value) plus 1-3 bands (geo_upside, awin_unlock), optionally "
            "nudged by live SerpApi SERP shape. It contains no fabricated search volume, CPC or "
            "keyword-difficulty numbers."
        ),
        "weights": WEIGHTS,
        "serp_meta": serp_meta,
        "awin_targets": AWIN_TARGETS,
        "clusters": clusters,
        "pages": rows,
    }

    OUT_JSON.parent.mkdir(parents=True, exist_ok=True)
    OUT_JSON.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"\nSaved {OUT_JSON}")

    print(f"\n{len(rows)} candidate pages across {len(clusters)} clusters, ranked by SEO opportunity:\n")
    print(f"  {'#':>3}  {'Score':>5}  {'Type':22}  {'Cluster':32}  Primary keyword")
    for row in rows:
        print(f"  {row['rank']:>3}  {row['opportunity_score']:>5.1f}  {row['page_type'][:22]:22}  "
              f"{row['cluster'][:32]:32}  {row['primary_keyword']}")
    print("\nCluster order (avg opportunity):")
    for c in clusters:
        top = ", ".join(t["name"] for t in c["top_awin_programmes"][:3])
        print(f"  {c['avg_opportunity_score']:>5.1f}  {c['cluster']:34}  -> {top}")

    if not args.skip_tracker:
        import subprocess

        print("\nRebuilding master tracker...")
        result = subprocess.run([sys.executable, str(TRACKER_SCRIPT)], cwd=ROOT, capture_output=True, text=True)
        sys.stdout.write(result.stdout[-2000:])
        if result.returncode != 0:
            sys.stderr.write(result.stderr[-2000:])
            print("Master tracker rebuild failed; the plan JSON is still written.", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
