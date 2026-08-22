#!/usr/bin/env python3
"""Build a UK-wide postcode-district broadband coverage dataset from Ofcom's
open Connected Nations postcode-level data, so every UK postcode gets a real,
sourced coverage answer instead of the generic national fallback.

Ofcom's postcode-level fixed-broadband coverage file is published at full
postcode-unit granularity (e.g. "W3 6PZ"), residential premises, under the
Open Government Licence. This script downloads it, aggregates every postcode
up to its district (the outward code, e.g. "W3"), and writes a compact JSON
dataset keyed by district — about 2,900 districts covering the whole UK,
versus the ~50 curated towns the site previously modelled individually.

Usage:
    python3 scripts/build_postcode_coverage.py
    python3 scripts/build_postcode_coverage.py --source-zip /path/already-downloaded.zip

Data source: Ofcom Connected Nations, fixed broadband postcode-level
coverage (residential), July 2024 edition — the most recent edition Ofcom
has published at postcode-unit granularity as of this run. Ofcom's 2025
edition (published Nov 2025) only offers local/unitary-authority-level bulk
downloads at the equivalent page; re-check
https://www.ofcom.org.uk/phones-and-broadband/coverage-and-speeds/infrastructure-research
periodically for a newer postcode-level file and update DEFAULT_SOURCE_ZIP_URL
below when one appears — don't silently keep using a stale hardcoded URL
past a year or two without checking.
"""

from __future__ import annotations

import argparse
import csv
import io
import json
import re
import zipfile
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import requests

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_OUTPUT = ROOT / "data" / "postcode-district-coverage.json"
RUN_DATE = datetime.now(timezone.utc).date().isoformat()

DEFAULT_SOURCE_ZIP_URL = (
    "https://www.ofcom.org.uk/siteassets/resources/documents/research-and-data/"
    "multi-sector/infrastructure-research/connected-nations-2024/data-downloads/"
    "202407-fixed-coverage-postcodes-r01.zip?v=386548"
)
SOURCE_DATA_DATE = "2024-07"
SOURCE_LABEL = "Ofcom Connected Nations: fixed broadband postcode-level coverage (residential), July 2024"
SOURCE_PAGE = "https://www.ofcom.org.uk/phones-and-broadband/coverage-and-speeds/connected-nations-2024/data-downloads-2024"

USER_AGENT = (
    "BroadbandPickerCoverageBot/1.0 (postcode coverage build; contact: "
    "https://broadbandpicker.co.uk/contact)"
)

DISTRICT_RE = re.compile(r"^([A-Z]{1,2}[0-9][0-9A-Z]?)")

# Ofcom column -> our field name. Values are premises percentages (0-100).
COLUMNS = {
    "Gigabit availability (% premises)": "gigabitPercent",
    "SFBB availability (% premises)": "superfastPercent",
    "UFBB availability (% premises)": "ultrafastPercent",
    "% of premises below the USO": "belowUsoPercent",
    "% of premises with NGA": "ngaPercent",
}


def district_from_postcode(postcode: str) -> str | None:
    match = DISTRICT_RE.match(postcode.strip().upper())
    return match.group(1) if match else None


def fetch_source_zip(url: str, dest: Path) -> Path:
    print(f"Downloading Ofcom postcode coverage data from {url}")
    response = requests.get(url, headers={"User-Agent": USER_AGENT}, timeout=180, stream=True)
    response.raise_for_status()
    dest.write_bytes(response.content)
    return dest


def iter_residential_csvs(outer_zip_path: Path):
    with zipfile.ZipFile(outer_zip_path) as outer:
        inner_names = [n for n in outer.namelist() if n.endswith("_res_files.zip")]
        if not inner_names:
            raise RuntimeError("Could not find the residential postcode-level inner zip")
        with outer.open(inner_names[0]) as inner_fh:
            inner_bytes = inner_fh.read()
    with zipfile.ZipFile(io.BytesIO(inner_bytes)) as inner:
        csv_names = [n for n in inner.namelist() if n.endswith(".csv")]
        print(f"Found {len(csv_names)} postcode-area CSVs")
        for name in csv_names:
            with inner.open(name) as fh:
                yield io.TextIOWrapper(fh, encoding="utf-8-sig")


def aggregate_by_district(csv_streams) -> dict[str, dict[str, Any]]:
    sums: dict[str, dict[str, float]] = defaultdict(lambda: defaultdict(float))
    counts: dict[str, int] = defaultdict(int)
    areas: dict[str, str] = {}

    for stream in csv_streams:
        reader = csv.DictReader(stream)
        for row in reader:
            postcode = row.get("postcode_space") or row.get("postcode") or ""
            district = district_from_postcode(postcode)
            if not district:
                continue
            counts[district] += 1
            areas[district] = row.get("postcode area", "").strip() or areas.get(district, "")
            for column, field in COLUMNS.items():
                raw = row.get(column, "")
                try:
                    sums[district][field] += float(raw)
                except (TypeError, ValueError):
                    pass

    districts: dict[str, dict[str, Any]] = {}
    for district, count in counts.items():
        entry: dict[str, Any] = {
            "district": district,
            "postcodeArea": areas.get(district, district_from_postcode(district) or district),
            "sampleSize": count,
        }
        for field in COLUMNS.values():
            entry[field] = round(sums[district][field] / count, 1) if count else None
        districts[district] = entry
    return districts


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--source-zip", type=Path, default=None,
                         help="Path to an already-downloaded outer ZIP, to skip re-downloading 34MB")
    parser.add_argument("--source-url", default=DEFAULT_SOURCE_ZIP_URL)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    args = parser.parse_args()

    if args.source_zip:
        zip_path = args.source_zip
    else:
        zip_path = ROOT / ".cache" / "ofcom-postcode-coverage.zip"
        zip_path.parent.mkdir(parents=True, exist_ok=True)
        fetch_source_zip(args.source_url, zip_path)

    districts = aggregate_by_district(iter_residential_csvs(zip_path))
    print(f"Aggregated {len(districts)} postcode districts")

    payload = {
        "generatedAt": RUN_DATE,
        "sourceDataDate": SOURCE_DATA_DATE,
        "sourceLabel": SOURCE_LABEL,
        "sourcePage": SOURCE_PAGE,
        "districts": districts,
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(payload, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"Saved {args.output.resolve()} ({args.output.stat().st_size / 1024:.0f} KB)")


if __name__ == "__main__":
    main()
