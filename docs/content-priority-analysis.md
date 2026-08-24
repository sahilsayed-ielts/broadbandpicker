# Content priority analysis: build vs. update

New script: `scripts/analyze_content_priority.py`. Combines three things
that existed separately before, on one ranked list, so "build new" and
"update existing" stop being two disconnected reports:

1. Real mapped search volume, already researched in
   `docs/broadbandpicker-keyword-mapping.xlsx`.
2. **Real per-page impressions from Google Search Console's "Performance on
   Search Generative AI Features" export** (`data/GSC/`) — actual ground
   truth that a page has already been surfaced inside an AI Overview or
   similar generative feature, not a heuristic. This is weighted heavily in
   the score for exactly that reason: a thin page already earning AI-feature
   visibility is the clearest possible signal that deepening it converts
   directly into more AI-feature share, not a hoped-for outcome.
3. A live crawl of every provider/comparison/guide page for depth and
   structural GEO proxies (word count against this session's own
   established depth floors, `FAQPage` schema presence, a detectable
   answer-first paragraph, a checked/reviewed date parsed from visible
   text) — used for pages with no GSC history yet.

**Two real bugs caught and fixed before reporting any findings**: the first
run returned word counts of 15,000–17,000+ for pages that are genuinely a
few thousand words, caused by React's RSC hydration payload inside
`<script>` tags being counted as visible text (on the BT page, checked
directly, script tags were 58% of the raw HTML). And even after that fix,
every single page was falsely flagged "no answer-first paragraph," because
the `<p>` search was matching mega-menu section labels in the header before
it ever reached the main content. Both fixed by parsing the DOM with lxml,
stripping `script`/`style`, and scoping the whole audit to `<main>`;
verified directly against the BT page before re-running site-wide.

## Top pages to update, weighted by real AI-feature visibility

| Score | Page | AI-feature impr. (28d) | Volume/mo | Words | Issue |
|---|---|---|---|---|---|
| 114.0 | `/guides/best-full-fibre-broadband-uk` | **512** | 2,900 | 636 | Thin |
| 100.0 | `/guides/best-broadband-and-tv-deals` | 1,295 | 12,100 | 2,126 | None — already refreshed this session |
| 91.0 | `/guides/cheapest-broadband-uk` | 130 | 19,400 | 481 | Thin |
| 87.4 | `/guides/best-business-broadband-providers-uk` | 142 | 2,900 | 596 | Thin, no checked date |
| 72.8 | `/guides/best-phone-and-broadband-deals` | 14 | 29,600 | 457 | Thin, no checked date |
| 71.0 | `/guides/best-5g-home-broadband-uk` | 30 | 4,400 | 601 | Thin |
| 65.8 | `/providers/sky` | 4 | **172,237** | 387 | Thin |
| 65.8 | `/providers/now-broadband` | 4 | 9,320 | 386 | Thin |
| 65.0 | `/providers/youfibre` | 0 | 4,400 | 397 | Thin |
| 65.0 | `/guides/best-broadband-providers-uk` | 0 | 5,400 | 872 | Thin |
| 65.0 | `/guides/broadband-without-phone-line` | 0 | 5,800 | 770 | Thin |
| 58.2 | `/guides/satellite-broadband-uk` | 21 | 2,400 | 437 | Thin, no checked date |
| 54.0 | `/guides/broadband-moving-house` | 0 | 2,900 | 948 | Thin |
| 49.0 | `/guides/best-broadband-for-gaming-uk` | 0 | 2,400 | 836 | Thin |
| 49.0 | `/guides/broadband-social-tariffs-uk` | 0 | 2,400 | 777 | Thin |

Full 15-item list and every field saved in `docs/content-priority-analysis.json`.

**The standout finding**: `/guides/best-full-fibre-broadband-uk` earned 512
AI-feature impressions in the last 28 days (second only to the TV deals
guide's 1,295, which was already refreshed this session) while sitting at
just 636 words. It is real, current evidence that Google's generative
features are already treating this page as a source worth surfacing — it
is simply thin relative to that demand. This is now the clearest,
best-evidenced next target on the site.

**A second finding worth separating out**: `/providers/sky` carries
172,237 estimated monthly UK searches, by far the highest volume of any
page audited, but only 4 AI-feature impressions and 387 words. This is a
different kind of opportunity — huge conventional search demand with
almost no current AI-feature traction — rather than the "already working,
just needs depth" pattern the top of this list shows. Checked directly via
the Awin API: Sky does not appear in BroadbandPicker's joined, pending or
rejected programme lists at all (only "Sky ROI," which is out of scope),
so there's no record of ever applying to Sky's UK programme either.

## Top pages to build (new)

**None.** Every row in the Content Gap Roadmap tab of
`docs/broadbandpicker-keyword-mapping.xlsx` is currently marked "Built,
live and deployed on Vercel" (33 of 33). That roadmap is generated from a
curated keyword list plus the current `data/providers.ts` /
`data/provider-comparisons.ts` arrays, so it is exhausted, not empty by
coincidence. Finding genuinely new page opportunities from here needs
fresh keyword/topic discovery, a separate research exercise from this
refresh-focused audit.
