import liveDealData from './provider-live-deals.json'
import type { Provider, ProviderLiveDealsFile, ProviderLiveOffer } from '@/types'

const fallbackProviderReviewedDate = '2026-06-21'
const providerLiveDeals = liveDealData as ProviderLiveDealsFile

export const providerDatasetUpdatedDate =
  providerLiveDeals.generatedAt ?? fallbackProviderReviewedDate

function createReviewMetadata(
  providerName: string,
  providerSite: string,
  trustpilotDomain: string
) {
  return {
    reviewedDate: fallbackProviderReviewedDate,
    pricingVerifiedDate: fallbackProviderReviewedDate,
    reviewSources: [
      {
        label: `${providerName} broadband packages and pricing`,
        href: providerSite,
        note: `Used for package lineup, pricing snapshot, contract length, and setup-fee checks verified on ${fallbackProviderReviewedDate}.`,
      },
      {
        label: `${providerName} public Trustpilot profile`,
        href: `https://uk.trustpilot.com/review/${trustpilotDomain}`,
        note: 'Used as a customer-sentiment reference alongside our published review methodology rather than as a standalone ranking input.',
      },
      {
        label: 'BroadbandPicker review methodology',
        href: '/how-we-review-broadband',
        note: 'Explains how we weigh price, speed, coverage, customer experience, and use-case fit across provider reviews.',
      },
      {
        label: 'BroadbandPicker editorial policy',
        href: '/editorial-policy',
        note: 'Sets out our editorial independence, correction standards, and how commercial relationships are handled.',
      },
    ],
  }
}

function createSpeedOptionsFromLiveOffers(offers: ProviderLiveOffer[]) {
  const speedMap = new Map<string, Provider['speeds'][number]>()

  for (const offer of offers) {
    const key = `${offer.download}-${offer.upload}-${offer.type}`
    if (!speedMap.has(key)) {
      speedMap.set(key, {
        download: offer.download,
        upload: offer.upload,
        type: offer.type,
      })
    }
  }

  return [...speedMap.values()].sort((a, b) => a.download - b.download || a.upload - b.upload)
}

function applyLiveDealOverlay(base: Provider): Provider {
  const snapshot = providerLiveDeals.providers[base.slug]
  if (!snapshot || snapshot.offers.length === 0) return base

  const offers = [...snapshot.offers].sort(
    (a, b) => a.monthlyPrice - b.monthlyPrice || a.download - b.download
  )
  const cheapestOffer = offers[0]
  const contractLengths = [...new Set(offers.map((offer) => offer.contractLength))].sort(
    (a, b) => a - b
  )
  const liveSpeeds = createSpeedOptionsFromLiveOffers(offers)
  const primaryNote =
    snapshot.notes[0] ??
    `${offers.length} live offers were normalised from the provider source page using the ${snapshot.extractionMethod} extractor.`

  return {
    ...base,
    affiliateUrl: snapshot.affiliateUrl || base.affiliateUrl,
    speeds: liveSpeeds.length > 0 ? liveSpeeds : base.speeds,
    monthlyPriceFrom: cheapestOffer.monthlyPrice,
    contractLengths: contractLengths.length > 0 ? contractLengths : base.contractLengths,
    setupFee: cheapestOffer.setupFee,
    pricingVerifiedDate: snapshot.verifiedAt,
    reviewSources: [
      {
        label: snapshot.sourceLabel,
        href: snapshot.sourceUrl,
        note: `Used for live package lineup, pricing snapshot, contract length, and setup-fee checks verified on ${snapshot.verifiedAt}. ${primaryNote}`,
      },
      ...base.reviewSources.slice(1),
    ],
  }
}

