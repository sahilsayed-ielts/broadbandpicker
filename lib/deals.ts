import { providers } from '@/data/providers'
import { dealId } from '@/lib/dealId'
import type { Deal, Provider } from '@/types'

/**
 * The national deal list shown on /deals. Price-drop alerts and the daily
 * alert cron read the same list, so the price a visitor saved is always the
 * price we compare against later.
 *
 * Only real prices are listed: every checked package where the provider has
 * a price check (data/provider-price-checks.json), otherwise the provider's
 * single verified entry package. Faster tiers without a checked price are
 * left out rather than estimated.
 */
export function getAllDeals(): Deal[] {
  return providers.flatMap((p): Deal[] => {
    if (p.packages && p.packages.length > 0) {
      return p.packages.map((pkg) => ({
        provider: p,
        packageName: `${p.name} ${pkg.packageName}`,
        download: pkg.download,
        upload: pkg.upload,
        type: pkg.type,
        monthlyPrice: pkg.monthlyPrice,
        contractLength: pkg.contractLength,
        setupFee: pkg.setupFee ?? p.setupFee,
        minGuaranteedMbps: pkg.minGuaranteedMbps,
        priceRises: pkg.priceRises,
      }))
    }
    const entry = p.speeds[0]
    return [{
      provider: p,
      packageName: `${p.name} ${entry.type} ${entry.download}Mbps`,
      download: entry.download,
      upload: entry.upload,
      type: entry.type,
      monthlyPrice: p.monthlyPriceFrom,
      contractLength: p.contractLengths[0],
      setupFee: p.setupFee,
    }]
  })
}

export function findDealById(id: string): Deal | undefined {
  return getAllDeals().find((deal) => dealId(deal.provider.slug, deal.packageName) === id)
}

/** Cheapest live deals for emails: one row per provider, its cheapest real package. */
export function cheapestEntryDeals(count = 5): Deal[] {
  const byProvider = new Map<string, Deal>()
  for (const deal of getAllDeals()) {
    if (deal.provider.retiredDate) continue
    const current = byProvider.get(deal.provider.slug)
    if (!current || deal.monthlyPrice < current.monthlyPrice) byProvider.set(deal.provider.slug, deal)
  }
  return [...byProvider.values()]
    .sort((a, b) => a.monthlyPrice - b.monthlyPrice || a.provider.name.localeCompare(b.provider.name))
    .slice(0, count)
}

/** The real package that best fits a speed need, when the provider's packages are checked. */
export function packageForSpeed(provider: Provider, minDownload: number): Deal | undefined {
  const deals = getAllDeals().filter((d) => d.provider.slug === provider.slug)
  if (!provider.packages) return undefined
  const fit = deals.filter((d) => d.download >= minDownload).sort((a, b) => a.monthlyPrice - b.monthlyPrice || a.download - b.download)[0]
  return fit ?? [...deals].sort((a, b) => b.download - a.download)[0]
}
