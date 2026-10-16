#!/usr/bin/env python3
"""Research how UK affiliate and comparison sites collect emails for deal alerts.

This is competitive and legal research, not content scraping for reuse. It
records how each target *collects* addresses (fields, consent, frequency,
privacy links, postcode, double opt-in language) so BroadbandPicker's alerts
signup is evidence-led and PECR-compliant rather than guessed.

It does not copy competitor prose into the live site.

Usage:
    python3 scripts/analyze_affiliate_email_alerts.py
    python3 scripts/analyze_affiliate_email_alerts.py --output-json docs/foo.json

Many comparison hubs are JS-rendered or sit behind bot protection. The script
reports that honestly (`js_rendered_suspected`) instead of treating a thin
shell as a full read.
"""

from __future__ import annotations

import argparse
import json
import re
import subprocess
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urljoin, urlparse

import requests
from lxml import html

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_JSON = ROOT / "docs" / "affiliate-email-alerts-analysis.json"
DEFAULT_MD = ROOT / "docs" / "affiliate-email-alerts-analysis.md"
RUN_AT = datetime.now(timezone.utc).isoformat(timespec="seconds")
USER_AGENT = (
    "BroadbandPickerEmailAlertsResearch/1.0 "
    "(UX/legal research; contact: https://broadbandpicker.co.uk/contact)"
)

COMPETITOR_PAGES: list[tuple[str, str, str]] = [
    ("BroadbandPicker (current)", "self", "https://broadbandpicker.co.uk/"),
    ("Uswitch broadband", "comparison", "https://www.uswitch.com/broadband/"),
    ("Uswitch privacy", "legal", "https://www.uswitch.com/privacy/"),
    ("MoneySuperMarket broadband", "comparison", "https://www.moneysupermarket.com/broadband/"),
    ("Compare the Market broadband", "comparison", "https://www.comparethemarket.com/broadband/"),
    ("broadbandchoices", "comparison", "https://www.broadbandchoices.co.uk/"),
    ("broadbandchoices privacy", "legal", "https://www.broadbandchoices.co.uk/privacy-policy"),
    ("choose.co.uk broadband", "comparison", "https://www.choose.co.uk/broadband/"),
    ("broadband.co.uk", "comparison", "https://www.broadband.co.uk/broadband"),
    ("Broadband Genie", "comparison", "https://www.broadbandgenie.co.uk/"),
    ("Go.Compare broadband", "comparison", "https://www.gocompare.com/broadband/"),
    ("Confused.com broadband", "comparison", "https://www.confused.com/broadband"),
    ("Which? broadband", "reviews", "https://www.which.co.uk/reviews/broadband"),
    ("MoneySavingExpert home", "editorial", "https://www.moneysavingexpert.com/"),
    ("MoneySavingExpert newsletters", "newsletter", "https://www.moneysavingexpert.com/newsletters/"),
    ("NerdWallet UK", "editorial", "https://www.nerdwallet.com/uk/"),
    ("cable.co.uk", "comparison", "https://www.cable.co.uk/"),
    ("thinkbroadband", "specialist", "https://www.thinkbroadband.com/"),
    ("money.co.uk broadband", "comparison", "https://www.money.co.uk/broadband"),
    ("MoneySavingExpert privacy", "legal", "https://www.moneysavingexpert.com/site/privacy-policy/"),
    ("MoneySavingExpert email FAQ", "newsletter", "https://www.moneysavingexpert.com/site/money-tips-email-faqs/"),
]

LEGAL_PAGES: list[tuple[str, str]] = [
    (
        "ICO electronic mail marketing (brief)",
        "https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guide-to-pecr/electronic-and-telephone-marketing/electronic-mail-marketing/",
    ),
    (
        "ICO electronic mail marketing (detailed)",
        "https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guidance-on-direct-marketing-using-electronic-mail/",
    ),
    (
        "ICO how to comply with PECR email rules",
        "https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guidance-on-direct-marketing-using-electronic-mail/how-do-we-comply-with-the-pecr-electronic-mail-marketing-rules/",
    ),
]

