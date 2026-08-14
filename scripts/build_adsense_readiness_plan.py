#!/usr/bin/env python3
"""Audit BroadbandPicker for Google AdSense readiness and write a practical plan.

This is a repository audit, not a guarantee of AdSense approval. It checks the
controls that can be verified from source code and labels traffic, indexing,
policy acceptance, and legal compliance as manual checks where appropriate.

Usage:
    python3 scripts/build_adsense_readiness_plan.py
    python3 scripts/build_adsense_readiness_plan.py --output docs/adsense-readiness-plan.md
    python3 scripts/build_adsense_readiness_plan.py --json docs/adsense-readiness-audit.json
"""

from __future__ import annotations

import argparse
import json
import re
from dataclasses import asdict, dataclass
from datetime import date
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_REPORT = ROOT / "docs" / "adsense-readiness-plan.md"
DEFAULT_JSON = ROOT / "docs" / "adsense-readiness-audit.json"


@dataclass
class Check:
    area: str
    control: str
    status: str
    priority: str
    evidence: str
    action: str
    points: int
    possible: int


def read(relative: str) -> str:
    path = ROOT / relative
    return path.read_text(encoding="utf-8", errors="replace") if path.exists() else ""


def exists(relative: str) -> bool:
    return (ROOT / relative).exists()


def add(checks: list[Check], **kwargs: object) -> None:
    checks.append(Check(**kwargs))


