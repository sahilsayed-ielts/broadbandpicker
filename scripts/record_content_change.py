#!/usr/bin/env python3
"""Record a content release for GA4 and the SEO measurement loop.

GA4 supports dated Reporting Data Annotations through the Admin API. Google
Search Console has no annotation resource, so its durable equivalent is a
URL-level change ledger with a pre-release GSC baseline and scheduled 7/28/56/
90-day comparisons consumed by the weekly SEO intelligence workflow.
"""

from __future__ import annotations

import argparse
import json
import os
import urllib.error
import urllib.parse
import urllib.request
import uuid
from datetime import date, datetime, timedelta, timezone
from pathlib import Path
from typing import Any

from google.auth.transport.requests import Request
from google.oauth2 import service_account


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_CREDENTIALS = Path("/Users/sahilrafiqsayed/broadbandpicker-ga4-credentials.json")
LOG_PATH = ROOT / "docs" / "page-build-pipeline" / "content-change-measurement-log.json"
REVIEW_QUEUE = ROOT / "docs" / "page-build-pipeline" / "post-publication-review-queue.json"
GA4_PROPERTY = "551202232"
GSC_PROPERTY = "sc-domain:broadbandpicker.co.uk"
SITE_ORIGIN = "https://broadbandpicker.co.uk"
SCOPES = [
    "https://www.googleapis.com/auth/analytics.edit",
    "https://www.googleapis.com/auth/analytics.readonly",
    "https://www.googleapis.com/auth/webmasters.readonly",
]


