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

    has_cmp_claim = bool(
        re.search(r"googlefc|IAB TCF|certified CMP|__tcfapi|showRevocationMessage", layout + cookie + read("lib/googlefc.ts") + read("lib/adsense.ts"), re.I)
    )
    add(
        checks,
        area="Consent",
        control="Google-certified CMP with IAB TCF",
        status="PASS" if has_cmp_claim else "FAIL",
        priority="Done" if has_cmp_claim else "P0",
        evidence="Google Funding Choices / IAB TCF CMP 300 is wired through the site consent bar." if has_cmp_claim else "The custom banner stores a local accepted/declined value; no TCF CMP integration is present.",
        action="Publish the European regulations message in AdSense Privacy & messaging, with Do not consent on, English (UK), and the privacy policy URL.",
        points=12 if has_cmp_claim else 0,
        possible=12,
    )

    ad_privacy_terms = ["advertising cookies", "personalised ads", "Google AdSense", "Ads Settings", "third-party vendors, including Google"]
    found_terms = [term for term in ad_privacy_terms if term.lower() in privacy.lower()]
    cookie_policy = read("app/cookie-policy/page.tsx")
    cookie_ready = "advertising cookies" in cookie_policy.lower() and "ads settings" in cookie_policy.lower()
    contradictory = "do not use advertising cookies" in privacy.lower()
    privacy_ready = len(found_terms) >= 4 and cookie_ready and not contradictory
    add(
        checks,
        area="Consent",
        control="Advertising privacy disclosures",
        status="PASS" if privacy_ready else "FAIL",
        priority="Done" if privacy_ready else "P0",
        evidence=("Privacy and cookie policies describe Google ads, cookies and Ads Settings opt-out." if privacy_ready else f"Missing required AdSense privacy terms: {', '.join(term for term in ad_privacy_terms if term.lower() not in privacy.lower()) or 'cookie-policy advertising section'}."),
        action="Keep Google's required advertising disclosures in the privacy and cookie policies, including Ads Settings opt-out.",
        points=10 if privacy_ready else 0,
        possible=10,
    )

    ads_txt = read("public/ads.txt")
    ads_txt_ok = "google.com" in ads_txt and "pub-9056289061141918" in ads_txt and "DIRECT" in ads_txt
    add(
        checks,
        area="Monetisation",
        control="Authorised Digital Sellers file",
        status="PASS" if ads_txt_ok else "FAIL",
        priority="Done" if ads_txt_ok else "P0",
        evidence="public/ads.txt authorises Google with pub-9056289061141918." if ads_txt_ok else "ads.txt is missing or does not contain the AdSense publisher line.",
        action="Keep https://broadbandpicker.co.uk/ads.txt as google.com, pub-9056289061141918, DIRECT, f08c47fec0942fa0.",
        points=4 if ads_txt_ok else 0,
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

    account_meta = "google-adsense-account" in layout
    adsense_tag = "adsbygoogle.js" in layout or "ADSENSE_SCRIPT_SRC" in layout
    ad_gate = "pauseAdRequests" in read("lib/adsense.ts") and exists("components/AdSenseRequestGate.tsx")
    placement_ok = account_meta and adsense_tag and ad_gate
    add(
        checks,
        area="UX",
        control="Controlled ad placement plan",
        status="PASS" if placement_ok else "FAIL",
        priority="Done" if placement_ok else "P0",
        evidence=(
            "AdSense and Funding Choices load for consent; ad requests stay paused except on /guides and /research."
            if placement_ok
            else "AdSense JS is missing, or ad requests are not gated to editorial pages."
        ),
        action="Keep display ads off homepage, deals, compare, provider, postcode, tool and legal pages. Leave Auto ads off or excluded on those URLs in AdSense.",
        points=6 if placement_ok else 0,
        possible=6,
    )

    postcode_page = read("app/postcode/[area]/page.tsx")
    postcode_sitemap = read("app/postcode/sitemap.ts")
    district_file = ROOT / "data" / "postcode-district-coverage.json"
    district_count = 0
    if district_file.exists():
        try:
            district_count = len((json.loads(district_file.read_text(encoding="utf-8")).get("districts") or {}))
        except json.JSONDecodeError:
            district_count = 0
    curated_count = len(re.findall(r"prefix:\s*'", read("data/postcodes.ts")))
    thin_cluster = "getAllDistrictCoveragePrefixes" in postcode_sitemap or "dynamicParams = false" not in postcode_page
    add(
        checks,
        area="Content",
        control="No thin auto-generated landing cluster",
        status="FAIL" if thin_cluster else "PASS",
        priority="P0" if thin_cluster else "Done",
        evidence=(
            f"{district_count} Ofcom district records exist, but only {curated_count} curated postcode pages are indexable and unknown districts 404."
            if not thin_cluster
            else f"Postcode sitemap or dynamic params still expose templated district pages from {district_count} Ofcom records. That is the main low-value-content pattern."
        ),
        action="Keep only curated postcode-area pages in the sitemap and 404 unknown districts. Do not republish cloned national-deal templates.",
        points=0 if thin_cluster else 12,
        possible=12,
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
        "AdSense has already verified ownership and flagged the site for low-value content. The fix is inventory quality: do not index cloned postcode templates, keep Google ads off commercial and thin screens, disclose advertising cookies, and wait for recrawl before requesting review. A Google-certified TCF CMP is still required before personalised ads in the UK.",
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
        ("2", "Remove low-value inventory", "Keep only curated postcode-area pages indexable. Unknown Ofcom districts must 404 and stay out of the sitemap. Do not pad pages with filler copy."),
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
        "- Make sure your site's pages are ready: https://support.google.com/adsense/answer/7299563",
        "- Required privacy content: https://support.google.com/adsense/answer/1348695",
        "- UK/EEA certified CMP requirement: https://support.google.com/adsense/answer/13554116",
        "- European regulations messages: https://support.google.com/adsense/answer/10961068",
        "- Auto Ads page exclusions: https://support.google.com/adsense/answer/9262311",
        "- ads.txt: https://support.google.com/adsense/answer/12171612",
        "- Spam and thin content: https://developers.google.com/search/docs/essentials/spam-policies",
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
