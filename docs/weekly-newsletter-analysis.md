# Weekly newsletters on UK comparison sites, and the BroadbandPicker issue spec

Researched: 2026-09-20T16:24:40+00:00

This is a working note for the live emailer. It is not legal advice and it does not
copy competitor wording into the send.

## What professional weekly mail actually is

MoneySavingExpert is the UK template: a **named weekly**, a **web archive**, a
confirmation on signup, and an unsubscribe in every edition. Comparison hubs such as
Uswitch are postcode-first; email is a reminder or account lifecycle message, not the
product. Affiliate sites that look serious do five things every week:

1. **One cadence.** Weekly, not daily. The consent text must match the send.
2. **A public twin.** The email is HTML of a page you can also open on the site.
3. **Address before headline price.** GEO/SEO comparison is useless if the CTA skips the postcode checker.
4. **Commission in the footer.** Readers already assume it; hiding it looks worse.
5. **Stop is easy.** List-Unsubscribe plus a visible link. ICO: do not conceal who is sending.

They do **not** send from a personal Gmail, invent a cheapest-in-Britain figure, or
bundle marketing consent into the availability checker.

## Agent plan (Planner, Editor, Compliance, Sender, Analyst)

- **Planner:** Fix the week key, subject and preheader. Pull live providers, newest guides and GEO hubs. Do not invent prices.
- **Editor:** Keep the issue short: one lede, five from-prices, three guides, four area links, tools. British English. No fake social proof.
- **Compliance:** Confirmed subscribers only. Named sender. Affiliate disclosure. Unsubscribe in body and List-Unsubscribe header. No personal Gmail. No pre-ticked anything.
- **Sender:** Preview the live HTML. Test one address. Then send the same issue to the confirmed list via domain SMTP.
- **Analyst:** Track newsletter_signup on confirm, outbound_provider_click from the web twin, and do not treat opens as a PECR basis.

## When to send (day and time)

The script's job is not to guess a lucky hour. It is to pick a **stable UK slot**
that comparison and affiliate weeklies already use, then fire it every week.

- Chosen: **Tuesday 09:00 UTC** (`0 9 * * 2`)
- UK clock: 10:00 in British Summer Time, 09:00 in GMT
- Why not Monday: UK and platform benchmarks treat Monday as inbox-backlog: weaker than Tue-Thu. Consent says weekly, not Monday.

Evidence fetched or cited this run:

- MoneySavingExpert Money Tips FAQ (live): after the first week, emails are usually sent on a Wednesday, sometimes Tuesday night or Thursday.
- UK agency round-up (Echelon Media): Tuesday is the strongest day; 10:00-11:00 and 14:00-16:00 UK; avoid early Monday and Friday afternoon.
- Primo Interactive UK 2026 playbook: newsletter default is Tuesday 10:00 local; Monday is a second choice once Tue/Wed are used.
- Campaign Monitor / Mailchimp-style 2026 summaries: Tuesday or Thursday 09:00-11:00 local for opens; weekday gaps are small, list hygiene matters more.
- Fintech/consumer money niche heatmaps: Tuesday about 09:00 local.

## Issue stack to ship every week

- Subject: BroadbandPicker weekly roundup, {month year}
- Preheader: Check from-prices at your address. Unsubscribe any time.
- Logo + wordmark header
- Lede: this is a roundup, not a national cheapest promise
- Five provider from-prices with verified date and Check deals CTA
- Three recently updated guides (GEO/switching/speed)
- Four area hubs (London, Manchester, Birmingham, Glasgow)
- Tools: speed test, Broadband Match, cost calculator
- How we make money + unsubscribe + contact page

## SEO and GEO

- The email is a push copy of a public weekly page so Google and answer engines can cite the same roundup.
- Every deal CTA goes to an address checker, never a fake national from-price as the only action.
- GEO hubs and updated guides recycle high-intent URLs already on the site.
- Month and ISO week in the title keep the page fresh without a new URL every week.

## Affiliate rules

- Disclose commission in the email and on the web twin.
- Rank from live provider data, not from who pays more.
- Do not put unnamed partners on the consent tick.
- Primary CTA is Check at your postcode, not a dark-pattern countdown.

## Send rules

- Only status=confirmed, never pending or unsubscribed
- Personalise unsubscribe token; do not send a shared unsub link
- If domain SMTP is missing, skip the send rather than use Gmail
- Vercel Cron fires GET /api/newsletter/send every Tuesday 09:00 UTC with CRON_SECRET
- Skip rather than use Gmail if domain SMTP is missing
- Skip if this ISO week was already sent (newsletter_sends.week_key)

## Domain mail DNS this run

- MX: none
- SPF/TXT: "google-site-verification=JxWo4msWeIzvf_XuD0Fy5B07TnOe0K_n33pAd1ibxlA"
- DMARC: none

No MX means the live emailer can still **preview** the Monday issue. It must not
send until `noreply@broadbandpicker.co.uk` can authenticate.

## Pages fetched

