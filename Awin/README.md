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
      outreach-log.md      Dated history: when it was first found, every time
                           its status changed, every time research was refreshed.
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
3. For anything newly Pending or newly Rejected with no `research.md` yet,
   run `research --advertiser <slug> --url <their site>`.
4. `python3 scripts/awin_sync.py briefing` — get the prioritised plan.
5. `python3 scripts/build_master_tracker.py` — refresh the spreadsheet.
