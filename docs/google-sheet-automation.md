# Google Sheet automation

The SEO/GEO research job updates the native Google Sheet with ID
`19zz-7Zy1k1tED4MqpMNv2msx0JvNpbE_hyfTymu5GZc`.

Live plan: https://docs.google.com/spreadsheets/d/19zz-7Zy1k1tED4MqpMNv2msx0JvNpbE_hyfTymu5GZc/edit

## One-time credential setup

1. Create a Google Cloud service account and enable the Google Sheets API.
2. Create a JSON key for that service account.
3. Share the live spreadsheet with the JSON key's `client_email` as an Editor.
4. In GitHub repository settings, add the complete JSON key as the Actions secret
   `GOOGLE_SERVICE_ACCOUNT_JSON`.

The original Drive file was an Excel workbook and cannot be edited through the
Google Sheets API. Automation therefore targets the converted native Sheet above.

Do not commit the JSON key to the repository.

## Runs

The GitHub Actions workflow `.github/workflows/seo-geo-sheet-refresh.yml` runs after
site-building changes are pushed to `main`, every Monday at 05:15 UTC, and on manual
request. The script crawls current UK sources, rebuilds the workbook, creates missing
tracker tabs, upserts rows using stable URL keys, preserves manual columns and
formatting, and appends the outcome to `Automation Log`.

For a local authenticated run:

```bash
export GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/to/service-account.json
python3 scripts/build_uk_broadband_seo_plan.py --sync-google-sheet
```

The sync updates the Build Status, landing-page inventory, live-page crawl,
technical audit and research evidence using stable keys. Run it after a material
site release; the scheduled workflow also reconciles the plan every Monday.
