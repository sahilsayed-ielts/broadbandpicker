# BroadbandPicker page-build task

Read `docs/page-build-pipeline-brief.md` completely and follow it as the controlling specification.
Read `docs/page-build-pipeline/next-page.json` for the exact page, detailed keyword mapping, template route and prerequisites.
If `performance_brief` is present in the packet, treat its GSC queries, impressions, CTR and
position as the first-party optimisation brief. Do not replace those observed queries with generic
keyword-tool guesses. If it is absent, record that this is a new/no-data page and establish a
baseline during the scheduled post-publication reviews.
If `priority_evidence` and `orchestrated_ux_geo_requirements` are present, they came from the
combined GSC, GA4, content-depth and page-type SERP/UX workflow. Treat every P0/P1 requirement as
mandatory unless current live evidence proves it is already satisfied; record that validation in
the research packet. P2 requirements are evidence-backed enhancements to implement when they help
the reader's task. Do not discard these requirements during fresh page-level research.

The packet also contains `mandatory_recommended_actions`, the build gate derived from those P0/P1
requirements. Implement every action. For each one, add a matching entry to
`implemented_recommended_actions` in the research JSON with `priority`, `feature`, `disposition`
(`implemented` or `already_satisfied`), `implementation`, `evidence`, and `validation_terms`.
`validation_terms` must be a non-empty list of stable visible words, labels or facts that the
rendered-page validator can find in this page's `<main>`. An `already_satisfied` disposition still
needs current page-specific evidence and visible validation terms. Never mark an action satisfied
merely because a shared template or unrelated page contains something similar.

## 1. Keyword research and live SERP scraping (required every build, not optional)

The packet's keyword list is a starting point, not the finished research. Before writing:
- Search the primary keyword and scrape/read at least three currently ranking UK pages. Note the
  common structural pattern among the top results: roughly how long they are, how they're
  organised (heading structure, tables, FAQs), and what specific facts or numbers they lead with.
- Check whether an AI Overview / AI answer currently appears for the primary keyword. If it does,
  read what it cites and from where — that tells you what a citable answer for this specific
  keyword looks like, more reliably than any general rule.
- Build three separate same-topic benchmark sets: at least three UK organic leaders, every
  accessible page cited by the observed AI Overview (at least one is required when an AI Overview
  is present), and at least two strong non-UK pages. Select international pages for genuinely useful
  UX, information architecture, tools or citation design that the UK set does not commonly use,
  not merely because they rank in another country. Record the country and selection evidence.
- Inspect rendered page structure and responsive behaviour where access permits, not just titles
  and snippets. Compare section order, above-the-fold answer, navigation, tables/cards, decision
  support, source presentation, mobile behaviour and accessibility. If access is blocked, record
  the limitation and do not invent observations.
- Identify at least four distinct secondary/supporting queries beyond the primary term. Use close
  variants, commercial modifiers, People Also Ask questions, entity attributes and comparison
  questions that a UK reader would plausibly search. Map every query to a specific title, intro,
  H2/H3, table, body, FAQ or verdict slot before drafting. Do not create padding variants.
- Optionally run `python3 scripts/scrape_competitor_landscape.py` for a structural read on the
  established UK broadband comparison sites (word count, schema types, tool/trust signals) as
  background context — it targets general broadband hubs, not this specific keyword, so treat it
  as supporting evidence, not a substitute for the keyword-specific research above.

## 2. Content depth (match or exceed what's actually ranking, not a fixed word count)

Do not write a thin page and call it done, and do not pad a narrow topic to hit an arbitrary
length either. The right depth is whatever the keyword-research step above shows is actually
competitive for this specific query — a niche long-tail term may need 600 well-organised words; a
broad commercial term may need substantially more. Justify the depth you chose in your report with
what you saw ranking.

## 3. Scrape and research current facts

Scrape/read the relevant official provider, regulator or government pages plus trustworthy neutral
corroboration. Use at least one primary/official source and one independent or regulatory source;
commercial/provider pages normally need several of each. Record every source URL, source type,
claim supported and verification date. If sources use different populations or methodologies,
report them separately and do not combine them into a score. A conditional verdict or an explicit
"no universal winner" conclusion is valid when supported by the evidence. Never guess a winner,
trust score or statistic. Stop with a clear BLOCKED report only when the page's required factual
claims cannot be supported safely.

If prerequisites are missing, build and validate those provider entries first, using the existing interface and sibling structure. Use only a labelled text-wordmark placeholder when no official logo asset is available.

## 4. Write for search engines and generative answer engines (GEO)

Write the page copy into the existing data file or route specified by the packet. Use natural British English. Do not use em dashes. Do not mention AI, generation, prompts or this pipeline in public copy. Avoid generic filler and keyword stuffing. Put the primary keyword in the title and standalone answer-first excerpt. Cover secondary keywords naturally in the fixed template slots. Keep factual claims attributable and useful for both search engines and generative answer engines:
- Every excerpt and every FAQ answer must stand alone as a complete, specific, 35-90 word answer
  that would make sense quoted out of context by an AI Overview or chat answer — no "it depends,
  read on" filler.
