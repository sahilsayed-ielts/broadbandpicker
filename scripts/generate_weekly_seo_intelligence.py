#!/usr/bin/env python3
"""Generate a joined weekly GSC + GA4 SEO/GEO action report.

The join is deliberately page-level. Search Console and Analytics data must
never be joined at user level. The workbook update replaces only the dedicated
"Weekly SEO Actions" tab and preserves every existing tracker row/status.
"""

from __future__ import annotations

import argparse
import json
import math
import os
import re
import sys
import tempfile
import urllib.error
import urllib.parse
import urllib.request
from collections import defaultdict
from dataclasses import asdict, dataclass
from datetime import date, datetime, timedelta, timezone
from pathlib import Path
from statistics import median

from google.auth.transport.requests import Request
from google.oauth2 import service_account
from openpyxl import load_workbook
from openpyxl.styles import Alignment, Font, PatternFill
from openpyxl.utils import get_column_letter


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_CREDENTIALS = Path("/Users/sahilrafiqsayed/broadbandpicker-ga4-credentials.json")
DEFAULT_JSON = ROOT / "docs" / "weekly-seo-intelligence.json"
DEFAULT_MARKDOWN = ROOT / "docs" / "weekly-seo-intelligence.md"
DEFAULT_TRACKER = ROOT / "docs" / "master-build-tracker.xlsx"
POST_PUBLICATION_REVIEW_FILE = ROOT / "docs" / "page-build-pipeline" / "post-publication-review-queue.json"
CONTENT_CHANGE_LOG = ROOT / "docs" / "page-build-pipeline" / "content-change-measurement-log.json"
CURRENT_PIPELINE_START = date(2026, 8, 14)
RECENT_UPDATE_COOLDOWN_DAYS = 56
SITE = "sc-domain:broadbandpicker.co.uk"
SITE_ORIGIN = "https://broadbandpicker.co.uk"
GA4_PROPERTY = "551202232"
GSC_BASE = "https://www.googleapis.com/webmasters/v3"
GA_BASE = "https://analyticsdata.googleapis.com/v1beta"
SCOPES = [
    "https://www.googleapis.com/auth/webmasters.readonly",
    "https://www.googleapis.com/auth/analytics.readonly",
]


@dataclass
class PageOpportunity:
    page: str
    clicks: float
    impressions: float
    ctr: float
    position: float
    previous_clicks: float
    previous_impressions: float
    click_change_pct: float | None
    impression_change_pct: float | None
    previous_ctr: float
    ctr_change_pp: float
    previous_position: float
    position_change: float
    sessions: float
    previous_sessions: float
    session_change_pct: float | None
    engaged_sessions: float
    engagement_rate: float | None
    previous_engagement_rate: float | None
    key_events: float
    previous_key_events: float
    affiliate_clicks: float
    previous_affiliate_clicks: float
    ai_referral_visits: float
    previous_ai_referral_visits: float
    last_content_update: str | None
    updated_by_current_pipeline: bool
    days_since_content_update: int | None
    priority_eligible: bool
    suppression_reason: str | None
    score: float
    category: str
    recommended_action: str
    top_queries: list[str]


class GoogleClient:
    def __init__(self, credentials_path: Path) -> None:
        self.credentials = service_account.Credentials.from_service_account_file(
            str(credentials_path), scopes=SCOPES
        )

    def request(self, method: str, url: str, payload: dict | None = None) -> dict:
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
    if not value or value == "(not set)":
        return "/"
    try:
        parsed = urllib.parse.urlsplit(value if "://" in value else f"{SITE_ORIGIN}{value}")
        path = parsed.path or "/"
    except ValueError:
        path = value.split("?", 1)[0] or "/"
    return path.rstrip("/") or "/"