def audit() -> list[Check]:
    checks: list[Check] = []
    layout = read("app/layout.tsx")
    privacy = read("app/privacy-policy/page.tsx")
    cookie = read("components/CookieBanner.tsx")
    sitemap = read("app/sitemap.ts")
    robots = read("app/robots.ts")
    guides = read("data/guides.ts")
    providers = read("data/providers.ts")
    all_source = "\n".join(
        path.read_text(encoding="utf-8", errors="replace")
        for path in (ROOT / "app").rglob("*.tsx")
    )

    trust_pages = {
        "About": "app/about/page.tsx",
        "Contact": "app/contact/page.tsx",
        "Privacy policy": "app/privacy-policy/page.tsx",
        "Terms": "app/terms/page.tsx",
        "Editorial policy": "app/editorial-policy/page.tsx",
        "Review methodology": "app/how-we-review-broadband/page.tsx",
        "Commercial disclosure": "app/how-we-make-money/page.tsx",
    }
    missing = [name for name, path in trust_pages.items() if not exists(path)]
    add(
        checks,
        area="Trust",
        control="Core trust and policy pages",
        status="PASS" if not missing else "FAIL",
        priority="P0" if missing else "Done",
        evidence="All seven core pages exist." if not missing else "Missing: " + ", ".join(missing),
        action="Keep ownership, contact details and policies accurate." if not missing else "Create the missing pages before applying.",
        points=10 if not missing else 0,
        possible=10,
    )

    has_disclosure = "commission" in layout.lower() and "editorial" in all_source.lower()
    add(
        checks,
        area="Trust",
        control="Affiliate relationship disclosure",
        status="PASS" if has_disclosure else "FAIL",
        priority="Done" if has_disclosure else "P0",
        evidence="Sitewide commission wording and an editorial policy are present." if has_disclosure else "Clear disclosure was not detected.",
        action="Retain disclosures close to commercial calls to action.",
        points=8 if has_disclosure else 0,
        possible=8,
    )

    has_cmp_claim = bool(re.search(r"IAB|TCF|certified CMP|__tcfapi", cookie, re.I))
    add(
        checks,
        area="Consent",
        control="Google-certified CMP with IAB TCF",
        status="PASS" if has_cmp_claim else "FAIL",
        priority="Done" if has_cmp_claim else "P0",
        evidence="TCF/CMP integration detected." if has_cmp_claim else "The custom banner stores a local accepted/declined value; no TCF CMP integration is present.",
        action="Configure Google's European regulations message or another Google-certified CMP before requesting personalised ads in the UK.",
        points=12 if has_cmp_claim else 0,
        possible=12,
    )

    ad_privacy_terms = ["advertising cookies", "personalised ads", "ad technology", "Google AdSense"]
    found_terms = [term for term in ad_privacy_terms if term.lower() in privacy.lower()]
    contradictory = "do not use advertising cookies" in privacy.lower()
    privacy_ready = len(found_terms) >= 2 and not contradictory
    add(
        checks,
        area="Consent",
        control="Advertising privacy disclosures",
        status="PASS" if privacy_ready else "FAIL",
        priority="Done" if privacy_ready else "P0",
        evidence=("Advertising disclosures detected." if privacy_ready else "Privacy policy currently says advertising cookies are not used and does not describe AdSense data processing."),
        action="Before ads go live, describe Google advertising, cookies/local storage, consent choices, vendors, data use and withdrawal controls.",
        points=10 if privacy_ready else 0,
        possible=10,
    )

    ads_txt = exists("public/ads.txt")
    add(
        checks,
        area="Monetisation",
        control="Authorised Digital Sellers file",
        status="PASS" if ads_txt else "READY LATER",
        priority="Done" if ads_txt else "P1",
        evidence="public/ads.txt exists." if ads_txt else "No public/ads.txt exists; the publisher line is only available after AdSense supplies the account ID.",
        action="After account creation, add Google's exact ads.txt line and verify /ads.txt publicly.",
        points=4 if ads_txt else 2,
        possible=4,
    )

    content_count = len(re.findall(r"slug:\s*['\"]", guides))
    provider_count = len(re.findall(r"awinProgramId:", providers))
    enough_content = content_count >= 15 and provider_count >= 8
    add(
        checks,
        area="Content",
        control="Substantial original site structure",
        status="PASS" if enough_content else "REVIEW",
        priority="Done" if enough_content else "P1",
        evidence=f"Detected approximately {content_count} guide records and {provider_count} provider records, plus original tools and policy pages.",
        action="Manually review every indexed page for usefulness, accuracy, complete prose and a clear purpose; remove or noindex weak duplicates.",
        points=12 if enough_content else 6,
        possible=12,
    )

    # Form input placeholder attributes are legitimate UX. Flag only unfinished
    # editorial markers and fabricated integration identifiers.
    placeholder_hits = len(
        re.findall(
            r"TODO|FIXME|coming soon|lorem ipsum|replace me|awinProgramId:\s*['\"][^'\"]*placeholder",
            all_source + providers,
            re.I,
        )
    )
    add(
        checks,
        area="Content",
        control="No visible placeholder or unfinished content",
        status="REVIEW" if placeholder_hits else "PASS",
        priority="P1" if placeholder_hits else "Done",
        evidence=f"Detected {placeholder_hits} placeholder/TODO-style source references; some may be internal identifiers rather than visible copy.",
        action="Review each match and remove visible placeholders, invented deals and unfinished sections before submission.",
        points=4 if placeholder_hits else 8,
        possible=8,
    )

    index_ready = "sitemap" in robots.lower() and "disallow: ['/']" not in robots.lower() and bool(sitemap)
    add(
        checks,
        area="Technical",
        control="Crawlability and sitemap",
        status="PASS" if index_ready else "FAIL",
        priority="Done" if index_ready else "P0",
        evidence="robots.ts allows crawling and declares the XML sitemap." if index_ready else "Sitemap or crawl access needs correction.",
        action="Verify the production robots.txt and sitemap.xml in Search Console.",
        points=8 if index_ready else 0,
        possible=8,
    )

    canonical_count = len(re.findall(r"canonical", all_source, re.I))
    add(
        checks,
        area="Technical",
        control="Canonical metadata coverage",
        status="REVIEW",
        priority="P1",
        evidence=f"Detected {canonical_count} canonical references, but runtime coverage cannot be guaranteed through static inspection.",
        action="Crawl production and confirm one indexable canonical, title, description and H1 per intended landing page.",
        points=4,
        possible=6,
    )

    add(
        checks,
        area="Quality",
        control="Search Console and traffic quality",
        status="MANUAL",
        priority="P0",
        evidence="Repository source cannot prove indexing, organic traffic, manual actions or invalid traffic.",
        action="Confirm ownership, submitted sitemap, indexed pages, no manual actions/security issues, and genuine traffic sources in Search Console and Analytics.",
        points=0,
        possible=8,
    )

    add(
        checks,
        area="UX",
        control="Controlled ad placement plan",
        status="NOT IMPLEMENTED",
        priority="P1",
        evidence="No AdSense implementation was detected, which is appropriate before approval.",
        action="Start with restrained in-article units on informational guides. Exclude homepage, comparison, deals, provider, postcode, tool and legal pages; avoid overlays initially.",
        points=2,
        possible=6,
    )

    return checks


def status_summary(checks: list[Check]) -> tuple[int, int, int]:
    score = sum(check.points for check in checks)
    possible = sum(check.possible for check in checks)
    percent = round(score / possible * 100) if possible else 0
    return score, possible, percent


