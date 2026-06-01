'use client'

import { useState } from 'react'

export type SpeedFilter = 'all' | 'standard' | 'superfast' | 'ultrafast' | 'gigabit'
export type ContractFilter = 'all' | '12' | '18' | '24'
export type PriceFilter = 'all' | 'under25' | 'under35' | 'under50'

export interface FilterState {
  speed: SpeedFilter
  contract: ContractFilter
  price: PriceFilter
}

interface StickyFilterBarProps {
  filters: FilterState
  onChange: (filters: FilterState) => void
}

export default function StickyFilterBar({ filters, onChange }: StickyFilterBarProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  function update<K extends keyof FilterState>(key: K, value: FilterState[K]) {
    onChange({ ...filters, [key]: value })
  }

  const FilterContent = () => (
    <div className="flex flex-wrap gap-4 items-end">
      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">Speed tier</label>
        <select
          value={filters.speed}
          onChange={(e) => update('speed', e.target.value as SpeedFilter)}
          className="px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-800 bg-white focus:border-sky-500 outline-none"
        >
          <option value="all">All speeds</option>
          <option value="standard">Standard (up to 30 Mbps)</option>
          <option value="superfast">Superfast (30–300 Mbps)</option>
          <option value="ultrafast">Ultrafast (300–900 Mbps)</option>
          <option value="gigabit">Gigabit (900+ Mbps)</option>
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">Contract length</label>
        <select
          value={filters.contract}
          onChange={(e) => update('contract', e.target.value as ContractFilter)}
          className="px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-800 bg-white focus:border-sky-500 outline-none"
        >
          <option value="all">Any length</option>
          <option value="12">12 months</option>
          <option value="18">18 months</option>
          <option value="24">24 months</option>
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">Monthly price</label>
        <select
          value={filters.price}
          onChange={(e) => update('price', e.target.value as PriceFilter)}
          className="px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-800 bg-white focus:border-sky-500 outline-none"
        >
          <option value="all">Any price</option>
          <option value="under25">Under £25/mo</option>
          <option value="under35">Under £35/mo</option>
          <option value="under50">Under £50/mo</option>
        </select>
      </div>

      <button
        onClick={() => onChange({ speed: 'all', contract: 'all', price: 'all' })}
        className="px-3 py-2 text-sm text-slate-500 hover:text-slate-700 underline underline-offset-2"
      >
        Clear filters
      </button>
    </div>
  )

  return (
    <>
      {/* Desktop sticky bar */}
      <div className="hidden md:block sticky top-0 z-20 bg-white border-b border-slate-200 shadow-sm py-3 px-4 mb-6">
        <FilterContent />
      </div>

      {/* Mobile accordion */}
      <div className="md:hidden mb-4 border border-slate-200 rounded-xl overflow-hidden">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="w-full flex items-center justify-between px-4 py-3 bg-white text-sm font-medium text-slate-800"
        >
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
            </svg>
            Filter deals
          </span>
          <svg className={`w-4 h-4 transition-transform ${mobileOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {mobileOpen && (
          <div className="px-4 pb-4 bg-slate-50">
            <FilterContent />
          </div>
        )}
      </div>
    </>
  )
}
