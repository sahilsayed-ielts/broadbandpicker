#!/usr/bin/env python3
"""Analyse BroadbandPicker's speed test against UK rank-1 checkers.

This is a measurement and product-gap script, not a ranking promise.

It checks:
  * how Ookla, thinkbroadband, Uswitch, FAST.com and Cloudflare describe a test
  * whether our endpoints compress, cache, or sit outside the UK
  * whether a single short transfer can saturate a modern line
  * whether the client uses multi-stream, warmup discard and a robust statistic

Write docs/speed-test-analysis.json and docs/speed-test-analysis.md.
"""

from __future__ import annotations

import argparse
import json
import math
import statistics
import time
from datetime import datetime, timezone
from pathlib import Path
from urllib.error import URLError
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
REPORT_JSON = ROOT / "docs" / "speed-test-analysis.json"
REPORT_MD = ROOT / "docs" / "speed-test-analysis.md"
COMPONENT = ROOT / "components" / "SpeedTest.tsx"
DOWNLOAD_ROUTE = ROOT / "app" / "api" / "speedtest" / "download" / "route.ts"
USER_AGENT = "BroadbandPickerSpeedTestAnalysis/1.0 (+https://broadbandpicker.co.uk/contact)"

RANK1_METHODS = {
    "Ookla Speedtest": {
        "url": "https://www.speedtest.net/",
        "uk_role": "Usual Google UK rank 1 for internet speed test",
        "how_it_works": [
            "Picks a nearby dedicated test server by ping, not the page origin.",
            "Uses several parallel TCP connections to fill the pipe after slow start.",
            "Reports a weighted high-percentile speed (modified trimean / 90th-percentile style), not bytes/total-time.",
            "Measures idle latency, then download, then upload; can show loaded latency and experience ratings.",
        ],
    },
    "thinkbroadband": {
        "url": "https://www.thinkbroadband.com/speedtest",
        "uk_role": "Long-running UK specialist checker",
        "how_it_works": [
            "UK-hosted test aimed at ADSL through gigabit FTTP.",
            "Runs about 20 to 60 seconds so the line can saturate.",
            "Tells people to use Ethernet when diagnosing a fault.",
            "Logs results for national statistics; treats the number as an indication, not a line certificate.",
        ],
    },
    "Uswitch": {
        "url": "https://www.uswitch.com/broadband/speedtest/",
        "uk_role": "High-ranking UK comparison-site checker",
        "how_it_works": [
            "HTTPS download of a small probe, then a larger payload sized to the connection.",
            "Upload uses several packets at once to fill upload capacity.",
            "UK servers; result is a snapshot, then a compare-deals next step.",
        ],
    },
    "Cloudflare": {
        "url": "https://speed.cloudflare.com/",
        "uk_role": "Anycast quality test used as a professional benchmark",
        "how_it_works": [
            "Measures unloaded and loaded latency, download, upload and packet loss.",
            "Uses Cloudflare's edge so the server is close to the user.",
            "Saturates with concurrent transfers rather than one short file.",
        ],
    },
}


def fetch(url: str, method: str = "GET", data: bytes | None = None, timeout: int = 45) -> tuple[int, dict[str, str], bytes, float]:
    req = Request(url, data=data, method=method, headers={"User-Agent": USER_AGENT})
    started = time.perf_counter()
    with urlopen(req, timeout=timeout) as response:
        body = response.read()
        headers = {k.lower(): v for k, v in response.headers.items()}
        elapsed = time.perf_counter() - started
        return int(response.status), headers, body, elapsed


def shannon_entropy(sample: bytes) -> float:
    if not sample:
        return 0.0
    counts = [0] * 256
    for byte in sample:
        counts[byte] += 1
    entropy = 0.0
    length = len(sample)
    for count in counts:
        if count:
            p = count / length
            entropy -= p * math.log2(p)
    return round(entropy, 4)


def source_gaps(component: str, download_route: str) -> dict:
    lower = component.lower() + "\n" + download_route.lower()
    return {
        "multi_stream": "streams" in lower or "parallel" in lower or "concurrency" in lower,
        "warmup_discard": "warmup" in lower or "slow start" in lower or "discard" in lower,
        "percentile_or_trimean": "percentile" in lower or "trimean" in lower or "p90" in lower,
        "identity_encoding": "content-encoding" in download_route.lower() and "identity" in download_route.lower(),
        "loaded_latency": "loaded" in lower,
        "london_region": "lhr1" in download_route.lower() or '"regions": ["lhr1"]' in (ROOT / "vercel.json").read_text(encoding="utf-8"),
        "nested_parallel_ping_bug": "Promise.all(Array.from({ length: 5 }" in component,
        "single_10mb_download": "10 * 1024 * 1024" in download_route or "TOTAL = 10" in download_route,
    }