def gsc_query(client: GoogleClient, start: date, end: date, dimensions: list[str]) -> list[dict]:
    # The Search Analytics API caps a single request at 25000 rows. With
    # page+query granularity across 1000+ postcode pages, a single page's
    # long-tail queries can be pushed out of that cap entirely, silently
    # leaving some pages with an empty top_queries list even though real
    # GSC data exists for them. Paginate with startRow until a response
    # comes back short of the cap (a bounded number of pages, since GSC's
    # own data volume is finite for this property).
    site = urllib.parse.quote(SITE, safe="")
    rows: list[dict] = []
    row_limit = 25000
    for page_index in range(10):  # up to 250,000 rows; well beyond this property's volume
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
    response = client.request(
        "POST", f"{GA_BASE}/properties/{GA4_PROPERTY}:runReport", payload
    )
    rows = []
    for row in response.get("rows", []):
        rows.append(
            {
                "dimensions": [value.get("value", "") for value in row.get("dimensionValues", [])],
                "metrics": [float(value.get("value", 0) or 0) for value in row.get("metricValues", [])],
            }
        )
    return rows


def page_map(rows: list[dict]) -> dict[str, dict[str, float]]:
    result: dict[str, dict[str, float]] = {}
    for row in rows:
        page = canonical_path(row["keys"][0])
        result[page] = {
            "clicks": float(row.get("clicks", 0)),
            "impressions": float(row.get("impressions", 0)),
            "ctr": float(row.get("ctr", 0)),
            "position": float(row.get("position", 0)),
        }
    return result


def suspicious_query(value: str) -> bool:
    """Keep anomalous non-English query rows from manufacturing SEO wins."""
    if not value:
        return False
    non_ascii = sum(1 for character in value if ord(character) > 127)
    return non_ascii / len(value) >= 0.25


def remove_query_anomalies(
    pages: dict[str, dict[str, float]], query_rows: list[dict]
) -> tuple[dict[str, dict[str, float]], list[str]]:
    excluded: dict[str, dict[str, float]] = defaultdict(
        lambda: {"clicks": 0.0, "impressions": 0.0, "position_weight": 0.0}
    )
    labels: list[str] = []
    for row in query_rows:
        query = row["keys"][1]
        if not suspicious_query(query):
            continue
        page = canonical_path(row["keys"][0])
        impressions = float(row.get("impressions", 0))
        excluded[page]["clicks"] += float(row.get("clicks", 0))
        excluded[page]["impressions"] += impressions
        excluded[page]["position_weight"] += impressions * float(row.get("position", 0))
        labels.append(f"{page}: {query}")

    adjusted = {page: metrics.copy() for page, metrics in pages.items()}
    for page, removed in excluded.items():
        if page not in adjusted:
            continue
        original = adjusted[page]
        impressions = max(0.0, original["impressions"] - removed["impressions"])
        clicks = max(0.0, original["clicks"] - removed["clicks"])
        position_weight = original["position"] * original["impressions"] - removed["position_weight"]
        original.update({
            "clicks": clicks,
            "impressions": impressions,
            "ctr": clicks / impressions if impressions else 0.0,
            "position": max(0.0, position_weight / impressions) if impressions else 0.0,
        })
    return adjusted, labels


def pct_change(current: float, previous: float) -> float | None:
    if previous == 0:
        return None if current == 0 else 100.0
    return round((current - previous) / previous * 100, 1)


def _dated_slug_blocks(path: Path, route_prefix: str, date_field: str) -> dict[str, date]:
    """Extract page-level editorial dates from the repository's typed data files."""
    if not path.exists():
        return {}
    text = path.read_text(encoding="utf-8")
    result: dict[str, date] = {}
    slug_pattern = re.compile(r"slug:\s*['\"]([^'\"]+)['\"]")
    matches = list(slug_pattern.finditer(text))
    for index, match in enumerate(matches):
        block_end = matches[index + 1].start() if index + 1 < len(matches) else len(text)
        block = text[match.end():block_end]
        date_match = re.search(rf"{date_field}:\s*['\"](\d{{4}}-\d{{2}}-\d{{2}})['\"]", block)
        if date_match:
            result[f"{route_prefix}/{match.group(1)}"] = date.fromisoformat(date_match.group(1))
    return result


def _dated_path_blocks(path: Path) -> dict[str, date]:
    if not path.exists():
        return {}
    text = path.read_text(encoding="utf-8")
    return {
        page: date.fromisoformat(value)
        for page, value in re.findall(
            r"path:\s*['\"]([^'\"]+)['\"][\s\S]{0,5000}?updated:\s*['\"](\d{4}-\d{2}-\d{2})['\"]",
            text,
        )
    }


