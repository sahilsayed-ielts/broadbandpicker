export type PriorityPageKey = 'business' | 'postcode' | 'phone' | 'btDeals' | 'skyDeals' | 'eeDeals' | 'virginDeals' | 'satisfaction' | 'serviceRankings' | 'satellite' | 'london' | 'sheffield' | 'edinburgh' | 'glasgow' | 'liverpool' | 'leeds' | 'bristol' | 'birmingham' | 'manchester'

type Page = {
  path: string
  title: string
  metaTitle: string
  metaDescription: string
  eyebrow: string
  dek: string
  quickAnswer: string
  updated: string
  schemaType: 'Article' | 'CollectionPage' | 'Dataset'
  breadcrumbs: { name: string; href: string }[]
  table?: { title: string; headers: string[]; rows: string[][] }
  sections: { heading: string; paragraphs: string[]; bullets?: string[] }[]
  faqs: { question: string; answer: string }[]
  sources: { label: string; href: string; verified?: string }[]
}

const guideCrumbs = (name: string, path: string) => [{ name: 'Home', href: '/' }, { name: 'Guides', href: '/guides' }, { name, href: path }]
const providerCrumbs = (name: string, path: string) => [{ name: 'Home', href: '/' }, { name: 'Providers', href: '/providers' }, { name, href: path }]

