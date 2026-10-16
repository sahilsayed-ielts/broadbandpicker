# BroadbandPicker Google AdSense Readiness Plan

Generated: 2026-10-13

**Verdict: NOT READY TO SERVE ADS**  
**Repository readiness score: 90/104 (87%)**

> This score measures source-level preparation, not AdSense approval probability. Google makes the approval decision, and traffic/indexing evidence requires manual verification.

## Executive finding

AdSense has already verified ownership and flagged the site for low-value content. The fix is inventory quality: do not index cloned postcode templates, keep Google ads off commercial and thin screens, disclose advertising cookies, and wait for recrawl before requesting review. A Google-certified TCF CMP is still required before personalised ads in the UK.

## Audit

| Priority | Area | Control | Status | Evidence | Required action |
|---|---|---|---|---|---|
| Done | Trust | Core trust and policy pages | PASS | All seven core pages exist. | Keep ownership, contact details and policies accurate. |
| Done | Trust | Affiliate relationship disclosure | PASS | Sitewide commission wording and an editorial policy are present. | Retain disclosures close to commercial calls to action. |
| Done | Consent | Google-certified CMP with IAB TCF | PASS | Google Funding Choices / IAB TCF CMP 300 is wired through the site consent bar. | Publish the European regulations message in AdSense Privacy & messaging, with Do not consent on, English (UK), and the privacy policy URL. |
| Done | Consent | Advertising privacy disclosures | PASS | Privacy and cookie policies describe Google ads, cookies and Ads Settings opt-out. | Keep Google's required advertising disclosures in the privacy and cookie policies, including Ads Settings opt-out. |
| Done | Monetisation | Authorised Digital Sellers file | PASS | public/ads.txt authorises Google with pub-9056289061141918. | Keep https://broadbandpicker.co.uk/ads.txt as google.com, pub-9056289061141918, DIRECT, f08c47fec0942fa0. |
| Done | Content | Substantial original site structure | PASS | Detected approximately 62 guide records and 25 provider records, plus original tools and policy pages. | Manually review every indexed page for usefulness, accuracy, complete prose and a clear purpose; remove or noindex weak duplicates. |
| P1 | Content | No visible placeholder or unfinished content | REVIEW | Detected 3 placeholder/TODO-style source references; some may be internal identifiers rather than visible copy. | Review each match and remove visible placeholders, invented deals and unfinished sections before submission. |
| Done | Technical | Crawlability and sitemap | PASS | robots.ts allows crawling and declares the XML sitemap. | Verify the production robots.txt and sitemap.xml in Search Console. |
| P1 | Technical | Canonical metadata coverage | REVIEW | Detected 97 canonical references, but runtime coverage cannot be guaranteed through static inspection. | Crawl production and confirm one indexable canonical, title, description and H1 per intended landing page. |
| P0 | Quality | Search Console and traffic quality | MANUAL | Repository source cannot prove indexing, organic traffic, manual actions or invalid traffic. | Confirm ownership, submitted sitemap, indexed pages, no manual actions/security issues, and genuine traffic sources in Search Console and Analytics. |
| Done | UX | Controlled ad placement plan | PASS | AdSense and Funding Choices load for consent; ad requests stay paused except on /guides and /research. | Keep display ads off homepage, deals, compare, provider, postcode, tool and legal pages. Leave Auto ads off or excluded on those URLs in AdSense. |
| Done | Content | No thin auto-generated landing cluster | PASS | 2818 Ofcom district records exist, but only 50 curated postcode pages are indexable and unknown districts 404. | Keep only curated postcode-area pages in the sitemap and 404 unknown districts. Do not republish cloned national-deal templates. |

## Ordered implementation plan

### 1. Consent and legal

Choose Google's CMP or another certified TCF CMP; design equal accept/reject choices and a persistent privacy-choice control. Draft updated privacy/cookie disclosures, but publish them when the advertising implementation is ready so the policy remains factually accurate.

### 2. Remove low-value inventory

Keep only curated postcode-area pages indexable. Unknown Ofcom districts must 404 and stay out of the sitemap. Do not pad pages with filler copy.

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
- Make sure your site's pages are ready: https://support.google.com/adsense/answer/7299563
- Required privacy content: https://support.google.com/adsense/answer/1348695
- UK/EEA certified CMP requirement: https://support.google.com/adsense/answer/13554116
- European regulations messages: https://support.google.com/adsense/answer/10961068
- Auto Ads page exclusions: https://support.google.com/adsense/answer/9262311
- ads.txt: https://support.google.com/adsense/answer/12171612
- Spam and thin content: https://developers.google.com/search/docs/essentials/spam-policies
