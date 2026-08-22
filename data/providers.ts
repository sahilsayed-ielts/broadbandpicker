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
