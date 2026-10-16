# How UK affiliate sites collect emails, and what BroadbandPicker should ship

Researched: 2026-09-20T11:44:53+00:00

This is a working note for BroadbandPicker deal alerts. It is not legal advice.
Live ICO pages were fetched on the run date; competitor HTML is often a JS shell.

## Why this exists

UK comparison sites do not treat email as a generic 'newsletter box'. The ones that
look professional treat it as a **permissioned retention channel**: a named sender,
a named frequency, a named topic, an easy stop, and a paper trail. BroadbandPicker
already had a footer/homepage form that wrote straight to the database from the
browser, with no consent tick, no confirmation, and a made-up social-proof line.
That is the opposite of how a regulated UK affiliate site should collect addresses.

## What the law actually requires (PECR + UK GDPR)

A deals email to a person is **unsolicited electronic mail marketing** under PECR.
ICO guidance (updated 28 April 2026 after the Data (Use and Access) Act 2025) is
clear on the points that matter for this form:

1. **Prior consent**, unless a soft opt-in applies. Soft opt-in is for contact
   details collected during a sale or negotiation of a similar product. A visitor
   typing an email on a comparison site is **not** a customer. BroadbandPicker
   must use consent.
2. Consent is the UK GDPR standard: freely given, specific, informed, unambiguous.
   No pre-ticked boxes. No bundling with terms of use. Name **BroadbandPicker**.
   Name the **channel** (email) and the **content** (weekly deal roundups and
   occasional guides).
3. Keep a record: the wording shown, when it was shown, the source URL, and that
   the box was ticked. A confirmation click is strong evidence.
4. Every later message must identify us and include a simple unsubscribe.
5. PECR fines now sit at UK GDPR levels. This is not a 'small site' carve-out.

Double opt-in is not a statute by name, but it is the ICO-aligned way to prove
the address belongs to the person who consented, and it stops a mistyped address
from becoming a complaint.

### Excerpts fetched from ICO pages this run

#### ICO electronic mail marketing (brief)

- URL: https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guide-to-pecr/electronic-and-telephone-marketing/electronic-mail-marketing/
- HTTP: 200
- “You must not send marketing emails or texts to individuals without specific consent. There is a limited exception for your own previous customers, often called the ‘soft opt-in’. You can send marketing e”
- “soft opt-in’. You can send marketing emails or texts to companies. However, it is good practice to keep a ‘do not email or text’ list of any companies that object. In more detail… What are th”
- “unsubscribe. What about texts and other types of electronic message? This same rule applies to emails, texts, picture messages, video messages, voicema”
- “must not disguise or conceal your identity, and you must provide a valid contact address so they can opt out or unsubscribe. What about texts and other types of electronic message? This same rule applie”
- “valid contact address so they can opt out or unsubscribe. What about texts and other types of electronic message? This same rule applies to emails, texts, picture messages, video me”
- “You must not send marketing emails or texts to individuals without specific consent. There is a limited exception for your own previous customers, often called the ‘soft opt-in’.”
- “The rules on electronic mail marketing are in regulation 22. In short, you must not send electronic mail marketing to individuals, unless:”
- “You must not disguise or conceal your identity, and you must provide a valid contact address so they can opt out or unsubscribe.”

#### ICO electronic mail marketing (detailed)

- URL: https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guidance-on-direct-marketing-using-electronic-mail/
- HTTP: 200
- “soft opt-in for charitable purposes in PECR regulation 22(3A). This allows charities to send direct marketing by electronic mail without people’s consent if certain requirements are met. We’v”
- “This guidance explains electronic mail marketing under the Privacy and Electronic Communications Regulations 2003 (PECR) in detail. It complements the brief guidance on”

#### ICO how to comply with PECR email rules

- URL: https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guidance-on-direct-marketing-using-electronic-mail/how-do-we-comply-with-the-pecr-electronic-mail-marketing-rules/
- HTTP: 200
- “soft opt-ins and who can use them? How do we use the soft opt-in for products and services? How do we use the soft opt-in for charitable purposes? What happens if both soft opt-ins apply? Can”
- “pre-ticked opt-in boxes, silence or inactivity as evidence of consent (‘clear affirmative action’). Example A company provides the”
- “freely given, specific, informed and unambiguous indication of the data subject’s wishes by which he or she, by a statement or by a clear affirmative action, signifies agre”
- “unsubscribe. These rules apply regardless of whether the message is solicited or unsolicited. Further reading – ICO guidance Business-to-business marke”
- “Consent must be freely given. It’s unlikely to be valid consent if you make agreeing to marketing a necessary condition for buying your product or service or donating to your cause. Example ✔”
- “valid contact address for recipients to opt out or unsubscribe. These rules apply regardless of whether the message is solicited or unsolicited. Further reading – ICO guidance Busin”
- “PECR applies to anyone who sends or instigates the sending of direct marketing by electronic mail.”
- “You’re likely to be instigating if you encourage, incite, incentivise or ask someone else to send electronic mail containing your direct marketing. If you ask another organisation to send your electronic mail marketing, you may still be responsible under PECR as the instigator, w”