def endpoint_lab(base: str) -> dict:
    ping_url = f"{base}/api/speedtest/ping?t={int(time.time())}"
    download_url = f"{base}/api/speedtest/download?bytes=1048576&t={int(time.time())}"
    upload_url = f"{base}/api/speedtest/upload?t={int(time.time())}"
    result: dict = {"base": base, "checks": []}

    try:
        status, headers, body, elapsed = fetch(ping_url)
        pings = []
        for _ in range(6):
            _, _, _, sample = fetch(ping_url)
            pings.append(round(sample * 1000, 1))
        result["checks"].append({
            "name": "ping",
            "status": status,
            "cache_control": headers.get("cache-control", ""),
            "samples_ms": pings,
            "median_ms": statistics.median(pings),
            "passed": status in {200, 204} and "no-store" in headers.get("cache-control", ""),
        })
    except (URLError, TimeoutError, OSError) as exc:
        result["checks"].append({"name": "ping", "passed": False, "error": str(exc)[:240]})

    try:
        status, headers, body, elapsed = fetch(download_url, timeout=60)
        encoding = headers.get("content-encoding", "identity")
        vercel_id = headers.get("x-vercel-id", headers.get("server", ""))
        mbps = (len(body) * 8 / elapsed / 1e6) if elapsed else 0
        result["checks"].append({
            "name": "download_1mb",
            "status": status,
            "bytes": len(body),
            "elapsed_s": round(elapsed, 3),
            "single_stream_mbps": round(mbps, 2),
            "content_encoding": encoding,
            "cache_control": headers.get("cache-control", ""),
            "vercel_id": vercel_id,
            "entropy_first_64k": shannon_entropy(body[:65536]),
            "compressible": shannon_entropy(body[:65536]) < 7.5,
            "passed": status == 200 and "no-store" in headers.get("cache-control", "") and shannon_entropy(body[:65536]) >= 7.5,
        })
    except (URLError, TimeoutError, OSError) as exc:
        result["checks"].append({"name": "download_1mb", "passed": False, "error": str(exc)[:240]})

    try:
        payload = bytes(range(256)) * 4096
        status, headers, body, elapsed = fetch(upload_url, method="POST", data=payload, timeout=60)
        result["checks"].append({
            "name": "upload_1mb",
            "status": status,
            "elapsed_s": round(elapsed, 3),
            "cache_control": headers.get("cache-control", ""),
            "passed": status == 200 and "no-store" in headers.get("cache-control", ""),
        })
    except (URLError, TimeoutError, OSError) as exc:
        result["checks"].append({"name": "upload_1mb", "passed": False, "error": str(exc)[:240]})

    return result


def markdown(report: dict) -> str:
    gaps = report["client_and_server_gaps"]
    lines = [
        "# Speed test analysis",
        "",
        f"Generated {report['generated']}.",
        "",
        "This is a measurement and product-gap review. It does not promise Google rank 1.",
        "",
        "## What rank-1 UK checkers actually do",
        "",
    ]
    for name, row in report["rank1_methods"].items():
        lines.append(f"### {name}")
        lines.append(f"{row['uk_role']}. {row['url']}")
        lines.append("")
        for item in row["how_it_works"]:
            lines.append(f"- {item}")
        lines.append("")
    lines.extend([
        "## Why a short single-file test under-reads",
        "",
        "TCP slow start means the first megabyte never uses the full path. A 10 MB single stream on a 500 Mbps or gigabit line can finish before the window opens, so bytes/time looks like 40 to 150 Mbps. Ookla, Cloudflare and Uswitch fill the path with several connections and score the saturated period, not the whole transfer.",
        "",
        "## Current code gaps",
        "",
    ])
    labels = {
        "multi_stream": "Multi-connection download and upload",
        "warmup_discard": "Discard TCP slow-start samples",
        "percentile_or_trimean": "90th percentile or trimean headline speed",
        "identity_encoding": "Content-Encoding identity on the download payload",
        "loaded_latency": "Loaded latency during download",
        "london_region": "UK region (lhr1)",
        "nested_parallel_ping_bug": "Ping is sequential with warmup, not 5 overlapping batches",
        "single_10mb_download": "Download is no longer a single 10 MB file",
    }
    invert = {"nested_parallel_ping_bug", "single_10mb_download"}
    for key, label in labels.items():
        present = gaps[key]
        ok = (not present) if key in invert else present
        lines.append(f"- {'PASS' if ok else 'FAIL'}: {label}")
    lines.extend(["", "## Endpoint lab", ""])
    for check in report["endpoint_lab"]["checks"]:
        lines.append(f"- **{check['name']}**: {json.dumps({k: v for k, v in check.items() if k != 'name'})}")
    lines.extend([
        "",
        "## Required product method",
        "",
        "1. Warmup ping, then 8 to 12 sequential pings. Headline ping is the median. Jitter is the mean consecutive difference.",
        "2. Download with several parallel streams for about 8 seconds. Discard the first 2 seconds. Headline is the 90th percentile of the remaining samples.",
        "3. During the last seconds of download, measure loaded ping (bufferbloat).",
        "4. Upload the same way with several parallel posts.",
        "5. Host the test in London. Use incompressible payloads and `Cache-Control: no-store, no-transform`.",
        "6. Tell the user this is the path to our UK server, not an Ofcom-accredited line test. Ethernet still beats Wi-Fi.",
        "",
    ])
    return "\n".join(lines) + "\n"


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--base-url", default="https://broadbandpicker.co.uk")
    args = parser.parse_args()

    component = COMPONENT.read_text(encoding="utf-8")
    download_route = DOWNLOAD_ROUTE.read_text(encoding="utf-8")
    report = {
        "generated": datetime.now(timezone.utc).isoformat(),
        "page": "https://broadbandpicker.co.uk/tools/speed-test",
        "rank1_methods": RANK1_METHODS,
        "client_and_server_gaps": source_gaps(component, download_route),
        "endpoint_lab": endpoint_lab(args.base_url.rstrip("/")),
    }
    REPORT_JSON.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    REPORT_MD.write_text(markdown(report), encoding="utf-8")
    print(json.dumps({"json": str(REPORT_JSON), "md": str(REPORT_MD), "gaps": report["client_and_server_gaps"]}, indent=2))


if __name__ == "__main__":
    main()
