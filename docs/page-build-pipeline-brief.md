# Page-build pipeline brief

What actually happened, stage by stage, when `/providers/compare/hyperoptic-vs-youfibre`
went from a row in the keyword-mapping workbook to a live, deployed page —
written up as a repeatable procedure so `scripts/build_keyword_mapping.py`
(or a new script that consumes its output) can automate more of it for the
next Content Gap Roadmap row.

Today, every stage below was done by hand (WebFetch/WebSearch calls, direct
file edits, and CLI commands run one at a time). Nothing here was scripted.
This document is the spec for closing that gap.

## Strategic lens — check before every build, page or feature

Every build on this site — a content page from the roadmap or a new
interactive feature from `docs/master-build-tracker.xlsx` — should be
evaluated against the same north star: **make BroadbandPicker the site
every UK broadband provider wants in their affiliate programme**, because
it sends them qualified buyers, not just traffic. That means quality of
intent and trust signal matter more than raw page count.

Before building any new interactive tool or feature (this applies less to
routine content pages, which the Content Gap Roadmap already vets):

1. **Research whether it already exists.** Search and, where the site is
   reachable, read what the established UK comparison sites (Uswitch,
   Compare the Market, MoneySuperMarket, Which?, broadbandchoices,
   choose.co.uk, broadband.co.uk) actually ship for the same job — not just
   whether they have *a* broadband comparison, but whether they have *this
   specific* feature. `scripts/scrape_competitor_landscape.py` gives
   structural signals (tool/trust flags) for their general broadband hub
   pages; a feature-specific check needs its own targeted search.
2. **If it already exists well**, differentiate rather than clone — match
   the useful mechanics, then do the thing they don't (e.g. cite primary
   UK sources, show real Ofcom-backed numbers, avoid generic filler).
3. **If it's a genuine gap**, that's a signal worth weighting into
   priority scoring in `scripts/build_master_tracker.py` — a real gap is
   worth more than a crowded feature, independent of raw keyword volume.
4. **Plan for GEO from the start, not after.** A purely interactive,
   session-based tool (a quiz, a calculator) has nothing for a generative
   engine to cite — an AI Overview can't quote a live form result. Pair
   any such tool with static, indexable "outcome" content (the common
   answers the tool produces, written up as ordinary crawlable pages) so
   the underlying logic is citable even though the live tool isn't.

## Trigger: one row from the Content Gap Roadmap tab

Input is a single row (or a group of rows sharing a `gap_slug`) from
`docs/broadbandpicker-keyword-mapping.xlsx`:

```
gap_slug, gap_title, cluster, page_type, keywords[], combined_volume, priority_score
```

Example that kicked this off:
`gap_slug=providers/compare/hyperoptic-vs-youfibre`,
`gap_title="Hyperoptic vs YouFibre broadband: which is better in 2026?"`,
`cluster=Provider vs comparison`, `page_type=Comparison page`.

## Stage 1 — Route the gap to a template

For the standard evidence-led workflow, first run `npm run priority:next` and use the exact URL in
`docs/page-build-pipeline/canonical-next-priority.json`. The orchestration and selection rules are
documented in `docs/page-build-priority-workflow.md`. When the selected URL matches the build,
`build_keyword_mapping.py` carries its GSC/GA4 evidence and page-type UX/GEO requirements into the
page packet automatically.

`page_type` (or the `gap_slug` prefix) decides which `data/*.ts` file and
which page template owns the new content. This mapping is fixed by the
existing site architecture, not guessable per-page:

| `gap_slug` prefix | Data file | Interface (in `types/index.ts`) | Template |
|---|---|---|---|
| `providers/{slug}` | `data/providers.ts` | `Provider` | `app/providers/[slug]/page.tsx` |
| `providers/compare/{a-vs-b}` | `data/provider-comparisons.ts` | `ProviderComparison` | `app/providers/compare/[slug]/page.tsx` |
| `guides/{slug}` | `data/guides.ts` | `GuideMetadata` | `app/guides/[slug]/page.tsx` |
| `postcode/{city}` | bespoke, follow `app/postcode/london/page.tsx` | — | new static route |
| `research/{slug}` | bespoke, follow `app/research/uk-broadband-customer-satisfaction/` | — | new static route |
| `tools/{slug}` | bespoke, follow `app/speed-test/page.tsx` | — | new static route |

