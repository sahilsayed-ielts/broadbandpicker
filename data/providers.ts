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
    affiliateUrl: 'https://www.talktalk.co.uk/broadband',
    speeds: [
      { download: 38, upload: 9, type: 'FTTC' },
      { download: 67, upload: 17, type: 'FTTC' },
      { download: 150, upload: 30, type: 'FTTP' },
      { download: 500, upload: 75, type: 'FTTP' },
    ],
    monthlyPriceFrom: 19.99,
    contractLengths: [18, 24],
    setupFee: 0,
    trustpilotScore: 2.8,
    coveragePercent: 96,
    highlights: [
      'One of the cheapest broadband deals in the UK',
      'Price-lock guarantee on selected plans',
      'HomeSafe parental controls included',
    ],
    pros: [
      'Very competitive pricing',
      'Good coverage across the UK',
      'Price-lock on some deals',
    ],
    cons: [
      'Below average customer satisfaction',
      'Speed reliability complaints',
      'Past data security incidents',
    ],
    ...createReviewMetadata('TalkTalk', 'https://www.talktalk.co.uk/broadband', 'talktalk.co.uk'),
    awinProgramId: null,
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
    trustpilotScore: 3.9,
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
]

export const providers: Provider[] = baseProviders.map(applyLiveDealOverlay)

export function getProviderBySlug(slug: string): Provider | undefined {
  return providers.find((p) => p.slug === slug)
}

export function getTopDeals(count = 5) {
  return providers
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
