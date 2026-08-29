# Awin partnerships workspace

This folder is the single source of truth for every Awin affiliate relationship
BroadbandPicker has — one folder per advertiser, kept up to date automatically
from the live Awin API, with AI-drafted research and a prioritised action plan
you can regenerate any time.

You don't need to edit anything in here by hand. Run the commands below (from
the project root) whenever you want an update.

## Folder layout

```
Awin/
  advertisers/
    <advertiser-slug>/
      programme.json      Live status: Awin ID, relationship (Joined/Pending/
                           Rejected/Suspended/Prospect), sector, matched live
                           page on the site, website URL.
      research.md          AI-drafted fit assessment (audience fit, score,
                           pitch angle, risks) — only exists once you've run
                           `research` for that advertiser.
      invitation-analysis.md   AI assessment of the invitation message itself
                           (what's offered, standard vs unusual, questions to
                           ask) — only for advertisers logged via
                           `add-invitation`.
      terms/               Drop the advertiser's actual T&Cs here (PDF, DOCX,
                           TXT or MD) once you have them.
      terms-assessment.md  AI breakdown of the uploaded T&Cs — commission,
                           cookie window, restrictions, red flags, and
                           whether they match what the invitation promised.
      recommendation.md    Final accept/decline verdict, synthesised from
                           everything above.
      draft-reply.md        A drafted (never auto-sent) reply email —
                           yours to review and send.
      outreach-log.md      Dated history: when it was first found, every time
                           its status changed, every time research was refreshed.
  playbooks/
    negotiation-playbook.md   Sourced reference on UK broadband CPA
                              benchmarks and Awin's own negotiation/
                              de-duplication rules — grounds every
                              `recommend` and `draft-reply` call.
  _snapshots/
    YYYY-MM-DD.json         Full raw Awin API pull for that day, kept as an
                            audit trail.
  reports/
    latest-briefing.md      The most recent AI-generated "what to do next"
                            plan across every advertiser.
```

## Commands

Run these with `python3 scripts/awin_sync.py <command>` from the project root.
Make sure `AWIN_API_TOKEN` is set (it already is, in `.env.local`).

**`sync`** — pull the current status of every advertiser from your real Awin
account and update `Awin/advertisers/`. Creates a folder for any new
advertiser, logs any status change (e.g. Pending -> Joined) to that
advertiser's `outreach-log.md`. Run this first, and any time you want a
refresh — it's always safe to re-run.

```
python3 scripts/awin_sync.py sync
```

**New invitations.** Awin's API has no dedicated "invitations" feed (checked
directly against the account — there's no `/invitations` endpoint). An
advertiser inviting you to their programme shows up exactly like a manual
application: a brand-new `Pending` (occasionally `Joined`) relationship.
`sync` flags every such new-or-changed relationship as a **possible new
invitation** and prints them separately, since the API can't tell the two
apart — go confirm which one it actually is in the Awin dashboard's
**Programmes > Invitations** tab.

```
python3 scripts/awin_sync.py invitations       # list what's flagged
python3 scripts/awin_sync.py mark-reviewed --advertiser <slug>   # clear it
```

**Awin's Activity Stream invitations** ("X have invited you to join their
programme") are a UI-only feature with no API at all — not even the proxy
above catches these. Log one by hand:

```
python3 scripts/awin_sync.py add-invitation \
  --name "Connect Fibre" --url https://www.connectfibre.co.uk \
  --message "paste the invitation text here"
```

The Awin advertiser ID is auto-resolved from the live catalogue if you don't
have it. This creates the advertiser's folder with relationship `Invited`,
which gets its own top-priority band in the tracker (right after your
already-joined programmes).

**`analyse-invitation --advertiser <slug>`** — asks Claude to assess the
invitation message itself: what's actually being promised vs. standard
marketing language, whether anything is unusual, and what questions to ask
before accepting. Also creates `Awin/advertisers/<slug>/terms/` for you to
drop the advertiser's actual terms & conditions into once you have them.

