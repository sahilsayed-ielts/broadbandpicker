import type { MetadataRoute } from 'next'
import { getAllPostcodePrefixes, postcodeDatasetUpdatedDate } from '@/data/postcodes'
import { getAllDistrictCoveragePrefixes } from '@/data/postcodeDistrictCoverage'
import { priorityPages } from '@/data/priority-pages'
import { providerDatasetUpdatedDate } from '@/data/providers'
import { HOMEPAGE_UPDATED, SITE_URL } from '@/lib/siteSchema'

function laterDate(a: string, b: string): string {
  return a > b ? a : b
}

export default function sitemap(): MetadataRoute.Sitemap {
  const curatedPrefixes = new Set(getAllPostcodePrefixes().map((prefix) => prefix.toLowerCase()))
  const seen = new Set<string>()
  const entries: MetadataRoute.Sitemap = []

  function add(entry: MetadataRoute.Sitemap[number]) {
    if (seen.has(entry.url)) return
    seen.add(entry.url)
    entries.push(entry)
  }

  for (const page of Object.values(priorityPages)) {
    if (page.path !== '/postcode' && !page.path.startsWith('/postcode/')) continue
    add({
      url: `${SITE_URL}${page.path}`,
      lastModified: page.path === '/postcode' ? laterDate(page.updated, HOMEPAGE_UPDATED) : page.updated,
      changeFrequency: page.path === '/postcode' ? 'weekly' : 'monthly',
      priority: page.path === '/postcode' ? 0.9 : 0.8,
    })
  }

  for (const prefix of getAllPostcodePrefixes()) {
    add({
      url: `${SITE_URL}/postcode/${prefix.toLowerCase()}`,
      lastModified: providerDatasetUpdatedDate,
      changeFrequency: 'weekly',
      priority: 0.6,
    })
  }

  for (const prefix of getAllDistrictCoveragePrefixes()) {
    if (curatedPrefixes.has(prefix.toLowerCase())) continue
    add({
      url: `${SITE_URL}/postcode/${prefix.toLowerCase()}`,
      lastModified: postcodeDatasetUpdatedDate,
      changeFrequency: 'monthly',
      priority: 0.5,
    })
  }

  return entries
}