## How affiliate comparison sites actually run this

From the live HTML plus privacy pages, UK comparison brands use a small set of
working models. BroadbandPicker should copy the **process**, not the wording.

| Model | Who uses a version of it | How it works | Take for BroadbandPicker |
| --- | --- | --- | --- |
| Postcode first, email later | Uswitch, MoneySuperMarket, Compare the Market, Go.Compare | The hub is an availability checker. Email is not the first field. Address-level data is for quoting, not for a newsletter. | Keep the postcode checker as a checker. Do not turn it into a marketing capture. |
| Save / email my results | broadbandchoices privacy (Decision Tech / MoneySuperMarket) | Email is collected to send *this* comparison, with a separate marketing permission. Results mail can be a service message; marketing still needs a tick. | Do not send deals until the alerts tick and confirm are done. A 'save these deals' mail is a later feature. |
| Named newsletter centre | MoneySavingExpert | A dedicated page lists named emails, frequency, and an unsubscribe promise. That looks like a publisher, not a harvest form. | Ship `/alerts` as a proper page: what you get, how often, how to stop. |
| Account + contract-end reminder | Uswitch copy on the broadband hub | If you made an account at switch time, they remind you when the contract ends. That is a high-intent lifecycle email, not a blast. | Out of scope until BroadbandPicker stores a switch date. Do not fake it. |
| Footer / mid-page deal alerts | Smaller comparison and deals sites | Short email field, benefit line, frequency, privacy link. Professional versions add an unticked tick. | Footer + homepage + postcode page, all posting to the same server route. |

What they **do not** do on a professional alerts form:

- Ask for a full street address. That is the availability journey.
- Claim 'thousands of households' without a source.
- Hide the sender behind 'partners' on the same tick.
- Write to a public database key from the browser.

## Competitor page scan

Field counts on JS-rendered hubs are incomplete. Use those rows as a prompt
to look manually, not as proof the site has no email form.

| Site | HTTP | Words | Email fields | Postcode fields | Checkboxes | Signals | JS shell? |
| --- | --- | --- | --- | --- | --- | --- | --- |
| BroadbandPicker (current) | 200 | 15338 | 2 | 6 | 2 | deal_alerts, weekly, unsubscribe_promise, account_signup, contract_end_reminder, frequency_stated, branded_from | no |
| Uswitch broadband | 200 | 14141 | 0 | 0 | 31 | account_signup, contract_end_reminder | no |
| Uswitch privacy | 200 | 11150 | 0 | 0 | 0 | unsubscribe_promise, consent_language, account_signup, contract_end_reminder, marketing_opt_in | no |
| MoneySuperMarket broadband | 403 | 0 | 0 | 0 | 0 | — | no |
| Compare the Market broadband | 403 | 0 | 0 | 0 | 0 | — | no |
| broadbandchoices | 403 | 0 | 0 | 0 | 0 | — | no |
| broadbandchoices privacy | 403 | 0 | 0 | 0 | 0 | — | no |
| choose.co.uk broadband | 200 | 2592 | 0 | 0 | 0 | account_signup | no |
| broadband.co.uk | 200 | 4761 | 0 | 2 | 19 | no_spam, account_signup, contract_end_reminder | no |
| Broadband Genie | 200 | 1366 | 0 | 1 | 0 | consent_language | no |
| Go.Compare broadband | 200 | 193 | 0 | 0 | 0 | — | no |
| Confused.com broadband | 200 | 3340 | 0 | 1 | 0 | account_signup | no |
| Which? broadband | 200 | 164 | 0 | 0 | 0 | newsletter | no |
| MoneySavingExpert home | 403 | 0 | 0 | 0 | 0 | — | no |
| MoneySavingExpert newsletters | 403 | 0 | 0 | 0 | 0 | — | no |
| NerdWallet UK | 410 | 0 | 0 | 0 | 0 | — | no |
| cable.co.uk | 200 | 6723 | 0 | 3 | 0 | consent_language, account_signup | no |
| thinkbroadband | 403 | 0 | 0 | 0 | 0 | — | no |
| money.co.uk broadband | 200 | 47991 | 1 | 0 | 5 | weekly, unsubscribe_promise, consent_language, double_opt_in, account_signup | no |
| MoneySavingExpert privacy | 403 | 0 | 0 | 0 | 0 | — | no |
| MoneySavingExpert email FAQ | 403 | 0 | 0 | 0 | 0 | — | no |

