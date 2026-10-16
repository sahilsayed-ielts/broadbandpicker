#!/usr/bin/env python3
"""Authorize and verify read-only Google AdSense Management API access.

AdSense does not support service accounts. This script uses Google's OAuth
installed-application flow and stores the resulting refresh token locally.

Examples:
    python3 scripts/connect_google_adsense.py authorize --client-secret /path/to/client.json
    python3 scripts/connect_google_adsense.py check
    python3 scripts/connect_google_adsense.py report --days 30
"""

from __future__ import annotations

import argparse
import csv
import json
import os
import sys
from datetime import date, timedelta
from pathlib import Path
from typing import Any
from urllib.parse import urlencode

from google.auth.transport.requests import AuthorizedSession, Request
from google.oauth2.credentials import Credentials


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_TOKEN = ROOT / ".secrets" / "google-adsense-token.json"
DEFAULT_OUTPUT = ROOT / "docs" / "adsense-performance.csv"
READ_SCOPE = "https://www.googleapis.com/auth/adsense.readonly"
API_BASE = "https://adsense.googleapis.com/v2"


def token_path(value: str | None) -> Path:
    return Path(value or os.environ.get("GOOGLE_ADSENSE_TOKEN_JSON", DEFAULT_TOKEN)).expanduser()


def load_credentials(path: Path) -> Credentials:
    if not path.is_file():
        raise RuntimeError(
            f"AdSense token not found: {path}. Run the authorize command first."
        )
    credentials = Credentials.from_authorized_user_file(str(path), scopes=[READ_SCOPE])
    if not credentials.valid:
        if not credentials.refresh_token:
            raise RuntimeError("The saved AdSense authorization has no refresh token; authorize again.")
        credentials.refresh(Request())
        save_credentials(credentials, path)
    return credentials


