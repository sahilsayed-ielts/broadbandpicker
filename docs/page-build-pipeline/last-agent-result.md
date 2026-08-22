Implemented the new guide at `/guides/no-credit-check-broadband-uk`.

Files changed:

- [app/guides/[slug]/page.tsx](/Users/sahilrafiqsayed/broadbandpicker/app/guides/[slug]/page.tsx:2907)
- [data/guides.ts](/Users/sahilrafiqsayed/broadbandpicker/data/guides.ts:853)
- [current-page-research.json](/Users/sahilrafiqsayed/broadbandpicker/docs/page-build-pipeline/current-page-research.json)

Research findings:

- Reviewed current ranking pages from [MoneySavingExpert](https://www.moneysavingexpert.com/compare-broadband-deals/bad-credit-broadband/), [Choose](https://www.choose.co.uk/broadband/guide/broadband-no-credit-check/) and [Broadband Genie](https://www.broadband.co.uk/broadband/no-credit-check).
- Ranking content was approximately 1,400–2,500 words, commonly using an answer summary, provider/options tables, postcode comparison, social-tariff alternatives, credit-check definitions, FAQs and visible update signals.
- The finished page contains approximately 1,961 visible words, exceeding the research-backed 1,600-word minimum.
- Six supporting queries were mapped, including broadband for bad credit, providers without credit checks, prepaid broadband, social tariffs, CCJs and whether broadband checks affect credit scores.
- No AI Overview was exposed on the search surface used for the UK query.

Primary evidence includes [Ofcom’s current social-tariff list](https://www.ofcom.org.uk/phones-and-broadband/saving-money/social-tariffs), [Vodafone’s prepaid no-check guidance](https://www.vodafone.co.uk/privacy/credit-checks), [Experian’s hard and soft search definitions](https://www.experian.co.uk/consumer/guides/searches-and-credit-checks.html) and [GOV.UK affordability support](https://www.gov.uk/cost-of-living/bills-housing-health).

Validation:

- Research JSON validity: passed
- Pipeline research validator: passed, 1,600-word minimum accepted
- `npm run build`: passed, 160 routes prerendered
- Local route: HTTP 200
- Correct title, H1 and H2 order: passed
- JSON-LD: Article, FAQPage and BreadcrumbList present
- Visible `undefined`/`NaN`: none
- `git diff --check`: passed

Unresolved factual issue: current independent sources conflict over NOW Broadband’s credit-check policy. The page reports that disagreement explicitly and does not present NOW as a confirmed no-check provider. Provider policies should be rechecked before application.

I did not rerun the workbook reconciliation because the workbook and pipeline files already contained unrelated uncommitted changes before this build. No commit, push or deployment was performed.