### Notes and consent snippets

#### BroadbandPicker (current)

- https://broadbandpicker.co.uk/
- Title: Compare Broadband Deals UK | BroadbandPicker
- Email placeholders: your@email.com; Your email address
- Form CTAs: Find Deals; Email me alerts; Get alerts
- Checkbox labels: I want BroadbandPicker to email me weekly UK broadband deal roundups and occasional switching guides. I can unsubscribe at any time. Privacy policy. / I want BroadbandPicker to email me weekly UK broadband deal roundups and occasional switching guides. I can unsubscribe at any time. Privacy policy.
- Near the email field: “Leave this field blank Email me alerts I want BroadbandPicker to email me weekly UK broadband deal roundups and occasional switching guides. I can unsubscribe at any time. Privacy policy .”
- Domain-looking addresses: editorial@broadbandpicker.co.uk, hello@broadbandpicker.co.uk, partnerships@broadbandpicker.co.uk
- Privacy URLs: https://broadbandpicker.co.uk/privacy-policy

#### Uswitch broadband

- https://www.uswitch.com/broadband/
- Title: Broadband Deals: Compare in September 2026 - Uswitch
- Form CTAs: Accept all cookies; Save my preferences; Close
- Checkbox labels: Essential / Performance / Marketing / Functionality
- Privacy URLs: https://www.rvu.co.uk/customer-privacy-notice/

#### Uswitch privacy

- https://www.uswitch.com/privacy/
- Title: Customer Privacy Notice | RVU
- Privacy URLs: https://www.uswitch.com/privacy-notices/

#### MoneySuperMarket broadband

- https://www.moneysupermarket.com/broadband/
- Non-200 or empty (403)

#### Compare the Market broadband

- https://www.comparethemarket.com/broadband/
- Non-200 or empty (403)

#### broadbandchoices

- https://www.broadbandchoices.co.uk/
- Non-200 or empty (403)

#### broadbandchoices privacy

- https://www.broadbandchoices.co.uk/privacy-policy
- Non-200 or empty (403)

#### choose.co.uk broadband

- https://www.choose.co.uk/broadband/
- Title: Compare Broadband Deals in the UK | Latest Prices & Offers September 2026
- Privacy URLs: https://www.choose.co.uk/terms/privacy/

#### broadband.co.uk

- https://www.broadband.co.uk/broadband
- Title: Best Broadband Deals | BT, Sky, Virgin Media, Vodafone & more Broadband Genie logo
- Form CTAs: Average Speed; Clear; Monthly Price; Providers; TV; Calls; Contract Length; Fibre; Extras; Why do we need your address?
- Checkbox labels: 4th Utility (11) / BT (21) / EE (13) / Fibrely (6)
- Privacy URLs: https://www.broadband.co.uk/about/privacy

#### Broadband Genie

- https://www.broadbandgenie.co.uk/
- Title: Best Broadband Price Comparison | Broadband Genie - It is Genius! Broadband Genie logo
- Privacy URLs: https://www.broadbandgenie.co.uk/about/privacy

#### Go.Compare broadband

- https://www.gocompare.com/broadband/
- Title: Pardon Our Interruption

#### Confused.com broadband

- https://www.confused.com/broadband
- Title: Broadband deals â Compare broadband today â Confused.com Confused.com
- Form CTAs: Get started
- Privacy URLs: https://www.confused.com/privacy-and-security, https://www.confused.com/privacy-and-security/terms-and-conditions

#### Which? broadband

- https://www.which.co.uk/reviews/broadband
- Title: Compare broadband, internet, digital TV & landline phone packages - Which? Switch Broadband
- Form CTAs: Search
- Privacy URLs: https://www.which.co.uk/help/which-privacy-notice-aGL107i27ybI

#### MoneySavingExpert home

- https://www.moneysavingexpert.com/
- Non-200 or empty (403)

#### MoneySavingExpert newsletters

- https://www.moneysavingexpert.com/newsletters/
- Non-200 or empty (403)

#### NerdWallet UK

- https://www.nerdwallet.com/uk/
- Non-200 or empty (410)

#### cable.co.uk

- https://www.cable.co.uk/
- Title: Best Broadband Deals 2026: Compare & Save Money
- Domain-looking addresses: info@cable.co.uk
- Privacy URLs: https://www.cable.co.uk/about/privacy/

#### thinkbroadband

- https://www.thinkbroadband.com/
- Non-200 or empty (403)

#### money.co.uk broadband

