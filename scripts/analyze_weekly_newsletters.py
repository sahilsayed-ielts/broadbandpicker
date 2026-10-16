#!/usr/bin/env python3
"""Research how UK comparison, GEO and affiliate sites run weekly emails.

This is process research, not copy-paste of competitor prose. It records
cadence, archive pages, subject/from patterns, GEO links, affiliate
disclosure and ICO identity rules, then writes a BroadbandPicker weekly
issue spec that the live emailer implements.

Usage:
    /usr/bin/python3 scripts/analyze_weekly_newsletters.py
    npm run alerts:weekly
"""

from __future__ import annotations

import argparse
import json
import re
import subprocess
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlparse

import requests
from lxml import html

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_JSON = ROOT / "docs" / "weekly-newsletter-analysis.json"
DEFAULT_MD = ROOT / "docs" / "weekly-newsletter-analysis.md"
RUN_AT = datetime.now(timezone.utc).isoformat(timespec="seconds")
USER_AGENT = (
    "BroadbandPickerWeeklyNewsletterResearch/1.0 "
    "(UX/legal research; contact: https://broadbandpicker.co.uk/contact)"
)

TARGETS: list[tuple[str, str, str]] = [
    ("BroadbandPicker alerts", "self", "https://broadbandpicker.co.uk/alerts"),
    ("MoneySavingExpert weekly archive", "archive", "https://www.moneysavingexpert.com/tips/"),
    ("MoneySavingExpert email FAQ", "newsletter", "https://www.moneysavingexpert.com/site/money-tips-email-faqs/"),
    ("MoneySavingExpert privacy", "legal", "https://www.moneysavingexpert.com/site/privacy-policy/"),
    ("Uswitch broadband", "comparison", "https://www.uswitch.com/broadband/"),
    ("Uswitch privacy", "legal", "https://www.uswitch.com/privacy/"),
    ("broadbandchoices privacy", "legal", "https://www.broadbandchoices.co.uk/privacy-policy"),
    ("Which? newsletters", "newsletter", "https://www.which.co.uk/newsletters"),
    ("NerdWallet UK", "editorial", "https://www.nerdwallet.com/uk/"),
    ("cable.co.uk", "comparison", "https://www.cable.co.uk/"),
    ("ICO electronic mail marketing", "legal", "https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guide-to-pecr/electronic-and-telephone-marketing/electronic-mail-marketing/"),
]

SIGNALS: list[tuple[str, str]] = [
    ("weekly", r"\bweekly\b|once a week|every week"),
    ("archive", r"email archive|past (?:emails|editions)|this week"),
    ("unsubscribe", r"unsubscribe|opt[- ]out"),
    ("noreply", r"no[-_]?reply@|do not reply|automated (?:message|email)"),
    ("affiliate_disclosure", r"commission|affiliate|how we make money|we may earn"),
    ("postcode_or_geo", r"postcode|in your area|your address"),
    ("subject_formula", r"subject line|preview text|preheader"),
    ("double_opt_in", r"confirm(?:ation)? email|check your inbox"),
    ("named_sender", r"from [A-Z][A-Za-z]+"),
]


@dataclass
class PageScan:
    name: str
    category: str
    url: str
    status: int | str = ""
    title: str = ""
    word_count: int = 0
    html_bytes: int = 0
    js_rendered_suspected: bool = False
    signals_found: list[str] = field(default_factory=list)
    weekly_mentions: list[str] = field(default_factory=list)
    notes: str = ""


def fetch(url: str, timeout: int = 25) -> requests.Response:
    return requests.get(
        url,
        headers={
            "User-Agent": USER_AGENT,
            "Accept": "text/html,application/xhtml+xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-GB,en;q=0.9",
        },
        timeout=timeout,
        allow_redirects=True,
    )


def collapse(text: str) -> str:
    return re.sub(r"\s+", " ", text or "").strip()