export const priorityPages: Record<PriorityPageKey, Page> = {
  business: {
    path: '/guides/best-business-broadband-providers-uk', title: 'Best business broadband providers in the UK',
    metaTitle: 'Best Business Broadband Providers UK 2026', metaDescription: 'Compare UK business broadband providers on real price, satisfaction and speed data: Vodafone Business for entry price, Zen for satisfaction, Virgin Media for speed. 2026 guide.',
    eyebrow: 'Business broadband comparison', dek: 'A practical shortlist for sole traders, small offices and growing companies, based on real price, satisfaction and speed data rather than headline claims alone.',
    quickAnswer: 'Vodafone Business currently has the most competitive entry-level full-fibre price, from around £20-22 a month excluding VAT. Zen Business leads on customer satisfaction, holding Which? Recommended Provider status since 2021 with 84% satisfaction and static IP included as standard. Virgin Media Business delivers the fastest raw speeds, averaging 442 Mbps, but only within its cable footprint, roughly half of UK premises. Sky Business has a consistently strong Ofcom complaints record. A leased line becomes worth its higher cost once an hour of downtime has a real, measurable cost to the business.',
    updated: '2026-08-24', schemaType: 'Article', breadcrumbs: guideCrumbs('Business broadband providers', '/guides/best-business-broadband-providers-uk'),
    table: { title: 'Business broadband providers compared', headers: ['Provider', 'Strongest for', 'From (excl. VAT)', 'Static IP'], rows: [
      ['Vodafone Business', 'Lowest entry-level full-fibre price', '£20-22/mo, 36-month term', 'Extra charge'],
      ['Zen Business', 'Customer satisfaction: 84% in Which? surveys, Recommended since 2021', '£30/mo, 18-month term', 'Included as standard'],
      ['Virgin Media Business', 'Fastest raw speed: 442 Mbps average', 'Varies by tier', 'Extra charge'],
      ['Sky Business', 'Consistently strong Ofcom complaints record; 4G backup on premium tiers', 'Varies by tier', 'Extra charge (£4.95/mo)'],
      ['BT Business', 'Widest nationwide coverage', 'From £25/mo, 80 Mbps, 24-month term', 'Extra charge'],
      ['Daisy Communications', 'Multi-site businesses; bundled broadband, VoIP and IT support', 'Quote-based', 'Included as standard'],
    ]},
    sections: [
      { heading: 'What makes business broadband different?', paragraphs: ['Business packages can add a static IP address, prioritised business support, security controls and a clearer fault-response commitment than a residential contract. Those specific features justify the higher price, not the word "business" on its own. A basic business FTTP service can still share network capacity with other users at peak times in the same way a residential line does; a leased line is a genuinely different, dedicated product with guaranteed, symmetric bandwidth and a formal service-level agreement.'], bullets: ['Static IP for VPNs, remote access, allow-lists, CCTV or hosted services', 'A stated repair target and a real escalation path if it is missed', '4G or 5G backup using a genuinely independent connection, not the same line rerouted', 'Guaranteed upload capacity for cloud storage, VoIP calls and off-site backups'] },
      { heading: 'Business broadband or a leased line?', paragraphs: ['Standard business broadband is a contended connection: bandwidth is shared with other users nearby, so actual speed can vary at busy times, the same way a residential line does. A leased line is uncontended, delivering guaranteed bandwidth, identical upload and download capacity, and a premium contractual SLA, typically a 4 to 6-hour fix commitment.', 'Leased lines start from around £69 a month for a 100 Mbps entry-level connection, rising well beyond £1,000 a month for higher-capacity or enterprise-grade circuits depending on location, contract length and installation complexity. Choose one when an hour of downtime has a measurable cost to the business, when upload demand is sustained rather than occasional, or when a contractual, credit-backed uptime commitment genuinely matters, not just a marketing claim of it.'] },
      { heading: 'A real cost of staying on the wrong contract', paragraphs: ['Independent analysis of UK business broadband pricing found that customers who stay on an expired, out-of-contract deal pay around 24.86% more per month on average than a new-customer price for a comparable service. Reviewing the contract renewal date and re-shopping the market, rather than letting it roll over automatically, is one of the most reliably valuable actions a small business can take on this cost line.'] },
      { heading: 'How we would choose for an SME', paragraphs: ['Write down the realistic operational cost of one hour offline, the number of simultaneous users, and which specific applications must stay available. Then compare the total contract cost including VAT, installation, router, backup connectivity and static IP charges side by side, since providers differ meaningfully on which of these are bundled versus charged separately. Never accept an "up to" speed figure as a substitute for a stated minimum or a service-level commitment in writing.'] },
    ],
    faqs: [
      { question: 'Which business broadband provider is cheapest?', answer: 'Vodafone Business currently offers the most competitive entry-level full-fibre price, from around £20 to £22 a month excluding VAT on a 36-month term. Confirm the VAT-inclusive total and whether a scheduled annual price increase is built into that headline figure before comparing it against a shorter-term deal elsewhere.' },
      { question: 'Which business broadband provider has the best customer satisfaction?', answer: 'Zen Business has held Which? Recommended Provider status since 2021, with an 84% customer satisfaction score in independent surveys, and includes a static IP address as standard rather than as a paid extra.' },
      { question: 'Is business broadband worth it for a sole trader?', answer: 'It can be, specifically if a static IP, faster fault response, or dedicated business support have real practical value for how you work. If none of those apply, a residential service with a separate mobile backup connection is often the more economical choice.' },
      { question: 'Does business broadband guarantee uptime?', answer: 'Not automatically, and standard business broadband remains a contended connection shared with other users. Read the actual SLA, repair target and service-credit terms rather than assuming the word "business" implies a guarantee; only a leased line delivers genuinely uncontended, guaranteed bandwidth.' },
      { question: 'Do business broadband prices include VAT?', answer: 'Often not. Most business providers advertise prices excluding VAT, so the real monthly cost is around 20% higher than the headline figure. Always compare the VAT-inclusive total, setup charges and any scheduled price rise before ordering.' },
      { question: 'How much does a business leased line cost?', answer: 'Entry-level leased lines start from around £69 a month for 100 Mbps, rising well beyond £1,000 a month for higher-capacity or enterprise-grade circuits, depending on location, contract length and installation complexity. A leased line delivers guaranteed, uncontended, symmetric bandwidth and a formal SLA, unlike standard shared business broadband.' },
    ],
    sources: [
      { label: 'Ofcom Business Broadband Code of Practice', href: 'https://www.ofcom.org.uk/phones-and-broadband/coverage-and-speeds/business-broadband-cop' },
      { label: 'Ofcom conditions protecting SME customers', href: 'https://www.ofcom.org.uk/phones-and-broadband/coverage-and-speeds/gen-conditions' },
      { label: 'AMVIA: Best Business Broadband UK 2026, 10 providers compared', href: 'https://amvia.co.uk/compare/business-broadband' },
      { label: 'BT Business broadband', href: 'https://business.bt.com/sme/business-broadband/' },
    ],
  },
  postcode: {
    path: '/postcode', title: 'Broadband providers in your area', metaTitle: 'Broadband by Postcode UK',
    metaDescription: 'Enter your UK postcode to compare broadband providers, networks and speeds available at your address. Understand why availability varies by property.',
    eyebrow: 'UK availability hub', dek: 'Broadband is address-specific. Use a postcode comparison first, then confirm the exact property with the provider.',
    quickAnswer: 'The providers available to you depend on the physical networks serving your property. Openreach-based retailers may overlap, Virgin Media uses its own footprint, and alternative full-fibre networks serve selected locations. A postcode is a useful first filter, but an address-level check is needed before purchase.',
    updated: '2026-08-01', schemaType: 'CollectionPage', breadcrumbs: [{ name: 'Home', href: '/' }, { name: 'Broadband by postcode', href: '/postcode' }],
    table: { title: 'Why two nearby homes can see different deals', headers: ['Factor', 'What changes', 'What to do'], rows: [
      ['Network footprint', 'Which physical networks reach the building', 'Check the full address, not only the town'],
      ['Building access', 'Wayleave, flats and internal wiring', 'Ask the building manager about installed networks'],
      ['Line technology', 'Copper, part fibre, cable or FTTP', 'Compare minimum speed estimates'],
      ['Provider product range', 'Retail plans sold on each network', 'Check contract cost and service features'],
    ]},
    sections: [
      { heading: 'How the postcode hierarchy works', paragraphs: ['This hub sits above our postcode-prefix pages. Prefix pages explain the likely provider mix and local context, while the comparison journey checks the specific address. This structure helps people navigate without pretending that every property in a postcode has identical coverage.'] },
      { heading: 'Networks are not the same as providers', paragraphs: ['Openreach, Virgin Media, CityFibre and independent full-fibre operators build infrastructure. Retail providers sell services over one or more of those networks. Seeing several provider names does not necessarily mean several independent cables reach the property.'] },
      { heading: 'What to compare after availability', paragraphs: ['Once availability is confirmed, compare minimum guaranteed speed, upload speed, contract length, setup cost, scheduled price changes, router features and support. Total contract cost is more informative than the first monthly price.'] },
    ],
    faqs: [
      { question: 'Can a postcode tell me exactly which broadband I can get?', answer: 'It narrows the search, but providers normally need a full address because neighbouring properties can have different connections.' },
      { question: 'Why is full fibre available next door but not at my home?', answer: 'Build phases, poles, ducts, building permissions and internal wiring can all create property-level differences.' },
      { question: 'Which broadband network has the best coverage?', answer: 'Openreach has the broadest fixed network footprint, but the best available service at one address may come from Virgin Media or a local full-fibre network.' },
    ],
    sources: [{ label: 'Ofcom broadband coverage checker', href: 'https://checker.ofcom.org.uk/en-gb/broadband-coverage' }, { label: 'Ofcom Connected Nations', href: 'https://www.ofcom.org.uk/phones-and-broadband/coverage-and-speeds/connected-nations' }],
  },
  phone: {
    path: '/guides/best-phone-and-broadband-deals', title: 'Best phone and broadband deals in the UK', metaTitle: 'Best Phone and Broadband Deals UK 2026',
    metaDescription: 'Compare UK phone and broadband packages ahead of the 31 January 2027 landline switch-off. Digital Voice, inclusive call plans and true contract costs explained.',
    eyebrow: 'Broadband and home phone guide', dek: 'Choose a bundle by call use, Digital Voice requirements and total contract cost, not by an "included line" headline, with the 31 January 2027 landline switch-off now locked in.',
    quickAnswer: 'The UK\'s old analogue landline network (PSTN) is being fully switched off by 31 January 2027, with the number of customers still on it falling from 5.2 million in July 2024 to 3.2 million in July 2025. Almost every new broadband line now comes with Digital Voice, a phone service that runs through the router rather than the copper network, so ask specifically what happens in a power cut and whether existing telecare or alarm equipment is compatible before switching or renewing.',
    updated: '2026-08-24', schemaType: 'Article', breadcrumbs: guideCrumbs('Phone and broadband deals', '/guides/best-phone-and-broadband-deals'),
    table: { title: 'Choose the right phone bundle', headers: ['Household need', 'Plan feature', 'Check carefully'], rows: [
      ['Rare calls', 'Pay-as-you-go calls', 'Connection fee and per-minute charge'], ['Frequent UK calls', 'Anytime or evening/weekend allowance, e.g. TalkTalk Anytime Calls at £12/mo', 'Excluded numbers and fair-use terms'], ['Vulnerable user or telecare', 'Provider support and a resilience solution exceeding Ofcom\'s minimum', 'Power-cut operation and device compatibility'], ['International calls', 'Country-specific add-on', 'Mobile destinations and call setup fees'],
    ]},
    sections: [
      { heading: 'The PSTN switch-off is now locked in for 31 January 2027', paragraphs: ['The UK\'s old analogue phone network, the PSTN, is being fully retired by 31 January 2027, a date the industry now treats as fixed after Openreach confirmed the earlier technical barriers behind the original December 2025 target have been resolved. Migration is already well underway: Ofcom recorded 5.2 million customers still on the PSTN in July 2024, falling to 3.2 million by July 2025. Every remaining household will move to Digital Voice, a phone service delivered over the broadband connection, before the cut-off.'] },
      { heading: 'Digital Voice and power cuts', paragraphs: ['Because Digital Voice runs through the broadband router rather than a separately powered copper line, it will not work during a power cut unless a backup solution is in place. Ofcom requires every provider to ensure at least one hour of continued access to emergency services during a power cut. Under the industry PSTN Charter, providers have also committed to not migrating telecare or medical-alarm users unless their specific device is confirmed compatible with Digital Voice, and to offer backup solutions that go beyond Ofcom\'s one-hour minimum. Tell your provider directly about any telecare, alarm or accessibility equipment before a migration date is set, rather than after.'] },
      { heading: 'Compare the whole contract, not the headline call plan', paragraphs: ['Add the monthly broadband cost, any call-plan add-on, setup and delivery fees, and any scheduled price rise across the full minimum term. TalkTalk\'s Anytime Calls add-on, for example, costs £12 a month on top of the base broadband price, a genuine extra cost that a headline "with free calls" advert can obscure. Check the out-of-contract price and whether calls to mobiles or premium-rate numbers are excluded from any inclusive allowance before assuming a bundle is genuinely all-inclusive.'] },
      { heading: 'When broadband without a phone plan is better', paragraphs: ['If nobody in the household uses a landline number, a broadband-only package is usually simpler and marginally cheaper. Some providers still describe a package as "broadband-only" even though a Digital Voice capability exists in the background as part of the underlying line, so compare the final advertised price rather than the product label alone, since the presence or absence of a phone feature rarely changes the price meaningfully once full fibre is involved.'] },
    ],
    faqs: [
      { question: 'When is the UK landline switch-off happening?', answer: 'The old analogue PSTN network is being fully retired by 31 January 2027, a date now treated as fixed after Openreach confirmed the technical barriers behind the original December 2025 target were resolved. The number of customers still on the PSTN fell from 5.2 million in July 2024 to 3.2 million in July 2025, so most households have already migrated or will do so well before the final date.' },
      { question: 'Will my phone work in a power cut after switching to Digital Voice?', answer: 'Not without a backup solution, since Digital Voice runs through the broadband router rather than a separately powered line. Ofcom requires providers to guarantee at least one hour of access to emergency services during a power cut, and providers under the industry PSTN Charter have committed to offering backup that exceeds this minimum for telecare and vulnerable-user households specifically.' },
      { question: 'Can I keep my home phone number?', answer: 'Usually, if you request number porting during the order process. Do not cancel the old service first, since that can put the existing number at risk of being lost rather than transferred.' },
      { question: 'Is line rental still charged separately?', answer: 'Increasingly not. The underlying connection cost is now commonly bundled into one broadband price rather than shown as a separate line-rental line item, particularly on full-fibre packages.' },
      { question: 'How much do inclusive call plans cost?', answer: 'It varies by provider and plan. TalkTalk\'s Anytime Calls add-on, for example, costs £12 a month on top of the base broadband price for unlimited UK calls. Compare this against your household\'s actual call volume, since a household that rarely uses the landline may be better off on pay-as-you-go calls instead.' },
    ],
    sources: [
      { label: 'Ofcom guide to the landline switch-over', href: 'https://www.ofcom.org.uk/phones-and-broadband/landline-phones/future-of-landline-calls' },
      { label: 'House of Commons Library: the switch to digital landlines', href: 'https://commonslibrary.parliament.uk/research-briefings/cbp-9471/' },
      { label: 'Ofcom switching guidance', href: 'https://www.ofcom.org.uk/phones-and-broadband/switching-provider/switching-broadband-provider' },
    ],
  },
  btDeals: providerDeal('bt', 'BT', 'Broad UK availability and a large package range', 'Check the personalised speed estimate, annual price-change wording and post-contract price.', 'https://www.bt.com/broadband/deals'),
  skyDeals: providerDeal('sky', 'Sky', 'Households considering broadband alongside Sky TV', 'Check the broadband and TV minimum terms, add-ons and address-level speed.', 'https://www.sky.com/deals/broadband'),
  eeDeals: providerDeal('ee', 'EE', 'Customers who value EE/BT network integration and mobile-related benefits', 'Confirm which benefits apply to the chosen broadband and mobile accounts.', 'https://ee.co.uk/broadband'),
  virginDeals: providerDeal('virgin-media', 'Virgin Media', 'Fast cable or full-fibre tiers and bundle choice where its network is available', 'Confirm availability, upload speed, setup, annual changes and post-contract price.', 'https://www.virginmedia.com/broadband/broadband-deals'),
  satisfaction: {
    path: '/research/uk-broadband-customer-satisfaction', title: 'UK broadband customer satisfaction: evidence dashboard', metaTitle: 'UK Broadband Satisfaction Research 2026',
    metaDescription: 'Independent UK broadband satisfaction research using Ofcom complaints and customer-service evidence, with methodology, limitations and update dates.',
    eyebrow: 'BroadbandPicker research', dek: 'A transparent framework for comparing customer experience without treating review-site scores as objective truth.',
    quickAnswer: 'There is no single definitive “most satisfying” provider. Ofcom complaints, satisfaction surveys and service metrics measure different things. Use regulated complaints data as one objective signal, then combine it with availability, fault handling, contract terms and current customer feedback.',
    updated: '2026-08-01', schemaType: 'Dataset', breadcrumbs: [{ name: 'Home', href: '/' }, { name: 'Research', href: '/research/uk-broadband-customer-satisfaction' }, { name: 'Customer satisfaction', href: '/research/uk-broadband-customer-satisfaction' }],
    table: { title: 'Evidence framework', headers: ['Signal', 'What it measures', 'Limitation'], rows: [['Ofcom complaints', 'Escalated complaints per 100,000 subscribers', 'Covers larger named providers and serious escalations'], ['Ofcom satisfaction survey', 'Reported satisfaction and service experience', 'Survey timing and sample size matter'], ['Public reviews', 'Recent customer sentiment and recurring issues', 'Selection bias and campaigns can distort scores'], ['Provider service commitments', 'Promised support and fault handling', 'A promise is not observed performance']] },
    sections: [
      { heading: 'How to interpret complaints data', paragraphs: ['A lower regulated complaints rate is encouraging, but it is not a complete quality score. Provider mix, customer base and reporting period matter. Look for a sustained pattern across several quarters rather than one rank.'] },
      { heading: 'Why we do not create a false composite score', paragraphs: ['Combining unrelated datasets into one precise number can conceal assumptions. BroadbandPicker keeps the source measures visible and explains weighting when rankings are used. Missing data is labelled rather than estimated.'] },
      { heading: 'Update and correction policy', paragraphs: ['This page is reviewed when Ofcom publishes relevant quarterly complaints or annual customer-service research. We retain the reporting period, source link and limitations. Material corrections are recorded through our editorial process.'] },
    ],
    faqs: [{ question: 'Which broadband provider has the happiest customers?', answer: 'The answer changes by dataset and period. Compare Ofcom satisfaction and complaints evidence rather than relying on one review score.' }, { question: 'Are Trustpilot ratings reliable for broadband?', answer: 'They are useful for themes and recent sentiment but are affected by who chooses to review and provider campaigns.' }, { question: 'How often is the research updated?', answer: 'When Ofcom releases relevant complaints or customer-service datasets, with the reporting period shown.' }],
    sources: [{ label: 'Ofcom telecoms complaints data', href: 'https://www.ofcom.org.uk/phones-and-broadband/service-quality/telecoms-and-pay-tv-complaints' }, { label: 'Ofcom comparing customer service', href: 'https://www.ofcom.org.uk/phones-and-broadband/service-quality/comparing-customer-service' }],
  },
  serviceRankings: {
    path: '/research/broadband-customer-service-rankings-uk',
    title: 'Best customer service broadband provider: UK rankings',
    metaTitle: 'Best Customer Service Broadband Provider UK 2026',
    metaDescription: 'Compare UK broadband customer service using current Ofcom complaints and satisfaction evidence. See why Plusnet is our major-provider starting point.',
    eyebrow: 'Ofcom-evidenced UK research',
    dek: 'Plusnet is our best customer service broadband provider starting point among the major UK providers Ofcom compares. It paired 91% overall satisfaction in Ofcom’s 2024 research with five complaints per 100,000 subscribers in Q4 2025, joint lowest with Virgin Media. Smaller providers require separate survey evidence because Ofcom does not publish directly comparable figures for every ISP.',
    quickAnswer: 'We would start with Plusnet if customer support is the deciding factor and its service is available at your address. Ofcom found 91% of Plusnet broadband customers satisfied overall in 2024, above the 85% sector average. Its five complaints per 100,000 subscribers in Q4 2025 were joint lowest with Virgin Media. Sky is the strongest major-provider alternative across the same evidence.',
    updated: '2026-08-23',
    schemaType: 'Article',
    breadcrumbs: [{ name: 'Home', href: '/' }, { name: 'Research', href: '/research/uk-broadband-customer-satisfaction' }, { name: 'Customer service rankings', href: '/research/broadband-customer-service-rankings-uk' }],
    table: {
      title: 'Ofcom fixed-broadband complaints, Q4 2025',
      headers: ['Provider', 'Complaints per 100,000 subscribers', 'Position against industry average of 7'],
      rows: [
        ['Plusnet', '5', 'Joint lowest'], ['Virgin Media', '5', 'Joint lowest'], ['Sky', '6', 'Below average'], ['EE', '7', 'At average'], ['BT', '8', 'Above average'], ['TalkTalk', '10', 'Joint highest'], ['Vodafone', '10', 'Joint highest'],
      ],
    },
    sections: [
      { heading: 'Our verdict: start with Plusnet, then check your address', paragraphs: [
        'Plusnet has the strongest combined case among the major providers in Ofcom’s named comparisons. Its 91% overall broadband satisfaction in the regulator’s 2024 tracker was statistically above the 85% sector average. Satisfaction with complaint handling was 65%, also above the broadband average of 58%, and its Q4 2025 regulator complaints rate was joint lowest among the reported providers.',
        'Sky is the clearest alternative. It recorded six complaints per 100,000 subscribers in Q4 2025 and 63% complaint-handling satisfaction in 2024. Virgin Media matched Plusnet’s latest complaints rate after a substantial improvement, but its 2024 complaint-handling satisfaction was 53%. Those measurements cover different periods and populations, so we report them separately rather than blending them into an invented score.',
        'Availability still decides the useful shortlist. Plusnet and Sky sell over the Openreach network in much of the UK, while Virgin Media uses its own network footprint. Run a full-address check before comparing the minimum speed guarantee, upload speed, total contract cost and support evidence.'
      ] },
      { heading: 'What the latest Ofcom broadband complaints ranking measures', paragraphs: [
        'Ofcom’s latest official release available during our 23 August 2026 review covers October to December 2025. It records complaints made to the regulator per 100,000 subscribers, allowing named providers of different sizes to be compared. Lower is better. The average for the providers included was seven complaints per 100,000 subscribers.',
        'Plusnet and Virgin Media were joint lowest at five. Sky recorded six, EE seven, BT eight, and TalkTalk and Vodafone each recorded ten. Ofcom says regulator complaints are only a small proportion of complaints made to providers. The figures are therefore a signal of serious escalation, not a count of every fault, billing query or support contact.',
        'Ofcom only names providers whose relevant customer base is large enough for publication. Absence from the table does not mean a smaller provider has no complaints or gives worse support. It means the regulator has not published a directly comparable provider rate in that table.'
      ] },
      { heading: 'Customer satisfaction tells a different part of the story', paragraphs: [
        'Ofcom’s Comparing Customer Service report published in May 2025 covers customer experiences during 2024. Plusnet’s 91% overall broadband satisfaction was above the 85% sector average, while TalkTalk’s 77% was below average. Overall satisfaction reflects the whole broadband experience and is not a pure measure of contact-centre performance.',
        'Among customers who had complained to their provider, EE scored 66% satisfaction with complaint handling, Plusnet 65% and Sky 63%. All three were above the 58% broadband average. TalkTalk at 54% and Virgin Media at 53% were below average. Ofcom survey estimates have confidence intervals, so small numerical differences are not automatically meaningful unless the regulator marks them as statistically different.',
        'Ofcom also states that EE resubmitted some broadband and landline faults information in April 2026 after identifying a discrepancy. We do not use the affected faults figures in this verdict. This keeps the ranking tied to evidence that was not flagged for restatement at the review date.'
      ] },
      { heading: 'How we compare broadband customer service', paragraphs: [
        'No single measure captures support quality. A low complaints rate can indicate fewer severe issues reaching the regulator. Complaint-handling satisfaction asks how people felt after raising a problem. Overall satisfaction also reflects speed, reliability, billing and value. Each answers a different question, so adding them together would create precision the sources do not support.',
        'Our major-provider verdict requires a provider to perform well across more than one current Ofcom measure. We retain each source’s period, population and definition, and do not award points for affiliate relationships. Public reviews are used only to inspect recent themes because reviewers are self-selecting and provider invitation practices differ.',
        'Service should also be judged against the fault a household cannot afford. A home worker may need out-of-hours fault reporting or mobile backup. A vulnerable customer may need accessible contact routes, a nominated user and clear digital-voice power-cut support. These practical requirements can outweigh a small difference in a survey result.'
      ], bullets: [
        'Check phone, chat and accessibility contact hours before ordering.',
        'Ask whether the retailer or a wholesale network controls line repairs and escalation.',
        'Save the order summary, minimum speed guarantee and provider contact routes.',
        'Confirm membership of Ofcom’s automatic compensation scheme and read its limits.',
        'Compare a dated complaints period and survey method, not an undated award badge.'
      ] },
      { heading: 'Where Zen Internet and smaller full-fibre providers fit', paragraphs: [
        'Smaller providers should not be labelled worse because they are absent from Ofcom’s named-provider complaints table. Which?’s January 2026 survey of 5,235 UK adults placed Zen Internet first with an 84% customer score, followed by Hyperoptic at 77%, Community Fibre at 72% and Plusnet at 71%. Which? says its customer score combines satisfaction and likelihood to recommend.',
        'Those Which? customer scores are not interchangeable with Ofcom’s overall satisfaction percentages because the samples and scoring methods differ. They do show why Zen is a serious service-led option where available, and why Hyperoptic or Community Fibre deserves consideration inside its regional footprint. We report the survey as independent corroboration, not as another column in Ofcom’s table.',
        'Our main verdict remains Plusnet because it combines strong results across the regulator’s major-provider measures with broad availability. At an individual address, a well-rated smaller provider with direct control of its fibre network may be the better fit, particularly if it offers clearer technical escalation or fixed in-contract pricing.'
      ] },
      { heading: 'How to use this ranking before signing a contract', paragraphs: [
        'Begin with every network that can actually serve the full address. Remove packages that miss the household’s download, upload or minimum guaranteed speed needs. Then compare support hours, fault escalation, accessibility, router replacement, installation responsibilities and automatic compensation alongside the total minimum-term cost.',
        'Read recent public reviews by theme rather than headline score. Look separately at installation, fault repair, billing and cancellation because a provider can perform differently at each stage. Give more weight to repeated recent accounts with specific dates and outcomes, while remembering that customers with extreme experiences are more likely to post.',
        'If Plusnet is available and the package fits, it is our first major-provider check. Put Sky beside it as the strongest alternative across the current Ofcom evidence. Add Zen, Hyperoptic, Community Fibre or another local network when the address checker shows service, but judge those choices using their own current survey evidence and terms rather than assuming an Ofcom rank that does not exist.'
      ] },
    ],
    faqs: [
      { question: 'Which broadband provider has the best customer service in the UK?', answer: 'Plusnet is our starting choice among the major providers measured by Ofcom. It recorded 91% overall broadband satisfaction in Ofcom’s 2024 tracker and five complaints per 100,000 subscribers in Q4 2025, joint lowest with Virgin Media. This is not a universal league table: smaller providers below Ofcom’s reporting threshold need separate survey evidence.' },
      { question: 'Which broadband provider has the fewest complaints?', answer: 'Plusnet and Virgin Media jointly recorded the fewest complaints among the major fixed-broadband providers in Ofcom’s Q4 2025 release, at five complaints per 100,000 subscribers. Sky followed with six, against an industry average of seven. Ofcom complaints are serious escalations and only a small share of all provider complaints, so they are not a complete customer-service score.' },
      { question: 'Does Ofcom rank every UK broadband provider?', answer: 'No. Ofcom’s quarterly complaints table covers providers above its relevant publication threshold, while its customer-service survey names providers only where the evidence is sufficiently reliable. Smaller providers such as Zen Internet, Hyperoptic and Community Fibre may perform strongly in independent surveys but cannot be inserted into Ofcom’s table without comparable Ofcom data.' },
      { question: 'Is Trustpilot reliable for comparing broadband customer service?', answer: 'Trustpilot can reveal recent themes, provider responses and recurring support problems, but its reviewers are self-selecting and provider review-invitation practices differ. Use it as a recent-sentiment check, not as a substitute for Ofcom’s population-weighted survey or complaints per 100,000 subscribers. Read recent one-, three- and five-star reviews rather than relying on the headline score alone.' },
      { question: 'What should I check before choosing a broadband provider for support?', answer: 'Check whether support is available by phone and chat at the hours you need, how faults are escalated, and whether the provider or a wholesale network controls the repair. Then compare the provider’s latest Ofcom complaints rate, satisfaction evidence, minimum speed guarantee and automatic compensation membership. Confirm availability, price and service terms for your full address before ordering.' },
    ],
    sources: [
      { label: 'Ofcom telecoms and pay-TV complaints report, Q4 2025', href: 'https://www.ofcom.org.uk/phones-and-broadband/service-quality/telecoms-and-pay-tv-complaints', verified: '2026-08-23' },
      { label: 'Ofcom Comparing Customer Service report 2025', href: 'https://www.ofcom.org.uk/siteassets/resources/documents/phones-telecoms-and-internet/comparing-service-quality/2025/comparing-customer-service-report-2025.pdf?v=397528', verified: '2026-08-23' },
      { label: 'Ofcom Comparing Customer Service research hub', href: 'https://www.ofcom.org.uk/phones-and-broadband/service-quality/report', verified: '2026-08-23' },
      { label: 'Which? broadband provider survey 2026', href: 'https://www.which.co.uk/reviews/broadband/article/broadband-provider-reviews/best-broadband-providers-aIIx34f51krz', verified: '2026-08-23' },
      { label: 'Plusnet complaints code of practice', href: 'https://www.plus.net/help/legal/complaints-code-of-practice/', verified: '2026-08-23' },
    ],
  },
  satellite: {
    path: '/guides/satellite-broadband-uk', title: 'Satellite broadband in the UK: providers, costs and alternatives', metaTitle: 'Satellite Broadband UK Guide 2026',
    metaDescription: 'Compare satellite broadband options in the UK, including equipment, latency, data policies and alternatives for rural homes and businesses.',
    eyebrow: 'Rural connectivity guide', dek: 'Satellite can reach places fixed networks cannot, but equipment, sky visibility and latency make it a considered choice rather than an automatic upgrade.',
    quickAnswer: 'Starlink is the most visible low-Earth-orbit option for UK consumers, while specialist satellite resellers may offer other systems and managed services. Satellite is most compelling where usable FTTP, fixed wireless and 4G/5G are unavailable. Check equipment ownership, installation, data policy, latency, power use and cancellation terms.',
    updated: '2026-08-01', schemaType: 'Article', breadcrumbs: guideCrumbs('Satellite broadband UK', '/guides/satellite-broadband-uk'),
    table: { title: 'Satellite versus rural alternatives', headers: ['Connection', 'Strength', 'Trade-off'], rows: [['LEO satellite', 'Wide reach and useful download speeds', 'Equipment, obstruction and variable latency'], ['Fixed wireless', 'Can offer low latency locally', 'Line-of-sight and regional coverage'], ['4G/5G router', 'Fast setup and portable hardware', 'Signal, congestion and data policy'], ['FTTP', 'Usually the strongest long-term fixed option', 'Not available at every rural property']] },
    sections: [
      { heading: 'What affects satellite performance?', paragraphs: ['The dish needs a clear view of the sky. Trees, buildings, heavy weather, network load and satellite handovers can affect consistency. Latency on low-Earth-orbit systems is much lower than traditional geostationary satellite, but results still vary.'] },
      { heading: 'Costs to compare', paragraphs: ['Compare hardware purchase or rental, delivery, mounting, professional installation and the monthly service. Check whether a priority-data allowance applies and what happens after it is used. Avoid quoting an old monthly price without a dated official source.'] },
      { heading: 'Who should consider it?', paragraphs: ['Rural homes with poor copper speeds, farms, temporary sites and businesses needing a physically different backup path may benefit. For ordinary urban homes with FTTP available, fixed fibre is usually simpler.'] },
    ],
    faqs: [{ question: 'Is satellite broadband available everywhere in the UK?', answer: 'Coverage is broad, but service still needs a suitable installation location and clear sky view.' }, { question: 'Is satellite broadband good for gaming?', answer: 'Low-Earth-orbit satellite can support many games, but latency and brief interruptions may be less consistent than fibre.' }, { question: 'Should I choose satellite instead of 5G?', answer: 'Test mobile coverage first. Strong 5G may be cheaper and simpler; satellite is valuable where terrestrial options are weak.' }],
    sources: [{ label: 'Ofcom Connected Nations', href: 'https://www.ofcom.org.uk/phones-and-broadband/coverage-and-speeds/connected-nations' }, { label: 'Starlink UK service plans', href: 'https://www.starlink.com/gb/residential' }, { label: 'UK Gigabit Broadband Voucher Scheme', href: 'https://gigabitvoucher.culture.gov.uk/' }],
  },
  london: {
    path: '/postcode/london', title: 'Broadband providers in London', metaTitle: 'Broadband Providers in London 2026',
    metaDescription: 'Compare broadband providers and networks in London. Understand Openreach, Virgin Media, Community Fibre and Hyperoptic availability by address.',
    eyebrow: 'London broadband hub', dek: 'London has unusually broad network competition, but coverage varies building by building. Start with the full address.',
    quickAnswer: 'Most London addresses can compare several Openreach-based providers, while Virgin Media, Community Fibre and Hyperoptic add independent network choices in covered buildings. There is no single best provider across London: the best value depends on which networks enter the property, the required upload speed and the contract terms.',
    updated: '2026-08-01', schemaType: 'CollectionPage', breadcrumbs: [{ name: 'Home', href: '/' }, { name: 'Broadband by postcode', href: '/postcode' }, { name: 'London', href: '/postcode/london' }],
    table: { title: 'Major London network choices', headers: ['Network/route', 'Where it stands out', 'Availability caveat'], rows: [['Openreach retailers', 'Broad retailer choice across London', 'FTTP status varies by building'], ['Virgin Media', 'Fast tiers and TV bundles', 'Own network does not cover every property'], ['Community Fibre', 'London-focused full fibre and strong upload options', 'Coverage concentrated in enabled areas'], ['Hyperoptic', 'Full fibre in many apartment buildings', 'Building agreement and installation are decisive']] },
    sections: [
      { heading: 'Why London availability is building-specific', paragraphs: ['Flats require access agreements and internal cabling. A network may run along the street without serving every block. New developments may have one pre-installed provider, while older buildings can have several. Always check the flat or unit, not only the outward postcode.'] },
      { heading: 'How to compare London broadband', paragraphs: ['First separate physical networks from retail brands. Then compare minimum speed, upload, scheduled increases, installation, router and total contract cost. Remote workers and creators should pay particular attention to upload speed and backup connectivity.'] },
      { heading: 'London postcode guides', paragraphs: ['Use the postcode hub to move into prefix-level pages for areas such as E1, N1, NW1, SE1, SW1, W1 and WC1. These are navigation and context pages; the final availability result must remain address-specific.'] },
    ],
    faqs: [{ question: 'Who is the fastest broadband provider in London?', answer: 'Several full-fibre and cable networks offer gigabit tiers. The fastest available provider depends on the building.' }, { question: 'Can I get Community Fibre in London?', answer: 'It serves many London areas, but the full address must be checked because coverage is not universal.' }, { question: 'Why does my London flat have fewer choices?', answer: 'Building access, wayleaves and internal cabling can limit networks even when the surrounding street is covered.' }],
    sources: [{ label: 'Ofcom broadband coverage checker', href: 'https://checker.ofcom.org.uk/en-gb/broadband-coverage' }, { label: 'London Datastore connectivity', href: 'https://data.london.gov.uk/' }, { label: 'Ofcom Connected Nations', href: 'https://www.ofcom.org.uk/phones-and-broadband/coverage-and-speeds/connected-nations' }],
  },
  sheffield: {
    path: '/postcode/sheffield', title: 'Broadband providers in Sheffield: coverage and best deals', metaTitle: 'Broadband Providers Sheffield: Coverage and Deals',
    metaDescription: 'Compare broadband providers in Sheffield, including services using Openreach, Virgin Media and CityFibre. Check coverage, speeds and terms for your address.',
    eyebrow: 'Sheffield broadband hub', dek: 'Sheffield households may have a choice of broadband networks and retail providers, but the options can change from one property to the next.',
    quickAnswer: 'Broadband providers in Sheffield include retailers using the Openreach network, alongside Virgin Media and providers selling over CityFibre where those networks reach the property. Local full-fibre availability is not uniform, so there is no citywide best deal. Check the full address first, then compare the speed estimate, upload speed, total contract cost and scheduled price changes.',
    updated: '2026-08-14', schemaType: 'CollectionPage', breadcrumbs: [{ name: 'Home', href: '/' }, { name: 'Broadband by postcode', href: '/postcode' }, { name: 'Sheffield', href: '/postcode/sheffield' }],
    table: { title: 'Main broadband routes to check in Sheffield', headers: ['Network/route', 'Provider choice', 'What to verify'], rows: [
      ['Openreach', 'Retailers include BT, EE, Plusnet, Sky, TalkTalk, Vodafone and Zen', 'Whether FTTP is ready at the exact address and which speed tiers each retailer sells'],
      ['Virgin Media', 'Virgin Media sells services over its own network', 'Property-level availability, upload speed, bundle terms and the technology used'],
      ['CityFibre', 'A wholesale full-fibre network used by participating retail providers', 'Whether the address is live and which retail providers are currently offered'],
      ['Other local networks', 'Smaller full-fibre operators may serve selected Sheffield addresses', 'Installation status, contract terms and support arrangements'],
    ]},
    sections: [
      { heading: 'Which broadband providers cover Sheffield?', paragraphs: ['Sheffield has services delivered over several physical networks. Openreach supports a broad range of retail providers, while Virgin Media operates separately and CityFibre supplies wholesale full fibre to participating internet providers. Smaller network operators may add another choice in selected streets or buildings. A provider name alone does not show which cable reaches a home, so begin with the full address.'] },
      { heading: 'How to find the best broadband deals in Sheffield', paragraphs: ['Run an address check with each network available to the property, then compare the personalised download estimate and any minimum guaranteed speed. Add every monthly payment, setup charge and scheduled increase across the minimum term. Check upload speed, router features, installation timing and the price after the introductory contract before deciding.'] },
      { heading: 'Why Sheffield coverage varies by address', paragraphs: ['Network builds progress street by street, and flats can also depend on building access and internal cabling. An exchange area or postcode may therefore contain homes with different technologies and provider lists. Ofcom, Openreach, CityFibre and GOV.UK all provide coverage tools, but the provider must confirm that a service is orderable at the chosen property.'] },
    ],
    faqs: [
      { question: 'Which broadband providers are available in Sheffield?', answer: 'Sheffield addresses may be served by retail providers using Openreach, Virgin Media, providers using CityFibre, or a smaller local network. The exact list depends on the property, not just the city or outward postcode. Use an address-level checker before comparing prices, because a provider shown elsewhere in Sheffield may not be orderable at your home.' },
      { question: 'Can I get full-fibre broadband in Sheffield?', answer: 'Full fibre is available at some Sheffield addresses through networks including Openreach and CityFibre, with other operators serving selected locations. Coverage is not uniform and a planned build is not the same as a service ready to order. Check the full address with the relevant network, then confirm the available package with the retail provider.' },
      { question: 'What is the best broadband deal in Sheffield?', answer: 'There is no single best Sheffield deal because availability, speed estimates and offers vary by address. Compare the total minimum-term cost of every service you can actually order, including setup charges and scheduled increases. Then weigh download and upload speeds, the minimum guarantee, contract length, router, installation and support against your household’s needs.' },
    ],
    sources: [
      { label: 'Ofcom broadband and mobile coverage checker', href: 'https://www.ofcom.org.uk/phones-and-broadband/coverage-and-speeds/ofcom-checker', verified: '2026-08-14' },
      { label: 'GOV.UK gigabit broadband availability checker', href: 'https://www.gov.uk/guidance/check-your-gigabit-broadband-availability', verified: '2026-08-14' },
      { label: 'Openreach fibre availability checker', href: 'https://www.openreach.com/fibre-checker', verified: '2026-08-14' },
      { label: 'Openreach full-fibre provider list', href: 'https://www.openreach.com/fibre-broadband/fttp-providers', verified: '2026-08-14' },
      { label: 'CityFibre availability and network support', href: 'https://cityfibre.com/help-support', verified: '2026-08-14' },
      { label: 'Sheffield City Council digital connectivity strategy', href: 'https://www.sheffield.gov.uk/your-city-council/digital-connectivity-strategy', verified: '2026-08-14' },
      { label: 'Go.Compare broadband in Sheffield guide', href: 'https://www.gocompare.com/broadband/areas/sheffield/', verified: '2026-08-14' },
    ],
  },
  edinburgh: {
    path: '/postcode/edinburgh', title: 'Broadband providers in Edinburgh: coverage and best deals', metaTitle: 'Broadband Providers Edinburgh: Coverage and Deals',
    metaDescription: 'Compare broadband providers in Edinburgh, including services using Openreach, Virgin Media and CityFibre. Check coverage, speeds and terms for your address.',
    eyebrow: 'Edinburgh broadband hub', dek: 'Broadband providers in Edinburgh include retailers using Openreach, Virgin Media and providers on CityFibre, but the exact choice depends on the property.',
    quickAnswer: 'Broadband providers Edinburgh households can check include retailers using the Openreach network, Virgin Media and providers selling over CityFibre where those networks reach the property. There is no single citywide best deal because availability, speed estimates and offers vary by address. Check the full address first, then compare upload speed, the minimum speed guarantee, total contract cost and scheduled price changes.',
    updated: '2026-08-15', schemaType: 'CollectionPage', breadcrumbs: [{ name: 'Home', href: '/' }, { name: 'Broadband by postcode', href: '/postcode' }, { name: 'Edinburgh', href: '/postcode/edinburgh' }],
    table: { title: 'Main broadband routes to check in Edinburgh', headers: ['Network/route', 'Provider choice', 'What to verify'], rows: [
      ['Openreach', 'A range of retail providers sell services over Openreach', 'Whether FTTP is ready at the exact address and which speed tiers each retailer sells'],
      ['Virgin Media', 'Virgin Media sells broadband over its own network', 'Property-level availability, upload speed, bundle terms and the technology used'],
      ['CityFibre', 'A wholesale full-fibre network used by participating providers', 'Whether the address is live and which retail providers are currently offered'],
      ['Other local networks', 'Building-focused or smaller full-fibre networks may serve selected properties', 'Installation status, building access, contract terms and support arrangements'],
    ]},
    sections: [
      { heading: 'Which broadband providers cover Edinburgh?', paragraphs: ['Edinburgh broadband reaches homes over several physical networks. Openreach supports a range of retail providers, while Virgin Media operates its own network and CityFibre supplies wholesale full fibre to participating providers. Other networks may serve selected streets or buildings. A provider available elsewhere in the city may not serve a particular flat or house, so begin with the full address.'] },
      { heading: 'How to find the best broadband deals in Edinburgh', paragraphs: ['Check every network available at the property, then compare the personalised download estimate and any minimum guaranteed speed. Add monthly payments, setup charges and scheduled increases across the minimum term. Upload speed, router features, installation timing and the price after the introductory contract can all matter more than a short-lived headline offer.'] },
      { heading: 'Why Edinburgh coverage varies by address', paragraphs: ['Network builds progress street by street, while tenements, flats and other shared buildings can require access agreements and internal cabling. Nearby properties can therefore receive different technologies and provider lists. Ofcom, GOV.UK and individual networks provide coverage tools, but a retail provider must confirm that its service is ready to order at the chosen address.'] },
    ],
    faqs: [
      { question: 'Which broadband providers are available in Edinburgh?', answer: 'Edinburgh addresses may be served by retail providers using Openreach, Virgin Media, providers using CityFibre, or another network serving selected properties. The exact list depends on the address rather than the city alone. Use a full-address checker before comparing prices, because a provider shown in another Edinburgh neighbourhood may not be ready to order at your home.' },
      { question: 'Can I get full-fibre broadband in Edinburgh?', answer: 'Full fibre is available at some Edinburgh addresses through networks including Openreach and CityFibre, with other operators serving selected buildings or areas. Coverage is not uniform, and a network near the property is not proof that installation is available. Check the full address with the relevant network, then confirm the package with the chosen retail provider.' },
      { question: 'What is the best broadband deal in Edinburgh?', answer: 'There is no single best Edinburgh deal because networks, speed estimates and offers vary by address. Compare the total minimum-term cost of services you can actually order, including setup charges and scheduled increases. Then weigh download and upload speeds, the minimum guarantee, contract length, router, installation and support against the needs of your household.' },
    ],
    sources: [
      { label: 'Ofcom broadband and mobile coverage checker', href: 'https://www.ofcom.org.uk/phones-and-broadband/coverage-and-speeds/ofcom-checker', verified: '2026-08-15' },
      { label: 'GOV.UK gigabit broadband availability checker', href: 'https://www.gov.uk/guidance/check-your-gigabit-broadband-availability', verified: '2026-08-15' },
      { label: 'Openreach fibre availability checker', href: 'https://www.openreach.com/fibre-checker', verified: '2026-08-15' },
      { label: 'Openreach full-fibre provider list', href: 'https://www.openreach.com/fibre-broadband/fttp-providers', verified: '2026-08-15' },
      { label: 'Virgin Media broadband in Edinburgh', href: 'https://www.virginmedia.com/broadband/edinburgh', verified: '2026-08-15' },
      { label: 'CityFibre Edinburgh network and council housing agreement', href: 'https://cityfibre.com/news/cityfibre-to-deliver-full-fibre-to-council-tenants-across-edinburgh', verified: '2026-08-15' },
      { label: 'Go.Compare broadband in Edinburgh guide', href: 'https://www.gocompare.com/broadband/areas/edinburgh/', verified: '2026-08-15' },
    ],
  },
  glasgow: {
    path: '/postcode/glasgow', title: 'Broadband providers in Glasgow: coverage and best deals', metaTitle: 'Broadband Providers Glasgow: Coverage and Deals',
    metaDescription: 'Compare broadband providers in Glasgow, including services using Openreach, Virgin Media and CityFibre. Check coverage, speeds and terms for your address.',
    eyebrow: 'Glasgow broadband hub', dek: 'Broadband providers in Glasgow include retailers using Openreach, Virgin Media and providers on CityFibre, but the exact choice depends on the property.',
    quickAnswer: 'Broadband providers Glasgow households can check include retailers using the Openreach network, Virgin Media and providers selling over CityFibre where those networks reach the property. There is no single citywide best deal because availability, speed estimates and offers vary by address. Check the full address first, then compare upload speed, the minimum speed guarantee, total contract cost and scheduled price changes.',
    updated: '2026-08-15', schemaType: 'CollectionPage', breadcrumbs: [{ name: 'Home', href: '/' }, { name: 'Broadband by postcode', href: '/postcode' }, { name: 'Glasgow', href: '/postcode/glasgow' }],
    table: { title: 'Main broadband routes to check in Glasgow', headers: ['Network/route', 'Provider choice', 'What to verify'], rows: [
      ['Openreach', 'A range of retail providers sell services over Openreach', 'Whether FTTP is ready at the exact address and which speed tiers each retailer sells'],
      ['Virgin Media', 'Virgin Media sells broadband over its own network', 'Property-level availability, upload speed, bundle terms and the technology used'],
      ['CityFibre', 'A wholesale full-fibre network used by participating providers', 'Whether the address is live and which retail providers are currently offered'],
      ['Other local networks', 'Building-focused or smaller full-fibre networks may serve selected properties', 'Installation status, building access, contract terms and support arrangements'],
    ]},
    sections: [
      { heading: 'Which broadband providers cover Glasgow?', paragraphs: ['Glasgow broadband reaches homes over several physical networks. Openreach supports a range of retail providers, while Virgin Media operates its own network and CityFibre has built full-fibre infrastructure across the city region. Other networks may serve selected streets or buildings. A provider available elsewhere in Glasgow may not serve a particular flat or house, so begin with the full address.'] },
      { heading: 'How to find the best broadband deals in Glasgow', paragraphs: ['Check every network available at the property, then compare the personalised download estimate and any minimum guaranteed speed. Add monthly payments, setup charges and scheduled increases across the minimum term. Upload speed, router features, installation timing and the price after the introductory contract can all matter more than a short-lived headline offer.'] },
      { heading: 'Why Glasgow coverage varies by address', paragraphs: ['Network builds progress street by street, while tenements, flats and other shared buildings can require access agreements and internal cabling. Nearby properties can therefore receive different technologies and provider lists. Ofcom, GOV.UK and individual networks provide coverage tools, but a retail provider must confirm that its service is ready to order at the chosen address.'] },
    ],
    faqs: [
      { question: 'Which broadband providers are available in Glasgow?', answer: 'Glasgow addresses may be served by retail providers using Openreach, Virgin Media, providers using CityFibre, or another network serving selected properties. The exact list depends on the address rather than the city alone. Use a full-address checker before comparing prices, because a provider shown in another Glasgow neighbourhood may not be ready to order at your home.' },
      { question: 'Can I get full-fibre broadband in Glasgow?', answer: 'Full fibre is available at some Glasgow addresses through networks including Openreach and CityFibre, with other operators serving selected buildings or areas. Coverage is not uniform, and a network near the property is not proof that installation is available. Check the full address with the relevant network, then confirm the package with the chosen retail provider.' },
      { question: 'What is the best broadband deal in Glasgow?', answer: 'There is no single best Glasgow deal because networks, speed estimates and offers vary by address. Compare the total minimum-term cost of services you can actually order, including setup charges and scheduled increases. Then weigh download and upload speeds, the minimum guarantee, contract length, router, installation and support against the needs of your household.' },
    ],
    sources: [
      { label: 'Ofcom broadband and mobile coverage checker', href: 'https://www.ofcom.org.uk/phones-and-broadband/coverage-and-speeds/ofcom-checker', verified: '2026-08-15' },
      { label: 'Ofcom Connected Nations 2025', href: 'https://www.ofcom.org.uk/phones-and-broadband/coverage-and-speeds/connected-nations-20252', verified: '2026-08-15' },
      { label: 'GOV.UK gigabit broadband availability checker', href: 'https://www.gov.uk/guidance/check-your-gigabit-broadband-availability', verified: '2026-08-15' },
      { label: 'Openreach fibre availability checker', href: 'https://www.openreach.com/fibre-checker', verified: '2026-08-15' },
      { label: 'Openreach full-fibre provider list', href: 'https://www.openreach.com/fibre-broadband/fttp-providers', verified: '2026-08-15' },
      { label: 'Virgin Media broadband and postcode checker', href: 'https://www.virginmedia.com/broadband/postcode-checker', verified: '2026-08-15' },
      { label: 'CityFibre Glasgow full-fibre rollout', href: 'https://cityfibre.com/news/glasgow-to-get-full-fibre-boost-as-cityfibre-begins-work-on-city-wide-roll-out', verified: '2026-08-15' },
      { label: 'Go.Compare broadband in Glasgow guide', href: 'https://www.gocompare.com/broadband/areas/glasgow/', verified: '2026-08-15' },
    ],
  },
  liverpool: {
    path: '/postcode/liverpool', title: 'Broadband providers in Liverpool: coverage and best deals', metaTitle: 'Broadband Providers Liverpool: Coverage and Deals',
    metaDescription: 'Compare broadband providers in Liverpool, including services using Openreach, Virgin Media and CityFibre. Check coverage, speeds and terms for your address.',
    eyebrow: 'Liverpool broadband hub', dek: 'Broadband providers in Liverpool include retailers using Openreach, Virgin Media and providers on CityFibre, but the exact choice depends on the property.',
    quickAnswer: 'The broadband providers Liverpool households can check include retailers using the Openreach network, Virgin Media and providers selling over CityFibre where those networks reach the property. There is no single citywide best deal because availability, speed estimates and offers vary by address. Check the full address first, then compare upload speed, the minimum speed guarantee, total contract cost and scheduled price changes.',
    updated: '2026-08-15', schemaType: 'CollectionPage', breadcrumbs: [{ name: 'Home', href: '/' }, { name: 'Broadband by postcode', href: '/postcode' }, { name: 'Liverpool', href: '/postcode/liverpool' }],
    table: { title: 'Main broadband routes to check in Liverpool', headers: ['Network/route', 'Provider choice', 'What to verify'], rows: [
      ['Openreach', 'A range of retail providers sell services over Openreach', 'Whether FTTP is ready at the exact address and which speed tiers each retailer sells'],
      ['Virgin Media', 'Virgin Media sells broadband over its own network', 'Property-level availability, upload speed, bundle terms and the technology used'],
      ['CityFibre', 'A wholesale full-fibre network used by participating providers', 'Whether the address is live and which retail providers are currently offered'],
      ['Other local networks', 'Building-focused or smaller full-fibre networks may serve selected properties', 'Installation status, building access, contract terms and support arrangements'],
    ]},
    sections: [
      { heading: 'Which broadband providers cover Liverpool?', paragraphs: ['Liverpool broadband reaches homes over several physical networks. Openreach supports a range of retail providers, while Virgin Media operates its own network and CityFibre supplies wholesale full fibre to participating providers. Other networks may serve selected streets or buildings. A provider available elsewhere in Liverpool may not serve a particular flat or house, so begin with the full address.'] },
      { heading: 'How to find the best broadband deals in Liverpool', paragraphs: ['Check every network available at the property, then compare the personalised download estimate and any minimum guaranteed speed. Add monthly payments, setup charges and scheduled increases across the minimum term. Upload speed, router features, installation timing and the price after the introductory contract can all matter more than a short-lived headline offer.'] },
      { heading: 'Why Liverpool coverage varies by address', paragraphs: ['Network builds progress street by street, while flats and other shared buildings can require access agreements and internal cabling. Nearby properties can therefore receive different technologies and provider lists. Ofcom, GOV.UK and individual networks provide coverage tools, but a retail provider must confirm that its service is ready to order at the chosen address.'] },
    ],
    faqs: [
      { question: 'Which broadband providers are available in Liverpool?', answer: 'Liverpool addresses may be served by retail providers using Openreach, Virgin Media, providers using CityFibre, or another network serving selected properties. The exact list depends on the address rather than the city alone. Use a full-address checker before comparing prices, because a provider shown in another Liverpool neighbourhood may not be ready to order at your home.' },
      { question: 'Can I get full-fibre broadband in Liverpool?', answer: 'Full fibre is available at some Liverpool addresses through networks including Openreach and CityFibre, with other operators serving selected buildings or areas. Coverage is not uniform, and a network near the property is not proof that installation is available. Check the full address with the relevant network, then confirm the package with the chosen retail provider.' },
      { question: 'What is the best broadband deal in Liverpool?', answer: 'There is no single best Liverpool deal because networks, speed estimates and offers vary by address. Compare the total minimum-term cost of services you can actually order, including setup charges and scheduled increases. Then weigh download and upload speeds, the minimum guarantee, contract length, router, installation and support against the needs of your household.' },
    ],
    sources: [
      { label: 'Ofcom broadband and mobile coverage checker', href: 'https://www.ofcom.org.uk/phones-and-broadband/coverage-and-speeds/ofcom-checker', verified: '2026-08-15' },
      { label: 'GOV.UK gigabit broadband availability checker', href: 'https://www.gov.uk/guidance/check-your-gigabit-broadband-availability', verified: '2026-08-15' },
      { label: 'Openreach fibre availability checker', href: 'https://www.openreach.com/fibre-checker', verified: '2026-08-15' },
      { label: 'Openreach full-fibre provider list', href: 'https://www.openreach.com/fibre-broadband/fttp-providers', verified: '2026-08-15' },
      { label: 'Virgin Media broadband and postcode checker', href: 'https://www.virginmedia.com/broadband/postcode-checker', verified: '2026-08-15' },
      { label: 'CityFibre rollout and availability checker', href: 'https://cityfibre.com/about-us/rollout', verified: '2026-08-15' },
      { label: 'Go.Compare broadband in Liverpool guide', href: 'https://www.gocompare.com/broadband/areas/liverpool/', verified: '2026-08-15' },
    ],
  },
  leeds: {
    path: '/postcode/leeds', title: 'Broadband providers in Leeds: coverage and best deals', metaTitle: 'Broadband Providers Leeds: Coverage and Deals',
    metaDescription: 'Compare broadband providers in Leeds, including services using Openreach, Virgin Media and CityFibre. Check coverage, speeds and terms for your address.',
    eyebrow: 'Leeds broadband hub', dek: 'Broadband providers in Leeds include retailers using Openreach, Virgin Media and providers on CityFibre, but the exact choice depends on the property.',
    quickAnswer: 'Broadband providers Leeds households can check include retailers using the Openreach network, Virgin Media and providers selling over CityFibre where those networks reach the property. There is no single citywide best deal because availability, speed estimates and offers vary by address. Check the full address first, then compare upload speed, the minimum speed guarantee, total contract cost and scheduled price changes.',
    updated: '2026-08-15', schemaType: 'CollectionPage', breadcrumbs: [{ name: 'Home', href: '/' }, { name: 'Broadband by postcode', href: '/postcode' }, { name: 'Leeds', href: '/postcode/leeds' }],
    table: { title: 'Main broadband routes to check in Leeds', headers: ['Network/route', 'Provider choice', 'What to verify'], rows: [
      ['Openreach', 'A range of retail providers sell services over Openreach', 'Whether FTTP is ready at the exact address and which speed tiers each retailer sells'],
      ['Virgin Media', 'Virgin Media sells broadband over its own network', 'Property-level availability, upload speed, bundle terms and the technology used'],
      ['CityFibre', 'A wholesale full-fibre network used by participating providers', 'Whether the address is live and which retail providers are currently offered'],
      ['Other local networks', 'Building-focused or smaller full-fibre networks may serve selected properties', 'Installation status, building access, contract terms and support arrangements'],
    ]},
    sections: [
      { heading: 'Which broadband providers cover Leeds?', paragraphs: ['Leeds broadband reaches homes over several physical networks. Openreach supports a range of retail providers, while Virgin Media operates its own network and CityFibre has rolled out full-fibre infrastructure across the city. Other networks may serve selected streets or buildings. A provider available elsewhere in Leeds may not serve a particular flat or house, so begin with the full address.'] },
      { heading: 'How to find the best broadband deals in Leeds', paragraphs: ['Check every network available at the property, then compare the personalised download estimate and any minimum guaranteed speed. Add monthly payments, setup charges and scheduled increases across the minimum term. Upload speed, router features, installation timing and the price after the introductory contract can all matter more than a short-lived headline offer.'] },
      { heading: 'Why Leeds coverage varies by address', paragraphs: ['Network builds progress street by street, while flats and other shared buildings can require access agreements and internal cabling. Nearby properties can therefore receive different technologies and provider lists. Ofcom, GOV.UK and individual networks provide coverage tools, but a retail provider must confirm that its service is ready to order at the chosen address.'] },
    ],
    faqs: [
      { question: 'Which broadband providers are available in Leeds?', answer: 'Leeds addresses may be served by retail providers using Openreach, Virgin Media, providers using CityFibre, or another network serving selected properties. The exact list depends on the address rather than the city alone. Use a full-address checker before comparing prices, because a provider shown in another Leeds neighbourhood may not be ready to order at your home.' },
      { question: 'Can I get full-fibre broadband in Leeds?', answer: 'Full fibre is available at some Leeds addresses through networks including Openreach and CityFibre, with other operators serving selected buildings or areas. Coverage is not uniform, and a network near the property is not proof that installation is available. Check the full address with the relevant network, then confirm the package with the chosen retail provider.' },
      { question: 'What is the best broadband deal in Leeds?', answer: 'There is no single best Leeds deal because networks, speed estimates and offers vary by address. Compare the total minimum-term cost of services you can actually order, including setup charges and scheduled increases. Then weigh download and upload speeds, the minimum guarantee, contract length, router, installation and support against the needs of your household.' },
    ],
    sources: [
      { label: 'Ofcom broadband and mobile coverage checker', href: 'https://www.ofcom.org.uk/phones-and-broadband/coverage-and-speeds/ofcom-checker', verified: '2026-08-15' },
      { label: 'GOV.UK gigabit broadband availability checker', href: 'https://www.gov.uk/guidance/check-your-gigabit-broadband-availability', verified: '2026-08-15' },
      { label: 'Openreach fibre availability checker', href: 'https://www.openreach.com/fibre-checker', verified: '2026-08-15' },
      { label: 'Openreach full-fibre provider list', href: 'https://www.openreach.com/fibre-broadband/fttp-providers', verified: '2026-08-15' },
      { label: 'Virgin Media broadband and postcode checker', href: 'https://www.virginmedia.com/broadband/postcode-checker', verified: '2026-08-15' },
      { label: 'CityFibre full-fibre rollout in Leeds', href: 'https://cityfibre.com/news/leeds-set-to-enjoy-economic-boost-of-over-1-4-billion-from-cityfibres-full-fibre-rollout', verified: '2026-08-15' },
      { label: 'Go.Compare broadband in Leeds guide', href: 'https://www.gocompare.com/broadband/areas/leeds/', verified: '2026-08-15' },
    ],
  },
  bristol: {
    path: '/postcode/bristol', title: 'Broadband providers in Bristol: coverage and best deals', metaTitle: 'Broadband Providers Bristol: Coverage and Deals',
    metaDescription: 'Compare broadband providers in Bristol, including services using Openreach, Virgin Media and local full-fibre networks. Check coverage and terms by address.',
    eyebrow: 'Bristol broadband hub', dek: 'Broadband providers in Bristol include retailers using Openreach, Virgin Media and local full-fibre networks, but the exact choice depends on the property.',
    quickAnswer: 'Broadband providers Bristol households can check include retailers using Openreach, Virgin Media and local full-fibre networks such as Truespeed where they reach the property. There is no universal best deal across Bristol because coverage, speed estimates and offers vary by address. Check the full address first, then compare upload speed, the minimum speed guarantee, total contract cost and scheduled price changes.',
    updated: '2026-08-16', schemaType: 'CollectionPage', breadcrumbs: [{ name: 'Home', href: '/' }, { name: 'Broadband by postcode', href: '/postcode' }, { name: 'Bristol', href: '/postcode/bristol' }],
    table: { title: 'Main broadband routes to check in Bristol', headers: ['Network/route', 'Provider choice', 'What to verify'], rows: [
      ['Openreach', 'A range of retail providers sell services over Openreach', 'Whether FTTP is ready at the exact address and which speed tiers each retailer sells'],
      ['Virgin Media', 'Virgin Media sells broadband over its own network', 'Property-level availability, upload speed, bundle terms and the technology used'],
      ['Truespeed', 'A regional full-fibre network serving parts of Bristol and the South West', 'Whether the property can order now, the upload speed and the fixed-price terms'],
      ['Other local networks', 'Building-focused or smaller full-fibre networks may serve selected properties', 'Installation status, building access, contract terms and support arrangements'],
    ]},
    sections: [
      { heading: 'Which broadband providers cover Bristol?', paragraphs: ['Bristol broadband reaches homes over several physical networks. Openreach supports a range of retail providers, Virgin Media operates its own network, and Truespeed says it has built full fibre across parts of Bristol and the South West. Openreach reported in February 2026 that its full fibre reached more than 165,000 Bristol homes and businesses, or over 75% of properties in the area. These are separate network claims and do not prove that any particular address can order a service.'] },
      { heading: 'How to find the best broadband deals in Bristol', paragraphs: ['Check every network available at the property, then compare the personalised download estimate and any minimum guaranteed speed. Add monthly payments, setup charges and scheduled increases across the minimum term. Upload speed, router features, installation timing and the price after the introductory contract can all matter more than a short-lived headline offer.'] },
      { heading: 'Why Bristol coverage varies by address', paragraphs: ['Network builds progress street by street, while flats and other shared buildings can require access agreements and internal cabling. Nearby properties can therefore receive different technologies and provider lists. Ofcom, GOV.UK and individual networks provide coverage tools, but their methods and update schedules differ. A retail provider must confirm that its service is ready to order at the chosen address.'] },
    ],
    faqs: [
      { question: 'Which broadband providers are available in Bristol?', answer: 'Bristol addresses may be served by retail providers using Openreach, Virgin Media, Truespeed or another network serving selected properties. The exact list depends on the address rather than the city alone. Use a full-address checker before comparing prices, because a provider shown in another Bristol neighbourhood may not be ready to order at your home.' },
      { question: 'Can I get full-fibre broadband in Bristol?', answer: 'Full fibre is available at many Bristol addresses, but coverage is not uniform. Openreach reported that its network reached more than 165,000 local premises in February 2026, while Truespeed publishes its own Bristol availability page. Check the full address with each relevant network, then confirm the package and installation status with the chosen retail provider.' },
      { question: 'What is the best broadband deal in Bristol?', answer: 'There is no single best Bristol deal because networks, speed estimates and offers vary by address. Compare the total minimum-term cost of services you can actually order, including setup charges and scheduled increases. Then weigh download and upload speeds, the minimum guarantee, contract length, router, installation and support against the needs of your household.' },
    ],
    sources: [
      { label: 'Ofcom broadband and mobile coverage checker', href: 'https://www.ofcom.org.uk/phones-and-broadband/coverage-and-speeds/ofcom-checker', verified: '2026-08-16' },
      { label: 'GOV.UK gigabit broadband availability checker', href: 'https://www.gov.uk/guidance/check-your-gigabit-broadband-availability', verified: '2026-08-16' },
      { label: 'Openreach Bristol full-fibre update', href: 'https://www.openreach.com/news/thousands-in-bristol-yet-to-benefit-from-major-broadband-upgrade/', verified: '2026-08-16' },
      { label: 'Openreach fibre availability checker', href: 'https://www.openreach.com/fibre-checker', verified: '2026-08-16' },
      { label: 'Virgin Media broadband and postcode checker', href: 'https://www.virginmedia.com/broadband/postcode-checker', verified: '2026-08-16' },
      { label: 'Truespeed full-fibre broadband in Bristol', href: 'https://www.truespeed.com/locations/bristol/', verified: '2026-08-16' },
      { label: 'Go.Compare broadband in Bristol guide', href: 'https://www.gocompare.com/broadband/areas/bristol/', verified: '2026-08-16' },
    ],
  },
  birmingham: {
    path: '/postcode/birmingham', title: 'Broadband providers in Birmingham: coverage and best deals', metaTitle: 'Broadband Providers Birmingham: Coverage and Deals',
    metaDescription: 'Compare broadband providers in Birmingham, including services using Openreach, Virgin Media, CityFibre and local full-fibre networks. Check by address.',
    eyebrow: 'Birmingham broadband hub', dek: 'Broadband providers in Birmingham include retailers using Openreach, Virgin Media, CityFibre providers and local full-fibre networks, subject to the exact property.',
    quickAnswer: 'Broadband providers Birmingham households can check include retailers using Openreach, Virgin Media, providers selling over CityFibre and local full-fibre networks such as Brsk where they reach the property. There is no universal best deal across Birmingham because network availability, speed estimates and offers vary by address. Check the full address first, then compare upload speed, the minimum speed guarantee, total contract cost and scheduled price changes.',
    updated: '2026-08-16', schemaType: 'CollectionPage', breadcrumbs: [{ name: 'Home', href: '/' }, { name: 'Broadband by postcode', href: '/postcode' }, { name: 'Birmingham', href: '/postcode/birmingham' }],
    table: { title: 'Main broadband routes to check in Birmingham', headers: ['Network/route', 'Provider choice', 'What to verify'], rows: [
      ['Openreach', 'A range of retail providers sell services over Openreach', 'Whether FTTP is ready at the exact address and which speed tiers each retailer sells'],
      ['Virgin Media', 'Virgin Media sells broadband over its own network', 'Property-level availability, upload speed, bundle terms and the technology used'],
      ['CityFibre', 'A wholesale full-fibre network used by participating providers', 'Whether the address is live and which retail providers are currently offered'],
      ['Brsk and other local networks', 'Independent or building-focused full-fibre networks may serve selected properties', 'Installation status, building access, contract terms and support arrangements'],
    ]},
    sections: [
      { heading: 'Which broadband providers cover Birmingham?', paragraphs: ['Birmingham broadband reaches homes over several physical networks. Openreach supports a range of retail providers, Virgin Media operates its own network, and CityFibre supplies wholesale full fibre to participating providers. Brsk also identifies Birmingham as one of the areas served by its independent full-fibre network. These network footprints are separate and none proves that a particular address can order, so begin with the full property details.'] },
      { heading: 'How to find the best broadband deals in Birmingham', paragraphs: ['Check every network available at the property, then compare the personalised download estimate and any minimum guaranteed speed. Add monthly payments, setup charges and scheduled increases across the minimum term. Upload speed, router features, installation timing and the price after the introductory contract can all matter more than a short-lived headline offer.'] },
      { heading: 'Why Birmingham coverage varies by address', paragraphs: ['Network builds progress street by street, while flats and other shared buildings can require access agreements and internal cabling. Nearby properties can therefore receive different technologies and provider lists. Ofcom, GOV.UK and individual networks provide coverage tools, but their methods and update schedules differ. A retail provider must confirm that its service is ready to order at the chosen address.'] },
    ],
    faqs: [
      { question: 'Which broadband providers are available in Birmingham?', answer: 'Birmingham addresses may be served by retail providers using Openreach, Virgin Media, providers using CityFibre, Brsk or another network serving selected properties. The exact list depends on the address rather than the city alone. Use a full-address checker before comparing prices, because a provider shown in another Birmingham neighbourhood may not be ready to order at your home.' },
      { question: 'Can I get full-fibre broadband in Birmingham?', answer: 'Full fibre is available at some Birmingham addresses through Openreach, CityFibre, Brsk and other networks, but coverage is not uniform. A network operating in the city is not proof that an individual property is connected. Check the full address with each relevant network, then confirm the available package and installation status with the chosen retail provider.' },
      { question: 'What is the best broadband deal in Birmingham?', answer: 'There is no single best Birmingham deal because networks, speed estimates and offers vary by address. Compare the total minimum-term cost of services you can actually order, including setup charges and scheduled increases. Then weigh download and upload speeds, the minimum guarantee, contract length, router, installation and support against the needs of your household.' },
    ],
    sources: [
      { label: 'Ofcom broadband and mobile coverage checker', href: 'https://www.ofcom.org.uk/phones-and-broadband/coverage-and-speeds/ofcom-checker', verified: '2026-08-16' },
      { label: 'Ofcom Connected Nations 2025', href: 'https://www.ofcom.org.uk/phones-and-broadband/coverage-and-speeds/connected-nations-interactive-report-2025', verified: '2026-08-16' },
      { label: 'GOV.UK gigabit broadband availability checker', href: 'https://www.gov.uk/guidance/check-your-gigabit-broadband-availability', verified: '2026-08-16' },
      { label: 'Openreach fibre availability checker', href: 'https://www.openreach.com/fibre-checker', verified: '2026-08-16' },
      { label: 'Openreach full-fibre provider list', href: 'https://www.openreach.com/fibre-broadband/fttp-providers', verified: '2026-08-16' },
      { label: 'Virgin Media broadband and postcode checker', href: 'https://www.virginmedia.com/broadband/postcode-checker', verified: '2026-08-16' },
      { label: 'CityFibre rollout and availability checker', href: 'https://cityfibre.com/about-us/rollout', verified: '2026-08-16' },
      { label: 'Brsk Birmingham full-fibre availability', href: 'https://www.brsk.co.uk/locations/birmingham', verified: '2026-08-16' },
      { label: 'Go.Compare broadband in Birmingham guide', href: 'https://www.gocompare.com/broadband/areas/birmingham/', verified: '2026-08-16' },
    ],
  },
  manchester: {
    path: '/postcode/manchester', title: 'Broadband providers in Manchester: coverage and best deals', metaTitle: 'Broadband Providers Manchester: Coverage and Deals',
    metaDescription: 'Compare broadband providers in Manchester, including services using Openreach, Virgin Media and alternative full-fibre networks. Check your address.',
    eyebrow: 'Manchester broadband hub', dek: 'Broadband providers Manchester households can consider include retailers using Openreach, Virgin Media and alternative full-fibre networks, but the exact choice depends on the property.',
    quickAnswer: 'Broadband providers Manchester households may find include retailers using Openreach, Virgin Media and alternative full-fibre networks serving selected streets or buildings. There is no universal best provider or deal for the city because network access, speed estimates and offers vary by address. Check the full property first, then compare the minimum guaranteed speed, upload speed, total contract cost, scheduled price changes and installation requirements.',
    updated: '2026-08-16', schemaType: 'CollectionPage', breadcrumbs: [{ name: 'Home', href: '/' }, { name: 'Broadband by postcode', href: '/postcode' }, { name: 'Manchester', href: '/postcode/manchester' }],
    table: { title: 'Main broadband routes to check in Manchester', headers: ['Network/route', 'Provider choice', 'What to verify'], rows: [
      ['Openreach', 'A range of retail providers sell services over Openreach', 'Whether FTTP is ready at the exact address and which speed tiers each retailer sells'],
      ['Virgin Media', 'Virgin Media sells broadband over its own network', 'Property-level availability, upload speed, bundle terms and the connection technology'],
      ['Alternative full-fibre networks', 'Networks such as Freedom Fibre and building-focused operators may serve selected locations', 'Whether the property is live, which retail provider sells the service and any installation requirements'],
      ['Mobile broadband', 'EE, O2, Three and Vodafone sell 4G or 5G home-broadband options', 'Indoor signal at the property, data terms, expected performance and whether an external antenna is needed'],
    ]},
    sections: [
      { heading: 'Which broadband providers cover Manchester?', paragraphs: ['Manchester homes can receive broadband over several physical networks. Openreach supports many retail providers, Virgin Media operates its own network, and alternative networks may cover selected streets or apartment buildings. A provider operating somewhere in Manchester does not prove that it can serve a particular home. Use the full address with Ofcom and the relevant network checkers before comparing packages.'] },
      { heading: 'How to find the best broadband deals in Manchester', paragraphs: ['Start with services that are ready to order at the property, then compare the personalised download estimate and any minimum guaranteed speed. Add monthly payments, setup charges and scheduled increases across the minimum term. Upload speed, router features, installation timing, support and the post-contract price can be more important than a temporary headline discount. There is no universal winner across Manchester.'] },
      { heading: 'Why Manchester coverage varies by address', paragraphs: ['Network builds progress street by street, while flats, converted buildings and other shared premises can require a wayleave and internal cabling. Nearby homes may therefore receive different technologies and provider lists. Ofcom, GOV.UK and network checkers also use different source data and update schedules, so their results should be considered separately and the chosen retail provider should confirm that service is ready to order.'] },
    ],
    faqs: [
      { question: 'Which broadband providers are available in Manchester?', answer: 'Manchester addresses may be served by retail providers using Openreach, Virgin Media, an alternative full-fibre network or a mobile broadband operator. The exact list depends on the property rather than the city name alone. Use a full-address checker before comparing prices, because a provider available elsewhere in Manchester may not be ready to order at your home.' },
      { question: 'Can I get full-fibre broadband in Manchester?', answer: 'Full fibre is available at some Manchester addresses through Openreach and alternative networks, but coverage is not uniform. A network operating in Manchester or Greater Manchester is not proof that an individual property is connected. Check the complete address with relevant network checkers, then confirm the package, installation status and expected activation date with the chosen retail provider.' },
      { question: 'What is the best broadband deal in Manchester?', answer: 'There is no single best Manchester broadband deal because network availability, speed estimates and current offers vary by address. Compare the total minimum-term cost of services you can actually order, including setup charges and scheduled increases. Then weigh download and upload speeds, the minimum guarantee, contract length, router, installation and support against your household’s needs.' },
    ],
    sources: [
      { label: 'Ofcom broadband availability checker', href: 'https://checker.ofcom.org.uk/en-gb/broadband-coverage', verified: '2026-08-16' },
      { label: 'Ofcom Connected Nations 2025', href: 'https://www.ofcom.org.uk/phones-and-broadband/coverage-and-speeds/connected-nations-20252', verified: '2026-08-16' },
      { label: 'GOV.UK gigabit broadband availability checker', href: 'https://www.gov.uk/guidance/check-your-gigabit-broadband-availability', verified: '2026-08-16' },
      { label: 'Openreach fibre availability checker', href: 'https://www.openreach.com/fibre-checker', verified: '2026-08-16' },
      { label: 'Openreach full-fibre provider list', href: 'https://www.openreach.com/fibre-broadband/fttp-providers', verified: '2026-08-16' },
      { label: 'Virgin Media broadband and postcode checker', href: 'https://www.virginmedia.com/broadband/postcode-checker', verified: '2026-08-16' },
      { label: 'Freedom Fibre residential availability checker', href: 'https://www.freedomfibre.com/residential', verified: '2026-08-16' },
      { label: 'Go.Compare broadband in Manchester guide', href: 'https://www.gocompare.com/broadband/areas/manchester/', verified: '2026-08-16' },
    ],
  },
}

