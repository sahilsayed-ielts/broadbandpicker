export type TvBundleContentTag = 'sport' | 'movies' | 'kids' | 'general' | 'flexible'

/**
 * Machine-readable form of priceRiseNote, used to total a contract's cost.
 * - steps: fixed new monthly prices from a given month (YYYY-MM)
 * - annual-april: a flat monthly increase applied from each April bill
 *   (rise takes effect 31 March)
 * - unconfirmed: the provider has not published the in-contract change, so
 *   totals exclude it and say so
 */
export type TvBundlePriceRise =
  | { type: 'steps'; steps: { from: string; monthlyPrice: number }[] }
  | { type: 'annual-april'; amount: number }
  | { type: 'unconfirmed' }

/**
 * Mandatory one-off cost at signup. `fee: null` means the provider has not
 * published one for this bundle, so totals exclude it and the card says so
 * (DMCC Act drip-pricing: never imply a total that omits a known mandatory fee).
 */
export interface TvBundleSetupCost {
  fee: number | null
  note: string
  checkedDate: string
}

export interface TvBundleOption {
  provider: string
  providerSlug: string
  packageName: string
  monthlyPrice: number
  broadbandSpeedMbps: number
  contractMonths: number
  contentTags: TvBundleContentTag[]
  highlights: string[]
  priceRiseNote: string
  priceRise: TvBundlePriceRise
  setup: TvBundleSetupCost
  reviewHref: string
}

// Real, sourced example packages — not a live feed. Prices verified against
// provider sites and trade press on 24 August 2026 (Sky, Virgin Media) and
// 1 September 2026 (EE TV pricing). Always confirm the live price and
// availability at checkout before ordering.
export const tvBundleOptions: TvBundleOption[] = [
  {
    provider: 'Sky',
    providerSlug: 'sky',
    packageName: 'Sky Stream, Sky Essential TV + Full Fibre 300',
    monthlyPrice: 35,
    broadbandSpeedMbps: 300,
    contractMonths: 24,
    contentTags: ['general', 'movies'],
    highlights: ['No satellite dish needed', 'Netflix and streaming apps built in', 'Minimum 25Mbps recommended for Stream'],
    priceRiseNote: 'Check the current in-contract price change before ordering.',
    priceRise: { type: 'unconfirmed' },
    setup: {
      fee: 0,
      note: 'Sky\'s deal page says "No upfront fees". Its broadband terms add that £9.95 router delivery and a £10 activation fee may be required.',
      checkedDate: '2026-10-14',
    },
    reviewHref: '/providers/sky',
  },
  {
    provider: 'Sky',
    providerSlug: 'sky',
    packageName: 'Sky Ultimate TV + Full Fibre 500',
    monthlyPrice: 39,
    broadbandSpeedMbps: 500,
    contractMonths: 24,
    contentTags: ['general', 'movies', 'sport'],
    highlights: ['Full channel bundle with UHD available', 'Faster full-fibre tier included'],
    priceRiseNote: 'Check the current in-contract price change before ordering.',
    priceRise: { type: 'unconfirmed' },
    setup: {
      fee: 0,
      note: 'Sky\'s deal page says "No upfront fees". Its broadband terms add that £9.95 router delivery and a £10 activation fee may be required.',
      checkedDate: '2026-10-14',
    },
    reviewHref: '/providers/sky',
  },
  {
    provider: 'Virgin Media',
    providerSlug: 'virgin-media',
    packageName: 'Max Volt (broadband, mobile SIM and TV 360)',
    monthlyPrice: 74.99,
    broadbandSpeedMbps: 1000,
    contractMonths: 24,
    contentTags: ['sport', 'movies', 'general'],
    highlights: [
      'Gigabit-boosted broadband plus an O2 5G SIM with unlimited data and calls',
      '230+ channels including Sky Sports HD and Sky Cinema HD, plus Netflix',
      'Free UK landline and mobile calls',
    ],
    priceRiseNote: 'Two scheduled rises are already built into the contract: £81.49/mo from March 2027, £87.99/mo from April 2028.',
    priceRise: {
      type: 'steps',
      steps: [
        { from: '2027-03', monthlyPrice: 81.49 },
        { from: '2028-04', monthlyPrice: 87.99 },
      ],
    },
    setup: {
      fee: 0,
      note: 'Virgin Media says there are no mandatory setup fees on its bundles. Engineer installation costs from £30 on some packages.',
      checkedDate: '2026-10-14',
    },
    reviewHref: '/providers/virgin-media',
  },
  {
    provider: 'EE',
    providerSlug: 'ee',
    packageName: 'EE Broadband + Entertainment TV pack',
    monthlyPrice: 44.99,
    broadbandSpeedMbps: 100,
    contractMonths: 24,
    contentTags: ['general', 'movies'],
    highlights: ['Netflix included', 'Broadband from £22.99/mo plus the £22/mo Entertainment pack', 'Can change the TV pack without changing the broadband contract'],
    priceRiseNote: 'Scheduled rise each 31 March: broadband +£4/mo, TV +£2/mo.',
    priceRise: { type: 'annual-april', amount: 6 },
    setup: {
      fee: null,
      note: 'EE has not published a setup fee for this pack. Confirm it at checkout.',
      checkedDate: '2026-10-14',
    },
    reviewHref: '/providers/ee',
  },
  {
    provider: 'EE',
    providerSlug: 'ee',
    packageName: 'EE Broadband + Big Sport TV pack',
    monthlyPrice: 73.99,
    broadbandSpeedMbps: 100,
    contractMonths: 24,
    contentTags: ['sport'],
    highlights: ['Sky Sports via NOW plus TNT Sports', 'Broadband from £22.99/mo plus the £51/mo Big Sport pack'],
    priceRiseNote: 'Scheduled rise each 31 March: broadband +£4/mo, TV +£2/mo.',
    priceRise: { type: 'annual-april', amount: 6 },
    setup: {
      fee: null,
      note: 'EE has not published a setup fee for this pack. Confirm it at checkout.',
      checkedDate: '2026-10-14',
    },
    reviewHref: '/providers/ee',
  },
  {
    provider: 'EE',
    providerSlug: 'ee',
    packageName: 'EE Broadband + Full Works TV pack',
    monthlyPrice: 110.99,
    broadbandSpeedMbps: 100,
    contractMonths: 24,
    contentTags: ['sport', 'movies', 'general'],
    highlights: ['The widest EE TV pack: Big Sport-level sport plus wider entertainment and Cinema', 'Broadband from £22.99/mo plus the £88/mo Full Works pack'],
    priceRiseNote: 'Scheduled rise each 31 March: broadband +£4/mo, TV +£2/mo.',
    priceRise: { type: 'annual-april', amount: 6 },
    setup: {
      fee: null,
      note: 'EE has not published a setup fee for this pack. Confirm it at checkout.',
      checkedDate: '2026-10-14',
    },
    reviewHref: '/providers/ee',
  },
]

export const tvBundleContentTagLabels: Record<TvBundleContentTag, string> = {
  sport: 'Live sport',
  movies: 'Movies & entertainment',
  kids: 'Kids',
  general: 'General viewing',
  flexible: 'Flexible / no long contract',
}
