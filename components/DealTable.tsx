'use client'

import { useState, useMemo } from 'react'
import type { Provider } from '@/types'
import AffiliateCTA from './AffiliateCTA'
import SpeedBadge from './SpeedBadge'
import ProviderLogo from './ProviderLogo'

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

  return (
    <div>
      <div className="flex items-center gap-3 mb-3 flex-wrap">
        <span className="text-sm text-slate-500 font-medium">Sort by:</span>
        {(['price', 'speed', 'rating'] as SortKey[]).map((k) => (
          <button
            key={k}
            onClick={() => setSort(k)}
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
                  <AffiliateCTA
                    href={deal.provider.affiliateUrl}
                    providerName={deal.provider.name}
                    providerSlug={deal.provider.slug}
                    size="sm"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