function providerDeal(slug: string, provider: string, bestFor: string, caution: string, officialUrl: string): Page {
  const path = `/providers/${slug}/deals`
  return {
    path, title: `${provider} broadband deals`, metaTitle: `${provider} Broadband Deals UK 2026`,
    metaDescription: `Review current ${provider} broadband deal types, contract costs, speeds and key terms. Check live availability and pricing for your postcode.`,
    eyebrow: 'Provider deal guide', dek: `An independent guide to comparing ${provider} offers without relying on a stale headline price.`,
    quickAnswer: `${provider} is best considered for ${bestFor}. ${caution} Because offers differ by address and can change, this page explains how to judge the live deal shown by the provider rather than presenting one price as universally available.`,
    updated: '2026-08-01', schemaType: 'Article', breadcrumbs: providerCrumbs(`${provider} deals`, path),
    table: { title: `How to assess a ${provider} offer`, headers: ['Check', 'Why it matters', 'Evidence to save'], rows: [['Address result', 'Networks and speeds vary by property', 'Personalised speed estimate'], ['Minimum term', 'Determines commitment and total cost', 'Order summary and contract'], ['Price changes', 'Headline price may not stay fixed', 'Pounds-and-pence schedule'], ['After-contract price', 'Cost may rise when the term ends', 'End-of-discount notice'], ['Extras', 'Rewards and bundles can distort value', 'Eligibility and claim deadline']] },
    sections: [
      { heading: `Who should shortlist ${provider}?`, paragraphs: [`${provider} can be a strong option when its available speed, support model and bundle fit match the household. Compare it with at least one provider on a different network where possible, because network choice can matter as much as brand.`] },
      { heading: 'Compare total contract cost', paragraphs: ['Multiply each scheduled monthly price by the months it applies, then add setup, delivery and required add-ons. Subtract a reward only if you are likely to claim it successfully. Keep optional TV, calls or mobile benefits separate so the broadband comparison stays clear.'] },
      { heading: 'Our affiliate and ranking rule', paragraphs: ['A commercial relationship does not make an offer “best”. We look at address availability, total cost, speed estimate, terms and household fit. If no live affiliate feed is available, we link to the official provider page and avoid inventing a current price.'] },
    ],
    faqs: [{ question: `How do I find the cheapest ${provider} broadband deal?`, answer: 'Run the address check and compare the total minimum-term cost, not just the first monthly price. Existing-customer and new-customer offers may differ.' }, { question: `Are ${provider} deals available everywhere?`, answer: 'No. Technology, speed tiers and offers vary by address, so the full postcode and property are required.' }, { question: 'Can the price increase during the contract?', answer: 'It may. Check the contract summary for exact pounds-and-pence changes and the dates they apply.' }],
    sources: [{ label: `${provider} official broadband offers`, href: officialUrl }, { label: 'Ofcom clear pricing before purchase', href: 'https://www.ofcom.org.uk/phones-and-broadband/coverage-and-speeds/clear-information-before-you-buy-broadband' }, { label: 'Ofcom switching guidance', href: 'https://www.ofcom.org.uk/phones-and-broadband/switching-provider/switching-broadband-provider' }],
  }
}
