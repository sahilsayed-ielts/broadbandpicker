export interface SpeedOption {
  download: number
  upload: number
  type: 'ADSL' | 'FTTC' | 'FTTP' | 'Cable' | '5G'
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
