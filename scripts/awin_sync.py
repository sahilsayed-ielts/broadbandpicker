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


GENUINE_STATUSES = ["joined", "pending", "suspended", "rejected"]


def _fetch_relationship(pid: str, token: str, relationship: str) -> list[dict]:
    resp = requests.get(
        f"{API_BASE}/publishers/{pid}/programmes",
        headers={"Authorization": f"Bearer {token}"},
        params={"relationship": relationship},
        timeout=20,
    )
    if resp.status_code != 200:
        print(f"Awin API error {resp.status_code} ({relationship}): {resp.text[:300]}", file=sys.stderr)
        sys.exit(1)
    return resp.json()


def check_programmes(relationship: str) -> None:
    token = get_token()
    pid = publisher_id()

    # 'notjoined' returns the entire ~21k Awin advertiser catalogue (every
    # programme you haven't applied to, not just broadband-relevant ones) —
    # only fetch it if explicitly asked for. The other 4 statuses are your
    # actual applications and are always worth seeing together.
    statuses = GENUINE_STATUSES if relationship == "any" else [relationship]

    total = 0
    for status in statuses:
        programmes = _fetch_relationship(pid, token, status)
        total += len(programmes)
        print(f"-- {status} ({len(programmes)}) --")
        for p in sorted(programmes, key=lambda x: x.get("name", "")):
            sector = p.get("primarySector") or "—"
            print(f"  [{p.get('id')}] {p.get('name')}  ({sector})")
        print()

    if relationship == "notjoined":
        print(f"{total} programme(s) not yet applied to across the whole Awin platform (not filtered to broadband).")


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
        help="Filter programmes by relationship status. 'any' (default) covers "
        "joined/pending/suspended/rejected together; 'notjoined' is separate "
        "because it returns the whole ~21k Awin catalogue.",
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
