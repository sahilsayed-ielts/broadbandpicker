#!/usr/bin/env python3
"""Talk to the Awin Publisher API directly — no manual dashboard checking,
no manually pasting affiliate links into data/providers.ts.

Two things this does:
  1. --check-programmes   List every advertiser programme and its
                           relationship status (joined / pending / declined
                           / not joined), so outreach progress is a report,
                           not a memory.
  2. --generate-link       Ask Awin for the correct, current tracking link
                           for a specific advertiser + destination URL,
                           instead of hand-typing one.

Requires an AWIN_API_TOKEN environment variable (a personal API token from
the Awin platform: user menu -> API Credentials) and AWIN_PUBLISHER_ID
(defaults to 2942019, the publisher ID already used elsewhere in this repo).

Usage:
    python3 scripts/awin_sync.py --check-programmes
    python3 scripts/awin_sync.py --check-programmes --relationship pending
    python3 scripts/awin_sync.py --generate-link --advertiser-id 1234 --url https://www.bt.com/broadband
"""

from __future__ import annotations

import argparse
import json
import os
import sys

import requests

API_BASE = "https://api.awin.com"
DEFAULT_PUBLISHER_ID = "2942019"


def get_token() -> str:
    token = os.environ.get("AWIN_API_TOKEN")
    if not token:
        print(
            "AWIN_API_TOKEN is not set.\n\n"
            "To get one: log into the Awin platform (ui.awin.com), open the user menu "
            "(top right), select 'API Credentials', and generate a personal access token. "
            "Then add it to .env.local as:\n\n"
            "  AWIN_API_TOKEN=your-token-here\n\n"
            "This token is tied to your personal Awin login, not just one publisher account "
            "— treat it like a password.",
            file=sys.stderr,
        )
        sys.exit(1)
    return token


def publisher_id() -> str:
    return os.environ.get("AWIN_PUBLISHER_ID", DEFAULT_PUBLISHER_ID)


def check_programmes(relationship: str) -> None:
    token = get_token()
    pid = publisher_id()
    url = f"{API_BASE}/publishers/{pid}/programmedetails"
    resp = requests.get(
        url,
        headers={"Authorization": f"Bearer {token}"},
        params={"relationship": relationship},
        timeout=20,
    )
    if resp.status_code != 200:
        print(f"Awin API error {resp.status_code}: {resp.text[:500]}", file=sys.stderr)
        sys.exit(1)

    programmes = resp.json()
    if not programmes:
        print(f"No programmes found with relationship='{relationship}'.")
        return

    by_status: dict[str, list[dict]] = {}
    for p in programmes:
        status = p.get("relationship", "unknown")
        by_status.setdefault(status, []).append(p)

    print(f"{len(programmes)} programme(s), relationship filter = '{relationship}'\n")
    for status, items in sorted(by_status.items()):
        print(f"-- {status} ({len(items)}) --")
        for p in sorted(items, key=lambda x: x.get("advertiserName", "")):
            print(f"  [{p.get('id')}] {p.get('advertiserName')}")
        print()


def generate_link(advertiser_id: int, destination_url: str) -> None:
    token = get_token()
    pid = publisher_id()
    url = f"{API_BASE}/publishers/{pid}/linkbuilder/generate"
    resp = requests.post(
        url,
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
        json={"advertiserId": advertiser_id, "destinationUrl": destination_url, "parameters": {}},
        timeout=20,
    )
    if resp.status_code != 200:
        print(f"Awin API error {resp.status_code}: {resp.text[:500]}", file=sys.stderr)
        sys.exit(1)

    print(json.dumps(resp.json(), indent=2))


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--check-programmes", action="store_true", help="List advertiser programmes and status")
    parser.add_argument(
        "--relationship",
        default="any",
        choices=["joined", "pending", "suspended", "rejected", "notjoined", "any"],
        help="Filter programmes by relationship status (default: any)",
    )
    parser.add_argument("--generate-link", action="store_true", help="Generate a tracking link")
    parser.add_argument("--advertiser-id", type=int, help="Awin advertiser ID (required with --generate-link)")
    parser.add_argument("--url", help="Destination URL to wrap in a tracking link (required with --generate-link)")
    args = parser.parse_args()

    if args.check_programmes:
        check_programmes(args.relationship)
    elif args.generate_link:
        if not args.advertiser_id or not args.url:
            parser.error("--generate-link requires --advertiser-id and --url")
        generate_link(args.advertiser_id, args.url)
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
