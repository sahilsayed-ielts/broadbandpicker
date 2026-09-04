'use client'

import { useState, useMemo } from 'react'
import type { Provider } from '@/types'
import AffiliateCTA from './AffiliateCTA'
import SpeedBadge from './SpeedBadge'
import ProviderLogo from './ProviderLogo'
import SaveDealButton from './SaveDealButton'
import { trackEvent } from '@/lib/analytics'

interface DealRow {
  provider: Provider
  packageName: string
  download: number
  upload: number
  type: string
  monthlyPrice: number
  contractLength: number
  setupFee: number
  badge?: 'Best Value' | 'Fastest' | "Editor's Pick"
}

interface DealTableProps {
  deals: DealRow[]
  showDisclosure?: boolean
  compact?: boolean
}

type SortKey = 'price' | 'speed' | 'rating'

export default function DealTable({ deals, showDisclosure = true, compact = false }: DealTableProps) {
  const [sort, setSort] = useState<SortKey>('price')

  const sorted = useMemo(() => {
    return [...deals].sort((a, b) => {
      if (sort === 'price') return a.monthlyPrice - b.monthlyPrice
      if (sort === 'speed') return b.download - a.download
      if (sort === 'rating') return (b.provider.trustpilotScore ?? 0) - (a.provider.trustpilotScore ?? 0)
      return 0
    })
  }, [deals, sort])

  // Computed from the current row set, not hand-picked — the cheapest,
  // fastest and highest-rated deal in view each earn one badge. A deal can
  // hold more than one if it genuinely wins on more than one measure.
  const badges = useMemo(() => {
    if (deals.length === 0) return new Map<DealRow, DealRow['badge']>()
    const cheapest = deals.reduce((a, b) => (b.monthlyPrice < a.monthlyPrice ? b : a))
    const fastest = deals.reduce((a, b) => (b.download > a.download ? b : a))
    const bestRated = deals.reduce((a, b) => ((b.provider.trustpilotScore ?? 0) > (a.provider.trustpilotScore ?? 0) ? b : a))
    const map = new Map<DealRow, DealRow['badge']>()
    map.set(cheapest, 'Best Value')
    if (!map.has(fastest)) map.set(fastest, 'Fastest')
    if (!map.has(bestRated)) map.set(bestRated, "Editor's Pick")
    return map
  }, [deals])

  const badgeStyle: Record<string, string> = {
    'Best Value': 'bg-green-100 text-green-800',
    Fastest: 'bg-sky-100 text-sky-800',
    "Editor's Pick": 'bg-amber-100 text-amber-800',
  }

  function updateSort(next: SortKey) {
    setSort(next)
    trackEvent('deal_sort_changed', { sort_order: next, visible_deals: deals.length })
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-3 flex-wrap">
        <span className="text-sm text-slate-500 font-medium">Sort by:</span>
        {(['price', 'speed', 'rating'] as SortKey[]).map((k) => (
          <button
            key={k}
            onClick={() => updateSort(k)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              sort === k
                ? 'bg-sky-700 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {k === 'price' ? 'Cheapest first' : k === 'speed' ? 'Fastest first' : 'Best rated'}
          </button>
        ))}
      </div>

      {showDisclosure && (
        <p className="text-xs text-slate-500 mb-3">
          We may earn a commission when you click a &ldquo;Get Deal&rdquo; button. This does not affect our editorial independence.
        </p>
      )}

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th scope="col" className="text-left px-4 py-3 font-semibold text-slate-700">Provider</th>
              <th scope="col" className="text-left px-4 py-3 font-semibold text-slate-700">Speed</th>
              <th scope="col" className="text-left px-4 py-3 font-semibold text-slate-700">Monthly price</th>
              <th scope="col" className="text-left px-4 py-3 font-semibold text-slate-700">Contract</th>
              {!compact && <th scope="col" className="text-left px-4 py-3 font-semibold text-slate-700">Setup</th>}
              <th scope="col" className="px-4 py-3"><span className="sr-only">Affiliate link</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sorted.map((deal, i) => (
              <tr key={i} className="bg-white hover:bg-slate-50 transition-colors">
                <td className="px-4 py-4">
                  <ProviderLogo
                    slug={deal.provider.slug}
                    name={deal.provider.name}
                    width={72}
                    height={36}
                    preload={i === 0}
                  />
                  {badges.has(deal) && (
                    <span className={`mt-1.5 inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${badgeStyle[badges.get(deal)!]}`}>
                      {badges.get(deal)}
                    </span>
                  )}
                </td>
                <td className="px-4 py-4">
                  <div className="font-semibold text-slate-900">{deal.download} Mbps</div>
                  <SpeedBadge download={deal.download} className="mt-1" />
                </td>
                <td className="px-4 py-4">
                  <span className="text-xl font-bold text-slate-900">£{deal.monthlyPrice.toFixed(2)}</span>
                  <span className="text-slate-500 text-xs">/mo</span>
                </td>
                <td className="px-4 py-4 text-slate-600">{deal.contractLength} months</td>
                {!compact && (
                  <td className="px-4 py-4 text-slate-600">
                    {deal.setupFee === 0 ? (
                      <span className="text-green-700 font-medium">Free</span>
                    ) : (
                      `£${deal.setupFee}`
                    )}
                  </td>
                )}
                <td className="px-4 py-4">
                  <div className="flex items-center gap-1">
                    <AffiliateCTA
                      href={deal.provider.affiliateUrl}
                      providerName={deal.provider.name}
                      providerSlug={deal.provider.slug}
                      placement="deal_table"
                      size="sm"
                    />
                    <SaveDealButton
                      providerSlug={deal.provider.slug}
                      providerName={deal.provider.name}
                      packageName={deal.packageName}
                      monthlyPrice={deal.monthlyPrice}
                      download={deal.download}
                      contractLength={deal.contractLength}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