EMAIL_INPUT_XPATH = (
    "//input[contains(translate(@type,'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'email') "
    "or contains(translate(@name,'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'email') "
    "or contains(translate(@id,'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'email') "
    "or contains(translate(@placeholder,'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'email')]"
)
POSTCODE_INPUT_XPATH = (
    "//input[contains(translate(@name,'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'postcode') "
    "or contains(translate(@id,'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'postcode') "
    "or contains(translate(@placeholder,'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'postcode') "
    "or contains(translate(@autocomplete,'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'postal')]"
)
CHECKBOX_XPATH = "//input[@type='checkbox' or @type='CHECKBOX']"
PRIVACY_LINK_XPATH = (
    "//a[contains(translate(@href,'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'privacy') "
    "or contains(translate(.,'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'privacy')]"
)

SIGNAL_PATTERNS: list[tuple[str, str]] = [
    ("newsletter", r"\bnewsletters?\b"),
    ("deal_alerts", r"deal alerts?|price alerts?|email alerts?|alert me"),
    ("weekly", r"\bweekly\b|once a week|every week"),
    ("unsubscribe_promise", r"unsubscribe (?:any time|anytime|at any time)|opt[- ]out"),
    ("no_spam", r"no spam"),
    ("consent_language", r"\bby (?:signing up|clicking|submitting|entering)|i (?:agree|consent|want to receive)|tick (?:the box|here)"),
    ("double_opt_in", r"confirm(?:ation)? (?:email|link)|check your inbox|verify your email|double opt[- ]in"),
    ("save_results", r"email (?:me|my) (?:results|deals)|send (?:me|these) (?:results|deals)|save (?:this|your) comparison"),
    ("account_signup", r"create (?:an )?account|sign in|register"),
    ("contract_end_reminder", r"contract ends?|end of contract|renewal reminder"),
    ("marketing_opt_in", r"marketing (?:emails?|messages?)|keep me (?:updated|informed)"),
    ("pre_ticked_risk", r"pre-?ticked|untick (?:this|the box) if you"),
    ("frequency_stated", r"\b(?:daily|weekly|monthly|occasional)\b.{0,40}\b(?:email|roundup|newsletter|alert)"),
    ("noreply_sender", r"\bno[-_]?reply@|\bdo[-_]?not[-_]?reply@|\bdonotreply@"),
    ("branded_from", r"from (?:broadbandpicker|uswitch|moneysavingexpert|moneysupermarket)|emails? (?:come|sent) from"),
    ("do_not_reply", r"do not reply|this is an automated (?:message|email)|replies (?:are|will) not"),
]


@dataclass
class PageScan:
    name: str
    category: str
    url: str
    status: int | str = ""
    title: str = ""
    html_bytes: int = 0
    word_count: int = 0
    js_rendered_suspected: bool = False
    email_input_count: int = 0
    email_placeholders: list[str] = field(default_factory=list)
    postcode_input_count: int = 0
    checkbox_count: int = 0
    checkbox_labels: list[str] = field(default_factory=list)
    form_count: int = 0
    cta_texts: list[str] = field(default_factory=list)
    privacy_link_count: int = 0
    privacy_hrefs: list[str] = field(default_factory=list)
    signals_found: list[str] = field(default_factory=list)
    nearby_consent_snippets: list[str] = field(default_factory=list)
    noreply_addresses: list[str] = field(default_factory=list)
    visible_from_addresses: list[str] = field(default_factory=list)
    notes: str = ""


@dataclass
class LegalScan:
    name: str
    url: str
    status: int | str = ""
    html_bytes: int = 0
    excerpts: list[str] = field(default_factory=list)
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


