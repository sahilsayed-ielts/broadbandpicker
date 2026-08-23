Implemented the full rebuild of `/guides/how-to-switch-broadband-uk`.

Research findings:

- Current leaders were Which?, MoneySavingExpert and Citizens Advice.
- Common structure: answer-first summary, 3–5 switching steps, contract/exit-fee checks, comparison tools or tables, service-continuity advice and FAQs.
- Chosen depth: 1,500-word minimum. Final scoped editorial copy is 1,679 words.
- No AI Overview was exposed for the live UK primary-keyword search.
- Six supporting queries were mapped and covered, including switching duration, One Touch Switch, mid-contract switching, number retention and compensation.

Primary sources included [Ofcom switching guidance](https://www.ofcom.org.uk/phones-and-broadband/switching-provider/switching-broadband-provider), [Ofcom contract-status guidance](https://www.ofcom.org.uk/phones-and-broadband/saving-money/in-or-out), [Ofcom automatic compensation](https://www.ofcom.org.uk/phones-and-broadband/service-quality/automatic-compensation-need-know), [Openreach](https://www.openreach.com/help-and-support/one-touch-switch), Citizens Advice and MoneySavingExpert.

Changed files:

- [page.tsx](/Users/sahilrafiqsayed/broadbandpicker/app/guides/[slug]/page.tsx)
- [guides.ts](/Users/sahilrafiqsayed/broadbandpicker/data/guides.ts)
- [current-page-research.json](/Users/sahilrafiqsayed/broadbandpicker/docs/page-build-pipeline/current-page-research.json)

Validation:

- Research-packet validator: passed
- Webpack production build: passed, including TypeScript and 169 static pages
- Route: HTTP 200
- H1/title/primary keyword: passed
- FAQ answers: 57–63 words each
- JSON-LD: Article and FAQPage present
- Visible em dashes or `undefined`/`NaN`: none
- `git diff --check`: passed

The default `npm run build` hit a Turbopack environment failure because its CSS worker could not bind an internal port. The installed Next.js 16.3 documentation’s supported `--webpack` build completed successfully. Provider-specific exit-fee calculations, number portability and installation lead times remain intentionally conditional because they vary by account, address and package.

Pre-existing workbook, pipeline-script, next-page packet and `.github` worktree changes were preserved. Nothing was committed, pushed or deployed.