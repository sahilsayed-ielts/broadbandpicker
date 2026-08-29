#!/usr/bin/env python3
"""Awin partnerships assistant for BroadbandPicker.

Talks to the Awin Publisher API directly (no manual dashboard checking) and
keeps an organised, self-updating record of every advertiser relationship
under Awin/advertisers/ — one folder per advertiser, so nothing lives only
in someone's memory or a spreadsheet cell.

Commands:
  sync
      Pull every joined/pending/suspended/rejected programme from the Awin
      API, create or update Awin/advertisers/<slug>/programme.json for each,
      and log any relationship changes to that advertiser's outreach-log.md.
      Also archives a full raw snapshot under Awin/_snapshots/.

      The Awin API has no dedicated "invitations" endpoint (checked directly
      against the live account — /invitations, /notifications and
      relationship=invited all 404/400). An advertiser inviting you shows up
      indistinguishably from a manual application, as a brand-new Pending
      (occasionally Joined) relationship — so `sync` flags every such
      transition as a "possible new invitation" and prints them separately,
      for you to confirm by eye in the Awin dashboard's Programmes >
      Invitations tab.

  invitations
      List every advertiser still flagged as a possible new invitation.

  add-invitation --name <advertiser> [--advertiser-id <id>] [--url <site>] [--message <text>]
      Awin's Activity Stream ("X have invited you to join their programme")
      has no API equivalent (checked: /activity, /activity-stream, /feed,
      /events, /inbox all 404). Log one you saw in the dashboard by hand and
      it's tracked the same way as everything else — the advertiser ID is
      auto-resolved from the live catalogue if you don't have it to hand.

  mark-reviewed --advertiser <slug>
      Clear the possible-invitation flag once you've confirmed it in Awin.

  analyse-invitation --advertiser <slug>
      Ask Claude to assess the logged invitation message itself: what's
      actually being offered, what's standard vs. unusual, and what
      questions to ask before accepting. Writes
      Awin/advertisers/<slug>/invitation-analysis.md. Also creates
      Awin/advertisers/<slug>/terms/ so you have somewhere to drop the
      advertiser's actual terms & conditions once you have them.

  analyse-terms --advertiser <slug>
      Read every file dropped into Awin/advertisers/<slug>/terms/ (PDF,
      DOCX, TXT or MD) and ask Claude for a structured breakdown: commission
      structure, cookie window, payment/validation terms, promotional
      restrictions, exclusivity clauses, and red flags — including whether
      the terms actually match what the invitation promised. Writes
      Awin/advertisers/<slug>/terms-assessment.md.

  recommend --advertiser <slug>
      Synthesise everything on file for an advertiser (research, invitation
      analysis, terms assessment) against Awin/playbooks/negotiation-
      playbook.md and give one direct verdict: accept as-is, accept with
      changes requested, decline, or not enough information yet. Writes
      Awin/advertisers/<slug>/recommendation.md.

  draft-reply --advertiser <slug> [--contact-name <name>]
      Draft an email reply to the advertiser's invitation, asking for
      whatever's missing (commission, deduplication policy, payment terms)
      and making one concrete, playbook-informed negotiating ask where
      there's room to. This is a DRAFT for you to review and send yourself
      -- nothing is sent automatically. Writes
      Awin/advertisers/<slug>/draft-reply.md.

  research --advertiser <slug> [--url <site-url>]
      Scrape the advertiser's own public website and ask Claude (via the
      claude CLI, --restricted so it only writes text) to draft a fit
      assessment against BroadbandPicker's audience — mirroring the manual
      research BroadbandPicker's team already does before reapplying or
      launching a partnership, but done automatically and consistently.
      Writes Awin/advertisers/<slug>/research.md.

  briefing
      Read every advertiser folder (status + research notes) and ask Claude
      to draft a single prioritised "what to do next" action plan, written
      to Awin/reports/latest-briefing.md.

  check-programmes [--relationship ...]
      Legacy quick-look: print programme status straight from the API
      without touching the Awin/ folder. Useful for a fast manual check.

  generate-link --advertiser-id <id> --url <destination>
      Ask Awin for the correct, current tracking link for a specific
      advertiser + destination URL, instead of hand-typing one.

Requires AWIN_API_TOKEN (Awin platform -> user menu -> API Credentials) and
AWIN_PUBLISHER_ID (defaults to 2942019) in the environment or .env.local.
`research` and `briefing` also require the `claude` CLI on PATH.

Usage:
    python3 scripts/awin_sync.py sync
    python3 scripts/awin_sync.py research --advertiser zen-internet
    python3 scripts/awin_sync.py briefing
    python3 scripts/awin_sync.py check-programmes --relationship pending
    python3 scripts/awin_sync.py generate-link --advertiser-id 1234 --url https://www.bt.com/broadband
"""