def nearby_text(node, limit: int = 280) -> str:
    parent = node.getparent()
    for _ in range(4):
        if parent is None:
            break
        blob = collapse(" ".join(parent.xpath(".//text()")))
        if len(blob) >= 40:
            return blob[:limit]
        parent = parent.getparent()
    return collapse(" ".join(node.xpath("ancestor::form[1]//text()")))[:limit]


def label_for_input(node) -> str:
    ident = (node.get("id") or "").strip()
    if ident and node.getroottree() is not None:
        labels = node.getroottree().xpath(f"//label[@for='{ident}']")
        if labels:
            return collapse("".join(labels[0].xpath(".//text()")))[:240]
    parent_label = node.xpath("ancestor::label[1]")
    if parent_label:
        return collapse("".join(parent_label[0].xpath(".//text()")))[:240]
    aria = (node.get("aria-label") or "").strip()
    if aria:
        return aria[:240]
    return nearby_text(node, 180)


def scan_competitor(name: str, category: str, url: str) -> PageScan:
    scan = PageScan(name=name, category=category, url=url)
    try:
        response = fetch(url)
        scan.status = response.status_code
        scan.html_bytes = len(response.content or b"")
        if response.status_code != 200 or not response.content:
            scan.notes = f"Non-200 or empty ({response.status_code})"
            return scan
        if "cf-mitigated" in {k.lower() for k in response.headers} or response.status_code == 403:
            scan.notes = "Bot protection suspected"
        tree = html.fromstring(response.content)
        title = collapse(" ".join(tree.xpath("//title/text()")))
        scan.title = title
        body_text = collapse(" ".join(tree.xpath("//body//text()[normalize-space()]")))
        scan.word_count = len(body_text.split())
        lower = body_text.lower()
        # Thin HTML with a large script payload is usually a client-rendered app.
        script_chars = sum(len((s or "")) for s in tree.xpath("//script//text()"))
        scan.js_rendered_suspected = scan.word_count < 80 or (
            scan.html_bytes > 40_000 and scan.word_count < 200 and script_chars > 8_000
        )

        email_nodes = tree.xpath(EMAIL_INPUT_XPATH)
        scan.email_input_count = len(email_nodes)
        scan.email_placeholders = [
            collapse(n.get("placeholder") or n.get("aria-label") or "")
            for n in email_nodes
            if collapse(n.get("placeholder") or n.get("aria-label") or "")
        ][:8]
        scan.postcode_input_count = len(tree.xpath(POSTCODE_INPUT_XPATH))
        checkboxes = tree.xpath(CHECKBOX_XPATH)
        scan.checkbox_count = len(checkboxes)
        labels = []
        for box in checkboxes:
            label = label_for_input(box)
            if label:
                labels.append(label)
        scan.checkbox_labels = labels[:10]
        forms = tree.xpath("//form")
        scan.form_count = len(forms)
        ctas = []
        for btn in tree.xpath(
            "//form//button|//form//input[@type='submit' or @type='button']"
        ):
            text = collapse(btn.get("value") or "".join(btn.xpath(".//text()")))
            if text:
                ctas.append(text[:80])
        scan.cta_texts = list(dict.fromkeys(ctas))[:10]
        privacy_nodes = tree.xpath(PRIVACY_LINK_XPATH)
        hrefs = []
        for a in privacy_nodes:
            href = (a.get("href") or "").strip()
            if href:
                hrefs.append(urljoin(url, href))
        scan.privacy_link_count = len(privacy_nodes)
        scan.privacy_hrefs = list(dict.fromkeys(hrefs))[:8]
        scan.signals_found = [key for key, pattern in SIGNAL_PATTERNS if re.search(pattern, lower)]
        snippets = []
        for node in email_nodes[:4]:
            snippet = nearby_text(node)
            if snippet:
                snippets.append(snippet)
        scan.nearby_consent_snippets = snippets[:4]
        host = urlparse(url).hostname or ""
        emails_found = re.findall(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}", body_text)
        scan.noreply_addresses = sorted(
            {e.lower() for e in emails_found if re.search(r"no[-_]?reply|donotreply|do[-_]?not[-_]?reply", e, re.I)}
        )[:12]
        branded = []
        for email_addr in emails_found:
            lower = email_addr.lower()
            if host and host.replace("www.", "") in lower:
                branded.append(lower)
            if re.search(r"no[-_]?reply|alerts?@|news@|hello@|info@", lower):
                branded.append(lower)
        scan.visible_from_addresses = sorted(set(branded))[:16]
        if scan.js_rendered_suspected:
            extra = "JS-rendered or thin HTML shell; treat field counts as incomplete."
            scan.notes = f"{scan.notes} {extra}".strip() if scan.notes else extra
        return scan
    except requests.RequestException as exc:
        scan.status = "error"
        scan.notes = f"{type(exc).__name__}: {exc}"[:240]
        return scan


