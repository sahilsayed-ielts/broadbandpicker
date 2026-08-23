Built the new guide at `/guides/broadband-complaints-and-ombudsman-uk`.

Research findings:

- Ranking pages were roughly 700 to 1,250 words and consistently used provider-first escalation, evidence checklists, deadlock guidance, ADR eligibility and FAQs.
- The guide renders approximately 1,652 relevant content words, exceeding the justified 1,500-word target.
- No AI Overview appeared for the exact UK query during the live check.
- The main freshness opportunity was correcting older eight-week guidance. Complaints first raised from 8 April 2026 normally reach ADR after six weeks, or sooner after deadlock.

Implemented:

- Answer-first complaint route.
- Escalation timeline and evidence checklist.
- Current CISAS versus Communications Ombudsman provider table.
- Deadlock and transition rules.
- ADR remedies, limitations and automatic-compensation distinction.
- Seven standalone 35–90 word FAQs.
- Contextual inbound links from three related guides.
- Article and FAQPage structured data through the existing template.

Primary sources included Ofcom’s current ADR and compensation guidance, April 2026 CISAS rules, Communications Ombudsman process guidance, CEDR/CISAS documentation and Citizens Advice.

Validation passed:

- `npm run build`: passed, 171 static pages generated.
- New route: HTTP 200.
- Correct title, H1 and H2 order confirmed.
- Three JSON-LD blocks rendered, including Article and FAQPage.
- Research validator: passed.
- Secondary-query coverage: 7/7.
- Public-copy em-dash check: passed.
- `git diff --check`: passed.

Changed files:

- [page.tsx](/Users/sahilrafiqsayed/broadbandpicker/app/guides/[slug]/page.tsx)
- [guides.ts](/Users/sahilrafiqsayed/broadbandpicker/data/guides.ts)
- [current-page-research.json](/Users/sahilrafiqsayed/broadbandpicker/docs/page-build-pipeline/current-page-research.json)

The workbook’s live reconciliation cannot legitimately mark this undeployed route as existing because deployment was explicitly excluded. I restored the workbook instead of leaving a misleading “live check unavailable” rewrite. Provider ADR membership remains a freshness-sensitive fact, so the guide tells readers to verify Ofcom’s current list. The pre-existing untracked `.github/` directory was untouched. No commit, push or deployment was performed.