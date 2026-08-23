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
      { download: 36, upload: 9, type: 'FTTC' },
      { download: 67, upload: 17, type: 'FTTC' },
      { download: 150, upload: 30, type: 'FTTP' },
      { download: 500, upload: 75, type: 'FTTP' },
      { download: 900, upload: 110, type: 'FTTP' },
    ],
    monthlyPriceFrom: 30.99,
    contractLengths: [24],
    setupFee: 0,
    trustpilotScore: 3.6,
    coveragePercent: 98,
    highlights: [
      'UK\'s largest broadband network — covers 98% of homes',
      'Free BT Wi-Fi hotspot access across the UK',
      'Complete Wi-Fi guarantee — engineer visit if signal drops',
    ],
    pros: [
      'Widest coverage of any UK provider',
      'Reliable, established network',
      'Good customer service reputation',
      'Includes BT Sport add-on option',
    ],
    cons: [
      'More expensive than budget rivals',
      'Long 24-month contracts',
      'Speed upgrades cost extra',
    ],
    ...createReviewMetadata('BT', 'https://www.bt.com/broadband', 'bt.com'),
    awinProgramId: null,
  },
  {
    slug: 'sky',
    name: 'Sky',
    logo: '/logos/sky.svg',
    affiliateUrl: 'https://www.sky.com/shop/broadband',
    speeds: [
      { download: 36, upload: 9, type: 'FTTC' },
      { download: 59, upload: 17, type: 'FTTC' },
      { download: 145, upload: 27, type: 'FTTP' },
      { download: 500, upload: 60, type: 'FTTP' },
    ],
    monthlyPriceFrom: 25.00,
    contractLengths: [18],
    setupFee: 0,
    trustpilotScore: 3.8,
    coveragePercent: 95,
    highlights: [
      'No setup fee on all packages',
      'Sky Broadband Shield parental controls included',
      'Pairs with Sky TV for bundle savings',
    ],
    pros: [
      'Competitive introductory pricing',
      'No setup fee',
      'Good parental controls',
      'Excellent TV bundles',
    ],
    cons: [
      'Price rises after initial period',
      'Average upload speeds on FTTC',
      'Customer service can be slow',
    ],
    ...createReviewMetadata('Sky', 'https://www.sky.com/shop/broadband', 'sky.com'),
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
    monthlyPriceFrom: 28.00,
    contractLengths: [18, 24],
    setupFee: 35,
    trustpilotScore: 3.2,
    coveragePercent: 52,
    highlights: [
      'Gigabit speeds available on cable network',
      'Fastest widely-available speeds in the UK',
      'TV, broadband and phone bundles',
    ],
    pros: [
      'Very fast speeds on cable network',
      'Gigabit available to over half of UK homes',
      'Good value speed-per-pound ratio',
    ],
    cons: [
      'Only available in cabled areas — limited coverage',
      'Setup fees apply',
      'Price hikes mid-contract',
      'Customer service scores are below average',
    ],
    ...createReviewMetadata('Virgin Media', 'https://www.virginmedia.com/broadband', 'virginmedia.com'),
    awinProgramId: null,
  },
  {
    slug: 'ee',
    name: 'EE',
    logo: '/logos/ee.svg',
    affiliateUrl: 'https://ee.co.uk/broadband',
    speeds: [
      { download: 36, upload: 9, type: 'FTTC' },
      { download: 67, upload: 17, type: 'FTTC' },
      { download: 150, upload: 30, type: 'FTTP' },
      { download: 500, upload: 75, type: 'FTTP' },
      { download: 900, upload: 110, type: 'FTTP' },
    ],
    monthlyPriceFrom: 26.99,
    contractLengths: [18, 24],
    setupFee: 0,
    trustpilotScore: 4.1,
    coveragePercent: 97,
    highlights: [
      'Fastest average speeds of any major UK provider',
      'Expert help service included free',
      'Pairs with EE Mobile for bundle discounts',
    ],
    pros: [
      'Top-rated speeds and reliability',
      'High Trustpilot score',
      'Good bundle deals with EE mobile',
      'Strong coverage across the UK',
    ],
    cons: [
      'Slightly pricier than budget options',
      'Limited FTTP rollout in some areas',
    ],
    ...createReviewMetadata('EE', 'https://ee.co.uk/broadband', 'ee.co.uk'),
    awinProgramId: null,
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
      { download: 36, upload: 8, type: 'FTTC' },
      { download: 66, upload: 17, type: 'FTTC' },
      { download: 145, upload: 30, type: 'FTTP' },
    ],
    monthlyPriceFrom: 22.99,
    contractLengths: [18, 24],
    setupFee: 0,
    trustpilotScore: 2.0,
    coveragePercent: 96,
    highlights: [
      'Straightforward pricing — no hidden fees',
      'UK-based customer service team',
      'Strong reputation for honest billing',
    ],
    pros: [
      'Transparent pricing',
      'UK customer support',
      'Good value mid-tier option',
    ],
    cons: [
      'Speeds lag behind EE and BT',
      'Less competitive than budget rivals on price',
      'Smaller FTTP footprint',
    ],
    ...createReviewMetadata('Plusnet', 'https://www.plus.net/broadband/', 'plus.net'),
    awinProgramId: null,
  },
  {
    slug: 'vodafone',
    name: 'Vodafone',
    logo: '/logos/vodafone.svg',
    affiliateUrl: 'https://www.vodafone.co.uk/broadband',
    speeds: [
      { download: 38, upload: 9, type: 'FTTC' },
      { download: 76, upload: 19, type: 'FTTC' },
      { download: 100, upload: 20, type: 'FTTP' },
      { download: 500, upload: 75, type: 'FTTP' },
      { download: 900, upload: 100, type: 'FTTP' },
    ],
    monthlyPriceFrom: 24.00,
    contractLengths: [18, 24],
    setupFee: 0,
    trustpilotScore: 3.4,
    coveragePercent: 94,
    highlights: [
      'Discount when bundled with Vodafone Mobile',
      'Wi-Fi Guarantee — money back if speeds disappoint',
      'Pro Xtra plan includes tech support',
    ],
    pros: [
      'Good bundle discounts with mobile',
      'Wi-Fi Guarantee scheme',
      'Competitive FTTP pricing',
    ],
    cons: [
      'Customer service scores are mixed',
      'Coverage lower than BT/EE/Sky',
    ],
    ...createReviewMetadata('Vodafone', 'https://www.vodafone.co.uk/broadband', 'vodafone.co.uk'),
    awinProgramId: null,
  },
  {
    slug: 'now-broadband',
    name: 'NOW Broadband',
    logo: '/logos/now-broadband.svg',
    affiliateUrl: 'https://www.nowtv.com/broadband',
    speeds: [
      { download: 36, upload: 9, type: 'FTTC' },
      { download: 67, upload: 17, type: 'FTTC' },
      { download: 150, upload: 30, type: 'FTTP' },
    ],
    monthlyPriceFrom: 17.99,
    contractLengths: [12],
    setupFee: 5,
    trustpilotScore: 3.2,
    coveragePercent: 95,
    highlights: [
      'One of the cheapest broadband options in the UK',
      'Flexible 12-month contracts',
      'NOW TV entertainment bundles available',
    ],
    pros: [
      'Very cheap entry price',
      'Shorter 12-month contract option',
      'Good for light users',
    ],
    cons: [
      'Speeds can be inconsistent',
      'Customer service rated poorly',
      'Setup fee on some plans',
    ],
    ...createReviewMetadata('NOW Broadband', 'https://www.nowtv.com/broadband', 'nowtv.com'),
    awinProgramId: null,
  },
  {
    slug: 'hyperoptic',
    name: 'Hyperoptic',
    logo: '/logos/hyperoptic.svg',
    affiliateUrl: 'https://www.hyperoptic.com/',
    speeds: [
      { download: 150, upload: 150, type: 'FTTP' },
      { download: 500, upload: 500, type: 'FTTP' },
      { download: 1000, upload: 1000, type: 'FTTP' },
    ],
    monthlyPriceFrom: 22.00,
    contractLengths: [12, 24],
    setupFee: 0,
    trustpilotScore: 4.4,
    coveragePercent: 8,
    highlights: [
      'Full-fibre to the premises — no copper at all',
      'Symmetrical upload and download speeds',
      'Highest Trustpilot rating among major ISPs',
    ],
    pros: [
      'Outstanding Trustpilot score',
      'True full-fibre — symmetrical speeds',
      'Competitive pricing for gigabit',
    ],
    cons: [
      'Very limited coverage — mainly London and major cities',
      'Building must be wired — no on-demand install',
    ],
    ...createReviewMetadata('Hyperoptic', 'https://www.hyperoptic.com/', 'hyperoptic.com'),
    awinProgramId: null,
  },
  {
    slug: 'community-fibre',
    name: 'Community Fibre',
    logo: '/logos/community-fibre.svg',
    affiliateUrl: 'https://www.communityfibre.co.uk/',
    speeds: [
      { download: 150, upload: 150, type: 'FTTP' },
      { download: 500, upload: 500, type: 'FTTP' },
      { download: 920, upload: 920, type: 'FTTP' },
    ],
    monthlyPriceFrom: 21.99,
    contractLengths: [12, 24],
    setupFee: 0,
    trustpilotScore: 4.6,
    coveragePercent: 6,
    highlights: [
      'Highest-rated ISP on Trustpilot in the UK',
      'Full-fibre throughout — pure FTTP network',
      'London-focused with aggressive expansion',
    ],
    pros: [
      'Best customer satisfaction scores in the UK',
      'Very fast and symmetrical speeds',
      'No setup fee',
    ],
    cons: [
      'London-only coverage currently',
      'Limited package options vs large ISPs',
    ],
    ...createReviewMetadata('Community Fibre', 'https://www.communityfibre.co.uk/', 'communityfibre.co.uk'),
    awinProgramId: null,
  },
  {
    slug: 'zen-internet',
    name: 'Zen Internet',
    logo: '/logos/zen-internet.svg',
    affiliateUrl: 'https://www.zen.co.uk/broadband',
    speeds: [
      { download: 67, upload: 17, type: 'FTTC' },
      { download: 160, upload: 30, type: 'FTTP' },
      { download: 500, upload: 75, type: 'FTTP' },
      { download: 900, upload: 110, type: 'FTTP' },
    ],
    monthlyPriceFrom: 34.99,
    contractLengths: [12, 24],
    setupFee: 0,
    trustpilotScore: 4.5,
    coveragePercent: 75,
    highlights: [
      'Award-winning UK customer service',
      'Static IP addresses available on all plans',
      'No traffic management or throttling',
    ],
    pros: [
      'Excellent customer service',
      'No throttling or traffic management',
      'Static IP included',
      'Great for home workers and small businesses',
    ],
    cons: [
      'More expensive than most rivals',
      'Coverage not as wide as BT/Sky/EE',
    ],
    ...createReviewMetadata('Zen Internet', 'https://www.zen.co.uk/broadband', 'zen.co.uk'),
    awinProgramId: null,
  },
  {
    slug: 'toob',
    name: 'Toob',
    logo: '/logos/toob.svg',
    affiliateUrl: 'https://www.toob.co.uk/',
    speeds: [
      { download: 500, upload: 500, type: 'FTTP' },
      { download: 900, upload: 900, type: 'FTTP' },
    ],
    monthlyPriceFrom: 22.00,
    contractLengths: [12, 24],
    setupFee: 0,
    trustpilotScore: 4.7,
    coveragePercent: 2,
    highlights: [
      'Pure full-fibre — fastest residential speeds available',
      'Symmetrical gigabit for the price of standard broadband',
      'Highest Trustpilot score of any UK ISP',
    ],
    pros: [
      'Exceptional speeds at low prices',
      'Outstanding customer reviews',
      'Symmetrical upload and download',
    ],
    cons: [
      'Currently only available in Southampton and surrounding areas',
      'Very limited geographic coverage',
    ],
    ...createReviewMetadata('Toob', 'https://www.toob.co.uk/', 'toob.co.uk'),
    awinProgramId: null,
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
      { download: 900, upload: 900, type: 'FTTP' },
      { download: 1800, upload: 1800, type: 'FTTP' },
    ],
    monthlyPriceFrom: 20.00,
    contractLengths: [1, 12, 24],
    setupFee: 0,
    trustpilotScore: 4.6,
    coveragePercent: 10,
    highlights: [
      'Rolling monthly contract option — unusual among full-fibre altnets',
      'No mid-contract price rises on any deal',
      'Symmetrical upload and download on every tier, including a 1.8 Gbps option',
    ],
    pros: [
      'Flexible contract lengths, including rolling monthly',
      'Fixed pricing for the full term — no scheduled mid-contract increases',
      'Wi-Fi 7 router included on current deals',
    ],
    cons: [
      'Coverage limited to selected towns and cities on the Netomnia network',
      'Trustpilot sentiment has been mixed since absorbing BRSK customers in 2025/26',
    ],
    ...createReviewMetadata('YouFibre', 'https://www.youfibre.com/', 'youfibre.com'),
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
          'Zzoomm\'s published range currently carries no scheduled mid-contract price increase. That is a genuine point of difference: several national providers, including some full-fibre altnets, apply an annual increase tied to CPI inflation plus a fixed percentage, often landing at somewhere between 6% and 8% a year. A fixed price for the length of the contract is easier to budget around and worth weighing against a slightly cheaper headline price elsewhere that comes with a scheduled rise.',
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
        answer: 'Zzoomm\'s current published range carries no scheduled mid-contract price increase, unlike some providers that apply an annual CPI-linked rise. The 24-month term does step up from its introductory rate to a higher standard rate after the first 12 months, but that step is disclosed in the price table rather than added later.',
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