- https://www.money.co.uk/broadband
- Title: Business & personal finance comparison | money.co.uk
- Email placeholders: Email
- Form CTAs: Open your free account; Sign up
- Checkbox labels: Essential / Performance / Marketing / Functionality
- Near the email field: “Stay updated on Making Tax Digital Tax returns are changing. Get expert updates and practical guidance to help you get MTD-ready with confidence. Sign up ​By submitting your email you agree to receive money-saving deals and insights from money.co.uk. We can help you save on your ”
- Domain-looking addresses: customerservice@money.co.uk
- Privacy URLs: https://www.rvu.co.uk/customer-privacy-notice/

#### MoneySavingExpert privacy

- https://www.moneysavingexpert.com/site/privacy-policy/
- Non-200 or empty (403)

#### MoneySavingExpert email FAQ

- https://www.moneysavingexpert.com/site/money-tips-email-faqs/
- Non-200 or empty (403)

## BroadbandPicker implementation spec (from this research)

- Public page: `/alerts`
- Consent wording to store: “I want BroadbandPicker to email me weekly UK broadband deal roundups and occasional switching guides. I can unsubscribe at any time.”
- PECR basis: Regulation 22 prior consent. Soft opt-in does not apply: this is not a sale.
- UK GDPR: Consent for sending the emails; legitimate interests are not a PECR basis for marketing email.

Placements:

- Dedicated /alerts landing page (indexable)
- Homepage mid-page (inline)
- Site footer
- Postcode area pages, with the area pre-filled
- Tools hub card

Fields:

- Email: required
- UK postcode: optional, for localising later emails; never a full street address on a newsletter form
- Consent: required, unticked, separate from using the site
- Honeypot: hidden website field

Do not copy:

- Invented subscriber counts such as 'thousands of households'
- Pre-ticked boxes
- Bundling marketing consent into the postcode checker
- Bought-in lists
- Daily spam or unnamed 'partners' in the same tick
- Full home address on an alerts form (that is an availability-check pattern, not a newsletter)

Email programme:

- Confirmation: Send immediately; expire the link after 48 hours
- Welcome: Only after confirm; include unsubscribe
- Recurring: Weekly deals roundup plus occasional guides, as named in the tick
- Headers: List-Unsubscribe and List-Unsubscribe-Post on every message
- Identification: BroadbandPicker and broadbandpicker.co.uk in every message; do not invent a postal address

## How professional sites brand the sender

Recipients judge a signup email in the inbox row, before they open it. UK comparison
and publisher mail looks like **BrandName** plus a **domain address**, usually
`noreply@`, `donotreply@` or a named mailbox on the same domain. They put a logo
in the HTML header and a wordmark that still reads if images are blocked. They
never put a personal Gmail address in the From field.

ICO PECR: you must not disguise or conceal your identity, and you must give a valid
contact address so people can opt out. A `noreply@` From is fine if the name is the
organisation, the domain is yours, every message has unsubscribe, and a human route
exists (contact page). It is not fine to hide behind a private Gmail account.

This run, addresses that looked like senders on competitor HTML:

- BroadbandPicker (current): editorial@broadbandpicker.co.uk, hello@broadbandpicker.co.uk, partnerships@broadbandpicker.co.uk
- cable.co.uk: info@cable.co.uk
- money.co.uk broadband: customerservice@money.co.uk

- BroadbandPicker From name: BroadbandPicker
- BroadbandPicker From address: `noreply@broadbandpicker.co.uk`
- Logo: Hosted PNG at https://broadbandpicker.co.uk/logo.png plus a text wordmark. Do not use SVG in email. Do not put a personal Gmail address in From, Reply-To, or the body.
- HTML: Table layout, 560px, brand bar #0ea5e9, logo + wordmark, one primary button, unsubscribe, List-Unsubscribe headers
- Sending: Keep sending inside the Next.js app with nodemailer. Authenticate as a broadbandpicker.co.uk mailbox (or a Gmail Send-mail-as alias for noreply@) so the envelope matches the From header. Do not add Mailchimp, Brevo or Klaviyo for this.

Our domain DNS for sending (must align with From):

- MX: none
- SPF: none
- DMARC: none

No MX or SPF on broadbandpicker.co.uk means inboxes cannot yet authenticate `noreply@broadbandpicker.co.uk`. The app still sends that From header from nodemailer. Until a domain mailbox or a verified Gmail Send-mail-as alias exists, Gmail SMTP will keep showing the personal Gmail user. That is a DNS and mailbox step, not a Mailchimp step.

## Analytics

Request event `newsletter_signup_request`, confirmed key event `newsletter_signup`.

## Process to run after this script

1. Visitor submits email (and optional postcode) with an unticked box they then tick.
2. Server validates, ignores honeypots, rate-limits, and sends a confirmation email.
3. Nothing commercial is sent until they click the confirmation link.
4. Welcome email includes unsubscribe. Every later email does too.
5. Privacy policy names this processing, retention, and how to stop.
6. Confirmed subscribe is the GA4 event that matters, not the first click.