from __future__ import annotations

import argparse
import json
import os
import re
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import requests

API_BASE = "https://api.awin.com"
DEFAULT_PUBLISHER_ID = "2942019"

ROOT = Path(__file__).resolve().parents[1]
AWIN_DIR = ROOT / "Awin"
ADVERTISERS_DIR = AWIN_DIR / "advertisers"
SNAPSHOTS_DIR = AWIN_DIR / "_snapshots"
REPORTS_DIR = AWIN_DIR / "reports"
PLAYBOOK_PATH = AWIN_DIR / "playbooks" / "negotiation-playbook.md"
PROVIDERS_TS = ROOT / "data" / "providers.ts"

GENUINE_STATUSES = ["joined", "pending", "suspended", "rejected"]

# Advertiser name (lowercased) -> site destination, for programmes that
# don't map onto a single data/providers.ts entry (e.g. a comparison tool
# rather than one ISP). Everything else is auto-matched by name.
SITE_OVERRIDES = {
    "broadband genie": "/compare",
}

STOPWORDS = {
    "broadband", "phone", "and", "home", "business", "b2c", "b2b", "ltd",
    "network", "operators", "full", "fibre", "mobile", "service", "services",
    "internet", "provider", "roi", "uk", "the", "communications",
}


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


def slugify(name: str) -> str:
    s = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")
    return s or "advertiser"


def _normalize_tokens(name: str) -> set[str]:
    s = re.sub(r"[^a-z0-9\s]", " ", name.lower())
    return {t for t in s.split() if t and t not in STOPWORDS}


def _load_site_providers() -> list[tuple[str, str]]:
    """Return (slug, name) pairs straight from data/providers.ts."""
    if not PROVIDERS_TS.exists():
        return []
    text = PROVIDERS_TS.read_text()
    slugs = re.findall(r"slug:\s*'([a-z0-9-]+)'", text)
    names = re.findall(r"name:\s*'([^']+)'", text)
    return list(zip(slugs, names))


def match_live_url(advertiser_name: str) -> str:
    """Best-effort match from an Awin advertiser name to a live site page."""
    key = advertiser_name.strip().lower()
    if key in SITE_OVERRIDES:
        return SITE_OVERRIDES[key]
    target = _normalize_tokens(advertiser_name)
    if not target:
        return ""
    best_slug, best_overlap = "", 0
    for slug, name in _load_site_providers():
        overlap = len(target & _normalize_tokens(name))
        if overlap > best_overlap:
            best_overlap, best_slug = overlap, slug
    return f"/providers/{best_slug}" if best_overlap > 0 else ""


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


# ---------------------------------------------------------------------------
# Organised folder tracking: Awin/advertisers/<slug>/
# ---------------------------------------------------------------------------

def _today() -> str:
    return datetime.now(timezone.utc).date().isoformat()


def advertiser_dir(slug: str) -> Path:
    d = ADVERTISERS_DIR / slug
    d.mkdir(parents=True, exist_ok=True)
    return d


def append_log(slug: str, line: str) -> None:
    d = advertiser_dir(slug)
    log = d / "outreach-log.md"
    if not log.exists():
        log.write_text(f"# {slug} — outreach log\n\n")
    with log.open("a") as f:
        f.write(f"- **{_today()}**: {line}\n")


def add_invitation(name: str, advertiser_id: int | None, url: str | None, message: str | None) -> None:
    """Manually log an invitation seen in Awin's Activity Stream.

    Awin's Activity Stream ("X have invited you to join their programme") has
    no API equivalent -- confirmed by testing /activity, /activity-stream,
    /feed, /events and /inbox, all 404. This is the deliberate manual
    counterpart: paste in what you see in the dashboard and it's tracked the
    same way as everything else in Awin/advertisers/.
    """
    slug = slugify(name)
    d = advertiser_dir(slug)
    programme_path = d / "programme.json"
    previous = json.loads(programme_path.read_text()) if programme_path.exists() else None

    resolved_id = advertiser_id
    website = url or (previous or {}).get("website", "")
    if resolved_id is None:
        # Try to resolve the advertiser ID from the live notjoined catalogue
        # so the folder carries a real Awin ID, not a placeholder.
        try:
            token = get_token()
            pid = publisher_id()
            catalogue = _fetch_relationship(pid, token, "notjoined")
            match = next((p for p in catalogue if (p.get("name") or "").lower() == name.lower()), None)
            if match:
                resolved_id = match.get("id")
                website = website or match.get("displayUrl", "")
        except SystemExit:
            pass

    record = {
        "advertiser": name,
        "slug": slug,
        "awin_advertiser_id": resolved_id,
        "sector": (previous or {}).get("sector", ""),
        "relationship": "Invited",
        "live_url": (previous or {}).get("live_url") or match_live_url(name),
        "website": website,
        "last_synced": _today(),
        "possible_invitation_flagged_on": _today(),
        "invitation_message": message or (previous or {}).get("invitation_message", ""),
    }
    programme_path.write_text(json.dumps(record, indent=2))
    append_log(slug, f"Invitation logged from Awin's Activity Stream (advertiser ID: {resolved_id or 'unresolved'}).")
    print(f"Logged invitation from {name} -> {d}")
    if resolved_id is None:
        print("Could not auto-resolve an Awin advertiser ID for this name — pass --advertiser-id if you have it.")


