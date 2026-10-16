import indexData from '@/data/price-index.json'

/** Monthly UK Broadband Price Index, built by scripts/build_price_index.py. */

export type IndexSummary = { providers: number; cheapest: number | null; median: number | null; average: number | null }
export type IndexMonth = IndexSummary & {
  month: string
  source: string
  carried: boolean
  /** Providers whose price was re-checked on their own website during this month. */
  rechecked?: number
  prices: Record<string, number>
  basket: IndexSummary
}

type IndexFile = {
  generated: string
  basket: string[]
  method: string
  names: Record<string, string>
  verified: Record<string, string | null>
  months: IndexMonth[]
}

export const priceIndex = indexData as IndexFile

/** A price check older than this is shown as due for re-checking. */
export const STALE_AFTER_DAYS = 45

export function monthLabel(month: string): string {
  return new Date(`${month}-01T12:00:00Z`).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
}

export function ukDate(iso: string): string {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function latestMonth(): IndexMonth {
  return priceIndex.months[priceIndex.months.length - 1]
}

export function cheapestProvider(month: IndexMonth): { slug: string; name: string; price: number } {
  const [slug, price] = Object.entries(month.prices).sort((a, b) => a[1] - b[1] || a[0].localeCompare(b[0]))[0]
  return { slug, name: priceIndex.names[slug] ?? slug, price }
}

export type ProviderIndexRow = {
  slug: string
  name: string
  current: number
  previous: number | null
  first: number | null
  verified: string | null
  stale: boolean
}

export function providerRows(now = new Date()): ProviderIndexRow[] {
  const months = priceIndex.months
  const latest = months[months.length - 1]
  const prev = months.length > 1 ? months[months.length - 2] : null
  const first = months[0]
  return Object.entries(latest.prices)
    .map(([slug, current]) => {
      const verified = priceIndex.verified[slug] ?? null
      const ageDays = verified ? (now.getTime() - new Date(`${verified}T12:00:00Z`).getTime()) / 86_400_000 : Infinity
      return {
        slug,
        name: priceIndex.names[slug] ?? slug,
        current,
        previous: prev?.prices[slug] ?? null,
        first: first.prices[slug] ?? null,
        verified,
        stale: ageDays > STALE_AFTER_DAYS,
      }
    })
    .sort((a, b) => a.current - b.current || a.name.localeCompare(b.name))
}

/** Oldest and newest price-check dates across providers in the latest month. */
export function checkRange(): { oldest: string | null; newest: string | null; staleCount: number; total: number } {
  const rows = providerRows()
  const dates = rows.map((r) => r.verified).filter((d): d is string => Boolean(d)).sort()
  return { oldest: dates[0] ?? null, newest: dates[dates.length - 1] ?? null, staleCount: rows.filter((r) => r.stale).length, total: rows.length }
}

export function indexCsv(): string {
  const months = priceIndex.months
  const slugs = Object.keys(priceIndex.names).filter((slug) => months.some((m) => slug in m.prices)).sort()
  const header = ['provider_slug', 'provider_name', ...months.map((m) => m.month), 'last_price_check'].join(',')
  const lines = slugs.map((slug) => [
    slug,
    `"${(priceIndex.names[slug] ?? slug).replace(/"/g, '""')}"`,
    ...months.map((m) => (slug in m.prices ? m.prices[slug].toFixed(2) : '')),
    priceIndex.verified[slug] ?? '',
  ].join(','))
  const basket = ['_basket_median', '"Like-for-like basket median"', ...months.map((m) => m.basket.median?.toFixed(2) ?? ''), ''].join(',')
  return [header, ...lines, basket].join('\n') + '\n'
}
