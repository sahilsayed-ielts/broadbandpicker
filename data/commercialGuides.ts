/**
 * Guides rendered with the deals-first commercial layout
 * (components/CommercialGuideLayout.tsx) instead of the article layout.
 *
 * Pilot of the guide redesign plan (docs/home page UX/guide-redesign-plan.html):
 * "best X deals" searches are answered by Google with deal pages, so these
 * guides lead with a verdict, a postcode check and deal cards, and keep the
 * full editorial content underneath. Add a slug here only when the guide has
 * structured deal data to show in its deals block.
 */

export interface CommercialGuidePick {
  /** Need this pick serves, e.g. "Best for TV-first homes". */
  label: string
  provider: string
  providerSlug: string
  reason: string
  /** Lowest listed monthly price for this provider on the page. */
  fromPrice: number
}

/** One option in the hero's "What matters most to you?" selector. */
export interface CommercialGuideNeed {
  id: string
  label: string
  /** Bundle shown as the pick; null = whichever has the lowest total cost. */
  packageName: string | null
  pickLabel: string
  reason: string
  /** Filter and sort applied to the deal cards when chosen. */
  watch: ('sport' | 'movies' | 'kids' | 'general' | 'flexible')[]
  sort: 'monthly' | 'total' | 'speed'
}

export interface CommercialGuideConfig {
  heroEyebrow: string
  /** Shown in the hero's logo rail: when prices and fees were last checked. */
  checkedNote: string
  needs: CommercialGuideNeed[]
  dealsTitle: string
  dealsIntro: string
  /** Sticky mobile action label. */
  mobileCta: string
  picks: CommercialGuidePick[]
  /** Package name -> label shown on that deal card. */
  cardPicks: Record<string, string>
  /** Up to three related guides, chosen by reader intent. */
  relatedSlugs: string[]
  /** id of the on-page methodology heading, linked from beside the deals. */
  methodologyAnchor: string
}

export const commercialGuides: Record<string, CommercialGuideConfig> = {
  'best-broadband-and-tv-deals': {
    heroEyebrow: 'Broadband and TV bundles',
    checkedNote: 'Prices checked 24 Aug and 1 Sep 2026 · Setup costs checked 14 Oct 2026',
    needs: [
      {
        id: 'tv',
        label: 'TV and films',
        packageName: 'Sky Stream, Sky Essential TV + Full Fibre 300',
        pickLabel: 'Our pick for TV-first homes',
        reason: 'Sky channels, streaming inclusions and sports options in one ecosystem.',
        watch: ['general'],
        sort: 'monthly',
      },
      {
        id: 'sport',
        label: 'Live sport',
        packageName: 'EE Broadband + Big Sport TV pack',
        pickLabel: 'Our pick for TNT Sports',
        reason: 'NOW-powered packs can combine entertainment, cinema, Sky Sports and TNT Sports.',
        watch: ['sport'],
        sort: 'monthly',
      },
      {
        id: 'fast',
        label: 'Fast broadband + big TV',
        packageName: 'Max Volt (broadband, mobile SIM and TV 360)',
        pickLabel: 'Our pick for fast broadband plus a large TV bundle',
        reason: 'Broad channel bundles, premium packs and broadband up to gigabit tiers where available.',
        watch: [],
        sort: 'speed',
      },
      {
        id: 'value',
        label: 'Lowest total cost',
        packageName: null,
        pickLabel: 'Lowest total over the contract',
        reason: 'Every monthly payment, published price rise and setup fee added up.',
        watch: [],
        sort: 'total',
      },
    ],
    dealsTitle: 'Broadband and TV bundles compared',
    dealsIntro: 'Totals add up every month of the contract plus setup, including the price rises and fees each provider has published.',
    mobileCta: 'See the broadband and TV bundles',
    picks: [
      {
        label: 'Best overall for TV-first homes',
        provider: 'Sky',
        providerSlug: 'sky',
        reason: 'Sky channels, streaming inclusions and sports options in one ecosystem.',
        fromPrice: 35,
      },
      {
        label: 'Best for fast broadband plus a large TV bundle',
        provider: 'Virgin Media',
        providerSlug: 'virgin-media',
        reason: 'Broad channel bundles, premium packs and broadband up to gigabit tiers where available.',
        fromPrice: 74.99,
      },
      {
        label: 'Best for flexible TV packs and TNT Sports',
        provider: 'EE TV',
        providerSlug: 'ee',
        reason: 'NOW-powered packs can combine entertainment, cinema, Sky Sports and TNT Sports.',
        fromPrice: 44.99,
      },
    ],
    cardPicks: {
      'Sky Stream, Sky Essential TV + Full Fibre 300': 'Our pick: TV-first homes',
      'Max Volt (broadband, mobile SIM and TV 360)': 'Our pick: fast broadband + big TV',
      'EE Broadband + Big Sport TV pack': 'Our pick: TNT Sports',
    },
    relatedSlugs: [
      'broadband-deals-with-no-mid-contract-price-rise',
      'best-broadband-for-streaming',
      'broadband-speeds-explained',
    ],
    methodologyAnchor: 'our-broadband-and-tv-bundle-methodology',
  },
}

export function getCommercialGuide(slug: string): CommercialGuideConfig | undefined {
  return commercialGuides[slug]
}
