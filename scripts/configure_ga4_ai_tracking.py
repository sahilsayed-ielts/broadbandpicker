#!/usr/bin/env python3
"""Register BroadbandPicker AI-referral reporting dimensions in GA4."""

from __future__ import annotations

import argparse
import json
import sys
import urllib.error
import urllib.request
from pathlib import Path

from google.auth.transport.requests import Request
from google.oauth2 import service_account


ADMIN_BASE = "https://analyticsadmin.googleapis.com/v1beta"
EDIT_SCOPE = "https://www.googleapis.com/auth/analytics.edit"

DIMENSIONS = [
    {
        "displayName": "AI platform",
        "parameterName": "ai_platform",
        "description": "AI assistant that referred the consented session.",
        "scope": "EVENT",
    },
    {
        "displayName": "AI referrer domain",
        "parameterName": "referrer_domain",
        "description": "Referring AI domain or explicit AI campaign source.",
        "scope": "EVENT",
    },
    {
        "displayName": "Content page type",
        "parameterName": "page_type",
        "description": "BroadbandPicker content type receiving the AI referral.",
        "scope": "EVENT",
    },
]


class AdminClient:
    def __init__(self, credentials_path: Path) -> None:
        self.credentials = service_account.Credentials.from_service_account_file(
            str(credentials_path), scopes=[EDIT_SCOPE]
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


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--credentials", required=True, type=Path)
    parser.add_argument("--property", default="551202232")
    parser.add_argument("--apply", action="store_true")
    args = parser.parse_args()

    if not args.credentials.is_file():
        print("Credential file was not found.", file=sys.stderr)
        return 2

    client = AdminClient(args.credentials)
    prop = client.request("GET", f"{ADMIN_BASE}/properties/{args.property}")
    print(f"Connected property: {prop.get('displayName')} ({args.property})")

    endpoint = f"{ADMIN_BASE}/properties/{args.property}/customDimensions"
    existing = client.request("GET", f"{endpoint}?pageSize=200").get("customDimensions", [])
    existing_parameters = {item["parameterName"] for item in existing}
    missing = [item for item in DIMENSIONS if item["parameterName"] not in existing_parameters]

    print("AI reporting dimensions:")
    for item in DIMENSIONS:
        state = "existing" if item["parameterName"] in existing_parameters else "create"
        print(f"  - {item['parameterName']}: {state}")

    if not args.apply:
        print("Dry run only. Use --apply to create missing dimensions.")
        return 0

    for item in missing:
        client.request("POST", endpoint, item)

    final = client.request("GET", f"{endpoint}?pageSize=200").get("customDimensions", [])
    final_parameters = {item["parameterName"] for item in final}
    if not {item["parameterName"] for item in DIMENSIONS} <= final_parameters:
        print("GA4 custom-dimension verification failed.", file=sys.stderr)
        return 1

    print("GA4 AI reporting dimensions are configured and verified.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