**Automatable**: this is a pure lookup table — a script can route on prefix
today with no judgement calls.

## Stage 1a — Shared UX/functionality components: use these, don't reinvent them

Every P0/P1 in a page packet's `orchestrated_ux_geo_requirements` (sourced from
`docs/home page UX/page-type-ux-scan.json`, keyed by the same `page_type` as
Stage 1's routing table) maps to a component that already exists. Building a
bespoke equivalent instead of importing these is a defect, not a style choice —
it re-creates the exact gap the requirement exists to close, in a
slightly-different, untested way.

| Requirement (as it appears in `recommendations[].feature`) | Component / helper | Applies to |
|---|---|---|
| Current month in title | `currentMonthYear()` from `lib/dates.ts` | `deals_hub`, `provider_deals`, any dated hub title |
| Concise answer / verdict block up top | `<CiteableAnswer>` (`components/CiteableAnswer.tsx`) | every content page; check the template doesn't already have an equivalent "quick answer" section (`PrioritySeoPage` and `/compare` do) before adding a second one |
| On-this-page jump links | `<OnThisPageNav links={[...]} />` (`components/OnThisPageNav.tsx`) — give each linked `<h2>`/`<section>` a matching `id` and `scroll-mt-24`; renders nothing under 3 links | any page with more than ~4 H2 sections (`guide`, `provider_vs`, `provider_review`, `research`) |
| Filter controls / sort / deal count | `<DealsClient allDeals={...} />` (`components/DealsClient.tsx`, wraps `StickyFilterBar` + `DealTable`) | any new page listing more than a handful of deals — do not render a bare `<DealTable>` on a new deals-listing page, use `DealsClient` so filtering and sorting come for free |
| Badges / chips (Best value, Fastest) | `DealTable` computes these automatically from the row set (cheapest/fastest/best-rated) — no extra work needed on a deals list. For a provider-vs page, this is **not** a single "Winner" badge (this site's `winner` copy is deliberately conditional, e.g. "no universal winner" — see the Guardrails section); use a `bestForA`/`bestForB`-driven "Best for: {x}" chip on each provider's snapshot card instead |
| Save / shortlist a deal | `<SaveDealButton providerSlug=... packageName=... .../>` (`components/SaveDealButton.tsx`, backed by `lib/savedDeals.ts`, localStorage only) next to any Get Deal CTA in a deal list; the button already sits inside `DealTable`, so anything built on `DealsClient`/`DealTable` gets it automatically | any new deal-listing component |
| Author / reviewed-by byline | Plain "Reviewed by BroadbandPicker editorial team" text with a real reviewed date is sufficient (matches `has_author_byline`); do not fabricate a named individual reviewer | `provider_review`, `provider_vs`, `guide`, `research` |
| FAQPage schema + visible FAQ | `<FAQAccordion items={...} />` + a matching `FAQPage` JSON-LD block (see any existing template) | most content page types |

**Automatable**: this table is static — a script can annotate a page packet
with "use component X" the same way Stage 1 annotates it with a template path.

## Stage 2 — Prerequisite check (this is what nearly blocked today's page)

Before writing the target entry, resolve every provider slug it references
against the *live* `data/providers.ts`, not the keyword-mapping snapshot —
`getProviderBySlug('youfibre')` returning `undefined` is a hard 404 via
`notFound()` in the comparison template.

- If a referenced provider doesn't exist yet: that provider becomes a
  Stage 2a sub-task (run Stages 3–6 for it first, as its own smaller page)
  before the page that depends on it can be written.
- **Automatable**: script checks `data/providers.ts` for each slug the gap
  references; if missing, it should queue that provider as a prerequisite
  task rather than fail silently or fabricate a stub.

## Stage 3 — Fact-gathering (research)

**3.0 — Keyword and SERP research, required every build.** The keyword-mapping
dataset gives a starting keyword, volume and difficulty — it is not a
substitute for checking what is actually ranking right now. Before writing:
search the primary keyword and scrape/read at least three top UK results to see their rough
depth and structure (word count ballpark, heading pattern, tables, FAQs,
what specific fact they lead with); check whether an AI Overview currently
appears for the term and, if so, what it cites and from where. Match or
exceed that depth and structure — a niche long-tail term may only need a few
hundred well-organised words; a broad commercial term may need much more.
There is no fixed target word count; the ranking pages are the target.
Optionally run `python3 scripts/scrape_competitor_landscape.py` for general
structural context on the established UK comparison sites, but treat it as
background, not a substitute for researching the specific keyword.

Every build must save `docs/page-build-pipeline/current-page-research.json`
before compilation. It records the primary keyword, at least four mapped
secondary queries, three or more current SERP competitors, People Also Ask
questions, AI Overview observations, primary and neutral sources, proposed
sections/internal links/schema and a ranking-evidence-based minimum depth.
It also records observed SERP features, the intent-led content format, three
title/meta candidates, an inbound/outbound internal-link plan, evidence-led
schema eligibility and at least one information-gain asset that is genuinely
useful beyond summarising ranking competitors. When the weekly SEO intelligence
report contains the URL, its real GSC queries, impressions, CTR and position are
the first-party optimisation brief.
The script validates this file against the current slug and rendered page;
missing research, thin mapping or insufficient secondary-query coverage stops
deployment.

The same competitor review must record useful content, UX, UI, functional,
trust and citation patterns for each ranking page. Adopt the strongest
task-relevant patterns through BroadbandPicker's own accessible design system,
without copying competitor wording or branding. Useful implementations can
include answer summaries, eligibility/checklist flows, comparison tables,
worked cost examples, jump navigation, warnings, source notes and genuinely
helpful interactive controls. Each adopted pattern must have a documented user
need and appear in `ux_ui_requirements` or `functional_requirements`; decorative
or speculative features do not count.

Rankings and AI citations are outcomes, not facts the research can attribute to
one design pattern. The pipeline targets first-page usefulness and citability
but never promises Google, AI Overview or LLM placement.

For every entity involved (each provider; each claim in a guide topic):

1. `WebFetch` the entity's own site — homepage plus a pricing/plans page if
   discoverable — for: speeds, from-price, contract lengths, setup fee,
   standout guarantees/features. Expect JS-rendered sites to 404/403 on
   guessed pricing URLs (`/pricing`, `/plans-and-pricing` both failed for
   YouFibre today) — the homepage fetch is more reliable than guessed
   subpages.
2. `WebSearch` for the live Trustpilot score and review count. Direct
   `WebFetch` of trustpilot.com returned 403 both times today — treat that
   as the expected outcome, not an error to retry, and go straight to
   `WebSearch`.
3. `WebSearch` a neutral query against comparison aggregators (Uswitch,
   fasterbroadband, choose.co.uk, etc.) to corroborate pricing/plan details
   the brand's own site didn't surface. These sites are more likely to have
   current promo tables in indexable HTML than the brand site itself.
4. When sources disagree (today: YouFibre's Trustpilot score ranged 4.6–4.7
   across sources, plus a mixed-recent-reviews signal after a 2025/26
   acquisition), **do not silently average and move on** — take a
   defensible estimate, and flag it explicitly in the shipped copy and in
   the handoff summary as needing reverification.
5. When a stat isn't published (YouFibre's UK coverage %), derive it from
   the closest available real figure (e.g. "500,000+ connections" or
   "3 million premises passed" ÷ ~28,000,000 UK homes) and round
   conservatively down — then flag it as an estimate, the same way.