def scan_page(name: str, category: str, url: str) -> PageScan:
    scan = PageScan(name=name, category=category, url=url)
    try:
        response = fetch(url)
        scan.status = response.status_code
        scan.html_bytes = len(response.content or b"")
        if response.status_code != 200 or not response.content:
            scan.notes = f"Non-200 or empty ({response.status_code})"
            return scan
        tree = html.fromstring(response.content)
        scan.title = collapse(" ".join(tree.xpath("//title/text()")))
        body = collapse(" ".join(tree.xpath("//body//text()[normalize-space()]")))
        scan.word_count = len(body.split())
        lower = body.lower()
        scan.js_rendered_suspected = scan.word_count < 80
        scan.signals_found = [key for key, pattern in SIGNALS if re.search(pattern, lower)]
        mentions = []
        for sentence in re.split(r"(?<=[.!?])\s+", body):
            if re.search(r"weekly|newsletter|email archive|unsubscribe", sentence, re.I) and len(sentence) > 40:
                mentions.append(collapse(sentence)[:220])
            if len(mentions) >= 4:
                break
        scan.weekly_mentions = mentions
        return scan
    except requests.RequestException as exc:
        scan.status = "error"
        scan.notes = f"{type(exc).__name__}: {exc}"[:240]
        return scan


def dns_records(rtype: str, name: str) -> str:
    try:
        out = subprocess.check_output(["dig", "+short", rtype, name], text=True, timeout=12)
        return collapse(out)
    except Exception as exc:
        return f"error: {type(exc).__name__}"


def our_dns() -> dict[str, str]:
    domain = "broadbandpicker.co.uk"
    return {
        "mx": dns_records("MX", domain),
        "spf": dns_records("TXT", domain)[:300],
        "dmarc": dns_records("TXT", f"_dmarc.{domain}"),
    }


