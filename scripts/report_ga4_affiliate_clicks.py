#!/usr/bin/env python3
"""Report GA4 outbound affiliate clicks by programme and source page."""

from __future__ import annotations

import argparse
import csv
import json
import sys
import urllib.error
import urllib.request
from pathlib import Path

from google.auth.transport.requests import Request
from google.oauth2 import service_account


DATA_BASE = "https://analyticsdata.googleapis.com/v1beta"
READ_SCOPE = "https://www.googleapis.com/auth/analytics.readonly"
DEFAULT_CREDENTIALS = Path("/Users/sahilrafiqsayed/broadbandpicker-ga4-credentials.json")
DEFAULT_OUTPUT = Path(__file__).resolve().parents[1] / "docs" / "ga4-affiliate-clicks.csv"


def run_report(credentials_path: Path, property_id: str, days: int) -> dict:
    credentials = service_account.Credentials.from_service_account_file(
        str(credentials_path), scopes=[READ_SCOPE]
    )
    credentials.refresh(Request())
    payload = {
        "dateRanges": [{"startDate": f"{max(1, days)}daysAgo", "endDate": "today"}],
        "dimensions": [
            {"name": "customEvent:provider_slug"},
            {"name": "pagePath"},
            {"name": "customEvent:affiliate_placement"},
            {"name": "customEvent:content_type"},
            {"name": "customEvent:link_label"},
        ],
        "metrics": [{"name": "eventCount"}, {"name": "totalUsers"}],
        "dimensionFilter": {
            "filter": {
                "fieldName": "eventName",
                "stringFilter": {"matchType": "EXACT", "value": "outbound_provider_click"},
            }
        },
        "orderBys": [{"metric": {"metricName": "eventCount"}, "desc": True}],
        "limit": "10000",
    }
    request = urllib.request.Request(
        f"{DATA_BASE}/properties/{property_id}:runReport",
        data=json.dumps(payload).encode("utf-8"),
        method="POST",
        headers={
            "Authorization": f"Bearer {credentials.token}",
            "Content-Type": "application/json",
        },
    )
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            return json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"GA4 Data API returned HTTP {exc.code}: {detail}") from exc


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--credentials", type=Path, default=DEFAULT_CREDENTIALS)
    parser.add_argument("--property", default="551202232")
    parser.add_argument("--days", type=int, default=30)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    args = parser.parse_args()

    if not args.credentials.is_file():
        print(f"Credentials not found: {args.credentials}", file=sys.stderr)
        return 2

    report = run_report(args.credentials, args.property, args.days)
    rows = []
    for row in report.get("rows", []):
        dimensions = row.get("dimensionValues", [])
        metrics = row.get("metricValues", [])
        rows.append({
            "affiliate_programme": dimensions[0].get("value", "(not set)"),
            "source_page": dimensions[1].get("value", "(not set)"),
            "placement": dimensions[2].get("value", "(not set)"),
            "content_type": dimensions[3].get("value", "(not set)"),
            "cta_label": dimensions[4].get("value", "(not set)"),
            "clicks": int(metrics[0].get("value", 0)),
            "users": int(metrics[1].get("value", 0)),
        })

    args.output.parent.mkdir(parents=True, exist_ok=True)
    with args.output.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=[
            "affiliate_programme", "source_page", "placement", "content_type",
            "cta_label", "clicks", "users",
        ])
        writer.writeheader()
        writer.writerows(rows)

    print(f"GA4 outbound_provider_click report ({args.days} days)")
    if not rows:
        print("  No classified programme rows are available yet.")
    else:
        totals: dict[str, int] = {}
        for row in rows:
            totals[row["affiliate_programme"]] = totals.get(row["affiliate_programme"], 0) + row["clicks"]
        for programme, clicks in sorted(totals.items(), key=lambda item: item[1], reverse=True):
            print(f"  {programme}: {clicks}")
    print(f"Saved: {args.output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
