Built `/guides/black-friday-broadband-deals-uk` without committing, pushing, or deploying.

Key findings:

- Ranking pages generally contain 800–1,500 editorial words plus postcode-led comparison tools, timing guidance, effective monthly cost checks, provider coverage and FAQs.
- The page exceeds the selected 1,400-word minimum.
- No AI Overview appeared in the UK SERP check on 23 August 2026.
- Confirmed 2026 offers are not yet widely published, so the page clearly labels historic examples and avoids inventing a winner or current discount.
- Black Friday 2026 is 27 November; Cyber Monday is 30 November.

Implemented:

- Answer-first verdict and freshness notice
- Sale timing and whole-contract-cost tables
- Provider, broadband-and-TV and existing-customer guidance
- Six 35–90 word standalone FAQs
- Article and FAQ schema through the existing template
- Visible citations and relevant internal links
- Three contextual inbound links from related guides
- Sitemap inclusion through the existing data-driven guide sitemap

Sources include [Ofcom’s price-rise guidance](https://www.ofcom.org.uk/phones-and-broadband/saving-money/telecoms-price-rises-what-are-your-rights), [Ofcom’s 2026 pricing report](https://www.ofcom.org.uk/siteassets/resources/documents/research-and-data/multi-sector/pricing/2025/pricing-and-consumer-engagement-report.pdf?v=412887), [BT](https://www.bt.com/black-friday), [EE](https://ee.co.uk/broadband/black-friday), [MoneySavingExpert](https://www.moneysavingexpert.com/compare-broadband-deals/black-friday-broadband-deals/) and [Broadband Genie](https://www.broadband.co.uk/broadband/black-friday).

Changed files:

- [app/guides/[slug]/page.tsx](/Users/sahilrafiqsayed/broadbandpicker/app/guides/[slug]/page.tsx)
- [data/guides.ts](/Users/sahilrafiqsayed/broadbandpicker/data/guides.ts)
- [current-page-research.json](/Users/sahilrafiqsayed/broadbandpicker/docs/page-build-pipeline/current-page-research.json)
- [broadbandpicker-keyword-mapping.xlsx](/Users/sahilrafiqsayed/broadbandpicker/docs/broadbandpicker-keyword-mapping.xlsx)

Validation:

- `npx tsc --noEmit`: passed
- Research validator: passed
- `npm run build`: Turbopack hit the known managed-runner port restriction
- Automatic `next build --webpack` fallback: passed, 168 static pages generated
- Full page pipeline validation: passed
- Local route: HTTP 200
- `git diff --check`: passed

The workbook remains “Planned — live check unavailable” because the page was intentionally not deployed. The unrelated untracked `.github/` directory was left untouched.