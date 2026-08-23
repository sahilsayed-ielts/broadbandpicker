'use client'

import { useState } from 'react'
import type { Provider } from '@/types'
import StickyFilterBar, { type FilterState } from './StickyFilterBar'
import DealTable from './DealTable'
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
}

interface DealsClientProps {
  allDeals: DealRow[]
}

const DEFAULT_FILTERS: FilterState = { speed: 'all', contract: 'all', price: 'all' }

export default function DealsClient({ allDeals }: DealsClientProps) {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS)

  const filtered = allDeals.filter((d) => {
    if (filters.speed !== 'all') {
      if (filters.speed === 'standard' && d.download >= 30) return false
      if (filters.speed === 'superfast' && (d.download < 30 || d.download >= 300)) return false
      if (filters.speed === 'ultrafast' && (d.download < 300 || d.download >= 900)) return false
      if (filters.speed === 'gigabit' && d.download < 900) return false
    }
    if (filters.contract !== 'all') {
      if (String(d.contractLength) !== filters.contract) return false
    }
    if (filters.price !== 'all') {
      if (filters.price === 'under25' && d.monthlyPrice >= 25) return false
      if (filters.price === 'under35' && d.monthlyPrice >= 35) return false
      if (filters.price === 'under50' && d.monthlyPrice >= 50) return false
    }
    return true
  })

  function updateFilters(next: FilterState) {
    setFilters(next)
    const changed = (Object.keys(next) as Array<keyof FilterState>).find(
      (key) => next[key] !== filters[key],
    )
    if (changed) {
      trackEvent('deal_filter_changed', {
        filter_name: changed,
        filter_value: next[changed],
      })
    }
  }

  return (
    <>
      <StickyFilterBar filters={filters} onChange={updateFilters} />
      <p className="text-sm text-slate-500 mb-3">
        Showing <strong>{filtered.length}</strong> deals
      </p>
      <DealTable deals={filtered} showDisclosure={true} compact={false} />
    </>
  )
}
