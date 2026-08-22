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
    logo: '/logos/youfibre.svg',
    affiliateUrl: 'https://www.youfibre.com/brsk/index.html',
    speeds: [
      { download: 200, upload: 200, type: 'FTTP' },
      { download: 900, upload: 900, type: 'FTTP' },
      { download: 2000, upload: 2000, type: 'FTTP' },
    ],
    monthlyPriceFrom: 24.99,
    contractLengths: [1, 12],
    setupFee: 0,
    trustpilotScore: 4.8,
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
          'Brsk had a strong legacy customer-review profile, with Uswitch recording 4.8 out of 5 on Trustpilot when checked in December 2025. That is useful sentiment evidence, but it is not a technical reliability measurement and may not describe the post-migration YouFibre operation. Read recent reviews by date and location, looking for repeated themes rather than relying on the headline score alone.',
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
