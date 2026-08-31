export const SITE_URL = 'https://broadbandpicker.co.uk'
export const ORG_ID = `${SITE_URL}/#organisation`
export const WEBSITE_ID = `${SITE_URL}/#website`
export const LOGO_URL = `${SITE_URL}/logo.png`
/** Last material homepage / chrome / schema rebuild. Used by sitemap lastmod. */
export const HOMEPAGE_UPDATED = '2026-08-31'

export const organizationRef = { '@id': ORG_ID }
export const websiteRef = { '@id': WEBSITE_ID }

export const publisherOrganization = {
  '@type': 'Organization' as const,
  '@id': ORG_ID,
  name: 'BroadbandPicker',
  url: SITE_URL,
  logo: {
    '@type': 'ImageObject' as const,
    url: LOGO_URL,
    width: 1024,
    height: 1024,
  },
}

export const editorialAuthor = {
  '@type': 'Organization' as const,
  name: 'BroadbandPicker editorial team',
  url: `${SITE_URL}/about`,
}

export const siteOrganizationGraph = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': ORG_ID,
      name: 'BroadbandPicker',
      alternateName: ['BroadbandPicker.co.uk', 'broadbandpicker.co.uk'],
      url: `${SITE_URL}/`,
      logo: {
        '@type': 'ImageObject',
        url: LOGO_URL,
        width: 1024,
        height: 1024,
      },
      description: 'Independent UK broadband comparison. Rankings are not sold.',
      areaServed: { '@type': 'Country', name: 'United Kingdom' },
      sameAs: ['https://x.com/broadbandPicker', 'https://www.instagram.com/broadbandpicker/'],
      publishingPrinciples: `${SITE_URL}/editorial-policy`,
      ethicsPolicy: `${SITE_URL}/how-we-review-broadband`,
      ownershipFundingInfo: `${SITE_URL}/how-we-make-money`,
      contactPoint: [
        {
          '@type': 'ContactPoint',
          contactType: 'customer support',
          url: `${SITE_URL}/contact`,
          email: 'hello@broadbandpicker.co.uk',
          areaServed: 'GB',
          availableLanguage: 'English',
        },
        {
          '@type': 'ContactPoint',
          contactType: 'editorial',
          email: 'editorial@broadbandpicker.co.uk',
          url: `${SITE_URL}/contact`,
          areaServed: 'GB',
          availableLanguage: 'English',
        },
      ],
    },
    {
      '@type': 'WebSite',
      '@id': WEBSITE_ID,
      url: `${SITE_URL}/`,
      name: 'BroadbandPicker',
      inLanguage: 'en-GB',
      publisher: organizationRef,
      potentialAction: {
        '@type': 'SearchAction',
        target: `${SITE_URL}/postcode/{search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    },
  ],
}

export function priceValidUntil(isoDate: string): string {
  const stamp = isoDate.slice(0, 10)
  const date = new Date(`${stamp}T00:00:00.000Z`)
  if (Number.isNaN(date.getTime())) return stamp
  date.setUTCDate(date.getUTCDate() + 30)
  return date.toISOString().slice(0, 10)
}

export function articleJsonLd(input: {
  headline: string
  description: string
  url: string
  datePublished: string
  dateModified: string
  image?: string
  about?: unknown
  citation?: string[]
  articleSection?: string
  wordCount?: number
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${input.url}#article`,
    headline: input.headline,
    description: input.description,
    url: input.url,
    image: input.image ?? LOGO_URL,
    datePublished: input.datePublished,
    dateModified: input.dateModified,
    inLanguage: 'en-GB',
    isAccessibleForFree: true,
    mainEntityOfPage: { '@type': 'WebPage', '@id': input.url },
    author: editorialAuthor,
    publisher: publisherOrganization,
    ...(input.articleSection ? { articleSection: input.articleSection } : {}),
    ...(input.wordCount ? { wordCount: input.wordCount } : {}),
    ...(input.about ? { about: input.about } : {}),
    ...(input.citation?.length ? { citation: input.citation } : {}),
  }
}

export function softwareApplicationJsonLd(input: {
  name: string
  url: string
  description: string
  dateModified: string
}) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': ['SoftwareApplication', 'WebApplication'],
        '@id': `${input.url}#tool`,
        name: input.name,
        url: input.url,
        applicationCategory: 'BrowserApplication',
        operatingSystem: 'Any',
        browserRequirements: 'Requires JavaScript and a modern web browser',
        isAccessibleForFree: true,
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'GBP' },
        description: input.description,
        provider: organizationRef,
      },
      {
        '@type': 'WebPage',
        '@id': `${input.url}#webpage`,
        url: input.url,
        name: input.name,
        dateModified: input.dateModified,
        isPartOf: websiteRef,
        about: organizationRef,
        mainEntity: { '@id': `${input.url}#tool` },
        reviewedBy: editorialAuthor,
      },
    ],
  }
}
