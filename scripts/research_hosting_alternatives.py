#!/usr/bin/env python3
"""Research Next.js-capable hosting alternatives to Vercel.

BroadbandPicker is a Next.js 16 app with real server-side surface (API
routes for the contact form, IndexNow pings, partner onboarding, and the
speed-test proxy endpoints) plus ~190 mostly static/SSG pages. "Same way of
working as Vercel" means: push to `main` on GitHub, a hosted CI builds and
deploys automatically, pull requests get their own preview URL, custom
domain + managed SSL, environment variables via a dashboard, zero servers to
patch. This script only considers platforms that offer that workflow
out of the box.

It scrapes each candidate's own pricing/docs pages (static HTTP fetch, no
JS execution) for the load-bearing facts -- free-tier presence, entry paid
price, bandwidth/usage figures, and keyword evidence of Next.js SSR/ISR,
git-based deploys, preview deployments and edge/serverless functions -- and
flags anything it can't find as "verify manually", the same honesty
convention as scripts/analyze_page_type_ux.py. Marketing pricing pages
change often and this is regex-over-rendered-HTML, not an API: treat the
scraped numbers as a dated snapshot to sanity-check, not a quote.

Usage:
    python3 scripts/research_hosting_alternatives.py
    python3 scripts/research_hosting_alternatives.py --output-dir docs/hosting-research
"""

from __future__ import annotations

import argparse
import json
import re
import time
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "docs" / "hosting-research"
NOW = datetime.now(timezone.utc)

USER_AGENT = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36"
)

# What this specific app needs from a host, independent of price. Used to
# score/flag candidates, not just list them.
APP_REQUIREMENTS = [
    "Next.js 16 App Router build support (not just static export)",
    "Server-side API routes (contact form, IndexNow ping, partner onboarding, speed-test proxy endpoints)",
    "Git push to main -> automatic production build and deploy, no manual step",
    "Automatic preview deployment per branch/PR",
    "Custom domain with managed SSL",
    "Environment variables set via dashboard (Supabase, GA4, Awin, SerpApi keys)",
    "Predictable cost at low-to-moderate traffic (current site is pre-scale)",
]

# name, homepage, pricing/docs URLs to scan, and a short "why it's on the list" note.
CANDIDATES: list[tuple[str, str, list[str], str]] = [
    (
        "Vercel (current)", "https://vercel.com",
        ["https://vercel.com/pricing", "https://vercel.com/docs/frameworks/nextjs"],
        "Baseline -- built by the Next.js authors, first-party feature support is always current.",
    ),
    (
        "Netlify", "https://www.netlify.com",
        ["https://www.netlify.com/pricing/", "https://docs.netlify.com/frameworks/next-js/overview/"],
        "Closest like-for-like workflow to Vercel: same git-push model, its own Next.js runtime for SSR/ISR/API routes.",
    ),
    (
        "Cloudflare Workers/Pages", "https://pages.cloudflare.com",
        [
            "https://pages.cloudflare.com/",
            "https://developers.cloudflare.com/pages/platform/limits/",
            "https://developers.cloudflare.com/workers/platform/pricing/",
        ],
        "No bandwidth charges at all (the single biggest structural cost difference vs Vercel/Netlify) via the OpenNext Cloudflare adapter for Next.js.",
    ),
    (
        "AWS Amplify Hosting", "https://aws.amazon.com/amplify/",
        ["https://aws.amazon.com/amplify/pricing/"],
        "Full SSR support, pay-as-you-go; more AWS console/IAM overhead than the others.",
    ),
    (
        "Railway", "https://railway.com",
        ["https://railway.com/pricing"],
        "Runs Next.js as a normal Node server (not edge-split); usage-based, simple git deploys.",
    ),
    (
        "Render", "https://render.com",
        ["https://render.com/pricing"],
        "Same Node-server model as Railway; predictable flat-fee web-service tiers.",
    ),
    (
        "DigitalOcean App Platform", "https://www.digitalocean.com/products/app-platform",
        ["https://www.digitalocean.com/pricing/app-platform"],
        "PaaS on top of DO droplets; flat predictable tiers, git deploy, less edge-optimised than Vercel/Cloudflare.",
    ),
    (
        "Fly.io", "https://fly.io",
        ["https://fly.io/docs/about/pricing/"],
        "Docker-based, deploys close to users globally; needs a GitHub Actions workflow for git-push deploys (not built in).",
    ),
    (
        "Self-hosted VPS + Coolify", "https://coolify.io",
        ["https://coolify.io/"],
        "Open-source, self-hosted Vercel/Heroku alternative on your own VPS (e.g. Hetzner) -- cheapest at real scale, but you own the box.",
    ),
]

