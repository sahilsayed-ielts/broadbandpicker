# Evidence-led page priority and build workflow

## One command, one next priority

Use `npm run priority:next` whenever the question is "what is the next priority?". The command
refreshes the evidence sources, rebuilds the tracker and writes one canonical decision to:

- `docs/page-build-pipeline/canonical-next-priority.json`
- `docs/page-build-pipeline/canonical-next-priority.md`

It reuses the newest SerpApi cache by default, so an ordinary priority refresh does not spend
search credits. Use `npm run priority:next:fresh-serp` only when fresh Google UK results and AI
Overview evidence are required. The fresh command records the number of searches used.

## How the scripts work together

1. `analyze_page_type_ux.py` starts with live GSC and GA4 performance, identifies the page types
   already earning visibility, tests their real queries in Google UK, measures AI Overview
   citations, benchmarks ranking competitors and produces page-type UX/GEO requirements.
2. `generate_weekly_seo_intelligence.py` compares the latest complete 28 days with the preceding
   28 days. It identifies impression growth, CTR opportunities, ranking position, engagement,
   affiliate activity and AI/LLM referrals. Its freshness logic suppresses pages recently handled
   by the current pipeline.
3. `analyze_content_priority.py` crawls live provider, comparison and guide pages. It compares
   existing-page depth, answer-first copy, schema and reviewed dates with keyword-mapped new-page
   opportunities and real Search Console AI-feature evidence where available.
4. `build_master_tracker.py` regenerates the master, pending, page/content, weekly SEO and UX/GEO
   worksheets. The `UX & GEO Findings` worksheet is generated from the latest page-type scan.
5. `run_priority_workflow.py` deduplicates the candidates and applies one deterministic order:
   eligible GSC/GA4 opportunities; audited content refreshes; mapped new-page gaps; then remaining
   tracker page builds. A page annotated as changed during the previous 28 days is held for
   measurement instead of being immediately rewritten again.
6. The selected page inherits every matching P0/P1 page-type requirement from the UX/GEO scan.
   These requirements are saved beside the URL, score, observed queries and reason for selection.
7. `build_keyword_mapping.py` reads that canonical decision when it prepares the same URL. It adds
   the first-party priority evidence and page-type requirements to `next-page.json`, then requires
   fresh page-level keyword mapping, SERP research, official evidence and competitor UX analysis.
   Each new page and each existing-page update gets a unique research run ID; validation rejects
   stale or reused research, incomplete UK/international benchmarking, and research older than 24
   hours before compilation or deployment.
8. The page pipeline writes or improves the page, validates copy and functionality, deploys to
   Vercel production, verifies the live URL, updates the trackers, creates a GA4 content annotation,
   records the matching GSC baseline and schedules 7, 28, 56 and 90-day reviews.

## Commands

| Command | Purpose | External cost/change |
|---|---|---|
| `npm run priority:next` | Refresh evidence and present one canonical priority | Live GSC/GA4 and web reads; cached SERP data |
| `npm run priority:next:fresh-serp` | Same decision with fresh Google UK/AI Overview results | Uses SerpApi credits |
| `python3 scripts/run_priority_workflow.py --skip-refresh` | Recalculate from existing output files | No network analysis |
| `npm run priority:build` | Refresh, select, research, build, deploy and measure the winner | Production deployment and tracker updates |

`priority:next` never builds or deploys. `priority:build` is the explicit production action.

## Decision and measurement rules

- Real first-party GSC and GA4 evidence takes precedence over generic search-volume estimates.
- A high-impression, low-CTR or near-page-one page is eligible only when the recommendation is
  actionable and the page is outside its post-release measurement window.
- Page-type benchmarks guide how the selected page is improved; they do not prove that any single
  competitor feature caused rankings or AI citations.
- P0 and P1 UX/GEO findings must be implemented or explicitly verified as already satisfied.
- Titles, offers, schema and visible claims must agree and must use current UK evidence.
- The workflow makes no promise of position one, AI Overview inclusion or LLM citation.
- After release, decisions are evaluated against the saved pre-change baseline rather than raw
  sitewide movement, which can be distorted by newly indexed pages.

## Expected response to "what is next?"

Report the exact title and live target URL from `canonical-next-priority.json`, the source and score
that selected it, the measurable reason, whether any recent page was suppressed, and the P0/P1
page-type requirements that the build must satisfy. Do not choose a different row manually unless
the canonical item is blocked by a documented dependency.