def sync() -> None:
    token = get_token()
    pid = publisher_id()
    ADVERTISERS_DIR.mkdir(parents=True, exist_ok=True)
    SNAPSHOTS_DIR.mkdir(parents=True, exist_ok=True)

    all_programmes: dict[str, list[dict]] = {}
    for status in GENUINE_STATUSES:
        all_programmes[status] = _fetch_relationship(pid, token, status)

    date = _today()
    (SNAPSHOTS_DIR / f"{date}.json").write_text(json.dumps(all_programmes, indent=2))

    # The Awin Publisher API has no dedicated "invitations" endpoint (checked
    # directly against the live account: /invitations, /notifications and
    # relationship=invited all 404/400). An advertiser inviting you lands as
    # a brand-new Pending (occasionally Joined) relationship indistinguishable
    # via the API from you having applied yourself through the Awin UI — so
    # any such transition is flagged as a possible invitation to go confirm
    # by eye in the Awin dashboard's Programmes > Invitations tab.
    INVITE_WORTHY = {"Pending", "Joined"}

    new_count, changed_count = 0, 0
    possible_invitations: list[str] = []
    for status, programmes in all_programmes.items():
        relationship = status.capitalize()
        for p in programmes:
            name = p.get("name") or "Unknown"
            slug = slugify(name)
            d = advertiser_dir(slug)
            programme_path = d / "programme.json"
            previous = json.loads(programme_path.read_text()) if programme_path.exists() else None
            live_url = (previous or {}).get("live_url") or match_live_url(name)
            website = (previous or {}).get("website", "")
            record = {
                "advertiser": name,
                "slug": slug,
                "awin_advertiser_id": p.get("id"),
                "sector": p.get("primarySector") or "",
                "relationship": relationship,
                "live_url": live_url,
                "website": website,
                "last_synced": date,
            }

            is_new = previous is None
            relationship_changed = previous is not None and previous.get("relationship") != relationship
            is_possible_invitation = (is_new or relationship_changed) and relationship in INVITE_WORTHY

            if is_possible_invitation:
                record["possible_invitation_flagged_on"] = date
            elif previous and previous.get("possible_invitation_flagged_on"):
                # Carry the flag forward until a human clears it, rather than
                # silently dropping it on an unrelated re-sync.
                record["possible_invitation_flagged_on"] = previous["possible_invitation_flagged_on"]

            programme_path.write_text(json.dumps(record, indent=2))

            if is_new:
                note = " Possible new invitation from the advertiser — check Awin's Invitations tab to confirm, since the API can't tell invitation apart from a manual application." if is_possible_invitation else ""
                append_log(slug, f"Discovered via Awin API sync — relationship: {relationship}.{note}")
                new_count += 1
                if is_possible_invitation:
                    possible_invitations.append(f"{name} (new, {relationship})")
            elif relationship_changed:
                note = " Possible new invitation — check Awin's Invitations tab." if is_possible_invitation else ""
                append_log(slug, f"Relationship changed: {previous.get('relationship')} -> {relationship}.{note}")
                changed_count += 1
                if is_possible_invitation:
                    possible_invitations.append(f"{name} ({previous.get('relationship')} -> {relationship})")

    total = sum(len(v) for v in all_programmes.values())
    print(f"Synced {total} programmes ({', '.join(f'{k}: {len(v)}' for k, v in all_programmes.items())}).")
    print(f"New advertiser folders: {new_count}. Relationship changes logged: {changed_count}.")
    if possible_invitations:
        print(f"\nPossible new invitations to review ({len(possible_invitations)}):")
        for line in possible_invitations:
            print(f"  - {line}")
        print(
            "  (The Awin API can't distinguish an advertiser invitation from a manual "
            "application — confirm in the Awin dashboard's Programmes > Invitations tab.)"
        )
    else:
        print("No possible new invitations detected (no new Pending/Joined programmes since last sync).")
    print(f"\nSnapshot: {SNAPSHOTS_DIR / f'{date}.json'}")
    print(f"Advertiser folders: {ADVERTISERS_DIR}")


# ---------------------------------------------------------------------------
# AI-assisted research and briefing (shells out to the claude CLI)
# ---------------------------------------------------------------------------