FEATURE_KEYWORDS: dict[str, tuple[str, ...]] = {
    "mentions_nextjs": ("next.js", "nextjs"),
    "mentions_ssr_isr": ("server-side rendering", "ssr", "incremental static regeneration", " isr "),
    "mentions_git_deploy": ("connect your github", "connect to github", "push to deploy", "git push", "continuous deployment", "connect a repository", "connect your repo"),
    "mentions_preview_deploys": ("preview deployment", "deploy preview", "branch deploy", "pull request preview"),
    "mentions_edge_or_serverless_functions": ("edge function", "serverless function", "lambda", "workers"),
    "mentions_free_tier": ("free tier", "free plan", "$0 /mo", "$0/mo", "$ 0 /mo", "forever free"),
    "mentions_custom_domain": ("custom domain",),
    "mentions_bandwidth_included": ("bandwidth", "data transfer"),
}


@dataclass
class HostingScan:
    name: str
    homepage: str
    why: str
    urls_fetched: list[str] = field(default_factory=list)
    urls_failed: list[str] = field(default_factory=list)
    price_figures_sample: list[str] = field(default_factory=list)
    bandwidth_mentions: list[str] = field(default_factory=list)
    feature_flags: dict[str, bool] = field(default_factory=dict)
    notes: str = ""


def http_get(url: str, timeout: int = 20) -> str | None:
    try:
        request = Request(
            url,
            headers={
                "User-Agent": USER_AGENT,
                "Accept": "text/html,application/xhtml+xml;q=0.9,*/*;q=0.8",
                "Accept-Language": "en-GB,en;q=0.9",
            },
        )
        with urlopen(request, timeout=timeout) as response:
            return response.read().decode("utf-8", errors="replace")
    except (HTTPError, URLError, TimeoutError, OSError):
        return None


def text_only(html: str) -> str:
    text = re.sub(r"<script\b[^>]*>.*?</script>", " ", html, flags=re.I | re.S)
    text = re.sub(r"<style\b[^>]*>.*?</style>", " ", text, flags=re.I | re.S)
    text = re.sub(r"<[^>]+>", " ", text)
    return re.sub(r"\s+", " ", text)


def scan_candidate(name: str, homepage: str, urls: list[str], why: str) -> HostingScan:
    scan = HostingScan(name=name, homepage=homepage, why=why)
    combined_text = ""
    for url in urls:
        html = http_get(url)
        if html is None:
            scan.urls_failed.append(url)
            continue
        scan.urls_fetched.append(url)
        combined_text += " " + text_only(html)
        time.sleep(0.4)

    lower = combined_text.lower()

    scan.price_figures_sample = list(dict.fromkeys(
        re.findall(r"\$\s?\d[\d,]*(?:\.\d+)?\s?(?:/mo|/month|per month)?", combined_text)
    ))[:20]

    for match in re.finditer(r"[^.]{0,60}\b\d[\d,]*\s?(gb|tb)\b[^.]{0,60}(bandwidth|data transfer|egress)?", lower):
        snippet = match.group(0).strip()
        if "bandwidth" in snippet or "data transfer" in snippet or "egress" in snippet:
            scan.bandwidth_mentions.append(re.sub(r"\s+", " ", snippet))
    scan.bandwidth_mentions = list(dict.fromkeys(scan.bandwidth_mentions))[:8]

    for flag, keywords in FEATURE_KEYWORDS.items():
        scan.feature_flags[flag] = any(kw in lower for kw in keywords)

    if scan.urls_failed:
        scan.notes = f"Could not fetch: {', '.join(scan.urls_failed)} -- verify those manually."
    return scan