def content_freshness() -> dict[str, dict[str, object]]:
    """Build a page provenance register from editorial dates and successful pipeline launches.

    Dates on or after the current research-led pipeline's introduction are treated as
    current-pipeline work. Successful production builds recorded by the pipeline are
    authoritative and override date inference.
    """
    dates: dict[str, date] = {"/": date(2026, 8, 30)}
    dates.update(_dated_slug_blocks(ROOT / "data" / "guides.ts", "/guides", "updatedDate"))
    dates.update(_dated_slug_blocks(ROOT / "data" / "provider-comparisons.ts", "/providers/compare", "updatedDate"))
    dates.update(_dated_slug_blocks(ROOT / "data" / "providers.ts", "/providers", "reviewedDate"))
    dates.update(_dated_path_blocks(ROOT / "data" / "priority-pages.ts"))

    # Backfill successful builds completed before the persistent review queue
    # was introduced. Future builds are recorded automatically below.
    explicit_pipeline: dict[str, date] = {
        "/": date(2026, 8, 30),
        "/postcode/da1": date(2026, 8, 28),
        "/postcode/m1": date(2026, 8, 28),
        "/postcode/ng1": date(2026, 8, 28),
        "/postcode/rg1": date(2026, 8, 28),
        "/postcode/ct1": date(2026, 8, 28),
        "/postcode/rm1": date(2026, 8, 28),
        "/postcode/bs1": date(2026, 8, 30),
        "/providers/compare/ee-vs-talktalk": date(2026, 8, 25),
        "/guides/broadband-deals-with-cashback": date(2026, 8, 25),
    }
    dates.update({page: max(dates.get(page, updated), updated) for page, updated in explicit_pipeline.items()})
    try:
        queue = json.loads(POST_PUBLICATION_REVIEW_FILE.read_text(encoding="utf-8"))
        for review in queue.get("reviews", []):
            page = canonical_path(review.get("url") or f"/{review.get('slug', '')}")
            launched = datetime.fromisoformat(review["launched_at"].replace("Z", "+00:00")).date()
            explicit_pipeline[page] = launched
            dates[page] = max(dates.get(page, launched), launched)
    except (FileNotFoundError, KeyError, OSError, ValueError, json.JSONDecodeError):
        pass

    today = date.today()
    return {
        page: {
            "last_content_update": updated.isoformat(),
            "updated_by_current_pipeline": page in explicit_pipeline or updated >= CURRENT_PIPELINE_START,
            "days_since_content_update": (today - updated).days,
        }
        for page, updated in dates.items()
    }