def call_claude(prompt: str, timeout: int = 180) -> str:
    """Run a single non-interactive Claude turn, text tools disabled.

    --restricted removes Bash/file-editing tools for this sub-call — it
    should only ever hand back written analysis, never touch the repo.
    """
    result = subprocess.run(
        ["claude", "-p", prompt, "--output-format", "text", "--restricted"],
        capture_output=True,
        text=True,
        timeout=timeout,
    )
    if result.returncode != 0:
        raise RuntimeError(f"claude CLI failed (exit {result.returncode}): {result.stderr[:800]}")
    return result.stdout.strip()


def scrape_site_text(url: str, max_chars: int = 4000) -> dict[str, str]:
    from lxml import html as lh

    resp = requests.get(
        url,
        headers={"User-Agent": "Mozilla/5.0 (compatible; BroadbandPickerResearch/1.0)"},
        timeout=15,
    )
    resp.raise_for_status()
    doc = lh.fromstring(resp.text)

    title_el = doc.xpath("//title/text()")
    title = title_el[0].strip() if title_el else ""
    desc_el = doc.xpath("//meta[@name='description']/@content")
    description = desc_el[0].strip() if desc_el else ""

    for bad in doc.xpath("//script") + doc.xpath("//style"):
        bad.drop_tree()
    body_text = re.sub(r"\s+", " ", " ".join(doc.xpath("//body//text()"))).strip()[:max_chars]

    return {"title": title, "description": description, "body_excerpt": body_text}


def research(slug: str, url: str | None) -> None:
    d = advertiser_dir(slug)
    programme_path = d / "programme.json"
    if not programme_path.exists():
        print(
            f"No programme.json for '{slug}' yet. Run `python3 scripts/awin_sync.py sync` first, "
            "or check the slug under Awin/advertisers/.",
            file=sys.stderr,
        )
        sys.exit(1)

    programme = json.loads(programme_path.read_text())
    site_url = url or programme.get("website") or ""
    if not site_url:
        print(f"No website known for '{slug}' yet. Pass --url https://...", file=sys.stderr)
        sys.exit(1)

    print(f"Scraping {site_url} ...")
    scraped = scrape_site_text(site_url)

    programme["website"] = site_url
    programme_path.write_text(json.dumps(programme, indent=2))

    prompt = f"""You are BroadbandPicker's Awin affiliate partnerships assistant. \
BroadbandPicker.co.uk is a UK broadband comparison site — its core audience is UK residential \
(and some small-business) broadband shoppers researching providers, deals, speeds and switching.

Assess how well the Awin advertiser programme below fits that audience, using the scraped \
website content as your evidence. Be honest and specific, not generic boilerplate — if the fit \
is weak or narrow, say so and explain why, the way an experienced affiliate manager would.

Advertiser: {programme['advertiser']}
Awin relationship: {programme['relationship']}
Awin sector: {programme.get('sector', 'unknown')}
Website: {site_url}
Page title: {scraped['title']}
Meta description: {scraped['description']}
Scraped page text (excerpt): {scraped['body_excerpt']}

Write a concise fit assessment in markdown with these sections:
## Audience fit
## Fit score (out of 10) and why
## Suggested placement / pitch angle
## Risks or reasons to be cautious
Keep it to around 250-400 words total."""

    print("Asking Claude for a fit assessment (this can take up to a couple of minutes) ...")
    assessment = call_claude(prompt)

    research_path = d / "research.md"
    research_path.write_text(
        f"# {programme['advertiser']} — fit assessment\n\n"
        f"_Generated {_today()} from {site_url}_\n\n"
        f"{assessment}\n"
    )
    append_log(slug, f"Research refreshed from {site_url}.")
    print(f"Written to {research_path}")


def terms_dir(slug: str) -> Path:
    d = advertiser_dir(slug) / "terms"
    d.mkdir(parents=True, exist_ok=True)
    return d