6. Record every source URL and today's date. This must land in the page's
   `sources` field / `reviewSources`, matching the existing
   `createReviewMetadata()` pattern in `data/providers.ts` — don't invent a
   parallel citation format.
7. Map each material claim to a source in the research file. Prefer official
   providers, Ofcom and UK government sources for facts, with independent
   comparison/review evidence used as corroboration rather than silently
   replacing primary evidence.

**Automatable with a human checkpoint**: the fetch/search sequence is
scriptable end to end. The "sources disagree, don't silently average" and
"stat not published, derive conservatively" steps are judgement calls a
script should surface for confirmation rather than resolve unattended.

## Stage 4 — Map keywords onto the template's real slots

Before writing any copy, read the actual page component for the target
route (e.g. `app/providers/compare/[slug]/page.tsx`) to find its **fixed**
H1/H2/H3 structure and JSON-LD shape. Every one of these templates has a
constant heading structure — don't invent a generic blog outline.

For the comparison template specifically, the slots are:

```
title            → H1
metaTitle        → <title>
metaDescription  → meta description
excerpt          → dek under H1 (must stand alone as a 35–90 word,
                    factual, quotable answer — this is the block a
                    generative engine is most likely to lift verbatim)
winner           → H2 "Quick Verdict"
bestForA/B       → provider cards (H2 = provider name)
—                → H2 "At-a-Glance Comparison" (fully data-driven, no copy)
keyDifferences[] → H2 "Key Differences"; each .label → H3
intro[]          → H2 "How We Think About This Matchup"
verdict[]        → H2 "Final Verdict"
faqs[]           → H2 "FAQs" + FAQPage JSON-LD (each answer 35–90 words)
sources[]        → H2 "Editorial and Source Notes"
```

