# BroadbandPicker Google AdSense Readiness Plan

Generated: 2026-08-09

**Verdict: NOT READY TO SERVE ADS**  
**Repository readiness score: 54/92 (59%)**

> This score measures source-level preparation, not AdSense approval probability. Google makes the approval decision, and traffic/indexing evidence requires manual verification.

## Executive finding

The site has a strong trust-page and editorial foundation. Do not activate AdSense yet: the current cookie banner is not a Google-certified TCF CMP, and the privacy policy states that advertising cookies are not used. Resolve consent and privacy controls, complete the manual Search Console review, then apply. Preserve affiliate conversion by limiting display ads to selected informational content.

## Audit

| Priority | Area | Control | Status | Evidence | Required action |
|---|---|---|---|---|---|
| Done | Trust | Core trust and policy pages | PASS | All seven core pages exist. | Keep ownership, contact details and policies accurate. |
| Done | Trust | Affiliate relationship disclosure | PASS | Sitewide commission wording and an editorial policy are present. | Retain disclosures close to commercial calls to action. |
| P0 | Consent | Google-certified CMP with IAB TCF | FAIL | The custom banner stores a local accepted/declined value; no TCF CMP integration is present. | Configure Google's European regulations message or another Google-certified CMP before requesting personalised ads in the UK. |
| P0 | Consent | Advertising privacy disclosures | FAIL | Privacy policy currently says advertising cookies are not used and does not describe AdSense data processing. | Before ads go live, describe Google advertising, cookies/local storage, consent choices, vendors, data use and withdrawal controls. |
| P1 | Monetisation | Authorised Digital Sellers file | READY LATER | No public/ads.txt exists; the publisher line is only available after AdSense supplies the account ID. | After account creation, add Google's exact ads.txt line and verify /ads.txt publicly. |
| Done | Content | Substantial original site structure | PASS | Detected approximately 33 guide records and 12 provider records, plus original tools and policy pages. | Manually review every indexed page for usefulness, accuracy, complete prose and a clear purpose; remove or noindex weak duplicates. |
| Done | Content | No visible placeholder or unfinished content | PASS | Detected 0 placeholder/TODO-style source references; some may be internal identifiers rather than visible copy. | Review each match and remove visible placeholders, invented deals and unfinished sections before submission. |
| Done | Technical | Crawlability and sitemap | PASS | robots.ts allows crawling and declares the XML sitemap. | Verify the production robots.txt and sitemap.xml in Search Console. |
| P1 | Technical | Canonical metadata coverage | REVIEW | Detected 21 canonical references, but runtime coverage cannot be guaranteed through static inspection. | Crawl production and confirm one indexable canonical, title, description and H1 per intended landing page. |
| P0 | Quality | Search Console and traffic quality | MANUAL | Repository source cannot prove indexing, organic traffic, manual actions or invalid traffic. | Confirm ownership, submitted sitemap, indexed pages, no manual actions/security issues, and genuine traffic sources in Search Console and Analytics. |
| P1 | UX | Controlled ad placement plan | NOT IMPLEMENTED | No AdSense implementation was detected, which is appropriate before approval. | Start with restrained in-article units on informational guides. Exclude homepage, comparison, deals, provider, postcode, tool and legal pages; avoid overlays initially. |

## Ordered implementation plan

### 1. Consent and legal

Choose Google's CMP or another certified TCF CMP; design equal accept/reject choices and a persistent privacy-choice control. Draft updated privacy/cookie disclosures, but publish them when the advertising implementation is ready so the policy remains factually accurate.

### 2. Production quality audit

Crawl every sitemap URL. Fix errors, thin/duplicative pages, unsupported claims, placeholders, broken links, missing metadata and stale prices. Ensure all pages work on mobile.

### 3. Search Console evidence

Verify domain ownership, submit the sitemap, inspect indexing, manual actions, security issues and Core Web Vitals. Record at least 28 days of genuine acquisition and landing-page data.

### 4. Apply to AdSense

Use the legal payee/entity details that match the bank and tax records. Add broadbandpicker.co.uk and complete Google's verification steps.

### 5. Authorisation

When Google provides the publisher ID, add its exact ads.txt record at /ads.txt and verify it in AdSense.

### 6. Restricted launch

Enable the certified consent flow before ad requests. Use low-density manual placements on a small set of informational guides; exclude commercial and utility pages.

### 7. Measure for 30 days

Track RPM, viewability, Core Web Vitals, bounce/engagement, affiliate click-through and affiliate earnings per session. Remove ads where total revenue or user experience declines.

## Recommended initial exclusions

- Homepage
- `/compare` and `/deals`
- `/providers/*`
- `/postcode/*`
- `/speed-test`
- Privacy, terms, contact and other trust pages

## Manual go-live gate

Do not request ads until every item below is confirmed:

- [ ] Certified TCF CMP configured and tested in the UK
- [ ] Privacy and cookie disclosures match the implemented advertising stack
- [ ] Production crawl has no material errors or unfinished pages
- [ ] Search Console shows no manual action or security issue
- [ ] Traffic is genuine and acquisition sources are understood
- [ ] AdSense account identity, address, bank and tax information are consistent
- [ ] ads.txt is installed after Google supplies the publisher record
- [ ] Initial ad page list and exclusion list are documented

## Primary Google references

- Eligibility: https://support.google.com/adsense/answer/9724
- UK/EEA certified CMP requirement: https://support.google.com/adsense/answer/13554116
- European regulations messages: https://support.google.com/adsense/answer/10961068
- Auto Ads page exclusions: https://support.google.com/adsense/answer/9262311