def scan_legal(name: str, url: str) -> LegalScan:
    scan = LegalScan(name=name, url=url)
    try:
        response = fetch(url)
        scan.status = response.status_code
        scan.html_bytes = len(response.content or b"")
        if response.status_code != 200 or not response.content:
            scan.notes = f"Non-200 or empty ({response.status_code})"
            return scan
        tree = html.fromstring(response.content)
        text = collapse(" ".join(tree.xpath("//main//text()[normalize-space()] | //article//text()[normalize-space()] | //body//text()[normalize-space()]")))
        needles = [
            r"You must not send marketing emails or texts to individuals without specific consent.{0,120}",
            r"soft opt-in.{0,180}",
            r"pre-ticked.{0,120}",
            r"freely given.{0,160}",
            r"unsubscribe.{0,140}",
            r"consent must.{0,180}",
            r"identify.{0,80}organisation.{0,80}",
            r"must not disguise or conceal your identity.{0,160}",
            r"valid contact address.{0,160}",
        ]
        found: list[str] = []
        for needle in needles:
            match = re.search(needle, text, flags=re.I)
            if match:
                found.append(collapse(match.group(0))[:240])
        # Always keep a couple of heading-sized chunks so the report has citations
        # even when regex misses because of markup-split sentences.
        paras = [collapse(p) for p in tree.xpath("//p//text()") if len(collapse(p)) > 80]
        for para in paras[:6]:
            if any(word in para.lower() for word in ("consent", "soft opt-in", "electronic mail", "unsubscribe")):
                found.append(para[:280])
        scan.excerpts = list(dict.fromkeys(found))[:8]
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


def scan_our_dns() -> dict[str, str]:
    domain = "broadbandpicker.co.uk"
    txt = dns_records("TXT", domain)
    spf = ""
    for part in re.findall(r'"([^"]+)"', txt) or [txt]:
        if "v=spf1" in part.lower():
            spf = part
            break
    return {
        "domain": domain,
        "ns": dns_records("NS", domain),
        "mx": dns_records("MX", domain),
        "spf": spf,
        "dmarc": dns_records("TXT", f"_dmarc.{domain}"),
        "txt": txt[:400],
    }


