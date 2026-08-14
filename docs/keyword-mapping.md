# Keyword mapping

`scripts/build_keyword_mapping.py` builds a keyword-to-page mapping for
BroadbandPicker.co.uk: every live page matched to the UK broadband search terms
it should own, plus a prioritised roadmap of pages that don't exist yet.

Output: `docs/broadbandpicker-keyword-mapping.xlsx` (six tabs — Read Me, Keyword
Mapping, Current Page Inventory, Content Gap Roadmap, Cluster Summary,
Methodology). Re-run after publishing new pages so "Existing page" status and
the gap roadmap stay accurate.

```bash
pip3 install -r requirements-seo.txt
python3 scripts/build_keyword_mapping.py
```

Search volume, difficulty and CPC are a dated, directional UK estimate — the
same style as `docs/uk-broadband-seo-geo-plan.xlsx` — not Search Console or
Ads data. Priority scoring is weighted toward CPC/commercial intent because
that tracks likely Awin conversion value better than raw traffic.

## Optional: pull extra keyword ideas from a source Google Sheet

The script can read any sheet you're using for keyword research and merge in
terms it doesn't already know about (unscored, flagged for triage):

```bash
export GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/to/service-account.json
python3 scripts/build_keyword_mapping.py --source-sheet-id 1_IeyaXe1fSbXmV8Z4MdVOigMIz-cgK2h
```

The sheet must be shared with the service account's `client_email` as at
least Viewer. Use `--skip-source-sheet` to omit this step.

## Optional: publish the result as a new Google Sheet on Drive

```bash
export GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/to/service-account.json
python3 scripts/build_keyword_mapping.py \
  --create-google-doc \
  --share-with you@example.com
```

This creates a **new** spreadsheet (it does not touch the existing tracker at
`docs/google-sheet-automation.md`) and shares it with `--share-with` as
Editor. Requires the same service account as above, with the Sheets API
enabled — no advance sharing of the new file is needed, since the script
creates and shares it in one step.

## One-time credential setup (if not already done for the other script)

Follow `docs/google-sheet-automation.md`'s service-account steps. The only
addition here is: for `--source-sheet-id`, share *that* sheet with the
service account email too (it's a separate document from the SEO/GEO
tracker, so sharing one does not grant access to the other).
