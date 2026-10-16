Built `/guides/moving-house-broadband-checklist-uk` and completed the required fresh research packet.

Key findings:

- Current UK leaders were Openreach, Uswitch and official retailer home-move pages, typically checklists of about 700–1,600 words with start-early advice, provider steps and FAQs.
- No AI Overview was exposed by the fresh search interface. This limitation is recorded rather than reusing the older cached observation.
- One Touch Switch is not the house-move process. Ofcom designed it for changing provider at the current address and says it does not apply when the customer manages overlap between old and new services.
- Move fees must be sourced per retailer. Current official examples: Virgin Media from £20 (or £35 if the package changes), Sky £50 unless Sky VIP, BT generally no move fee unless a new line is needed.
- Take the provider router; leave an Openreach fibre modem or ONT at the old property.
- Local validation passed against the 1,250-word floor. Production returned HTTP 200 with Vercel headers.

Changed files:

- [data/guides.ts](data/guides.ts) adds metadata, excerpt, takeaways and verified sources.
- [app/guides/[slug]/page.tsx](app/guides/[slug]/page.tsx) adds the complete guide, timeline, decision and equipment tables, FAQs, HowTo JSON-LD and three inbound contextual links.
- [current-page-research.json](docs/page-build-pipeline/current-page-research.json) contains the fresh research gate, benchmarks, keyword map, mandatory-action evidence and review schedule.

Validation:

- Research schema and run ID: passed
- TypeScript and static generation: passed, 205 pages generated
- Pipeline `validate_page_build`: passed
- Production: `HTTP 200`, canonical and HowTo/FAQ/Article JSON-LD present
- Primary keyword, secondary coverage, benchmark terms and information-gain terms: passed
- Em-dash check: passed

GA4 annotation `properties/551202232/reportingDataAnnotations/15798980468` recorded. Reviews due 24 September, 15 October, 12 November and 16 December 2026. Local keyword mapping and master tracker mark the URL as built and live on Vercel.

No commit or push was performed.