| Site | HTTP | Words | Signals |
| --- | --- | --- | --- |
| BroadbandPicker alerts | 200 | 3457 | weekly, archive, unsubscribe, affiliate_disclosure, postcode_or_geo, double_opt_in |
| MoneySavingExpert weekly archive | 403 | 0 | — |
| MoneySavingExpert email FAQ | 403 | 0 | — |
| MoneySavingExpert privacy | 403 | 0 | — |
| Uswitch broadband | 200 | 14149 | affiliate_disclosure, postcode_or_geo |
| Uswitch privacy | 200 | 11150 | unsubscribe, affiliate_disclosure, postcode_or_geo |
| broadbandchoices privacy | 403 | 0 | — |
| Which? newsletters | 200 | 12471 | weekly, unsubscribe, postcode_or_geo |
| NerdWallet UK | 410 | 0 | — |
| cable.co.uk | 200 | 6723 | affiliate_disclosure, postcode_or_geo |
| ICO electronic mail marketing | 200 | 1617 | unsubscribe |

### Mentions

#### BroadbandPicker alerts

- https://broadbandpicker.co.uk/alerts
- “Broadband Social Tariffs UK 2026: Who Qualifies and How to Apply Cheaper Broadband If You Claim Benefits: Social Tariffs Explained No Credit Check Broadband in the UK: Options and What to Expect Browse all 56 guides → To”
- “Unsubscribe any time.","isPartOf":{"@type":"WebSite","url":"https://broadbandpicker.co.uk/"}},{"@type":"FAQPage","mainEntity":[{"@type":"Question","name":"What emails will BroadbandPicker send me?","acceptedAnswer":{"@ty”
- “A newsletter is not an availability check, so we do not ask for your street address here."}},{"@type":"Question","name":"Why is there a confirmation email?","acceptedAnswer":{"@type":"Answer","text":"UK marketing email n”
- “That also stops a mistyped address from being emailed."}},{"@type":"Question","name":"How do I stop the emails?","acceptedAnswer":{"@type":"Answer","text":"Every message includes an unsubscribe link.”

#### MoneySavingExpert weekly archive

- https://www.moneysavingexpert.com/tips/
- Non-200 or empty (403)

#### MoneySavingExpert email FAQ

- https://www.moneysavingexpert.com/site/money-tips-email-faqs/
- Non-200 or empty (403)

#### MoneySavingExpert privacy

- https://www.moneysavingexpert.com/site/privacy-policy/
- Non-200 or empty (403)

#### Uswitch broadband

- https://www.uswitch.com/broadband/

#### Uswitch privacy

- https://www.uswitch.com/privacy/
- “You can unsubscribe from emails by clicking ‘Unsubscribe’ in any marketing email you have received; can switch off ‘push’ notifications on your mobile device by going into your settings; and ‘stop’ SMS messages by follow”
- “You can unsubscribe from emails by clicking ‘Unsubscribe’ in any marketing email you have received; can switch off ‘push’ notifications on your mobile device by going into your settings; and ‘stop’ SMS messages by follow”

#### broadbandchoices privacy

- https://www.broadbandchoices.co.uk/privacy-policy
- Non-200 or empty (403)

#### Which? newsletters

- https://www.which.co.uk/newsletters
- “Free newsletters for everyone 30 Mar 2026 Free newsletters for everyone Save article In this article Weekly Scoop newsletter Deals newsletter Retirement Planning newsletter First-time Buyer newsletters Money newsletter S”
- “â you donât have to be a member to have these newsletters emailed to you regularly.”
- “Weekly Scoop newsletter Weekly Scoop newsletter â make smarter consumer choices, sign up for our free tips Deals newsletter Deals newsletter â free tips from our experts, emailed to you monthly and for seasonal sales”
- “Retirement Planning newsletter Retirement Planning newsletter â free tips from our experts to help you get your finances ready for the future.”

#### NerdWallet UK

- https://www.nerdwallet.com/uk/
- Non-200 or empty (410)

#### cable.co.uk

- https://www.cable.co.uk/

#### ICO electronic mail marketing

- https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guide-to-pecr/electronic-and-telephone-marketing/electronic-mail-marketing/
- “You must not disguise or conceal your identity, and you must provide a valid contact address so they can opt out or unsubscribe.”
- “☐ We offer an opt-out (by reply or unsubscribe link) and act on this promptly.”
- “☐ We keep a ‘do not contact’ list of anyone who opts out or unsubscribes from our electronic mail.”
- “Previous Fax marketing Next Using marketing lists Back to top Print this page For the public Official information Nuisance calls For organisations UK GDPR guidance and resources Freedom of information EIR and access to i”

## What the emailer on BroadbandPicker should do

- Public live issue: `/alerts/weekly`
- Interactive sender: `/admin/alerts`
- Cadence: One email a week, Tuesday 09:00 UTC (10:00 UK in BST, 09:00 UK in GMT)
- From: BroadbandPicker <noreply@broadbandpicker.co.uk>

The admin screen is the working desk: live preview of this week’s HTML, a
compliance checklist, a one-address test, then send to confirmed subscribers.
Monday cron is optional and off until ALERTS_AUTO_SEND is set.

