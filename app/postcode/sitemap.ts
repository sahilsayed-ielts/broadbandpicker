import type { MetadataRoute } from 'next'
import { getAllPostcodePrefixes, postcodeDatasetUpdatedDate } from '@/data/postcodes'
import { getAllDistrictCoveragePrefixes } from '@/data/postcodeDistrictCoverage'
import { priorityPages } from '@/data/priority-pages'
import { providerDatasetUpdatedDate } from '@/data/providers'
import { HOMEPAGE_UPDATED, SITE_URL } from '@/lib/siteSchema'

const POSTCODE_CONTENT_REFRESH_DATES: Record<string, string> = {
  cr0: '2026-10-13',
  n1: '2026-10-13',
  le1: '2026-09-05',
  sg1: '2026-09-05',
  cf10: '2026-09-05',
  ls1: '2026-09-04',
  ox1: '2026-09-04',
  bs3: '2026-09-04',
  g1: '2026-09-04',
  l8: '2026-09-04',
  cv1: '2026-09-04',
  b1: '2026-09-04',
  ls2: '2026-09-04',
  l1: '2026-09-04',
  lu1: '2026-09-04',
  so14: '2026-09-04',
  w5: '2026-09-04',
  nw1: '2026-09-04',
  en1: '2026-09-04',
  ub1: '2026-09-04',
  e1: '2026-09-04',
  sw1: '2026-09-04',
  se1: '2026-09-04',
  ha1: '2026-09-04',
  bn1: '2026-09-01',
  gu1: '2026-09-01',
  bs1: '2026-08-31',
  ct1: '2026-08-31',
  m1: '2026-08-31',
  ne1: '2026-08-31',
  ng1: '2026-08-31',
  rg1: '2026-08-31',
  rm1: '2026-08-31',
}

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
    const normalisedPrefix = prefix.toLowerCase()
    const contentRefreshDate = POSTCODE_CONTENT_REFRESH_DATES[normalisedPrefix]
    add({
      url: `${SITE_URL}/postcode/${normalisedPrefix}`,
      lastModified: contentRefreshDate
        ? laterDate(contentRefreshDate, providerDatasetUpdatedDate)
        : providerDatasetUpdatedDate,
      changeFrequency: 'weekly',
      priority: contentRefreshDate ? 0.8 : 0.6,
    })
  }

  // Ofcom-only districts render on demand from district coverage data.
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