def analyse_invitation(slug: str) -> None:
    d = advertiser_dir(slug)
    programme_path = d / "programme.json"
    if not programme_path.exists():
        print(f"No programme.json for '{slug}'. Run `sync` or `add-invitation` first.", file=sys.stderr)
        sys.exit(1)
    programme = json.loads(programme_path.read_text())
    message = programme.get("invitation_message") or ""
    if not message:
        print(
            f"'{slug}' has no invitation_message on file — this only works for advertisers logged "
            "via `add-invitation --message \"...\"`.",
            file=sys.stderr,
        )
        sys.exit(1)

    research_path = d / "research.md"
    research_excerpt = research_path.read_text()[:1500] if research_path.exists() else "(none yet — run `research` first for site-level context)"

    terms_folder = terms_dir(slug)
    readme = terms_folder / "README.md"
    if not readme.exists():
        readme.write_text(
            f"# Drop {programme['advertiser']}'s terms & conditions here\n\n"
            "Save whatever the advertiser sends you — PDF, DOCX, TXT or MD all work. Then run:\n\n"
            f"    python3 scripts/awin_sync.py analyse-terms --advertiser {slug}\n\n"
            "This file is just a placeholder; delete it once real terms are here if you like.\n"
        )

    prompt = f"""You are BroadbandPicker's Awin affiliate partnerships assistant. An advertiser has \
invited BroadbandPicker (a UK broadband comparison site) to join their Awin affiliate programme \
directly, via Awin's Activity Stream. Assess the invitation itself, not just the advertiser's website.

Advertiser: {programme['advertiser']}
Awin advertiser ID: {programme.get('awin_advertiser_id', 'unknown')}
Awin relationship: {programme['relationship']}
Website: {programme.get('website', 'unknown')}

Invitation message, verbatim:
\"\"\"{message}\"\"\"

Existing site-fit research on file (may be brief):
{research_excerpt}

Write a concise assessment in markdown with these sections:
## What's actually being offered
Plain-English summary of the pitch, separating firm commitments from vague marketing language.
## Standard vs. unusual
Is anything in this pitch unusual for an Awin ISP programme (pricing claims, urgency language, \
guarantees), compared to how affiliate invitations normally read?
## Questions to ask before accepting
Specific questions to send back — commission rate, cookie window, validation/payment terms, \
promotional method restrictions, exclusivity, minimum traffic requirements.
## Recommendation
Accept, accept-with-questions-first, or decline — and why, given BroadbandPicker's audience.
Keep it to around 250-350 words."""

    print("Asking Claude to analyse the invitation (this can take up to a couple of minutes) ...")
    analysis = call_claude(prompt)

    out_path = d / "invitation-analysis.md"
    out_path.write_text(
        f"# {programme['advertiser']} — invitation analysis\n\n"
        f"_Generated {_today()}_\n\n"
        f"{analysis}\n"
    )
    append_log(slug, "Invitation message analysed by Claude.")
    print(f"Written to {out_path}")
    print(f"Terms folder ready at {terms_folder} — drop the advertiser's T&Cs there, then run "
          f"`analyse-terms --advertiser {slug}`.")


def _extract_text_from_file(path: Path, max_chars: int = 8000) -> str:
    suffix = path.suffix.lower()
    if suffix in (".txt", ".md"):
        text = path.read_text(errors="ignore")
    elif suffix == ".pdf":
        import pdfplumber
        parts = []
        with pdfplumber.open(path) as pdf:
            for page in pdf.pages:
                parts.append(page.extract_text() or "")
        text = "\n".join(parts)
    elif suffix == ".docx":
        import docx
        doc = docx.Document(str(path))
        text = "\n".join(p.text for p in doc.paragraphs)
    else:
        return ""
    return re.sub(r"\s+", " ", text).strip()[:max_chars]


def analyse_terms(slug: str) -> None:
    d = advertiser_dir(slug)
    programme_path = d / "programme.json"
    if not programme_path.exists():
        print(f"No programme.json for '{slug}'. Run `sync` or `add-invitation` first.", file=sys.stderr)
        sys.exit(1)
    programme = json.loads(programme_path.read_text())

    folder = terms_dir(slug)
    files = [f for f in sorted(folder.iterdir()) if f.is_file() and f.suffix.lower() in (".pdf", ".docx", ".txt", ".md") and f.name != "README.md"]
    if not files:
        print(
            f"No terms files found in {folder}. Drop the advertiser's T&Cs there (PDF, DOCX, TXT or MD) "
            "and run this again.",
            file=sys.stderr,
        )
        sys.exit(1)

    print(f"Reading {len(files)} file(s) from {folder} ...")
    combined = []
    for f in files:
        text = _extract_text_from_file(f)
        if text:
            combined.append(f"--- {f.name} ---\n{text}")
        else:
            print(f"  (skipped {f.name}: unreadable or empty)")
    if not combined:
        print("Could not extract text from any file in the terms folder.", file=sys.stderr)
        sys.exit(1)
    document_text = "\n\n".join(combined)[:12000]

    invitation_message = programme.get("invitation_message") or "(none on file)"

    prompt = f"""You are BroadbandPicker's Awin affiliate partnerships assistant, reviewing an \
advertiser's actual terms & conditions document before accepting their Awin programme invitation.

Advertiser: {programme['advertiser']}
Original invitation message: \"\"\"{invitation_message}\"\"\"

Terms & conditions document text (extracted from {len(files)} file(s), may be truncated):
{document_text}

Write a structured breakdown in markdown with these sections:
## Commission structure
Rate, model (per-sale/per-lead/per-connection), and any tiers.
## Cookie window and validation
Attribution window and how long before commission is confirmed/paid.
## Promotional restrictions
PPC/brand-bidding rules, voucher/cashback restrictions, email marketing rules, any channels banned.
## Exclusivity or minimum-performance clauses
Anything requiring exclusivity, minimum traffic, or minimum sales.
## Does this match the invitation?
Call out anything the invitation promised (e.g. specific pricing, "no hikes", conversion claims) \
that the terms don't confirm, contradict, or leave vague.
## Red flags
Anything an experienced affiliate manager would flag before signing.
## Recommendation
Accept, accept-with-changes-requested, or decline, and why.
Be specific and quote the terms where useful. Keep it under 500 words."""

    print("Asking Claude to review the terms (this can take up to a couple of minutes) ...")
    assessment = call_claude(prompt, timeout=240)

    out_path = d / "terms-assessment.md"
    out_path.write_text(
        f"# {programme['advertiser']} — terms & conditions assessment\n\n"
        f"_Generated {_today()} from {len(files)} file(s) in {folder.relative_to(ROOT)}_\n\n"
        f"{assessment}\n"
    )
    append_log(slug, f"Terms & conditions assessed from {len(files)} uploaded file(s).")
    print(f"Written to {out_path}")


