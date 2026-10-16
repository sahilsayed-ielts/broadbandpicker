#!/usr/bin/env python3
"""Build the monthly UK Broadband Price Index from BroadbandPicker's own dataset.

Source of truth is data/providers.ts: each provider's verified entry price
(monthlyPriceFrom) and the date it was checked (pricingVerifiedDate). Git
history gives the value as recorded at the end of every past month; the
working-tree file gives the current month. Months with no dataset change
carry the previous value forward, and are flagged as carried.

Only entry prices are used. Higher speed tiers on /deals are still estimated
(entry + £5 per step), so they are never published as index data.

Output: data/price-index.json (read by /research/broadband-price-index).
Run monthly, or after any provider price update:
  python3 scripts/build_price_index.py
"""

from __future__ import annotations

import json
import re
import subprocess
from datetime import date
from pathlib import Path
from statistics import median

ROOT = Path(__file__).resolve().parent.parent
SOURCE = "data/providers.ts"
CHECKS = "data/provider-price-checks.json"
OUT = ROOT / "data" / "price-index.json"
# August 2026 is the first month after the full price-verification pass;
# earlier months reflect the launch dataset and are not published.
FIRST_MONTH = "2026-08"

BLOCK = re.compile(r"\n  \{\n    slug: '([a-z0-9-]+)',(.*?)\n  \},", re.S)


def parse(ts: str) -> dict[str, dict]:
    providers: dict[str, dict] = {}
    for slug, body in BLOCK.findall(ts):
        price = re.search(r"monthlyPriceFrom:\s*([0-9.]+)", body)
        name = re.search(r"\n    name:\s*'([^']+)'", body)
        if not price or not name:
            continue
        retired = re.search(r"retiredDate:\s*'([0-9-]+)'", body)
        verified = re.search(r"pricingVerifiedDate:\s*'([0-9-]+)'", body)
        providers[slug] = {
            "name": name.group(1),
            "price": round(float(price.group(1)), 2),
            "retired": retired.group(1) if retired else None,
            "verified": verified.group(1) if verified else None,
        }
    return providers


def apply_checks(providers: dict[str, dict], checks_json: str | None) -> dict[str, dict]:
    """Hand-checked package prices override the typed entry price (same rule as data/providers.ts)."""
    if not checks_json:
        return providers
    try:
        checks = json.loads(checks_json).get("providers", {})
    except json.JSONDecodeError:
        return providers
    for slug, check in checks.items():
        prices = [p["monthlyPrice"] for p in check.get("packages", [])]
        if not prices and check.get("entryPrice") is not None:
            prices = [check["entryPrice"]]
        if slug in providers and prices:
            providers[slug] = {**providers[slug], "price": round(min(prices), 2), "verified": check.get("checkedAt")}
    return providers


def git_show(ref: str) -> str | None:
    try:
        return git("show", ref)
    except subprocess.CalledProcessError:
        return None


def git(*args: str) -> str:
    return subprocess.run(["git", *args], cwd=ROOT, check=True, capture_output=True, text=True).stdout


def month_iter(start: str, end: str):
    y, m = map(int, start.split("-"))
    ey, em = map(int, end.split("-"))
    while (y, m) <= (ey, em):
        yield f"{y:04d}-{m:02d}"
        m += 1
        if m == 13:
            y, m = y + 1, 1


def last_commit_by(month: str) -> tuple[str, str] | None:
    y, m = map(int, month.split("-"))
    nxt = f"{y + (m == 12):04d}-{(m % 12) + 1:02d}-01"
    out = git("log", "-1", "--format=%H %ad", "--date=short", f"--before={nxt}T00:00:00", "--", SOURCE).strip()
    if not out:
        return None
    sha, day = out.split()
    return sha, day


def summarise(prices: dict[str, float]) -> dict:
    values = sorted(prices.values())
    return {
        "providers": len(values),
        "cheapest": values[0] if values else None,
        "median": round(median(values), 2) if values else None,
        "average": round(sum(values) / len(values), 2) if values else None,
    }


def main() -> int:
    today = date.today()
    current_month = today.strftime("%Y-%m")
    checks_path = ROOT / CHECKS
    current = apply_checks(parse((ROOT / SOURCE).read_text(encoding="utf-8")),
                           checks_path.read_text(encoding="utf-8") if checks_path.exists() else None)
    names = {slug: p["name"] for slug, p in current.items()}

    months = []
    prev_sha = None
    for month in month_iter(FIRST_MONTH, current_month):
        if month == current_month:
            data, source, carried = current, f"working tree on {today.isoformat()}", False
        else:
            found = last_commit_by(month)
            if not found:
                continue
            sha, day = found
            data = apply_checks(parse(git("show", f"{sha}:{SOURCE}")), git_show(f"{sha}:{CHECKS}"))
            carried = sha == prev_sha
            source = f"commit {sha[:7]} ({day})"
            prev_sha = sha
        active = {
            slug: p["price"] for slug, p in data.items()
            if not p["retired"] or p["retired"] > f"{month}-31"
        }
        for slug, p in data.items():
            names.setdefault(slug, p["name"])
        rechecked = sum(1 for slug, p in data.items() if slug in active and (p.get("verified") or "").startswith(month))
        months.append({"month": month, "source": source, "carried": carried, "rechecked": rechecked,
                       "prices": active, **summarise(active)})

    # Like-for-like basket: providers with a price in every published month.
    basket = sorted(set.intersection(*(set(m["prices"]) for m in months))) if months else []
    for m in months:
        m["basket"] = summarise({slug: m["prices"][slug] for slug in basket})

    out = {
        "generated": today.isoformat(),
        "basket": basket,
        "method": "Verified entry price (cheapest advertised home broadband package) per provider, as recorded in the BroadbandPicker dataset at month end.",
        "names": dict(sorted(names.items())),
        "verified": {slug: p["verified"] for slug, p in current.items()},
        "months": months,
    }
    OUT.write_text(json.dumps(out, indent=2) + "\n", encoding="utf-8")
    last = months[-1]
    print(f"Wrote {OUT.relative_to(ROOT)}: {len(months)} months, {last['providers']} providers in {last['month']}, "
          f"median £{last['median']}, cheapest £{last['cheapest']}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