def save_credentials(credentials: Credentials, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(credentials.to_json(), encoding="utf-8")
    path.chmod(0o600)


def authorize(client_secret: Path, destination: Path) -> None:
    if not client_secret.is_file():
        raise RuntimeError(f"OAuth client JSON was not found: {client_secret}")
    try:
        from google_auth_oauthlib.flow import InstalledAppFlow
    except ImportError as exc:
        raise RuntimeError("Install dependencies first: pip3 install -r requirements-seo.txt") from exc

    flow = InstalledAppFlow.from_client_secrets_file(str(client_secret), scopes=[READ_SCOPE])
    credentials = flow.run_local_server(
        host="localhost",
        port=0,
        authorization_prompt_message="Open this URL if the browser does not open:\n{url}",
        success_message="BroadbandPicker now has read-only AdSense access. You may close this tab.",
        open_browser=True,
        access_type="offline",
        prompt="consent",
    )
    save_credentials(credentials, destination)
    print(f"Saved read-only AdSense authorization: {destination}")


def api_get(session: AuthorizedSession, path: str, params: dict[str, Any] | None = None) -> dict:
    url = f"{API_BASE}/{path.lstrip('/')}"
    response = session.get(url, params=params, timeout=30)
    if not response.ok:
        raise RuntimeError(f"AdSense API HTTP {response.status_code}: {response.text[:1000]}")
    return response.json()


def list_accounts(session: AuthorizedSession) -> list[dict[str, Any]]:
    return api_get(session, "accounts", {"pageSize": 100}).get("accounts", [])


def choose_account(accounts: list[dict[str, Any]], requested: str | None) -> dict[str, Any]:
    if not accounts:
        raise RuntimeError("The authorised Google user has no accessible AdSense accounts.")
    if requested:
        normalised = requested if requested.startswith("accounts/") else f"accounts/{requested}"
        match = next((item for item in accounts if item.get("name") == normalised), None)
        if not match:
            raise RuntimeError(f"AdSense account is not available to this user: {normalised}")
        return match
    if len(accounts) > 1:
        names = ", ".join(str(item.get("name")) for item in accounts)
        raise RuntimeError(f"More than one account is available ({names}); pass --account.")
    return accounts[0]


def check_connection(credentials: Credentials, requested_account: str | None) -> dict[str, Any]:
    session = AuthorizedSession(credentials)
    accounts = list_accounts(session)
    account = choose_account(accounts, requested_account)
    name = str(account["name"])
    sites = api_get(session, f"{name}/sites", {"pageSize": 100}).get("sites", [])
    alerts = api_get(session, f"{name}/alerts", {"languageCode": "en-GB"}).get("alerts", [])
    print(f"Connected AdSense account: {name}")
    print(f"Display name: {account.get('displayName') or '(not supplied)'}")
    print(f"State: {account.get('state') or '(not supplied)'}")
    print(f"Sites visible: {len(sites)}")
    for site in sites:
        print(f"  - {site.get('domain')} [{site.get('state', 'UNKNOWN')}]")
    print(f"Active alerts: {len(alerts)}")
    for alert in alerts:
        severity = alert.get("severity", "UNKNOWN")
        alert_type = alert.get("type", "unknown")
        message = alert.get("message", "(no message supplied)")
        print(f"  - [{severity}] {message} ({alert_type})")
    needs_attention = [site for site in sites if site.get("state") == "NEEDS_ATTENTION"]
    if needs_attention:
        print("Sites requiring dashboard review:")
        for site in needs_attention:
            print(f"  - {site.get('domain')}")
        print(
            "Google's AdSense Management API reports the site state but does not "
            "return the site-review reason. Open AdSense > Sites and select the "
            "domain to see the required action."
        )
    print("Access level: read-only")
    return account


def generate_report(
    credentials: Credentials, requested_account: str | None, days: int, output: Path
) -> None:
    session = AuthorizedSession(credentials)
    account = choose_account(list_accounts(session), requested_account)
    end = date.today()
    start = end - timedelta(days=max(1, days) - 1)
    params: list[tuple[str, str]] = [
        ("dateRange", "CUSTOM"),
        ("startDate.year", str(start.year)),
        ("startDate.month", str(start.month)),
        ("startDate.day", str(start.day)),
        ("endDate.year", str(end.year)),
        ("endDate.month", str(end.month)),
        ("endDate.day", str(end.day)),
        ("dimensions", "DATE"),
        ("metrics", "ESTIMATED_EARNINGS"),
        ("metrics", "PAGE_VIEWS"),
        ("metrics", "IMPRESSIONS"),
        ("metrics", "CLICKS"),
        ("metrics", "PAGE_VIEWS_RPM"),
        ("orderBy", "+DATE"),
        ("currencyCode", "GBP"),
    ]
    url = f"{API_BASE}/{account['name']}/reports:generate?{urlencode(params)}"
    response = session.get(url, timeout=60)
    if not response.ok:
        raise RuntimeError(f"AdSense report HTTP {response.status_code}: {response.text[:1200]}")
    report = response.json()
    headers = [item.get("name", "") for item in report.get("headers", [])]
    rows = [[cell.get("value", "") for cell in row.get("cells", [])] for row in report.get("rows", [])]
    output.parent.mkdir(parents=True, exist_ok=True)
    with output.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.writer(handle)
        writer.writerow(headers)
        writer.writerows(rows)
    print(f"AdSense report: {start} to {end}")
    print(f"Rows: {len(rows)}")
    print(f"Saved: {output}")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("command", choices=("authorize", "check", "report"))
    parser.add_argument("--client-secret", type=Path, help="Downloaded Desktop OAuth client JSON")
    parser.add_argument("--token", help=f"Token destination (default: {DEFAULT_TOKEN})")
    parser.add_argument("--account", help="Account resource name or numeric account ID")
    parser.add_argument("--days", type=int, default=30)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    args = parser.parse_args()
    destination = token_path(args.token)
    try:
        if args.command == "authorize":
            if not args.client_secret:
                parser.error("authorize requires --client-secret /path/to/client.json")
            authorize(args.client_secret.expanduser(), destination)
            credentials = load_credentials(destination)
            check_connection(credentials, args.account)
        elif args.command == "check":
            check_connection(load_credentials(destination), args.account)
        else:
            if args.days < 1:
                parser.error("--days must be at least 1")
            generate_report(load_credentials(destination), args.account, args.days, args.output)
    except RuntimeError as exc:
        print(f"Error: {exc}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
