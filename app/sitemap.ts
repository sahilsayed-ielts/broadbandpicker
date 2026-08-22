import type { MetadataRoute } from 'next'
import { providers } from '@/data/providers'
import { guides } from '@/data/guides'
import { providerComparisons } from '@/data/provider-comparisons'
import { getAllPostcodePrefixes } from '@/data/postcodes'
import { getAllDistrictCoveragePrefixes } from '@/data/postcodeDistrictCoverage'
import { priorityPages } from '@/data/priority-pages'

const BASE_URL = 'https://broadbandpicker.co.uk'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE_URL}/compare`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/deals`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/providers`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/providers/compare`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE_URL}/guides`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE_URL}/speed-test`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/tools/broadband-cost-calculator`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/tools/broadband-match`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${BASE_URL}/contact`, lastModified: now, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${BASE_URL}/privacy-policy`, lastModified: now, changeFrequency: 'monthly', priority: 0.2 },
    { url: `${BASE_URL}/cookie-policy`, lastModified: now, changeFrequency: 'monthly', priority: 0.2 },
    { url: `${BASE_URL}/terms`, lastModified: now, changeFrequency: 'monthly', priority: 0.2 },
    { url: `${BASE_URL}/broadband-glossary`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/how-we-make-money`, lastModified: now, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${BASE_URL}/how-we-review-broadband`, lastModified: now, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${BASE_URL}/editorial-policy`, lastModified: now, changeFrequency: 'monthly', priority: 0.3 },
  ]

  const providerPages: MetadataRoute.Sitemap = providers.map((p) => ({
    url: `${BASE_URL}/providers/${p.slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  const guidePages: MetadataRoute.Sitemap = guides.map((g) => ({
    url: `${BASE_URL}/guides/${g.slug}`,
    lastModified: new Date(g.updatedDate),
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  const providerComparisonPages: MetadataRoute.Sitemap = providerComparisons.map((comparison) => ({
    url: `${BASE_URL}/providers/compare/${comparison.slug}`,
    lastModified: new Date(comparison.updatedDate),
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  const priorityLandingPages: MetadataRoute.Sitemap = Object.values(priorityPages).map((page) => ({
    url: `${BASE_URL}${page.path}`,
    lastModified: new Date(page.updated),
    changeFrequency: page.path.includes('/deals') ? 'weekly' : 'monthly',
    priority: page.path === '/postcode' ? 0.9 : 0.8,
  }))

  const curatedPrefixes = new Set(getAllPostcodePrefixes())

  const postcodePages: MetadataRoute.Sitemap = getAllPostcodePrefixes().map((prefix) => ({
    url: `${BASE_URL}/postcode/${prefix}`,
    lastModified: now,
    changeFrequency: 'daily',
    priority: 0.6,
  }))

  const districtCoveragePages: MetadataRoute.Sitemap = getAllDistrictCoveragePrefixes()
    .filter((prefix) => !curatedPrefixes.has(prefix))
    .map((prefix) => ({
      url: `${BASE_URL}/postcode/${prefix}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    }))

  return [...staticPages, ...providerPages, ...providerComparisonPages, ...guidePages, ...priorityLandingPages, ...postcodePages, ...districtCoveragePages]
}