Place the primary/focus keyword in `title` and `excerpt`; place
secondary/supporting keywords naturally inside `keyDifferences[].detail`
and `faqs[].answer` — never in the H3 `label`s themselves.

For every template, map at least four real supporting searches across the
actual page slots. Include close variants, commercial modifiers, entity
attributes and question queries only when they match UK search intent. The
validator requires at least 60% of mapped secondary terms, and never fewer
than three, to be substantively covered in rendered copy.

**Automatable**: the slot table above is fixed per template and only needs
extracting once per template (not per page). Generating the actual sentences
per slot from the researched facts is the part that still needs a
capable writer in the loop — treat this as draft generation, not
autopublish.

## Stage 4a — Write like a helpful person, not a search-optimised machine

This is the standing copy bar for every build, checked before Stage 6. It's
built from Google's own published guidance, not a guess at what SEO
"should" mean.

**Google's actual bar (from Search Central's "Creating helpful, reliable,
people-first content" and the Search Quality Rater Guidelines' E-E-A-T
framework)**: Google explicitly asks writers to self-check "if you
removed search engines from the picture, would you still produce this for
your actual readers?" Content made primarily to attract search visits,
rather than to genuinely help a person, is what the guidance targets —
regardless of whether a human or a tool wrote it. The bar per page:

- Give a complete, substantive answer to the exact question the primary
  keyword implies — not a scene-setting paragraph before the real answer.
- Add something a reader couldn't get from a five-second glance at a
  results page: a specific number, a named trade-off, a concrete "we'd
  pick X because Y," not a restatement of the question.
- Show the working, not just the conclusion — cite the specific Ofcom
  page, provider source or dataset a claim comes from (this is also what
  Stage 3 already requires; the two reinforce each other).
- Read like it was written by someone who has actually compared these
  providers, not summarised what other sites say about them.
- Keep the title honest — it should promise exactly what the page
  delivers, no more.

**Write like a person explaining this to someone who just asked them
directly** — specific and opinionated where the evidence supports it,
not hedged into meaninglessness. "We'd start with Sky here because it's
consistently the cheaper entry price with no setup fee" beats "it depends
on your needs and there are many factors to consider."