def spec() -> dict:
    return {
        "product": "BroadbandPicker weekly deal roundup",
        "cadence": "One email a week, Tuesday 09:00 UTC (10:00 UK in BST, 09:00 UK in GMT)",
        "from_name": "BroadbandPicker",
        "from_address": "noreply@broadbandpicker.co.uk",
        "public_web_twin": "/alerts/weekly",
        "admin_emailer": "/admin/alerts",
        "consent_named_content": "weekly UK broadband deal roundups and occasional switching guides",
        "agents": [
            {
                "name": "Planner",
                "job": "Fix the week key, subject and preheader. Pull live providers, newest guides and GEO hubs. Do not invent prices.",
            },
            {
                "name": "Editor",
                "job": "Keep the issue short: one lede, five from-prices, three guides, four area links, tools. British English. No fake social proof.",
            },
            {
                "name": "Compliance",
                "job": "Confirmed subscribers only. Named sender. Affiliate disclosure. Unsubscribe in body and List-Unsubscribe header. No personal Gmail. No pre-ticked anything.",
            },
            {
                "name": "Sender",
                "job": "Preview the live HTML. Test one address. Then send the same issue to the confirmed list via domain SMTP.",
            },
            {
                "name": "Analyst",
                "job": "Track newsletter_signup on confirm, outbound_provider_click from the web twin, and do not treat opens as a PECR basis.",
            },
        ],
        "issue_stack": [
            "Subject: BroadbandPicker weekly roundup, {month year}",
            "Preheader: Check from-prices at your address. Unsubscribe any time.",
            "Logo + wordmark header",
            "Lede: this is a roundup, not a national cheapest promise",
            "Five provider from-prices with verified date and Check deals CTA",
            "Three recently updated guides (GEO/switching/speed)",
            "Four area hubs (London, Manchester, Birmingham, Glasgow)",
            "Tools: speed test, Broadband Match, cost calculator",
            "How we make money + unsubscribe + contact page",
        ],
        "seo_geo": [
            "The email is a push copy of a public weekly page so Google and answer engines can cite the same roundup.",
            "Every deal CTA goes to an address checker, never a fake national from-price as the only action.",
            "GEO hubs and updated guides recycle high-intent URLs already on the site.",
            "Month and ISO week in the title keep the page fresh without a new URL every week.",
        ],
        "affiliate_rules": [
            "Disclose commission in the email and on the web twin.",
            "Rank from live provider data, not from who pays more.",
            "Do not put unnamed partners on the consent tick.",
            "Primary CTA is Check at your postcode, not a dark-pattern countdown.",
        ],
        "send_rules": [
            "Only status=confirmed, never pending or unsubscribed",
            "Personalise unsubscribe token; do not send a shared unsub link",
            "If domain SMTP is missing, skip the send rather than use Gmail",
            "Vercel Cron fires GET /api/newsletter/send every Tuesday 09:00 UTC with CRON_SECRET",
            "Skip rather than use Gmail if domain SMTP is missing",
            "Skip if this ISO week was already sent (newsletter_sends.week_key)",
        ],
        "send_timing": {
            "chosen_day": "Tuesday",
            "chosen_time_utc": "09:00",
            "cron": "0 9 * * 2",
            "uk_clock": "10:00 in British Summer Time, 09:00 in GMT",
            "why_not_monday": "UK and platform benchmarks treat Monday as inbox-backlog: weaker than Tue-Thu. Consent says weekly, not Monday.",
            "why_not_weekend": "Consumer comparison mail is opened at a desk or on a commute, not Saturday.",
            "evidence": [
                "MoneySavingExpert Money Tips FAQ (live): after the first week, emails are usually sent on a Wednesday, sometimes Tuesday night or Thursday.",
                "UK agency round-up (Echelon Media): Tuesday is the strongest day; 10:00-11:00 and 14:00-16:00 UK; avoid early Monday and Friday afternoon.",
                "Primo Interactive UK 2026 playbook: newsletter default is Tuesday 10:00 local; Monday is a second choice once Tue/Wed are used.",
                "Campaign Monitor / Mailchimp-style 2026 summaries: Tuesday or Thursday 09:00-11:00 local for opens; weekday gaps are small, list hygiene matters more.",
                "Fintech/consumer money niche heatmaps: Tuesday about 09:00 local.",
            ],
        },
    }