def briefing() -> None:
    if not ADVERTISERS_DIR.exists() or not any(ADVERTISERS_DIR.iterdir()):
        print("No advertiser folders yet. Run `python3 scripts/awin_sync.py sync` first.", file=sys.stderr)
        sys.exit(1)

    entries: list[dict[str, Any]] = []
    for d in sorted(ADVERTISERS_DIR.iterdir()):
        programme_path = d / "programme.json"
        if not programme_path.exists():
            continue
        programme = json.loads(programme_path.read_text())
        research_path = d / "research.md"
        if research_path.exists():
            programme["research_excerpt"] = research_path.read_text()[:1500]
        entries.append(programme)

    prompt = f"""You are the Awin affiliate partnerships assistant for BroadbandPicker.co.uk, a UK \
broadband comparison site earning affiliate revenue through the Awin network. Below is the current \
status of every advertiser programme on the account, pulled live from the Awin API, plus any \
research notes already on file.

Write a prioritised action briefing in markdown with three sections:

## P0 — Activate joined programmes
For each Joined programme: the single most valuable next action to actually start earning from it \
(e.g. verify the tracking link, feature it on a relevant page, check it's not already live and \
under-promoted).

## P1 — Follow up on pending applications
Order these by how likely and how valuable a follow-up is. Say what evidence or angle to lead with.

## P2 — Selective, evidence-led reapplications
For Rejected/Suspended programmes: which ones are worth reapplying to, and what would need to be \
true (traffic, content, compliance) before doing so. Do not recommend bulk reapplying.

Be specific to each named advertiser — no generic filler. Reference the live_url field when \
recommending where to feature a programme.

Advertiser data:
{json.dumps(entries, indent=2)}
"""

    print("Asking Claude to draft the briefing (this can take up to a couple of minutes) ...")
    text = call_claude(prompt, timeout=240)

    REPORTS_DIR.mkdir(parents=True, exist_ok=True)
    out_path = REPORTS_DIR / "latest-briefing.md"
    out_path.write_text(f"# Awin partnerships briefing\n\n_Generated {_today()}_\n\n{text}\n")
    print(f"Written to {out_path}")


def list_invitations() -> None:
    """Print every advertiser still flagged as a possible new invitation."""
    if not ADVERTISERS_DIR.exists():
        print("No advertiser folders yet. Run `python3 scripts/awin_sync.py sync` first.", file=sys.stderr)
        sys.exit(1)
    found = False
    for d in sorted(ADVERTISERS_DIR.iterdir()):
        programme_path = d / "programme.json"
        if not programme_path.exists():
            continue
        data = json.loads(programme_path.read_text())
        flagged = data.get("possible_invitation_flagged_on")
        if flagged:
            found = True
            print(f"  [{d.name}] {data['advertiser']} — {data['relationship']} — flagged {flagged}")
    if not found:
        print("No possible new invitations currently flagged.")
    else:
        print(
            "\nConfirm each one in the Awin dashboard's Programmes > Invitations tab, then clear it with:\n"
            "  python3 scripts/awin_sync.py mark-reviewed --advertiser <slug>"
        )


def mark_reviewed(slug: str) -> None:
    programme_path = advertiser_dir(slug) / "programme.json"
    if not programme_path.exists():
        print(f"No programme.json for '{slug}'.", file=sys.stderr)
        sys.exit(1)
    data = json.loads(programme_path.read_text())
    if not data.get("possible_invitation_flagged_on"):
        print(f"'{slug}' has no possible-invitation flag to clear.")
        return
    data.pop("possible_invitation_flagged_on")
    programme_path.write_text(json.dumps(data, indent=2))
    append_log(slug, "Possible-invitation flag cleared after manual review in the Awin dashboard.")
    print(f"Cleared invitation flag for '{slug}'.")


