export type PriorityPageKey = 'business' | 'postcode' | 'phone' | 'btDeals' | 'skyDeals' | 'eeDeals' | 'virginDeals' | 'satisfaction' | 'satellite' | 'london'

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
  sources: { label: string; href: string }[]
}

const guideCrumbs = (name: string, path: string) => [{ name: 'Home', href: '/' }, { name: 'Guides', href: '/guides' }, { name, href: path }]
const providerCrumbs = (name: string, path: string) => [{ name: 'Home', href: '/' }, { name: 'Providers', href: '/providers' }, { name, href: path }]

export const priorityPages: Record<PriorityPageKey, Page> = {
  business: {
    path: '/guides/best-business-broadband-providers-uk', title: 'Best business broadband providers in the UK',
    metaTitle: 'Best Business Broadband Providers UK 2026', metaDescription: 'Compare UK business broadband providers by service support, static IP, backup connectivity, FTTP and leased-line options. Independent 2026 guide.',
    eyebrow: 'Business broadband comparison', dek: 'A practical shortlist for sole traders, small offices and growing companies—based on resilience, support and network requirements rather than headline speed alone.',
    quickAnswer: 'BT Business is a sensible nationwide starting point when coverage and hybrid backup matter; Virgin Media Business can suit premises on its network; Vodafone Business is worth checking for converged mobile and fixed connectivity; and specialist providers or leased-line brokers become more relevant when symmetric capacity and a contractual repair target are essential. The best choice is the one available at your premises with an SLA your business can actually rely on.',
    updated: '2026-08-01', schemaType: 'Article', breadcrumbs: guideCrumbs('Business broadband providers', '/guides/best-business-broadband-providers-uk'),
    table: { title: 'Business broadband shortlist by need', headers: ['Need', 'Starting shortlist', 'What to verify'], rows: [
      ['Sole trader or home office', 'BT Business, Vodafone Business, local FTTP options', 'VAT-inclusive cost, support hours and static IP'],
      ['Small office needing resilience', 'BT Business with backup, Virgin Media Business, managed providers', 'Failover network, fault target and router capability'],
      ['Cloud, VoIP or frequent uploads', 'Symmetric FTTP where available or a leased line', 'Committed upload, latency, contention and SLA'],
      ['Multiple sites or critical operations', 'Managed WAN or leased-line specialist', 'Diverse routing, account management and service credits'],
    ]},
    sections: [
      { heading: 'What makes business broadband different?', paragraphs: ['Business packages can add static IP addresses, business support, security controls, guest Wi-Fi and clearer fault-response commitments. Those features—not the word “business”—justify paying more. A basic business FTTP service may still share network capacity, while a leased line is a dedicated product with symmetric bandwidth and a more formal SLA.'], bullets: ['Static IP for VPNs, allow-lists, CCTV or hosted services', 'A stated repair target and escalation path', '4G or 5G backup using a genuinely independent connection', 'Upload capacity for cloud files, calls and off-site backups'] },
      { heading: 'Business broadband or leased line?', paragraphs: ['Choose business FTTP when cost matters and occasional degradation is tolerable. Consider a leased line when an outage has a measurable business cost, upload demand is sustained, or you need committed symmetric bandwidth. Installation lead time and excess construction charges can make leased lines unsuitable for short leases.'] },
      { heading: 'How we would choose for an SME', paragraphs: ['Write down the operational cost of one hour offline, the number of simultaneous users and the applications that must stay available. Then compare the total contract cost excluding and including VAT, installation, router, backup service and IP charges. Never accept “up to” speed as a substitute for a clear service commitment.'] },
    ],
    faqs: [
      { question: 'Is business broadband worth it for a sole trader?', answer: 'It can be if you need a static IP, business support or faster fault handling. If those features have no practical value, a residential service with a separate mobile backup may be more economical.' },
      { question: 'Does business broadband guarantee uptime?', answer: 'Not automatically. Read the SLA, repair target, exclusions and service-credit terms. Marketing language such as business-grade is not itself a guarantee.' },
      { question: 'Do business broadband prices include VAT?', answer: 'Many business providers advertise prices excluding VAT. Compare the VAT-inclusive total, setup charges and scheduled price changes before ordering.' },
    ],
    sources: [
      { label: 'Ofcom Business Broadband Code of Practice', href: 'https://www.ofcom.org.uk/phones-and-broadband/coverage-and-speeds/business-broadband-cop' },
      { label: 'Ofcom conditions protecting SME customers', href: 'https://www.ofcom.org.uk/phones-and-broadband/coverage-and-speeds/gen-conditions' },
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
    metaDescription: 'Compare UK phone and broadband packages, digital voice, inclusive call plans and true contract costs. Find the right bundle for your household.',
    eyebrow: 'Broadband and home phone guide', dek: 'Choose a bundle by call use, digital-voice requirements and total contract cost—not by an “included line” headline.',
    quickAnswer: 'A phone-and-broadband bundle makes sense when the household still uses a home number, needs inclusive calls or values one provider for both services. Most new fixed voice services now work digitally through the router, so ask what happens during a power cut and whether existing alarms or telecare equipment are compatible.',
    updated: '2026-08-01', schemaType: 'Article', breadcrumbs: guideCrumbs('Phone and broadband deals', '/guides/best-phone-and-broadband-deals'),
    table: { title: 'Choose the right phone bundle', headers: ['Household need', 'Plan feature', 'Check carefully'], rows: [
      ['Rare calls', 'Pay-as-you-go calls', 'Connection fee and per-minute charge'], ['Frequent UK calls', 'Anytime or evening/weekend allowance', 'Excluded numbers and fair-use terms'], ['Vulnerable user or telecare', 'Provider support and resilience solution', 'Power-cut operation and device compatibility'], ['International calls', 'Country-specific add-on', 'Mobile destinations and call setup fees'],
    ]},
    sections: [
      { heading: 'Digital Voice changes the home phone', paragraphs: ['The UK is moving from traditional analogue lines to internet-based voice. The phone normally connects to the broadband router, which means it may not work during a power cut unless a resilience solution is provided. Tell the provider about telecare, alarms or accessibility needs before switching.'] },
      { heading: 'Compare the whole contract', paragraphs: ['Add monthly broadband, call-plan cost, setup, delivery and scheduled increases across the minimum term. Check the out-of-contract price and whether calls to mobiles or premium numbers are excluded.'] },
      { heading: 'When broadband without a phone is better', paragraphs: ['If nobody uses a landline, a broadband-only service may be simpler. However, some networks describe a package as broadband-only even though a digital voice capability or line component exists behind the scenes. Compare the final price, not the product label.'] },
    ],
    faqs: [{ question: 'Can I keep my home phone number?', answer: 'Usually, if you request number porting during the order. Do not cancel the old service first, because that can put the number at risk.' }, { question: 'Will a digital landline work in a power cut?', answer: 'Normally not without backup power or another resilience solution. Discuss vulnerable-user needs with the provider.' }, { question: 'Is line rental still charged?', answer: 'The underlying connection cost may be bundled into one broadband price rather than shown as a separate line-rental item.' }],
    sources: [{ label: 'Ofcom guide to the landline switch-over', href: 'https://www.ofcom.org.uk/phones-and-broadband/landline-phones/future-of-landline-calls' }, { label: 'Ofcom switching guidance', href: 'https://www.ofcom.org.uk/phones-and-broadband/switching-provider/switching-broadband-provider' }],
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
