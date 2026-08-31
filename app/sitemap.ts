import type { MetadataRoute } from 'next'
import { providers, providerDatasetUpdatedDate } from '@/data/providers'
import { guides } from '@/data/guides'
import { providerComparisons } from '@/data/provider-comparisons'
import { priorityPages } from '@/data/priority-pages'
import { HOMEPAGE_UPDATED, SITE_URL } from '@/lib/siteSchema'

const DEALS_MODIFIED = providerDatasetUpdatedDate
const TRUST_MODIFIED = HOMEPAGE_UPDATED
const HUB_MODIFIED = HOMEPAGE_UPDATED > DEALS_MODIFIED ? HOMEPAGE_UPDATED : DEALS_MODIFIED

function laterDate(a: string, b: string): string {
  return a > b ? a : b
}

export default function sitemap(): MetadataRoute.Sitemap {
  const homepage: MetadataRoute.Sitemap[number] = {
    url: SITE_URL,
    lastModified: HOMEPAGE_UPDATED,
    changeFrequency: 'daily',
    priority: 1.0,
    images: [`${SITE_URL}/logo.png`, `${SITE_URL}/illustrations/hero-network.svg`],
  }

  const staticPages: MetadataRoute.Sitemap = [
    homepage,
    { url: `${SITE_URL}/compare`, lastModified: HUB_MODIFIED, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/deals`, lastModified: HUB_MODIFIED, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/providers`, lastModified: HUB_MODIFIED, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/providers/compare`, lastModified: HUB_MODIFIED, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE_URL}/guides`, lastModified: HUB_MODIFIED, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE_URL}/speed-test`, lastModified: laterDate('2026-08-23', HOMEPAGE_UPDATED), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/tools/broadband-cost-calculator`, lastModified: laterDate('2026-08-23', HOMEPAGE_UPDATED), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/tools/broadband-match`, lastModified: laterDate('2026-08-23', HOMEPAGE_UPDATED), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/about`, lastModified: TRUST_MODIFIED, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${SITE_URL}/contact`, lastModified: TRUST_MODIFIED, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${SITE_URL}/privacy-policy`, lastModified: '2026-06-19', changeFrequency: 'monthly', priority: 0.2 },
    { url: `${SITE_URL}/cookie-policy`, lastModified: '2026-06-19', changeFrequency: 'monthly', priority: 0.2 },
    { url: `${SITE_URL}/terms`, lastModified: '2026-06-19', changeFrequency: 'monthly', priority: 0.2 },
    { url: `${SITE_URL}/broadband-glossary`, lastModified: TRUST_MODIFIED, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/how-we-make-money`, lastModified: TRUST_MODIFIED, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${SITE_URL}/how-we-review-broadband`, lastModified: TRUST_MODIFIED, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${SITE_URL}/editorial-policy`, lastModified: TRUST_MODIFIED, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${SITE_URL}/llms.txt`, lastModified: HOMEPAGE_UPDATED, changeFrequency: 'monthly', priority: 0.2 },
    { url: `${SITE_URL}/llms-full.txt`, lastModified: HOMEPAGE_UPDATED, changeFrequency: 'monthly', priority: 0.2 },
    { url: `${SITE_URL}/feed.xml`, lastModified: HOMEPAGE_UPDATED, changeFrequency: 'weekly', priority: 0.3 },
  ]

  const providerPages: MetadataRoute.Sitemap = providers.map((p) => ({
    url: `${SITE_URL}/providers/${p.slug}`,
    lastModified: p.pricingVerifiedDate ?? DEALS_MODIFIED,
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  const guidePages: MetadataRoute.Sitemap = guides.map((g) => ({
    url: `${SITE_URL}/guides/${g.slug}`,
    lastModified: g.updatedDate,
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  const providerComparisonPages: MetadataRoute.Sitemap = providerComparisons.map((comparison) => ({
    url: `${SITE_URL}/providers/compare/${comparison.slug}`,
    lastModified: comparison.updatedDate,
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  const priorityLandingPages: MetadataRoute.Sitemap = Object.values(priorityPages)
    .filter((page) => !page.path.startsWith('/postcode/') && page.path !== '/postcode')
    .map((page) => ({
      url: `${SITE_URL}${page.path}`,
      lastModified: page.updated,
      changeFrequency: page.path.includes('/deals') ? 'weekly' : 'monthly',
      priority: 0.8,
    }))

  const seen = new Set<string>()
  const entries = [
    ...staticPages,
    ...providerPages,
    ...providerComparisonPages,
    ...guidePages,
    ...priorityLandingPages,
  ]
  return entries.filter((entry) => {
    if (seen.has(entry.url)) return false
    seen.add(entry.url)
    return true
  })
}