def implementation_spec() -> dict:
    """What BroadbandPicker should ship. Kept in the research output so the
    live build can be checked against a written spec rather than improvised."""
    return {
        "product_name": "BroadbandPicker deal alerts",
        "public_path": "/alerts",
        "placements": [
            "Dedicated /alerts landing page (indexable)",
            "Homepage mid-page (inline)",
            "Site footer",
            "Postcode area pages, with the area pre-filled",
            "Tools hub card",
        ],
        "fields": {
            "email": "required",
            "uk_postcode": "optional, for localising later emails; never a full street address on a newsletter form",
            "consent_checkbox": "required, unticked, separate from using the site",
            "honeypot": "hidden website field",
        },
        "consent_text": (
            "I want BroadbandPicker to email me weekly UK broadband deal roundups "
            "and occasional switching guides. I can unsubscribe at any time."
        ),
        "legal_basis": {
            "pecr": "Regulation 22 prior consent. Soft opt-in does not apply: this is not a sale.",
            "uk_gdpr": "Consent for sending the emails; legitimate interests are not a PECR basis for marketing email.",
            "double_opt_in": "Confirmation link before any deals email. Records the consent wording, time, source URL and hashed IP.",
        },
        "do_not_copy": [
            "Invented subscriber counts such as 'thousands of households'",
            "Pre-ticked boxes",
            "Bundling marketing consent into the postcode checker",
            "Bought-in lists",
            "Daily spam or unnamed 'partners' in the same tick",
            "Full home address on an alerts form (that is an availability-check pattern, not a newsletter)",
        ],
        "email_programme": {
            "confirmation": "Send immediately; expire the link after 48 hours",
            "welcome": "Only after confirm; include unsubscribe",
            "recurring": "Weekly deals roundup plus occasional guides, as named in the tick",
            "headers": "List-Unsubscribe and List-Unsubscribe-Post on every message",
            "identification": "BroadbandPicker and broadbandpicker.co.uk in every message; do not invent a postal address",
        },
        "email_identity": {
            "from_name": "BroadbandPicker",
            "from_address": "noreply@broadbandpicker.co.uk",
            "reply_to": "hello@broadbandpicker.co.uk, with body copy that this is automated and the contact page is the human route",
            "logo": "Hosted PNG at https://broadbandpicker.co.uk/logo.png plus a text wordmark. Do not use SVG in email. Do not put a personal Gmail address in From, Reply-To, or the body.",
            "html": "Table layout, 560px, brand bar #0ea5e9, logo + wordmark, one primary button, unsubscribe, List-Unsubscribe headers",
            "why_not_gmail": "Comparison sites send as TheirBrand <noreply@theirdomain>. Gmail SMTP rewrites From to the logged-in Gmail user, so a personal Gmail address always shows unless the domain itself is the authenticated sender.",
            "sending": "Keep sending inside the Next.js app with nodemailer. Authenticate as a broadbandpicker.co.uk mailbox (or a Gmail Send-mail-as alias for noreply@) so the envelope matches the From header. Do not add Mailchimp, Brevo or Klaviyo for this.",
        },
        "analytics": {
            "request_event": "newsletter_signup_request",
            "confirmed_key_event": "newsletter_signup",
        },
    }


