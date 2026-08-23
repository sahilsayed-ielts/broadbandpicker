Implemented `/providers/shell-energy` as a retired-provider archive and migration guide.

Key findings:

- Shell Energy Broadband stopped accepting new customers in 2024.
- Around 500,000 broadband and home-phone accounts moved to TalkTalk.
- Several ranking “2026 review” pages still display obsolete Shell deals.
- Ranking pages were approximately 1,300 to 2,000 words, commonly using package tables, speed/router sections, pros and cons, comparisons and FAQs.
- The finished page contains 3,121 visible words, exceeding the research-backed 1,500-word minimum.
- No AI Overview was exposed by the accessible UK search interface. This limitation is recorded in the research file.

Sources included the [official Octopus sale announcement](https://octopus.energy/press/Octopus-Energy-Shell-Energy-Broadband/), [MoneySavingExpert migration report](https://www.moneysavingexpert.com/news/2024/02/shell-energy-broadband-sold-talktalk/), [Ofcom enforcement decision](https://www.ofcom.org.uk/phones-and-broadband/switching-provider/shell-energy-fined-customer-contracts-deals), [Ofcom historical complaints data](https://www.ofcom.org.uk/phones-and-broadband/service-quality/most-complained-about-telecoms-and-pay-tv-providers), and [Ofcom switching guidance](https://www.ofcom.org.uk/phones-and-broadband/switching-provider/switching-broadband-provider).

Files changed:

- [data/providers.ts](/Users/sahilrafiqsayed/broadbandpicker/data/providers.ts:1226)
- [provider template](/Users/sahilrafiqsayed/broadbandpicker/app/providers/[slug]/page.tsx:204)
- [provider hub](/Users/sahilrafiqsayed/broadbandpicker/app/providers/page.tsx:66)
- [guide template](/Users/sahilrafiqsayed/broadbandpicker/app/guides/[slug]/page.tsx:3868)
- [research JSON](/Users/sahilrafiqsayed/broadbandpicker/docs/page-build-pipeline/current-page-research.json)
- [Shell Energy placeholder wordmark](/Users/sahilrafiqsayed/broadbandpicker/public/logos/shell-energy.svg)

Validation:

- Research validator: passed, with 6 secondary queries, 3 competitors and 6 sources.
- TypeScript: passed.
- `git diff --check`: passed.
- Default Turbopack build: blocked by the managed runner’s CSS worker port restriction.
- `npm run build -- --webpack`: passed, generating all 169 static pages.
- Local route: HTTP 200.
- Title and H1/H2 structure: passed.
- JSON-LD: 3 blocks.
- SVG: HTTP 200, `image/svg+xml`.
- Public page contains no em dash.
- Retired providers are excluded from top-deal calculations and clearly labelled on the provider hub.

No unresolved material factual claims remain. Historic prices and Ofcom figures are explicitly dated and not presented as current TalkTalk performance. The logo is clearly labelled as a text placeholder because no verified official retired-brand asset was adopted.

No commit, push, deployment or live-workbook reconciliation was performed.