def build_opportunities(
    current_pages: dict[str, dict[str, float]],
    previous_pages: dict[str, dict[str, float]],
    query_rows: list[dict],
    ga_pages: dict[str, dict[str, float]],
    previous_ga_pages: dict[str, dict[str, float]],
    affiliate_by_page: dict[str, float],
    previous_affiliate_by_page: dict[str, float],
    ai_by_page: dict[str, float],
    previous_ai_by_page: dict[str, float],
    freshness_by_page: dict[str, dict[str, object]],
) -> list[PageOpportunity]:
    query_groups: dict[str, list[tuple[float, str]]] = defaultdict(list)
    for row in query_rows:
        page = canonical_path(row["keys"][0])
        if suspicious_query(row["keys"][1]):
            continue
        query_groups[page].append((float(row.get("impressions", 0)), row["keys"][1]))

    ctr_values = [metrics["ctr"] for metrics in current_pages.values() if metrics["impressions"] >= 10]
    site_median_ctr = median(ctr_values) if ctr_values else 0.0
    max_impressions = max((metrics["impressions"] for metrics in current_pages.values()), default=1)
    opportunities: list[PageOpportunity] = []

    for page, current in current_pages.items():
        previous = previous_pages.get(page, {"clicks": 0, "impressions": 0})
        ga = ga_pages.get(page, {})
        previous_ga = previous_ga_pages.get(page, {})
        impressions = current["impressions"]
        position = current["position"]
        ctr = current["ctr"]
        sessions = ga.get("sessions", 0)
        previous_sessions = previous_ga.get("sessions", 0)
        engaged = ga.get("engaged_sessions", 0)
        previous_engaged = previous_ga.get("engaged_sessions", 0)
        engagement_rate = engaged / sessions if sessions else None
        previous_engagement_rate = previous_engaged / previous_sessions if previous_sessions else None
        trend = pct_change(impressions, previous["impressions"])
        click_trend = pct_change(current["clicks"], previous["clicks"])
        session_trend = pct_change(sessions, previous_sessions)
        ctr_change_pp = round((ctr - previous.get("ctr", 0)) * 100, 2)
        position_change = round(previous.get("position", 0) - position, 2) if previous.get("position") else 0.0
        freshness = freshness_by_page.get(page, {})
        last_update = freshness.get("last_content_update")
        updated_by_pipeline = bool(freshness.get("updated_by_current_pipeline", False))
        days_since_update = freshness.get("days_since_content_update")
        recently_updated = (
            updated_by_pipeline
            and isinstance(days_since_update, int)
            and days_since_update < RECENT_UPDATE_COOLDOWN_DAYS
        )

        demand_score = 35 * (math.log1p(impressions) / math.log1p(max_impressions)) if impressions else 0
        if impressions >= 40 and 4 <= position <= 15:
            rank_score = 30
            category = "Quick ranking win"
        elif impressions >= 40 and 15 < position <= 30:
            rank_score = 22
            category = "Page-two opportunity"
        elif position < 4 and impressions >= 25:
            rank_score = 15
            category = "Defend winner"
        else:
            rank_score = 8
            category = "Monitor"

        ctr_score = 20 if impressions >= 20 and ctr < site_median_ctr else 5
        # Reward both recovery urgency and proven momentum. Falling demand/clicks
        # needs diagnosis; rising impressions with weak CTR is a snippet win.
        trend_score = 3
        if trend is not None and trend < -10:
            trend_score += 7
        elif trend is not None and trend > 20 and ctr < site_median_ctr:
            trend_score += 6
        if position_change >= 2:
            trend_score += 3
        if click_trend is not None and click_trend < -20 and impressions >= 40:
            trend_score += 3
        freshness_score = 12 if not updated_by_pipeline else 0
        behaviour_score = 0
        if engagement_rate is not None:
            behaviour_score = 5 if engagement_rate >= 0.6 else 10
            if engagement_rate < 0.4:
                category = "Content improvement"
        if sessions >= 5 and affiliate_by_page.get(page, 0) == 0 and (engagement_rate or 0) >= 0.5:
            category = "Conversion improvement"

        score = round(min(100, demand_score + rank_score + ctr_score + trend_score + behaviour_score + freshness_score), 1)
        suppression_reason = None
        if recently_updated:
            suppression_reason = (
                f"Current pipeline updated this page {days_since_update} day(s) ago; "
                f"hold until the {RECENT_UPDATE_COOLDOWN_DAYS}-day measurement checkpoint."
            )
            category = "Post-publication monitoring"
        if category == "Post-publication monitoring":
            action = suppression_reason or "Measure the recent update before making another material change."
        elif category == "Quick ranking win":
            action = "Strengthen the title/snippet, answer the leading queries directly, add internal links and refresh supporting evidence."
        elif category == "Page-two opportunity":
            action = "Expand missing subtopics for the leading queries, improve topical internal links and validate intent alignment."
        elif category == "Content improvement":
            action = "Improve answer-first copy, section hierarchy, evidence, comparison usefulness and mobile reading flow."
        elif category == "Conversion improvement":
            action = "Test clearer comparison and provider CTAs while preserving the informational answer and editorial independence."
        elif category == "Defend winner":
            action = "Protect rankings with freshness checks, authoritative evidence, stable URLs and supporting internal links."
        else:
            action = "Monitor until the page accumulates enough demand or behavioural evidence for a confident intervention."

        top_queries = [query for _, query in sorted(query_groups[page], reverse=True)[:5]]
        opportunities.append(
            PageOpportunity(
                page=page,
                clicks=current["clicks"],
                impressions=impressions,
                ctr=ctr,
                position=position,
                previous_clicks=previous["clicks"],
                previous_impressions=previous["impressions"],
                click_change_pct=click_trend,
                impression_change_pct=trend,
                previous_ctr=previous.get("ctr", 0),
                ctr_change_pp=ctr_change_pp,
                previous_position=previous.get("position", 0),
                position_change=position_change,
                sessions=sessions,
                previous_sessions=previous_sessions,
                session_change_pct=session_trend,
                engaged_sessions=engaged,
                engagement_rate=engagement_rate,
                previous_engagement_rate=previous_engagement_rate,
                key_events=ga.get("key_events", 0),
                previous_key_events=previous_ga.get("key_events", 0),
                affiliate_clicks=affiliate_by_page.get(page, 0),
                previous_affiliate_clicks=previous_affiliate_by_page.get(page, 0),
                ai_referral_visits=ai_by_page.get(page, 0),
                previous_ai_referral_visits=previous_ai_by_page.get(page, 0),
                last_content_update=last_update if isinstance(last_update, str) else None,
                updated_by_current_pipeline=updated_by_pipeline,
                days_since_content_update=days_since_update if isinstance(days_since_update, int) else None,
                priority_eligible=not recently_updated,
                suppression_reason=suppression_reason,
                score=score,
                category=category,
                recommended_action=action,
                top_queries=top_queries,
            )
        )
    return sorted(
        opportunities,
        key=lambda item: (not item.priority_eligible, -item.score, -item.impressions, item.page),
    )