def _load_playbook() -> str:
    if PLAYBOOK_PATH.exists():
        return PLAYBOOK_PATH.read_text()
    return "(No negotiation playbook on file yet — reasoning from general knowledge only.)"


def _load_advertiser_context(slug: str) -> tuple[dict, dict[str, str]]:
    """Return (programme.json data, {doc_name: contents}) for whatever exists."""
    d = advertiser_dir(slug)
    programme_path = d / "programme.json"
    if not programme_path.exists():
        print(f"No programme.json for '{slug}'. Run `sync` or `add-invitation` first.", file=sys.stderr)
        sys.exit(1)
    programme = json.loads(programme_path.read_text())
    docs = {}
    for name, filename in [
        ("research", "research.md"),
        ("invitation_analysis", "invitation-analysis.md"),
        ("terms_assessment", "terms-assessment.md"),
    ]:
        path = d / filename
        if path.exists():
            docs[name] = path.read_text()
    return programme, docs


def recommend(slug: str) -> None:
    programme, docs = _load_advertiser_context(slug)
    if not docs:
        print(
            f"No research, invitation-analysis or terms-assessment on file for '{slug}' yet — "
            "run at least one of those first so there's something to reason from.",
            file=sys.stderr,
        )
        sys.exit(1)

    playbook = _load_playbook()
    docs_text = "\n\n".join(f"### {name}\n{content}" for name, content in docs.items())

    prompt = f"""You are BroadbandPicker's Awin affiliate partnerships assistant, acting as an \
experienced affiliate manager giving a final, direct recommendation. BroadbandPicker.co.uk is a UK \
broadband comparison site.

Advertiser: {programme['advertiser']}
Relationship: {programme['relationship']}

Reference playbook (commission benchmarks and negotiation norms — use this to judge whether terms \
are good, average or poor, don't just describe them neutrally):
{playbook}

Everything gathered on this advertiser so far:
{docs_text}

Give ONE final expert recommendation in markdown:
## Verdict
One of: **Accept as-is** / **Accept with changes requested** / **Decline** / **Not enough information yet**.
## Reasoning
3-5 sentences, direct and specific, weighing audience fit against the commission/terms evidence \
gathered. Say plainly if the deal looks weak, average, or strong against the benchmark rates.
## If accepting or negotiating: exact next step
The single most important thing to do next (e.g. "reply asking for X before agreeing to anything").
## Walk-away condition
What would make this not worth pursuing at all.
Keep it under 300 words. Be decisive — this is a recommendation, not a list of options."""

    print("Asking Claude for a final recommendation (this can take up to a couple of minutes) ...")
    verdict = call_claude(prompt)

    out_path = advertiser_dir(slug) / "recommendation.md"
    out_path.write_text(f"# {programme['advertiser']} — recommendation\n\n_Generated {_today()}_\n\n{verdict}\n")
    append_log(slug, "Final accept/decline recommendation generated.")
    print(f"Written to {out_path}")


