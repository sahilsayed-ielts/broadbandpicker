# BroadbandPicker page-build task

Read `docs/page-build-pipeline-brief.md` completely and follow it as the controlling specification.
Read `docs/page-build-pipeline/next-page.json` for the exact page, detailed keyword mapping, template route and prerequisites.

## 1. Keyword research and live SERP scraping (required every build, not optional)

The packet's keyword list is a starting point, not the finished research. Before writing:
- Search the primary keyword and scrape/read at least three currently ranking UK pages. Note the
  common structural pattern among the top results: roughly how long they are, how they're
  organised (heading structure, tables, FAQs), and what specific facts or numbers they lead with.
- Check whether an AI Overview / AI answer currently appears for the primary keyword. If it does,
  read what it cites and from where — that tells you what a citable answer for this specific
  keyword looks like, more reliably than any general rule.
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

## 5. Save the research and keyword map (mandatory validation input)

Before running the build, write `docs/page-build-pipeline/current-page-research.json` as valid JSON with:
- `slug`, `primary_keyword`, and `search_locale` (`UK`);
- `secondary_keywords`: at least four objects containing `keyword`, `intent`, `page_slot` and
  `coverage_note`;
- `serp_competitors`: at least three objects containing `url`, `title`, `observed_structure`,
  `approx_word_count`, `content_gap_to_improve`, `useful_ux_patterns`, `useful_ui_patterns`,
  `interactive_or_functional_elements`, `trust_signals` and `citation_patterns`;
- `ai_overview`: an object containing `checked`, `present`, `observation` and `cited_sources`;
- `people_also_ask`: useful question strings discovered during research;
- `sources`: at least three objects containing `url`, `source_type` (`primary`, `regulator`,
  `government`, `independent` or `reviews`), `verified_date` and `claims_supported`;
- `recommended_min_words`: an integer justified by the ranking-page review, never below 900 for a
  Guide or Provider page, 800 for a Comparison page, or 600 for an Interactive tool;
- `required_sections`, `internal_links`, `schema_types`, `ux_ui_requirements`,
  `functional_requirements`, `research_summary` and `depth_rationale`.

The validator will reject a missing, thin or mismatched research file and will check that the
rendered page covers the mapped secondary queries and the justified minimum depth.

## 6. Apply competitor UX, UI and functional learnings

Use the strongest useful patterns found across the ranking pages, without copying their wording,
branding or layout. Implement only patterns that improve this page's search intent and reader task,
such as answer summaries, comparison/checklist tables, eligibility flows, cost examples, decision
steps, jump navigation, warnings, source notes or an interactive control. Record every adopted
pattern in `ux_ui_requirements` or `functional_requirements`, explain which observed user need it
serves, and implement it using the site's existing design system and accessible components.

Do not claim that a competitor pattern caused a ranking or AI citation. Treat ranking, AI Overview
and LLM visibility as evidence-informed targets, never guarantees. Do not clone a competitor page,
add decorative UI without a task benefit, or invent data to populate a feature.

Do not commit, push or deploy. Run the relevant deterministic validation, including `npm run build`, and report exactly which files changed, the keyword research findings (what's currently ranking, what depth/structure you matched and why, whether an AI Overview was present), sources used, unresolved factual questions and validation results.