def render_markdown(payload: dict) -> str:
    lines = [
        "# BroadbandPicker weekly SEO + GEO intelligence",
        "",
        f"Generated: {payload['generated_at']}",
        f"Finalised comparison: {payload['current_window']['start']} to {payload['current_window']['end']} vs {payload['previous_window']['start']} to {payload['previous_window']['end']}",
        "",
        "## Executive summary",
        "",
        f"- GSC clicks: **{payload['summary']['gsc_clicks']:g}**",
        f"- GSC impressions: **{payload['summary']['gsc_impressions']:g}**",
        f"- GSC impression change: **{payload['summary']['gsc_impression_change_pct']:+.1f}%**",
        f"- GSC click change: **{payload['summary']['gsc_click_change_pct']:+.1f}%**",
        f"- GA4 organic sessions available: **{payload['summary']['ga4_organic_sessions']:g}**",
        f"- GA4 organic-session change: **{payload['summary']['ga4_organic_session_change_pct']:+.1f}%**",
        f"- Identifiable AI referral visits: **{payload['summary']['ai_referral_visits']:g}**",
        "",
        "## Next five actions",
        "",
        "| Rank | Page | Opportunity | Score | Impressions | Impr. change | Position change | CTR change | GA4 sessions | Recommended action |",
        "| --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |",
    ]
    for rank, row in enumerate(payload["next_five"], 1):
        lines.append(
            f"| {rank} | `{row['page']}` | {row['category']} | {row['score']:.1f} | "
            f"{row['impressions']:.0f} | {row['impression_change_pct'] or 0:+.1f}% | "
            f"{row['position_change']:+.1f} | {row['ctr_change_pp']:+.2f}pp | "
            f"{row['sessions']:.0f} ({row['session_change_pct'] or 0:+.1f}%) | {row['recommended_action']} |"
        )
    changes = payload.get("content_change_measurement") or []
    lines += ["", "## Content release measurement", ""]
    if changes:
        lines += [
            "| Change date | Page | Type | GSC impressions vs baseline | GSC clicks vs baseline | Position change | GA4 sessions vs baseline |",
            "| --- | --- | --- | ---: | ---: | ---: | ---: |",
        ]
        for item in changes:
            lines.append(
                f"| {item['change_date']} | `{item['path']}` | {item['change_type']} | "
                f"{item['current']['impressions']:.0f} vs {item['baseline']['gsc']['impressions']:.0f} | "
                f"{item['current']['clicks']:.0f} vs {item['baseline']['gsc']['clicks']:.0f} | "
                f"{item['position_change'] or 0:+.1f} | "
                f"{item['current']['sessions']:.0f} vs {item['baseline']['ga4']['sessions']:.0f} |"
            )
    else:
        lines.append("No pipeline-recorded content changes are available yet.")
    lines += [
        "",
        "## Measurement interpretation",
        "",
        "- Search Console and GA4 are joined only by canonical landing page, never by user.",
        "- A high score prioritises evidence-backed opportunity; it is not a ranking guarantee.",
        "- AI-referral counts are a minimum because some assistants suppress referrer information.",
        "- Google AI Overview clicks usually remain part of Google organic traffic. Use Search Console's generative-AI report when available for visibility-specific analysis.",
        "- GA4 custom dimensions can take 24-48 hours to populate after registration.",
        "",
        "## Search appearance / rich results",
        "",
    ]
    appearance = payload.get("search_appearance") or []
    if appearance:
        lines += [
            "| Appearance | Clicks | Impressions | CTR | Position |",
            "|---|---:|---:|---:|---:|",
        ]
        for row in appearance:
            lines.append(
                f"| {row['appearance']} | {row['clicks']:.0f} | {row['impressions']:.0f} | "
                f"{row['ctr']:.1%} | {row['position']:.1f} |"
            )
        lines.append("")
    else:
        lines += ["No Search Console searchAppearance rows this window.", ""]
    return "\n".join(lines)


