import { providers } from '@/data/providers'
import { dealId } from '@/lib/dealId'
import type { Deal } from '@/types'

/**
 * The national deal list shown on /deals. Price-drop alerts and the daily
 * alert cron read the same list, so the price a visitor saved is always the
 * price we compare against later.
 *
 * Tier 0 is the provider's verified entry price (monthlyPriceFrom). Higher
 * tiers are still estimated as entry + £5 per step, which is why anything
 * that publishes prices as data (the price index) uses entry prices only.
 */
export function getAllDeals(): Deal[] {
  return providers.flatMap((p) =>
    p.speeds.map((s, i) => ({
      provider: p,
      packageName: `${p.name} ${s.type} ${s.download}Mbps`,
      download: s.download,
      upload: s.upload,
      type: s.type,
      monthlyPrice: i === 0 ? p.monthlyPriceFrom : p.monthlyPriceFrom + i * 5,
      contractLength: p.contractLengths[0],
      setupFee: p.setupFee,
    }))
  )
}

export function findDealById(id: string): Deal | undefined {
  return getAllDeals().find((deal) => dealId(deal.provider.slug, deal.packageName) === id)
}

/** Cheapest live deals for emails: one row per provider, entry price only. */
export function cheapestEntryDeals(count = 5): Deal[] {
  return providers
    .filter((p) => !p.retiredDate)
    .map((p) => ({
      provider: p,
      packageName: `${p.name} ${p.speeds[0].type} ${p.speeds[0].download}Mbps`,
      download: p.speeds[0].download,
      upload: p.speeds[0].upload,
      type: p.speeds[0].type,
      monthlyPrice: p.monthlyPriceFrom,
      contractLength: p.contractLengths[0],
      setupFee: p.setupFee,
    }))
    .sort((a, b) => a.monthlyPrice - b.monthlyPrice || a.provider.name.localeCompare(b.provider.name))
    .slice(0, count)
}
