#!/usr/bin/env python3
"""Audit and manage BroadbandPicker GA4 key-event classifications safely."""

from __future__ import annotations

import argparse
import json
import sys
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

from google.auth.transport.requests import Request
from google.oauth2 import service_account


ADMIN_BASE = "https://analyticsadmin.googleapis.com/v1beta"
DATA_BASE = "https://analyticsdata.googleapis.com/v1beta"
EDIT_SCOPE = "https://www.googleapis.com/auth/analytics.edit"
READ_SCOPE = "https://www.googleapis.com/auth/analytics.readonly"

DIAGNOSTIC_EVENTS = {
    "postcode_submit",
    "deal_filter_changed",
    "deal_sort_changed",
    "speed_test_started",
    "scroll",
}
COMMERCIAL_EVENTS = {
    "outbound_provider_click",
    "contact_form_submit",
}


class Ga4Client:
    def __init__(self, credentials_path: Path) -> None:
        self.credentials = service_account.Credentials.from_service_account_file(
            str(credentials_path), scopes=[EDIT_SCOPE, READ_SCOPE]
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
            raise RuntimeError(f"GA4 API returned HTTP {exc.code}: {detail}") from exc


def list_key_events(client: Ga4Client, property_id: str) -> list[dict]:
    url = f"{ADMIN_BASE}/properties/{property_id}/keyEvents?pageSize=200"
    return client.request("GET", url).get("keyEvents", [])


def verify_reporting_access(client: Ga4Client, property_id: str) -> dict:
    url = f"{DATA_BASE}/properties/{property_id}:runReport"
    payload = {
        "dateRanges": [{"startDate": "7daysAgo", "endDate": "today"}],
        "metrics": [{"name": "eventCount"}],
    }
    return client.request("POST", url, payload)


def desired_changes(events: list[dict]) -> tuple[list[dict], list[str]]:
    by_event = {event["eventName"]: event for event in events}
    removals = [
        by_event[name]
        for name in sorted(DIAGNOSTIC_EVENTS)
        if name in by_event and by_event[name].get("deletable", False)
    ]
    additions = [name for name in sorted(COMMERCIAL_EVENTS) if name not in by_event]
    return removals, additions


def print_state(events: list[dict]) -> None:
    print("Current GA4 key events:")
    if not events:
        print("  (none)")
        return
    for event in sorted(events, key=lambda item: item["eventName"]):
        marker = "custom" if event.get("custom") else "default"
        print(f"  - {event['eventName']} ({marker})")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--credentials", required=True, type=Path)
    parser.add_argument("--property", default="551202232")
    parser.add_argument("--apply", action="store_true")
    args = parser.parse_args()

    if not args.credentials.is_file():
        print("Credential file was not found.", file=sys.stderr)
        return 2

    client = Ga4Client(args.credentials)
    prop = client.request("GET", f"{ADMIN_BASE}/properties/{args.property}")
    print(f"Connected property: {prop.get('displayName')} ({args.property})")

    report = verify_reporting_access(client, args.property)
    count = report.get("rows", [{}])[0].get("metricValues", [{}])[0].get("value", "0")
    print(f"Data API check: OK ({count} events in the requested 7-day window)")

    current = list_key_events(client, args.property)
    print_state(current)
    removals, additions = desired_changes(current)

    print("Planned classification changes:")
    for event in removals:
        print(f"  - normal event: {event['eventName']}")
    for name in additions:
        print(f"  - key event: {name}")
    if not removals and not additions:
        print("  (none; configuration already matches the requested state)")

    if not args.apply:
        print("Dry run only. Use --apply to make these changes.")
        return 0

    for event in removals:
        encoded_name = urllib.parse.quote(event["name"], safe="/")
        client.request("DELETE", f"{ADMIN_BASE}/{encoded_name}")
    for name in additions:
        client.request(
            "POST",
            f"{ADMIN_BASE}/properties/{args.property}/keyEvents",
            {"eventName": name, "countingMethod": "ONCE_PER_EVENT"},
        )

    final = list_key_events(client, args.property)
    print("Verified final state:")
    print_state(final)
    final_names = {event["eventName"] for event in final}
    valid = not (DIAGNOSTIC_EVENTS & final_names) and COMMERCIAL_EVENTS <= final_names
    if not valid:
        print("Final configuration did not match the requested state.", file=sys.stderr)
        return 1
    print("GA4 key-event classification is correct.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