def write_markdown(payload: dict, path: Path) -> None:
    pages: list[dict] = payload["competitor_pages"]
    legal: list[dict] = payload["legal_pages"]
    spec: dict = payload["implementation_spec"]
    lines: list[str] = [
        "# How UK affiliate sites collect emails, and what BroadbandPicker should ship",
        "",
        f"Researched: {payload['run_at_utc']}",
        "",
        "This is a working note for BroadbandPicker deal alerts. It is not legal advice.",
        "Live ICO pages were fetched on the run date; competitor HTML is often a JS shell.",
        "",
        "## Why this exists",
        "",
        "UK comparison sites do not treat email as a generic 'newsletter box'. The ones that",
        "look professional treat it as a **permissioned retention channel**: a named sender,",
        "a named frequency, a named topic, an easy stop, and a paper trail. BroadbandPicker",
        "already had a footer/homepage form that wrote straight to the database from the",
        "browser, with no consent tick, no confirmation, and a made-up social-proof line.",
        "That is the opposite of how a regulated UK affiliate site should collect addresses.",
        "",
        "## What the law actually requires (PECR + UK GDPR)",
        "",
        "A deals email to a person is **unsolicited electronic mail marketing** under PECR.",
        "ICO guidance (updated 28 April 2026 after the Data (Use and Access) Act 2025) is",
        "clear on the points that matter for this form:",
        "",
        "1. **Prior consent**, unless a soft opt-in applies. Soft opt-in is for contact",
        "   details collected during a sale or negotiation of a similar product. A visitor",
        "   typing an email on a comparison site is **not** a customer. BroadbandPicker",
        "   must use consent.",
        "2. Consent is the UK GDPR standard: freely given, specific, informed, unambiguous.",
        "   No pre-ticked boxes. No bundling with terms of use. Name **BroadbandPicker**.",
        "   Name the **channel** (email) and the **content** (weekly deal roundups and",
        "   occasional guides).",
        "3. Keep a record: the wording shown, when it was shown, the source URL, and that",
        "   the box was ticked. A confirmation click is strong evidence.",
        "4. Every later message must identify us and include a simple unsubscribe.",
        "5. PECR fines now sit at UK GDPR levels. This is not a 'small site' carve-out.",
        "",
        "Double opt-in is not a statute by name, but it is the ICO-aligned way to prove",
        "the address belongs to the person who consented, and it stops a mistyped address",
        "from becoming a complaint.",
        "",
        "### Excerpts fetched from ICO pages this run",
        "",
    ]
    for item in legal:
        lines.append(f"#### {item['name']}")
        lines.append("")
        lines.append(f"- URL: {item['url']}")
        lines.append(f"- HTTP: {item['status']}")
        if item.get("notes"):
            lines.append(f"- Note: {item['notes']}")
        if item.get("excerpts"):
            for excerpt in item["excerpts"]:
                lines.append(f"- “{excerpt}”")
        else:
            lines.append("- No extractable excerpt (page blocked, JS-only, or markup split).")
        lines.append("")

    lines.extend(
        [
            "## How affiliate comparison sites actually run this",
            "",
            "From the live HTML plus privacy pages, UK comparison brands use a small set of",
            "working models. BroadbandPicker should copy the **process**, not the wording.",
            "",
            "| Model | Who uses a version of it | How it works | Take for BroadbandPicker |",
            "| --- | --- | --- | --- |",
            "| Postcode first, email later | Uswitch, MoneySuperMarket, Compare the Market, Go.Compare | The hub is an availability checker. Email is not the first field. Address-level data is for quoting, not for a newsletter. | Keep the postcode checker as a checker. Do not turn it into a marketing capture. |",
            "| Save / email my results | broadbandchoices privacy (Decision Tech / MoneySuperMarket) | Email is collected to send *this* comparison, with a separate marketing permission. Results mail can be a service message; marketing still needs a tick. | Do not send deals until the alerts tick and confirm are done. A 'save these deals' mail is a later feature. |",
            "| Named newsletter centre | MoneySavingExpert | A dedicated page lists named emails, frequency, and an unsubscribe promise. That looks like a publisher, not a harvest form. | Ship `/alerts` as a proper page: what you get, how often, how to stop. |",
            "| Account + contract-end reminder | Uswitch copy on the broadband hub | If you made an account at switch time, they remind you when the contract ends. That is a high-intent lifecycle email, not a blast. | Out of scope until BroadbandPicker stores a switch date. Do not fake it. |",
            "| Footer / mid-page deal alerts | Smaller comparison and deals sites | Short email field, benefit line, frequency, privacy link. Professional versions add an unticked tick. | Footer + homepage + postcode page, all posting to the same server route. |",
            "",
            "What they **do not** do on a professional alerts form:",
            "",
            "- Ask for a full street address. That is the availability journey.",
            "- Claim 'thousands of households' without a source.",
            "- Hide the sender behind 'partners' on the same tick.",
            "- Write to a public database key from the browser.",
            "",
            "## Competitor page scan",
            "",
            "Field counts on JS-rendered hubs are incomplete. Use those rows as a prompt",
            "to look manually, not as proof the site has no email form.",
            "",
            "| Site | HTTP | Words | Email fields | Postcode fields | Checkboxes | Signals | JS shell? |",
            "| --- | --- | --- | --- | --- | --- | --- | --- |",
        ]
    )
    for page in pages:
        signals = ", ".join(page.get("signals_found") or []) or "—"
        lines.append(
            "| {name} | {status} | {words} | {email} | {pc} | {cb} | {signals} | {js} |".format(
                name=page["name"],
                status=page["status"],
                words=page["word_count"],
                email=page["email_input_count"],
                pc=page["postcode_input_count"],
                cb=page["checkbox_count"],
                signals=signals.replace("|", "/"),
                js="yes" if page.get("js_rendered_suspected") else "no",
            )
        )
    lines.extend(["", "### Notes and consent snippets", ""])
    for page in pages:
        lines.append(f"#### {page['name']}")
        lines.append("")
        lines.append(f"- {page['url']}")
        if page.get("title"):
            lines.append(f"- Title: {page['title']}")
        if page.get("notes"):
            lines.append(f"- {page['notes']}")
        if page.get("email_placeholders"):
            lines.append("- Email placeholders: " + "; ".join(page["email_placeholders"]))
        if page.get("cta_texts"):
            lines.append("- Form CTAs: " + "; ".join(page["cta_texts"]))
        if page.get("checkbox_labels"):
            lines.append("- Checkbox labels: " + " / ".join(page["checkbox_labels"][:4]))
        if page.get("nearby_consent_snippets"):
            lines.append("- Near the email field: “" + page["nearby_consent_snippets"][0] + "”")
        if page.get("noreply_addresses"):
            lines.append("- Noreply addresses: " + ", ".join(page["noreply_addresses"]))
        if page.get("visible_from_addresses"):
            lines.append("- Domain-looking addresses: " + ", ".join(page["visible_from_addresses"][:8]))
        if page.get("privacy_hrefs"):
            lines.append("- Privacy URLs: " + ", ".join(page["privacy_hrefs"][:3]))
        lines.append("")

    lines.extend(
        [
            "## BroadbandPicker implementation spec (from this research)",
            "",
            f"- Public page: `{spec['public_path']}`",
            f"- Consent wording to store: “{spec['consent_text']}”",
            f"- PECR basis: {spec['legal_basis']['pecr']}",
            f"- UK GDPR: {spec['legal_basis']['uk_gdpr']}",
            "",
            "Placements:",
            "",
        ]
    )
    for item in spec["placements"]:
        lines.append(f"- {item}")
    lines.extend(
        [
            "",
            "Fields:",
            "",
            f"- Email: {spec['fields']['email']}",
            f"- UK postcode: {spec['fields']['uk_postcode']}",
            f"- Consent: {spec['fields']['consent_checkbox']}",
            f"- Honeypot: {spec['fields']['honeypot']}",
            "",
            "Do not copy:",
            "",
        ]
    )
    for item in spec["do_not_copy"]:
        lines.append(f"- {item}")
    lines.extend(
        [
            "",
            "Email programme:",
            "",
            f"- Confirmation: {spec['email_programme']['confirmation']}",
            f"- Welcome: {spec['email_programme']['welcome']}",
            f"- Recurring: {spec['email_programme']['recurring']}",
            f"- Headers: {spec['email_programme']['headers']}",
            f"- Identification: {spec['email_programme']['identification']}",
            "",
            "## How professional sites brand the sender",
            "",
            "Recipients judge a signup email in the inbox row, before they open it. UK comparison",
            "and publisher mail looks like **BrandName** plus a **domain address**, usually",
            "`noreply@`, `donotreply@` or a named mailbox on the same domain. They put a logo",
            "in the HTML header and a wordmark that still reads if images are blocked. They",
            "never put a personal Gmail address in the From field.",
            "",
            "ICO PECR: you must not disguise or conceal your identity, and you must give a valid",
            "contact address so people can opt out. A `noreply@` From is fine if the name is the",
            "organisation, the domain is yours, every message has unsubscribe, and a human route",
            "exists (contact page). It is not fine to hide behind a private Gmail account.",
            "",
            "This run, addresses that looked like senders on competitor HTML:",
            "",
        ]
    )
    for page in pages:
        addrs = page.get("noreply_addresses") or page.get("visible_from_addresses") or []
        if addrs:
            lines.append(f"- {page['name']}: " + ", ".join(addrs[:8]))
    lines.extend(
        [
            "",
            f"- BroadbandPicker From name: {spec['email_identity']['from_name']}",
            f"- BroadbandPicker From address: `{spec['email_identity']['from_address']}`",
            f"- Logo: {spec['email_identity']['logo']}",
            f"- HTML: {spec['email_identity']['html']}",
            f"- Sending: {spec['email_identity']['sending']}",
            "",
            "Our domain DNS for sending (must align with From):",
            "",
        ]
    )
    dns = payload.get("our_dns") or {}
    lines.append(f"- MX: {dns.get('mx') or 'none'}")
    lines.append(f"- SPF: {dns.get('spf') or 'none'}")
    lines.append(f"- DMARC: {dns.get('dmarc') or 'none'}")
    lines.append("")
    if not dns.get("mx"):
        lines.append(
            "No MX or SPF on broadbandpicker.co.uk means inboxes cannot yet authenticate"
            " `noreply@broadbandpicker.co.uk`. The app still sends that From header from"
            " nodemailer. Until a domain mailbox or a verified Gmail Send-mail-as alias"
            " exists, Gmail SMTP will keep showing the personal Gmail user. That is a DNS"
            " and mailbox step, not a Mailchimp step."
        )
        lines.append("")
    lines.extend(
        [
            "## Analytics",
            "",
            "Request event "
            f"`{spec['analytics']['request_event']}`, confirmed key event "
            f"`{spec['analytics']['confirmed_key_event']}`.",
            "",
            "## Process to run after this script",
            "",
            "1. Visitor submits email (and optional postcode) with an unticked box they then tick.",
            "2. Server validates, ignores honeypots, rate-limits, and sends a confirmation email.",
            "3. Nothing commercial is sent until they click the confirmation link.",
            "4. Welcome email includes unsubscribe. Every later email does too.",
            "5. Privacy policy names this processing, retention, and how to stop.",
            "6. Confirmed subscribe is the GA4 event that matters, not the first click.",
            "",
        ]
    )
    path.write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output-json", type=Path, default=DEFAULT_JSON)
    parser.add_argument("--output-md", type=Path, default=DEFAULT_MD)
    args = parser.parse_args()

    competitor = [asdict(scan_competitor(name, category, url)) for name, category, url in COMPETITOR_PAGES]
    legal = [asdict(scan_legal(name, url)) for name, url in LEGAL_PAGES]
    payload = {
        "run_at_utc": RUN_AT,
        "method": {
            "http": "GET with a research user-agent",
            "parser": "lxml on the initial HTML only",
            "limitation": "JS-rendered and Cloudflare-protected pages are marked, not guessed",
        },
        "legal_pages": legal,
        "competitor_pages": competitor,
        "working_models": [
            "postcode_first_email_later",
            "email_my_results_as_service_message",
            "named_newsletter_centre",
            "account_contract_end_reminder",
            "footer_and_midpage_deal_alerts",
        ],
        "our_dns": scan_our_dns(),
        "implementation_spec": implementation_spec(),
    }
    args.output_json.parent.mkdir(parents=True, exist_ok=True)
    args.output_json.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
    write_markdown(payload, args.output_md)
    print(f"Wrote {args.output_json}")
    print(f"Wrote {args.output_md}")
    captured = sum(1 for row in competitor if row["email_input_count"] > 0)
    print(f"Pages with a visible email field in the initial HTML: {captured}/{len(competitor)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
