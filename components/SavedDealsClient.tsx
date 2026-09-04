'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import AffiliateCTA from './AffiliateCTA'
import { getProviderBySlug } from '@/data/providers'
import { getSavedDeals, onSavedDealsChange, removeSavedDeal, type SavedDeal } from '@/lib/savedDeals'

export default function SavedDealsClient() {
  const [deals, setDeals] = useState<SavedDeal[] | null>(null)

  useEffect(() => {
    setDeals(getSavedDeals())
    return onSavedDealsChange(() => setDeals(getSavedDeals()))
  }, [])

  // null = not yet read from localStorage; render nothing to avoid a hydration flash.
  if (deals === null) return null

  if (deals.length === 0) {
    return (
      <div className="rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center">
        <p className="font-semibold text-slate-800">No saved deals yet.</p>
        <p className="mt-1 text-sm text-slate-500">
          Tap the heart icon next to any deal to save it here for later.
        </p>
        <Link
          href="/deals"
          className="mt-4 inline-block rounded-lg bg-sky-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-sky-800"
        >
          Browse deals
        </Link>
      </div>
    )
  }

  const sortedBySavedDate = [...deals].sort((a, b) => b.savedAt.localeCompare(a.savedAt))

  return (
    <div className="space-y-4">
      {sortedBySavedDate.map((deal) => {
        const provider = getProviderBySlug(deal.providerSlug)
        return (
          <div
            key={deal.id}
            className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4"
          >
            <div>
              <p className="font-semibold text-slate-900">
                {deal.providerName} &middot; {deal.packageName}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {deal.download} Mbps &middot; £{deal.monthlyPrice.toFixed(2)}/mo &middot;{' '}
                {deal.contractLength} month contract
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Saved {new Date(deal.savedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}.
                Price may have changed since — check the live offer before you switch.
              </p>
            </div>
            <div className="flex items-center gap-3">
              {provider && (
                <AffiliateCTA
                  href={provider.affiliateUrl}
                  providerName={provider.name}
                  providerSlug={provider.slug}
                  placement="saved_deals"
                  size="sm"
                />
              )}
              <button
                type="button"
                onClick={() => removeSavedDeal(deal.id)}
                className="text-sm font-medium text-slate-400 hover:text-red-600"
              >
                Remove
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
