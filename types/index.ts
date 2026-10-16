export interface SpeedOption {
  download: number
  upload: number
  type: 'ADSL' | 'FTTC' | 'FTTP' | 'Cable' | '5G'
}

/** One real, priced package, checked on the provider's own website. */
export interface VerifiedPackage {
  packageName: string
  download: number
  upload: number
  type: SpeedOption['type']
  monthlyPrice: number
  contractLength: number
  /** Minimum guaranteed download speed, where the provider states one. */
  minGuaranteedMbps?: number
  /** Scheduled in-contract price changes stated by the provider (date it applies from). */
  priceRises?: { from: string; monthlyPrice: number }[]
  /** Price change after an introductory period, e.g. month 13 of a 24-month contract. */
  priceSteps?: { afterMonth: number; monthlyPrice: number }[]
  /** Set when this package's setup fee differs from the provider-level one. */
  setupFee?: number
}

export interface ProviderPriceCheck {
  checkedAt: string
  sourceUrl: string
  sourceLabel: string
  setupFee: number
  setupNote?: string
  /** Every package with its own checked price. Empty for an entry-price-only check. */
  packages: VerifiedPackage[]
  /** Entry-price-only check: the cheapest advertised price and the download speed it is for. */
  entryPrice?: number
  entryDownload?: number
  notes: string[]
}

export interface ProviderPriceChecksFile {
  /** How the checks were made; shown in methodology. */
  method: string
  providers: Record<string, ProviderPriceCheck>
}

export interface Provider {
  slug: string
  name: string
  logo: string
  affiliateUrl: string
  speeds: SpeedOption[]
  monthlyPriceFrom: number
  contractLengths: number[]
  setupFee: number
  trustpilotScore: number
  coveragePercent: number
  highlights: string[]
  pros: string[]
  cons: string[]
  retiredDate?: string
  successorName?: string
  successorUrl?: string
  excerpt?: string
  contentSections?: {
    heading: string
    paragraphs: string[]
  }[]
  faqItems?: FAQItem[]
  reviewedDate: string
  pricingVerifiedDate: string
  reviewSources: {
    label: string
    href: string
    note: string
  }[]
  awinProgramId: string | null
  /** Present only when every package price was checked (data/provider-price-checks.json). */
  packages?: VerifiedPackage[]
  priceCheckNotes?: string[]
}

export interface Deal {
  provider: Provider
  packageName: string
  download: number
  upload: number
  type: SpeedOption['type']
  monthlyPrice: number
  contractLength: number
  setupFee: number
  badge?: 'Best Value' | 'Fastest' | "Editor's Pick"
  minGuaranteedMbps?: number
  priceRises?: { from: string; monthlyPrice: number }[]
}

export interface ProviderLiveOffer {
  packageName: string
  download: number
  upload: number
  type: SpeedOption['type']
  monthlyPrice: number
  contractLength: number
  setupFee: number
  sourceUrl: string
}

export interface ProviderLiveSnapshot {
  slug: string
  providerName: string
  sourceLabel: string
  sourceUrl: string
  affiliateUrl: string
  verifiedAt: string
  extractionMethod: string
  offers: ProviderLiveOffer[]
  notes: string[]
}

export interface ProviderLiveDealsFile {
  generatedAt: string | null
  providers: Record<string, ProviderLiveSnapshot>
}

export interface PostcodeArea {
  prefix: string
  town: string
  city: string
  region: string
  populationTier: 'high' | 'medium' | 'low'
  availableProviders: string[]
  avgDownloadSpeed: number
  cheapestMonthly: number
}

export interface Guide {
  slug: string
  title: string
  metaTitle: string
  metaDescription: string
  publishDate: string
  updatedDate: string
  wordCount: number
  content: string
  faqItems: { question: string; answer: string }[]
}

export interface FAQItem {
  question: string
  answer: string
}

export interface BreadcrumbItem {
  name: string
  href: string
}