**Do not use these — they are the most common tells of AI-generated
copy, and Google's own reviewers are trained to recognise the pattern of
writing optimised for search rather than for a reader**:

- Vocabulary to avoid entirely: *delve, tapestry, boast, realm, elevate,
  unlock, unleash, landscape (as a metaphor for a market), navigate (as a
  metaphor), game-changer, seamless, robust, leverage (as a verb), dive
  in, embark, testament to, plethora, myriad, underscore, foster,
  cutting-edge, ever-evolving, in today's digital age, whether you're a
  X or a Y* (as a sentence opener).
- Phrases to avoid: "it's important to note that," "it's worth noting,"
  "when it comes to," "at the end of the day," "in conclusion," a closing
  paragraph that just restates the opening paragraph in different words.
- Structural tells: opening a page or section with a rhetorical question
  ("Ever wondered...?", "Looking for...?"); a rule-of-three adjective
  list ("fast, reliable, and affordable"); every section built on the
  identical sentence-length pattern; stacking two or three hedges in one
  sentence ("may potentially vary depending on a number of factors").
  Em dashes are already banned per Stage 4's instruction to the writer.
- If a sentence could be pasted into any other UK broadband article
  unchanged, it hasn't earned its place on this specific page — cut it or
  make it specific to this provider/postcode/use case.

**Automatable with a review gate**: the banned-phrase and vocabulary list
is a mechanical post-write check a script can run against the rendered
copy (flag, don't silently strip — a flagged hit still needs a human or
capable-writer rewrite, not an automated word swap). Whether a given
sentence is genuinely specific versus generic filler is a judgement call,
not a regex match.

## Stage 5 — Write the data-file entry

1. Read `types/index.ts` for the exact interface.
2. Read one existing sibling entry in the same array as a structural
   template (field order, string vs array conventions, existing helper
   functions like `createReviewMetadata()`).
3. Append the new object literal to the exported array — don't create a
   parallel array or a new file.
4. If a provider entry needs a logo and no reliable brand-asset source was
   found, create a plain text-wordmark placeholder SVG at
   `public/logos/{slug}.svg` and say explicitly that it's a placeholder
   pending the real brand mark — never fabricate a lookalike of the real
   logo.

**Automatable**: mechanical once Stage 4's sentences exist.

## Stage 5a — Update internal linking and the homepage

A new page or tool is only as useful as the paths that lead to it. Before
validation:

1. **Always add contextual internal links** from 2-4 existing pages whose
   topic genuinely relates to the new one (e.g. a new tool gets linked from
   the guides its use cases match; a new guide gets linked from its parent
   category and any close sibling guides). Link both directions where it
   makes sense — the new page should link back out too.
2. **Add to primary navigation and/or footer** when the build is a
   flagship tool or major new site section (the kind of thing a returning
   visitor would expect to find in the nav) — not for routine content
   pages. Nav/footer space is finite; cramming every guide into it dilutes
   the signal for the ones that matter and hurts the UX it's meant to
   serve.
3. **Update the homepage only for flagship builds**, the same bar as (2) —
   a new interactive tool or a major feature earns a homepage section; a
   single new guide or provider page does not. The homepage's own topical
   focus and load time are worth protecting.
4. **Add the new URL to `app/sitemap.ts`** so it's discoverable — this
   applies to every build, routine or flagship, unlike (2) and (3).

**Automatable with a judgement call**: step 4 and finding topically-related
pages for step 1 are mechanical (grep existing content for the new page's
keywords/cluster). Steps 2-3 — is this build flagship enough to earn nav or
homepage space — is exactly the kind of call the Strategic Lens section
above exists for; a script should surface it for confirmation rather than
decide unattended.

## Stage 6 — Local validation before anything ships

1. `npm run build` — must complete clean (TypeScript + every static/SSG
   route, including the new one via `generateStaticParams`).
2. `npm run start -- -p <port>` locally, then for every new route:
   `curl -s -o /dev/null -w "%{http_code}"` → must be `200`.