const baseProviders: Provider[] = [
  {
    slug: 'bt',
    name: 'BT',
    logo: '/logos/bt.svg',
    affiliateUrl: 'https://www.bt.com/broadband',
    speeds: [
      { download: 67, upload: 17, type: 'FTTC' },
      { download: 150, upload: 30, type: 'FTTP' },
      { download: 300, upload: 50, type: 'FTTP' },
      { download: 500, upload: 75, type: 'FTTP' },
      { download: 900, upload: 110, type: 'FTTP' },
    ],
    monthlyPriceFrom: 23.99,
    contractLengths: [24],
    setupFee: 30,
    trustpilotScore: 4.0,
    coveragePercent: 98,
    highlights: [
      'The UK\'s widest broadband network, reaching around 98% of homes via Openreach',
      'A flat £4 a month price rise every March, disclosed upfront, on every current package',
      'Ofcom ranked BT third for complaints in Q1 2026, an improvement on the previous quarter',
    ],
    pros: [
      'Widest realistic coverage of any UK provider, useful where other options are limited',
      'Reward cards worth up to £140 offset the £30 upfront setup cost if claimed',
      'Full Fibre 900\'s Stay Fast Guarantee pays out automatically if speed drops below a set minimum',
      'Ofcom complaints data has improved year on year, from eighth to seventh per 100,000 customers',
    ],
    cons: [
      'More expensive than most budget and mid-market rivals at a comparable speed',
      'A scheduled £4 a month price rise every March is built into every current contract',
      'Only 24-month contracts are offered, with no shorter or rolling option',
      'Reward card value must be actively claimed, or the net cost is higher than it first appears',
    ],
    excerpt:
      'BT is the UK\'s largest broadband provider, reaching around 98% of homes over the Openreach network it also wholesales to most rival ISPs. Full Fibre packages run from £23.99 to £31.99 a month, all on 24-month contracts with a scheduled £4 a month rise every March. Ofcom\'s Q1 2026 complaints data ranked BT third-worst in the UK, though improving; two separate BT Trustpilot pages show a 4.0 and a 1.5 out of 5, a genuine split worth understanding before trusting either number alone.',
    contentSections: [
      {
        heading: 'BT Broadband Deals in August 2026',
        paragraphs: [
          'BT\'s current Full Fibre range runs from Full Fibre 150 at £23.99 a month, through Full Fibre 300 at £25.99 and Full Fibre 500 at £27.99, up to Full Fibre 900 at £31.99. A part-fibre Fibre 2 package, averaging 67 Mbps, is also available at £24.99 for addresses full fibre has not yet reached. Every package carries a £30 upfront setup fee.',
          'BT offsets that setup fee with a reward card, ranging from around £80 on the entry tiers up to £140 on Full Fibre 900. This only works out in the customer\'s favour if the card is actually claimed and used; treat the setup fee as a real £30 cost at the point of paying, not a number cancelled out automatically by a reward that requires separate action to redeem.',
          'Every package is sold on a 24-month contract, with no shorter or rolling option currently published. A £4 a month price rise applies every March, disclosed upfront on the price page rather than hidden in the terms, so the real two-year cost of any BT plan is higher than the first month\'s headline figure.',
        ],
      },
      {
        heading: 'BT Speeds and the Openreach Network',
        paragraphs: [
          'BT sells broadband over the Openreach network, the same underlying infrastructure used by most other national providers, including Sky, TalkTalk and Plusnet, as well as many smaller resellers. This means line quality and top available speed at a given address is largely the same regardless of which Openreach-based provider is chosen; the differences between them are price, contract terms, extras and support.',
          'Full Fibre 900 is BT\'s flagship tier, backed by a Stay Fast Guarantee: if the actual delivered speed falls below a set minimum, BT states it will resolve the issue or pay out automatically, without the customer needing to raise a formal dispute first. This is a genuinely stronger consumer protection than a standard speed guarantee that requires an active complaint.',
          'For most households, Full Fibre 150 or 300 comfortably covers streaming, browsing, working from home and several devices in use at once. Full Fibre 500 and 900 mainly benefit larger households running multiple demanding activities simultaneously, or anyone who specifically needs fast, consistent upload for cloud backups or video calls.',
        ],
      },
      {
        heading: 'Router, Wi-Fi and BT\'s Complete Wi-Fi Service',
        paragraphs: [
          'BT includes the Smart Hub 2 router on ultrafast full-fibre packages and with its Complete Wi-Fi service, and the original Smart Hub on other packages. Complete Wi-Fi is BT\'s paid mesh add-on for homes where a single router does not reach every room, and it carries its own money-back guarantee if signal issues are not resolved within a stated period after signing up.',
          'The free BT Wi-Fi hotspot network, accessible to BT broadband customers at thousands of locations across the UK, is a genuine, if often overlooked, extra that some rivals do not offer at all, useful for anyone who travels regularly within the UK and wants to avoid using mobile data.',
          'Anyone considering Complete Wi-Fi should first confirm there is a genuine coverage problem, rather than adding it automatically; a single Smart Hub 2 in a well-positioned spot covers most standard homes without an extra monthly charge.',
        ],
      },
      {
        heading: 'The Scheduled March Price Rise',
        paragraphs: [
          'Every current BT broadband package carries a flat £4 a month price rise each March, disclosed in pounds and pence rather than tied to inflation. This follows Ofcom\'s ban on inflation-linked, percentage-based price rise terms in all new contracts from 17 January 2025; BT, like most national providers, switched to a fixed cash figure as a direct result.',
          'On a 24-month contract, that means the second year costs £48 more than the first at every tier, a real, disclosed figure that should be added to the headline monthly price when comparing BT against a provider with no scheduled rise, such as several of the full-fibre altnets covered elsewhere on this site.',
          'This is not unique to BT; EE, Vodafone and Plusnet, all under the same corporate ownership structure or comparable market position, apply a similar flat rise. The genuine point of comparison is not whether a rise happens, but its size and whether a no-rise alternative is available at the same address.',
        ],
      },
      {
        heading: 'Installation and Switching to BT',
        paragraphs: [
          'Reviews consistently cite quick Full Fibre installation and professional Openreach engineers as a strength, consistent with BT\'s scale and its position as Openreach\'s parent-group-adjacent anchor customer.',
          'Because BT runs on Openreach, most switches from another Openreach-based provider, Sky, TalkTalk, Plusnet and others, qualify for Ofcom\'s One Touch Switch process, a same-day handover with no need to contact the outgoing provider directly.',
          'A switch from a provider on a separate network, such as Virgin Media\'s own cable infrastructure or a full-fibre altnet building its own fibre, will not use One Touch Switch, so keep the existing connection running until the new BT line is confirmed working.',
        ],
      },
      {
        heading: 'BT Customer Service: Two Trustpilot Pages, Two Different Stories',
        paragraphs: [
          'BT has two separate, active Trustpilot pages, and they tell noticeably different stories. The bt.com page shows a rating around 4.0 out of 5 from more than 150,000 reviews; a second, older btbroadband.com page shows around 1.5 out of 5 from roughly 14,000 reviews. Both are genuine customer reviews; the difference comes from how each page is used, not from fabricated or removed reviews on either side.',
          'BT actively promotes the bt.com page as its official feedback channel, including prompting customers after a positive interaction such as a successful installation or fault fix, which skews that page toward satisfied customers who were asked to leave a review. The older btbroadband.com page is less actively promoted and consequently attracts a higher proportion of customers who sought it out specifically to complain.',
          'The practical takeaway is not to treat either number in isolation. Ofcom\'s own Q1 2026 complaints data is a more neutral cross-check: BT ranked third-worst for complaints, at 7 per 100,000 customers, an improvement from 8 the previous quarter, and below TalkTalk\'s 10 and Vodafone\'s 8, but still above the industry average of 6.',
        ],
      },
      {
        heading: 'Is BT Broadband Worth It?',
        paragraphs: [
          'BT\'s real advantage is reach: at 98% of UK homes, it is available almost everywhere, which matters most for anyone who has already ruled out full-fibre altnets and cable due to lack of coverage. Its Stay Fast Guarantee and reward card system are genuine, not marketing-only, benefits if actually used.',
          'It is not the cheapest option at any given speed, and its Ofcom complaints ranking, while improving, still sits above the industry average. The split Trustpilot picture is a fair reflection of a genuinely mixed but not uniformly bad service record, rather than a reason to dismiss BT outright.',
          'Our take: BT suits a household that values broad availability and a well-known, established brand over the lowest possible price, and is prepared to actively claim the reward card and factor the scheduled March rise into the real two-year cost, rather than judging the deal on the first month\'s bill alone.',
        ],
      },
    ],
    faqItems: [
      {
        question: 'Is BT broadband any good?',
        answer: 'BT offers the UK\'s widest broadband coverage, at around 98% of homes, with a Stay Fast Guarantee on its flagship Full Fibre 900 tier. Ofcom ranked it third-worst for complaints in Q1 2026, at 7 per 100,000 customers, though improving from the previous quarter. Its two Trustpilot pages show very different scores, 4.0 and 1.5 out of 5, reflecting how each page collects reviews rather than two contradictory realities.',
      },
      {
        question: 'Why does BT have two different Trustpilot scores?',
        answer: 'BT actively promotes its bt.com Trustpilot page as an official feedback channel, prompting customers after positive interactions, which skews it toward satisfied reviewers and a score around 4.0 from over 150,000 reviews. An older, less-promoted btbroadband.com page attracts a higher proportion of complaint-driven reviews and shows around 1.5 out of 5 from roughly 14,000 reviews. Both are genuine; neither alone is the full picture.',
      },
      {
        question: 'Does BT raise its prices during the contract?',
        answer: 'Yes. Every current BT broadband package carries a flat £4 a month price rise each March, disclosed upfront in pounds and pence following Ofcom\'s ban on inflation-linked price rise terms from January 2025. Over a 24-month contract, this adds £48 to the second year\'s cost at every tier.',
      },
      {
        question: 'What speed do I need from BT?',
        answer: 'Full Fibre 150 or 300 comfortably covers most households, including streaming, browsing and several devices in use at once. Full Fibre 500 and 900 mainly benefit larger households running multiple demanding activities simultaneously or anyone who specifically needs fast, consistent upload speed.',
      },
    ],
    reviewedDate: '2026-08-23',
    pricingVerifiedDate: '2026-08-23',
    reviewSources: [
      {
        label: 'Uswitch: BT broadband packages and pricing',
        href: 'https://www.uswitch.com/broadband/providers/bt/',
        note: 'A direct fetch of bt.com returned no substantive pricing content (JS-rendered page); package pricing, contract length, setup fee and reward cards corroborated via this independent tracker, checked 2026-08-23.',
      },
      {
        label: 'Ofcom: telecoms and pay-TV complaints fall to a record low',
        href: 'https://www.ofcom.org.uk/phones-and-broadband/service-quality/ofcom-telecoms-and-pay-tv-complaints-fall-to-record-low',
        note: 'Primary regulatory source for BT\'s Q1 2026 complaints ranking and the wider industry complaints table.',
      },
      {
        label: 'Ofcom: ban on mid-contract price rises linked to inflation',
        href: 'https://www.ofcom.org.uk/phones-and-broadband/bills-and-charges/ofcom-bans-mid-contract-price-rises-linked-to-inflation',
        note: 'Primary regulatory source for the January 2025 ban on inflation-linked, percentage-based price rise terms, and BT\'s resulting move to a flat £4 a month rise.',
      },
      {
        label: 'Selectra: BT Trustpilot and Ofcom review summary',
        href: 'https://selectra.co.uk/tv-broadband/providers/bt/review',
        note: 'Used to identify and explain BT\'s two separate Trustpilot pages (bt.com and btbroadband.com) and their differing scores.',
      },
      {
        label: 'BT public Trustpilot profile (bt.com)',
        href: 'https://www.trustpilot.com/review/bt.com',
        note: 'Customer-sentiment reference showing a rating around 4.0 out of 5 from over 150,000 reviews in August 2026; not treated as a controlled reliability survey, and read alongside the separate btbroadband.com page.',
      },
      {
        label: 'Awin BT advertiser programmes',
        href: 'https://ui.awin.com/merchant-profile-terms/3041?setLocale=en_US',
        note: 'BroadbandPicker\'s Awin application for both BT Broadband (advertiser 3041) and BT Business Broadband (advertiser 3042) was declined. The affiliate link above is BT\'s own site, verified 2026-08-23.',
      },
      {
        label: 'BroadbandPicker review methodology',
        href: '/how-we-review-broadband',
        note: 'Explains how price, speed, coverage, customer experience and use-case fit are weighed.',
      },
    ],
    awinProgramId: '3041',
  },
  {
    slug: 'sky',
    name: 'Sky',
    logo: '/logos/sky.svg',
    affiliateUrl: 'https://www.sky.com/shop/broadband',
    speeds: [
      { download: 35, upload: 9, type: 'FTTC' },
      { download: 67, upload: 16, type: 'FTTC' },
      { download: 145, upload: 27, type: 'FTTC' },
      { download: 900, upload: 90, type: 'FTTP' },
    ],
    monthlyPriceFrom: 23.00,
    contractLengths: [24],
    setupFee: 0,
    trustpilotScore: 2.7,
    coveragePercent: 95,
    highlights: [
      'One of the best Ofcom complaints records of any major provider, 5 per 100,000 customers in Q4 2025',
      'A flat £3 a month price rise from April 2026, its first year using pounds and pence instead of a percentage',
      'Sky Broadband Shield parental controls and strong TV bundle options included',
    ],
    pros: [
      'Best-in-class Ofcom complaints record alongside Plusnet, well below the industry average',
      'No setup costs on current advertised packages',
      'Strong, mature TV bundle range for households that also want Sky TV or Sky Sports',
      'Good parental controls via Sky Broadband Shield, included as standard',
    ],
    cons: [
      'Low Trustpilot score, around 2.7 out of 5, despite the strong Ofcom record',
      'Only 24-month contracts are offered, with no shorter or rolling option',
      'Contract terms for years after the first only say prices "may rise," without a fixed future figure disclosed at sign-up',
      'Average upload speeds on the Superfast and Ultrafast copper-based tiers',
    ],
    excerpt:
      'Sky sells broadband over the Openreach network, with prices from £23 a month for Superfast (67 Mbps) up to £28 for Full Fibre Gigafast (900 Mbps), all on 24-month contracts with no current setup cost. Ofcom\'s Q4 2025 complaints data ranks Sky among the best of any major UK provider, just 5 complaints per 100,000 customers against an industry average of 8, yet its Trustpilot score sits at a low 2.7 out of 5, a genuine gap between the two sources worth understanding before judging Sky on Trustpilot alone.',
    contentSections: [
      {
        heading: 'Sky Broadband Deals in August 2026',
        paragraphs: [
          'Sky\'s current range starts with Superfast at £23 a month for an average 67 Mbps, then Full Fibre 150 at £24, up to Full Fibre Gigafast at £28 for an average 900 Mbps and Full Fibre 2.5 Gigafast+ at £35 for 2,500 Mbps. A cheaper Superfast 35 tier, averaging 35 Mbps, is also available for addresses without a faster option. Every package is currently advertised with no setup cost.',
          'TV bundles sit above the broadband-only range: Sky Essential TV with Netflix and Superfast or Full Fibre runs from £35 a month, and Sky Ultimate TV, adding Disney+ and HBO Max, starts from £41. These are genuine, mature bundle options, a real point of difference from most broadband-only altnets and resellers covered elsewhere on this site.',
          'Every package is sold on a 24-month contract, with no shorter or rolling option currently published. Sky\'s own site notes a £9.95 router delivery charge plus a £10 activation fee "may be required" outside of the current no-setup-cost promotional period, worth confirming at checkout rather than assuming it will always be waived.',
        ],
      },
      {
        heading: 'Sky Speeds and the Openreach Network',
        paragraphs: [
          'Sky sells broadband over the Openreach network, the same underlying infrastructure used by BT, TalkTalk, Plusnet and most other national providers. Line quality and top available speed at a given address is largely determined by that shared network rather than by Sky specifically; the differences between Openreach-based providers are price, contract terms, extras and support.',
          'Superfast and Ultrafast are delivered over copper-based FTTC and G.Fast technology, while Full Fibre 150 upward runs on a genuine fibre-to-the-premises connection with meaningfully faster and more consistent upload speeds. Anyone doing regular video calls, cloud backups or uploading large files should prioritise a Full Fibre tier over Superfast even where the download speed difference looks modest on paper.',
          'For most households, Full Fibre 150 comfortably covers streaming, browsing, working from home and several devices in use at once. Gigafast and 2.5 Gigafast+ mainly benefit larger households running multiple demanding activities simultaneously, or anyone who specifically wants among the fastest widely available speeds on the Openreach network.',
        ],
      },
      {
        heading: 'The April 2026 Price Rise: Sky\'s First Flat-Rate Year',
        paragraphs: [
          'Sky raised broadband and TV prices by a flat £3 a month for almost all customers from 1 April 2026, including those already mid-contract. This is the first year Sky has used a flat pounds-and-pence figure rather than a percentage; its 2025 rise was 6.2%, tied to inflation. The change follows Ofcom\'s ban on inflation-linked, percentage-based price rise terms in all new contracts from 17 January 2025.',
          'One genuine nuance sets Sky apart from BT or Vodafone here: for customers already in contract, Sky\'s terms state prices "may rise" during the minimum term rather than disclosing a fixed future figure in pounds and pence at the point of sale. New customers signing up now see the April 2026 rise clearly disclosed, but what happens in the second year of a fresh 24-month contract is not fixed at sign-up the way it is with some rivals.',
          'Ofcom requires that any customer who receives a price rise notification can leave the contract penalty-free within 30 days, a right that applies across the industry following the January 2025 ban, not just to Sky customers specifically.',
        ],
      },
      {
        heading: 'Sky Broadband Shield and TV Bundles',
        paragraphs: [
          'Sky Broadband Shield, included as standard, gives parental controls that can be set at a household or per-device level, covering categories like adult content, gambling and social media, a genuinely useful extra for families that some rival providers charge separately for or omit entirely.',
          'Sky\'s real differentiator against most other providers on this site is its TV bundle range. A household that wants Sky Sports, Sky Atlantic or a combined Netflix, Disney+ and HBO Max package alongside broadband can genuinely get a single bill and a single provider relationship, rather than stitching together separate broadband and streaming subscriptions.',
          'Anyone who only wants broadband should stick to the Superfast or Full Fibre range without a TV tier attached; the TV bundles are worth it specifically for households that would be paying for that content separately anyway, not as a default upgrade.',
        ],
      },
      {
        heading: 'Sky Customer Service: A Strong Ofcom Record Against a Low Trustpilot Score',
        paragraphs: [
          'Ofcom\'s Q4 2025 complaints data placed Sky at just 5 complaints per 100,000 customers, comfortably below the industry average of 8 and among the best of any major UK provider, a position it shares with Plusnet. Which?\'s own customer satisfaction survey found 54% of Sky complainants were satisfied with how their complaint was handled, one of only two providers to score above 50% on that specific measure.',
          'Sky\'s Trustpilot score tells a different story: around 2.7 out of 5 from roughly 29,000 reviews on its main sky.com page. Recurring themes in that review set include mid-contract price rises, retention pressure when customers try to haggle at renewal, and slow refunds after cancellation; Sky rarely replies to reviews on Trustpilot, which tends to keep a page\'s score depressed compared to providers that actively respond.',
          'The practical takeaway is that Sky\'s independently regulated complaints record, the metric Ofcom uses to hold every provider to the same standard, is genuinely one of the best in the market, even though its self-selected public review page looks similar to providers with a considerably worse formal complaints history.',
        ],
      },
      {
        heading: 'Is Sky Broadband Worth It?',
        paragraphs: [
          'Sky\'s real advantage is the combination of a strong, independently verified complaints record and a mature TV bundle range, at prices broadly in line with BT and other major Openreach-based providers. Its parental controls are included as standard rather than sold as an add-on.',
          'It is not the cheapest option at any given speed, only offers 24-month contracts, and its second-year price rise is not fixed at sign-up the way some rivals now disclose it. The very low Trustpilot score is a fair reflection of a vocal, complaint-skewed review page rather than the fuller regulatory picture.',
          'Our take: Sky suits a household that wants a well-known, established provider with a genuinely strong complaints record, particularly one that also wants Sky TV or Sky Sports on the same bill, and is prepared to actively haggle at renewal and factor an undisclosed future price rise into the real two-year cost.',
        ],
      },
    ],
    faqItems: [
      {
        question: 'Is Sky broadband any good?',
        answer: 'Sky has one of the strongest Ofcom complaints records of any major UK provider, 5 per 100,000 customers in Q4 2025 against an industry average of 8, a position it shares with Plusnet. Its Trustpilot score is low, around 2.7 out of 5, which mainly reflects a self-selected, complaint-skewed review page rather than Sky\'s formal, regulated complaints record.',
      },
      {
        question: 'Why is Sky\'s Trustpilot score so low if Ofcom ranks it well?',
        answer: 'Trustpilot reviews are self-selected and skew heavily toward customers who had a problem, and Sky rarely replies to reviews on the platform, which tends to keep a page\'s score depressed. Ofcom\'s complaints data is a regulated, standardised measure applied identically across every provider, and by that measure Sky performed among the best in the market in Q4 2025.',
      },
      {
        question: 'Does Sky raise its prices during the contract?',
        answer: 'Yes. Sky raised broadband and TV prices by a flat £3 a month from April 2026, its first year using a fixed pounds-and-pence figure instead of a percentage. For customers already in contract, the terms state prices "may rise" without fixing a future figure at sign-up, so budget for a further increase in year two of a new contract.',
      },
      {
        question: 'What speed do I need from Sky?',
        answer: 'Full Fibre 150 comfortably covers most households, including streaming, browsing and several devices in use at once. Full Fibre Gigafast and 2.5 Gigafast+ mainly benefit larger households running multiple demanding activities simultaneously or anyone who specifically wants among the fastest widely available speeds on the Openreach network.',
      },
    ],
    reviewedDate: '2026-08-24',
    pricingVerifiedDate: '2026-08-24',
    reviewSources: [
      {
        label: 'Uswitch: Sky broadband packages and pricing',
        href: 'https://www.uswitch.com/broadband/providers/sky/',
        note: 'Used for the current package lineup, pricing snapshot and contract length, checked 2026-08-24.',
      },
      {
        label: 'Ofcom: telecoms and pay-TV complaints fall to a record low',
        href: 'https://www.ofcom.org.uk/phones-and-broadband/service-quality/ofcom-telecoms-and-pay-tv-complaints-fall-to-record-low',
        note: 'Primary regulatory source for Sky\'s Q4 2025 complaints ranking (5 per 100,000) and the industry average.',
      },
      {
        label: 'Sky confirms April 2026 price rises for broadband and TV',
        href: 'https://www.choose.co.uk/news/2026/sky-confirms-april-2026-broadband-and-tv-price-rises/',
        note: 'Source for the flat £3 a month April 2026 rise and the comparison against 2025\'s 6.2% inflation-linked rise.',
      },
      {
        label: 'Selectra: Sky broadband Trustpilot, Ofcom and Which? review summary',
        href: 'https://selectra.co.uk/tv-broadband/providers/sky/review',
        note: 'Used for the Which? complaint-satisfaction survey result and to corroborate the Trustpilot-versus-Ofcom gap.',
      },
      {
        label: 'Sky public Trustpilot profile',
        href: 'https://uk.trustpilot.com/review/sky.com',
        note: 'Customer-sentiment reference showing a rating around 2.7 out of 5 from roughly 29,000 reviews in August 2026, consistent with the figure already used on this site\'s BT-vs-Sky and Sky-vs-Virgin Media comparison pages; not treated as a controlled reliability survey.',
      },
      {
        label: 'BroadbandPicker review methodology',
        href: '/how-we-review-broadband',
        note: 'Explains how price, speed, coverage, customer experience and use-case fit are weighed.',
      },
    ],
    awinProgramId: null,
  },
  {
    slug: 'virgin-media',
    name: 'Virgin Media',
    logo: '/logos/virgin-media.svg',
    affiliateUrl: 'https://www.virginmedia.com/broadband',
    speeds: [
      { download: 132, upload: 20, type: 'Cable' },
      { download: 264, upload: 36, type: 'Cable' },
      { download: 516, upload: 52, type: 'Cable' },
      { download: 1130, upload: 104, type: 'Cable' },
    ],
    monthlyPriceFrom: 33.00,
    contractLengths: [18],
    setupFee: 35,
    trustpilotScore: 1.4,
    coveragePercent: 52,
    highlights: [
      'The UK\'s fastest widely-available speeds, on its own cable network rather than Openreach',
      'A flat price rise on new contracts, replacing the older inflation-linked rise entirely by April 2026',
      'A relatively strong Ofcom complaints record despite an exceptionally low Trustpilot score',
    ],
    pros: [
      'Genuinely faster top-end speeds than any Openreach-based provider at a comparable price',
      'Not dependent on Openreach, so a real alternative where the copper or FTTP network is congested or unavailable',
      'Ofcom complaints data has consistently placed Virgin Media at or below the industry average',
      'Hub 5X router included as standard, capable of handling gigabit speeds',
    ],
    cons: [
      'Exceptionally low Trustpilot score, among the worst of any major UK provider',
      'Cable network coverage is limited to around 52% of UK premises, entirely separate from the Openreach footprint',
      'A £35 setup fee applies, and switching to Virgin Media never qualifies for Ofcom\'s One Touch Switch',
      'Customers on older, pre-2025 contracts have faced considerably larger inflation-linked rises than new customers now see',
    ],
    excerpt:
      'Virgin Media runs its own cable network, entirely separate from Openreach, reaching around 52% of UK premises with the fastest widely available speeds in the country, up to 1,130 Mbps. Prices start from £33 a month on an 18-month contract, with a £35 setup fee. Its Trustpilot score is exceptionally low, around 1.4 out of 5, yet Ofcom\'s own complaints data has consistently placed it at or below the industry average, a genuine gap between the two sources worth understanding before ruling Virgin Media out.',
    contentSections: [
      {
        heading: 'Virgin Media Broadband Deals in August 2026',
        paragraphs: [
          'Virgin Media\'s current range runs from M125 at around £33 a month for 132 Mbps, through M250 at around £37 for 264 Mbps and M500 at around £43 for 516 Mbps, up to Gig1 at around £62 for 1,130 Mbps. Every package includes the Hub 5X router and unlimited data, on an 18-month contract, the shortest standard fixed term of any major national provider covered on this site.',
          'A £35 setup fee applies across the range. Virgin Media periodically runs promotional pricing, including reduced entry rates on M250 at points during 2026, so the live price at checkout can differ meaningfully from the standard list price; always confirm the current offer for the specific address.',
          'Because Virgin Media\'s cable network is entirely separate from Openreach, its speeds and pricing sit somewhat apart from the rest of the market, worth comparing on their own terms rather than assuming direct equivalence with an Openreach-based provider\'s tier of the same name.',
        ],
      },
      {
        heading: 'Virgin Media Speeds and the Cable Network',
        paragraphs: [
          'Virgin Media delivers broadband over its own cable network, not the Openreach infrastructure that BT, Sky, TalkTalk, Plusnet and most other providers on this site resell. This is Virgin Media\'s central advantage: at the top end, Gig1\'s 1,130 Mbps beats what most Openreach-based providers can offer at a comparable price, and it does not compete for capacity with Openreach\'s network at all.',
          'The trade-off is coverage. Virgin Media\'s cable network reaches only around 52% of UK premises, a completely different, non-overlapping footprint from Openreach\'s much wider reach. An address either has Virgin Media cable access or it does not; there is no partial or upgrade path the way there sometimes is with fibre rollouts.',
          'For most households, M125 or M250 already covers everyday streaming, browsing and working from home comfortably. Gig1 mainly benefits larger households running multiple demanding activities at once, or anyone who specifically wants the fastest widely available speed in the UK regardless of whether it is fully used day to day.',
        ],
      },
      {
        heading: 'Price Rises: Old RPI Contracts vs New Flat Rates',
        paragraphs: [
          'Virgin Media\'s price rise structure is more complicated than most providers because of how it transitioned away from inflation-linked increases. Customers who signed up before 9 January 2025 faced a final RPI-linked rise of around 7.7% in April 2026, calculated as a percentage rather than a flat cash figure. Anyone signing up new today is on a different, later structure entirely.',
          'Contracts starting from January 2025 moved to a flat £3.50 a month rise each April; contracts starting from October 2025 onward moved to a flat £4 a month rise, in line with Ofcom\'s ban on inflation-linked, percentage-based price rise terms in all new contracts from 17 January 2025. A new Virgin Media customer signing up today should expect the flat £4 structure, not the older percentage-based one.',
          'This matters when reading older reviews or price complaints about Virgin Media online: a review describing a large, unpredictable percentage rise likely describes the legacy RPI-linked contract structure, not the flat, disclosed rate that applies to new sign-ups now.',
        ],
      },
      {
        heading: 'Installation and Switching to Virgin Media',
        paragraphs: [
          'Because Virgin Media\'s cable network is physically separate from Openreach\'s, switching to Virgin Media never qualifies for Ofcom\'s One Touch Switch process, regardless of which provider a customer is leaving. Installation typically involves a Virgin Media engineer connecting the property to the cable network, which can take longer to schedule than an Openreach-based switch.',
          'Anyone switching should keep their existing broadband service active until the new Virgin Media connection is installed and confirmed working, rather than cancelling the old service in advance, since there is no guaranteed same-day handover.',
          'Renters and leaseholders should confirm whether the property is already connected to Virgin Media\'s network; a building with existing cable infrastructure is a much faster, simpler installation than one requiring a new connection to be run to the property.',
        ],
      },
      {
        heading: 'Router and Home Wi-Fi',
        paragraphs: [
          'The Hub 5X is included as standard across the current range and is capable of handling gigabit speeds without a separate upgrade, a genuine advantage over providers that reserve their best router for only the top tier.',
          'As with any router, coverage in a larger property depends on placement and building layout. Virgin Media offers mesh Wi-Fi add-ons for properties where a single Hub does not reach every room, worth confirming there is a genuine coverage gap before adding one automatically.',
          'Virgin Media broadband can be taken without a phone line or TV bundle, though bundled options are available for anyone who wants a single combined bill rather than separate broadband, TV and mobile contracts.',
        ],
      },
      {
        heading: 'Virgin Media Customer Service: Trustpilot vs Ofcom',
        paragraphs: [
          'Virgin Media\'s Trustpilot score is genuinely one of the lowest of any major UK broadband provider, around 1.4 out of 5 from roughly 100,000 reviews at the point of this check, with scores across different tracking snapshots ranging from about 1.3 to 1.6.',
          'Ofcom\'s own complaints data tells a noticeably different story. In its Q4 2025 report, Virgin Media recorded 7 complaints per 100,000 customers, at or slightly below the industry average of 8 at the time, and it has not appeared among the top complained-about providers in Ofcom\'s more recent Q1 2026 report either, where TalkTalk, Vodafone and BT took the top three spots.',
          'This gap between an extremely low Trustpilot score and a comparatively unremarkable Ofcom complaints record is worth taking seriously rather than dismissing either source. Trustpilot reviews skew toward people motivated to complain about a specific bad experience, often billing or a difficult cancellation; Ofcom\'s data measures formal complaint volume across the whole customer base, which is the more representative measure of day-to-day service reliability for most customers.',
        ],
      },
      {
        heading: 'Is Virgin Media Worth It?',
        paragraphs: [
          'Where it is available, Virgin Media\'s cable network genuinely delivers the fastest widely available broadband in the UK, at prices that are competitive against Openreach-based full fibre once actual speed is taken into account, and its Ofcom complaints record does not support the impression its Trustpilot score alone would suggest.',
          'It is not available everywhere, its setup fee and shorter maximum contract length are worth factoring in, and anyone signing up should understand the new flat price-rise structure rather than being alarmed by older reviews describing a different, now-discontinued percentage-based rise.',
          'Our take: worth strong consideration for speed-focused households in Virgin Media\'s cable footprint, especially where Openreach full fibre is unavailable or congested, provided the decision is based on Ofcom\'s complaints evidence and the current contract terms rather than the Trustpilot score in isolation.',
        ],
      },
    ],
    faqItems: [
      {
        question: 'Is Virgin Media broadband any good?',
        answer: 'Virgin Media delivers the fastest widely available broadband speeds in the UK on its own cable network, and Ofcom\'s complaints data has consistently placed it at or below the industry average. Its Trustpilot score, around 1.4 out of 5, is exceptionally low, but reflects a self-selected pool of mostly complaint-driven reviewers rather than the broader customer base Ofcom measures.',
      },
      {
        question: 'Why is Virgin Media\'s Trustpilot score so low if Ofcom complaints are average?',
        answer: 'Trustpilot reviews are self-selected and skew toward customers with a specific negative experience, often billing or cancellation-related, who are more motivated to leave a review than a satisfied customer. Ofcom\'s complaints data measures formal complaint volume across the entire customer base, which is generally a more representative measure of typical service reliability.',
      },
      {
        question: 'Does Virgin Media raise its prices during the contract?',
        answer: 'Yes, but the structure changed in 2025. Contracts starting from October 2025 onward carry a flat £4 a month rise each April, disclosed upfront, following Ofcom\'s ban on inflation-linked price rises. Older contracts signed before January 2025 were on a different, percentage-based structure, with one final RPI-linked rise of around 7.7% due in April 2026.',
      },
      {
        question: 'Is Virgin Media available at my address?',
        answer: 'Virgin Media\'s cable network reaches around 52% of UK premises, a footprint entirely separate from the Openreach network most other providers use. Check Virgin Media\'s own postcode checker to confirm availability, since there is no partial coverage; an address either has cable access or it does not.',
      },
    ],
    reviewedDate: '2026-08-23',
    pricingVerifiedDate: '2026-08-23',
    reviewSources: [
      {
        label: 'Uswitch: Virgin Media broadband packages and pricing',
        href: 'https://www.uswitch.com/broadband/providers/virgin_media/',
        note: 'Used for current package pricing, speeds and contract terms, checked 2026-08-23.',
      },
      {
        label: 'Uswitch: RPI confirms April price rise for Virgin Media customers on older contracts',
        href: 'https://www.uswitch.com/media-centre/2026/02/rpi-confirms-april-price-rise-for-virgin-media-and-onestream-customers-on-older-contracts/',
        note: 'Primary source for the distinction between legacy RPI-linked contracts and the new flat £3.50/£4 a month rise structure.',
      },
      {
        label: 'Ofcom: ban on mid-contract price rises linked to inflation',
        href: 'https://www.ofcom.org.uk/phones-and-broadband/bills-and-charges/ofcom-bans-mid-contract-price-rises-linked-to-inflation',
        note: 'Primary regulatory source for the January 2025 ban on inflation-linked, percentage-based price rise terms.',
      },
      {
        label: 'Selectra: Virgin Media Trustpilot and Ofcom review summary',
        href: 'https://selectra.co.uk/tv-broadband/providers/virgin-media/review',
        note: 'Used to corroborate Trustpilot score range and Ofcom Q4 2025 complaints data.',
      },
      {
        label: 'Virgin Media public Trustpilot profile',
        href: 'https://uk.trustpilot.com/review/virginmedia.com',
        note: 'Customer-sentiment reference showing scores ranging from approximately 1.3 to 1.6 out of 5 across different snapshots in 2026; not treated as a controlled reliability survey, and read alongside Ofcom\'s own complaints data.',
      },
      {
        label: 'Awin Virgin Media advertiser programme',
        href: 'https://ui.awin.com/merchant-profile-terms/6399?setLocale=en_US',
        note: 'BroadbandPicker\'s Awin application for this programme was declined. The affiliate link above is Virgin Media\'s own site, verified 2026-08-23.',
      },
      {
        label: 'BroadbandPicker review methodology',
        href: '/how-we-review-broadband',
        note: 'Explains how price, speed, coverage, customer experience and use-case fit are weighed.',
      },
    ],
    awinProgramId: '6399',
  },
  {
    slug: 'ee',
    name: 'EE',
    logo: '/logos/ee.svg',
    affiliateUrl: 'https://ee.co.uk/broadband',
    speeds: [
      { download: 100, upload: 20, type: 'FTTP' },
      { download: 300, upload: 50, type: 'FTTP' },
      { download: 500, upload: 75, type: 'FTTP' },
      { download: 900, upload: 110, type: 'FTTP' },
    ],
    monthlyPriceFrom: 22.99,
    contractLengths: [24],
    setupFee: 0,
    trustpilotScore: 1.3,
    coveragePercent: 97,
    highlights: [
      'Automatic 4G or 5G mobile backup keeps the connection running if the fixed line drops',
      'Named National Broadband Provider of the Year at the 2026 Uswitch Telecoms Awards for speed and reliability',
      'Broadband-specific Trustpilot score sits at 1.3 out of 5, well below EE\'s better-known 4.2 mobile-dominated headline score',
    ],
    pros: [
      'Genuinely fast, consistently reliable speeds, independently recognised by Uswitch',
      'Automatic mobile network failover is a real feature, not offered by most rivals',
      'Runs on the Openreach network, so availability and line quality match most other national providers',
      'No setup fee on most current packages',
    ],
    cons: [
      'Broadband-specific Trustpilot score is exceptionally low, in the worst bracket alongside BT and Sky',
      'Only 24-month contracts are offered, with no shorter or rolling option',
      'A scheduled flat price rise applies every March',
      'A genuinely low Trustpilot score despite an improved, now-average Ofcom complaints position',
    ],
    excerpt:
      'EE, BT Group\'s mobile-led broadband brand, offers Full Fibre packages from £22.99 to around £30 a month, all on 24-month Openreach contracts, with a distinctive feature: automatic 4G or 5G mobile backup if the fixed line drops. Uswitch named it National Broadband Provider of the Year for 2026 on speed and reliability, and Ofcom\'s Q1 2026 data shows a real improvement in its complaints record, now at the industry average, though its broadband-specific Trustpilot score, just 1.3 out of 5, has not caught up with that change.',
    contentSections: [
      {
        heading: 'EE Broadband Deals in August 2026',
        paragraphs: [
          'EE\'s Full Fibre range runs from Full Fibre 100 at around £22.99 a month, through Full Fibre 300 and Full Fibre 500 in the mid-£20s to high-£20s, up to Full Fibre 900 at around £25.99 to £30.99 depending on current promotions and any reward card offered. Every current package runs on a 24-month contract.',
          'Setup fees vary by promotion: some current offers carry no activation charge at all, while others apply a fee offset by a reward card worth up to £130 on the fastest tier. As with BT, a reward card only benefits the customer if it is actually claimed; treat any listed setup fee as a real upfront cost at the point of signing up.',
          'EE\'s Full Fibre 100 to 500 tiers include automatic 4G backup, upgraded to 5G backup on Full Fibre 900, a genuinely distinctive feature among the providers covered on this site: if the fixed line drops, the router automatically fails over to EE\'s mobile network to keep the connection running, rather than leaving the household offline until an engineer visit.',
        ],
      },
      {
        heading: 'EE Speeds, Reliability and the Openreach Network',
        paragraphs: [
          'EE runs on the Openreach network, the same underlying infrastructure as BT, Sky, TalkTalk and Plusnet, so the top available speed and line quality at a given address is broadly the same regardless of which of these providers is chosen; the meaningful differences are price, contract terms, extras and support.',
          'EE was named National Broadband Provider of the Year at the 2026 Uswitch Telecoms Awards, specifically recognised for internet speed and reliability, a genuinely independent, survey-based recognition rather than EE\'s own marketing claim.',
          'The mobile backup feature is the most practically useful differentiator: a household with a poor mobile signal at the property gets less benefit from it than one with strong 4G or 5G coverage, so its real value depends on local mobile network strength as much as the fixed line itself.',
        ],
      },
      {
        heading: 'EE\'s Two Very Different Trustpilot Scores',
        paragraphs: [
          'EE\'s well-known Trustpilot score, around 4.2 out of 5 from over 150,000 reviews, is dominated by mobile phone customers rather than broadband customers, since EE\'s Trustpilot page covers the whole brand, not broadband specifically. Quoting this figure for a broadband decision is genuinely misleading, even though it is the number most search results and comparison sites surface first.',
          'EE\'s broadband-specific Trustpilot page tells a very different story: a rating of around 1.3 out of 5, broadly in line with Sky\'s 1.3 and BT\'s broadband-specific 1.5, and considerably worse than the mobile-dominated headline figure would suggest. This is the number that actually reflects broadband customer sentiment.',
          'Negative broadband reviews commonly cite long waits for engineer appointments and slow support response, alongside separate, more positive commentary specifically on speed and connection reliability once installed, a genuinely different pattern from a provider with poor speed and poor support both.',
        ],
      },
      {
        heading: 'Price Rises and Contract Terms',
        paragraphs: [
          'EE applies a flat, disclosed price rise each March across its current range, following Ofcom\'s ban on inflation-linked, percentage-based rise terms in all new contracts from January 2025, the same structure BT, its parent-group sibling brand, has adopted.',
          'Every current package runs on a 24-month contract, with no shorter or rolling monthly option published. Factor the scheduled March rise into the real two-year cost when comparing EE against a rival with a smaller rise or no scheduled increase at all.',
          'As with any Openreach-based provider, confirm the exact contract summary and any promotional pricing at the point of order, since headline prices and reward card values change with EE\'s current campaigns.',
        ],
      },
      {
        heading: 'Installation and Switching to EE',
        paragraphs: [
          'Because EE runs on Openreach, most switches from another Openreach-based provider qualify for Ofcom\'s One Touch Switch process, a same-day handover with no need to contact the outgoing provider directly.',
          'A switch from a provider on a separate network, such as Virgin Media\'s cable infrastructure or a full-fibre altnet building its own network, will not use One Touch Switch, so keep the existing connection active until the new EE line is confirmed working.',
          'Anyone already an EE mobile customer should check for a bundle discount when adding broadband, since EE positions cross-brand bundling as a core part of its offer.',
        ],
      },
      {
        heading: 'Ofcom Complaints Data for EE: A Real Improvement',
        paragraphs: [
          'Ofcom\'s Q4 2025 complaints report placed EE in the worst-three bracket for broadband complaints, at 10 per 100,000 customers, alongside TalkTalk and Vodafone. Its more recent Q1 2026 report, published 23 July 2026, shows a genuine improvement: EE recorded 6 complaints per 100,000 customers, exactly the record-low industry average that quarter, and well below TalkTalk\'s 10 and Vodafone\'s 8.',
          'This is a real, measurable change rather than statistical noise, and it means EE now sits alongside Virgin Media at the industry average, no longer in the worst bracket. It is a genuinely different position from the one still commonly cited for EE elsewhere online, which tends to repeat the older Q4 2025 figure.',
          'EE\'s broadband-specific Trustpilot score, still around 1.3 out of 5, has not moved in line with this improvement. This is now a clearer example of the pattern seen elsewhere on this site, Sky, Plusnet and Virgin Media among them, where a low, self-selected Trustpilot score sits alongside a considerably stronger, independently regulated Ofcom complaints record.',
        ],
      },
      {
        heading: 'Is EE Broadband Worth It?',
        paragraphs: [
          'EE\'s case rests on two real, independently recognised strengths: consistently fast, reliable speeds, and a genuinely distinctive automatic mobile backup feature that most rivals do not offer. Both are substantive, not marketing-only, benefits for anyone who values uptime highly.',
          'The complaints picture is now genuinely better than EE\'s reputation suggests: Ofcom\'s Q1 2026 data puts it at the industry average, a real improvement on its previous worst-three position. The exceptionally low 1.3 Trustpilot score has not caught up with that change, and mainly reflects a self-selected, complaint-skewed review page rather than EE\'s current, regulated complaints record.',
          'Our take: EE suits a household that prioritises connection speed, reliability and mobile-network backup, and its customer service position is now closer to the industry norm than its Trustpilot score alone would suggest, though the Trustpilot pattern itself is still worth knowing about before ruling on reputation alone.',
        ],
      },
    ],
    faqItems: [
      {
        question: 'Is EE broadband any good?',
        answer: 'EE was named National Broadband Provider of the Year at the 2026 Uswitch Telecoms Awards for speed and reliability, and offers a distinctive automatic 4G/5G mobile backup feature. Its complaints record has genuinely improved: Ofcom\'s Q1 2026 data puts EE at 6 per 100,000 customers, exactly the industry average, up from a worst-three position in Q4 2025. Its broadband-specific Trustpilot score, still around 1.3 out of 5, has not caught up with that improvement.',
      },
      {
        question: 'Why does EE have two different Trustpilot scores?',
        answer: 'EE\'s well-known 4.2-out-of-5 Trustpilot score covers the whole EE brand and is dominated by mobile phone customers, not broadband customers specifically. EE\'s broadband-specific Trustpilot page shows a considerably lower score, around 1.3 out of 5, which is the more relevant figure for a broadband decision.',
      },
      {
        question: 'What is EE\'s mobile backup feature?',
        answer: 'EE\'s Full Fibre 100 to 500 packages include automatic 4G backup, upgraded to 5G backup on Full Fibre 900. If the fixed broadband line drops, the router automatically switches to EE\'s mobile network to keep the household connected, rather than leaving it offline until an engineer visit. Its practical benefit depends on the strength of local mobile coverage.',
      },
      {
        question: 'Does EE raise its prices during the contract?',
        answer: 'Yes. EE applies a flat, disclosed price rise each March across its current range, following Ofcom\'s ban on inflation-linked price rise terms from January 2025. Every current package runs on a 24-month contract, so this rise applies in the second year of every new EE broadband agreement.',
      },
    ],
    reviewedDate: '2026-08-25',
    pricingVerifiedDate: '2026-08-23',
    reviewSources: [
      {
        label: 'EE broadband deals and pricing',
        href: 'https://ee.co.uk/broadband',
        note: 'Used for current package lineup and headline pricing, checked 2026-08-23.',
      },
      {
        label: 'EE monthly home price guide, 1 March 2026',
        href: 'https://ee.co.uk/content/dam/help/terms-and-conditions/price-plans/home/ee-monthly-home-price-guide-1-march-2026.pdf',
        note: 'EE\'s own official price guide, used to corroborate package speeds, minimum guaranteed speeds and the scheduled March price rise.',
      },
      {
        label: 'Selectra: EE broadband review, Trustpilot and Ofcom summary',
        href: 'https://selectra.co.uk/tv-broadband/providers/ee/broadband-review',
        note: 'Primary source for the distinction between EE\'s mobile-dominated headline Trustpilot score and its broadband-specific score, and for the Uswitch Telecoms Awards recognition.',
      },
      {
        label: 'EE broadband-specific public Trustpilot profile',
        href: 'https://uk.trustpilot.com/review/broadband.ee.co.uk',
        note: 'Customer-sentiment reference showing a broadband-specific rating around 1.3 out of 5 in August 2026; not treated as a controlled reliability survey.',
      },
      {
        label: 'broadbandswitch.uk: The Complaints Floor, Ofcom complaints Q1 2026',
        href: 'https://broadbandswitch.uk/reports/the-complaints-floor/',
        note: 'Primary source for EE\'s exact Q1 2026 complaints figure (6 per 100,000, the industry average), checked against each provider\'s own Ofcom-reported figure, verified 2026-08-25.',
      },
      {
        label: 'Ofcom: telecoms and pay-TV complaints fall to a record low',
        href: 'https://www.ofcom.org.uk/phones-and-broadband/service-quality/ofcom-telecoms-and-pay-tv-complaints-fall-to-record-low',
        note: 'Primary regulatory source for the Q1 2026 complaints report and the wider industry complaints table.',
      },
      {
        label: 'Awin EE advertiser programme',
        href: 'https://ui.awin.com/merchant-profile-terms/3516?setLocale=en_US',
        note: 'BroadbandPicker\'s Awin application for this programme was declined. The affiliate link above is EE\'s own site, verified 2026-08-23.',
      },
      {
        label: 'BroadbandPicker review methodology',
        href: '/how-we-review-broadband',
        note: 'Explains how price, speed, coverage, customer experience and use-case fit are weighed.',
      },
    ],
    awinProgramId: '3516',
  },
  {
    slug: 'talktalk',
    name: 'TalkTalk',
    logo: '/logos/talktalk.svg',
    affiliateUrl: 'https://www.awin1.com/cread.php?awinmid=3674&awinaffid=2942019&ued=https%3A%2F%2Fwww.talktalk.co.uk%2Fbroadband',
    speeds: [
      { download: 35, upload: 9, type: 'FTTC' },
      { download: 65, upload: 17, type: 'FTTC' },
      { download: 150, upload: 30, type: 'FTTP' },
      { download: 500, upload: 75, type: 'FTTP' },
      { download: 900, upload: 110, type: 'FTTP' },
    ],
    monthlyPriceFrom: 25.00,
    contractLengths: [24],
    setupFee: 0,
    trustpilotScore: 1.5,
    coveragePercent: 96,
    highlights: [
      'One of the cheapest big-name full-fibre ranges in the UK, from £25 a month',
      'Full Fibre 900 is TalkTalk\'s fastest package, with unlimited data and no traffic management on every tier',
      'Named the most complained-about broadband provider by Ofcom for the third quarter running, in the regulator\'s Q1 2026 report',
    ],
    pros: [
      'Genuinely low entry prices across both part-fibre and full-fibre ranges',
      'Runs on the Openreach network, the same physical lines used by BT, Sky and Plusnet',
      'Unlimited data with no fair-use clause hidden in the terms',
      'Every scheduled price rise is disclosed upfront to April 2028, not sprung on customers later',
    ],
    cons: [
      'Named the UK\'s most complained-about broadband provider by Ofcom for three consecutive quarters',
      'Trustpilot rating sits at 1.5 out of 5 from over 50,000 reviews, in Trustpilot\'s "Bad" band',
      'Standard router is WiFi 5, a generation behind what most full-fibre rivals now include',
      'Two scheduled price rises are already built into every 24-month contract, in April 2027 and April 2028',
    ],
    excerpt:
      'TalkTalk is one of the UK\'s cheapest big-name broadband providers, with full-fibre plans from £25 a month running on the same Openreach network as BT and Sky. It is also, by Ofcom\'s own Q1 2026 complaints data, the most complained-about broadband provider in the UK for the third quarter running, and its Trustpilot score sits at 1.5 out of 5 from more than 50,000 reviews. The low price is real; so is the service-quality trade-off that comes with it.',
    contentSections: [
      {
        heading: 'TalkTalk Broadband Deals in August 2026',
        paragraphs: [
          'TalkTalk\'s current range splits into part-fibre and full-fibre. Fibre 35 and Fibre 65 both start at £26 a month on a 24-month contract, delivering average download speeds of 35 Mbps and 65 Mbps. Full Fibre 150 undercuts both at £25 a month, and is TalkTalk\'s only "data-only" option, meaning it can be ordered without a phone line. Full Fibre 500 is £30 a month and Full Fibre 900, the fastest package, is £36 a month.',
          'Every one of these prices rises twice on a fixed schedule: once in April 2027 and again in April 2028. Full Fibre 150 goes from £25 to £29 to £33 over the life of the contract, for example. This is disclosed clearly on TalkTalk\'s own pricing pages rather than buried in the terms, but it means the true two-year cost of any TalkTalk plan is meaningfully higher than the headline monthly figure suggests, and it should be compared on that basis against a provider offering a flat price for the full term.',
          'There is also TalkTalk U, an adaptive plan priced at £25, £28 or £31 a month depending on tier, marketed around adjusting to usage needs rather than a fixed speed number. It is a less straightforward comparison than the named Full Fibre tiers, so anyone considering it should check exactly what speed range it guarantees at their address before assuming it is simply a cheaper version of Full Fibre 150.',
        ],
      },
      {
        heading: 'TalkTalk Speeds: Part-Fibre and Full Fibre',
        paragraphs: [
          'Fibre 35 and Fibre 65 are part-fibre products, delivered over a fibre connection to the street cabinet and copper for the final stretch to the property, which is why their upload speeds (9 Mbps and 17 Mbps) are much lower relative to download than the full-fibre tiers. They suit light use: browsing, standard-definition and HD streaming, and general email and video calls for one or two people.',
          'The three Full Fibre tiers run fibre all the way to the property. Full Fibre 150 offers around 30 Mbps upload, Full Fibre 500 around 75 Mbps, and Full Fibre 900 around 110 Mbps, based on independent tracking rather than TalkTalk\'s own marketing pages, which emphasise download speed and do not headline upload figures for any tier. Anyone who regularly uploads large files, backs up to the cloud, or works from home on video calls should treat upload speed, not just the download number, as the deciding factor between tiers.',
          'TalkTalk quotes an average download figure for every tier alongside a stated minimum, and is a signatory to the Ofcom-backed Broadband Speed Code of Practice, which allows an exit without penalty if speed falls below the guaranteed minimum for more than 3 days after 30 days of unresolved reports. Keep a written record of any speed complaint and the dates involved if this becomes relevant.',
        ],
      },
      {
        heading: 'Router, Wi-Fi and Add-ons',
        paragraphs: [
          'The router included as standard across TalkTalk\'s range is WiFi 5, a generation behind the WiFi 6 hardware most full-fibre rivals, including several smaller altnets, now include as standard. For a typical home with a handful of devices this is rarely noticeable, but a household with many simultaneous streaming devices, consoles and smart-home gadgets may find a WiFi 5 router becomes the bottleneck before the line speed does.',
          'Total Home Wi-Fi is TalkTalk\'s paid mesh add-on for extending coverage into rooms the main router does not reach well, with a 45-day window to assess whether it is actually needed before committing further. SuperSafe, an F-Secure-powered security add-on, and Calling Boosts for UK or international calls, are both available separately rather than bundled into the core price.',
          'TalkTalk TV is a rolling monthly subscription available to Full Fibre and part-fibre customers, which is worth knowing if a genuine like-for-like comparison against a rival with a bundled TV package is being made; TalkTalk\'s broadband-only headline price does not include it.',
        ],
      },
      {
        heading: 'TalkTalk Contract Length and the Two Scheduled Price Rises',
        paragraphs: [
          'Every current TalkTalk plan is sold on a 24-month contract; there is no shorter or rolling monthly option published for the main range. Two price rises are built into that term as standard: one in April 2027 and a second in April 2028, both disclosed on the plan\'s own pricing page rather than only in the small print.',
          'This is a genuinely different structure from a provider offering a flat price for the whole contract, and it means the honest way to compare TalkTalk against a rival is the full two-year cost, not the first month\'s bill. A £25 Full Fibre 150 plan that becomes £33 a month by year two is not automatically the cheapest option over 24 months once a flat-priced rival is added to the comparison.',
          'A missed engineer appointment can also incur a charge, so confirm the installation date works before booking it, and keep any confirmation correspondence in case a dispute arises later.',
        ],
      },
      {
        heading: 'Installation and Switching to TalkTalk',
        paragraphs: [
          'TalkTalk quotes no setup fee across its current range, with engineer installation typically taking one to two hours where a new connection is required. New connections across the range go through a 10-day stabilisation period, standard practice across the industry for a newly activated line, during which speed can vary slightly while the connection settles.',
          'Because TalkTalk operates on the Openreach network, most switches from another Openreach-based provider, including BT, Sky and Plusnet, qualify for Ofcom\'s One Touch Switch process, which is designed to be a same-day handover with no loss of service and no need to contact the outgoing provider directly.',
          'A switch from a provider on a different network, such as Virgin Media\'s own cable infrastructure or a full-fibre altnet, will not use One Touch Switch and may involve a short overlap period, so keep the existing service active until the new TalkTalk connection is confirmed working.',
        ],
      },
      {
        heading: 'TalkTalk Customer Service and Ofcom Complaints Data',
        paragraphs: [
          'This is the section that matters most for TalkTalk specifically. Ofcom\'s own complaints report for the period covering Q1 2026 named TalkTalk the most complained-about broadband provider in the UK, stating that complaints "stayed at similar levels to the previous quarter" and mostly related to faults, service and provisioning, complaints handling, and billing and pricing problems. Independent reporting on the same underlying Ofcom data put the figure at around 10 complaints per 100,000 customers, against an industry average of 6, and noted this was the third consecutive quarter TalkTalk had topped the table.',
          'TalkTalk\'s Trustpilot profile corroborates the pattern: a rating of 1.5 out of 5 from more than 50,000 reviews at the point of this check, placing it in Trustpilot\'s "Bad" band. Recurring themes in the reviews include long phone wait times, charges continuing after a contract has ended, and billing errors that take more than one call to resolve. Notably, TalkTalk Business, a separate division serving business customers, holds a much stronger 4.2 out of 5 on Trustpilot from over 20,000 reviews, so the complaints pattern described here is specific to the residential broadband service, not the TalkTalk brand as a whole.',
          'None of this means every TalkTalk customer has a bad experience; the line itself runs on the same Openreach network as BT and Sky, so day-to-day speed and reliability are not inherently worse. The risk this data actually points to is what happens when something goes wrong, a fault, a billing dispute or a cancellation, where TalkTalk\'s own regulatory and review record suggests the resolution process is where it currently falls short of rivals.',
        ],
      },
      {
        heading: 'Is TalkTalk Broadband Any Good?',
        paragraphs: [
          'TalkTalk earns its place on a budget shortlist on price alone: full fibre from £25 a month, unlimited data with no fair-use clause, and a real speed-related exit right under the industry Code of Practice are all genuine, not marketing-only, benefits.',
          'It is a harder recommendation for anyone who expects to need customer support at some point during a 24-month contract. Ofcom\'s own complaints data and a 1.5-out-of-5 Trustpilot score from over 50,000 reviews are not minor blemishes; they describe a consistent pattern specifically around fault handling, billing and cancellation, not an isolated bad quarter.',
          'Our take: TalkTalk suits a budget-conscious household that wants the cheapest realistic full-fibre entry price, is comfortable managing an account online rather than needing to call support often, and is prepared to factor two scheduled price rises into the real 24-month cost. Anyone who wants similar budget pricing with a materially better service record should compare Plusnet before deciding, since it currently sits at the opposite end of Ofcom\'s complaints table.',
        ],
      },
    ],
    faqItems: [
      {
        question: 'Is TalkTalk broadband any good?',
        answer: 'TalkTalk offers some of the cheapest full-fibre and part-fibre broadband in the UK, from £25 a month, running on the same Openreach network as BT and Sky. Ofcom named it the most complained-about broadband provider for the third quarter running in its Q1 2026 complaints report, and its Trustpilot score sits at 1.5 out of 5 from over 50,000 reviews, so the low price comes with a real, well-documented service-quality trade-off.',
      },
      {
        question: 'Does TalkTalk raise its prices during the contract?',
        answer: 'Yes. Every current TalkTalk plan includes two scheduled price rises across its 24-month contract, one in April 2027 and one in April 2028, disclosed on the plan\'s own pricing page. A £25 Full Fibre 150 plan rises to £29 and then £33 over the full term, so the honest comparison against a flat-priced rival uses the full two-year cost, not the first month\'s bill.',
      },
      {
        question: 'Why does TalkTalk get so many complaints?',
        answer: 'Ofcom\'s Q1 2026 complaints report found TalkTalk\'s complaints mostly related to faults, service and provisioning, complaints handling, and billing and pricing problems, and it was the most complained-about broadband provider for the third consecutive quarter at the time of that report. This is specific to the residential broadband service; TalkTalk Business holds a considerably stronger customer-service record on Trustpilot.',
      },
      {
        question: 'What speed do I need from TalkTalk?',
        answer: 'Fibre 35 and Fibre 65 suit browsing, HD streaming and video calls for one or two people. Full Fibre 150 is a comfortable choice for most households, including several simultaneous streams and devices. Full Fibre 500 and Full Fibre 900 mainly benefit households that upload large files regularly, since TalkTalk\'s upload speeds scale with each full-fibre tier even though the company does not headline the figure on its own pricing pages.',
      },
    ],
    reviewedDate: '2026-08-23',
    pricingVerifiedDate: '2026-08-23',
    reviewSources: [
      {
        label: 'TalkTalk broadband packages and pricing',
        href: 'https://www.talktalk.co.uk/broadband',
        note: 'Used for current package lineup, pricing, contract length and the scheduled April 2027/April 2028 price rises, checked 2026-08-23.',
      },
      {
        label: 'TalkTalk Full Fibre 900 product page',
        href: 'https://www.talktalk.co.uk/broadband/full-fibre/900',
        note: 'Used for Full Fibre 900 download speed, minimum guaranteed speed and pricing, checked 2026-08-23.',
      },
      {
        label: 'Ofcom: telecoms and pay-TV complaints fall to a record low',
        href: 'https://www.ofcom.org.uk/phones-and-broadband/service-quality/ofcom-telecoms-and-pay-tv-complaints-fall-to-record-low',
        note: 'Primary regulatory source naming TalkTalk the most complained-about broadband provider in Q1 2026 and describing the main complaint categories.',
      },
      {
        label: 'Uswitch: Ofcom broadband and TV complaints rankings, August 2026',
        href: 'https://www.uswitch.com/broadband/news/ofcom-broadband-tv-complaints-rankings-august-2026/',
        note: 'Independent corroboration for the specific 10-per-100,000 figure and the third-consecutive-quarter finding drawn from the same Ofcom release.',
      },
      {
        label: 'TalkTalk public Trustpilot profile',
        href: 'https://uk.trustpilot.com/review/www.talktalk.co.uk',
        note: 'Direct fetch returned a 403; score and review count sourced via search of independent reporting on the same live Trustpilot page, checked 2026-08-23.',
      },
      {
        label: 'Awin TalkTalk advertiser programme',
        href: 'https://ui.awin.com/merchant-profile-terms/3674?setLocale=en_US',
        note: 'BroadbandPicker holds an approved (joined) relationship with this programme; the affiliate link above is a live publisher-specific Awin tracking link, verified 2026-08-23.',
      },
      {
        label: 'BroadbandPicker review methodology',
        href: '/how-we-review-broadband',
        note: 'Explains how price, speed, coverage, customer experience and use-case fit are weighed.',
      },
    ],
    awinProgramId: '3674',
  },
  {
    slug: 'plusnet',
    name: 'Plusnet',
    logo: '/logos/plusnet.svg',
    affiliateUrl: 'https://www.plus.net/broadband/',
    speeds: [
      { download: 74, upload: 18, type: 'FTTC' },
      { download: 145, upload: 27, type: 'FTTP' },
      { download: 300, upload: 50, type: 'FTTP' },
      { download: 500, upload: 75, type: 'FTTP' },
      { download: 900, upload: 110, type: 'FTTP' },
    ],
    monthlyPriceFrom: 21.99,
    contractLengths: [24],
    setupFee: 0,
    trustpilotScore: 2.0,
    coveragePercent: 96,
    highlights: [
      'Ofcom\'s Q1 2026 report ranked Plusnet the best of any major UK broadband provider for complaints',
      'A low Trustpilot score sits alongside genuinely strong regulatory complaints evidence, a gap worth understanding',
      'Reward cards worth up to £140 available on faster tiers, alongside no activation fee across the range',
    ],
    pros: [
      'Best Ofcom complaints record of any major UK ISP, at 4 per 100,000 customers in Q1 2026',
      'No activation fee on any current package',
      'UK-based customer service team, a specific point of positive review feedback',
      'Runs on the Openreach network, so line quality and availability match most other national providers',
    ],
    cons: [
      'Trustpilot score is low despite the strong Ofcom complaints record, largely reflecting self-selected complaint-driven reviews',
      'Only 24-month contracts are offered, with no shorter or rolling option',
      'A scheduled flat price rise applies every March',
      'Top speed tier tops out at 900 Mbps, without the higher multi-gigabit options some rivals now offer',
    ],
    excerpt:
      'Plusnet, part of BT Group, offers Full Fibre broadband from £21.99 to around £30 a month across five tiers, all on 24-month Openreach contracts. Ofcom\'s Q1 2026 complaints report ranked it the best of any major UK provider, at just 4 complaints per 100,000 customers, against TalkTalk\'s 10 and an industry average of 6. Its Trustpilot score is low despite this, a gap explained by how differently the two measures are collected, not a contradiction in Plusnet\'s actual service quality.',
    contentSections: [
      {
        heading: 'Plusnet Broadband Deals in August 2026',
        paragraphs: [
          'Plusnet\'s range runs from Full Fibre 74 at £21.99 a month, through Full Fibre 145 at £22.99, Full Fibre 300 at £24.99 and Full Fibre 500 at £27.99, up to Full Fibre 900 at £29.99. Reward cards worth up to £100 on the entry and mid tiers, and up to £140 on Full Fibre 900, are available on top of the headline price.',
          'Every current package includes the Plusnet Hub Two router, unlimited data and no activation fee, a genuinely competitive combination against rivals that charge separately for setup or hardware. As with any reward card offer, the saving only materialises if the card is actually claimed and used.',
          'Every package runs on a 24-month contract, with no shorter or rolling monthly option currently published, consistent with BT Group\'s other brands, BT and EE, which follow the same contract-length pattern.',
        ],
      },
      {
        heading: 'Plusnet Speeds and the Openreach Network',
        paragraphs: [
          'Plusnet runs on the Openreach network, the same infrastructure as BT, Sky, TalkTalk, EE and Vodafone, so top available speed and line quality at a given address is broadly consistent across these providers; the meaningful differences are price, contract terms and support.',
          'Full Fibre 74 and 145 comfortably cover typical household use, streaming, browsing and video calls for several people. Full Fibre 300 and above mainly benefit larger households running multiple demanding activities at once, or anyone who wants meaningful upload headroom for cloud backups or video calls.',
          'Plusnet\'s top published tier, Full Fibre 900, sits below the 2 Gbps-plus tiers some rivals, including Vodafone and several full-fibre altnets, now offer. For most households this is not a practical limitation, since very few single devices can use speeds much above 1 Gbps in any case.',
        ],
      },
      {
        heading: 'Plusnet\'s Ofcom Complaints Record: Best in Class',
        paragraphs: [
          'Ofcom\'s Q1 2026 complaints report recorded Plusnet at 4 complaints per 100,000 customers, the lowest figure of any major UK broadband provider in that report, well below TalkTalk\'s 10, Vodafone\'s 8 and BT\'s 7, and below the industry average of 6. This is genuinely strong, independently measured evidence of service quality, not a marketing claim.',
          'This matters specifically because Plusnet\'s Trustpilot score does not reflect the same picture, sitting considerably lower than its Ofcom complaints ranking would suggest. The two measures capture different things: Ofcom counts formal complaints across the whole customer base, while Trustpilot reviews are self-selected and skew toward people motivated to complain after a specific bad experience, such as a difficult installation or a billing dispute.',
          'Reading Plusnet\'s low Trustpilot score without the Ofcom context risks a misleading conclusion. The regulatory data is the stronger signal here: Plusnet\'s actual complaint rate across its full customer base is the best of any major UK provider currently tracked by Ofcom.',
        ],
      },
      {
        heading: 'Router and Setup',
        paragraphs: [
          'The Plusnet Hub Two is included as standard across the range, capable of handling the full-fibre speeds on offer without a separate upgrade requirement. No activation fee applies to any current package, removing one of the more variable upfront costs seen with some rivals.',
          'Anyone in a larger property should check whether router placement is likely to leave any rooms with weak coverage before ordering, since Plusnet\'s standard package does not include a bundled mesh add-on the way some altnets do.',
          'Installation follows the standard Openreach engineer process where a new line is needed, with UK-based customer service handling the booking and any issues that arise.',
        ],
      },
      {
        heading: 'Price Rises and Contract Terms',
        paragraphs: [
          'A flat price rise applies to Plusnet contracts each March: £3 a month for customers who signed up between April 2024 and August 2025, and £4 a month for anyone signing up from August 2025 onward, with further £4 rises scheduled for March 2027 and March 2028. This follows Ofcom\'s ban on inflation-linked, percentage-based price rise terms in all new contracts from January 2025.',
          'A new Plusnet customer signing up today should expect the £4 a month structure. Factor this into the real two-year cost when comparing Plusnet against a provider with a smaller rise or none at all, rather than judging on the first month\'s headline price.',
          'These rises are disclosed upfront on Plusnet\'s pricing pages rather than added later, consistent with the wider BT Group approach across BT, EE and Plusnet.',
        ],
      },
      {
        heading: 'Installation and Switching to Plusnet',
        paragraphs: [
          'Because Plusnet runs on Openreach, most switches from another Openreach-based provider qualify for Ofcom\'s One Touch Switch process, a same-day handover with no need to contact the outgoing provider directly.',
          'A switch from a provider on a separate network, such as Virgin Media\'s cable infrastructure or a full-fibre altnet, will not use One Touch Switch, so keep the existing connection running until the new Plusnet line is confirmed working.',
          'Plusnet\'s UK-based customer service team is a specifically cited positive in reviews, which is consistent with its strong Ofcom complaints ranking; anyone who has had a difficult experience with a rival\'s support line may find this a genuine point of difference.',
        ],
      },
      {
        heading: 'Is Plusnet Broadband Worth It?',
        paragraphs: [
          'Plusnet\'s case is unusually strong once the Ofcom complaints data is factored in alongside the price: a genuinely low headline cost, no activation fee, and the best complaints record of any major UK provider currently tracked, at a time when its main rivals are all in the same general price bracket.',
          'The one real caveat is speed ceiling: Full Fibre 900 is Plusnet\'s fastest published tier, below what Vodafone and several full-fibre altnets now offer, though this is a genuine limitation for very few households in practice.',
          'Our take: Plusnet is one of the stronger all-round choices among the national Openreach-based providers, combining budget-competitive pricing with the best regulatory complaints evidence in the market, and its low Trustpilot score should not be read as contradicting that.',
        ],
      },
    ],
    faqItems: [
      {
        question: 'Is Plusnet broadband any good?',
        answer: 'Ofcom\'s Q1 2026 report ranked Plusnet the best of any major UK broadband provider for complaints, at 4 per 100,000 customers, against an industry average of 6. Its Trustpilot score is low, but this reflects the self-selected nature of review platforms rather than actual service quality, which the regulatory data measures more reliably across the whole customer base.',
      },
      {
        question: 'Why is Plusnet\'s Trustpilot score low if Ofcom ranks it best for complaints?',
        answer: 'Trustpilot reviews are self-selected and skew toward customers motivated to leave a review after a specific bad experience, such as a difficult installation or billing dispute. Ofcom\'s complaints data measures formal complaint volume across Plusnet\'s entire customer base, which is the more representative measure and shows Plusnet performing best in class.',
      },
      {
        question: 'Does Plusnet raise its prices during the contract?',
        answer: 'Yes. A flat price rise applies each March, £3 a month for customers who signed up between April 2024 and August 2025, and £4 a month for anyone signing up from August 2025 onward, following Ofcom\'s ban on inflation-linked price rise terms from January 2025. Every current package runs on a 24-month contract.',
      },
      {
        question: 'What speed do I need from Plusnet?',
        answer: 'Full Fibre 74 or 145 comfortably covers most households, including streaming, browsing and several devices in use at once. Full Fibre 300 and above mainly benefit larger households running multiple demanding activities simultaneously or anyone who specifically needs more upload headroom.',
      },
    ],
    reviewedDate: '2026-08-23',
    pricingVerifiedDate: '2026-08-23',
    reviewSources: [
      {
        label: 'Uswitch: Plusnet broadband packages and pricing',
        href: 'https://www.uswitch.com/broadband/providers/plusnet/',
        note: 'Used for current package lineup, pricing, reward cards and router details, checked 2026-08-23.',
      },
      {
        label: 'Ofcom: telecoms and pay-TV complaints fall to a record low',
        href: 'https://www.ofcom.org.uk/phones-and-broadband/service-quality/ofcom-telecoms-and-pay-tv-complaints-fall-to-record-low',
        note: 'Primary regulatory source for Plusnet\'s best-in-class Q1 2026 complaints ranking at 4 per 100,000 customers.',
      },
      {
        label: 'Ofcom: ban on mid-contract price rises linked to inflation',
        href: 'https://www.ofcom.org.uk/phones-and-broadband/bills-and-charges/ofcom-bans-mid-contract-price-rises-linked-to-inflation',
        note: 'Primary regulatory source for the January 2025 ban on inflation-linked price rise terms and Plusnet\'s resulting flat March rise.',
      },
      {
        label: 'GB News: Plusnet price rise structure by sign-up date',
        href: 'https://www.gbnews.com/tech/bt-ee-plusnet-broadband-change-price-rise',
        note: 'Independent corroboration for the £3/£4 a month price rise split by contract start date.',
      },
      {
        label: 'Plusnet public Trustpilot profile',
        href: 'https://uk.trustpilot.com/review/plus.net',
        note: 'Customer-sentiment reference showing a low score in August 2026; read alongside Ofcom\'s Q1 2026 complaints data, which shows a materially different picture; not treated as a controlled reliability survey on its own.',
      },
      {
        label: 'Awin Plusnet advertiser programme',
        href: 'https://ui.awin.com/merchant-profile-terms/2973?setLocale=en_US',
        note: 'BroadbandPicker\'s Awin application for this programme was declined. The affiliate link above is Plusnet\'s own site, verified 2026-08-23.',
      },
      {
        label: 'BroadbandPicker review methodology',
        href: '/how-we-review-broadband',
        note: 'Explains how price, speed, coverage, customer experience and use-case fit are weighed.',
      },
    ],
    awinProgramId: '2973',
  },
  {
    slug: 'vodafone',
    name: 'Vodafone',
    logo: '/logos/vodafone.svg',
    affiliateUrl: 'https://www.vodafone.co.uk/broadband',
    speeds: [
      { download: 73, upload: 19, type: 'FTTC' },
      { download: 150, upload: 30, type: 'FTTP' },
      { download: 500, upload: 75, type: 'FTTP' },
      { download: 910, upload: 100, type: 'FTTP' },
    ],
    monthlyPriceFrom: 25.00,
    contractLengths: [24],
    setupFee: 0,
    trustpilotScore: 1.3,
    coveragePercent: 94,
    highlights: [
      'Vodafone Xtra bundles an Apple TV 4K device and three months of Apple TV with eligible plans',
      'Ofcom\'s Q1 2026 report named Vodafone the second most complained-about broadband provider in the UK',
      'A flat £3.50 a month price rise applies each April, disclosed upfront in pounds and pence',
    ],
    pros: [
      'A genuinely useful bundled Apple TV 4K offer on Xtra plans, not offered by most rivals',
      'Discount available when bundled with an existing Vodafone mobile contract',
      'A Wi-Fi Guarantee promising money back if speeds fall short of expectations',
      'Runs on the Openreach network, so line quality and availability match most other national providers',
    ],
    cons: [
      'Named the second most complained-about broadband provider in the UK by Ofcom\'s Q1 2026 report',
      'Broadband-specific Trustpilot score is among the lowest of any major UK provider',
      'Only 24-month contracts are offered, with no shorter or rolling option',
      'A scheduled flat price rise applies every April',
    ],
    excerpt:
      'Vodafone offers Full Fibre broadband from £25 to around £45 a month across four speed tiers, all on 24-month Openreach contracts, with a distinctive Apple TV 4K bundle on its Xtra plans. Ofcom\'s Q1 2026 complaints report named Vodafone the second most complained-about broadband provider in the UK, at 8 complaints per 100,000 customers, and its broadband-specific Trustpilot score is exceptionally low, a pattern worth understanding before deciding based on price and bundled extras alone.',
    contentSections: [
      {
        heading: 'Vodafone Broadband Deals in August 2026',
        paragraphs: [
          'Vodafone\'s range runs from Superfast 2, part-fibre at 73 Mbps for around £25 a month, through Pro at 150 Mbps for around £28, up to Pro Xtra at 910 Mbps for around £38 to £45 depending on current promotions. Eligible customers can access a Vodafone Pro tier reaching up to 2.2 Gbps in areas with the necessary infrastructure.',
          'Vodafone Xtra plans bundle an Apple TV 4K device with three months of Apple TV included, plus anytime UK calls to landlines and mobiles, a genuinely distinctive extra among the major providers covered on this site. Confirm what happens to the Apple TV device and subscription after the initial three months before treating it as a permanently free perk.',
          'Every current package runs on a 24-month contract. Vodafone offers a discount for customers who bundle broadband with an existing Vodafone mobile plan, worth checking directly if already a Vodafone mobile customer.',
        ],
      },
      {
        heading: 'Vodafone Speeds and the Openreach Network',
        paragraphs: [
          'Vodafone runs its broadband over the Openreach network, the same infrastructure used by BT, Sky, TalkTalk, Plusnet and EE, so top available speed and line quality at a given address is broadly consistent regardless of which of these providers is chosen.',
          'Superfast 2, at 73 Mbps, suits light to moderate households comfortably. Pro at 150 Mbps covers most typical households with room to spare. Pro Xtra\'s 910 Mbps and the higher-tier 2.2 Gbps option mainly benefit larger households running several demanding activities simultaneously, or anyone who specifically wants the fastest available speed regardless of daily need.',
          'Vodafone\'s Wi-Fi Guarantee promises money back if delivered speeds fall short of what was promised at sign-up, worth checking the exact terms and claim process before relying on it as a safety net.',
        ],
      },
      {
        heading: 'Vodafone\'s Broadband-Specific Trustpilot Score',
        paragraphs: [
          'Vodafone\'s well-known headline Trustpilot score, around 4.1 out of 5, is dominated by mobile phone customers rather than broadband customers, the same pattern seen with EE\'s Trustpilot page, since both companies run their mobile and broadband customer feedback through the same overall brand profile.',
          'A broadband-specific view tells a different story: independent analysis puts Vodafone\'s broadband-focused rating around 1.3 out of 5, among the lowest of any major UK provider, below Sky, BT and Virgin Media on the same comparison. This is the more relevant figure for anyone specifically evaluating Vodafone\'s broadband service rather than its mobile network.',
          'Negative reviews consistently cite long waits for engineer visits and slow complaint response times; positive reviews, where present, focus on speed and reliability once a connection is up and running, a similar pattern to EE\'s broadband reviews.',
        ],
      },
      {
        heading: 'Ofcom Complaints: Vodafone Ranked Second Worst',
        paragraphs: [
          'Ofcom\'s Q1 2026 complaints report named Vodafone the second most complained-about broadband provider in the UK, at 8 complaints per 100,000 customers, behind only TalkTalk\'s 10 and above BT\'s 7, against an industry average of 6. Complaints mainly related to faults, service and provisioning, and billing issues, a similar pattern to the other providers at the top of the same table.',
          'This is regulatory data measuring formal complaint volume across Vodafone\'s whole broadband customer base, a more representative measure than a single review platform score, and it corroborates rather than contradicts the low broadband-specific Trustpilot rating.',
          'Taken together, Ofcom\'s complaints ranking and the broadband-specific Trustpilot score point the same way: Vodafone\'s customer service and fault-handling record is a genuine weak point, not a review-platform artefact.',
        ],
      },
      {
        heading: 'Price Rises and Contract Terms',
        paragraphs: [
          'A flat £3.50 a month price rise applies to Vodafone broadband contracts each April, disclosed upfront in pounds and pence following Ofcom\'s ban on inflation-linked, percentage-based price rise terms in all new contracts from January 2025.',
          'Every current package runs on a 24-month contract, with no shorter or rolling monthly option published. Factor the scheduled April rise into the real two-year cost when comparing Vodafone against a provider with a smaller rise or none at all.',
          'The Apple TV 4K bundle on Xtra plans is worth valuing separately from the headline broadband price when comparing against a rival\'s cheaper equivalent plan without the device included.',
        ],
      },
      {
        heading: 'Installation and Switching to Vodafone',
        paragraphs: [
          'Because Vodafone runs on Openreach, most switches from another Openreach-based provider qualify for Ofcom\'s One Touch Switch process, a same-day handover with no need to contact the outgoing provider directly.',
          'A switch from a provider on a separate network, such as Virgin Media\'s cable infrastructure or a full-fibre altnet, will not use One Touch Switch, so keep the existing connection running until the new Vodafone line is confirmed working.',
          'Given the engineer-visit wait times raised in reviews, anyone with a time-sensitive need for a working connection should ask Vodafone directly for a realistic installation date rather than assuming a fast turnaround.',
        ],
      },
      {
        heading: 'Is Vodafone Broadband Worth It?',
        paragraphs: [
          'Vodafone\'s genuine strengths are the Apple TV 4K bundle on Xtra plans and mobile bundle discounts for existing Vodafone customers, both real, substantive benefits rather than marketing-only claims.',
          'The customer service picture is a real concern, not a review-platform quirk: Ofcom ranked Vodafone the second most complained-about broadband provider in the UK in its most recent report, and the broadband-specific Trustpilot score corroborates that finding independently.',
          'Our take: Vodafone suits an existing Vodafone mobile customer who values the bundle discount and the Apple TV 4K offer specifically, and is prepared to accept a real, evidenced risk of slower support if something goes wrong, rather than a household prioritising customer service above all else.',
        ],
      },
    ],
    faqItems: [
      {
        question: 'Is Vodafone broadband any good?',
        answer: 'Vodafone offers genuinely useful extras, including an Apple TV 4K bundle on Xtra plans and mobile bundle discounts, but Ofcom named it the second most complained-about broadband provider in the UK in its Q1 2026 report, and its broadband-specific Trustpilot score is among the lowest of any major provider. It suits existing Vodafone mobile customers more than anyone prioritising customer service.',
      },
      {
        question: 'Why does Vodafone have two different Trustpilot scores?',
        answer: 'Vodafone\'s well-known headline Trustpilot score, around 4.1 out of 5, is dominated by mobile phone customers rather than broadband customers. A broadband-specific view puts Vodafone\'s rating around 1.3 out of 5, among the lowest of any major UK provider, which is the more relevant figure for a broadband-specific decision.',
      },
      {
        question: 'Does Vodafone raise its prices during the contract?',
        answer: 'Yes. A flat £3.50 a month price rise applies each April, disclosed upfront in pounds and pence following Ofcom\'s ban on inflation-linked price rise terms from January 2025. Every current package runs on a 24-month contract, so this rise applies once during the standard contract term.',
      },
      {
        question: 'What does Vodafone Xtra include?',
        answer: 'Vodafone Xtra bundles an Apple TV 4K device with three months of Apple TV included, plus anytime UK calls to landlines and mobiles, alongside the standard broadband package. Confirm what happens to the device and subscription after the initial three months before treating it as a permanently free extra.',
      },
    ],
    reviewedDate: '2026-08-23',
    pricingVerifiedDate: '2026-08-23',
    reviewSources: [
      {
        label: 'Vodafone broadband deals and pricing',
        href: 'https://www.vodafone.co.uk/broadband',
        note: 'Used for current package lineup, Xtra bundle details and headline pricing, checked 2026-08-23.',
      },
      {
        label: 'Selectra: Vodafone broadband review, Trustpilot and Ofcom summary',
        href: 'https://selectra.co.uk/tv-broadband/providers/vodafone/broadband-review',
        note: 'Used to corroborate the distinction between Vodafone\'s mobile-dominated headline Trustpilot score and its broadband-specific score.',
      },
      {
        label: 'Ofcom: telecoms and pay-TV complaints fall to a record low',
        href: 'https://www.ofcom.org.uk/phones-and-broadband/service-quality/ofcom-telecoms-and-pay-tv-complaints-fall-to-record-low',
        note: 'Primary regulatory source for Vodafone\'s Q1 2026 complaints ranking, second-worst in the UK at 8 per 100,000 customers.',
      },
      {
        label: 'Ofcom: ban on mid-contract price rises linked to inflation',
        href: 'https://www.ofcom.org.uk/phones-and-broadband/bills-and-charges/ofcom-bans-mid-contract-price-rises-linked-to-inflation',
        note: 'Primary regulatory source for the January 2025 ban on inflation-linked, percentage-based price rise terms.',
      },
      {
        label: 'Vodafone public Trustpilot profile',
        href: 'https://uk.trustpilot.com/review/vodafone.co.uk',
        note: 'Customer-sentiment reference; broadband-specific rating estimated around 1.3 out of 5 in August 2026 based on independent analysis distinguishing it from the mobile-dominated headline score; not treated as a controlled reliability survey.',
      },
      {
        label: 'Awin Vodafone advertiser programme',
        href: 'https://ui.awin.com/merchant-profile-terms/1257?setLocale=en_US',
        note: 'BroadbandPicker\'s Awin application for this programme was declined. The affiliate link above is Vodafone\'s own site, verified 2026-08-23.',
      },
      {
        label: 'BroadbandPicker review methodology',
        href: '/how-we-review-broadband',
        note: 'Explains how price, speed, coverage, customer experience and use-case fit are weighed.',
      },
    ],
    awinProgramId: '1257',
  },
  {
    slug: 'now-broadband',
    name: 'NOW Broadband',
    logo: '/logos/now-broadband.svg',
    affiliateUrl: 'https://www.nowtv.com/broadband',
    speeds: [
      { download: 67, upload: 17, type: 'FTTC' },
      { download: 75, upload: 20, type: 'FTTP' },
      { download: 100, upload: 20, type: 'FTTP' },
      { download: 300, upload: 50, type: 'FTTP' },
    ],
    monthlyPriceFrom: 23.00,
    contractLengths: [24],
    setupFee: 5,
    trustpilotScore: 1.2,
    coveragePercent: 95,
    highlights: [
      'Owned by Sky, running on the same Openreach network, but a noticeably weaker customer service record than its parent brand',
      'No longer a budget or flexible-contract option: every current package is a standard 24-month term from £23 a month',
      'A £5 advance fee is credited back to the first bill, so it is not a genuine extra cost if the credit is applied correctly',
    ],
    pros: [
      'Full Fibre 100 undercuts Sky\'s own equivalent full-fibre tier by around £1 a month',
      'Voucher credits worth £70-£75 are commonly available at sign-up',
      'Runs on the wide-reaching Openreach network, like its parent brand Sky',
    ],
    cons: [
      'Very low Trustpilot score, around 1.2 out of 5, and an Ofcom complaints record that is also genuinely poor rather than just self-selected review noise',
      'No longer offers the shorter, flexible 12-month contracts it built its early reputation on; every package is now a 24-month term',
      'New contracts disclose a scheduled £3 a month rise in April 2027 and again in April 2028, a more predictable structure than Sky\'s open-ended "prices may rise" wording',
      'Customer service, especially around cancellation and the auto-renewal process, is the most consistently cited weakness',
    ],
    excerpt:
      'NOW Broadband is owned by Sky and runs on the same Openreach network, with prices from £23 a month for Full Fibre 100, up to £26 for Full Fibre 300, all on 24-month contracts. A £5 advance fee is credited back to the first bill. Unlike Sky, where a low Trustpilot score sits alongside a strong Ofcom complaints record, NOW Broadband scores poorly on both: around 1.2 out of 5 on Trustpilot and 11 complaints per 100,000 customers in Ofcom\'s Q4 2025 data, above the industry average of 8.',
    contentSections: [
      {
        heading: 'NOW Broadband Deals in August 2026',
        paragraphs: [
          'NOW\'s current range runs from Superfast at £24 a month for an average 67 Mbps, Full Fibre 75 also at £24, Full Fibre 100 at £23 (the cheapest tier despite being faster than Superfast), up to Full Fibre 300 at £26. A £5 advance fee applies at sign-up but is credited back to the first bill, so it is not a genuine net cost if the credit is applied as promised.',
          'Every package is sold on a 24-month contract, with no shorter or rolling option currently available. Voucher credits worth £70 to £75 are commonly attached to NOW\'s current deals, worth factoring into the real cost when comparing against a rival\'s headline monthly price.',
          'NOW is a genuinely simpler, no-frills product than its parent brand Sky: there is no equivalent TV bundle range, and the pitch is a lower headline price on the same underlying Openreach network rather than any additional service.',
        ],
      },
      {
        heading: 'NOW Broadband Is No Longer a Budget, Flexible-Contract Option',
        paragraphs: [
          'NOW Broadband built its early reputation on shorter, more flexible 12-month contracts at a genuinely low price, a real point of difference from most major providers. That is no longer the case: every current package is sold on a standard 24-month term, the same length BT, Sky and most other national providers use.',
          'The pricing gap has also narrowed. Full Fibre 100 at £23 a month undercuts Sky\'s own equivalent full-fibre tier by only around £1, not the large gap NOW\'s reputation as a genuinely cheap budget brand might suggest. Anyone choosing NOW specifically for its old reputation should re-check the current contract length and price against Sky and other Openreach-based rivals before assuming it is still the clearly cheaper or more flexible option.',
          'This matters because a household that specifically wants a shorter commitment, rather than just a lower price, will not find that on NOW\'s current range and should look at a genuinely rolling or 12-month contract from a different, smaller provider instead.',
        ],
      },
      {
        heading: 'NOW\'s Price Rise Structure: More Predictable Than Sky\'s',
        paragraphs: [
          'NOW Broadband did not apply a mid-contract price rise in April 2026, unlike its parent brand Sky, which raised prices by a flat £3 a month that month. Current NOW contracts instead disclose a scheduled £3 a month rise dated for April 2027, and a further £3 for April 2028, a fixed, dated structure rather than Sky\'s open-ended "prices may rise" wording, following Ofcom\'s ban on inflation-linked, percentage-based price rise terms in all new contracts from 17 January 2025.',
          'Over a 24-month contract starting now, that means the price stays flat through the first year, with a £3 rise from April 2027 if the contract is still running by then. This is a genuinely clearer structure than several rivals, worth factoring into the real cost comparison against a provider with an undisclosed or larger scheduled rise.',
        ],
      },
      {
        heading: 'NOW Broadband Customer Service: Poor on Both Trustpilot and Ofcom',
        paragraphs: [
          'NOW Broadband is a genuine exception to the usual pattern seen across most providers on this site, where a very low Trustpilot score sits alongside a much stronger, independently regulated Ofcom complaints position. NOW scores poorly on both: around 1.2 out of 5 on Trustpilot from more than 14,000 reviews, and 11 complaints per 100,000 customers in Ofcom\'s Q4 2025 data, above the industry average of 8 and well behind sister brand Sky.',
          'The most consistently cited issues are customer service quality, the cancellation process and how the contract auto-renewal is communicated, alongside standard fault and billing complaints. Because NOW shares Sky\'s underlying Openreach network and infrastructure, the gap in service quality between the two Sky-owned brands is a genuine, worthwhile data point rather than noise: the network is the same, but the support experience is measurably worse on NOW.',
          'Anyone drawn to NOW mainly for a lower headline price should weigh this genuinely poor complaints record against the relatively small saving over Sky\'s own equivalent full-fibre tier before deciding it is worth the trade-off.',
        ],
      },
      {
        heading: 'Is NOW Broadband Worth It?',
        paragraphs: [
          'NOW\'s real advantage is a slightly lower headline price than its parent brand Sky on the same Openreach network, plus commonly available voucher credits at sign-up. The £5 advance fee is not a genuine extra cost as long as the credit is correctly applied to the first bill.',
          'It is not the budget or flexible-contract option it once was: contracts are now a standard 24 months, and the price gap against Sky has narrowed to around £1 a month on the equivalent tier. Its customer service record is genuinely weaker than Sky\'s on both an independent, self-selected review platform and Ofcom\'s regulated complaints data, not just one or the other.',
          'Our take: NOW suits a household that specifically wants the lowest possible headline price on the Openreach network and does not expect to need much customer support, rather than anyone drawn to its older reputation for flexible, shorter contracts, which no longer applies.',
        ],
      },
    ],
    faqItems: [
      {
        question: 'Is NOW Broadband any good?',
        answer: 'NOW Broadband offers a genuinely low headline price on the same Openreach network as its parent brand Sky, but its customer service record is weaker on both measures that matter: around 1.2 out of 5 on Trustpilot and 11 complaints per 100,000 customers in Ofcom\'s Q4 2025 data, above the industry average of 8 and worse than Sky itself.',
      },
      {
        question: 'Does NOW Broadband still offer 12-month contracts?',
        answer: 'No. Every current NOW Broadband package is sold on a standard 24-month contract, the same length as most major providers. Its earlier reputation for shorter, more flexible 12-month terms no longer reflects the current range.',
      },
      {
        question: 'Is NOW Broadband cheaper than Sky?',
        answer: 'Only slightly. NOW\'s Full Fibre 100 at £23 a month undercuts Sky\'s equivalent full-fibre tier by around £1, a much smaller gap than NOW\'s budget reputation might suggest, given both now run on the same network with the same 24-month contract length. NOW\'s price-rise structure is actually more predictable than Sky\'s, with scheduled £3 rises dated for April 2027 and April 2028 rather than Sky\'s open-ended contract wording.',
      },
      {
        question: 'Does NOW Broadband raise its prices during the contract?',
        answer: 'Not immediately. NOW did not raise prices in April 2026, unlike Sky, which applied a flat £3 a month rise that month. Current NOW contracts do disclose a scheduled £3 a month rise for April 2027, and a further £3 for April 2028, both fixed and dated rather than open-ended.',
      },
    ],
    reviewedDate: '2026-08-24',
    pricingVerifiedDate: '2026-08-24',
    reviewSources: [
      {
        label: 'Uswitch: NOW Broadband packages and pricing',
        href: 'https://www.uswitch.com/broadband/providers/now_broadband/',
        note: 'Used for the current package lineup, pricing snapshot, setup fee and contract length, checked 2026-08-24.',
      },
      {
        label: 'thinkbroadband: NOW broadband contracts now 24 months long',
        href: 'https://www.thinkbroadband.com/news/10101-now-broadband-contracts-now-24-months-long',
        note: 'Primary source for the change away from NOW\'s earlier shorter, flexible contract terms.',
      },
      {
        label: 'Ofcom: telecoms and pay-TV complaints fall to a record low',
        href: 'https://www.ofcom.org.uk/phones-and-broadband/service-quality/ofcom-telecoms-and-pay-tv-complaints-fall-to-record-low',
        note: 'Primary regulatory source for NOW Broadband\'s Q4 2025 complaints ranking (11 per 100,000) and the industry average.',
      },
      {
        label: 'Selectra: NOW (NOW TV) Trustpilot, Reviews.io and complaints summary',
        href: 'https://selectra.co.uk/tv-broadband/providers/now-tv/review',
        note: 'Used to corroborate the Trustpilot score and identify the most common complaint categories.',
      },
      {
        label: 'NOW public Trustpilot profile',
        href: 'https://uk.trustpilot.com/review/nowtv.com',
        note: 'Customer-sentiment reference showing a rating around 1.2 out of 5 from more than 14,000 reviews in early 2026; not treated as a controlled reliability survey.',
      },
      {
        label: 'BroadbandPicker review methodology',
        href: '/how-we-review-broadband',
        note: 'Explains how price, speed, coverage, customer experience and use-case fit are weighed.',
      },
    ],
    awinProgramId: null,
  },
  {
    slug: 'hyperoptic',
    name: 'Hyperoptic',
    logo: '/logos/hyperoptic.svg',
    affiliateUrl: 'https://www.hyperoptic.com/',
    speeds: [
      { download: 57, upload: 5, type: 'FTTP' },
      { download: 159, upload: 159, type: 'FTTP' },
      { download: 526, upload: 526, type: 'FTTP' },
      { download: 1000, upload: 1000, type: 'FTTP' },
    ],
    monthlyPriceFrom: 21.50,
    contractLengths: [12, 24],
    setupFee: 0,
    trustpilotScore: 4.5,
    coveragePercent: 8,
    highlights: [
      'One of the highest Trustpilot scores of any UK ISP, from more than 52,000 reviews',
      'Fully symmetrical speeds on every tier except the cheapest entry-level plan',
      'A genuine social tariff at two price points, £15 and £20 a month, with no fixed contract',
    ],
    pros: [
      'Consistently among the best-reviewed ISPs in the UK on Trustpilot',
      'Symmetrical full-fibre speeds from 159 Mbps upward, a genuine advantage for uploads',
      'A real social tariff, no fixed contract, at two price points for eligible households',
      'No setup fee across the range',
    ],
    cons: [
      'Coverage remains concentrated in London and a limited number of other major UK cities',
      'A scheduled annual price rise of around £4 a month applies to fixed-term contracts',
      'The cheapest entry tier is not symmetrical, unlike the rest of the range',
      'Installation requires the building to be wired, which needs landlord or freeholder permission in rented properties',
    ],
    excerpt:
      'Hyperoptic is a full-fibre altnet concentrated in London and a number of other major UK cities, with symmetrical speeds from 159 Mbps to 1,000 Mbps, from £21.50 a month, plus a genuine no-contract social tariff at £15 or £20 a month. Its Trustpilot score, around 4.5 out of 5 from over 52,000 reviews, is among the best of any UK ISP. The main limitation is coverage: this is a building-by-building network, not available on demand everywhere.',
    contentSections: [
      {
        heading: 'Hyperoptic Broadband Deals in August 2026',
        paragraphs: [
          'Hyperoptic\'s entry tier, a non-symmetrical 50 Mbps plan (57 Mbps down, 5 Mbps up), starts from around £21.50 to £28.50 a month depending on contract length. The core symmetrical range starts at 150 Mbps (around £22.99 to £29), moves to 500 Mbps (around £27 to £33), and tops out at 1 Gbps from around £26, with pricing varying by contract length and current promotion.',
          'A genuine social tariff is available outside the standard range: Essential 50 at £15 a month and Essential 150 at £20 a month, both for households on qualifying means-tested benefits, and both with no fixed contract, a real, no-catch offer rather than a marketing-only mention.',
          'No setup fee applies across the range. As with any provider, confirm the live price and promotion for the specific address and building at checkout, since Hyperoptic\'s pricing can vary by location.',
        ],
      },
      {
        heading: 'Hyperoptic Coverage: London and Major UK Cities',
        paragraphs: [
          'Hyperoptic has built out its own full-fibre network since 2011, concentrated in London and a number of other major UK cities, historically reported as operating across around 28 cities with an ongoing ambition to add more. This is a fundamentally building-by-building network, not a general area rollout, so a city being served does not mean a specific building is connected.',
          'Hyperoptic\'s coverage strategy focuses heavily on apartment blocks and dense residential buildings, where wiring one building serves many households efficiently. This makes it a strong option in the right kind of property, and largely irrelevant to a standalone house outside its footprint.',
          'Anyone outside London or one of Hyperoptic\'s other served cities should not expect it to be available at all. Its own postcode and building checker is the only reliable way to confirm whether a specific address is connected or connectable.',
        ],
      },
      {
        heading: 'Hyperoptic Speeds: Symmetrical Above the Entry Tier',
        paragraphs: [
          'Every Hyperoptic tier from 150 Mbps upward is fully symmetrical, meaning upload matches download exactly, a genuine advantage for cloud backups, large file transfers and video calls where several people in a household are on camera simultaneously. Only the cheapest 50 Mbps entry tier breaks this pattern, with a much lower 5 Mbps upload speed.',
          'For most households, the 150 Mbps symmetrical tier already comfortably covers streaming, browsing, working from home and several devices in use at once. The 500 Mbps and 1 Gbps tiers mainly benefit larger households running multiple demanding activities simultaneously, or anyone who specifically wants the fastest widely available speed.',
          'Anyone considering the 50 Mbps entry tier specifically for its low price should understand that its 5 Mbps upload speed is considerably below what the rest of Hyperoptic\'s range, and most full-fibre altnets covered on this site, now offer.',
        ],
      },
      {
        heading: 'Installation: Building Wiring and Landlord Permission',
        paragraphs: [
          'A standard Hyperoptic installation involves drilling a small, roughly 10mm hole, most commonly above the front door, and running up to 10 metres of surface-mounted cable to the router, with the whole appointment typically taking around an hour once a technician arrives.',
          'Because this is physical building work, a landlord or freeholder\'s permission, known as a wayleave agreement, is normally required before installation in a rented property or a leasehold flat. As of 2026, there is no statutory UK tenant right to full fibre, so this permission cannot be assumed or demanded; renters should raise it with the landlord or managing agent early, and check whether the building already has an existing Hyperoptic wayleave in place, which can make installation considerably faster.',
          'A building without an existing wayleave or Hyperoptic infrastructure already in place may face a longer lead time than a building where a neighbour has already had the network installed, so ask directly what is already in place before assuming a fast turnaround.',
        ],
      },
      {
        heading: 'Contract Terms and the Annual Price Rise',
        paragraphs: [
          'Hyperoptic offers 12 and 24-month contracts on its core range, alongside the no-contract social tariff for eligible households. A scheduled annual price rise of around £4 a month applies to fixed-term contracts each April, disclosed upfront in pounds and pence, following Ofcom\'s ban on inflation-linked, percentage-based price rise terms from January 2025.',
          'Over a 24-month term, this rise is a real cost to factor in alongside the headline monthly price, and is broadly comparable in size to the rises now applied by BT, EE, Vodafone and Plusnet, though Hyperoptic\'s underlying symmetrical speed offering remains a genuine differentiator from those Openreach-based national providers.',
          'The social tariff\'s no-contract structure is a meaningful exception to this pattern, and worth checking directly for anyone who may be eligible, since it avoids both the fixed term and the scheduled rise entirely.',
        ],
      },
      {
        heading: 'Hyperoptic Customer Service and Reviews',
        paragraphs: [
          'Hyperoptic\'s Trustpilot profile showed a rating around 4.5 out of 5 from over 52,000 reviews at the point of this check, one of the strongest scores of any UK broadband provider and considerably ahead of most national Openreach-based providers covered elsewhere on this site.',
          'This strong review pattern, combined with over a decade of operating history since 2011, gives Hyperoptic a genuinely longer, more independently evidenced track record than most newer full-fibre altnets, which is worth weighing alongside its more limited coverage footprint.',
          'As with any review platform, treat this as customer sentiment rather than an independently controlled reliability measurement, though the consistency of a high score across such a large review volume is itself a meaningful signal.',
        ],
      },
      {
        heading: 'Is Hyperoptic Broadband Any Good?',
        paragraphs: [
          'Where it is available, Hyperoptic is one of the strongest options on the market: genuinely symmetrical speeds above the entry tier, a strong, well-evidenced review record, a real social tariff, and over a decade of operating history in its core cities.',
          'The limitation is entirely coverage. This is a building-by-building network concentrated in London and a limited number of other major UK cities, and installation requires landlord permission in a rented property, which is not guaranteed and cannot be assumed.',
          'Our take: check Hyperoptic first if living in an apartment block within one of its covered cities, particularly London; it is simply not a relevant option for the large majority of UK addresses outside that footprint.',
        ],
      },
    ],
    faqItems: [
      {
        question: 'Is Hyperoptic broadband any good?',
        answer: 'Hyperoptic holds one of the strongest Trustpilot scores of any UK ISP, around 4.5 out of 5 from over 52,000 reviews, and offers genuinely symmetrical full-fibre speeds above its entry tier. Its main limitation is coverage, concentrated in London and a limited number of other major UK cities, with installation requiring landlord permission in rented properties.',
      },
      {
        question: 'Does Hyperoptic require landlord permission to install?',
        answer: 'Usually, yes. A standard installation involves drilling a small hole and running visible cable, which normally requires a wayleave agreement from the landlord or freeholder in a rented or leasehold property. There is no statutory UK tenant right to full fibre as of 2026, so this permission should be sought directly rather than assumed, and checking whether the building already has an existing wayleave can speed up the process considerably.',
      },
      {
        question: 'Does Hyperoptic offer a social tariff?',
        answer: 'Yes. Hyperoptic offers Essential 50 at £15 a month and Essential 150 at £20 a month for households on qualifying means-tested benefits, both with no fixed contract, a genuine offer rather than a marketing-only mention.',
      },
      {
        question: 'Is Hyperoptic broadband symmetrical?',
        answer: 'Every tier from 150 Mbps upward is fully symmetrical, meaning upload matches download exactly. Only the cheapest 50 Mbps entry tier is an exception, with a considerably lower 5 Mbps upload speed than the rest of the range.',
      },
    ],
    reviewedDate: '2026-08-23',
    pricingVerifiedDate: '2026-08-23',
    reviewSources: [
      {
        label: 'Hyperoptic broadband packages and pricing',
        href: 'https://www.hyperoptic.com/',
        note: 'Used for current package lineup, social tariff pricing and terms, checked 2026-08-23.',
      },
      {
        label: 'Hyperoptic: existing buildings and installation',
        href: 'https://www.hyperoptic.com/broadband/property/existing-buildings/',
        note: 'Used for installation process details, including drilling, cabling and wayleave requirements.',
      },
      {
        label: 'BroadbandSwitch: tenant rights and landlord permission for full fibre',
        href: 'https://broadbandswitch.uk/moving-renting/tenant-rights-full-fibre-landlord-permission.html',
        note: 'Independent corroboration for the lack of a statutory UK tenant right to full fibre as of 2026.',
      },
      {
        label: 'Ofcom: ban on mid-contract price rises linked to inflation',
        href: 'https://www.ofcom.org.uk/phones-and-broadband/bills-and-charges/ofcom-bans-mid-contract-price-rises-linked-to-inflation',
        note: 'Primary regulatory source for the January 2025 ban on inflation-linked price rise terms.',
      },
      {
        label: 'Hyperoptic public Trustpilot profile',
        href: 'https://uk.trustpilot.com/review/hyperoptic.com',
        note: 'Customer-sentiment reference showing approximately 52,000 reviews and a rating around 4.5 out of 5 in August 2026; not treated as a controlled reliability survey.',
      },
      {
        label: 'Awin Hyperoptic advertiser programme',
        href: 'https://ui.awin.com/merchant-profile-terms/5737?setLocale=en_US',
        note: 'BroadbandPicker\'s Awin application for this programme (Hyperoptic B2C, advertiser 5737) was declined. The affiliate link above is Hyperoptic\'s own site, verified 2026-08-23.',
      },
      {
        label: 'BroadbandPicker review methodology',
        href: '/how-we-review-broadband',
        note: 'Explains how price, speed, coverage, customer experience and use-case fit are weighed.',
      },
    ],
    awinProgramId: '5737',
  },
  {
    slug: 'community-fibre',
    name: 'Community Fibre',
    logo: '/logos/community-fibre.svg',
    affiliateUrl: 'https://www.communityfibre.co.uk/',
    speeds: [
      { download: 150, upload: 150, type: 'FTTP' },
      { download: 500, upload: 500, type: 'FTTP' },
      { download: 1000, upload: 1000, type: 'FTTP' },
      { download: 3000, upload: 3000, type: 'FTTP' },
    ],
    monthlyPriceFrom: 12.50,
    contractLengths: [12, 24],
    setupFee: 0,
    trustpilotScore: 4.7,
    coveragePercent: 6,
    highlights: [
      'One of the highest Trustpilot scores of any UK ISP, around 4.7 out of 5 from roughly 91,000 reviews',
      'A fixed £2 a month annual price rise cap, disclosed in pounds and pence rather than tied to inflation',
      'Coverage has expanded from London-only into parts of Surrey and Sussex',
    ],
    pros: [
      'Consistently among the best-reviewed ISPs in the UK on both Trustpilot and Ofcom satisfaction data',
      'Symmetrical full-fibre speeds at every tier, from 150 Mbps up to 3,000 Mbps',
      'A £2 a month annual rise, lower than the £3 to £4 most national providers now charge',
      'No setup fee across the range',
    ],
    cons: [
      'Coverage remains concentrated in London, despite recent expansion into Surrey and Sussex',
      'The cheapest 12-month Essential tier is exempt from the price cap policy, so its terms need checking separately',
      'Router range can struggle in larger flats or houses, per recurring review feedback',
    ],
    excerpt:
      'Community Fibre is a London-based full-fibre altnet with one of the strongest customer-satisfaction records of any UK broadband provider: around 4.7 out of 5 on Trustpilot from roughly 91,000 reviews, and 92% customer satisfaction in Ofcom\'s 2025 data, 8 points above the industry average. Symmetrical plans range from 150 Mbps to 3,000 Mbps, from £12.50 a month, with a capped £2 a month annual price rise rather than an open-ended increase. Coverage remains London-focused, with recent expansion into parts of Surrey and Sussex.',
    contentSections: [
      {
        heading: 'Community Fibre Broadband Deals in August 2026',
        paragraphs: [
          'Community Fibre\'s range runs from Essential 35, a 12-month, 35 Mbps symmetrical plan from around £12.50 a month, up to a Hyperfast 3 Gig tier at roughly £55 a month. Mid-range options include a 150 Mbps plan around £20 and a 500 Mbps plan around £25, both on 24-month contracts. Exact current prices vary by promotion and postcode, so treat these as a guide and confirm the live figure at checkout for your address.',
          'The 24-month tiers carry a fixed £2 a month price rise each April, disclosed as a cash amount rather than tied to inflation, which independent trackers describe as the lowest scheduled rise of any major UK provider. The Essential 35 tier is reported as exempt from this rise entirely, so check which policy applies to the specific plan being compared.',
          'Out-of-contract pricing is also capped, at up to £4 above the introductory rate rather than the much larger jumps, sometimes £15 or more, seen once a promotional period ends with some rivals. Anyone on a means-tested social tariff is reported to be exempt from both the annual rise and the out-of-contract increase.',
        ],
      },
      {
        heading: 'Community Fibre Coverage: London and Beyond',
        paragraphs: [
          'Community Fibre built its full-fibre network in London first, and the capital remains the core of its coverage today. More recently, the network has expanded into parts of Surrey and Sussex, moving the brand beyond a purely London-only proposition, though coverage in these newer areas is still far from complete.',
          'Because Community Fibre operates its own network rather than reselling Openreach, availability is genuinely street-by-street. A postcode inside Greater London does not guarantee a specific building is connected, particularly in larger blocks where wiring the whole building is a bigger undertaking than a single house.',
          'Anyone outside London, Surrey or Sussex should not expect Community Fibre to be available at all; this is a regional, not national, network, and its own postcode checker is the only reliable way to confirm a specific address.',
        ],
      },
      {
        heading: 'Community Fibre Speeds and Symmetrical Full Fibre',
        paragraphs: [
          'Every Community Fibre tier is symmetrical, meaning upload matches download, from 150 Mbps up to 3,000 Mbps. That is a genuine advantage for anyone who regularly uploads large files, video calls for work, or backs up photos and video to the cloud, where a typical part-fibre connection would only offer a fraction of the download speed on the upload side.',
          'The entry-level 150 Mbps tier already comfortably covers a household streaming, browsing and video-calling on several devices at once. The top 3,000 Mbps tier is a specialist choice; very few home setups can actually use speeds above roughly 1,000 Mbps on a single device, so it mainly suits a household running several demanding activities simultaneously or a small business.',
          'As with any fibre line, the quoted speed is what reaches the router. Community Fibre supplies a free Linksys router on 100 Mbps and above tiers, with WiFi 5 hardware on the entry Essential tier, so a larger property may still need a mesh add-on to get full speed to every room.',
        ],
      },
      {
        heading: 'Price Rises and Contract Terms',
        paragraphs: [
          'Community Fibre\'s headline differentiator is its price rise policy: a fixed £2 a month increase each April on 24-month contracts, disclosed upfront in pounds and pence. Since Ofcom banned inflation-linked, percentage-based price rise terms in all new broadband contracts from 17 January 2025, every provider now has to disclose a cash-figure rise like this one rather than a vaguer CPI-plus-percentage formula; the real difference between providers today is how large that flat figure is.',
          'Most national providers, including BT, EE, Vodafone, Plusnet and TalkTalk, have settled on a rise of around £3 to £4 a month under the new rules. Community Fibre\'s £2 is smaller than that, which is a genuine, if modest, saving over a 24-month contract rather than a difference in the mechanism itself.',
          'The 12-month Essential 35 tier is reported to be exempt from the scheduled rise entirely, and social tariff customers are reported to be exempt from both the annual rise and the capped out-of-contract increase. Confirm the exact terms for the specific plan and tariff being ordered, since policies can differ by tier.',
        ],
      },
      {
        heading: 'Installation and Switching to Community Fibre',
        paragraphs: [
          'Community Fibre installs its own full-fibre connection rather than reselling Openreach, and reviews consistently highlight fast installation as one of its strongest points, frequently citing same-week or next-available-slot appointments in already-wired buildings.',
          'Because it runs its own network, a switch to Community Fibre from an Openreach-based provider such as BT, Sky or TalkTalk will not use Ofcom\'s One Touch Switch process. Keep the existing connection active until the new Community Fibre line is confirmed working, rather than cancelling in advance.',
          'Renters and leaseholders in blocks not already wired should check with the building\'s management company early, since installing a new full-fibre connection into a shared building can require freeholder or managing-agent permission before an engineer visit can be booked.',
        ],
      },
      {
        heading: 'Router, Speed in Larger Homes and Add-ons',
        paragraphs: [
          'The standard router is free on every 100 Mbps-and-above tier, upgraded from the WiFi 5 hardware on the entry Essential tier. For a typical flat, this is sufficient for full-speed coverage throughout; the most consistent criticism in reviews is router range in larger flats or houses, where the signal from a single router in one room does not reliably reach every corner.',
          'Anyone in a larger property should factor a mesh WiFi add-on into the real cost from the outset if router placement is likely to be a compromise, rather than treating it as an unexpected extra once service has started.',
          'Community Fibre does not currently publish a bundled TV package in the way some national providers do, so anyone comparing on a like-for-like total-package basis, including TV, should check that separately rather than assuming an equivalent bundle exists.',
        ],
      },
      {
        heading: 'Community Fibre Customer Service and Reviews',
        paragraphs: [
          'Community Fibre\'s Trustpilot profile showed roughly 4.7 out of 5 from around 91,000 reviews at the point of this check, one of the strongest scores of any UK broadband provider; for comparison, BT sits around 4.0, and Sky and Virgin Media both sit below 2 out of 5 on the same platform.',
          'Ofcom\'s own 2025 customer satisfaction data corroborates the pattern independently of Trustpilot: Community Fibre recorded 92% overall satisfaction, 8 percentage points above the industry average of 84%, placing it among the top-performing providers Ofcom tracks rather than relying on a single self-selected review platform.',
          'Recurring themes in reviews are fast installation, responsive chat support and clear billing, with router range in larger properties the most consistent point of criticism. That is a narrow, specific complaint pattern rather than a broad service-quality concern, which is itself a useful signal when reading reviews for any provider.',
        ],
      },
      {
        heading: 'Is Community Fibre Any Good?',
        paragraphs: [
          'Where it is available, Community Fibre is one of the strongest options on the market: symmetrical full-fibre speeds, a genuinely capped and disclosed price rise policy, and customer satisfaction evidence from two independent sources, Trustpilot and Ofcom, that both point the same way.',
          'The catch is availability. This is a London-centred network with only recent, partial expansion into Surrey and Sussex, so most UK addresses simply cannot order it, whatever the reviews say. Coverage, not price or service quality, is the real gating factor for most people considering it.',
          'Anyone who can get it and lives in a larger flat or house should budget for a mesh WiFi add-on from the start rather than treating router range as a minor detail; everyone else gets a genuinely well-evidenced, well-priced full-fibre option.',
        ],
      },
    ],
    faqItems: [
      {
        question: 'Is Community Fibre any good?',
        answer: 'Community Fibre is one of the best-reviewed UK broadband providers, with around 4.7 out of 5 on Trustpilot from roughly 91,000 reviews and 92% customer satisfaction in Ofcom\'s 2025 data, 8 points above the industry average. Its main limitation is coverage: the network is concentrated in London, with recent expansion into parts of Surrey and Sussex.',
      },
      {
        question: 'Where is Community Fibre available?',
        answer: 'Community Fibre\'s full-fibre network was built in London first and remains concentrated there, with recent expansion into parts of Surrey and Sussex. It is a regional, not national, network, so checking the exact address on Community Fibre\'s own postcode checker is the only reliable way to confirm availability.',
      },
      {
        question: 'Does Community Fibre increase its prices?',
        answer: 'Community Fibre\'s 24-month contracts carry a fixed £2 a month price rise each April, disclosed as a cash amount rather than linked to inflation, described by independent trackers as the lowest scheduled rise of any major UK provider. Its 12-month Essential tier is reported to be exempt from this rise.',
      },
      {
        question: 'What speed do I need from Community Fibre?',
        answer: 'The entry-level 150 Mbps symmetrical tier comfortably covers a household streaming, browsing and video-calling on several devices. Households that regularly upload large files or run several demanding activities at once benefit more from the 500 Mbps or 1,000 Mbps tiers, while the top 3,000 Mbps plan mainly suits specialist or small-business use.',
      },
    ],
    reviewedDate: '2026-08-23',
    pricingVerifiedDate: '2026-08-23',
    reviewSources: [
      {
        label: 'Community Fibre pricing and package details',
        href: 'https://broadbandswitch.uk/community-fibre-broadband-deals.html',
        note: 'A direct fetch of communityfibre.co.uk returned a 403; pricing and the price-rise cap policy were corroborated via this independent tracker, checked 2026-08-23.',
      },
      {
        label: 'thinkbroadband: Community Fibre price rise reporting',
        href: 'https://www.thinkbroadband.com/news/community-fibre-25-off-promotion-for-may-2026-but-2027-increase-up-from-2-to-3-month',
        note: 'Independent corroboration for the scheduled April price rise structure and its exemptions.',
      },
      {
        label: 'Community Fibre public Trustpilot profile',
        href: 'https://uk.trustpilot.com/review/communityfibre.co.uk',
        note: 'Customer-sentiment reference showing approximately 91,000 reviews and a rating around 4.7 out of 5 in August 2026; not treated as a controlled reliability survey.',
      },
      {
        label: 'Awin Community Fibre advertiser programme',
        href: 'https://ui.awin.com/merchant-profile-terms/19595?setLocale=en_US',
        note: 'BroadbandPicker\'s Awin application for this programme is pending, not yet approved. A valid publisher-specific tracking link is not generated until approval, so the affiliate link above is the provider\'s own site, verified 2026-08-23.',
      },
      {
        label: 'BroadbandPicker review methodology',
        href: '/how-we-review-broadband',
        note: 'Explains how price, speed, coverage, customer experience and use-case fit are weighed.',
      },
    ],
    awinProgramId: '19595',
  },
  {
    slug: 'zen-internet',
    name: 'Zen Internet',
    logo: '/logos/zen-internet.svg',
    affiliateUrl: 'https://www.zen.co.uk/broadband',
    speeds: [
      { download: 100, upload: 18, type: 'FTTP' },
      { download: 500, upload: 75, type: 'FTTP' },
      { download: 900, upload: 115, type: 'FTTP' },
      { download: 2300, upload: 220, type: 'FTTP' },
    ],
    monthlyPriceFrom: 30.00,
    contractLengths: [12, 24],
    setupFee: 0,
    trustpilotScore: 4.4,
    coveragePercent: 75,
    highlights: [
      'A free static IP address included on every plan, usually a paid extra elsewhere',
      'A Contract Price Promise: no mid-contract price rise for the length of the term',
      'Which? Recommended Provider, with an 84% customer score, and B Corp certified',
    ],
    pros: [
      'No mid-contract price rise, disclosed upfront rather than added later',
      'Static IP included as standard, useful for remote access and some business setups',
      'A 30-day speed guarantee with a penalty-free exit if it is not met',
      'Which? Recommended Provider status backed by an independently measured customer score',
    ],
    cons: [
      'More expensive than most budget and mid-market rivals at every tier',
      'Coverage depends on a mix of Openreach and CityFibre, so availability and setup cost both vary by address',
      'Setup is free on CityFibre-served addresses but around £15 on Openreach-served ones',
    ],
    excerpt:
      'Zen Internet is a premium UK broadband provider built around service quality rather than the lowest price: a free static IP on every plan, a Contract Price Promise against mid-contract rises, and Which? Recommended Provider status with an 84% customer score. Full Fibre plans run from around £30 to £65 a month across four speed tiers on a mix of Openreach and CityFibre networks. It costs more than most rivals; the case for paying it rests on the guarantees and support behind the price.',
    contentSections: [
      {
        heading: 'Zen Internet Broadband Deals in August 2026',
        paragraphs: [
          'Zen\'s Full Fibre range runs from Full Fibre 100 at roughly £30 to £35 a month, up through Full Fibre 500 at around £36 to £42 and Full Fibre 900 at around £42 to £50, to Full Fibre Max, running between 1,600 and 2,300 Mbps, at roughly £56 to £65. Exact pricing depends on the network used at a specific address and any current promotion, so treat these as a guide and confirm the live figure at checkout.',
          'Every plan includes a free static IP address, a feature most rivals only offer as a paid add-on or restrict to business customers. This matters for anyone running a home server, certain VPN or remote-access setups, or specific security camera systems that need a fixed public address rather than one that changes each time the router restarts.',
          'Setup cost depends on which network serves the address: free on CityFibre-served addresses, around £15 where the connection runs over Openreach. This is a smaller distinction than the headline price, but worth checking before comparing Zen\'s total first-year cost against a rival that advertises free setup everywhere.',
        ],
      },
      {
        heading: 'The Contract Price Promise: No Mid-Contract Rise',
        paragraphs: [
          'Zen\'s Contract Price Promise means the price agreed at sign-up is the price paid for the entire contract term, with no scheduled increase partway through, the same structure Zzoomm and Community Fibre use, and a genuine point of difference from providers such as TalkTalk and Highland Broadband, which build one or more scheduled rises into their contracts.',
          'On a 24-month term, this can be worth more than it first appears. Most national providers now apply a flat annual rise of around £3 to £4 a month under Ofcom\'s rules on disclosed pounds-and-pence increases; a £40 plan facing a £4 rise in year two is a real, predictable extra cost. Zen\'s flat price for the whole term removes that step entirely, which matters most to anyone on a fixed budget who wants to know the exact cost of the next two years upfront.',
          'The trade-off is that Zen rarely has the lowest headline price in a same-speed comparison. The fair comparison is the full contract-term cost against a cheaper rival\'s price including its own scheduled rise, not the first month\'s bill against Zen\'s flat rate.',
        ],
      },
      {
        heading: 'Zen Internet Speeds and Network Coverage',
        paragraphs: [
          'Zen delivers Full Fibre over a mix of the Openreach and CityFibre wholesale networks, which between them reach a large share of UK addresses, though availability, speed tier and setup cost can all vary depending on which network actually serves a specific property. Zen\'s own checker will confirm which network applies at a given address.',
          'The entry Full Fibre 100 tier comfortably covers everyday browsing, streaming and video calls for a small household. Full Fibre 500 and 900 add meaningful upload headroom, useful for cloud backups, large file transfers and video calls where several people in the household are on camera at once. Full Fibre Max, at up to 2,300 Mbps, is a specialist tier that few single devices can fully use, aimed at heavy multi-user households or small businesses.',
          'Zen backs its speed claims with a 30-day guarantee: if the actual speed delivered falls below a stated minimum threshold and Zen cannot fix it within 30 days, the customer can exit the contract without penalty. Keep a dated record of any speed complaint if this becomes relevant.',
        ],
      },
      {
        heading: 'Router, Static IP and Mesh WiFi',
        paragraphs: [
          'A router is included as standard, and Zen\'s EveryRoom mesh WiFi system is available for larger properties where a single router does not reach every room reliably. As with any mesh add-on, it is worth confirming there is a genuine coverage problem before adding it automatically to the order.',
          'The included static IP address is Zen\'s clearest differentiator from most consumer ISPs, which either charge separately for one or do not offer one to residential customers at all. Most households will never need it, but for the specific use cases that do, remote access to a home network, certain business VPN configurations, self-hosted services, it removes a cost and a support conversation that would otherwise be needed elsewhere.',
          'Anyone who does not know whether they need a static IP almost certainly does not; it is a feature for people who already know they need one, not a reason on its own to choose Zen over a cheaper rival.',
        ],
      },
      {
        heading: 'Is Zen Internet Good Value?',
        paragraphs: [
          'Zen is not competing on price. At every published speed tier, it costs more than budget-focused rivals such as TalkTalk or Plusnet, and more than several full-fibre altnets. The value case rests entirely on what comes with the higher price: a flat rate for the whole contract, a free static IP, a real speed guarantee with an exit right, and an independently measured customer satisfaction score.',
          'Which? named Zen a Recommended Provider on the strength of an 84% customer score, a genuinely independent, survey-based measure rather than a self-selected review platform, and Zen also holds B Corp certification, a third-party standard covering environmental and social practices as well as customer treatment.',
          'The households most likely to find Zen worth the premium are those who value certainty and support over the lowest possible price: people who have been burned by a mid-contract rise before, anyone who specifically needs a static IP, or a household prepared to pay more for a provider with better-than-average independent satisfaction evidence.',
        ],
      },
      {
        heading: 'Installation and Switching to Zen Internet',
        paragraphs: [
          'Installation timing and process depend on which network serves the address. A CityFibre-served property typically has a more straightforward, often faster installation; an Openreach-served property follows the standard Openreach engineer visit process used by most national providers.',
          'Where the previous provider also uses Openreach, such as BT, Sky, TalkTalk or Plusnet, a switch to Zen on Openreach may qualify for Ofcom\'s One Touch Switch process, giving a same-day handover with no need to contact the outgoing provider. A switch to or from a CityFibre-based service, or from a provider on its own separate network such as Virgin Media, will not use One Touch Switch, so keep the existing connection running until the new one is confirmed working.',
          'Confirm the applicable minimum term and any early-exit charge before switching. Zen\'s contract lengths and terms can differ between its Openreach and CityFibre products, so check the specific summary for the address being ordered rather than assuming identical terms across networks.',
        ],
      },
      {
        heading: 'Zen Internet Customer Service and Reviews',
        paragraphs: [
          'Zen\'s Trustpilot profile showed a rating of approximately 4.4 out of 5 from around 16,700 reviews at the point of this check, rated "Excellent" on the platform\'s own banding. That sits well above most large national providers and is broadly in line with the stronger full-fibre altnets covered elsewhere on this site.',
          'Which?\'s independently surveyed 84% customer score corroborates the Trustpilot pattern using a different, non-self-selected methodology, which is a stronger combined signal than either source alone; a high score on a review platform people opt into, backed by a high score on a broad customer survey, is more convincing than either in isolation.',
          'Zen positions itself explicitly around service quality rather than price, and the review and survey evidence here is consistent with that positioning holding up, rather than being marketing language unsupported by independent data.',
        ],
      },
    ],
    faqItems: [
      {
        question: 'Is Zen Internet worth the extra cost?',
        answer: 'Zen costs more than most budget and mid-market rivals at every speed tier, but includes a free static IP, a Contract Price Promise against mid-contract rises, and a 30-day speed guarantee with a penalty-free exit. It also holds Which? Recommended Provider status with an 84% independently surveyed customer score. It suits households who value certainty and support over the lowest headline price.',
      },
      {
        question: 'Does Zen Internet raise its prices during the contract?',
        answer: 'No. Zen\'s Contract Price Promise fixes the price for the full length of the contract term, with no scheduled mid-contract increase, a genuine point of difference from providers such as TalkTalk and Highland Broadband, which build one or more scheduled rises into their contracts.',
      },
      {
        question: 'Does Zen Internet include a static IP address?',
        answer: 'Yes, a static IP address is included as standard on every Zen Internet plan, a feature most residential providers either charge extra for or do not offer at all. It mainly benefits specific use cases such as remote access, some VPN configurations and self-hosted services; most households do not need one.',
      },
      {
        question: 'Which network does Zen Internet use?',
        answer: 'Zen delivers Full Fibre over a mix of the Openreach and CityFibre wholesale networks, depending on the address. Setup is typically free on CityFibre and around £15 on Openreach. Zen\'s own address checker confirms which network, speed tiers and price apply at a specific property.',
      },
    ],
    reviewedDate: '2026-08-23',
    pricingVerifiedDate: '2026-08-23',
    reviewSources: [
      {
        label: 'Zen Internet full fibre broadband',
        href: 'https://www.zen.co.uk/broadband/full-fibre',
        note: 'Used for the Contract Price Promise, speed guarantee, static IP inclusion and network mix, checked 2026-08-23. Exact live pricing is postcode-gated on Zen\'s own site.',
      },
      {
        label: 'Independent Zen Internet pricing summary',
        href: 'https://findcheapbroadband.com/compare-broadband/zen-internet-prices/',
        note: 'Used to corroborate the current Full Fibre 100/500/900/Max price ranges and setup fee difference between CityFibre and Openreach, checked 2026-08-23. The Full Fibre Max upload figure is a conservative estimate based on comparable XGS-PON tiers from other providers, not independently confirmed, and should be checked at the point of order.',
      },
      {
        label: 'Which? Zen Internet broadband review',
        href: 'https://www.which.co.uk/reviews/broadband/article/broadband-provider-reviews/zen-internet-broadband-review-apA7g4y5zrgE',
        note: 'Primary source for the Which? Recommended Provider status and the 84% independently surveyed customer score.',
      },
      {
        label: 'Zen Internet public Trustpilot profile',
        href: 'https://uk.trustpilot.com/review/zen.co.uk',
        note: 'Customer-sentiment reference showing approximately 16,700 reviews and a rating around 4.4 out of 5 in August 2026; not treated as a controlled reliability survey.',
      },
      {
        label: 'Awin Zen Internet advertiser programme',
        href: 'https://ui.awin.com/merchant-profile-terms/119927?setLocale=en_US',
        note: 'BroadbandPicker\'s Awin application for this programme is pending, not yet approved. A valid publisher-specific tracking link is not generated until approval, so the affiliate link above is the provider\'s own site, verified 2026-08-23.',
      },
      {
        label: 'BroadbandPicker review methodology',
        href: '/how-we-review-broadband',
        note: 'Explains how price, speed, coverage, customer experience and use-case fit are weighed.',
      },
    ],
    awinProgramId: '119927',
  },
  {
    slug: 'national-broadband',
    name: 'National Broadband',
    logo: '/logos/national-broadband.svg',
    affiliateUrl: 'https://www.national-broadband.co.uk/',
    speeds: [
      { download: 60, upload: 15, type: '5G' },
    ],
    monthlyPriceFrom: 34.99,
    contractLengths: [12, 18, 24],
    setupFee: 49,
    trustpilotScore: 4.7,
    coveragePercent: 80,
    highlights: [
      'A 5G fixed-wireless alternative for addresses fibre has not reached, no engineer visit or landline required',
      'Works across all four UK mobile networks, picking whichever gives the strongest signal at the address',
      'Unlimited data as standard, with a plug-in router rather than a fixed-line installation',
    ],
    pros: [
      'Can be live within days, no waiting for a fibre or copper engineer appointment',
      'A genuine option for rural or hard-to-reach addresses that fixed-line providers have not built to',
      'Multi-network approach improves the odds of a usable signal versus a single-network 5G router',
      'Strong customer-review pattern, particularly from people switching from poor rural broadband',
    ],
    cons: [
      'Speed depends entirely on local mobile signal strength, not a guaranteed fixed-line figure',
      'Considerably slower than full fibre where full fibre is actually available',
      'A one-off router cost applies, plus a more expensive professional external-antenna installation for weaker signal areas',
      'Performance can vary at peak local mobile network usage times in a way a dedicated fibre line does not',
    ],
    excerpt:
      'National Broadband sells 4G and 5G fixed-wireless broadband as an alternative for UK addresses that fibre and cable have not reached, working across all four mobile networks to find the strongest local signal. Typical 5G speeds run 40 to 80 Mbps, from £34.99 a month with unlimited data, needing only a plug-in router rather than an engineer-installed line. It is a genuine option for rural coverage gaps, not a substitute for full fibre where full fibre is actually available.',
    contentSections: [
      {
        heading: 'National Broadband Deals in August 2026',
        paragraphs: [
          'National Broadband\'s core products are 4G and 5G home broadband, both delivered over the mobile network rather than a fixed fibre or copper line. The 4G Internet plan starts from £29.99 a month with unlimited data, typically delivering 30 to 80 Mbps depending on local signal. The 5G plan starts from around £34.99 to £39.99 a month, typically delivering 40 to 80 Mbps, also with unlimited data.',
          'Setup cost depends on the equipment needed: a basic plug-and-play router costs around £49 to £99 upfront, while a full professional installation with an external antenna, aimed at addresses with weaker signal, costs around £399. Which option is needed depends entirely on the mobile signal strength already reaching the property, so it is worth confirming before ordering rather than assuming the cheapest router option will always work.',
          'Contracts run 12, 18 or 24 months. Unlike most fixed-line providers on this site, National Broadband states that prices do not rise mid-contract, so the monthly figure agreed at sign-up should hold for the length of the term.',
        ],
      },
      {
        heading: 'Who National Broadband Actually Suits',
        paragraphs: [
          'This is not a like-for-like alternative to a fibre provider; it is a specific answer to a specific problem: an address that cannot get a usable fixed-line broadband speed and is not likely to for some time. National Broadband has specialised in rural and hard-to-reach UK connectivity for two decades, which is a genuinely different customer base from the fibre altnets covered elsewhere on this site.',
          'Reviews consistently describe a similar starting point: a household with a poor or unreliable existing connection, often in a rural area still on ADSL or a weak part-fibre signal, switching to National Broadband and getting a meaningful, sometimes dramatic, speed and stability improvement. That is a different comparison to make than "is this faster than full fibre," which it usually is not.',
          'Anyone who can already get a genuine full-fibre connection at a reasonable price will typically be better served by it than by a 5G alternative; National Broadband\'s real value is for addresses where that comparison is not available at all.',
        ],
      },
      {
        heading: 'How the 4G and 5G Speeds Actually Work',
        paragraphs: [
          'Speed on a fixed-wireless service is a function of local mobile signal strength, not a guaranteed line rate set by the provider, which is the single most important difference to understand versus a fibre or cable connection. National Broadband\'s stated 40 to 80 Mbps range for 5G, and 30 to 80 Mbps for 4G, describes what is typically achievable, not a fixed promise for every property.',
          'The multi-network approach is the practical reason National Broadband can offer this at all in some areas: rather than being tied to one mobile operator\'s coverage map, National Broadband selects whichever of the four UK mobile networks gives the best signal at a specific address, which meaningfully improves the odds of a workable connection versus buying a single-network 5G router directly from a mobile operator.',
          'Upload speed on mobile-based broadband is typically much lower than download, and is not usually headlined by any provider in this category; treat it as adequate for calls and light uploads rather than comparable to a full-fibre symmetrical connection.',
        ],
      },
      {
        heading: 'Equipment and Installation',
        paragraphs: [
          'Most customers start with a plug-and-play router, which needs no engineer visit and can typically be set up by the customer within minutes of delivery, a genuinely different experience from waiting for a fixed-line installation appointment.',
          'Addresses with weaker mobile signal may need a professional installation with an external antenna, at a considerably higher one-off cost of around £399, to pull in a usable signal from further away or through thicker walls. National Broadband should be able to advise which option a specific address needs before committing to an order.',
          'Because performance depends on the equipment matching the local signal conditions, it is worth being honest about the property\'s existing mobile signal quality when discussing options, rather than defaulting to the cheapest router and hoping for the best.',
        ],
      },
      {
        heading: 'Contract Terms and No Mid-Contract Price Rise',
        paragraphs: [
          'National Broadband offers a choice of 12, 18 or 24-month contracts, more flexibility on term length than most fixed-line altnets covered elsewhere on this site, which typically offer only a single 24-month option.',
          'The company states that prices do not increase during the contract, a straightforward flat-rate structure similar to Zzoomm\'s, Community Fibre\'s and Zen Internet\'s no-rise policies, rather than the scheduled annual increases used by several national fixed-line providers.',
          'A shorter 12-month term suits anyone treating this as a genuine stopgap while waiting for a fibre rollout to reach their address, without being locked into two years on a service that will likely be worth switching away from once full fibre actually arrives.',
        ],
      },
      {
        heading: 'National Broadband Customer Service and Reviews',
        paragraphs: [
          'National Broadband\'s Trustpilot profile showed a rating in the region of 4.7 out of 5 from around 817 reviews at the point of this check, with feedback overwhelmingly positive. Reviewers consistently cite fast, friendly support by phone and email, and a straightforward, self-managed setup process as the strongest points.',
          'The recurring theme in reviews is a dramatic improvement over a previous poor rural connection, rather than a comparison against full fibre, which is a useful signal: the customers leaving these reviews are largely people this service was actually designed for, not people comparing it unfavourably against a fibre option they could have chosen instead.',
          'As with any review platform, this is customer sentiment, not an independently measured reliability figure, and coverage-dependent performance means one household\'s experience will not automatically match another\'s at a different address.',
        ],
      },
      {
        heading: 'Is National Broadband Worth It?',
        paragraphs: [
          'For the right address, an unreliable rural connection with no realistic full-fibre option in sight, National Broadband is a genuinely useful service: no engineer wait, a flat price for the contract term, unlimited data and a multi-network approach that improves the odds of a workable signal.',
          'It is the wrong choice for anyone who already has, or could reasonably get, a full-fibre connection; fibre will almost always outperform a mobile-based service on both speed and consistency where it is genuinely available.',
          'Our take: worth strong consideration specifically as a rural or hard-to-reach fallback, and worth checking the specific installation option, plug-and-play versus professional antenna install, against the property\'s actual mobile signal before ordering.',
        ],
      },
    ],
    faqItems: [
      {
        question: 'Is National Broadband any good?',
        answer: 'National Broadband holds a strong Trustpilot rating, around 4.7 out of 5 from roughly 817 reviews, with reviewers consistently describing a significant improvement over a previous poor rural connection. It is a fixed-wireless 4G/5G service, not full fibre, so speed depends on local mobile signal rather than a guaranteed line rate, and full fibre will usually outperform it where full fibre is genuinely available.',
      },
      {
        question: 'Is National Broadband available at my address?',
        answer: 'National Broadband\'s 5G service is stated to be available to over 80% of UK properties, working across all four UK mobile networks to find the strongest local signal, making it more widely available than most fixed-line full-fibre altnets. Actual achievable speed still depends on local signal strength, so check directly with National Broadband before ordering.',
      },
      {
        question: 'How fast is National Broadband?',
        answer: 'Typical speeds are 30 to 80 Mbps on the 4G plan and 40 to 80 Mbps on the 5G plan, depending on local mobile signal strength rather than a fixed guaranteed rate. This is comfortably enough for everyday streaming, browsing and video calls, but is not comparable to a full-fibre connection\'s consistency or upload speed.',
      },
      {
        question: 'Does National Broadband need an engineer visit?',
        answer: 'Most customers only need a plug-and-play router, which needs no engineer visit and can be set up by the customer within minutes. Addresses with weaker mobile signal may need a professional installation with an external antenna, at a higher one-off cost, to achieve a workable connection.',
      },
    ],
    reviewedDate: '2026-08-23',
    pricingVerifiedDate: '2026-08-23',
    reviewSources: [
      {
        label: 'National Broadband 5G broadband information',
        href: 'https://www.national-broadband.co.uk/best-5g-broadband-for-rural-areas',
        note: 'A direct fetch of national-broadband.co.uk returned a 403; package structure, speeds and positioning corroborated via independent reporting, checked 2026-08-23.',
      },
      {
        label: '5G.co.uk: National Broadband 5G WiFi router pricing',
        href: 'https://5g.co.uk/home-broadband/national-broadband/5g-wifi-router/',
        note: 'Used to corroborate 5G plan pricing, router cost, contract length options and the multi-network approach.',
      },
      {
        label: 'Choose.co.uk: 4G Internet review',
        href: 'https://www.choose.co.uk/guide/4g-internet-review/',
        note: 'Used to corroborate 4G plan pricing, typical speeds, setup fee options and the 12-month minimum term.',
      },
      {
        label: 'National Broadband public Trustpilot profile',
        href: 'https://uk.trustpilot.com/review/national-broadband.co.uk',
        note: 'Customer-sentiment reference showing approximately 817 reviews and a rating in the region of 4.7 out of 5 in August 2026; not treated as a controlled reliability survey.',
      },
      {
        label: 'Awin National Broadband advertiser programme',
        href: 'https://ui.awin.com/merchant-profile-terms/20858?setLocale=en_US',
        note: 'BroadbandPicker\'s Awin application for this programme is pending, not yet approved. A valid publisher-specific tracking link is not generated until approval, so the affiliate link above is the provider\'s own site, verified 2026-08-23.',
      },
      {
        label: 'BroadbandPicker review methodology',
        href: '/how-we-review-broadband',
        note: 'Explains how price, speed, coverage, customer experience and use-case fit are weighed.',
      },
    ],
    awinProgramId: '20858',
  },
  {
    slug: 'trooli',
    name: 'Trooli',
    logo: '/logos/trooli.svg',
    affiliateUrl: 'https://www.trooli.com/',
    speeds: [
      { download: 150, upload: 50, type: 'FTTP' },
      { download: 500, upload: 200, type: 'FTTP' },
      { download: 900, upload: 300, type: 'FTTP' },
      { download: 2000, upload: 300, type: 'FTTP' },
    ],
    monthlyPriceFrom: 19.99,
    contractLengths: [24],
    setupFee: 0,
    trustpilotScore: 4.4,
    coveragePercent: 1,
    highlights: [
      'Builds and operates its own full-fibre network across parts of South East England and Scotland',
      'Over 400,000 homes and businesses passed, with an ambition to reach around 500,000',
      'No mid-contract price rise on the current published range',
    ],
    pros: [
      'Genuinely low entry price for a full-fibre connection, from £19.99 a month',
      'No scheduled mid-contract price increase',
      'WiFi 6 router and UK-based customer support included as standard',
      'Strong Trustpilot pattern, with installation quality a recurring positive theme',
    ],
    cons: [
      'Coverage is limited to specific parts of South East England and Scotland, not a national footprint',
      'Upload speeds scale with each tier but are not fully symmetrical, unlike some full-fibre altnet rivals',
      'A newer, smaller network than the largest national altnets, with a shorter track record',
    ],
    excerpt:
      'Trooli is a full-fibre altnet building its own network across parts of South East England and Scotland, passing more than 400,000 homes and businesses. Prices start from £19.99 a month for 150 Mbps, up to 2,000 Mbps on its top tier, with no mid-contract price rise on the current range. Coverage is genuinely postcode-specific and limited to its build areas, so check availability before comparing it against a national provider.',
    contentSections: [
      {
        heading: 'Trooli Broadband Deals in August 2026',
        paragraphs: [
          'Trooli\'s range runs four tiers on a 24-month contract: Essential at 150 Mbps download for £19.99 a month, Extra at 500 Mbps for £24.99, Superior at 900 Mbps for £29.99, and Pro at 2,000 Mbps for £39.99. Every tier includes unlimited data and a WiFi 6 router as standard, with no separate router charge to budget for.',
          'The entry price is genuinely competitive against both national providers and other full-fibre altnets covered on this site; £19.99 for 150 Mbps full fibre undercuts several rivals\' equivalent tiers. Confirm the live price and any current promotion at the specific address before assuming the listed figures apply everywhere in Trooli\'s footprint.',
          'Trooli states its published range carries no mid-contract price rise, meaning the price at sign-up should hold for the full 24-month term, a genuine point of difference from providers that build one or more scheduled increases into the contract.',
        ],
      },
      {
        heading: 'Trooli Coverage: South East England and Scotland',
        paragraphs: [
          'Trooli builds and operates its own fibre network rather than reselling Openreach, with coverage spanning parts of Berkshire, Buckinghamshire, Cambridgeshire, Dorset, East Sussex, Hampshire, Kent, Norfolk, Suffolk, West Sussex and Wiltshire in England, and North and South Lanarkshire and Fife in Scotland. That is an unusually broad geographic spread for an altnet of its size, more a scattered set of regional footholds than one contiguous region.',
          'The network passes more than 400,000 homes and businesses, with a stated ambition to reach around 500,000 in the coming years. That is still a small fraction of the roughly 28 million homes in the UK, so a town appearing in the coverage list is not proof a specific street is ready to order.',
          'Anyone outside these specific counties and Scottish authority areas should not expect Trooli to be available at all. Its own postcode checker is the only reliable way to confirm a specific address, rather than assuming coverage from the county name alone.',
        ],
      },
      {
        heading: 'Trooli Speeds: Not Fully Symmetrical',
        paragraphs: [
          'Trooli\'s upload speeds scale with each download tier, from 50 Mbps on the entry 150 Mbps plan up to 300 Mbps on the top two tiers, but they are not fully symmetrical in the way Zzoomm\'s or Community Fibre\'s ranges are, where upload matches download exactly at every tier. Some independent write-ups describe Trooli as symmetrical; the published package figures themselves show otherwise, so it is worth checking the exact upload number for a specific tier rather than assuming a 1:1 ratio.',
          'Even without full symmetry, Trooli\'s upload speeds are still considerably higher than a typical part-fibre connection at a comparable download speed, which matters for cloud backups, large file transfers and multi-person video calls.',
          'The entry 150 Mbps tier comfortably covers everyday streaming, browsing and video calls for most households. The top 2,000 Mbps tier is a specialist choice, useful mainly for heavy multi-user households or small businesses rather than typical single-household use.',
        ],
      },
      {
        heading: 'Router, Support and Installation',
        paragraphs: [
          'A WiFi 6 router is included as standard across the range, with no separate hardware charge. Trooli also promotes UK-based customer support, which recurs as a specific positive theme in independent reviews rather than a generic marketing claim.',
          'Because Trooli operates its own network, installation involves connecting the property to Trooli\'s own fibre rather than activating an existing line, which can mean a scheduled engineer visit rather than a same-day switch, particularly in newer parts of the build.',
          'Reviews consistently single out installation quality and engineer professionalism as a strength, which is a reasonable proxy for service quality this early in the company\'s growth, though it says less about long-term fault handling or renewal pricing than a longer track record would.',
        ],
      },
      {
        heading: 'Contract Terms and the No-Price-Rise Policy',
        paragraphs: [
          'Every Trooli plan runs on a 24-month contract; there is no shorter, rolling or 12-month option published. That suits a household settled at the address but rules Trooli out for a short-term tenancy or anyone wanting the flexibility to leave without an early-termination charge.',
          'The no-mid-contract-rise policy is disclosed upfront rather than buried in the terms, and is a genuine point of comparison against providers such as TalkTalk or Highland Broadband, which build one or more scheduled increases into every contract. Over 24 months, that difference can be worth more than a slightly lower headline price elsewhere.',
          'As with any fixed-term contract, confirm the early-termination charge and what happens if moving house partway through the term, since Trooli\'s coverage footprint means a house move could easily land somewhere outside its network.',
        ],
      },
      {
        heading: 'Trooli Customer Service and Reviews',
        paragraphs: [
          'Trooli\'s Trustpilot profile showed a rating in the region of 4.4 out of 5 from around 6,800 reviews at the point of this check, rated "Excellent" on the platform\'s banding, with some variation between roughly 4.0 and 4.5 across different tracking snapshots, which is normal for a fast-growing review count rather than a sign of inconsistent service.',
          'Recurring positive themes are easy installation, skilled engineers and a responsive, UK-based support team, consistent across multiple independent review summaries rather than a single source.',
          'As with any newer altnet, the volume of long-term evidence, how the company handles faults or contract renewals after the first year or two, is still building. Today\'s reviews are a genuinely positive early signal, not yet a multi-year track record.',
        ],
      },
      {
        heading: 'Is Trooli Broadband Any Good?',
        paragraphs: [
          'Where it is available, Trooli is a strong option: a genuinely low entry price for full fibre, no scheduled price rise, a WiFi 6 router included, and consistently positive reviews focused on installation and support quality.',
          'It is not available to most UK addresses, and its footprint, scattered across parts of South East England and separate parts of Scotland, means checking availability matters more than usual before treating it as a serious option.',
          'Our starting recommendation for anyone in Trooli\'s coverage area is the Essential or Extra tier for most households, given how comfortably either covers typical use, with the higher tiers reserved for larger, heavier-use households or those who specifically value the extra upload headroom.',
        ],
      },
    ],
    faqItems: [
      {
        question: 'Is Trooli broadband any good?',
        answer: 'Trooli holds a strong Trustpilot rating, in the region of 4.4 out of 5 from around 6,800 reviews, with installation quality and UK-based support as recurring positive themes. It offers full fibre from £19.99 a month with no mid-contract price rise. Its main limitation is coverage, which is restricted to specific parts of South East England and Scotland.',
      },
      {
        question: 'Where is Trooli broadband available?',
        answer: 'Trooli covers parts of Berkshire, Buckinghamshire, Cambridgeshire, Dorset, East Sussex, Hampshire, Kent, Norfolk, Suffolk, West Sussex and Wiltshire in England, plus North and South Lanarkshire and Fife in Scotland, passing over 400,000 homes and businesses. Coverage is postcode-specific, so check the exact address on Trooli\'s own checker.',
      },
      {
        question: 'Does Trooli offer symmetrical broadband?',
        answer: 'Not fully. Upload speeds scale with each download tier, from 50 Mbps on the 150 Mbps plan up to 300 Mbps on the top two tiers, but they are not a 1:1 match with download speed at every tier the way some full-fibre altnet rivals offer. Upload is still considerably higher than a typical part-fibre connection at a comparable speed.',
      },
      {
        question: 'Does Trooli increase its prices mid-contract?',
        answer: 'Trooli states that its current published range carries no mid-contract price increase, so the price agreed at sign-up should hold for the full 24-month contract term, disclosed upfront rather than added later.',
      },
    ],
    reviewedDate: '2026-08-23',
    pricingVerifiedDate: '2026-08-23',
    reviewSources: [
      {
        label: 'Choose.co.uk: Trooli broadband deals',
        href: 'https://www.choose.co.uk/broadband/trooli/',
        note: 'A direct fetch of trooli.com returned no usable content (JS-rendered page); pricing, speeds and coverage corroborated via this independent aggregator, checked 2026-08-23.',
      },
      {
        label: 'broadbandchoices: Trooli deals and packages',
        href: 'https://www.broadbandchoices.co.uk/providers/trooli',
        note: 'Independent corroboration for package pricing, coverage footprint and the no-price-rise policy.',
      },
      {
        label: 'Trooli public Trustpilot profile',
        href: 'https://uk.trustpilot.com/review/www.trooli.com',
        note: 'Customer-sentiment reference showing approximately 6,800 reviews and a rating in the region of 4.4 out of 5 in August 2026; not treated as a controlled reliability survey.',
      },
      {
        label: 'Awin Trooli advertiser programme',
        href: 'https://ui.awin.com/merchant-profile-terms/25528?setLocale=en_US',
        note: 'BroadbandPicker\'s Awin application for this programme is pending, not yet approved. A valid publisher-specific tracking link is not generated until approval, so the affiliate link above is the provider\'s own site, verified 2026-08-23.',
      },
      {
        label: 'BroadbandPicker review methodology',
        href: '/how-we-review-broadband',
        note: 'Explains how price, speed, coverage, customer experience and use-case fit are weighed.',
      },
    ],
    awinProgramId: '25528',
  },
  {
    slug: 'pine-media',
    name: 'Pine Media',
    logo: '/logos/pine-media.svg',
    affiliateUrl: 'https://pinemedia.net/',
    speeds: [
      { download: 100, upload: 100, type: 'FTTP' },
      { download: 160, upload: 160, type: 'FTTP' },
      { download: 550, upload: 550, type: 'FTTP' },
      { download: 2000, upload: 2000, type: 'FTTP' },
    ],
    monthlyPriceFrom: 22.00,
    contractLengths: [1, 12, 24],
    setupFee: 0,
    trustpilotScore: 4.5,
    coveragePercent: 1,
    highlights: [
      'A hyperlocal full-fibre provider building and operating its own network across Sheffield only',
      'Every plan is symmetrical on its own GIG network, from 100 Mbps up to 2,000 Mbps',
      'A price-lock guarantee, a 30-day satisfaction guarantee, and up to £150 buyout credit on eligible plans',
    ],
    pros: [
      'Genuinely low entry price for symmetrical full fibre, from £22 a month',
      'No upfront setup cost on 12 or 24-month plans',
      'An eero 6+ mesh router included free on every plan',
      'Choice of 12-month, 24-month or rolling monthly contracts, more flexibility than most altnets offer',
    ],
    cons: [
      'Coverage is limited to Sheffield only, the smallest footprint of any full-fibre altnet on this site',
      'A separate Openreach-based GLO product line exists alongside the flagship GIG network, so check which one applies at a specific address before comparing speeds',
      'Some recent reviews describe billing disputes and address-availability mix-ups, alongside mostly positive feedback',
    ],
    excerpt:
      'Pine Media is a hyperlocal full-fibre provider building and operating its own network across Sheffield, alongside a separate Openreach-based product line for addresses outside its own build. Symmetrical GIG plans run from 100 Mbps to 2,000 Mbps, from £22 a month, with a price-lock guarantee, a 30-day satisfaction guarantee and no upfront setup cost. Coverage is genuinely local, so this is only relevant to Sheffield addresses.',
    contentSections: [
      {
        heading: 'Pine Media Broadband Deals in August 2026',
        paragraphs: [
          'Pine Media\'s own-network GIG series runs five tiers: GIG 100 at £22 a month, GIG 160 at £23, GIG 550 at £27, a roughly 900 Mbps tier at £30, and a 2,000 Mbps tier at £34. Every plan is symmetrical, meaning upload matches download at every tier, and includes an eero 6+ mesh router at no extra cost.',
          'A separate GLO series runs over the Openreach network for addresses Pine Media\'s own fibre has not reached, with lower, non-symmetrical upload speeds typical of standard Openreach FTTP products. Checking which series actually applies at a specific address matters more here than with most providers, since the two have meaningfully different speed profiles at a similar headline price.',
          'There is no upfront setup cost on 12 or 24-month plans. A rolling monthly option is also available, carrying a small activation fee shown at checkout, for anyone who wants no fixed term at all.',
        ],
      },
      {
        heading: 'Pine Media Coverage: Sheffield Only',
        paragraphs: [
          'Pine Media describes itself as Sheffield\'s own full-fibre broadband provider, building, owning and operating its network specifically across the city rather than a wider region. Reported figures put current coverage at over 37,000 premises, a genuinely local footprint compared with every other altnet covered on this site, most of which span multiple towns, counties or even nations.',
          'This hyperlocal focus is both Pine Media\'s defining characteristic and its main limitation: it is simply not an option for the overwhelming majority of UK addresses. Anyone outside Sheffield should not expect Pine Media\'s own GIG network to reach them, though the separate Openreach-based GLO product may still be orderable more widely, subject to standard Openreach FTTP availability.',
          'Within Sheffield, coverage is still address-specific rather than city-wide, so checking the exact postcode on Pine Media\'s own site is the only reliable way to confirm whether the GIG network, the GLO network, or neither, is available.',
        ],
      },
      {
        heading: 'Pine Media Speeds: Symmetrical GIG vs Openreach GLO',
        paragraphs: [
          'The GIG series is Pine Media\'s flagship product and its clearest differentiator: fully symmetrical speeds at every tier, from 100 Mbps up to 2,000 Mbps, on infrastructure Pine Media owns and operates itself. That puts its upload speeds well ahead of a typical Openreach or CityFibre-based product at the same download tier.',
          'The GLO series, running over the Openreach network, follows the more familiar pattern seen across most national providers: download speed scales faster than upload, so a 550 Mbps GLO plan does not offer anything close to 550 Mbps upload. This is the product an address just outside Pine Media\'s own network footprint would actually be offered.',
          'For most households, the 100 or 160 Mbps GIG tier is comfortably enough for streaming, browsing and video calls with room to spare. The 2,000 Mbps top tier is a specialist choice for heavy multi-user households or small businesses rather than typical single-household use.',
        ],
      },
      {
        heading: 'Guarantees: Price Lock, Satisfaction and Buyout Credit',
        paragraphs: [
          'Pine Media publishes a price-lock guarantee, meaning no mid-contract price increase on the term agreed at sign-up, and a 30-day satisfaction guarantee allowing free cancellation shortly after joining if the service is not working out. Both are disclosed upfront rather than buried in the terms.',
          'A price-match guarantee is also offered against comparable full-fibre deals, worth raising directly with Pine Media if a genuinely comparable local quote is found elsewhere. On eligible 24-month plans at GIG 550 and above, up to £150 in buyout credit is available to help offset an early-termination charge from a previous provider.',
          'These guarantees are a meaningful part of Pine Media\'s value proposition alongside the headline price, and worth factoring into a comparison against a cheaper rival that does not offer the same protections.',
        ],
      },
      {
        heading: 'Installation and Switching to Pine Media',
        paragraphs: [
          'Because Pine Media builds and operates its own GIG network, installation on that product involves connecting the property to Pine Media\'s own fibre rather than activating an existing line, which typically means a scheduled engineer visit. GLO installations, running over Openreach, follow the more standard Openreach engineer process used by most national providers.',
          'A switch from another Openreach-based provider to Pine Media\'s GLO product may qualify for Ofcom\'s One Touch Switch process; a switch to the GIG network, on Pine Media\'s own infrastructure, will not, so keep an existing connection running until the new one is confirmed working.',
          'Anyone renting in Sheffield should check landlord permission for external cabling before booking a GIG installation, the same consideration that applies to any altnet building its own physical network into a property.',
        ],
      },
      {
        heading: 'Pine Media Customer Service and Reviews',
        paragraphs: [
          'Pine Media\'s Trustpilot profile showed a rating of approximately 4.5 out of 5 from several hundred reviews at the point of this check, a small but positive sample consistent with a genuinely local, single-city provider rather than a national brand.',
          'Reviews commonly praise responsive customer service, fast broadband speeds and the no-mid-contract-rise guarantee. A smaller number of more recent reviews describe billing disputes and confusion over whether a specific address was actually covered before signing up, which is worth flagging rather than ignoring alongside the mostly positive pattern.',
          'Given the small review base, a handful of negative reviews carries more statistical weight than the same number would for a provider with tens of thousands of reviews; treat the overall pattern as a reasonably positive but less thoroughly tested signal than a larger, longer-established altnet.',
        ],
      },
      {
        heading: 'Is Pine Media Broadband Any Good?',
        paragraphs: [
          'For a Sheffield address within its own GIG network, Pine Media is a genuinely strong option: symmetrical full fibre from £22 a month, a real price-lock and satisfaction guarantee, and a mesh router included free, all backed by a mostly positive, if small, review base.',
          'It is irrelevant to almost every UK address outside Sheffield, and even within the city, confirming whether an address gets the symmetrical GIG network or the non-symmetrical Openreach GLO product matters more than with most providers, since the two are meaningfully different services at a similar price.',
          'Our take: worth strong consideration for a Sheffield GIG-network address specifically, with the caveat that a handful of recent reviews about billing and availability confusion are worth reading directly before ordering, given how small the overall review base still is.',
        ],
      },
    ],
    faqItems: [
      {
        question: 'Is Pine Media broadband any good?',
        answer: 'Pine Media holds a Trustpilot rating of approximately 4.5 out of 5 from several hundred reviews, with responsive customer service and its no-mid-contract-price-rise guarantee as recurring positive themes, alongside a smaller number of recent reviews describing billing disputes and address-coverage confusion. It offers genuinely competitive symmetrical full-fibre pricing where its own network reaches.',
      },
      {
        question: 'Where is Pine Media broadband available?',
        answer: 'Pine Media\'s own GIG full-fibre network covers Sheffield only, reported at over 37,000 premises. A separate Openreach-based GLO product may be available more widely, subject to standard Openreach FTTP coverage. Check the exact postcode on Pine Media\'s own site to confirm which, if either, applies at a specific address.',
      },
      {
        question: 'What is the difference between Pine Media\'s GIG and GLO packages?',
        answer: 'GIG runs on Pine Media\'s own network and is fully symmetrical, with upload matching download at every tier from 100 Mbps to 2,000 Mbps. GLO runs over the Openreach network and follows the more typical pattern where upload speed is considerably lower than download. Which one is offered depends entirely on the address.',
      },
      {
        question: 'Does Pine Media have a price-lock guarantee?',
        answer: 'Yes. Pine Media publishes a price-lock guarantee against mid-contract increases, a 30-day satisfaction guarantee allowing free cancellation shortly after joining, a price-match guarantee against comparable local deals, and up to £150 in buyout credit on eligible 24-month GIG 550-and-above plans.',
      },
    ],
    reviewedDate: '2026-08-23',
    pricingVerifiedDate: '2026-08-23',
    reviewSources: [
      {
        label: 'Pine Media contract and pricing details',
        href: 'https://pinemedia.net/',
        note: 'Used for GIG series pricing, contract length options, setup fee and guarantees, checked 2026-08-23.',
      },
      {
        label: 'Pine Media: about Pine Media',
        href: 'https://pinemedia.net/about-us',
        note: 'Used for Sheffield coverage positioning and premises-passed figure.',
      },
      {
        label: 'CompareFibre: Pine Media broadband deals',
        href: 'https://comparefibre.co.uk/providers/pine-media',
        note: 'Independent corroboration for the GIG/GLO product split and coverage description.',
      },
      {
        label: 'Pine Media public Trustpilot profile',
        href: 'https://uk.trustpilot.com/review/pinemedia.net',
        note: 'Customer-sentiment reference showing several hundred reviews and a rating around 4.5 out of 5 in August 2026, including some recent negative reviews on billing and availability; not treated as a controlled reliability survey.',
      },
      {
        label: 'Awin Pine Media advertiser programme',
        href: 'https://ui.awin.com/merchant-profile-terms/27840?setLocale=en_US',
        note: 'BroadbandPicker\'s Awin application for this programme is pending, not yet approved. A valid publisher-specific tracking link is not generated until approval, so the affiliate link above is the provider\'s own site, verified 2026-08-23.',
      },
      {
        label: 'BroadbandPicker review methodology',
        href: '/how-we-review-broadband',
        note: 'Explains how price, speed, coverage, customer experience and use-case fit are weighed.',
      },
    ],
    awinProgramId: '27840',
  },
  {
    slug: 'toob',
    name: 'Toob',
    logo: '/logos/toob.svg',
    affiliateUrl: 'https://www.toob.co.uk/',
    speeds: [
      { download: 150, upload: 150, type: 'FTTP' },
      { download: 500, upload: 500, type: 'FTTP' },
      { download: 900, upload: 900, type: 'FTTP' },
    ],
    monthlyPriceFrom: 19.50,
    contractLengths: [18, 24],
    setupFee: 0,
    trustpilotScore: 4.5,
    coveragePercent: 1,
    highlights: [
      'Symmetrical full-fibre from £19.50 a month, with no mid-contract price rises',
      'Coverage has expanded well beyond Southampton, to around 290,000 premises across 29 towns and cities',
      'A Linksys Pinnacle WiFi 7 router included as standard on every plan',
    ],
    pros: [
      'Genuinely low entry price for symmetrical full fibre',
      'No scheduled mid-contract price increase',
      'WiFi 7 router included free, ahead of most rivals\' standard hardware',
      'Strong, consistent Trustpilot pattern from a meaningful review volume',
    ],
    cons: [
      'Coverage remains limited to specific towns across Hampshire, Dorset, Surrey, Sussex and Berkshire, not a national footprint',
      'A newer, smaller network than the largest full-fibre altnets, with a shorter track record',
      'Only two contract lengths are offered, with no shorter or rolling monthly option',
    ],
    excerpt:
      'toob is a full-fibre altnet that began in Southampton and has since expanded across Hampshire, Dorset, Surrey, Sussex and Berkshire, reaching around 290,000 premises across 29 towns and cities. Symmetrical plans run from 150 Mbps to 900 Mbps, from £19.50 a month, with no mid-contract price rise and a WiFi 7 router included as standard. Coverage remains genuinely regional, so checking the exact address matters more than the brand\'s strong reviews.',
    contentSections: [
      {
        heading: 'toob Broadband Deals in August 2026',
        paragraphs: [
          'toob\'s range runs three symmetrical tiers: Home 150 at around £19.50 a month on an 18-month contract, and higher tiers up to Home 900 at around £25 a month. Every plan includes a Linksys Pinnacle WiFi 7 router at no extra cost, hardware ahead of what most national providers include as standard.',
          'toob states its published range carries no mid-contract price rise, a genuine point of difference from BT, EE, Vodafone and Plusnet, all of which now apply a flat annual increase following Ofcom\'s ban on inflation-linked rise terms. Confirm the current live price and contract length for the specific address at checkout, since promotions vary.',
          'No setup fee applies across the range, removing one of the more variable upfront costs seen with some full-fibre altnets.',
        ],
      },
      {
        heading: 'toob Coverage: Beyond Southampton',
        paragraphs: [
          'toob began building in Southampton and has since expanded considerably. Its network now reaches around 290,000 premises across 29 towns and cities spanning Hampshire, Dorset, Surrey, Sussex and Berkshire, including Southampton, Eastleigh, Fareham, Gosport, Aldershot, Fleet, Farnborough, Camberley and Woking.',
          'This is a meaningfully broader footprint than toob\'s original Southampton-only positioning, though it remains a small, regional network compared with the roughly 28 million homes in the UK. A town appearing on toob\'s coverage list does not guarantee a specific street is ready to order.',
          'Anyone outside this South East England footprint should not expect toob to be available at all. Its own postcode checker is the only reliable way to confirm a specific address, rather than assuming coverage from a town or county name.',
        ],
      },
      {
        heading: 'toob Speeds: Fully Symmetrical Full Fibre',
        paragraphs: [
          'Every toob tier is symmetrical, meaning upload matches download exactly, from 150 Mbps up to 900 Mbps. This is a genuine advantage over a typical part-fibre connection at a comparable price, useful for cloud backups, large file transfers and video calls where several household members are on camera at once.',
          'The entry 150 Mbps tier comfortably covers everyday streaming, browsing and video calls for most households. The top 900 Mbps tier mainly benefits larger households running multiple demanding activities simultaneously, or anyone who specifically wants the fastest available speed regardless of typical daily use.',
          'The included WiFi 7 router is genuinely ahead of the WiFi 5 or WiFi 6 hardware still standard with several larger national providers, which can matter for a household with many simultaneous connected devices.',
        ],
      },
      {
        heading: 'Contract Terms and No Mid-Contract Rise',
        paragraphs: [
          'toob offers 18 and 24-month contracts, with no shorter or rolling monthly option currently published. The no-mid-contract-rise policy applies across the range, disclosed upfront rather than added later, matching the approach used by several other full-fibre altnets covered on this site, including Zzoomm and Community Fibre.',
          'Over the length of an 18 or 24-month contract, this can be worth more than it first appears against a rival with a flat annual increase of £3 to £4 a month, since toob\'s price should hold for the entire term rather than stepping up partway through.',
          'As with any fixed-term contract, confirm the early-termination charge before switching, particularly given toob\'s regional footprint means a house move could easily land outside its coverage area.',
        ],
      },
      {
        heading: 'Installation and Switching to toob',
        paragraphs: [
          'Because toob builds and operates its own network rather than reselling Openreach, installation involves connecting the property to toob\'s own fibre, typically requiring a scheduled engineer visit rather than a same-day activation.',
          'A switch from an Openreach-based provider, such as BT, Sky, TalkTalk or Plusnet, to toob will not use Ofcom\'s One Touch Switch process, since toob runs its own separate infrastructure. Keep the existing connection running until the new toob line is confirmed working.',
          'Renters in toob\'s coverage area should check landlord permission for any external cabling before booking an installation, the same consideration that applies to any altnet building its own physical network into a property.',
        ],
      },
      {
        heading: 'toob Customer Service and Reviews',
        paragraphs: [
          'toob\'s Trustpilot profile showed a rating around 4.5 out of 5 from over 7,000 reviews at the point of this check, a strong and consistent score for a still-growing regional altnet. Reviewers commonly cite the symmetrical speeds, the no-mid-contract-rise policy and UK-based customer support as specific positives.',
          'Given the review base is smaller than the largest national providers or longer-established altnets like Hyperoptic, each individual review carries somewhat more statistical weight; the overall pattern is genuinely positive, but represents a shorter track record than a decade-plus provider.',
          'As toob\'s coverage continues to expand into new towns, keeping an eye on whether review sentiment holds steady across newer build areas, not just its original Southampton base, is a reasonable thing to check before ordering in a more recently added location.',
        ],
      },
      {
        heading: 'Is toob Broadband Any Good?',
        paragraphs: [
          'Where it is available, toob is a genuinely strong option: symmetrical full fibre from £19.50 a month, no scheduled price rise, a WiFi 7 router included free, and a consistently positive review record from a meaningful sample size.',
          'It remains a regional network, not a national one, and its expansion beyond Southampton into Hampshire, Dorset, Surrey, Sussex and Berkshire, while real, still covers a small fraction of UK addresses overall.',
          'Our take: worth strong consideration for anyone in toob\'s South East England footprint, particularly given the combination of low price, no rise policy and modern router hardware; check the specific address first, since coverage remains the deciding factor.',
        ],
      },
    ],
    faqItems: [
      {
        question: 'Is toob broadband any good?',
        answer: 'toob holds a strong Trustpilot rating, around 4.5 out of 5 from over 7,000 reviews, with symmetrical full-fibre speeds, no mid-contract price rise and a WiFi 7 router included as standard. Its main limitation is coverage, which remains regional, spanning Hampshire, Dorset, Surrey, Sussex and Berkshire rather than the whole UK.',
      },
      {
        question: 'Is toob only available in Southampton?',
        answer: 'No longer. toob began in Southampton but has since expanded to around 290,000 premises across 29 towns and cities, including Eastleigh, Fareham, Gosport, Aldershot, Fleet, Farnborough, Camberley and Woking, spanning Hampshire, Dorset, Surrey, Sussex and Berkshire. Check the exact postcode on toob\'s own site to confirm current availability.',
      },
      {
        question: 'Does toob increase its prices mid-contract?',
        answer: 'toob states that its current published range carries no mid-contract price rise, a genuine point of difference from national providers such as BT, EE, Vodafone and Plusnet, which now apply a flat annual increase of £3 to £4 a month following Ofcom\'s rules on disclosed price rises.',
      },
      {
        question: 'What router does toob include?',
        answer: 'A Linksys Pinnacle WiFi 7 router is included free on every toob plan, ahead of the WiFi 5 or WiFi 6 hardware still standard with several larger national providers.',
      },
    ],
    reviewedDate: '2026-08-23',
    pricingVerifiedDate: '2026-08-23',
    reviewSources: [
      {
        label: 'BroadbandSwitch: South Hampshire broadband deals, including toob',
        href: 'https://broadbandswitch.uk/south-hampshire-broadband-deals.html',
        note: 'Used for current package pricing, router details and coverage footprint, checked 2026-08-23.',
      },
      {
        label: 'CompareFibre: toob broadband review',
        href: 'https://comparefibre.co.uk/providers/toob',
        note: 'Independent corroboration for pricing, the no-mid-contract-rise policy and Trustpilot score.',
      },
      {
        label: 'toob: Southampton broadband deals',
        href: 'https://www.toob.co.uk/locations/southampton/',
        note: 'Used to confirm toob\'s original and current core coverage area.',
      },
      {
        label: 'toob public Trustpilot profile',
        href: 'https://uk.trustpilot.com/review/toob.co.uk',
        note: 'Customer-sentiment reference showing approximately 7,000 reviews and a rating around 4.5 out of 5 in August 2026; not treated as a controlled reliability survey.',
      },
      {
        label: 'Awin toob advertiser programme',
        href: 'https://ui.awin.com/merchant-profile-terms/117433?setLocale=en_US',
        note: 'BroadbandPicker\'s Awin application for this programme was declined. The affiliate link above is toob\'s own site, verified 2026-08-23.',
      },
      {
        label: 'BroadbandPicker review methodology',
        href: '/how-we-review-broadband',
        note: 'Explains how price, speed, coverage, customer experience and use-case fit are weighed.',
      },
    ],
    awinProgramId: '117433',
  },
  {
    slug: 'giffgaff',
    name: 'giffgaff',
    logo: '/logos/giffgaff.svg',
    affiliateUrl: 'https://www.giffgaff.com/broadband',
    speeds: [
      { download: 200, upload: 200, type: 'FTTP' },
      { download: 500, upload: 500, type: 'FTTP' },
      { download: 900, upload: 900, type: 'FTTP' },
    ],
    monthlyPriceFrom: 25.00,
    contractLengths: [1, 24],
    setupFee: 0,
    trustpilotScore: 3.9,
    coveragePercent: 60,
    highlights: [
      'Launched broadband in September 2025, its first product beyond mobile',
      'Runs on Nexfibre, the Virgin Media O2 full-fibre network, not Openreach or its own infrastructure',
      'Every plan is symmetrical, with no mid-contract price rise on the current range',
    ],
    pros: [
      'Fully symmetrical speeds at every tier, from 200 Mbps to 900 Mbps',
      'No scheduled mid-contract price increase, disclosed upfront',
      'Choice of a 24-month contract or a genuinely flexible 1-month rolling option',
      'No setup fee, consistent with giffgaff\'s mobile-brand positioning around simple, transparent pricing',
    ],
    cons: [
      'A genuinely new product with under a year of trading history at the time of this review',
      'Trustpilot reviews cover the whole giffgaff brand, mostly mobile customers, with no broadband-specific score yet available',
      'Coverage depends entirely on the Nexfibre network\'s build progress, not a giffgaff-specific rollout',
      'The 1-month rolling option costs more than the 24-month term, as is typical for no-commitment plans',
    ],
    excerpt:
      'giffgaff, long known as a mobile-only network, launched broadband in September 2025, running on Nexfibre, Virgin Media O2\'s full-fibre wholesale network, rather than Openreach or its own infrastructure. Every plan is symmetrical, from 200 Mbps to 900 Mbps, from £25 a month, with no mid-contract price rise and a choice of 24-month or 1-month rolling contracts. As a genuinely new product, broadband-specific customer service evidence is still limited.',
    contentSections: [
      {
        heading: 'giffgaff Broadband Deals in August 2026',
        paragraphs: [
          'giffgaff\'s range offers three symmetrical tiers: 200 Mbps at £25 a month, 500 Mbps at £28, and 900 Mbps at £32, each available on a 24-month contract or a more expensive 1-month rolling option for anyone who wants no fixed commitment at all.',
          'giffgaff has run a promotional offer pricing broadband at £5 a month for the first six months of a 24-month contract, due to end on 28 August 2026. Given how close that date is, confirm the live offer at checkout rather than assuming the £5 introductory rate still applies.',
          'No setup fee applies to any current package, and giffgaff states its plans carry no mid-contract price rise, consistent with the "no sneaky price rises" positioning it uses in its own marketing.',
        ],
      },
      {
        heading: 'giffgaff Broadband Runs on Nexfibre, Not Openreach',
        paragraphs: [
          'giffgaff\'s broadband, launched in September 2025, runs over Nexfibre, the full-fibre wholesale network built through a partnership involving Virgin Media O2, rather than the Openreach network used by BT, Sky, TalkTalk, EE, Vodafone and Plusnet, or Virgin Media\'s own separate cable network.',
          'This matters for coverage: Nexfibre availability at a specific address is a different question from Openreach or Virgin Media cable availability, so an address without BT or Sky full fibre, or without Virgin Media cable, may still be able to get giffgaff broadband if Nexfibre has built there, and vice versa.',
          'Because giffgaff is a wholesale customer of Nexfibre rather than the network operator itself, its own coverage checker is the only reliable way to confirm availability at a specific address; broader Nexfibre rollout figures do not translate directly into giffgaff-specific availability.',
        ],
      },
      {
        heading: 'giffgaff Speeds: Fully Symmetrical',
        paragraphs: [
          'Every giffgaff broadband tier is symmetrical, meaning upload matches download exactly, at 200, 500 and 900 Mbps. This puts its entry-level plan\'s upload speed well ahead of what a similarly priced part-fibre plan from a national provider would typically offer.',
          'For most households, the 200 Mbps entry tier comfortably covers streaming, browsing, working from home and several devices in use at once. The 500 and 900 Mbps tiers mainly benefit larger households running multiple demanding activities simultaneously, or anyone who specifically wants meaningful upload headroom.',
          'As a Nexfibre-based service, actual line quality and reliability should be broadly comparable to other providers using the same wholesale network, though direct independent comparisons are still limited given how recently giffgaff broadband launched.',
        ],
      },
      {
        heading: 'Contract Flexibility: 24-Month or 1-Month Rolling',
        paragraphs: [
          'giffgaff offers a genuine 1-month rolling contract alongside the standard 24-month term, a level of flexibility most national providers and full-fibre altnets covered on this site do not offer at all. This suits a short-term tenancy or anyone who specifically wants to avoid a long commitment, at a higher monthly price than the 24-month term.',
          'The 24-month term is likely to work out considerably cheaper over its full length for anyone confident they will stay at the address, consistent with the general pattern that flexibility costs more than commitment across the broadband market.',
          'No mid-contract price rise applies to either option, disclosed upfront, which is a genuine point of comparison against national providers now charging a flat annual increase of £3 to £4 a month under Ofcom\'s current rules.',
        ],
      },
      {
        heading: 'Installation and Switching to giffgaff',
        paragraphs: [
          'Because giffgaff broadband runs on the Nexfibre network rather than Openreach, a switch from an Openreach-based provider will not use Ofcom\'s One Touch Switch process. Keep an existing broadband service active until the new giffgaff connection is confirmed working, rather than cancelling in advance.',
          'As a genuinely new broadband product, installation processes and typical waiting times are less independently documented than for a longer-established provider; anyone ordering should ask giffgaff directly for a realistic installation timeframe for the specific address.',
          'Existing giffgaff mobile customers may find the sign-up and account management experience familiar, since giffgaff broadband is positioned as an extension of the same brand and community-support approach used for its mobile service.',
        ],
      },
      {
        heading: 'giffgaff Customer Service: A New Product, Limited Broadband-Specific Evidence',
        paragraphs: [
          'giffgaff\'s Trustpilot profile showed a rating around 3.9 out of 5 from roughly 30,000 reviews at the point of this check, but this score covers the whole giffgaff brand, overwhelmingly mobile customers, since Trustpilot does not currently maintain a separate page specifically for giffgaff broadband.',
          'This is a meaningfully different situation from BT, EE and Vodafone, where a broadband-specific Trustpilot score exists and diverges sharply from the mobile-dominated headline figure. For giffgaff, no broadband-specific figure is available yet, simply because the product is too new and the review volume too small to separate reliably.',
          'giffgaff\'s mobile service has a long-established reputation for community-based support and straightforward pricing, which may reasonably carry over to broadband, but this should be treated as an informed expectation rather than confirmed broadband-specific evidence at this stage.',
        ],
      },
      {
        heading: 'Is giffgaff Broadband Worth It?',
        paragraphs: [
          'giffgaff\'s broadband offer is genuinely competitive on paper: symmetrical speeds at every tier, no mid-contract price rise, and an unusually flexible 1-month rolling option alongside the standard 24-month term.',
          'The main caveat is simply newness: launched in September 2025, there is not yet the volume of independent broadband-specific reviews or long-term service evidence available for BT, TalkTalk or the more established full-fibre altnets covered on this site.',
          'Our take: worth serious consideration where Nexfibre coverage reaches, especially for anyone who values contract flexibility or already trusts giffgaff\'s mobile brand, while going in with the understanding that broadband-specific service evidence is still building.',
        ],
      },
    ],
    faqItems: [
      {
        question: 'Is giffgaff broadband any good?',
        answer: 'giffgaff broadband offers symmetrical full-fibre speeds from 200 to 900 Mbps, no mid-contract price rise, and a flexible 1-month rolling contract option alongside the standard 24-month term. As a product launched in September 2025, broadband-specific customer service evidence is still limited; giffgaff\'s combined Trustpilot score of around 3.9 out of 5 is dominated by its longer-established mobile service.',
      },
      {
        question: 'What network does giffgaff broadband use?',
        answer: 'giffgaff broadband runs on Nexfibre, the full-fibre wholesale network built through a partnership involving Virgin Media O2, rather than the Openreach network most national providers resell, or Virgin Media\'s own separate cable network. Coverage depends entirely on where Nexfibre has built.',
      },
      {
        question: 'Can I get giffgaff broadband with no fixed contract?',
        answer: 'Yes. giffgaff offers a genuine 1-month rolling contract alongside its standard 24-month term, at a higher monthly price than the 24-month option. This is unusually flexible compared with most providers covered on this site, which typically offer only a 24-month term.',
      },
      {
        question: 'Does giffgaff broadband raise its prices during the contract?',
        answer: 'giffgaff states that its current broadband range carries no mid-contract price rise, disclosed upfront, a genuine point of comparison against national providers such as BT, EE, Vodafone and Plusnet, which now apply a flat annual increase of £3 to £4 a month.',
      },
    ],
    reviewedDate: '2026-08-23',
    pricingVerifiedDate: '2026-08-23',
    reviewSources: [
      {
        label: 'giffgaff: full fibre broadband',
        href: 'https://www.giffgaff.com/broadband',
        note: 'Used for current package pricing, contract options and the no-price-rise policy, checked 2026-08-23.',
      },
      {
        label: 'ISPreview: giffgaff launches UK full fibre broadband packages',
        href: 'https://www.ispreview.co.uk/index.php/2025/09/mobile-operator-giffgaff-launch-uk-full-fibre-broadband-packages.html',
        note: 'Primary source for the September 2025 launch date and the Nexfibre network partnership.',
      },
      {
        label: 'GB News: giffgaff broadband £5 introductory offer',
        href: 'https://www.gbnews.com/tech/giffgaff-broadband-deal-ps5',
        note: 'Used to corroborate the time-limited £5-a-month introductory promotion, ending 28 August 2026.',
      },
      {
        label: 'giffgaff public Trustpilot profile',
        href: 'https://uk.trustpilot.com/review/giffgaff.com',
        note: 'Customer-sentiment reference showing approximately 30,000 reviews and a rating around 3.9 out of 5 in 2026; covers the whole giffgaff brand, overwhelmingly mobile customers, with no separate broadband-specific page currently available.',
      },
      {
        label: 'Awin giffgaff advertiser programme',
        href: 'https://ui.awin.com/merchant-profile-terms/3599?setLocale=en_US',
        note: 'BroadbandPicker\'s Awin application for this programme was declined. The affiliate link above is giffgaff\'s own site, verified 2026-08-23.',
      },
      {
        label: 'BroadbandPicker review methodology',
        href: '/how-we-review-broadband',
        note: 'Explains how price, speed, coverage, customer experience and use-case fit are weighed.',
      },
    ],
    awinProgramId: '3599',
  },
  {
    slug: 'brsk',
    name: 'Brsk',
    logo: '/logos/brsk.svg',
    affiliateUrl: 'https://www.youfibre.com/brsk/index.html',
    speeds: [
      { download: 200, upload: 200, type: 'FTTP' },
      { download: 900, upload: 900, type: 'FTTP' },
      { download: 2000, upload: 2000, type: 'FTTP' },
    ],
    monthlyPriceFrom: 24.99,
    contractLengths: [1, 12],
    setupFee: 0,
    trustpilotScore: 4.6,
    coveragePercent: 10,
    highlights: [
      'Brsk is now part of YouFibre, so new availability and orders are handled through YouFibre',
      'Legacy BetterNet plans used full fibre with matching upload and download speeds',
      'The January 2026 price book listed 12-month and rolling monthly options with no usage caps',
    ],
    pros: [
      'Symmetrical full-fibre speeds made Brsk strong for uploads and home working',
      'Legacy fixed-term prices had no scheduled mid-contract increase',
      'Rolling monthly plans provided a flexible alternative',
      'The network footprint continues through the combined Netomnia and YouFibre operation',
    ],
    cons: [
      'Brsk is no longer taking new orders as a standalone retail brand',
      'Availability remains address-specific rather than nationwide',
      'Historic Brsk prices should not be treated as current YouFibre offers',
      'Speeds above 1 Gbps normally require compatible wired and multi-gigabit equipment',
    ],
    retiredDate: '2026-03-16',
    successorName: 'YouFibre',
    successorUrl: 'https://www.youfibre.com/',
    excerpt:
      'Brsk broadband is no longer sold as a standalone service. The Brsk website now redirects prospective customers to YouFibre, which handles new orders on the combined Netomnia network. Existing Brsk customers should use their migration communications and account support. Our January 2026 snapshot below explains the former BetterNet plans, but new customers must check current YouFibre prices and postcode availability.',
    contentSections: [
      {
        heading: 'Can You Still Get Brsk Broadband?',
        paragraphs: [
          'No new standalone Brsk broadband range was available when we checked on 22 August 2026. Brsk\'s official homepage redirected to a Brsk information page on YouFibre, and independent provider reviews report that the Brsk retail brand was retired in March 2026. New-customer availability, packages and checkout are therefore handled through YouFibre rather than a separate Brsk ordering journey.',
          'This distinction matters when comparing Brsk broadband deals. Search results can still show historic BetterNet prices, old referral offers and reviews written before the change. Those pages can explain what existing customers bought, but they do not prove that a plan can be ordered today. Follow the official redirect, enter the full installation address and read the current contract summary before paying or cancelling another service.',
          'Existing Brsk customers should not assume their service has ended. The underlying full-fibre infrastructure forms part of the combined Netomnia network, while customer accounts are being moved into the YouFibre operation. Keep any migration email, check the payment descriptor and use the support route stated in your account. Contact support before changing a Direct Debit or returning equipment.',
        ],
      },
      {
        heading: 'Brsk Broadband Deals and Historic BetterNet Prices',
        paragraphs: [
          'Brsk\'s price book dated 12 January 2026 listed BetterNet200 at £24.99 a month, BetterNet1000 at £29.99 and BetterNet2000 at £34.99 on 12-month contracts. The stated average symmetrical speeds were 200 Mbps, 900 Mbps and 2,000 Mbps respectively, with unlimited usage. The equivalent rolling monthly prices were £34.99, £39.99 and £44.99. These figures are a dated record, not a current quote.',
          'The fixed-term range was attractive because the price book used a relatively short 12-month commitment and Brsk promoted predictable in-contract pricing. The rolling plan cost more each month but reduced commitment. A fair comparison uses total contract cost, including activation, optional mesh Wi-Fi, phone, TV, static IP and any post-contract price, rather than selecting the lowest headline payment.',
          'Current YouFibre packages may use different product names, speeds, promotional periods or contract lengths. A legacy Brsk deal should never be presented as live unless the official checkout confirms it for the address. Save the order summary and note whether equipment remains the provider\'s property, what happens after the minimum term and how early termination charges are calculated.',
        ],
      },
      {
        heading: 'Brsk Speeds, Upload Performance and Full Fibre',
        paragraphs: [
          'Brsk used fibre to the premises, meaning the fibre ran to the property rather than handing over to copper at a street cabinet. Its defining feature was symmetrical broadband: a 900 Mbps package advertised roughly 900 Mbps upload as well as download. That is useful for cloud backups, sending large media files, hosting video calls and households where several people upload at once.',
          'A 200 Mbps connection is already enough for normal streaming, gaming, remote work and several simultaneous users. The 900 Mbps tier mainly reduces large download and upload times. A 2 Gbps service is a specialist choice for very busy homes or advanced users. One device will only approach multi-gigabit speeds if its Ethernet port, cable, router and storage can all sustain them.',
          'Headline line speed is not the same as Wi-Fi speed in every room. Walls, interference, device capability and distance from the hub affect wireless performance. Compare the guaranteed minimum line speed and any whole-home Wi-Fi terms separately. Run tests over Ethernet when diagnosing the incoming service, then test Wi-Fi in the rooms where coverage actually matters.',
        ],
      },
      {
        heading: 'Brsk Coverage and Postcode Availability',
        paragraphs: [
          'Brsk coverage was concentrated in selected parts of West Yorkshire, Lancashire, Greater Manchester, Cheshire and the West Midlands, with additional reach through Netomnia. It was never a nationwide Openreach-style service. Street-level build status can vary within the same postcode, so a town appearing on a coverage map does not confirm that a particular flat or house is ready to order.',
          'The combined Netomnia footprint is broader than Brsk\'s original build, but the only reliable eligibility test is the current YouFibre address checker. Enter the complete postcode and choose the exact property. If the result says coming soon or build in progress, keep the existing broadband active until the new connection has been installed, activated and tested.',
          'People comparing Brsk coverage should also check wayleave requirements for rented homes or flats, installation access, where the optical network terminal and router will sit, and whether overhead or underground work is needed. Ask the landlord or managing agent early when permission may be required. Do not cancel a working connection solely because a network map shows planned coverage.',
        ],
      },
      {
        heading: 'Brsk Router, BetterWiFi and Static IP Options',
        paragraphs: [
          'Router hardware changed across Brsk plan generations. Independent deal guides recorded standard hubs for lower tiers and multi-gigabit-capable hardware for BetterNet2000. The practical question is whether the supplied hub has enough Ethernet capacity and wireless capability for the selected speed. A 2 Gbps line paired only with 1 Gbps device ports cannot deliver 2 Gbps to one wired device.',
          'BetterWiFi was Brsk\'s paid mesh service for extending wireless coverage. The January 2026 terms linked the mesh agreement to the broadband service and described notice or early termination conditions. Before taking any current equivalent, confirm the monthly cost, number of nodes, minimum-speed promise, rooms covered, fault process and equipment-return rules.',
          'Brsk also offered BetterIP, an optional static IPv4 service. This mattered because users running inbound services, some CCTV systems, remote access or particular gaming setups may need a public address rather than carrier-grade NAT. Most households do not need a static IP. Explain the use case to current support and verify whether IPv6 or a paid static IPv4 option is appropriate.',
        ],
      },
      {
        heading: 'Brsk Customer Service, Reviews and Switching',
        paragraphs: [
          'Brsk had a strong legacy customer-review profile. A dated independent snapshot recorded 4.6 out of 5 from 86,320 Trustpilot reviews on 4 May 2026, while Uswitch had recorded 4.8 in December 2025. The figures use different dates and are reported separately rather than averaged. Neither is a technical reliability measurement or a guarantee of the post-migration YouFibre experience.',
          'For a switch, confirm whether One Touch Switch applies and which provider will coordinate the transfer. Keep the old service until the activation plan is clear, especially where a separate fibre installation is required. Record the promised activation date, any buyout credit, proof deadline and conditions. Historic Brsk buyout terms required evidence of the old provider\'s early termination charge within a stated period.',
          'If service fails, test power, optical terminal lights, Ethernet and Wi-Fi separately before reporting the fault. Existing customers should use the contact channel shown in their migration or account information. Keep fault references and dates. Check whether the current provider participates in Ofcom\'s automatic compensation scheme rather than assuming a legacy Brsk policy still applies.',
        ],
      },
      {
        heading: 'Brsk vs YouFibre: What New Customers Should Do',
        paragraphs: [
          'Brsk and YouFibre should not be compared as two simultaneously orderable providers in 2026. Brsk is the legacy retail brand, while YouFibre is the current destination for new orders on the combined network. The useful comparison is therefore between the current YouFibre quote and other providers available at the same address, not between a historic Brsk tariff and a live YouFibre tariff.',
          'Start with the postcode result, then compare average and guaranteed speeds, upload rate, total minimum-term cost, installation timing, annual price policy, router specification, support route and exit terms. A slower national provider may suit a light-use household if it is cheaper or easier to install. YouFibre may be stronger where symmetrical uploads and fixed-term price certainty matter.',
          'Our verdict is conditional. Former Brsk technology was compelling where available because it combined full fibre, symmetrical speeds and competitive fixed pricing. Today, however, new customers should treat Brsk search results as legacy information and make the purchasing decision from a current YouFibre contract summary. Existing customers should follow their migration terms rather than place a duplicate order.',
        ],
      },
    ],
    faqItems: [
      {
        question: 'Is Brsk still available in 2026?',
        answer: 'Brsk is no longer sold as a standalone retail broadband brand. Its official website redirects to YouFibre, and new orders are handled through YouFibre on the combined Netomnia network. Existing Brsk services may continue during migration, so current customers should follow their account communications rather than placing a new order.',
      },
      {
        question: 'What happened to Brsk broadband?',
        answer: 'Brsk combined with Netomnia and its retail customers moved into the YouFibre operation. The network infrastructure continues, but Brsk-branded deals found in older reviews or price books are historic. The change means prospective customers should check current YouFibre packages, coverage and terms at their exact address.',
      },
      {
        question: 'How fast was Brsk broadband?',
        answer: 'The January 2026 Brsk price book listed symmetrical average speeds of 200 Mbps, 900 Mbps and 2,000 Mbps. Symmetrical means the advertised upload matched the download. Current YouFibre speeds and availability may differ, and multi-gigabit performance requires compatible wired equipment as well as a suitable package.',
      },
      {
        question: 'Where was Brsk broadband available?',
        answer: 'Brsk focused on selected areas in West Yorkshire, Lancashire, Greater Manchester, Cheshire and the West Midlands, with further reach through Netomnia. Coverage varied street by street. New customers must now use YouFibre\'s full-address checker because a town or postcode-area listing does not confirm service at one property.',
      },
      {
        question: 'Can existing Brsk customers keep their service?',
        answer: 'Existing Brsk customers should follow their migration and account communications from Brsk or YouFibre. Do not cancel a Direct Debit, return equipment or place a replacement order without checking the instructions for your account. Your service may continue on the same underlying network while billing and support move to YouFibre.',
      },
      {
        question: 'Should I choose Brsk or YouFibre?',
        answer: 'New customers cannot make a normal like-for-like choice because Brsk is the legacy brand and YouFibre handles current orders. Compare the live YouFibre quote against other providers at your address using total contract cost, speed, upload performance, installation timing, price-rise policy, router and cancellation terms.',
      },
    ],
    reviewedDate: '2026-08-22',
    pricingVerifiedDate: '2026-08-22',
    reviewSources: [
      {
        label: 'Official Brsk to YouFibre page',
        href: 'https://www.brsk.co.uk/',
        note: 'Checked on 22 August 2026 to verify that the Brsk homepage redirects to YouFibre for current customer and ordering information.',
      },
      {
        label: 'Brsk January 2026 price book',
        href: 'https://www-staging.brsk.co.uk/documents/price-book',
        note: 'Used only as a dated record of BetterNet speeds, normal prices, contract options and add-on terms. These are not presented as current offers.',
      },
      {
        label: 'Uswitch Brsk provider review',
        href: 'https://www.uswitch.com/broadband/reviews/brsk/',
        note: 'Independent corroboration for the March 2026 retail-brand retirement, legacy coverage, speeds and historical customer sentiment.',
      },
      {
        label: 'Choose Brsk broadband guide',
        href: 'https://www.choose.co.uk/broadband/brsk/',
        note: 'Independent comparison of the legacy BetterNet product structure, contract terms, add-ons and regional availability.',
      },
      {
        label: 'Ofcom automatic compensation guidance',
        href: 'https://www.ofcom.org.uk/phones-and-broadband/service-quality/automatic-compensation-need-know',
        note: 'Regulatory source checked on 22 August 2026 for the scheme protections and current provider signatory list.',
      },
      {
        label: 'BroadbandSwitch Brsk provider snapshot',
        href: 'https://broadbandswitch.uk/provider/brsk/',
        note: 'Independent source for the dated 4.6/5 Trustpilot snapshot from 86,320 reviews captured on 4 May 2026.',
      },
      {
        label: 'BroadbandPicker review methodology',
        href: '/how-we-review-broadband',
        note: 'Explains how we weigh price, speed, coverage, customer experience and use-case fit.',
      },
    ],
    awinProgramId: null,
  },
  {
    slug: 'youfibre',
    name: 'YouFibre',
    logo: '/logos/youfibre.svg',
    affiliateUrl: 'https://www.youfibre.com/',
    speeds: [
      { download: 200, upload: 200, type: 'FTTP' },
      { download: 1000, upload: 1000, type: 'FTTP' },
      { download: 2000, upload: 2000, type: 'FTTP' },
      { download: 8000, upload: 8000, type: 'FTTP' },
    ],
    monthlyPriceFrom: 20.00,
    contractLengths: [1, 24],
    setupFee: 0,
    trustpilotScore: 4.6,
    coveragePercent: 10,
    highlights: [
      'Genuinely symmetrical upload and download speeds on every tier, up to 8 Gbps',
      'No mid-contract price rises on any deal, fixed or rolling',
      'Its parent group is mid-acquisition into the Virgin Media O2 orbit, pending a CMA Phase 2 competition investigation',
    ],
    pros: [
      'No scheduled mid-contract price increases on any package, a genuine point of difference from BT, Sky and most national providers',
      'Rolling monthly contracts available alongside a standard 24-month term, unusual among full-fibre altnets',
      'Wi-Fi 7 router included as standard, with no setup fee',
      'Strong Trustpilot score, around 4.6 out of 5, on its main youfibre.com profile',
    ],
    cons: [
      'Coverage limited to selected towns on the Netomnia network, around 10% of UK premises',
      'Real billing and account-access problems were reported during the March 2026 Brsk-to-YouFibre migration',
      'Its parent group, Substantial Group, is being acquired into the Virgin Media O2 orbit, a deal not yet cleared by the competition regulator',
      'A separate, lower-scoring youfibre.co.uk Trustpilot profile exists alongside the main youfibre.com page',
    ],
    excerpt:
      'YouFibre is a full-fibre altnet built on the Netomnia network, covering around 10% of UK premises across more than 150 towns after absorbing the Brsk brand in March 2026. Prices run from £20 a month for You 200 up to £50 for You 8000, all symmetrical and with no mid-contract price rises, on either a 24-month or rolling monthly contract. Its Trustpilot score is a strong 4.6 out of 5, though the Brsk migration caused genuine billing and login problems for some customers, and its parent group is currently mid-acquisition into the Virgin Media O2 orbit, pending regulatory approval.',
    contentSections: [
      {
        heading: 'YouFibre Broadband Deals in August 2026',
        paragraphs: [
          'YouFibre\'s current 24-month range runs from You 200 at £20 a month, through You 1000 at £25 and You 2000 at £30, up to You 8000 at £50, all with genuinely symmetrical upload and download speeds. A rolling monthly option is also available at a higher price, from £33.99 for You 150 up to £129.99 for You 8000, requiring 30 days\' notice to cancel rather than a fixed minimum term.',
          'No setup fee applies on any package, and a Wi-Fi 7 router is included as standard, a genuinely newer specification than most national providers currently offer even on their flagship tiers.',
          'YouFibre\'s central pricing promise is that the monthly price stays fixed for the whole contract term, with no scheduled mid-contract increase of the kind BT, Sky, EE and Vodafone all now apply as a flat pounds-and-pence rise. This remains a genuine, real point of difference rather than a marketing claim, and applies equally to the rolling monthly option.',
        ],
      },
      {
        heading: 'Coverage: The Netomnia Network After the Brsk Merger',
        paragraphs: [
          'YouFibre runs on the Netomnia network, its own full-fibre infrastructure entirely separate from Openreach and Virgin Media\'s cable network. Coverage reached over 100 towns before merging with sister altnet Brsk in early 2026, and expanded to more than 150 towns afterward, spanning around 3 million UK premises across roughly 98 cities and towns, from Durham and Dover to Swansea, Stockton, Stockport, Bolton, Preston and Blackburn.',
          'As with any altnet, an address either has Netomnia\'s fibre running to it or does not; there is no partial or gradual coverage the way some national rollouts work. Always check the specific postcode rather than assuming general town-level coverage applies to a particular street or building.',
          'At around 10% of UK premises, YouFibre\'s reach is still far behind Openreach-based providers or Virgin Media, but it is a genuinely large and growing altnet, among the bigger alternative full-fibre networks in the UK alongside CityFibre.',
        ],
      },
      {
        heading: 'The Brsk Merger: What Actually Happened to Customers',
        paragraphs: [
          'Netomnia merged its two retail broadband brands, Brsk and YouFibre, under the single YouFibre name, with customer migration beginning on 16 March 2026. The company said there would be "no immediate changes" to former Brsk customers\' contracts, plans or pricing during the transition.',
          'In practice, the migration caused real, documented problems for some customers: billing errors including bills arriving noticeably higher than expected, difficulty logging into accounts or resetting passwords on the new YouFibre system, reports of speed drops during the switchover, and an overwhelmed customer support chat unable to keep up with the volume of queries.',
          'Anyone who was a Brsk customer before March 2026, or who is considering YouFibre now partly on the strength of Brsk\'s own reputation, should check their current bill against what they were originally promised, since migration-related billing errors were a genuine, reported issue rather than an isolated complaint.',
        ],
      },
      {
        heading: 'YouFibre\'s Parent Group Is Being Acquired Into the Virgin Media O2 Orbit',
        paragraphs: [
          'In February 2026, InfraVia, Liberty Global and Telefónica agreed to acquire Substantial Group, the parent company of Netomnia, YouFibre and Brsk, for £2 billion through their existing joint venture, nexfibre, the same infrastructure venture behind part of Virgin Media O2\'s network build-out. Nexfibre plans to then sell the retail YouFibre and Brsk brands on to Virgin Media O2 for £150 million.',
          'This deal has not completed. The UK\'s Competition and Markets Authority referred the acquisition for an in-depth Phase 2 investigation on 1 July 2026, and completion is not expected until around the third quarter of 2026 at the earliest, subject to that review\'s outcome.',
          'This matters for anyone choosing YouFibre specifically for its identity as an independent altnet, separate from the Openreach-vs-Virgin Media duopoly: if the deal completes, YouFibre\'s ultimate ownership will sit within the same corporate group as Virgin Media O2, even though the network and retail brand are expected to continue operating as before in the near term.',
        ],
      },
      {
        heading: 'YouFibre Customer Service and Trustpilot',
        paragraphs: [
          'YouFibre\'s main youfibre.com Trustpilot page shows a strong rating, around 4.6 out of 5 from more than 30,000 reviews, well above most national Openreach-based providers and consistent with reviewer comments about hassle-free installation and responsive problem-solving. A separate youfibre.co.uk profile exists with a noticeably lower score, a genuine dual-domain split worth knowing about, though the main youfibre.com page is the one actively promoted and used by the company.',
          'The strong headline score should be read alongside the specific, documented problems from the March 2026 Brsk migration above; a high overall Trustpilot average does not mean every customer\'s experience during a major system transition was smooth.',
        ],
      },
      {
        heading: 'Is YouFibre Worth It?',
        paragraphs: [
          'YouFibre\'s real advantages are genuine: no scheduled mid-contract price rise, symmetrical speeds on every tier, a current-generation Wi-Fi 7 router included free, and a strong underlying Trustpilot record. For an address within its expanding Netomnia footprint, it is a genuinely competitive alternative to the Openreach-based majority of the market.',
          'The coverage footprint is still a real limitation at around 10% of UK premises, the Brsk migration caused genuine short-term problems for some customers, and its parent group\'s pending acquisition into the Virgin Media O2 orbit is a real, ongoing story rather than settled fact.',
          'Our take: YouFibre suits a household within its coverage area that specifically values fixed pricing for the full contract term and symmetrical speeds, and is comfortable with a still-growing altnet whose ownership structure is currently in flux pending regulatory approval.',
        ],
      },
    ],
    faqItems: [
      {
        question: 'Is YouFibre any good?',
        answer: 'YouFibre has a strong Trustpilot score, around 4.6 out of 5, and a genuine pricing advantage: no scheduled mid-contract price rise on any package, unlike BT, Sky, EE and Vodafone. Its main limitation is coverage, at around 10% of UK premises, and the March 2026 Brsk migration caused real, documented billing and login problems for some former Brsk customers.',
      },
      {
        question: 'Is YouFibre being taken over by Virgin Media O2?',
        answer: 'Its parent company, Substantial Group, is being acquired by nexfibre, a joint venture between InfraVia, Liberty Global and Telefónica, which plans to then sell the YouFibre and Brsk retail brands to Virgin Media O2. The deal was announced in February 2026 but has not completed; the CMA referred it for an in-depth Phase 2 investigation on 1 July 2026, with completion not expected before around the third quarter of 2026.',
      },
      {
        question: 'What happened when Brsk merged into YouFibre?',
        answer: 'Migration of former Brsk customers to YouFibre began on 16 March 2026. Despite a "no immediate changes" pledge, some customers reported real billing errors, including bills notably higher than expected, difficulty logging into their new YouFibre account, reported speed drops during the switchover, and an overwhelmed customer support chat.',
      },
      {
        question: 'Does YouFibre raise its prices during the contract?',
        answer: 'No. YouFibre\'s monthly price stays fixed for the full contract term on both its 24-month and rolling monthly options, with no scheduled mid-contract increase of the kind most national providers now apply.',
      },
    ],
    reviewedDate: '2026-08-24',
    pricingVerifiedDate: '2026-08-24',
    reviewSources: [
      {
        label: 'Uswitch: YouFibre broadband packages and pricing',
        href: 'https://www.uswitch.com/broadband/providers/youfibre/',
        note: 'Used for the current package lineup, 24-month and rolling monthly pricing, checked 2026-08-24.',
      },
      {
        label: 'Virgin Media O2: InfraVia, Liberty Global and Telefónica acquire Substantial Group',
        href: 'https://news.virginmediao2.co.uk/infravia-liberty-global-and-telefonica-acquire-substantial-group-for-2-billion-through-their-existing-joint-venture-nexfibre/',
        note: 'Primary source for the £2bn nexfibre acquisition of Substantial Group and the planned £150m resale of YouFibre/Brsk to Virgin Media O2.',
      },
      {
        label: 'thinkbroadband: nexfibre/Netomnia submission to competition investigation into merger',
        href: 'https://www.thinkbroadband.com/news/nexfibre-netomnia-submission-to-competition-investigation-into-merger',
        note: 'Source for the CMA\'s Phase 2 investigation referral and the deal\'s incomplete regulatory status as of August 2026.',
      },
      {
        label: 'ISPreview: Broadband ISP migrations from Brsk to YouFibre trigger UK billing errors',
        href: 'https://www.ispreview.co.uk/index.php/2026/03/broadband-isp-migrations-from-brsk-to-youfibre-trigger-uk-billing-errors.html',
        note: 'Primary source for the specific, documented billing and account-access problems during the March 2026 Brsk migration.',
      },
      {
        label: 'YouFibre public Trustpilot profile',
        href: 'https://uk.trustpilot.com/review/youfibre.com',
        note: 'Customer-sentiment reference showing a rating around 4.6 out of 5 from more than 30,000 reviews in August 2026; not treated as a controlled reliability survey.',
      },
      {
        label: 'BroadbandPicker review methodology',
        href: '/how-we-review-broadband',
        note: 'Explains how price, speed, coverage, customer experience and use-case fit are weighed.',
      },
    ],
    awinProgramId: null,
  },
  {
    slug: 'gigaclear',
    name: 'Gigaclear',
    logo: '/logos/gigaclear.svg',
    affiliateUrl: 'https://www.gigaclear.com/',
    speeds: [
      { download: 300, upload: 300, type: 'FTTP' },
      { download: 600, upload: 600, type: 'FTTP' },
      { download: 900, upload: 900, type: 'FTTP' },
    ],
    monthlyPriceFrom: 19.00,
    contractLengths: [18],
    setupFee: 0,
    trustpilotScore: 4.8,
    coveragePercent: 2,
    highlights: [
      'Full fibre built for selected rural communities across more than 26 English counties',
      'Symmetrical average download and upload speeds from 300 Mbps to 900 Mbps',
      'Current new-customer range includes an eero WiFi 7 router and free expert setup',
    ],
    pros: [
      'Very competitive introductory prices for symmetrical full fibre',
      'Upload speeds match downloads, useful for cloud work and large file transfers',
      'Own-network rural focus can reach places underserved by national fibre networks',
      'WiFi 7 router, free standard installation and £0 activation on the checked range',
    ],
    cons: [
      'Highly postcode-specific footprint rather than nationwide availability',
      'Current terms allow prices to change during the minimum term',
      'Standard list prices after the 18-month promotion are substantially higher',
      'A separate fibre installation and wayleave may be required at some properties',
    ],
    excerpt:
      'Gigaclear is a rural full-fibre provider with its own network in selected parts of England. Its checked August 2026 range offers symmetrical 300, 600 and 900 Mbps packages from £19 a month for new customers, with an eero WiFi 7 router, £0 activation and an 18-month minimum term. The value can be excellent where available, but postcode eligibility, possible in-contract changes and the post-promotion list price all need checking before you order.',
    contentSections: [
      {
        heading: 'Gigaclear Broadband Deals in August 2026',
        paragraphs: [
          'Gigaclear advertised three core residential packages when checked on 22 August 2026. Ultrafast 300 cost £19 a month and included a £30 gift card, Ultrafast 600 cost £24 with a £40 gift card, and Hyperfast 900 cost £29 with a £100 gift card. Each used an 18-month minimum term, £0 activation and free standard installation. The promotion was marked to end on 26 August, so these figures are a dated snapshot rather than a promise for every visitor.',
          'All three packages advertise the same average upload and download speed. Gigaclear states minimum downloads of 240 Mbps on the 300 plan, 480 Mbps on the 600 plan and 700 Mbps on the 900 plan. The 300 and 600 tiers include an eero 7 router, while the 900 tier includes an eero Pro 7 and Smart WiFi mesh. Eero Secure was included at no extra cost at the time of review, although the provider reserves the right to introduce a future subscription charge.',
          'Do not compare the monthly payment alone. Verify the gift-card claim process, the exact price-change wording and the amount due after month 18. Gigaclear showed current standard list prices of £51, £63 and £88 a month for the respective tiers after the minimum term. Put a diary reminder before the promotion ends and ask for the renewal or cancellation options while there is still time to act.',
        ],
      },
      {
        heading: 'Gigaclear Coverage: Where Is It Available?',
        paragraphs: [
          'Gigaclear builds and operates an independent fibre-to-the-premises network rather than reselling Openreach. Its focus is hard-to-reach rural England, with current build activity across more than 26 counties. Established areas include parts of Oxfordshire, Gloucestershire, Herefordshire, Berkshire, Wiltshire, Northamptonshire and Essex, alongside expansion in the South West, Midlands and parts of Yorkshire.',
          'Independent August 2026 research estimates that the network passes around 600,000 premises. That is only a small share of UK homes and should not be converted into a confident national coverage percentage for an individual address. Availability can differ between neighbouring properties because a village may be planned, under construction, ready for pre-order or fully live. Use the complete postcode and select the exact property on Gigaclear’s checker.',
          'If the checker says the network is coming soon, keep the existing broadband until the new line is installed, activated and tested. Rural builds can require new ducting, access across private land or permission from a landlord, freeholder or managing agent. Ask where the optical network terminal and router will be fitted, whether external digging is required and whether any Gigabit Broadband Voucher consent applies.',
        ],
      },
      {
        heading: 'Gigaclear Speeds and Symmetrical Full Fibre',
        paragraphs: [
          'Gigaclear runs fibre all the way into the property, avoiding the copper final section used by part-fibre FTTC. Its main distinction is symmetrical speed: the 300 Mbps package advertises 300 Mbps upload as well as download, and the same principle applies at 600 and 900 Mbps. Fast uploads help with cloud backups, remote creative work, security-camera footage and households running several video calls at once.',
          'A 300 Mbps package is enough for most families, including simultaneous 4K streaming, gaming and home working. The 600 Mbps plan shortens very large transfers and gives more headroom to busy homes. The 900 Mbps tier is most useful where several heavy users or wired devices can exploit it. Paying for 900 Mbps will not make a phone with weak Wi-Fi, a slow server or a one-gigabit Ethernet bottleneck perform beyond its own limit.',
          'Advertised line speed is measured to the router under the relevant broadband-code methodology, not guaranteed over Wi-Fi in every room. Test a capable computer by Ethernet when checking the incoming service, then measure wireless performance where people work or stream. Record the personalised minimum guaranteed speed supplied before checkout because it is more useful for a complaint than a national headline.',
        ],
      },
      {
        heading: 'Eero WiFi 7 Router, Smart WiFi and the Guarantee',
        paragraphs: [
          'New customers receive an eero 7 router on packages up to and including 600 Mbps. The 900 Mbps package currently includes an eero Pro 7 with a Smart WiFi mesh node. Eero hardware is mesh-ready, so additional nodes can share one network name and extend coverage through a larger property. Gigaclear also includes expert setup, which can help place the router and supplied nodes away from thick walls and interference.',
          'Gigaclear’s May 2026 Smart WiFi terms describe a 30 Mbps guarantee in every main room when the selected tier suits the property. The main-router tier is intended for homes up to 1,000 square feet, Smart WiFi with one extra node up to 1,500 square feet, Plus with two nodes up to 2,500 square feet and Max with three up to 3,500 square feet. Basements, outbuildings, external garages and some unusual construction are excluded.',
          'The extra nodes remain Gigaclear’s property and must be returned when the relevant service ends. The eero app and an account are needed for full setup and management features. Confirm how many nodes are included, whether Smart WiFi restarts the minimum term, the return deadline and what remedy applies if the guarantee is not met. Wired Ethernet backhaul can improve stability where thick rural-property walls weaken wireless links.',
        ],
      },
      {
        heading: 'Contract, Price Rises and the Real 18-Month Cost',
        paragraphs: [
          'The checked Gigaclear offers use an 18-month minimum term. At £19, £24 and £29 with no change, the headline payments would total £342, £432 and £522 before gift cards or optional services. Those calculations are illustrations only because Gigaclear says prices may change during the contract. Read the contract summary for any pound-and-pence increase and the notice or cancellation rights that apply to the order.',
          'The largest cost risk is the jump to the standard list price after the promotional term. At the checked rates, the 300 Mbps plan moves from £19 to a currently stated £51, 600 Mbps from £24 to £63 and 900 Mbps from £29 to £88 if no new agreement is made. Those future list prices can change, so the contract summary and renewal notice remain authoritative.',
          'Optional Home Phone starts at £6 a month for evening and weekend calls on the current page. Extra Smart WiFi is described as £6 a month where it is not bundled. Add these, any installation exception, scheduled broadband change and the post-term months you expect to keep the service. A gift card should reduce effective cost only after you understand its eligibility, delivery and claim conditions.',
        ],
      },
      {
        heading: 'Installation and Switching to Gigaclear',
        paragraphs: [
          'Gigaclear may need to install a completely separate fibre line because its network is independent of Openreach, Virgin Media and other altnets. An engineer normally brings the fibre from the property boundary to an optical network terminal inside, then connects and positions the eero router. Agree the route and entry point before drilling, particularly in a listed, rented or recently decorated property.',
          'One Touch Switch can coordinate the change from another fixed provider, but do not assume that it removes the physical installation risk. Keep the old service active until Gigaclear confirms the activation plan. If the current contract has time remaining, the checked offer advertises free Gigaclear service for up to 12 months while customers wait, subject to separate terms and a stated maximum value. Confirm eligibility and evidence requirements before relying on it.',
          'After activation, test Ethernet speed, Wi-Fi coverage and home-phone calling if ordered. Keep photographs of external work and the optical terminal, save the order confirmation and return any old provider equipment using tracked postage. If a delay occurs, record every promised date and ask whether automatic compensation or another published installation remedy applies.',
        ],
      },
      {
        heading: 'Customer Service, Reviews and Complaints',
        paragraphs: [
          'Gigaclear’s public Trustpilot profile contained about 40,600 reviews when checked, with 79% rated five stars and 8% one star. The overall profile was strongly positive, but individual reports included both efficient support and complaints about installation, exit fees or billing. Open-review scores can be influenced by invitation practices and do not measure network uptime, so use them as one sentiment signal rather than a service guarantee.',
          'Ofcom’s provider complaint tables do not always include smaller networks in the same comparable published group as the largest national suppliers. That absence is not proof of zero complaints. Gigaclear publishes a complaints code, and unresolved eligible cases can progress to its named alternative dispute resolution scheme after the required deadlock or waiting period. Keep dates, reference numbers and copies of bills.',
          'A separate Ofcom investigation closed in July 2025 after findings about inaccurate or missing caller-location information for Gigaclear VoIP emergency calls between 2022 and March 2024. This historic issue should not be presented as evidence that current broadband data service is unreliable, but people taking Home Phone should keep their registered address current and understand how calls work during a power or broadband failure.',
        ],
      },
      {
        heading: 'Is Gigaclear Broadband Any Good?',
        paragraphs: [
          'Gigaclear is a strong option when it is live at the address and the household values symmetrical uploads, rural full fibre and low introductory pricing. The 300 Mbps tier is the sensible default for most homes. The 600 Mbps tier suits heavier concurrent use, while 900 Mbps is best reserved for households with a clear transfer workload and equipment able to use it.',
          'The trade-offs are limited coverage, possible installation complexity, price-change wording and a steep post-promotion list price. Compare the total 18-month cost and renewal risk with every other network at the same address. Check whether an Openreach, CityFibre or another independent fibre line would provide more provider choice if you later want to switch.',
          'Our verdict is conditional rather than universal. Choose Gigaclear if the exact address is ready, the installation route is acceptable and the written contract confirms a competitive total cost. Avoid ordering solely because the headline price or gift card looks attractive. Save the personalised summary, note the end date and plan a renewal check at least a month before the introductory term finishes.',
        ],
      },
    ],
    faqItems: [
      {
        question: 'Is Gigaclear broadband any good?',
        answer: 'Gigaclear can be excellent value in the rural areas it serves because its full-fibre plans offer matching upload and download speeds, current prices from £19 a month and WiFi 7 hardware. Its limitations are postcode-specific coverage, possible installation work, terms allowing price changes and much higher standard list prices after the 18-month promotion.',
      },
      {
        question: 'How much is Gigaclear broadband?',
        answer: 'On 22 August 2026, Gigaclear advertised 300 Mbps for £19 a month, 600 Mbps for £24 and 900 Mbps for £29 for new customers on 18-month terms. Activation and standard installation were free, with gift cards on all three tiers. The promotion was time-limited and the provider said prices could change, so verify your postcode quote and contract summary.',
      },
      {
        question: 'Where is Gigaclear broadband available?',
        answer: 'Gigaclear serves selected rural communities across more than 26 counties in England, including parts of Oxfordshire, Gloucestershire, Herefordshire, Berkshire, Wiltshire, Northamptonshire and Essex. Its network is not nationwide and availability can vary street by street. Enter the complete postcode and choose the exact property on the official checker.',
      },
      {
        question: 'Does Gigaclear use Openreach?',
        answer: 'No. Gigaclear builds and operates its own fibre-to-the-premises network. A switch may therefore need a separate fibre cable, optical network terminal and installation rather than reusing an Openreach line. Check permissions, the proposed cable route and the activation date before cancelling working broadband.',
      },
      {
        question: 'Are Gigaclear upload speeds the same as download speeds?',
        answer: 'Yes, the checked residential range advertised symmetrical average speeds: 300 Mbps down and up, 600 Mbps down and up, or 900 Mbps down and up. Actual Wi-Fi results depend on the device, property and node placement. Use Ethernet to test the incoming line and retain the personalised minimum-speed estimate.',
      },
      {
        question: 'What router does Gigaclear provide?',
        answer: 'Gigaclear currently includes an eero 7 WiFi 7 router on packages up to 600 Mbps. Its 900 Mbps package includes an eero Pro 7 and Smart WiFi mesh. Extra nodes remain Gigaclear property and the eero app is needed for full management. Confirm the included node count and return terms in the order summary.',
      },
      {
        question: 'Does Gigaclear increase prices?',
        answer: 'Gigaclear says current prices may change during the minimum term, so check the contract summary for the exact policy and cancellation rights. The price also reverts after the 18-month promotion to the standard list price then in force. At the August 2026 check, the stated list prices were £51, £63 and £88 for the 300, 600 and 900 Mbps tiers.',
      },
      {
        question: 'Can I get a Gigaclear deal through Awin?',
        answer: 'Gigaclear operates an Awin advertiser programme under ID 11269. A tracked affiliate link only works when a publisher is approved and uses its own valid Awin publisher ID. BroadbandPicker records eligible outbound clicks, but until an approved Awin tracking URL is configured the page sends visitors directly to Gigaclear rather than inventing an attribution link.',
      },
    ],
    reviewedDate: '2026-08-22',
    pricingVerifiedDate: '2026-08-22',
    reviewSources: [
      {
        label: 'Gigaclear residential broadband offers',
        href: 'https://www.gigaclear.com/',
        note: 'Primary source used for current package prices, speeds, gift cards, router inclusion, setup, minimum term and post-term list-price snapshot, checked on 2026-08-22.',
      },
      {
        label: 'Gigaclear full-fibre locations',
        href: 'https://www.gigaclear.com/locations',
        note: 'Primary source for the rural network focus, more than 26 English counties and build-stage explanation, checked on 2026-08-22.',
      },
      {
        label: 'Gigaclear Smart WiFi terms',
        href: 'https://www.gigaclear.com/legal/terms-and-conditions-for-residential-customers/smart-wifi-service-terms-and-conditions',
        note: 'Primary source for the 30 Mbps room guarantee, property-size tiers, exclusions and equipment ownership, checked on 2026-08-22.',
      },
      {
        label: 'Choose Gigaclear broadband comparison',
        href: 'https://www.choose.co.uk/broadband/gigaclear/',
        note: 'Independent corroboration for network footprint, provider structure, symmetrical speeds and contract considerations, checked on 2026-08-22.',
      },
      {
        label: 'Gigaclear public Trustpilot profile',
        href: 'https://uk.trustpilot.com/review/www.gigaclear.com',
        note: 'Customer-sentiment reference showing about 40,600 reviews and the displayed star distribution in August 2026; not treated as a controlled reliability survey.',
      },
      {
        label: 'Ofcom Gigaclear emergency-call investigation',
        href: 'https://www.ofcom.org.uk/phones-and-broadband/telecoms-infrastructure/investigation-into-gigaclear-limiteds-compliance-with-general-conditions-a3.5-and-a3.6a',
        note: 'Regulatory source used to describe the closed historic VoIP caller-location finding accurately and in context.',
      },
      {
        label: 'Awin Gigaclear advertiser programme',
        href: 'https://ui.awin.com/merchant-profile-terms/11269?setLocale=en_US',
        note: 'Used to verify Gigaclear advertiser programme ID 11269. A valid publisher-specific tracking link is not generated until approval and a publisher ID are available.',
      },
      {
        label: 'BroadbandPicker review methodology',
        href: '/how-we-review-broadband',
        note: 'Explains how price, speed, coverage, customer experience and use-case fit are weighed.',
      },
    ],
    awinProgramId: '11269',
  },
  {
    slug: 'zzoomm',
    name: 'Zzoomm',
    logo: '/logos/zzoomm.svg',
    affiliateUrl: 'https://www.awin1.com/cread.php?awinmid=40398&awinaffid=2942019&ued=https%3A%2F%2Fwww.zzoomm.com%2F',
    speeds: [
      { download: 200, upload: 200, type: 'FTTP' },
      { download: 500, upload: 500, type: 'FTTP' },
      { download: 1000, upload: 1000, type: 'FTTP' },
      { download: 2300, upload: 2300, type: 'FTTP' },
    ],
    monthlyPriceFrom: 20.00,
    contractLengths: [1, 12, 24],
    setupFee: 0,
    trustpilotScore: 4.7,
    coveragePercent: 2,
    highlights: [
      'Merged with FullFibre in February 2026, taking its own full-fibre network to around 600,000 premises across roughly 110 English market towns',
      'Every plan is symmetrical, from 200 Mbps up to 2,300 Mbps upload and download',
      'Published prices carry no scheduled mid-contract increase, unlike several national providers',
    ],
    pros: [
      'Symmetrical speeds across the whole range, useful for uploads and video calls',
      'No in-contract price rises on the current published range',
      'Free standard installation and a WiFi 6 router, upgraded to WiFi 7 from the 1,000 Mbps tier',
      'Targets smaller market towns that larger altnets often skip',
    ],
    cons: [
      'Coverage is limited to specific market towns rather than a national footprint',
      'Rolling monthly pricing costs considerably more than committing to 24 months',
      'A newly merged network can mean uneven local support while the two operations finish combining',
      'Home phone and mesh WiFi are separate paid add-ons, not included as standard',
    ],
    excerpt:
      'Zzoomm is a full-fibre altnet that merged with FullFibre in February 2026, taking its combined network to around 600,000 premises across roughly 110 English market towns. Every plan is symmetrical, running from 200 Mbps to 2,300 Mbps, priced from £20 a month on a 24-month term with no scheduled in-contract rise. Coverage is genuinely postcode-specific, so run its own checker before ruling a national provider out at your address.',
    contentSections: [
      {
        heading: 'Zzoomm Broadband Deals in August 2026',
        paragraphs: [
          'Zzoomm sells the same four symmetrical speeds under three different commitment lengths. The 24-month term is the cheapest way in: £20 a month for 200 Mbps, £23 for 500 Mbps, £25 for 1,000 Mbps and £35 for 2,300 Mbps, each rising to a higher standard rate after the first 12 months. The 12-month term skips that step-up but starts higher, at £24, £27, £29 and £39 respectively. FlexiMonth, its rolling monthly option, costs the most of the three, from £32 up to £70, in exchange for no fixed term at all.',
          'The gap between the 24-month and FlexiMonth prices on the entry tier is £12 a month, or roughly £288 over two years, which is a meaningful amount to pay for the freedom to leave whenever you like. Anyone reasonably confident they will stay at the same address for at least a year should default to the 24-month price and treat FlexiMonth as a genuine short-term option, not the default choice.',
          'None of these figures include the optional extras. A home phone line adds £10 a month, and each mesh WiFi extender adds a further £5 a month. Add both to a 1,000 Mbps 24-month plan and the real monthly cost is £40, not the £25 headline figure, so build any add-ons into the comparison before deciding Zzoomm is the cheaper option against a rival with phone or mesh bundled in.',
        ],
      },
      {
        heading: 'Zzoomm Coverage: Where Is It Available?',
        paragraphs: [
          'Zzoomm and FullFibre completed a brand and network integration in February 2026, combining two altnet build programmes into one operation covering roughly 600,000 premises ready for service across around 110 English market towns. That is a small slice of the roughly 28 million homes in the UK, so this is not a provider to check on a whim; it either reaches your street or it does not.',
          'The build has deliberately targeted smaller towns rather than city centres: places such as Crowthorne, Sandhurst, Crewe, Congleton, Nantwich, Northwich, Bakewell, Buxton, Matlock, Glossop, Northallerton, Hereford, Thirsk, Sherburn-in-Elmet and Ripon all have live or building coverage. A further eight towns, including Bewdley, Middlewich and Tadcaster, were confirmed for connection as part of a £44 million investment. That pattern matters if you live somewhere a national fibre rollout has been slow to reach.',
          'A town appearing on Zzoomm\'s coverage map does not guarantee every property in it can order today. Enter the full postcode and house number on Zzoomm\'s own checker rather than assuming coverage from the town name alone, and if the result says the build is still in progress, keep an existing connection running until the new one is installed and tested.',
        ],
      },
      {
        heading: 'Zzoomm Speeds and Symmetrical Full Fibre',
        paragraphs: [
          'Every Zzoomm plan is symmetrical: the upload speed matches the download speed at every tier, from 200 Mbps to 2,300 Mbps. Most national providers only offer this on their most expensive packages, if at all, so Zzoomm\'s entry-level 200 Mbps plan already gives more upload capacity than many rivals\' mid-range tiers.',
          'The practical difference shows up in specific tasks: backing up photos and video to the cloud, sending large design or work files, running a home security camera system, or hosting video calls where several people in the house are on camera at once. A household that mainly streams and browses will not notice much difference between 200 Mbps and 2,300 Mbps; a household that regularly uploads large files will feel the difference immediately.',
          'As with any fibre line, the figure quoted is the speed reaching the router, not necessarily the speed reaching a phone or laptop over WiFi. Distance from the router, walls and interference from other households still apply. Test performance over an Ethernet cable first when checking whether the line itself is delivering what was ordered, then test WiFi separately in the rooms that matter.',
        ],
      },
      {
        heading: 'Router, WiFi and Optional Extras',
        paragraphs: [
          'Zzoomm includes a WiFi 6 router on the 200, 500 and 1,000 Mbps plans, upgrading to WiFi 7 hardware on the top 2,300 Mbps tier and standard on the 1,000 Mbps plan. WiFi 6 already comfortably supports a household with several simultaneous streaming devices, games consoles and smart-home gadgets; WiFi 7 mainly benefits homes with new, compatible devices that can actually make use of the extra headroom.',
          'Homes with awkward layouts, thick walls or more than two floors may still find a single router does not reach every room, whatever the standard it supports. Zzoomm sells mesh WiFi extenders as an optional add-on at £5 a month per unit, which is a reasonable price if a specific room is genuinely dead, but not worth adding automatically before confirming there is an actual coverage problem.',
          'A home phone line is also optional, at £10 a month, rather than bundled in. Anyone who still relies on a landline number, rather than a mobile, should factor this into the total monthly cost from the outset instead of discovering it as a separate charge after signing up.',
        ],
      },
      {
        heading: 'Contract Length and the No-Price-Rise Policy',
        paragraphs: [
          'Zzoomm\'s published range currently carries no scheduled mid-contract price increase. That is a genuine point of difference: since Ofcom banned inflation-linked, percentage-based rise terms from all new contracts in January 2025, most national providers, including BT, EE, Vodafone, Plusnet and TalkTalk, now apply a disclosed flat rise of around £3 to £4 a month instead. Zzoomm charges no scheduled rise at all, rather than a smaller flat one, which is easier to budget around and worth weighing against a slightly cheaper headline price elsewhere that comes with a scheduled rise.',
          'The trade-off for the 24-month term\'s lower headline price is a step up after 12 months, from the intro rate to Zzoomm\'s standard rate for that speed. That step is disclosed upfront in the price table, not hidden in the terms, so it should never come as a surprise if the contract summary is read before signing.',
          'FlexiMonth removes both the step-up and the fixed term, at the cost of a meaningfully higher starting price. It suits genuinely short stays, such as a fixed-length tenancy, more than it suits anyone planning to stay put, where the 24-month term is almost always the better value once the full two years are compared side by side.',
        ],
      },
      {
        heading: 'Installation and Switching to Zzoomm',
        paragraphs: [
          'Standard installation is included at no cost across the range, which removes one of the more variable charges seen with other full-fibre altnets. Because Zzoomm operates its own network rather than reselling Openreach, installation involves connecting the property to Zzoomm\'s own fibre, which can mean a visible external box and, in some builds, a short wait for a scheduled engineer visit rather than a same-day activation.',
          'If switching from an existing broadband provider, check whether the move qualifies for Ofcom\'s One Touch Switch process. Because Zzoomm runs its own physical network rather than the shared Openreach one that most One Touch Switch moves rely on, a switch to Zzoomm often means running two connections briefly rather than a same-day, no-gap handover, so keep the old service active until the new line is confirmed working.',
          'Anyone renting should also check landlord permission and wayleave requirements early. A new full-fibre connection into a flat or a rented house can need consent for external cabling or a new duct, and that conversation is faster to have before the installation date is booked than after.',
        ],
      },
      {
        heading: 'Zzoomm Customer Service and Reviews',
        paragraphs: [
          'Zzoomm\'s Trustpilot profile showed roughly 8,600 reviews at the point of this check, with around 89% rated five stars and about 6% rated one star, a distribution that works out to approximately 4.7 out of 5. Different tracking sites have shown slightly different exact figures depending on when they were captured, which is normal for a fast-growing review count, so treat 4.7 as a close approximation rather than an exact live number and check the current Trustpilot page directly before relying on it.',
          'Recent reviews describe engineers and support staff by name more often than is typical for a national provider, which is consistent with a smaller, still-growing customer base rather than proof of a permanently different service level once the FullFibre integration and the expanded coverage area are fully bedded in.',
          'A small number of reviews mention connection delays and installation scheduling, which is a common pattern for any provider still building out new-build fibre infrastructure into towns rather than reselling an already-complete network. Ask for a specific installation date in writing rather than a general window if timing matters to you.',
        ],
      },
      {
        heading: 'Is Zzoomm Broadband Any Good?',
        paragraphs: [
          'Zzoomm earns its place on a shortlist wherever it actually reaches: symmetrical speeds at every tier, no scheduled mid-contract price rise on the 24-month term, and free standard installation are a genuinely strong combination, especially for a market town that a national full-fibre rollout has been slow to reach.',
          'It is not the right pick for someone who values a bundled home phone and mesh WiFi over a lower headline price, or for anyone whose address falls just outside one of its roughly 110 covered towns; there is no partial or estimated service where the network has not been built.',
          'Our starting recommendation is the 24-month term over FlexiMonth for anyone settled at the address, because the price gap is large enough to matter over two years and the no-scheduled-rise policy removes the usual mid-contract guessing game. Run the postcode checker first: this is a provider that either serves a specific street well or does not serve it at all.',
        ],
      },
    ],
    faqItems: [
      {
        question: 'Is Zzoomm broadband any good?',
        answer: 'Where it is available, Zzoomm offers symmetrical full-fibre speeds from 200 Mbps to 2,300 Mbps, free standard installation and a published range with no scheduled mid-contract price rise on the 24-month term. Its Trustpilot rating sits at approximately 4.7 out of 5 from around 8,600 reviews. Coverage is limited to roughly 110 English market towns, so availability depends entirely on the exact address.',
      },
      {
        question: 'Where is Zzoomm broadband available?',
        answer: 'Zzoomm covers around 600,000 premises across roughly 110 English market towns following its February 2026 merger with FullFibre, including areas of Berkshire, Cheshire, Derbyshire and Yorkshire. Coverage is postcode-specific rather than nationwide, so check the exact address on Zzoomm\'s own checker rather than assuming coverage from the town name alone.',
      },
      {
        question: 'Does Zzoomm increase its prices mid-contract?',
        answer: 'Zzoomm\'s current published range carries no scheduled mid-contract price increase, unlike most national providers, which now apply a flat rise of around £3 to £4 a month under Ofcom\'s rules on disclosed pounds-and-pence increases. The 24-month term does step up from its introductory rate to a higher standard rate after the first 12 months, but that step is disclosed in the price table rather than added later.',
      },
      {
        question: 'What speed do I need from Zzoomm?',
        answer: 'The entry-level 200 Mbps symmetrical plan comfortably supports a household that streams, browses and makes video calls, with upload speed to match. Households that regularly upload large files, back up to the cloud, or run several simultaneous video calls get more practical benefit from the 500 Mbps or 1,000 Mbps tiers than from the top 2,300 Mbps plan, which mainly suits specialist or heavy multi-user setups.',
      },
    ],
    reviewedDate: '2026-08-23',
    pricingVerifiedDate: '2026-08-23',
    reviewSources: [
      {
        label: 'Zzoomm broadband packages and pricing',
        href: 'https://www.zzoomm.com/',
        note: 'Used for package lineup, pricing across FlexiMonth, 12-month and 24-month terms, router specification and add-on pricing, checked 2026-08-23.',
      },
      {
        label: 'Choose Zzoomm broadband comparison',
        href: 'https://www.choose.co.uk/broadband/zzoomm/',
        note: 'Independent corroboration for coverage scale, the no in-contract price rise policy, and add-on pricing, checked 2026-08-23.',
      },
      {
        label: 'Zzoomm and FullFibre integration announcement',
        href: 'https://www.ispreview.co.uk/index.php/2026/02/fullfibre-and-zzoomm-complete-broadband-altnet-uk-isp-brand-integration.html',
        note: 'Primary source for the February 2026 merger and the combined network scale.',
      },
      {
        label: 'Zzoomm public Trustpilot profile',
        href: 'https://uk.trustpilot.com/review/zzoomm.com',
        note: 'Customer-sentiment reference showing approximately 8,600 reviews and a star distribution implying around 4.7 out of 5 in August 2026; not treated as a controlled reliability survey.',
      },
      {
        label: 'Awin Zzoomm advertiser programme',
        href: 'https://ui.awin.com/merchant-profile-terms/40398?setLocale=en_US',
        note: 'BroadbandPicker holds an approved (joined) relationship with this programme; the affiliate link above is a live publisher-specific Awin tracking link, verified 2026-08-23.',
      },
      {
        label: 'BroadbandPicker review methodology',
        href: '/how-we-review-broadband',
        note: 'Explains how price, speed, coverage, customer experience and use-case fit are weighed.',
      },
    ],
    awinProgramId: '40398',
  },
  {
    slug: 'highland-broadband',
    name: 'Highland Broadband',
    logo: '/logos/highland-broadband.svg',
    affiliateUrl: 'https://www.awin1.com/cread.php?awinmid=99387&awinaffid=2942019&ued=https%3A%2F%2Fhighlandbroadband.com%2F',
    speeds: [
      { download: 150, upload: 150, type: 'FTTP' },
      { download: 500, upload: 500, type: 'FTTP' },
      { download: 1000, upload: 1000, type: 'FTTP' },
      { download: 5000, upload: 5000, type: 'FTTP' },
    ],
    monthlyPriceFrom: 29.99,
    contractLengths: [24],
    setupFee: 0,
    trustpilotScore: 4.7,
    coveragePercent: 1,
    highlights: [
      'Building its own full-fibre network across rural Scotland, backed by a £50 million investment confirmed in August 2025',
      'Every plan is symmetrical, from 150 Mbps up to 5,000 Mbps upload and download',
      'A means-tested social tariff is available at £23.99 a month, separate from the standard range',
    ],
    pros: [
      'Free premium installation, worth £50, included on every plan',
      'Symmetrical speeds across the whole range, including the entry tier',
      'Advanced cyber security and parental controls included free on the two fastest plans',
      'A genuine social tariff for households on means-tested benefits',
    ],
    cons: [
      'Only a 24-month contract is offered, with no rolling monthly or 12-month option',
      'Prices are scheduled to rise by £4 every April from 2027 onward',
      'Coverage remains limited and is concentrated in specific parts of Scotland',
      'Easily confused by name with Highland Community Broadband, an unrelated wireless ISP that is closing in April 2026',
    ],
    excerpt:
      'Highland Broadband is a full-fibre altnet building its own network across rural Scotland, backed by £50 million in funding confirmed in August 2025. Symmetrical plans run from 150 Mbps to 5,000 Mbps, priced from £29.99 a month on a 24-month contract, with a genuine social tariff for households on means-tested benefits. It is not the same company as Highland Community Broadband, a separate wireless ISP that is closing in April 2026, so check the address carefully before assuming either one applies.',
    contentSections: [
      {
        heading: 'Highland Broadband Deals in August 2026',
        paragraphs: [
          'Highland Broadband sells four symmetrical speeds, all on a 24-month contract. Essential 150 starts at £29.99 a month, rising to £39.99 after the introductory period. Everyday 500 starts at £34.99, rising to £54.99. Family 1000 and Ultimate 5000 are both running an August 2026 offer at £34.99 and £49.99 respectively, against standard prices of £79.99 and £99.99, which is a considerably steeper jump once the offer period ends than on the two entry tiers.',
          'Family 1000 and Ultimate 5000 both include Advanced Cyber Security and Dynamic Parental Controls at no extra cost, and Ultimate 5000 adds a Whole Home WiFi Guarantee, promising a minimum of 30 Mbps in every room, a feature Highland Broadband separately prices at £10 a month when bought as an add-on to the two cheaper plans.',
          'A means-tested social tariff, Essential 100 at £23.99 a month, sits outside the main range for households receiving qualifying benefits. It is worth checking eligibility directly with Highland Broadband, since social tariffs are commonly under-claimed simply because customers do not know to ask.',
        ],
      },
      {
        heading: 'Highland Broadband Coverage: Where Is It Available?',
        paragraphs: [
          'Highland Broadband is building its own fibre-to-the-premises network across rural Scotland, with build areas including Argyll, Fife, the Highlands, the Lothians, Moray and Stirlingshire, backed by £50 million in funding confirmed in August 2025, made up of £40 million from Alpha Real Capital and £10 million from the Scottish National Investment Bank. The company has stated an ambition to extend full-fibre availability to more than 150 towns and villages, with a target of covering the whole Highlands region by the end of 2026.',
          'Reporting from August 2025 put the network at roughly half of rural premises across the Highlands connected, with more than 100,000 further premises targeted through the new funding. Those are company-stated targets, not guaranteed dates, so a town appearing on a rollout announcement is not proof that a specific street is ready to order today.',
          'One name-based mix-up is worth flagging directly: Highland Broadband is a different company from Highland Community Broadband, a wireless ISP unrelated in ownership that is closing in April 2026. Searching for either name can surface results about the other, so check the domain (highlandbroadband.com) and confirm the technology (full fibre, not fixed wireless) before assuming a review or a coverage claim applies to this Highland Broadband.',
        ],
      },
      {
        heading: 'Highland Broadband Speeds and Symmetrical Full Fibre',
        paragraphs: [
          'Every tier is symmetrical, meaning upload matches download at 150, 500, 1,000 and 5,000 Mbps. That is a genuine advantage over a part-fibre or cable connection, where upload speed is typically a fraction of the download figure regardless of which package is bought.',
          'The 150 Mbps entry tier already covers everyday streaming, browsing, video calls and several devices in use at once, with more upload headroom than most rivals offer at a comparable price. The 5,000 Mbps top tier is a specialist choice: outside a small-business or heavy-multi-user setup, few home devices can actually make use of speeds above roughly 1,000 Mbps on a single connection.',
          'As with any fibre service, the quoted figure describes what reaches the router. WiFi performance in a specific room depends on distance, walls and interference, which is exactly what the Whole Home WiFi Guarantee on Ultimate 5000 is designed to address, rather than a general claim about the line speed itself.',
        ],
      },
      {
        heading: 'Router, Security Features and the Whole Home WiFi Guarantee',
        paragraphs: [
          'A WiFi 6 router is included as standard, upgrading to WiFi 7 on the Ultimate 5000 tier. Family 1000 and Ultimate 5000 customers also get Advanced Cyber Security and Dynamic Parental Controls included at no extra cost, a feature many providers charge separately for or omit entirely.',
          'Ultimate 5000\'s Whole Home WiFi Guarantee promises a minimum of 30 Mbps in every room of the property, backed by a stated £10 a month value if bought as a standalone add-on on the Essential or Everyday tiers. For a larger or multi-floor home where a single router struggles to reach every room, that guarantee is worth more in practice than the headline 5,000 Mbps download figure most households will never fully use.',
          'Anyone on the Essential or Everyday tiers with a genuine coverage problem in a specific room should weigh the £10 a month add-on cost against simply moving to Ultimate 5000, where the same guarantee, plus the faster line and free security features, comes as part of the plan rather than stacked on top of it.',
        ],
      },
      {
        heading: 'Contract Terms and the Scheduled April Price Rise',
        paragraphs: [
          'Highland Broadband only offers a 24-month contract; there is no rolling monthly or shorter fixed-term option published. That suits a household settled at the address but rules Highland Broadband out for a short-term tenancy or anyone who wants the flexibility to leave without an early-termination charge.',
          'Prices are scheduled to rise by £4 a month every April from 2027 onward, disclosed upfront rather than hidden in the terms. That is a real, ongoing cost to factor into any two-year comparison against a provider with a flat price for the full contract term, such as Zzoomm\'s current no-rise policy, and it is worth doing that full-term sum rather than comparing only the headline monthly price.',
          'New customers on a 24-month contract can also get up to 12 months of switching credit, intended to offset an early-termination charge from a previous provider. Read the exact terms and evidence requirements for that credit before relying on it to cover an existing exit fee.',
        ],
      },
      {
        heading: 'Installation and Switching to Highland Broadband',
        paragraphs: [
          'Premium installation is included free on every plan, a benefit Highland Broadband states is worth £50, alongside a 28-day cooling-off period for new customers who change their mind shortly after signing up.',
          'Because Highland Broadband runs its own physical network rather than reselling Openreach\'s, a switch typically means a new fibre connection being installed rather than a same-day handover on the existing line, so plan to keep an existing broadband service running until the new connection is confirmed working.',
          'Rural and rented properties should confirm wayleave and landlord permission for any external cabling or new ductwork before booking an installation date, particularly in areas where the network is newly built and installation teams may have a specific scheduling window rather than an on-demand slot.',
        ],
      },
      {
        heading: 'Highland Broadband Customer Service and Reviews',
        paragraphs: [
          'Highland Broadband\'s Trustpilot profile showed a rating implying roughly 4.7 out of 5 at the point of this check, based on a distribution of around 90% five-star and 5% one-star reviews across a review count that different tracking snapshots put between around 1,100 and 1,200. A separate snapshot recorded a 4.8 badge from a much smaller 100-review sample, which is consistent with normal short-term variation in a fast-growing review count rather than a contradiction, but it means the exact current figure is worth checking directly on Trustpilot rather than treated as fixed.',
          'Recent reviews focus heavily on installation, with customers describing engineers by name and praising the professionalism of the install process specifically, which is a reasonable proxy for service quality this early in a company\'s growth but says less about long-term fault handling or renewal pricing, since most reviewers have not yet reached that stage of the relationship.',
          'Given the company only offers 24-month contracts, the renewal and price-rise experience two years in matters more than usual here. That evidence will only become available as the earliest customer cohorts reach their renewal date, so treat today\'s largely installation-focused reviews as a partial picture.',
        ],
      },
      {
        heading: 'Is Highland Broadband Any Good?',
        paragraphs: [
          'Highland Broadband is a strong option specifically for households in its rural Scottish build areas who have struggled to get a genuine full-fibre alternative to Openreach. Free installation, symmetrical speeds at every tier, included security features on the higher plans and a real social tariff are all substantive, not marketing-only, benefits.',
          'It suits a household planning to stay at the address for the full 24 months more than one that wants flexibility, since there is no shorter or rolling contract option, and the scheduled April price rise needs to be included in any full-term cost comparison rather than judged on the headline monthly figure alone.',
          'Confirm the domain and the technology before comparing reviews or coverage claims: Highland Broadband (highlandbroadband.com, full fibre) and Highland Community Broadband (a closing wireless ISP) are separate companies that happen to share part of a name, and mixing them up is an easy, genuinely common mistake when researching this provider.',
        ],
      },
    ],
    faqItems: [
      {
        question: 'Is Highland Broadband the same as Highland Community Broadband?',
        answer: 'No. Highland Broadband (highlandbroadband.com) is a full-fibre altnet building its own FTTP network across rural Scotland. Highland Community Broadband is a separate, unrelated wireless ISP that is closing in April 2026. The similar names are easy to confuse, so check the domain and the underlying technology before relying on a review or coverage claim.',
      },
      {
        question: 'Where is Highland Broadband available?',
        answer: 'Highland Broadband is building full-fibre coverage across Argyll, Fife, the Highlands, the Lothians, Moray and Stirlingshire, backed by £50 million in funding confirmed in August 2025. It has stated an ambition to reach more than 150 towns and villages, with a target of covering the whole Highlands region by the end of 2026, though this is a company-stated target rather than a guaranteed date for any specific street.',
      },
      {
        question: 'Does Highland Broadband increase its prices?',
        answer: 'Yes. Highland Broadband\'s published range includes a scheduled £4 a month price increase every April from 2027 onward, disclosed upfront in the price table. This should be included in any full 24-month cost comparison against a provider with a flat contract price.',
      },
      {
        question: 'Does Highland Broadband offer a social tariff?',
        answer: 'Yes, Essential 100 is available at £23.99 a month for households receiving qualifying means-tested benefits, separate from the standard four-tier range. Social tariffs are commonly under-claimed, so it is worth checking eligibility directly with Highland Broadband rather than assuming the standard price is the only option.',
      },
    ],
    reviewedDate: '2026-08-23',
    pricingVerifiedDate: '2026-08-23',
    reviewSources: [
      {
        label: 'Highland Broadband packages and pricing',
        href: 'https://highlandbroadband.com/broadband/packages-pricing/',
        note: 'Used for package lineup, intro and standard pricing, contract length, add-on pricing and the social tariff, checked 2026-08-23.',
      },
      {
        label: 'ISPreview: Highland Broadband secures £50m funding',
        href: 'https://www.ispreview.co.uk/index.php/2025/08/highland-broadband-secures-50m-funding-to-boost-expand-fttp-rollout.html',
        note: 'Primary source for the August 2025 funding round, investors and coverage ambition.',
      },
      {
        label: 'ISPreview: Highland Community Broadband closure notice',
        href: 'https://www.ispreview.co.uk/index.php/2026/01/wireless-isp-highland-community-broadband-set-to-close-in-april-2026.html',
        note: 'Used to confirm Highland Community Broadband is a separate, unrelated company, avoiding a name mix-up with Highland Broadband.',
      },
      {
        label: 'Highland Broadband public Trustpilot profile',
        href: 'https://uk.trustpilot.com/review/highlandbroadband.com',
        note: 'Customer-sentiment reference showing a star distribution implying approximately 4.7 out of 5 in August 2026; not treated as a controlled reliability survey.',
      },
      {
        label: 'Awin Highland Broadband advertiser programme',
        href: 'https://ui.awin.com/merchant-profile-terms/99387?setLocale=en_US',
        note: 'BroadbandPicker holds an approved (joined) relationship with this programme; the affiliate link above is a live publisher-specific Awin tracking link, verified 2026-08-23.',
      },
      {
        label: 'BroadbandPicker review methodology',
        href: '/how-we-review-broadband',
        note: 'Explains how price, speed, coverage, customer experience and use-case fit are weighed.',
      },
    ],
    awinProgramId: '99387',
  },
  {
    slug: 'cuckoo',
    name: 'Cuckoo',
    logo: '/logos/cuckoo.svg',
    affiliateUrl: 'https://cuckoo.co/',
    speeds: [
      { download: 11, upload: 1, type: 'ADSL' },
      { download: 17, upload: 1, type: 'FTTC' },
      { download: 38, upload: 9, type: 'FTTC' },
      { download: 45, upload: 9, type: 'FTTC' },
      { download: 67, upload: 18, type: 'FTTC' },
      { download: 62, upload: 18, type: 'FTTP' },
      { download: 100, upload: 18, type: 'FTTP' },
      { download: 200, upload: 30, type: 'FTTP' },
      { download: 500, upload: 70, type: 'FTTP' },
      { download: 945, upload: 101, type: 'FTTP' },
    ],
    monthlyPriceFrom: 29.95,
    contractLengths: [12, 18, 24],
    setupFee: 99,
    trustpilotScore: 4.6,
    coveragePercent: 94,
    highlights: [
      'Current Cuckoo services are operated by Onestream under the Cuckoo brand',
      'Published range includes part-fibre and full-fibre packages up to 945 Mbps',
      'Uses wholesale networks including Openreach, CityFibre and AllPoints Fibre depending on the address',
    ],
    pros: [
      'Broad mix of speeds for light-use homes through to gigabit households',
      'High public customer-review score at the August 2026 check',
      'One Touch Switch support for eligible provider changes',
      'Full fibre and part fibre can make the brand available beyond one network footprint',
    ],
    cons: [
      'Older Cuckoo reviews describe products and ownership that are no longer current',
      'Published standard activation and early-exit charges can be substantial',
      'No new digital voice or home phone service is offered',
      'Router, security and support add-ons can increase the headline cost',
    ],
    excerpt:
      'Cuckoo Broadband changed materially in May 2026. Onestream Limited now runs the brand and publishes a new range spanning SoGEA part fibre and FTTP full fibre, with standard prices from £29.95 and downloads up to 945 Mbps. The broader choice can suit many addresses, but shoppers should ignore obsolete C-150, C-500 and C-900 listings, check the exact contract summary and account for activation, router, add-on and early-exit charges.',
    contentSections: [
      {
        heading: 'What Happened to Cuckoo Broadband in 2026?',
        paragraphs: [
          'Cuckoo Fibre Limited transferred its broadband customer base and the Cuckoo brand to Onestream Limited on 28 May 2026. The current Cuckoo website states that the service is part of the Onestream family, while its legal price guide describes Onestream Limited trading as Cuckoo Broadband. Existing customers were told that their agreed package, speed, price and contract terms would continue unless specifically advised otherwise.',
          'This change matters when researching Cuckoo broadband deals. Older reviews often discuss the former C-150, C-500 and C-900 full-fibre plans, CityFibre-led availability, fixed-price promises or an eero Pro 6E router. Those details may still describe a legacy customer’s contract, but they do not establish what a new customer can order in August 2026. The current legal price guide and address-specific order summary take priority.',
          'The transfer also changed some account administration. Cuckoo’s update says account numbers may change, Direct Debits are collected on the last working day of the month and invoices are generated 14 days earlier. Existing customers should keep transfer notices and compare the first post-move bill with the previous contract. New customers should confirm that the order names Cuckoo and identifies Onestream as the service operator.',
        ],
      },
      {
        heading: 'Current Cuckoo Broadband Packages and Standard Prices',
        paragraphs: [
          'Cuckoo’s price guide dated 28 May 2026 lists five full-fibre packages. Supreme Full Fibre 80 has an average 62 Mbps download at £40.95 a month, Full Fibre 115 averages 100 Mbps at £45.95, Full Fibre 220 averages 200 Mbps at £49.95, Full Fibre 550 averages 500 Mbps at £54.95 and Hyperstream Full Fibre 1000 averages 945 Mbps at £59.95. These are published standard charges, not necessarily the promotional quote returned for every postcode.',
          'The same guide lists SoGEA services without a traditional phone line. Cuckoo 17 and Fibre 20 are both £29.95 with average downloads of 11 and 17 Mbps. Fibre 40 and Fibre 55 are £34.95 with 38 and up to 45 Mbps respectively, while Fibre 80 is £37.95 with up to 67 Mbps. SoGEA uses copper for the final connection and can slow with distance from the street cabinet.',
          'A postcode journey or comparison partner may show a lower promotional payment, waived activation or a different minimum period. Treat that as an address-specific offer and save its contract information. The legal guide describes 12, 18 and 24-month minimum terms as possible, while the main terms say the minimum is 12 months if the order does not state another period. Never assume an old rolling monthly Cuckoo deal is still offered.',
        ],
      },
      {
        heading: 'Cuckoo Coverage and the Networks It Uses',
        paragraphs: [
          'Cuckoo does not rely on a single national network. Its June 2026 terms name wholesale fibre providers including Openreach, CityFibre and AllPoints Fibre. The exact route can affect speed tiers, upload performance, installation and future switching choice. A national Cuckoo availability percentage therefore hides the most important fact: the complete address and network serving it.',
          'Part-fibre SoGEA can reach many homes on the Openreach copper footprint, while FTTP depends on whether a suitable wholesale full-fibre network is live at the property and available to the current Cuckoo ordering system. MoneySuperMarket’s August guide describes current full-fibre options from around 62 to 945 Mbps and part-fibre offers at some addresses. It also stresses that its comparison may not show every provider or direct deal.',
          'Enter the full postcode, select the exact flat or house and record the network or installation description before ordering. Adjacent properties can receive different results, particularly in new-build blocks or streets where fibre work is incomplete. If an engineer or wayleave is required, keep the old service until the new line is installed and tested. A marketing claim about nationwide service is not an address-level guarantee.',
        ],
      },
      {
        heading: 'Cuckoo Speeds, Uploads and Which Plan to Choose',
        paragraphs: [
          'The current range covers very different household needs. Eleven or 17 Mbps is restrictive for a busy home and can struggle with simultaneous streaming, downloads and video calls. Thirty-eight to 67 Mbps may suit one or two people with ordinary browsing, HD streaming and occasional home working. Full Fibre 80 or 115 gives a steadier fibre-to-the-premises connection without forcing a household to buy a very high speed.',
          'Two hundred Mbps is a practical middle tier for families using several streams, consoles and work devices. Five hundred Mbps reduces large game and system-download times, while 945 Mbps is intended for heavy concurrent use or people moving very large files. A gigabit package will not improve a slow website, weak Wi-Fi device or server bottleneck, and most individual devices will not sustain the full headline speed wirelessly.',
          'Do not assume the legacy symmetrical Cuckoo speeds apply to every new package. Upload speed varies by wholesale network and product. Openreach-based 100, 200, 500 and gigabit services normally upload much more slowly than they download, while some alternative fibre routes can be closer to symmetrical. Read the personalised download, upload and minimum guaranteed speeds before paying, then use Ethernet when testing the incoming service.',
        ],
      },
      {
        heading: 'Router, Wi-Fi, Static IP and Optional Add-ons',
        paragraphs: [
          'Cuckoo’s current price guide lists Standard, Superstream and Superstream+ routers, each with a published hardware value of £125. That list does not prove which router is included with one address-specific offer. Check the model, Wi-Fi standard, Ethernet ports, rental or ownership status and return rules in the order summary. Legacy references to an eero router may apply to older contracts rather than today’s Onestream-operated range.',
          'The price guide also lists a mesh unit at £49.95 and Wi-Fi extenders at £100. Wireless performance depends on walls, interference, router position and device capability, so choose mesh for a measured coverage problem rather than automatically adding it at checkout. Ask whether an extra device is bought outright, rented or must be returned, and whether any support or guarantee requires provider-supplied hardware.',
          'Optional services include a fixed IP address at £5 a month, Cuckoo Assured at £4.95, Assured Premium at £9.95, paid care levels, security software and NordVPN. Some security licences rise after the first year. Remove anything you do not need, record trial or renewal dates and check the first bill. A low promotional broadband payment can become poor value when several recurring extras are added.',
        ],
      },
      {
        heading: 'Contracts, Activation Fees and Early Termination',
        paragraphs: [
          'Cuckoo publishes standard activation fees of £99 for SoGEA and £149 for FTTP, although a promotion may reduce or waive them. The guide also lists £9.95 delivery, a £99 home-mover fee and charges up to £199 for a missed, rejected or late-cancelled engineer visit. Confirm the actual upfront payment in the contract summary rather than assuming the standard figure or an old free-installation offer applies.',
          'Early termination can be expensive. The monthly termination amount ranges from £11 to £25 depending on the package and is multiplied by the remaining months. If activation was free or discounted, the standard activation fee may be added, along with £125 for the router and £49.95 for a mesh unit in the circumstances described by the guide. The provider’s own example totals £292 for leaving Fibre 80 with four months remaining after activation and router amounts are added.',
          'The terms provide a 14-day cooling-off period from the day after order confirmation, subject to charges for service already installed or used and returning equipment. They also allow certain cost-driven or legal changes with notice and describe penalty-free cancellation for a notified detrimental increase in specific circumstances. Do not generalise this into a universal no-price-rise promise. Read the pound-and-pence schedule and exit rights supplied for your order.',
        ],
      },
      {
        heading: 'Switching, Installation and Home Phone',
        paragraphs: [
          'Cuckoo promotes One Touch Switch, under which the new provider normally contacts the old provider and coordinates the change. Its public journey illustrates contact today, confirmation around day ten and a target connection around day fourteen. That is an aim rather than a guaranteed activation date. A new FTTP installation, blocked duct or missed appointment can extend the process.',
          'If full fibre is not already installed, an engineer may need to route cable to an optical network terminal inside the property. Agree the entry point before drilling and secure landlord or freeholder consent where needed. Keep existing broadband active until the installation is complete, especially when changing between independent networks. Test the wired line and Wi-Fi coverage before returning old equipment.',
          'Cuckoo’s current price guide says it no longer offers digital voice or home phone services. Anyone who uses a landline number, telecare alarm, monitored security system or analogue device should arrange an alternative before switching. Do not assume the socket will keep working after a SoGEA or FTTP migration. Ask the equipment provider whether it supports broadband-based calling, mobile connectivity or battery backup.',
        ],
      },
      {
        heading: 'Customer Service, Reviews and Complaints After the Transfer',
        paragraphs: [
          'Cuckoo’s Trustpilot profile showed 4.6 out of 5 from just over 10,000 reviews on 22 August 2026. Eighty-one per cent were five-star and 10% one-star. Recent reviewers often praised individual advisers, while recurring criticism included waits, billing transparency, renewal prices and outage communication. Trustpilot is an open-review platform and one sentiment input, not a controlled network-reliability measure.',
          'Complaints from before and after the May transfer may follow different routes. Communications Ombudsman says Cuckoo Fibre Limited ceased trading after the customer and brand transfer. It may still consider certain legacy disputes for services not transferred, while transferred Onestream cases may fall under CISAS. Check the legal name on the bill, complain to the current provider first and retain a deadlock letter or evidence of the waiting period.',
          'The current Cuckoo complaints code says customers should contact support first, then make a formal complaint by email or post, with a target response within seven days. Keep dates, bills, speed evidence and reference numbers. If the problem concerns an Openreach, CityFibre or other wholesale fault, Cuckoo remains the retail contact and should manage the escalation rather than sending the customer directly to the network builder.',
        ],
      },
      {
        heading: 'Is Cuckoo Broadband Any Good in 2026?',
        paragraphs: [
          'Cuckoo can suit households that value a broad speed choice, a strong public review profile and access through more than one wholesale network. The 100 or 200 Mbps full-fibre tiers are sensible starting points for most homes if their promotional total cost is competitive. Faster tiers make sense for heavy use, while SoGEA remains a fallback where full fibre is unavailable.',
          'The main caution is that the brand proposition changed after the Onestream transfer. Old Cuckoo awards, routers, fixed-price claims and plan names are not reliable evidence for a new order. Published standard activation, ancillary and early-exit fees also require careful reading. Compare the total minimum-term cost, scheduled changes, setup, equipment and optional products against at least two alternatives at the same address.',
          'Our verdict is conditional. Cuckoo is worth considering when the personalised contract is simple, the network and upload speed suit the household and unnecessary extras have been removed. It is less attractive if the quote relies on costly add-ons, a high activation fee or unclear exit terms. Save every pre-contract document and review the first bill rather than choosing solely on brand reputation.',
        ],
      },
    ],
    faqItems: [
      {
        question: 'Is Cuckoo broadband any good?',
        answer: 'Cuckoo can be a good choice where its current Onestream-operated offer is competitively priced and the address can receive the right full-fibre speed. It has a 4.6 Trustpilot score from over 10,000 reviews, but published activation, add-on and early-exit fees need careful checking. Ignore obsolete legacy plan claims and rely on the personalised contract summary.',
      },
      {
        question: 'Who owns Cuckoo Broadband now?',
        answer: 'Onestream Limited acquired the Cuckoo customer base and brand on 28 May 2026 and now operates services under the Cuckoo name. Existing customers were told that agreed package, speed, price and contract terms would continue unless advised otherwise. Account numbers, billing dates and the legal provider handling support may have changed.',
      },
      {
        question: 'How much does Cuckoo broadband cost?',
        answer: 'Cuckoo’s May 2026 standard price guide lists SoGEA broadband from £29.95 a month and full fibre from £40.95, rising to £59.95 for the 945 Mbps package. Promotional postcode quotes can be lower and may reduce activation. Check the monthly schedule, minimum term, setup, router, extras and total contract cost before ordering.',
      },
      {
        question: 'What speeds does Cuckoo offer?',
        answer: 'The current published range covers 11, 17, 38, 45 and 67 Mbps SoGEA services plus full-fibre averages of 62, 100, 200, 500 and 945 Mbps. Availability and upload speed vary by address and wholesale network. Do not assume older symmetrical Cuckoo packages remain available to new customers.',
      },
      {
        question: 'What network does Cuckoo use?',
        answer: 'Cuckoo’s terms name wholesale networks including Openreach, CityFibre and AllPoints Fibre. The network serving the exact address affects availability, installation and upload performance. Enter the full postcode and read the order information rather than assuming every Cuckoo customer uses CityFibre or receives the same product.',
      },
      {
        question: 'Does Cuckoo offer a landline?',
        answer: 'No new digital voice or home phone service is listed in Cuckoo’s current price guide. People who rely on a telephone number, telecare alarm or analogue device should arrange a compatible alternative before moving to SoGEA or FTTP. Confirm battery-backup and emergency-call arrangements for any replacement service.',
      },
      {
        question: 'Does Cuckoo increase broadband prices?',
        answer: 'Do not rely on old fixed-price marketing. Current terms say the exact minimum-period charges and any changes are set out in the order documents, and allow some cost-driven changes with notice. They describe cancellation rights for certain detrimental changes. Check the contract summary for the precise pound-and-pence schedule applying to your order.',
      },
      {
        question: 'Can I get Cuckoo deals through Awin?',
        answer: 'Cuckoo has an Awin advertiser programme under ID 118743. A tracked sale requires an approved publisher account and that publisher’s valid Awin ID. BroadbandPicker records eligible outbound clicks, but uses the direct Cuckoo destination until a valid publisher-specific tracking link is configured rather than inventing attribution.',
      },
    ],
    reviewedDate: '2026-08-22',
    pricingVerifiedDate: '2026-08-22',
    reviewSources: [
      {
        label: 'Cuckoo residential broadband price guide',
        href: 'https://cuckoo.co/legal/price-list',
        note: 'Primary source for current plan names, standard prices, speeds, add-ons, activation, equipment and early-termination charges, checked on 2026-08-22.',
      },
      {
        label: 'Cuckoo residential terms',
        href: 'https://cuckoo.co/legal/terms-and-conditions',
        note: 'Primary source for wholesale networks, minimum period, cooling-off, price-change, installation and cancellation rules, checked on 2026-08-22.',
      },
      {
        label: 'Cuckoo Onestream update',
        href: 'https://cuckoo.co/onestream-update',
        note: 'Primary source for the service transfer, continuing contract position, account-number and billing-date changes.',
      },
      {
        label: 'MoneySuperMarket Cuckoo broadband guide',
        href: 'https://www.moneysupermarket.com/broadband/providers/cuckoo/',
        note: 'Independent corroboration for the August 2026 product range, address-level availability and comparison caveats.',
      },
      {
        label: 'Cuckoo public Trustpilot profile',
        href: 'https://uk.trustpilot.com/review/cuckoo.co',
        note: 'Customer-sentiment reference showing 4.6/5 from 10,022 reviews and the displayed distribution on 2026-08-22; not treated as a controlled reliability survey.',
      },
      {
        label: 'Communications Ombudsman Cuckoo transfer notice',
        href: 'https://www.commsombudsman.org/raise-dispute/cuckoo-broadband',
        note: 'Independent dispute-resolution source for the 28 May 2026 transfer and guidance on legacy versus transferred complaints.',
      },
      {
        label: 'Awin Cuckoo advertiser programme',
        href: 'https://ui.awin.com/merchant-profile-terms/118743/affiliate',
        note: 'Used to verify advertiser programme ID 118743. No publisher-specific tracking URL is generated without an approved publisher ID.',
      },
      {
        label: 'BroadbandPicker review methodology',
        href: '/how-we-review-broadband',
        note: 'Explains how price, speed, coverage, customer experience and use-case fit are weighed.',
      },
    ],
    awinProgramId: '118743',
  },
  {
    slug: 'onestream',
    name: 'Onestream',
    logo: '/logos/onestream.svg',
    affiliateUrl: 'https://onestream.co.uk/',
    speeds: [
      { download: 35, upload: 9, type: 'FTTC' },
      { download: 67, upload: 18, type: 'FTTC' },
      { download: 74, upload: 18, type: 'FTTP' },
      { download: 101, upload: 18, type: 'FTTP' },
      { download: 200, upload: 30, type: 'FTTP' },
      { download: 500, upload: 70, type: 'FTTP' },
      { download: 871, upload: 101, type: 'FTTP' },
    ],
    monthlyPriceFrom: 18.50,
    contractLengths: [12, 24],
    setupFee: 4.95,
    trustpilotScore: 4.3,
    coveragePercent: 94,
    highlights: [
      'Entry-level Onestream broadband advertised from £18.50 a month when checked',
      'Part-fibre and full-fibre packages, with advertised downloads up to 871 Mbps',
      'Unlimited downloads with no usage cap on the provider\'s current range',
    ],
    pros: [
      'Low introductory prices compared with many large Openreach providers',
      'Choice of 12-month and cheaper 24-month minimum terms',
      'Broad speed range from everyday part-fibre to gigabit-class full fibre',
      'Can use your own compatible router on supported packages',
    ],
    cons: [
      'The headline monthly price can rise by a stated fixed amount each April',
      'Setup charges differ between 12-month and 24-month deals',
      'Optional support and security extras can add to the total bill',
      'Router-return and early-termination charges require careful checking',
    ],
    excerpt:
      'Onestream broadband is a budget Openreach-based service with part-fibre and full-fibre plans. On 22 August 2026, its website advertised service from £18.50 a month and downloads up to 871 Mbps. Its strongest case is low introductory pricing, but compare the full contract cost, annual fixed price rises, setup fee, optional extras and equipment-return terms before ordering.',
    contentSections: [
      {
        heading: 'Onestream Broadband Deals and Contract Costs',
        paragraphs: [
          'Onestream advertised its entry package at £18.50 a month on 22 August 2026. The direct homepage described this as a 35 Mbps download and 9 Mbps upload service. Current comparison listings show that the cheapest 24-month packages generally carry a £4.95 upfront charge, while equivalent 12-month choices can have a higher monthly price and a £14.95 setup charge. The exact offer depends on the address entered and can change.',
          'Do not compare Onestream broadband deals on the first monthly payment alone. Current deal listings show a fixed £2.75 monthly increase each April on many contracts, so a 24-month plan can pass through two scheduled price steps. Calculate the total of every monthly payment plus setup and optional equipment or service charges, then divide by the minimum term if you want a like-for-like effective monthly cost.',
          'Onestream sells 12-month and 24-month minimum terms. The 24-month option is usually cheaper at the start, while the 12-month version reduces the time committed but typically costs more each month and at activation. Cancelling inside the minimum term can trigger an early termination fee. The provider\'s residential price guide says that calculation depends on the services in the package and the months remaining.',
        ],
      },
      {
        heading: 'Onestream Broadband Speeds and Packages',
        paragraphs: [
          'The current range spans part-fibre and full-fibre connections. Onestream\'s homepage displayed representative average downloads of 35 Mbps, 101 Mbps and 871 Mbps when reviewed. Broader deal listings also showed 67 Mbps part-fibre and full-fibre tiers around 74, 100, 200 and 500 Mbps. The speed available to one home is determined by its line and Openreach rollout, not by the national package list.',
          'A 35 Mbps service can suit one or two people browsing, streaming and making video calls. Around 100 Mbps gives more headroom for several simultaneous users. The 500 Mbps and 871 Mbps tiers are most useful in busy homes with many devices or frequent large downloads. Upload performance is lower than download performance on the listed Openreach products, including about 101 Mbps upload on the 871 Mbps package.',
          'Advertised broadband speed is not a guarantee that every device will receive that number. Wi-Fi distance, walls, router capability, local line conditions and simultaneous use can all reduce measured performance. Check the personalised minimum guaranteed speed supplied during checkout, and test with Ethernet if you later need to distinguish a broadband-line problem from weak in-home Wi-Fi.',
        ],
      },
      {
        heading: 'Onestream Broadband Coverage',
        paragraphs: [
          'Onestream uses the Openreach network, so part-fibre service is available across most of the UK, but no single percentage describes every Onestream package. We use approximately 94% as the part-fibre availability reference shown by a current neutral comparison source. That figure must not be read as 94% availability for Onestream\'s fastest full-fibre tiers, and an address-level check remains essential.',
          'Ofcom reported that full fibre from all networks reached 24.9 million UK residential premises, or 82%, in January 2026. That is a different population and methodology from the Onestream part-fibre reference, so the figures are reported separately. Onestream full-fibre availability follows eligible Openreach lines and can vary between neighbouring streets, while slower part-fibre may remain available where FTTP is not.',
        ],
      },
      {
        heading: 'Routers, Extras and Customer Service',
        paragraphs: [
          'Router choice can affect the real Onestream price. Current listings describe different router levels and the option to use compatible customer-owned equipment on some deals. Check what hardware is included, whether there is a recurring rental or upgrade charge, and whether it must be returned. Onestream\'s price guide lists a £29.95 charge for failing to return a router within 14 days of account closure.',
          'Optional services also deserve attention at checkout. Neutral deal research identifies Onestream Priority Plus support and McAfee security as extras that may become chargeable. Keep only services you actively want, record when any trial ends and check the first bill against the pre-contract summary. This matters because the lowest advertised broadband price may not represent the amount collected after add-ons.',
          'Onestream\'s public Trustpilot profile showed 4.3 out of 5 from about 41,000 reviews when checked on 22 August 2026. That indicates substantial positive feedback overall, but the distribution also included 17% one-star reviews and recent criticism about delays, billing or cancellation. Trustpilot is an open-review platform rather than a controlled service-quality survey, so it is one sentiment input, not proof that every customer will receive the same experience.',
        ],
      },
      {
        heading: 'Is Onestream Broadband Any Good?',
        paragraphs: [
          'Onestream can be good value for a household that can get the advertised speed, wants a low introductory price and is comfortable checking contract detail. It is less compelling for someone who prioritises a price that stays unchanged, wants premium router hardware included without qualification, or may need to leave early. There is no universal verdict because availability and the total contract cost vary by address and term.',
          'Before ordering, save the personalised pre-contract information and contract summary. Confirm the expected speed, every year\'s monthly price, setup charge, router terms, optional extras, minimum term and early-exit calculation. Then compare the same total-cost fields with at least one other Openreach provider. That gives a more reliable decision than comparing a temporary headline price or customer-review score in isolation.',
        ],
      },
    ],
    faqItems: [
      {
        question: 'Is Onestream broadband any good?',
        answer:
          'Onestream broadband can suit price-conscious UK households that want Openreach part-fibre or full fibre and are willing to check the small print. It advertised service from £18.50 a month and up to 871 Mbps when reviewed. Compare the total contract cost, annual fixed price rises, setup charge, add-ons, router-return rules and address-specific speed before deciding.',
      },
      {
        question: 'How much does Onestream broadband cost?',
        answer:
          'Onestream advertised broadband from £18.50 a month on 22 August 2026. Current listings showed a £4.95 setup charge on many 24-month deals and £14.95 on comparable 12-month deals, with monthly prices varying by speed and address. Many contracts also include a stated £2.75 monthly increase each April, so compare the full term cost rather than only the opening price.',
      },
      {
        question: 'What speeds does Onestream broadband offer?',
        answer:
          'Onestream offers part-fibre and full-fibre broadband. Its live homepage showed representative average downloads of 35 Mbps, 101 Mbps and 871 Mbps when checked, while current listings included intermediate tiers. The exact range is postcode-dependent because Onestream uses Openreach infrastructure. Personalised estimates and the minimum guaranteed speed supplied before checkout matter more than the national maximum.',
      },
      {
        question: 'Does Onestream broadband cover my area?',
        answer:
          'Onestream uses Openreach and offers part-fibre across most of the UK, with a current neutral source estimating about 94% availability for that service type. Full fibre has a smaller, address-specific footprint: Ofcom measured all-network UK full-fibre availability at 82% of residential premises in January 2026. Enter your full address because neighbouring homes can receive different options.',
      },
      {
        question: 'Does Onestream increase its broadband prices?',
        answer:
          'Yes. Current Onestream deal listings show a fixed £2.75 monthly increase each April on many plans. The exact pound-and-pence change and the dates applying to your order should appear before you agree to the contract. Add every scheduled payment when comparing deals, especially on a 24-month term that may cross two April price changes.',
      },
      {
        question: 'Can I use my own router with Onestream broadband?',
        answer:
          'Onestream says customers can use their own compatible router, but suitability and setup details depend on the connection and package. Check that the router supports the required Openreach service and obtain the correct connection credentials before switching hardware. Also confirm whether supplied equipment is rented or must be returned, because the current price guide lists charges for unreturned equipment.',
      },
    ],
    reviewedDate: '2026-08-22',
    pricingVerifiedDate: '2026-08-22',
    reviewSources: [
      {
        label: 'Onestream broadband packages and pricing',
        href: 'https://onestream.co.uk/',
        note: 'Primary source used for advertised entry price, representative speeds, unlimited usage and package positioning, verified on 2026-08-22.',
      },
      {
        label: 'Onestream full-fibre guide',
        href: 'https://onestream.co.uk/broadband/full-fibre',
        note: 'Primary source used to verify the FTTP description and gigabit-class full-fibre range on 2026-08-22.',
      },
      {
        label: 'Onestream residential broadband price guide',
        href: 'https://onestream.co.uk/documents/residential-price-guide.pdf',
        note: 'Primary source used for contract, early-termination, activation and equipment-return charge checks on 2026-08-22.',
      },
      {
        label: 'Ofcom Connected Nations update: Spring 2026',
        href: 'https://www.ofcom.org.uk/phones-and-broadband/coverage-and-speeds/connected-nations-update-spring-2026',
        note: 'Neutral regulatory source used for the separately reported UK-wide full-fibre availability figure, checked on 2026-08-22.',
      },
      {
        label: 'Choose Onestream broadband comparison',
        href: 'https://www.choose.co.uk/broadband/onestream/',
        note: 'Neutral corroboration for package tiers, 12- and 24-month setup charges, add-ons and approximate part-fibre availability, checked on 2026-08-22.',
      },
      {
        label: 'Onestream public Trustpilot profile',
        href: 'https://uk.trustpilot.com/review/www.onestream.co.uk',
        note: 'Customer-sentiment reference showing 4.3/5 from about 41,000 reviews on 2026-08-22; treated as an open-review signal, not a controlled service survey.',
      },
      {
        label: 'BroadbandPicker review methodology',
        href: '/how-we-review-broadband',
        note: 'Explains how price, speed, coverage, customer experience and use-case fit are weighed across provider reviews.',
      },
      {
        label: 'BroadbandPicker editorial policy',
        href: '/editorial-policy',
        note: 'Sets out editorial independence, correction standards and handling of commercial relationships.',
      },
    ],
    awinProgramId: null,
  },
  {
    slug: 'shell-energy',
    name: 'Shell Energy',
    logo: '/logos/shell-energy.svg',
    affiliateUrl: 'https://www.talktalk.co.uk/broadband',
    speeds: [
      { download: 11, upload: 1, type: 'ADSL' },
      { download: 38, upload: 9, type: 'FTTC' },
      { download: 67, upload: 17, type: 'FTTC' },
      { download: 100, upload: 20, type: 'FTTP' },
      { download: 200, upload: 30, type: 'FTTP' },
      { download: 500, upload: 75, type: 'FTTP' },
      { download: 944, upload: 110, type: 'FTTP' },
    ],
    monthlyPriceFrom: 19.99,
    contractLengths: [18],
    setupFee: 0,
    trustpilotScore: 0,
    coveragePercent: 0,
    highlights: [
      'Shell Energy Broadband closed to new customers and its broadband accounts moved to TalkTalk in 2024',
      'Former packages used Openreach ADSL, part-fibre and full-fibre lines with average downloads up to 944 Mbps',
      'Historic prices on this page are for identifying an old plan, not offers that can be ordered today',
    ],
    pros: [
      'The former range covered basic ADSL through to gigabit-class Openreach full fibre',
      'Existing routers and contract terms were expected to continue during the 2024 migration',
      'Former customers can compare and switch from their current TalkTalk account when eligible',
      'The sale and switching guidance can be checked against official and regulatory sources',
    ],
    cons: [
      'No new Shell Energy broadband deals are available',
      'Old package prices and contact details in ranking reviews may now be misleading',
      'Shell Energy had a poor historical Ofcom complaints result in Q2 2022',
      'A former customer must check their current TalkTalk bill and minimum term rather than rely on a Shell-era review',
    ],
    retiredDate: '2024-10-01',
    successorName: 'TalkTalk',
    successorUrl: 'https://www.talktalk.co.uk/broadband',
    excerpt:
      'Shell Energy Broadband is no longer available to new customers. Its roughly 500,000 UK broadband and home-phone accounts moved to TalkTalk during 2024 after Octopus Energy sold the broadband arm. Former customers should check their current TalkTalk account for billing, contract and support details. The Shell Energy broadband review below keeps old speeds and prices clearly labelled as history, not live deals.',
    contentSections: [
      {
        heading: 'Is Shell Energy Broadband Still Available?',
        paragraphs: [
          'No. Shell Energy Broadband stopped operating as a retail choice for new UK customers in 2024. Octopus Energy announced on 6 February 2024 that it had agreed to sell the broadband arm of Shell Energy Retail to TalkTalk\'s shareholders. Shell Energy\'s current support result now tells broadband and phone customers that they have moved to TalkTalk. A page advertising a new Shell broadband order is therefore out of date.',
          'This Shell Energy broadband review is an archive and practical next-step guide. It can help a former customer identify an old package, understand why a bill or account now carries TalkTalk branding, and decide what to check before switching. It cannot provide a live Shell quote because there is no current Shell retail range. The button on this page goes to TalkTalk, the successor provider, and our comparison link shows other current options.',
          'If a search result still lists Shell Energy broadband deals, check its publication date, destination URL and order journey. Several pages ranking in August 2026 still displayed prices from the active-brand period. Those figures may be useful on an old statement, but they do not prove availability. Do not enter payment details on an unfamiliar page that presents itself as a current Shell broadband checkout.',
        ],
      },
      {
        heading: 'What Happened to Shell Energy Broadband and TalkTalk?',
        paragraphs: [
          'Octopus Energy completed its acquisition of Shell Energy Retail in December 2023. Octopus retained the household energy operation but did not plan to provide broadband. Its February 2024 announcement said the broadband arm would be sold to TalkTalk\'s shareholders and noted that Shell Energy Broadband was already supported by TalkTalk\'s platform. The transfer was therefore a change of retail ownership and account management, not a sale of a separate national fibre network.',
          'MoneySavingExpert reported that approximately 500,000 broadband and home-phone customers were involved. During the staged move, customers were told that service should continue, existing routers would still work and contract terms would remain in place. That report described the migration period in 2024. A customer looking at an account now should use the terms, price and minimum-period date shown by TalkTalk rather than assume every original migration statement still controls the account.',
          'Shell Energy and TalkTalk are not two current providers to compare for a new order. Shell is the retired brand and TalkTalk is where the transferred accounts went. A prospective customer should compare a live TalkTalk quote with other providers available at the same address. A former Shell customer should first identify whether they are still in a minimum term, the monthly price now charged, and any phone or add-on services attached to the account.',
        ],
      },
      {
        heading: 'Shell Energy Broadband Deals and Historic Prices',
        paragraphs: [
          'Shell Energy broadband deals once ranged from 11 Mbps ADSL through 38 Mbps and 67 Mbps part-fibre packages to full-fibre tiers advertised up to 944 Mbps. The archived entry price of £19.99 a month and the 18-month term shown above come from old commercial listings, not a price verified for sale in 2026. They are included only because they can help someone recognise a legacy contract or judge whether an old review is describing the same product.',
          'Historic package tables vary by date. One ranking review listed £19.99 for 11 Mbps Fast Broadband, £28.99 for 67 Mbps Superfast Fibre Plus and £41.99 for 145 Mbps Ultrafast Broadband, all on 18-month terms. Another described later full-fibre tiers reaching 944 Mbps. These populations should not be combined into a supposed final range because products, promotions, connection types and dates differed. No old headline price should be compared directly with a live offer without checking the total contract cost.',
          'For a current deal comparison, record the monthly price in each contract year, setup charge, minimum term, average download, minimum guaranteed speed, upload rate, phone inclusion, router terms and exit charge. Then compare like with like at the full address. A cheap Shell-era FTTC price is not an alternative that can be bought, and a current full-fibre deal may involve different installation work even when both services use Openreach infrastructure.',
        ],
      },
      {
        heading: 'Shell Energy Broadband Speeds, Coverage and Network',
        paragraphs: [
          'Shell Energy resold broadband delivered over Openreach infrastructure. Its older Fast Broadband product used ADSL, Superfast products used fibre to the cabinet with copper for the final connection, and later Full Fibre products used fibre to the premises. Shell did not operate a separate UK access network. That relationship explains why advertised speed depended on the line available at an individual address rather than a single Shell coverage footprint.',
          'The historic average download tiers included 11 Mbps, 38 Mbps, 67 Mbps and a selection of full-fibre speeds up to 944 Mbps. Uploads were much lower than downloads, including roughly 110 Mbps upload on the old 944 Mbps tier, because these were not symmetrical services. The personalised speed estimate and minimum guarantee in an old contract are more relevant to a former customer than the maximum once advertised nationally.',
          'There is no meaningful current Shell Energy broadband coverage percentage because the brand no longer accepts orders. Current availability belongs to the provider selling service now and can differ even on an Openreach line. Enter the full address into a live provider checker, not only the postcode, and wait until a replacement service is active before cancelling a working connection if the switch requires separate installation.',
        ],
      },
      {
        heading: 'Shell Energy Broadband Router and Home Phone',
        paragraphs: [
          'Shell Energy supplied different routers across its former range. Later Superfast and Full Fibre customers could receive a dual-band Wi-Fi 6 hub, while some older products used Technicolor or Zyxel hardware. The router model on the label matters more than a generic review because port speeds, wireless standard and connection settings differ. A legacy router cannot make an 11 Mbps or 67 Mbps line run at full-fibre speed.',
          'Customers were told during the TalkTalk migration that they would not need new equipment simply because the account moved. If a former Shell router still provides the service, do not factory-reset or replace it during a fault unless current TalkTalk support instructs you to do so. First check power, the broadband or optical light, Ethernet performance and Wi-Fi separately. Record the model and serial number before contacting support.',
          'Old Shell packages often included line rental and pay-as-you-go calls, with optional call plans. The current bill is the reliable record of whether a phone service or call package remains attached. Before switching, decide whether the landline number must be kept and tell the new provider. Ofcom also advises customers to consider any provider-hosted email address, because access may end after a switch.',
        ],
      },
      {
        heading: 'Shell Energy Broadband Contact, Billing and Complaints',
        paragraphs: [
          'A former Shell Energy broadband customer should start with the contact route shown in their current TalkTalk bill, online account or recent service email. Old Shell Energy broadband contact numbers and login links can be retired, repurposed or unrelated to the migrated account. The current Shell support result confirms the move to TalkTalk, but the exact account identifier and support channel must come from the customer\'s present documentation.',
          'Do not cancel a Direct Debit merely because the payee name changed during migration. Match the amount to the bill and query an unexplained charge through the current provider. Keep copies of the original Shell contract, migration messages, TalkTalk bills, payment dates, fault references and the resolution requested. That evidence is useful if a billing or contract dispute cannot be resolved during the first contact.',
          'Historical service measures need a date and population. Ofcom recorded 31 Shell Energy broadband complaints per 100,000 customers in the second quarter of 2022, against an industry average of 11. Ofcom later fined Shell Energy £1.4 million in November 2023 for failures involving end-of-contract and annual best-tariff notifications affecting more than 70,000 customers. Neither figure measures current TalkTalk service, so this review reports them only as Shell-era context.',
        ],
      },
      {
        heading: 'Can Former Shell Energy Broadband Customers Switch?',
        paragraphs: [
          'Yes. A former Shell Energy customer can switch from the current TalkTalk service, subject to any minimum-term and early-exit conditions on the account. Check the contract end date and ask for the expected early termination charge before committing elsewhere. If the minimum term has ended, compare current prices rather than allowing a legacy out-of-contract rate to continue without review.',
          'Ofcom says One Touch Switch lets the new provider arrange most residential broadband switches. After the customer supplies matching account details and confirms the change, the new provider coordinates the preferred date where possible; the old service should end after the replacement is working. Keep the old router until the current provider confirms whether it must be returned, and save proof of postage for any equipment return.',
          'Use a simple decision check: confirm the exact address and available network, compare total contract cost, check average and guaranteed speeds, preserve any landline number, plan for email-address changes, and understand installation timing. If the current service has a fault or unresolved bill, switching does not automatically settle the complaint. Keep pursuing the existing case and use the provider\'s formal complaint process when needed.',
        ],
      },
      {
        heading: 'Is Shell Energy Broadband Any Good?',
        paragraphs: [
          'Shell Energy Broadband cannot be recommended for a new order because it no longer sells one. During its active period it offered a broad Openreach range and later reached gigabit-class downloads, but the value depended on the address, promotion and contract date. Its poor 2022 complaints figure and the 2023 Ofcom enforcement action are material historical cautions, not evidence about every customer or about TalkTalk today.',
          'For a former customer, the best next step is to audit the current account rather than judge it by Shell-era marketing. Check the TalkTalk price, term, speed guarantee, phone plan and any add-ons. Stay if the service and total cost compare well at the address. Switch if an eligible alternative offers a better combination of price, speed, installation confidence and support terms.',
          'Our verdict is therefore specific: ignore pages presenting Shell Energy broadband deals as live, use archived package details only to understand an old contract, and make any buying decision from current address-level quotes. TalkTalk is the relevant successor for account support, while Ofcom\'s switching guidance and a saved pre-contract summary provide the safest route to a different provider.',
        ],
      },
    ],
    faqItems: [
      {
        question: 'Is Shell Energy Broadband still operating?',
        answer:
          'No. Shell Energy Broadband stopped taking new UK customers and its broadband and home-phone accounts moved to TalkTalk during 2024. Octopus Energy announced the agreed sale in February 2024, and Shell Energy\'s current support result directs former broadband customers to TalkTalk. Any Shell package price shown today should be treated as historical, not a live offer.',
      },
      {
        question: 'What happened to Shell Energy Broadband customers?',
        answer:
          'About 500,000 Shell Energy broadband and home-phone customers were transferred to TalkTalk in 2024 after Octopus Energy acquired Shell Energy Retail and sold the broadband arm separately. Customers were told the migration would be automatic and that existing routers and contract terms would continue during the move. Current billing, support and minimum-term details now need checking with TalkTalk.',
      },
      {
        question: 'Are there any Shell Energy broadband deals?',
        answer:
          'No new Shell Energy broadband deals are available. Search results may still display former 18-month plans and speeds from 11 Mbps to 944 Mbps, but those are archive records. Compare current providers using your full address and check each deal\'s total contract cost, annual price changes, setup fee, guaranteed speed and exit terms before ordering.',
      },
      {
        question: 'What is the Shell Energy broadband contact number?',
        answer:
          'Former Shell Energy broadband customers should use the contact details on their current TalkTalk bill, online account or recent service message. Old Shell broadband numbers and login pages may no longer operate. Keep the account number, bills and migration emails ready, and use TalkTalk\'s formal complaint route if billing, contract or service issues are not resolved.',
      },
      {
        question: 'Can I keep using my Shell Energy broadband router?',
        answer:
          'Customers were told that their existing Shell Energy router could continue working when accounts moved to TalkTalk. If it still provides service, do not reset or discard it without current support advice. Check the model label, power and broadband lights first, and ask TalkTalk whether replacement or return is required before changing equipment.',
      },
      {
        question: 'Can I switch from Shell Energy Broadband to another provider?',
        answer:
          'Yes. The account is now with TalkTalk, so first check its current minimum-term date and any early termination charge. Under Ofcom\'s One Touch Switch process, the new provider normally coordinates the move. Compare address-specific prices and speeds, protect any landline number or provider-hosted email, and keep equipment-return evidence after the new service works.',
      },
    ],
    reviewedDate: '2026-08-23',
    pricingVerifiedDate: '2026-08-23',
    reviewSources: [
      {
        label: 'Octopus Energy announcement of the Shell Energy Broadband sale',
        href: 'https://octopus.energy/press/Octopus-Energy-Shell-Energy-Broadband/',
        note: 'Primary source used for the February 2024 sale to TalkTalk shareholders, the existing TalkTalk platform relationship and migration plan; rechecked on 2026-08-23.',
      },
      {
        label: 'Shell Energy account support',
        href: 'https://uk.shellenergy.com/help/contact-us/account-queries',
        note: 'Primary source whose current search result states that Shell Energy broadband and phone customers moved to TalkTalk; checked on 2026-08-23.',
      },
      {
        label: 'MoneySavingExpert Shell Energy broadband transfer report',
        href: 'https://www.moneysavingexpert.com/news/2024/02/shell-energy-broadband-sold-talktalk/',
        note: 'Independent corroboration for the approximate 500,000 accounts, automatic migration, router continuity and contract guidance published during the 2024 transfer; rechecked on 2026-08-23.',
      },
      {
        label: 'Ofcom enforcement action against Shell Energy',
        href: 'https://www.ofcom.org.uk/phones-and-broadband/switching-provider/shell-energy-fined-customer-contracts-deals',
        note: 'Regulatory source for the £1.4 million November 2023 fine and more than 70,000 affected customers; reported as dated Shell-era evidence, checked on 2026-08-23.',
      },
      {
        label: 'Ofcom historical telecoms complaints release',
        href: 'https://www.ofcom.org.uk/phones-and-broadband/service-quality/most-complained-about-telecoms-and-pay-tv-providers',
        note: 'Regulatory source for Q2 2022 Shell Energy complaints of 31 per 100,000 customers versus the industry average of 11; not used as a current TalkTalk measure, checked on 2026-08-23.',
      },
      {
        label: 'Ofcom broadband switching guidance',
        href: 'https://www.ofcom.org.uk/phones-and-broadband/switching-provider/switching-broadband-provider',
        note: 'Regulatory source for current One Touch Switch steps and provider-hosted email cautions, checked on 2026-08-23.',
      },
      {
        label: 'BroadbandPicker TalkTalk review',
        href: '/providers/talktalk',
        note: 'Internal next step for current TalkTalk package, price and provider context.',
      },
      {
        label: 'BroadbandPicker switching guide',
        href: '/guides/how-to-switch-broadband-uk',
        note: 'Internal practical guide for comparing and completing a UK broadband switch.',
      },
      {
        label: 'BroadbandPicker review methodology',
        href: '/how-we-review-broadband',
        note: 'Explains how price, speed, coverage, customer experience and use-case fit are weighed across provider reviews.',
      },
      {
        label: 'BroadbandPicker editorial policy',
        href: '/editorial-policy',
        note: 'Sets out editorial independence, correction standards and handling of commercial relationships.',
      },
    ],
    awinProgramId: null,
  },
]

export const providers: Provider[] = baseProviders.map(applyLiveDealOverlay)

export function getProviderBySlug(slug: string): Provider | undefined {
  return providers.find((p) => p.slug === slug)
}

export function getTopDeals(count = 5) {
  return providers
    .filter((p) => !p.retiredDate)
    .map((p) => ({
      provider: p,
      monthlyPrice: p.monthlyPriceFrom,
      download: p.speeds[0].download,
      upload: p.speeds[0].upload,
      type: p.speeds[0].type,
      contractLength: p.contractLengths[0],
      setupFee: p.setupFee,
      packageName: `${p.name} Broadband`,
    }))
    .sort((a, b) => a.monthlyPrice - b.monthlyPrice)
    .slice(0, count)
}