```
python3 scripts/awin_sync.py analyse-invitation --advertiser connect-fibre
```

**`analyse-terms --advertiser <slug>`** — once you've saved the advertiser's
T&Cs (PDF, DOCX, TXT or MD) into their `terms/` folder, this reads them and
asks Claude for a structured breakdown: commission, cookie window,
promotional restrictions, exclusivity clauses, red flags, and — importantly
— whether the terms actually match what the invitation promised. Writes
`terms-assessment.md`.

```
python3 scripts/awin_sync.py analyse-terms --advertiser connect-fibre
```

**`recommend --advertiser <slug>`** — synthesises everything on file for an
advertiser (research, invitation analysis, terms assessment) against
`Awin/playbooks/negotiation-playbook.md` — a small, sourced reference on real
UK broadband CPA benchmarks (£50–£120 typical) and Awin's own negotiation and
de-duplication rules — into one direct verdict: accept as-is, accept with
changes requested, decline, or not enough information yet. Writes
`recommendation.md`.

```
python3 scripts/awin_sync.py recommend --advertiser connect-fibre
```

**`draft-reply --advertiser <slug> [--contact-name <name>]`** — drafts an
actual reply email to the advertiser, asking for whatever's missing and
making one concrete, playbook-informed negotiating ask (e.g. a trial at a
higher rate, or an exclusive placement in exchange). This is a **draft
only** — nothing is ever sent automatically. Writes `draft-reply.md`.

```
python3 scripts/awin_sync.py draft-reply --advertiser connect-fibre --contact-name Remon
```

**`research --advertiser <slug> [--url <site>]`** — scrapes that advertiser's
own website and asks Claude to write a fit assessment against
BroadbandPicker's audience: how good a fit it is, a score out of 10, a
suggested pitch angle, and risks to watch for. Writes `research.md`. The
first time you run this for an advertiser you'll need to pass `--url`; after
that it's remembered.

```
python3 scripts/awin_sync.py research --advertiser zen-internet --url https://www.zen.co.uk
```

**`briefing`** — reads every advertiser's current status and research notes
and asks Claude to draft one prioritised plan: which joined programmes to
activate first, which pending applications to chase, and which rejected
programmes are worth a fresh, evidence-led reapplication. Writes
`reports/latest-briefing.md`.

```
python3 scripts/awin_sync.py briefing
```

**`check-programmes`** and **`generate-link`** are the original quick-look
tools: print live status straight from the API without touching this folder,
or generate a tracking link for a specific advertiser + URL.

## How this feeds the master tracker

`scripts/build_master_tracker.py` reads `Awin/advertisers/*/programme.json`
directly to build the "Awin Outreach Priority" sheet in
`docs/master-build-tracker.xlsx` — there's no separate hardcoded list to keep
in sync by hand any more. Run `sync` before regenerating the tracker if you
want the sheet to reflect the latest Awin account status.

Anything you type into the tracker spreadsheet's Status / Owner / Last
Contacted / Next Follow-up / Decision columns is preserved across
regenerations, same as before.

## A sensible weekly rhythm

1. `python3 scripts/awin_sync.py sync` — see what changed, and whether
   anything looks like a new invitation.
2. `python3 scripts/awin_sync.py invitations` — review anything flagged,
   confirm in the Awin dashboard, then `mark-reviewed` it.
3. Check Awin's Activity Stream by eye (no API for it) — for anything real,
   `add-invitation` it, then `analyse-invitation`. Once the advertiser sends
   real T&Cs, drop them in `terms/` and run `analyse-terms`. Then
   `recommend` for a final verdict and `draft-reply` to get a reply ready
   to send.
4. For anything newly Pending or newly Rejected with no `research.md` yet,
   run `research --advertiser <slug> --url <their site>`.
5. `python3 scripts/awin_sync.py briefing` — get the prioritised plan.
6. `python3 scripts/build_master_tracker.py` — refresh the spreadsheet.