def markdown_report(scans: list[HostingScan], generated: str) -> str:
    lines: list[str] = [
        "# Hosting alternatives to Vercel\n",
        f"Generated {generated} by `scripts/research_hosting_alternatives.py`.\n",
        "Static-HTML scrape of each provider's own pricing/docs pages (no JS execution, no API "
        "keys) -- a dated snapshot to sanity-check, not a quote. Marketing pricing pages change "
        "often and some figures live behind a calculator widget this scrape can't run; those are "
        "flagged as `verify manually` below rather than guessed.\n",
        "## What this app actually needs from a host\n",
    ]
    lines += [f"- {req}" for req in APP_REQUIREMENTS]
    lines.append("")

    lines.append("## Feature signal matrix (scraped)\n")
    header = ["Provider"] + [
        "Next.js", "SSR/ISR", "Git deploy", "Preview deploys", "Edge/serverless fn", "Free tier", "Bandwidth mentioned",
    ]
    lines.append("| " + " | ".join(header) + " |")
    lines.append("|" + "---|" * len(header))
    flag_order = [
        "mentions_nextjs", "mentions_ssr_isr", "mentions_git_deploy", "mentions_preview_deploys",
        "mentions_edge_or_serverless_functions", "mentions_free_tier", "mentions_bandwidth_included",
    ]
    for s in scans:
        row = [s.name] + ["yes" if s.feature_flags.get(f) else "" for f in flag_order]
        lines.append("| " + " | ".join(row) + " |")

    lines.append("\n## Per-provider detail\n")
    for s in scans:
        lines.append(f"### {s.name}\n")
        lines.append(f"{s.why}\n")
        lines.append(f"- Homepage: {s.homepage}")
        lines.append(f"- Fetched: {', '.join(s.urls_fetched) or 'none'}")
        if s.urls_failed:
            lines.append(f"- **Could not fetch (verify manually): {', '.join(s.urls_failed)}**")
        if s.price_figures_sample:
            lines.append(f"- Price figures found on page: {', '.join(s.price_figures_sample[:12])}")
        else:
            lines.append("- No `$` figures found on the fetched page(s) -- verify manually (may be a calculator widget).")
        if s.bandwidth_mentions:
            lines.append("- Bandwidth/data-transfer mentions:")
            for m in s.bandwidth_mentions[:4]:
                lines.append(f"  - “{m}”")
        lines.append("")

    return "\n".join(lines) + "\n"


def run(out_dir: Path) -> dict[str, Any]:
    out_dir.mkdir(parents=True, exist_ok=True)
    scans: list[HostingScan] = []
    for name, homepage, urls, why in CANDIDATES:
        print(f"Scanning {name}...")
        scans.append(scan_candidate(name, homepage, urls, why))

    generated = NOW.date().isoformat()
    payload = {
        "generated_at": NOW.isoformat(timespec="seconds"),
        "app_requirements": APP_REQUIREMENTS,
        "candidates": [asdict(s) for s in scans],
    }
    (out_dir / f"{generated}-hosting-scan.json").write_text(
        json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
    )
    (out_dir / f"{generated}-hosting-comparison.md").write_text(
        markdown_report(scans, generated), encoding="utf-8"
    )
    print(f"\nSaved {out_dir / f'{generated}-hosting-comparison.md'}")
    return payload


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--output-dir", type=Path, default=OUT_DIR)
    args = parser.parse_args()
    run(args.output_dir)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