def measure_recorded_changes(opportunities: list[PageOpportunity]) -> list[dict]:
    """Compare the latest equal 28-day reporting window with the baseline
    captured at deployment. This is the GSC-visible equivalent of the GA4
    annotation and avoids pretending Search Console has an annotation API.
    """
    try:
        changes = json.loads(CONTENT_CHANGE_LOG.read_text(encoding="utf-8")).get("changes", [])
    except (FileNotFoundError, OSError, json.JSONDecodeError):
        return []
    by_page = {item.page: item for item in opportunities}
    measured = []
    for change in changes:
        current = by_page.get(canonical_path(change.get("path") or change.get("url")))
        if not current:
            continue
        baseline = change.get("baseline") or {}
        gsc = baseline.get("gsc") or {}
        ga4 = baseline.get("ga4") or {}
        baseline_position = gsc.get("position")
        measured.append({
            "change_id": change.get("change_id"), "change_date": change.get("change_date"),
            "path": current.page, "change_type": change.get("change_type"),
            "ga4_annotation": change.get("ga4_annotation"), "baseline": baseline,
            "current": {
                "clicks": current.clicks, "impressions": current.impressions,
                "ctr": current.ctr, "position": current.position, "sessions": current.sessions,
                "engagement_rate": current.engagement_rate, "key_events": current.key_events,
                "affiliate_clicks": current.affiliate_clicks, "ai_referral_visits": current.ai_referral_visits,
            },
            "click_change": current.clicks - float(gsc.get("clicks") or 0),
            "impression_change": current.impressions - float(gsc.get("impressions") or 0),
            "position_change": (
                float(baseline_position) - current.position if baseline_position is not None else None
            ),
            "session_change": current.sessions - float(ga4.get("sessions") or 0),
        })
    return sorted(measured, key=lambda item: item.get("change_date") or "", reverse=True)


