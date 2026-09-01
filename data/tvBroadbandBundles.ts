export type TvBundleContentTag = 'sport' | 'movies' | 'kids' | 'general' | 'flexible'

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