3. Grep the rendered HTML for: the expected H1 text, every expected H2 in
   order, the `<title>`, the right count of `application/ld+json` script
   tags, and the literal keyword. Ignore Next.js's internal `$undefined`
   RSC-payload markers — those are normal serialization, not a bug; only
   flag bare `undefined`/`NaN` inside visible text content.
4. Confirm any new static asset (e.g. a logo SVG) is served with the right
   content-type.

**Automatable in full** — this whole stage is deterministic pass/fail and
should gate everything after it.

### Intent-led experience and measurement gate for every future page

No future page is allowed to be generic copy. Before Stage 6 can pass, it must include:

1. **A task-appropriate decision aid.** Build interactive comparison functionality only where it
   materially improves the reader's task. A sourced local evidence block, static comparison table,
   checklist or worked example is preferable when interaction would be decorative. Interactive
   experiences retain a useful crawlable explanation for search and answer engines.
2. **Responsive UX** verified at mobile, tablet and desktop widths. Controls remain touch-friendly,
   stacked content keeps its hierarchy and wide tables scroll inside a labelled region rather than
   causing page-level overflow.
3. **Accessibility controls** using semantic HTML, keyboard operation, programmatic labels,
   visible focus, non-colour state cues, status announcements where appropriate and reduced-motion
   handling. The comparison journey must be completable without a mouse.
4. **GA4 event tracking** through the site's analytics helper. Interactive pages use at least three
   stable snake_case events covering interaction start, completion and the main conversion CTA.
   Static pages retain the meaningful commercial CTA event and do not invent low-value events.
   Parameters must not contain postcodes or other personal information.
5. **Affiliate attribution** through the shared `AffiliateCTA` component. Every commercial CTA
   supplies a stable, descriptive `placement` value. The component adds Awin campaign and ClickRef
   fields for placement, source page, provider, content type, CTA label and tracking-schema version,
   and sends the same non-personal dimensions with `outbound_provider_click` in GA4. Never create
   per-user ClickRefs, place postcodes in affiliate URLs or hand-edit an Awin tracking URL in a page.
   Use `python3 scripts/awin_sync.py generate-link` for new advertiser links and
   `npm run awin:performance` for the page/placement/provider conversion report.

The research packet documents these under `interaction_decision`, optional
`interactive_comparison`, `responsive_requirements`, `accessibility_requirements` and `ga4_events`.
The script rejects a page whose research packet omits any applicable requirement.

## Stage 7 — Reconcile the keyword-mapping workbook

Re-run `python3 scripts/build_keyword_mapping.py` so the shipped
`gap_slug` row flips from "Content gap" to "Existing page" and the
roadmap's priority ordering stays accurate for the next page. **This is
the step most likely to be forgotten by hand — a script should chain it
automatically after a successful Stage 6.**

## Stage 8 — Ship

1. `git status --short`, scan for anything that shouldn't be staged
   (`.env*`, credentials, keys) before adding broadly.
2. Commit with a message naming the concrete page and its data sources.
3. `git push origin main`. **Known failure mode hit today**: if the token
   lacks the `workflow` scope, any push touching
   `.github/workflows/*.yml` is rejected outright — including unrelated
   files in the same commit. A script should catch this specific rejection,
   unstage/untrack just the workflow file, retry the push, and flag the
   scope problem separately rather than blocking the whole deploy.
4. `vercel --prod --yes`.
5. `curl` the live production URL(s) and re-check H1/status code, the same
   way as Stage 6 but against the real domain.
6. Regenerate both tracker workbooks, synchronise the existing Google Sheet, mark the exact route
   built/live only after production verification, apply completed-page formatting and prepare the
   next active priority. A production run without the Google Sheet ID is rejected.