def draft_reply(slug: str, contact_name: str | None) -> None:
    programme, docs = _load_advertiser_context(slug)
    if not docs:
        print(
            f"No research, invitation-analysis or terms-assessment on file for '{slug}' yet — "
            "run at least one of those first.",
            file=sys.stderr,
        )
        sys.exit(1)

    playbook = _load_playbook()
    docs_text = "\n\n".join(f"### {name}\n{content}" for name, content in docs.items())
    invitation_message = programme.get("invitation_message", "")
    who = contact_name or "them"

    prompt = f"""You are drafting an email reply on behalf of Sahil, the owner of BroadbandPicker.co.uk \
(a UK broadband comparison site), replying to an Awin affiliate programme invitation.

Advertiser: {programme['advertiser']}
Original invitation, verbatim: \"\"\"{invitation_message}\"\"\"

Reference playbook for how to negotiate this (use its specific tactics -- don't just be politely vague):
{playbook}

Everything gathered on this advertiser so far:
{docs_text}

Write a short, professional, friendly-but-direct email reply to {who}. It should:
- Thank them for the invitation and say BroadbandPicker is genuinely interested.
- Ask for the SPECIFIC missing information identified in the research above (e.g. commission rate, \
de-duplication policy re: price comparison sites, validation/payment timeline, full T&Cs) -- name \
each one plainly, don't be vague.
- If the playbook and evidence suggest room to negotiate, make ONE concrete, reasonable ask (e.g. a \
trial at a higher rate, or an exclusive placement in exchange for better terms) -- don't over-ask on \
a brand-new relationship.
- Close with a clear next step (e.g. "once I have these details I can move quickly").
- Keep it to 120-180 words, plain English, no corporate jargon, signed "Sahil".

Output ONLY the email body (with a Subject: line first), nothing else -- no commentary, no markdown headers."""

    print("Drafting a reply (this can take up to a couple of minutes) ...")
    draft = call_claude(prompt)

    out_path = advertiser_dir(slug) / "draft-reply.md"
    out_path.write_text(
        f"# {programme['advertiser']} — draft reply\n\n"
        f"_Generated {_today()}. Review and edit before sending — this is a draft, not an auto-send._\n\n"
        f"{draft}\n"
    )
    append_log(slug, "Draft reply to advertiser generated.")
    print(f"Written to {out_path}")
    print("\nThis is a draft only — review it, then send it yourself.")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = parser.add_subparsers(dest="command")

    sub.add_parser("sync", help="Pull live status from the Awin API into Awin/advertisers/")

    p_research = sub.add_parser("research", help="Scrape an advertiser's site and draft an AI fit assessment")
    p_research.add_argument("--advertiser", required=True, help="Advertiser slug (Awin/advertisers/<slug>)")
    p_research.add_argument("--url", help="Advertiser website to scrape (required first run, unless already stored)")

    sub.add_parser("briefing", help="Generate a prioritised next-actions briefing across all advertisers")

    sub.add_parser("invitations", help="List advertisers currently flagged as possible new invitations")

    p_add_invite = sub.add_parser(
        "add-invitation",
        help="Manually log an invitation seen in Awin's Activity Stream (no API equivalent exists)",
    )
    p_add_invite.add_argument("--name", required=True, help="Advertiser name, exactly as shown in Awin")
    p_add_invite.add_argument("--advertiser-id", type=int, help="Awin advertiser ID, if known (auto-resolved if omitted)")
    p_add_invite.add_argument("--url", help="Advertiser website")
    p_add_invite.add_argument("--message", help="The invitation message text, for reference")

    p_reviewed = sub.add_parser("mark-reviewed", help="Clear the possible-invitation flag after manual review")
    p_reviewed.add_argument("--advertiser", required=True, help="Advertiser slug (Awin/advertisers/<slug>)")

    p_analyse_invite = sub.add_parser("analyse-invitation", help="AI-assess a logged invitation message; sets up a terms/ folder")
    p_analyse_invite.add_argument("--advertiser", required=True, help="Advertiser slug (Awin/advertisers/<slug>)")

    p_analyse_terms = sub.add_parser("analyse-terms", help="AI-assess T&Cs dropped into Awin/advertisers/<slug>/terms/")
    p_analyse_terms.add_argument("--advertiser", required=True, help="Advertiser slug (Awin/advertisers/<slug>)")

    p_recommend = sub.add_parser("recommend", help="Final expert accept/decline recommendation from everything on file")
    p_recommend.add_argument("--advertiser", required=True, help="Advertiser slug (Awin/advertisers/<slug>)")

    p_draft = sub.add_parser("draft-reply", help="Draft a negotiation reply email to the advertiser")
    p_draft.add_argument("--advertiser", required=True, help="Advertiser slug (Awin/advertisers/<slug>)")
    p_draft.add_argument("--contact-name", help="Name of the person who sent the invitation, if known")

    p_check = sub.add_parser("check-programmes", help="[quick look] List programmes straight from the API")
    p_check.add_argument(
        "--relationship", default="any",
        choices=["joined", "pending", "suspended", "rejected", "notjoined", "any"],
    )

    p_link = sub.add_parser("generate-link", help="Generate a tracking link for an advertiser + destination URL")
    p_link.add_argument("--advertiser-id", type=int, required=True)
    p_link.add_argument("--url", required=True)

    args = parser.parse_args()

    if args.command == "sync":
        sync()
    elif args.command == "research":
        research(args.advertiser, args.url)
    elif args.command == "briefing":
        briefing()
    elif args.command == "invitations":
        list_invitations()
    elif args.command == "add-invitation":
        add_invitation(args.name, args.advertiser_id, args.url, args.message)
    elif args.command == "analyse-invitation":
        analyse_invitation(args.advertiser)
    elif args.command == "analyse-terms":
        analyse_terms(args.advertiser)
    elif args.command == "recommend":
        recommend(args.advertiser)
    elif args.command == "draft-reply":
        draft_reply(args.advertiser, args.contact_name)
    elif args.command == "mark-reviewed":
        mark_reviewed(args.advertiser)
    elif args.command == "check-programmes":
        check_programmes(args.relationship)
    elif args.command == "generate-link":
        generate_link(args.advertiser_id, args.url)
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
