Built `/research/broadband-customer-service-rankings-uk` without committing, pushing or deploying.

Key findings:

- Plusnet is the evidence-backed starting choice among major providers.
- Ofcom Q4 2025: Plusnet and Virgin Media jointly lowest at 5 complaints per 100,000; Sky recorded 6.
- Ofcom 2024 research: Plusnet achieved 91% overall satisfaction and 65% complaint-handling satisfaction.
- Smaller providers remain separate because Ofcom does not publish comparable figures for all ISPs. Which?’s January 2026 survey placed Zen first.
- No AI Overview was exposed for the exact UK query during the live check.
- Ranking pages generally run about 1,400–3,200 words and use verdict summaries, comparison tables, methodology, FAQs and postcode actions. The finished page renders approximately 2,258 main-content words against the justified 1,500-word minimum.

Sources included Ofcom’s complaints report, Comparing Customer Service report and research hub, Which?’s 2026 survey, and Plusnet’s official complaints code.

Files changed for this task:

- [page.tsx](/Users/sahilrafiqsayed/broadbandpicker/app/research/broadband-customer-service-rankings-uk/page.tsx)
- [priority-pages.ts](/Users/sahilrafiqsayed/broadbandpicker/data/priority-pages.ts)
- [PrioritySeoPage.tsx](/Users/sahilrafiqsayed/broadbandpicker/components/PrioritySeoPage.tsx)
- [how-we-review-broadband/page.tsx](/Users/sahilrafiqsayed/broadbandpicker/app/how-we-review-broadband/page.tsx)
- [current-page-research.json](/Users/sahilrafiqsayed/broadbandpicker/docs/page-build-pipeline/current-page-research.json)

Validation:

- Research JSON and packet matching: passed
- All 7 mapped secondary queries covered
- Em-dash check: passed
- Production build: passed using Next.js’s supported webpack builder after Turbopack’s sandbox worker-port failure
- TypeScript and 170-page static generation: passed
- New route: HTTP 200
- Correct title and ordered H1/H2 structure: passed
- Structured data present: passed
- Sitemap inclusion: passed
- `git diff --check`: passed

Unresolved factual point: a ranking competitor reports newer Q1 2026 complaints figures, but the official Ofcom page available during verification exposed Q4 2025 as its latest supported release. The page therefore uses Q4 2025 rather than repeating the independently reported newer numbers. Existing unrelated worktree changes were left untouched.