def update_tracker(path: Path, actions: list[dict], generated_at: str) -> None:
    workbook = load_workbook(path)
    sheet_name = "Weekly SEO Actions"
    if sheet_name in workbook.sheetnames:
        del workbook[sheet_name]
    ws = workbook.create_sheet(sheet_name, 1)
    headers = [
        "Rank", "Page", "Opportunity", "Score", "Clicks", "Impressions", "CTR", "Position",
        "Click Change", "Impression Change", "CTR Change (pp)", "Position Change",
        "GA4 Sessions", "GA4 Session Change", "Engagement Rate", "Previous Engagement Rate",
        "Key Events", "Previous Key Events", "Affiliate Clicks", "Previous Affiliate Clicks",
        "AI Referral Visits", "Previous AI Referral Visits", "Last Content Update",
        "Current Pipeline Update", "Days Since Update", "Priority Eligible", "Suppression Reason",
        "Top Queries", "Recommended Action", "Generated",
    ]
    ws.append(headers)
    for rank, row in enumerate(actions, 1):
        ws.append([
            rank, row["page"], row["category"], row["score"], row["clicks"], row["impressions"],
            row["ctr"], row["position"], row["click_change_pct"], row["impression_change_pct"],
            row["ctr_change_pp"], row["position_change"], row["sessions"], row["session_change_pct"],
            row["engagement_rate"], row["previous_engagement_rate"], row["key_events"],
            row["previous_key_events"], row["affiliate_clicks"], row["previous_affiliate_clicks"],
            row["ai_referral_visits"], row["previous_ai_referral_visits"],
            row["last_content_update"], row["updated_by_current_pipeline"],
            row["days_since_content_update"], row["priority_eligible"], row["suppression_reason"],
            "; ".join(row["top_queries"]), row["recommended_action"], generated_at,
        ])
    header_fill = PatternFill("solid", fgColor="0F172A")
    for cell in ws[1]:
        cell.fill = header_fill
        cell.font = Font(color="FFFFFF", bold=True)
        cell.alignment = Alignment(horizontal="center", vertical="center")
    ws.freeze_panes = "A2"
    ws.auto_filter.ref = ws.dimensions
    widths = [8, 44, 24, 10, 10, 14, 10, 10, 14, 18, 15, 15, 14, 18, 16, 20, 12, 18, 16, 22, 18, 24, 18, 20, 18, 18, 62, 54, 76, 24]
    for index, width in enumerate(widths, 1):
        ws.column_dimensions[get_column_letter(index)].width = width
    for row in ws.iter_rows(min_row=2):
        for cell in row:
            cell.alignment = Alignment(vertical="top", wrap_text=True)
    for cell in ws["G"][1:]:
        cell.number_format = "0.00%"
    for cell in ws["O"][1:]:
        cell.number_format = "0.00%"
    for cell in ws["P"][1:]:
        cell.number_format = "0.00%"
    for column in ("I", "J", "N"):
        for cell in ws[column][1:]:
            cell.number_format = '0.0"%"'

    path.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile(suffix=".xlsx", dir=path.parent, delete=False) as tmp:
        temp_path = Path(tmp.name)
    try:
        workbook.save(temp_path)
        os.replace(temp_path, path)
    finally:
        temp_path.unlink(missing_ok=True)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--credentials", type=Path, default=DEFAULT_CREDENTIALS)
    parser.add_argument("--json", type=Path, default=DEFAULT_JSON)
    parser.add_argument("--markdown", type=Path, default=DEFAULT_MARKDOWN)
    parser.add_argument("--tracker", type=Path, default=DEFAULT_TRACKER)
    parser.add_argument("--top", type=int, default=30)
    parser.add_argument("--skip-tracker", action="store_true")
    args = parser.parse_args()
    if not args.credentials.is_file():
        print("Credential file was not found.", file=sys.stderr)
        return 2

    client = GoogleClient(args.credentials)
    current_end = date.today() - timedelta(days=3)
    current_start = current_end - timedelta(days=27)
    previous_end = current_start - timedelta(days=1)
    previous_start = previous_end - timedelta(days=27)

    current_page_rows = gsc_query(client, current_start, current_end, ["page"])
    previous_page_rows = gsc_query(client, previous_start, previous_end, ["page"])
    query_rows = gsc_query(client, current_start, current_end, ["page", "query"])
    previous_query_rows = gsc_query(client, previous_start, previous_end, ["page", "query"])
    try:
        appearance_rows = gsc_query(client, current_start, current_end, ["searchAppearance"])
    except Exception as exc:
        print(f"searchAppearance query skipped: {exc}", file=sys.stderr)
        appearance_rows = []

    organic_filter = {
        "filter": {
            "fieldName": "sessionDefaultChannelGroup",
            "stringFilter": {"matchType": "EXACT", "value": "Organic Search"},
        }
    }
    ga_rows = ga4_report(
        client, current_start, current_end,
        ["landingPagePlusQueryString"],
        ["sessions", "engagedSessions", "keyEvents"],
        organic_filter,
    )
    previous_ga_rows = ga4_report(
        client, previous_start, previous_end,
        ["landingPagePlusQueryString"],
        ["sessions", "engagedSessions", "keyEvents"],
        organic_filter,
    )
    ga_pages: dict[str, dict[str, float]] = {}
    for row in ga_rows:
        page = canonical_path(row["dimensions"][0])
        sessions, engaged, key_events = row["metrics"]
        ga_pages[page] = {"sessions": sessions, "engaged_sessions": engaged, "key_events": key_events}
    previous_ga_pages: dict[str, dict[str, float]] = {}
    for row in previous_ga_rows:
        page = canonical_path(row["dimensions"][0])
        sessions, engaged, key_events = row["metrics"]
        previous_ga_pages[page] = {
            "sessions": sessions, "engaged_sessions": engaged, "key_events": key_events
        }

    event_rows = ga4_report(
        client, current_start, current_end,
        ["landingPagePlusQueryString", "eventName"], ["eventCount"],
    )
    previous_event_rows = ga4_report(
        client, previous_start, previous_end,
        ["landingPagePlusQueryString", "eventName"], ["eventCount"],
    )
    affiliate_by_page: dict[str, float] = defaultdict(float)
    ai_by_page: dict[str, float] = defaultdict(float)
    for row in event_rows:
        page = canonical_path(row["dimensions"][0])
        event_name = row["dimensions"][1]
        if event_name == "outbound_provider_click":
            affiliate_by_page[page] += row["metrics"][0]
        if event_name == "ai_referral_visit":
            ai_by_page[page] += row["metrics"][0]
    previous_affiliate_by_page: dict[str, float] = defaultdict(float)
    previous_ai_by_page: dict[str, float] = defaultdict(float)
    for row in previous_event_rows:
        page = canonical_path(row["dimensions"][0])
        event_name = row["dimensions"][1]
        if event_name == "outbound_provider_click":
            previous_affiliate_by_page[page] += row["metrics"][0]
        if event_name == "ai_referral_visit":
            previous_ai_by_page[page] += row["metrics"][0]

    current_pages, excluded_current = remove_query_anomalies(page_map(current_page_rows), query_rows)
    previous_pages, excluded_previous = remove_query_anomalies(page_map(previous_page_rows), previous_query_rows)
    opportunities = build_opportunities(
        current_pages, previous_pages, query_rows, ga_pages, previous_ga_pages,
        affiliate_by_page, previous_affiliate_by_page, ai_by_page, previous_ai_by_page,
        content_freshness(),
    )
    current_clicks = sum(item.clicks for item in opportunities)
    previous_clicks = sum(item.previous_clicks for item in opportunities)
    current_impressions = sum(item.impressions for item in opportunities)
    previous_impressions = sum(item.previous_impressions for item in opportunities)
    current_sessions = sum(item.sessions for item in opportunities)
    previous_sessions = sum(item.previous_sessions for item in opportunities)
    generated_at = datetime.now(timezone.utc).isoformat()
    payload = {
        "generated_at": generated_at,
        "current_window": {"start": current_start.isoformat(), "end": current_end.isoformat()},
        "previous_window": {"start": previous_start.isoformat(), "end": previous_end.isoformat()},
        "summary": {
            "gsc_clicks": current_clicks,
            "previous_gsc_clicks": previous_clicks,
            "gsc_click_change_pct": pct_change(current_clicks, previous_clicks) or 0,
            "gsc_impressions": current_impressions,
            "previous_gsc_impressions": previous_impressions,
            "gsc_impression_change_pct": pct_change(current_impressions, previous_impressions) or 0,
            "ga4_organic_sessions": current_sessions,
            "previous_ga4_organic_sessions": previous_sessions,
            "ga4_organic_session_change_pct": pct_change(current_sessions, previous_sessions) or 0,
            "ai_referral_visits": sum(item.ai_referral_visits for item in opportunities),
            "pages_scored": len(opportunities),
            "anomalous_query_rows_excluded": len(excluded_current) + len(excluded_previous),
        },
        "next_five": [asdict(item) for item in opportunities if item.priority_eligible][:5],
        "opportunities": [asdict(item) for item in opportunities[: args.top]],
        "content_change_measurement": measure_recorded_changes(opportunities),
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
    args.json.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
    args.markdown.write_text(render_markdown(payload), encoding="utf-8")
    if not args.skip_tracker:
        update_tracker(args.tracker, payload["opportunities"], generated_at)

    print(json.dumps(payload["summary"], indent=2))
    print("Next five actions:")
    for rank, item in enumerate(payload["next_five"], 1):
        print(f"  {rank}. {item['page']} — {item['category']} ({item['score']})")
    print(f"Saved {args.json.resolve()}")
    print(f"Saved {args.markdown.resolve()}")
    if not args.skip_tracker:
        print(f"Updated {args.tracker.resolve()} [{len(payload['opportunities'])} action rows]")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