class GoogleClient:
    def __init__(self, credentials_path: Path) -> None:
        raw = os.environ.get("GOOGLE_SERVICE_ACCOUNT_JSON", "").strip()
        if raw:
            self.credentials = service_account.Credentials.from_service_account_info(
                json.loads(raw), scopes=SCOPES
            )
        else:
            self.credentials = service_account.Credentials.from_service_account_file(
                str(credentials_path), scopes=SCOPES
            )

    def request(self, method: str, url: str, payload: dict | None = None) -> dict:
        if not self.credentials.valid:
            self.credentials.refresh(Request())
        body = None if payload is None else json.dumps(payload).encode("utf-8")
        request = urllib.request.Request(
            url, data=body, method=method,
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


def canonical_url(value: str) -> tuple[str, str]:
    parsed = urllib.parse.urlsplit(value if "://" in value else f"{SITE_ORIGIN}/{value.lstrip('/')}")
    if parsed.netloc not in {"broadbandpicker.co.uk", "www.broadbandpicker.co.uk"}:
        raise ValueError("URL must be on broadbandpicker.co.uk")
    path = parsed.path.rstrip("/") or "/"
    return f"{SITE_ORIGIN}{path}", path


def gsc_baseline(client: GoogleClient, url: str) -> dict[str, Any]:
    end = date.today() - timedelta(days=3)
    start = end - timedelta(days=27)
    site = urllib.parse.quote(GSC_PROPERTY, safe="")
    result = client.request(
        "POST", f"https://www.googleapis.com/webmasters/v3/sites/{site}/searchAnalytics/query",
        {
            "startDate": start.isoformat(), "endDate": end.isoformat(), "type": "web",
            "dimensions": ["page"], "dataState": "final", "rowLimit": 10,
            "dimensionFilterGroups": [{"filters": [{
                "dimension": "page", "operator": "equals", "expression": url,
            }]}],
        },
    )
    row = (result.get("rows") or [{}])[0]
    return {
        "window": {"start": start.isoformat(), "end": end.isoformat()},
        "clicks": row.get("clicks", 0), "impressions": row.get("impressions", 0),
        "ctr": row.get("ctr", 0), "position": row.get("position"),
    }


def ga4_baseline(client: GoogleClient, path: str) -> dict[str, Any]:
    end = date.today() - timedelta(days=1)
    start = end - timedelta(days=27)
    result = client.request(
        "POST", f"https://analyticsdata.googleapis.com/v1beta/properties/{GA4_PROPERTY}:runReport",
        {
            "dateRanges": [{"startDate": start.isoformat(), "endDate": end.isoformat()}],
            "dimensions": [{"name": "landingPagePlusQueryString"}],
            "metrics": [
                {"name": "sessions"}, {"name": "engagedSessions"}, {"name": "keyEvents"},
            ],
            "dimensionFilter": {"filter": {
                "fieldName": "landingPagePlusQueryString",
                "stringFilter": {"matchType": "BEGINS_WITH", "value": path},
            }},
            "limit": "1000",
        },
    )
    totals = [0.0, 0.0, 0.0]
    for row in result.get("rows", []):
        for index, metric in enumerate(row.get("metricValues", [])):
            totals[index] += float(metric.get("value", 0) or 0)
    return {
        "window": {"start": start.isoformat(), "end": end.isoformat()},
        "sessions": totals[0], "engaged_sessions": totals[1], "key_events": totals[2],
    }


def create_ga4_annotation(client: GoogleClient, title: str, description: str) -> dict:
    today = date.today()
    return client.request(
        "POST",
        f"https://analyticsadmin.googleapis.com/v1alpha/properties/{GA4_PROPERTY}/reportingDataAnnotations",
        {
            "title": title[:60], "description": description[:150], "color": "BLUE",
            "annotationDate": {"year": today.year, "month": today.month, "day": today.day},
        },
    )


def update_review_queue(change_id: str, url: str, annotation_name: str | None) -> None:
    try:
        data = json.loads(REVIEW_QUEUE.read_text(encoding="utf-8"))
    except (FileNotFoundError, OSError, json.JSONDecodeError):
        return
    for item in data.get("reviews", []):
        if item.get("url", "").rstrip("/") == url.rstrip("/"):
            item["measurement_change_id"] = change_id
            item["ga4_annotation"] = annotation_name
            item["gsc_annotation_equivalent"] = str(LOG_PATH.relative_to(ROOT))
            break
    REVIEW_QUEUE.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--url", required=True)
    parser.add_argument("--title", required=True)
    parser.add_argument("--change-type", choices=["new_page", "content_refresh"], required=True)
    parser.add_argument("--source", default="manual")
    parser.add_argument("--deployment", default="vercel-production")
    parser.add_argument("--credentials", type=Path, default=DEFAULT_CREDENTIALS)
    args = parser.parse_args()
    url, path = canonical_url(args.url)
    if not os.environ.get("GOOGLE_SERVICE_ACCOUNT_JSON") and not args.credentials.is_file():
        raise RuntimeError(f"Google credentials not found: {args.credentials}")

    client = GoogleClient(args.credentials)
    recorded = datetime.now(timezone.utc)
    change_id = f"content-{recorded.date().isoformat()}-{uuid.uuid4().hex[:8]}"
    action = "New page" if args.change_type == "new_page" else "Content refresh"
    ga4_annotation = create_ga4_annotation(
        client,
        f"{action}: {path}"[:60],
        f"{args.title}. Production release measured against saved GSC and GA4 baselines."[:150],
    )
    record = {
        "change_id": change_id, "recorded_at": recorded.isoformat(), "change_date": recorded.date().isoformat(),
        "url": url, "path": path, "title": args.title, "change_type": args.change_type,
        "source": args.source, "deployment": args.deployment,
        "ga4_annotation": {"name": ga4_annotation.get("name"), "title": ga4_annotation.get("title")},
        "gsc_note": "Search Console has no annotation API; this ledger is the canonical change marker.",
        "baseline": {"gsc": gsc_baseline(client, url), "ga4": ga4_baseline(client, path)},
        "review_days": [7, 28, 56, 90],
    }
    try:
        log = json.loads(LOG_PATH.read_text(encoding="utf-8"))
    except (FileNotFoundError, OSError, json.JSONDecodeError):
        log = {"updated_at": None, "changes": []}
    log["changes"] = [item for item in log.get("changes", []) if item.get("change_id") != change_id]
    log["changes"].append(record)
    log["updated_at"] = recorded.isoformat()
    LOG_PATH.parent.mkdir(parents=True, exist_ok=True)
    LOG_PATH.write_text(json.dumps(log, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    update_review_queue(change_id, url, ga4_annotation.get("name"))
    print(json.dumps(record, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