7. Add the verified URL to `docs/page-build-pipeline/post-publication-review-queue.json` with
   evidence checks due 7, 28, 56 and 90 days after launch. Review GSC query coverage, impressions,
   CTR and position alongside GA4 engagement, affiliate clicks and attributable AI/LLM referrals;
   do not rewrite a successful page merely because a calendar reminder fired.
8. Run `scripts/record_content_change.py` after production verification. It creates a dated GA4
   Reporting Data Annotation, captures the page's pre-release GA4 and GSC baseline in
   `docs/page-build-pipeline/content-change-measurement-log.json`, and links the change ID to the
   post-publication review queue. Search Console has no native annotation API, so this dated ledger
   is the canonical GSC change marker used for the 7, 28, 56 and 90-day comparisons.

For the standard unattended priority-ordered run, use `npm run page:build`.
The runner processes up to five pages, one at a time, and requires every
research and validation gate to pass. For each page it deploys to Vercel
production, verifies the exact live URL, checkpoints the workbook and existing
Google Sheet, then recalculates the next priority before continuing. It stops
on the first blocked or failed page, so previously completed pages remain
accurately recorded. Every verified deployment also creates the GA4 annotation
and GSC measurement baseline described above. Use `npm run page:build:all` only
for an uncapped run. To
choose another cap, invoke the Python command with `--build-all-priority
--max-priority-pages <count>`; `0` means every remaining active page.

## Guardrails — do not fully automate these

- **Never auto-publish a "verdict"/"winner" line or a trust score that
  wasn't checked against a live source this run.** If sources conflict or
  a fetch failed, the copy should stay a flagged placeholder that blocks
  publish until confirmed, not a best-guess that ships silently.
- **Never fabricate a brand logo.** Text-wordmark placeholder only, always
  labelled as such.
- **Never build a page whose prerequisite is missing.** Queue the
  prerequisite as its own task first (Stage 2).
- **Never let a `.github/workflows` push-permission failure block the rest
  of the deploy** — isolate it and keep going.
- **Always flag estimated stats (coverage %, disputed review scores)** in
  both the shipped copy and the handoff summary, with the source and date.
- **A competitor-prevalence recommendation is a prompt to solve the underlying
  problem, not a literal spec.** "Add a Winner badge" from the UX/GEO scan
  became a per-provider "Best for: {x}" chip on `providers/compare/[slug]`
  because the site's verdict copy is deliberately conditional ("no universal
  winner" is a real, common outcome) — a forced single-winner badge would
  have contradicted the page's own text. Check what the recommendation is
  actually protecting (a visual scan cue, in that case) before implementing
  it exactly as the competitor benchmark phrased it.

## Worked example: today's run, condensed

1. Trigger: `providers/compare/hyperoptic-vs-youfibre`, priority-ranked in
   the Content Gap Roadmap tab.
2. Prerequisite check failed: `youfibre` had no `Provider` entry → queued
   as a sub-task.
3. Research: fetched hyperoptic.com and youfibre.com directly; both direct
   Trustpilot fetches 403'd, so `WebSearch` was used instead and returned
   conflicting scores (4.6–4.7, "mixed since BRSK acquisition") — flagged
   rather than averaged silently; coverage % for YouFibre wasn't published,
   so it was derived from "3M premises passed" ÷ ~28M UK homes ≈ 10%,
   flagged as an estimate.
4. Read `app/providers/compare/[slug]/page.tsx` for the fixed slot
   structure before writing any copy.
5. Wrote the `youfibre` entry to `data/providers.ts`, the
   `hyperoptic-vs-youfibre` entry to `data/provider-comparisons.ts`, and a
   placeholder wordmark at `public/logos/youfibre.svg`.
6. `npm run build` passed (139→140 routes); local server confirmed 200 +
   correct H1/H2 order on both new routes.
7. Re-ran `scripts/build_keyword_mapping.py`.
8. `git push` was rejected on the `.github/workflows` file specifically
   (missing `workflow` scope on the PAT) — untracked that one file, retried,
   pushed clean; `vercel --prod --yes` deployed; production curl confirmed
   both routes live.
