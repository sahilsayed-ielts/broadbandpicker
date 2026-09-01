'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { trackEvent } from '@/lib/analytics'
import { tvBundleOptions, tvBundleContentTagLabels, type TvBundleContentTag } from '@/data/tvBroadbandBundles'

const TAGS = Object.keys(tvBundleContentTagLabels) as TvBundleContentTag[]
type SortKey = 'price' | 'speed'

export default function TvBundleComparisonTable() {
  const [activeTags, setActiveTags] = useState<TvBundleContentTag[]>([])
  const [sortKey, setSortKey] = useState<SortKey>('price')
  const [interacted, setInteracted] = useState(false)

  function toggleTag(tag: TvBundleContentTag) {
    setActiveTags((current) => {
      const next = current.includes(tag) ? current.filter((t) => t !== tag) : [...current, tag]
      if (!interacted) {
        setInteracted(true)
        trackEvent('tv_bundle_tool_started', { first_filter: tag })
      }
      trackEvent('tv_bundle_filter_change', { tags: next.join(',') || 'none' })
      return next
    })
  }

  function changeSort(key: SortKey) {
    setSortKey(key)
    trackEvent('tv_bundle_sort_change', { sort: key })
  }

  const results = useMemo(() => {
    const filtered = activeTags.length
      ? tvBundleOptions.filter((bundle) => activeTags.some((tag) => bundle.contentTags.includes(tag)))
      : tvBundleOptions
    return [...filtered].sort((a, b) =>
      sortKey === 'price' ? a.monthlyPrice - b.monthlyPrice : b.broadbandSpeedMbps - a.broadbandSpeedMbps
    )
  }, [activeTags, sortKey])

  return (
    <div className="not-prose my-8 rounded-xl border border-slate-200 bg-white p-5">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-1">Interactive comparison</p>
      <h3 className="text-lg font-bold text-slate-900 mb-3">Find a broadband and TV bundle for what you actually watch</h3>

      <div className="mb-4">
        <span className="mb-2 block text-sm font-semibold text-slate-700">I mainly want:</span>
        <div className="flex flex-wrap gap-2">
          {TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              aria-pressed={activeTags.includes(tag)}
              className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                activeTags.includes(tag)
                  ? 'border-sky-500 bg-sky-50 text-sky-700'
                  : 'border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              {tvBundleContentTagLabels[tag]}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4 flex items-center gap-2 text-sm">
        <span className="font-semibold text-slate-700">Sort by:</span>
        <button
          type="button"
          onClick={() => changeSort('price')}
          className={`rounded-lg px-3 py-1.5 font-medium ${sortKey === 'price' ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
        >
          Lowest price
        </button>
        <button
          type="button"
          onClick={() => changeSort('speed')}
          className={`rounded-lg px-3 py-1.5 font-medium ${sortKey === 'speed' ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
        >
          Fastest broadband
        </button>
      </div>

      {results.length === 0 ? (
        <p className="text-sm text-slate-600">
          No packages match every filter selected. Try removing one to see more options.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50">
                {['Provider', 'Package', 'From', 'Broadband speed', 'Contract', 'Watch out for'].map((heading) => (
                  <th key={heading} scope="col" className="border border-slate-200 px-3 py-2 text-left font-semibold text-slate-700">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {results.map((bundle) => (
                <tr key={bundle.packageName} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-3 py-3 font-semibold text-slate-900">
                    <Link href={bundle.reviewHref} className="hover:underline">{bundle.provider}</Link>
                  </td>
                  <td className="px-3 py-3 text-slate-700">
                    {bundle.packageName}
                    <ul className="mt-1 list-disc pl-4 text-xs text-slate-500">
                      {bundle.highlights.map((h) => <li key={h}>{h}</li>)}
                    </ul>
                  </td>
                  <td className="px-3 py-3 font-semibold text-slate-900 whitespace-nowrap">£{bundle.monthlyPrice.toFixed(2)}/mo</td>
                  <td className="px-3 py-3 text-slate-700 whitespace-nowrap">{bundle.broadbandSpeedMbps} Mbps</td>
                  <td className="px-3 py-3 text-slate-700 whitespace-nowrap">{bundle.contractMonths} months</td>
                  <td className="px-3 py-3 text-xs text-slate-500">{bundle.priceRiseNote}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="mt-3 text-xs text-slate-400">
        Example packages verified against provider sites and trade press (Sky, Virgin Media: 24 August
        2026; EE TV: 1 September 2026). Prices, packages and availability change by address — confirm
        the live quote before ordering.
      </p>
    </div>
  )
}