def render_report(checks: list[Check]) -> str:
    score, possible, percent = status_summary(checks)
    blockers = [check for check in checks if check.priority == "P0" and check.status != "PASS"]
    verdict = "NOT READY TO SERVE ADS" if blockers else "READY FOR FINAL MANUAL REVIEW"
    lines = [
        "# BroadbandPicker Google AdSense Readiness Plan",
        "",
        f"Generated: {date.today().isoformat()}",
        "",
        f"**Verdict: {verdict}**  ",
        f"**Repository readiness score: {score}/{possible} ({percent}%)**",
        "",
        "> This score measures source-level preparation, not AdSense approval probability. Google makes the approval decision, and traffic/indexing evidence requires manual verification.",
        "",
        "## Executive finding",
        "",
        "The site has a strong trust-page and editorial foundation. Do not activate AdSense yet: the current cookie banner is not a Google-certified TCF CMP, and the privacy policy states that advertising cookies are not used. Resolve consent and privacy controls, complete the manual Search Console review, then apply. Preserve affiliate conversion by limiting display ads to selected informational content.",
        "",
        "## Audit",
        "",
        "| Priority | Area | Control | Status | Evidence | Required action |",
        "|---|---|---|---|---|---|",
    ]
    for check in checks:
        cells = [check.priority, check.area, check.control, check.status, check.evidence, check.action]
        lines.append("| " + " | ".join(cell.replace("|", "\\|").replace("\n", " ") for cell in cells) + " |")

    lines.extend(["", "## Ordered implementation plan", ""])
    actions = [
        ("1", "Consent and legal", "Choose Google's CMP or another certified TCF CMP; design equal accept/reject choices and a persistent privacy-choice control. Draft updated privacy/cookie disclosures, but publish them when the advertising implementation is ready so the policy remains factually accurate."),
        ("2", "Production quality audit", "Crawl every sitemap URL. Fix errors, thin/duplicative pages, unsupported claims, placeholders, broken links, missing metadata and stale prices. Ensure all pages work on mobile."),
        ("3", "Search Console evidence", "Verify domain ownership, submit the sitemap, inspect indexing, manual actions, security issues and Core Web Vitals. Record at least 28 days of genuine acquisition and landing-page data."),
        ("4", "Apply to AdSense", "Use the legal payee/entity details that match the bank and tax records. Add broadbandpicker.co.uk and complete Google's verification steps."),
        ("5", "Authorisation", "When Google provides the publisher ID, add its exact ads.txt record at /ads.txt and verify it in AdSense."),
        ("6", "Restricted launch", "Enable the certified consent flow before ad requests. Use low-density manual placements on a small set of informational guides; exclude commercial and utility pages."),
        ("7", "Measure for 30 days", "Track RPM, viewability, Core Web Vitals, bounce/engagement, affiliate click-through and affiliate earnings per session. Remove ads where total revenue or user experience declines."),
    ]
    for number, title, detail in actions:
        lines.extend([f"### {number}. {title}", "", detail, ""])

    lines.extend([
        "## Recommended initial exclusions",
        "",
        "- Homepage",
        "- `/compare` and `/deals`",
        "- `/providers/*`",
        "- `/postcode/*`",
        "- `/speed-test`",
        "- Privacy, terms, contact and other trust pages",
        "",
        "## Manual go-live gate",
        "",
        "Do not request ads until every item below is confirmed:",
        "",
        "- [ ] Certified TCF CMP configured and tested in the UK",
        "- [ ] Privacy and cookie disclosures match the implemented advertising stack",
        "- [ ] Production crawl has no material errors or unfinished pages",
        "- [ ] Search Console shows no manual action or security issue",
        "- [ ] Traffic is genuine and acquisition sources are understood",
        "- [ ] AdSense account identity, address, bank and tax information are consistent",
        "- [ ] ads.txt is installed after Google supplies the publisher record",
        "- [ ] Initial ad page list and exclusion list are documented",
        "",
        "## Primary Google references",
        "",
        "- Eligibility: https://support.google.com/adsense/answer/9724",
        "- UK/EEA certified CMP requirement: https://support.google.com/adsense/answer/13554116",
        "- European regulations messages: https://support.google.com/adsense/answer/10961068",
        "- Auto Ads page exclusions: https://support.google.com/adsense/answer/9262311",
        "",
    ])
    return "\n".join(lines)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, default=DEFAULT_REPORT)
    parser.add_argument("--json", type=Path, default=DEFAULT_JSON)
    args = parser.parse_args()

    checks = audit()
    report = render_report(checks)
    score, possible, percent = status_summary(checks)

    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(report, encoding="utf-8")
    args.json.parent.mkdir(parents=True, exist_ok=True)
    args.json.write_text(
        json.dumps(
            {
                "generated": date.today().isoformat(),
                "score": score,
                "possible": possible,
                "percent": percent,
                "checks": [asdict(check) for check in checks],
            },
            indent=2,
        ) + "\n",
        encoding="utf-8",
    )
    print(f"Wrote {args.output.relative_to(ROOT)}")
    print(f"Wrote {args.json.relative_to(ROOT)}")
    print(f"Repository readiness score: {score}/{possible} ({percent}%)")


if __name__ == "__main__":
    main()