- Lead sections with the concrete fact or number, not a rhetorical question.
- Keep a genuine freshness signal (a real reviewed/updated date) and visible primary sources —
  both are things the keyword-research step should confirm the ranking pages also do.
- Make important entities and relationships explicit: who provides the service, network used,
  geographic scope, price period, speed type, contract term, eligibility and verification date.
- Include concise definitions, direct answers, comparison criteria, limitations and actionable
  next steps so passages remain accurate when quoted without the surrounding page.
- Use descriptive headings, short answer-first paragraphs, useful tables/lists where the template
  supports them, internal links to relevant BroadbandPicker pages and visible citations close to
  material claims. Do not repeat a keyword merely to increase frequency.

## 4a. Write like a helpful person, not a search-optimised machine

Full detail is in Stage 4a of the brief — read it. The short version, checked before this build
ships: self-test every page against Google's own bar from "Creating helpful, reliable, people-first
content" — if search engines didn't exist, would you still write this for an actual reader? Give a
complete, specific answer to the exact question the primary keyword implies, cite where a claim
comes from, and take a real position where the evidence supports one ("we'd start with Sky here
because..." beats "it depends on your needs").

Do not use, anywhere in public copy: delve, tapestry, boast, realm, elevate, unlock, unleash,
landscape (as a market metaphor), navigate (as a metaphor), game-changer, seamless, robust, leverage
(as a verb), dive in, embark, testament to, plethora, myriad, underscore, foster, cutting-edge,
ever-evolving, "in today's digital age," "whether you're a X or a Y" as an opener, "it's important
to note," "it's worth noting," "when it comes to," "at the end of the day," a closing paragraph that
just restates the opening, a rhetorical-question opener, a rule-of-three adjective list, or a
sentence that could be pasted unchanged into any other UK broadband article. Em dashes are already
banned above.

## 5. Save the research and keyword map (mandatory validation input)

Before running the build, write `docs/page-build-pipeline/current-page-research.json` as valid JSON with:
- `slug`, `primary_keyword`, and `search_locale` (`UK`);
- `secondary_keywords`: at least four objects containing `keyword`, `intent`, `page_slot` and
  `coverage_note`;
- `serp_competitors`: at least three objects containing `url`, `title`, `observed_structure`,
  `approx_word_count`, `content_gap_to_improve`, `useful_ux_patterns`, `useful_ui_patterns`,
  `interactive_or_functional_elements`, `trust_signals` and `citation_patterns`;
- `ai_overview`: an object containing `checked`, `present`, `observation` and `cited_sources`;
- `design_benchmarks`: an object with `uk_seo_leaders` (at least three), `ai_cited_pages`,
  `international_innovators` (at least two) and `citation_access_limitation`. Every benchmark page
  must contain `url`, `title`, `country`, `selection_basis`, `seo_geo_evidence`, `observed_layout`,
  `ux_patterns`, `ui_patterns`, `transferable_pattern` and `copying_risk`. AI-cited pages must also
  identify the cited claim or passage in `citation_evidence`. When no AI Overview is present,
  `ai_cited_pages` may be empty; when one is present but its sources cannot be accessed, explain the
  specific limitation rather than fabricating a source;
- `llm_visibility_observations`: checks performed for the topic, with `platform_or_method`,
  `observation` and `limitations`. Treat these as volatile observations, not ranking guarantees;
- `layout_blueprint`: an ordered list of at least four page sections. Each needs `order`, `section`,
  `reader_task`, `component_or_pattern`, `benchmark_sources`, `mobile_behaviour`,
  `accessibility_notes` and `validation_terms`;
- `benchmark_synthesis`: `adopted_patterns` (at least three) and one `differentiated_pattern`.
  Each adopted pattern needs `pattern`, `source_urls`, `user_need`, `adaptation`, `implementation`,
  `originality_guard` and `validation_terms`. The differentiated pattern must state what is uncommon
  in the UK benchmark set, its international evidence, UK adaptation, implementation and visible
  validation terms;
- `serp_features`: an object recording whether snippets, PAA, local results, video, tools,
  comparison tables, forums and AI answers were observed, plus the page-format implication;
- `people_also_ask`: useful question strings discovered during research;
- `sources`: at least three objects containing `url`, `source_type` (`primary`, `regulator`,
  `government`, `independent` or `reviews`), `verified_date` and `claims_supported`;
- `recommended_min_words`: an integer justified by the ranking-page review, never below 900 for a
  Guide or Provider page, 800 for a Comparison page, or 600 for an Interactive tool;
- `required_sections`, `internal_links`, `schema_types`, `ux_ui_requirements`,
  `functional_requirements`, `research_summary` and `depth_rationale`.
- `content_format`: the packet format ID plus a short rationale based on intent and the SERP;
- `information_gain`: at least one original, useful asset this page adds beyond summarising the
  ranking pages. Each item needs `asset`, `evidence`, `implementation` and `validation_terms`;
- `ctr_candidates`: at least three distinct objects with `title`, `meta_description` and
  `rationale`, plus `selected_ctr_candidate` containing the chosen title and description;
- `internal_link_plan`: `inbound` and `outbound` arrays, each with at least two objects containing
  `url`, `anchor` and `reason`. Use existing, topically relevant pages and descriptive anchors;
- `schema_eligibility`: proposed schema objects containing `type`, `eligible`, `visible_evidence`
  and `reason`. Never add schema for content or offers that are not visibly present and current;
- `post_publication_review`: concrete checks for `day_7`, `day_28`, `day_56` and `day_90`, using
  GSC impressions/CTR/position and GA4 engagement, affiliate clicks and AI/LLM referrals.
- `implemented_recommended_actions`: one complete entry for every item in the packet's
  `mandatory_recommended_actions`, using the exact `priority` and `feature`, plus `disposition`,
  `implementation`, `evidence` and visible `validation_terms` as described above.

The validator will reject a missing, thin or mismatched research file and will check that the
rendered page covers the mapped secondary queries and the justified minimum depth.

## 6. Apply competitor UX, UI and functional learnings

Use the strongest useful patterns found across the UK, AI-cited and international benchmark sets,
without copying their wording, branding, visual identity or distinctive layout. Synthesize the
patterns into the documented `layout_blueprint`; do not reproduce any one source page. Implement
only patterns that improve this page's search intent and reader task,
such as answer summaries, comparison/checklist tables, eligibility flows, cost examples, decision
steps, jump navigation, warnings, source notes or an interactive control. Record every adopted
pattern in `ux_ui_requirements` or `functional_requirements`, explain which observed user need it
serves, and implement it using the site's existing design system and accessible components.

Do not claim that a competitor pattern caused a ranking or AI citation. Treat ranking, AI Overview
and LLM visibility as evidence-informed targets, never guarantees. Do not clone a competitor page,
add decorative UI without a task benefit, or invent data to populate a feature.

At least one implemented pattern must be a useful, evidence-backed idea found in the international
set but uncommon across the reviewed UK pages. Adapt it to UK terminology, regulation, factual
sources and expectations. Every adopted and differentiated pattern needs stable visible
`validation_terms`; the rendered-page gate will reject a build when those terms are absent.

## 7. Intent-led product, accessibility and measurement layer

Every future page must help the reader complete its primary task, but interactivity is not a
ranking ornament. Use the packet's content format, the observed SERP and the reader task to decide:
- If interaction materially improves the task, build a page-specific accessible control. It must
  work without an account and retain a crawlable static explanation.
- If a static table, checklist, worked example, local evidence block or answer is clearer, use
  that instead. Do not add a quiz or calculator merely to satisfy the pipeline.
- Make the complete journey responsive at mobile, tablet and desktop widths. Avoid horizontal
  page overflow; allow wide data tables to scroll inside a labelled region; keep controls usable
  on touch screens; and preserve task hierarchy when cards stack.
- Use semantic HTML and keyboard-operable controls with visible focus states, programmatic labels,
  accessible names, useful instructions and live status feedback where state changes. Never rely
  on colour alone and respect reduced-motion preferences.
- Track meaningful interaction and conversion steps through `trackEvent` from the site's analytics
  helper. Define stable snake_case GA4 event names and non-personal parameters. Interactive pages
  must track interaction start, completion and the primary CTA. Static pages need the relevant
  existing commercial CTA event and must not invent low-value events. Do not send postcodes,
  names, email addresses or other personal data to GA4.
- Route affiliate links through the shared `AffiliateCTA` component and give every CTA a stable,
  descriptive `placement`. Its Awin ClickRef taxonomy and GA4 parameters must remain aligned so
  page, placement and provider clicks can be joined to Awin transactions. Never create per-user
  ClickRefs or put postcodes, names, emails or other personal data in affiliate tracking URLs.

Add these mandatory fields to `docs/page-build-pipeline/current-page-research.json`:
- `interaction_decision`: `required`, `rationale`, `reader_task` and `static_fallback`;
- when `interaction_decision.required` is true, `interactive_comparison` must contain non-empty
  `user_task`, `choices_compared`, `crawlable_fallback` and `completion_state` values;
- `responsive_requirements`: at least three concrete checks covering mobile, tablet and desktop;
- `accessibility_requirements`: at least five concrete keyboard, semantics, labels, focus,
  state-feedback or reduced-motion checks;
- `ga4_events`: complete objects with `name`, `trigger`, `parameters` and `conversion_role`; at
  least three for interactive pages and at least one meaningful CTA event for static pages.

The outer runner owns production release. A normal build must pass local validation, deploy with
`vercel --prod --yes`, verify the live route is served by Vercel, regenerate both trackers,
synchronise the existing Google Sheet, mark the page built/live and calculate the next priority.
Do not mark a page complete before all of those steps succeed.

Do not commit, push or deploy. Run the relevant deterministic validation, including `npm run build`, and report exactly which files changed, the keyword research findings (what's currently ranking, what depth/structure you matched and why, whether an AI Overview was present), sources used, unresolved factual questions and validation results.
