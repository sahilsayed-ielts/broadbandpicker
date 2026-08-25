#!/usr/bin/env python3
"""Verify BroadbandPicker Search Console access without changing account data."""

from __future__ import annotations

import argparse
import json
import sys
import urllib.error
import urllib.parse
import urllib.request
from datetime import date, timedelta
from pathlib import Path

from google.auth.transport.requests import Request
from google.oauth2 import service_account


SCOPE = "https://www.googleapis.com/auth/webmasters.readonly"
BASE = "https://www.googleapis.com/webmasters/v3"


class SearchConsoleClient:
    def __init__(self, credentials_path: Path) -> None:
        self.credentials = service_account.Credentials.from_service_account_file(
            str(credentials_path), scopes=[SCOPE]
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
            with urllib.request.urlopen(request, timeout=30) as response:
                raw = response.read().decode("utf-8")
                return json.loads(raw) if raw else {}
        except urllib.error.HTTPError as exc:
            detail = exc.read().decode("utf-8", errors="replace")
            raise RuntimeError(f"Search Console API returned HTTP {exc.code}: {detail}") from exc


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--credentials", required=True, type=Path)
    parser.add_argument("--site", default="sc-domain:broadbandpicker.co.uk")
    args = parser.parse_args()

    if not args.credentials.is_file():
        print("Credential file was not found.", file=sys.stderr)
        return 2

    client = SearchConsoleClient(args.credentials)
    sites = client.request("GET", f"{BASE}/sites").get("siteEntry", [])
    site = next((entry for entry in sites if entry.get("siteUrl") == args.site), None)
    if not site:
        print(f"The service account cannot access {args.site}.", file=sys.stderr)
        return 1

    print(f"Connected property: {args.site}")
    print(f"Permission: {site.get('permissionLevel')}")

    encoded_site = urllib.parse.quote(args.site, safe="")
    sitemaps = client.request("GET", f"{BASE}/sites/{encoded_site}/sitemaps").get("sitemap", [])
    print(f"Sitemaps visible: {len(sitemaps)}")
    for sitemap in sitemaps:
        print(f"  - {sitemap.get('path')}")

    end_date = date.today() - timedelta(days=3)
    start_date = end_date - timedelta(days=27)
    report = client.request(
        "POST",
        f"{BASE}/sites/{encoded_site}/searchAnalytics/query",
        {
            "startDate": start_date.isoformat(),
            "endDate": end_date.isoformat(),
            "type": "web",
            "dimensions": ["date"],
            "dataState": "final",
            "rowLimit": 100,
        },
    )
    rows = report.get("rows", [])
    clicks = sum(float(row.get("clicks", 0)) for row in rows)
    impressions = sum(float(row.get("impressions", 0)) for row in rows)
    print(f"Finalised performance window: {start_date} to {end_date}")
    print(f"Performance rows: {len(rows)}")
    print(f"Clicks: {clicks:g}")
    print(f"Impressions: {impressions:g}")
    print("Search Console API connection is verified.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