def write_markdown(payload: dict, path: Path) -> None:
    spec_data: dict = payload["implementation_spec"]
    lines = [
        "# Weekly newsletters on UK comparison sites, and the BroadbandPicker issue spec",
        "",
        f"Researched: {payload['run_at_utc']}",
        "",
        "This is a working note for the live emailer. It is not legal advice and it does not",
        "copy competitor wording into the send.",
        "",
        "## What professional weekly mail actually is",
        "",
        "MoneySavingExpert is the UK template: a **named weekly**, a **web archive**, a",
        "confirmation on signup, and an unsubscribe in every edition. Comparison hubs such as",
        "Uswitch are postcode-first; email is a reminder or account lifecycle message, not the",
        "product. Affiliate sites that look serious do five things every week:",
        "",
        "1. **One cadence.** Weekly, not daily. The consent text must match the send.",
        "2. **A public twin.** The email is HTML of a page you can also open on the site.",
        "3. **Address before headline price.** GEO/SEO comparison is useless if the CTA skips the postcode checker.",
        "4. **Commission in the footer.** Readers already assume it; hiding it looks worse.",
        "5. **Stop is easy.** List-Unsubscribe plus a visible link. ICO: do not conceal who is sending.",
        "",
        "They do **not** send from a personal Gmail, invent a cheapest-in-Britain figure, or",
        "bundle marketing consent into the availability checker.",
        "",
        "## Agent plan (Planner, Editor, Compliance, Sender, Analyst)",
        "",
    ]
    for agent in spec_data["agents"]:
        lines.append(f"- **{agent['name']}:** {agent['job']}")
    lines.extend(
        [
            "",
            "## When to send (day and time)",
            "",
            "The script's job is not to guess a lucky hour. It is to pick a **stable UK slot**",
            "that comparison and affiliate weeklies already use, then fire it every week.",
            "",
            f"- Chosen: **{spec_data['send_timing']['chosen_day']} {spec_data['send_timing']['chosen_time_utc']} UTC** (`{spec_data['send_timing']['cron']}`)",
            f"- UK clock: {spec_data['send_timing']['uk_clock']}",
            f"- Why not Monday: {spec_data['send_timing']['why_not_monday']}",
            "",
            "Evidence fetched or cited this run:",
            "",
        ]
    )
    for item in spec_data["send_timing"]["evidence"]:
        lines.append(f"- {item}")
    lines.extend(
        [
            "",
            "## Issue stack to ship every week",
            "",
        ]
    )
    for item in spec_data["issue_stack"]:
        lines.append(f"- {item}")
    lines.extend(["", "## SEO and GEO", ""])
    for item in spec_data["seo_geo"]:
        lines.append(f"- {item}")
    lines.extend(["", "## Affiliate rules", ""])
    for item in spec_data["affiliate_rules"]:
        lines.append(f"- {item}")
    lines.extend(["", "## Send rules", ""])
    for item in spec_data["send_rules"]:
        lines.append(f"- {item}")
    dns = payload.get("our_dns") or {}
    lines.extend(
        [
            "",
            "## Domain mail DNS this run",
            "",
            f"- MX: {dns.get('mx') or 'none'}",
            f"- SPF/TXT: {dns.get('spf') or 'none'}",
            f"- DMARC: {dns.get('dmarc') or 'none'}",
            "",
            "No MX means the live emailer can still **preview** the Monday issue. It must not",
            "send until `noreply@broadbandpicker.co.uk` can authenticate.",
            "",
            "## Pages fetched",
            "",
            "| Site | HTTP | Words | Signals |",
            "| --- | --- | --- | --- |",
        ]
    )
    for page in payload["pages"]:
        signals = ", ".join(page.get("signals_found") or []) or "—"
        lines.append(
            f"| {page['name']} | {page['status']} | {page['word_count']} | {signals} |"
        )
    lines.extend(["", "### Mentions", ""])
    for page in payload["pages"]:
        lines.append(f"#### {page['name']}")
        lines.append("")
        lines.append(f"- {page['url']}")
        if page.get("notes"):
            lines.append(f"- {page['notes']}")
        for mention in page.get("weekly_mentions") or []:
            lines.append(f"- “{mention}”")
        lines.append("")
    lines.extend(
        [
            "## What the emailer on BroadbandPicker should do",
            "",
            f"- Public live issue: `{spec_data['public_web_twin']}`",
            f"- Interactive sender: `{spec_data['admin_emailer']}`",
            f"- Cadence: {spec_data['cadence']}",
            f"- From: {spec_data['from_name']} <{spec_data['from_address']}>",
            "",
            "The admin screen is the working desk: live preview of this week’s HTML, a",
            "compliance checklist, a one-address test, then send to confirmed subscribers.",
            "Monday cron is optional and off until ALERTS_AUTO_SEND is set.",
            "",
        ]
    )
    path.write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output-json", type=Path, default=DEFAULT_JSON)
    parser.add_argument("--output-md", type=Path, default=DEFAULT_MD)
    args = parser.parse_args()
    pages = [asdict(scan_page(name, category, url)) for name, category, url in TARGETS]
    payload = {
        "run_at_utc": RUN_AT,
        "pages": pages,
        "our_dns": our_dns(),
        "implementation_spec": spec(),
    }
    args.output_json.parent.mkdir(parents=True, exist_ok=True)
    args.output_json.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
    write_markdown(payload, args.output_md)
    print(f"Wrote {args.output_json}")
    print(f"Wrote {args.output_md}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
